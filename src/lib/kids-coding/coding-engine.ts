/**
 * SUPER MIND IQ - Kids Coding & AI Engine
 * 1. Algorithmic Robot Maze Runner (Visual block queue execution)
 * 2. Visual Scratch-style Blockly Command State
 * 3. Machine Learning & AI Interactive Trainer (Classifier & Decision Tree)
 */

export type Direction = 0 | 1 | 2 | 3; // 0=Up, 1=Right, 2=Down, 3=Left

export interface MazeCell {
  type: "empty" | "wall" | "target" | "coin";
}

export interface RobotState {
  x: number;
  y: number;
  dir: Direction;
}

export interface MazePuzzle {
  id: number;
  titleAr: string;
  titleEn: string;
  conceptAr: string;
  conceptEn: string;
  gridSize: number;
  start: RobotState;
  grid: ("." | "#" | "T" | "C")[][]; // .=empty, #=wall, T=target, C=coin
  maxBlocks: number;
  allowedBlocks: ("forward" | "turn_right" | "turn_left" | "repeat")[];
}

export const MAZE_PUZZLES: MazePuzzle[] = [
  {
    id: 1,
    titleAr: "الخطوات الأولى لروبوت سوبرمايند",
    titleEn: "Robot's First Steps",
    conceptAr: "التسلسل المنطقي (Sequencing)",
    conceptEn: "Algorithmic Sequencing",
    gridSize: 5,
    start: { x: 1, y: 3, dir: 1 },
    grid: [
      ["#", "#", "#", "#", "#"],
      ["#", ".", ".", ".", "#"],
      ["#", ".", "#", ".", "#"],
      ["#", ".", ".", "T", "#"],
      ["#", "#", "#", "#", "#"],
    ],
    maxBlocks: 4,
    allowedBlocks: ["forward", "turn_right", "turn_left"],
  },
  {
    id: 2,
    titleAr: "منعطف الطاقة والبطارية",
    titleEn: "Energy Turn",
    conceptAr: "الاستدارة وتغيير الاتجاهات",
    conceptEn: "Orientation & Turns",
    gridSize: 5,
    start: { x: 1, y: 1, dir: 1 },
    grid: [
      ["#", "#", "#", "#", "#"],
      ["#", ".", ".", ".", "#"],
      ["#", "#", "#", ".", "#"],
      ["#", "T", ".", ".", "#"],
      ["#", "#", "#", "#", "#"],
    ],
    maxBlocks: 6,
    allowedBlocks: ["forward", "turn_right", "turn_left"],
  },
  {
    id: 3,
    titleAr: "جمع كبسولات الكريستال",
    titleEn: "Crystal Collection",
    conceptAr: "تكرار الحركات (Loops)",
    conceptEn: "Loops & Patterns",
    gridSize: 6,
    start: { x: 1, y: 4, dir: 0 },
    grid: [
      ["#", "#", "#", "#", "#", "#"],
      ["#", ".", ".", ".", "T", "#"],
      ["#", ".", "#", "#", ".", "#"],
      ["#", ".", "#", "#", ".", "#"],
      ["#", ".", "C", "C", ".", "#"],
      ["#", "#", "#", "#", "#", "#"],
    ],
    maxBlocks: 7,
    allowedBlocks: ["forward", "turn_right", "turn_left", "repeat"],
  },
  {
    id: 4,
    titleAr: "متاهة العقبات المعقدة",
    titleEn: "Obstacle Course",
    conceptAr: "الخوارزميات المدمجة والتفكير التحليلي",
    conceptEn: "Compound Algorithmic Thinking",
    gridSize: 6,
    start: { x: 1, y: 1, dir: 1 },
    grid: [
      ["#", "#", "#", "#", "#", "#"],
      ["#", ".", ".", "#", ".", "#"],
      ["#", "#", ".", "#", ".", "#"],
      ["#", ".", ".", ".", ".", "#"],
      ["#", ".", "#", "#", "T", "#"],
      ["#", "#", "#", "#", "#", "#"],
    ],
    maxBlocks: 10,
    allowedBlocks: ["forward", "turn_right", "turn_left", "repeat"],
  },
];

// Block definitions
export type BlockType = "forward" | "turn_right" | "turn_left" | "repeat";

export interface ProgramBlock {
  id: string;
  type: BlockType;
  repeatCount?: number;
  subBlocks?: ProgramBlock[];
}

