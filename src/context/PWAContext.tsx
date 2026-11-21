"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface PWAContextValue {
  isStandalone: boolean;
  canPromptDirectly: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  bannerVisible: boolean;
  guideModalOpen: boolean;
  setGuideModalOpen: (open: boolean) => void;
  installApp: () => Promise<void>;
  dismissBanner: () => void;
  reopenBanner: () => void;
}

const PWAContext = createContext<PWAContextValue | null>(null);

const STORAGE_DISMISSED_KEY = "supermind_pwa_banner_dismissed_until";

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isAndroid, setIsAndroid] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(false);
  const [bannerVisible, setBannerVisible] = useState<boolean>(false);
  const [guideModalOpen, setGuideModalOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register Service Worker in production or localhost
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .catch((err) => {
            console.warn("SW registration error:", err);
          });
      });
    }

    // Check Standalone (already installed as PWA)
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia("(display-mode: standalone)").matches;
      const isIOSStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      const isReferrerApp = document.referrer.includes("android-app://");
      return Boolean(isStandaloneMedia || isIOSStandalone || isReferrerApp);
    };

    const standaloneNow = checkStandalone();
    setIsStandalone(standaloneNow);

    // Platform detection
    const ua = window.navigator.userAgent.toLowerCase();
    const isAppleMobile =
      /iphone|ipad|ipod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isDroid = /android/.test(ua);
    const isDesk = !isAppleMobile && !isDroid && !/mobile|tablet/.test(ua);

    setIsIOS(isAppleMobile);
    setIsAndroid(isDroid);
    setIsDesktop(isDesk);

    // If user is already running the installed app, do not show banner
    if (standaloneNow) {
      setMounted(true);
      return;
    }

    // Check banner dismissal timestamp (snooze for 24 hours)
    const dismissedUntil = localStorage.getItem(STORAGE_DISMISSED_KEY);
    const now = Date.now();
    const isSnoozed = dismissedUntil ? Number(dismissedUntil) > now : false;

    // Listen for beforeinstallprompt (Chrome, Edge, Android)
    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isSnoozed) {
        setBannerVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);

    // If iOS Safari or browser without immediate beforeinstallprompt, show banner after 1.5s delay
    let bannerTimer: ReturnType<typeof setTimeout> | null = null;
    if (!isSnoozed) {
      bannerTimer = setTimeout(() => {
        setBannerVisible(true);
      }, 1400);
    }

    setMounted(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      if (bannerTimer) clearTimeout(bannerTimer);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setBannerVisible(false);
          setGuideModalOpen(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn("Install prompt error:", err);
        setGuideModalOpen(true);
      }
    } else {
      // Native prompt unavailable (iOS Safari, desktop address bar, or already triggered) -> show visual guide
      setGuideModalOpen(true);
    }
  }, [deferredPrompt]);

  const dismissBanner = useCallback(() => {
    setBannerVisible(false);
    if (typeof window !== "undefined") {
      // Snooze for 24 hours
      const snoozeUntil = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem(STORAGE_DISMISSED_KEY, snoozeUntil.toString());
    }
  }, []);

  const reopenBanner = useCallback(() => {
    setBannerVisible(true);
  }, []);

  return (
    <PWAContext.Provider
      value={{
        isStandalone,
        canPromptDirectly: !!deferredPrompt,
        isIOS,
        isAndroid,
        isDesktop,
        bannerVisible: mounted && !isStandalone && bannerVisible,
        guideModalOpen,
        setGuideModalOpen,
        installApp,
        dismissBanner,
        reopenBanner,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error("usePWA must be used within a PWAProvider");
  }
  return context;
}
