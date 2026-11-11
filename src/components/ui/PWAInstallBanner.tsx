"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if dismissed previously
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem("supermind_pwa_dismissed");
      if (dismissed) return;

      // Detect iOS Safari
      const ua = window.navigator.userAgent.toLowerCase();
      const isApple = /iphone|ipad|ipod/.test(ua);
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as unknown as { standalone?: boolean }).standalone;

      if (isApple && !isStandalone) {
        setIsIOS(true);
        setIsVisible(true);
      }

      // Android / Chrome
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setIsVisible(true);
      };

      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("supermind_pwa_dismissed", "true");
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl border border-brand-500/40 shadow-2xl space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <Smartphone className="w-5 h-5 text-amber-300" />
            </div>
            <div className="text-right">
              <h4 className="text-sm font-black text-white">تثبيت تطبيق SUPER MIND</h4>
              <p className="text-xs text-slate-300 mt-0.5">
                تصفح أسرع، نطق فوري، وتدريب ملء الشاشة كالتطبيق تماماً!
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {showIOSGuide ? (
          <div className="bg-slate-800/90 p-3 rounded-xl text-xs space-y-2 border border-slate-700 animate-in fade-in">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <Share className="w-4 h-4" />
              <span>طريقة التثبيت على الآيفون والآيباد:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed pr-1">
              <li>اضغط على زر المشاركة أسفل متصفح Safari.</li>
              <li>اختر <strong>«إضافة إلى الشاشة الرئيسية»</strong> (Add to Home Screen).</li>
              <li>اضغط <strong>«إضافة»</strong> وستظهر أيقونة التطبيق على هاتفك.</li>
            </ol>
          </div>
        ) : (
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleInstallClick}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>{isIOS ? "كيفية التثبيت على الآيفون" : "تثبيت التطبيق الآن 📱"}</span>
            </button>
            <button
              onClick={handleDismiss}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
            >
              لاحقاً
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
