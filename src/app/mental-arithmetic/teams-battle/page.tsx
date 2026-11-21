"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Trophy,
  Users,
  Play,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Timer,
  Medal,
  Award,
  Crown,
  ChevronRight,
  Settings2,
  Share2,
  Volume2,
  ArrowRight,
} from "lucide-react";
import {
  generateFlashAnzanSeries,
  playSoundEffect,
  speakSorobanNumber,
  speakSorobanCountdown,
  warmupSpeechEngine,
  formatTermSpeechText,
} from "@/lib/soroban-engine";
import { soundSynth } from "@/lib/audio-synthesizer";
import { getWhatsAppLink } from "@/lib/constants";
import PodiumIcon from "@/components/ui/PodiumIcon";

// Available Team Presets
interface Team {
  id: string;
  name: string;
  icon: string;
  colorName: string;
  borderClass: string;
  bgLightClass: string;
  badgeClass: string;
  gradientClass: string;
  score: number;
  correctCount: number;
  totalAttempts: number;
  totalTimeMs: number;
  bestSpeedMs: number;
}

const DEFAULT_TEAMS: Team[] = [
  {
    id: "A",
    name: "فريق الصقور (A)",
    icon: "🦅",
    colorName: "أزرق ملكي",
    borderClass: "border-blue-500",
    bgLightClass: "bg-blue-50 text-blue-900",
    badgeClass: "bg-blue-600 text-white",
    gradientClass: "from-blue-600 to-indigo-700",
    score: 0,
    correctCount: 0,
    totalAttempts: 0,
    totalTimeMs: 0,
    bestSpeedMs: 999999,
  },
  {
    id: "B",
    name: "فريق النجوم (B)",
    icon: "⭐",
    colorName: "أحمر ياقوتي",
    borderClass: "border-rose-500",
    bgLightClass: "bg-rose-50 text-rose-900",
    badgeClass: "bg-rose-600 text-white",
    gradientClass: "from-rose-600 to-red-700",
    score: 0,
    correctCount: 0,
    totalAttempts: 0,
    totalTimeMs: 0,
    bestSpeedMs: 999999,
  },
  {
    id: "C",
    name: "فريق الأبطال (C)",
    icon: "🦁",
    colorName: "أخضر زمردي",
    borderClass: "border-emerald-500",
    bgLightClass: "bg-emerald-50 text-emerald-900",
    badgeClass: "bg-emerald-600 text-white",
    gradientClass: "from-emerald-600 to-teal-700",
    score: 0,
    correctCount: 0,
    totalAttempts: 0,
    totalTimeMs: 0,
    bestSpeedMs: 999999,
  },
  {
    id: "D",
    name: "فريق العباقرة (D)",
    icon: "⚡",
    colorName: "ذهبي كهرماني",
    borderClass: "border-amber-500",
    bgLightClass: "bg-amber-50 text-amber-900",
    badgeClass: "bg-amber-600 text-slate-950 font-black",
    gradientClass: "from-amber-500 to-yellow-600",
    score: 0,
    correctCount: 0,
    totalAttempts: 0,
    totalTimeMs: 0,
    bestSpeedMs: 999999,
  },
  {
    id: "E",
    name: "فريق الفرسان (E)",
    icon: "🚀",
    colorName: "بنفسجي إمبراطوري",
    borderClass: "border-purple-500",
    bgLightClass: "bg-purple-50 text-purple-900",
    badgeClass: "bg-purple-600 text-white",
    gradientClass: "from-purple-600 to-violet-800",
    score: 0,
    correctCount: 0,
    totalAttempts: 0,
    totalTimeMs: 0,
    bestSpeedMs: 999999,
  },
];

type GameStage = "setup" | "countdown" | "flashing" | "answering" | "feedback" | "podium";

