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
  Sparkles,
  RefreshCw,
  X,
  Check,
  Dices,
  Printer,
  HelpCircle,
  Calendar,
  Flame,
  Zap,
  Play,
  Pause,
  Target,
  Trophy,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import ClayIcon from "@/components/design-system/ClayIcon";
import SmartHintModal from "@/components/sudoku/SmartHintModal";
import {
  SudokuSize,
  SudokuDifficulty,
  SUDOKU_DIFFICULTIES,
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
  SudokuSmartHintStep,
  generateDynamicPuzzle,
  generateDailyPuzzle,
  getDailyDateString,
  calculateAllCandidates,
  evaluateKillerCages,
  PRESET_KILLER_PUZZLES,
  KillerSudokuPuzzle,
  SUDOKU_RULES_GUIDE,
  INTERACTIVE_SUDOKU_LESSONS,
  InteractiveSudokuLesson,
} from "@/lib/sudoku/sudoku-engine";
import { getSupabaseClient } from "@/lib/supabase/client";
import ModuleLockedGate from "@/components/common/ModuleLockedGate";

type SudokuTab = "play" | "daily" | "killer" | "academy";

interface MoveHistory {
  row: number;
  col: number;
  prevVal: number;
  nextVal: number;
  prevNotes: Record<string, number[]>;
}

const STORAGE_ACTIVE_GAME_KEY = "supermind_sudoku_active_game";
const STORAGE_DAILY_RECORDS_KEY = "supermind_sudoku_daily_records";

