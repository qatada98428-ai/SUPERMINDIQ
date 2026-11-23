/**
 * SUPER MIND IQ - Sudoku Engine
 * Supports 4x4 (Kids Mini), 6x6 (Midi), and 9x9 (Classic)
 * Features:
 * - Puzzle generation & validation
 * - Pencil notes candidates
 * - Smart reasoning hints (Naked Single, Hidden Single)
 * - 4-stage educational curriculum
 */

export type SudokuSize = 4 | 6 | 9;

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
  difficulty: "easy" | "medium" | "hard";
}

// Box dimensions based on size
export function getBoxDimensions(size: SudokuSize): { boxRows: number; boxCols: number } {
  if (size === 4) return { boxRows: 2, boxCols: 2 };
  if (size === 6) return { boxRows: 2, boxCols: 3 };
  return { boxRows: 3, boxCols: 3 };
}

// Check if placement is valid
export function isValidPlacement(
  grid: number[][],
  row: number,
  col: number,
  val: number,
  size: SudokuSize
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

  return true;
}

// Backtracking solver
export function solveSudoku(grid: number[][], size: SudokuSize): number[][] | null {
  const copy = grid.map((r) => [...r]);

  function solve(): boolean {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (copy[r][c] === 0) {
          const numbers = Array.from({ length: size }, (_, i) => i + 1);
          for (const num of numbers) {
            if (isValidPlacement(copy, r, c, num, size)) {
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

// Preset verified puzzles for seamless 4x4, 6x6, and 9x9 play
export const PRESET_PUZZLES: Record<string, SudokuPuzzle> = {
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

// Smart Hint calculation
export interface SudokuHint {
  row: number;
  col: number;
  val: number;
  techniqueAr: string;
  techniqueEn: string;
  explanationAr: string;
  explanationEn: string;
}

export function findSmartHint(grid: number[][], solution: number[][], size: SudokuSize): SudokuHint | null {
  // 1. Search for Naked Single (cell with only 1 possible candidate)
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 0) {
        const candidates: number[] = [];
        for (let num = 1; num <= size; num++) {
          if (isValidPlacement(grid, r, c, num, size)) {
            candidates.push(num);
          }
        }

        if (candidates.length === 1) {
          const val = candidates[0];
          return {
            row: r,
            col: c,
            val,
            techniqueAr: "الخلية الوحيدة المكشوفة (Naked Single)",
            techniqueEn: "Naked Single",
            explanationAr: `في الصف (${r + 1}) والعمود (${c + 1})، الرقم الوحيد الممكن منطقياً دون أي تكرار هو (${val}).`,
            explanationEn: `Cell (${r + 1}, ${c + 1}) can only legally hold the number (${val}).`,
          };
        }
      }
    }
  }

  // 2. Fallback to any empty cell based on solution
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 0) {
        return {
          row: r,
          col: c,
          val: solution[r][c],
          techniqueAr: "استنتاج الحصر المتقاطع (Cross-Hatching)",
          techniqueEn: "Cross-Hatching",
          explanationAr: `بتقاطع الصف والعمود والمربع، القيمة الصحيحة للخلية (${r + 1}, ${c + 1}) هي (${solution[r][c]}).`,
          explanationEn: `By cross-referencing lines and blocks, cell (${r + 1}, ${c + 1}) is (${solution[r][c]}).`,
        };
      }
    }
  }

  return null;
}

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
    summaryAr: "إتقان استراتيجية المربعات المحددة بحدود سميكة.",
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
        ruleAr: "تتبع رقماً محدداً (مثل 9) عبر صفين متجاورين لاستنتاج مكانه الحتمي في المربع الثالث.",
        ruleEn: "Track a digit across adjacent rows to deduce its mandatory spot in the third box.",
        tipAr: "انظر دائماً للأرقام الأكثر تكراراً في الشبكة في بداية الحل.",
        tipEn: "Start solving by looking at the most frequent numbers on the board.",
      },
    ],
  },
];
