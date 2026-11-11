"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Calculator,
  ArrowLeft,
  ArrowRight,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  Volume2,
  VolumeX,
  Shuffle,
  Lightbulb,
} from "lucide-react";
import SorobanBeadVisualizer, { RodVisualConfig } from "@/components/soroban/SorobanBeadVisualizer";
import { COACH_INFO, getWhatsAppLink } from "@/lib/constants";
import { soundSynth } from "@/lib/audio-synthesizer";

type ActiveTab = "tables" | "multiplication" | "division";

export default function MultiplicationDivisionPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("tables");

  // Sound control
  const [soundEnabled, setSoundEnabled] = useState(true);

  const playClick = useCallback((freq = 520) => {
    if (soundEnabled) {
      soundSynth.playBeadClick(freq, 0.18);
    }
  }, [soundEnabled]);

  // =========================================================================
  // TAB 1: MULTIPLICATION TABLES & MASTERY TEST STATE
  // =========================================================================
  const [selectedTableNum, setSelectedTableNum] = useState<number>(7);
  const [matrixHoveredCell, setMatrixHoveredCell] = useState<{ r: number; c: number } | null>(null);

  // Flashcards state
  const [cardIdx, setCardIdx] = useState<number>(1);
  const [cardFlipped, setCardFlipped] = useState<boolean>(false);

  // Qualification Test state
  const [testStage, setTestStage] = useState<"idle" | "running" | "completed">("idle");
  const [testQuestions, setTestQuestions] = useState<{ a: number; b: number; ans: number; options: number[] }[]>([]);
  const [currentTestQIdx, setCurrentTestQIdx] = useState<number>(0);
  const [testScore, setTestScore] = useState<number>(0);
  const [testSelectedAns, setTestSelectedAns] = useState<number | null>(null);
  const [testFeedback, setTestFeedback] = useState<"correct" | "wrong" | null>(null);

  // Generate 10 random questions for qualification test
  const startQualificationTest = () => {
    const qs: { a: number; b: number; ans: number; options: number[] }[] = [];
    for (let i = 0; i < 10; i++) {
      const a = Math.floor(Math.random() * 9) + 2; // 2..10
      const b = Math.floor(Math.random() * 9) + 2; // 2..10
      const ans = a * b;

      // generate 3 distractors
      const opts = new Set<number>([ans]);
      while (opts.size < 4) {
        const offset = (Math.floor(Math.random() * 7) - 3) * (Math.random() < 0.5 ? a : b);
        const candidate = ans + offset;
        if (candidate > 0 && candidate !== ans) {
          opts.add(candidate);
        } else {
          opts.add(Math.floor(Math.random() * 80) + 4);
        }
      }
      qs.push({
        a,
        b,
        ans,
        options: Array.from(opts).sort(() => Math.random() - 0.5),
      });
    }

    setTestQuestions(qs);
    setCurrentTestQIdx(0);
    setTestScore(0);
    setTestSelectedAns(null);
    setTestFeedback(null);
    setTestStage("running");
  };

  const handleTestAnswer = (chosen: number) => {
    if (testFeedback !== null) return;
    setTestSelectedAns(chosen);

    const q = testQuestions[currentTestQIdx];
    const isCorrect = chosen === q.ans;

    if (isCorrect) {
      setTestFeedback("correct");
      setTestScore((s) => s + 1);
      if (soundEnabled) soundSynth.playCelebrationFanfare();
    } else {
      setTestFeedback("wrong");
      playClick(300);
    }

    setTimeout(() => {
      if (currentTestQIdx + 1 < testQuestions.length) {
        setCurrentTestQIdx((i) => i + 1);
        setTestSelectedAns(null);
        setTestFeedback(null);
      } else {
        setTestStage("completed");
      }
    }, 1200);
  };

  // Speak Table cell
  const speakEquation = (a: number, b: number, res: number) => {
    if (!soundEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const text = `${a} في ${b} يساوي ${res}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar-SA";
    utterance.rate = 1.3;
    window.speechSynthesis.speak(utterance);
  };

  // =========================================================================
  // TAB 2: SOROBAN MULTIPLICATION SIMULATOR & EXPLAINER (UP TO 5 DIGITS)
  // =========================================================================
  const [multDigitsA, setMultDigitsA] = useState<number>(2); // 1..5
  const [multDigitsB, setMultDigitsB] = useState<number>(1); // 1..5
  const [numA, setNumA] = useState<number>(24);
  const [numB, setNumB] = useState<number>(3);
  const [multStepIndex, setMultStepIndex] = useState<number>(0);
  const [isAutoPlayingMult, setIsAutoPlayingMult] = useState<boolean>(false);

  // Generate random problem for chosen digits
  const randomizeMultProblem = useCallback(() => {
    const minA = Math.pow(10, multDigitsA - 1);
    const maxA = Math.pow(10, multDigitsA) - 1;
    const minB = Math.pow(10, multDigitsB - 1);
    const maxB = Math.pow(10, multDigitsB) - 1;

    const rA = Math.floor(Math.random() * (maxA - minA + 1)) + minA;
    const rB = Math.floor(Math.random() * (maxB - minB + 1)) + minB;

    setNumA(rA);
    setNumB(rB);
    setMultStepIndex(0);
    setIsAutoPlayingMult(false);
  }, [multDigitsA, multDigitsB]);

  // Steps breakdown for Soroban Multiplication (as taught by Coach Qatadah)
  interface MultStep {
    stepTitle: string;
    description: string;
    interimResult: number;
    highlightRods: number[];
    beadRods: RodVisualConfig[];
  }

  const multSteps: MultStep[] = useMemo(() => {
    const steps: MultStep[] = [];
    const strA = numA.toString();
    const strB = numB.toString();

    // Helper to generate board rods with:
    // [Factor A (left) | Gap × | Factor B | Gap | Result (right)]
    const buildBoard = (
      factorAStr: string,
      factorBStr: string,
      currentResultVal: number,
      activeResColumnIdx?: number
    ): RodVisualConfig[] => {
      const rods: RodVisualConfig[] = [];

      // Left 3 rods: Factor A
      const paddedA = factorAStr.padStart(3, " ");
      for (let i = 0; i < 3; i++) {
        const char = paddedA[i];
        const val = char === " " ? 0 : parseInt(char, 10);
        rods.push({
          upper: val >= 5,
          lowers: val % 5,
          label: i === 0 ? "المضروب" : "",
          badge: char === " " ? "—" : `${val}`,
          highlight: char !== " ",
        });
      }

      // Rod 3: Gap / Operation Indicator
      rods.push({
        upper: false,
        lowers: 0,
        label: "فراغ (×)",
        badge: "✖️",
        highlight: false,
      });

      // Rods 4-6: Factor B
      const paddedB = factorBStr.padStart(3, " ");
      for (let i = 0; i < 3; i++) {
        const char = paddedB[i];
        const val = char === " " ? 0 : parseInt(char, 10);
        rods.push({
          upper: val >= 5,
          lowers: val % 5,
          label: i === 0 ? "المضروب به" : "",
          badge: char === " " ? "—" : `${val}`,
          highlight: char !== " ",
        });
      }

      // Rod 7: Divider Gap
      rods.push({
        upper: false,
        lowers: 0,
        label: "فاصل",
        badge: "║",
        highlight: false,
      });

      // Right 5 rods: Result (Units at index 12, Tens at 11, Hundreds at 10...)
      const resStr = currentResultVal.toString().padStart(5, "0");
      for (let i = 0; i < 5; i++) {
        const val = parseInt(resStr[i], 10);
        const placePower = 4 - i; // 4: عشرات الآلاف, 0: آحاد
        const placeNames = ["آحاد", "عشرات", "مئات", "آلاف", "ع. آلاف"];
        const rodIdxInBoard = 8 + i;
        const isHighlight = activeResColumnIdx !== undefined && activeResColumnIdx === rodIdxInBoard;

        rods.push({
          upper: val >= 5,
          lowers: val % 5,
          label: placeNames[placePower],
          badge: `${val}`,
          highlight: isHighlight,
        });
      }

      return rods;
    };

    // Step 0: Setup Representation
    steps.push({
      stepTitle: "تمثيل المسألة على المعداد",
      description: `نمثل المضروب (${numA}) بأقصى اليسار، ثم نترك عمود فراغ يمثل عملية الضرب (×)، ثم نمثل المضروب به (${numB})، ويكون جانب اليمين مخصصاً لحساب وتجميع الناتج.`,
      interimResult: 0,
      highlightRods: [0, 1, 2, 4, 5, 6],
      beadRods: buildBoard(strA, strB, 0),
    });

    // Sub-multiplications: loop through digits of B (from right to left) and A (from right to left)
    let cumulative = 0;
    const digitsB = strB.split("").map(Number).reverse();
    const digitsA = strA.split("").map(Number).reverse();

    digitsB.forEach((dB, bIdx) => {
      digitsA.forEach((dA, aIdx) => {
        const product = dA * dB;
        const placeWeight = Math.pow(10, aIdx + bIdx);
        cumulative += product * placeWeight;

        // active rod in the 5-rod result region (units = 12, tens = 11, hundreds = 10, thousands = 9)
        const targetRodIndex = 12 - (aIdx + bIdx);

        const placeNames = ["الآحاد", "العشرات", "المئات", "الآلاف", "عشرات الآلاف"];
        const currPlaceName = placeNames[aIdx + bIdx] || `10^${aIdx + bIdx}`;

        steps.push({
          stepTitle: `ضرب الرقم (${dA}) × (${dB}) = ${product}`,
          description:
            bIdx > 0 && aIdx === 0
              ? `ضربنا برقم مرتبة العشرات (${dB})، لذلك نترك عمود الآحاد (باعتباره صفر المرتبة) ونبدأ التمثيل في عمود ${currPlaceName}. الناتج الجزئي = ${product}، يُضاف للمعداد ليصبح المجموع حتى الآن: ${cumulative}.`
              : `نضرب ${dA} في ${dB} = ${product}. نمثل آحاده في عمود ${currPlaceName} ونُرحّل العشرات للعمود التالي. المجموع التراكمي الآن = ${cumulative}.`,
          interimResult: cumulative,
          highlightRods: [targetRodIndex],
          beadRods: buildBoard(strA, strB, cumulative, targetRodIndex),
        });
      });
    });

    // Final Step: Celebration
    steps.push({
      stepTitle: `اكتمال عملية الضرب! الناتج النهائي = ${numA * numB}`,
      description: `تمت جميع عمليات الضرب الجزئية وترحيل البواقي بنجاح. الناتج النهائي المسجل على أعمدة اليمين هو: ${numA * numB}.`,
      interimResult: numA * numB,
      highlightRods: [8, 9, 10, 11, 12],
      beadRods: buildBoard(strA, strB, numA * numB),
    });

    return steps;
  }, [numA, numB]);

  // Handle auto-play for multiplication
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoPlayingMult && multStepIndex < multSteps.length - 1) {
      timer = setTimeout(() => {
        setMultStepIndex((i) => i + 1);
        playClick(580);
      }, 2000);
    } else if (multStepIndex >= multSteps.length - 1) {
      setIsAutoPlayingMult(false);
    }
    return () => clearTimeout(timer);
  }, [isAutoPlayingMult, multStepIndex, multSteps.length, playClick]);

  // =========================================================================
  // TAB 3: SOROBAN DIVISION SIMULATOR & EXPLAINER (UP TO 5 DIGITS)
  // =========================================================================
  const [divDigitsDividend, setDivDigitsDividend] = useState<number>(3); // 1..5
  const [divDigitsDivisor, setDivDigitsDivisor] = useState<number>(1); // 1..5
  const [dividend, setDividend] = useState<number>(96);
  const [divisor, setDivisor] = useState<number>(4);
  const [divStepIndex, setDivStepIndex] = useState<number>(0);
  const [isAutoPlayingDiv, setIsAutoPlayingDiv] = useState<boolean>(false);

  // Randomize division problem
  const randomizeDivProblem = useCallback(() => {
    const minDivisor = Math.pow(10, divDigitsDivisor - 1);
    const maxDivisor = Math.pow(10, divDigitsDivisor) - 1;
    const rDivisor = Math.floor(Math.random() * (maxDivisor - minDivisor + 1)) + minDivisor || 2;

    const minDividend = Math.pow(10, divDigitsDividend - 1);
    const maxDividend = Math.pow(10, divDigitsDividend) - 1;
    const rDividend = Math.floor(Math.random() * (maxDividend - minDividend + 1)) + minDividend;

    setDivisor(Math.max(2, rDivisor));
    setDividend(Math.max(rDivisor * 2, rDividend));
    setDivStepIndex(0);
    setIsAutoPlayingDiv(false);
  }, [divDigitsDividend, divDigitsDivisor]);

  // Division steps breakdown
  interface DivStep {
    stepTitle: string;
    description: string;
    quotientSoFar: number;
    remainderSoFar: number;
    beadRods: RodVisualConfig[];
  }

  const divSteps: DivStep[] = useMemo(() => {
    const steps: DivStep[] = [];
    const quotientFinal = Math.floor(dividend / divisor);
    const remainderFinal = dividend % divisor;

    // Helper to build Division Board:
    // [Dividend/Remainder (left 4 rods) | Gap (÷) | Divisor (2 rods) | Gap | Quotient (right 4 rods)]
    const buildDivBoard = (
      remVal: number,
      quotVal: number,
      highlightSide?: "left" | "right" | "all"
    ): RodVisualConfig[] => {
      const rods: RodVisualConfig[] = [];

      // Left 4 rods: Dividend / Remaining value
      const remStr = remVal.toString().padStart(4, "0");
      for (let i = 0; i < 4; i++) {
        const val = parseInt(remStr[i], 10);
        rods.push({
          upper: val >= 5,
          lowers: val % 5,
          label: i === 0 ? "المقسوم/الباقي" : "",
          badge: `${val}`,
          highlight: highlightSide === "left" || highlightSide === "all",
        });
      }

      // Rod 4: Division Operation Gap
      rods.push({
        upper: false,
        lowers: 0,
        label: "عملية (÷)",
        badge: "➗",
        highlight: false,
      });

      // Rods 5-6: Divisor
      const divisorStr = divisor.toString().padStart(2, "0");
      for (let i = 0; i < 2; i++) {
        const val = parseInt(divisorStr[i], 10);
        rods.push({
          upper: val >= 5,
          lowers: val % 5,
          label: i === 0 ? "المقسوم عليه" : "",
          badge: `${val}`,
          highlight: false,
        });
      }

      // Rod 7: Divider Gap
      rods.push({
        upper: false,
        lowers: 0,
        label: "فاصل",
        badge: "║",
        highlight: false,
      });

      // Right 4 rods: Quotient (الناتج)
      const quotStr = quotVal.toString().padStart(4, "0");
      for (let i = 0; i < 4; i++) {
        const val = parseInt(quotStr[i], 10);
        const placePower = 3 - i;
        const placeNames = ["آحاد", "عشرات", "مئات", "آلاف"];
        rods.push({
          upper: val >= 5,
          lowers: val % 5,
          label: placeNames[placePower],
          badge: `${val}`,
          highlight: highlightSide === "right" || highlightSide === "all",
        });
      }

      return rods;
    };

    // Step 0: Initial representation
    steps.push({
      stepTitle: "تمثيل مسألة القسمة على المعداد",
      description: `كما علّمنا أ. قتادة كريم: نمثل المقسوم (${dividend}) في أقصى اليسار، والمقسوم عليه (${divisor}) في الوسط، ونخصص أعمدة اليمين لتدوين الناتج (خارج القسمة)، بينما ستتبقى الفضلة (الباقي) في أعمدة اليسار.`,
      quotientSoFar: 0,
      remainderSoFar: dividend,
      beadRods: buildDivBoard(dividend, 0),
    });

    // Step-by-step division process (simulate standard long division)
    const dividendStr = dividend.toString();
    let currentPart = 0;
    let accumulatedQuotient = 0;

    for (let i = 0; i < dividendStr.length; i++) {
      currentPart = currentPart * 10 + parseInt(dividendStr[i], 10);

      if (currentPart >= divisor || i === dividendStr.length - 1) {
        const qDigit = Math.floor(currentPart / divisor);
        const subtracted = qDigit * divisor;
        currentPart = currentPart - subtracted;
        accumulatedQuotient = accumulatedQuotient * 10 + qDigit;

        steps.push({
          stepTitle: `قسمة الجزء: كم ${divisor} في ${currentPart + subtracted}؟ الناتج = ${qDigit}`,
          description: `القسمة على السوروبان هي طرح متكرر: نطرح ${subtracted} من خرزات المقسوم في اليسار، ونسجل الرقم ${qDigit} في أعمدة الناتج على اليمين. الباقي الجزئي في اليسار الآن = ${currentPart}.`,
          quotientSoFar: accumulatedQuotient,
          remainderSoFar: currentPart,
          beadRods: buildDivBoard(currentPart, accumulatedQuotient, "right"),
        });
      }
    }

    // Final Summary Step
    steps.push({
      stepTitle: `انتهاء القسمة: الناتج = ${quotientFinal} | الباقي = ${remainderFinal}`,
      description:
        remainderFinal === 0
          ? `القسمة منتهية تماماً (بدون باقي)! الناتج النهائي المسجل على اليمين هو ${quotientFinal}، وأعمدة اليسار أصبحت أصفاراً.`
          : `تمت القسمة بنجاح! خارج القسمة (على اليمين) هو ${quotientFinal}، وتبقى في أعمدة اليسار الباقي (${remainderFinal}).`,
      quotientSoFar: quotientFinal,
      remainderSoFar: remainderFinal,
      beadRods: buildDivBoard(remainderFinal, quotientFinal, "all"),
    });

    return steps;
  }, [dividend, divisor]);

  // Handle auto-play for division
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoPlayingDiv && divStepIndex < divSteps.length - 1) {
      timer = setTimeout(() => {
        setDivStepIndex((i) => i + 1);
        playClick(580);
      }, 2200);
    } else if (divStepIndex >= divSteps.length - 1) {
      setIsAutoPlayingDiv(false);
    }
    return () => clearTimeout(timer);
  }, [isAutoPlayingDiv, divStepIndex, divSteps.length, playClick]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 text-right" dir="rtl">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-bold shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>منظومة الحساب الذهني الشاملة — إشراف {COACH_INFO.name}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          الضرب والقسمة على المعداد السوروبان ✖️➗
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          دورة متكاملة تبدأ بتمكين الطالب من حفظ جدول الضرب (1 - 10) واجتياز اختبار التأهيل، ثم الانتقال لمحاكي الضرب والقسمة الميكانيكية على السوروبان حتى 5 مراتب متقدمة.
        </p>

        {/* Top Sound Toggle */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-2 ${
              soundEnabled
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-slate-100 border-slate-200 text-slate-600"
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? "المؤثرات الصوتية والنطق مفعل" : "صامت"}</span>
          </button>
        </div>
      </div>

      {/* Primary 3 Navigation Tabs */}
      <div className="bg-white rounded-3xl p-2 border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab("tables");
              playClick(500);
            }}
            className={`py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 ${
              activeTab === "tables"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="text-lg">✖️</span>
            <span>1. حفظ واختبار جدول الضرب (1 - 10)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("multiplication");
              playClick(550);
            }}
            className={`py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 ${
              activeTab === "multiplication"
                ? "bg-gradient-to-r from-brand-600 to-indigo-700 text-white shadow-md shadow-brand-500/20"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>2. محاكي الضرب بالسوروبان (حتى 5 مراتب)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("division");
              playClick(600);
            }}
            className={`py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 ${
              activeTab === "division"
                ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="text-lg">➗</span>
            <span>3. محاكي القسمة بالسوروبان (حتى 5 مراتب)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MULTIPLICATION TABLES & MASTERY TEST */}
      {/* ========================================================================= */}
      {activeTab === "tables" && (
        <div className="space-y-10 animate-in fade-in duration-300">
          {/* Section Introduction */}
          <div className="bg-amber-50/80 rounded-3xl p-6 sm:p-8 border border-amber-200/90 space-y-3">
            <div className="flex items-center gap-2 text-amber-950 font-black text-lg">
              <Lightbulb className="w-6 h-6 text-amber-600 shrink-0" />
              <span>ملاحظة أساسية من الأستاذ قتادة كريم:</span>
            </div>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              &quot;إتقان جدول الضرب من 1 إلى 10 هو حجر الزاوية الذي لا غنى عنه قبل البدء بتعلم الضرب على السوروبان. المعداد هو أداة تجميع وترحيل للمنازل، أما استدعاء ناتج ضرب رقم في رقم فيجب أن يكون سريعاً وحاضراً في ذهن الطالب دون تردد.&quot;
            </p>
          </div>

          {/* Interactive Pythagoras Matrix (جدول فيثاغورس التفاعلي 10x10) */}
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <span>شبكة فيثاغورس التفاعلية لجدول الضرب (1 - 10) 🎯</span>
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  انقر على أي رقم أو تقاطع لمعاينة حاصل الضرب وسماعه صوتياً بالعربية.
                </p>
              </div>

              {/* Number Buttons 1..10 Selector */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-600">اختر جدولاً:</span>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setSelectedTableNum(num);
                      playClick(500 + num * 20);
                    }}
                    className={`w-8 h-8 rounded-xl font-bold font-mono text-xs transition-all ${
                      selectedTableNum === num
                        ? "bg-amber-400 text-slate-950 font-black scale-110 shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Matrix Grid */}
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[480px]">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 text-xs font-black bg-slate-900 text-amber-300 rounded-lg">✖️</th>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((col) => (
                        <th
                          key={col}
                          className={`p-2 text-xs font-black font-mono transition-colors ${
                            matrixHoveredCell?.c === col || selectedTableNum === col
                              ? "bg-amber-400 text-slate-950 rounded-lg font-black"
                              : "text-slate-700 bg-slate-100"
                          }`}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                      <tr key={row}>
                        <td
                          className={`p-2 text-xs font-black font-mono transition-colors ${
                            matrixHoveredCell?.r === row || selectedTableNum === row
                              ? "bg-amber-400 text-slate-950 rounded-lg"
                              : "text-slate-700 bg-slate-100"
                          }`}
                        >
                          {row}
                        </td>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((col) => {
                          const val = row * col;
                          const isHovered = matrixHoveredCell?.r === row && matrixHoveredCell?.c === col;
                          const isInSelectedTable = selectedTableNum === row || selectedTableNum === col;

                          return (
                            <td
                              key={col}
                              onMouseEnter={() => setMatrixHoveredCell({ r: row, c: col })}
                              onMouseLeave={() => setMatrixHoveredCell(null)}
                              onClick={() => {
                                speakEquation(row, col, val);
                                playClick(550);
                              }}
                              className={`p-2 text-xs sm:text-sm font-mono cursor-pointer transition-all border border-slate-100 rounded-lg ${
                                isHovered
                                  ? "bg-amber-500 text-slate-950 font-black scale-110 shadow-lg ring-2 ring-amber-300 z-10"
                                  : isInSelectedTable
                                  ? "bg-amber-50 text-amber-950 font-bold"
                                  : "text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Active Equation readout */}
            {matrixHoveredCell && (
              <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between text-sm sm:text-base">
                <div className="flex items-center gap-3">
                  <span className="text-amber-400 font-mono text-xl sm:text-2xl font-black">
                    {matrixHoveredCell.r} × {matrixHoveredCell.c} = {matrixHoveredCell.r * matrixHoveredCell.c}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({matrixHoveredCell.r} مضروباً في {matrixHoveredCell.c})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    speakEquation(
                      matrixHoveredCell.r,
                      matrixHoveredCell.c,
                      matrixHoveredCell.r * matrixHoveredCell.c
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>نطق النتيجة</span>
                </button>
              </div>
            )}
          </div>

          {/* Flashcards & Single Table Practice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Flashcard Component */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6 text-center">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-500">بطاقة التسميع السريع لجدول {selectedTableNum}</span>
                <span className="font-mono text-xs font-bold text-amber-600">
                  {cardIdx} من 10
                </span>
              </div>

              {/* Flipped Card */}
              <div
                onClick={() => {
                  setCardFlipped(!cardFlipped);
                  playClick(540);
                }}
                className="w-full h-44 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-500 p-6 flex flex-col items-center justify-center cursor-pointer shadow-lg shadow-amber-500/20 transition-transform active:scale-98 select-none"
              >
                {!cardFlipped ? (
                  <div className="space-y-2">
                    <span className="text-4xl sm:text-5xl font-black font-mono text-slate-950">
                      {selectedTableNum} × {cardIdx}
                    </span>
                    <span className="text-xs font-bold text-slate-800 block">
                      (اضغط على البطاقة لإظهار الناتج 👀)
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2 animate-in zoom-in-75 duration-200">
                    <span className="text-5xl sm:text-6xl font-black font-mono text-slate-950">
                      {selectedTableNum * cardIdx}
                    </span>
                    <span className="text-xs font-bold text-slate-800 block">
                      {selectedTableNum} × {cardIdx} = {selectedTableNum * cardIdx}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCardIdx((i) => Math.max(1, i - 1));
                    setCardFlipped(false);
                    playClick(480);
                  }}
                  disabled={cardIdx <= 1}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-xs font-bold flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>السابق</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const rnd = Math.floor(Math.random() * 10) + 1;
                    setCardIdx(rnd);
                    setCardFlipped(false);
                    playClick(520);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 text-xs font-bold flex items-center gap-1.5"
                >
                  <Shuffle className="w-3.5 h-3.5 text-amber-700" />
                  <span>عشوائي</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCardIdx((i) => Math.min(10, i + 1));
                    setCardFlipped(false);
                    playClick(500);
                  }}
                  disabled={cardIdx >= 10}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-xs font-bold flex items-center gap-1.5"
                >
                  <span>التالي</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Diagnostic Qualification Test */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span className="font-black text-sm sm:text-base">اختبار التأهيل للضرب على السوروبان</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  شهادة فورية 🎖️
                </span>
              </div>

              {testStage === "idle" && (
                <div className="space-y-4 py-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center mx-auto text-3xl">
                    ⏱️
                  </div>
                  <h4 className="text-lg font-black text-white">هل أنت مستعد لاختبار التأهيل؟</h4>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    10 أسئلة عشوائية في جداول الضرب للتأكد من جاهزيتك لتعلم الضرب بالعداد الياباني. حقق 80% فما فوق للحصول على وسام التأهيل!
                  </p>
                  <button
                    type="button"
                    onClick={startQualificationTest}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 transition-all"
                  >
                    بدء اختبار التأهيل الآن 🚀
                  </button>
                </div>
              )}

              {testStage === "running" && testQuestions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>السؤال {currentTestQIdx + 1} من 10</span>
                    <span className="text-amber-400 font-mono font-bold">النقاط: {testScore}</span>
                  </div>

                  {/* Question Prompt */}
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl text-center border border-white/10 space-y-1">
                    <span className="text-xs text-amber-300 font-bold block">ما هو حاصل ضرب:</span>
                    <span className="text-4xl font-black font-mono text-white tracking-widest">
                      {testQuestions[currentTestQIdx].a} × {testQuestions[currentTestQIdx].b} = ؟
                    </span>
                  </div>

                  {/* 4 Options */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {testQuestions[currentTestQIdx].options.map((opt, i) => {
                      const isSelected = testSelectedAns === opt;
                      const isCorrect = opt === testQuestions[currentTestQIdx].ans;

                      let btnStyle = "bg-white/5 border-white/10 text-white hover:bg-white/10";
                      if (testFeedback !== null) {
                        if (isCorrect) btnStyle = "bg-emerald-500 text-slate-950 font-black border-emerald-400";
                        else if (isSelected && !isCorrect) btnStyle = "bg-rose-500 text-white border-rose-400";
                      }

                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleTestAnswer(opt)}
                          disabled={testFeedback !== null}
                          className={`p-3.5 rounded-xl border font-mono font-bold text-lg transition-all ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {testStage === "completed" && (
                <div className="space-y-4 py-4 text-center animate-in zoom-in-75 duration-300">
                  <div className="text-5xl">
                    {testScore >= 8 ? "🏆" : "🎖️"}
                  </div>
                  <h4 className="text-xl font-black text-white">
                    {testScore >= 8 ? "مبارك يا بطل! أنت مؤهل بجدارة 🎉" : "أحسنت المحاولة! تدرب أكثر قليلاً"}
                  </h4>
                  <p className="text-slate-300 text-xs sm:text-sm">
                    حصلت على <strong className="text-amber-400 font-mono text-base">{testScore} من 10</strong> ({testScore * 10}%)
                  </p>

                  {testScore >= 8 && (
                    <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold leading-relaxed">
                      ⭐️ شهادة التأهيل معتمدة: عقلك جاهز ومبرمج الآن لتعلم خوارزميات الضرب على السوروبان!
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <button
                      type="button"
                      onClick={startQualificationTest}
                      className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                    >
                      إعادة الاختبار 🔄
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("multiplication")}
                      className="flex-1 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs"
                    >
                      انتقل لضرب السوروبان ➡️
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SOROBAN MULTIPLICATION SIMULATOR & EXPLAINER (UP TO 5 DIGITS) */}
      {/* ========================================================================= */}
      {activeTab === "multiplication" && (
        <div className="space-y-10 animate-in fade-in duration-300">
          {/* Pedagogical Explanation Card */}
          <div className="bg-gradient-to-br from-brand-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
                منهجية الأستاذ قتادة كريم
              </span>
              <span className="text-xs text-amber-200">الضرب بالمعداد الياباني الأصلي</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white leading-snug">
              كيف تتم عملية الضرب على السوروبان حتى 5 مراتب؟ 🧮
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-200">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-2">
                <span className="text-amber-400 font-bold block">1. توزيع المواقع:</span>
                <p className="leading-relaxed">
                  نمثل <strong>المضروب</strong> بأقصى اليسار، ونترك عمود فراغ يمثل علامة (×)، ثم نمثل <strong>المضروب به</strong>، ونترك جانباً فارغاً في اليمين للناتج.
                </p>
              </div>

              <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-2">
                <span className="text-amber-400 font-bold block">2. إجراء الضرب وترحيل البواقي:</span>
                <p className="leading-relaxed">
                  نبدأ بضرب الآحاد: نضع الناتج في العمود الأول (الآحاد)، وإذا كان هناك عشرات (باقي) تُوضع وتُجمع في العمود الثاني فورياً.
                </p>
              </div>

              <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-2">
                <span className="text-amber-400 font-bold block">3. صفر المرتبة للمنازل المتعددة:</span>
                <p className="leading-relaxed">
                  عند الضرب برقم العشرات، نترك العمود الأول (صفر المرتبة) ونبدأ التمثيل من العمود الثاني، وعند المئات نترك عمودين، وهكذا حتى 5 مراتب.
                </p>
              </div>
            </div>
          </div>

          {/* Configuration & Controls for Up to 5 Digits */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h4 className="text-lg font-black text-slate-900">
                  لوحة تحكم منازل الضرب (حتى 5 مراتب × 5 مراتب)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  حدد عدد مراتب المضروب والمضروب به أو اكتب أرقاماً مخصصة لمشاهدة حركات الخرزات خطوة بخطوة.
                </p>
              </div>

              <button
                type="button"
                onClick={randomizeMultProblem}
                className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all flex items-center gap-2"
              >
                <Shuffle className="w-4 h-4 text-amber-700" />
                <span>توليد مسألة عشوائية 🎲</span>
              </button>
            </div>

            {/* Digits Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Factor A Digits */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  مراتب المضروب (العدد الأول): <strong className="text-brand-600 font-mono text-sm">{multDigitsA} مراتب</strong>
                </label>
                <div className="grid grid-cols-5 gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setMultDigitsA(d);
                        const min = Math.pow(10, d - 1);
                        setNumA(min + 4);
                        setMultStepIndex(0);
                        playClick(500);
                      }}
                      className={`py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                        multDigitsA === d ? "bg-brand-600 text-white font-black shadow-sm" : "text-slate-600 hover:bg-white"
                      }`}
                    >
                      {d} {d === 1 ? "مرتبة" : "مراتب"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Factor B Digits */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  مراتب المضروب به (العدد الثاني): <strong className="text-brand-600 font-mono text-sm">{multDigitsB} مراتب</strong>
                </label>
                <div className="grid grid-cols-5 gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setMultDigitsB(d);
                        const min = Math.pow(10, d - 1);
                        setNumB(min + 2);
                        setMultStepIndex(0);
                        playClick(520);
                      }}
                      className={`py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                        multDigitsB === d ? "bg-amber-500 text-slate-950 font-black shadow-sm" : "text-slate-600 hover:bg-white"
                      }`}
                    >
                      {d} {d === 1 ? "مرتبة" : "مراتب"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Inputs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="text-xs font-bold text-slate-600">أو أدخل الأرقام مباشرة:</span>
              <input
                type="number"
                min="1"
                max="99999"
                value={numA}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val > 0) {
                    setNumA(val);
                    setMultDigitsA(val.toString().length);
                    setMultStepIndex(0);
                  }
                }}
                className="w-28 px-3 py-1.5 rounded-xl border border-slate-300 font-mono text-sm text-center font-bold focus:ring-2 focus:ring-brand-500"
              />
              <span className="font-mono font-black text-lg text-slate-500">×</span>
              <input
                type="number"
                min="1"
                max="99999"
                value={numB}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val > 0) {
                    setNumB(val);
                    setMultDigitsB(val.toString().length);
                    setMultStepIndex(0);
                  }
                }}
                className="w-28 px-3 py-1.5 rounded-xl border border-slate-300 font-mono text-sm text-center font-bold focus:ring-2 focus:ring-amber-500"
              />
              <span className="font-mono font-black text-lg text-slate-500">=</span>
              <span className="font-mono font-black text-xl text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                {numA * numB}
              </span>
            </div>
          </div>

          {/* Interactive Animated Abacus for Multiplication */}
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-brand-600 block mb-1">
                  المحاكي التفاعلي للضرب خطوة بخطوة:
                </span>
                <h4 className="text-xl font-black text-slate-900">
                  {multSteps[multStepIndex]?.stepTitle}
                </h4>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">
                  الخطوة {multStepIndex + 1} من {multSteps.length}
                </span>
                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-600 rounded-full transition-all duration-300"
                    style={{ width: `${Math.round(((multStepIndex + 1) / multSteps.length) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Explanation of current step */}
            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              💡 {multSteps[multStepIndex]?.description}
            </div>

            {/* Visualizer Soroban Board */}
            <SorobanBeadVisualizer
              rodsConfig={multSteps[multStepIndex]?.beadRods}
              size="md"
              caption={`مخطط السوروبان: [المضروب: ${numA} (يسار)] — [فراغ ×] — [المضروب به: ${numB}] — [الناتج التراكمي: ${multSteps[multStepIndex]?.interimResult} (يمين)]`}
            />

            {/* Stepper Navigation Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMultStepIndex((i) => Math.max(0, i - 1));
                    playClick(460);
                  }}
                  disabled={multStepIndex <= 0}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>الخطوة السابقة</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAutoPlayingMult(!isAutoPlayingMult);
                    playClick(520);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isAutoPlayingMult
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-amber-50 text-amber-900 border border-amber-200"
                  }`}
                >
                  <Play className={`w-3.5 h-3.5 ${isAutoPlayingMult ? "animate-pulse fill-rose-600" : ""}`} />
                  <span>{isAutoPlayingMult ? "إيقاف العرض" : "تشغيل تلقائي ⏯️"}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMultStepIndex(0);
                    setIsAutoPlayingMult(false);
                    playClick(440);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة من البداية</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMultStepIndex((i) => Math.min(multSteps.length - 1, i + 1));
                    playClick(540);
                  }}
                  disabled={multStepIndex >= multSteps.length - 1}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-30 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all"
                >
                  <span>الخطوة التالية</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SOROBAN DIVISION SIMULATOR & EXPLAINER (UP TO 5 DIGITS) */}
      {/* ========================================================================= */}
      {activeTab === "division" && (
        <div className="space-y-10 animate-in fade-in duration-300">
          {/* Pedagogical Explanation Card */}
          <div className="bg-gradient-to-br from-emerald-900 to-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-400 text-slate-950 text-xs font-black">
                منهجية الأستاذ قتادة كريم
              </span>
              <span className="text-xs text-emerald-200">القسمة بالسوروبان (عكس الضرب تماماً)</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white leading-snug">
              كيف تتم عملية القسمة على السوروبان حتى 5 مراتب؟ ➗
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-200">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-2">
                <span className="text-emerald-300 font-bold block">1. الأعداد في أقصى اليسار:</span>
                <p className="leading-relaxed">
                  على عكس الضرب، نمثل <strong>المقسوم</strong> في أقصى اليسار، والمقسوم عليه، ونخصص أعمدة اليمين لتدوين الناتج (خارج القسمة).
                </p>
              </div>

              <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-2">
                <span className="text-emerald-300 font-bold block">2. القسمة = طرح متكرر:</span>
                <p className="leading-relaxed">
                  نقسم أعلى منزلة: نطرح حاصل ضرب الناتج الجزئي في المقسوم عليه من أعمدة اليسار، ونسجل الناتج في أعمدة اليمين.
                </p>
              </div>

              <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-2">
                <span className="text-emerald-300 font-bold block">3. الباقي يظل في اليسار:</span>
                <p className="leading-relaxed">
                  إذا انتهت القسمة تصبح أعمدة اليسار أصفاراً. وإذا كان هناك باقٍ، فإنه يظل مسجلاً في أقصى اليسار كباقي للعملية.
                </p>
              </div>
            </div>
          </div>

          {/* Configuration & Controls for Up to 5 Digits */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h4 className="text-lg font-black text-slate-900">
                  لوحة تحكم منازل القسمة (حتى 5 مراتب ÷ 5 مراتب)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  حدد عدد مراتب المقسوم والمقسوم عليه لتوليد مسألة وتتبع تفكيك الخرزات تلقائياً.
                </p>
              </div>

              <button
                type="button"
                onClick={randomizeDivProblem}
                className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold transition-all flex items-center gap-2"
              >
                <Shuffle className="w-4 h-4 text-emerald-700" />
                <span>توليد مسألة قسمة عشوائية 🎲</span>
              </button>
            </div>

            {/* Digits Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Dividend Digits */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  مراتب المقسوم (العدد الأكبر): <strong className="text-emerald-600 font-mono text-sm">{divDigitsDividend} مراتب</strong>
                </label>
                <div className="grid grid-cols-5 gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setDivDigitsDividend(d);
                        const min = Math.pow(10, d - 1);
                        setDividend(min * 4);
                        setDivStepIndex(0);
                        playClick(500);
                      }}
                      className={`py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                        divDigitsDividend === d ? "bg-emerald-600 text-white font-black shadow-sm" : "text-slate-600 hover:bg-white"
                      }`}
                    >
                      {d} {d === 1 ? "مرتبة" : "مراتب"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divisor Digits */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  مراتب المقسوم عليه: <strong className="text-emerald-600 font-mono text-sm">{divDigitsDivisor} مراتب</strong>
                </label>
                <div className="grid grid-cols-5 gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setDivDigitsDivisor(d);
                        const min = Math.pow(10, d - 1);
                        setDivisor(min + 1);
                        setDivStepIndex(0);
                        playClick(520);
                      }}
                      className={`py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                        divDigitsDivisor === d ? "bg-teal-600 text-white font-black shadow-sm" : "text-slate-600 hover:bg-white"
                      }`}
                    >
                      {d} {d === 1 ? "مرتبة" : "مراتب"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Inputs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="text-xs font-bold text-slate-600">أو أدخل الأرقام مباشرة:</span>
              <input
                type="number"
                min="1"
                max="99999"
                value={dividend}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val > 0) {
                    setDividend(val);
                    setDivStepIndex(0);
                  }
                }}
                className="w-28 px-3 py-1.5 rounded-xl border border-slate-300 font-mono text-sm text-center font-bold focus:ring-2 focus:ring-emerald-500"
              />
              <span className="font-mono font-black text-lg text-slate-500">÷</span>
              <input
                type="number"
                min="1"
                max="99999"
                value={divisor}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val > 0) {
                    setDivisor(val);
                    setDivStepIndex(0);
                  }
                }}
                className="w-28 px-3 py-1.5 rounded-xl border border-slate-300 font-mono text-sm text-center font-bold focus:ring-2 focus:ring-teal-500"
              />
              <span className="font-mono font-black text-lg text-slate-500">=</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-xl text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                  خارج القسمة: {Math.floor(dividend / divisor)}
                </span>
                {dividend % divisor !== 0 && (
                  <span className="font-mono font-black text-xs text-amber-800 bg-amber-50 px-2 py-1 rounded-xl border border-amber-200">
                    الباقي: {dividend % divisor}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Animated Abacus for Division */}
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-600 block mb-1">
                  المحاكي التفاعلي للقسمة خطوة بخطوة:
                </span>
                <h4 className="text-xl font-black text-slate-900">
                  {divSteps[divStepIndex]?.stepTitle}
                </h4>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">
                  الخطوة {divStepIndex + 1} من {divSteps.length}
                </span>
                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                    style={{ width: `${Math.round(((divStepIndex + 1) / divSteps.length) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Explanation of current step */}
            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              💡 {divSteps[divStepIndex]?.description}
            </div>

            {/* Visualizer Soroban Board */}
            <SorobanBeadVisualizer
              rodsConfig={divSteps[divStepIndex]?.beadRods}
              size="md"
              caption={`مخطط السوروبان: [المتبقي يساراً: ${divSteps[divStepIndex]?.remainderSoFar}] — [المقسوم عليه: ${divisor}] — [الناتج يميناً: ${divSteps[divStepIndex]?.quotientSoFar}]`}
            />

            {/* Stepper Navigation Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDivStepIndex((i) => Math.max(0, i - 1));
                    playClick(460);
                  }}
                  disabled={divStepIndex <= 0}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>الخطوة السابقة</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAutoPlayingDiv(!isAutoPlayingDiv);
                    playClick(520);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isAutoPlayingDiv
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-emerald-50 text-emerald-900 border border-emerald-200"
                  }`}
                >
                  <Play className={`w-3.5 h-3.5 ${isAutoPlayingDiv ? "animate-pulse fill-rose-600" : ""}`} />
                  <span>{isAutoPlayingDiv ? "إيقاف العرض" : "تشغيل تلقائي ⏯️"}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDivStepIndex(0);
                    setIsAutoPlayingDiv(false);
                    playClick(440);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة من البداية</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDivStepIndex((i) => Math.min(divSteps.length - 1, i + 1));
                    playClick(540);
                  }}
                  disabled={divStepIndex >= divSteps.length - 1}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                >
                  <span>الخطوة التالية</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Direct WhatsApp Assistance with Coach Qatadah */}
      <div className="text-center pt-4">
        <a
          href={getWhatsAppLink(
            `مرحباً أستاذ قتادة كريم، أود الاستفسار حول تدريب الضرب والقسمة على المعداد السوروبان وحفظ جداول الضرب.`
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs sm:text-sm transition-colors"
        >
          <span>تواصل مباشر مع الأستاذ قتادة كريم حول تدريبات الضرب والقسمة</span>
        </a>
      </div>
    </div>
  );
}
