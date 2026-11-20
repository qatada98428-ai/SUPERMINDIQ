"use client";

import React, { useState, useRef } from "react";
import { SorobanRodState, getRodValue } from "@/lib/soroban-engine";

interface InteractiveSorobanBoardProps {
  rods: SorobanRodState[];
  onSetRodUpper: (rodIndex: number, upper: boolean) => void;
  onSetRodLowers: (rodIndex: number, lowers: number) => void;
  getPlaceName: (powerOfTen: number) => string;
  variant?: "compact" | "full";
}

interface ActiveDrag {
  rodIdx: number;
  kind: "upper" | "lower";
  beadNum: number; // 0 for upper, 1..4 for lower
  startY: number;
  deltaY: number;
  maxAbsDelta: number;
  snapped: boolean;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Renders a realistic sculpted 3D biconical Soroban bead face with
 * top conical shine, equatorial facet ridge, and deep bottom bevel.
 */
function Bead3DSurface({
  valueLabel,
  active,
  kind,
  compact,
}: {
  valueLabel: string;
  active: boolean;
  kind: "upper" | "lower";
  compact: boolean;
}) {
  const paletteClass = active
    ? kind === "upper"
      ? // Active 5-Bead: Sculpted 3D Coral-Ruby Jewel
        "bg-[radial-gradient(ellipse_at_50%_22%,#FFB5C8_0%,#F43F6E_46%,#A3133D_100%)] border-[#FF9EB7]/70 text-white shadow-[0_8px_16px_-4px_rgba(225,29,72,0.5),inset_0_2px_4px_rgba(255,255,255,0.65),inset_0_-4px_6px_rgba(110,8,40,0.55)]"
      : // Active 1-Bead: Sculpted 3D Golden Amber Jewel
        "bg-[radial-gradient(ellipse_at_50%_22%,#FFF099_0%,#F59E0B_48%,#B45309_100%)] border-[#FDE68A]/80 text-[#451A03] shadow-[0_8px_16px_-4px_rgba(245,158,11,0.5),inset_0_2px_4px_rgba(255,255,255,0.75),inset_0_-4px_6px_rgba(120,53,15,0.5)]"
    : // Idle Bead: Sculpted Satin Lavender-Pearl Ceramic Clay
      "bg-[radial-gradient(ellipse_at_50%_22%,#FFFFFF_0%,#DED8FA_52%,#AEA3DF_100%)] dark:bg-[radial-gradient(ellipse_at_50%_22%,#8F86C9_0%,#534B8E_55%,#2F2A5E_100%)] border-white/80 dark:border-[#7B72BA]/50 text-[#554D85] dark:text-[#E2DFF7] shadow-[0_6px_12px_-4px_rgba(55,40,125,0.28),inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-4px_6px_rgba(92,80,160,0.35)] dark:shadow-[0_6px_12px_-4px_rgba(0,0,0,0.55),inset_0_2px_3px_rgba(210,202,255,0.28),inset_0_-4px_6px_rgba(15,12,38,0.7)] opacity-95 hover:opacity-100";

  return (
    <span
      className={`relative w-full h-full flex items-center justify-center border select-none overflow-hidden rounded-[44%/50%] ${paletteClass}`}
    >
      {/* Top specular gloss highlight */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-[12%] left-[18%] right-[18%] h-[24%] rounded-full bg-white/50 dark:bg-white/25 blur-[0.5px]"
      />
      {/* Equatorial physical Soroban ridge */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[6%] top-1/2 -translate-y-1/2 h-[1.5px] bg-white/30 dark:bg-white/15"
      />
      <span
        className={`relative z-10 font-mono font-black tracking-tight ${
          compact ? "text-[11px]" : "text-xs sm:text-sm"
        }`}
        style={{
          textShadow: active
            ? kind === "upper"
              ? "0 1px 2px rgba(90,0,25,0.45)"
              : "0 1px 0 rgba(255,245,200,0.55)"
            : "0 1px 0 rgba(255,255,255,0.6)",
        }}
      >
        {valueLabel}
      </span>
    </span>
  );
}

export default function InteractiveSorobanBoard({
  rods,
  onSetRodUpper,
  onSetRodLowers,
  getPlaceName,
  variant = "full",
}: InteractiveSorobanBoardProps) {
  const isCompact = variant === "compact";
  const [drag, setDrag] = useState<ActiveDrag | null>(null);
  const dragRef = useRef<ActiveDrag | null>(null);

  const upperTravelPx = isCompact ? 28 : 44;
  const lowerActivePx = isCompact ? -4 : -6;
  const lowerIdlePx = isCompact ? 18 : 28;
  const lowerTravelPx = lowerIdlePx - lowerActivePx;

  const updateDrag = (next: ActiveDrag | null) => {
    dragRef.current = next;
    setDrag(next);
  };

  // ── Upper Bead Pointer Handlers ─────────────────────────────
  const handleUpperPointerDown = (
    e: React.PointerEvent<HTMLButtonElement>,
    rodIdx: number
  ) => {
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    updateDrag({
      rodIdx,
      kind: "upper",
      beadNum: 0,
      startY: e.clientY,
      deltaY: 0,
      maxAbsDelta: 0,
      snapped: false,
    });
  };

  const handleUpperPointerMove = (
    e: React.PointerEvent<HTMLButtonElement>,
    rodIdx: number
  ) => {
    const cur = dragRef.current;
    if (!cur || cur.kind !== "upper" || cur.rodIdx !== rodIdx) return;

    const deltaY = e.clientY - cur.startY;
    const maxAbsDelta = Math.max(cur.maxAbsDelta, Math.abs(deltaY));
    const isUpper = rods[rodIdx]?.upper ?? false;

    if (!isUpper && deltaY >= upperTravelPx * 0.42) {
      onSetRodUpper(rodIdx, true);
      updateDrag({
        ...cur,
        startY: e.clientY,
        deltaY: 0,
        maxAbsDelta,
        snapped: true,
      });
      return;
    }

    if (isUpper && deltaY <= -upperTravelPx * 0.42) {
      onSetRodUpper(rodIdx, false);
      updateDrag({
        ...cur,
        startY: e.clientY,
        deltaY: 0,
        maxAbsDelta,
        snapped: true,
      });
      return;
    }

    updateDrag({ ...cur, deltaY, maxAbsDelta });
  };

  const handleUpperPointerEnd = (
    e: React.PointerEvent<HTMLButtonElement>,
    rodIdx: number
  ) => {
    const cur = dragRef.current;
    if (!cur || cur.kind !== "upper" || cur.rodIdx !== rodIdx) return;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}

    const isUpper = rods[rodIdx]?.upper ?? false;
    if (!cur.snapped && cur.maxAbsDelta < 7) {
      onSetRodUpper(rodIdx, !isUpper);
    }
    updateDrag(null);
  };

  // ── Lower Bead Pointer Handlers ─────────────────────────────
  const handleLowerPointerDown = (
    e: React.PointerEvent<HTMLButtonElement>,
    rodIdx: number,
    beadNum: number
  ) => {
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    updateDrag({
      rodIdx,
      kind: "lower",
      beadNum,
      startY: e.clientY,
      deltaY: 0,
      maxAbsDelta: 0,
      snapped: false,
    });
  };

  const handleLowerPointerMove = (
    e: React.PointerEvent<HTMLButtonElement>,
    rodIdx: number,
    beadNum: number
  ) => {
    const cur = dragRef.current;
    if (
      !cur ||
      cur.kind !== "lower" ||
      cur.rodIdx !== rodIdx ||
      cur.beadNum !== beadNum
    ) {
      return;
    }

    const deltaY = e.clientY - cur.startY;
    const maxAbsDelta = Math.max(cur.maxAbsDelta, Math.abs(deltaY));
    const currentLowers = rods[rodIdx]?.lowers ?? 0;

    // Pushing an idle bead UP toward the beam
    if (beadNum > currentLowers && deltaY <= -lowerTravelPx * 0.4) {
      onSetRodLowers(rodIdx, beadNum);
      updateDrag({
        ...cur,
        startY: e.clientY,
        deltaY: 0,
        maxAbsDelta,
        snapped: true,
      });
      return;
    }

    // Pulling an active bead DOWN away from the beam
    if (beadNum <= currentLowers && deltaY >= lowerTravelPx * 0.4) {
      onSetRodLowers(rodIdx, beadNum - 1);
      updateDrag({
        ...cur,
        startY: e.clientY,
        deltaY: 0,
        maxAbsDelta,
        snapped: true,
      });
      return;
    }

    updateDrag({ ...cur, deltaY, maxAbsDelta });
  };

  const handleLowerPointerEnd = (
    e: React.PointerEvent<HTMLButtonElement>,
    rodIdx: number,
    beadNum: number
  ) => {
    const cur = dragRef.current;
    if (
      !cur ||
      cur.kind !== "lower" ||
      cur.rodIdx !== rodIdx ||
      cur.beadNum !== beadNum
    ) {
      return;
    }
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}

    const currentLowers = rods[rodIdx]?.lowers ?? 0;
    if (!cur.snapped && cur.maxAbsDelta < 7) {
      const nextCount = currentLowers === beadNum ? beadNum - 1 : beadNum;
      onSetRodLowers(rodIdx, Math.max(0, Math.min(4, nextCount)));
    }
    updateDrag(null);
  };

  const numRods = rods.length;

  return (
    /* Outer Soft 3D Royal Purple Soroban Frame matching SUPER MIND Claymorphism UI */
    <div
      dir="ltr"
      className={
        isCompact
          ? "relative z-10 rounded-[28px] bg-gradient-to-br from-[#6D50F6] via-[#5335DE] to-[#391FB8] p-2.5 sm:p-4 shadow-[0_16px_32px_-8px_rgba(83,53,222,0.45),inset_0_3px_5px_rgba(255,255,255,0.4),inset_0_-4px_8px_rgba(24,10,92,0.55)] select-none"
          : "relative rounded-[34px] bg-gradient-to-br from-[#6D50F6] via-[#5335DE] to-[#391FB8] p-3 sm:p-5 shadow-[0_22px_45px_-12px_rgba(68,42,198,0.48),inset_0_3px_6px_rgba(255,255,255,0.42),inset_0_-6px_12px_rgba(24,10,92,0.6)] overflow-x-auto select-none"
      }
    >
      {/* Inner Satin Recessed Deck */}
      <div
        className={`rounded-[24px] bg-gradient-to-b from-[#FCFBFF] via-[#F4F1FE] to-[#EBE6FC] dark:from-[#1B183C] dark:via-[#161333] dark:to-[#110E28] border border-white/60 dark:border-[#3D3776] shadow-[inset_0_6px_18px_rgba(55,35,145,0.14)] dark:shadow-[inset_0_6px_20px_rgba(4,2,15,0.75)] ${
          isCompact ? "p-3 sm:p-5" : "p-4 sm:p-7"
        }`}
      >
        <div className={isCompact ? "w-full" : "min-w-max mx-auto flex justify-center"}>
          <div
            className={
              isCompact
                ? "grid grid-cols-4 gap-2 sm:gap-6 relative"
                : "grid gap-3 sm:gap-7 justify-center relative"
            }
            style={
              isCompact
                ? undefined
                : { gridTemplateColumns: `repeat(${numRods}, minmax(60px, 1fr))` }
            }
          >
            {rods.map((rod, rIdx) => {
              const rodVal = getRodValue(rod);
              const powerOfTen = numRods - 1 - rIdx;
              // Official Iraqi/Arabic Soroban Marker Dot on Hundreds (power = 2, 5, 8, ...)
              const isHundredsDot = powerOfTen % 3 === 2;

              const isDraggingThisUpper =
                drag?.kind === "upper" && drag.rodIdx === rIdx;
              const baseUpperY = rod.upper ? upperTravelPx : 0;
              const currentUpperY = isDraggingThisUpper
                ? clamp(baseUpperY + drag.deltaY, 0, upperTravelPx)
                : baseUpperY;

              const isDraggingThisLower =
                drag?.kind === "lower" && drag.rodIdx === rIdx;

              return (
                <div
                  key={rIdx}
                  className={`flex flex-col items-center select-none ${
                    isCompact ? "w-full" : "w-16 sm:w-20"
                  }`}
                >
                  {/* Place Value Header */}
                  <div
                    dir="rtl"
                    className={`text-[10px] sm:text-xs font-extrabold font-arabic mb-1.5 sm:mb-2 text-center truncate max-w-full px-2 py-0.5 rounded-full ${
                      isHundredsDot
                        ? "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300 ring-1 ring-amber-300/70"
                        : powerOfTen === 0
                        ? "bg-brand-100 text-brand-800 dark:bg-brand-500/20 dark:text-brand-200"
                        : "text-[#635D94] dark:text-[#ABA5D6]"
                    }`}
                  >
                    {getPlaceName(powerOfTen)}
                  </div>

                  {/* Upper Deck (1 Bead = 5) */}
                  <div
                    className={`${
                      isCompact ? "h-16" : "h-20 sm:h-24"
                    } w-full flex flex-col justify-between items-center relative py-1`}
                  >
                    {/* 3D Brushed Chrome Rod */}
                    <div
                      aria-hidden="true"
                      className="absolute top-0 bottom-0 w-1.5 sm:w-2 rounded-full bg-gradient-to-r from-[#B8B0E0] via-[#FFFFFF] to-[#8C82C4] dark:from-[#3D3773] dark:via-[#8F87CC] dark:to-[#282352] shadow-[1px_0_3px_rgba(35,20,90,0.2)] pointer-events-none"
                    />

                    <div className="relative z-10 w-full flex justify-center">
                      <button
                        type="button"
                        onPointerDown={(e) => handleUpperPointerDown(e, rIdx)}
                        onPointerMove={(e) => handleUpperPointerMove(e, rIdx)}
                        onPointerUp={(e) => handleUpperPointerEnd(e, rIdx)}
                        onPointerCancel={(e) => handleUpperPointerEnd(e, rIdx)}
                        style={{
                          transform: `translateY(${currentUpperY}px)`,
                          touchAction: "none",
                        }}
                        className={`${
                          isCompact
                            ? "w-11 sm:w-16 h-7"
                            : "w-14 sm:w-[70px] h-8 sm:h-10"
                        } cursor-grab active:cursor-grabbing focus:outline-none ${
                          isDraggingThisUpper
                            ? "transition-none scale-105"
                            : "transition-transform duration-150 ease-out"
                        }`}
                        aria-label={`خرزة الخمسة - ${getPlaceName(powerOfTen)}`}
                      >
                        <Bead3DSurface
                          valueLabel="5"
                          active={rod.upper}
                          kind="upper"
                          compact={isCompact}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Continuous 3D Purple-Indigo Reckoning Beam with Hundreds Marker Dot */}
                  <div
                    className={`w-[calc(100%+12px)] sm:w-[calc(100%+28px)] ${
                      isCompact ? "h-3.5" : "h-4 sm:h-[18px]"
                    } bg-gradient-to-b from-[#8F73FF] via-[#6040F2] to-[#3B21B5] my-1 rounded-full shadow-[0_5px_12px_-2px_rgba(59,33,181,0.45),inset_0_2px_2px_rgba(255,255,255,0.45),inset_0_-2px_3px_rgba(25,10,85,0.45)] flex items-center justify-center relative z-20`}
                  >
                    {isHundredsDot && (
                      <span
                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-b from-[#FFF9C4] to-[#FBBF24] shadow-[0_0_8px_rgba(251,191,36,0.9),inset_0_1px_2px_rgba(255,255,255,0.9)] ring-2 ring-[#2C188A]/60"
                        title={
                          powerOfTen === 2
                            ? "نقطة عمود المئات الرسمية"
                            : `نقطة ${getPlaceName(powerOfTen)}`
                        }
                      />
                    )}
                  </div>

                  {/* Lower Deck (4 Beads = 1 each) */}
                  <div
                    className={`${
                      isCompact ? "h-44" : "h-56 sm:h-64"
                    } w-full flex flex-col justify-start items-center relative pt-2`}
                  >
                    {/* 3D Brushed Chrome Rod */}
                    <div
                      aria-hidden="true"
                      className="absolute top-0 bottom-0 w-1.5 sm:w-2 rounded-full bg-gradient-to-r from-[#B8B0E0] via-[#FFFFFF] to-[#8C82C4] dark:from-[#3D3773] dark:via-[#8F87CC] dark:to-[#282352] shadow-[1px_0_3px_rgba(35,20,90,0.2)] pointer-events-none"
                    />

                    <div className="relative z-10 w-full flex flex-col gap-1 sm:gap-1.5 items-center">
                      {[1, 2, 3, 4].map((beadNum) => {
                        const isActive = rod.lowers >= beadNum;
                        let beadY = isActive ? lowerActivePx : lowerIdlePx;
                        let isFollowingFinger = false;

                        if (isDraggingThisLower && drag) {
                          const target = drag.beadNum;
                          if (
                            target > rod.lowers &&
                            beadNum > rod.lowers &&
                            beadNum <= target
                          ) {
                            const offset = clamp(drag.deltaY, -lowerTravelPx, 0);
                            beadY = lowerIdlePx + offset;
                            isFollowingFinger = true;
                          } else if (
                            target <= rod.lowers &&
                            beadNum <= rod.lowers &&
                            beadNum >= target
                          ) {
                            const offset = clamp(drag.deltaY, 0, lowerTravelPx);
                            beadY = lowerActivePx + offset;
                            isFollowingFinger = true;
                          }
                        }

                        return (
                          <button
                            key={beadNum}
                            type="button"
                            onPointerDown={(e) =>
                              handleLowerPointerDown(e, rIdx, beadNum)
                            }
                            onPointerMove={(e) =>
                              handleLowerPointerMove(e, rIdx, beadNum)
                            }
                            onPointerUp={(e) =>
                              handleLowerPointerEnd(e, rIdx, beadNum)
                            }
                            onPointerCancel={(e) =>
                              handleLowerPointerEnd(e, rIdx, beadNum)
                            }
                            style={{
                              transform: `translateY(${beadY}px)`,
                              touchAction: "none",
                            }}
                            className={`${
                              isCompact
                                ? "w-11 sm:w-16 h-7"
                                : "w-14 sm:w-[70px] h-8 sm:h-10"
                            } cursor-grab active:cursor-grabbing focus:outline-none ${
                              isFollowingFinger
                                ? "transition-none scale-105"
                                : "transition-transform duration-150 ease-out"
                            }`}
                            aria-label={`خرزة ${beadNum} - ${getPlaceName(powerOfTen)}`}
                          >
                            <Bead3DSurface
                              valueLabel="1"
                              active={isActive}
                              kind="lower"
                              compact={isCompact}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sculpted 3D Clay Rod Value Counter */}
                  <div
                    className={`${
                      isCompact ? "mt-2 py-1 px-3 text-sm" : "mt-4 py-1.5 px-3.5 text-sm sm:text-base"
                    } rounded-2xl font-mono font-black shadow-clay-sm border transition-colors ${
                      rodVal > 0
                        ? "bg-gradient-to-b from-[#8B6EFF] to-[#6344F5] text-white border-[#A892FF]/50"
                        : "bg-white dark:bg-[#242146] text-[#554D85] dark:text-[#D5D0F2] border-[#E4DFF9] dark:border-[#3A3570]"
                    }`}
                  >
                    {rodVal}
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
