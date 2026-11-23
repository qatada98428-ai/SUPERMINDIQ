/**
 * SUPER MIND — Vedic Math & Rapid Mental Arithmetic Data Engine
 * منظومة أسرار الرياضيات وحيل الحساب السريع (رياضيات الفيدا)
 * تتضمن 4 مستويات تعليمية كاملة، 20 قاعدة محكمة رياضياً مع مولد أسئلة ديناميكي
 * وتصحيح فوري وشرح خطوة بخطوة لكل مستوى.
 */

export interface WorkedStep {
  stepNumber: number;
  explanationAr: string;
  explanationEn: string;
  mathExpression: string;
}

export interface WorkedExample {
  problem: string;
  answer: number | string;
  difficulty: "easy" | "medium" | "hard";
  steps: WorkedStep[];
}

export interface GeneratedQuestion {
  id: string;
  problem: string;
  correctAnswer: number | string;
  options: Array<number | string>;
  explanationSteps: string[];
  hintAr: string;
  hintEn: string;
}

export interface VedicLesson {
  id: string;
  levelId: 1 | 2 | 3 | 4;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  icon: string;
  badgeAr: string;
  badgeEn: string;
  ruleExplanationAr: string;
  ruleExplanationEn: string;
  mathTheoryAr: string;
  mathTheoryEn: string;
  conditionsAr: string[];
  conditionsEn: string[];
  limitsAr: string;
  limitsEn: string;
  workedExamples: WorkedExample[];
  generateQuestion: (difficulty: "easy" | "medium" | "hard") => GeneratedQuestion;
}

export interface VedicLevel {
  id: 1 | 2 | 3 | 4;
  titleAr: string;
  titleEn: string;
  taglineAr: string;
  taglineEn: string;
  colorGradient: string;
  accentColor: string;
  lessons: VedicLesson[];
}

// =========================================================================
// HELPER UTILITIES FOR RANDOM QUESTION GENERATION
// =========================================================================
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const res = [...arr];
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
}

function generateNumericDistractors(correct: number, count = 3, deltaRange = 10): number[] {
  const set = new Set<number>();
  set.add(correct);
  let attempts = 0;
  while (set.size < count + 1 && attempts < 50) {
    attempts++;
    const delta = randChoice([-deltaRange, -5, -2, -1, 1, 2, 5, deltaRange, -deltaRange * 2, deltaRange * 2]);
    const val = correct + delta;
    if (val > 0 && val !== correct) {
      set.add(val);
    }
  }
  const result = Array.from(set).filter((v) => v !== correct).slice(0, count);
  return shuffle([correct, ...result]);
}

