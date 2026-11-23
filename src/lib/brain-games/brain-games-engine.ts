/**
 * SUPER MIND IQ — Brain Games & Logic Lab Engine
 * Complete algorithms for Tower of Hanoi, Raven's Pattern Matrices,
 * Logic Path Flow, and Weight Balance deductions.
 */

// =========================================================================
// 1. TOWER OF HANOI
// =========================================================================

export interface HanoiState {
  pegs: number[][]; // peg 0, 1, 2 storing disc sizes (e.g. [3, 2, 1] -> 3 is bottom, 1 is top)
  numDiscs: number;
  movesCount: number;
  minMoves: number;
  isSolved: boolean;
}

export function createHanoiGame(numDiscs: number = 3): HanoiState {
  const initialPeg: number[] = [];
  for (let i = numDiscs; i >= 1; i--) {
    initialPeg.push(i);
  }

  return {
    pegs: [initialPeg, [], []],
    numDiscs,
    movesCount: 0,
    minMoves: Math.pow(2, numDiscs) - 1,
    isSolved: false,
  };
}

export function moveHanoiDisc(state: HanoiState, fromPeg: number, toPeg: number): { state: HanoiState; valid: boolean } {
  if (fromPeg === toPeg) return { state, valid: false };
  const source = state.pegs[fromPeg];
  const target = state.pegs[toPeg];

  if (source.length === 0) return { state, valid: false };

  const disc = source[source.length - 1];
  const targetTop = target.length > 0 ? target[target.length - 1] : Infinity;

  // Cannot place larger disc on top of smaller disc
  if (disc > targetTop) return { state, valid: false };

  const newPegs = state.pegs.map((peg, idx) => {
    if (idx === fromPeg) return peg.slice(0, -1);
    if (idx === toPeg) return [...peg, disc];
    return [...peg];
  });

  const nextMoves = state.movesCount + 1;
  // Solved when all discs are on peg 2 (target)
  const isSolved = newPegs[2].length === state.numDiscs;

  return {
    state: {
      ...state,
      pegs: newPegs,
      movesCount: nextMoves,
      isSolved,
    },
    valid: true,
  };
}

// =========================================================================
// 2. RAVEN'S LOGIC MATRICES
// =========================================================================

export interface RavenCell {
  shape: "circle" | "square" | "triangle" | "star" | "diamond";
  count: number;
  color: string;
  rotationDeg: number;
}

export interface RavenProblem {
  id: string;
  titleAr: string;
  ruleExplanationAr: string;
  matrix: (RavenCell | null)[][]; // 3x3 (position [2][2] is null = question mark)
  options: RavenCell[];
  correctOptionIndex: number;
}