export function executeRobotStep(
  robot: RobotState,
  action: "forward" | "turn_right" | "turn_left",
  grid: string[][]
): { nextRobot: RobotState; valid: boolean; hitTarget: boolean; collectedCoin: boolean } {
  if (action === "turn_right") {
    const nextDir = ((robot.dir + 1) % 4) as Direction;
    return { nextRobot: { ...robot, dir: nextDir }, valid: true, hitTarget: false, collectedCoin: false };
  }
  if (action === "turn_left") {
    const nextDir = ((robot.dir + 3) % 4) as Direction;
    return { nextRobot: { ...robot, dir: nextDir }, valid: true, hitTarget: false, collectedCoin: false };
  }

  // Forward
  let dx = 0;
  let dy = 0;
  if (robot.dir === 0) dy = -1; // up
  if (robot.dir === 1) dx = 1;  // right
  if (robot.dir === 2) dy = 1;  // down
  if (robot.dir === 3) dx = -1; // left

  const nx = robot.x + dx;
  const ny = robot.y + dy;

  // Check boundaries
  if (ny < 0 || ny >= grid.length || nx < 0 || nx >= grid[0].length) {
    return { nextRobot: robot, valid: false, hitTarget: false, collectedCoin: false };
  }

  const cell = grid[ny][nx];
  if (cell === "#") {
    return { nextRobot: robot, valid: false, hitTarget: false, collectedCoin: false };
  }

  const hitTarget = cell === "T";
  const collectedCoin = cell === "C";

  return {
    nextRobot: { ...robot, x: nx, y: ny },
    valid: true,
    hitTarget,
    collectedCoin,
  };
}

// -------------------------------------------------------------
// Interactive Kids AI Classifier
// -------------------------------------------------------------
export interface TrainingItem {
  id: string;
  label: "cat" | "dog";
  color: "orange" | "white" | "black";
  earType: "pointy" | "floppy";
  sound: "meow" | "woof";
}

export const INITIAL_AI_ITEMS: TrainingItem[] = [
  { id: "1", label: "cat", color: "orange", earType: "pointy", sound: "meow" },
  { id: "2", label: "cat", color: "white", earType: "pointy", sound: "meow" },
  { id: "3", label: "dog", color: "black", earType: "floppy", sound: "woof" },
  { id: "4", label: "dog", color: "orange", earType: "floppy", sound: "woof" },
];

export function predictAIClass(
  item: Omit<TrainingItem, "id" | "label">,
  trainingSet: TrainingItem[]
): { prediction: "cat" | "dog"; confidence: number; reasonAr: string; reasonEn: string } {
  if (trainingSet.length === 0) {
    return {
      prediction: "cat",
      confidence: 50,
      reasonAr: "النموذج غير مدرب بعد! يحتاج لبيانات تدريب.",
      reasonEn: "Model not trained yet!",
    };
  }

  // Calculate similarity based on features
  let catScore = 0;
  let dogScore = 0;

  for (const t of trainingSet) {
    let matchCount = 0;
    if (t.color === item.color) matchCount += 1;
    if (t.earType === item.earType) matchCount += 2; // ears are strong feature
    if (t.sound === item.sound) matchCount += 3;

    if (t.label === "cat") catScore += matchCount;
    if (t.label === "dog") dogScore += matchCount;
  }

  const total = catScore + dogScore;
  if (total === 0) {
    return {
      prediction: "cat",
      confidence: 50,
      reasonAr: "تطابق متكافئ بنسبة 50%",
      reasonEn: "Equal probability",
    };
  }

  const prediction = catScore >= dogScore ? "cat" : "dog";
  const confidence = Math.round((Math.max(catScore, dogScore) / total) * 100);

  const dominantReasonAr =
    item.earType === "pointy" && prediction === "cat"
      ? "استنتج الذكاء الاصطناعي أنها قطة بسبب شكل الأذنين المثلثتين المدببتين وصوت المواء."
      : item.earType === "floppy" && prediction === "dog"
      ? "استنتج الذكاء الاصطناعي أنه كلب بسبب الأذنين المتدليتين وصوت النباح."
      : `استند الذكاء الاصطناعي إلى تشابه الخصائص بنسبة ${confidence}%.`;

  return {
    prediction,
    confidence,
    reasonAr: dominantReasonAr,
    reasonEn: `Predicted ${prediction} with ${confidence}% confidence based on feature extraction.`,
  };
}
