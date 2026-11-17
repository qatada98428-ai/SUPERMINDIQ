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
    <Link href="/" className="inline-flex items-center gap-2 sm:gap-3 group focus:outline-none min-w-0">
      <div
        className={`relative shrink-0 flex items-center justify-center rounded-2xl overflow-hidden bg-white border-2 border-amber-400/80 transition-all duration-300 group-hover:scale-105 shadow-md ${
          isLarge
            ? "w-14 h-14 sm:w-16 sm:h-16 shadow-amber-500/25"
            : isSmall
            ? "w-9 h-9 sm:w-10 sm:h-10"
            : "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 shadow-amber-500/20"
        }`}
      >
        {/* Official SUPER MIND Program Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo.jpg"
          alt="شعار برنامج العقل الخارق SUPER MIND"
          className="w-full h-full object-contain p-0.5"
        />
      </div>

      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
          <span
            className={`font-black tracking-tight truncate ${
              inverted ? "text-white" : "text-slate-900 dark:text-white"
            } ${isLarge ? "text-xl sm:text-2xl" : isSmall ? "text-sm sm:text-base" : "text-sm sm:text-lg md:text-xl"}`}
          >
            العقل الخارق
          </span>
          <span className="hidden sm:inline-block shrink-0 text-[10px] sm:text-xs font-bold tracking-widest px-1.5 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
            SUPER MIND
          </span>
        </div>
        {!isSmall && (
          <span
            className={`hidden sm:block text-[11px] leading-tight font-medium truncate ${
              inverted ? "text-slate-300" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            منصة برنامج العقل الخارق
          </span>
        )}
      </div>
    </Link>
  );
}
