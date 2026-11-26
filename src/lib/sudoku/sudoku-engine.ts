/**
 * SUPER MIND IQ - Sudoku Engine
 * Supports 4x4 (Kids Mini), 6x6 (Midi), and 9x9 (Classic)
 * Features:
 * - 6 Calibrated Difficulty Tiers (Beginner to Extreme)
 * - Guaranteed Unique Solution validation (Backtracking solver counter)
 * - Deterministic Daily Challenge generator with Date Seed & Streaks
 * - Killer Sudoku (Cages with target sums) representation & validator
 * - Fast Pencil (Auto-fill candidate notes)
 * - 3-Step Smart Hint Pager (Region -> Analysis/Elimination -> Solution/Apply)
 * - Real-time conflict detection (Row, Column, Box, Diagonal Sudoku X)
 * - Remaining digits counter & peer note cleaner
 * - 5-Stage interactive academy lessons & rules guide
 */

export type SudokuSize = 4 | 6 | 9;

export type SudokuDifficulty = "beginner" | "easy" | "medium" | "hard" | "expert" | "extreme";

export interface DifficultyMeta {
  id: SudokuDifficulty;
  labelAr: string;
  labelEn: string;
  icon: string;
  badgeClass: string;
  descriptionAr: string;
}

export const SUDOKU_DIFFICULTIES: DifficultyMeta[] = [
  {
    id: "beginner",
    labelAr: "مبتدئ",
    labelEn: "Beginner",
    icon: "🌱",
    badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    descriptionAr: "خانات معطاة كثيرة وحلول فورية تناسب المبتدئين والأطفال",
  },
  {
    id: "easy",
    labelAr: "سهل",
    labelEn: "Easy",
    icon: "⭐",
    badgeClass: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300",
    descriptionAr: "تحدٍ ممتع يعتمد على المرشح الوحيد والاستنتاج المباشر",
  },
  {
    id: "medium",
    labelAr: "متوسط",
    labelEn: "Medium",
    icon: "⚡",
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    descriptionAr: "يتطلب المسح المتقاطع والحصر بين الصفوف والمربعات",
  },
  {
    id: "hard",
    labelAr: "صعب",
    labelEn: "Hard",
    icon: "🔥",
    badgeClass: "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300",
    descriptionAr: "خانات شاغرة واسعة تحتاج تدوين مسودة المرشحات",
  },
  {
    id: "expert",
    labelAr: "خبير",
    labelEn: "Expert",
    icon: "👑",
    badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
    descriptionAr: "استنتاجات متقدمة تعتمد على الأزواج المكشوفة والحصر المركب",
  },
  {
    id: "extreme",
    labelAr: "أسطوري",
    labelEn: "Extreme",
    icon: "💎",
    badgeClass: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300",
    descriptionAr: "أقصى درجات التحدي المنطقي مع أقل عدد ممكن من الأرقام المعطاة",
  },
];

export interface SudokuCell {
  row: number;
  col: number;
  val: number; // 0 for empty
  initial: boolean;
  notes: number[];
  error?: boolean;
}

export interface SudokuPuzzle {
  size: SudokuSize;
  initialGrid: number[][];
  solution: number[][];
  difficulty: SudokuDifficulty;
  isDiagonal?: boolean;
}

// Box dimensions based on size
export function getBoxDimensions(size: SudokuSize): { boxRows: number; boxCols: number } {
  if (size === 4) return { boxRows: 2, boxCols: 2 };
  if (size === 6) return { boxRows: 2, boxCols: 3 };
  return { boxRows: 3, boxCols: 3 };
}

// Helper: Shuffle array in place
export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Check if placement is valid (including optional diagonal X rule)
export function isValidPlacement(
  grid: number[][],
  row: number,
  col: number,
  val: number,
  size: SudokuSize,
  isDiagonal: boolean = false
): boolean {
  if (val === 0) return true;

  // Check row
  for (let c = 0; c < size; c++) {
    if (c !== col && grid[row][c] === val) return false;
  }

  // Check col
  for (let r = 0; r < size; r++) {
    if (r !== row && grid[r][col] === val) return false;
  }

  // Check box
  const { boxRows, boxCols } = getBoxDimensions(size);
  const startRow = Math.floor(row / boxRows) * boxRows;
  const startCol = Math.floor(col / boxCols) * boxCols;

  for (let r = 0; r < boxRows; r++) {
    for (let c = 0; c < boxCols; c++) {
      const cr = startRow + r;
      const cc = startCol + c;
      if ((cr !== row || cc !== col) && grid[cr][cc] === val) {
        return false;
      }
    }
  }

  // Check Diagonals in Sudoku X mode
  if (isDiagonal) {
    if (row === col) {
      for (let i = 0; i < size; i++) {
        if (i !== row && grid[i][i] === val) return false;
      }
    }
    if (row + col === size - 1) {
      for (let i = 0; i < size; i++) {
        const ci = size - 1 - i;
        if (i !== row && grid[i][ci] === val) return false;
      }
    }
  }

  return true;
}

