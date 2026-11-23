/**
 * SUPER MIND IQ - Sudoku Engine
 * Supports 4x4 (Kids Mini), 6x6 (Midi), and 9x9 (Classic)
 * Features:
 * - Dynamic random puzzle generator for unlimited unique boards
 * - Classic and Diagonal (Sudoku X) rules
 * - Real-time conflict detection (Row, Column, Box, Diagonal)
 * - Remaining digits counter
 * - Auto-cleaning candidate pencil notes
 * - Visual explanatory Smart Tutor (Naked Single, Cross-Hatching)
 * - 5-Stage interactive guided lessons
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
  difficulty: "easy" | "medium";
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

// Generate a random valid full solution grid
export function generateRandomSolvedGrid(
  size: SudokuSize,
  isDiagonal: boolean = false
): number[][] {
  const grid: number[][] = Array.from({ length: size }, () => Array(size).fill(0));

  // If size === 9 and not diagonal, pre-fill independent diagonal boxes for speed
  if (size === 9 && !isDiagonal) {
    for (let b = 0; b < 9; b += 3) {
      const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      let idx = 0;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          grid[b + r][b + c] = nums[idx++];
        }
      }
    }
  } else if (size === 4 && !isDiagonal) {
    const nums1 = shuffleArray([1, 2, 3, 4]);
    const nums2 = shuffleArray([1, 2, 3, 4]);
    grid[0][0] = nums1[0]; grid[0][1] = nums1[1];
    grid[1][0] = nums1[2]; grid[1][1] = nums1[3];
    grid[2][2] = nums2[0]; grid[2][3] = nums2[1];
    grid[3][2] = nums2[2]; grid[3][3] = nums2[3];
  }

  function fill(): boolean {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === 0) {
          const numbers = shuffleArray(Array.from({ length: size }, (_, i) => i + 1));
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

// Generate dynamic random puzzle by removing clues based on difficulty
export function generateDynamicPuzzle(
  size: SudokuSize,
  difficulty: "easy" | "medium",
  isDiagonal: boolean = false
): SudokuPuzzle {
  const solution = generateRandomSolvedGrid(size, isDiagonal);
  const initialGrid = solution.map((r) => [...r]);

  // Determine number of clues to keep
  let cluesToKeep: number;
  if (size === 4) {
    cluesToKeep = difficulty === "easy" ? 9 : 6;
  } else if (size === 6) {
    cluesToKeep = difficulty === "easy" ? 18 : 14;
  } else {
    // 9x9
    cluesToKeep = difficulty === "easy" ? 38 : 30;
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
    initialGrid[pos.r][pos.c] = 0;
    removed++;
  }

  return {
    size,
    difficulty,
    initialGrid,
    solution,
    isDiagonal,
  };
}

// Preset verified puzzles (as fallback or instant start)
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

// Smart Hint calculation with visual teaching context
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
}

export function findSmartHint(
  grid: number[][],
  solution: number[][],
  size: SudokuSize,
  isDiagonal: boolean = false
): SudokuHint | null {
  const { boxRows, boxCols } = getBoxDimensions(size);

  // 1. Search for Naked Single (cell with only 1 candidate left)
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
          return {
            row: r,
            col: c,
            val,
            techniqueAr: "الخلية الوحيدة المكشوفة (Naked Single)",
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
          };
        }
      }
    }
  }

  // 2. Cross-Hatching Search
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
            return {
              row: spot.r,
              col: spot.c,
              val: num,
              techniqueAr: "استراتيجية الحصر والمسح المتقاطع (Cross-Hatching)",
              techniqueEn: "Cross-Hatching",
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
        return {
          row: r,
          col: c,
          val: solution[r][c],
          techniqueAr: "استنتاج الحصر المنطقي المباشر",
          techniqueEn: "Logical Deduction",
          explanationAr: `بتقاطع الصف (${r + 1}) والعمود (${c + 1})، القيمة المؤكدة للخلية هي (${solution[r][c]}).`,
          explanationEn: `By cross-referencing lines and blocks, cell is (${solution[r][c]}).`,
          highlightRows: [r],
          highlightCols: [c],
        };
      }
    }
  }

  return null;
}

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