// =========================================================================
// LEVEL 1: أساسيات الحساب السريع (Mental Math Fundamentals)
// =========================================================================
export const LEVEL_1_LESSONS: VedicLesson[] = [
  // 1. الضرب في 5
  {
    id: "mul-by-5",
    levelId: 1,
    titleAr: "الضرب في 5 بثانية واحدة",
    titleEn: "Multiply by 5 in One Second",
    subtitleAr: "اقسم على 2 وضع صفراً أو 5 في النهاية",
    subtitleEn: "Halve and multiply by 10",
    icon: "⚡",
    badgeAr: "أساسيات 1",
    badgeEn: "Basics 1",
    ruleExplanationAr:
      "بدلاً من حفظ جدول الضرب للأرقام الكبيرة، اضرب العدد في 10 ثم اقسمه على 2 (أو العكس: نصف العدد ثم أضف صفراً إذا كان زوجياً، أو احذف الفاصلة واكتب 5 إذا كان فردياً).",
    ruleExplanationEn:
      "To multiply any number by 5, divide it by 2 and multiply by 10. If even, halve it and append 0. If odd, subtract 1, halve it, and append 5.",
    mathTheoryAr: "تعتمد القاعدة على المتطابقة: N × 5 = N × (10 ÷ 2) = (N ÷ 2) × 10.",
    mathTheoryEn: "Based on identity: N × 5 = N × (10 / 2) = (N / 2) × 10.",
    conditionsAr: ["تصلح لجميع الأعداد الصحيحة الموجبة.", "سريعة للغاية مع الأعداد الزوجية."],
    conditionsEn: ["Applies to all positive integers.", "Instant for even numbers."],
    limitsAr: "إذا كان العدد كبيراً جداً وفردياً، يُفضل تقسيم العدد إلى أجزاء (مئات، عشرات، آحاد).",
    limitsEn: "For large odd numbers, partition into hundreds, tens, and units.",
    workedExamples: [
      {
        problem: "48 × 5",
        answer: 240,
        difficulty: "easy",
        steps: [
          { stepNumber: 1, explanationAr: "48 عدد زوجي، نأخذ نصفه:", explanationEn: "48 is even, take its half:", mathExpression: "48 ÷ 2 = 24" },
          { stepNumber: 2, explanationAr: "نضيف صفراً في خانة الآحاد:", explanationEn: "Append 0 to the right:", mathExpression: "24 → 240" },
        ],
      },
      {
        problem: "75 × 5",
        answer: 375,
        difficulty: "medium",
        steps: [
          { stepNumber: 1, explanationAr: "75 عدد فردي، نطرح 1:", explanationEn: "75 is odd, subtract 1:", mathExpression: "75 - 1 = 74" },
          { stepNumber: 2, explanationAr: "نصف 74 هو 37:", explanationEn: "Half of 74 is 37:", mathExpression: "74 ÷ 2 = 37" },
          { stepNumber: 3, explanationAr: "نلصق الرقم 5 في النهاية:", explanationEn: "Append 5 to the end:", mathExpression: "37 → 375" },
        ],
      },
      {
        problem: "246 × 5",
        answer: 1230,
        difficulty: "hard",
        steps: [
          { stepNumber: 1, explanationAr: "246 زوجي، نصفه بالنظر:", explanationEn: "246 is even, halve directly:", mathExpression: "246 ÷ 2 = 123" },
          { stepNumber: 2, explanationAr: "نضع 0 في النهاية:", explanationEn: "Append 0:", mathExpression: "123 → 1230" },
        ],
      },
      {
        problem: "375 × 5",
        answer: 1875,
        difficulty: "hard",
        steps: [
          { stepNumber: 1, explanationAr: "375 فردي، نطرح 1 للحصول على الزوجي السابق:", explanationEn: "375 is odd, subtract 1:", mathExpression: "375 - 1 = 374" },
          { stepNumber: 2, explanationAr: "نصف 374 هو 187:", explanationEn: "Half of 374 is 187:", mathExpression: "374 ÷ 2 = 187" },
          { stepNumber: 3, explanationAr: "نلصق الرقم 5 في النهاية:", explanationEn: "Append 5 to the end:", mathExpression: "187 → 1875" },
        ],
      },
    ],
    generateQuestion: (diff) => {
      // Intentionally sample BOTH even and odd cases 50/50 across all difficulties
      const isOdd = Math.random() < 0.5;
      let n: number;
      if (diff === "easy") {
        n = randInt(10, 48);
        if (isOdd && n % 2 === 0) n += 1;
        if (!isOdd && n % 2 !== 0) n += 1;
      } else if (diff === "medium") {
        n = randInt(49, 199);
        if (isOdd && n % 2 === 0) n += 1;
        if (!isOdd && n % 2 !== 0) n += 1;
      } else {
        n = randInt(201, 899);
        if (isOdd && n % 2 === 0) n += 1;
        if (!isOdd && n % 2 !== 0) n += 1;
      }

      const ans = n * 5;
      const isEven = n % 2 === 0;
      const halfInt = Math.floor(n / 2);

      const explanationSteps = isEven
        ? [
            `العدد ${n} عدد زوجي: نأخذ نصفه (${n} ÷ 2 = ${halfInt}).`,
            `بما أنه زوجي، نضيف صفراً في خانة الآحاد: فيكون الناتج النهائي = ${ans}.`,
          ]
        : [
            `العدد ${n} عدد فردي: نطرح 1 لنأخذ العدد الزوجي السابق له (${n} - 1 = ${n - 1}).`,
            `نأخذ نصفه (${n - 1} ÷ 2 = ${halfInt}).`,
            `بما أن العدد الأصلي فردي، نضع الرقم 5 في خانة الآحاد: فيكون الناتج النهائي = ${ans}.`,
          ];

      const hintAr = isEven
        ? `العدد ${n} زوجي: نصفه هو ${halfInt}، ثم ضع صفراً في النهاية.`
        : `العدد ${n} فردي: اطرح 1 فيصبح ${n - 1}، نصفه ${halfInt}، ثم ضع 5 في النهاية.`;

      return {
        id: `q-5-${Date.now()}-${Math.random()}`,
        problem: `${n} × 5`,
        correctAnswer: ans,
        options: generateNumericDistractors(ans, 3, Math.max(15, Math.floor(ans * 0.1))),
        explanationSteps,
        hintAr,
        hintEn: isEven
          ? `Even number: halve ${n} (${halfInt}) and append 0.`
          : `Odd number: subtract 1 (${n - 1}), halve (${halfInt}), and append 5.`,
      };
    },
  },

  // 2. الضرب والقسمة على 11
  {
    id: "mul-div-11",
    levelId: 1,
    titleAr: "الضرب والقسمة على 11",
    titleEn: "Multiply and Divide by 11",
    subtitleAr: "باعد بين الرقمين وضع حاصل جمعهما بالوسط",
    subtitleEn: "Split digits and insert their sum in between",
    icon: "🎯",
    badgeAr: "أساسيات 2",
    badgeEn: "Basics 2",
    ruleExplanationAr:
      "لضرب عدد من رقمين في 11: اكتب الرقمين مع ترك فراغ بينهما، ثم ضع حاصل جمعهما في الوسط. إذا كان المجموع 10 أو أكثر، اترك الآحاد واحمِل 1 إلى الرقم الأيسر.",
    ruleExplanationEn:
      "To multiply a 2-digit number by 11, separate the digits and place their sum in the middle. If sum is 10 or more, carry over 1 to the left digit.",
    mathTheoryAr: "(10a + b) × 11 = 110a + 11b = 100a + 10(a+b) + b.",
    mathTheoryEn: "(10a + b) × 11 = 100a + 10(a+b) + b.",
    conditionsAr: ["مباشرة جداً للأعداد المكونة من رقمين وثلاثة أرقام.", "التحقق من القسمة بالفرق بين مجموع الرتب الفردية والزوجية."],
    conditionsEn: ["Direct for 2 and 3 digit numbers.", "Division verified using alternating sum."],
    limitsAr: "عندما يكون المجموع ≥ 10 يلزم إضافة 1 إلى خانة المئات (الحمل).",
    limitsEn: "When sum exceeds 9, carry 1 to the hundreds place.",
    workedExamples: [
      {
        problem: "35 × 11",
        answer: 385,
        difficulty: "easy",
        steps: [
          { stepNumber: 1, explanationAr: "نباعد بين 3 و 5:", explanationEn: "Separate 3 and 5:", mathExpression: "3 _ 5" },
          { stepNumber: 2, explanationAr: "نجمع الرقمين 3 + 5 = 8 ونضعه في الوسط:", explanationEn: "Add digits 3 + 5 = 8 and put in center:", mathExpression: "3 [8] 5 = 385" },
        ],
      },
      {
        problem: "87 × 11",
        answer: 957,
        difficulty: "medium",
        steps: [
          { stepNumber: 1, explanationAr: "نباعد بين 8 و 7:", explanationEn: "Separate 8 and 7:", mathExpression: "8 _ 7" },
          { stepNumber: 2, explanationAr: "مجموعهما 8 + 7 = 15 (أكبر من 9):", explanationEn: "Their sum is 8 + 7 = 15 (> 9):", mathExpression: "8 [15] 7" },
          { stepNumber: 3, explanationAr: "نضع 5 ونضيف 1 إلى 8 ليصبح 9:", explanationEn: "Write 5, carry 1 to 8 making it 9:", mathExpression: "(8+1) 5 7 = 957" },
        ],
      },
    ],
    generateQuestion: (diff) => {
      // In easy: 2-digit without carry (sum <= 9)
      // In medium: 2-digit with carry (sum >= 10)
      // In hard: 3-digit multiplication by 11
      if (diff === "hard") {
        const d1 = randInt(1, 6);
        const d2 = randInt(1, 5);
        const d3 = randInt(1, 6);
        const n = d1 * 100 + d2 * 10 + d3;
        const ans = n * 11;
        return {
          id: `q-11h-${Date.now()}-${Math.random()}`,
          problem: `${n} × 11`,
          correctAnswer: ans,
          options: generateNumericDistractors(ans, 3, 50),
          explanationSteps: [
            `العدد ${n} مكون من 3 أرقام: نثبت الآحاد (${d3}) في اليمين والمئات (${d1}) في اليسار.`,
            `نجمع كل جارين: (${d2} + ${d3} = ${d2 + d3}) و (${d1} + ${d2} = ${d1 + d2}).`,
            `الناتج النهائي = ${ans}.`,
          ],
          hintAr: `ثبّت الرقمين الخارجيين واجمع كل رقمين متجاورين`,
          hintEn: `Keep outside digits and sum adjacent pairs`,
        };
      }

      const a = randInt(1, 8);
      let b = diff === "easy" ? randInt(1, Math.max(1, 9 - a)) : randInt(Math.max(1, 10 - a), 9);
      if (b > 9) b = 8;
      const n = a * 10 + b;
      const ans = n * 11;
      const sum = a + b;
      const explanationSteps =
        sum < 10
          ? [
              `نباعد بين الرقمين: (${a} _ ${b}).`,
              `نجمع الرقمين: ${a} + ${b} = ${sum} ونضعه في الوسط.`,
              `الناتج النهائي = ${ans}.`,
            ]
          : [
              `نباعد بين الرقمين: (${a} _ ${b}).`,
              `نجمع الرقمين: ${a} + ${b} = ${sum} (أكبر من 9، نترك ${sum % 10} بالوسط ونحمل 1 لليسار).`,
              `نضيف 1 إلى ${a} ليصبح ${a + 1}: الناتج النهائي = ${ans}.`,
            ];

      return {
        id: `q-11-${Date.now()}-${Math.random()}`,
        problem: `${n} × 11`,
        correctAnswer: ans,
        options: generateNumericDistractors(ans, 3, 25),
        explanationSteps,
        hintAr: sum < 10 ? `باعد بين ${a} و ${b} واجمع ${a}+${b}=${sum}` : `مجموعهما ${sum}: اترك ${sum % 10} واحمِل 1 لـ ${a}`,
        hintEn: `Separate ${a} and ${b}, then insert their sum in between`,
      };
    },
  },

  // 3. ضرب الأعداد من 11 إلى 19
  {
    id: "mul-11-to-19",
    levelId: 1,
    titleAr: "ضرب الأعداد من 11 إلى 19",
    titleEn: "Multiply Numbers from 11 to 19",
    subtitleAr: "العدد الأول + آحاد الثاني، ثم ضرب الآحاد",
    subtitleEn: "First number + unit of second, then multiply units",
    icon: "🚀",
    badgeAr: "أساسيات 3",
    badgeEn: "Basics 3",
    ruleExplanationAr:
      "لضرب عددين بين 11 و 19: خذ العدد الأول كاملاً وأضف إليه آحاد العدد الثاني، اضرب الناتج في 10 (ضع صفراً)، ثم أضف إليه حاصل ضرب الآحاد في الآحاد.",
    ruleExplanationEn:
      "To multiply two teens (11-19): add the unit of the second to the entire first number, multiply by 10, then add the product of the units.",
    mathTheoryAr: "(10 + a)(10 + b) = 100 + 10(a + b) + ab = 10((10 + a) + b) + ab.",
    mathTheoryEn: "(10 + a)(10 + b) = 10((10 + a) + b) + ab.",
    conditionsAr: ["كلا العددين يقعان بين 11 و 19."],
    conditionsEn: ["Both numbers are strictly in the range 11 to 19."],
    limitsAr: "لا تنطبق إذا كان أحد العددين 20 أو أكثر (لها قاعدة أخرى بالأساس 20).",
    limitsEn: "Does not apply if a factor is 20 or greater.",
    workedExamples: [
      {
        problem: "14 × 13",
        answer: 182,
        difficulty: "easy",
        steps: [
          { stepNumber: 1, explanationAr: "نجمع العدد الأول مع آحاد الثاني:", explanationEn: "Add unit of second to first number:", mathExpression: "14 + 3 = 17" },
          { stepNumber: 2, explanationAr: "نضرب في 10 (نضع صفراً):", explanationEn: "Multiply by 10:", mathExpression: "17 × 10 = 170" },
          { stepNumber: 3, explanationAr: "نضرب الآحاد في الآحاد ونجمع:", explanationEn: "Multiply units and add:", mathExpression: "(4 × 3 = 12) → 170 + 12 = 182" },
        ],
      },
      {
        problem: "17 × 16",
        answer: 272,
        difficulty: "medium",
        steps: [
          { stepNumber: 1, explanationAr: "17 + 6 = 23 → نضرب في 10:", explanationEn: "17 + 6 = 23 → multiply by 10:", mathExpression: "23 × 10 = 230" },
          { stepNumber: 2, explanationAr: "ضرب الآحاد 7 × 6 = 42:", explanationEn: "Multiply units 7 × 6 = 42:", mathExpression: "7 × 6 = 42" },
          { stepNumber: 3, explanationAr: "نجمع 230 + 42 = 272:", explanationEn: "Add 230 + 42 = 272:", mathExpression: "230 + 42 = 272" },
        ],
      },
    ],
    generateQuestion: () => {
      const x = randInt(12, 19);
      const y = randInt(11, 19);
      const ans = x * y;
      const u2 = y % 10;
      return {
        id: `q-teens-${Date.now()}-${Math.random()}`,
        problem: `${x} × ${y}`,
        correctAnswer: ans,
        options: generateNumericDistractors(ans, 3, 15),
        explanationSteps: [`الخطوة 1: (${x} + ${u2}) = ${x + u2} → ${ (x + u2) * 10 }`, `الخطوة 2: (${x % 10} × ${u2}) = ${(x % 10) * u2}`, `الجمع: ${(x + u2) * 10} + ${(x % 10) * u2} = ${ans}`],
        hintAr: `اجمع ${x} + ${u2} = ${x + u2} واضرب في 10، ثم أضف ${x % 10} × ${u2}`,
        hintEn: `Add ${x} + ${u2}, append 0, then add ${(x % 10) * u2}`,
      };
    },
  },

  // 4. الطرح دون استلاف (سوترا نيكيلام)
  {
    id: "sub-without-borrow",
    levelId: 1,
    titleAr: "الطرح دون استلاف (سوترا نيكيلام)",
    titleEn: "Subtraction from Base (Nikhilam Sutra)",
    subtitleAr: "الكل من 9 والآخر من 10 (All from 9 and Last from 10)",
    subtitleEn: "All from 9, last from 10",
    icon: "💡",
    badgeAr: "أساسيات 4",
    badgeEn: "Basics 4",
    ruleExplanationAr:
      "عند طرح أي عدد من قوى العشرة (100، 1000، 10000...): اطرح كل الأرقام من 9 بدءاً من اليسار، واطرح الرقم الأخير من اليمين من 10 دون أي استلاف!",
    ruleExplanationEn:
      "When subtracting from powers of 10 (100, 1000, 10000): subtract every digit from 9 starting from left, and subtract the very last non-zero digit from 10.",
    mathTheoryAr: "10^k - N = (99...9 - N) + 1.",
    mathTheoryEn: "10^k - N = (99...9 - N) + 1.",
    conditionsAr: ["المطروح منه عدد من قوى العشرة (100, 1000, 10000)."],
    conditionsEn: ["Minuend is a power of 10."],
    limitsAr: "إذا كان الرقم الأخير صفراً، نطبق القاعدة على آخر رقم غير صفري وننزل الأصفار كما هي.",
    limitsEn: "If the number ends in zeros, apply to last non-zero digit and preserve trailing zeros.",
    workedExamples: [
      {
        problem: "1000 - 467",
        answer: 533,
        difficulty: "easy",
        steps: [
          { stepNumber: 1, explanationAr: "اطرح أول رقم (4) من 9:", explanationEn: "Subtract first digit 4 from 9:", mathExpression: "9 - 4 = 5" },
          { stepNumber: 2, explanationAr: "اطرح ثاني رقم (6) من 9:", explanationEn: "Subtract second digit 6 from 9:", mathExpression: "9 - 6 = 3" },
          { stepNumber: 3, explanationAr: "اطرح آخر رقم (7) من 10:", explanationEn: "Subtract last digit 7 from 10:", mathExpression: "10 - 7 = 3 → 533" },
        ],
      },
    ],
    generateQuestion: (diff) => {
      const base = diff === "easy" ? 1000 : diff === "medium" ? 10000 : 100000;
      const sub = randInt(base / 10, base - 1);
      const ans = base - sub;
      return {
        id: `q-sub-${Date.now()}-${Math.random()}`,
        problem: `${base} - ${sub}`,
        correctAnswer: ans,
        options: generateNumericDistractors(ans, 3, 20),
        explanationSteps: [`اطرح خانات ${sub} من 9 والخانة الأخيرة من 10`, `الناتج الفوري: ${ans}`],
        hintAr: `اطرح أرقام ${sub} من 9 والآخر من 10`,
        hintEn: `Subtract digits from 9 and last digit from 10`,
      };
    },
  },

  // 5. القسمة على 5 و25 و125
  {
    id: "div-5-25-125",
    levelId: 1,
    titleAr: "القسمة على 5 و25 و125",
    titleEn: "Division by 5, 25, and 125",
    subtitleAr: "تحويل القسمة إلى ضرب سريع (×2، ×4، ×8)",
    subtitleEn: "Convert division to multiplication (x2, x4, x8)",
    icon: "➗",
    badgeAr: "أساسيات 5",
    badgeEn: "Basics 5",
    ruleExplanationAr:
      "بدل القسمة الصعبة: للقسمة على 5 اضرب في 2 واقسم على 10 (حرّك الفاصلة خانة). للقسمة على 25 اضرب في 4 واقسم على 100. للقسمة على 125 اضرب في 8 واقسم على 1000.",
    ruleExplanationEn:
      "To divide by 5: multiply by 2 and divide by 10. To divide by 25: multiply by 4 and divide by 100. To divide by 125: multiply by 8 and divide by 1000.",
    mathTheoryAr: "N ÷ 5 = (2N) ÷ 10, N ÷ 25 = (4N) ÷ 100, N ÷ 125 = (8N) ÷ 1000.",
    mathTheoryEn: "N / 5 = 2N / 10, N / 25 = 4N / 100, N / 125 = 8N / 1000.",
    conditionsAr: ["تعمل مع جميع الأعداد الصحيحة."],
    conditionsEn: ["Works for all integers."],
    limitsAr: "انتبه لموضع الفاصلة العشرية عند القسمة على قوى العشرة.",
    limitsEn: "Ensure proper decimal point placement.",
    workedExamples: [
      {
        problem: "240 ÷ 5",
        answer: 48,
        difficulty: "easy",
        steps: [
          { stepNumber: 1, explanationAr: "اضرب في 2:", explanationEn: "Multiply by 2:", mathExpression: "240 × 2 = 480" },
          { stepNumber: 2, explanationAr: "احذف الصفر (قسمة على 10):", explanationEn: "Divide by 10:", mathExpression: "480 ÷ 10 = 48" },
        ],
      },
      {
        problem: "175 ÷ 25",
        answer: 7,
        difficulty: "medium",
        steps: [
          { stepNumber: 1, explanationAr: "اضرب في 4:", explanationEn: "Multiply by 4:", mathExpression: "175 × 4 = 700" },
          { stepNumber: 2, explanationAr: "احذف صفرين (قسمة على 100):", explanationEn: "Divide by 100:", mathExpression: "700 ÷ 100 = 7" },
        ],
      },
    ],
    generateQuestion: (diff) => {
      const divisor = diff === "easy" ? 5 : diff === "medium" ? 25 : 125;
      const factor = diff === "easy" ? 2 : diff === "medium" ? 4 : 8;
      const k = randInt(3, 30);
      const n = k * divisor;
      const ans = n / divisor;
      return {
        id: `q-div-${Date.now()}-${Math.random()}`,
        problem: `${n} ÷ ${divisor}`,
        correctAnswer: ans,
        options: generateNumericDistractors(ans, 3, 5),
        explanationSteps: [`اضرب ${n} في ${factor} = ${n * factor}`, `اقسم على ${divisor * factor} فيكون الناتج: ${ans}`],
        hintAr: `اضرب ${n} × ${factor} واقسم على ${divisor * factor}`,
        hintEn: `Multiply by ${factor} and shift decimal`,
      };
    },
  },

  // 6. القسمة على 9
  {
    id: "div-by-9",
    levelId: 1,
    titleAr: "القسمة السريعة على 9 (سوترا بارافارتيا)",
    titleEn: "Instant Division by 9 (Paravartya)",
    subtitleAr: "جمع متسلسل للأرقام من اليسار لليمين",
    subtitleEn: "Sequential running sum from left to right",
    icon: "✨",
    badgeAr: "أساسيات 6",
    badgeEn: "Basics 6",
    ruleExplanationAr:
      "لقسمة عدد على 9: نزّل الرقم الأول في خانة العشرات/المئات كما هو، ثم اجمعه مع الرقم التالي ليعطيك الخانة التالية، ومجموع كل الأرقام يعطيك باقي القسمة!",
    ruleExplanationEn:
      "To divide by 9: drop the first digit as the first quotient digit, add it to the next digit for the second quotient digit. The sum of all digits gives the remainder.",
    mathTheoryAr: "تعتمد على حقيقة أن 10 ≡ 1 (mod 9) وكل خانة تعطي باقياً مساوياً لقيمتها.",
    mathTheoryEn: "Based on 10 = 9 + 1, so each power of 10 leaves a remainder of 1.",
    conditionsAr: ["عندما يكون مجموع الأرقام (الباقي) 9، نضيف 1 للناتج ويكون الباقي 0."],
    conditionsEn: ["If remainder reaches 9, add 1 to quotient and set remainder to 0."],
    limitsAr: "إذا كان الباقي أكبر من 9، نقسم الباقي على 9 ونضيف الناتج للقسمة.",
    limitsEn: "If remainder > 9, divide remainder by 9 and carry over.",
    workedExamples: [
      {
        problem: "123 ÷ 9",
        answer: "13 والباقي 6",
        difficulty: "easy",
        steps: [
          { stepNumber: 1, explanationAr: "الرقم الأول 1 ينزل كما هو:", explanationEn: "Drop first digit 1:", mathExpression: "1" },
          { stepNumber: 2, explanationAr: "نجمع 1 + 2 = 3 (صار خارج القسمة 13):", explanationEn: "Add 1 + 2 = 3 (quotient is 13):", mathExpression: "13" },
          { stepNumber: 3, explanationAr: "نجمع 3 + 3 = 6 (هو الباقي):", explanationEn: "Add 3 + 3 = 6 (remainder):", mathExpression: "الباقي = 6 → 13 ر 6" },
        ],
      },
    ],
    generateQuestion: () => {
      const q = randInt(11, 45);
      const r = randInt(1, 8);
      const n = q * 9 + r;
      const ans = `${q} والباقي ${r}`;
      const wrong1 = `${q - 1} والباقي ${r}`;
      const wrong2 = `${q + 1} والباقي ${r}`;
      const wrong3 = `${q} والباقي ${(r % 8) + 1}`;
      return {
        id: `q-div9-${Date.now()}-${Math.random()}`,
        problem: `${n} ÷ 9`,
        correctAnswer: ans,
        options: shuffle([ans, wrong1, wrong2, wrong3]),
        explanationSteps: [`${q} × 9 = ${q * 9}`, `الباقي: ${n} - ${q * 9} = ${r}`, `الناتج: ${ans}`],
        hintAr: `خارج القسمة قريب من ${q}، والباقي مجموع الأرقام`,
        hintEn: `Quotient is around ${q}, remainder is sum of digits mod 9`,
      };
    },
  },
];