// Backtracking solver
export function solveSudoku(
  grid: number[][],
  size: SudokuSize,
  isDiagonal: boolean = false
): number[][] | null {
  const copy = grid.map((r) => [...r]);

  function solve(): boolean {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (copy[r][c] === 0) {
          const numbers = Array.from({ length: size }, (_, i) => i + 1);
          for (const num of numbers) {
            if (isValidPlacement(copy, r, c, num, size, isDiagonal)) {
              copy[r][c] = num;
              if (solve()) return true;
              copy[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  if (solve()) return copy;
  return null;
}

// Count number of solutions (used to guarantee 100% unique solution)
export function countSolutions(
  grid: number[][],
  size: SudokuSize,
  isDiagonal: boolean = false,
  limit: number = 2
): number {
  let count = 0;
  const copy = grid.map((r) => [...r]);

  function solve(): boolean {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (copy[r][c] === 0) {
          for (let num = 1; num <= size; num++) {
            if (isValidPlacement(copy, r, c, num, size, isDiagonal)) {
              copy[r][c] = num;
              if (solve()) {
                if (count >= limit) return true;
              }
              copy[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    count++;
    return count >= limit;
  }

  solve();
  return count;
}

// Generate a random valid full solution grid
export function generateRandomSolvedGrid(
  size: SudokuSize,
  isDiagonal: boolean = false,
  customRand?: () => number
): number[][] {
  const randFn = customRand || Math.random;
  const grid: number[][] = Array.from({ length: size }, () => Array(size).fill(0));

  function shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(randFn() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // Pre-fill independent diagonal blocks for speed
  if (size === 9 && !isDiagonal) {
    for (let b = 0; b < 9; b += 3) {
      const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      let idx = 0;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          grid[b + r][b + c] = nums[idx++];
        }
      }
    }
  } else if (size === 4 && !isDiagonal) {
    const nums1 = shuffle([1, 2, 3, 4]);
    const nums2 = shuffle([1, 2, 3, 4]);
    grid[0][0] = nums1[0]; grid[0][1] = nums1[1];
    grid[1][0] = nums1[2]; grid[1][1] = nums1[3];
    grid[2][2] = nums2[0]; grid[2][3] = nums2[1];
    grid[3][2] = nums2[2]; grid[3][3] = nums2[3];
  }

  function fill(): boolean {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === 0) {
          const numbers = shuffle(Array.from({ length: size }, (_, i) => i + 1));
          for (const num of numbers) {
            if (isValidPlacement(grid, r, c, num, size, isDiagonal)) {
              grid[r][c] = num;
              if (fill()) return true;
              grid[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  fill();
  return grid;
}

// Generate dynamic random puzzle by removing clues based on difficulty with UNIQUE solution verification
export function generateDynamicPuzzle(
  size: SudokuSize,
  difficulty: SudokuDifficulty = "easy",
  isDiagonal: boolean = false
): SudokuPuzzle {
  const solution = generateRandomSolvedGrid(size, isDiagonal);
  const initialGrid = solution.map((r) => [...r]);

  // Calibrate number of clues to keep based on size and 6 difficulty levels
  let cluesToKeep: number;
  if (size === 4) {
    const map4: Record<SudokuDifficulty, number> = {
      beginner: 10,
      easy: 8,
      medium: 6,
      hard: 5,
      expert: 4,
      extreme: 4,
    };
    cluesToKeep = map4[difficulty] || 8;
  } else if (size === 6) {
    const map6: Record<SudokuDifficulty, number> = {
      beginner: 22,
      easy: 18,
      medium: 14,
      hard: 12,
      expert: 10,
      extreme: 9,
    };
    cluesToKeep = map6[difficulty] || 18;
  } else {
    // 9x9 Classic
    const map9: Record<SudokuDifficulty, number> = {
      beginner: 48,
      easy: 38,
      medium: 32,
      hard: 28,
      expert: 25,
      extreme: 23,
    };
    cluesToKeep = map9[difficulty] || 38;
  }

  const totalCells = size * size;
  const toRemove = totalCells - cluesToKeep;

  const positions: { r: number; c: number }[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      positions.push({ r, c });
    }
  }
  const shuffledPositions = shuffleArray(positions);

  let removed = 0;
  for (const pos of shuffledPositions) {
    if (removed >= toRemove) break;
    const backup = initialGrid[pos.r][pos.c];
    initialGrid[pos.r][pos.c] = 0;

    // Verify unique solution
    if (countSolutions(initialGrid, size, isDiagonal, 2) === 1) {
      removed++;
    } else {
      // Revert if removal causes multiple solutions
      initialGrid[pos.r][pos.c] = backup;
    }
  }

  return {
    size,
    difficulty,
    initialGrid,
    solution,
    isDiagonal,
  };
}

// Pseudo-random generator seeded by string (for deterministic Daily Challenges)
function createSeededRandom(seedStr: string): () => number {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function getDailyDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Deterministic Daily Challenge Generator
export function generateDailyPuzzle(dateStr: string, size: SudokuSize = 9): SudokuPuzzle {
  const randFn = createSeededRandom(dateStr);
  const solution = generateRandomSolvedGrid(size, false, randFn);
  const initialGrid = solution.map((r) => [...r]);

  const cluesToKeep = size === 6 ? 16 : size === 4 ? 7 : 33;
  const toRemove = size * size - cluesToKeep;

  const positions: { r: number; c: number }[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      positions.push({ r, c });
    }
  }

  // Shuffle positions using seeded random
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(randFn() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  let removed = 0;
  for (const pos of positions) {
    if (removed >= toRemove) break;
    const backup = initialGrid[pos.r][pos.c];
    initialGrid[pos.r][pos.c] = 0;
    if (countSolutions(initialGrid, size, false, 2) === 1) {
      removed++;
    } else {
      initialGrid[pos.r][pos.c] = backup;
    }
  }

  return {
    size,
    difficulty: "medium",
    initialGrid,
    solution,
    isDiagonal: false,
  };
}

// Fast Pencil: Calculate all valid candidate notes for all empty cells
export function calculateAllCandidates(
  grid: number[][],
  size: SudokuSize,
  isDiagonal: boolean = false
): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 0) {
        const candidates: number[] = [];
        for (let num = 1; num <= size; num++) {
          if (isValidPlacement(grid, r, c, num, size, isDiagonal)) {
            candidates.push(num);
          }
        }
        if (candidates.length > 0) {
          result[`${r}-${c}`] = candidates;
        }
      }
    }
  }
  return result;
}

// Preset verified puzzles (as fallback or instant start)
export const PRESET_PUZZLES: Record<string, SudokuPuzzle> = {
  "4x4-beginner": {
    size: 4,
    difficulty: "beginner",
    initialGrid: [
      [1, 2, 0, 4],
      [0, 4, 1, 0],
      [0, 1, 4, 3],
      [4, 0, 2, 1],
    ],
    solution: [
      [1, 2, 3, 4],
      [3, 4, 1, 2],
      [2, 1, 4, 3],
      [4, 3, 2, 1],
    ],
  },
  "4x4-easy": {
    size: 4,
    difficulty: "easy",
    initialGrid: [
      [1, 0, 0, 4],
      [0, 4, 1, 0],
      [0, 1, 4, 0],
      [4, 0, 0, 1],
    ],
    solution: [
      [1, 2, 3, 4],
      [3, 4, 1, 2],
      [2, 1, 4, 3],
      [4, 3, 2, 1],
    ],
  },
  "4x4-medium": {
    size: 4,
    difficulty: "medium",
    initialGrid: [
      [2, 0, 1, 0],
      [0, 1, 0, 2],
      [4, 0, 3, 0],
      [0, 3, 0, 4],
    ],
    solution: [
      [2, 4, 1, 3],
      [3, 1, 4, 2],
      [4, 2, 3, 1],
      [1, 3, 2, 4],
    ],
  },
  "6x6-beginner": {
    size: 6,
    difficulty: "beginner",
    initialGrid: [
      [1, 2, 3, 4, 5, 0],
      [4, 5, 0, 1, 2, 3],
      [2, 0, 1, 5, 6, 4],
      [5, 6, 4, 2, 0, 1],
      [3, 1, 2, 6, 4, 5],
      [0, 4, 5, 3, 1, 2],
    ],
    solution: [
      [1, 2, 3, 4, 5, 6],
      [4, 5, 6, 1, 2, 3],
      [2, 3, 1, 5, 6, 4],
      [5, 6, 4, 2, 3, 1],
      [3, 1, 2, 6, 4, 5],
      [6, 4, 5, 3, 1, 2],
    ],
  },
  "6x6-easy": {
    size: 6,
    difficulty: "easy",
    initialGrid: [
      [1, 0, 3, 0, 5, 0],
      [0, 5, 0, 1, 0, 3],
      [2, 0, 1, 0, 6, 0],
      [0, 6, 0, 2, 0, 1],
      [3, 0, 2, 0, 4, 0],
      [0, 4, 0, 3, 0, 2],
    ],
    solution: [
      [1, 2, 3, 4, 5, 6],
      [4, 5, 6, 1, 2, 3],
      [2, 3, 1, 5, 6, 4],
      [5, 6, 4, 2, 3, 1],
      [3, 1, 2, 6, 4, 5],
      [6, 4, 5, 3, 1, 2],
    ],
  },
  "6x6-medium": {
    size: 6,
    difficulty: "medium",
    initialGrid: [
      [3, 0, 0, 0, 6, 0],
      [0, 5, 0, 1, 0, 0],
      [1, 0, 3, 0, 0, 6],
      [0, 0, 5, 0, 1, 0],
      [0, 2, 0, 6, 0, 5],
      [5, 0, 0, 0, 2, 0],
    ],
    solution: [
      [3, 1, 4, 5, 6, 2],
      [6, 5, 2, 1, 4, 3],
      [1, 4, 3, 2, 5, 6],
      [2, 6, 5, 3, 1, 4],
      [4, 2, 1, 6, 3, 5],
      [5, 3, 6, 4, 2, 1],
    ],
  },
  "9x9-beginner": {
    size: 9,
    difficulty: "beginner",
    initialGrid: [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 0, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 0, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 0],
    ],
    solution: [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ],
  },
  "9x9-easy": {
    size: 9,
    difficulty: "easy",
    initialGrid: [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ],
    solution: [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ],
  },
  "9x9-medium": {
    size: 9,
    difficulty: "medium",
    initialGrid: [
      [0, 0, 0, 2, 6, 0, 7, 0, 1],
      [6, 8, 0, 0, 7, 0, 0, 9, 0],
      [1, 9, 0, 0, 0, 4, 5, 0, 0],
      [8, 2, 0, 1, 0, 0, 0, 4, 0],
      [0, 0, 4, 6, 0, 2, 9, 0, 0],
      [0, 5, 0, 0, 0, 3, 0, 2, 8],
      [0, 0, 9, 3, 0, 0, 0, 7, 4],
      [0, 4, 0, 0, 5, 0, 0, 3, 6],
      [7, 0, 3, 0, 1, 8, 0, 0, 0],
    ],
    solution: [
      [4, 3, 5, 2, 6, 9, 7, 8, 1],
      [6, 8, 2, 5, 7, 1, 4, 9, 3],
      [1, 9, 7, 8, 3, 4, 5, 6, 2],
      [8, 2, 6, 1, 9, 5, 3, 4, 7],
      [3, 7, 4, 6, 8, 2, 9, 1, 5],
      [9, 5, 1, 7, 4, 3, 6, 2, 8],
      [5, 1, 9, 3, 2, 6, 8, 7, 4],
      [2, 4, 8, 9, 5, 7, 1, 3, 6],
      [7, 6, 3, 4, 1, 8, 2, 5, 9],
    ],
  },
};

// Conflict detection for real-time visual alerts (row, col, box, diagonal)
export interface SudokuConflict {
  row: number;
  col: number;
  type: "row" | "col" | "box" | "diagonal";
  conflictingCells: { row: number; col: number }[];
  messageAr: string;
}

export function findPlacementConflicts(
  grid: number[][],
  row: number,
  col: number,
  val: number,
  size: SudokuSize,
  isDiagonal: boolean = false
): SudokuConflict | null {
  if (val === 0) return null;

  const conflictingCells: { row: number; col: number }[] = [];
  let conflictType: "row" | "col" | "box" | "diagonal" = "row";

  // Check row
  for (let c = 0; c < size; c++) {
    if (c !== col && grid[row][c] === val) {
      conflictingCells.push({ row, col: c });
      conflictType = "row";
    }
  }

  // Check col
  for (let r = 0; r < size; r++) {
    if (r !== row && grid[r][col] === val) {
      conflictingCells.push({ row: r, col });
      conflictType = "col";
    }
  }

  // Check box
  const { boxRows, boxCols } = getBoxDimensions(size);
  const startRow = Math.floor(row / boxRows) * boxRows;
  const startCol = Math.floor(col / boxCols) * boxCols;
  for (let r = 0; r < boxRows; r++) {
    for (let c = 0; c < boxCols; c++) {
      const cr = startRow + r;
      const cc = startCol + c;
      if ((cr !== row || cc !== col) && grid[cr][cc] === val) {
        if (!conflictingCells.some((cell) => cell.row === cr && cell.col === cc)) {
          conflictingCells.push({ row: cr, col: cc });
          conflictType = "box";
        }
      }
    }
  }

  // Check diagonals in Sudoku X mode
  if (isDiagonal) {
    if (row === col) {
      for (let i = 0; i < size; i++) {
        if (i !== row && grid[i][i] === val) {
          if (!conflictingCells.some((cell) => cell.row === i && cell.col === i)) {
            conflictingCells.push({ row: i, col: i });
            conflictType = "diagonal";
          }
        }
      }
    }
    if (row + col === size - 1) {
      for (let i = 0; i < size; i++) {
        const ci = size - 1 - i;
        if (i !== row && grid[i][ci] === val) {
          if (!conflictingCells.some((cell) => cell.row === i && cell.col === ci)) {
            conflictingCells.push({ row: i, col: ci });
            conflictType = "diagonal";
          }
        }
      }
    }
  }

  if (conflictingCells.length > 0) {
    const messageAr =
      conflictType === "diagonal"
        ? `تعارض في سودوكو X! الرقم (${val}) مكرر في نفس القطر`
        : conflictType === "row"
        ? `تعارض! الرقم (${val}) مكرر بالفعل في نفس الصف (الصف ${row + 1})`
        : conflictType === "col"
        ? `تعارض! الرقم (${val}) مكرر بالفعل في نفس العمود (العمود ${col + 1})`
        : `تعارض! الرقم (${val}) موجود بالفعل في نفس المربع (${boxRows}×${boxCols})`;

    return {
      row,
      col,
      type: conflictType,
      conflictingCells,
      messageAr,
    };
  }

  return null;
}

// Remaining digit counter under each keypad button
export function getRemainingDigitCounts(
  grid: number[][],
  size: SudokuSize
): Record<number, number> {
  const counts: Record<number, number> = {};
  for (let num = 1; num <= size; num++) {
    counts[num] = size;
  }
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const val = grid[r]?.[c] || 0;
      if (val >= 1 && val <= size) {
        counts[val] = Math.max(0, counts[val] - 1);
      }
    }
  }
  return counts;
}

// Auto-clean candidate notes in row, column, box, and diagonal
export function removeCandidateFromPeers(
  notes: Record<string, number[]>,
  row: number,
  col: number,
  val: number,
  size: SudokuSize,
  isDiagonal: boolean = false
): Record<string, number[]> {
  const nextNotes = { ...notes };
  const { boxRows, boxCols } = getBoxDimensions(size);
  const startRow = Math.floor(row / boxRows) * boxRows;
  const startCol = Math.floor(col / boxCols) * boxCols;

  delete nextNotes[`${row}-${col}`];

  for (let i = 0; i < size; i++) {
    const rowKey = `${row}-${i}`;
    if (nextNotes[rowKey]) {
      nextNotes[rowKey] = nextNotes[rowKey].filter((n) => n !== val);
    }
    const colKey = `${i}-${col}`;
    if (nextNotes[colKey]) {
      nextNotes[colKey] = nextNotes[colKey].filter((n) => n !== val);
    }
  }

  for (let r = 0; r < boxRows; r++) {
    for (let c = 0; c < boxCols; c++) {
      const boxKey = `${startRow + r}-${startCol + c}`;
      if (nextNotes[boxKey]) {
        nextNotes[boxKey] = nextNotes[boxKey].filter((n) => n !== val);
      }
    }
  }

  if (isDiagonal) {
    if (row === col) {
      for (let i = 0; i < size; i++) {
        const diagKey = `${i}-${i}`;
        if (nextNotes[diagKey]) {
          nextNotes[diagKey] = nextNotes[diagKey].filter((n) => n !== val);
        }
      }
    }
    if (row + col === size - 1) {
      for (let i = 0; i < size; i++) {
        const diagKey = `${i}-${size - 1 - i}`;
        if (nextNotes[diagKey]) {
          nextNotes[diagKey] = nextNotes[diagKey].filter((n) => n !== val);
        }
      }
    }
  }

  return nextNotes;
}

// 3-Step Guided Explanatory Smart Hint System
export interface SudokuSmartHintStep {
  stepNumber: 1 | 2 | 3;
  stepNameAr: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  highlightCells?: { row: number; col: number; kind: "focus" | "blocking" | "target" }[];
  highlightRows?: number[];
  highlightCols?: number[];
  highlightBox?: { startRow: number; startCol: number; endRow: number; endCol: number };
}

export interface SudokuHint {
  row: number;
  col: number;
  val: number;
  techniqueAr: string;
  techniqueEn: string;
  explanationAr: string;
  explanationEn: string;
  highlightRows?: number[];
  highlightCols?: number[];
  highlightBox?: { startRow: number; startCol: number; endRow: number; endCol: number };
  steps?: [SudokuSmartHintStep, SudokuSmartHintStep, SudokuSmartHintStep];
}

export function findSmartHint(
  grid: number[][],
  solution: number[][],
  size: SudokuSize,
  isDiagonal: boolean = false
): SudokuHint | null {
  const { boxRows, boxCols } = getBoxDimensions(size);

  // 1. Search for Naked Single (cell with only 1 legal candidate left)
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 0) {
        const candidates: number[] = [];
        for (let num = 1; num <= size; num++) {
          if (isValidPlacement(grid, r, c, num, size, isDiagonal)) {
            candidates.push(num);
          }
        }

        if (candidates.length === 1) {
          const val = candidates[0];
          const bStartR = Math.floor(r / boxRows) * boxRows;
          const bStartC = Math.floor(c / boxCols) * boxCols;

          // Find blocking peer cells for the 3-step explanation
          const blockingCells: { row: number; col: number; kind: "focus" | "blocking" | "target" }[] = [];
          for (let i = 0; i < size; i++) {
            if (i !== c && grid[r][i] > 0) blockingCells.push({ row: r, col: i, kind: "blocking" });
            if (i !== r && grid[i][c] > 0) blockingCells.push({ row: i, col: c, kind: "blocking" });
          }

          const steps: [SudokuSmartHintStep, SudokuSmartHintStep, SudokuSmartHintStep] = [
            {
              stepNumber: 1,
              stepNameAr: "تحديد المنطقة",
              titleAr: "الخطوة 1: فحص الخلية والمناطق المتقاطعة 🔍",
              titleEn: "Step 1: Region & Target Cell Inspection",
              descriptionAr: `ركّز على الخلية في (الصف ${r + 1}، العمود ${c + 1}). تتقاطع معها 3 حدود: الصف، العمود، والمربع المحيط.`,
              descriptionEn: `Focus on cell (${r + 1}, ${c + 1}) where row, column, and block intersect.`,
              highlightRows: [r],
              highlightCols: [c],
              highlightBox: {
                startRow: bStartR,
                startCol: bStartC,
                endRow: bStartR + boxRows - 1,
                endCol: bStartC + boxCols - 1,
              },
              highlightCells: [{ row: r, col: c, kind: "focus" }],
            },
            {
              stepNumber: 2,
              stepNameAr: "استبعاد المرشحات",
              titleAr: "الخطوة 2: استبعاد جميع الأرقام الأخرى 🚫",
              titleEn: "Step 2: Candidate Elimination",
              descriptionAr: `الأرقام المجاورة في الصف والعمود والمربع تحجب جميع الأرقام من 1 إلى ${size}، ولم يتبقَ سوى رقم حتمي واحد فقط.`,
              descriptionEn: `Surrounding peer cells eliminate all candidates except one sole survivor.`,
              highlightRows: [r],
              highlightCols: [c],
              highlightBox: {
                startRow: bStartR,
                startCol: bStartC,
                endRow: bStartR + boxRows - 1,
                endCol: bStartC + boxCols - 1,
              },
              highlightCells: [{ row: r, col: c, kind: "focus" }, ...blockingCells.slice(0, 8)],
            },
            {
              stepNumber: 3,
              stepNameAr: "الحل المؤكد",
              titleAr: `الخطوة 3: الرقم الوحيد المؤكد هو (${val}) ✅`,
              titleEn: `Step 3: Confirmed Solution (${val})`,
              descriptionAr: `بما أن كل الأرقام الأخرى محجوزة قانونياً، فإن الرقم المؤكد والمتبقي لهذه الخلية هو (${val})! اضغط على زر "تطبيق" لوضعه مباشرة.`,
              descriptionEn: `All other digits are ruled out. (${val}) is the only legal number here!`,
              highlightCells: [{ row: r, col: c, kind: "target" }],
            },
          ];

          return {
            row: r,
            col: c,
            val,
            techniqueAr: "المرشح الوحيد المكشوف (Naked Single)",
            techniqueEn: "Naked Single",
            explanationAr: `انظر للخلية (${r + 1}, ${c + 1}): جميع الأرقام الأخرى محجوزة في نفس الصف والعمود والمربع${isDiagonal ? " والقطر" : ""}، ولم يتبقَ سوى الرقم (${val}) كخيار وحيد ممكن!`,
            explanationEn: `Cell (${r + 1}, ${c + 1}) has only one legal candidate: (${val}).`,
            highlightRows: [r],
            highlightCols: [c],
            highlightBox: {
              startRow: bStartR,
              startCol: bStartC,
              endRow: bStartR + boxRows - 1,
              endCol: bStartC + boxCols - 1,
            },
            steps,
          };
        }
      }
    }
  }

  // 2. Cross-Hatching in Box (Hidden Single in 3x3 or 2x3 box)
  for (let num = 1; num <= size; num++) {
    for (let bRow = 0; bRow < size; bRow += boxRows) {
      for (let bCol = 0; bCol < size; bCol += boxCols) {
        let alreadyInBox = false;
        for (let r = 0; r < boxRows; r++) {
          for (let c = 0; c < boxCols; c++) {
            if (grid[bRow + r][bCol + c] === num) {
              alreadyInBox = true;
              break;
            }
          }
          if (alreadyInBox) break;
        }

        if (!alreadyInBox) {
          const validSpots: { r: number; c: number }[] = [];
          for (let r = 0; r < boxRows; r++) {
            for (let c = 0; c < boxCols; c++) {
              const gr = bRow + r;
              const gc = bCol + c;
              if (grid[gr][gc] === 0 && isValidPlacement(grid, gr, gc, num, size, isDiagonal)) {
                validSpots.push({ r: gr, c: gc });
              }
            }
          }

          if (validSpots.length === 1) {
            const spot = validSpots[0];

            const steps: [SudokuSmartHintStep, SudokuSmartHintStep, SudokuSmartHintStep] = [
              {
                stepNumber: 1,
                stepNameAr: "تحديد المربع",
                titleAr: `الخطوة 1: فحص المربع المستهدف للرقم (${num}) 📦`,
                titleEn: `Step 1: Inspect Target Box for (${num})`,
                descriptionAr: `انظر إلى المربع (${boxRows}×${boxCols}) المحدد. الرقم (${num}) غير موجود فيه بعد ويجب وضعه في إحدى خلاياه.`,
                descriptionEn: `Inspect the highlighted box where digit (${num}) is missing.`,
                highlightBox: {
                  startRow: bRow,
                  startCol: bCol,
                  endRow: bRow + boxRows - 1,
                  endCol: bCol + boxCols - 1,
                },
              },
              {
                stepNumber: 2,
                stepNameAr: "أشعة المسح بالليزر",
                titleAr: "الخطوة 2: أشعة المسح المتقاطع (Cross-Hatching) ⚡",
                titleEn: "Step 2: Cross-Hatching Elimination Rays",
                descriptionAr: `الصف والأعمدة المجاورة التي تضم الرقم (${num}) تُرسل أشعة حظر تغلق جميع الخانات الأخرى داخل هذا المربع.`,
                descriptionEn: `Neighboring rows and columns containing (${num}) block all alternative cells in this box.`,
                highlightRows: [spot.r],
                highlightCols: [spot.c],
                highlightBox: {
                  startRow: bRow,
                  startCol: bCol,
                  endRow: bRow + boxRows - 1,
                  endCol: bCol + boxCols - 1,
                },
              },
              {
                stepNumber: 3,
                stepNameAr: "الخانة الوحيدة الشاغرة",
                titleAr: `الخطوة 3: الخانة الوحيدة الشاغرة للرقم (${num}) هي (${spot.r + 1}, ${spot.c + 1}) 🎯`,
                titleEn: `Step 3: Sole remaining slot for (${num})`,
                descriptionAr: `لم يتبقَ سوى خلية واحدة متاحة للرقم (${num}) في هذا المربع. الحل الأكيد هو وضع (${num}) في الخلية المحددة!`,
                descriptionEn: `Only one cell remains unblocked for (${num}) in this box. Place it now!`,
                highlightCells: [{ row: spot.r, col: spot.c, kind: "target" }],
              },
            ];

            return {
              row: spot.r,
              col: spot.c,
              val: num,
              techniqueAr: "التقاطع الشبكي والحصر في المربع (Cross-Hatching)",
              techniqueEn: "Cross-Hatching (Cube)",
              explanationAr: `في هذا المربع (${boxRows}×${boxCols}): الخطوط المحاذية تغلق جميع الخانات الأخرى للرقم (${num})، والخانة الوحيدة الشاغرة له هي (${spot.r + 1}, ${spot.c + 1})!`,
              explanationEn: `Cross-hatching restricts (${num}) to only one spot in this box.`,
              highlightRows: [spot.r],
              highlightCols: [spot.c],
              highlightBox: {
                startRow: bRow,
                startCol: bCol,
                endRow: bRow + boxRows - 1,
                endCol: bCol + boxCols - 1,
              },
              steps,
            };
          }
        }
      }
    }
  }

  // 3. Fallback to any empty cell matching solution
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 0) {
        const val = solution[r][c];
        const bStartR = Math.floor(r / boxRows) * boxRows;
        const bStartC = Math.floor(c / boxCols) * boxCols;

        const steps: [SudokuSmartHintStep, SudokuSmartHintStep, SudokuSmartHintStep] = [
          {
            stepNumber: 1,
            stepNameAr: "تحديد المنطقة",
            titleAr: "الخطوة 1: فحص تقاطع الصف والعمود 📐",
            titleEn: "Step 1: Row & Column Intersection",
            descriptionAr: `ركّز على تقاطع الصف رقم (${r + 1}) مع العمود رقم (${c + 1}).`,
            descriptionEn: `Examine the intersection of row (${r + 1}) and column (${c + 1}).`,
            highlightRows: [r],
            highlightCols: [c],
          },
          {
            stepNumber: 2,
            stepNameAr: "تحليل القيود",
            titleAr: "الخطوة 2: حصر احتمالات الخلية 🧠",
            titleEn: "Step 2: Constraint Verification",
            descriptionAr: `بمطابقة القيود والقواعد الرياضية للصف والعمود والمربع، تم استبعاد بقية الأرقام.`,
            descriptionEn: `By testing row, column, and box constraints, other numbers are ruled out.`,
            highlightRows: [r],
            highlightCols: [c],
            highlightBox: {
              startRow: bStartR,
              startCol: bStartC,
              endRow: bStartR + boxRows - 1,
              endCol: bStartC + boxCols - 1,
            },
          },
          {
            stepNumber: 3,
            stepNameAr: "الحل المؤكد",
            titleAr: `الخطوة 3: القيمة المؤكدة هي (${val}) 🌟`,
            titleEn: `Step 3: Confirmed Value (${val})`,
            descriptionAr: `الحل المنطقي الصحيح والمؤكد للخلية (${r + 1}, ${c + 1}) هو (${val}).`,
            descriptionEn: `The logically confirmed value is (${val}).`,
            highlightCells: [{ row: r, col: c, kind: "target" }],
          },
        ];

        return {
          row: r,
          col: c,
          val,
          techniqueAr: "استنتاج الحصر المنطقي المباشر",
          techniqueEn: "Logical Deduction",
          explanationAr: `بتقاطع الصف (${r + 1}) والعمود (${c + 1})، القيمة المؤكدة للخلية هي (${val}).`,
          explanationEn: `By cross-referencing lines and blocks, cell is (${val}).`,
          highlightRows: [r],
          highlightCols: [c],
          steps,
        };
      }
    }
  }

  return null;
}

