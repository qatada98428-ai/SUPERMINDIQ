/**
 * SUPER MIND IQ — Rubik's Cube Engine
 * Full 3x3 Cube state representation, rotation algebra, WCA scrambler,
 * step-by-step LBL (Layer by Layer) beginner academy, and CFOP algorithm library.
 */

export type FaceColor = "white" | "yellow" | "green" | "blue" | "red" | "orange";
export type FaceName = "U" | "D" | "F" | "B" | "L" | "R";

// Standard WCA Facelet Color Mapping:
// U: Yellow, D: White, F: Green, B: Blue, L: Orange, R: Red
export const FACE_COLORS: Record<FaceName, FaceColor> = {
  U: "yellow",
  D: "white",
  F: "green",
  B: "blue",
  L: "orange",
  R: "red",
};

export const COLOR_HEX: Record<FaceColor, string> = {
  white: "#FFFFFF",
  yellow: "#FACC15",
  green: "#22C55E",
  blue: "#3B82F6",
  red: "#EF4444",
  orange: "#F97316",
};

export const COLOR_AR_NAMES: Record<FaceColor, string> = {
  white: "الأبيض",
  yellow: "الأصفر",
  green: "الأخضر",
  blue: "الأزرق",
  red: "الأحمر",
  orange: "البرتقالي",
};

// 3x3 Face state is an array of 9 colors (indices 0..8, row-major from top-left to bottom-right)
export type FaceState = [
  FaceColor, FaceColor, FaceColor,
  FaceColor, FaceColor, FaceColor,
  FaceColor, FaceColor, FaceColor
];

export interface CubeState {
  U: FaceState;
  D: FaceState;
  F: FaceState;
  B: FaceState;
  L: FaceState;
  R: FaceState;
}

export function createSolvedCube(): CubeState {
  return {
    U: Array(9).fill("yellow") as FaceState,
    D: Array(9).fill("white") as FaceState,
    F: Array(9).fill("green") as FaceState,
    B: Array(9).fill("blue") as FaceState,
    L: Array(9).fill("orange") as FaceState,
    R: Array(9).fill("red") as FaceState,
  };
}

export function cloneCube(cube: CubeState): CubeState {
  return {
    U: [...cube.U] as FaceState,
    D: [...cube.D] as FaceState,
    F: [...cube.F] as FaceState,
    B: [...cube.B] as FaceState,
    L: [...cube.L] as FaceState,
    R: [...cube.R] as FaceState,
  };
}

// Clockwise 90-deg face rotation of a 3x3 matrix:
// 0 1 2       6 3 0
// 3 4 5  -->  7 4 1
// 6 7 8       8 5 2
function rotateFaceCW(f: FaceState): FaceState {
  return [
    f[6], f[3], f[0],
    f[7], f[4], f[1],
    f[8], f[5], f[2],
  ];
}

function rotateFaceCCW(f: FaceState): FaceState {
  return [
    f[2], f[5], f[8],
    f[1], f[4], f[7],
    f[0], f[3], f[6],
  ];
}

export type MoveNotation =
  | "U" | "U'" | "U2"
  | "D" | "D'" | "D2"
  | "R" | "R'" | "R2"
  | "L" | "L'" | "L2"
  | "F" | "F'" | "F2"
  | "B" | "B'" | "B2";