// =========================================================================
// LEVEL 2: مهارات الضرب (Multiplication Mastery)
// =========================================================================
export const LEVEL_2_LESSONS: VedicLesson[] = [
  // 1. ضرب الأعداد القريبة من 100
  {
    id: "mul-near-100",
    levelId: 2,
    titleAr: "ضرب الأعداد القريبة من 100",
    titleEn: "Multiplication of Numbers Near 100",
    subtitleAr: "طريقة الانحراف عن الأساس (Base 100)",
    subtitleEn: "Base 100 deviation method",
    icon: "💯",
    badgeAr: "ضرب 1",
    badgeEn: "Multiplication 1",
    ruleExplanationAr:
      "للأعداد القريبة من 100 (مثل 96 × 94): احسب نقص كل عدد عن 100 (-4 و -6). الجزء الأيسر = (96 - 6 = 90). الجزء الأيمن = (-4 × -6 = 24). الناتج المباشر: 9024!",
    ruleExplanationEn:
      "For numbers near 100: find deviations from 100. Left part = cross subtract deviation. Right part = multiply deviations.",
    mathTheoryAr: "(100 - a)(100 - b) = 100(100 - a - b) + ab.",
    mathTheoryEn: "(100 - a)(100 - b) = 100(100 - a - b) + ab.",
    conditionsAr: ["كلا العددين قريبان من 100 (من 85 إلى 115)."],
    conditionsEn: ["Both numbers are within close range to 100."],
    limitsAr: "يجب كتابة الجزء الأيمن في خانتين (مثلاً 06 بدلاً من 6).",
    limitsEn: "Right side must occupy exactly 2 digits (e.g. 06 not 6).",
    workedExamples: [
      {
        problem: "97 × 95",
        answer: 9215,
        difficulty: "easy",
        steps: [
          { stepNumber: 1, explanationAr: "انحراف 97 هو -3، وانحراف 95 هو -5:", explanationEn: "Deviations are -3 and -5:", mathExpression: "97 (-3), 95 (-5)" },
          { stepNumber: 2, explanationAr: "الجزء الأيسر: 97 - 5 = 92 (أو 95 - 3):", explanationEn: "Left part: 97 - 5 = 92:", mathExpression: "97 - 5 = 92" },
          { stepNumber: 3, explanationAr: "الجزء الأيمن: -3 × -5 = 15:", explanationEn: "Right part: (-3) × (-5) = 15:", mathExpression: "92 | 15 = 9215" },
        ],
      },
      {
        problem: "106 × 108",
        answer: 11448,
        difficulty: "medium",
        steps: [
          { stepNumber: 1, explanationAr: "انحرافات موجبة: +6 و +8:", explanationEn: "Positive deviations: +6 and +8:", mathExpression: "106 (+6), 108 (+8)" },
          { stepNumber: 2, explanationAr: "الجزء الأيسر: 106 + 8 = 114:", explanationEn: "Left part: 106 + 8 = 114:", mathExpression: "106 + 8 = 114" },
          { stepNumber: 3, explanationAr: "الجزء الأيمن: 6 × 8 = 48:", explanationEn: "Right part: 6 × 8 = 48:", mathExpression: "114 | 48 = 11448" },
        ],
      },
    ],
    generateQuestion: (diff) => {
      const mode = diff === "hard" ? "mixed" : diff === "medium" ? "above" : "below";
      let x = 95, y = 94;
      if (mode === "below") {
        x = randInt(91, 98);
        y = randInt(90, 99);
      } else if (mode === "above") {
        x = randInt(102, 109);
        y = randInt(102, 112);
      } else {
        x = randInt(94, 98);
        y = randInt(102, 107);
      }
      const ans = x * y;
      return {
        id: `q-near100-${Date.now()}-${Math.random()}`,
        problem: `${x} × ${y}`,
        correctAnswer: ans,
        options: generateNumericDistractors(ans, 3, 50),
        explanationSteps: [`احسب الانحراف عن 100`, `اطرح/اجمع تقاطعياً`, `اضرب الانحرافين والناتج: ${ans}`],
        hintAr: `كم ينقص أو يزيد ${x} و ${y} عن 100؟`,
        hintEn: `What are the deviations of ${x} and ${y} from 100?`,
      };
    },
  },

  // 2. ضرب عددين بطرق مختصرة (مجموع الآحاد 10 والعشرات متساوية)
  {
    id: "mul-shortcut",
    levelId: 2,
    titleAr: "الضرب بضمان (الآحاد 10 والعشرات متساوية)",
    titleEn: "Complementary Units & Identical Tens",
    subtitleAr: "سوترا إكاديكنا بورفينا (بزيادة واحد عن السابق)",
    subtitleEn: "By one more than previous (Ekadhikena)",
    icon: "🔥",
    badgeAr: "ضرب 2",
    badgeEn: "Multiplication 2",
    ruleExplanationAr:
      "إذا كان مجموع رقمي الآحاد 10 ورقم العشرات متطابقاً (مثل 43 × 47 أو 72 × 78): اضرب رقم العشرات في (العشرات + 1)، واضرب الآحاد في الآحاد وضعهما معاً!",
    ruleExplanationEn:
      "When units sum to 10 and tens are identical: multiply tens by (tens + 1) for the left side, and multiply units for the right side.",
    mathTheoryAr: "(10t + u)(10t + (10-u)) = 100 t(t+1) + u(10-u).",
    mathTheoryEn: "(10t + u)(10t + (10-u)) = 100 t(t+1) + u(10-u).",
    conditionsAr: ["رقم العشرات متطابق تماماً في العددين.", "مجموع رقمي الآحاد يساوي 10 تماماً."],
    conditionsEn: ["Tens digits must be strictly identical.", "Units digits must sum to exactly 10."],
    limitsAr: "إذا كان ضرب الآحاد رقماً واحداً (مثل 1 × 9 = 9) اكتبه في خانتين: 09.",
    limitsEn: "If units product is single digit (1x9=9), format as 09.",
    workedExamples: [
      {
        problem: "43 × 47",
        answer: 2021,
        difficulty: "easy",
        steps: [
          { stepNumber: 1, explanationAr: "العشرات متساوية (4) والآحاد 3 + 7 = 10:", explanationEn: "Tens are equal (4), units sum to 10:", mathExpression: "4 = 4, 3 + 7 = 10" },
          { stepNumber: 2, explanationAr: "الجزء الأيسر: نضرب العشرات في الرقم التالي (4 × 5):", explanationEn: "Left part: 4 × (4 + 1) = 20:", mathExpression: "4 × 5 = 20" },
          { stepNumber: 3, explanationAr: "الجزء الأيمن: نضرب الآحاد (3 × 7):", explanationEn: "Right part: 3 × 7 = 21:", mathExpression: "20 | 21 = 2021" },
        ],
      },
    ],
    generateQuestion: () => {
      const tens = randInt(2, 9);
      const u1 = randInt(1, 9);
      const u2 = 10 - u1;
      const x = tens * 10 + u1;
      const y = tens * 10 + u2;
      const ans = x * y;
      return {
        id: `q-comp-${Date.now()}-${Math.random()}`,
        problem: `${x} × ${y}`,
        correctAnswer: ans,
        options: generateNumericDistractors(ans, 3, 30),
        explanationSteps: [`${tens} × (${tens} + 1) = ${tens * (tens + 1)}`, `${u1} × ${u2} = ${String(u1 * u2).padStart(2, "0")}`, `الناتج: ${ans}`],
        hintAr: `اضرب ${tens} × ${tens + 1} ثم الصق حاصل ضرب ${u1} × ${u2}`,
        hintEn: `Multiply ${tens} by ${tens + 1}, append ${u1}x${u2}`,
      };
    },
  },

  // 3. الضرب الرأسي والمتقاطع (Urdhva Tiryagbhyam)
  {
    id: "mul-cross-vert",
    levelId: 2,
    titleAr: "الضرب الرأسي والمتقاطع (سوترا أوردفا)",
    titleEn: "Vertical and Crosswise (Urdhva Tiryagbhyam)",
    subtitleAr: "أقوى قاعدة لضرب أي عددين مكونين من رقمين في سطر واحد",
    subtitleEn: "General 2x2 digit multiplication in one line",
    icon: "✖️",
    badgeAr: "ضرب 3",
    badgeEn: "Multiplication 3",
    ruleExplanationAr:
      "القاعدة العامة الشاملة لضرب أي رقمين (ab × cd) بثلاث خطوات ذهنياً:\n1) ضرب الآحاد رأسياً (b × d).\n2) ضرب الطرفين والوسطين وجمعهما (ad + bc) مع الحمل.\n3) ضرب العشرات رأسياً (a × c) مع الحمل.",
    ruleExplanationEn:
      "Multiply 2-digit numbers vertically and crosswise: 1) units x units, 2) cross-multiply and add, 3) tens x tens, carrying over as needed.",
    mathTheoryAr: "(10a + b)(10c + d) = 100(ac) + 10(ad + bc) + bd.",
    mathTheoryEn: "(10a + b)(10c + d) = 100(ac) + 10(ad + bc) + bd.",
    conditionsAr: ["تنطبق على جميع الأعداد دون أي شروط خاصة."],
    conditionsEn: ["Applies unconditionally to all 2-digit numbers."],
    limitsAr: "يلزم الانتباه لحفظ أرقام الحمل وإضافتها للخطوة التالية.",
    limitsEn: "Careful tracking of carry numbers is required.",
    workedExamples: [
      {
        problem: "23 × 41",
        answer: 943,
        difficulty: "easy",
        steps: [
          { stepNumber: 1, explanationAr: "ضرب الآحاد رأسياً: 3 × 1 = 3:", explanationEn: "Multiply units: 3 × 1 = 3:", mathExpression: "3" },
          { stepNumber: 2, explanationAr: "ضرب متقاطع: (2×1) + (3×4) = 2 + 12 = 14 (نكتب 4 ونحمل 1):", explanationEn: "Cross-multiply: (2x1)+(3x4) = 14 (write 4, carry 1):", mathExpression: "4 (حمل 1)" },
          { stepNumber: 3, explanationAr: "ضرب العشرات رأسياً مع الحمل: (2×4) + 1 = 9:", explanationEn: "Multiply tens: (2x4) + 1 = 9:", mathExpression: "943" },
        ],
      },
    ],
    generateQuestion: (diff) => {
      const x = diff === "easy" ? randInt(12, 35) : randInt(32, 85);
      const y = diff === "easy" ? randInt(11, 32) : randInt(21, 65);
      const ans = x * y;
      return {
        id: `q-urdhva-${Date.now()}-${Math.random()}`,
        problem: `${x} × ${y}`,
        correctAnswer: ans,
        options: generateNumericDistractors(ans, 3, 40),
        explanationSteps: [`ضرب الآحاد`, `ضرب متقاطع وجمع النواتج`, `ضرب العشرات مع الحمل = ${ans}`],
        hintAr: `اضرب الآحاد، ثم تقاطعياً، ثم العشرات`,
        hintEn: `Multiply units, cross-multiply and add, multiply tens`,
      };
    },
  },

  // 4. ضرب الأعداد المكونة من ثلاثة أرقام
  {
    id: "mul-3-digits",
    levelId: 2,
    titleAr: "ضرب الأعداد المكونة من 3 أرقام",
    titleEn: "3-Digit Cross Multiplication",
    subtitleAr: "خوارزمية الخطوات الخمس السريعة",
    subtitleEn: "5-step lightning algorithm",
    icon: "🌟",
    badgeAr: "ضرب 4",
    badgeEn: "Multiplication 4",
    ruleExplanationAr:
      "توسيع لسوترا أوردفا لخمس خطوات: 1) آحاد×آحاد 2) مقص العشرات والآحاد 3) مقص ثلاثي كامل 4) مقص المئات والعشرات 5) مئات×مئات.",
    ruleExplanationEn:
      "Extend vertical and crosswise to 5 stages: 1) units, 2) tens-units cross, 3) 3-way cross and middle vertical, 4) hundreds-tens cross, 5) hundreds.",
    mathTheoryAr: "تحليل متعدد الحدود وتجميع العوامل حسب قوى الأساس 10.",
    mathTheoryEn: "Polynomial expansion grouped by powers of 10.",
    conditionsAr: ["أعداد من 3 أرقام."],
    conditionsEn: ["3-digit integers."],
    limitsAr: "تتطلب تركيزاً في حفظ نواتج الحمل المتتالية.",
    limitsEn: "Requires attention when handling carry values across 5 stages.",
    workedExamples: [
      {
        problem: "102 × 103",
        answer: 10506,
        difficulty: "easy",
        steps: [
          { stepNumber: 1, explanationAr: "2 × 3 = 06:", explanationEn: "2 × 3 = 06:", mathExpression: "06" },
          { stepNumber: 2, explanationAr: "102 + 3 = 105:", explanationEn: "102 + 3 = 105:", mathExpression: "105" },
          { stepNumber: 3, explanationAr: "الناتج: 10506:", explanationEn: "Result: 10506:", mathExpression: "10506" },
        ],
      },
    ],
    generateQuestion: () => {
      const x = randInt(102, 125);
      const y = randInt(101, 115);
      const ans = x * y;
      return {
        id: `q-3d-${Date.now()}-${Math.random()}`,
        problem: `${x} × ${y}`,
        correctAnswer: ans,
        options: generateNumericDistractors(ans, 3, 50),
        explanationSteps: [`استخدم الضرب المتقاطع الثلاثي`, `الناتج النهائي: ${ans}`],
        hintAr: `احسب بالخطوات الخمس أو بالأساس 100`,
        hintEn: `Apply 3-digit crosswise steps or base 100`,
      };
    },
  },

  // 5. ضرب أي عدد في عدد مكون من رقمين
  {
    id: "mul-any-by-2digit",
    levelId: 2,
    titleAr: "ضرب أي عدد في عدد من رقمين",
    titleEn: "Multiply Any Number by 2 Digits",
    subtitleAr: "تفكيك الضرب بالتوزيع الذكي (المضاعفة والتجزئة)",
    subtitleEn: "Smart partitioning and distribution",
    icon: "⚡",
    badgeAr: "ضرب 5",
    badgeEn: "Multiplication 5",
    ruleExplanationAr:
      "اضرب العدد في العشرات بوضع صفر، ثم اضربه في الآحاد، واجمع الناتجين ذهنياً بدون كتابة مسودة طويلة.",
    ruleExplanationEn:
      "Multiply by the tens digit (append 0), multiply by the units digit, and mentally sum the two results.",
    mathTheoryAr: "N × (10a + b) = 10aN + bN.",
    mathTheoryEn: "N × (10a + b) = 10aN + bN.",
    conditionsAr: ["تصلح لجميع الأعداد."],
    conditionsEn: ["Universal application."],
    limitsAr: "اختر التفكيك الأسهل (مثلاً الضرب في 19 = الضرب في 20 ناقص العدد نفسه).",
    limitsEn: "Pick closest round number (e.g. x19 = x20 - N).",
    workedExamples: [
      {
        problem: "45 × 12",
        answer: 540,
        difficulty: "easy",
        steps: [
          { stepNumber: 1, explanationAr: "45 × 10 = 450:", explanationEn: "45 × 10 = 450:", mathExpression: "450" },
          { stepNumber: 2, explanationAr: "45 × 2 = 90:", explanationEn: "45 × 2 = 90:", mathExpression: "90" },
          { stepNumber: 3, explanationAr: "450 + 90 = 540:", explanationEn: "450 + 90 = 540:", mathExpression: "540" },
        ],
      },
    ],
    generateQuestion: () => {
      const n = randInt(25, 80);
      const mult = randChoice([12, 15, 21, 22, 19]);
      const ans = n * mult;
      return {
        id: `q-part-${Date.now()}-${Math.random()}`,
        problem: `${n} × ${mult}`,
        correctAnswer: ans,
        options: generateNumericDistractors(ans, 3, 30),
        explanationSteps: [`فكك ${mult} إلى أجزائه السهلة`, `الناتج: ${ans}`],
        hintAr: `فكك ${mult} إلى عشرات وآحاد`,
        hintEn: `Decompose ${mult} into round tens and units`,
      };
    },
  },
];