// Killer Sudoku Data Structures & Validation
export interface KillerCage {
  id: string;
  sum: number;
  cells: { row: number; col: number }[];
  colorClass: string;
}

export interface KillerSudokuPuzzle {
  id: string;
  nameAr: string;
  size: SudokuSize;
  difficulty: SudokuDifficulty;
  cages: KillerCage[];
  initialGrid: number[][];
  solution: number[][];
}

// Killer Sudoku Cages Evaluation
export function evaluateKillerCages(
  grid: number[][],
  cages: KillerCage[]
): {
  isAllValid: boolean;
  cageErrors: Record<string, string>;
  cageTotals: Record<string, { currentSum: number; targetSum: number; isFilled: boolean }>;
} {
  const cageErrors: Record<string, string> = {};
  const cageTotals: Record<string, { currentSum: number; targetSum: number; isFilled: boolean }> = {};
  let isAllValid = true;

  for (const cage of cages) {
    let sum = 0;
    let isFilled = true;
    const seenDigits = new Set<number>();
    let hasDuplicate = false;

    for (const cell of cage.cells) {
      const val = grid[cell.row]?.[cell.col] || 0;
      if (val === 0) {
        isFilled = false;
      } else {
        sum += val;
        if (seenDigits.has(val)) {
          hasDuplicate = true;
        }
        seenDigits.add(val);
      }
    }

    cageTotals[cage.id] = { currentSum: sum, targetSum: cage.sum, isFilled };

    if (hasDuplicate) {
      cageErrors[cage.id] = `تكرار رقم داخل نفس القفص!`;
      isAllValid = false;
    } else if (isFilled && sum !== cage.sum) {
      cageErrors[cage.id] = `المجموع الحالي (${sum}) لا يطابق المطلوب (${cage.sum})!`;
      isAllValid = false;
    } else if (sum > cage.sum) {
      cageErrors[cage.id] = `تجاوز المجموع المطلوب (${cage.sum})!`;
      isAllValid = false;
    }
  }

  return { isAllValid, cageErrors, cageTotals };
}