export const RAVEN_PROBLEMS: RavenProblem[] = [
  {
    id: "rv-1",
    titleAr: "نمط تزايد العناصر الهندسي",
    ruleExplanationAr: "في كل صف، يتزايد عدد الأشكال بمقدار +1 من اليسار إلى اليمين (1 -> 2 -> 3).",
    matrix: [
      [
        { shape: "circle", count: 1, color: "#8B5CF6", rotationDeg: 0 },
        { shape: "circle", count: 2, color: "#8B5CF6", rotationDeg: 0 },
        { shape: "circle", count: 3, color: "#8B5CF6", rotationDeg: 0 },
      ],
      [
        { shape: "square", count: 1, color: "#3B82F6", rotationDeg: 0 },
        { shape: "square", count: 2, color: "#3B82F6", rotationDeg: 0 },
        { shape: "square", count: 3, color: "#3B82F6", rotationDeg: 0 },
      ],
      [
        { shape: "triangle", count: 1, color: "#F59E0B", rotationDeg: 0 },
        { shape: "triangle", count: 2, color: "#F59E0B", rotationDeg: 0 },
        null, // ?
      ],
    ],
    options: [
      { shape: "triangle", count: 1, color: "#F59E0B", rotationDeg: 0 },
      { shape: "triangle", count: 3, color: "#F59E0B", rotationDeg: 0 },
      { shape: "square", count: 3, color: "#3B82F6", rotationDeg: 0 },
      { shape: "circle", count: 3, color: "#8B5CF6", rotationDeg: 0 },
    ],
    correctOptionIndex: 1,
  },
  {
    id: "rv-2",
    titleAr: "نمط دوران الأشكال المنطقي",
    ruleExplanationAr: "في كل صف، يدور الشكل بزاوية 90 درجة في اتجاه عقارب الساعة (0° -> 90° -> 180°).",
    matrix: [
      [
        { shape: "diamond", count: 1, color: "#EC4899", rotationDeg: 0 },
        { shape: "diamond", count: 1, color: "#EC4899", rotationDeg: 90 },
        { shape: "diamond", count: 1, color: "#EC4899", rotationDeg: 180 },
      ],
      [
        { shape: "star", count: 1, color: "#10B981", rotationDeg: 0 },
        { shape: "star", count: 1, color: "#10B981", rotationDeg: 90 },
        { shape: "star", count: 1, color: "#10B981", rotationDeg: 180 },
      ],
      [
        { shape: "square", count: 1, color: "#6366F1", rotationDeg: 0 },
        { shape: "square", count: 1, color: "#6366F1", rotationDeg: 90 },
        null, // ?
      ],
    ],
    options: [
      { shape: "square", count: 1, color: "#6366F1", rotationDeg: 0 },
      { shape: "star", count: 1, color: "#10B981", rotationDeg: 180 },
      { shape: "square", count: 1, color: "#6366F1", rotationDeg: 180 },
      { shape: "diamond", count: 1, color: "#EC4899", rotationDeg: 270 },
    ],
    correctOptionIndex: 2,
  },
  {
    id: "rv-3",
    titleAr: "نمط تناوب الألوان والمجموعات",
    ruleExplanationAr: "في كل صف وعمود، يجب أن تظهر الأشكال الثلاثة (دائرة، مربع، نجمة) دون تكرار.",
    matrix: [
      [
        { shape: "circle", count: 1, color: "#8B5CF6", rotationDeg: 0 },
        { shape: "square", count: 1, color: "#3B82F6", rotationDeg: 0 },
        { shape: "star", count: 1, color: "#F59E0B", rotationDeg: 0 },
      ],
      [
        { shape: "star", count: 1, color: "#F59E0B", rotationDeg: 0 },
        { shape: "circle", count: 1, color: "#8B5CF6", rotationDeg: 0 },
        { shape: "square", count: 1, color: "#3B82F6", rotationDeg: 0 },
      ],
      [
        { shape: "square", count: 1, color: "#3B82F6", rotationDeg: 0 },
        { shape: "star", count: 1, color: "#F59E0B", rotationDeg: 0 },
        null, // ?
      ],
    ],
    options: [
      { shape: "circle", count: 1, color: "#8B5CF6", rotationDeg: 0 },
      { shape: "star", count: 1, color: "#F59E0B", rotationDeg: 0 },
      { shape: "triangle", count: 1, color: "#10B981", rotationDeg: 0 },
      { shape: "square", count: 1, color: "#3B82F6", rotationDeg: 0 },
    ],
    correctOptionIndex: 0,
  },
  {
    id: "rv-4",
    titleAr: "نمط جمع النقاط والرموز",
    ruleExplanationAr: "في كل صف، عدد الأشكال في الخانة الثالثة يساوي مجموع الخانة الأولى والثانية (1 + 1 = 2، 1 + 2 = 3).",
    matrix: [
      [
        { shape: "diamond", count: 1, color: "#EC4899", rotationDeg: 0 },
        { shape: "diamond", count: 1, color: "#EC4899", rotationDeg: 0 },
        { shape: "diamond", count: 2, color: "#EC4899", rotationDeg: 0 },
      ],
      [
        { shape: "star", count: 1, color: "#10B981", rotationDeg: 0 },
        { shape: "star", count: 2, color: "#10B981", rotationDeg: 0 },
        { shape: "star", count: 3, color: "#10B981", rotationDeg: 0 },
      ],
      [
        { shape: "circle", count: 1, color: "#8B5CF6", rotationDeg: 0 },
        { shape: "circle", count: 2, color: "#8B5CF6", rotationDeg: 0 },
        null, // ?
      ],
    ],
    options: [
      { shape: "circle", count: 1, color: "#8B5CF6", rotationDeg: 0 },
      { shape: "circle", count: 2, color: "#8B5CF6", rotationDeg: 0 },
      { shape: "circle", count: 3, color: "#8B5CF6", rotationDeg: 0 },
      { shape: "star", count: 3, color: "#10B981", rotationDeg: 0 },
    ],
    correctOptionIndex: 2,
  },
  {
    id: "rv-5",
    titleAr: "نمط تدرج زوايا الدوران العكسي",
    ruleExplanationAr: "في كل صف، يدور المثلث بزاوية 90 درجة عكس عقارب الساعة.",
    matrix: [
      [
        { shape: "triangle", count: 1, color: "#3B82F6", rotationDeg: 0 },
        { shape: "triangle", count: 1, color: "#3B82F6", rotationDeg: 270 },
        { shape: "triangle", count: 1, color: "#3B82F6", rotationDeg: 180 },
      ],
      [
        { shape: "triangle", count: 2, color: "#8B5CF6", rotationDeg: 0 },
        { shape: "triangle", count: 2, color: "#8B5CF6", rotationDeg: 270 },
        { shape: "triangle", count: 2, color: "#8B5CF6", rotationDeg: 180 },
      ],
      [
        { shape: "triangle", count: 3, color: "#F59E0B", rotationDeg: 0 },
        { shape: "triangle", count: 3, color: "#F59E0B", rotationDeg: 270 },
        null, // ?
      ],
    ],
    options: [
      { shape: "triangle", count: 3, color: "#F59E0B", rotationDeg: 90 },
      { shape: "triangle", count: 3, color: "#F59E0B", rotationDeg: 180 },
      { shape: "triangle", count: 2, color: "#8B5CF6", rotationDeg: 180 },
      { shape: "circle", count: 3, color: "#F59E0B", rotationDeg: 180 },
    ],
    correctOptionIndex: 1,
  },
];