// =========================================================================
// LEVEL 3: التربيع والجذور (Squaring and Roots)
// =========================================================================
export const LEVEL_3_LESSONS: VedicLesson[] = [
  // 1. تربيع الأعداد المنتهية بـ 5
  {
    id: "sq-ending-5",
    levelId: 3,
    titleAr: "تربيع الأعداد المنتهية بالرقم 5",
    titleEn: "Squaring Numbers Ending in 5",
    subtitleAr: "اضرب العشرات في الرقم التالي والصق 25",
    subtitleEn: "Tens x (Tens + 1) and append 25",
    icon: "2️⃣",
    badgeAr: "تربيع 1",
    badgeEn: "Squaring 1",
    ruleExplanationAr:
      "لتربيع أي عدد ينتهي بـ 5 (مثل 35² أو 85²): خذ رقم العشرات واضربه في الرقم الذي يليه مباشرة، ثم الصق 25 في النهاية دائماً!",
    ruleExplanationEn:
      "To square any number ending in 5: multiply the tens digit by the next integer, then append 25.",
    mathTheoryAr: "(10a + 5)² = 100a² + 100a + 25 = 100a(a + 1) + 25.",
    mathTheoryEn: "(10a + 5)² = 100a(a + 1) + 25.",
    conditionsAr: ["آحاد العدد يجب أن تكون 5 حصراً."],
    conditionsEn: ["Units digit must be strictly 5."],
    limitsAr: "سهلة جداً للأعداد من خانتين وثلاث خانات.",
    limitsEn: "Flawless for 2 and 3-digit numbers.",
    workedExamples: [
      {
        problem: "65²",
        answer: 4225,
        difficulty: "easy",
        steps: [
          { stepNumber: 1, explanationAr: "العشرات هو 6، الرقم الذي يليه هو 7:", explanationEn: "Tens digit is 6, next number is 7:", mathExpression: "6 × 7 = 42" },
          { stepNumber: 2, explanationAr: "نلصق 25 في النهاية:", explanationEn: "Append 25:", mathExpression: "42 | 25 = 4225" },
        ],
      },
    ],
    generateQuestion: () => {
      const tens = randInt(2, 12);
      const n = tens * 10 + 5;
      const ans = n * n;
      return {
        id: `q-sq5-${Date.now()}-${Math.random()}`,
        problem: `${n}²`,
        correctAnswer: ans,
        options: generateNumericDistractors(ans, 3, 50),
        explanationSteps: [`${tens} × ${tens + 1} = ${tens * (tens + 1)}`, `نلصق 25 في النهاية: ${ans}`],
        hintAr: `اضرب ${tens} × ${tens + 1} والصق 25`,
        hintEn: `Multiply ${tens} by ${tens + 1} and append 25`,
      };
    },
  },

  // 2. تربيع الأعداد القريبة من 50
  {
    id: "sq-near-50",
    levelId: 3,
    titleAr: "تربيع الأعداد القريبة من 50",
    titleEn: "Squaring Numbers Near 50",
    subtitleAr: "قاعدة (25 ± الفارق) مع تربيع الفارق",
    subtitleEn: "Base 25 +/- deviation rule",
    icon: "🎯",
    badgeAr: "تربيع 2",
    badgeEn: "Squaring 2",
    ruleExplanationAr:
      "للأعداد القريبة من 50: احسب الفارق عن 50 (d). الجزء الأيسر = 25 + d (أو 25 - d إذا كان أقل). الجزء الأيمن = d² في خانتين.",
    ruleExplanationEn:
      "For numbers near 50 (50 +/- d): left side is 25 +/- d, right side is d² formatted in 2 digits.",
    mathTheoryAr: "(50 + d)² = 2500 + 100d + d² = 100(25 + d) + d².",
    mathTheoryEn: "(50 + d)² = 100(25 + d) + d².",
    conditionsAr: ["الأعداد من 40 إلى 60."],
    conditionsEn: ["Numbers typically between 40 and 60."],
    limitsAr: "إذا كان d² رقماً واحداً يوضع صفر قبله (مثل 3² = 09).",
    limitsEn: "Single digit d² requires leading zero (e.g. 09).",
    workedExamples: [
      {
        problem: "53²",
        answer: 2809,
        difficulty: "easy",
        steps: [
          { stepNumber: 1, explanationAr: "الفارق عن 50 هو +3:", explanationEn: "Deviation from 50 is +3:", mathExpression: "53 - 50 = +3" },
          { stepNumber: 2, explanationAr: "الجزء الأيسر: 25 + 3 = 28:", explanationEn: "Left side: 25 + 3 = 28:", mathExpression: "25 + 3 = 28" },
          { stepNumber: 3, explanationAr: "الجزء الأيمن: 3² = 09:", explanationEn: "Right side: 3² = 09:", mathExpression: "28 | 09 = 2809" },
        ],
      },
    ],
    generateQuestion: () => {
      const d = randChoice([-7, -6, -4, -3, -2, -1, 1, 2, 3, 4, 6, 7]);
      const n = 50 + d;
      const ans = n * n;
      return {
        id: `q-sq50-${Date.now()}-${Math.random()}`,
        problem: `${n}²`,
        correctAnswer: ans,
        options: generateNumericDistractors(ans, 3, 40),
        explanationSteps: [`الفارق عن 50 هو ${d}`, `الجزء الأيسر: 25 + (${d}) = ${25 + d}`, `الجزء الأيمن: (${Math.abs(d)})² = ${String(d * d).padStart(2, "0")}`, `الناتج: ${ans}`],
        hintAr: `اجمع أو اطرح الفارق من 25، والصق مربع الفارق`,
        hintEn: `25 +/- deviation, append deviation squared`,
      };
    },
  },

  // 3. تربيع الأعداد القريبة من 100
  {
    id: "sq-near-100",
    levelId: 3,
    titleAr: "تربيع الأعداد القريبة من 100",
    titleEn: "Squaring Numbers Near 100",
    subtitleAr: "العدد + الفارق، مع مربع الفارق",
    subtitleEn: "Number + deviation, and deviation squared",
    icon: "💎",
    badgeAr: "تربيع 3",
    badgeEn: "Squaring 3",
    ruleExplanationAr:
      "لتربيع عدد قريب من 100: احسب الفارق عن 100 (d). الجزء الأيسر = العدد + الفارق (أو ناقص الفارق). الجزء الأيمن = d² في خانتين.",
    ruleExplanationEn:
      "For numbers near 100: left part = number + deviation, right part = deviation squared.",
    mathTheoryAr: "(100 + d)² = 100(100 + 2d) + d².",
    mathTheoryEn: "(100 + d)² = 100(100 + 2d) + d².",
    conditionsAr: ["الأعداد بين 88 و 112."],
    conditionsEn: ["Numbers around 100."],
    limitsAr: "ضع الفارق التربيعي في خانتين.",
    limitsEn: "Two digits for right part.",
    workedExamples: [
      {
        problem: "106²",
        answer: 11236,
        difficulty: "easy",
        steps: [
          { stepNumber: 1, explanationAr: "الفارق هو +6:", explanationEn: "Deviation is +6:", mathExpression: "106 - 100 = +6" },
          { stepNumber: 2, explanationAr: "الجزء الأيسر: 106 + 6 = 112:", explanationEn: "Left side: 106 + 6 = 112:", mathExpression: "106 + 6 = 112" },
          { stepNumber: 3, explanationAr: "الجزء الأيمن: 6² = 36:", explanationEn: "Right side: 6² = 36:", mathExpression: "112 | 36 = 11236" },
        ],
      },
    ],
    generateQuestion: () => {
      const d = randChoice([-8, -7, -5, -4, -3, -2, 2, 3, 4, 5, 7, 8]);
      const n = 100 + d;
      const ans = n * n;
      return {
        id: `q-sq100-${Date.now()}-${Math.random()}`,
        problem: `${n}²`,
        correctAnswer: ans,
        options: generateNumericDistractors(ans, 3, 50),
        explanationSteps: [`الفارق عن 100 هو ${d}`, `الجزء الأيسر: ${n} + (${d}) = ${n + d}`, `الجزء الأيمن: (${Math.abs(d)})² = ${String(d * d).padStart(2, "0")}`, `الناتج: ${ans}`],
        hintAr: `أضف الفارق للعدد (${n} + ${d}) والصق مربعه`,
        hintEn: `Add deviation to ${n}, append square of deviation`,
      };
    },
  },

  // 4. تربيع الأعداد المكونة من ثلاثة أرقام
  {
    id: "sq-3-digits",
    levelId: 3,
    titleAr: "تربيع الأعداد المكونة من 3 أرقام",
    titleEn: "Squaring 3-Digit Numbers",
    subtitleAr: "طريقة دواندوا يوغا (Duplex Method)",
    subtitleEn: "Vedic Duplex (Dwandwa Yoga)",
    icon: "📐",
    badgeAr: "تربيع 4",
    badgeEn: "Squaring 4",
    ruleExplanationAr:
      "حساب المربع عبر ثنائيات دواندوا: D(a) = a²، D(ab) = 2ab، D(abc) = 2ac + b²، مع تجميع الخانات من اليمين لليسار مع الحمل.",
    ruleExplanationEn:
      "Duplex method: D(a) = a², D(ab) = 2ab, D(abc) = 2ac + b². Assemble columns right to left with carry.",
    mathTheoryAr: "(a + b + c)² = a² + 2ab + (2ac + b²) + 2bc + c².",
    mathTheoryEn: "(a + b + c)² = a² + 2ab + (2ac + b²) + 2bc + c².",
    conditionsAr: ["أي عدد مكون من 3 أرقام."],
    conditionsEn: ["Any 3-digit number."],
    limitsAr: "تتطلب دقة في حساب الضعف والحمل.",
    limitsEn: "Requires accurate calculation of double products and carries.",
    workedExamples: [
      {
        problem: "104²",
        answer: 10816,
        difficulty: "easy",
        steps: [
          { stepNumber: 1, explanationAr: "104 + 4 = 108:", explanationEn: "104 + 4 = 108:", mathExpression: "108" },
          { stepNumber: 2, explanationAr: "4² = 16:", explanationEn: "4² = 16:", mathExpression: "16" },
          { stepNumber: 3, explanationAr: "الناتج: 10816:", explanationEn: "Result: 10816:", mathExpression: "10816" },
        ],
      },
    ],
    generateQuestion: () => {
      const n = randInt(102, 115);
      const ans = n * n;
      return {
        id: `q-sq3d-${Date.now()}-${Math.random()}`,
        problem: `${n}²`,
        correctAnswer: ans,
        options: generateNumericDistractors(ans, 3, 50),
        explanationSteps: [`استخدم قاعدة الأساس 100 أو الدواندوا`, `الناتج: ${ans}`],
        hintAr: `الأساس 100: ${n} + ${n - 100} والصق مربع ${n - 100}`,
        hintEn: `Base 100: ${n} + deviation, append deviation squared`,
      };
    },
  },

  // 5. حساب الجذور التربيعية
  {
    id: "sqrt-perfect",
    levelId: 3,
    titleAr: "حساب الجذور التربيعية بمجرد النظر",
    titleEn: "Instant Square Roots by Inspection",
    subtitleAr: "سوترا فيلوكانام (بمجرد النظر)",
    subtitleEn: "Vilokanam Sutra (Inspection)",
    icon: "√",
    badgeAr: "تربيع 5",
    badgeEn: "Squaring 5",
    ruleExplanationAr:
      "للجذور التربيعية الكاملة: اقسم العدد لمجموعتين. المجموعة الأولى تحدد العشرات بأكبر مربع أصغر منها. آحاد العدد تحدد رقمين محتملين للآحاد، ونقارن حاصل ضرب العشرات في التالي لتحديد الأصح!",
    ruleExplanationEn:
      "For perfect squares: group in pairs from right. Tens digit is largest square root below first group. Units digit narrowed down to 2 choices, resolved by n(n+1).",
    mathTheoryAr: "استنتاج عكسي من جدول آحاد المربعات (1, 4, 9, 6, 5, 0).",
    mathTheoryEn: "Inverse unit-digit matching based on squares modulo 10.",
    conditionsAr: ["المربعات الكاملة المكونة من 3 أو 4 أرقام."],
    conditionsEn: ["Perfect squares with 3 or 4 digits."],
    limitsAr: "لا تنطبق على الجذور غير النسبية بدون طرق التقريب.",
    limitsEn: "Applies to perfect squares; approximations needed for non-perfects.",
    workedExamples: [
      {
        problem: "√7396",
        answer: 86,
        difficulty: "easy",
        steps: [
          { stepNumber: 1, explanationAr: "نقسم إلى (73) و (96). أكبر مربع أقل من 73 هو 8² = 64، إذن العشرات 8:", explanationEn: "Group into 73 and 96. Largest square < 73 is 8² = 64, so tens digit is 8:", mathExpression: "العشرات = 8" },
          { stepNumber: 2, explanationAr: "الآحاد 6 يأتي من 4² أو 6²:", explanationEn: "Last digit 6 comes from 4² or 6²:", mathExpression: "الآحاد إما 4 أو 6" },
          { stepNumber: 3, explanationAr: "نضرب 8 × 9 = 72. بما أن 73 > 72 نختار الرقم الأكبر (6):", explanationEn: "Compare with 8 × 9 = 72. Since 73 > 72, pick the larger digit 6:", mathExpression: "√7396 = 86" },
        ],
      },
    ],
    generateQuestion: () => {
      const root = randInt(24, 96);
      const sq = root * root;
      return {
        id: `q-sqrt-${Date.now()}-${Math.random()}`,
        problem: `√${sq}`,
        correctAnswer: root,
        options: generateNumericDistractors(root, 3, 6),
        explanationSteps: [`العدد ${sq} هو مربع كامل`, `الآحاد والعشرات يعطيان الجذر: ${root}`],
        hintAr: `انظر للآحاد وأكبر مربع للمجموعة الأولى`,
        hintEn: `Look at the last digit and the nearest lower square`,
      };
    },
  },
];

