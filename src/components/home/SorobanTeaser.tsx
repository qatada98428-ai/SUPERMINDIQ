"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, RotateCcw, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toArabicNumerals } from "@/lib/utils";
import { soundSynth } from "@/lib/audio-synthesizer";

export default function SorobanTeaser() {
  // 4 rods: Thousands (left), Hundreds, Tens, Units (right)
  const [rods, setRods] = useState([
    { upper: false, lowers: 1 }, // 1 (thousands - left)
    { upper: true, lowers: 2 },  // 7 (hundreds)
    { upper: false, lowers: 3 }, // 3 (tens)
    { upper: true, lowers: 4 },  // 9 (units - right) -> 1739
  ]);

  const toggleUpper = (rodIndex: number) => {
    soundSynth.playBeadClick(580, 0.18);
    setRods((prev) =>
      prev.map((r, i) => (i === rodIndex ? { ...r, upper: !r.upper } : r))
    );
  };

  const setLowerCount = (rodIndex: number, targetCount: number) => {
    soundSynth.playBeadClick(500 + targetCount * 25, 0.18);
    setRods((prev) =>
      prev.map((r, i) => {
        if (i !== rodIndex) return r;
        const newCount = r.lowers === targetCount ? targetCount - 1 : targetCount;
        return { ...r, lowers: Math.max(0, Math.min(4, newCount)) };
      })
    );
  };

  const resetRods = () => {
    soundSynth.playBeadClick(440, 0.2);
    setRods(rods.map(() => ({ upper: false, lowers: 0 })));
  };

  // Calculate rod values: index 0 is left (thousands), index 3 is right (units)
  const rodValues = rods.map((r) => (r.upper ? 5 : 0) + r.lowers);
  const totalValue = rodValues.reduce((acc, val, idx) => acc + val * Math.pow(10, rods.length - 1 - idx), 0);

  const placeLabels = ["آلاف", "مئات", "عشرات", "الآحاد"];

  return (
    <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Sparkles className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-white font-bold text-base sm:text-lg">العداد الياباني التفاعلي (تجربة حية)</h3>
            <p className="text-slate-400 text-xs">الآحاد في أقصى اليمين وتتدرج المنازل يساراً</p>
          </div>
        </div>

        <button
          onClick={resetRods}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          title="تصفير العداد"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span>تصفير</span>
        </button>
      </div>

      {/* Value Readout Display */}
      <div className="relative z-10 my-6 bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 flex items-center justify-between">
        <div className="text-xs text-slate-400 font-medium">
          القيمة المحسوبة الحالية:
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-baseline gap-1 text-emerald-400 font-mono font-bold text-2xl sm:text-3xl">
            <span>{totalValue.toLocaleString("en-US")}</span>
            <span className="text-xs text-slate-500 font-normal">({toArabicNumerals(totalValue)})</span>
          </div>
        </div>
      </div>

      {/* Soroban Frame (Enforce dir="ltr" so left is thousands and right is units) */}
      <div
        dir="ltr"
        className="relative z-10 bg-[#2A1810] p-4 sm:p-6 rounded-2xl border-4 border-[#3D2317] shadow-inner"
      >
        <div className="grid grid-cols-4 gap-3 sm:gap-6 relative">
          {rods.map((rod, rIdx) => {
            const rodVal = (rod.upper ? 5 : 0) + rod.lowers;
            return (
              <div key={rIdx} className="flex flex-col items-center select-none">
                {/* Place label */}
                <div
                  dir="rtl"
                  className={`text-[11px] font-bold font-arabic mb-1 text-center ${
                    rIdx === 3 ? "text-emerald-400 font-black" : "text-amber-200/70"
                  }`}
                >
                  {placeLabels[rIdx]}
                </div>

                {/* Upper Deck (1 Bead = 5) */}
                <div className="h-16 w-full flex flex-col justify-between items-center relative py-1">
                  <div className="absolute top-0 bottom-0 w-1 bg-slate-400/50 -z-0" />

                  <div className="relative z-10 w-full flex justify-center">
                    <button
                      onClick={() => toggleUpper(rIdx)}
                      className={`w-12 sm:w-16 h-7 rounded-full shadow-md transition-all duration-150 cursor-pointer flex items-center justify-center border-2 ${
                        rod.upper
                          ? "translate-y-7 bg-gradient-to-b from-amber-400 to-amber-600 border-amber-300 text-amber-950 font-bold text-xs"
                          : "translate-y-0 bg-gradient-to-b from-slate-300 to-slate-400 border-slate-200 text-slate-700 font-medium text-xs opacity-85 hover:opacity-100"
                      }`}
                      aria-label={`خرزة الخمسة - ${placeLabels[rIdx]}`}
                    >
                      5
                    </button>
                  </div>
                </div>

                {/* The Reckoning Beam with unit dot on rod 3 (Units) */}
                <div className="w-full h-3.5 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 my-1 rounded-sm shadow flex items-center justify-center relative">
                  {rIdx === 3 && (
                    <span className="w-2 h-2 rounded-full bg-white shadow-xs border border-amber-900" />
                  )}
                </div>

                {/* Lower Deck (4 Beads = 1 each) */}
                <div className="h-44 w-full flex flex-col justify-start items-center relative pt-2">
                  <div className="absolute top-0 bottom-0 w-1 bg-slate-400/50 -z-0" />

                  <div className="relative z-10 w-full flex flex-col gap-1 items-center">
                    {[1, 2, 3, 4].map((beadNum) => {
                      const isActive = rod.lowers >= beadNum;
                      return (
                        <button
                          key={beadNum}
                          onClick={() => setLowerCount(rIdx, beadNum)}
                          className={`w-12 sm:w-16 h-7 rounded-full shadow-md transition-all duration-150 cursor-pointer flex items-center justify-center border-2 ${
                            isActive
                              ? "-translate-y-1 bg-gradient-to-b from-sky-400 to-sky-600 border-sky-200 text-sky-950 font-bold text-xs shadow-sky-500/20"
                              : "translate-y-4 bg-gradient-to-b from-slate-300 to-slate-400 border-slate-200 text-slate-700 font-medium text-xs opacity-75 hover:opacity-95"
                          }`}
                          aria-label={`خرزة 1 - ${placeLabels[rIdx]}`}
                        >
                          1
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Rod Total Value Indicator */}
                <div className="mt-2 py-1 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center font-mono font-bold text-sm text-amber-400">
                  {rodVal}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="relative z-10 mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>محاكاة فيزيائية دقيقة تبدأ من الآحاد في اليمين</span>
        </div>
        <Link
          href="/mental-arithmetic/abacus"
          className="flex items-center gap-1.5 text-brand-400 hover:text-brand-300 font-bold transition-colors"
        >
          <span>فتح العداد الكامل (حتى 17 عموداً)</span>
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
