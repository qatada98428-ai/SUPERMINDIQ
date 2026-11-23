"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Grid,
  Lightbulb,
  Edit3,
  Eraser,
  ArrowRight,
  BookOpen,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  Award,
  Sparkles,
  RefreshCw,
  X,
  Check,
  Dices,
  Printer,
  Info,
  HelpCircle,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import ClayIcon from "@/components/design-system/ClayIcon";
import {
  SudokuSize,
  SudokuPuzzle,
  PRESET_PUZZLES,
  getBoxDimensions,
  isValidPlacement,
  findPlacementConflicts,
  SudokuConflict,
  getRemainingDigitCounts,
  removeCandidateFromPeers,
  findSmartHint,
  SudokuHint,
  generateDynamicPuzzle,
  SUDOKU_RULES_GUIDE,
  SUDOKU_LESSONS,
  INTERACTIVE_SUDOKU_LESSONS,
  InteractiveSudokuLesson,
} from "@/lib/sudoku/sudoku-engine";
import { getSupabaseClient } from "@/lib/supabase/client";
import ModuleLockedGate from "@/components/common/ModuleLockedGate";

type SudokuTab = "play" | "academy";

interface MoveHistory {
  row: number;
  col: number;
  prevVal: number;
  nextVal: number;
  prevNotes: Record<string, number[]>;
}

