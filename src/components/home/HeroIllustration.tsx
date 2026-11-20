"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import ClayIcon from "@/components/design-system/ClayIcon";

export default function HeroIllustration() {
  const [clickedEquation, setClickedEquation] = useState(false);
  const { language, playFx } = useApp();
  const isEn = language === "en";

  return (
    <div className="relative w-full max-w-md mx-auto flex items-center justify-center px-3 pt-6 pb-8 sm:p-4 select-none">
      {/* Soft Pastel Clay Backdrop Halos */}
      <div className="absolute -inset-3 sm:-inset-6 rounded-[3.25rem] bg-gradient-to-br from-[#EBE6FF] via-[#F7F5FF] to-[#DFF7F3] dark:from-[#24204A] dark:via-[#1C1A3A] dark:to-[#183536] -rotate-3 pointer-events-none -z-10 shadow-clay-sm" />
      <div className="absolute top-6 right-4 w-56 h-56 rounded-full bg-brand-400/20 blur-3xl pointer-events-none -z-20" />
      <div className="absolute bottom-4 left-4 w-48 h-48 rounded-full bg-amber-400/20 blur-3xl pointer-events-none -z-20" />

      {/* Main Sculpted 3D Clay Card showcasing Coach & SUPER MIND Champions */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative group w-full"
      >
        <div className="clay-card p-3 sm:p-4 overflow-visible space-y-3">
          <div className="relative rounded-[24px] overflow-hidden bg-gradient-to-b from-[#1E3A8A] to-[#0F172A] aspect-square w-full">
            <Image
              src="/images/clay/hero-champions.jpg"
              alt="الأستاذ قتادة كريم مع أبطال برنامج العقل الخارق SUPER MIND"
              width={900}
              height={900}
              priority
              className="w-full h-full object-cover object-top transform transition-transform duration-700 group-hover:scale-103"
            />
          </div>

          {/* Crisp Clay Coach Ribbon Below Artwork + Non-Overlapping Quick Challenge Pill */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl bg-[#F7F5FE] dark:bg-[#242146] px-3.5 py-2.5 shadow-clay-sm border border-[#E7E3FA] dark:border-[#373369]">
            <div className="flex items-center gap-2.5 min-w-0">
              <ClayIcon name="trophy" tone="gold" size="sm" />
              <div className="min-w-0 text-start">
                <div className="text-xs font-black text-[#1E1B3A] dark:text-white truncate">
                  {isEn ? "SUPER MIND Champions" : "أبطال العقل الخارق"}
                </div>
                <div className="text-[11px] font-bold text-brand-600 dark:text-brand-300 truncate">
                  {isEn ? "Coach Qatadah Karim" : "إشراف أ. قتادة كريم"}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setClickedEquation(!clickedEquation);
                playFx("correct");
              }}
              className="clay-btn-purple px-3.5 py-1.5 !rounded-xl flex items-center gap-2 text-start cursor-pointer shrink-0"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping shrink-0" />
              <div>
                <span className="text-[9px] text-amber-200 font-bold block leading-tight">
                  {isEn ? "Quick Math:" : "الحساب السريع:"}
                </span>
                <span dir="ltr" className="text-xs font-black font-mono text-white">
                  34 + 58 ={" "}
                  <span className="text-amber-300">
                    {clickedEquation ? "92 ✔" : "92"}
                  </span>
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Floating Clay Pill 1: Top Right [- +] */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-3 right-1 sm:-top-4 sm:-right-3 z-20"
        >
          <div className="clay-pill px-3.5 py-2 text-brand-600 dark:text-brand-300 font-black text-base sm:text-xl font-mono">
            −+
          </div>
        </motion.div>

        {/* Floating Clay Pill 2: Center Left [÷] */}
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          className="absolute top-1/3 left-0 sm:-left-4 z-20"
        >
          <div className="clay-pill w-11 h-11 flex items-center justify-center text-[#2CB5A3] font-black text-xl font-mono">
            ÷
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
