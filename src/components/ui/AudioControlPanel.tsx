"use client";

import React from "react";
import { Volume2, VolumeX, Zap } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface AudioControlPanelProps {
  compact?: boolean;
  flashOnly?: boolean;
}

/**
 * Reusable Soft-3D Audio Control Panel synced with global AppContext preferences.
 */
export default function AudioControlPanel({
  compact = false,
  flashOnly = false,
}: AudioControlPanelProps) {
  const {
    language,
    soundEnabled,
    soundVolume,
    flashSoundEnabled,
    flashSoundVolume,
    toggleSound,
    setSoundVolume,
    toggleFlashSound,
    setFlashSoundVolume,
    playFx,
  } = useApp();

  const isEn = language === "en";
  const masterPct = Math.round(soundVolume * 100);
  const flashPct = Math.round(flashSoundVolume * 100);

  return (
    <div className={`space-y-3 ${compact ? "text-xs" : "text-sm"}`}>
      {!flashOnly && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-bold text-[#2E2759] dark:text-[#F5F4FD]">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <span>{isEn ? "Platform Sounds" : "أصوات المنصة"}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                const next = !soundEnabled;
                toggleSound();
                if (next) setTimeout(() => playFx("toggle"), 30);
              }}
              className={`px-3 py-1 rounded-xl font-extrabold text-[11px] transition-colors ${
                soundEnabled
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700"
              }`}
            >
              {soundEnabled ? (isEn ? "On" : "مفعّل") : isEn ? "Muted" : "مكتوم"}
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              aria-label={isEn ? "Master volume" : "مستوى الصوت العام"}
              value={masterPct}
              disabled={!soundEnabled}
              onChange={(e) => setSoundVolume(Number(e.target.value) / 100)}
              onPointerUp={() => playFx("click")}
              className="flex-1 accent-brand-600 cursor-pointer disabled:opacity-40"
            />
            <span className="w-9 text-end font-mono font-bold text-[11px] text-[#5E5985] dark:text-[#C5BFEA]">
              {masterPct}%
            </span>
          </div>
        </div>
      )}

      <div
        className={`space-y-2 ${
          !flashOnly ? "pt-2.5 border-t border-[#E6E2FA] dark:border-[#343063]" : ""
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-bold text-[#2E2759] dark:text-[#F5F4FD]">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{isEn ? "Flash Anzan Audio" : "أصوات Flash Anzan"}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              const next = !flashSoundEnabled;
              toggleFlashSound();
              if (next) setTimeout(() => playFx("flash_number"), 30);
            }}
            disabled={!soundEnabled}
            className={`px-3 py-1 rounded-xl font-extrabold text-[11px] transition-colors disabled:opacity-45 ${
              flashSoundEnabled && soundEnabled
                ? "bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/40"
                : "bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700"
            }`}
          >
            {flashSoundEnabled ? (isEn ? "On" : "مفعّل") : isEn ? "Off" : "معطّل"}
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            aria-label={isEn ? "Flash Anzan volume" : "مستوى صوت Flash Anzan"}
            value={flashPct}
            disabled={!soundEnabled || !flashSoundEnabled}
            onChange={(e) => setFlashSoundVolume(Number(e.target.value) / 100)}
            onPointerUp={() => playFx("flash_number")}
            className="flex-1 accent-amber-500 cursor-pointer disabled:opacity-40"
          />
          <span className="w-9 text-end font-mono font-bold text-[11px] text-[#5E5985] dark:text-[#C5BFEA]">
            {flashPct}%
          </span>
        </div>
      </div>
    </div>
  );
}
