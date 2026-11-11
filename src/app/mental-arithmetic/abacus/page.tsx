"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calculator,
  RotateCcw,
  Plus,
  Minus,
  Volume2,
  VolumeX,
  Target,
  Shuffle,
  HelpCircle,
} from "lucide-react";
import {
  SorobanRodState,
  getRodValue,
  sorobanToNumber,
  numberToSoroban,
  playSoundEffect,
} from "@/lib/soroban-engine";
import { soundSynth } from "@/lib/audio-synthesizer";
import { toArabicNumerals } from "@/lib/utils";

export default function AbacusPage() {
  const [numRods, setNumRods] = useState(7);
  const [rods, setRods] = useState<SorobanRodState[]>(
    Array.from({ length: 7 }, () => ({ upper: false, lowers: 0 }))
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

  const toggleUpper = (rodIdx: number) => {
    playClick(580);
    setRods((prev) =>
      prev.map((r, i) => (i === rodIdx ? { ...r, upper: !r.upper } : r))
    );
  };

  const setLowers = (rodIdx: number, val: number) => {
    playClick(480 + val * 30);
    setRods((prev) =>
      prev.map((r, i) => {
        if (i !== rodIdx) return r;
        const newCount = r.lowers === val ? val - 1 : val;
        return { ...r, lowers: Math.max(0, Math.min(4, newCount)) };
      })
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
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/" className="hover:text-brand-600">الرئيسية</Link>
            <span>/</span>
            <Link href="/mental-arithmetic" className="hover:text-brand-600">الحساب الذهني</Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">العداد التفاعلي (السوروبان)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <Calculator className="w-8 h-8 text-amber-600" />
            <span>العداد الياباني الكامل (السوروبان)</span>
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-bold ${
              soundEnabled
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-slate-100 border-slate-200 text-slate-500"
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? "صوت الخرزات (ناعم)" : "صامت"}</span>
          </button>

          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs sm:text-sm font-bold transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-amber-700" />
            <span>تصفير العداد (C)</span>
          </button>
        </div>
      </div>

      {/* Control Ribbon */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-6">
        {/* Rods Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm font-bold text-slate-700">عدد الأعمدة:</span>
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => handleRodsCountChange(numRods - 1)}
              disabled={numRods <= 3}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30"
              aria-label="تقليل"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-mono font-bold text-base px-3">{numRods}</span>
            <button
              onClick={() => handleRodsCountChange(numRods + 1)}
              disabled={numRods >= 17}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30"
              aria-label="زيادة"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">(من 3 إلى 17 عموداً)</span>
        </div>

        {/* Direct number representation tool */}
        <form onSubmit={handleDirectNumberApply} className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="مثّل رقماً معيناً..."
            value={directInputVal}
            onChange={(e) => setDirectInputVal(e.target.value)}
            className="w-36 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
          >
            تمثيل
          </button>
        </form>

        {/* Live Total Readout */}
        <div className="flex items-center gap-3 bg-slate-900 text-white px-6 py-2.5 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-400">القيمة المسجلة:</span>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">
              {currentTotal.toLocaleString("en-US")}
            </span>
            <span className="text-xs text-slate-400">
              ({toArabicNumerals(currentTotal)})
            </span>
          </div>
        </div>
      </div>

      {/* Target Challenge Bar */}
      <div className="bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-indigo-500/10 p-4 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-600" />
          {challengeTarget !== null ? (
            <div>
              <span>تحدي التثبيت: مثل الرقم التالي على العداد: </span>
              <span className="font-mono font-black text-base text-brand-700 px-2 py-0.5 rounded bg-white shadow-xs">
                {challengeTarget}
              </span>
              {challengeSuccess && (
                <span className="text-emerald-600 font-bold mr-2">🎉 أحسنت! تمثيل صحيح 100%</span>
              )}
            </div>
          ) : (
            <span>تريد اختبار مهارتك؟ اضغط لتوليد رقم عشوائي لتمثيله بالأصابع</span>
          )}
        </div>

        <button
          onClick={startNewChallenge}
          className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-transform active:scale-95 flex items-center gap-1.5"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>{challengeTarget !== null ? "رقم تحدٍ جديد" : "بدء تحدي تمثيل الأرقام"}</span>
        </button>
      </div>

      {/* Physical Soroban Board Frame:
          Enforce dir="ltr" so that the leftmost rod is highest power,
          and the RIGHTMOST rod is strictly UNITS (الآحاد)!
      */}
      <div
        dir="ltr"
        className="bg-[#24140B] p-6 sm:p-10 rounded-3xl border-8 border-[#3C2114] shadow-2xl overflow-x-auto relative"
      >
        <div className="min-w-max mx-auto flex justify-center">
          <div
            className="grid gap-3 sm:gap-6 justify-center"
            style={{ gridTemplateColumns: `repeat(${numRods}, minmax(52px, 1fr))` }}
          >
            {rods.map((rod, rIdx) => {
              const rodVal = getRodValue(rod);
              // In LTR: rIdx = 0 is left (highest), rIdx = numRods - 1 is RIGHT (units 10^0)!
              const powerOfTen = numRods - 1 - rIdx;
              const isUnitDot = powerOfTen % 3 === 0;

              return (
                <div key={rIdx} className="flex flex-col items-center select-none w-14 sm:w-20">
                  {/* Place Value Header */}
                  <div
                    dir="rtl"
                    className={`text-[11px] font-bold font-arabic mb-2 text-center ${
                      powerOfTen === 0
                        ? "text-emerald-400 font-black"
                        : "text-amber-200/70"
                    }`}
                  >
                    {getPlaceName(powerOfTen)}
                  </div>

                  {/* Upper Deck (1 bead = 5) */}
                  <div className="h-20 sm:h-24 w-full flex flex-col justify-between items-center relative py-1">
                    {/* Metal Rod wire */}
                    <div className="absolute top-0 bottom-0 w-1.5 bg-slate-300/60 rounded-full" />

                    {/* 5-Bead */}
                    <div className="relative z-10 w-full flex justify-center">
                      <button
                        onClick={() => toggleUpper(rIdx)}
                        className={`w-12 sm:w-16 h-8 sm:h-9 rounded-full shadow-lg transition-all duration-150 cursor-pointer flex items-center justify-center border-2 ${
                          rod.upper
                            ? "translate-y-10 sm:translate-y-12 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 border-amber-200 text-amber-950 font-black text-xs shadow-amber-500/30 scale-105"
                            : "translate-y-0 bg-gradient-to-b from-slate-200 to-slate-400 border-slate-100 text-slate-700 font-bold text-xs opacity-80 hover:opacity-100"
                        }`}
                        aria-label="خرزة الخمسة"
                      >
                        5
                      </button>
                    </div>
                  </div>

                  {/* The Reckoning Beam (Horizontal divider) with unit dots */}
                  <div className="w-full h-4 bg-gradient-to-r from-amber-800 via-amber-600 to-amber-800 my-1 rounded-sm shadow-md flex items-center justify-center relative">
                    {isUnitDot && (
                      <span
                        className="w-2.5 h-2.5 rounded-full bg-white shadow-xs border border-amber-900"
                        title={powerOfTen === 0 ? "نقطة الآحاد الرئيسية" : `مضاعف 10^${powerOfTen}`}
                      />
                    )}
                  </div>

                  {/* Lower Deck (4 beads = 1 each) */}
                  <div className="h-56 sm:h-64 w-full flex flex-col justify-start items-center relative pt-2">
                    {/* Metal Rod wire */}
                    <div className="absolute top-0 bottom-0 w-1.5 bg-slate-300/60 rounded-full" />

                    {/* 4 lower beads */}
                    <div className="relative z-10 w-full flex flex-col gap-1.5 items-center">
                      {[1, 2, 3, 4].map((beadNum) => {
                        const isActive = rod.lowers >= beadNum;
                        return (
                          <button
                            key={beadNum}
                            onClick={() => setLowers(rIdx, beadNum)}
                            className={`w-12 sm:w-16 h-8 sm:h-9 rounded-full shadow-md transition-all duration-150 cursor-pointer flex items-center justify-center border-2 ${
                              isActive
                                ? "-translate-y-1 sm:-translate-y-1.5 bg-gradient-to-b from-sky-400 via-sky-500 to-sky-600 border-sky-100 text-sky-950 font-black text-xs shadow-sky-500/30 scale-105"
                                : "translate-y-6 sm:translate-y-8 bg-gradient-to-b from-slate-200 to-slate-400 border-slate-100 text-slate-700 font-bold text-xs opacity-75 hover:opacity-95"
                            }`}
                            aria-label={`خرزة ${beadNum}`}
                          >
                            1
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rod Value Indicator */}
                  <div className="mt-4 py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-center font-mono font-black text-sm text-amber-400 shadow-sm">
                    {rodVal}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Instructions & Orientation Guide */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-600" />
          <span>ترتيب المنازل على العداد السوروبان:</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm text-slate-600">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
            <h4 className="font-bold text-emerald-900">عمود الآحاد (أقصى اليمين):</h4>
            <p className="leading-relaxed">
              يبدأ الترقيم الطبيعي من العمود الواقع في أقصى اليمين (الآحاد)، وتتدرج المنازل يساراً (عشرات، مئات، آلاف...) تماماً كما نكتب ونقرأ الأعداد.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
            <h4 className="font-bold text-amber-900">الخرزة العلوية (قيمة 5):</h4>
            <p className="leading-relaxed">
              تكون غير مفعلة في الأعلى (0). وتُحسب (+5) عند إنزالها باتجاه العارضة الفاصلة في الوسط.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-1.5">
            <h4 className="font-bold text-sky-900">الخرزات السفلية (قيمة 1 لكل خرزة):</h4>
            <p className="leading-relaxed">
              تكون غير مفعلة في الأسفل. وتُحسب عند رفعها لأعلى باتجاه العارضة الفاصلة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