// =========================================================================
// 3. WEIGHT BALANCE LOGIC
// =========================================================================

export interface BalanceItem {
  name: string;
  symbol: string;
  color: string;
}

export interface BalanceScaleProblem {
  id: string;
  titleAr: string;
  premise1: { left: string[]; right: string[] };
  premise2: { left: string[]; right: string[] };
  questionTarget: string[]; // e.g. ["star"]
  options: { count: number; symbol: string }[];
  correctIndex: number;
  explanationAr: string;
}

export const BALANCE_PROBLEMS: BalanceScaleProblem[] = [
  {
    id: "bal-1",
    titleAr: "ميزان النجوم والدوائر",
    premise1: { left: ["⭐"], right: ["🟣", "🟣"] }, // 1 Star = 2 Circles
    premise2: { left: ["🟣"], right: ["🔺", "🔺"] }, // 1 Circle = 2 Triangles
    questionTarget: ["⭐"], // How many Triangles equal 1 Star?
    options: [
      { count: 2, symbol: "🔺" },
      { count: 4, symbol: "🔺" },
      { count: 6, symbol: "🔺" },
      { count: 3, symbol: "🔺" },
    ],
    correctIndex: 1, // 4 Triangles
    explanationAr: "بما أن النجمة = دائرتين، وكل دائرة = مثلثين، إذن النجمة = 2 × 2 = 4 مثلثات!",
  },
  {
    id: "bal-2",
    titleAr: "ميزان المربعات والمكعبات",
    premise1: { left: ["🟦", "🟦"], right: ["🟡", "🟡", "🟡", "🟡"] }, // 2 Squares = 4 Yellows -> 1 Sq = 2 Yellows
    premise2: { left: ["🟡", "🟡"], right: ["💎"] }, // 2 Yellows = 1 Gem
    questionTarget: ["🟦"], // How many Gems equal 1 Square?
    options: [
      { count: 1, symbol: "💎" },
      { count: 2, symbol: "💎" },
      { count: 3, symbol: "💎" },
      { count: 4, symbol: "💎" },
    ],
    correctIndex: 0, // 1 Gem
    explanationAr: "المربعان = 4 دوائر صفراء، إذن المربع الواحد = دائرتين. وبما أن الدائرتين = جوهرة واحدة، إذن المربع = جوهرة واحدة!",
  },
  {
    id: "bal-3",
    titleAr: "ميزان الجواهر والمثلثات",
    premise1: { left: ["💎", "💎"], right: ["🔺", "🔺", "🔺", "🔺", "🔺", "🔺"] }, // 2 Gems = 6 Triangles -> 1 Gem = 3 Triangles
    premise2: { left: ["🔺", "🔺", "🔺"], right: ["⭐", "⭐"] }, // 3 Triangles = 2 Stars
    questionTarget: ["💎"], // How many Stars equal 1 Gem?
    options: [
      { count: 1, symbol: "⭐" },
      { count: 2, symbol: "⭐" },
      { count: 3, symbol: "⭐" },
      { count: 4, symbol: "⭐" },
    ],
    correctIndex: 1, // 2 Stars
    explanationAr: "جوهرتان = 6 مثلثات، إذن الجوهرة الواحدة = 3 مثلثات. وبما أن 3 مثلثات = نجمتين، إذن الجوهرة الواحدة = نجمتين!",
  },
  {
    id: "bal-4",
    titleAr: "ميزان الكرات متعددة الرتب",
    premise1: { left: ["🟣"], right: ["🟢", "🟢", "🟢"] }, // 1 Purple = 3 Green
    premise2: { left: ["🟢", "🟢"], right: ["🟡", "🟡", "🟡", "🟡"] }, // 2 Green = 4 Yellow -> 1 Green = 2 Yellow
    questionTarget: ["🟣"], // How many Yellows equal 1 Purple?
    options: [
      { count: 4, symbol: "🟡" },
      { count: 5, symbol: "🟡" },
      { count: 6, symbol: "🟡" },
      { count: 8, symbol: "🟡" },
    ],
    correctIndex: 2, // 6 Yellows
    explanationAr: "بما أن الكرة البنفسجية = 3 كرات خضراء، وكل كرة خضراء = كرتين صفراوين (4 ÷ 2 = 2)، إذن البنفسجية = 3 × 2 = 6 كرات صفراء!",
  },
];
