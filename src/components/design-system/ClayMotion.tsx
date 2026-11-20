"use client";

import React from "react";
import { MotionConfig, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function ClayMotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

export function ClayPageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="flex-1"
    >
      {children}
    </motion.div>
  );
}

interface ClayProgressBarProps {
  value: number;
  max?: number;
  tone?: "purple" | "mint" | "amber";
  className?: string;
}

export function ClayProgressBar({
  value,
  max = 100,
  tone = "purple",
  className = "",
}: ClayProgressBarProps) {
  const pct = Math.max(0, Math.min(100, Math.round((value / Math.max(1, max)) * 100)));

  const fillClass =
    tone === "mint"
      ? "from-[#5EEAD4] to-[#2CB5A3]"
      : tone === "amber"
      ? "from-[#FDE047] to-[#F59E0B]"
      : "from-[#9F85FF] to-[#6344F5]";

  return (
    <div
      className={`h-2.5 w-full rounded-full bg-[#EAE6FD] dark:bg-[#2A2652] overflow-hidden shadow-inner ${className}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        className={`h-full rounded-full bg-gradient-to-l ${fillClass} shadow-[inset_0_1px_2px_rgba(255,255,255,0.5)]`}
      />
    </div>
  );
}

export type ClayActionTheme =
  | "purple"
  | "orange"
  | "violet"
  | "gold"
  | "emerald"
  | "sky"
  | "indigo"
  | "rose"
  | "teal"
  | "mint";

const ACTION_CIRCLE_THEMES: Record<ClayActionTheme, string> = {
  purple:
    "bg-gradient-to-b from-[#8B6EFF] to-[#6344F5] shadow-[0_8px_18px_-5px_rgba(99,68,245,0.5),inset_0_2px_2px_rgba(255,255,255,0.45),inset_0_-2px_0_rgba(48,25,140,0.3)]",
  orange:
    "bg-gradient-to-b from-[#FFA94D] to-[#EA6D15] shadow-[0_8px_18px_-5px_rgba(234,109,21,0.48),inset_0_2px_2px_rgba(255,255,255,0.5),inset_0_-2px_0_rgba(148,58,8,0.28)]",
  violet:
    "bg-gradient-to-b from-[#C084FC] to-[#8B5CF6] shadow-[0_8px_18px_-5px_rgba(139,92,246,0.48),inset_0_2px_2px_rgba(255,255,255,0.48),inset_0_-2px_0_rgba(76,29,149,0.28)]",
  gold:
    "bg-gradient-to-b from-[#FCD34D] to-[#D97706] shadow-[0_8px_18px_-5px_rgba(217,119,6,0.48),inset_0_2px_2px_rgba(255,255,255,0.55),inset_0_-2px_0_rgba(120,53,15,0.28)]",
  emerald:
    "bg-gradient-to-b from-[#34D399] to-[#059669] shadow-[0_8px_18px_-5px_rgba(5,150,105,0.48),inset_0_2px_2px_rgba(255,255,255,0.5),inset_0_-2px_0_rgba(6,78,59,0.28)]",
  sky:
    "bg-gradient-to-b from-[#60A5FA] to-[#2563EB] shadow-[0_8px_18px_-5px_rgba(37,99,235,0.48),inset_0_2px_2px_rgba(255,255,255,0.5),inset_0_-2px_0_rgba(30,58,138,0.28)]",
  indigo:
    "bg-gradient-to-b from-[#818CF8] to-[#4F46E5] shadow-[0_8px_18px_-5px_rgba(79,70,229,0.48),inset_0_2px_2px_rgba(255,255,255,0.5),inset_0_-2px_0_rgba(49,46,129,0.3)]",
  rose:
    "bg-gradient-to-b from-[#FB7185] to-[#E11D48] shadow-[0_8px_18px_-5px_rgba(225,29,72,0.48),inset_0_2px_2px_rgba(255,255,255,0.5),inset_0_-2px_0_rgba(136,19,55,0.28)]",
  teal:
    "bg-gradient-to-b from-[#22D3EE] to-[#0891B2] shadow-[0_8px_18px_-5px_rgba(8,145,178,0.48),inset_0_2px_2px_rgba(255,255,255,0.5),inset_0_-2px_0_rgba(22,78,99,0.28)]",
  mint:
    "bg-gradient-to-b from-[#4EE1CC] to-[#1FA896] shadow-[0_8px_18px_-5px_rgba(31,168,150,0.48),inset_0_2px_2px_rgba(255,255,255,0.52),inset_0_-2px_0_rgba(15,118,110,0.28)]",
};

interface ClayActionCircleProps {
  variant?: "arrow" | "play";
  size?: "sm" | "md";
  theme?: ClayActionTheme;
  className?: string;
}

export function ClayActionCircle({
  variant = "arrow",
  size = "md",
  theme = "purple",
  className = "",
}: ClayActionCircleProps) {
  const { language } = useApp();
  const isEn = language === "en";
  const ArrowIcon = isEn ? ArrowRight : ArrowLeft;
  const dims = size === "sm" ? "w-9 h-9" : "w-11 h-11";

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${dims} rounded-full text-white ${ACTION_CIRCLE_THEMES[theme]} transition-transform duration-200 group-hover:scale-110 group-active:scale-95 ${className}`}
      aria-hidden="true"
    >
      {variant === "play" ? (
        <Play className="w-4 h-4 fill-current ltr:ml-0.5 rtl:mr-0.5" />
      ) : (
        <ArrowIcon className="w-4 h-4 stroke-[2.6]" />
      )}
    </span>
  );
}
