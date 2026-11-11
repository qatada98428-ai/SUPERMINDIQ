"use client";

import React from "react";
import { digitToRodState } from "@/lib/soroban-engine";

export interface RodVisualConfig {
  upper: boolean;
  lowers: number;
  label?: string;
  badge?: string;
  highlight?: boolean;
  highlightColor?: string; // e.g. "border-amber-400 bg-amber-500/10"
  colorTheme?: "amber" | "sky" | "emerald" | "purple" | "rose" | "slate";
}

interface SorobanBeadVisualizerProps {
  // Pass either an array of custom RodVisualConfig, or pass a value and rodCount
  rodsConfig?: RodVisualConfig[];
  value?: number;
  rodCount?: number;
  caption?: string;
  subCaption?: string;
  size?: "sm" | "md" | "lg";
  onRodClick?: (rodIndex: number) => void;
  className?: string;
}

export default function SorobanBeadVisualizer({
  rodsConfig,
  value,
  rodCount = 7,
  caption,
  subCaption,
  size = "md",
  onRodClick,
  className = "",
}: SorobanBeadVisualizerProps) {
  // Build rods list
  let finalRods: RodVisualConfig[] = [];

  if (rodsConfig && rodsConfig.length > 0) {
    finalRods = rodsConfig;
  } else {
    // Generate from value
    const v = Math.max(0, Math.floor(value || 0));
    let temp = v;
    const digits: number[] = [];
    for (let i = 0; i < rodCount; i++) {
      digits.unshift(temp % 10);
      temp = Math.floor(temp / 10);
    }
    finalRods = digits.map((d, idx) => {
      const state = digitToRodState(d);
      const power = rodCount - 1 - idx;
      return {
        upper: state.upper,
        lowers: state.lowers,
        label: power === 0 ? "آحاد" : power === 1 ? "عشرات" : power === 2 ? "مئات" : `10^${power}`,
        badge: `${d}`,
      };
    });
  }

  // Size styling constants
  const sizeConfig = {
    sm: {
      rodWidth: "w-10 sm:w-12",
      upperHeight: "h-14 sm:h-16",
      lowerHeight: "h-36 sm:h-40",
      beadSize: "w-8 sm:w-10 h-5 sm:h-6",
      upperActiveTranslate: "translate-y-7 sm:translate-y-8",
      upperIdleTranslate: "translate-y-0",
      lowerActiveTranslate: "-translate-y-1",
      lowerIdleTranslate: "translate-y-5 sm:translate-y-6",
      fontSize: "text-[10px]",
    },
    md: {
      rodWidth: "w-12 sm:w-16",
      upperHeight: "h-16 sm:h-20",
      lowerHeight: "h-44 sm:h-52",
      beadSize: "w-10 sm:w-14 h-6 sm:h-7",
      upperActiveTranslate: "translate-y-8 sm:translate-y-10",
      upperIdleTranslate: "translate-y-0",
      lowerActiveTranslate: "-translate-y-1 sm:-translate-y-1.5",
      lowerIdleTranslate: "translate-y-6 sm:translate-y-8",
      fontSize: "text-xs",
    },
    lg: {
      rodWidth: "w-14 sm:w-20",
      upperHeight: "h-20 sm:h-24",
      lowerHeight: "h-56 sm:h-64",
      beadSize: "w-12 sm:w-16 h-8 sm:h-9",
      upperActiveTranslate: "translate-y-10 sm:translate-y-12",
      upperIdleTranslate: "translate-y-0",
      lowerActiveTranslate: "-translate-y-1.5",
      lowerIdleTranslate: "translate-y-7 sm:translate-y-9",
      fontSize: "text-xs sm:text-sm",
    },
  }[size];

  return (
    <div className={`space-y-2 select-none ${className}`}>
      {(caption || subCaption) && (
        <div className="flex items-center justify-between text-right px-2">
          {caption && <span className="font-bold text-slate-800 text-xs sm:text-sm">{caption}</span>}
          {subCaption && <span className="text-[11px] text-slate-500 font-mono">{subCaption}</span>}
        </div>
      )}

      {/* Frame Container */}
      <div
        dir="ltr"
        className="bg-[#24140B] p-4 sm:p-6 rounded-3xl border-4 sm:border-8 border-[#3C2114] shadow-xl overflow-x-auto relative"
      >
        <div className="min-w-max mx-auto flex justify-center">
          <div
            className="flex items-center justify-center gap-2 sm:gap-4"
            style={{ minWidth: `${finalRods.length * 52}px` }}
          >
            {finalRods.map((rod, rIdx) => {
              const rodVal = (rod.upper ? 5 : 0) + rod.lowers;
              const isHighlight = !!rod.highlight;

              return (
                <div
                  key={rIdx}
                  onClick={() => onRodClick?.(rIdx)}
                  className={`flex flex-col items-center select-none ${sizeConfig.rodWidth} ${
                    isHighlight ? "ring-2 ring-amber-400 bg-amber-500/10 rounded-2xl p-1 -m-1" : ""
                  } ${onRodClick ? "cursor-pointer hover:opacity-90" : ""}`}
                >
                  {/* Optional Top Label */}
                  {rod.label && (
                    <div
                      dir="rtl"
                      className={`text-[10px] font-bold font-arabic mb-1 text-center truncate max-w-full ${
                        isHighlight ? "text-amber-300 font-black" : "text-amber-200/70"
                      }`}
                      title={rod.label}
                    >
                      {rod.label}
                    </div>
                  )}

                  {/* Upper Deck (1 bead = 5) */}
                  <div
                    className={`${sizeConfig.upperHeight} w-full flex flex-col justify-between items-center relative py-1`}
                  >
                    {/* Metal Rod wire */}
                    <div className="absolute top-0 bottom-0 w-1 sm:w-1.5 bg-slate-300/60 rounded-full" />

                    {/* 5-Bead */}
                    <div className="relative z-10 w-full flex justify-center">
                      <div
                        className={`${sizeConfig.beadSize} rounded-full shadow-lg transition-all duration-300 flex items-center justify-center border-2 ${
                          rod.upper
                            ? `${sizeConfig.upperActiveTranslate} bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 border-amber-200 text-amber-950 font-black shadow-amber-500/30 scale-105`
                            : `${sizeConfig.upperIdleTranslate} bg-gradient-to-b from-slate-200 to-slate-400 border-slate-100 text-slate-700 font-bold opacity-80`
                        }`}
                      >
                        <span className="text-[10px] font-mono font-bold">5</span>
                      </div>
                    </div>
                  </div>

                  {/* Reckoning Beam (Horizontal divider with center dot) */}
                  <div className="w-full h-3 sm:h-4 bg-gradient-to-r from-amber-800 via-amber-600 to-amber-800 my-1 rounded-sm shadow-md flex items-center justify-center relative">
                    <span
                      className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-white shadow-xs border border-amber-900"
                    />
                  </div>

                  {/* Lower Deck (4 beads = 1 each) */}
                  <div
                    className={`${sizeConfig.lowerHeight} w-full flex flex-col justify-start items-center relative pt-1`}
                  >
                    {/* Metal Rod wire */}
                    <div className="absolute top-0 bottom-0 w-1 sm:w-1.5 bg-slate-300/60 rounded-full" />

                    {/* 4 lower beads */}
                    <div className="relative z-10 w-full flex flex-col gap-1 sm:gap-1.5 items-center">
                      {[1, 2, 3, 4].map((beadNum) => {
                        const isActive = rod.lowers >= beadNum;
                        return (
                          <div
                            key={beadNum}
                            className={`${sizeConfig.beadSize} rounded-full shadow-md transition-all duration-300 flex items-center justify-center border-2 ${
                              isActive
                                ? `${sizeConfig.lowerActiveTranslate} bg-gradient-to-b from-sky-400 via-sky-500 to-sky-600 border-sky-100 text-sky-950 font-black shadow-sky-500/30 scale-105`
                                : `${sizeConfig.lowerIdleTranslate} bg-gradient-to-b from-slate-200 to-slate-400 border-slate-100 text-slate-700 font-bold opacity-75`
                            }`}
                          >
                            <span className="text-[10px] font-mono font-bold">1</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rod Value Indicator */}
                  <div
                    className={`mt-2 py-1 px-2 sm:px-2.5 rounded-lg border text-center font-mono font-black text-xs sm:text-sm shadow-xs ${
                      isHighlight
                        ? "bg-amber-400 text-slate-950 border-amber-300"
                        : "bg-slate-900 border-slate-800 text-amber-300"
                    }`}
                  >
                    {rod.badge || rodVal}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
