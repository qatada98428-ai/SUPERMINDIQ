"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, RotateCcw, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toArabicNumerals } from "@/lib/utils";
import { soundSynth } from "@/lib/audio-synthesizer";
import InteractiveSorobanBoard from "@/components/soroban/InteractiveSorobanBoard";

export default function SorobanTeaser() {
  // 4 rods: Thousands (left), Hundreds, Tens, Units (right)
  const [rods, setRods] = useState([
    { upper: false, lowers: 1 }, // 1 (thousands - left)
    { upper: true, lowers: 2 },  // 7 (hundreds)
    { upper: false, lowers: 3 }, // 3 (tens)
    { upper: true, lowers: 4 },  // 9 (units - right) -> 1739
  ]);

  const setRodUpper = (rodIndex: number, upper: boolean) => {
    soundSynth.playBeadClick(580, 0.18);
    setRods((prev) =>
      prev.map((r, i) => (i === rodIndex ? { ...r, upper } : r))
    );
  };

  const setRodLowers = (rodIndex: number, lowers: number) => {
    const clamped = Math.max(0, Math.min(4, lowers));
    soundSynth.playBeadClick(500 + clamped * 25, 0.18);
    setRods((prev) =>
      prev.map((r, i) => (i === rodIndex ? { ...r, lowers: clamped } : r))
    );
  };

  const resetRods = () => {
    soundSynth.playBeadClick(440, 0.2);
    setRods(rods.map(() => ({ upper: false, lowers: 0 })));
  };

  // Calculate rod values: index 0 is left (thousands), index 3 is right (units)
  const rodValues = rods.map((r) => (r.upper ? 5 : 0) + r.lowers);
  const totalValue = rodValues.reduce((acc, val, idx) => acc + val * Math.pow(10, rods.length - 1 - idx), 0);

  const getPlaceName = (power: number) => {
    switch (power) {
      case 0:
        return "الآحاد";
      case 1:
        return "عشرات";
      case 2:
        return "مئات";
      default:
        return "آلاف";
    }
  };

  return (
    <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 p-4 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-5 sm:pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <Sparkles className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-white font-bold text-sm sm:text-lg">العداد الياباني التفاعلي (تجربة حية)</h3>
            <p className="text-slate-400 text-[11px] sm:text-xs">الآحاد في أقصى اليمين وتتدرج المنازل يساراً</p>
          </div>
        </div>

        <button
          onClick={resetRods}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors shrink-0"
          title="تصفير العداد"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span>تصفير</span>
        </button>
      </div>

      {/* Value Readout Display */}
      <div className="relative z-10 my-4 sm:my-6 bg-slate-950/80 rounded-2xl p-3.5 sm:p-4 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-slate-400 font-medium">
          القيمة المحسوبة الحالية:
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-baseline gap-1 text-emerald-400 font-mono font-bold text-xl sm:text-3xl">
            <span>{totalValue.toLocaleString("en-US")}</span>
            <span className="text-xs text-slate-500 font-normal">({toArabicNumerals(totalValue)})</span>
          </div>
        </div>
      </div>

      {/* Interactive Touch-Draggable Soroban Frame */}
      <InteractiveSorobanBoard
        rods={rods}
        onSetRodUpper={setRodUpper}
        onSetRodLowers={setRodLowers}
        getPlaceName={getPlaceName}
        variant="compact"
      />

      {/* Footer CTA */}
      <div className="relative z-10 mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2 text-center sm:text-right">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>اسحب الخرزات باللمس لأعلى وأسفل بسلاسة أو انقر عليها</span>
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