export function applyMove(cube: CubeState, move: MoveNotation): CubeState {
  const c = cloneCube(cube);

  switch (move) {
    case "U": {
      c.U = rotateFaceCW(c.U);
      const tmp = [c.F[0], c.F[1], c.F[2]];
      c.F[0] = c.R[0]; c.F[1] = c.R[1]; c.F[2] = c.R[2];
      c.R[0] = c.B[0]; c.R[1] = c.B[1]; c.R[2] = c.B[2];
      c.B[0] = c.L[0]; c.B[1] = c.L[1]; c.B[2] = c.L[2];
      c.L[0] = tmp[0]; c.L[1] = tmp[1]; c.L[2] = tmp[2];
      break;
    }
    case "U'": {
      c.U = rotateFaceCCW(c.U);
      const tmp = [c.F[0], c.F[1], c.F[2]];
      c.F[0] = c.L[0]; c.F[1] = c.L[1]; c.F[2] = c.L[2];
      c.L[0] = c.B[0]; c.L[1] = c.B[1]; c.L[2] = c.B[2];
      c.B[0] = c.R[0]; c.B[1] = c.R[1]; c.B[2] = c.R[2];
      c.R[0] = tmp[0]; c.R[1] = tmp[1]; c.R[2] = tmp[2];
      break;
    }
    case "U2":
      return applyMove(applyMove(c, "U"), "U");

    case "D": {
      c.D = rotateFaceCW(c.D);
      const tmp = [c.F[6], c.F[7], c.F[8]];
      c.F[6] = c.L[6]; c.F[7] = c.L[7]; c.F[8] = c.L[8];
      c.L[6] = c.B[6]; c.L[7] = c.B[7]; c.L[8] = c.B[8];
      c.B[6] = c.R[6]; c.B[7] = c.R[7]; c.B[8] = c.R[8];
      c.R[6] = tmp[0]; c.R[7] = tmp[1]; c.R[8] = tmp[2];
      break;
    }
    case "D'": {
      c.D = rotateFaceCCW(c.D);
      const tmp = [c.F[6], c.F[7], c.F[8]];
      c.F[6] = c.R[6]; c.F[7] = c.R[7]; c.F[8] = c.R[8];
      c.R[6] = c.B[6]; c.R[7] = c.B[7]; c.R[8] = c.B[8];
      c.B[6] = c.L[6]; c.B[7] = c.L[7]; c.B[8] = c.L[8];
      c.L[6] = tmp[0]; c.L[7] = tmp[1]; c.L[8] = tmp[2];
      break;
    }
    case "D2":
      return applyMove(applyMove(c, "D"), "D");

    case "R": {
      c.R = rotateFaceCW(c.R);
      const tmp = [c.U[2], c.U[5], c.U[8]];
      c.U[2] = c.F[2]; c.U[5] = c.F[5]; c.U[8] = c.F[8];
      c.F[2] = c.D[2]; c.F[5] = c.D[5]; c.F[8] = c.D[8];
      c.D[2] = c.B[6]; c.D[5] = c.B[3]; c.D[8] = c.B[0];
      c.B[6] = tmp[0]; c.B[3] = tmp[1]; c.B[0] = tmp[2];
      break;
    }
    case "R'": {
      c.R = rotateFaceCCW(c.R);
      const tmp = [c.U[2], c.U[5], c.U[8]];
      c.U[2] = c.B[6]; c.U[5] = c.B[3]; c.U[8] = c.B[0];
      c.B[6] = c.D[2]; c.B[3] = c.D[5]; c.B[0] = c.D[8];
      c.D[2] = c.F[2]; c.D[5] = c.F[5]; c.D[8] = c.F[8];
      c.F[2] = tmp[0]; c.F[5] = tmp[1]; c.F[8] = tmp[2];
      break;
    }
    case "R2":
      return applyMove(applyMove(c, "R"), "R");

    case "L": {
      c.L = rotateFaceCW(c.L);
      const tmp = [c.U[0], c.U[3], c.U[6]];
      c.U[0] = c.B[8]; c.U[3] = c.B[5]; c.U[6] = c.B[2];
      c.B[8] = c.D[0]; c.B[5] = c.D[3]; c.B[2] = c.D[6];
      c.D[0] = c.F[0]; c.D[3] = c.F[3]; c.D[6] = c.F[6];
      c.F[0] = tmp[0]; c.F[3] = tmp[1]; c.F[6] = tmp[2];
      break;
    }
    case "L'": {
      c.L = rotateFaceCCW(c.L);
      const tmp = [c.U[0], c.U[3], c.U[6]];
      c.U[0] = c.F[0]; c.U[3] = c.F[3]; c.U[6] = c.F[6];
      c.F[0] = c.D[0]; c.F[3] = c.D[3]; c.F[6] = c.D[6];
      c.D[0] = c.B[8]; c.D[3] = c.B[5]; c.D[6] = c.B[2];
      c.B[8] = tmp[0]; c.B[5] = tmp[1]; c.B[2] = tmp[2];
      break;
    }
    case "L2":
      return applyMove(applyMove(c, "L"), "L");

    case "F": {
      c.F = rotateFaceCW(c.F);
      const tmp = [c.U[6], c.U[7], c.U[8]];
      c.U[6] = c.L[8]; c.U[7] = c.L[5]; c.U[8] = c.L[2];
      c.L[8] = c.D[2]; c.L[5] = c.D[1]; c.L[2] = c.D[0];
      c.D[2] = c.R[0]; c.D[1] = c.R[3]; c.D[0] = c.R[6];
      c.R[0] = tmp[0]; c.R[3] = tmp[1]; c.R[6] = tmp[2];
      break;
    }
    case "F'": {
      c.F = rotateFaceCCW(c.F);
      const tmp = [c.U[6], c.U[7], c.U[8]];
      c.U[6] = c.R[0]; c.U[7] = c.R[3]; c.U[8] = c.R[6];
      c.R[0] = c.D[2]; c.R[3] = c.D[1]; c.R[6] = c.D[0];
      c.D[2] = c.L[8]; c.D[1] = c.L[5]; c.D[0] = c.L[2];
      c.L[8] = tmp[0]; c.L[5] = tmp[1]; c.L[2] = tmp[2];
      break;
    }
    case "F2":
      return applyMove(applyMove(c, "F"), "F");

    case "B": {
      c.B = rotateFaceCW(c.B);
      const tmp = [c.U[0], c.U[1], c.U[2]];
      c.U[0] = c.R[2]; c.U[1] = c.R[5]; c.U[2] = c.R[8];
      c.R[2] = c.D[8]; c.R[5] = c.D[7]; c.R[8] = c.D[6];
      c.D[8] = c.L[6]; c.D[7] = c.L[3]; c.D[6] = c.L[0];
      c.L[6] = tmp[0]; c.L[3] = tmp[1]; c.L[0] = tmp[2];
      break;
    }
    case "B'": {
      c.B = rotateFaceCCW(c.B);
      const tmp = [c.U[0], c.U[1], c.U[2]];
      c.U[0] = c.L[6]; c.U[1] = c.L[3]; c.U[2] = c.L[0];
      c.L[6] = c.D[8]; c.L[3] = c.D[7]; c.L[0] = c.D[6];
      c.D[8] = c.R[2]; c.D[7] = c.R[5]; c.D[6] = c.R[8];
      c.R[2] = tmp[0]; c.R[5] = tmp[1]; c.R[8] = tmp[2];
      break;
    }
    case "B2":
      return applyMove(applyMove(c, "B"), "B");
  }

  return c;
}