// Verified Preset Killer Sudoku Puzzles
export const PRESET_KILLER_PUZZLES: Record<string, KillerSudokuPuzzle> = {
  "killer-6x6": {
    id: "killer-6x6",
    nameAr: "سودوكو القاتل 6×6 — تدريب الأقفاص الذكية",
    size: 6,
    difficulty: "medium",
    initialGrid: [
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
    ],
    solution: [
      [1, 2, 3, 4, 5, 6],
      [4, 5, 6, 1, 2, 3],
      [2, 3, 1, 5, 6, 4],
      [5, 6, 4, 2, 3, 1],
      [3, 1, 2, 6, 4, 5],
      [6, 4, 5, 3, 1, 2],
    ],
    cages: [
      { id: "c1", sum: 3, cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }], colorClass: "border-purple-400 bg-purple-500/10" },
      { id: "c2", sum: 9, cells: [{ row: 0, col: 2 }, { row: 1, col: 2 }], colorClass: "border-sky-400 bg-sky-500/10" },
      { id: "c3", sum: 9, cells: [{ row: 0, col: 3 }, { row: 0, col: 4 }], colorClass: "border-emerald-400 bg-emerald-500/10" },
      { id: "c4", sum: 9, cells: [{ row: 0, col: 5 }, { row: 1, col: 5 }], colorClass: "border-amber-400 bg-amber-500/10" },
      { id: "c5", sum: 6, cells: [{ row: 1, col: 0 }, { row: 2, col: 0 }], colorClass: "border-rose-400 bg-rose-500/10" },
      { id: "c6", sum: 8, cells: [{ row: 1, col: 1 }, { row: 2, col: 1 }], colorClass: "border-indigo-400 bg-indigo-500/10" },
      { id: "c7", sum: 3, cells: [{ row: 1, col: 3 }, { row: 1, col: 4 }], colorClass: "border-teal-400 bg-teal-500/10" },
      { id: "c8", sum: 5, cells: [{ row: 2, col: 2 }, { row: 3, col: 2 }], colorClass: "border-orange-400 bg-orange-500/10" },
      { id: "c9", sum: 11, cells: [{ row: 2, col: 3 }, { row: 2, col: 4 }], colorClass: "border-pink-400 bg-pink-500/10" },
      { id: "c10", sum: 5, cells: [{ row: 2, col: 5 }, { row: 3, col: 5 }], colorClass: "border-blue-400 bg-blue-500/10" },
      { id: "c11", sum: 11, cells: [{ row: 3, col: 0 }, { row: 3, col: 1 }], colorClass: "border-lime-400 bg-lime-500/10" },
      { id: "c12", sum: 5, cells: [{ row: 3, col: 3 }, { row: 3, col: 4 }], colorClass: "border-violet-400 bg-violet-500/10" },
      { id: "c13", sum: 9, cells: [{ row: 4, col: 0 }, { row: 5, col: 0 }], colorClass: "border-fuchsia-400 bg-fuchsia-500/10" },
      { id: "c14", sum: 3, cells: [{ row: 4, col: 1 }, { row: 4, col: 2 }], colorClass: "border-amber-400 bg-amber-500/10" },
      { id: "c15", sum: 9, cells: [{ row: 4, col: 3 }, { row: 5, col: 3 }], colorClass: "border-cyan-400 bg-cyan-500/10" },
      { id: "c16", sum: 9, cells: [{ row: 4, col: 4 }, { row: 4, col: 5 }], colorClass: "border-emerald-400 bg-emerald-500/10" },
      { id: "c17", sum: 9, cells: [{ row: 5, col: 1 }, { row: 5, col: 2 }], colorClass: "border-indigo-400 bg-indigo-500/10" },
      { id: "c18", sum: 3, cells: [{ row: 5, col: 4 }, { row: 5, col: 5 }], colorClass: "border-rose-400 bg-rose-500/10" },
    ],
  },
};

