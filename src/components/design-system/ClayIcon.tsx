"use client";

import React, { useId } from "react";

export type ClayIconName =
  | "math123"
  | "soroban"
  | "flash"
  | "plusMinus"
  | "shapes"
  | "brain"
  | "trophy"
  | "podium"
  | "star"
  | "flame"
  | "book"
  | "crown"
  | "heart"
  | "users"
  | "graduation"
  | "rocket"
  | "gift"
  | "target"
  | "shield"
  | "game"
  | "footprint"
  | "compass"
  | "sparkles"
  | "chat"
  | "school"
  | "medal"
  | "lock"
  | "user3d"
  | "search"
  | "chart"
  | "rubiks"
  | "chess"
  | "puzzle"
  | "code"
  | "sudoku"
  | "ai";

export type ClayBadgeTone =
  | "lavender"
  | "mint"
  | "peach"
  | "pink"
  | "sky"
  | "gold"
  | "purple"
  | "emerald"
  | "indigo"
  | "teal"
  | "none";

interface ClayIconProps {
  name: ClayIconName;
  tone?: ClayBadgeTone;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "squircle" | "circle";
  className?: string;
}

const TONE_CLASSES: Record<ClayBadgeTone, string> = {
  lavender:
    "bg-gradient-to-br from-[#F4F0FF] to-[#DDD2FF] dark:from-[#2F2860] dark:to-[#201B46] border border-white/80 dark:border-[#493E8E]/60 shadow-[0_10px_18px_-6px_rgba(99,68,245,0.26),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-3px_5px_rgba(166,152,240,0.35)]",
  mint: "bg-gradient-to-br from-[#E9FCF8] to-[#B7EFE5] dark:from-[#16413E] dark:to-[#0F2E2B] border border-white/80 dark:border-[#246660]/60 shadow-[0_10px_18px_-6px_rgba(44,181,163,0.28),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-3px_5px_rgba(88,214,196,0.32)]",
  peach:
    "bg-gradient-to-br from-[#FFF7E8] to-[#FFDCAC] dark:from-[#472D14] dark:to-[#321F0D] border border-white/85 dark:border-[#6F4821]/60 shadow-[0_10px_18px_-6px_rgba(245,158,11,0.28),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-3px_5px_rgba(245,178,86,0.32)]",
  pink: "bg-gradient-to-br from-[#FFF1F6] to-[#FFD0E0] dark:from-[#4A1B33] dark:to-[#331123] border border-white/85 dark:border-[#782C53]/60 shadow-[0_10px_18px_-6px_rgba(244,63,94,0.26),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-3px_5px_rgba(244,142,174,0.32)]",
  sky: "bg-gradient-to-br from-[#EEF7FF] to-[#C8E4FF] dark:from-[#163458] dark:to-[#0F243F] border border-white/85 dark:border-[#25558D]/60 shadow-[0_10px_18px_-6px_rgba(59,130,246,0.26),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-3px_5px_rgba(120,180,245,0.32)]",
  gold: "bg-gradient-to-br from-[#FFFADF] to-[#FFE285] dark:from-[#4B3710] dark:to-[#35260B] border border-white/90 dark:border-[#7A591C]/60 shadow-[0_10px_18px_-6px_rgba(234,179,8,0.3),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-3px_5px_rgba(234,179,8,0.34)]",
  emerald:
    "bg-gradient-to-br from-[#EAFCF1] to-[#B7F2D1] dark:from-[#13422B] dark:to-[#0C2D1D] border border-white/85 dark:border-[#206B47]/60 shadow-[0_10px_18px_-6px_rgba(16,185,129,0.28),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-3px_5px_rgba(52,211,153,0.32)]",
  indigo:
    "bg-gradient-to-br from-[#EEF2FF] to-[#C9D5FF] dark:from-[#222B5C] dark:to-[#171E42] border border-white/85 dark:border-[#394794]/60 shadow-[0_10px_18px_-6px_rgba(79,70,229,0.28),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-3px_5px_rgba(129,140,248,0.32)]",
  teal: "bg-gradient-to-br from-[#EBFBFD] to-[#BAEAF4] dark:from-[#123D48] dark:to-[#0C2A32] border border-white/85 dark:border-[#1E6273]/60 shadow-[0_10px_18px_-6px_rgba(6,182,212,0.26),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-3px_5px_rgba(34,211,238,0.32)]",
  purple:
    "bg-gradient-to-b from-[#8B6EFF] to-[#6344F5] shadow-[0_10px_20px_-6px_rgba(99,68,245,0.45),inset_0_2px_3px_rgba(255,255,255,0.5),inset_0_-3px_0_rgba(48,25,140,0.3)]",
  none: "",
};

const SIZE_CLASSES: Record<"xs" | "sm" | "md" | "lg" | "xl", { box: string; svg: string }> = {
  xs: { box: "w-8 h-8", svg: "w-5 h-5" },
  sm: { box: "w-10 h-10", svg: "w-6 h-6" },
  md: { box: "w-12 h-12", svg: "w-8 h-8" },
  lg: { box: "w-14 h-14", svg: "w-9 h-9" },
  xl: { box: "w-16 h-16", svg: "w-11 h-11" },
};

