"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";

export default function HeroIllustration() {
  const [clickedEquation, setClickedEquation] = useState(false);

  return (
    <div className="relative w-full max-w-lg mx-auto flex items-center justify-center p-4 select-none">
      {/* Decorative Lilac/Purple Backdrop Shape matching user screenshot */}
      <div className="absolute -inset-4 sm:-inset-8 bg-indigo-100/70 rounded-[3.5rem] -rotate-3 scale-95 pointer-events-none -z-10" />
      <div className="absolute -inset-2 bg-gradient-to-tr from-brand-300/30 via-purple-200/40 to-pink-100/30 rounded-[3rem] rotate-2 pointer-events-none -z-10 blur-xs" />

      {/* Ambient background glowing circles */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-brand-500/20 via-purple-500/15 to-amber-400/15 rounded-[3rem] blur-2xl -z-20 animate-pulse-subtle" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl -z-20" />

      {/* Main Container with smooth floating motion */}
      <div className="relative group w-full animate-float-slow transition-transform duration-500 hover:scale-[1.02]">
        {/* Frame around image */}
        <div className="relative rounded-[2.5rem] overflow-hidden bg-white/95 p-2.5 sm:p-3.5 shadow-2xl shadow-indigo-500/20 border-4 border-white backdrop-blur-sm">
          <div className="relative rounded-[2rem] overflow-hidden bg-slate-950 aspect-[4/5] w-full">
            <Image
              src="/images/coach-with-champions.jpg"
              alt="الأستاذ قتادة كريم مع أبطال برنامج العقل الخارق المتوجين بكأس البطولة"
              width={800}
              height={1000}
              priority
              className="w-full h-full object-cover object-top transform transition-transform duration-700 group-hover:scale-103"
            />

            {/* Inner subtle gradient vignette & caption badge */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none flex items-end justify-center p-4">
              <span className="text-[11px] sm:text-xs font-bold text-amber-300 bg-slate-950/85 px-3 py-1 rounded-full border border-amber-400/40 shadow-md">
                🏆 الأستاذ قتادة كريم مع أبطال العقل الخارق
              </span>
            </div>
          </div>
        </div>

        {/* Floating Badge 1: Top Right [- +] (Matches user screenshot) */}
        <div className="absolute -top-3 -right-3 sm:-top-5 sm:-right-4 animate-float z-20">
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl shadow-xl border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-lg sm:text-xl font-mono transform hover:scale-110 transition-transform">
            <span>−+</span>
          </div>
        </div>

        {/* Floating Badge 2: Center Left [÷] (Matches user screenshot) */}
        <div className="absolute top-1/2 -left-4 sm:-left-6 -translate-y-1/2 animate-float-delayed z-20">
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl shadow-xl border border-blue-100 flex items-center justify-center text-blue-600 font-black text-lg sm:text-xl font-mono transform hover:scale-110 transition-transform">
            <span>÷</span>
          </div>
        </div>

        {/* Floating Badge 3: Bottom Left [∞] (Matches user screenshot) */}
        <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-5 animate-float z-20">
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl shadow-xl border border-purple-100 flex items-center justify-center text-purple-600 font-black text-xl sm:text-2xl font-mono transform hover:scale-110 transition-transform">
            <span>∞</span>
          </div>
        </div>

        {/* Interactive Floating Equation Pill (Matching the whiteboard in the photo: 34 + 58 = 92) */}
        <div
          onClick={() => setClickedEquation(!clickedEquation)}
          className="absolute -bottom-5 right-6 sm:right-10 animate-float-delayed z-20 cursor-pointer"
        >
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 py-2 rounded-2xl shadow-2xl border-2 border-amber-400/80 flex items-center gap-2 transform hover:scale-105 active:scale-95 transition-all">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <div className="text-right">
              <span className="text-[10px] text-amber-300 font-bold block">تحدي الحساب السريع:</span>
              <span dir="ltr" className="text-xs sm:text-sm font-black font-mono tracking-wide text-white">
                34 + 58 = <span className="text-emerald-400 font-extrabold">{clickedEquation ? "92 ✔" : "92"}</span>
              </span>
            </div>
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
