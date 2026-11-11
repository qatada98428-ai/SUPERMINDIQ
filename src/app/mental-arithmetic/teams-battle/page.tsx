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
} from "lucide-react";
import {
  generateFlashAnzanSeries,
  playSoundEffect,
} from "@/lib/soroban-engine";
import { soundSynth } from "@/lib/audio-synthesizer";
import { getWhatsAppLink } from "@/lib/constants";

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
  const [rulesLevel, setRulesLevel] = useState<"simple" | "complex_5" | "complex_10" | "all">("complex_5");
  const [termsCount, setTermsCount] = useState<number>(4);
  const [showDelayMs, setShowDelayMs] = useState<number>(700); // 0.7s Arabic sweet-spot
  const [totalRounds, setTotalRounds] = useState<number>(5);
  const [voiceMode, setVoiceMode] = useState<"arabic" | "english" | "off">("arabic");

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

  // Speech Voice
  const speakNumber = useCallback(
    (num: number) => {
      if (voiceMode === "off" || typeof window === "undefined" || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const textToSpeak = voiceMode === "arabic" ? (num > 0 ? `${num}` : `ناقص ${Math.abs(num)}`) : `${num}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = voiceMode === "arabic" ? "ar-SA" : "en-US";
      utterance.rate = voiceMode === "arabic" ? 1.65 : 1.4;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    },
    [voiceMode]
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
      allowSubtraction: true,
      level: rulesLevel === "all" ? (Math.random() < 0.5 ? "complex_5" : "complex_10") : rulesLevel,
      numeralSystem: "western",
    });

    const sum = generated.reduce((a, b) => a + b, 0);
    setCurrentSeries(generated);
    setCorrectAnswer(sum);

    // Start 3.. 2.. 1 countdown
    setStage("countdown");
    setCountdownNum(3);
  };

  // Countdown timer effect
  useEffect(() => {
    if (stage !== "countdown") return;

    soundSynth.playFlashBeep(0.18);
    const timer = setInterval(() => {
      setCountdownNum((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Launch Flash Sequence
          setStage("flashing");
          return 0;
        }
        soundSynth.playFlashBeep(0.2);
        return prev - 1;
      });
    }, 800);

    return () => clearInterval(timer);
  }, [stage]);

  // Flash Animation Sequence Loop
  useEffect(() => {
    if (stage !== "flashing" || currentSeries.length === 0) return;

    let index = 0;
    setCurrentFlashIdx(0);
    setIsFlashVisible(true);
    speakNumber(currentSeries[0]);
    playSoundEffect("beep");

    const flashInterval = setInterval(() => {
      setIsFlashVisible(false);

      setTimeout(() => {
        index++;
        if (index < currentSeries.length) {
          setCurrentFlashIdx(index);
          setIsFlashVisible(true);
          speakNumber(currentSeries[index]);
          playSoundEffect("beep");
        } else {
          // Finished flashing series -> move to answering stage
          clearInterval(flashInterval);
          setIsFlashVisible(false);
          turnStartTimeRef.current = Date.now();
          setStage("answering");
        }
      }, 250); // Clear gap between numbers
    }, showDelayMs + 250);

    return () => clearInterval(flashInterval);
  }, [stage, currentSeries, showDelayMs, speakNumber]);

  // Submit Answer
  const handleAnswerSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userAnswer.trim() || stage !== "answering") return;

    const timeTaken = Math.max(200, Date.now() - turnStartTimeRef.current);
    setAnswerTimeMs(timeTaken);

    const parsed = parseInt(userAnswer, 10);
    const isCorrect = parsed === correctAnswer;
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
            <Trophy className="w-8 h-8 text-amber-500" />
            <span>حلبة تحدي الفرق | بطولة العقل الخارق</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            منافسة حية بنظام المسار السريع وتتويج رسمي: مركز بطل الأبطال 🏆، مركز البطل 🥈، والمركز الأول 🥉
          </p>
        </div>

        {stage !== "setup" && (
          <button
            onClick={() => setStage("setup")}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors self-end sm:self-auto"
          >
            <Settings2 className="w-4 h-4" />
            <span>إعدادات البطولة</span>
          </button>
        )}
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
                <label className="text-xs font-bold text-slate-300 block">قواعد السوروبان:</label>
                <select
                  value={rulesLevel}
                  onChange={(e) => setRulesLevel(e.target.value as "simple" | "complex_5" | "complex_10" | "all")}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs font-bold focus:outline-none focus:border-amber-400 text-right"
                >
                  <option value="simple">بسيط مباشر (بدون أصدقاء)</option>
                  <option value="complex_5">أصدقاء الـ 5 (المساعد الصغير ±)</option>
                  <option value="complex_10">أصدقاء الـ 10 (المساعد الكبير ±)</option>
                  <option value="all">شامل مكس (أصدقاء 5 و 10 معاً)</option>
                </select>
              </div>

              {/* Numbers Count per turn */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">عدد الأرقام في المسألة:</label>
                <div className="grid grid-cols-4 gap-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
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
                <div className="grid grid-cols-4 gap-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
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
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Live Race Track (لوحة سباق الفرق) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs sm:text-sm font-bold text-slate-700">
                  الجولة {currentRound} من {totalRounds}
                </span>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>مسار سباق الفرق نحو الكأس الذهبي</span>
              </div>
            </div>

            {/* Race Lanes */}
            <div className="space-y-4">
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
                        ? `${tm.borderClass} ${tm.bgLightClass} ring-4 ring-brand-500/10 shadow-md`
                        : "border-slate-200 bg-slate-50/70"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{tm.icon}</span>
                        <div>
                          <span className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
                            {tm.name}
                            {isLeader && (
                              <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                                <Crown className="w-3 h-3 fill-slate-950" />
                                المتصدر
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-slate-500">
                            صحيح: {tm.correctCount} / {tm.totalAttempts}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-black text-lg sm:text-2xl text-slate-900">
                          {tm.score}
                        </span>
                        <span className="text-[10px] text-slate-500 block">نقطة</span>
                      </div>
                    </div>

                    {/* Progress Bar Track */}
                    <div className="relative w-full h-3.5 bg-slate-200 rounded-full overflow-hidden">
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

          {/* Active Turn Stage Card */}
          <div
            className={`relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br ${activeTeam.gradientClass} text-white p-8 sm:p-14 shadow-2xl text-center space-y-8`}
          >
            {/* Active Team Header */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-black/25 backdrop-blur-md border border-white/20 text-white font-black text-sm sm:text-base shadow-lg">
              <span className="text-xl">{activeTeam.icon}</span>
              <span>دور: {activeTeam.name}</span>
              <span className="text-amber-300 font-mono">({activeTeam.score} نقطة)</span>
            </div>

            {/* Stage: Countdown */}
            {stage === "countdown" && (
              <div className="py-12 space-y-4 animate-in zoom-in-75 duration-300">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white/20 backdrop-blur-md border-4 border-white/60 mx-auto flex items-center justify-center">
                  <span className="text-6xl sm:text-7xl font-black font-mono text-white animate-pulse">
                    {countdownNum}
                  </span>
                </div>
                <p className="text-base sm:text-lg font-bold text-white/90">
                  استعدوا يا أبطال... الوميض سيبدأ فوراً!
                </p>
              </div>
            )}

            {/* Stage: Flashing Numbers */}
            {stage === "flashing" && (
              <div className="py-8 sm:py-14 space-y-6">
                <div className="min-h-[160px] sm:min-h-[220px] flex items-center justify-center">
                  {isFlashVisible && currentFlashIdx >= 0 && (
                    <div className="animate-in zoom-in-50 duration-150">
                      <span
                        dir="ltr"
                        className="text-7xl sm:text-9xl font-black font-mono tracking-wider drop-shadow-2xl text-white"
                      >
                        {currentSeries[currentFlashIdx] > 0
                          ? currentSeries[currentFlashIdx]
                          : `-${Math.abs(currentSeries[currentFlashIdx])}`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2">
                  {currentSeries.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 rounded-full transition-all duration-200 ${
                        idx === currentFlashIdx
                          ? "w-8 bg-amber-300"
                          : idx < currentFlashIdx
                          ? "w-3 bg-white/70"
                          : "w-3 bg-white/20"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Stage: Answering (إدخال الحل وحساب زمن السرعة) */}
            {stage === "answering" && (
              <div className="max-w-md mx-auto space-y-6 py-4 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <span className="text-xs sm:text-sm font-bold text-amber-300 flex items-center justify-center gap-1.5">
                    <Timer className="w-4 h-4 animate-spin" />
                    <span>انتهت الأرقام! أدخل الناتج الصحيح بأسرع ما يمكن:</span>
                  </span>
                  <p className="text-xs text-white/80">كلما أسرعت في الإجابة حصد فريقك نقاط سرعة إضافية!</p>
                </div>

                <form onSubmit={handleAnswerSubmit} className="space-y-4">
                  <input
                    type="number"
                    autoFocus
                    placeholder="الناتج..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full text-center text-4xl sm:text-5xl font-black font-mono py-4 px-6 rounded-2xl bg-white text-slate-900 border-4 border-amber-300 shadow-2xl focus:outline-none focus:ring-4 focus:ring-amber-400"
                  />

                  {/* Virtual Quick Keypad */}
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                      <button
                        key={digit}
                        type="button"
                        onClick={() => setUserAnswer((prev) => prev + digit)}
                        className="py-3 bg-white/20 hover:bg-white/30 active:scale-95 text-white font-mono font-black text-xl rounded-xl transition-all"
                      >
                        {digit}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setUserAnswer((prev) => prev.slice(0, -1))}
                      className="py-3 bg-rose-500/40 hover:bg-rose-500/60 active:scale-95 text-white font-bold text-sm rounded-xl transition-all"
                    >
                      مسح ⌫
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserAnswer((prev) => prev + "0")}
                      className="py-3 bg-white/20 hover:bg-white/30 active:scale-95 text-white font-mono font-black text-xl rounded-xl transition-all"
                    >
                      0
                    </button>
                    <button
                      type="submit"
                      className="py-3 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-base rounded-xl transition-all shadow-lg"
                    >
                      تأكيد ✔
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Stage: Feedback (نتيجة الحل والنقاط) */}
            {stage === "feedback" && (
              <div className="py-6 space-y-6 max-w-lg mx-auto animate-in zoom-in-95 duration-200">
                {isLastAnswerCorrect ? (
                  <div className="p-6 rounded-3xl bg-emerald-950/80 border-2 border-emerald-400 text-white space-y-3 shadow-2xl">
                    <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                    <h3 className="text-2xl font-black text-emerald-300">
                      إجابة صحيحة خارقة! ⚡
                    </h3>
                    <div className="flex items-center justify-center gap-4 text-sm font-bold">
                      <span className="px-3 py-1 rounded-full bg-emerald-800 text-white font-mono">
                        +{earnedPoints} نقطة
                      </span>
                      <span className="text-emerald-200 font-mono">
                        السرعة: {(answerTimeMs / 1000).toFixed(2)}s
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-3xl bg-rose-950/80 border-2 border-rose-400 text-white space-y-3 shadow-2xl">
                    <XCircle className="w-16 h-16 text-rose-400 mx-auto" />
                    <h3 className="text-2xl font-black text-rose-300">
                      إجابة غير صحيحة!
                    </h3>
                    <p className="text-sm text-slate-200">
                      الناتج الصحيح كان: <strong className="text-amber-300 font-mono text-xl">{correctAnswer}</strong>
                    </p>
                    <p className="text-xs text-rose-200">حظاً أوفر في الجولة القادمة يا أبطال!</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleProceedNext}
                  className="w-full py-4 px-8 rounded-2xl bg-white hover:bg-amber-50 active:scale-95 text-slate-950 font-black text-base shadow-2xl transition-all flex items-center justify-center gap-2"
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
              <Trophy className="w-4 h-4 text-amber-400" />
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
