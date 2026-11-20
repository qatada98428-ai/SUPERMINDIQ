"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Language, getTranslation } from "@/lib/translations";
import {
  AUDIO_STORAGE_KEYS,
  loadStoredAudioPreferences,
  soundSynth,
} from "@/lib/audio-synthesizer";

type ThemeMode = "light" | "dark";
export type FxType =
  | "click"
  | "pop"
  | "toggle"
  | "bead"
  | "modal_open"
  | "modal_close"
  | "correct"
  | "combo"
  | "complete"
  | "excellent"
  | "wrong"
  | "fanfare"
  | "levelup"
  | "flash_countdown"
  | "flash_ready"
  | "flash_number"
  | "flash_complete";

interface PlayFxOptions {
  streak?: number;
  frequency?: number;
}

interface AppContextValue {
  language: Language;
  dir: "rtl" | "ltr";
  theme: ThemeMode;
  soundEnabled: boolean;
  soundVolume: number;
  flashSoundEnabled: boolean;
  flashSoundVolume: number;
  t: (key: string) => string;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  toggleSound: () => void;
  setSoundVolume: (vol: number) => void;
  setFlashSoundEnabled: (enabled: boolean) => void;
  toggleFlashSound: () => void;
  setFlashSoundVolume: (vol: number) => void;
  playFx: (type: FxType, options?: PlayFxOptions) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY_LANG = "supermind_lang";
const STORAGE_KEY_THEME = "supermind_theme";

function clampVolume(v: number): number {
  if (!Number.isFinite(v)) return 0.8;
  return Math.max(0, Math.min(1, v));
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ar");
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [soundVolume, setSoundVolumeState] = useState<number>(0.8);
  const [flashSoundEnabled, setFlashSoundEnabledState] = useState<boolean>(true);
  const [flashSoundVolume, setFlashSoundVolumeState] = useState<number>(0.85);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    const savedLang = localStorage.getItem(STORAGE_KEY_LANG) as Language | null;
    if (savedLang === "ar" || savedLang === "en") {
      setLanguageState(savedLang);
    }

    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) as ThemeMode | null;
    if (savedTheme === "light" || savedTheme === "dark") {
      setThemeState(savedTheme);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setThemeState("dark");
    }

    const prefs = loadStoredAudioPreferences();
    setSoundEnabledState(prefs.masterEnabled);
    setSoundVolumeState(prefs.masterVolume);
    setFlashSoundEnabledState(prefs.flashEnabled);
    setFlashSoundVolumeState(prefs.flashVolume);
    soundSynth.setPreferences(prefs);

    setMounted(true);

    // Passive first-gesture unlocker for Safari / Mobile browsers
    const handleUnlock = () => {
      soundSynth.unlockAndPreload(false);
    };
    window.addEventListener("pointerdown", handleUnlock, { once: true, passive: true });
    window.addEventListener("keydown", handleUnlock, { once: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", handleUnlock);
      window.removeEventListener("keydown", handleUnlock);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    localStorage.setItem(STORAGE_KEY_LANG, language);
  }, [language, mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;
    soundSynth.setPreferences({
      masterEnabled: soundEnabled,
      masterVolume: soundVolume,
      flashEnabled: flashSoundEnabled,
      flashVolume: flashSoundVolume,
    });
    try {
      localStorage.setItem(AUDIO_STORAGE_KEYS.MASTER_ENABLED, String(soundEnabled));
      localStorage.setItem(AUDIO_STORAGE_KEYS.MASTER_VOLUME, String(soundVolume));
      localStorage.setItem(AUDIO_STORAGE_KEYS.FLASH_ENABLED, String(flashSoundEnabled));
      localStorage.setItem(AUDIO_STORAGE_KEYS.FLASH_VOLUME, String(flashSoundVolume));
    } catch {
      // Ignore storage quota errors
    }
  }, [soundEnabled, soundVolume, flashSoundEnabled, flashSoundVolume, mounted]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((curr) => (curr === "ar" ? "en" : "ar"));
  }, []);

  const setTheme = useCallback((th: ThemeMode) => {
    setThemeState(th);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((curr) => (curr === "light" ? "dark" : "light"));
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabledState((curr) => !curr);
  }, []);

  const setSoundVolume = useCallback((vol: number) => {
    setSoundVolumeState(clampVolume(vol));
  }, []);

  const setFlashSoundEnabled = useCallback((enabled: boolean) => {
    setFlashSoundEnabledState(enabled);
  }, []);

  const toggleFlashSound = useCallback(() => {
    setFlashSoundEnabledState((curr) => !curr);
  }, []);

  const setFlashSoundVolume = useCallback((vol: number) => {
    setFlashSoundVolumeState(clampVolume(vol));
  }, []);

  const t = useCallback(
    (key: string) => {
      return getTranslation(key, language);
    },
    [language]
  );

  const playFx = useCallback(
    (type: FxType, options?: PlayFxOptions) => {
      if (!soundEnabled) return;
      try {
        switch (type) {
          case "click":
          case "pop":
            soundSynth.playSound("ui-click");
            break;
          case "toggle":
            soundSynth.playSound("ui-toggle");
            break;
          case "bead":
            soundSynth.playBeadClick(options?.frequency ?? 520, 0.85);
            break;
          case "modal_open":
            soundSynth.playModalSound("open");
            break;
          case "modal_close":
            soundSynth.playModalSound("close");
            break;
          case "correct":
            soundSynth.playCorrectFeedback(options?.streak ?? 1);
            break;
          case "combo":
            soundSynth.playCorrectFeedback(Math.max(2, options?.streak ?? 2));
            break;
          case "complete":
            soundSynth.playOutcomeSound("complete");
            break;
          case "excellent":
          case "fanfare":
            soundSynth.playOutcomeSound("excellent");
            break;
          case "levelup":
            soundSynth.playOutcomeSound("levelup");
            break;
          case "wrong":
            soundSynth.playSound("wrong");
            break;
          case "flash_countdown":
            soundSynth.playFlashCue("countdown");
            break;
          case "flash_ready":
            soundSynth.playFlashCue("ready");
            break;
          case "flash_number":
            soundSynth.playFlashCue("number");
            break;
          case "flash_complete":
            soundSynth.playFlashCue("complete");
            break;
        }
      } catch {
        // Audio error suppression
      }
    },
    [soundEnabled]
  );

  const dir = language === "ar" ? "rtl" : "ltr";

  const contextValue: AppContextValue = {
    language,
    dir,
    theme,
    soundEnabled,
    soundVolume,
    flashSoundEnabled,
    flashSoundVolume,
    t,
    setLanguage,
    toggleLanguage,
    setTheme,
    toggleTheme,
    setSoundEnabled,
    toggleSound,
    setSoundVolume,
    setFlashSoundEnabled,
    toggleFlashSound,
    setFlashSoundVolume,
    playFx,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return ctx;
}