export function applyMoveSequence(cube: CubeState, seq: string): CubeState {
  const moves = seq.trim().split(/\s+/).filter(Boolean) as MoveNotation[];
  let cur = cube;
  for (const m of moves) {
    cur = applyMove(cur, m);
  }
  return cur;
}

export function isCubeSolved(c: CubeState): boolean {
  const faces: FaceName[] = ["U", "D", "F", "B", "L", "R"];
  for (const f of faces) {
    const target = c[f][4]; // center color
    if (c[f].some((clr) => clr !== target)) return false;
  }
  return true;
}

// Generate official WCA-style random 20-move scramble
export function generateWcaScramble(length: number = 20): string {
  const faces: FaceName[] = ["U", "D", "R", "L", "F", "B"];
  const modifiers = ["", "'", "2"];
  const result: string[] = [];

  let lastFace = "";
  let secondLastFace = "";

  for (let i = 0; i < length; i++) {
    let face = faces[Math.floor(Math.random() * faces.length)];
    while (face === lastFace || (face === secondLastFace && areOppositeFaces(face, lastFace))) {
      face = faces[Math.floor(Math.random() * faces.length)];
    }

    const mod = modifiers[Math.floor(Math.random() * modifiers.length)];
    result.push(`${face}${mod}`);

    secondLastFace = lastFace;
    lastFace = face;
  }

  return result.join(" ");
}

