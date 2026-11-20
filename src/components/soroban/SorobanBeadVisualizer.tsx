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

      {/* Frame Container — Soft 3D Claymorphism Soroban Theme */}
      <div
        dir="ltr"
        className="rounded-[30px] bg-gradient-to-br from-[#6D50F6] via-[#5335DE] to-[#391FB8] p-3 sm:p-5 shadow-[0_18px_36px_-10px_rgba(68,42,198,0.42),inset_0_3px_5px_rgba(255,255,255,0.4)] overflow-x-auto relative"
      >
        <div className="rounded-[22px] bg-gradient-to-b from-[#FCFBFF] via-[#F4F1FE] to-[#EBE6FC] dark:from-[#1B183C] dark:via-[#161333] dark:to-[#110E28] p-3 sm:p-5 border border-white/60 dark:border-[#3D3776] shadow-inner">
          <div className="min-w-max mx-auto flex justify-center">
            <div
              className="flex items-center justify-center gap-2 sm:gap-4"
              style={{ minWidth: `${finalRods.length * 52}px` }}
            >
              {finalRods.map((rod, rIdx) => {
                const rodVal = (rod.upper ? 5 : 0) + rod.lowers;
                const isHighlight = !!rod.highlight;
                const powerOfTen = finalRods.length - 1 - rIdx;
                const isHundredsDot = powerOfTen % 3 === 2;

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
                          isHighlight
                            ? "text-amber-600 dark:text-amber-300 font-black"
                            : "text-[#635D94] dark:text-[#ABA5D6]"
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
                      <div className="absolute top-0 bottom-0 w-1.5 bg-gradient-to-r from-[#B8B0E0] via-[#FFFFFF] to-[#8C82C4] dark:from-[#3D3773] dark:via-[#8F87CC] dark:to-[#282352] rounded-full" />

                      <div className="relative z-10 w-full flex justify-center">
                        <div
                          className={`${sizeConfig.beadSize} rounded-[44%/50%] transition-all duration-300 flex items-center justify-center border ${
                            rod.upper
                              ? `${sizeConfig.upperActiveTranslate} bg-[radial-gradient(ellipse_at_50%_22%,#FFB5C8_0%,#F43F6E_46%,#A3133D_100%)] border-[#FF9EB7]/70 text-white font-black shadow-[0_6px_12px_-3px_rgba(225,29,72,0.5)] scale-105`
                              : `${sizeConfig.upperIdleTranslate} bg-[radial-gradient(ellipse_at_50%_22%,#FFFFFF_0%,#DED8FA_52%,#AEA3DF_100%)] dark:bg-[radial-gradient(ellipse_at_50%_22%,#8F86C9_0%,#534B8E_55%,#2F2A5E_100%)] border-white/80 dark:border-[#7B72BA]/50 text-[#554D85] dark:text-[#E2DFF7] font-bold opacity-90`
                          }`}
                        >
                          <span className="text-[10px] font-mono font-bold">5</span>
                        </div>
                      </div>
                    </div>

                    {/* Reckoning Beam with Hundreds Marker Dot */}
                    <div className="w-[calc(100%+12px)] sm:w-[calc(100%+18px)] h-3 sm:h-4 bg-gradient-to-b from-[#8F73FF] via-[#6040F2] to-[#3B21B5] my-1 rounded-full shadow-md flex items-center justify-center relative z-10">
                      {isHundredsDot && (
                        <span className="w-2 h-2 rounded-full bg-amber-300 ring-1 ring-amber-700/60" />
                      )}
                    </div>

                    {/* Lower Deck (4 beads = 1 each) */}
                    <div
                      className={`${sizeConfig.lowerHeight} w-full flex flex-col justify-start items-center relative pt-1`}
                    >
                      <div className="absolute top-0 bottom-0 w-1.5 bg-gradient-to-r from-[#B8B0E0] via-[#FFFFFF] to-[#8C82C4] dark:from-[#3D3773] dark:via-[#8F87CC] dark:to-[#282352] rounded-full" />

                      <div className="relative z-10 w-full flex flex-col gap-1 sm:gap-1.5 items-center">
                        {[1, 2, 3, 4].map((beadNum) => {
                          const isActive = rod.lowers >= beadNum;
                          return (
                            <div
                              key={beadNum}
                              className={`${sizeConfig.beadSize} rounded-[44%/50%] transition-all duration-300 flex items-center justify-center border ${
                                isActive
                                  ? `${sizeConfig.lowerActiveTranslate} bg-[radial-gradient(ellipse_at_50%_22%,#FFF099_0%,#F59E0B_48%,#B45309_100%)] border-[#FDE68A]/80 text-[#451A03] font-black shadow-[0_6px_12px_-3px_rgba(245,158,11,0.48)] scale-105`
                                  : `${sizeConfig.lowerIdleTranslate} bg-[radial-gradient(ellipse_at_50%_22%,#FFFFFF_0%,#DED8FA_52%,#AEA3DF_100%)] dark:bg-[radial-gradient(ellipse_at_50%_22%,#8F86C9_0%,#534B8E_55%,#2F2A5E_100%)] border-white/80 dark:border-[#7B72BA]/50 text-[#554D85] dark:text-[#E2DFF7] font-bold opacity-85`
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
                      className={`mt-2 py-1 px-2.5 rounded-xl border text-center font-mono font-black text-xs sm:text-sm shadow-xs ${
                        isHighlight || rodVal > 0
                          ? "bg-gradient-to-b from-[#8B6EFF] to-[#6344F5] text-white border-[#A892FF]/50"
                          : "bg-white dark:bg-[#242146] border-[#E4DFF9] dark:border-[#3A3570] text-[#554D85] dark:text-[#D5D0F2]"
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
    </div>
  );
}
