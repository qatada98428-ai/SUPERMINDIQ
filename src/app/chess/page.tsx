"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  RotateCcw,
  Bot,
  BookOpen,
  Trophy,
  Lightbulb,
  Users,
  Target,
  Puzzle,
  Undo2,
  Box,
  Grid2x2,
  FlipVertical2,
  Sparkles,
  ScrollText,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import ChessBoard3D from "@/components/chess/ChessBoard3D";
import {
  ChessGame,
  Move,
  PieceColor,
  findBestAiMove,
  CHESS_CURRICULUM,
  TACTICS_PUZZLES,
  STARTING_FEN,
} from "@/lib/chess/chess-engine";
import { getSupabaseClient } from "@/lib/supabase/client";
import ModuleLockedGate from "@/components/common/ModuleLockedGate";
import { playSoftChessSound } from "@/lib/chess/chess-sound";

// Lazy-load Three.js / React Three Fiber 3D Chess scene on client only for optimal performance
const ChessScene3D = dynamic(() => import("@/components/chess/ChessScene3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[390px] sm:h-[490px] lg:h-[530px] rounded-[28px] bg-gradient-to-br from-[#231B4A] via-[#171133] to-[#0D0920] border-2 border-[#C6923B]/60 flex flex-col items-center justify-center gap-3 text-amber-200 shadow-2xl">
      <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center animate-pulse">
        <Box className="w-6 h-6 text-amber-300 animate-spin" />
      </div>
      <div className="text-sm font-black">جاري تجهيز رقعة الشطرنج ثلاثية الأبعاد (Staunton 3D)...</div>
      <div className="text-[11px] text-slate-400">تحميل المجسمات والإضاءة الطبيعية</div>
    </div>
  ),
});

type ChessMode = "ai" | "academy" | "training" | "puzzles" | "friend" | "challenges";
type AiDifficulty = "easy" | "medium" | "hard" | "master";
type ColorChoice = "w" | "b" | "random";
type ViewDimension = "3d" | "2d";

