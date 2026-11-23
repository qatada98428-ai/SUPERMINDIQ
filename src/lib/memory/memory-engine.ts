/**
 * SUPER MIND IQ - Memory & Focus Cognitive Engine
 * Science-backed cognitive training tests:
 * 1. Spatial Memory Matrix (الذاكرة المكانية البصرية)
 * 2. Chimp Working Memory Test (اختبار الشمبانزي للتسلسل اللحظي)
 * 3. Auditory Number Sequence (الذاكرة السمعية وصدى الأرقام)
 * 4. Stroop Selective Attention (اختبار ستروب للانتباه والمرونة)
 * 5. Reaction Time (سرعة الاستجابة اللحظية)
 */

export type MemoryTestType = "spatial" | "chimp" | "auditory" | "stroop" | "reaction";

// 1. Spatial Memory Types
export interface SpatialState {
  gridSize: number; // e.g., 3 for 3x3, 4 for 4x4
  activeTiles: number[]; // indices of highlighted tiles
  selectedTiles: number[];
  revealed: boolean;
  score: number;
  level: number;
  strikes: number;
  maxStrikes: number;
}

export function createSpatialLevel(level: number): SpatialState {
  // Level 1-2: 3x3, 3-4 tiles
  // Level 3-5: 4x4, 4-6 tiles
  // Level 6+: 5x5, 6-9 tiles
  let gridSize = 3;
  let tileCount = 3;

  if (level >= 6) {
    gridSize = 5;
    tileCount = Math.min(10, 4 + Math.floor(level / 2));
  } else if (level >= 3) {
    gridSize = 4;
    tileCount = Math.min(6, 3 + level - 2);
  } else {
    gridSize = 3;
    tileCount = 2 + level;
  }

  const totalCells = gridSize * gridSize;
  const indices: number[] = [];
  while (indices.length < tileCount) {
    const r = Math.floor(Math.random() * totalCells);
    if (!indices.includes(r)) indices.push(r);
  }

  return {
    gridSize,
    activeTiles: indices,
    selectedTiles: [],
    revealed: true,
    score: (level - 1) * 120,
    level,
    strikes: 0,
    maxStrikes: 3,
  };
}

// 2. Chimp Sequential Memory Types
export interface ChimpTile {
  index: number;
  val: number; // 1 to N
}

export interface ChimpState {
  gridRows: number;
  gridCols: number;
  tiles: ChimpTile[];
  hidden: boolean;
  expectedVal: number;
  totalNumbers: number;
  level: number;
  completed: boolean;
  failed: boolean;
}

export function createChimpLevel(totalNumbers: number): ChimpState {
  const gridRows = 5;
  const gridCols = 8;
  const totalCells = gridRows * gridCols;

  const used = new Set<number>();
  const tiles: ChimpTile[] = [];

  for (let val = 1; val <= totalNumbers; val++) {
    let pos: number;
    do {
      pos = Math.floor(Math.random() * totalCells);
    } while (used.has(pos));
    used.add(pos);
    tiles.push({ index: pos, val });
  }

  return {
    gridRows,
    gridCols,
    tiles,
    hidden: false,
    expectedVal: 1,
    totalNumbers,
    level: totalNumbers - 2,
    completed: false,
    failed: false,
  };
}

// 3. Auditory Number Sequence
export interface AuditoryProblem {
  digits: number[];
  spokenWords: string[];
}

const ARABIC_DIGIT_WORDS = ["صفر", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"];

export function generateAuditoryProblem(length: number): AuditoryProblem {
  const digits: number[] = [];
  for (let i = 0; i < length; i++) {
    digits.push(Math.floor(Math.random() * 10));
  }
  const spokenWords = digits.map((d) => ARABIC_DIGIT_WORDS[d]);
  return { digits, spokenWords };
}

// 4. Stroop Attention Test
export interface StroopColor {
  nameAr: string;
  nameEn: string;
  css: string;
}

export const STROOP_COLORS: StroopColor[] = [
  { nameAr: "أحمر", nameEn: "Red", css: "#EF4444" },
  { nameAr: "أزرق", nameEn: "Blue", css: "#3B82F6" },
  { nameAr: "أخضر", nameEn: "Green", css: "#10B981" },
  { nameAr: "أصفر", nameEn: "Yellow", css: "#EAB308" },
  { nameAr: "بنفسجي", nameEn: "Purple", css: "#8B5CF6" },
  { nameAr: "برتقالي", nameEn: "Orange", css: "#F97316" },
];

export interface StroopQuestion {
  wordIndex: number;
  colorIndex: number;
  mode: "color" | "word"; // "color" = match font color, "word" = match written word
  options: number[]; // indices into STROOP_COLORS
}

export function generateStroopQuestion(): StroopQuestion {
  const wordIndex = Math.floor(Math.random() * STROOP_COLORS.length);
  let colorIndex: number;
  do {
    colorIndex = Math.floor(Math.random() * STROOP_COLORS.length);
  } while (colorIndex === wordIndex && Math.random() > 0.3); // 70% clash for cognitive interference

  const mode: "color" | "word" = Math.random() > 0.45 ? "color" : "word";
  const correct = mode === "color" ? colorIndex : wordIndex;

  const optionSet = new Set<number>([correct]);
  while (optionSet.size < 4) {
    optionSet.add(Math.floor(Math.random() * STROOP_COLORS.length));
  }

  // Shuffle options
  const options = Array.from(optionSet).sort(() => Math.random() - 0.5);

  return { wordIndex, colorIndex, mode, options };
}

// 5. Radar Cognitive Profile
export interface CognitiveProfile {
  visualMemory: number; // 0-100
  auditoryMemory: number; // 0-100
  selectiveAttention: number; // 0-100
  reactionSpeed: number; // 0-100
  workingMemory: number; // 0-100
}

export function calculateCognitiveScore(stats: {
  spatialMaxLevel: number;
  chimpMaxNumbers: number;
  auditoryMaxLen: number;
  stroopAccuracy: number;
  avgReactionMs: number;
}): CognitiveProfile {
  // Normalize each metric to 0-100%
  const visualMemory = Math.min(100, Math.round((stats.spatialMaxLevel / 8) * 100));
  const workingMemory = Math.min(100, Math.round(((stats.chimpMaxNumbers - 2) / 7) * 100));
  const auditoryMemory = Math.min(100, Math.round(((stats.auditoryMaxLen - 2) / 6) * 100));
  const selectiveAttention = Math.min(100, Math.round(stats.stroopAccuracy));

  // Faster reaction = higher score (e.g., 200ms -> 100%, 600ms -> 30%)
  const reactionSpeed =
    stats.avgReactionMs <= 0
      ? 50
      : Math.min(100, Math.max(20, Math.round(100 - (stats.avgReactionMs - 200) * 0.18)));

  return {
    visualMemory,
    auditoryMemory,
    selectiveAttention,
    reactionSpeed,
    workingMemory,
  };
}
