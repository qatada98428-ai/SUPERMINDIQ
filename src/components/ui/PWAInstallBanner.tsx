"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  X,
  Share,
  PlusSquare,
  Smartphone,
  Monitor,
  Sparkles,
  ArrowUpRight,
  Tv,
  Maximize2,
  Minimize2,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
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
    isSmartScreen,
    isInAppBrowser,
    isBoardModeActive,
    toggleInteractiveBoardMode,
  } = usePWA();
  const { playFx } = useApp();

  const [activeTab, setActiveTab] = useState<"smartboard" | "ios" | "android" | "desktop">("smartboard");

  // Sync tab on mount based on detected platform
  useEffect(() => {
    if (isSmartScreen) {
      setActiveTab("smartboard");
    } else if (isIOS) {
      setActiveTab("ios");
    } else if (isAndroid) {
      setActiveTab("android");
    } else {
      setActiveTab("desktop");
    }
  }, [isSmartScreen, isIOS, isAndroid]);

  // If already running as an installed standalone app, do not render banner or modal
  if (isStandalone) return null;

  return (
    <>
      {/* 1. Floating Banner When Opening From Browser */}
      {bannerVisible && (
        <aside
          role="region"
          aria-label="تثبيت تطبيق المنصة والسبورات التفاعلية"
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
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm font-black text-[#261E58] dark:text-[#F3F0FD]">
                      تطبيق SUPER MIND
                    </h3>
                    <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">
                      {isSmartScreen ? "سبورات تفاعلية 🖥️" : isIOS ? "آيفون وآيباد 📱" : "تطبيق مجاني"}
                    </span>
                  </div>
                  <p className="text-xs text-[#5D5589] dark:text-[#C5BFEE] mt-0.5 leading-relaxed">
                    {isSmartScreen
                      ? "شاشات المدارس الذكية: ملء الشاشة الفوري ومنع السكون وتثبيت التطبيق!"
                      : "سرعة أكبر، وصول فوري من الشاشة، وتدريب سلس بملء الشاشة!"}
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
                <span>
                  {isSmartScreen
                    ? "تثبيت / وضع الشاشة التفاعلية 🖥️"
                    : isIOS
                    ? "تثبيت على الآيفون والآيباد 📱"
                    : "تثبيت التطبيق الآن 📱"}
                </span>
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

          <div className="relative w-full max-w-xl clay-card !p-5 sm:!p-6 bg-gradient-to-b from-white via-[#FAF8FF] to-[#F1EDFD] dark:from-[#1D1A3E] dark:via-[#191637] dark:to-[#221C4A] border-2 border-brand-500/30 rounded-3xl shadow-2xl z-10 space-y-4 max-h-[92vh] overflow-y-auto">
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
                    تثبيت التطبيق والشاشات التفاعلية 📲
                  </h3>
                  <p className="text-xs text-[#6A629B] dark:text-[#C5BFEE]">
                    دليل التثبيت للآيفون، الأندرويد، والسبورات الذكية في القاعات الدراسية
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

            {/* Device Switcher Tabs: 4 tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl bg-[#EDE8FD] dark:bg-[#25204F] border border-[#DDD6FE] dark:border-[#3D357A]">
              <button
                type="button"
                onClick={() => {
                  playFx("pop");
                  setActiveTab("smartboard");
                }}
                className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "smartboard"
                    ? "bg-white dark:bg-brand-600 text-brand-700 dark:text-white shadow-sm"
                    : "text-[#625992] dark:text-[#B6B0E3] hover:text-brand-600"
                }`}
              >
                <Tv className="w-3.5 h-3.5 text-amber-500" />
                <span>السبورات الذكية</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playFx("pop");
                  setActiveTab("ios");
                }}
                className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "ios"
                    ? "bg-white dark:bg-brand-600 text-brand-700 dark:text-white shadow-sm"
                    : "text-[#625992] dark:text-[#B6B0E3] hover:text-brand-600"
                }`}
              >
                <Share className="w-3.5 h-3.5 text-sky-500" />
                <span>آيفون / آيباد</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playFx("pop");
                  setActiveTab("android");
                }}
                className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "android"
                    ? "bg-white dark:bg-brand-600 text-brand-700 dark:text-white shadow-sm"
                    : "text-[#625992] dark:text-[#B6B0E3] hover:text-brand-600"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                <span>أندرويد</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playFx("pop");
                  setActiveTab("desktop");
                }}
                className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "desktop"
                    ? "bg-white dark:bg-brand-600 text-brand-700 dark:text-white shadow-sm"
                    : "text-[#625992] dark:text-[#B6B0E3] hover:text-brand-600"
                }`}
              >
                <Monitor className="w-3.5 h-3.5 text-purple-500" />
                <span>الكمبيوتر</span>
              </button>
            </div>

            {/* TAB 1: Smart Boards & Interactive Screens (السبورات والشاشات التفاعلية) */}
            {activeTab === "smartboard" && (
              <div className="space-y-3.5 animate-in fade-in duration-200">
                {/* 1-Click Interactive Fullscreen Mode Button */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white shadow-md space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Tv className="w-5 h-5 text-amber-300" />
                      <span className="font-black text-sm">وضع الشاشة التفاعلية الفوري 🖥️</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                      موصى به للمدارس
                    </span>
                  </div>
                  <p className="text-xs text-white/90 leading-relaxed">
                    يعمل فوراً على أي سبورة أو شاشة ذكية: يخفي أشرطة المتصفح ويمنع انطفاء أو سكون الشاشة أثناء الحصص والتدريب!
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      playFx("pop");
                      toggleInteractiveBoardMode();
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-white text-brand-700 hover:bg-amber-50 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                  >
                    {isBoardModeActive ? (
                      <>
                        <Minimize2 className="w-4 h-4 text-rose-600" />
                        <span>الخروج من ملء الشاشة</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-4 h-4 text-emerald-600" />
                        <span>تشغيل وضع الشاشة التفاعلية الآن (ملء الشاشة ⛶)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Method 1: Windows OPS PC Smart Boards */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-[#261E58] dark:text-[#F3F0FD] flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <span>أولاً: الشاشات التفاعلية بنظام Windows (كمبيوتر OPS المدمج):</span>
                  </h4>
                  <div className="clay-card-sm !p-3 bg-white dark:bg-[#201C46] space-y-2 text-xs text-slate-700 dark:text-slate-200">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-200 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                        1
                      </div>
                      <div className="leading-relaxed">
                        افتح المنصة عبر متصفح <strong>Microsoft Edge</strong> أو <strong>Google Chrome</strong> على الشاشة التفاعلية.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-200 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                        2
                      </div>
                      <div className="leading-relaxed">
                        اضغط على النقاط الثلاث <strong>(···)</strong> أعلى زاوية المتصفح ➔ اختر <strong>«التطبيقات» (Apps)</strong> ➔ اضغط على <strong>«تثبيت هذا الموقع كتطبيق» (Install this site as an app)</strong>.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-200 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                        3
                      </div>
                      <div className="leading-relaxed">
                        حدد خيار <strong>«إنشاء اختصار على سطح المكتب»</strong> وضع علامة صح على <strong>«التثبيت في شريط المهام»</strong> لفتح المنصة بنقرة واحدة دائماً.
                      </div>
                    </div>
                    <div className="mt-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span><strong>اختصار سريع للمعلم:</strong> اضغط زر <strong>F11</strong> على لوحة المفاتيح في أي وقت للتحويل الفوري إلى ملء الشاشة.</span>
                    </div>
                  </div>
                </div>

                {/* Method 2: Android Smart Boards (Promethean, ViewSonic, IQBoard, Huawei) */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-[#261E58] dark:text-[#F3F0FD] flex items-center gap-1.5">
                    <Tv className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>ثانياً: الشاشات التفاعلية بنظام Android (مثل Promethean, ViewSonic, IQBoard):</span>
                  </h4>
                  <div className="clay-card-sm !p-3 bg-white dark:bg-[#201C46] space-y-2 text-xs text-slate-700 dark:text-slate-200">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-200 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                        1
                      </div>
                      <div className="leading-relaxed">
                        افتح متصفح Chrome بالشاشة ➔ اضغط على زر القائمة <strong>(⋮)</strong> في الزاوية.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-200 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                        2
                      </div>
                      <div className="leading-relaxed">
                        اختر <strong>«إضافة إلى الشاشة الرئيسية»</strong> أو <strong>«تثبيت التطبيق»</strong> لتظهر أيقونة المنصة على واجهة الشاشة الذكية.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-200 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                        3
                      </div>
                      <div className="leading-relaxed">
                        إذا كان متصفح الشاشة مخصصاً لا يدعم التثبيت، استخدم زر <strong>«وضع الشاشة التفاعلية»</strong> بالأعلى وستعمل المنصة بدقة عالية كاملة!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: iPhone & iPad (iOS Safari Guide) */}
            {activeTab === "ios" && (
              <div className="space-y-3 animate-in fade-in duration-200">
                {/* In-App Browser Warning (Critical for WhatsApp / Instagram / Telegram clicks) */}
                <div
                  className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
                    isInAppBrowser
                      ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100 shadow-sm"
                      : "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100"
                  }`}
                >
                  <div className="flex items-center gap-2 font-black text-xs">
                    <AlertTriangle className={`w-4 h-4 shrink-0 ${isInAppBrowser ? "text-rose-600" : "text-amber-600"}`} />
                    <span>
                      {isInAppBrowser
                        ? "تنبيه هام: أنت تتصفح من داخل تطبيق (واتساب / انستغرام / فيسبوك)!"
                        : "تنبيه هام جداً لمستخدمي أجهزة Apple (الآيفون والآيباد):"}
                    </span>
                  </div>
                  <p>
                    أجهزة آبل تمنع خيار التثبيت عند فتح الرابط من داخل تطبيقات المحادثات.
                    <br />
                    <strong>الحل البسيط:</strong> اضغط على أيقونة المتصفح <ExternalLink className="w-3 h-3 inline mx-0.5" /> أو النقاط الثلاث في زاوية الشاشة، واختر <strong>(فتح في متصفح Safari)</strong> حتى يظهر لك خيار التثبيت.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="clay-card-sm !p-3 bg-white dark:bg-[#201C46] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-200 flex items-center justify-center font-black text-sm shrink-0">
                      1
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      تأكد من فتح الرابط عبر متصفح <strong>Safari الرسمي</strong> على جهاز الآيفون أو الآيباد.
                    </div>
                  </div>

                  <div className="clay-card-sm !p-3 bg-white dark:bg-[#201C46] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-200 flex items-center justify-center font-black text-sm shrink-0">
                      2
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      اضغط على أيقونة المشاركة{" "}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-100 dark:bg-sky-900/60 font-black text-sky-800 dark:text-sky-200 border border-sky-300 dark:border-sky-700">
                        <Share className="w-3.5 h-3.5 inline text-sky-600 dark:text-sky-300" /> زر المشاركة (Share)
                      </span>{" "}
                      (المربع ذو السهم لأعلى، موجود أسفل الشاشة بالآيفون، أو أعلى الزاوية بالآيباد).
                    </div>
                  </div>

                  <div className="clay-card-sm !p-3 bg-white dark:bg-[#201C46] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-200 flex items-center justify-center font-black text-sm shrink-0">
                      3
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      مرر القائمة لأسفل قليلاً واضغط على{" "}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-900/60 font-black text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                        <PlusSquare className="w-3.5 h-3.5 inline text-amber-600 dark:text-amber-300" /> إضافة إلى الصفحة الرئيسية
                      </span>
                    </div>
                  </div>

                  <div className="clay-card-sm !p-3 bg-white dark:bg-[#201C46] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-200 flex items-center justify-center font-black text-sm shrink-0">
                      4
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      اضغط على كلمة <strong>«إضافة» (Add)</strong> بالأزرق في أعلى اليمين. مبروك! ظهر تطبيق SUPER MIND الآن على شاشتك الرئيسية ويعمل كتطبيق مستقل كامل!
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Android Guide */}
            {activeTab === "android" && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="space-y-2.5">
                  <div className="clay-card-sm !p-3 bg-white dark:bg-[#201C46] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-200 flex items-center justify-center font-black text-sm shrink-0">
                      1
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      يمكنك الضغط مباشرة على زر <strong>«التثبيت المباشر»</strong> أدناه، أو فتح قائمة متصفح Chrome بالضغط على{" "}
                      <span className="font-bold text-brand-600">(⋮)</span> في أعلى الشاشة.
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
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-200 flex items-center justify-center font-black text-sm shrink-0">
                      3
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      اضغط «تثبيت»، وسيتم تنزيل أيقونة المنصة على شاشة هاتفك فوراً والعمل بملء الشاشة مع سرعة استجابة فائقة!
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Desktop Guide */}
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
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-200 flex items-center justify-center font-black text-sm shrink-0">
                      3
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      سيعمل التطبيق كنافذة برنامج مستقلة على سطح المكتب مع اختصار مباشر وسرعة تشغيل عالية.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-[#E6E1FA] dark:border-[#322C64]">
              {activeTab === "smartboard" ? (
                <button
                  type="button"
                  onClick={() => {
                    playFx("pop");
                    toggleInteractiveBoardMode();
                  }}
                  className="clay-btn-purple w-full sm:flex-1 py-2.5 px-4 font-black text-xs sm:text-sm flex items-center justify-center gap-2 !rounded-xl"
                >
                  <Maximize2 className="w-4 h-4 text-amber-300" />
                  <span>
                    {isBoardModeActive ? "الخروج من وضع ملء الشاشة" : "تفعيل وضع الشاشة التفاعلية (ملء الشاشة ⛶)"}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    playFx("pop");
                    installApp();
                  }}
                  className="clay-btn-purple w-full sm:flex-1 py-2.5 px-4 font-black text-xs sm:text-sm flex items-center justify-center gap-2 !rounded-xl"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>{activeTab === "ios" ? "إعادة محاولة التثبيت 📱" : "جرّب التثبيت المباشر الآن"}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  playFx("modal_close");
                  setGuideModalOpen(false);
                }}
                className="clay-pill w-full sm:w-auto py-2.5 px-5 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>حسناً، فهمت الخطوات</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}