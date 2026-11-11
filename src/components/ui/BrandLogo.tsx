import React from "react";
import Link from "next/link";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  inverted?: boolean;
}

export default function BrandLogo({ size = "md", inverted = false }: BrandLogoProps) {
  const isLarge = size === "lg";
  const isSmall = size === "sm";

  return (
    <Link href="/" className="inline-flex items-center gap-3 group focus:outline-none">
      <div
        className={`relative flex items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-105 shadow-md ${
          isLarge
            ? "w-14 h-14 bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 shadow-brand-500/20"
            : isSmall
            ? "w-9 h-9 bg-gradient-to-br from-brand-600 to-indigo-800"
            : "w-11 h-11 bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 shadow-brand-500/25"
        }`}
      >
        {/* Stylized Soroban beads & lightning brain icon */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={isLarge ? "w-8 h-8" : isSmall ? "w-5 h-5" : "w-6 h-6"}
        >
          {/* Outer Soroban Frame */}
          <rect x="4" y="4" width="24" height="24" rx="4" stroke="#EEF2FF" strokeWidth="2" strokeOpacity="0.85" />
          {/* Reckoning Beam (Horizontal Divider) */}
          <line x1="4" y1="12" x2="28" y2="12" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
          {/* Rods */}
          <line x1="11" y1="5" x2="11" y2="27" stroke="#EEF2FF" strokeWidth="1.2" strokeOpacity="0.4" />
          <line x1="16" y1="5" x2="16" y2="27" stroke="#EEF2FF" strokeWidth="1.2" strokeOpacity="0.4" />
          <line x1="21" y1="5" x2="21" y2="27" stroke="#EEF2FF" strokeWidth="1.2" strokeOpacity="0.4" />
          {/* Upper Beads (Value 5) - Active / Inactive */}
          <ellipse cx="11" cy="9.5" rx="2.5" ry="1.8" fill="#F59E0B" />
          <ellipse cx="16" cy="7" rx="2.5" ry="1.8" fill="#F8FAFC" fillOpacity="0.8" />
          <ellipse cx="21" cy="9.5" rx="2.5" ry="1.8" fill="#F59E0B" />
          {/* Lower Beads (Value 1 each) */}
          <ellipse cx="11" cy="15" rx="2.5" ry="1.8" fill="#38BDF8" />
          <ellipse cx="16" cy="18" rx="2.5" ry="1.8" fill="#38BDF8" />
          <ellipse cx="21" cy="15" rx="2.5" ry="1.8" fill="#38BDF8" />
          <ellipse cx="21" cy="19" rx="2.5" ry="1.8" fill="#38BDF8" />
        </svg>

        {/* Glow point */}
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-pulse"></span>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black tracking-tight ${
              inverted ? "text-white" : "text-slate-900"
            } ${isLarge ? "text-2xl" : isSmall ? "text-base" : "text-lg md:text-xl"}`}
          >
            العقل الخارق
          </span>
          <span className="text-xs font-bold tracking-widest px-1.5 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200">
            SUPER MIND
          </span>
        </div>
        {!isSmall && (
          <span
            className={`text-[11px] leading-tight font-medium ${
              inverted ? "text-slate-300" : "text-slate-500"
            }`}
          >
            منصة برنامج العقل الخارق
          </span>
        )}
      </div>
    </Link>
  );
}