export default function SudokuPage() {
  const { language, playFx } = useApp();
  const { user } = useAuth();
  const isAr = language === "ar";

  const [activeTab, setActiveTab] = useState<SudokuTab>("play");
  const [selectedSize, setSelectedSize] = useState<SudokuSize>(4);
  const [difficulty, setDifficulty] = useState<"easy" | "medium">("easy");
  const [isDiagonalMode, setIsDiagonalMode] = useState<boolean>(false);

  // Game board state
  const [grid, setGrid] = useState<number[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [initialMask, setInitialMask] = useState<boolean[][]>([]);
  const [notes, setNotes] = useState<Record<string, number[]>>({});
  const [pencilMode, setPencilMode] = useState<boolean>(false);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [mistakes, setMistakes] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [activeHint, setActiveHint] = useState<SudokuHint | null>(null);
  const [conflictAlert, setConflictAlert] = useState<SudokuConflict | null>(null);
  const [history, setHistory] = useState<MoveHistory[]>([]);

  // Keypad selected number filter
  const [highlightedDigit, setHighlightedDigit] = useState<number | null>(null);

  // Modals
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [includePrintSolution, setIncludePrintSolution] = useState<boolean>(false);

  // Timer
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(true);

  // Interactive Academy Lessons State
  const [activeLessonIdx, setActiveLessonIdx] = useState<number>(0);
  const [lessonGrid, setLessonGrid] = useState<number[][]>([]);
  const [lessonFeedback, setLessonFeedback] = useState<{
    text: string;
    isCorrect: boolean;
  } | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Record<number, boolean>>({});

  // Active Academy Lesson
  const currentLesson: InteractiveSudokuLesson = useMemo(() => {
    return INTERACTIVE_SUDOKU_LESSONS[activeLessonIdx] || INTERACTIVE_SUDOKU_LESSONS[0];
  }, [activeLessonIdx]);

  // Load Academy Lesson
  const loadLesson = useCallback((idx: number) => {
    const l = INTERACTIVE_SUDOKU_LESSONS[idx];
    if (!l) return;
    setActiveLessonIdx(idx);
    setLessonGrid(l.initialGrid.map((r) => [...r]));
    setLessonFeedback(null);
  }, []);

  useEffect(() => {
    loadLesson(activeLessonIdx);
  }, [activeLessonIdx, loadLesson]);

  // Load / Generate Dynamic Puzzle
  const loadPuzzle = useCallback(
    (size: SudokuSize, diff: "easy" | "medium", diagonal: boolean, usePreset: boolean = false) => {
      let pz: SudokuPuzzle;

      if (usePreset) {
        const key = `${size}x${size}-${diff}`;
        pz = PRESET_PUZZLES[key] || PRESET_PUZZLES["4x4-easy"];
      } else {
        // Generate dynamic random unique puzzle
        pz = generateDynamicPuzzle(size, diff, diagonal);
      }

      const initialG = pz.initialGrid.map((r) => [...r]);
      const mask = initialG.map((r) => r.map((c) => c !== 0));

      setGrid(initialG);
      setSolution(pz.solution);
      setInitialMask(mask);
      setNotes({});
      setSelectedCell(null);
      setHighlightedDigit(null);
      setMistakes(0);
      setIsCompleted(false);
      setActiveHint(null);
      setConflictAlert(null);
      setHistory([]);
      setTimerSeconds(0);
      setTimerRunning(true);
    },
    []
  );

  const handleSizeChange = (newSize: SudokuSize) => {
    playFx("click");
    setSelectedSize(newSize);
    loadPuzzle(newSize, difficulty, isDiagonalMode);
  };

  const handleDifficultyChange = (newDiff: "easy" | "medium") => {
    playFx("click");
    setDifficulty(newDiff);
    loadPuzzle(selectedSize, newDiff, isDiagonalMode);
  };

  const handleDiagonalToggle = () => {
    playFx("bubble");
    const nextDiagonal = !isDiagonalMode;
    setIsDiagonalMode(nextDiagonal);
    loadPuzzle(selectedSize, difficulty, nextDiagonal);
  };

  const handleNewRandomPuzzle = () => {
    playFx("bubble");
    loadPuzzle(selectedSize, difficulty, isDiagonalMode);
  };

  const handleResetCurrentPuzzle = () => {
    playFx("click");
    const resetG = grid.map((r, rIdx) =>
      r.map((_, cIdx) => (initialMask[rIdx]?.[cIdx] ? grid[rIdx][cIdx] : 0))
    );
    setGrid(resetG);
    setNotes({});
    setSelectedCell(null);
    setConflictAlert(null);
    setActiveHint(null);
    setHistory([]);
    setMistakes(0);
    setTimerSeconds(0);
  };

  useEffect(() => {
    loadPuzzle(selectedSize, difficulty, isDiagonalMode, false);
  }, [selectedSize, difficulty, isDiagonalMode, loadPuzzle]);

  // Timer Interval
  useEffect(() => {
    if (!timerRunning || isCompleted) return;
    const interval = setInterval(() => {
      setTimerSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, isCompleted]);

  // Remaining counts for keypad
  const remainingCounts = useMemo(() => {
    return getRemainingDigitCounts(grid, selectedSize);
  }, [grid, selectedSize]);

  // Cell Click in main play grid
  const handleCellClick = (r: number, c: number) => {
    playFx("click");
    setSelectedCell({ row: r, col: c });
    const cellVal = grid[r]?.[c];
    if (cellVal && cellVal > 0) {
      setHighlightedDigit(cellVal);
    } else {
      setHighlightedDigit(null);
    }
  };

  // Keypad Number Input in main play grid
  const handleNumberInput = (num: number) => {
    setHighlightedDigit(num);

    if (!selectedCell || isCompleted) return;
    const { row, col } = selectedCell;

    // Cannot edit initial clues
    if (initialMask[row] && initialMask[row][col]) return;

    if (pencilMode) {
      // Toggle candidate note
      const key = `${row}-${col}`;
      const existing = notes[key] || [];
      const updated = existing.includes(num)
        ? existing.filter((n) => n !== num)
        : [...existing, num].sort();
      setNotes((prev) => ({ ...prev, [key]: updated }));
      playFx("click");
      return;
    }

    // Check for duplicate conflicts (including Diagonal in Sudoku X)
    const conflict = findPlacementConflicts(grid, row, col, num, selectedSize, isDiagonalMode);
    if (conflict) {
      setConflictAlert(conflict);
      playFx("wrong");
      setMistakes((m) => m + 1);
      return;
    } else {
      setConflictAlert(null);
    }

    // Direct Placement
    const isValid = isValidPlacement(grid, row, col, num, selectedSize, isDiagonalMode);
    const prevVal = grid[row][col];
    const prevNotes = { ...notes };

    const nextGrid = grid.map((r) => [...r]);
    nextGrid[row][col] = num;
    setGrid(nextGrid);

    // Save to history for Undo
    setHistory((prev) => [
      ...prev,
      { row, col, prevVal, nextVal: num, prevNotes },
    ]);

    // Auto-remove candidate notes in row, col, box, and diagonal
    const cleanedNotes = removeCandidateFromPeers(notes, row, col, num, selectedSize, isDiagonalMode);
    setNotes(cleanedNotes);

    const expectedVal = solution[row]?.[col] ?? 0;
    if (isValid && (expectedVal === 0 || num === expectedVal)) {
      playFx("click");

      // Check if board complete
      let allFilled = true;
      for (let r = 0; r < selectedSize; r++) {
        for (let c = 0; c < selectedSize; c++) {
          if (nextGrid[r][c] === 0 || (expectedVal !== 0 && nextGrid[r][c] !== solution[r][c])) {
            allFilled = false;
            break;
          }
        }
      }

      if (allFilled) {
        setIsCompleted(true);
        setTimerRunning(false);
        playFx("correct");

        if (user) {
          const supabase = getSupabaseClient();
          if (supabase) {
            void supabase.from("training_sessions").insert({
              user_id: user.id,
              session_type: "sudoku",
              status: "completed",
              score: selectedSize * 100 - mistakes * 20,
              metadata: { size: selectedSize, difficulty, isDiagonal: isDiagonalMode, timeSeconds: timerSeconds },
            });
          }
        }
      }
    } else {
      playFx("wrong");
      setMistakes((m) => m + 1);
    }
  };

  // Undo Last Move
  const handleUndo = () => {
    if (history.length === 0 || isCompleted) return;
    playFx("click");
    const lastMove = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));

    const nextGrid = grid.map((r) => [...r]);
    nextGrid[lastMove.row][lastMove.col] = lastMove.prevVal;
    setGrid(nextGrid);
    setNotes(lastMove.prevNotes);
    setSelectedCell({ row: lastMove.row, col: lastMove.col });
    setConflictAlert(null);
  };

  // Erase Cell
  const handleErase = () => {
    if (!selectedCell || isCompleted) return;
    const { row, col } = selectedCell;
    if (initialMask[row] && initialMask[row][col]) return;

    playFx("click");
    const prevVal = grid[row][col];
    const prevNotes = { ...notes };

    const nextGrid = grid.map((r) => [...r]);
    nextGrid[row][col] = 0;
    setGrid(nextGrid);

    const key = `${row}-${col}`;
    if (notes[key]) {
      const nextNotes = { ...notes };
      delete nextNotes[key];
      setNotes(nextNotes);
    }

    setHistory((prev) => [
      ...prev,
      { row, col, prevVal, nextVal: 0, prevNotes },
    ]);
    setConflictAlert(null);
  };

  // Get Smart Hint
  const handleSmartHint = () => {
    if (isCompleted) return;
    playFx("bubble");
    const hint = findSmartHint(grid, solution, selectedSize, isDiagonalMode);
    if (hint) {
      setActiveHint(hint);
      setSelectedCell({ row: hint.row, col: hint.col });
      setHighlightedDigit(hint.val);
    }
  };

  // Apply Hint to board
  const applyHintValue = () => {
    if (!activeHint) return;
    playFx("correct");
    const { row, col, val } = activeHint;
    const prevVal = grid[row][col];
    const prevNotes = { ...notes };

    const nextGrid = grid.map((r) => [...r]);
    nextGrid[row][col] = val;
    setGrid(nextGrid);

    setHistory((prev) => [
      ...prev,
      { row, col, prevVal, nextVal: val, prevNotes },
    ]);

    const cleanedNotes = removeCandidateFromPeers(notes, row, col, val, selectedSize, isDiagonalMode);
    setNotes(cleanedNotes);
    setActiveHint(null);
  };

  // Academy Lesson Interactive Cell Click & Keypad
  const handleLessonKeypadInput = (num: number) => {
    if (!currentLesson) return;
    const { row, col } = currentLesson.targetCell;

    if (num === currentLesson.correctVal) {
      playFx("correct");
      const nextG = lessonGrid.map((r) => [...r]);
      nextG[row][col] = num;
      setLessonGrid(nextG);
      setCompletedLessons((prev) => ({ ...prev, [currentLesson.id]: true }));
      setLessonFeedback({
        text: currentLesson.celebrationAr,
        isCorrect: true,
      });
    } else {
      playFx("wrong");
      setLessonFeedback({
        text: `غير صحيح! ${currentLesson.hintExplanationAr}`,
        isCorrect: false,
      });
    }
  };

  const { boxRows, boxCols } = getBoxDimensions(selectedSize);

  // Format time mm:ss
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Crosshair helper for a cell
  const isCellInSelectedBox = (r: number, c: number) => {
    if (!selectedCell) return false;
    const selBoxR = Math.floor(selectedCell.row / boxRows) * boxRows;
    const selBoxC = Math.floor(selectedCell.col / boxCols) * boxCols;
    return (
      r >= selBoxR &&
      r < selBoxR + boxRows &&
      c >= selBoxC &&
      c < selBoxC + boxCols
    );
  };

  return (
    <ModuleLockedGate moduleId="sudoku" moduleNameAr="أكاديمية السودوكو" moduleIcon="🔢">
      <div className="min-h-screen bg-[#FAF8FF] dark:bg-[#0F0D1E] text-slate-800 dark:text-slate-100 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Breadcrumb & Quick Action Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/mental-arithmetic"
                className="flex items-center gap-2 text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 bg-white dark:bg-[#1C1A3A] px-4 py-2 rounded-xl shadow-sm border border-brand-100 dark:border-brand-900/40"
              >
                <ArrowRight className={`w-4 h-4 ${isAr ? "" : "rotate-180"}`} />
                <span>{isAr ? "العودة للبرامج" : "Back to Hub"}</span>
              </Link>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <ClayIcon name="sudoku" size="xs" />
                <span>{isAr ? "أكاديمية السودوكو الذكية" : "Sudoku Academy"}</span>
              </div>
            </div>

            {/* Quick Action Badges: Rules & Print */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playFx("click");
                  setShowRulesModal(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-100 transition-all border border-purple-200/50"
              >
                <HelpCircle className="w-4 h-4 text-purple-600" />
                <span>{isAr ? "قواعد السودوكو" : "Rules"}</span>
              </button>

              <button
                onClick={() => {
                  playFx("click");
                  setShowPrintModal(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold text-xs hover:bg-amber-100 transition-all border border-amber-200/50"
              >
                <Printer className="w-4 h-4 text-amber-600" />
                <span>{isAr ? "طباعة ورقة عمل" : "Print Sheet"}</span>
              </button>
            </div>
          </div>

          {/* Hero Title */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-700 via-indigo-600 to-violet-500 bg-clip-text text-transparent">
              {isAr ? "أكاديمية السودوكو التفاعلية 🔢" : "Sudoku Master Academy 🔢"}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              {isAr
                ? "توليد ديناميكي لشبكات عشوائية غير محدودة، نمط سودوكو إكس القطري (X)، تظليل متباين للمربعات، ومطبوعات أوراق عمل للأبطال والمدربين!"
                : "Dynamic puzzle generator, Diagonal Sudoku X, distinct subgrid shading, and printable worksheets!"}
            </p>
          </div>

          {/* Main Navigation Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-100 dark:bg-[#16132C] p-2 rounded-2xl border border-purple-100 dark:border-purple-900/40">
            {[
              { id: "play", label: isAr ? "اللعب والشبكات التفاعلية" : "Interactive Play Grid", icon: Grid },
              { id: "academy", label: isAr ? "الأكاديمية والدروس التطبيقية (5 دروس)" : "Guided Academy Lessons", icon: BookOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    playFx("click");
                    setActiveTab(tab.id as SudokuTab);
                  }}
                  className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                    active
                      ? "bg-white dark:bg-[#231F46] text-purple-700 dark:text-purple-300 shadow-md scale-[1.02] border border-purple-200 dark:border-purple-800"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-purple-600" : ""}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* TAB 1: INTERACTIVE SUDOKU PLAY GRID */}
          {/* ------------------------------------------------------------- */}
          {activeTab === "play" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left: The Board (7 cols) */}
              <div className="lg:col-span-7 bg-white dark:bg-[#1C1A3A] p-5 sm:p-7 rounded-3xl shadow-xl border border-purple-100 dark:border-purple-900/50 space-y-5">
                {/* Header Controls: Size, Difficulty, Mode, Timer, Mistakes */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-50 dark:border-purple-900/30 pb-4">
                  {/* Size Switcher */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 bg-purple-50 dark:bg-purple-900/30 p-1 rounded-xl">
                      {[
                        { sz: 4 as SudokuSize, label: isAr ? "4×4 براعم" : "4x4 Mini" },
                        { sz: 6 as SudokuSize, label: isAr ? "6×6 متوسط" : "6x6 Midi" },
                        { sz: 9 as SudokuSize, label: isAr ? "9×9 كلاسيك" : "9x9 Classic" },
                      ].map((item) => (
                        <button
                          key={item.sz}
                          onClick={() => handleSizeChange(item.sz)}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                            selectedSize === item.sz
                              ? "bg-purple-600 text-white shadow-md scale-102"
                              : "text-purple-700 dark:text-purple-300 hover:bg-white/50"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {/* Difficulty Switcher */}
                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 p-1 rounded-xl">
                      {[
                        { id: "easy" as const, label: isAr ? "مبتدئ" : "Easy" },
                        { id: "medium" as const, label: isAr ? "تحدي" : "Medium" },
                      ].map((d) => (
                        <button
                          key={d.id}
                          onClick={() => handleDifficultyChange(d.id)}
                          className={`px-2.5 py-1.5 rounded-lg font-bold text-xs transition-all ${
                            difficulty === d.id
                              ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                              : "text-amber-800 dark:text-amber-300 hover:bg-white/50"
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>

                    {/* Sudoku X (Diagonal Mode) Toggle Button */}
                    <button
                      onClick={handleDiagonalToggle}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 border ${
                        isDiagonalMode
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md ring-2 ring-indigo-400 border-indigo-400"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-indigo-50"
                      }`}
                      title={isAr ? "تفعيل شرط القطرين (سودوكو X)" : "Toggle Diagonal Sudoku X"}
                    >
                      <span>❌</span>
                      <span>{isAr ? "نمط X القطري" : "Sudoku X"}</span>
                    </button>
                  </div>

                  {/* Timer & Mistakes & Reset */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 font-mono font-bold text-xs text-purple-700 dark:text-purple-300">
                      <span>⏱ {formatTime(timerSeconds)}</span>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 font-bold text-xs text-rose-700 dark:text-rose-300">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{mistakes} / 3</span>
                    </div>
                  </div>
                </div>

                {/* Generator Bar: Random Generation & Board Actions */}
                <div className="flex items-center justify-between gap-2 bg-[#FAF8FF] dark:bg-[#141228] p-2.5 rounded-2xl border border-purple-100 dark:border-purple-900/40 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-bold">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>{isAr ? "مولد الألغاز الديناميكي:" : "Dynamic Puzzle:"}</span>
                    <span className="text-purple-700 dark:text-purple-300 font-black">
                      {isDiagonalMode ? "سودوكو X القطرية" : "كلاسيك القياسية"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleNewRandomPuzzle}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
                    >
                      <Dices className="w-3.5 h-3.5" />
                      <span>{isAr ? "لغز عشوائي جديد" : "New Random"}</span>
                    </button>

                    <button
                      onClick={handleResetCurrentPuzzle}
                      className="p-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 font-bold text-xs transition-all border border-slate-200 dark:border-slate-700"
                      title={isAr ? "إعادة ضبط نفس اللغز" : "Reset Board"}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Conflict Alert Banner (Toast) */}
                {conflictAlert && (
                  <div className="p-3 rounded-2xl bg-rose-500 text-white flex items-center justify-between shadow-lg animate-pulse text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{conflictAlert.messageAr}</span>
                    </div>
                    <button
                      onClick={() => setConflictAlert(null)}
                      className="p-1 rounded-lg hover:bg-white/20 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Sudoku Interactive Canvas with Checkerboard Subgrid Shading & Diagonal X */}
                <div className="flex justify-center py-1">
                  <div
                    className="grid bg-[#231A4C] p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl shadow-2xl border-4 border-purple-600/70 select-none overflow-hidden w-full max-w-[430px] aspect-square mx-auto"
                    style={{
                      gridTemplateColumns: `repeat(${selectedSize}, minmax(0, 1fr))`,
                      gridTemplateRows: `repeat(${selectedSize}, minmax(0, 1fr))`,
                    }}
                  >
                    {grid.length === selectedSize && grid[0]?.length === selectedSize ? (
                      grid.map((row, rIdx) =>
                        row.map((val, cIdx) => {
                          const isInitial = initialMask[rIdx] && initialMask[rIdx][cIdx];
                          const isSelected = selectedCell?.row === rIdx && selectedCell?.col === cIdx;
                          const isSameRowOrCol =
                            selectedCell && (selectedCell.row === rIdx || selectedCell.col === cIdx);
                          const isInBox = isCellInSelectedBox(rIdx, cIdx);

                          // Subgrid Box Coordinates & Shading distinction
                          const boxR = Math.floor(rIdx / boxRows);
                          const boxC = Math.floor(cIdx / boxCols);
                          const isAltBox = (boxR + boxC) % 2 === 1;

                          // Diagonal Cell (in Sudoku X mode)
                          const isMainDiagonal = rIdx === cIdx;
                          const isAntiDiagonal = rIdx + cIdx === selectedSize - 1;
                          const isDiagonalCell = isDiagonalMode && (isMainDiagonal || isAntiDiagonal);

                          // Matching number highlight
                          const targetMatchNum =
                            highlightedDigit ||
                            (selectedCell && grid[selectedCell.row]?.[selectedCell.col] > 0
                              ? grid[selectedCell.row][selectedCell.col]
                              : null);
                          const isSameNumber = targetMatchNum && val > 0 && val === targetMatchNum;

                          // Hint target or hint crosshair highlight
                          const isHintTarget = activeHint?.row === rIdx && activeHint?.col === cIdx;
                          const isHintRow = activeHint?.highlightRows?.includes(rIdx);
                          const isHintCol = activeHint?.highlightCols?.includes(cIdx);
                          const isHintBox =
                            activeHint?.highlightBox &&
                            rIdx >= activeHint.highlightBox.startRow &&
                            rIdx <= activeHint.highlightBox.endRow &&
                            cIdx >= activeHint.highlightBox.startCol &&
                            cIdx <= activeHint.highlightBox.endCol;

                          // Conflict cells highlight
                          const isConflicting =
                            conflictAlert &&
                            conflictAlert.conflictingCells.some(
                              (cell) => cell.row === rIdx && cell.col === cIdx
                            );

                          // Sub-box borders
                          const borderRight = (cIdx + 1) % boxCols === 0 && cIdx + 1 < selectedSize;
                          const borderBottom = (rIdx + 1) % boxRows === 0 && rIdx + 1 < selectedSize;

                          // Background coloring logic (including Subgrid Distinction & Diagonal X)
                          let cellBg = isAltBox
                            ? "bg-purple-50/70 dark:bg-[#1F1B3E]"
                            : "bg-white dark:bg-[#16132C]";

                          if (isDiagonalCell) {
                            cellBg = "bg-indigo-100/60 dark:bg-indigo-950/40";
                          }

                          if (isSelected) {
                            cellBg = "bg-purple-300 dark:bg-purple-700 text-purple-950 dark:text-white ring-2 ring-purple-600 scale-[0.98]";
                          } else if (isConflicting) {
                            cellBg = "bg-rose-200 dark:bg-rose-900/80 text-rose-950 dark:text-rose-100 ring-2 ring-rose-500 animate-pulse";
                          } else if (isHintTarget) {
                            cellBg = "bg-amber-300 dark:bg-amber-600 text-amber-950 dark:text-white animate-bounce ring-2 ring-amber-500";
                          } else if (isSameNumber) {
                            cellBg = "bg-purple-200 dark:bg-purple-900/90 text-purple-950 dark:text-purple-100 font-black ring-1 ring-purple-400";
                          } else if (isHintRow || isHintCol || isHintBox) {
                            cellBg = "bg-amber-50 dark:bg-amber-950/40";
                          } else if (isSameRowOrCol || isInBox) {
                            cellBg = "bg-[#ECE6FF] dark:bg-[#201C45]";
                          }

                          const noteKey = `${rIdx}-${cIdx}`;
                          const cellNotes = notes[noteKey] || [];

                          return (
                            <button
                              key={`${rIdx}-${cIdx}`}
                              onClick={() => handleCellClick(rIdx, cIdx)}
                              className={`w-full h-full aspect-square flex items-center justify-center font-black transition-all relative border border-slate-300/60 dark:border-slate-800/80 ${cellBg} ${
                                borderRight ? "border-r-2 sm:border-r-4 border-r-purple-950 dark:border-r-purple-400" : ""
                              } ${
                                borderBottom ? "border-b-2 sm:border-b-4 border-b-purple-950 dark:border-b-purple-400" : ""
                              } ${
                                isInitial
                                  ? "text-slate-900 dark:text-slate-100 font-black"
                                  : "text-purple-600 dark:text-purple-400 font-extrabold"
                              } ${selectedSize === 9 ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl"}`}
                            >
                              {val > 0 ? (
                                <span>{val}</span>
                              ) : cellNotes.length > 0 ? (
                                <div className="grid grid-cols-3 gap-0.5 text-[8px] sm:text-[9px] text-slate-500 dark:text-slate-400 font-bold p-0.5">
                                  {Array.from({ length: selectedSize }).map((_, i) => (
                                    <span key={i} className="flex items-center justify-center">
                                      {cellNotes.includes(i + 1) ? i + 1 : ""}
                                    </span>
                                  ))}
                                </div>
                              ) : isDiagonalCell ? (
                                <span className="text-[9px] text-indigo-400/40 dark:text-indigo-400/30 select-none">
                                  ✕
                                </span>
                              ) : null}
                            </button>
                          );
                        })
                      )
                    ) : (
                      <div className="col-span-full flex items-center justify-center p-8 text-purple-300 font-bold">
                        جاري تجهيز الشبكة...
                      </div>
                    )}
                  </div>
                </div>

                {/* Completion Celebration Card */}
                {isCompleted && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-center font-bold shadow-xl space-y-3 animate-fade-in">
                    <div className="flex items-center justify-center gap-2 text-xl font-black">
                      <Award className="w-6 h-6" />
                      <span>🏆 إنجاز خارق! أتممت اللغز بنجاح باهر!</span>
                    </div>
                    <p className="text-emerald-100 text-xs">
                      الوقت المستغرق: {formatTime(timerSeconds)} دقيقة • عدد الأخطاء: {mistakes}
                    </p>
                    <div className="pt-1 flex items-center justify-center gap-3">
                      <button
                        onClick={handleNewRandomPuzzle}
                        className="px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-black text-xs hover:bg-emerald-50 shadow-md transition-all active:scale-95"
                      >
                        {isAr ? "لعب لغز عشوائي جديد" : "Play Another Puzzle"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Keypad, Controls & Smart Hint (5 cols) */}
              <div className="lg:col-span-5 space-y-5">
                {/* Utility Action Buttons */}
                <div className="bg-white dark:bg-[#1C1A3A] p-5 rounded-3xl shadow-xl border border-purple-100 dark:border-purple-900/50 space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    {/* Undo */}
                    <button
                      onClick={handleUndo}
                      disabled={history.length === 0}
                      className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs flex flex-col items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      title={isAr ? "تراجع عن الخطوة السابقة" : "Undo"}
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span className="text-[11px]">{isAr ? "تراجع" : "Undo"}</span>
                    </button>

                    {/* Pencil Mode */}
                    <button
                      onClick={() => {
                        playFx("click");
                        setPencilMode(!pencilMode);
                      }}
                      className={`p-3 rounded-2xl font-bold text-xs flex flex-col items-center gap-1 transition-all ${
                        pencilMode
                          ? "bg-purple-600 text-white shadow-md scale-105 ring-2 ring-purple-400"
                          : "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100"
                      }`}
                    >
                      <Edit3 className="w-4 h-4" />
                      <span className="text-[11px]">{isAr ? "المسودة" : "Notes"}</span>
                    </button>

                    {/* Erase */}
                    <button
                      onClick={handleErase}
                      className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 font-bold text-xs flex flex-col items-center gap-1 transition-all"
                    >
                      <Eraser className="w-4 h-4" />
                      <span className="text-[11px]">{isAr ? "مسح" : "Erase"}</span>
                    </button>

                    {/* Smart Hint */}
                    <button
                      onClick={handleSmartHint}
                      className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 font-bold text-xs flex flex-col items-center gap-1 transition-all"
                    >
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span className="text-[11px]">{isAr ? "مساعد" : "Hint"}</span>
                    </button>
                  </div>

                  {/* Keypad with Remaining Digits Counter & Completion Check */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
                      <span>{isAr ? "لوحة الأرقام والعدادات" : "Keypad & Counters"}</span>
                      {pencilMode && (
                        <span className="text-purple-600 dark:text-purple-400 text-[11px] flex items-center gap-1">
                          <Edit3 className="w-3 h-3" />
                          <span>{isAr ? "وضع المسودة نشط" : "Notes Active"}</span>
                        </span>
                      )}
                    </div>

                    <div
                      className="grid gap-2"
                      style={{
                        gridTemplateColumns: `repeat(${selectedSize === 4 ? 4 : 3}, minmax(0, 1fr))`,
                      }}
                    >
                      {Array.from({ length: selectedSize }).map((_, idx) => {
                        const digit = idx + 1;
                        const remaining = remainingCounts[digit] ?? 0;
                        const isDone = remaining === 0;
                        const isHighlighted = highlightedDigit === digit;

                        return (
                          <button
                            key={digit}
                            onClick={() => handleNumberInput(digit)}
                            className={`py-3 px-2 rounded-2xl border-2 transition-all flex flex-col items-center justify-center relative ${
                              isDone
                                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 opacity-60"
                                : isHighlighted
                                ? "bg-purple-100 dark:bg-purple-900/60 border-purple-500 shadow-md scale-105"
                                : "bg-white dark:bg-[#231F46] border-purple-100 dark:border-purple-800/60 hover:border-purple-400 hover:scale-102"
                            }`}
                          >
                            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
                              {digit}
                            </span>
                            <span className="text-[10px] font-bold mt-0.5 flex items-center gap-0.5">
                              {isDone ? (
                                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                  <Check className="w-3 h-3" />
                                  <span>{isAr ? "مكتمل" : "Done"}</span>
                                </span>
                              ) : (
                                <span className="text-slate-400 dark:text-slate-500">
                                  {isAr ? `بقي ${remaining}` : `${remaining} left`}
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Smart Explanatory Hint Card */}
                {activeHint && (
                  <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 shadow-lg space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        <span>{activeHint.techniqueAr}</span>
                      </span>
                      <button
                        onClick={applyHintValue}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-1"
                      >
                        <span>{isAr ? "تطبيق الرقم" : "Apply"}</span>
                        <span>({activeHint.val})</span>
                      </button>
                    </div>
                    <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium bg-white/70 dark:bg-black/20 p-3 rounded-2xl border border-amber-200/50">
                      💡 {activeHint.explanationAr}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 2: INTERACTIVE GUIDED ACADEMY */}
          {/* ------------------------------------------------------------- */}
          {activeTab === "academy" && (
            <div className="space-y-8">
              {/* Lesson Progression Navigator */}
              <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-[#1C1A3A] p-3 rounded-2xl shadow-sm border border-purple-100 dark:border-purple-900/40">
                {INTERACTIVE_SUDOKU_LESSONS.map((l, idx) => {
                  const isCurrent = activeLessonIdx === idx;
                  const isDone = completedLessons[l.id];

                  return (
                    <button
                      key={l.id}
                      onClick={() => {
                        playFx("click");
                        loadLesson(idx);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                        isCurrent
                          ? "bg-purple-600 text-white shadow-md scale-105"
                          : isDone
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-50"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <span>{l.id}</span>
                      )}
                      <span>{l.badgeAr}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Interactive Lesson Canvas */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Interactive Lesson Mini-Board (6 cols) */}
                <div className="lg:col-span-6 bg-white dark:bg-[#1C1A3A] p-6 sm:p-8 rounded-3xl shadow-xl border border-purple-100 dark:border-purple-900/50 space-y-5">
                  <div className="flex items-center justify-between border-b border-purple-50 dark:border-purple-900/30 pb-3">
                    <span className="font-black text-sm text-purple-700 dark:text-purple-300">
                      {currentLesson.titleAr}
                    </span>
                    <button
                      onClick={() => loadLesson(activeLessonIdx)}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-purple-600 font-bold"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{isAr ? "إعادة ضبط" : "Reset"}</span>
                    </button>
                  </div>

                  {/* 4x4 Interactive Mini Canvas */}
                  <div className="flex justify-center py-2">
                    <div
                      className="grid bg-[#231A4C] p-3 rounded-3xl shadow-2xl border-4 border-purple-500/60 select-none overflow-hidden w-full max-w-[340px] aspect-square mx-auto"
                      style={{
                        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                        gridTemplateRows: "repeat(4, minmax(0, 1fr))",
                      }}
                    >
                      {lessonGrid.map((row, rIdx) =>
                        row.map((val, cIdx) => {
                          const isTarget =
                            currentLesson.targetCell.row === rIdx &&
                            currentLesson.targetCell.col === cIdx;
                          const isHighlightRow = currentLesson.highlightRows?.includes(rIdx);
                          const isHighlightCol = currentLesson.highlightCols?.includes(cIdx);
                          const isHighlightBox =
                            currentLesson.highlightBox &&
                            rIdx >= currentLesson.highlightBox.startRow &&
                            rIdx <= currentLesson.highlightBox.endRow &&
                            cIdx >= currentLesson.highlightBox.startCol &&
                            cIdx <= currentLesson.highlightBox.endCol;

                          const borderRight = (cIdx + 1) % 2 === 0 && cIdx + 1 < 4;
                          const borderBottom = (rIdx + 1) % 2 === 0 && rIdx + 1 < 4;

                          let bg = "bg-white dark:bg-[#1E1B3E]";
                          if (isTarget && val === 0) {
                            bg = "bg-amber-300 dark:bg-amber-500 ring-4 ring-amber-400 animate-pulse text-amber-950";
                          } else if (isTarget && val > 0) {
                            bg = "bg-emerald-400 text-slate-950 font-black ring-4 ring-emerald-500 scale-105";
                          } else if (isHighlightRow || isHighlightCol || isHighlightBox) {
                            bg = "bg-purple-100 dark:bg-purple-900/60";
                          }

                          return (
                            <div
                              key={`${rIdx}-${cIdx}`}
                              className={`w-full h-full aspect-square flex items-center justify-center font-black text-2xl transition-all relative border border-slate-200 dark:border-slate-800 ${bg} ${
                                borderRight ? "border-r-4 border-r-purple-900 dark:border-r-purple-500" : ""
                              } ${
                                borderBottom ? "border-b-4 border-b-purple-900 dark:border-b-purple-500" : ""
                              } ${val > 0 ? "text-slate-900 dark:text-slate-100" : ""}`}
                            >
                              {val > 0 ? (
                                val
                              ) : isTarget ? (
                                <span className="text-amber-900 dark:text-amber-950 font-black animate-bounce text-xl">
                                  ?
                                </span>
                              ) : null}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Target Cell Keypad */}
                  <div className="space-y-2 pt-2">
                    <p className="text-center text-xs font-bold text-slate-600 dark:text-slate-300">
                      {isAr
                        ? "اختر الرقم الصحيح للخلية الشاغرة المميزة باللون الذهبي (?):"
                        : "Select the correct digit for the highlighted target cell:"}
                    </p>
                    <div className="grid grid-cols-4 gap-2 max-w-[340px] mx-auto">
                      {[1, 2, 3, 4].map((num) => (
                        <button
                          key={num}
                          onClick={() => handleLessonKeypadInput(num)}
                          className="py-3 rounded-2xl bg-purple-50 dark:bg-[#231F46] border-2 border-purple-200 dark:border-purple-800 text-xl font-black text-purple-900 dark:text-purple-200 shadow hover:bg-purple-600 hover:text-white hover:scale-105 active:scale-95 transition-all"
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Lesson Instructions & Theory (6 cols) */}
                <div className="lg:col-span-6 space-y-5">
                  <div className="bg-white dark:bg-[#1C1A3A] p-6 rounded-3xl shadow-xl border border-purple-100 dark:border-purple-900/50 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black text-lg">
                        {currentLesson.id}
                      </div>
                      <div>
                        <h2 className="text-base font-black text-purple-950 dark:text-purple-200">
                          {currentLesson.ruleTitleAr}
                        </h2>
                        <span className="text-xs text-purple-600 dark:text-purple-400 font-bold">
                          {currentLesson.badgeAr}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-[#FAF8FF] dark:bg-[#141228] p-3.5 rounded-2xl border border-purple-100 dark:border-purple-900/40">
                      {currentLesson.summaryAr}
                    </p>

                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-2">
                      <div className="flex items-center gap-1.5 font-black text-xs text-amber-800 dark:text-amber-300">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        <span>{isAr ? "مهمة الدرس التفاعلية:" : "Interactive Lesson Goal:"}</span>
                      </div>
                      <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-bold">
                        {currentLesson.goalAr}
                      </p>
                    </div>

                    {/* Lesson Feedback Alert */}
                    {lessonFeedback && (
                      <div
                        className={`p-4 rounded-2xl font-bold text-xs space-y-3 animate-fade-in ${
                          lessonFeedback.isCorrect
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-2 border-emerald-300 dark:border-emerald-800"
                            : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-2 border-rose-300 dark:border-rose-800"
                        }`}
                      >
                        <p>{lessonFeedback.text}</p>
                        {lessonFeedback.isCorrect && activeLessonIdx < INTERACTIVE_SUDOKU_LESSONS.length - 1 && (
                          <button
                            onClick={() => {
                              playFx("click");
                              loadLesson(activeLessonIdx + 1);
                            }}
                            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
                          >
                            <span>{isAr ? "الانتقال إلى الدرس التالي" : "Next Lesson"}</span>
                            <ArrowRight className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Reference Curriculum List */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-slate-500 px-2">
                      {isAr ? "المناهج والقواعد التأسيسية المعتمدة" : "Master Curriculum Overview"}
                    </h3>
                    {SUDOKU_LESSONS.map((st) => (
                      <div
                        key={st.id}
                        className="bg-white dark:bg-[#1C1A3A] p-4 rounded-2xl border border-purple-100 dark:border-purple-900/40 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-purple-900 dark:text-purple-200">
                          <span>{st.titleAr}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {st.steps.length} {isAr ? "قواعد" : "rules"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {st.summaryAr}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* MODAL 1: RULES & INSTRUCTIONS GUIDE MODAL */}
          {/* ------------------------------------------------------------- */}
          {showRulesModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#1A1636] max-w-2xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-100 dark:border-purple-900/60 space-y-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-900/40 pb-4">
                  <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-black text-lg">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <span>{isAr ? "دليل وقواعد السودوكو الذكية 📖" : "Sudoku Rules & Guidelines"}</span>
                  </div>
                  <button
                    onClick={() => setShowRulesModal(false)}
                    className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {SUDOKU_RULES_GUIDE.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-4 rounded-2xl bg-[#FAF8FF] dark:bg-[#131028] border border-purple-100 dark:border-purple-900/40 space-y-2"
                    >
                      <div className="flex items-center gap-2 font-black text-sm text-purple-950 dark:text-purple-200">
                        <span>{rule.icon}</span>
                        <span>{rule.titleAr}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {rule.descriptionAr}
                      </p>
                      <ul className="text-[11px] text-purple-700 dark:text-purple-300 space-y-1 list-disc list-inside pt-1">
                        {rule.examplesAr.map((ex, i) => (
                          <li key={i}>{ex}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowRulesModal(false)}
                  className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm shadow-md transition-all"
                >
                  {isAr ? "فهمت القواعد، فلنبدأ اللعب! 🚀" : "Got it, let's play!"}
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* MODAL 2: PRINTABLE WORKSHEET & PDF GENERATOR */}
          {/* ------------------------------------------------------------- */}
          {showPrintModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#1A1636] max-w-3xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-100 dark:border-purple-900/60 space-y-6 max-h-[92vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-900/40 pb-4">
                  <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-black text-lg">
                    <Printer className="w-5 h-5 text-purple-600" />
                    <span>{isAr ? "طباعة وتصدير ورقة عمل السودوكو 📄" : "Print Sudoku Worksheet"}</span>
                  </div>
                  <button
                    onClick={() => setShowPrintModal(false)}
                    className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Print Sheet Options */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-purple-50 dark:bg-purple-950/40 p-4 rounded-2xl text-xs font-bold text-purple-900 dark:text-purple-200">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-purple-600" />
                    <span>
                      {selectedSize}×{selectedSize} • {difficulty === "easy" ? "مبتدئ" : "تحدي"} •{" "}
                      {isDiagonalMode ? "سودوكو X القطرية" : "كلاسيك"}
                    </span>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includePrintSolution}
                      onChange={(e) => setIncludePrintSolution(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span>{isAr ? "إرفاق صفحة مفتاح الحل للمدرب" : "Include Answer Key"}</span>
                  </label>
                </div>

                {/* Printable Worksheet Preview Card */}
                <div
                  id="sudoku-print-area"
                  className="bg-white text-slate-900 p-6 sm:p-8 rounded-2xl border-2 border-slate-300 shadow-inner space-y-6 text-center select-none"
                >
                  {/* Worksheet Header */}
                  <div className="border-b-2 border-slate-800 pb-3 flex items-center justify-between">
                    <div className="text-right">
                      <h2 className="text-lg font-black text-purple-950">
                        منصة العقل الخارق SUPER MIND IQ
                      </h2>
                      <p className="text-xs text-slate-600 font-bold">
                        ورقة عمل تدريبية: شبكة سودوكو {selectedSize}×{selectedSize}{" "}
                        {isDiagonalMode ? "(نمط X القطري)" : ""}
                      </p>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      <span>المستوى: {difficulty === "easy" ? "مبتدئ ★" : "تحدي ★★"}</span>
                    </div>
                  </div>

                  {/* Student Info Fields */}
                  <div className="grid grid-cols-3 gap-2 text-xs font-bold text-slate-700 text-right pb-2 border-b border-dashed border-slate-300">
                    <div>اسم الطالب: __________________</div>
                    <div>التاريخ: ___ / ___ / 2026</div>
                    <div>الوقت المستغرق: ____ دقيقة</div>
                  </div>

                  {/* Worksheet Puzzle Grid */}
                  <div className="flex justify-center py-2">
                    <div
                      className="grid bg-white p-2 border-4 border-slate-950 shadow-md aspect-square w-full max-w-[340px]"
                      style={{
                        gridTemplateColumns: `repeat(${selectedSize}, minmax(0, 1fr))`,
                        gridTemplateRows: `repeat(${selectedSize}, minmax(0, 1fr))`,
                      }}
                    >
                      {grid.map((row, rIdx) =>
                        row.map((val, cIdx) => {
                          const borderRight = (cIdx + 1) % boxCols === 0 && cIdx + 1 < selectedSize;
                          const borderBottom = (rIdx + 1) % boxRows === 0 && rIdx + 1 < selectedSize;
                          const isDiag = isDiagonalMode && (rIdx === cIdx || rIdx + cIdx === selectedSize - 1);

                          return (
                            <div
                              key={`${rIdx}-${cIdx}`}
                              className={`w-full h-full aspect-square flex items-center justify-center font-black text-xl border border-slate-400 ${
                                borderRight ? "border-r-4 border-r-slate-950" : ""
                              } ${borderBottom ? "border-b-4 border-b-slate-950" : ""} ${
                                isDiag ? "bg-slate-100" : "bg-white"
                              }`}
                            >
                              {val > 0 ? val : ""}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Optional Solution Key */}
                  {includePrintSolution && (
                    <div className="pt-4 border-t-2 border-dashed border-slate-400 space-y-2">
                      <div className="text-xs font-black text-emerald-800 text-right">
                        ✓ مفتاح الحل النموذجي (خاص بالمدرب):
                      </div>
                      <div className="flex justify-center">
                        <div
                          className="grid bg-emerald-50/50 p-1 border-2 border-emerald-800 aspect-square w-full max-w-[200px]"
                          style={{
                            gridTemplateColumns: `repeat(${selectedSize}, minmax(0, 1fr))`,
                            gridTemplateRows: `repeat(${selectedSize}, minmax(0, 1fr))`,
                          }}
                        >
                          {solution.map((row, rIdx) =>
                            row.map((val, cIdx) => (
                              <div
                                key={`sol-${rIdx}-${cIdx}`}
                                className="w-full h-full aspect-square flex items-center justify-center font-bold text-xs text-emerald-950 border border-emerald-200"
                              >
                                {val}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Trainer Evaluation & Notes */}
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-2 border-t border-slate-200">
                    <span>تقييم المدرب: ⭐ ⭐ ⭐ ⭐ ⭐</span>
                    <span>ملاحظات: ___________________________</span>
                  </div>
                </div>

                {/* Print Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowPrintModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
                  >
                    {isAr ? "إلغاء" : "Cancel"}
                  </button>

                  <button
                    onClick={() => {
                      playFx("correct");
                      window.print();
                    }}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center gap-2 active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{isAr ? "بدء الطباعة الآن / حفظ PDF" : "Print / Save PDF"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModuleLockedGate>
  );
}