export default function ChessAcademyPage() {
  const { playFx, language } = useApp();
  const { user } = useAuth();
  const isAr = language !== "en";

  const [activeMode, setActiveMode] = useState<ChessMode>("ai");
  const [viewMode, setViewMode] = useState<ViewDimension>("3d");

  // Play vs AI / Friend / Training / Challenges Game State
  const [game, setGame] = useState<ChessGame>(() => new ChessGame());
  const [colorChoice, setColorChoice] = useState<ColorChoice>("w");
  const [playerColor, setPlayerColor] = useState<PieceColor>("w");
  const [difficulty, setDifficulty] = useState<AiDifficulty>("medium");
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [gameAlert, setGameAlert] = useState<string | null>(null);
  const [autoQueen, setAutoQueen] = useState<boolean>(false);
  const [flipped, setFlipped] = useState<boolean>(false);
  const [autoFlipInFriend, setAutoFlipInFriend] = useState<boolean>(false);

  // Clocks: 10 minutes (600s) standard, 3 minutes (180s) for blitz challenges
  const [whiteTime, setWhiteTime] = useState<number>(600);
  const [blackTime, setBlackTime] = useState<number>(600);
  const [clockRunning, setClockRunning] = useState<boolean>(false);

  // Academy Lesson State
  const [selectedLessonIdx, setSelectedLessonIdx] = useState<number>(0);
  const [academyGame, setAcademyGame] = useState<ChessGame>(
    () => new ChessGame(CHESS_CURRICULUM[0].fen)
  );
  const [lessonFeedback, setLessonFeedback] = useState<{ text: string; success: boolean } | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});

  // Puzzles State
  const [puzzleIdx, setPuzzleIdx] = useState<number>(0);
  const [puzzleGame, setPuzzleGame] = useState<ChessGame>(
    () => new ChessGame(TACTICS_PUZZLES[0].fen)
  );
  const [puzzleFeedback, setPuzzleFeedback] = useState<{ text: string; success: boolean } | null>(null);
  const [completedPuzzles, setCompletedPuzzles] = useState<Record<string, boolean>>({});

  const activeLesson = CHESS_CURRICULUM[selectedLessonIdx];
  const activePuzzle = TACTICS_PUZZLES[puzzleIdx];

  const isVsAiMode = activeMode === "ai" || activeMode === "challenges";
  const isTwoPlayerMode = activeMode === "friend" || activeMode === "training";

  // Clock countdown timer
  useEffect(() => {
    if (!clockRunning || activeMode === "academy" || activeMode === "puzzles") return;
    const current = game;
    const st = current.getStatus();
    if (st.isCheckmate || st.isStalemate) return;

    const interval = setInterval(() => {
      if (current.turn === "w") {
        setWhiteTime((t) => Math.max(0, t - 1));
      } else {
        setBlackTime((t) => Math.max(0, t - 1));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [clockRunning, activeMode, game]);

  const formatClock = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Save Game Session
  const saveGameSession = useCallback(
    async (playerWon: boolean) => {
      if (!user) return;
      try {
        const supabase = getSupabaseClient();
        if (supabase) {
          await supabase.from("training_sessions").insert({
            user_id: user.id,
            session_type: "chess",
            level: difficulty,
            total_questions: 1,
            correct_answers: playerWon ? 1 : 0,
            wrong_answers: playerWon ? 0 : 1,
            accuracy_rate: playerWon ? 100 : 0,
            duration_seconds: Math.max(1, 600 - whiteTime),
            score: playerWon ? 150 : 30,
            metadata: {
              movesCount: game.moveHistory.length,
              won: playerWon,
              playerColor,
              viewMode,
            },
          });
        }
      } catch (err) {
        console.warn("Could not sync Chess session:", err);
      }
    },
    [user, difficulty, whiteTime, game.moveHistory.length, playerColor, viewMode]
  );

  // AI Move Execution Trigger
  const triggerAiMove = useCallback(
    (currentGame: ChessGame, modeOverride?: ChessMode, colorOverride?: PieceColor) => {
      const mode = modeOverride ?? activeMode;
      const pColor = colorOverride ?? playerColor;
      if (
        (mode !== "ai" && mode !== "challenges") ||
        currentGame.turn === pColor ||
        currentGame.getStatus().isCheckmate ||
        currentGame.getStatus().isStalemate
      ) {
        return;
      }

      setIsAiThinking(true);
      const depth =
        difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : difficulty === "hard" ? 3 : 3;

      setTimeout(() => {
        const aiMove = findBestAiMove(currentGame, depth);
        if (aiMove) {
          const isCapture = Boolean(currentGame.getPiece(aiMove.to)) || Boolean(aiMove.isEnPassant);
          const nextGame = currentGame.clone();
          nextGame.makeMove(aiMove);
          setGame(nextGame);

          const st = nextGame.getStatus();
          if (st.isCheckmate) {
            setGameAlert(
              isAr
                ? "كش مات! انتصر الحاسوب. حظاً أوفر في الجولة القادمة! ♟️"
                : "Checkmate! AI won. Good game!"
            );
            playSoftChessSound("check");
            setClockRunning(false);
          } else if (st.isCheck) {
            setGameAlert(
              isAr ? "كش ملك! احذر، ملكك مهدد بالهجوم ⚠️" : "Check! Your King is under attack ⚠️"
            );
            playSoftChessSound("check");
          } else if (st.isStalemate) {
            setGameAlert(isAr ? "تعادل بالخنقة (Stalemate)! 🤝" : "Draw by Stalemate! 🤝");
            playSoftChessSound("move");
            setClockRunning(false);
          } else {
            playSoftChessSound(isCapture ? "capture" : "move");
          }
        }
        setIsAiThinking(false);
      }, 480);
    },
    [activeMode, playerColor, difficulty, isAr]
  );

  // Player Move Handler for AI, Friend (2P Same Screen), Training & Challenges
  const handlePlayerMove = (move: Move) => {
    if (isVsAiMode && (game.turn !== playerColor || isAiThinking)) return;

    const moverColor = game.turn;
    const isCapture = Boolean(game.getPiece(move.to)) || Boolean(move.isEnPassant);
    const nextGame = game.clone();
    const success = nextGame.makeMove(move);
    if (!success) return;

    if (!clockRunning) setClockRunning(true);

    setGame(nextGame);
    setGameAlert(null);

    const st = nextGame.getStatus();
    if (st.isCheckmate) {
      if (activeMode === "friend") {
        setGameAlert(
          moverColor === "w"
            ? "🏆 كش مات! انتصر اللاعب 1 (الأبيض) بجدارة!"
            : "🏆 كش مات! انتصر اللاعب 2 (الأسود) بجدارة!"
        );
      } else {
        setGameAlert(
          isAr
            ? "ألف مبروك! كش مات، انتصرت بجدارة وعبقرية! 🏆"
            : "Congratulations! Checkmate victory! 🏆"
        );
        saveGameSession(true);
      }
      playSoftChessSound("win");
      setClockRunning(false);
      return;
    } else if (st.isCheck) {
      setGameAlert(
        activeMode === "friend"
          ? nextGame.turn === "w"
            ? "⚠️ كش ملك على اللاعب الأبيض!"
            : "⚠️ كش ملك على اللاعب الأسود!"
          : isAr
          ? "كش ملك! وضعت الخصم تحت التهديد المباشر 🔥"
          : "Check! Opponent King in danger 🔥"
      );
      playSoftChessSound("check");
    } else if (st.isStalemate) {
      setGameAlert(isAr ? "تعادل بالخنقة (Stalemate)! 🤝" : "Draw by Stalemate! 🤝");
      playSoftChessSound("move");
      setClockRunning(false);
      return;
    } else {
      playSoftChessSound(isCapture ? "capture" : "move");
    }

    if (activeMode === "friend" && autoFlipInFriend) {
      setFlipped(nextGame.turn === "b");
    }

    if (isVsAiMode) {
      triggerAiMove(nextGame);
    }
  };

  // Start or Reset Game with chosen mode & color
  const handleNewGame = (choice: ColorChoice = colorChoice, targetMode: ChessMode = activeMode) => {
    const resolvedColor: PieceColor =
      targetMode === "friend" || targetMode === "training"
        ? "w"
        : choice === "random"
        ? Math.random() < 0.5
          ? "w"
          : "b"
        : choice;

    const newG = new ChessGame(STARTING_FEN);
    const initialClock = targetMode === "challenges" ? 180 : 600;

    setGame(newG);
    setPlayerColor(resolvedColor);
    setFlipped(false);
    setWhiteTime(initialClock);
    setBlackTime(initialClock);
    setClockRunning(false);
    setIsAiThinking(false);
    setGameAlert(
      targetMode === "friend"
        ? "وضع اللعب المباشر لشخصين على نفس الشاشة جاهز! يبدأ اللاعب 1 (الأبيض ⚪)"
        : targetMode === "challenges"
        ? "تحدي الشطرنج الخاطف (3 دقائق)! أظهر سرعتك وذكاءك ⚡"
        : choice === "random"
        ? resolvedColor === "w"
          ? "🎲 الاختيار العشوائي: ستلعب بالقطع البيضاء ⚪ (دورك أولاً)"
          : "🎲 الاختيار العشوائي: ستلعب بالقطع السوداء ⚫ (الحاسوب يبدأ أولاً)"
        : null
    );
    playSoftChessSound("reset");

    if ((targetMode === "ai" || targetMode === "challenges") && resolvedColor === "b") {
      triggerAiMove(newG, targetMode, "b");
    }
  };

  // Undo Move
  const handleUndo = () => {
    if (activeMode === "academy") {
      setAcademyGame(new ChessGame(activeLesson.fen));
      setLessonFeedback(null);
      return;
    }
    if (activeMode === "puzzles") {
      setPuzzleGame(new ChessGame(activePuzzle.fen));
      setPuzzleFeedback(null);
      return;
    }

    const undoCount = isVsAiMode ? 2 : 1;
    if (game.moveHistory.length < undoCount) return;

    const newG = new ChessGame(STARTING_FEN);
    for (let i = 0; i < game.moveHistory.length - undoCount; i++) {
      newG.makeMove(game.moveHistory[i]);
    }
    setGame(newG);
    setGameAlert(null);
    playSoftChessSound("reset");
  };

  // Hint Button Handler
  const handleHint = () => {
    playSoftChessSound("select");
    if (activeMode === "puzzles") {
      setPuzzleFeedback({
        text: `💡 تلميح اللغز: ${activePuzzle.hintAr}`,
        success: true,
      });
      return;
    }
    if (activeMode === "academy") {
      setLessonFeedback({
        text: `💡 التلميح: ${activeLesson.exerciseGoalAr}`,
        success: true,
      });
      return;
    }

    const hintMove = findBestAiMove(game, 2);
    if (hintMove) {
      setGameAlert(
        isAr
          ? `💡 نقلة مقترحة من المعلم: حرك من ${hintMove.from} إلى ${hintMove.to}`
          : `💡 Suggested move: from ${hintMove.from} to ${hintMove.to}`
      );
    }
  };

  // Academy Lesson Move with STRICT Validation
  useEffect(() => {
    setAcademyGame(new ChessGame(activeLesson.fen));
    setLessonFeedback(null);
  }, [activeLesson]);

  const handleAcademyMove = (move: Move) => {
    const next = academyGame.clone();
    if (!next.makeMove(move)) return;

    setAcademyGame(next);

    const expected = activeLesson.expectedMove;
    if (move.from === expected.from && move.to === expected.to) {
      setLessonFeedback({
        text: "أحسنت يا بطل! هذه هي النقلة التكتيكية الصحيحة 100%! 🎯",
        success: true,
      });
      playSoftChessSound("win");
      setCompletedLessons((prev) => ({ ...prev, [activeLesson.id]: true }));
    } else {
      setLessonFeedback({
        text: "نقلة غير دقيقة! هذه ليست النقلة المطلوبة لتحقيق هدف الدرس. انتبه للهدف وأعد المحاولة 🔄",
        success: false,
      });
      playSoftChessSound("move");
    }
  };

  // Tactics Puzzle Move with STRICT Validation
  useEffect(() => {
    setPuzzleGame(new ChessGame(activePuzzle.fen));
    setPuzzleFeedback(null);
  }, [activePuzzle]);

  const handlePuzzleMove = (move: Move) => {
    const next = puzzleGame.clone();
    if (!next.makeMove(move)) return;

    setPuzzleGame(next);

    const expected = activePuzzle.solution;
    if (move.from === expected.from && move.to === expected.to) {
      setPuzzleFeedback({
        text: `أحسنت! حل عبقري للغز! 🌟 ${activePuzzle.explanationAr}`,
        success: true,
      });
      playSoftChessSound("win");
      setCompletedPuzzles((prev) => ({ ...prev, [activePuzzle.id]: true }));
    } else {
      setPuzzleFeedback({
        text: "نقلة غير صحيحة! هذا ليس الحل التكتيكي الأمثل. اضغط زر (تلميح) أو حاول مجدداً 🔄",
        success: false,
      });
      playSoftChessSound("move");
    }
  };

  // Current active game for rendering based on mode
  const currentBoardGame =
    activeMode === "academy"
      ? academyGame
      : activeMode === "puzzles"
      ? puzzleGame
      : game;

  const currentBoardMoveHandler =
    activeMode === "academy"
      ? handleAcademyMove
      : activeMode === "puzzles"
      ? handlePuzzleMove
      : handlePlayerMove;

  const boardPlayerColor: PieceColor =
    activeMode === "academy" || activeMode === "puzzles" ? "w" : playerColor;

  // Format Move History into pairs for clean display
  const movePairs: { num: number; white?: string; black?: string }[] = [];
  for (let i = 0; i < currentBoardGame.moveHistory.length; i += 2) {
    const w = currentBoardGame.moveHistory[i];
    const b = currentBoardGame.moveHistory[i + 1];
    movePairs.push({
      num: Math.floor(i / 2) + 1,
      white: w ? `${w.from}→${w.to}${w.promotion ? `=${w.promotion.toUpperCase()}` : ""}` : undefined,
      black: b ? `${b.from}→${b.to}${b.promotion ? `=${b.promotion.toUpperCase()}` : ""}` : undefined,
    });
  }

  return (
    <ModuleLockedGate moduleId="chess" moduleNameAr="أكاديمية الشطرنج" moduleIcon="♟️">
      <div className="min-h-screen bg-gradient-to-br from-[#120D28] via-[#1A1238] to-[#0D081E] text-white py-5 px-3 sm:px-6 lg:px-8 selection:bg-amber-500/30">
        <div className="max-w-7xl mx-auto space-y-5">
          {/* Top Breadcrumbs & 2D / 3D Switcher Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/mental-arithmetic"
              onClick={() => playFx("pop")}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-amber-300 transition-all backdrop-blur-md"
            >
              <ArrowRight className="w-4 h-4" />
              <span>{isAr ? "العودة للبرامج" : "Back to Hub"}</span>
            </Link>

            {/* 2D / 3D Mode Toggle Pill */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#1D163A] border border-amber-400/40 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  playFx("click");
                  setViewMode("3d");
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                  viewMode === "3d"
                    ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Box className="w-4 h-4" />
                <span>ثلاثي الأبعاد 3D</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playFx("click");
                  setViewMode("2d");
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                  viewMode === "2d"
                    ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Grid2x2 className="w-4 h-4" />
                <span>كلاسيكي 2D</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAr ? "أكاديمية الشطرنج الملكية 3D" : "Royal 3D Chess Studio"}</span>
              </span>
            </div>
          </div>

          {/* Studio 3-Column Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* ------------------------------------------------------------- */}
            {/* LEFT COLUMN: NAVIGATION & MODES                               */}
            {/* ------------------------------------------------------------- */}
            <div className="lg:col-span-3 space-y-3.5 order-2 lg:order-1">
              {/* Header Badge */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-[#231B4D] to-[#161033] border-2 border-[#C6923B] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,220,150,0.3)] text-center space-y-1">
                <div className="flex justify-center text-2xl">👑</div>
                <h1 className="text-xl font-black text-white tracking-wide">الشطرنج</h1>
                <div className="text-xs font-serif font-bold text-[#E6C687] tracking-widest uppercase">
                  Real 3D Staunton Studio
                </div>
              </div>

              {/* 6 Mode Buttons */}
              <div className="space-y-2">
                {[
                  { id: "academy" as ChessMode, label: "التعلم", enLabel: "Academy", icon: BookOpen },
                  { id: "training" as ChessMode, label: "التدريب الحر", enLabel: "Free Training", icon: Target },
                  { id: "puzzles" as ChessMode, label: "الألغاز", enLabel: "Tactics Puzzles", icon: Puzzle },
                  { id: "ai" as ChessMode, label: "اللعب ضد الحاسوب", enLabel: "Vs Computer", icon: Bot },
                  { id: "friend" as ChessMode, label: "اللعب مع صديق (نفس الشاشة)", enLabel: "2P Pass & Play", icon: Users },
                  { id: "challenges" as ChessMode, label: "تحدي السرعة (3 دقائق)", enLabel: "Blitz Challenge", icon: Trophy },
                ].map((m) => {
                  const Icon = m.icon;
                  const active = activeMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        playFx("click");
                        setActiveMode(m.id);
                        if (
                          m.id === "ai" ||
                          m.id === "friend" ||
                          m.id === "training" ||
                          m.id === "challenges"
                        ) {
                          handleNewGame(colorChoice, m.id);
                        }
                      }}
                      className={`w-full py-3 px-4 rounded-2xl font-black text-sm flex items-center gap-3 transition-all duration-200 border text-start ${
                        active
                          ? "bg-gradient-to-r from-[#2A4494] via-[#1D3274] to-[#152355] text-white border-[#C6923B] shadow-[0_8px_20px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.4)]"
                          : "bg-[#1C163C]/80 hover:bg-[#251D4E] text-[#D8CEF6] border-white/10 hover:border-amber-400/40"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          active
                            ? "bg-amber-400 text-slate-950 shadow-md"
                            : "bg-white/10 text-amber-300"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="flex-1 text-xs sm:text-sm">{isAr ? m.label : m.enLabel}</span>
                      {active && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                    </button>
                  );
                })}
              </div>

              {/* Sub-Selection Lists for Academy & Puzzles */}
              {activeMode === "academy" && (
                <div className="p-3.5 rounded-2xl bg-[#1A1438] border border-amber-500/30 space-y-2">
                  <div className="text-xs font-black text-amber-300 flex items-center justify-between">
                    <span>منهج الدروس ({CHESS_CURRICULUM.length} مراحل):</span>
                    <span>
                      {Object.keys(completedLessons).length} / {CHESS_CURRICULUM.length} ✔
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {CHESS_CURRICULUM.map((lesson, idx) => (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => {
                          setSelectedLessonIdx(idx);
                          playFx("click");
                        }}
                        className={`w-full p-2.5 rounded-xl text-xs font-bold text-start transition-all flex items-center justify-between ${
                          selectedLessonIdx === idx
                            ? "bg-amber-500 text-slate-950 font-black shadow-md"
                            : "bg-white/5 hover:bg-white/10 text-slate-300"
                        }`}
                      >
                        <span className="truncate">{lesson.titleAr}</span>
                        {completedLessons[lesson.id] && <span>✔</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeMode === "puzzles" && (
                <div className="p-3.5 rounded-2xl bg-[#1A1438] border border-amber-500/30 space-y-2">
                  <div className="text-xs font-black text-amber-300 flex items-center justify-between">
                    <span>ألغاز تكتيكية ({TACTICS_PUZZLES.length} ألغاز):</span>
                    <span>
                      {Object.keys(completedPuzzles).length} / {TACTICS_PUZZLES.length} ✔
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {TACTICS_PUZZLES.map((pz, idx) => (
                      <button
                        key={pz.id}
                        type="button"
                        onClick={() => {
                          setPuzzleIdx(idx);
                          playFx("click");
                        }}
                        className={`py-2 rounded-xl text-xs font-black transition-all ${
                          puzzleIdx === idx
                            ? "bg-amber-400 text-slate-950 shadow-md scale-105"
                            : completedPuzzles[pz.id]
                            ? "bg-emerald-600/60 text-white border border-emerald-400"
                            : "bg-white/10 text-slate-300 hover:bg-white/20"
                        }`}
                      >
                        #{idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Rules & Capabilities Badge */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-slate-300 space-y-1.5">
                <div className="font-black text-amber-300 flex items-center gap-1.5">
                  <span>♟️ قواعد الشطرنج الكاملة مدعومة:</span>
                </div>
                <p className="leading-relaxed">
                  التبييت (Castling)، الأخذ بالمرور (En Passant)، ترقية البيدق، كش الملك، وكش مات — مع مجسمات Staunton ثلاثية الأبعاد (ترخيص CC0).
                </p>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* CENTER COLUMN: REAL 3D OR CLASSIC 2D CHESSBOARD               */}
            {/* ------------------------------------------------------------- */}
            <div className="lg:col-span-6 flex flex-col items-center space-y-3.5 order-1 lg:order-2">
              {/* Active Turn Banner for 2-Player Local Mode or AI Thinking */}
              {activeMode === "friend" && (
                <div className="w-full px-4 py-2.5 rounded-2xl bg-[#1F183D] border border-amber-400/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 font-black">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        game.turn === "w"
                          ? "bg-white shadow-[0_0_10px_#fff]"
                          : "bg-slate-900 border-2 border-amber-400 shadow-[0_0_10px_#f59e0b]"
                      }`}
                    />
                    <span className="text-amber-200">
                      {game.turn === "w"
                        ? "الدور الآن: اللاعب 1 (القطع البيضاء ⚪)"
                        : "الدور الآن: اللاعب 2 (القطع السوداء ⚫)"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoFlipInFriend}
                        onChange={(e) => setAutoFlipInFriend(e.target.checked)}
                        className="accent-amber-400 rounded"
                      />
                      <span>تدوير تلقائي</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setFlipped((f) => !f)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-amber-400/20 text-amber-300 font-bold flex items-center gap-1"
                    >
                      <FlipVertical2 className="w-3.5 h-3.5" />
                      <span>قلب الرقعة</span>
                    </button>
                  </div>
                </div>
              )}

              {/* The 3D or 2D Chess Board (fixed in place with zero vertical layout jump!) */}
              {viewMode === "3d" ? (
                <ChessScene3D
                  game={currentBoardGame}
                  onMove={currentBoardMoveHandler}
                  playerColor={boardPlayerColor}
                  isTwoPlayer={isTwoPlayerMode}
                  autoQueen={autoQueen}
                  flipped={flipped}
                  onToggleFlip={() => setFlipped((f) => !f)}
                  disabled={isVsAiMode && isAiThinking}
                  lockCameraByDefault={isVsAiMode}
                  statusBadge={
                    isVsAiMode && isAiThinking ? "🤖 الحاسوب يفكر في نقلته..." : null
                  }
                  onFallbackTo2D={() => setViewMode("2d")}
                />
              ) : (
                <ChessBoard3D
                  game={currentBoardGame}
                  onMove={currentBoardMoveHandler}
                  playerColor={boardPlayerColor}
                  isTwoPlayer={isTwoPlayerMode}
                  autoQueen={autoQueen}
                  flipped={flipped}
                  disabled={isVsAiMode && isAiThinking}
                  statusBadge={
                    isVsAiMode && isAiThinking ? "🤖 الحاسوب يفكر في نقلته..." : null
                  }
                />
              )}

              {/* Feedback / Alert Banners */}
              {gameAlert && (
                <div className="w-full p-3 rounded-2xl bg-amber-500/20 border-2 border-amber-400 text-center font-black text-sm text-amber-200 animate-in fade-in">
                  {gameAlert}
                </div>
              )}

              {activeMode === "academy" && (
                <div className="w-full p-4 rounded-2xl bg-[#1A1438] border border-amber-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-300">🎯 الهدف المطلوب:</span>
                    <span className="text-xs text-slate-400">
                      الدرس {selectedLessonIdx + 1} من {CHESS_CURRICULUM.length}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white leading-relaxed">
                    {activeLesson.exerciseGoalAr}
                  </p>
                  {lessonFeedback && (
                    <div
                      className={`p-3 rounded-xl text-xs font-black text-center ${
                        lessonFeedback.success
                          ? "bg-emerald-900/60 border border-emerald-500 text-emerald-200 animate-bounce"
                          : "bg-rose-900/60 border border-rose-500 text-rose-200"
                      }`}
                    >
                      {lessonFeedback.text}
                    </div>
                  )}
                </div>
              )}

              {activeMode === "puzzles" && (
                <div className="w-full p-4 rounded-2xl bg-[#1A1438] border border-amber-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-300">
                      🧩 {activePuzzle.titleAr}
                    </span>
                    <span className="text-xs text-slate-400">
                      اللغز {puzzleIdx + 1} من {TACTICS_PUZZLES.length}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    الأبيض يلعب ويحسم النقلة التكتيكية الأقوى. فكّر بدقة قبل التحريك!
                  </p>
                  {puzzleFeedback && (
                    <div
                      className={`p-3 rounded-xl text-xs font-black text-center ${
                        puzzleFeedback.success
                          ? "bg-emerald-900/60 border border-emerald-500 text-emerald-200 animate-bounce"
                          : "bg-rose-900/60 border border-rose-500 text-rose-200"
                      }`}
                    >
                      {puzzleFeedback.text}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ------------------------------------------------------------- */}
            {/* RIGHT COLUMN: PLAYERS, TIMERS, SETTINGS & MOVE HISTORY        */}
            {/* ------------------------------------------------------------- */}
            <div className="lg:col-span-3 space-y-3.5 order-3">
              {/* Player 1 Card */}
              <div
                className={`p-4 rounded-2xl bg-gradient-to-b from-[#221B48] to-[#161131] border-2 shadow-xl space-y-3 transition-all ${
                  (isTwoPlayerMode ? game.turn === "w" : game.turn === playerColor)
                    ? "border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                    : "border-[#C6923B]/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-2xl shadow-md border-2 border-amber-400/70">
                      {isTwoPlayerMode ? "⚪" : "👦"}
                    </div>
                    <div>
                      <div className="text-sm font-black text-white">
                        {activeMode === "friend" ? "اللاعب 1" : "أنت"}
                      </div>
                      <div className="text-[11px] font-bold text-slate-300">
                        {isTwoPlayerMode
                          ? "الجيش الأبيض ⚪"
                          : playerColor === "w"
                          ? "الجيش الأبيض ⚪"
                          : "الجيش الأسود ⚫"}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 border-white ${
                      (isTwoPlayerMode ? game.turn === "w" : game.turn === playerColor)
                        ? "bg-emerald-400 shadow-[0_0_10px_#10B981] animate-pulse"
                        : "bg-slate-600"
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-black/40 border border-white/10">
                  <span className="text-xs text-amber-300 font-bold">⏱ الوقت:</span>
                  <span className="font-mono text-base font-black tracking-wider text-white">
                    {formatClock(isTwoPlayerMode || playerColor === "w" ? whiteTime : blackTime)}
                  </span>
                </div>
              </div>

              {/* Player 2 Card */}
              <div
                className={`p-4 rounded-2xl bg-gradient-to-b from-[#221B48] to-[#161131] border-2 shadow-xl space-y-3 transition-all ${
                  (isTwoPlayerMode ? game.turn === "b" : game.turn !== playerColor)
                    ? "border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                    : "border-[#C6923B]/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-900 flex items-center justify-center text-2xl shadow-md border-2 border-amber-400/70">
                      {isTwoPlayerMode ? "⚫" : "🤖"}
                    </div>
                    <div>
                      <div className="text-sm font-black text-white">
                        {activeMode === "friend"
                          ? "اللاعب 2"
                          : activeMode === "training"
                          ? "تدريب الجانب الأسود"
                          : "الحاسوب"}
                      </div>
                      <div className="text-[11px] font-bold text-amber-300">
                        {isTwoPlayerMode
                          ? "الجيش الأسود ⚫"
                          : difficulty === "easy"
                          ? "مستوى مبتدئ 🌱"
                          : difficulty === "medium"
                          ? "مستوى متوسط ⚡"
                          : difficulty === "hard"
                          ? "مستوى متقدم 🔥"
                          : "أستاذ خارق 👑"}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 border-white ${
                      (isTwoPlayerMode ? game.turn === "b" : game.turn !== playerColor)
                        ? "bg-amber-400 shadow-[0_0_10px_#F59E0B] animate-pulse"
                        : "bg-slate-600"
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-black/40 border border-white/10">
                  <span className="text-xs text-amber-300 font-bold">⏱ الوقت:</span>
                  <span className="font-mono text-base font-black tracking-wider text-white">
                    {formatClock(isTwoPlayerMode || playerColor === "w" ? blackTime : whiteTime)}
                  </span>
                </div>
              </div>

              {/* 3 Action Buttons: تراجع، تلميح، إعادة */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleUndo}
                  className="py-2.5 px-2 rounded-2xl bg-gradient-to-b from-[#231A4C] to-[#15102F] border-2 border-[#C6923B]/80 hover:border-amber-400 shadow-lg flex flex-col items-center justify-center gap-1 text-xs font-black text-amber-300 active:scale-95 transition-all"
                >
                  <Undo2 className="w-4 h-4 text-amber-400" />
                  <span>تراجع</span>
                </button>

                <button
                  type="button"
                  onClick={handleHint}
                  className="py-2.5 px-2 rounded-2xl bg-gradient-to-b from-[#231A4C] to-[#15102F] border-2 border-[#C6923B]/80 hover:border-amber-400 shadow-lg flex flex-col items-center justify-center gap-1 text-xs font-black text-amber-300 active:scale-95 transition-all"
                >
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>تلميح</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNewGame(colorChoice, activeMode)}
                  className="py-2.5 px-2 rounded-2xl bg-gradient-to-b from-[#231A4C] to-[#15102F] border-2 border-[#C6923B]/80 hover:border-amber-400 shadow-lg flex flex-col items-center justify-center gap-1 text-xs font-black text-amber-300 active:scale-95 transition-all"
                >
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span>إعادة</span>
                </button>
              </div>

              {/* AI Difficulty, Color Choice & Auto-Queen Settings */}
              {isVsAiMode && (
                <div className="p-3.5 rounded-2xl bg-[#1A1438] border border-white/10 space-y-3">
                  {/* Difficulty */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-black text-amber-300">مستوى الحاسوب:</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(
                        [
                          { id: "easy" as AiDifficulty, label: "مبتدئ 🌱" },
                          { id: "medium" as AiDifficulty, label: "متوسط ⚡" },
                          { id: "hard" as AiDifficulty, label: "متقدم 🔥" },
                          { id: "master" as AiDifficulty, label: "أستاذ 👑" },
                        ]
                      ).map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            setDifficulty(d.id);
                            playFx("click");
                          }}
                          className={`py-1.5 rounded-xl text-xs font-black transition-all ${
                            difficulty === d.id
                              ? "bg-amber-400 text-slate-950 shadow-md"
                              : "bg-white/10 text-slate-300 hover:bg-white/20"
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Player Color Selector */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-black text-amber-300">لونك:</div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(
                        [
                          { id: "w" as ColorChoice, label: "أبيض ⚪" },
                          { id: "b" as ColorChoice, label: "أسود ⚫" },
                          { id: "random" as ColorChoice, label: "عشوائي 🎲" },
                        ]
                      ).map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setColorChoice(c.id);
                            handleNewGame(c.id, activeMode);
                          }}
                          className={`py-1.5 rounded-xl text-xs font-black transition-all ${
                            colorChoice === c.id
                              ? "bg-indigo-500 text-white shadow-md ring-1 ring-amber-400"
                              : "bg-white/10 text-slate-300 hover:bg-white/20"
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Auto-Queen Promotion Toggle */}
              <label className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#1A1438] border border-white/10 cursor-pointer text-xs font-bold text-slate-200">
                <span>ترقية البيدق تلقائياً إلى وزير ♛</span>
                <input
                  type="checkbox"
                  checked={autoQueen}
                  onChange={(e) => setAutoQueen(e.target.checked)}
                  className="w-4 h-4 accent-amber-400 rounded"
                />
              </label>

              {/* Move History Panel */}
              <div className="p-3.5 rounded-2xl bg-[#1A1438] border border-white/10 space-y-2">
                <div className="text-xs font-black text-amber-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ScrollText className="w-3.5 h-3.5" />
                    <span>سجل النقلات:</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {currentBoardGame.moveHistory.length} نقلة
                  </span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 text-xs font-mono pr-1">
                  {movePairs.length === 0 ? (
                    <div className="text-slate-400 text-center py-3 font-sans text-[11px]">
                      لم يتم تنفيذ أي نقلة بعد
                    </div>
                  ) : (
                    movePairs.map((pair) => (
                      <div
                        key={pair.num}
                        className="grid grid-cols-12 gap-1 px-2 py-1 rounded-lg bg-white/5 text-[11px]"
                      >
                        <span className="col-span-2 text-amber-300 font-bold">{pair.num}.</span>
                        <span className="col-span-5 text-white">{pair.white || ""}</span>
                        <span className="col-span-5 text-slate-300">{pair.black || ""}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModuleLockedGate>
  );
}
