"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, X } from "lucide-react";
import { soundSynth } from "@/lib/audio-synthesizer";

const SESSION_STORAGE_KEY = "supermind_welcome_prayer_seen_v1";

export default function WelcomePrayerModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const alreadySeen = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!alreadySeen) {
        setIsOpen(true);
      }
    } catch {
      setIsOpen(true);
    }

    const handleManualOpen = () => {
      soundSynth.playModalSound("open");
      setIsOpen(true);
    };
    window.addEventListener("supermind:open-prayer", handleManualOpen);
    return () => window.removeEventListener("supermind:open-prayer", handleManualOpen);
  }, []);

  const handleClose = () => {
    soundSynth.playModalSound("close");
    setIsOpen(false);
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, "1");
      window.dispatchEvent(new CustomEvent("supermind:prayer-closed"));
    } catch {
      // Ignore storage errors
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-300"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-prayer-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-[2rem] bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white border-2 border-amber-400/40 shadow-2xl shadow-amber-500/10 overflow-hidden p-6 sm:p-9 text-center space-y-6 animate-in zoom-in-95 duration-300"
      >
        {/* Decorative Ambient Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-48 bg-amber-400/15 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-72 h-48 bg-emerald-500/15 rounded-full blur-3xl" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="إغلاق"
          className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Emblem */}
        <div className="relative flex flex-col items-center gap-2 pt-1">
          <div className="w-20 h-20 rounded-2xl bg-white border-2 border-amber-400 overflow-hidden flex items-center justify-center shadow-lg shadow-amber-500/25">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.jpg"
              alt="شعار برنامج العقل الخارق SUPER MIND"
              className="w-full h-full object-contain p-1"
            />
          </div>
          <span className="text-[11px] font-black tracking-wide text-amber-300/90 bg-amber-400/10 border border-amber-400/25 px-3 py-0.5 rounded-full">
            منصة برنامج العقل الخارق • SUPER MIND
          </span>
        </div>

        {/* Quranic Verse */}
        <div
          id="welcome-prayer-title"
          className="relative py-4 px-5 rounded-2xl bg-amber-400/10 border border-amber-400/30 shadow-inner"
        >
          <p className="text-xl sm:text-2xl font-black text-amber-300 leading-relaxed tracking-wide">
            ﴿رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ﴾
          </p>
        </div>

        {/* Supplications */}
        <div className="relative space-y-4 px-1 sm:px-3">
          <p className="text-base sm:text-lg font-bold text-slate-100 leading-relaxed">
            اللهم انفعنا بما علّمتنا، وعلّمنا ما ينفعنا، وزدنا علماً.
          </p>

          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent mx-auto" />

          <p className="text-sm sm:text-base font-bold text-emerald-200/95 leading-relaxed">
            اللهم اجعل هذا العمل علماً نافعاً وصدقةً جاريةً، واكتب أجره لنا ولوالدينا ومعلّمينا وطلابنا، وللمسلمين والمسلمات.
          </p>
        </div>

        {/* Action Button */}
        <div className="relative pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-98 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>اللهم آمين — الدخول إلى المنصة</span>
          </button>
        </div>
      </div>
    </div>
  );
}