// Interactive Guided Academy Lessons
export interface InteractiveSudokuLesson {
  id: number;
  titleAr: string;
  badgeAr: string;
  ruleTitleAr: string;
  summaryAr: string;
  goalAr: string;
  size: SudokuSize;
  initialGrid: number[][];
  targetCell: { row: number; col: number };
  correctVal: number;
  highlightRows?: number[];
  highlightCols?: number[];
  highlightBox?: { startRow: number; startCol: number; endRow: number; endCol: number };
  hintExplanationAr: string;
  celebrationAr: string;
}

export const INTERACTIVE_SUDOKU_LESSONS: InteractiveSudokuLesson[] = [
  {
    id: 1,
    titleAr: "الدرس 1: قاعدة الصف الذهبية (Row Rule)",
    badgeAr: "الأساسيات 🌟",
    ruleTitleAr: "كل صف يجب أن يضم كل الأرقام دون أي تكرار",
    summaryAr: "في شبكة 4×4 براعم، كل صف يمتد أفقياً يجب أن يحتوي على الأرقام (1، 2، 3، 4).",
    goalAr: "انظر إلى الصف الأول: الأرقام [1, 2, 4] موجودة بالفعل. انقر على الخلية الشاغرة واختر الرقم المفقود!",
    size: 4,
    initialGrid: [
      [1, 2, 0, 4],
      [3, 4, 1, 2],
      [2, 1, 4, 3],
      [4, 3, 2, 1],
    ],
    targetCell: { row: 0, col: 2 },
    correctVal: 3,
    highlightRows: [0],
    hintExplanationAr: "الصف الأول يحتوي على 1 و 2 و 4. الرقم الوحيد الناقص ليكتمل الصف هو (3)!",
    celebrationAr: "رائع جداً! أتقنت قاعدة الصف: لا يتكرر أي رقم وكل الأرقام تحضر كاملة!",
  },
  {
    id: 2,
    titleAr: "الدرس 2: قاعدة العمود الرأسية (Column Rule)",
    badgeAr: "الأعمدة ↕️",
    ruleTitleAr: "كل عمود رأسي يمتد من الأعلى للأسفل يضم جميع الأرقام",
    summaryAr: "العمود مثل الصف تماماً، لا يقبل تكرار أي رقم ويجب أن يحتوي على جميع أرقام الشبكة.",
    goalAr: "انظر إلى العمود الثاني: الأرقام الموجودة هي [2, 3, 1]. ما هو الرقم الناقص لإكمال العمود؟",
    size: 4,
    initialGrid: [
      [3, 2, 1, 4],
      [1, 3, 4, 2],
      [4, 0, 2, 1],
      [2, 1, 3, 4],
    ],
    targetCell: { row: 2, col: 1 },
    correctVal: 4,
    highlightCols: [1],
    hintExplanationAr: "العمود الثاني فيه 2 و 3 و 1. الرقم الوحيد المتبقي ليكتمل العمود هو (4)!",
    celebrationAr: "بطل حقيقي! الآن أصبحت تعرف كيف تكتشف الرقم الناقص في أي عمود رأسي!",
  },
  {
    id: 3,
    titleAr: "الدرس 3: قاعدة المربع الفرعي (2×2 Box)",
    badgeAr: "المربعات 📦",
    ruleTitleAr: "المربعات المحددة بحدود سميكة لا تقبل تكرار أي رقم",
    summaryAr: "الشبكة مقسمة إلى صناديق 2×2، وكل صندوق يعتبر رقعة مغلقة تضم الأرقام كاملة.",
    goalAr: "انظر إلى المربع العلوي الأيمن: الأرقام [1, 4, 2] موجودة بداخله. اختر الرقم الوحيد الناقص في هذا الصندوق!",
    size: 4,
    initialGrid: [
      [2, 4, 1, 0],
      [1, 3, 4, 2],
      [4, 2, 3, 1],
      [3, 1, 2, 4],
    ],
    targetCell: { row: 0, col: 3 },
    correctVal: 3,
    highlightBox: { startRow: 0, startCol: 2, endRow: 1, endCol: 3 },
    hintExplanationAr: "الصندوق 2×2 يحتوي على 1 و 4 و 2. الرقم الوحيد الناقص لإكمال الصندوق هو (3)!",
    celebrationAr: "ممتاز يا عبقري! قاعدة المربعات الفرعية هي سر قوة محترفي السودوكو!",
  },
  {
    id: 4,
    titleAr: "الدرس 4: الحصر والمسح المتقاطع (Cross-Hatching)",
    badgeAr: "تكتيك المحترفين ⚡",
    ruleTitleAr: "مسح الصفوف والأعمدة لحصر مكان الرقم الوحيد في الصندوق",
    summaryAr: "عندما يكون هناك رقمان في صفين متجاورين، فإنهما يغلقان مساراتهما ويتركان خلية واحدة فقط للرقم في الصندوق المقابل.",
    goalAr: "نبحث عن مكان الرقم (1) في المربع السفلي الأيمن. الصفوف المجاورة تغلق مسارات 1، فما هي الخلية الصحيحة؟",
    size: 4,
    initialGrid: [
      [1, 3, 4, 2],
      [4, 2, 3, 1],
      [3, 1, 2, 4],
      [2, 4, 0, 3],
    ],
    targetCell: { row: 3, col: 2 },
    correctVal: 1,
    highlightRows: [3],
    highlightCols: [2],
    highlightBox: { startRow: 2, startCol: 2, endRow: 3, endCol: 3 },
    hintExplanationAr: "في الصف الأخير وفي المربع السفلي الأيمن، الرقم الوحيد المتبقي لإتمام اللوحة هو (1)!",
    celebrationAr: "مذهل! أتقنت استراتيجية الحصر والمسح بالليزر كأبطال المسابقات الدولية!",
  },
  {
    id: 5,
    titleAr: "الدرس 5: الخلية الوحيدة المكشوفة (Naked Single)",
    badgeAr: "الاستنتاج الخارق 🧠",
    ruleTitleAr: "استبعاد أرقام الصف والعمود والمربع ليتبقى رقم حتمي واحد",
    summaryAr: "عندما تتقاطع قيود الصف والعمود والمربع على خلية واحدة وتستبعد كل الأرقام ما عدا رقماً واحداً، فهذا هو الحل المؤكد.",
    goalAr: "الخلية المستهدفة يتقاطع معها الرقم 1 و 3 و 4 من الصف والمربع. ما هو الرقم الوحيد الممكن؟",
    size: 4,
    initialGrid: [
      [4, 1, 3, 2],
      [2, 3, 1, 4],
      [3, 4, 2, 1],
      [1, 0, 4, 3],
    ],
    targetCell: { row: 3, col: 1 },
    correctVal: 2,
    highlightRows: [3],
    highlightCols: [1],
    highlightBox: { startRow: 2, startCol: 0, endRow: 3, endCol: 1 },
    hintExplanationAr: "الصف الرابع فيه 1 و 4 و 3. الرقم الوحيد الذي يمكن وضعه هو (2)!",
    celebrationAr: "عبقرية مطلقة! أصبحت تملك كل مهارات حل السودوكو من الصفر إلى قمة الاحتراف!",
  },
];