export default function ClayIcon({
  name,
  tone = "lavender",
  size = "md",
  shape = "squircle",
  className = "",
}: ClayIconProps) {
  const uid = useId().replace(/:/g, "");
  const sz = SIZE_CLASSES[size];
  const radiusClass = shape === "circle" ? "rounded-full" : "rounded-[18px]";

  const renderSvg = () => {
    switch (name) {
      case "math123":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <defs>
              <linearGradient id={`${uid}-n1`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FF8FB1" />
                <stop offset="100%" stopColor="#E11D64" />
              </linearGradient>
              <linearGradient id={`${uid}-n2`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFE066" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
              <linearGradient id={`${uid}-n3`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6EE7B7" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
            {/* 1 */}
            <rect x="9" y="18" width="10" height="28" rx="5" fill={`url(#${uid}-n1)`} />
            <circle cx="14" cy="23" r="2.2" fill="#FFF" fillOpacity="0.45" />
            {/* 2 */}
            <path
              d="M23 23c0-4.4 3.6-7 8-7s8 2.6 8 7c0 3.2-2.2 5.4-5.4 8l-4.2 3.5H39c1.8 0 3.2 1.4 3.2 3.2S40.8 41 39 41H25c-1.8 0-3-1.3-3-3.2 0-1.2.6-2.4 1.6-3.3l7.3-6.1c1.4-1.2 2-2.1 2-3.4 0-1.5-1.1-2.5-2.6-2.5-1.4 0-2.5.9-2.8 2.2-.3 1.4-1.5 2.3-2.9 2.3-1.7 0-2.6-1.3-2.6-4z"
              fill={`url(#${uid}-n2)`}
            />
            {/* 3 */}
            <path
              d="M42 22.5c0-3.6 3-6.5 7.2-6.5 4 0 7 2.5 7 6 0 2.1-1.2 4-3 4.8 2.2.9 3.6 2.9 3.6 5.4 0 4-3.3 7-7.8 7-4.2 0-7.4-2.5-7.6-6-.1-1.7 1.2-3 2.9-3 1.5 0 2.6.9 3 2.2.3 1 1.2 1.6 2.4 1.6 1.5 0 2.6-1 2.6-2.5 0-1.5-1.1-2.4-2.8-2.4h-1c-1.5 0-2.6-1-2.6-2.4s1.1-2.4 2.6-2.4h.7c1.4 0 2.4-.8 2.4-2s-1-2-2.3-2c-1.2 0-2 .6-2.3 1.6-.4 1.2-1.5 2-2.8 2-1.5 0-2.2-1.2-2.2-2.4z"
              fill={`url(#${uid}-n3)`}
            />
          </svg>
        );

      case "soroban":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <defs>
              <linearGradient id={`${uid}-frame`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#9A6BFF" />
                <stop offset="100%" stopColor="#5B3AE8" />
              </linearGradient>
              <linearGradient id={`${uid}-bead`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>
              <linearGradient id={`${uid}-beadTop`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF7EB3" />
                <stop offset="100%" stopColor="#E11D48" />
              </linearGradient>
            </defs>
            <rect x="8" y="11" width="48" height="42" rx="10" fill={`url(#${uid}-frame)`} />
            <rect x="13" y="16" width="38" height="32" rx="6" fill="#FAF8FF" />
            <rect x="13" y="25" width="38" height="3.5" rx="1.5" fill="#7C5CFC" />
            {[21, 32, 43].map((cx) => (
              <rect key={cx} x={cx - 1} y="16" width="2" height="32" fill="#D2CCF7" />
            ))}
            {/* Upper beads */}
            <rect x="17" y="17.5" width="8" height="5.5" rx="2.75" fill={`url(#${uid}-beadTop)`} />
            <rect x="28" y="19" width="8" height="5.5" rx="2.75" fill={`url(#${uid}-beadTop)`} />
            <rect x="39" y="17.5" width="8" height="5.5" rx="2.75" fill={`url(#${uid}-beadTop)`} />
            {/* Lower beads */}
            <rect x="17" y="31" width="8" height="5.5" rx="2.75" fill={`url(#${uid}-bead)`} />
            <rect x="17" y="38" width="8" height="5.5" rx="2.75" fill={`url(#${uid}-bead)`} />
            <rect x="28" y="33" width="8" height="5.5" rx="2.75" fill={`url(#${uid}-bead)`} />
            <rect x="39" y="31" width="8" height="5.5" rx="2.75" fill={`url(#${uid}-bead)`} />
            <rect x="39" y="39" width="8" height="5.5" rx="2.75" fill={`url(#${uid}-bead)`} />
          </svg>
        );

      case "plusMinus":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <defs>
              <linearGradient id={`${uid}-tl`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6EE7B7" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
              <linearGradient id={`${uid}-tr`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FCD34D" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
              <linearGradient id={`${uid}-bl`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#93C5FD" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
              <linearGradient id={`${uid}-br`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FDA4AF" />
                <stop offset="100%" stopColor="#F43F5E" />
              </linearGradient>
            </defs>
            <rect x="8" y="8" width="22" height="22" rx="7" fill={`url(#${uid}-tl)`} />
            <rect x="34" y="8" width="22" height="22" rx="7" fill={`url(#${uid}-tr)`} />
            <rect x="8" y="34" width="22" height="22" rx="7" fill={`url(#${uid}-bl)`} />
            <rect x="34" y="34" width="22" height="22" rx="7" fill={`url(#${uid}-br)`} />
            {/* + */}
            <path d="M19 14v10M14 19h10" stroke="#FFF" strokeWidth="3.2" strokeLinecap="round" />
            {/* - */}
            <path d="M40 19h10" stroke="#FFF" strokeWidth="3.2" strokeLinecap="round" />
            {/* x */}
            <path d="M15.5 41.5l7 7M22.5 41.5l-7 7" stroke="#FFF" strokeWidth="3" strokeLinecap="round" />
            {/* = */}
            <path d="M40 42.5h10M40 47.5h10" stroke="#FFF" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );

      case "flash":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <defs>
              <linearGradient id={`${uid}-bolt`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="55%" stopColor="#FACC15" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>
            </defs>
            <path
              d="M35.5 7L14 35.5h16.5L26 57l24-30H33.5L35.5 7z"
              fill={`url(#${uid}-bolt)`}
              stroke="#FFFBEB"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        );

      case "shapes":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <defs>
              <radialGradient id={`${uid}-cir`} cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#93C5FD" />
                <stop offset="100%" stopColor="#2563EB" />
              </radialGradient>
              <linearGradient id={`${uid}-tri`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F9A8D4" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
              <linearGradient id={`${uid}-sq`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FDBA74" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>
            </defs>
            <circle cx="21" cy="24" r="12" fill={`url(#${uid}-cir)`} />
            <path d="M44 10l12 21H32L44 10z" fill={`url(#${uid}-tri)`} strokeLinejoin="round" />
            <rect x="22" y="34" width="22" height="22" rx="6" fill={`url(#${uid}-sq)`} />
          </svg>
        );

      case "brain":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <defs>
              <linearGradient id={`${uid}-brL`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#C4B5FD" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>
              <linearGradient id={`${uid}-brR`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F9A8D4" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
            <path
              d="M31 14c-4.5 0-8 2.8-9.2 6.8C17 21.4 13 25.4 13 30.8c0 3 1.3 5.7 3.4 7.5-.3 1-.4 2-.4 3 0 5.5 4.5 9.7 10 9.7 2.2 0 4.2-.7 5-1.8V14z"
              fill={`url(#${uid}-brL)`}
            />
            <path
              d="M33 14c4.5 0 8 2.8 9.2 6.8C47 21.4 51 25.4 51 30.8c0 3-1.3 5.7-3.4 7.5.3 1 .4 2 .4 3 0 5.5-4.5 9.7-10 9.7-2.2 0-4.2-.7-5-1.8V14z"
              fill={`url(#${uid}-brR)`}
            />
            <circle cx="24" cy="27" r="2.2" fill="#FFF" fillOpacity="0.65" />
            <circle cx="40" cy="27" r="2.2" fill="#FFF" fillOpacity="0.65" />
          </svg>
        );

      case "trophy":
      case "medal":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <defs>
              <linearGradient id={`${uid}-cup`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="45%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
              <linearGradient id={`${uid}-base`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
            </defs>
            <path
              d="M18 14h-6c-1.7 0-3 1.3-3 3v5c0 5.5 4 10 9.5 10.7M46 14h6c1.7 0 3 1.3 3 3v5c0 5.5-4 10-9.5 10.7"
              stroke="#F59E0B"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <path
              d="M17 11h30v15c0 9.4-6.7 16-15 16s-15-6.6-15-16V11z"
              fill={`url(#${uid}-cup)`}
            />
            <rect x="28" y="40" width="8" height="10" rx="2" fill={`url(#${uid}-cup)`} />
            <rect x="20" y="48" width="24" height="7" rx="3.5" fill={`url(#${uid}-base)`} />
            <path
              d="M32 18l2.2 4.4 4.8.7-3.5 3.4.8 4.8-4.3-2.3-4.3 2.3.8-4.8-3.5-3.4 4.8-.7L32 18z"
              fill="#FFFBEB"
            />
          </svg>
        );

      case "podium":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <defs>
              <linearGradient id={`${uid}-podium-gold`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="60%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#CA8A04" />
              </linearGradient>
              <linearGradient id={`${uid}-podium-silver`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E2E8F0" />
                <stop offset="70%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#64748B" />
              </linearGradient>
              <linearGradient id={`${uid}-podium-bronze`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FDBA74" />
                <stop offset="70%" stopColor="#EA580C" />
                <stop offset="100%" stopColor="#9A3412" />
              </linearGradient>
              <linearGradient id={`${uid}-crown`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
            {/* Center #1 Podium */}
            <rect x="23" y="24" width="18" height="28" rx="4" fill={`url(#${uid}-podium-gold)`} />
            <rect x="25" y="26" width="14" height="3" rx="1.5" fill="#FFF" fillOpacity="0.6" />
            <text x="32" y="42" textAnchor="middle" fill="#78350F" fontSize="11" fontWeight="900" fontFamily="sans-serif">1</text>
            {/* Left #2 Podium */}
            <rect x="6" y="32" width="17" height="20" rx="3.5" fill={`url(#${uid}-podium-silver)`} />
            <rect x="8" y="34" width="13" height="2.5" rx="1.2" fill="#FFF" fillOpacity="0.55" />
            <text x="14.5" y="46" textAnchor="middle" fill="#1E293B" fontSize="10" fontWeight="900" fontFamily="sans-serif">2</text>
            {/* Right #3 Podium */}
            <rect x="41" y="38" width="17" height="14" rx="3.5" fill={`url(#${uid}-podium-bronze)`} />
            <rect x="43" y="40" width="13" height="2.5" rx="1.2" fill="#FFF" fillOpacity="0.55" />
            <text x="49.5" y="49" textAnchor="middle" fill="#431407" fontSize="9.5" fontWeight="900" fontFamily="sans-serif">3</text>
            {/* Crown on top of center podium */}
            <path
              d="M26 18l3 3 3-5 3 5 3-3v4H26v-4z"
              fill={`url(#${uid}-crown)`}
              stroke="#D97706"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <circle cx="21" cy="14" r="1.5" fill="#FBBF24" />
            <circle cx="43" cy="15" r="1.5" fill="#FBBF24" />
          </svg>
        );

      case "star":
      case "sparkles":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <defs>
              <radialGradient id={`${uid}-st`} cx="35%" cy="30%" r="75%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="55%" stopColor="#FACC15" />
                <stop offset="100%" stopColor="#F59E0B" />
              </radialGradient>
            </defs>
            <path
              d="M32 8l6.8 14.2 15.6 2.1-11.4 10.9 2.8 15.5L32 43.2l-13.8 7.5 2.8-15.5L9.6 24.3l15.6-2.1L32 8z"
              fill={`url(#${uid}-st)`}
              stroke="#FDE047"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <circle cx="27" cy="29" r="2" fill="#78350F" />
            <circle cx="37" cy="29" r="2" fill="#78350F" />
            <path d="M29 34c1.6 1.6 4.4 1.6 6 0" stroke="#78350F" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        );

      case "flame":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <defs>
              <linearGradient id={`${uid}-fl`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="50%" stopColor="#FB923C" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>
            </defs>
            <path
              d="M34 8c2 8.5-4.5 13-4.5 13s4.5 1 6.5 5.5c2.2-2.6 3.5-6.2 3.5-6.2C46.5 25 50 32.2 50 39c0 9.9-8.1 17-18 17s-18-7.1-18-17c0-9.2 6.8-17.8 20-31z"
              fill={`url(#${uid}-fl)`}
            />
            <path
              d="M32 34c4 4.2 6.5 8.1 6.5 12 0 4-2.9 7-6.5 7s-6.5-3-6.5-7c0-3.9 2.5-7.8 6.5-12z"
              fill="#FEF08A"
            />
          </svg>
        );

      case "book":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <defs>
              <linearGradient id={`${uid}-bk`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#A78BFA" />
                <stop offset="100%" stopColor="#6D28D9" />
              </linearGradient>
            </defs>
            <rect x="11" y="13" width="42" height="38" rx="9" fill={`url(#${uid}-bk)`} />
            <path
              d="M16 17h14v30H16a2 2 0 0 1-2-2V19a2 2 0 0 1 2-2zM34 17h14a2 2 0 0 1 2 2v26a2 2 0 0 1-2 2H34V17z"
              fill="#FFFDF8"
            />
            <path d="M19 24h7M19 30h7M38 24h7M38 30h7" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );

      case "crown":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <defs>
              <linearGradient id={`${uid}-cr`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
            <path
              d="M11 45l-3-22 14 10 10-16 10 16 14-10-3 22H11z"
              fill={`url(#${uid}-cr)`}
              stroke="#FBBF24"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <rect x="11" y="45" width="42" height="7" rx="3.5" fill="#EA580C" />
            <circle cx="32" cy="14" r="3.5" fill="#EC4899" />
            <circle cx="8" cy="21" r="3" fill="#6366F1" />
            <circle cx="56" cy="21" r="3" fill="#10B981" />
          </svg>
        );

      case "heart":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <defs>
              <radialGradient id={`${uid}-ht`} cx="35%" cy="30%" r="75%">
                <stop offset="0%" stopColor="#FDA4AF" />
                <stop offset="55%" stopColor="#FB7185" />
                <stop offset="100%" stopColor="#E11D48" />
              </radialGradient>
            </defs>
            <path
              d="M32 52S11 38.6 11 23.8C11 16.7 16.6 11 23.5 11c4 0 7.5 1.9 8.5 4.8C33 12.9 36.5 11 40.5 11 47.4 11 53 16.7 53 23.8 53 38.6 32 52 32 52z"
              fill={`url(#${uid}-ht)`}
            />
            <ellipse cx="22" cy="21" rx="4" ry="2.2" transform="rotate(-25 22 21)" fill="#FFF" fillOpacity="0.45" />
          </svg>
        );

      case "graduation":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <defs>
              <linearGradient id={`${uid}-grCap`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#818CF8" />
                <stop offset="45%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#4338CA" />
              </linearGradient>
              <linearGradient id={`${uid}-grSkull`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4338CA" />
                <stop offset="100%" stopColor="#312E81" />
              </linearGradient>
              <linearGradient id={`${uid}-grGold`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
              <linearGradient id={`${uid}-scroll`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="100%" stopColor="#FEF3C7" />
              </linearGradient>
            </defs>
            {/* Diploma Scroll under Cap */}
            <rect x="14" y="44" width="36" height="7.5" rx="3.75" fill={`url(#${uid}-scroll)`} stroke="#FDE68A" strokeWidth="1" />
            <rect x="29.5" y="43" width="5" height="9.5" rx="2" fill="#EF4444" />

            {/* Cap Skull Underbody */}
            <path
              d="M19 28v9c0 4.8 5.8 8.8 13 8.8s13-4 13-8.8v-9l-13 6L19 28z"
              fill={`url(#${uid}-grSkull)`}
            />

            {/* Cap Diamond Top (Mortarboard) */}
            <path
              d="M32 9L9 21.5l23 12 23-12L32 9z"
              fill={`url(#${uid}-grCap)`}
              stroke="#A5B4FC"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* 3D Highlight Curve */}
            <path
              d="M32 10.5L11 21.5l21 11"
              stroke="#FFF"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeOpacity="0.45"
            />

            {/* Golden Center Button */}
            <ellipse cx="32" cy="21.5" rx="3.2" ry="2" fill={`url(#${uid}-grGold)`} />

            {/* Golden Tassel */}
            <path
              d="M32 21.5c7.5 0 16.5 3 17.5 9v11"
              stroke={`url(#${uid}-grGold)`}
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <ellipse cx="49.5" cy="41.5" rx="2.5" ry="3.5" fill={`url(#${uid}-grGold)`} />
            <path d="M48 45h3" stroke="#B45309" strokeWidth="1" strokeLinecap="round" />
          </svg>
        );

      case "users":
      case "user3d":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <defs>
              <radialGradient id={`${uid}-hd`} cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#A5B4FC" />
                <stop offset="100%" stopColor="#4F46E5" />
              </radialGradient>
            </defs>
            <circle cx="32" cy="22" r="11" fill={`url(#${uid}-hd)`} />
            <path d="M14 50c0-8.8 8.1-15 18-15s18 6.2 18 15a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3z" fill={`url(#${uid}-hd)`} />
          </svg>
        );

      case "rocket":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <defs>
              <linearGradient id={`${uid}-rk`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#A78BFA" />
                <stop offset="100%" stopColor="#6344F5" />
              </linearGradient>
            </defs>
            <path d="M32 9c10 7 14 19 14 31H18c0-12 4-24 14-31z" fill={`url(#${uid}-rk)`} />
            <circle cx="32" cy="27" r="5.5" fill="#E0F2FE" stroke="#FFF" strokeWidth="2" />
            <path d="M18 33l-7 8h9v-8h-2zM46 33l7 8h-9v-8h2z" fill="#FB7185" />
            <path d="M27 40h10l-5 12-5-12z" fill="#FBBF24" />
          </svg>
        );

      case "gift":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <defs>
              <linearGradient id={`${uid}-gf`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F9A8D4" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
            <rect x="13" y="25" width="38" height="28" rx="7" fill={`url(#${uid}-gf)`} />
            <rect x="10" y="19" width="44" height="9" rx="4.5" fill="#F472B6" />
            <rect x="29" y="19" width="6" height="34" fill="#8B5CF6" />
            <path d="M32 19c-4-7-12-7-12-2s8 4 12 2zm0 0c4-7 12-7 12-2s-8 4-12 2z" fill="#A78BFA" />
          </svg>
        );

      case "target":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <circle cx="32" cy="32" r="22" fill="#FB7185" />
            <circle cx="32" cy="32" r="15" fill="#FFF" />
            <circle cx="32" cy="32" r="8" fill="#6344F5" />
            <circle cx="32" cy="32" r="3.5" fill="#FACC15" />
          </svg>
        );

      case "shield":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <defs>
              <linearGradient id={`${uid}-sh`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6EE7B7" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
            <path
              d="M32 9L13 17v14c0 12.6 8 22.8 19 25 11-2.2 19-12.4 19-25V17L32 9z"
              fill={`url(#${uid}-sh)`}
            />
            <path d="M24 32l5.5 5.5 11-11" stroke="#FFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case "game":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <defs>
              <linearGradient id={`${uid}-gm`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#4F46E5" />
              </linearGradient>
            </defs>
            <rect x="9" y="18" width="46" height="28" rx="14" fill={`url(#${uid}-gm)`} />
            <path d="M22 26v12M16 32h12" stroke="#FFF" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="43" cy="28" r="2.8" fill="#FDE047" />
            <circle cx="48" cy="34" r="2.8" fill="#4ADE80" />
            <circle cx="39" cy="35" r="2.8" fill="#FB7185" />
          </svg>
        );

      case "footprint":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <ellipse cx="32" cy="37" rx="10" ry="14" fill="#7C5CFC" />
            <circle cx="21" cy="20" r="3.2" fill="#8B6EFF" />
            <circle cx="27" cy="15.5" r="3.5" fill="#8B6EFF" />
            <circle cx="34" cy="14.5" r="3.5" fill="#8B6EFF" />
            <circle cx="41" cy="17.5" r="3" fill="#8B6EFF" />
          </svg>
        );

      case "chat":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <defs>
              <linearGradient id={`${uid}-ch`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6EE7B7" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
            <path
              d="M32 11c12.7 0 22 8.2 22 18.5S44.7 48 32 48c-3 0-5.8-.5-8.4-1.4L14 52l2.6-8.4C12.5 40.1 10 35.1 10 29.5 10 19.2 19.3 11 32 11z"
              fill={`url(#${uid}-ch)`}
            />
            <circle cx="24" cy="29.5" r="2.8" fill="#FFF" />
            <circle cx="32" cy="29.5" r="2.8" fill="#FFF" />
            <circle cx="40" cy="29.5" r="2.8" fill="#FFF" />
          </svg>
        );

      case "school":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <path d="M10 28l22-14 22 14v24H10V28z" fill="#6344F5" />
            <path d="M32 14l22 14H10l22-14z" fill="#F59E0B" />
            <rect x="26" y="37" width="12" height="15" rx="3" fill="#FEF08A" />
            <circle cx="32" cy="26" r="4" fill="#FFF" />
          </svg>
        );

      case "compass":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <circle cx="32" cy="32" r="22" fill="#60A5FA" />
            <circle cx="32" cy="32" r="16" fill="#F8FAFC" />
            <path d="M39 25l-4 10-10 4 4-10 10-4z" fill="#F43F5E" />
            <circle cx="32" cy="32" r="2.5" fill="#1E1B3A" />
          </svg>
        );

      case "lock":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <path d="M21 26v-6a11 11 0 0 1 22 0v6" stroke="#8B6EFF" strokeWidth="5.5" strokeLinecap="round" />
            <rect x="14" y="25" width="36" height="28" rx="8" fill="#6344F5" />
            <circle cx="32" cy="37" r="4" fill="#FDE047" />
            <rect x="30" y="39" width="4" height="7" rx="2" fill="#FDE047" />
          </svg>
        );

      case "search":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <circle cx="28" cy="28" r="15" stroke="#FFF" strokeWidth="5.5" fill="#A78BFA" fillOpacity="0.3" />
            <path d="M39 39l12 12" stroke="#FFF" strokeWidth="6" strokeLinecap="round" />
          </svg>
        );

      case "rubiks":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <defs>
              <linearGradient id={`${uid}-rbY`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="100%" stopColor="#EAB308" />
              </linearGradient>
              <linearGradient id={`${uid}-rbG`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4ADE80" />
                <stop offset="100%" stopColor="#15803D" />
              </linearGradient>
              <linearGradient id={`${uid}-rbR`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F87171" />
                <stop offset="100%" stopColor="#B91C1C" />
              </linearGradient>
              <linearGradient id={`${uid}-rbB`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
              <linearGradient id={`${uid}-rbO`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FB923C" />
                <stop offset="100%" stopColor="#C2410C" />
              </linearGradient>
            </defs>
            {/* 3D Isometric Base Cube Body in Carbon Black */}
            <path d="M32 7.5L53.5 19.8V44.2L32 56.5L10.5 44.2V19.8L32 7.5Z" fill="#18142A" stroke="#251E45" strokeWidth="1.5" />

            {/* TOP FACE (9 Yellow/Gold Tiles) */}
            <path d="M32 8.5L25.8 12L32 15.5L38.2 12Z" fill={`url(#${uid}-rbY)`} />
            <path d="M39 12.5L32.8 16L39 19.5L45.2 16Z" fill={`url(#${uid}-rbY)`} />
            <path d="M46 16.5L39.8 20L46 23.5L52.2 20Z" fill={`url(#${uid}-rbY)`} />
            <path d="M25 12.5L18.8 16L25 19.5L31.2 16Z" fill={`url(#${uid}-rbY)`} />
            <path d="M32 16.5L25.8 20L32 23.5L38.2 20Z" fill={`url(#${uid}-rbY)`} />
            <path d="M39 20.5L32.8 24L39 27.5L45.2 24Z" fill={`url(#${uid}-rbY)`} />
            <path d="M18 16.5L11.8 20L18 23.5L24.2 20Z" fill={`url(#${uid}-rbY)`} />
            <path d="M25 20.5L18.8 24L25 27.5L31.2 24Z" fill={`url(#${uid}-rbY)`} />
            <path d="M32 24.5L25.8 28L32 31.5L38.2 28Z" fill={`url(#${uid}-rbY)`} />

            {/* FRONT-LEFT FACE (9 Green Tiles) */}
            <path d="M31.6 32.2L25.4 28.7L25.4 35.8L31.6 39.3Z" fill={`url(#${uid}-rbG)`} />
            <path d="M31.6 40.2L25.4 36.7L25.4 43.8L31.6 47.3Z" fill={`url(#${uid}-rbG)`} />
            <path d="M31.6 48.2L25.4 44.7L25.4 51.8L31.6 55.3Z" fill={`url(#${uid}-rbG)`} />
            <path d="M24.6 28.2L18.4 24.7L18.4 31.8L24.6 35.3Z" fill={`url(#${uid}-rbG)`} />
            <path d="M24.6 36.2L18.4 32.7L18.4 39.8L24.6 43.3Z" fill={`url(#${uid}-rbG)`} />
            <path d="M24.6 44.2L18.4 40.7L18.4 47.8L24.6 51.3Z" fill={`url(#${uid}-rbG)`} />
            <path d="M17.6 24.2L11.4 20.7L11.4 27.8L17.6 31.3Z" fill={`url(#${uid}-rbG)`} />
            <path d="M17.6 32.2L11.4 28.7L11.4 35.8L17.6 39.3Z" fill={`url(#${uid}-rbG)`} />
            <path d="M17.6 40.2L11.4 36.7L11.4 43.8L17.6 47.3Z" fill={`url(#${uid}-rbG)`} />

            {/* FRONT-RIGHT FACE (9 Red Tiles) */}
            <path d="M32.4 32.2L38.6 28.7L38.6 35.8L32.4 39.3Z" fill={`url(#${uid}-rbR)`} />
            <path d="M32.4 40.2L38.6 36.7L38.6 43.8L32.4 47.3Z" fill={`url(#${uid}-rbR)`} />
            <path d="M32.4 48.2L38.6 44.7L38.6 51.8L32.4 55.3Z" fill={`url(#${uid}-rbR)`} />
            <path d="M39.4 28.2L45.6 24.7L45.6 31.8L39.4 35.3Z" fill={`url(#${uid}-rbR)`} />
            <path d="M39.4 36.2L45.6 32.7L45.6 39.8L39.4 43.3Z" fill={`url(#${uid}-rbR)`} />
            <path d="M39.4 44.2L45.6 40.7L45.6 47.8L39.4 51.3Z" fill={`url(#${uid}-rbR)`} />
            <path d="M46.4 24.2L52.6 20.7L52.6 27.8L46.4 31.3Z" fill={`url(#${uid}-rbR)`} />
            <path d="M46.4 32.2L52.6 28.7L52.6 35.8L46.4 39.3Z" fill={`url(#${uid}-rbR)`} />
            <path d="M46.4 40.2L52.6 36.7L52.6 43.8L46.4 47.3Z" fill={`url(#${uid}-rbR)`} />

            {/* Subtle 3D Glass / Clay Specular Highlight */}
            <path d="M32 9L51 20L32 30.5L13 20L32 9Z" fill="#FFF" fillOpacity="0.12" />
          </svg>
        );

      case "chess":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <defs>
              <linearGradient id={`${uid}-chP`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#C4B5FD" />
                <stop offset="40%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#5B21B6" />
              </linearGradient>
              <linearGradient id={`${uid}-chG`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
            {/* Chess Knight Profile in 3D Clay */}
            <path
              d="M19 52h26a3 3 0 0 0 3-3c0-2-1.5-3.5-3.5-4l-3.5-1c3-4 6-10 6-16 0-3-1-5.5-2.5-7.5l1.5-5.5-5.5 2C39 16 36 15 32 15c-4 0-8 2-11 5l-6 4 2 6 5-1c-2 3-3 7-3 11v8a3 3 0 0 0 3 3z"
              fill={`url(#${uid}-chP)`}
              stroke="#DDD6FE"
              strokeWidth="1.5"
            />
            {/* Mane & Ear Details */}
            <path d="M38 18c3 2 5 6 5 10" stroke="#DDD6FE" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M35 23c2 2 3.5 5 3.5 8" stroke="#DDD6FE" strokeWidth="2" strokeLinecap="round" />
            {/* Golden Eye */}
            <circle cx="26" cy="24" r="2.5" fill={`url(#${uid}-chG)`} />
            {/* Crown on Knight for Super Mind Academy */}
            <path d="M32 9l2.5 3 2.5-3.5 2.5 3.5 2.5-3v4H32V9z" fill={`url(#${uid}-chG)`} />
            {/* Pedestal Base */}
            <rect x="15" y="48" width="34" height="6" rx="3" fill="#4C1D95" stroke="#A78BFA" strokeWidth="1" />
          </svg>
        );

      case "puzzle":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <defs>
              <linearGradient id={`${uid}-pz1`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>
              <linearGradient id={`${uid}-pz2`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F472B6" />
                <stop offset="100%" stopColor="#DB2777" />
              </linearGradient>
            </defs>
            {/* Interlocking Puzzle Pieces */}
            <path
              d="M14 16a2 2 0 0 1 2-2h10c0 3 2.5 5 5.5 5s5.5-2 5.5-5H47a2 2 0 0 1 2 2v10c-3 0-5 2.5-5 5.5s2 5.5 5 5.5v10a2 2 0 0 1-2 2H37c0-3-2.5-5-5.5-5S26 45 26 48H16a2 2 0 0 1-2-2V36c3 0 5-2.5 5-5.5S17 25 14 25V16z"
              fill={`url(#${uid}-pz1)`}
              stroke="#BAE6FD"
              strokeWidth="1.5"
            />
            <circle cx="32.5" cy="31.5" r="3.5" fill="#FFF" fillOpacity="0.4" />
          </svg>
        );

      case "code":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <defs>
              <linearGradient id={`${uid}-cdScr`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1E1B4B" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>
              <linearGradient id={`${uid}-cdBr`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
            {/* Laptop Body in Clay */}
            <rect x="12" y="14" width="40" height="28" rx="5" fill="#312E81" stroke="#6366F1" strokeWidth="1.5" />
            <rect x="15" y="17" width="34" height="22" rx="3" fill={`url(#${uid}-cdScr)`} />
            {/* Code Brackets < / > */}
            <path d="M24 23l-4 5 4 5" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M40 23l4 5-4 5" stroke="#F472B6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M33 21l-3 14" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
            {/* Laptop Base */}
            <path d="M8 44h48c1.5 0 2.5 1 2 2.5l-2 3c-.5 1-1.5 1.5-2.5 1.5H16.5c-1 0-2-.5-2.5-1.5l-2-3C11.5 45 12.5 44 14 44z" fill="#4338CA" />
            <rect x="27" y="44" width="10" height="2.5" rx="1.2" fill="#818CF8" />
          </svg>
        );

      case "sudoku":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <defs>
              <linearGradient id={`${uid}-sdkBg`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#EEF2FF" />
              </linearGradient>
            </defs>
            {/* Sudoku Grid Card */}
            <rect x="11" y="11" width="42" height="42" rx="9" fill={`url(#${uid}-sdkBg)`} stroke="#818CF8" strokeWidth="2.5" />
            {/* Internal 3x3 Division lines */}
            <path d="M25 12v40M39 12v40M12 25h40M12 39h40" stroke="#C7D2FE" strokeWidth="1.5" strokeLinecap="round" />
            {/* Sample Colorful Digits */}
            <text x="18" y="22" textAnchor="middle" fill="#4F46E5" fontSize="9" fontWeight="900" fontFamily="sans-serif">5</text>
            <text x="32" y="22" textAnchor="middle" fill="#E11D48" fontSize="9" fontWeight="900" fontFamily="sans-serif">3</text>
            <text x="46" y="36" textAnchor="middle" fill="#059669" fontSize="9" fontWeight="900" fontFamily="sans-serif">7</text>
            <text x="18" y="50" textAnchor="middle" fill="#D97706" fontSize="9" fontWeight="900" fontFamily="sans-serif">9</text>
            <text x="32" y="50" textAnchor="middle" fill="#4F46E5" fontSize="9" fontWeight="900" fontFamily="sans-serif">1</text>
          </svg>
        );

      case "ai":
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <defs>
              <linearGradient id={`${uid}-aiCh`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#4F46E5" />
              </linearGradient>
              <radialGradient id={`${uid}-aiRad`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#67E8F9" />
                <stop offset="100%" stopColor="#06B6D4" />
              </radialGradient>
            </defs>
            <rect x="16" y="16" width="32" height="32" rx="8" fill={`url(#${uid}-aiCh)`} stroke="#A5B4FC" strokeWidth="1.5" />
            <circle cx="32" cy="32" r="8" fill={`url(#${uid}-aiRad)`} />
            {/* Pins */}
            <path d="M22 11v5M32 11v5M42 11v5M22 48v5M32 48v5M42 48v5M11 22h5M11 32h5M11 42h5M48 22h5M48 32h5M48 42h5" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="32" cy="32" r="3" fill="#FFF" />
          </svg>
        );

      case "chart":
      default:
        return (
          <svg viewBox="0 0 64 64" className={sz.svg} fill="none" aria-hidden="true">
            <rect x="12" y="32" width="10" height="20" rx="5" fill="#60A5FA" />
            <rect x="27" y="22" width="10" height="30" rx="5" fill="#7C5CFC" />
            <rect x="42" y="12" width="10" height="40" rx="5" fill="#34D399" />
          </svg>
        );
    }
  };

  if (tone === "none") {
    return (
      <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        {renderSvg()}
      </span>
    );
  }

  return (
    <span
      className={`relative overflow-hidden inline-flex items-center justify-center shrink-0 ${sz.box} ${radiusClass} ${TONE_CLASSES[tone]} transition-transform duration-300 ease-out ${className}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-[6%] inset-x-[14%] h-[28%] rounded-full bg-white/55 dark:bg-white/15 blur-[0.5px]"
      />
      <span className="relative z-10 inline-flex items-center justify-center drop-shadow-[0_3px_4px_rgba(30,27,58,0.16)]">
        {renderSvg()}
      </span>
    </span>
  );
}