// =========================================================================
// LEVEL 4: التطبيقات المتقدمة (Advanced Applications)
// =========================================================================
export const LEVEL_4_LESSONS: VedicLesson[] = [
  // 1. جمع الكسور وطرحها
  {
    id: "fractions-add-sub",
    levelId: 4,
    titleAr: "جمع الكسور وطرحها بطريقة الفراشة",
    titleEn: "Fraction Addition & Subtraction (Butterfly Method)",
    subtitleAr: "ضرب متقاطع للبسطين مع ضرب المقامين",
    subtitleEn: "Cross-multiply numerators and multiply denominators",
    icon: "🦋",
    badgeAr: "متقدم 1",
    badgeEn: "Advanced 1",
    ruleExplanationAr:
      "بدل البحث الطويل عن توحيد المقامات: اضرب بسط الأول في مقام الثاني، وبسط الثاني في مقام الأول، واجمعهما/اطرحهما للبسط الجديد. والمقام الجديد هو حاصل ضرب المقامين مباشرة!",
    ruleExplanationEn:
      "Butterfly method: a/b + c/d = (ad + bc) / bd. Cross-multiply and add for numerator, multiply denominators for denominator.",
    mathTheoryAr: "a/b ± c/d = (ad ± bc) / bd.",
    mathTheoryEn: "a/b ± c/d = (ad ± bc) / bd.",
    conditionsAr: ["جميع الكسور الاعتيادية ذات المقامات غير الصفرية."],
    conditionsEn: ["All ordinary fractions with non-zero denominators."],
    limitsAr: "يُفضّل تبسيط الكسر الناتج إذا كان هناك قاسم مشترك.",
    limitsEn: "Simplify the resulting fraction if a common factor exists.",
    workedExamples: [
      {
        problem: "2/3 + 4/5",
        answer: "22/15",
        difficulty: "easy",
        steps: [
          { stepNumber: 1, explanationAr: "ضرب متقاطع للأجنحة: 2 × 5 = 10 و 3 × 4 = 12:", explanationEn: "Cross-multiply wings: 2x5 = 10 and 3x4 = 12:", mathExpression: "(2×5) + (3×4) = 10 + 12 = 22" },
          { stepNumber: 2, explanationAr: "ضرب المقامين: 3 × 5 = 15:", explanationEn: "Multiply denominators: 3x5 = 15:", mathExpression: "المقام = 15" },
          { stepNumber: 3, explanationAr: "الناتج المباشر: 22/15:", explanationEn: "Result: 22/15:", mathExpression: "22/15" },
        ],
      },
    ],
    generateQuestion: () => {
      const a = randInt(1, 4), b = randInt(2, 5);
      const c = randInt(1, 4), d = randInt(2, 5);
      const num = a * d + b * c;
      const den = b * d;
      const ans = `${num}/${den}`;
      const wrong1 = `${num - 1}/${den}`;
      const wrong2 = `${num + 2}/${den}`;
      const wrong3 = `${a + c}/${b + d}`;
      return {
        id: `q-frac-${Date.now()}-${Math.random()}`,
        problem: `${a}/${b} + ${c}/${d}`,
        correctAnswer: ans,
        options: shuffle([ans, wrong1, wrong2, wrong3]),
        explanationSteps: [`البسط: (${a}×${d}) + (${b}×${c}) = ${num}`, `المقام: ${b}×${d} = ${den}`, `الناتج: ${ans}`],
        hintAr: `اضرب مقص: (${a}×${d} + ${b}×${c}) على (${b}×${d})`,
        hintEn: `Cross-multiply and add over product of denominators`,
      };
    },
  },

  // 2. ضرب الكسور وقسمتها
  {
    id: "fractions-mul-div",
    levelId: 4,
    titleAr: "ضرب الكسور وقسمتها بلمح البصر",
    titleEn: "Fast Fraction Multiplication & Division",
    subtitleAr: "التبسيط المتقاطع والقسمة بالمقص العكسي",
    subtitleEn: "Cross-cancellation and inverse cross division",
    icon: "🔄",
    badgeAr: "متقدم 2",
    badgeEn: "Advanced 2",
    ruleExplanationAr:
      "في الضرب: بسط في بسط ومقام في مقام مع التبسيط المتقاطع أولاً. في القسمة: اضرب بسط الأول في مقام الثاني ليصبح بسطاً، ومقام الأول في بسط الثاني ليصبح مقاماً (a/b ÷ c/d = ad / bc).",
    ruleExplanationEn:
      "For multiplication: cross-cancel then multiply across. For division: direct cross-multiplication (a/b ÷ c/d = ad/bc).",
    mathTheoryAr: "(a/b) ÷ (c/d) = (a/b) × (d/c) = ad / bc.",
    mathTheoryEn: "(a/b) / (c/d) = (a/b) * (d/c) = ad / bc.",
    conditionsAr: ["المقامات والبسط المقسوم عليه لا تساوي صفراً."],
    conditionsEn: ["Non-zero denominators and divisor numerator."],
    limitsAr: "احرص على التبسيط لأبسط صورة.",
    limitsEn: "Reduce to lowest terms.",
    workedExamples: [
      {
        problem: "3/4 ÷ 2/5",
        answer: "15/8",
        difficulty: "easy",
        steps: [
          { stepNumber: 1, explanationAr: "ضرب مقص: 3 × 5 للبسط الجديد:", explanationEn: "Cross multiply 3 × 5 for numerator:", mathExpression: "3 × 5 = 15" },
          { stepNumber: 2, explanationAr: "ضرب مقص: 4 × 2 للمقام الجديد:", explanationEn: "Cross multiply 4 × 2 for denominator:", mathExpression: "4 × 2 = 8" },
          { stepNumber: 3, explanationAr: "الناتج المباشر: 15/8:", explanationEn: "Result: 15/8:", mathExpression: "15/8" },
        ],
      },
    ],
    generateQuestion: () => {
      const a = randInt(2, 5), b = randInt(3, 7);
      const c = randInt(2, 5), d = randInt(3, 7);
      const num = a * d;
      const den = b * c;
      const ans = `${num}/${den}`;
      const wrong1 = `${num + 1}/${den}`;
      const wrong2 = `${num}/${den + 2}`;
      const wrong3 = `${a * c}/${b * d}`;
      return {
        id: `q-fracdiv-${Date.now()}-${Math.random()}`,
        problem: `${a}/${b} ÷ ${c}/${d}`,
        correctAnswer: ans,
        options: shuffle([ans, wrong1, wrong2, wrong3]),
        explanationSteps: [`البسط: ${a} × ${d} = ${num}`, `المقام: ${b} × ${c} = ${den}`, `الناتج: ${ans}`],
        hintAr: `اضرب مقص: (${a}×${d}) في الأعلى و (${b}×${c}) في الأسفل`,
        hintEn: `Multiply ${a}x${d} for top, ${b}x${c} for bottom`,
      };
    },
  },

  // 3. حساب النسب المئوية ذهنياً
  {
    id: "mental-percentages",
    levelId: 4,
    titleAr: "حساب النسب المئوية ذهنياً",
    titleEn: "Mental Percentages Calculation",
    subtitleAr: "قاعدة التفكيك وقاعدة التبديل (x% من y = y% من x)",
    subtitleEn: "Reversal & decomposition rule (x% of y = y% of x)",
    icon: "%",
    badgeAr: "متقدم 3",
    badgeEn: "Advanced 3",
    ruleExplanationAr:
      "قاعدة سحرية: x% من y هي نفسها y% من x! فمثلاً حساب 16% من 50 صعب، لكنه يساوي 50% من 16 = 8 فورياً! وأيضاً تجزئة النسبة (10% + 5% + 1%).",
    ruleExplanationEn:
      "Key rule: x% of y is exactly y% of x. 16% of 50 is identical to 50% of 16 = 8! Also decompose percentages using 10%, 5%, and 1% benchmarks.",
    mathTheoryAr: "(x/100) × y = (y/100) × x.",
    mathTheoryEn: "(x/100) * y = (y/100) * x.",
    conditionsAr: ["تعمل مع جميع الأرقام والنسب."],
    conditionsEn: ["Universal percentage identity."],
    limitsAr: "اختر دائماً الرقم الأسهل لحساب نسبته.",
    limitsEn: "Switch order whenever one number is an easier percentage (50%, 25%, 20%).",
    workedExamples: [
      {
        problem: "18% من 50",
        answer: 9,
        difficulty: "easy",
        steps: [
          { stepNumber: 1, explanationAr: "نبدل النسبة: 18% من 50 = 50% من 18:", explanationEn: "Reverse: 18% of 50 = 50% of 18:", mathExpression: "50% of 18" },
          { stepNumber: 2, explanationAr: "50% تعني النصف، ونصف 18 هو 9:", explanationEn: "50% is half, half of 18 is 9:", mathExpression: "18 ÷ 2 = 9" },
        ],
      },
      {
        problem: "15% من 240",
        answer: 36,
        difficulty: "medium",
        steps: [
          { stepNumber: 1, explanationAr: "10% من 240 = 24:", explanationEn: "10% of 240 = 24:", mathExpression: "24" },
          { stepNumber: 2, explanationAr: "5% هي نصف الـ 10% = 12:", explanationEn: "5% is half of 10% = 12:", mathExpression: "12" },
          { stepNumber: 3, explanationAr: "15% = 24 + 12 = 36:", explanationEn: "15% = 24 + 12 = 36:", mathExpression: "24 + 12 = 36" },
        ],
      },
    ],
    generateQuestion: () => {
      const p = randChoice([12, 14, 16, 18, 24, 28, 32]);
      const base = 50;
      const ans = (p * base) / 100;
      return {
        id: `q-pct-${Date.now()}-${Math.random()}`,
        problem: `${p}% من ${base}`,
        correctAnswer: ans,
        options: generateNumericDistractors(ans, 3, 4),
        explanationSteps: [`بدّل المسألة إلى: 50% من ${p}`, `نصف ${p} = ${ans}`],
        hintAr: `احسب 50% من ${p} (نصف ${p})`,
        hintEn: `Calculate 50% of ${p} (half of ${p})`,
      };
    },
  },

  // 4. الضرب السريع للأعداد الكبيرة
  {
    id: "mul-large-numbers",
    levelId: 4,
    titleAr: "الضرب السريع للأعداد الكبيرة",
    titleEn: "Rapid Multiplication of Large Numbers",
    subtitleAr: "أساسات الـ 1000 والـ 10000 والأساس المزدوج",
    subtitleEn: "Base 1000, 10,000 and working bases",
    icon: "🏆",
    badgeAr: "متقدم 4",
    badgeEn: "Advanced 4",
    ruleExplanationAr:
      "تطبيق انحرافات الأساس على الأعداد الكبيرة (مثل 996 × 994): الانحراف عن 1000 هو -4 و -6. الجزء الأيسر = 996 - 6 = 990. الجزء الأيمن = (-4 × -6) في 3 خانات = 024. الناتج: 990024!",
    ruleExplanationEn:
      "Apply deviation method to Base 1000: left side = 996 - 6 = 990, right side = (-4)x(-6) = 024 (3 digits). Result = 990024.",
    mathTheoryAr: "(1000 - a)(1000 - b) = 1000(1000 - a - b) + ab.",
    mathTheoryEn: "(1000 - a)(1000 - b) = 1000(1000 - a - b) + ab.",
    conditionsAr: ["أعداد قريبة من 1000 أو 10000."],
    conditionsEn: ["Numbers close to 1000, 10000."],
    limitsAr: "يجب كتابة الجزء الأيمن بعدد أصفار الأساس (3 خانات لـ 1000).",
    limitsEn: "Right side must match base zero count (3 digits for 1000).",
    workedExamples: [
      {
        problem: "998 × 995",
        answer: 993010,
        difficulty: "easy",
        steps: [
          { stepNumber: 1, explanationAr: "الانحراف عن 1000 هو -2 و -5:", explanationEn: "Deviations from 1000 are -2 and -5:", mathExpression: "998 (-2), 995 (-5)" },
          { stepNumber: 2, explanationAr: "الجزء الأيسر: 998 - 5 = 993:", explanationEn: "Left side: 998 - 5 = 993:", mathExpression: "998 - 5 = 993" },
          { stepNumber: 3, explanationAr: "الجزء الأيمن: -2 × -5 = 10 نكتبه في 3 خانات (010):", explanationEn: "Right side: (-2)x(-5) = 010 (3 digits):", mathExpression: "993 | 010 = 993010" },
        ],
      },
    ],
    generateQuestion: () => {
      const a = randInt(1, 8);
      const b = randInt(1, 9);
      const x = 1000 - a;
      const y = 1000 - b;
      const ans = x * y;
      return {
        id: `q-large-${Date.now()}-${Math.random()}`,
        problem: `${x} × ${y}`,
        correctAnswer: ans,
        options: generateNumericDistractors(ans, 3, 500),
        explanationSteps: [`الانحرافات: -${a} و -${b}`, `الجزء الأيسر: ${x} - ${b} = ${x - b}`, `الجزء الأيمن: ${a} × ${b} = ${String(a * b).padStart(3, "0")}`, `الناتج: ${ans}`],
        hintAr: `احسب الانحراف عن 1000 واكتب ضرب الانحرافات في 3 خانات`,
        hintEn: `Deviation from 1000, pad right product to 3 digits`,
      };
    },
  },
];

