"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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

type ChessMode = "ai" | "academy" | "training" | "puzzles" | "friend" | "challenges";
type AiDifficulty = "easy" | "medium" | "hard";

export default function ChessAcademyPage() {
  const { playFx, language } = useApp();
  const { user } = useAuth();
  const isAr = language !== "en";

  const [activeMode, setActiveMode] = useState<ChessMode>("ai");

  // Play vs AI / Friend Game State
  const [game, setGame] = useState<ChessGame>(() => new ChessGame());
  const [playerColor, setPlayerColor] = useState<PieceColor>("w");
  const [difficulty, setDifficulty] = useState<AiDifficulty>("medium");
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [gameAlert, setGameAlert] = useState<string | null>(null);

  // Clocks: 10 minutes (600 seconds) for White and Black
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

  // Format clock seconds (MM:SS)
  const formatClock = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // AI Move Execution Trigger
  const triggerAiMove = useCallback(
    (currentGame: ChessGame) => {
      if (
        activeMode !== "ai" ||
        currentGame.turn === playerColor ||
        currentGame.getStatus().isCheckmate ||
        currentGame.getStatus().isStalemate
      ) {
        return;
      }

      setIsAiThinking(true);
      const depth = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;

      setTimeout(() => {
        const aiMove = findBestAiMove(currentGame, depth);
        if (aiMove) {
          const nextGame = currentGame.clone();
          nextGame.makeMove(aiMove);
          setGame(nextGame);
          playFx("click");

          const st = nextGame.getStatus();
          if (st.isCheckmate) {
            setGameAlert(isAr ? "كش مات! انتصر الحاسوب. حظاً أوفر في الجولة القادمة! ♟️" : "Checkmate! AI won. Good game!");
            playFx("modal_close");
            setClockRunning(false);
          } else if (st.isCheck) {
            setGameAlert(isAr ? "كش ملك! احذر، ملكك مهدد بالهجوم ⚠️" : "Check! Your King is under attack ⚠️");
            playFx("toggle");
          } else if (st.isStalemate) {
            setGameAlert(isAr ? "تعادل بالخنقة (Stalemate)! 🤝" : "Draw by Stalemate! 🤝");
            setClockRunning(false);
          }
        }
        setIsAiThinking(false);
      }, 550);
    },
    [activeMode, playerColor, difficulty, playFx, isAr]
  );

  // Player Move Handler for AI & Friend Game
  const handlePlayerMove = (move: Move) => {
    if (activeMode === "ai" && (game.turn !== playerColor || isAiThinking)) return;

    const nextGame = game.clone();
    const success = nextGame.makeMove(move);
    if (!success) return;

    if (!clockRunning) setClockRunning(true);

    setGame(nextGame);
    setGameAlert(null);
    playFx("click");

    const st = nextGame.getStatus();
    if (st.isCheckmate) {
      setGameAlert(isAr ? "ألف مبروك! كش مات، انتصرت بجدارة وعبقرية! 🏆" : "Congratulations! Checkmate victory! 🏆");
      playFx("celebrate");
      setClockRunning(false);
      saveGameSession(true);
      return;
    } else if (st.isCheck) {
      setGameAlert(isAr ? "كش ملك! وضعت الخصم تحت التهديد المباشر 🔥" : "Check! Opponent King in danger 🔥");
      playFx("pop");
    } else if (st.isStalemate) {
      setGameAlert(isAr ? "تعادل بالخنقة (Stalemate)! 🤝" : "Draw by Stalemate! 🤝");
      setClockRunning(false);
      return;
    }

    if (activeMode === "ai") {
      triggerAiMove(nextGame);
    }
  };

  // Reset or Start New Game
  const handleNewGame = (color: PieceColor = "w") => {
    const newG = new ChessGame(STARTING_FEN);
    setGame(newG);
    setPlayerColor(color);
    setWhiteTime(600);
    setBlackTime(600);
    setClockRunning(false);
    setGameAlert(null);
    playFx("pop");

    if (activeMode === "ai" && color === "b") {
      triggerAiMove(newG);
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

    // In AI mode, undo 2 moves (Player + AI); in 2P mode, undo 1 move
    const undoCount = activeMode === "ai" ? 2 : 1;
    if (game.moveHistory.length < undoCount) return;

    const newG = new ChessGame(STARTING_FEN);
    for (let i = 0; i < game.moveHistory.length - undoCount; i++) {
      newG.makeMove(game.moveHistory[i]);
    }
    setGame(newG);
    setGameAlert(null);
    playFx("toggle");
  };

  // Hint Button Handler
  const handleHint = () => {
    playFx("pop");
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

    // AI mode: Calculate best move for the player
    const hintMove = findBestAiMove(game, 2);
    if (hintMove) {
      setGameAlert(
        isAr
          ? `💡 نقلة مقترحة من المعلم: حرك من ${hintMove.from} إلى ${hintMove.to}`
          : `💡 Suggested move: from ${hintMove.from} to ${hintMove.to}`
      );
    }
  };

  // Save Game Session
  const saveGameSession = async (playerWon: boolean) => {
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
          duration_seconds: 600 - whiteTime,
          score: playerWon ? 150 : 30,
          metadata: {
            movesCount: game.moveHistory.length,
            won: playerWon,
            playerColor,
          },
        });
      }
    } catch (err) {
      console.warn("Could not sync Chess session:", err);
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
    playFx("click");

    const expected = activeLesson.expectedMove;
    if (move.from === expected.from && move.to === expected.to) {
      setLessonFeedback({
        text: "أحسنت يا بطل! هذه هي النقلة التكتيكية الصحيحة 100%! 🎯",
        success: true,
      });
      playFx("celebrate");
      setCompletedLessons((prev) => ({ ...prev, [activeLesson.id]: true }));
    } else {
      setLessonFeedback({
        text: "نقلة غير دقيقة! هذه ليست النقلة المطلوبة لتحقيق هدف الدرس. انتبه للهدف وأعد المحاولة 🔄",
        success: false,
      });
      playFx("toggle");
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
    playFx("click");

    const expected = activePuzzle.solution;
    if (move.from === expected.from && move.to === expected.to) {
      setPuzzleFeedback({
        text: `أحسنت! حل عبقري للغز! 🌟 ${activePuzzle.explanationAr}`,
        success: true,
      });
      playFx("celebrate");
      setCompletedPuzzles((prev) => ({ ...prev, [activePuzzle.id]: true }));
    } else {
      setPuzzleFeedback({
        text: "نقلة غير صحيحة! هذا ليس الحل التكتيكي الأمثل. اضغط زر (تلميح) أو حاول مجدداً 🔄",
        success: false,
      });
      playFx("toggle");
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

  return (
    <ModuleLockedGate moduleId="chess" moduleNameAr="أكاديمية الشطرنج" moduleIcon="♟️">
      <div className="min-h-screen bg-gradient-to-br from-[#120D28] via-[#1A1238] to-[#0D081E] text-white py-6 px-3 sm:px-6 lg:px-8 selection:bg-amber-500/30">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Breadcrumbs & Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/mental-arithmetic"
            onClick={() => playFx("pop")}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-amber-300 transition-all backdrop-blur-md"
          >
            <ArrowRight className="w-4 h-4" />
            <span>{isAr ? "العودة للبرامج" : "Back to Hub"}</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {isAr ? "أكاديمية الشطرنج الملكية ♟️" : "Royal Chess Studio ♟️"}
            </span>
          </div>
        </div>

        {/* Studio 3-Column Main Grid matching the Reference Image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ------------------------------------------------------------- */}
          {/* LEFT COLUMN: NAVIGATION & MODES                               */}
          {/* ------------------------------------------------------------- */}
          <div className="lg:col-span-3 space-y-3.5 order-2 lg:order-1">
            {/* Header Badge (Like Reference Image: الشطرنج / Chess) */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#231B4D] to-[#161033] border-2 border-[#C6923B] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,220,150,0.3)] text-center space-y-1">
              <div className="flex justify-center text-2xl">👑</div>
              <h1 className="text-xl font-black text-white tracking-wide">
                الشطرنج
              </h1>
              <div className="text-xs font-serif font-bold text-[#E6C687] tracking-widest uppercase">
                Chess Studio
              </div>
            </div>

            {/* 6 Mode Buttons matching Reference Image */}
            <div className="space-y-2">
              {[
                { id: "academy" as ChessMode, label: "التعلم", enLabel: "Academy", icon: BookOpen },
                { id: "training" as ChessMode, label: "التدريب", enLabel: "Training", icon: Target },
                { id: "puzzles" as ChessMode, label: "الألغاز", enLabel: "Tactics Puzzles", icon: Puzzle },
                { id: "ai" as ChessMode, label: "اللعب ضد الحاسوب", enLabel: "Vs Computer", icon: Bot },
                { id: "friend" as ChessMode, label: "اللعب مع صديق", enLabel: "Pass & Play", icon: Users },
                { id: "challenges" as ChessMode, label: "التحديات", enLabel: "Challenges", icon: Trophy },
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
                      if (m.id === "ai" || m.id === "friend") {
                        handleNewGame(playerColor);
                      }
                    }}
                    className={`w-full py-3 px-4 rounded-2xl font-black text-sm flex items-center gap-3 transition-all duration-200 border text-start ${
                      active
                        ? "bg-gradient-to-r from-[#2A4494] via-[#1D3274] to-[#152355] text-white border-[#C6923B] shadow-[0_8px_20px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.4)] scale-102"
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
                    <span className="flex-1">{isAr ? m.label : m.enLabel}</span>
                    {active && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                  </button>
                );
              })}
            </div>

            {/* Sub-Selection Lists for Academy & Puzzles */}
            {activeMode === "academy" && (
              <div className="p-3.5 rounded-2xl bg-[#1A1438] border border-amber-500/30 space-y-2">
                <div className="text-xs font-black text-amber-300 flex items-center justify-between">
                  <span>منهج الدروس (6 مراحل):</span>
                  <span>{Object.keys(completedLessons).length} / 6 ✔</span>
                </div>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {CHESS_CURRICULUM.map((lesson, idx) => (
                    <button
                      key={lesson.id}
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
                  <span>ألغاز تكتيكية (8 ألغاز):</span>
                  <span>{Object.keys(completedPuzzles).length} / 8 ✔</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {TACTICS_PUZZLES.map((pz, idx) => (
                    <button
                      key={pz.id}
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
          </div>

          {/* ------------------------------------------------------------- */}
          {/* CENTER COLUMN: THE WOODEN CHESSBOARD                          */}
          {/* ------------------------------------------------------------- */}
          <div className="lg:col-span-6 flex flex-col items-center space-y-4 order-1 lg:order-2">
            <ChessBoard3D
              game={currentBoardGame}
              onMove={currentBoardMoveHandler}
              playerColor={playerColor}
            />

            {/* Feedback / Alert Banners */}
            {gameAlert && (
              <div className="w-full p-3 rounded-2xl bg-amber-500/20 border-2 border-amber-400 text-center font-black text-sm text-amber-200 animate-in fade-in">
                {gameAlert}
              </div>
            )}

            {activeMode === "academy" && (
              <div className="w-full p-4 rounded-2xl bg-[#1A1438] border border-amber-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300">
                    🎯 الهدف المطلوب:
                  </span>
                  <span className="text-xs text-slate-400">الدرس {selectedLessonIdx + 1} من 6</span>
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
                  <span className="text-xs text-slate-400">اللغز {puzzleIdx + 1} من 8</span>
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
          {/* RIGHT COLUMN: PLAYERS, TIMERS & ACTION CONTROLS               */}
          {/* ------------------------------------------------------------- */}
          <div className="lg:col-span-3 space-y-4 order-3">
            {/* Player 1 Card: أنت (Student) */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#221B48] to-[#161131] border-2 border-[#C6923B] shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-2xl shadow-md border-2 border-amber-400/70">
                    👦
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">أنت</div>
                    <div className="text-[11px] font-bold text-slate-400">
                      {playerColor === "w" ? "الجيش الأبيض ⚪" : "الجيش الأسود ⚫"}
                    </div>
                  </div>
                </div>
                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 border-white ${
                    game.turn === playerColor
                      ? "bg-emerald-400 shadow-[0_0_10px_#10B981] animate-pulse"
                      : "bg-slate-600"
                  }`}
                  title={game.turn === playerColor ? "دورك الآن!" : "انتظار الخصم"}
                />
              </div>

              {/* Timer Pill */}
              <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-black/40 border border-white/10">
                <span className="text-xs text-amber-300 font-bold flex items-center gap-1.5">
                  ⏱ الوقت:
                </span>
                <span className="font-mono text-base font-black tracking-wider text-white">
                  {formatClock(whiteTime)}
                </span>
              </div>
            </div>

            {/* Middle: Golden Laurel Wreath VS */}
            <div className="flex items-center justify-center gap-3 py-1">
              <span className="text-2xl text-amber-400">🌿</span>
              <span className="text-xl font-black font-serif text-amber-300 tracking-widest drop-shadow-[0_2px_8px_rgba(245,158,11,0.6)]">
                VS
              </span>
              <span className="text-2xl text-amber-400">🌿</span>
            </div>

            {/* Player 2 Card: الحاسوب (AI) or صديق */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#221B48] to-[#161131] border-2 border-[#C6923B] shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-900 flex items-center justify-center text-2xl shadow-md border-2 border-amber-400/70">
                    {activeMode === "friend" ? "🧑‍🤝‍🧑" : "🤖"}
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">
                      {activeMode === "friend" ? "صديقك" : "الحاسوب"}
                    </div>
                    <div className="text-[11px] font-bold text-amber-300">
                      {activeMode === "friend"
                        ? "لاعب محلي 2"
                        : difficulty === "easy"
                        ? "مستوى مبتدئ"
                        : difficulty === "medium"
                        ? "مستوى متوسط"
                        : "مستوى أستاذ"}
                    </div>
                  </div>
                </div>
                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 border-white ${
                    game.turn !== playerColor
                      ? "bg-amber-400 shadow-[0_0_10px_#F59E0B] animate-pulse"
                      : "bg-slate-600"
                  }`}
                  title={game.turn !== playerColor ? "دور الخصم!" : "انتظار"}
                />
              </div>

              {/* Timer Pill */}
              <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-black/40 border border-white/10">
                <span className="text-xs text-amber-300 font-bold flex items-center gap-1.5">
                  ⏱ الوقت:
                </span>
                <span className="font-mono text-base font-black tracking-wider text-white">
                  {formatClock(blackTime)}
                </span>
              </div>
            </div>

            {/* 3 Action Buttons matching Reference Image: تراجع، تلميح، إعادة */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {/* تراجع (Undo) */}
              <button
                type="button"
                onClick={handleUndo}
                className="py-3 px-2 rounded-2xl bg-gradient-to-b from-[#231A4C] to-[#15102F] border-2 border-[#C6923B]/80 hover:border-amber-400 shadow-lg flex flex-col items-center justify-center gap-1 text-xs font-black text-amber-300 active:scale-95 transition-all"
              >
                <Undo2 className="w-5 h-5 text-amber-400" />
                <span>تراجع</span>
              </button>

              {/* تلميح (Hint) */}
              <button
                type="button"
                onClick={handleHint}
                className="py-3 px-2 rounded-2xl bg-gradient-to-b from-[#231A4C] to-[#15102F] border-2 border-[#C6923B]/80 hover:border-amber-400 shadow-lg flex flex-col items-center justify-center gap-1 text-xs font-black text-amber-300 active:scale-95 transition-all"
              >
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <span>تلميح</span>
              </button>

              {/* إعادة (Restart) */}
              <button
                type="button"
                onClick={() => handleNewGame(playerColor)}
                className="py-3 px-2 rounded-2xl bg-gradient-to-b from-[#231A4C] to-[#15102F] border-2 border-[#C6923B]/80 hover:border-amber-400 shadow-lg flex flex-col items-center justify-center gap-1 text-xs font-black text-amber-300 active:scale-95 transition-all"
              >
                <RotateCcw className="w-5 h-5 text-amber-400" />
                <span>إعادة</span>
              </button>
            </div>

            {/* Difficulty Selector in AI mode */}
            {activeMode === "ai" && (
              <div className="p-3.5 rounded-2xl bg-[#1A1438] border border-white/10 space-y-2">
                <div className="text-xs font-bold text-slate-300">مستوى ذكاء الخصم:</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: "easy" as AiDifficulty, label: "سهل" },
                      { id: "medium" as AiDifficulty, label: "متوسط" },
                      { id: "hard" as AiDifficulty, label: "محترف" },
                    ]
                  ).map((d) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        setDifficulty(d.id);
                        playFx("click");
                      }}
                      className={`py-1.5 rounded-xl text-xs font-black transition-all ${
                        difficulty === d.id
                          ? "bg-amber-400 text-slate-950 shadow-md scale-102"
                          : "bg-white/10 text-slate-300 hover:bg-white/20"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </ModuleLockedGate>
  );
}