// Official Sudoku & Sudoku X Rules Reference Guide
export interface SudokuRuleGuide {
  id: string;
  titleAr: string;
  icon: string;
  descriptionAr: string;
  examplesAr: string[];
}

export const SUDOKU_RULES_GUIDE: SudokuRuleGuide[] = [
  {
    id: "row",
    titleAr: "قاعدة الصفوف (Row Rule)",
    icon: "↔️",
    descriptionAr: "كل صف يمتد أفقياً من اليمين إلى اليسار يجب أن يحتوي على جميع أرقام الشبكة دون أي تكرار لأي رقم إطلاقاً.",
    examplesAr: [
      "في شبكة 4×4: الأرقام [1, 2, 3, 4] تظهر كلها مرة واحدة في الصف.",
      "في شبكة 9×9: الأرقام من [1 إلى 9] تظهر كاملة في كل صف.",
    ],
  },
  {
    id: "col",
    titleAr: "قاعدة الأعمدة (Column Rule)",
    icon: "↕️",
    descriptionAr: "كل عمود رأسي يمتد من الأعلى للأسفل يجب أن يحتوي على جميع الأرقام دون أن يتكرر أي رقم مرتين في نفس العمود.",
    examplesAr: [
      "إذا كان الرقم 5 موجوداً في الخلية العلوية من العمود، فلا يمكن وضعه في أي خلية أخرى في نفس العمود.",
    ],
  },
  {
    id: "box",
    titleAr: "قاعدة الصناديق والمربعات (Box Rule)",
    icon: "📦",
    descriptionAr: "الشبكة مقسمة بحدود سميكة إلى صناديق مستقلة (2×2 في الميني أو 3×3 في الكلاسيك)، كل صندوق هو رقعة مغلقة تضم كل الأرقام دون تكرار.",
    examplesAr: [
      "تظليل المربعات بالتناوب يساعد عينك على حصر الأرقام المفقودة داخل الصندوق بسرعة فائقة.",
    ],
  },
  {
    id: "diagonal",
    titleAr: "قاعدة سودوكو إكس القطرية (Sudoku X)",
    icon: "❌",
    descriptionAr: "في نمط السودوكو القطرية (Sudoku X)، يضاف شرط رابع استثنائي: القطران الرئيسيان المتقاطعان (الخطان المشكلان لحرف X) يجب ألا يتكرر فيهما أي رقم أبداً!",
    examplesAr: [
      "الخلايا الواقعة على القطر المظلل باللون النيلي/الأزرق تخضع لقانون عدم التكرار على امتداد القطر كاملاً.",
      "تعتبر من أكثر الأنماط متعة وإثارة لرفع مستوى التركيز والذكاء الرياضي.",
    ],
  },
  {
    id: "killer",
    titleAr: "قاعدة سودوكو القاتل (Killer Sudoku)",
    icon: "🎯",
    descriptionAr: "في سودوكو القاتل، تُحاط مجموعات من الخلايا بأقفاص ذات حدود منقطة مع رقم صغير في الزاوية يمثل مجموع الأرقام داخل القفص، مع شرط عدم تكرار أي رقم داخل القفص نفسه!",
    examplesAr: [
      "قفص مكون من خليتين مجموعهما 3: الرقمين هما حتماً (1 و 2).",
      "قفص مكون من خليتين مجموعهما 17 في شبكة 9×9: الرقمين هما حتماً (8 و 9).",
    ],
  },
];

