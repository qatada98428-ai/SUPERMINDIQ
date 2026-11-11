"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Zap,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Layers,
  CheckCircle2,
  XCircle,
  Settings2,
  Flame,
} from "lucide-react";
import {
  generateFlashAnzanSeries,
  playSoundEffect,
  ArithmeticLevel,
  FlashAnzanConfig,
} from "@/lib/soroban-engine";
import { toArabicNumerals } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const MOTIVATIONAL_SUCCESS_PHRASES = [
  "🌟 بطل خارق! تركيز مذهل وسرعة بديهة خيالية!",
  "🚀 رائع يا عبقري! إجابة دقيقة 100%!",
  "🎯 ما شاء الله! كسر للأرقام القياسية اليوم!",
  "👏 عاشت إيدك يا نجم السوروبان المتألق!",
  "🔥 عقل خارق حقيقي! مستواك يتطور بسرعة فائقة!",
  "✨ أداء أسطوري! تركيزك اليوم بمستوى أبطال العالم!",
  "🏆 استجابة سريعة وحساب ذهني لا غبار عليه!",
  "🎉 إبداع حقيقي! استمر بهذا الإصرار والعزيمة!",
];

const ENCOURAGING_MISTAKE_PHRASES = [
  "💡 قريب جداً من الحل! لا بأس، كرر المحاولة وستصل بالتأكيد.",
  "🌱 كل محاولة تقوي عضلات دماغك، ركّز في وميض السلسلة القادمة.",
  "💪 الأبطال يتعلمون من كل تمرين! أنت قادر على ضبطها في المرة القادمة.",
  "✨ خطوة واحدة تفصلك عن النتيجة، خذ نفساً عميقاً واستعد للمحاولة.",
  "🎯 لا تقلق يا بطل، الحساب الذهني يحتاج تكراراً وستكسر الرقم الآن!",
  "🧠 الخطأ فرصة ذكية للدماغ ليركز أكثر في المرة القادمة!",
];