function areOppositeFaces(f1: string, f2: string): boolean {
  return (
    (f1 === "U" && f2 === "D") || (f1 === "D" && f2 === "U") ||
    (f1 === "R" && f2 === "L") || (f1 === "L" && f2 === "R") ||
    (f1 === "F" && f2 === "B") || (f1 === "B" && f2 === "F")
  );
}

// =========================================================================
// LBL BEGINNER'S METHOD ACADEMY CURRICULUM
// =========================================================================

export interface RubiksLesson {
  id: string;
  stageNumber: number;
  titleAr: string;
  titleEn: string;
  taglineAr: string;
  taglineEn: string;
  goalAr: string;
  goalEn: string;
  steps: {
    titleAr: string;
    descriptionAr: string;
    algorithm?: string;
    tipAr?: string;
  }[];
  practiceAlgorithms: string[];
}

export const LBL_STAGES: RubiksLesson[] = [
  {
    id: "stage-1-daisy",
    stageNumber: 1,
    titleAr: "المرحلة الأولى: زهرة الربيع (The Daisy)",
    titleEn: "Stage 1: The White Daisy",
    taglineAr: "تجميع الحواف البيضاء الأربع حول المركز الأصفر",
    taglineEn: "Gather the 4 white edges around the yellow center",
    goalAr: "الهدف هو وضع 4 حواف بيضاء حول المركز الأصفر في الوجه العلوي ليشبه شكل زهرة الأقحوان.",
    goalEn: "The goal is to position 4 white edge pieces around the yellow center piece on the top face.",
    steps: [
      {
        titleAr: "البحث عن الحواف البيضاء",
        descriptionAr: "امسك المكعب بحيث يكون الوجه الأصفر بالأعلى والوجه الأبيض بالأسفل. ابحث عن أي حافة تحتوي على اللون الأبيض.",
        tipAr: "الحواف (Edges) تملك لونين فقط، بينما الزوايا تملك 3 ألوان.",
      },
      {
        titleAr: "رفع الحافة للأعلى",
        descriptionAr: "إذا كانت الحافة في الطبقة الوسطى، حركة واحدة (R أو L' أو F) كفيلة برفعها إلى الوجه العلوي.",
        algorithm: "R U R'",
      },
      {
        titleAr: "إفساح المجال للحواف الجديدة",
        descriptionAr: "إذا كان المكان مشغولاً بحافة بيضاء سابقة، أدر الوجه العلوي (U) لإفساح خانة فارغة قبل رفع الحافة الجديدة.",
        algorithm: "U F",
      },
    ],
    practiceAlgorithms: ["R U R'", "L' U' L", "F U R"],
  },
  {
    id: "stage-2-cross",
    stageNumber: 2,
    titleAr: "المرحلة الثانية: الصليب الأبيض (The White Cross)",
    titleEn: "Stage 2: The White Cross",
    taglineAr: "إنشاء الصليب الأبيض الحقيقي مع مطابقة ألوان المراكز",
    taglineEn: "Create the true white cross with matching center colors",
    goalAr: "نقل الحواف البيضاء من زهرة الربيع إلى الوجه الأبيض السفلي مع مطابقة لون الحافة الجانبي مع مركز الوجه المقابل.",
    goalEn: "Transfer the white edges from the daisy to the white bottom face while matching side colors with adjacent centers.",
    steps: [
      {
        titleAr: "مطابقة اللون الجانبي",
        descriptionAr: "اختر إحدى الحواف البيضاء في الوجه العلوي. انظر إلى لونها الجانبي (مثلاً: أزرق). أدر الوجه العلوي (U) حتى تطابق المركز الأزرق.",
      },
      {
        titleAr: "إنزال الحافة للأسفل بمقدار 180 درجة",
        descriptionAr: "أدر الوجه الأمامي مرتين (F2) لإنزال الحافة البيضاء إلى القاع الأبيض بجانب المركز الأبيض.",
        algorithm: "F2",
      },
      {
        titleAr: "تكرار الخطوة للحواف الأربع",
        descriptionAr: "كرر العملية لبقية الحواف الثلاث حتى يكتمل الصليب الأبيض في الأسفل.",
        algorithm: "U R2 U' L2",
      },
    ],
    practiceAlgorithms: ["F2", "R2", "B2", "L2"],
  },
  {
    id: "stage-3-corners",
    stageNumber: 3,
    titleAr: "المرحلة الثالثة: زوايا الطبقة الأولى",
    titleEn: "Stage 3: First Layer Corners",
    taglineAr: "إكمال الوجه الأبيض بالكامل مع الصف الأول المتناسق",
    taglineEn: "Complete the entire white face and first colored layer",
    goalAr: "تثبيت زوايا الوجه الأبيض الأربع في أماكنها الصحيحة باستخدام الخوارزمية الرباعية السحرية (Sexy Move).",
    goalEn: "Insert the 4 white corner pieces into their correct spots using the fundamental 4-move algorithm.",
    steps: [
      {
        titleAr: "الخوارزمية الرباعية الأساسية (Sexy Move)",
        descriptionAr: "هذه أهم وأشهر خوارزمية في مكعب روبيك وتتكون من 4 حركات فقط: (R U R' U').",
        algorithm: "R U R' U'",
        tipAr: "كررها 6 مرات على مكعب محلول وسيعود إلى حالته الأصلية تماماً!",
      },
      {
        titleAr: "محاذاة الزاوية فوق مكانها",
        descriptionAr: "ابحث عن زاوية فيها لون أبيض في الطبقة العلوية. ضعها بين المركزين المطابقين للونيها الآخرين (مثلاً: زاوية أبيض-أحمر-أزرق توضع بين الأحمر والأزرق).",
      },
      {
        titleAr: "تنفيذ الخوارزمية",
        descriptionAr: "طبق الخوارزمية (R U R' U') من 1 إلى 5 مرات حتى تستقر الزاوية في مكانها السفلي الصحيح باللون الأبيض.",
        algorithm: "R U R' U'",
      },
    ],
    practiceAlgorithms: ["R U R' U'", "L' U' L U"],
  },
  {
    id: "stage-4-middle",
    stageNumber: 4,
    titleAr: "المرحلة الرابعة: حواف الطبقة الوسطى",
    titleEn: "Stage 4: Second Layer Edges",
    taglineAr: "حل الحواف الأربع للطبقة الثانية لاكتمال ثلثي المكعب",
    taglineEn: "Solve the 4 middle layer edge pieces to complete 2/3 of the cube",
    goalAr: "إدخال الحواف الأربع في الطبقة الوسطى دون تخريب الطبقة الأولى المحلولة.",
    goalEn: "Insert edges into the second layer without disturbing the completed first layer.",
    steps: [
      {
        titleAr: "البحث عن حافة بدون أصفر",
        descriptionAr: "ابحث في الطبقة العلوية عن حافة لا تحتوي على اللون الأصفر. طابق لونها الأمامي مع المركز المطابق له لتشكل حرف T مقلوب.",
      },
      {
        titleAr: "إذا كانت الحافة بحاجة للذهاب لليمين",
        descriptionAr: "أدر الوجه العلوي بعيداً إلى اليسار، ثم طبق خوارزمية اليمين ثم خوارزمية اليسار.",
        algorithm: "U R U' R' U' F' U F",
      },
      {
        titleAr: "إذا كانت الحافة بحاجة للذهاب لليسار",
        descriptionAr: "أدر الوجه العلوي بعيداً إلى اليمين، ثم طبق خوارزمية اليسار ثم اليمين.",
        algorithm: "U' L' U L U F U' F'",
      },
    ],
    practiceAlgorithms: ["U R U' R' U' F' U F", "U' L' U L U F U' F'"],
  },
  {
    id: "stage-5-yellow-cross",
    stageNumber: 5,
    titleAr: "المرحلة الخامسة: الصليب الأصفر",
    titleEn: "Stage 5: The Yellow Cross",
    taglineAr: "تشكيل علامة الزائد الصفراء في الوجه العلوي",
    taglineEn: "Form the yellow plus sign on the top face",
    goalAr: "تحويل أي نمط أصفر في الأعلى (نقطة، زاوية 9:00، أو خط أفقي) إلى صليب أصفر كامل.",
    goalEn: "Transform any top yellow pattern (dot, 9 o'clock angle, or horizontal bar) into a full yellow cross.",
    steps: [
      {
        titleAr: "حالة الخط الأفقي",
        descriptionAr: "امسك المكعب بحيث يكون الخط الأصفر أفقياً، ثم طبق الخوارزمية التالية:",
        algorithm: "F R U R' U' F'",
      },
      {
        titleAr: "حالة الزاوية (حرف L الصغير)",
        descriptionAr: "ضع الزاوية في الزاوية العلوية اليسرى (تشير للساعة 9:00 و 12:00)، ثم طبق نفس الخوارزمية أو صيغتها المزدوجة.",
        algorithm: "F R U R' U' F'",
      },
      {
        titleAr: "حالة النقطة الوحيدة",
        descriptionAr: "طبق الخوارزمية مرة لتتحول إلى زاوية، ثم أعد توجيهها وطبقها مرة ثانية لتصل للصليب.",
        algorithm: "F R U R' U' F'",
      },
    ],
    practiceAlgorithms: ["F R U R' U' F'"],
  },
  {
    id: "stage-6-orient-edges",
    stageNumber: 6,
    titleAr: "المرحلة السادسة: محاذاة حواف الوجه الأصفر",
    titleEn: "Stage 6: Align Yellow Edges",
    taglineAr: "مطابقة ألوان حواف الصليب الأصفر مع المراكز الجانبية",
    taglineEn: "Match the side colors of the yellow cross with lateral centers",
    goalAr: "تبديل مواقع حواف الصليب الأصفر حتى يتطابق كل لون مع مركزه الجانبي (الأخضر مع الأخضر، الأحمر مع الأحمر...).",
    goalEn: "Swap yellow cross edges until each aligns with its matching lateral center color.",
    steps: [
      {
        titleAr: "البحث عن حافتين متطابقتين",
        descriptionAr: "أدر الوجه العلوي حتى تجد حافتين متطابقتين مع مراكزهما. ضع واحدة بالخلف وواحدة باليمين (إذا كانتا متجاورتين).",
      },
      {
        titleAr: "خوارزمية سن (Sune Algorithm)",
        descriptionAr: "هذه الخوارزمية تبدل الحواف المتبقية بسلاسة فائقة:",
        algorithm: "R U R' U R U2 R' U",
      },
    ],
    practiceAlgorithms: ["R U R' U R U2 R' U"],
  },
  {
    id: "stage-7-corners",
    stageNumber: 7,
    titleAr: "المرحلة السابعة: ترتيب وتوجيه الزوايا الأخيرة (حل المكعب بالكامل! 🎉)",
    titleEn: "Stage 7: Position & Orient Last Corners",
    taglineAr: "وضع الزوايا في أماكنها وقلبها ليكتمل المكعب 100%",
    taglineEn: "Position the last corners and twist them to completely solve the cube!",
    goalAr: "ترتيب الزوايا في مواقعها الصحيحة ثم توجيه اللون الأصفر للأعلى لاكتمال حل المكعب نهائياً.",
    goalEn: "Permute corners into their spots and twist the yellow facelets upward to finish the solve.",
    steps: [
      {
        titleAr: "ترتيب مواقع الزوايا (Niklas Move)",
        descriptionAr: "ابحث عن زاوية موجودة في مكانها الصحيح وضعها يمين-أمام، ثم طبق الخوارزمية لتبديل الزوايا الثلاث الأخرى:",
        algorithm: "U R U' L' U R' U' L",
      },
      {
        titleAr: "توجيه الوجه الأصفر (الإنهاء النهائي)",
        descriptionAr: "اقلب المكعب ليكون الوجه الأصفر بالأسفل والأبيض بالأعلى! ضع الزاوية غير المحلولة في يمين-أسفل، وطبق (R U R' U') مرتين أو 4 مرات حتى ينزل الأصفر للقاع. ثم أدر الطبقة السفلية (D') وانتقل للزاوية التالية!",
        algorithm: "R U R' U'",
        tipAr: "احذر من تدوير المكعب بالكامل أثناء هذه الخطوة! أدر فقط الطبقة السفلية D.",
      },
    ],
    practiceAlgorithms: ["U R U' L' U R' U' L", "R U R' U'"],
  },
];