export default function TeamsBattlePage() {
  // Game Configuration State
  const [teamCount, setTeamCount] = useState<2 | 3 | 4 | 5>(2);
  const [teams, setTeams] = useState<Team[]>(DEFAULT_TEAMS.slice(0, 2));
  const [digitsCount, setDigitsCount] = useState<1 | 2 | 3>(1);
  const [rulesLevel, setRulesLevel] = useState<"simple" | "complex_5" | "complex_10" | "all">("simple");
  const [targetRules, setTargetRules] = useState<number[]>([]);
  const [allowSubtraction, setAllowSubtraction] = useState<boolean>(true);
  const [termsCount, setTermsCount] = useState<number>(4);
  const [showDelayMs, setShowDelayMs] = useState<number>(700); // 0.7s Arabic sweet-spot
  const [totalRounds, setTotalRounds] = useState<number>(5);
  const [voiceMode, setVoiceMode] = useState<"arabic" | "english" | "off">("arabic");
  const [answerMode, setAnswerMode] = useState<"typing" | "choices">("choices");
  const [questionChoices, setQuestionChoices] = useState<number[]>([]);

  // Battle Runtime State
  const [stage, setStage] = useState<GameStage>("setup");
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [activeTeamIndex, setActiveTeamIndex] = useState<number>(0);
  const [countdownNum, setCountdownNum] = useState<number>(3);

  // Active Question State
  const [currentSeries, setCurrentSeries] = useState<number[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);
  const [currentFlashIdx, setCurrentFlashIdx] = useState<number>(-1);
  const [isFlashVisible, setIsFlashVisible] = useState<boolean>(false);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [isLastAnswerCorrect, setIsLastAnswerCorrect] = useState<boolean | null>(null);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);
  const [answerTimeMs, setAnswerTimeMs] = useState<number>(0);

  // Reaction Timer
  const turnStartTimeRef = useRef<number>(0);
  const arenaCardRef = useRef<HTMLDivElement | null>(null);

  // Speech Voice
  const speakNumber = useCallback(
    (num: number) => {
      speakSorobanNumber(num, voiceMode, showDelayMs);
    },
    [voiceMode, showDelayMs]
  );

  // Initialize or reset teams according to teamCount
  const handleTeamCountChange = (count: 2 | 3 | 4 | 5) => {
    setTeamCount(count);
    setTeams(
      DEFAULT_TEAMS.slice(0, count).map((t) => ({
        ...t,
        score: 0,
        correctCount: 0,
        totalAttempts: 0,
        totalTimeMs: 0,
        bestSpeedMs: 999999,
      }))
    );
  };

  const handleTeamNameChange = (idx: number, newName: string) => {
    setTeams((prev) => prev.map((t, i) => (i === idx ? { ...t, name: newName } : t)));
  };

  // Start Tournament
  const startTournament = () => {
    warmupSpeechEngine();
    // Reset tournament stats
    setTeams((prev) =>
      prev.map((t) => ({
        ...t,
        score: 0,
        correctCount: 0,
        totalAttempts: 0,
        totalTimeMs: 0,
        bestSpeedMs: 999999,
      }))
    );
    setCurrentRound(1);
    setActiveTeamIndex(0);
    startTurnForTeam(0, 1);
  };

  // Prepare and launch turn for team
  const startTurnForTeam = (teamIdx: number, roundNum: number) => {
    warmupSpeechEngine();
    setActiveTeamIndex(teamIdx);
    setCurrentRound(roundNum);
    setUserAnswer("");
    setIsLastAnswerCorrect(null);
    setEarnedPoints(0);

    // Generate Flash Series for this team
    const generated = generateFlashAnzanSeries({
      termsCount,
      digitsCount,
      showDelayMs,
      clearDelayMs: 250,
      allowSubtraction,
      level: rulesLevel === "all" ? "mixed" : rulesLevel,
      targetRules: targetRules.length > 0 ? targetRules : undefined,
      numeralSystem: "western",
    });

    const sum = generated.reduce((a, b) => a + b, 0);
    setCurrentSeries(generated);
    setCorrectAnswer(sum);

    // توليد 4 اختيارات ذكية متقاربة للسؤال
    const choicesSet = new Set<number>([sum]);
    const deltas = [-1, 1, -2, 2, -10, 10, -5, 5, 3, -3, -4, 4];
    const shuffledDeltas = [...deltas].sort(() => Math.random() - 0.5);
    for (const d of shuffledDeltas) {
      if (choicesSet.size >= 4) break;
      choicesSet.add(sum + d);
    }
    while (choicesSet.size < 4) {
      const randOffset = Math.floor(Math.random() * 10) + 1;
      choicesSet.add(sum + (Math.random() > 0.5 ? randOffset : -randOffset));
    }
    setQuestionChoices(Array.from(choicesSet).sort(() => Math.random() - 0.5));

    // Start 3.. 2.. 1 countdown
    setStage("countdown");
    setCountdownNum(3);

    setTimeout(() => {
      arenaCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  };

  // Countdown timer effect
  useEffect(() => {
    if (stage !== "countdown") return;

    speakSorobanCountdown(3, voiceMode);
    let c = 3;
    const timer = setInterval(() => {
      c -= 1;
      if (c <= 0) {
        clearInterval(timer);
        setCountdownNum(0);
        setStage("flashing");
      } else {
        setCountdownNum(c);
        speakSorobanCountdown(c, voiceMode);
      }
    }, 850);

    return () => clearInterval(timer);
  }, [stage, voiceMode]);

  // Flash Animation Sequence Loop
  useEffect(() => {
    if (stage !== "flashing" || currentSeries.length === 0) return;

    const timers: NodeJS.Timeout[] = [];
    let delayAccumulator = 120;
    const clearGapMs = Math.min(240, Math.max(120, Math.round(showDelayMs * 0.3)));

    currentSeries.forEach((num, idx) => {
      // Show number & speak immediately
      const showTimer = setTimeout(() => {
        setCurrentFlashIdx(idx);
        setIsFlashVisible(true);
        speakNumber(num);
      }, delayAccumulator);
      timers.push(showTimer);

      delayAccumulator += showDelayMs;

      // Blank interval between numbers
      const blankTimer = setTimeout(() => {
        setIsFlashVisible(false);
      }, delayAccumulator);
      timers.push(blankTimer);

      delayAccumulator += clearGapMs;
    });

    // Move to answering stage
    const finishTimer = setTimeout(() => {
      setIsFlashVisible(false);
      soundSynth.playFlashCue("complete");
      turnStartTimeRef.current = Date.now();
      setStage("answering");
    }, delayAccumulator);
    timers.push(finishTimer);

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [stage, currentSeries, showDelayMs, speakNumber]);

  // Submit Answer
  const handleAnswerSubmit = (e?: React.FormEvent, directVal?: number) => {
    if (e) e.preventDefault();
    if (stage !== "answering") return;

    let finalVal: number;
    if (directVal !== undefined) {
      finalVal = directVal;
      setUserAnswer(directVal.toString());
    } else {
      if (!userAnswer.trim()) return;
      finalVal = parseInt(userAnswer, 10);
    }

    if (isNaN(finalVal)) return;

    const timeTaken = Math.max(200, Date.now() - turnStartTimeRef.current);
    setAnswerTimeMs(timeTaken);

    const isCorrect = finalVal === correctAnswer;
    setIsLastAnswerCorrect(isCorrect);

    // Calculate score: 100 base points + speed bonus if under 3.5s
    let points = 0;
    if (isCorrect) {
      const speedBonus = Math.max(0, Math.round((5000 - timeTaken) / 50));
      points = 100 + speedBonus;
      playSoundEffect("correct");
    } else {
      playSoundEffect("wrong");
    }
    setEarnedPoints(points);

    // Update Team Stats
    setTeams((prev) =>
      prev.map((t, idx) => {
        if (idx !== activeTeamIndex) return t;
        return {
          ...t,
          score: t.score + points,
          correctCount: t.correctCount + (isCorrect ? 1 : 0),
          totalAttempts: t.totalAttempts + 1,
          totalTimeMs: t.totalTimeMs + timeTaken,
          bestSpeedMs: isCorrect ? Math.min(t.bestSpeedMs, timeTaken) : t.bestSpeedMs,
        };
      })
    );

    setStage("feedback");
  };

  // Move to Next Turn or Next Round
  const handleProceedNext = () => {
    const nextTeamIdx = activeTeamIndex + 1;

    if (nextTeamIdx < teams.length) {
      // Next team in current round
      startTurnForTeam(nextTeamIdx, currentRound);
    } else {
      // All teams finished current round -> Check if tournament finished
      const nextRound = currentRound + 1;
      if (nextRound > totalRounds) {
        // Tournament completed! Trigger celebration fanfare and podium!
        setStage("podium");
        soundSynth.playCelebrationFanfare(0.4);
      } else {
        // Start next round with Team A (index 0)
        startTurnForTeam(0, nextRound);
      }
    }
  };

  // Sorted teams for the podium (highest score first, tie-breaker: fastest time)
  const rankedTeams = [...teams].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.totalTimeMs - b.totalTimeMs;
  });

  const activeTeam = teams[activeTeamIndex] || teams[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1 text-right">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
            <Link href="/" className="hover:text-brand-600 transition-colors">
              الرئيسية
            </Link>
            <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            <Link href="/mental-arithmetic" className="hover:text-brand-600 transition-colors">
              الحساب الذهني
            </Link>
            <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            <span className="text-brand-600">حلبة تحدي الفرق والبطولات</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 flex items-center gap-2.5">
            <PodiumIcon className="w-9 h-9 text-amber-500 shrink-0" />
            <span>حلبة تحدي الفرق | بطولة العقل الخارق</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            منافسة حية بنظام المسار السريع وتتويج رسمي: مركز بطل الأبطال 🏆، مركز البطل 🥈، والمركز الأول 🥉
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {stage !== "setup" && (
            <button
              onClick={() => setStage("setup")}
              className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <Settings2 className="w-4 h-4" />
              <span>إعدادات البطولة</span>
            </button>
          )}
          <Link
            href="/mental-arithmetic"
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>رجوع</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SETUP STAGE (لوحة ضبط البطولة والفرق)                                 */}
      {/* ========================================================================= */}
      {stage === "setup" && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white border border-amber-500/30 shadow-2xl space-y-8 text-right">
            <div className="space-y-2">
              <span className="px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30 inline-block">
                لوحة إعداد البطولة للمدرب
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                تجهيز حلبة السباق وتحدي الفرق
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm">
                حدد عدد الفرق المتنافسة، مستويات الخانات، سرعة الوميض، وعدد الجولات ثم انطلق بالسباق:
              </p>
            </div>

            {/* Team Count Selector */}
            {/* Team Count Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-amber-300 block">
                1. عدد الفرق المتنافسة في الحلبة:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {([2, 3, 4, 5] as const).map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => handleTeamCountChange(cnt)}
                    className={`py-3 px-3 rounded-2xl border text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 ${
                      teamCount === cnt
                        ? "bg-amber-400 text-slate-950 border-amber-300 shadow-lg scale-102"
                        : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>{cnt === 2 ? "فريقان (2)" : `${cnt} فرق متنافسة`}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Team Names Customization */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 block">
                2. تخصيص أسماء وشعارات الفرق:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teams.map((tm, idx) => (
                  <div
                    key={tm.id}
                    className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center gap-3"
                  >
                    <span className="text-2xl">{tm.icon}</span>
                    <input
                      type="text"
                      value={tm.name}
                      onChange={(e) => handleTeamNameChange(idx, e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none focus:border-amber-400 text-right"
                    />
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${tm.badgeClass}`}>
                      فريق {tm.id}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Math Competition Rules Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
              {/* Digits Count */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">عدد الخانات (Digits):</label>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setDigitsCount(1)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      digitsCount === 1 ? "bg-amber-400 text-slate-950 font-black shadow-sm" : "text-slate-400"
                    }`}
                  >
                    آحاد (1)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDigitsCount(2)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      digitsCount === 2 ? "bg-amber-400 text-slate-950 font-black shadow-sm" : "text-slate-400"
                    }`}
                  >
                    عشرات (2)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDigitsCount(3)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      digitsCount === 3 ? "bg-amber-400 text-slate-950 font-black shadow-sm" : "text-slate-400"
                    }`}
                  >
                    مئات (3)
                  </button>
                </div>
              </div>

              {/* Rules Level */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">قواعد السوروبان (الافتراضي: بسيط):</label>
                <select
                  value={rulesLevel}
                  onChange={(e) => {
                    setRulesLevel(e.target.value as "simple" | "complex_5" | "complex_10" | "all");
                    setTargetRules([]);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs font-bold focus:outline-none focus:border-amber-400 text-right"
                >
                  <option value="simple">✅ الجمع والطرح البسيط (بدون أصدقاء)</option>
                  <option value="complex_5">5️⃣ أصدقاء الـ 5 (المساعد الصغير ±)</option>
                  <option value="complex_10">🔟 أصدقاء الـ 10 (المساعد الكبير ±)</option>
                  <option value="all">🔀 شامل مكس (أصدقاء 5 و 10 معاً)</option>
                </select>
              </div>

              {/* Operations Type (Addition & Subtraction vs Addition Only) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">نوع العمليات:</label>
                <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAllowSubtraction(true)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      allowSubtraction ? "bg-amber-400 text-slate-950 font-black shadow-sm" : "text-slate-400"
                    }`}
                  >
                    ➕➖ جمع وطرح
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllowSubtraction(false)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      !allowSubtraction ? "bg-amber-400 text-slate-950 font-black shadow-sm" : "text-slate-400"
                    }`}
                  >
                    ➕ جمع فقط
                  </button>
                </div>
              </div>

              {/* Optional sub-rule picker if trainer selects complex_5 or complex_10 */}
              {(rulesLevel === "complex_5" || rulesLevel === "complex_10") && (
                <div className="col-span-full p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-300">
                    <span>تخصيص القاعدة الفرعية للمدرب (اختياري — اتركه للكل):</span>
                    <button
                      type="button"
                      onClick={() => setTargetRules([])}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-black ${
                        targetRules.length === 0
                          ? "bg-amber-400 text-slate-950"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      الكل
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(rulesLevel === "complex_5" ? [1, 2, 3, 4] : [1, 2, 3, 4, 5, 6, 7, 8, 9]).map(
                      (r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() =>
                            setTargetRules((prev) =>
                              prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
                            )
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all ${
                            targetRules.includes(r)
                              ? "bg-amber-400 text-slate-950 border-amber-300"
                              : "bg-slate-800 text-slate-300 border-slate-700"
                          }`}
                        >
                          قاعدة {r} (±{r})
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Numbers Count per turn */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">عدد الأرقام في المسألة:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                  {[3, 4, 5, 7].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setTermsCount(num)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        termsCount === num ? "bg-amber-400 text-slate-950 font-black shadow-sm" : "text-slate-400"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flash Speed */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">سرعة الوميض (ثانية/رقم):</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                  {[
                    { ms: 500, label: "0.5s" },
                    { ms: 700, label: "0.7s ⭐" },
                    { ms: 1000, label: "1.0s" },
                    { ms: 1500, label: "1.5s" },
                  ].map((spd) => (
                    <button
                      key={spd.ms}
                      type="button"
                      onClick={() => setShowDelayMs(spd.ms)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        showDelayMs === spd.ms
                          ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                          : "text-slate-400"
                      }`}
                    >
                      {spd.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Rounds */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">عدد الجولات:</label>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                  {[3, 5, 10].map((rnd) => (
                    <button
                      key={rnd}
                      type="button"
                      onClick={() => setTotalRounds(rnd)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        totalRounds === rnd ? "bg-amber-400 text-slate-950 font-black shadow-sm" : "text-slate-400"
                      }`}
                    >
                      {rnd} جولات
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound Mode */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">الصوت والنطق:</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setVoiceMode("arabic")}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      voiceMode === "arabic" ? "bg-emerald-500 text-white font-black" : "text-slate-400"
                    }`}
                  >
                    عربي 🗣️
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoiceMode("english")}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      voiceMode === "english" ? "bg-brand-500 text-white font-black" : "text-slate-400"
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoiceMode("off")}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      voiceMode === "off" ? "bg-rose-500 text-white font-black" : "text-slate-400"
                    }`}
                  >
                    صامت 🔇
                  </button>
                </div>
              </div>

              {/* Answer Mode (Multiple Choices vs Keypad) */}
              <div className="space-y-2 col-span-full">
                <label className="text-xs font-bold text-slate-300 block">طريقة إدخال الإجابة:</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAnswerMode("choices")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      answerMode === "choices"
                        ? "bg-amber-400 text-slate-950 font-black shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>🎯 اختيارات متعددة (4 بطاقات سريعة للمس)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnswerMode("typing")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      answerMode === "typing"
                        ? "bg-amber-400 text-slate-950 font-black shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>⌨️ كتابة الناتج (لوحة أرقام)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Launch Tournament CTA */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
              <div className="text-xs text-slate-400">
                ⚡ إجمالي المسائل: <strong className="text-amber-300 font-bold">{totalRounds * teamCount} مسألة</strong> ({totalRounds} جولات لكل فريق).
              </div>

              <button
                type="button"
                onClick={startTournament}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-base shadow-xl shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>بدء بطولة التحدي الآن 🚀</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LIVE BATTLE ARENA (شاشة السباق والتحدي المباشر)                       */}
      {/* ========================================================================= */}
      {(stage === "countdown" || stage === "flashing" || stage === "answering" || stage === "feedback") && (
        <div ref={arenaCardRef} className="space-y-6 animate-in fade-in duration-300">
          {/* Compact Top Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100">
                الجولة {currentRound} من {totalRounds}
              </span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                {termsCount} أرقام • {digitsCount === 1 ? "آحاد" : digitsCount === 2 ? "عشرات" : "مئات"}
              </span>
            </div>

            {/* Mini Team Score Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {teams.map((tm, idx) => (
                <div
                  key={tm.id}
                  className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                    idx === activeTeamIndex
                      ? `${tm.badgeClass} ring-2 ring-amber-400 scale-105 shadow-sm`
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <span>{tm.icon}</span>
                  <span className="hidden sm:inline">{tm.name}</span>
                  <span className="font-mono">({tm.score})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Turn Stage Card — High-Contrast Flash Anzan Style Screen */}
          <div
            className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 text-white p-6 sm:p-12 shadow-2xl text-center space-y-6 border-4 border-slate-800 min-h-[400px] sm:min-h-[460px] flex flex-col items-center justify-between"
          >
            {/* Ambient Glow */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Active Team Header */}
            <div className="relative z-10 w-full flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
              <div className={`inline-flex items-center gap-2.5 px-5 py-2 rounded-2xl bg-gradient-to-r ${activeTeam.gradientClass} text-white font-black text-sm sm:text-base shadow-lg border border-white/20`}>
                <span className="text-xl">{activeTeam.icon}</span>
                <span>دور: {activeTeam.name}</span>
                <span className="text-amber-200 font-mono text-xs sm:text-sm">({activeTeam.score} نقطة)</span>
              </div>

              {stage === "flashing" && (
                <div className="bg-slate-900/90 px-4 py-1.5 rounded-xl border border-slate-700 font-mono text-emerald-400 font-black text-sm">
                  {(currentFlashIdx >= 0 ? currentFlashIdx + 1 : 1)} / {currentSeries.length}
                </div>
              )}
            </div>

            {/* Stage: Countdown */}
            {stage === "countdown" && (
              <div className="relative z-10 py-8 space-y-4 animate-in zoom-in-75 duration-200 my-auto">
                <div
                  className="font-black text-amber-400 drop-shadow-[0_12px_32px_rgba(245,158,11,0.55)] select-none leading-none"
                  style={{
                    fontSize: "clamp(8rem, 35vmin, 20rem)",
                    fontFamily: "'Fredoka', 'Baloo Bhaijaan 2', 'Alexandria', sans-serif",
                  }}
                >
                  {countdownNum}
                </div>
                <p className="text-base sm:text-xl font-black text-amber-200 tracking-wide">
                  استعدوا يا أبطال... الوميض سيبدأ فوراً!
                </p>
              </div>
            )}

            {/* Stage: Flashing Numbers (HUGE & CRYSTAL CLEAR - DYNAMIC TO SCREEN ORIENTATION & ROTATION) */}
            {stage === "flashing" && (
              <div className="relative z-10 py-2 sm:py-6 space-y-4 my-auto w-full flex flex-col items-center justify-center min-h-[55vh] sm:min-h-[65vh] landscape:min-h-[75vh]">
                <div className="flex-1 flex flex-col items-center justify-center w-full">
                  {isFlashVisible && currentFlashIdx >= 0 ? (
                    <div className="animate-in zoom-in-95 fade-in duration-75 flex flex-col items-center justify-center w-full">
                      <div
                        dir="ltr"
                        className={`font-black tracking-normal select-none leading-none px-3 sm:px-10 py-3 sm:py-6 rounded-3xl sm:rounded-[3rem] bg-slate-900/95 border-4 border-amber-400/50 shadow-2xl transition-all w-full max-w-full text-center ${
                          currentSeries[currentFlashIdx] < 0
                            ? "text-rose-400 drop-shadow-[0_14px_35px_rgba(244,63,94,0.5)]"
                            : "text-emerald-400 drop-shadow-[0_14px_35px_rgba(16,185,129,0.5)]"
                        }`}
                        style={{
                          fontSize: "clamp(7rem, 36vmin, 24rem)",
                          fontFamily: "'Fredoka', 'Baloo Bhaijaan 2', 'Alexandria', sans-serif",
                        }}
                      >
                        {currentSeries[currentFlashIdx] > 0
                          ? `+${currentSeries[currentFlashIdx]}`
                          : `−${Math.abs(currentSeries[currentFlashIdx])}`}
                      </div>

                      {voiceMode !== "off" && (
                        <span className="mt-4 px-4 py-1.5 rounded-full bg-slate-800/95 border border-slate-700 text-amber-300 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md">
                          <Volume2 className="w-4 h-4 text-amber-400" />
                          <span>
                            {formatTermSpeechText(currentSeries[currentFlashIdx], voiceMode)}
                          </span>
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32">
                      <div className="w-4 h-4 rounded-full bg-amber-400/40 animate-ping" />
                    </div>
                  )}
                </div>

                {/* Progress Dots */}
                <div className="flex items-center justify-center gap-2">
                  {currentSeries.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2.5 rounded-full transition-all duration-200 ${
                        idx === currentFlashIdx
                          ? "w-10 bg-amber-400 shadow-sm shadow-amber-400/50"
                          : idx < currentFlashIdx
                          ? "w-3 bg-emerald-400"
                          : "w-3 bg-white/20"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Stage: Answering (إدخال الحل وحساب زمن السرعة - اختيارات متعددة أو كتابة) */}
            {stage === "answering" && (
              <div className="relative z-10 max-w-lg w-full mx-auto space-y-5 py-2 my-auto animate-in fade-in duration-200">
                <div className="space-y-1.5 text-center">
                  <span className="text-sm sm:text-base font-black text-amber-300 flex items-center justify-center gap-1.5">
                    <Timer className="w-5 h-5 animate-spin" />
                    <span>انتهت الأرقام! {answerMode === "choices" ? "المس الناتج الصحيح بأسرع ما يمكن:" : "أدخل الناتج الصحيح بأسرع ما يمكن:"}</span>
                  </span>
                  <p className="text-xs text-slate-300">كلما أسرعت في الإجابة حصد فريقك نقاط سرعة إضافية!</p>
                </div>

                {answerMode === "choices" ? (
                  /* Multiple Choices Mode (4 Large Soft 3D Cards) */
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
                    {questionChoices.map((choice, cIdx) => {
                      const choiceGradients = [
                        "from-emerald-500 to-teal-700 border-emerald-300 hover:from-emerald-400 hover:to-teal-600 shadow-emerald-950/40",
                        "from-blue-500 to-indigo-700 border-blue-300 hover:from-blue-400 hover:to-indigo-600 shadow-indigo-950/40",
                        "from-amber-500 to-orange-700 border-amber-300 hover:from-amber-400 hover:to-orange-600 shadow-amber-950/40",
                        "from-purple-500 to-pink-700 border-purple-300 hover:from-purple-400 hover:to-pink-600 shadow-purple-950/40",
                      ];
                      return (
                        <button
                          key={cIdx}
                          type="button"
                          onClick={() => handleAnswerSubmit(undefined, choice)}
                          className={`p-5 sm:p-7 rounded-3xl bg-gradient-to-br ${choiceGradients[cIdx % 4]} text-white font-mono font-black text-3xl sm:text-5xl border-4 shadow-xl active:scale-95 transition-all flex items-center justify-center cursor-pointer`}
                        >
                          {choice}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* Virtual Keypad Mode */
                  <form onSubmit={handleAnswerSubmit} className="space-y-4">
                    <input
                      type="number"
                      autoFocus
                      placeholder="الناتج..."
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="w-full text-center text-4xl sm:text-5xl font-black font-mono py-4 px-6 rounded-2xl bg-slate-900 text-white border-4 border-amber-400 shadow-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/30"
                    />

                    {/* Virtual Quick Keypad */}
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                        <button
                          key={digit}
                          type="button"
                          onClick={() => setUserAnswer((prev) => prev + digit)}
                          className="py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 active:scale-95 text-white font-mono font-black text-2xl rounded-xl transition-all"
                        >
                          {digit}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setUserAnswer((prev) => prev.slice(0, -1))}
                        className="py-3.5 bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 active:scale-95 text-rose-200 font-bold text-sm rounded-xl transition-all"
                      >
                        مسح ⌫
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserAnswer((prev) => prev + "0")}
                        className="py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 active:scale-95 text-white font-mono font-black text-2xl rounded-xl transition-all"
                      >
                        0
                      </button>
                      <button
                        type="submit"
                        className="py-3.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-base rounded-xl transition-all shadow-lg"
                      >
                        تأكيد ✔
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Stage: Feedback (نتيجة الحل والنقاط) */}
            {stage === "feedback" && (
              <div className="relative z-10 py-4 space-y-6 max-w-lg w-full mx-auto my-auto animate-in zoom-in-95 duration-200">
                {isLastAnswerCorrect ? (
                  <div className="p-6 rounded-3xl bg-emerald-950/90 border-2 border-emerald-400 text-white space-y-3 shadow-2xl">
                    <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                    <h3 className="text-2xl sm:text-3xl font-black text-emerald-300">
                      إجابة صحيحة خارقة! ⚡
                    </h3>
                    <div className="flex items-center justify-center gap-4 text-sm font-bold">
                      <span className="px-3.5 py-1.5 rounded-full bg-emerald-800 text-white font-mono text-base">
                        +{earnedPoints} نقطة
                      </span>
                      <span className="text-emerald-200 font-mono">
                        السرعة: {(answerTimeMs / 1000).toFixed(2)}s
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-3xl bg-rose-950/90 border-2 border-rose-400 text-white space-y-3 shadow-2xl">
                    <XCircle className="w-16 h-16 text-rose-400 mx-auto" />
                    <h3 className="text-2xl sm:text-3xl font-black text-rose-300">
                      إجابة غير صحيحة!
                    </h3>
                    <p className="text-base text-slate-200">
                      الناتج الصحيح كان: <strong className="text-amber-300 font-mono text-2xl">{correctAnswer}</strong>
                    </p>
                    <p className="text-xs text-rose-200 font-mono" dir="ltr">
                      {currentSeries.map((n, i) => (i === 0 ? `${n}` : n >= 0 ? `+ ${n}` : `− ${Math.abs(n)}`)).join("  ")} = {correctAnswer}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleProceedNext}
                  className="w-full py-4 px-8 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-base shadow-2xl transition-all flex items-center justify-center gap-2"
                >
                  <span>
                    {activeTeamIndex + 1 < teams.length
                      ? `الانتقال إلى ${teams[activeTeamIndex + 1]?.name} ⬅`
                      : currentRound < totalRounds
                      ? `الانطلاق إلى الجولة ${currentRound + 1} 🚀`
                      : "إعلان نتائج البطولة والتتويج 🏆"}
                  </span>
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Live Race Track (لوحة سباق الفرق) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-bold">
                <PodiumIcon className="w-4 h-4 text-amber-500 shrink-0" />
                <span>مسار سباق الفرق نحو الكأس الذهبي</span>
              </div>
              <span className="text-xs font-bold text-slate-500">
                ترتيب النقاط المباشر
              </span>
            </div>

            {/* Race Lanes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {teams.map((tm, idx) => {
                const isActive = idx === activeTeamIndex;
                const maxPossibleScore = totalRounds * 150;
                const progressPct = Math.min(100, Math.round((tm.score / maxPossibleScore) * 100));
                const isLeader = rankedTeams[0]?.id === tm.id && tm.score > 0;

                return (
                  <div
                    key={tm.id}
                    className={`p-4 rounded-2xl border transition-all duration-300 ${
                      isActive
                        ? `${tm.borderClass} ${tm.bgLightClass} ring-2 ring-brand-500/20 shadow-md`
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{tm.icon}</span>
                        <div>
                          <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                            {tm.name}
                            {isLeader && (
                              <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                                <Crown className="w-3 h-3 fill-slate-950" />
                                المتصدر
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            صحيح: {tm.correctCount} / {tm.totalAttempts}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-black text-lg sm:text-2xl text-slate-900 dark:text-white">
                          {tm.score}
                        </span>
                        <span className="text-[10px] text-slate-500 block">نقطة</span>
                      </div>
                    </div>

                    {/* Progress Bar Track */}
                    <div className="relative w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${tm.gradientClass} transition-all duration-700 rounded-full`}
                        style={{ width: `${Math.max(5, progressPct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. GRAND PODIUM & AWARDS (منصة التتويج الملكية)                           */}
      {/* ========================================================================= */}
      {stage === "podium" && (
        <div className="space-y-12 animate-in zoom-in-95 duration-500">
          {/* Top Championship Header */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-14 border border-amber-500/40 shadow-2xl text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 text-amber-300 text-xs sm:text-sm font-bold border border-amber-400/30">
              <PodiumIcon className="w-4 h-4 text-amber-400 shrink-0" />
              <span>منصة التتويج الرسمية — بطولة العقل الخارق</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white">
              مبارك لجميع الأبطال المتوجين! 🏆
            </h2>

            <p className="text-amber-300 text-base sm:text-lg font-bold">
              إشراف وتدريب الأستاذ قتادة كريم — صانع الأبطال وبطل الأبطال 2024
            </p>
          </div>

          {/* 3D Olympic Podium Display */}
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-12 border border-slate-200/90 shadow-2xl space-y-12">
            <div className="text-center space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                منصة المراتب والكؤوس الرسمية
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                الترتيب النهائي وفق مجموع النقاط وسرعة الاستجابة الذهنية:
              </p>
            </div>

            {/* Podium Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto pt-8">
              {/* 2nd Place (الفضي - مركز البطل) */}
              {rankedTeams[1] && (
                <div className="order-2 md:order-1 flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-slate-100 border-4 border-slate-300 flex items-center justify-center text-3xl shadow-lg">
                      🥈
                    </div>
                    <span className="absolute -bottom-2 inset-x-0 mx-auto w-max px-2.5 py-0.5 rounded-full bg-slate-700 text-white text-[10px] font-black">
                      المرتبة 2
                    </span>
                  </div>

                  <div className="text-center space-y-1">
                    <span className="text-xs font-bold text-slate-500 block">
                      مركز البطل (The Champion)
                    </span>
                    <h4 className="text-lg font-black text-slate-900">
                      {rankedTeams[1].name}
                    </h4>
                    <span className="text-xl font-black font-mono text-slate-700 block">
                      {rankedTeams[1].score} نقطة
                    </span>
                  </div>

                  {/* Silver Pedestal */}
                  <div className="w-full h-36 bg-gradient-to-t from-slate-300 to-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-700 border-2 border-slate-300 shadow-md">
                    <Medal className="w-10 h-10 text-slate-500 mb-1" />
                    <span className="text-3xl font-black font-mono">2</span>
                    <span className="text-xs font-bold">كأس فضي</span>
                  </div>
                </div>
              )}

              {/* 1st Place (الذهبي - مركز بطل الأبطال) */}
              {rankedTeams[0] && (
                <div className="order-1 md:order-2 flex flex-col items-center space-y-4 -mt-8">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-500 border-4 border-amber-300 flex items-center justify-center text-4xl shadow-2xl animate-bounce">
                      🏆
                    </div>
                    <span className="absolute -top-3 inset-x-0 mx-auto w-max px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black shadow-md flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 fill-slate-950" />
                      بطل الأبطال
                    </span>
                  </div>

                  <div className="text-center space-y-1">
                    <span className="text-xs font-black text-amber-600 block uppercase tracking-wider">
                      مركز بطل الأبطال (Champion of Champions)
                    </span>
                    <h4 className="text-2xl font-black text-slate-900">
                      {rankedTeams[0].name}
                    </h4>
                    <span className="text-3xl font-black font-mono text-amber-600 block">
                      {rankedTeams[0].score} نقطة
                    </span>
                  </div>

                  {/* Gold Pedestal (Tallest) */}
                  <div className="w-full h-52 bg-gradient-to-t from-amber-400 via-amber-300 to-yellow-200 rounded-3xl flex flex-col items-center justify-center text-slate-950 border-4 border-amber-300 shadow-xl">
                    <Trophy className="w-14 h-14 text-amber-700 mb-1 animate-pulse" />
                    <span className="text-5xl font-black font-mono">1</span>
                    <span className="text-sm font-black">الكأس الذهبي الأول</span>
                  </div>
                </div>
              )}

              {/* 3rd Place (البرونزي - المركز الأول) */}
              {rankedTeams[2] && (
                <div className="order-3 flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-amber-100 border-4 border-amber-600/40 flex items-center justify-center text-3xl shadow-lg">
                      🥉
                    </div>
                    <span className="absolute -bottom-2 inset-x-0 mx-auto w-max px-2.5 py-0.5 rounded-full bg-amber-800 text-white text-[10px] font-black">
                      المرتبة 3
                    </span>
                  </div>

                  <div className="text-center space-y-1">
                    <span className="text-xs font-bold text-amber-800 block">
                      المركز الأول (First Place)
                    </span>
                    <h4 className="text-lg font-black text-slate-900">
                      {rankedTeams[2].name}
                    </h4>
                    <span className="text-xl font-black font-mono text-amber-800 block">
                      {rankedTeams[2].score} نقطة
                    </span>
                  </div>

                  {/* Bronze Pedestal */}
                  <div className="w-full h-28 bg-gradient-to-t from-amber-600/30 to-amber-600/15 rounded-2xl flex flex-col items-center justify-center text-amber-900 border-2 border-amber-600/30 shadow-md">
                    <Award className="w-8 h-8 text-amber-700 mb-1" />
                    <span className="text-2xl font-black font-mono">3</span>
                    <span className="text-xs font-bold">كأس برونزي</span>
                  </div>
                </div>
              )}
            </div>

            {/* 4th & 5th Teams Recognition (if 4 or 5 teams played) */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-2xl mx-auto">
              {rankedTeams[3] && (
                <div className="flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                  <span className="text-xs font-bold text-slate-500">
                    🎖️ وسام التميز والمثابرة (المرتبة الرابعة):
                  </span>
                  <div className="font-bold text-slate-800 text-sm">
                    {rankedTeams[3].name} — {rankedTeams[3].score} نقطة (دقة: {Math.round((rankedTeams[3].correctCount / Math.max(1, rankedTeams[3].totalAttempts)) * 100)}%)
                  </div>
                </div>
              )}
              {rankedTeams[4] && (
                <div className="flex-1 p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-center space-y-1">
                  <span className="text-xs font-bold text-purple-700">
                    🌟 وسام الشرف والمحاولة (المرتبة الخامسة):
                  </span>
                  <div className="font-bold text-slate-800 text-sm">
                    {rankedTeams[4].name} — {rankedTeams[4].score} نقطة (دقة: {Math.round((rankedTeams[4].correctCount / Math.max(1, rankedTeams[4].totalAttempts)) * 100)}%)
                  </div>
                </div>
              )}
            </div>

            {/* Performance Stats Breakdown Table */}
            <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
              <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 text-right font-black text-slate-800 text-sm">
                جدول الإحصائيات التفصيلي لبطولة الفرق
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="p-3">الترتيب</th>
                      <th className="p-3">الفريق</th>
                      <th className="p-3">اللقب المكتسب</th>
                      <th className="p-3">مجموع النقاط</th>
                      <th className="p-3">الدقة</th>
                      <th className="p-3">أسرع إجابة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {rankedTeams.map((tm, idx) => {
                      const rankTitle =
                        idx === 0
                          ? "مركز بطل الأبطال 🏆"
                          : idx === 1
                          ? "مركز البطل 🥈"
                          : idx === 2
                          ? "المركز الأول 🥉"
                          : idx === 3
                          ? "وسام التميز والمثابرة 🎖️"
                          : "وسام الشرف والمحاولة 🌟";

                      const accuracy = Math.round((tm.correctCount / Math.max(1, tm.totalAttempts)) * 100);

                      return (
                        <tr key={tm.id} className={idx === 0 ? "bg-amber-50/60 font-bold" : ""}>
                          <td className="p-3 font-mono font-black text-base">{idx + 1}</td>
                          <td className="p-3 flex items-center gap-2">
                            <span>{tm.icon}</span>
                            <span>{tm.name}</span>
                          </td>
                          <td className="p-3 text-brand-700 font-bold">{rankTitle}</td>
                          <td className="p-3 font-mono font-black">{tm.score}</td>
                          <td className="p-3 font-mono text-emerald-600">{accuracy}%</td>
                          <td className="p-3 font-mono text-slate-500">
                            {tm.bestSpeedMs < 999999 ? `${(tm.bestSpeedMs / 1000).toFixed(2)}s` : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={startTournament}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-black text-sm shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة البطولة بنفس الفرق 🔄</span>
              </button>

              <button
                type="button"
                onClick={() => setStage("setup")}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Settings2 className="w-4 h-4" />
                <span>ضبط بطولة جديدة وفرق أخرى ⚙️</span>
              </button>

              <a
                href={getWhatsAppLink(
                  `مرحباً أستاذ قتادة كريم، تم اختتام بطولة الفرق في منصة العقل الخارق بنجاح!\n🏆 المتوج بلقب بطل الأبطال: ${rankedTeams[0]?.name} بمجموع ${rankedTeams[0]?.score} نقطة.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-sm border border-emerald-200 transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4 text-emerald-600" />
                <span>مشاركة النتيجة عبر واتساب</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