// 4-Stage Academy Lessons
export interface SudokuLesson {
  id: number;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  steps: {
    ruleAr: string;
    ruleEn: string;
    tipAr: string;
    tipEn: string;
  }[];
}

export const SUDOKU_LESSONS: SudokuLesson[] = [
  {
    id: 1,
    titleAr: "المستوى 1: القواعد الذهبية للسودوكو",
    titleEn: "Stage 1: Golden Rules",
    summaryAr: "فهم البنية الأساسية للشبكة: الصفوف والأعمدة والمربعات دون أي تكرار.",
    summaryEn: "Understanding rows, columns, and boxes without duplicates.",
    steps: [
      {
        ruleAr: "كل صف يجب أن يحتوي على جميع الأرقام دون تكرار أي رقم أبداً.",
        ruleEn: "Every row must contain all numbers exactly once.",
        tipAr: "ابحث عن الصفوف التي يتبقى فيها رقم واحد أو رقمين فقط.",
        tipEn: "Scan for rows missing just 1 or 2 digits.",
      },
      {
        ruleAr: "كل عمود يمتد من الأعلى للأسفل يجب أن يحتوي أيضاً على كل الأرقام.",
        ruleEn: "Every vertical column must contain all digits without repeating.",
        tipAr: "إذا كان الرقم 5 موجوداً في العمود، فلا يمكن وضعه في أي خلية أخرى في نفس العمود.",
        tipEn: "If a 5 exists in the column, no other cell in that column can hold 5.",
      },
    ],
  },
  {
    id: 2,
    titleAr: "المستوى 2: قاعدة المربعات الفرعية (Boxes)",
    titleEn: "Stage 2: Sub-grid Boxes",
    summaryAr: "إتقان استراتيجية المربعات المحددة بحدود سميكة والتظليل المتباين.",
    summaryEn: "Mastering regional sub-grids partitioned by bold lines.",
    steps: [
      {
        ruleAr: "الشبكة مقسمة إلى مربعات فرعية (2×2 في الميني أو 3×3 في الكلاسيك).",
        ruleEn: "The grid is divided into distinct boxed regions.",
        tipAr: "المربع مثل الصف والعمود تماماً، لا يقبل تكرار أي رقم بداخله.",
        tipEn: "A box cannot repeat any number internally.",
      },
    ],
  },
  {
    id: 3,
    titleAr: "المستوى 3: الخلية الوحيدة المكشوفة (Naked Single)",
    titleEn: "Stage 3: Naked Singles",
    summaryAr: "كيف تكتشف الخلية التي لا تقبل إلا رقماً واحداً فقط بعد استبعاد الجيران.",
    summaryEn: "Identify cells that can legally hold only one remaining candidate.",
    steps: [
      {
        ruleAr: "إذا نظرت لخلية فارغة، واستبعدت كل الأرقام الموجودة في صفها وعمودها ومربعها، ولم يتبقَ سوى رقم وحيد، فهذا هو الحل المؤكد!",
        ruleEn: "If row, column, and box eliminate all candidates except one, that single number is guaranteed.",
        tipAr: "استخدم قلم المسودة (Pencil Notes) لتدوين الاحتمالات الصغيرة في زاوية الخلية.",
        tipEn: "Use pencil notes to register possible candidates.",
      },
    ],
  },
  {
    id: 4,
    titleAr: "المستوى 4: الاستبعاد المتقاطع (Cross-Hatching)",
    titleEn: "Stage 4: Cross-Hatching Technique",
    summaryAr: "استراتيجية أبطال العالم في حل السودوكو السريع.",
    summaryEn: "World speedcubing and sudoku championship cross-hatching.",
    steps: [
      {
        ruleAr: "تتبع رقماً محدداً عبر صفين متجاورين لاستنتاج مكانه الحتمي في المربع الثالث.",
        ruleEn: "Track a digit across adjacent rows to deduce its mandatory spot in the third box.",
        tipAr: "انظر دائماً للأرقام الأكثر تكراراً في الشبكة في بداية الحل.",
        tipEn: "Start solving by looking at the most frequent numbers on the board.",
      },
    ],
  },
];