// =========================================================================
// CFOP ADVANCED ALGORITHM REFERENCE LIBRARY
// =========================================================================

export interface CfopAlgorithm {
  name: string;
  category: "OLL" | "PLL" | "F2L";
  notation: string;
  descriptionAr: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

export const CFOP_LIBRARY: CfopAlgorithm[] = [
  // 2-Look OLL Essentials
  {
    name: "Sune (OLL 27)",
    category: "OLL",
    notation: "R U R' U R U2 R'",
    descriptionAr: "أشهر خوارزميات توجيه الزوايا الصفراء بحركة انسيابية سريعة.",
    difficulty: "beginner",
  },
  {
    name: "Anti-Sune (OLL 26)",
    category: "OLL",
    notation: "R' U' R U' R' U2 R",
    descriptionAr: "معكوس خوارزمية Sune لتوجيه الزوايا المعاكسة فورياً.",
    difficulty: "beginner",
  },
  {
    name: "Car (OLL 21)",
    category: "OLL",
    notation: "R U2 R' U' R U R' U' R U' R'",
    descriptionAr: "توجيه أربع زوايا صفراء عند غياب أي زاوية علوية.",
    difficulty: "intermediate",
  },
  {
    name: "Headlights (OLL 23)",
    category: "OLL",
    notation: "R2 D R' U2 R D' R' U2 R'",
    descriptionAr: "توجيه زاويتين متجاورتين بأسلوب أضواء السيارة الأمامية.",
    difficulty: "intermediate",
  },
  // 2-Look PLL Essentials
  {
    name: "T-Perm (PLL)",
    category: "PLL",
    notation: "R U R' U' R' F R2 U' R' U' R U R' F'",
    descriptionAr: "تبديل زاويتين متجاورتين مع حافتين متقابلتين في خطوة واحدة مذهلة.",
    difficulty: "intermediate",
  },
  {
    name: "Y-Perm (PLL)",
    category: "PLL",
    notation: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
    descriptionAr: "تبديل زاويتين قطريتين مع حافتين.",
    difficulty: "intermediate",
  },
  {
    name: "Ua-Perm (PLL)",
    category: "PLL",
    notation: "R U' R U R U R U' R' U' R2",
    descriptionAr: "تبديل ثلاث حواف في اتجاه عقارب الساعة مع ثبات كامل للزوايا.",
    difficulty: "beginner",
  },
  {
    name: "Ub-Perm (PLL)",
    category: "PLL",
    notation: "R2 U R U R' U' R' U' R' U R'",
    descriptionAr: "تبديل ثلاث حواف عكس اتجاه عقارب الساعة بإنهاء سريع.",
    difficulty: "beginner",
  },
  {
    name: "H-Perm (PLL)",
    category: "PLL",
    notation: "M2 U M2 U2 M2 U M2",
    descriptionAr: "تبديل الحواف المتقابلة (الأمامية مع الخلفية، واليمنى مع اليسرى).",
    difficulty: "beginner",
  },
];