export default function SudokuPage() {
  const { language, playFx } = useApp();
  const { user } = useAuth();
  const isAr = language === "ar";

  const [activeTab, setActiveTab] = useState<SudokuTab>("play");
  const [selectedSize, setSelectedSize] = useState<SudokuSize>(9);
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>("beginner");
  const [isDiagonalMode, setIsDiagonalMode] = useState<boolean>(false);
  const [maxMistakes, setMaxMistakes] = useState<number | null>(3); // 3, 5, 10, or null for unlimited

  // Game board state
  const [grid, setGrid] = useState<number[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [initialMask, setInitialMask] = useState<boolean[][]>([]);
  const [notes, setNotes] = useState<Record<string, number[]>>({});
  const [pencilMode, setPencilMode] = useState<boolean>(false);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [mistakes, setMistakes] = useState<number>(0);
  const [practiceMode, setPracticeMode] = useState<boolean>(false); // when true, ignores 3 mistakes limit
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [activeHint, setActiveHint] = useState<SudokuHint | null>(null);
  const [activeHintStep, setActiveHintStep] = useState<SudokuSmartHintStep | null>(null);
  const [isSmartHintOpen, setIsSmartHintOpen] = useState<boolean>(false);
  const [conflictAlert, setConflictAlert] = useState<SudokuConflict | null>(null);
  const [history, setHistory] = useState<MoveHistory[]>([]);

  // Keypad selected number filter
  const [highlightedDigit, setHighlightedDigit] = useState<number | null>(null);

  // Modals & Pause State
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showGameOverModal, setShowGameOverModal] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [hasSavedGame, setHasSavedGame] = useState<boolean>(false);

  // Timer
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(true);

  // Daily Challenge State
  const todayStr = useMemo(() => getDailyDateString(), []);
  const [completedDailyDates, setCompletedDailyDates] = useState<string[]>([]);
  const [currentStreak, setCurrentStreak] = useState<number>(0);

  // Killer Sudoku State
  const [killerPuzzle, setKillerPuzzle] = useState<KillerSudokuPuzzle>(PRESET_KILLER_PUZZLES["killer-6x6"]);

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

  // Load Daily records from storage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const recordsStr = localStorage.getItem(STORAGE_DAILY_RECORDS_KEY);
      if (recordsStr) {
        const data = JSON.parse(recordsStr);
        setCompletedDailyDates(data.completedDates || []);
        setCurrentStreak(data.currentStreak || 0);
      }

      // Check if an active game is saved and validate integrity
      const savedStr = localStorage.getItem(STORAGE_ACTIVE_GAME_KEY);
      if (savedStr) {
        const saved = JSON.parse(savedStr);
        const hasZerosInSol = saved?.solution?.some((r: number[]) => r.some((c: number) => c === 0));
        if (saved && saved.grid && !saved.isCompleted && !hasZerosInSol && saved.solution?.length > 0) {
          setHasSavedGame(true);
        } else {
          // Clean up any corrupted or legacy invalid game state
          localStorage.removeItem(STORAGE_ACTIVE_GAME_KEY);
          setHasSavedGame(false);
        }
      }
    } catch (e) {
      console.warn("Storage load error:", e);
    }
  }, []);

  // Load / Generate Dynamic Puzzle
  const loadPuzzle = useCallback(
    (size: SudokuSize, diff: SudokuDifficulty, diagonal: boolean, usePreset: boolean = false) => {
      let pz: SudokuPuzzle;

      if (usePreset) {
        const key = `${size}x${size}-${diff}`;
        pz = PRESET_PUZZLES[key] || PRESET_PUZZLES["9x9-easy"];
      } else {
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
      setPracticeMode(false);
      setShowGameOverModal(false);
      setIsCompleted(false);
      setActiveHint(null);
      setActiveHintStep(null);
      setIsSmartHintOpen(false);
      setConflictAlert(null);
      setHistory([]);
      setTimerSeconds(0);
      setTimerRunning(true);
      setIsPaused(false);
    },
    []
  );

  // Load Daily Challenge Puzzle
  const loadDailyChallenge = useCallback(() => {
    const pz = generateDailyPuzzle(todayStr, 9);
    const initialG = pz.initialGrid.map((r) => [...r]);
    const mask = initialG.map((r) => r.map((c) => c !== 0));

    setSelectedSize(9);
    setDifficulty("medium");
    setIsDiagonalMode(false);
    setGrid(initialG);
    setSolution(pz.solution);
    setInitialMask(mask);
    setNotes({});
    setSelectedCell(null);
    setHighlightedDigit(null);
    setMistakes(0);
    setPracticeMode(false);
    setShowGameOverModal(false);
    setIsCompleted(completedDailyDates.includes(todayStr));
    setActiveHint(null);
    setActiveHintStep(null);
    setConflictAlert(null);
    setHistory([]);
    setTimerSeconds(0);
    setTimerRunning(true);
    setIsPaused(false);
  }, [todayStr, completedDailyDates]);

  // Load Killer Sudoku Puzzle
  const loadKillerPuzzle = useCallback(() => {
    const kPz = PRESET_KILLER_PUZZLES["killer-6x6"];
    setKillerPuzzle(kPz);
    setSelectedSize(kPz.size);
    setDifficulty(kPz.difficulty);
    setIsDiagonalMode(false);

    const initialG = kPz.initialGrid.map((r) => [...r]);
    const mask = initialG.map((r) => r.map((c) => c !== 0));

    setGrid(initialG);
    setSolution(kPz.solution);
    setInitialMask(mask);
    setNotes({});
    setSelectedCell(null);
    setHighlightedDigit(null);
    setMistakes(0);
    setPracticeMode(false);
    setShowGameOverModal(false);
    setIsCompleted(false);
    setActiveHint(null);
    setActiveHintStep(null);
    setConflictAlert(null);
    setHistory([]);
    setTimerSeconds(0);
    setTimerRunning(true);
    setIsPaused(false);
  }, []);

  // Auto-Save Active Game
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (grid.length === 0 || isCompleted) return;

    try {
      const stateToSave = {
        grid,
        solution,
        initialMask,
        notes,
        mistakes,
        maxMistakes,
        practiceMode,
        timerSeconds,
        difficulty,
        selectedSize,
        isDiagonalMode,
        activeTab,
        isCompleted: false,
      };
      localStorage.setItem(STORAGE_ACTIVE_GAME_KEY, JSON.stringify(stateToSave));
    } catch {
      // ignore storage errors
    }
  }, [grid, solution, initialMask, notes, mistakes, maxMistakes, practiceMode, timerSeconds, difficulty, selectedSize, isDiagonalMode, activeTab, isCompleted]);

  // Restore Saved Game
  const handleRestoreSavedGame = () => {
    if (typeof window === "undefined") return;
    try {
      const savedStr = localStorage.getItem(STORAGE_ACTIVE_GAME_KEY);
      if (!savedStr) return;
      const saved = JSON.parse(savedStr);
      const hasZerosInSol = saved?.solution?.some((r: number[]) => r.some((c: number) => c === 0));
      if (saved && saved.grid && !hasZerosInSol && saved.solution?.length > 0) {
        playFx("pop");
        setGrid(saved.grid);
        setSolution(saved.solution);
        setInitialMask(saved.initialMask);
        setNotes(saved.notes || {});
        setMistakes(saved.mistakes || 0);
        if (saved.maxMistakes !== undefined) {
          setMaxMistakes(saved.maxMistakes);
        }
        if (saved.practiceMode !== undefined) {
          setPracticeMode(saved.practiceMode);
        }
        setTimerSeconds(saved.timerSeconds || 0);
        setDifficulty(saved.difficulty || "beginner");
        setSelectedSize(saved.selectedSize || 9);
        setIsDiagonalMode(saved.isDiagonalMode || false);
        setActiveTab(saved.activeTab || "play");
        setHasSavedGame(false);
        setTimerRunning(true);
        setIsPaused(false);
      } else {
        localStorage.removeItem(STORAGE_ACTIVE_GAME_KEY);
        setHasSavedGame(false);
      }
    } catch (e) {
      console.warn("Restore error:", e);
    }
  };

  const handleDismissSavedGame = () => {
    playFx("click");
    setHasSavedGame(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_ACTIVE_GAME_KEY);
    }
  };

  // Initial load
  useEffect(() => {
    if (activeTab === "play") {
      loadPuzzle(selectedSize, difficulty, isDiagonalMode, false);
    } else if (activeTab === "daily") {
      loadDailyChallenge();
    } else if (activeTab === "killer") {
      loadKillerPuzzle();
    }
  }, [activeTab, selectedSize, difficulty, isDiagonalMode, loadPuzzle, loadDailyChallenge, loadKillerPuzzle]);

  const handleSizeChange = (newSize: SudokuSize) => {
    playFx("click");
    setSelectedSize(newSize);
    loadPuzzle(newSize, difficulty, isDiagonalMode);
  };

  const handleDifficultyChange = (newDiff: SudokuDifficulty) => {
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
    setActiveHintStep(null);
    setHistory([]);
    setMistakes(0);
    setTimerSeconds(0);
    setIsPaused(false);
    setTimerRunning(true);
  };

  // Timer Interval (pauses when isPaused or isCompleted)
  useEffect(() => {
    if (!timerRunning || isCompleted || isPaused) return;
    const interval = setInterval(() => {
      setTimerSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, isCompleted, isPaused]);

  // Remaining counts for keypad
  const remainingCounts = useMemo(() => {
    return getRemainingDigitCounts(grid, selectedSize);
  }, [grid, selectedSize]);

  // Fast Pencil: Auto-fills all candidate notes across empty cells
  const handleFastPencil = () => {
    if (isCompleted || isPaused) return;
    playFx("pop");
    const allNotes = calculateAllCandidates(grid, selectedSize, isDiagonalMode);
    setNotes(allNotes);
  };

  // Cell Click in main play grid
  const handleCellClick = (r: number, c: number) => {
    if (isPaused) return;
    playFx("click");
    setSelectedCell({ row: r, col: c });
    const cellVal = grid[r]?.[c];
    if (cellVal && cellVal > 0) {
      setHighlightedDigit(cellVal);
    } else {
      setHighlightedDigit(null);
    }
  };

  // Keypad Number Input
  const handleNumberInput = (num: number) => {
    if (isPaused || isCompleted) return;
    setHighlightedDigit(num);

    if (!selectedCell) return;
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
      const nextM = mistakes + 1;
      setMistakes(nextM);
      if (maxMistakes !== null && nextM >= maxMistakes && !practiceMode) {
        setShowGameOverModal(true);
        setTimerRunning(false);
      }
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

        // Clear active save on win
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_ACTIVE_GAME_KEY);
        }

        // Daily Challenge Completion Handling
        if (activeTab === "daily") {
          const nextCompleted = Array.from(new Set([...completedDailyDates, todayStr]));
          const nextStreak = currentStreak + 1;
          setCompletedDailyDates(nextCompleted);
          setCurrentStreak(nextStreak);
          if (typeof window !== "undefined") {
            localStorage.setItem(
              STORAGE_DAILY_RECORDS_KEY,
              JSON.stringify({
                completedDates: nextCompleted,
                currentStreak: nextStreak,
              })
            );
          }
        }

        if (user) {
          const supabase = getSupabaseClient();
          if (supabase) {
            void supabase.from("training_sessions").insert({
              user_id: user.id,
              session_type: "sudoku",
              status: "completed",
              score: Math.max(10, selectedSize * 100 - mistakes * 25),
              metadata: {
                size: selectedSize,
                difficulty,
                isDiagonal: isDiagonalMode,
                isDaily: activeTab === "daily",
                timeSeconds: timerSeconds,
              },
            });
          }
        }
      }
    } else {
      playFx("wrong");
      const nextM = mistakes + 1;
      setMistakes(nextM);
      if (maxMistakes !== null && nextM >= maxMistakes && !practiceMode) {
        setShowGameOverModal(true);
        setTimerRunning(false);
      }
    }
  };

  // Undo Last Move
  const handleUndo = () => {
    if (history.length === 0 || isCompleted || isPaused) return;
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
    if (!selectedCell || isCompleted || isPaused) return;
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

  // Open 3-Step Smart Hint
  const handleSmartHint = () => {
    if (isCompleted || isPaused) return;
    playFx("bubble");
    const hint = findSmartHint(grid, solution, selectedSize, isDiagonalMode);
    if (hint) {
      setActiveHint(hint);
      setIsSmartHintOpen(true);
      setSelectedCell({ row: hint.row, col: hint.col });
      setHighlightedDigit(hint.val);
    }
  };

  // Keyboard handlers ref to avoid unnecessary listener re-attachments
  const keyboardHandlersRef = useRef({ handleNumberInput, handleErase, handleUndo });
  keyboardHandlersRef.current = { handleNumberInput, handleErase, handleUndo };

  // Keyboard Shortcut Support (1-9, Numpad, Backspace, Delete, Arrows, Notes, Undo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        showGameOverModal ||
        showRulesModal ||
        showPrintModal ||
        isSmartHintOpen ||
        isPaused
      ) {
        return;
      }

      // Check number keys '1' - '9' or Numpad '1' - '9'
      let digit: number | null = null;
      if (e.key >= "1" && e.key <= "9") {
        digit = parseInt(e.key, 10);
      } else if (e.code && e.code.startsWith("Numpad") && e.code.length === 7) {
        const num = parseInt(e.code.replace("Numpad", ""), 10);
        if (num >= 1 && num <= 9) digit = num;
      }

      if (digit !== null && digit <= selectedSize) {
        e.preventDefault();
        keyboardHandlersRef.current.handleNumberInput(digit);
        return;
      }

      // Erase / Delete
      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        keyboardHandlersRef.current.handleErase();
        return;
      }

      // Toggle Notes ('n' or 'N')
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        setPencilMode((prev) => !prev);
        return;
      }

      // Undo ('z' or Ctrl+Z)
      if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        keyboardHandlersRef.current.handleUndo();
        return;
      }

      // Arrow navigation
      if (selectedCell) {
        let { row, col } = selectedCell;
        if (e.key === "ArrowUp") {
          e.preventDefault();
          row = Math.max(0, row - 1);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          row = Math.min(selectedSize - 1, row + 1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          col = isAr ? Math.min(selectedSize - 1, col + 1) : Math.max(0, col - 1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          col = isAr ? Math.max(0, col - 1) : Math.min(selectedSize - 1, col + 1);
        } else {
          return;
        }
        setSelectedCell({ row, col });
        const cellVal = grid[row]?.[col];
        setHighlightedDigit(cellVal > 0 ? cellVal : null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedCell,
    selectedSize,
    grid,
    pencilMode,
    isAr,
    showGameOverModal,
    showRulesModal,
    showPrintModal,
    isSmartHintOpen,
    isPaused,
  ]);

  // Apply Hint to board
  const applyHintValue = (row: number, col: number, val: number) => {
    playFx("correct");
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
    setActiveHintStep(null);
    setIsSmartHintOpen(false);
  };

  // Academy Lesson Interactive Input
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

  // Killer Sudoku Cage Evaluation
  const killerEvaluation = useMemo(() => {
    if (activeTab !== "killer" || !killerPuzzle) return null;
    return evaluateKillerCages(grid, killerPuzzle.cages);
  }, [activeTab, killerPuzzle, grid]);

  return (
    <ModuleLockedGate moduleId="sudoku" moduleNameAr="أكاديمية السودوكو" moduleIcon="🔢">
      <div className="min-h-screen bg-[#FAF8FF] dark:bg-[#0F0D1E] text-slate-800 dark:text-slate-100 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-7">
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
                <span>{isAr ? "منظومة السودوكو الذكية" : "Smart Sudoku System"}</span>
              </div>
            </div>

            {/* Quick Action Badges: Rules & Print */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playFx("click");
                  setShowRulesModal(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-100 transition-all border border-purple-200/50"
              >
                <HelpCircle className="w-4 h-4 text-purple-600" />
                <span>{isAr ? "دليل القواعد" : "Rules"}</span>
              </button>

              <button
                type="button"
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

          {/* Saved Game Resume Alert Banner */}
          {hasSavedGame && (
            <div className="clay-card !p-3.5 bg-gradient-to-r from-brand-50 via-indigo-50 to-purple-50 dark:from-brand-950/70 dark:via-indigo-950/70 dark:to-purple-950/70 border-2 border-brand-300 dark:border-brand-700 rounded-2xl flex items-center justify-between gap-3 shadow-md animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-brand-600 animate-spin" />
                <div>
                  <h4 className="text-xs font-black text-[#261E58] dark:text-[#F3F0FD]">
                    توجد لعبة سودوكو محفوظة سابقة!
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    يمكنك مواصلة حل اللغز من حيث توقفت بدون فقدان تقدمك.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRestoreSavedGame}
                  className="clay-btn-purple py-1.5 px-3 text-xs font-black !rounded-xl"
                >
                  استئناف اللعب ⏯️
                </button>
                <button
                  type="button"
                  onClick={handleDismissSavedGame}
                  className="clay-pill py-1.5 px-2.5 text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  تجاهل
                </button>
              </div>
            </div>
          )}

          {/* Hero Section */}
          <div className="text-center max-w-xl mx-auto space-y-2 pt-1">
            <div className="flex items-center justify-center gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-violet-600 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/25 border border-purple-300/30 text-white select-none shrink-0">
                🔢
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {isAr ? "سودوكو العقل الخارق" : "Super Mind Sudoku"}
              </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
              {isAr
                ? "تحديات يومية وتدريب ذكي بمستويات متدرجة من المبتدئ إلى الاحتراف"
                : "Smart daily challenges & progressive puzzles from Beginner to Master"}
            </p>
          </div>

          {/* Main Navigation Tabs: 4 Tabs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 bg-slate-100 dark:bg-[#16132C] p-1.5 rounded-2xl border border-purple-100 dark:border-purple-900/40">
            {[
              { id: "play", label: isAr ? "السودوكو الكلاسيكي" : "Classic Play", icon: Grid, badge: "9×9 / 6×6" },
              { id: "daily", label: isAr ? "التحدي اليومي" : "Daily Challenge", icon: Calendar, badge: currentStreak > 0 ? `🔥 ${currentStreak}` : "يومي" },
              { id: "killer", label: isAr ? "سودوكو القاتل" : "Killer Sudoku", icon: Target, badge: "جديد 🎯" },
              { id: "academy", label: isAr ? "الدروس التطبيقية" : "Academy Lessons", icon: BookOpen, badge: "5 دروس" },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    playFx("click");
                    setActiveTab(tab.id as SudokuTab);
                  }}
                  className={`flex items-center justify-between gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs transition-all duration-200 ${
                    active
                      ? "bg-white dark:bg-[#231F46] text-purple-700 dark:text-purple-300 shadow-md scale-[1.01] border border-purple-200 dark:border-purple-800"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${active ? "text-purple-600" : ""}`} />
                    <span className="truncate">{tab.label}</span>
                  </div>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                    active
                      ? "bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300"
                      : "bg-slate-200/60 dark:bg-slate-800 text-slate-500"
                  }`}>
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ============================================================= */}
          {/* TAB 1 & 2 & 3: SUDOKU GAMEPLAY CANVAS (CLASSIC / DAILY / KILLER) */}
          {/* ============================================================= */}
          {(activeTab === "play" || activeTab === "daily" || activeTab === "killer") && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
              {/* Left Column: Board Canvas (7 cols) */}
              <div className="lg:col-span-7 bg-white dark:bg-[#1C1A3A] p-4 sm:p-6 rounded-3xl shadow-xl border border-purple-100 dark:border-purple-900/50 space-y-4">
                {/* Header Controls: Modes, Difficulties, Timers, Mistakes */}
                <div className="space-y-3 border-b border-purple-50 dark:border-purple-900/30 pb-3.5">
                  {/* Row 1: Mode specifics */}
                  {activeTab === "play" && (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {/* Grid Size Switcher */}
                      <div className="flex items-center gap-1 bg-purple-50 dark:bg-purple-900/30 p-1 rounded-xl">
                        {[
                          { sz: 4 as SudokuSize, label: isAr ? "4×4 براعم" : "4x4 Mini" },
                          { sz: 6 as SudokuSize, label: isAr ? "6×6 أطفال" : "6x6 Midi" },
                          { sz: 9 as SudokuSize, label: isAr ? "9×9 كلاسيك" : "9x9 Classic" },
                        ].map((item) => (
                          <button
                            key={item.sz}
                            type="button"
                            onClick={() => handleSizeChange(item.sz)}
                            className={`px-2.5 py-1.5 rounded-lg font-bold text-xs transition-all ${
                              selectedSize === item.sz
                                ? "bg-purple-600 text-white shadow-sm"
                                : "text-purple-700 dark:text-purple-300 hover:bg-white/50"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>

                      {/* Sudoku X (Diagonal Mode) Toggle */}
                      <button
                        type="button"
                        onClick={handleDiagonalToggle}
                        className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 border ${
                          isDiagonalMode
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm ring-2 ring-indigo-400 border-indigo-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-indigo-50"
                        }`}
                        title={isAr ? "تفعيل شرط القطرين (سودوكو X)" : "Toggle Diagonal Sudoku X"}
                      >
                        <span>❌</span>
                        <span>{isAr ? "نمط X القطري" : "Sudoku X"}</span>
                      </button>
                    </div>
                  )}

                  {/* Daily Banner Info */}
                  {activeTab === "daily" && (
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-300/80 dark:border-amber-700/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-600" />
                        <span className="font-black text-slate-800 dark:text-slate-100">
                          لغز اليوم: {todayStr}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-800 dark:text-amber-200 font-black">
                        <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                        <span>سلسلة الأيام: {currentStreak}</span>
                      </div>
                    </div>
                  )}

                  {/* Killer Sudoku Banner Info */}
                  {activeTab === "killer" && (
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 border border-purple-300/80 dark:border-purple-700/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-purple-600" />
                        <span className="font-black text-slate-800 dark:text-slate-100">
                          سودوكو القاتل 6×6 — اجمع أرقام الأقفاص بدون تكرار!
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 dark:bg-purple-900/60 dark:text-purple-200">
                        18 قفصاً
                      </span>
                    </div>
                  )}

                  {/* 6 Difficulty Levels Strip (Available in Play mode) */}
                  {activeTab === "play" && (
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 pt-0.5">
                      {SUDOKU_DIFFICULTIES.map((d) => {
                        const isSelected = difficulty === d.id;
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => handleDifficultyChange(d.id)}
                            className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1 shrink-0 ${
                              isSelected
                                ? "bg-brand-600 text-white shadow-sm ring-1 ring-brand-400"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                            }`}
                            title={d.descriptionAr}
                          >
                            <span>{d.icon}</span>
                            <span>{d.labelAr}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Timer, Pause & Mistakes Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    {/* Timer + Pause Button */}
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-900/40 font-mono font-bold text-xs text-purple-700 dark:text-purple-300">
                        <span>⏱ {formatTime(timerSeconds)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          playFx("click");
                          setIsPaused(!isPaused);
                        }}
                        className="clay-pill p-1.5 text-slate-600 dark:text-slate-300 hover:text-brand-600"
                        title={isPaused ? "استئناف" : "إيقاف مؤقت"}
                      >
                        {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" /> : <Pause className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Mistakes Counter & Allowed Limit Selector */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 font-bold text-xs text-rose-700 dark:text-rose-300">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {maxMistakes === null || practiceMode
                            ? `أخطاء: ${mistakes} (حر)`
                            : `الأخطاء: ${mistakes} / ${maxMistakes}`}
                        </span>
                      </div>

                      {/* Mistakes Limit Options */}
                      <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-[11px] font-black border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 px-1 hidden sm:inline">{isAr ? "الحد:" : "Limit:"}</span>
                        {[
                          { val: 3, label: "3" },
                          { val: 5, label: "5" },
                          { val: 10, label: "10" },
                          { val: null, label: "∞" },
                        ].map((opt) => (
                          <button
                            key={String(opt.val)}
                            type="button"
                            onClick={() => {
                              playFx("click");
                              setMaxMistakes(opt.val);
                              setPracticeMode(opt.val === null);
                            }}
                            className={`px-1.5 py-0.5 rounded-lg transition-all ${
                              maxMistakes === opt.val
                                ? "bg-rose-500 text-white shadow-sm"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            }`}
                            title={opt.val === null ? (isAr ? "بدون حدود للأخطاء (تدريب حر)" : "Unlimited practice") : (isAr ? `الحد الأقصى للأخطاء: ${opt.val}` : `Max ${opt.val} mistakes`)}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generator Action Bar */}
                <div className="flex items-center justify-between gap-2 bg-[#FAF8FF] dark:bg-[#141228] p-2.5 rounded-2xl border border-purple-100 dark:border-purple-900/40 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-bold">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="hidden sm:inline">الحالة:</span>
                    <span className="text-purple-700 dark:text-purple-300 font-black">
                      {isCompleted ? "مكتمل بنجاح 🏆" : isPaused ? "متوقف مؤقتاً ⏸️" : "جاهز للعب"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeTab === "play" && (
                      <button
                        type="button"
                        onClick={handleNewRandomPuzzle}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
                      >
                        <Dices className="w-3.5 h-3.5" />
                        <span>{isAr ? "لغز جديد" : "New"}</span>
                      </button>
                    )}

                    <button
                      type="button"
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
                      type="button"
                      onClick={() => setConflictAlert(null)}
                      className="p-1 rounded-lg hover:bg-white/20 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Sudoku Interactive Canvas or Pause Overlay */}
                <div className="relative flex justify-center py-1">
                  {isPaused && (
                    <div className="absolute inset-0 z-30 bg-[#16132C]/90 backdrop-blur-md rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center p-6 text-center space-y-3">
                      <Pause className="w-10 h-10 text-amber-400 animate-bounce" />
                      <h4 className="text-base font-black text-white">اللعبة متوقفة مؤقتاً ⏸️</h4>
                      <p className="text-xs text-slate-300 max-w-xs">
                        تم إيقاف المؤقت وإخفاء الأرقام مؤقتاً. انقر لمتابعة التحدي!
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          playFx("pop");
                          setIsPaused(false);
                        }}
                        className="clay-btn-purple py-2 px-5 text-xs font-black !rounded-xl"
                      >
                        متابعة اللعب الآن ⏯️
                      </button>
                    </div>
                  )}

                  <div
                    className="grid bg-[#231A4C] p-2 sm:p-3 rounded-2xl sm:rounded-3xl shadow-2xl border-4 border-purple-600/70 select-none overflow-hidden w-full max-w-[360px] sm:max-w-[420px] aspect-square mx-auto"
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

                          // 3-Step Smart Hint highlights
                          const isHintStepTarget =
                            activeHintStep?.highlightCells?.some(
                              (hc) => hc.row === rIdx && hc.col === cIdx && hc.kind === "target"
                            );
                          const isHintStepFocus =
                            activeHintStep?.highlightCells?.some(
                              (hc) => hc.row === rIdx && hc.col === cIdx && hc.kind === "focus"
                            );
                          const isHintStepBlocking =
                            activeHintStep?.highlightCells?.some(
                              (hc) => hc.row === rIdx && hc.col === cIdx && hc.kind === "blocking"
                            );
                          const isHintRow = activeHintStep?.highlightRows?.includes(rIdx);
                          const isHintCol = activeHintStep?.highlightCols?.includes(cIdx);
                          const isHintBox =
                            activeHintStep?.highlightBox &&
                            rIdx >= activeHintStep.highlightBox.startRow &&
                            rIdx <= activeHintStep.highlightBox.endRow &&
                            cIdx >= activeHintStep.highlightBox.startCol &&
                            cIdx <= activeHintStep.highlightBox.endCol;

                          // Conflict cells highlight
                          const isConflicting =
                            conflictAlert &&
                            conflictAlert.conflictingCells.some(
                              (cell) => cell.row === rIdx && cell.col === cIdx
                            );

                          // Sub-box borders
                          const borderRight = (cIdx + 1) % boxCols === 0 && cIdx + 1 < selectedSize;
                          const borderBottom = (rIdx + 1) % boxRows === 0 && rIdx + 1 < selectedSize;

                          // Killer Sudoku Cage Info for this cell
                          const cage =
                            activeTab === "killer" && killerPuzzle
                              ? killerPuzzle.cages.find((cg) =>
                                  cg.cells.some((cell) => cell.row === rIdx && cell.col === cIdx)
                                )
                              : null;
                          const isCageTopLeft =
                            cage && cage.cells[0]?.row === rIdx && cage.cells[0]?.col === cIdx;

                          // Background coloring logic
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
                          } else if (isHintStepTarget) {
                            cellBg = "bg-emerald-300 dark:bg-emerald-600 text-emerald-950 dark:text-white ring-2 ring-emerald-500 animate-bounce";
                          } else if (isHintStepBlocking) {
                            cellBg = "bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 ring-1 ring-rose-400";
                          } else if (isHintStepFocus) {
                            cellBg = "bg-amber-200 dark:bg-amber-700/80 text-amber-950 dark:text-amber-100 ring-2 ring-amber-400";
                          } else if (isSameNumber) {
                            cellBg = "bg-purple-200 dark:bg-purple-900/90 text-purple-950 dark:text-purple-100 font-black ring-1 ring-purple-400";
                          } else if (isHintRow || isHintCol || isHintBox) {
                            cellBg = "bg-amber-50/80 dark:bg-amber-950/30";
                          } else if (isSameRowOrCol || isInBox) {
                            cellBg = "bg-[#ECE6FF] dark:bg-[#201C45]";
                          }

                          const noteKey = `${rIdx}-${cIdx}`;
                          const cellNotes = notes[noteKey] || [];

                          return (
                            <button
                              key={`${rIdx}-${cIdx}`}
                              type="button"
                              onClick={() => handleCellClick(rIdx, cIdx)}
                              className={`w-full h-full aspect-square flex items-center justify-center font-black transition-all relative border border-slate-300/60 dark:border-slate-800/80 ${cellBg} ${
                                borderRight ? "border-r-2 sm:border-r-4 border-r-purple-950 dark:border-r-purple-400" : ""
                              } ${
                                borderBottom ? "border-b-2 sm:border-b-4 border-b-purple-950 dark:border-b-purple-400" : ""
                              } ${cage ? cage.colorClass : ""} ${
                                isInitial
                                  ? "text-slate-900 dark:text-slate-100 font-black"
                                  : "text-purple-600 dark:text-purple-400 font-extrabold"
                              } ${selectedSize === 9 ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl"}`}
                            >
                              {/* Killer Sudoku Target Sum in Top Left */}
                              {isCageTopLeft && (
                                <span className="absolute top-0.5 start-1 text-[9px] font-black text-purple-800 dark:text-purple-200 leading-none">
                                  {cage.sum}
                                </span>
                              )}

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

                {/* Mobile & Tablet In-Canvas Quick Keypad & Tools (visible on < lg screens) */}
                <div className="block lg:hidden space-y-2.5 pt-1 border-t border-purple-50 dark:border-purple-900/30">
                  {/* Quick Keypad Row */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold px-1">
                      <span className="text-slate-700 dark:text-slate-300 font-black">{isAr ? "لوحة الأرقام السريعة:" : "Quick Keypad:"}</span>
                      {pencilMode && (
                        <span className="text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1 text-[10px]">
                          <Edit3 className="w-3 h-3" />
                          <span>{isAr ? "وضع المسودة نشط" : "Notes Active"}</span>
                        </span>
                      )}
                    </div>

                    <div
                      className="grid gap-1 sm:gap-1.5"
                      style={{
                        gridTemplateColumns: `repeat(${selectedSize}, minmax(0, 1fr))`,
                      }}
                    >
                      {Array.from({ length: selectedSize }).map((_, idx) => {
                        const digit = idx + 1;
                        const remaining = remainingCounts[digit] ?? 0;
                        const isDone = remaining === 0;
                        const isHighlighted = highlightedDigit === digit;

                        return (
                          <button
                            key={`mobile-key-${digit}`}
                            type="button"
                            onClick={() => handleNumberInput(digit)}
                            className={`py-2 px-1 rounded-xl border transition-all flex flex-col items-center justify-center select-none active:scale-95 ${
                              isDone
                                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 opacity-60"
                                : isHighlighted
                                ? "bg-purple-100 dark:bg-purple-900/60 border-purple-500 shadow-sm ring-1 ring-purple-400"
                                : "bg-white dark:bg-[#231F46] border-purple-100 dark:border-purple-800 hover:border-purple-400 shadow-sm"
                            }`}
                          >
                            <span className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 leading-none">
                              {digit}
                            </span>
                            <span className="text-[9px] font-bold mt-0.5 leading-none">
                              {isDone ? (
                                <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                              ) : (
                                <span className="text-slate-400 dark:text-slate-500">{remaining}</span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Action Tools Strip (Mobile) */}
                  <div className="grid grid-cols-5 gap-1.5 pt-0.5">
                    {/* Undo */}
                    <button
                      type="button"
                      onClick={handleUndo}
                      disabled={history.length === 0}
                      className="py-2 px-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-bold text-[11px] flex flex-col items-center gap-0.5 disabled:opacity-40"
                      title={isAr ? "تراجع" : "Undo"}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isAr ? "تراجع" : "Undo"}</span>
                    </button>

                    {/* Notes */}
                    <button
                      type="button"
                      onClick={() => {
                        playFx("click");
                        setPencilMode(!pencilMode);
                      }}
                      className={`py-2 px-1 rounded-xl font-bold text-[11px] flex flex-col items-center gap-0.5 transition-all ${
                        pencilMode
                          ? "bg-purple-600 text-white shadow-sm ring-2 ring-purple-300"
                          : "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                      }`}
                      title={isAr ? "المسودة" : "Notes"}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isAr ? "المسودة" : "Notes"}</span>
                    </button>

                    {/* Fast Pencil */}
                    <button
                      type="button"
                      onClick={handleFastPencil}
                      className="py-2 px-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] flex flex-col items-center gap-0.5"
                      title={isAr ? "قلم سريع" : "Fast"}
                    >
                      <Zap className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{isAr ? "قلم سريع" : "Fast"}</span>
                    </button>

                    {/* Erase */}
                    <button
                      type="button"
                      onClick={handleErase}
                      className="py-2 px-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-[11px] flex flex-col items-center gap-0.5"
                      title={isAr ? "مسح" : "Erase"}
                    >
                      <Eraser className="w-3.5 h-3.5" />
                      <span>{isAr ? "مسح" : "Erase"}</span>
                    </button>

                    {/* Smart Hint */}
                    <button
                      type="button"
                      onClick={handleSmartHint}
                      className="py-2 px-1 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-[11px] flex flex-col items-center gap-0.5 shadow-sm active:scale-95"
                      title={isAr ? "تلميح ذكي" : "Hint"}
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>{isAr ? "تلميح" : "Hint"}</span>
                    </button>
                  </div>
                </div>

                {/* Completion Celebration Card */}
                {isCompleted && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-center font-bold shadow-xl space-y-3 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-center gap-2 text-xl font-black">
                      <Trophy className="w-6 h-6 text-amber-300 animate-bounce" />
                      <span>🏆 إنجاز خارق! أتممت اللغز بنجاح باهر!</span>
                    </div>
                    <p className="text-emerald-100 text-xs">
                      الوقت المستغرق: {formatTime(timerSeconds)} • عدد الأخطاء: {mistakes} • درجة الذكاء: {Math.max(10, selectedSize * 100 - mistakes * 25)} نقطة
                    </p>
                    <div className="pt-1 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={activeTab === "play" ? handleNewRandomPuzzle : loadDailyChallenge}
                        className="px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-black text-xs hover:bg-emerald-50 shadow-md transition-all active:scale-95"
                      >
                        {isAr ? "لعب لغز جديد 🚀" : "Play Another Puzzle"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Keypad & Tools on Desktop (hidden on mobile, shown on lg+) */}
              <div className="hidden lg:block lg:col-span-5 space-y-4">
                <div className="bg-white dark:bg-[#1C1A3A] p-4 sm:p-5 rounded-3xl shadow-xl border border-purple-100 dark:border-purple-900/50 space-y-3.5">
                  {/* Keypad with Remaining Digits Counter - AT THE TOP OF DESKTOP SIDEBAR */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
                      <span className="text-slate-800 dark:text-slate-200 font-black">{isAr ? "لوحة الأرقام السريعة" : "Quick Keypad"}</span>
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
                            key={`desktop-key-${digit}`}
                            type="button"
                            onClick={() => handleNumberInput(digit)}
                            className={`py-3 px-2 rounded-2xl border-2 transition-all flex flex-col items-center justify-center relative active:scale-95 ${
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

                  {/* Utility Action Buttons */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-purple-50 dark:border-purple-900/30">
                    {/* Undo */}
                    <button
                      type="button"
                      onClick={handleUndo}
                      disabled={history.length === 0}
                      className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs flex flex-col items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      title={isAr ? "تراجع عن الخطوة السابقة" : "Undo"}
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span className="text-[11px]">{isAr ? "تراجع" : "Undo"}</span>
                    </button>

                    {/* Pencil Notes Mode */}
                    <button
                      type="button"
                      onClick={() => {
                        playFx("click");
                        setPencilMode(!pencilMode);
                      }}
                      className={`p-2.5 rounded-2xl font-bold text-xs flex flex-col items-center gap-1 transition-all ${
                        pencilMode
                          ? "bg-purple-600 text-white shadow-md scale-105 ring-2 ring-purple-400"
                          : "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100"
                      }`}
                      title={isAr ? "تفعيل وضع تدوين المرشحات" : "Pencil Notes"}
                    >
                      <Edit3 className="w-4 h-4" />
                      <span className="text-[11px]">{isAr ? "المسودة" : "Notes"}</span>
                    </button>

                    {/* Fast Pencil Button */}
                    <button
                      type="button"
                      onClick={handleFastPencil}
                      className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-bold text-xs flex flex-col items-center gap-1 transition-all"
                      title={isAr ? "تعبئة كل المرشحات الممكنة تلقائياً" : "Fast Pencil Auto Fill"}
                    >
                      <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-[11px]">{isAr ? "قلم سريع" : "Fast"}</span>
                    </button>

                    {/* Erase */}
                    <button
                      type="button"
                      onClick={handleErase}
                      className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 font-bold text-xs flex flex-col items-center gap-1 transition-all"
                      title={isAr ? "مسح الخلية" : "Erase"}
                    >
                      <Eraser className="w-4 h-4" />
                      <span className="text-[11px]">{isAr ? "مسح" : "Erase"}</span>
                    </button>
                  </div>

                  {/* 3-Step Smart Hint Trigger Button */}
                  <button
                    type="button"
                    onClick={handleSmartHint}
                    className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-95 transition-all"
                  >
                    <Lightbulb className="w-4 h-4 animate-bounce" />
                    <span>{isAr ? "تلميح ذكي تعليمي (شرح على 3 خطوات) 💡" : "3-Step Smart Hint 💡"}</span>
                  </button>
                </div>

                {/* Killer Sudoku Cages Status Box */}
                {activeTab === "killer" && killerEvaluation && (
                  <div className="p-4 rounded-3xl bg-white dark:bg-[#1C1A3A] border border-purple-100 dark:border-purple-900/50 shadow-md space-y-2.5">
                    <h4 className="text-xs font-black text-[#261E58] dark:text-[#F3F0FD] flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-purple-600" />
                      <span>مجموع الأقفاص المكتملة</span>
                    </h4>
                    <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto">
                      {killerPuzzle.cages.map((cg) => {
                        const status = killerEvaluation.cageTotals[cg.id];
                        const isErr = !!killerEvaluation.cageErrors[cg.id];
                        return (
                          <div
                            key={cg.id}
                            className={`p-1.5 rounded-xl border text-[11px] font-bold flex items-center justify-between ${
                              isErr
                                ? "bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
                                : status?.isFilled
                                ? "bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                                : "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                            }`}
                          >
                            <span>هدف {cg.sum}</span>
                            <span>{status?.currentSum || 0}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* TAB 4: INTERACTIVE GUIDED ACADEMY */}
          {/* ============================================================= */}
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
                      type="button"
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
                      type="button"
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
                          type="button"
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
                            type="button"
                            onClick={() => loadLesson(activeLessonIdx + 1)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs shadow-md hover:bg-emerald-700 transition-all"
                          >
                            الانتقال للدرس التالي ➔
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3-Step Smart Hint Pager Modal */}
      <SmartHintModal
        hint={activeHint}
        isOpen={isSmartHintOpen}
        onClose={() => {
          setIsSmartHintOpen(false);
          setActiveHintStep(null);
        }}
        onApply={applyHintValue}
        playFx={playFx}
        onStepChange={(st) => setActiveHintStep(st)}
      />

      {/* Game Over Modal (When 3 mistakes reached) */}
      {showGameOverModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
        >
          <div className="clay-card !p-6 max-w-md w-full bg-white dark:bg-[#1E1B3E] rounded-3xl shadow-2xl text-center space-y-4 border-2 border-rose-400">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl">
              💔
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {isAr
                ? `تجاوزت حد الأخطاء المسموح به (${maxMistakes ?? 3} / ${maxMistakes ?? 3})`
                : `Mistakes limit reached (${maxMistakes ?? 3} / ${maxMistakes ?? 3})`}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              السودوكو لعبة تدرب على الصبر والدقة. يمكنك إعادة محاولة نفس اللغز بتركيز، أو المتابعة والتدريب بدون قيود أخطاء!
            </p>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  playFx("pop");
                  handleResetCurrentPuzzle();
                  setShowGameOverModal(false);
                }}
                className="clay-btn-purple flex-1 py-2.5 px-4 text-xs font-black !rounded-xl"
              >
                إعادة المحاولة من البداية 🔄
              </button>
              <button
                type="button"
                onClick={() => {
                  playFx("click");
                  setPracticeMode(true);
                  setShowGameOverModal(false);
                  setTimerRunning(true);
                }}
                className="clay-pill flex-1 py-2.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                متابعة اللعب كتدريب حر 🌟
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rules Reference Modal */}
      {showRulesModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
        >
          <div
            className="fixed inset-0"
            onClick={() => setShowRulesModal(false)}
            aria-hidden="true"
          />
          <div className="relative clay-card !p-6 max-w-xl w-full bg-white dark:bg-[#1E1B3E] rounded-3xl shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto z-10">
            <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-900 pb-3">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-black text-base">
                <HelpCircle className="w-5 h-5" />
                <span>دليل وقواعد السودوكو الشاملة</span>
              </div>
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="clay-pill p-1.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {SUDOKU_RULES_GUIDE.map((r) => (
                <div key={r.id} className="clay-card-sm !p-3.5 bg-purple-50/50 dark:bg-purple-950/30 space-y-1.5">
                  <h4 className="text-xs font-black text-purple-900 dark:text-purple-200 flex items-center gap-2">
                    <span>{r.icon}</span>
                    <span>{r.titleAr}</span>
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {r.descriptionAr}
                  </p>
                  <ul className="list-disc list-inside text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                    {r.examplesAr.map((ex, i) => (
                      <li key={i}>{ex}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Print Worksheet Modal */}
      {showPrintModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
        >
          <div
            className="fixed inset-0"
            onClick={() => setShowPrintModal(false)}
            aria-hidden="true"
          />
          <div className="relative clay-card !p-6 max-w-md w-full bg-white dark:bg-[#1E1B3E] rounded-3xl shadow-2xl text-center space-y-4 z-10">
            <Printer className="w-12 h-12 text-brand-600 mx-auto animate-bounce" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              طباعة ورقة عمل سودوكو للأبطال 🖨️
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              تتيح لك هذه الميزة طباعة الشبكة الحالية (بحجم {selectedSize}×{selectedSize}) كورقة عمل تدريبية للحل اليدوي بالقلم في المنزل أو المركز التدريبي.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setShowPrintModal(false);
                }}
                className="clay-btn-purple py-2 px-5 text-xs font-black !rounded-xl"
              >
                بدء الطباعة الآن 🖨️
              </button>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="clay-pill py-2 px-4 text-xs font-bold text-slate-500"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </ModuleLockedGate>
  );
}