import React from "react";
import Link from "next/link";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  inverted?: boolean;
  compactOnTablet?: boolean;
}

export default function BrandLogo({
  size = "md",
  inverted = false,
}: BrandLogoProps) {
  const isLarge = size === "lg";
  const isSmall = size === "sm";

  const textColorClass = inverted
    ? "text-white"
    : "text-[#2E2759] dark:text-[#F5F4FD]";

  return (
    <Link
      href="/"
      dir="rtl"
      className="inline-flex items-center gap-2 sm:gap-2.5 group focus:outline-none shrink-0"
      aria-label="SUPER MIND - منصة العقل الخارق"
    >
      {/* Official SM Superhero Logo on the right side */}
      <div
        className={`relative shrink-0 flex items-center justify-center overflow-hidden bg-white border-2 border-[#E6DFFF] dark:border-[#3A356B] shadow-clay-sm transition-transform duration-300 group-hover:scale-105 ${
          isLarge
            ? "w-12 h-12 sm:w-14 sm:h-14 rounded-[18px]"
            : isSmall
            ? "w-8 h-8 sm:w-9 sm:h-9 rounded-xl"
            : "w-9 h-9 sm:w-10 sm:h-10 xl:w-11 xl:h-11 rounded-[14px] sm:rounded-[16px]"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo.jpg"
          alt="شعار الطفل الخارق SM - SUPER MIND"
          className="w-full h-full object-contain p-0.5"
        />
      </div>

      {/* Unified two-line identity: same font family & color, English slightly larger/bolder */}
      <div
        className="flex flex-col items-start text-right shrink-0 leading-none"
        style={{
          fontFamily: "'Alexandria', 'IBM Plex Sans Arabic', system-ui, sans-serif",
        }}
      >
        <span
          className={`${textColorClass} font-black tracking-tight whitespace-nowrap ${
            isLarge
              ? "text-lg sm:text-2xl leading-tight"
              : isSmall
              ? "text-sm sm:text-base leading-tight"
              : "text-[15px] sm:text-base xl:text-[18px] leading-tight"
          }`}
        >
          SUPER MIND
        </span>
        <span
          className={`${textColorClass} font-semibold whitespace-nowrap ${
            isLarge
              ? "text-xs sm:text-sm mt-0.5 leading-tight"
              : isSmall
              ? "text-[10px] sm:text-[11px] mt-0.5 leading-tight"
              : "text-[11px] sm:text-xs xl:text-[13px] mt-0.5 leading-tight"
          }`}
        >
          منصة العقل الخارق
        </span>
      </div>
    </Link>
  );
}
