"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  RotateCcw,
  Plus,
  Minus,
  Volume2,
  VolumeX,
  Shuffle,
  HelpCircle,
} from "lucide-react";
import {
  SorobanRodState,
  sorobanToNumber,
  numberToSoroban,
  playSoundEffect,
} from "@/lib/soroban-engine";
import { soundSynth } from "@/lib/audio-synthesizer";
import { toArabicNumerals } from "@/lib/utils";
import { triggerClayCelebration } from "@/lib/celebrations";
import InteractiveSorobanBoard from "@/components/soroban/InteractiveSorobanBoard";
import ClayIcon from "@/components/design-system/ClayIcon";

export default function AbacusPage() {
  const [numRods, setNumRods] = useState(3);
  const [rods, setRods] = useState<SorobanRodState[]>(
    Array.from({ length: 3 }, () => ({ upper: false, lowers: 0 }))
  );
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Practice target mode (e.g. "مثل الرقم 4825 على العداد")
  const [challengeTarget, setChallengeTarget] = useState<number | null>(null);
  const [challengeSuccess, setChallengeSuccess] = useState(false);
  const [directInputVal, setDirectInputVal] = useState("");

  const playClick = useCallback((freq = 520) => {
    if (soundEnabled) {
      soundSynth.playBeadClick(freq, 0.22);
    }
  }, [soundEnabled]);

  const handleRodsCountChange = (count: number) => {
    const clamped = Math.max(3, Math.min(17, count));
    setNumRods(clamped);
    const currentVal = sorobanToNumber(rods);
    setRods(numberToSoroban(currentVal, clamped));
    playClick(600);
  };

  const setRodUpper = (rodIdx: number, upper: boolean) => {
    playClick(580);
    setRods((prev) =>
      prev.map((r, i) => (i === rodIdx ? { ...r, upper } : r))
    );
  };

  const setRodLowers = (rodIdx: number, lowers: number) => {
    const clamped = Math.max(0, Math.min(4, lowers));
    playClick(480 + clamped * 30);
    setRods((prev) =>
      prev.map((r, i) => (i === rodIdx ? { ...r, lowers: clamped } : r))
    );
  };

  const resetAll = useCallback(() => {
    playClick(440);
    setRods(Array.from({ length: numRods }, () => ({ upper: false, lowers: 0 })));
    setChallengeSuccess(false);
  }, [numRods, playClick]);

  const currentTotal = sorobanToNumber(rods);

  // Check challenge target
  useEffect(() => {
    if (challengeTarget !== null && currentTotal === challengeTarget) {
      setChallengeSuccess(true);
      triggerClayCelebration("small");
      if (soundEnabled) playSoundEffect("correct");
    } else {
      setChallengeSuccess(false);
    }
  }, [currentTotal, challengeTarget, soundEnabled]);

  const startNewChallenge = () => {
    const maxVal = Math.pow(10, Math.min(numRods, 4)) - 1;
    const rnd = Math.floor(Math.random() * maxVal) + 1;
    setChallengeTarget(rnd);
    setChallengeSuccess(false);
  };

  const handleDirectNumberApply = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(directInputVal.trim(), 10);
    if (!isNaN(val) && val >= 0) {
      setRods(numberToSoroban(val, numRods));
      playClick(540);
      setDirectInputVal("");
    }
  };

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "c" || e.key === "C" || e.key === "Escape") {
        resetAll();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [resetAll]);

  const getPlaceName = (power: number) => {
    switch (power) {
      case 0:
        return "الآحاد";
      case 1:
        return "العشرات";
      case 2:
        return "المئات";
      case 3:
        return "الآلاف";
      case 4:
        return "عشرات الآلاف";
      case 5:
        return "مئات الآلاف";
      case 6:
        return "الملايين";
      case 7:
        return "عشرات الملايين";
      default:
        return `10^${power}`;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb & Clay Header */}
      <div className="clay-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <ClayIcon name="soroban" tone="lavender" size="lg" />
          <div>
            <div className="flex items-center gap-2 text-xs text-[#6E6A94] dark:text-[#B3AED6] mb-1">
              <Link href="/" className="hover:text-brand-600 font-semibold">الرئيسية</Link>
              <span>/</span>
              <Link href="/mental-arithmetic" className="hover:text-brand-600 font-semibold">الحساب الذهني</Link>
              <span>/</span>
              <span className="text-[#1E1B3A] dark:text-white font-extrabold">العداد التفاعلي (السوروبان)</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-[#1E1B3A] dark:text-white">
              العداد الياباني الكامل (السوروبان)
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`clay-pill px-4 py-2.5 flex items-center gap-1.5 text-xs font-extrabold ${
              soundEnabled
                ? "text-emerald-700 dark:text-emerald-300 bg-[#E6FBF7] dark:bg-[#153B38]"
                : "text-slate-500"
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? "صوت الخرزات (ناعم)" : "صامت"}</span>
          </button>

          <button
            onClick={resetAll}
            className="clay-btn-amber flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-black"
          >
            <RotateCcw className="w-4 h-4" />
            <span>تصفير العداد (C)</span>
          </button>
        </div>
      </div>

      {/* Control Ribbon */}
      <div className="clay-card p-5 sm:p-6 flex flex-wrap items-center justify-between gap-5">
        {/* Rods Selector (Starts at official 3 columns with quick presets & +/- expansion up to 17) */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <span className="text-xs sm:text-sm font-extrabold text-[#1E1B3A] dark:text-white">عدد الأعمدة:</span>
          <div className="flex items-center gap-2 bg-[#F3F2FC] dark:bg-[#242146] p-1.5 rounded-2xl border border-[#E3DFF8] dark:border-[#363268]">
            <button
              onClick={() => handleRodsCountChange(numRods - 1)}
              disabled={numRods <= 3}
              className="clay-pill p-1.5 disabled:opacity-30"
              aria-label="تقليل"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-mono font-black text-base px-2.5">{numRods}</span>
            <button
              onClick={() => handleRodsCountChange(numRods + 1)}
              disabled={numRods >= 17}
              className="clay-pill p-1.5 disabled:opacity-30"
              aria-label="زيادة"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            {[3, 5, 7, 9, 13].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleRodsCountChange(preset)}
                className={`px-2.5 py-1 rounded-xl text-xs font-black font-mono transition-all ${
                  numRods === preset
                    ? "clay-btn-purple !rounded-xl"
                    : "clay-pill text-[#5E5985] dark:text-[#D5D0F2] hover:text-brand-600"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Direct number representation tool */}
        <form onSubmit={handleDirectNumberApply} className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="مثّل رقماً معيناً..."
            value={directInputVal}
            onChange={(e) => setDirectInputVal(e.target.value)}
            className="clay-input w-36 px-3 py-2 text-xs font-mono"
          />
          <button
            type="submit"
            className="clay-btn-secondary px-4 py-2 text-xs font-extrabold"
          >
            تمثيل
          </button>
        </form>

        {/* Live Total Readout */}
        <div className="clay-banner-lavender text-white px-6 py-2.5 !rounded-2xl flex items-center gap-3">
          <span className="text-xs text-white/85 font-bold">القيمة المسجلة:</span>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-2xl sm:text-3xl font-black text-amber-300 tabular-nums">
              {currentTotal.toLocaleString("en-US")}
            </span>
            <span className="text-xs text-white/80">
              ({toArabicNumerals(currentTotal)})
            </span>
          </div>
        </div>
      </div>

      {/* Target Challenge Bar */}
      <div className="clay-card-sm bg-gradient-to-l from-[#FFF8E6] via-white to-[#F2EEFF] dark:from-[#2A2218] dark:via-[#1C1A3A] dark:to-[#241E4A] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <ClayIcon name="target" tone="peach" size="sm" />
          {challengeTarget !== null ? (
            <div>
              <span className="font-bold">تحدي التثبيت: مثل الرقم التالي على العداد: </span>
              <span className="clay-pill font-mono font-black text-base text-brand-700 dark:text-brand-200 px-3 py-0.5 mx-1">
                {challengeTarget}
              </span>
              {challengeSuccess && (
                <span className="text-emerald-600 dark:text-emerald-400 font-black mr-2">🎉 أحسنت! تمثيل صحيح 100%</span>
              )}
            </div>
          ) : (
            <span className="font-bold">تريد اختبار مهارتك؟ اضغط لتوليد رقم عشوائي لتمثيله بالأصابع</span>
          )}
        </div>

        <button
          onClick={startNewChallenge}
          className="clay-btn-purple px-5 py-2.5 font-extrabold flex items-center gap-1.5"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>{challengeTarget !== null ? "رقم تحدٍ جديد" : "بدء تحدي تمثيل الأرقام"}</span>
        </button>
      </div>

      {/* Physical Touch-Draggable Soroban Board Frame */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 text-[11px] sm:text-xs font-bold text-[#6E6A94] dark:text-[#B3AED6]">
          <span>💡 اسحب الخرزات ثلاثية الأبعاد بإصبعك أو بالماوس للأعلى والأسفل بسلاسة (أو انقر عليها)</span>
          <span>🟡 النقطة الذهبية المرجعية تقع على عمود المئات</span>
        </div>
        <InteractiveSorobanBoard
          rods={rods}
          onSetRodUpper={setRodUpper}
          onSetRodLowers={setRodLowers}
          getPlaceName={getPlaceName}
          variant="full"
        />
      </div>

      {/* Instructions & Orientation Guide */}
      <div className="clay-card p-6 sm:p-8 space-y-4">
        <h3 className="font-black text-base sm:text-lg text-[#1E1B3A] dark:text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-500" />
          <span>ترتيب المنازل على العداد السوروبان:</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs sm:text-sm text-[#4F4A75] dark:text-[#D5D0F2]">
          <div className="clay-card-sm p-4 bg-[#E6FBF7]/80 dark:bg-[#143736] space-y-1.5">
            <h4 className="font-black text-emerald-900 dark:text-emerald-300">عمود الآحاد (أقصى اليمين):</h4>
            <p className="leading-relaxed">
              يبدأ الترقيم الطبيعي من العمود الواقع في أقصى اليمين (الآحاد)، وتتدرج المنازل يساراً (عشرات، مئات، آلاف...) تماماً كما نكتب ونقرأ الأعداد.
            </p>
          </div>

          <div className="clay-card-sm p-4 bg-[#FFF6E5]/90 dark:bg-[#3A2812] space-y-1.5">
            <h4 className="font-black text-amber-900 dark:text-amber-300">الخرزة العلوية (قيمة 5):</h4>
            <p className="leading-relaxed">
              تكون غير مفعلة في الأعلى (0). وتُحسب (+5) عند إنزالها باتجاه العارضة الفاصلة في الوسط.
            </p>
          </div>

          <div className="clay-card-sm p-4 bg-[#ECF6FF]/90 dark:bg-[#142D4A] space-y-1.5">
            <h4 className="font-black text-sky-900 dark:text-sky-300">الخرزات السفلية (قيمة 1 لكل خرزة):</h4>
            <p className="leading-relaxed">
              تكون غير مفعلة في الأسفل. وتُحسب عند رفعها لأعلى باتجاه العارضة الفاصلة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