export default function FlashAnzanPage() {
  const { recordProgressAnswer } = useAuth();

  // Configuration State
  const [level, setLevel] = useState<ArithmeticLevel>("general");
  const [targetRules, setTargetRules] = useState<number[]>([]);
  const [digits, setDigits] = useState(1);
  const [terms, setTerms] = useState(5); // Up to 50 operations
  const [showDelayMs, setShowDelayMs] = useState(800);
  const [clearDelayMs, setClearDelayMs] = useState(300);
  const [allowSubtraction, setAllowSubtraction] = useState(true);
  const [numeralSystem, setNumeralSystem] = useState<"western" | "arabic">("western");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceMode, setVoiceMode] = useState<"arabic" | "english" | "off">("arabic");

  // Training Session State
  // "idle" | "countdown" | "showing" | "blank" | "answer" | "result"
  const [sessionState, setSessionState] = useState<
    "idle" | "countdown" | "showing" | "blank" | "answer" | "result"
  >("idle");

  const [countdown, setCountdown] = useState(3);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [numbersList, setNumbersList] = useState<number[]>([]);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);
  const [feedbackPhrase, setFeedbackPhrase] = useState("");

  // Flash Cards Mode State
  const [tabMode, setTabMode] = useState<"flash" | "cards">("flash");
  const [cardTargetNumber, setCardTargetNumber] = useState<number>(7);
  const [cardUserGuess, setCardUserGuess] = useState<number | null>(null);
  const [cardResult, setCardResult] = useState<boolean | null>(null);

  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  const toggleTargetRule = (r: number) => {
    setTargetRules((prev) =>
      prev.includes(r) ? prev.filter((item) => item !== r) : [...prev, r]
    );
  };

  const playAudio = (type: "beep" | "correct" | "wrong") => {
    if (soundEnabled) {
      playSoundEffect(type);
    }
  };

  const speakFlashNumber = (num: number) => {
    if (voiceMode === "off" || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      
      const arabicDigits: Record<number, string> = {
        1: "واحد", 2: "اثنان", 3: "ثلاثة", 4: "أربعة", 5: "خمسة",
        6: "ستة", 7: "سبعة", 8: "ثمانية", 9: "تسعة", 10: "عشرة"
      };
      const englishDigits: Record<number, string> = {
        1: "One", 2: "Two", 3: "Three", 4: "Four", 5: "Five",
        6: "Six", 7: "Seven", 8: "Eight", 9: "Nine", 10: "Ten"
      };

      const isNeg = num < 0;
      const abs = Math.abs(num);
      let text = "";

      if (voiceMode === "arabic") {
        const word = arabicDigits[abs] || abs.toString();
        text = isNeg ? `ناقص ${word}` : word;
      } else {
        const word = englishDigits[abs] || abs.toString();
        text = isNeg ? `Minus ${word}` : word;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voiceMode === "arabic" ? "ar-SA" : "en-US";
      utterance.rate = 1.65; // Rapid, crisp speed for Flash Anzan
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Fallback if blocked
    }
  };

  const speakCountdownNumber = (count: number) => {
    if (voiceMode === "off" || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const arMap: Record<number, string> = { 3: "ثلاثة", 2: "اثنان", 1: "واحد", 0: "ابدأ" };
      const enMap: Record<number, string> = { 3: "Three", 2: "Two", 1: "One", 0: "Go" };
      const text = voiceMode === "arabic" ? (arMap[count] || "") : (enMap[count] || "");
      if (!text) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voiceMode === "arabic" ? "ar-SA" : "en-US";
      utterance.rate = 1.4;
      utterance.pitch = 1.15;
      window.speechSynthesis.speak(utterance);
    } catch {}
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#4F46E5", "#F59E0B", "#10B981", "#EC4899", "#38BDF8"],
      });
    } catch {
      // Ignore if confetti not loaded
    }
  };

  const startTraining = () => {
    clearAllTimers();

    const config: FlashAnzanConfig = {
      termsCount: Math.max(3, Math.min(50, terms)),
      digitsCount: Math.max(1, Math.min(5, digits)),
      showDelayMs,
      clearDelayMs,
      allowSubtraction,
      allowNegativeTotal: false,
      level,
      targetRules: targetRules.length > 0 ? targetRules : undefined,
      numeralSystem,
    };

    const series = generateFlashAnzanSeries(config);
    setNumbersList(series);
    setCurrentIndex(0);
    setCurrentNumber(null);
    setUserAnswer("");
    setIsCorrect(null);
    setFeedbackPhrase("");
    setSessionState("countdown");
    setCountdown(3);

    // Countdown 3 -> 2 -> 1 -> start with soft audio and voice
    playAudio("beep");
    speakCountdownNumber(3);
    let c = 3;
    const countInterval = setInterval(() => {
      c--;
      if (c > 0) {
        setCountdown(c);
        playAudio("beep");
        speakCountdownNumber(c);
      } else {
        clearInterval(countInterval);
        speakCountdownNumber(0);
        runSequence(series);
      }
    }, 1000);
    timersRef.current.push(countInterval as unknown as NodeJS.Timeout);
  };

  const runSequence = (series: number[]) => {
    let idx = 0;

    const showNext = () => {
      if (idx >= series.length) {
        setSessionState("answer");
        setCurrentNumber(null);
        return;
      }

      // Show number & speak
      const numToFlash = series[idx];
      setCurrentNumber(numToFlash);
      setCurrentIndex(idx + 1);
      setSessionState("showing");
      playAudio("beep");
      speakFlashNumber(numToFlash);

      // After showDelayMs, enter clear interval
      const blankTimer = setTimeout(() => {
        setSessionState("blank");
        setCurrentNumber(null);

        // After clearDelayMs, show next or finish
        const nextTimer = setTimeout(() => {
          idx++;
          showNext();
        }, clearDelayMs);
        timersRef.current.push(nextTimer);
      }, showDelayMs);

      timersRef.current.push(blankTimer);
    };

    showNext();
  };

  const handleAnswerSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userAnswer.trim()) return;

    const total = numbersList.reduce((acc, n) => acc + n, 0);
    const correct = parseInt(userAnswer.trim(), 10) === total;

    setIsCorrect(correct);
    setSessionState("result");

    // Unified progress recording (Guest local storage + Supabase sync)
    const uniqueAnswerId = `fa-${Date.now()}-${numbersList.length}-${numbersList[0] || 0}`;
    recordProgressAnswer({
      answerId: uniqueAnswerId,
      exerciseType: `فلاش أنزان (${digits} خانة - ${terms} أرقام)`,
      level: `المستوى ${digits} خانة`,
      isCorrect: correct,
      score: correct ? 10 * digits * terms : 0,
      durationSeconds: Math.max(1, Math.round(((showDelayMs + clearDelayMs) * terms) / 1000)),
    });

    if (correct) {
      playAudio("correct");
      triggerConfetti();
      setStreak((s) => s + 1);
      const phrase =
        MOTIVATIONAL_SUCCESS_PHRASES[
          Math.floor(Math.random() * MOTIVATIONAL_SUCCESS_PHRASES.length)
        ];
      setFeedbackPhrase(phrase);
    } else {
      playAudio("wrong");
      setStreak(0);
      const phrase =
        ENCOURAGING_MISTAKE_PHRASES[
          Math.floor(Math.random() * ENCOURAGING_MISTAKE_PHRASES.length)
        ];
      setFeedbackPhrase(phrase);
    }
  };

  const expectedTotal = numbersList.reduce((acc, n) => acc + n, 0);

  // Flash Card challenge
  const generateNewCard = () => {
    const randomVal = Math.floor(Math.random() * 99) + 1;
    setCardTargetNumber(randomVal);
    setCardUserGuess(null);
    setCardResult(null);
  };

  const checkCardGuess = (val: number) => {
    setCardUserGuess(val);
    const correct = val === cardTargetNumber;
    setCardResult(correct);
    if (correct) {
      playAudio("correct");
      triggerConfetti();
    } else {
      playAudio("wrong");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/" className="hover:text-brand-600">الرئيسية</Link>
            <span>/</span>
            <Link href="/mental-arithmetic" className="hover:text-brand-600">الحساب الذهني</Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">مدرب الفلاش أنزان التفاعلي</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <Zap className="w-8 h-8 text-brand-600 fill-brand-600" />
            <span>مدرب الفلاش أنزان التفاعلي (Flash Anzan Trainer)</span>
          </h1>
        </div>

        {/* Tab switcher: Flash Simulator vs Flash Cards */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setTabMode("flash")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              tabMode === "flash"
                ? "bg-white text-brand-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>تدريب وميض الأرقام</span>
          </button>

          <button
            onClick={() => {
              setTabMode("cards");
              if (!cardTargetNumber) generateNewCard();
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              tabMode === "cards"
                ? "bg-white text-brand-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>بطاقات الفلاش (Flash Cards)</span>
          </button>
        </div>
      </div>

      {tabMode === "flash" ? (
        <>
          {/* Main Flash Screen */}
          <div className="bg-slate-950 rounded-3xl p-6 sm:p-14 text-white text-center shadow-2xl relative overflow-hidden min-h-[440px] flex flex-col items-center justify-center border-4 border-slate-800">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Toolbar */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-xs text-slate-400 z-20">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 ${
                    soundEnabled
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                      : "bg-slate-800 border-slate-700 text-slate-500"
                  }`}
                  title={soundEnabled ? "كتم الصوت" : "تشغيل الصوت"}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span className="hidden sm:inline">{soundEnabled ? "صوت ناعم ومريح" : "صامت"}</span>
                </button>

                {streak > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold animate-in fade-in">
                    <Flame className="w-4 h-4 fill-amber-400 animate-bounce" />
                    <span>{streak} إجابات صحيحة متتالية!</span>
                  </div>
                )}
              </div>

              {sessionState === "showing" || sessionState === "blank" ? (
                <div className="bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-800 font-mono text-emerald-400 font-bold text-sm">
                  {currentIndex} / {terms} عملية
                </div>
              ) : (
                <div className="text-slate-400 text-xs font-semibold bg-slate-900/60 px-3 py-1 rounded-lg border border-slate-800">
                  السلسلة: {terms} أرقام • {digits} {digits === 1 ? "خانة" : "خانات"}
                </div>
              )}
            </div>

            {/* State: IDLE */}
            {sessionState === "idle" && (
              <div className="space-y-5 max-w-lg z-10 animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-700 text-white flex items-center justify-center mx-auto shadow-lg shadow-brand-500/25">
                  <Zap className="w-8 h-8 fill-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black">
                  جاهز لبدء تمرين وميض الأرقام؟
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  سلسلة من <span className="text-amber-400 font-bold">{terms} عملية</span> بسرعة{" "}
                  <span className="text-amber-400 font-bold">{showDelayMs / 1000}s</span> وفراغ{" "}
                  <span className="text-amber-400 font-bold">{clearDelayMs / 1000}s</span> بين الأرقام.
                </p>
                <button
                  onClick={startTraining}
                  className="px-10 py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-black text-base shadow-xl shadow-brand-500/30 transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>ابدأ التمرين الآن (عد تنازلي 3 ثوانٍ)</span>
                </button>
              </div>
            )}

            {/* State: COUNTDOWN */}
            {sessionState === "countdown" && (
              <div className="space-y-4 z-10 animate-in zoom-in-75 duration-200">
                <div
                  className="text-9xl sm:text-[11rem] font-black text-amber-400 drop-shadow-[0_12px_28px_rgba(245,158,11,0.5)] select-none"
                  style={{ fontFamily: "'Fredoka', 'Baloo Bhaijaan 2', 'Alexandria', sans-serif" }}
                >
                  {countdown}
                </div>
                <p className="text-slate-300 text-sm sm:text-base font-bold tracking-wider">
                  استعد... ركّز في وميض الأرقام!
                </p>
              </div>
            )}

            {/* State: SHOWING NUMBER (Child-friendly wide rounded font & badge) */}
            {sessionState === "showing" && currentNumber !== null && (
              <div className="z-10 animate-in zoom-in-95 fade-in duration-75 flex flex-col items-center justify-center">
                <div
                  className={`text-9xl sm:text-[11rem] md:text-[13rem] font-black tracking-widest select-none leading-none px-8 py-4 rounded-[3.5rem] bg-slate-900/80 border-4 border-amber-400/40 shadow-2xl backdrop-blur-sm transition-all ${
                    currentNumber < 0
                      ? "text-rose-400 drop-shadow-[0_14px_35px_rgba(244,63,94,0.45)]"
                      : "text-emerald-400 drop-shadow-[0_14px_35px_rgba(16,185,129,0.45)]"
                  }`}
                  style={{ fontFamily: "'Fredoka', 'Baloo Bhaijaan 2', 'Alexandria', sans-serif" }}
                >
                  {numeralSystem === "arabic"
                    ? (currentNumber < 0 ? "−" : "+") + toArabicNumerals(Math.abs(currentNumber))
                    : currentNumber > 0
                    ? `+${currentNumber}`
                    : `−${Math.abs(currentNumber)}`}
                </div>

                {voiceMode !== "off" && (
                  <span className="mt-3 px-4 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-amber-300 font-bold text-xs sm:text-sm animate-pulse flex items-center gap-1.5 shadow-sm">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>
                      {voiceMode === "arabic"
                        ? (currentNumber > 0 ? `زائد ${Math.abs(currentNumber)}` : `ناقص ${Math.abs(currentNumber)}`)
                        : (currentNumber > 0 ? `Plus ${Math.abs(currentNumber)}` : `Minus ${Math.abs(currentNumber)}`)}
                    </span>
                  </span>
                )}
              </div>
            )}

            {/* State: BLANK (Clear Delay) */}
            {sessionState === "blank" && (
              <div className="z-10 flex items-center justify-center h-32">
                <div className="w-3 h-3 rounded-full bg-slate-700/60 animate-ping" />
              </div>
            )}

            {/* State: ANSWER INPUT */}
            {sessionState === "answer" && (
              <form
                onSubmit={handleAnswerSubmit}
                className="space-y-5 max-w-sm w-full z-10 animate-in zoom-in-95 duration-200"
              >
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black">ما هو الناتج النهائي؟</h3>
                  <p className="text-xs text-slate-400">اكتب مجموع السلسلة واضغط تأكيد</p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="number"
                    autoFocus
                    placeholder="الناتج..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-900 border-2 border-brand-500 text-white text-center font-mono font-black text-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/20"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shrink-0 transition-transform active:scale-95 shadow-md"
                  >
                    تأكيد
                  </button>
                </div>
              </form>
            )}

            {/* State: RESULT SCREEN with Motivational Feedback */}
            {sessionState === "result" && (
              <div className="space-y-5 max-w-lg z-10 animate-in zoom-in-95 duration-200">
                <div
                  className={`text-2xl sm:text-3xl font-black flex items-center justify-center gap-2 ${
                    isCorrect ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      <span>{feedbackPhrase}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-8 h-8 text-rose-400" />
                      <span>{feedbackPhrase}</span>
                    </>
                  )}
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-sm space-y-3">
                  <div className="flex justify-between items-center text-slate-400 pb-2 border-b border-slate-800">
                    <span>إجابتك:</span>
                    <span className="font-mono font-bold text-lg text-white">
                      {userAnswer || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-emerald-400">
                    <span>الناتج الصحيح:</span>
                    <span className="font-mono font-black text-2xl text-emerald-300">
                      {expectedTotal} ({toArabicNumerals(expectedTotal)})
                    </span>
                  </div>

                  <div className="pt-2 text-right">
                    <span className="text-[11px] text-slate-500 block mb-1">
                      سلسلة الأرقام المحسوبة ({numbersList.length} أرقام):
                    </span>
                    <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-xs text-amber-300 flex flex-wrap gap-1.5 justify-center max-h-32 overflow-y-auto">
                      {numbersList.map((n, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800">
                          {n > 0 ? `+${n}` : n}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={startTraining}
                    className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm inline-flex items-center gap-2 shadow-md transition-transform active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>تمرين جديد بنفس الإعدادات</span>
                  </button>

                  <button
                    onClick={() => setSessionState("idle")}
                    className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm"
                  >
                    تغيير الإعدادات
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Configuration Panel with Flexible Terms up to 50 & Digits up to 5 */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-brand-600" />
                <h3 className="font-bold text-lg text-slate-900">
                  لوحة التحكم وإعدادات السرعة والعمليات (مرونة كاملة حتى 50 رقماً)
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                مستوحى من محرك السوروبان والتطبيقات المتقدمة
              </span>
            </div>

            {/* Level Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                مستوى صعوبة العمليات (Level):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: "general", label: "تدريب عام", desc: "أرقام عشوائية عامة" },
                  { id: "simple", label: "المستوى البسيط", desc: "حركة خرزات مباشرة فقط" },
                  { id: "complex_5", label: "أصدقاء الـ 5", desc: "المساعد الصغير (±1..±4)" },
                  { id: "complex_10", label: "أصدقاء الـ 10", desc: "المساعد الكبير والترحيل" },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => {
                      setLevel(lvl.id as ArithmeticLevel);
                      setTargetRules([]);
                    }}
                    className={`p-3 rounded-2xl border text-right transition-all ${
                      level === lvl.id
                        ? "bg-brand-50 border-brand-500 text-brand-900 shadow-xs ring-1 ring-brand-500"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm">{lvl.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{lvl.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Specific Target Rule Drill — Multi-Select Enabled */}
            {level === "complex_5" && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-900 block">
                    🎯 تخصيص القواعد (يمكنك اختيار أكثر من قاعدة معاً):
                  </label>
                  {targetRules.length > 0 && (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                      محدد: {targetRules.length} قواعد
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setTargetRules([])}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      targetRules.length === 0
                        ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                        : "bg-white text-slate-700 border-amber-200 hover:bg-amber-100/50"
                    }`}
                  >
                    كل أصدقاء 5 (شامل)
                  </button>
                  {[4, 3, 2, 1].map((r) => {
                    const isSelected = targetRules.includes(r);
                    return (
                      <button
                        key={r}
                        onClick={() => toggleTargetRule(r)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-amber-600 text-white border-amber-600 shadow-xs ring-2 ring-amber-400/40"
                            : "bg-white text-slate-700 border-amber-200 hover:bg-amber-100/50"
                        }`}
                      >
                        <span>قاعدة (±{r})</span>
                        {isSelected && <span className="text-[10px] bg-white/25 rounded-full px-1">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {level === "complex_10" && (
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-indigo-900 block">
                    🎯 تخصيص القواعد (يمكنك اختيار أكثر من قاعدة معاً):
                  </label>
                  {targetRules.length > 0 && (
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                      محدد: {targetRules.length} قواعد
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setTargetRules([])}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      targetRules.length === 0
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white text-slate-700 border-indigo-200 hover:bg-indigo-100/50"
                    }`}
                  >
                    كل أصدقاء 10 (شامل)
                  </button>
                  {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((r) => {
                    const isSelected = targetRules.includes(r);
                    return (
                      <button
                        key={r}
                        onClick={() => toggleTargetRule(r)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-400/40"
                            : "bg-white text-slate-700 border-indigo-200 hover:bg-indigo-100/50"
                        }`}
                      >
                        <span>قاعدة (±{r})</span>
                        {isSelected && <span className="text-[10px] bg-white/25 rounded-full px-1">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Terms Count (Flexible up to 50 operations!) */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  عدد العمليات / الأرقام بالسلسلة (من 3 إلى 50 عملية):
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-lg text-brand-700 px-3 py-0.5 rounded-lg bg-white border border-slate-200">
                    {terms} عملية
                  </span>
                </div>
              </div>

              {/* Slider 3 to 50 */}
              <input
                type="range"
                min="3"
                max="50"
                step="1"
                value={terms}
                onChange={(e) => setTerms(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[11px] text-slate-500 font-medium self-center">
                  خيارات سريعة:
                </span>
                {[3, 5, 10, 15, 20, 30, 40, 50].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTerms(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-colors ${
                      terms === t
                        ? "bg-brand-600 text-white border-brand-600"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Digits Count (1 to 5 digits) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                عدد الخانات (Digits):
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDigits(d)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      digits === d
                        ? "bg-brand-600 text-white border-brand-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {d} {d === 1 ? "خانة" : "خانات"}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders for Show Delay & Clear Delay */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* Show Delay */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>وقت وميض الرقم (Show Time):</span>
                  <span className="font-mono text-brand-600 font-bold">{showDelayMs / 1000}s</span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="2500"
                  step="50"
                  value={showDelayMs}
                  onChange={(e) => setShowDelayMs(Number(e.target.value))}
                  className="w-full accent-brand-600"
                />
              </div>

              {/* Clear Delay */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>زمن الفراغ بين الأرقام (Clear Delay):</span>
                  <span className="font-mono text-brand-600 font-bold">{clearDelayMs / 1000}s</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={clearDelayMs}
                  onChange={(e) => setClearDelayMs(Number(e.target.value))}
                  className="w-full accent-brand-600"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allowSubtraction}
                  onChange={(e) => setAllowSubtraction(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                />
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  تضمين عمليات الطرح بالسلسلة (−)
                </span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">نظام كتابة الأرقام:</span>
                <button
                  onClick={() => setNumeralSystem("western")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                    numeralSystem === "western"
                      ? "bg-brand-600 text-white border-brand-600"
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  123
                </button>
                <button
                  onClick={() => setNumeralSystem("arabic")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                    numeralSystem === "arabic"
                      ? "bg-brand-600 text-white border-brand-600"
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  ١٢٣
                </button>
              </div>
            </div>

            {/* Voice Pronunciation Toggle for Kids */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-brand-600" />
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  نطق الأرقام صوتياً للأطفال (Voice):
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setVoiceMode("arabic");
                    setShowDelayMs(700);
                    setClearDelayMs(250);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    voiceMode === "arabic"
                      ? "bg-white text-emerald-700 shadow-sm font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🗣️ نطق بالعربي
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceMode("english")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    voiceMode === "english"
                      ? "bg-white text-brand-700 shadow-sm font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🗣️ In English
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceMode("off")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    voiceMode === "off"
                      ? "bg-white text-rose-700 shadow-sm font-black"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  🔇 بدون نطق
                </button>
              </div>

              {voiceMode === "arabic" && (
                <div className="w-full mt-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2 text-right animate-in fade-in">
                  <span className="text-base leading-none">💡</span>
                  <p className="leading-relaxed">
                    <strong>ملاحظة للمدرب (النطق العربي):</strong> تم ضبط سرعة الوميض تلقائياً على <strong>0.7 ثانية</strong> كأسرع وتيرة ممكنة متوافقة مع مخارج الحروف العربية للأطفال دون تقطيع، ويمكنك دائماً تعديل السرعة للأبطأ أو الأسرع عبر أشرطة التحكم أدناه.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Flash Cards Mode (بطاقات الفلاش) with proper orientation: Right rod is Units! */
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              تنمية الذاكرة الصورية والإدراك البصري
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              تحدي بطاقات الفلاش (Flash Cards)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              انظر إلى تمثيل الخرزات على العداد أدناه واكتشف الرقم الصحيح بأسرع ما يمكن:
            </p>
          </div>

          {/* Soroban Card: dir="ltr" so Tens on left, Units on right */}
          <div
            dir="ltr"
            className="max-w-xs mx-auto bg-[#23150D] p-6 rounded-3xl border-4 border-[#3D2317] shadow-xl text-center"
          >
            <div dir="rtl" className="text-xs text-amber-300/80 mb-2 font-mono font-arabic">
              العشرات (يسار) • الآحاد (يمين)
            </div>
            <div className="flex justify-center gap-8 py-4">
              {/* Tens rod */}
              <div className="flex flex-col items-center">
                <div className="h-10 w-8 flex justify-center items-center relative">
                  <div className="w-1 h-full bg-slate-400/40 absolute" />
                  <div
                    className={`w-7 h-5 rounded-full z-10 transition-transform ${
                      Math.floor(cardTargetNumber / 10) >= 5
                        ? "translate-y-2 bg-amber-400"
                        : "-translate-y-2 bg-slate-400 opacity-60"
                    }`}
                  />
                </div>
                <div className="w-12 h-2 bg-amber-700 my-1 rounded" />
                <div className="h-28 w-8 flex flex-col items-center gap-1.5 pt-1 relative">
                  <div className="w-1 h-full bg-slate-400/40 absolute" />
                  {[1, 2, 3, 4].map((b) => (
                    <div
                      key={b}
                      className={`w-7 h-5 rounded-full z-10 transition-transform ${
                        Math.floor(cardTargetNumber / 10) % 5 >= b
                          ? "-translate-y-1 bg-sky-400"
                          : "translate-y-3 bg-slate-400 opacity-60"
                      }`}
                    />
                  ))}
                </div>
                <div dir="rtl" className="text-[10px] text-amber-200/80 font-bold mt-2">عشرات</div>
              </div>

              {/* Units rod */}
              <div className="flex flex-col items-center">
                <div className="h-10 w-8 flex justify-center items-center relative">
                  <div className="w-1 h-full bg-slate-400/40 absolute" />
                  <div
                    className={`w-7 h-5 rounded-full z-10 transition-transform ${
                      cardTargetNumber % 10 >= 5
                        ? "translate-y-2 bg-amber-400"
                        : "-translate-y-2 bg-slate-400 opacity-60"
                    }`}
                  />
                </div>
                <div className="w-12 h-2 bg-amber-700 my-1 rounded" />
                <div className="h-28 w-8 flex flex-col items-center gap-1.5 pt-1 relative">
                  <div className="w-1 h-full bg-slate-400/40 absolute" />
                  {[1, 2, 3, 4].map((b) => (
                    <div
                      key={b}
                      className={`w-7 h-5 rounded-full z-10 transition-transform ${
                        cardTargetNumber % 5 >= b
                          ? "-translate-y-1 bg-sky-400"
                          : "translate-y-3 bg-slate-400 opacity-60"
                      }`}
                    />
                  ))}
                </div>
                <div dir="rtl" className="text-[10px] text-emerald-400 font-black mt-2">الآحاد</div>
              </div>
            </div>
          </div>

          {/* Guess choices */}
          <div className="max-w-md mx-auto space-y-4">
            <div className="grid grid-cols-4 gap-3">
              {[
                cardTargetNumber,
                (cardTargetNumber + 5) % 100,
                (cardTargetNumber + 12) % 100,
                Math.max(1, (cardTargetNumber - 10) % 100),
              ]
                .sort(() => Math.random() - 0.5)
                .map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => checkCardGuess(choice)}
                    className={`py-3.5 rounded-2xl font-mono font-black text-xl border transition-all ${
                      cardUserGuess === null
                        ? "bg-slate-50 border-slate-200 hover:bg-brand-50 hover:border-brand-500 text-slate-800"
                        : choice === cardTargetNumber
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-md"
                        : cardUserGuess === choice
                        ? "bg-rose-500 text-white border-rose-500"
                        : "bg-slate-50 text-slate-400 border-slate-200 opacity-50"
                    }`}
                  >
                    {choice}
                  </button>
                ))}
            </div>

            {cardResult !== null && (
              <div className="text-center pt-2 space-y-3 animate-in zoom-in-95 duration-200">
                <div
                  className={`font-black text-lg ${
                    cardResult ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {cardResult ? "ممتاز! قراءة صحيحة للعداد 🎯" : "حاول مجدداً، القراءة غير دقيقة"}
                </div>
                <button
                  onClick={generateNewCard}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md"
                >
                  بطاقة فلاش تالية
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
