"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Language, getTranslation } from "@/lib/translations";
import { soundSynth } from "@/lib/audio-synthesizer";

type ThemeMode = "light" | "dark";

interface AppContextValue {
  language: Language;
  dir: "rtl" | "ltr";
  theme: ThemeMode;
  soundEnabled: boolean;
  t: (key: string) => string;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  toggleSound: () => void;
  playFx: (type: "click" | "correct" | "wrong" | "fanfare" | "bead") => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY_LANG = "supermind_lang";
const STORAGE_KEY_THEME = "supermind_theme";
const STORAGE_KEY_SOUND = "supermind_sound";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ar");
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  // Initialize from localStorage and system preference on client mount
  useEffect(() => {
    // Language
    const savedLang = localStorage.getItem(STORAGE_KEY_LANG) as Language | null;
    if (savedLang === "ar" || savedLang === "en") {
      setLanguageState(savedLang);
    }

    // Theme
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) as ThemeMode | null;
    if (savedTheme === "light" || savedTheme === "dark") {
      setThemeState(savedTheme);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setThemeState("dark");
    }

    // Sound
    const savedSound = localStorage.getItem(STORAGE_KEY_SOUND);
    if (savedSound !== null) {
      setSoundEnabledState(savedSound === "true");
    }

    setMounted(true);
  }, []);

  // Update DOM when language changes
  useEffect(() => {
    if (!mounted) return;
    const dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    localStorage.setItem(STORAGE_KEY_LANG, language);
  }, [language, mounted]);

  // Update DOM when theme changes
  useEffect(() => {
    if (!mounted) return;
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme, mounted]);

  // Update Sound in localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY_SOUND, String(soundEnabled));
  }, [soundEnabled, mounted]);

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

  const t = useCallback(
    (key: string) => {
      return getTranslation(key, language);
    },
    [language]
  );

  const playFx = useCallback(
    (type: "click" | "correct" | "wrong" | "fanfare" | "bead") => {
      if (!soundEnabled) return;
      try {
        if (type === "click") {
          soundSynth.playBeadClick(520, 0.12);
        } else if (type === "bead") {
          soundSynth.playBeadClick(460, 0.18);
        } else if (type === "correct") {
          soundSynth.playCelebrationFanfare();
        } else if (type === "wrong") {
          soundSynth.playBeadClick(320, 0.25);
        } else if (type === "fanfare") {
          soundSynth.playCelebrationFanfare();
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
    t,
    setLanguage,
    toggleLanguage,
    setTheme,
    toggleTheme,
    setSoundEnabled,
    toggleSound,
    playFx,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
