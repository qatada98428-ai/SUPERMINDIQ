"use client";

import React, { useState } from "react";
import {
  Download,
  X,
  Share,
  PlusSquare,
  Smartphone,
  Monitor,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { usePWA } from "@/context/PWAContext";
import { useApp } from "@/context/AppContext";

export default function PWAInstallBanner() {
  const {
    isStandalone,
    bannerVisible,
    guideModalOpen,
    setGuideModalOpen,
    installApp,
    dismissBanner,
    isIOS,
    isAndroid,
  } = usePWA();
  const { playFx } = useApp();

  const [activeTab, setActiveTab] = useState<"ios" | "android" | "desktop">(
    isIOS ? "ios" : isAndroid ? "android" : "desktop"
  );

  // If already running as an installed standalone app, do not render banner or modal
  if (isStandalone) return null;

  return (
    <>
      {/* 1. Floating Banner When Opening From Browser */}
      {bannerVisible && (
        <aside
          role="region"
          aria-label="تثبيت تطبيق المنصة"
          className="fixed bottom-4 inset-x-3 sm:inset-x-auto sm:end-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-6 duration-300 pointer-events-auto"
        >
          <div className="clay-card !p-3.5 sm:!p-4 bg-gradient-to-br from-white/98 via-[#F9F8FE]/98 to-[#EDE8FD]/98 dark:from-[#1E1B3E]/98 dark:via-[#1A1738]/98 dark:to-[#262052]/98 border border-[#7C3AED]/30 dark:border-[#9061F9]/40 shadow-[0_20px_45px_-12px_rgba(99,68,245,0.35),0_0_0_1px_rgba(124,58,237,0.15)] rounded-3xl">
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-2xl bg-white dark:bg-[#121128] border-2 border-amber-400/80 shadow-[0_6px_16px_-4px_rgba(251,191,36,0.5)] overflow-hidden flex items-center justify-center shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/logo.jpg"
                    alt="أيقونة تطبيق العقل الخارق"
                    className="w-full h-full object-contain p-0.5"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                    <Sparkles className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-[#261E58] dark:text-[#F3F0FD]">
                      تثبيت تطبيق SUPER MIND
                    </h3>
                    <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">
                      تطبيق مجاني
                    </span>
                  </div>
                  <p className="text-xs text-[#5D5589] dark:text-[#C5BFEE] mt-0.5 leading-relaxed">
                    سرعة أكبر، وصول فوري من الشاشة، وتدريب سلس بملء الشاشة!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playFx("pop");
                  dismissBanner();
                }}
                className="clay-pill p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white shrink-0"
                title="إغلاق التنبيه"
                aria-label="إغلاق التنبيه"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 mt-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  playFx("pop");
                  installApp();
                }}
                className="clay-btn-purple flex-1 py-2 px-3 text-xs font-black flex items-center justify-center gap-1.5 shadow-[0_10px_20px_-6px_rgba(99,68,245,0.45)] !rounded-xl"
              >
                <Download className="w-4 h-4 text-amber-300 animate-bounce" />
                <span>{isIOS ? "تثبيت على الآيفون والآيباد 📱" : "تثبيت التطبيق الآن 📱"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playFx("pop");
                  dismissBanner();
                }}
                className="clay-pill py-2 px-3 text-xs font-bold text-[#645C94] dark:text-[#B8B2E4] hover:bg-[#EFEBFD] dark:hover:bg-[#2C2758]"
              >
                لاحقاً
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Interactive Step-by-Step Install Guide Modal */}
      {guideModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-guide-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            className="fixed inset-0"
            onClick={() => {
              playFx("modal_close");
              setGuideModalOpen(false);
            }}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-lg clay-card !p-5 sm:!p-6 bg-gradient-to-b from-white via-[#FAF8FF] to-[#F1EDFD] dark:from-[#1D1A3E] dark:via-[#191637] dark:to-[#221C4A] border-2 border-brand-500/30 rounded-3xl shadow-2xl z-10 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#E6E1FA] dark:border-[#322C64] pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white flex items-center justify-center shadow-md shrink-0">
                  <Smartphone className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h3
                    id="pwa-guide-title"
                    className="text-base sm:text-lg font-black text-[#261E58] dark:text-[#F3F0FD]"
                  >
                    تثبيت تطبيق SUPER MIND 📲
                  </h3>
                  <p className="text-xs text-[#6A629B] dark:text-[#C5BFEE]">
                    خطوات سريعة لامتلاك المنصة كتطبيق على جهازك
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  playFx("modal_close");
                  setGuideModalOpen(false);
                }}
                className="clay-pill p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Device Switcher Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#EDE8FD] dark:bg-[#25204F] border border-[#DDD6FE] dark:border-[#3D357A]">
              <button
                type="button"
                onClick={() => {
                  playFx("pop");
                  setActiveTab("ios");
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "ios"
                    ? "bg-white dark:bg-brand-600 text-brand-700 dark:text-white shadow-sm"
                    : "text-[#625992] dark:text-[#B6B0E3] hover:text-brand-600"
                }`}
              >
                <Share className="w-3.5 h-3.5" />
                <span>آيفون / آيباد</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playFx("pop");
                  setActiveTab("android");
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "android"
                    ? "bg-white dark:bg-brand-600 text-brand-700 dark:text-white shadow-sm"
                    : "text-[#625992] dark:text-[#B6B0E3] hover:text-brand-600"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>أندرويد</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playFx("pop");
                  setActiveTab("desktop");
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "desktop"
                    ? "bg-white dark:bg-brand-600 text-brand-700 dark:text-white shadow-sm"
                    : "text-[#625992] dark:text-[#B6B0E3] hover:text-brand-600"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>كمبيوتر / لابتوب</span>
              </button>
            </div>

            {/* Tab 1: iOS Safari Guide */}
            {activeTab === "ios" && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>تأكد من فتح الموقع عبر متصفح <strong>Safari</strong> على أجهزة Apple.</span>
                </div>

                <div className="space-y-2.5">
                  <div className="clay-card-sm !p-3 bg-white dark:bg-[#201C46] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-200 flex items-center justify-center font-black text-sm shrink-0">
                      1
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      اضغط على أيقونة المشاركة{" "}
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 font-bold text-slate-800 dark:text-slate-100">
                        <Share className="w-3.5 h-3.5 inline text-sky-600" /> مشاركة (Share)
                      </span>{" "}
                      في أسفل شاشة المتصفح.
                    </div>
                  </div>

                  <div className="clay-card-sm !p-3 bg-white dark:bg-[#201C46] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-200 flex items-center justify-center font-black text-sm shrink-0">
                      2
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      مرر القائمة لأسفل واضغط على{" "}
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/50 font-bold text-amber-900 dark:text-amber-200">
                        <PlusSquare className="w-3.5 h-3.5 inline text-amber-600" /> إضافة إلى الشاشة الرئيسية
                      </span>
                    </div>
                  </div>

                  <div className="clay-card-sm !p-3 bg-white dark:bg-[#201C46] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-200 flex items-center justify-center font-black text-sm shrink-0">
                      3
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      اضغط على زر <strong>«إضافة» (Add)</strong> في أعلى اليمين وستظهر أيقونة المنصة على هاتفك كتطبيق مباشر!
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Android Guide */}
            {activeTab === "android" && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="space-y-2.5">
                  <div className="clay-card-sm !p-3 bg-white dark:bg-[#201C46] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-200 flex items-center justify-center font-black text-sm shrink-0">
                      1
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      يمكنك الضغط مباشرة على زر التثبيت أدناه، أو فتح قائمة المتصفح{" "}
                      <span className="font-bold text-brand-600">(⋮)</span> في أعلى المتصفح.
                    </div>
                  </div>

                  <div className="clay-card-sm !p-3 bg-white dark:bg-[#201C46] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-200 flex items-center justify-center font-black text-sm shrink-0">
                      2
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      اختر <strong>«تثبيت التطبيق» (Install app)</strong> أو «إضافة إلى الشاشة الرئيسية».
                    </div>
                  </div>

                  <div className="clay-card-sm !p-3 bg-white dark:bg-[#201C46] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-200 flex items-center justify-center font-black text-sm shrink-0">
                      3
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      اضغط «تثبيت»، وسيتم تنزيل أيقونة المنصة والعمل في وضع الشاشة الكاملة فوراً.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Desktop Guide */}
            {activeTab === "desktop" && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="space-y-2.5">
                  <div className="clay-card-sm !p-3 bg-white dark:bg-[#201C46] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-200 flex items-center justify-center font-black text-sm shrink-0">
                      1
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      ابحث عن أيقونة التثبيت{" "}
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-brand-100 dark:bg-brand-900/60 font-bold text-brand-700 dark:text-brand-200">
                        <ArrowUpRight className="w-3.5 h-3.5" /> ⊕ تثبيت
                      </span>{" "}
                      الموجودة في أقصى يمين شريط العنوان (URL) بمتصفح Chrome أو Edge.
                    </div>
                  </div>

                  <div className="clay-card-sm !p-3 bg-white dark:bg-[#201C46] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-200 flex items-center justify-center font-black text-sm shrink-0">
                      2
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      أو افتح قائمة المتصفح <strong>(⋮)</strong> واضغط على «تثبيت تطبيق SUPER MIND».
                    </div>
                  </div>

                  <div className="clay-card-sm !p-3 bg-white dark:bg-[#201C46] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-200 flex items-center justify-center font-black text-sm shrink-0">
                      3
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      سيعمل التطبيق كنافذة برنامج مستقلة على سطح المكتب مع اختصار مباشر على شاشة حاسوبك!
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#E6E1FA] dark:border-[#322C64]">
              <button
                type="button"
                onClick={() => {
                  playFx("pop");
                  installApp();
                }}
                className="clay-btn-purple flex-1 py-2.5 px-4 font-black text-xs sm:text-sm flex items-center justify-center gap-2 !rounded-xl"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>جرّب التثبيت المباشر الآن</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playFx("modal_close");
                  setGuideModalOpen(false);
                }}
                className="clay-pill py-2.5 px-4 text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                حسناً، فهمت
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