// =========================================================================
// COMBINED 4 LEVELS DEFINITION
// =========================================================================
export const VEDIC_LEVELS: VedicLevel[] = [
  {
    id: 1,
    titleAr: "المستوى الأول: أساسيات الحساب السريع",
    titleEn: "Level 1: Fast Math Fundamentals",
    taglineAr: "القواعد الذهبية للمبتدئين وتأسيس العقل الخارق",
    taglineEn: "Golden rules for rapid everyday mental operations",
    colorGradient: "from-blue-600 via-indigo-600 to-violet-700",
    accentColor: "indigo",
    lessons: LEVEL_1_LESSONS,
  },
  {
    id: 2,
    titleAr: "المستوى الثاني: مهارات الضرب الاحترافية",
    titleEn: "Level 2: Multiplication Mastery",
    taglineAr: "أسرار ضرب الأعداد الكبيرة والمتقاطعة في سطر واحد",
    taglineEn: "Crosswise, vertical and complementary multiplication",
    colorGradient: "from-purple-600 via-fuchsia-600 to-pink-700",
    accentColor: "purple",
    lessons: LEVEL_2_LESSONS,
  },
  {
    id: 3,
    titleAr: "المستوى الثالث: التربيع والجذور الفورية",
    titleEn: "Level 3: Instant Squaring and Roots",
    taglineAr: "حساب المربعات والجذور التربيعية بمجرد النظر",
    taglineEn: "Lightning fast squares and square roots by inspection",
    colorGradient: "from-amber-500 via-orange-600 to-red-600",
    accentColor: "amber",
    lessons: LEVEL_3_LESSONS,
  },
  {
    id: 4,
    titleAr: "المستوى الرابع: التطبيقات المتقدمة والكسور",
    titleEn: "Level 4: Advanced Applications & Fractions",
    taglineAr: "الكسور، النسب المئوية، والأعداد المليونية للاختبارات الرسمية",
    taglineEn: "Fractions, mental percentages and mega numbers",
    colorGradient: "from-emerald-600 via-teal-600 to-cyan-700",
    accentColor: "emerald",
    lessons: LEVEL_4_LESSONS,
  },
];

export function getVedicLessonById(lessonId: string): VedicLesson | undefined {
  for (const level of VEDIC_LEVELS) {
    const found = level.lessons.find((l) => l.id === lessonId);
    if (found) return found;
  }
  return undefined;
}
