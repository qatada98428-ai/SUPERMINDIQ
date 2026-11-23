"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Grid,
  Lightbulb,
  Edit3,
  Eraser,
  ArrowRight,
  BookOpen,
  AlertCircle,
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
  findSmartHint,
  SudokuHint,
  SUDOKU_LESSONS,
} from "@/lib/sudoku/sudoku-engine";
import { getSupabaseClient } from "@/lib/supabase/client";
import ModuleLockedGate from "@/components/common/ModuleLockedGate";

type SudokuTab = "play" | "academy" | "daily";

export default function SudokuPage() {
  const { language, playFx } = useApp();
  const { user } = useAuth();
  const isAr = language === "ar";

  const [activeTab, setActiveTab] = useState<SudokuTab>("play");
  const [selectedSize, setSelectedSize] = useState<SudokuSize>(4);
  const [difficulty, setDifficulty] = useState<"easy" | "medium">("easy");

  // Game board state
  const [grid, setGrid] = useState<number[][]>([]);
  const [initialMask, setInitialMask] = useState<boolean[][]>([]);
  const [notes, setNotes] = useState<Record<string, number[]>>({});
  const [pencilMode, setPencilMode] = useState<boolean>(false);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [mistakes, setMistakes] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [activeHint, setActiveHint] = useState<SudokuHint | null>(null);

  // Timer
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(true);

  // Load Puzzle
  const loadPuzzle = useCallback((size: SudokuSize, diff: "easy" | "medium") => {
    let key = `${size}x${size}-${diff}`;
    if (!PRESET_PUZZLES[key]) key = `${size}x${size}-easy`;
    if (!PRESET_PUZZLES[key]) key = `${size}x${size}-medium`;
    if (!PRESET_PUZZLES[key]) key = "4x4-easy";

    const pz: SudokuPuzzle = PRESET_PUZZLES[key] || PRESET_PUZZLES["4x4-easy"];
    const initialG = pz.initialGrid.map((r) => [...r]);
    const mask = initialG.map((r) => r.map((c) => c !== 0));

    setGrid(initialG);
    setInitialMask(mask);
    setNotes({});
    setSelectedCell(null);
    setMistakes(0);
    setIsCompleted(false);
    setActiveHint(null);
    setTimerSeconds(0);
    setTimerRunning(true);
  }, []);

  const handleSizeChange = (newSize: SudokuSize) => {
    playFx("click");
    setSelectedSize(newSize);
    loadPuzzle(newSize, difficulty);
  };

  const handleDifficultyChange = (newDiff: "easy" | "medium") => {
    playFx("click");
    setDifficulty(newDiff);
    loadPuzzle(selectedSize, newDiff);
  };

  useEffect(() => {
    loadPuzzle(selectedSize, difficulty);
  }, [selectedSize, difficulty, loadPuzzle]);

  // Timer Interval
  useEffect(() => {
    if (!timerRunning || isCompleted) return;
    const interval = setInterval(() => {
      setTimerSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, isCompleted]);

  const currentPuzzleKey = `${selectedSize}x${selectedSize}-${difficulty}`;
  const currentPuzzle = PRESET_PUZZLES[currentPuzzleKey] || PRESET_PUZZLES["4x4-easy"];

  // Cell Click
  const handleCellClick = (r: number, c: number) => {
    playFx("click");
    setSelectedCell({ row: r, col: c });
  };

  // Number Input from keypad
  const handleNumberInput = (num: number) => {
    if (!selectedCell || isCompleted) return;
    const { row, col } = selectedCell;

    // Cannot edit initial clues
    if (initialMask[row] && initialMask[row][col]) return;

    if (pencilMode) {
      // Toggle note candidate
      const key = `${row}-${col}`;
      const existing = notes[key] || [];
      const updated = existing.includes(num)
        ? existing.filter((n) => n !== num)
        : [...existing, num].sort();
      setNotes((prev) => ({ ...prev, [key]: updated }));
      playFx("click");
      return;
    }

    // Direct Placement
    const isValid = isValidPlacement(grid, row, col, num, selectedSize);
    const nextGrid = grid.map((r) => [...r]);
    nextGrid[row][col] = num;
    setGrid(nextGrid);

    if (isValid && num === currentPuzzle.solution[row][col]) {
      playFx("click");

      // Check if board complete
      let allFilled = true;
      for (let r = 0; r < selectedSize; r++) {
        for (let c = 0; c < selectedSize; c++) {
          if (nextGrid[r][c] === 0 || nextGrid[r][c] !== currentPuzzle.solution[r][c]) {
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
              metadata: { size: selectedSize, difficulty, timeSeconds: timerSeconds },
            });
          }
        }
      }
    } else {
      playFx("wrong");
      setMistakes((m) => m + 1);
    }
  };

  // Erase Cell
  const handleErase = () => {
    if (!selectedCell || isCompleted) return;
    const { row, col } = selectedCell;
    if (initialMask[row] && initialMask[row][col]) return;

    playFx("click");
    const nextGrid = grid.map((r) => [...r]);
    nextGrid[row][col] = 0;
    setGrid(nextGrid);

    const key = `${row}-${col}`;
    if (notes[key]) {
      const nextNotes = { ...notes };
      delete nextNotes[key];
      setNotes(nextNotes);
    }
  };

  // Get Smart Hint
  const handleSmartHint = () => {
    if (isCompleted) return;
    playFx("bubble");
    const hint = findSmartHint(grid, currentPuzzle.solution, selectedSize);
    if (hint) {
      setActiveHint(hint);
      setSelectedCell({ row: hint.row, col: hint.col });
    }
  };

  // Apply Hint to board
  const applyHintValue = () => {
    if (!activeHint) return;
    playFx("correct");
    const nextGrid = grid.map((r) => [...r]);
    nextGrid[activeHint.row][activeHint.col] = activeHint.val;
    setGrid(nextGrid);
    setActiveHint(null);
  };

  const { boxRows, boxCols } = getBoxDimensions(selectedSize);

  // Format time mm:ss
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <ModuleLockedGate moduleId="sudoku" moduleNameAr="أكاديمية السودوكو" moduleIcon="🔢">
      <div className="min-h-screen bg-[#FAF8FF] dark:bg-[#0F0D1E] text-slate-800 dark:text-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Breadcrumb */}
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
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-xs">
              <Grid className="w-4 h-4" />
              <span>{isAr ? "المنطق والتركيز" : "Logic & Focus"}</span>
            </div>
          </div>
        </div>

        {/* Hero Title */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-700 via-indigo-600 to-violet-500 bg-clip-text text-transparent">
            {isAr ? "أكاديمية السودوكو 🔢" : "Sudoku Master Academy 🔢"}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            {isAr
              ? "برنامج تعليمي متكامل من الصفر إلى الاحتراف: شبكات 4×4 ميسرة للأطفال، شبكات 6×6، وشبكات 9×9 كلاسيكية مع تدوين الملاحظات والمساعد الذكي!"
              : "Full interactive course: 4x4 Mini for kids, 6x6 Midi, and 9x9 Classic with smart pencil candidates and reasoning hints!"}
          </p>
        </div>

        {/* Main Navigation Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-100 dark:bg-[#16132C] p-2 rounded-2xl border border-purple-100 dark:border-purple-900/40">
          {[
            { id: "play", label: isAr ? "اللعب والشبكات التفاعلية" : "Interactive Play Grid", icon: Grid },
            { id: "academy", label: isAr ? "دروس واستراتيجيات الحل" : "Academy Lessons", icon: BookOpen },
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
            <div className="lg:col-span-7 bg-white dark:bg-[#1C1A3A] p-6 sm:p-8 rounded-3xl shadow-xl border border-purple-100 dark:border-purple-900/50 space-y-6">
              {/* Header Controls: Size & Timer */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-50 dark:border-purple-900/30 pb-4">
                {/* Size & Difficulty Switcher */}
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
                </div>

                {/* Timer & Mistakes */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 font-mono font-bold text-xs text-purple-700 dark:text-purple-300">
                    <span>⏱ {formatTime(timerSeconds)}</span>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 font-bold text-xs text-rose-700 dark:text-rose-300">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{mistakes} / 3</span>
                  </div>
                </div>
              </div>

              {/* Sudoku Interactive Canvas */}
              <div className="flex justify-center py-2">
                <div
                  className="grid bg-[#231A4C] p-2 sm:p-3 rounded-2xl sm:rounded-3xl shadow-2xl border-4 border-purple-500/60 select-none overflow-hidden w-full max-w-[430px] aspect-square mx-auto"
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
                        const isSameNumber =
                          val > 0 && selectedCell && grid[selectedCell.row][selectedCell.col] === val;
                        const isHintTarget = activeHint?.row === rIdx && activeHint?.col === cIdx;

                        // Border logic for boxes
                        const borderRight = (cIdx + 1) % boxCols === 0 && cIdx + 1 < selectedSize;
                        const borderBottom = (rIdx + 1) % boxRows === 0 && rIdx + 1 < selectedSize;

                        let cellBg = "bg-white dark:bg-[#1E1B3E]";
                        if (isSelected) {
                          cellBg = "bg-purple-200 dark:bg-purple-800 text-purple-950 dark:text-white";
                        } else if (isHintTarget) {
                          cellBg = "bg-amber-200 dark:bg-amber-900/60 animate-pulse";
                        } else if (isSameNumber) {
                          cellBg = "bg-purple-100 dark:bg-purple-900/50";
                        } else if (isSameRowOrCol) {
                          cellBg = "bg-[#FAF8FF] dark:bg-[#16132C]";
                        }

                        const noteKey = `${rIdx}-${cIdx}`;
                        const cellNotes = notes[noteKey] || [];

                        return (
                          <button
                            key={`${rIdx}-${cIdx}`}
                            onClick={() => handleCellClick(rIdx, cIdx)}
                            className={`w-full h-full aspect-square flex items-center justify-center font-black transition-all relative border border-slate-200 dark:border-slate-800 ${cellBg} ${
                              borderRight ? "border-r-2 sm:border-r-4 border-r-purple-900 dark:border-r-purple-500" : ""
                            } ${
                              borderBottom ? "border-b-2 sm:border-b-4 border-b-purple-900 dark:border-b-purple-500" : ""
                            } ${
                              isInitial
                                ? "text-slate-900 dark:text-slate-100 font-black"
                                : "text-purple-600 dark:text-purple-400 font-bold"
                            } ${selectedSize === 9 ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl"}`}
                          >
                            {val > 0 ? (
                              val
                            ) : cellNotes.length > 0 ? (
                              <div className="grid grid-cols-3 gap-0.5 text-[8px] sm:text-[9px] text-slate-400 font-medium p-0.5">
                                {Array.from({ length: selectedSize }).map((_, i) => (
                                  <span key={i} className="flex items-center justify-center">
                                    {cellNotes.includes(i + 1) ? i + 1 : ""}
                                  </span>
                                ))}
                              </div>
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

              {/* Completion Banner */}
              {isCompleted && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-center font-bold text-sm space-y-2 animate-bounce">
                  <p>🏆 مبروك يا بطل! أتممت شبكة السودوكو بنجاح وذكاء فائق في {formatTime(timerSeconds)} دقيقة!</p>
                  <button
                    onClick={() => loadPuzzle(selectedSize, difficulty)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
                  >
                    {isAr ? "لعب لغز جديد" : "Play Another Puzzle"}
                  </button>
                </div>
              )}
            </div>

            {/* Right: Controls & Keypad (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Utility Tools */}
              <div className="bg-white dark:bg-[#1C1A3A] p-6 rounded-3xl shadow-xl border border-purple-100 dark:border-purple-900/50 space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {/* Pencil Notes Toggle */}
                  <button
                    onClick={() => {
                      playFx("click");
                      setPencilMode(!pencilMode);
                    }}
                    className={`p-3 rounded-2xl font-bold text-xs flex flex-col items-center gap-1.5 transition-all ${
                      pencilMode
                        ? "bg-purple-600 text-white shadow-md scale-102"
                        : "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100"
                    }`}
                  >
                    <Edit3 className="w-5 h-5" />
                    <span>{isAr ? "قلم المسودة" : "Pencil Notes"}</span>
                  </button>

                  {/* Smart Hint */}
                  <button
                    onClick={handleSmartHint}
                    className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 font-bold text-xs flex flex-col items-center gap-1.5 transition-all"
                  >
                    <Lightbulb className="w-5 h-5" />
                    <span>{isAr ? "مساعد ذكي" : "Smart Hint"}</span>
                  </button>

                  {/* Erase */}
                  <button
                    onClick={handleErase}
                    className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 font-bold text-xs flex flex-col items-center gap-1.5 transition-all"
                  >
                    <Eraser className="w-5 h-5" />
                    <span>{isAr ? "مسح" : "Erase"}</span>
                  </button>
                </div>

                {/* Keypad */}
                <div
                  className="grid gap-2 pt-2"
                  style={{
                    gridTemplateColumns: `repeat(${selectedSize === 4 ? 4 : selectedSize === 6 ? 3 : 3}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({ length: selectedSize }).map((_, idx) => {
                    const digit = idx + 1;
                    return (
                      <button
                        key={digit}
                        onClick={() => handleNumberInput(digit)}
                        className="py-4 rounded-2xl bg-white dark:bg-[#231F46] border-2 border-purple-100 dark:border-purple-800 text-xl font-black text-slate-800 dark:text-slate-100 shadow-md hover:border-purple-500 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                      >
                        {digit}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Smart Hint Explanation Card */}
              {activeHint && (
                <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      <span>{activeHint.techniqueAr}</span>
                    </span>
                    <button
                      onClick={applyHintValue}
                      className="px-3 py-1 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600"
                    >
                      {isAr ? "تطبيق الرقم" : "Fill Cell"}
                    </button>
                  </div>
                  <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                    {activeHint.explanationAr}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: SUDOKU ACADEMY LESSONS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "academy" && (
          <div className="space-y-6">
            {SUDOKU_LESSONS.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-white dark:bg-[#1C1A3A] p-6 sm:p-8 rounded-3xl shadow-xl border border-purple-100 dark:border-purple-900/50 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-black flex items-center justify-center text-base">
                    {lesson.id}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-purple-900 dark:text-purple-200">
                      {lesson.titleAr}
                    </h3>
                    <p className="text-xs text-slate-500">{lesson.summaryAr}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {lesson.steps.map((st, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-[#FAF8FF] dark:bg-[#141228] border border-purple-100 dark:border-purple-900/40 space-y-2"
                    >
                      <div className="font-bold text-xs text-purple-700 dark:text-purple-300">
                        📌 {st.ruleAr}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-[#201C3E] p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        💡 <strong>نصيحة ذهبية:</strong> {st.tipAr}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </ModuleLockedGate>
  );
}
