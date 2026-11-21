"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Globe,
  Sparkles,
  Brain,
  Award,
  Users,
  HelpCircle,
  HeartHandshake,
  ShieldCheck,
  User,
  LogOut,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  ChevronDown,
} from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";
import AudioControlPanel from "@/components/ui/AudioControlPanel";
import PodiumIcon from "@/components/ui/PodiumIcon";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { usePWA } from "@/context/PWAContext";

export default function Navbar() {
  const { language, theme, soundEnabled, toggleLanguage, toggleTheme, toggleSound, playFx } = useApp();
  const { user, profile, role, isGuest, signOut } = useAuth();
  const { isStandalone, installApp } = usePWA();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);
  const [activeNavCapsule, setActiveNavCapsule] = useState<"mental" | "iq" | "vedic">("mental");
  const [audioMenuOpen, setAudioMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isEn = language === "en";
  const isHomePage = pathname === "/";

  const handleGoBack = () => {
    playFx("pop");
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else if (pathname.startsWith("/mental-arithmetic/")) {
      router.push("/mental-arithmetic");
    } else {
      router.push("/");
    }
  };

  const navItems = [
    { href: "/", label: "الرئيسية", enLabel: "Home", icon: Sparkles },
    { href: "/mental-arithmetic", label: "برامج العقل الخارق", enLabel: "Super Mind Programs", icon: Brain },
    { href: "/trainers", label: "الاعتمادات والشراكات", enLabel: "Accreditations & Partnerships", icon: Award },
    {
      href: "/supporters",
      label: "الداعمون",
      enLabel: "Supporters",
      icon: HeartHandshake,
      isSpecial: true,
    },
    { href: "/about", label: "من نحن", enLabel: "About Us", icon: Users },
    { href: "/support", label: "الدعم الفني", enLabel: "Support", icon: HelpCircle },
  ];

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/92 dark:bg-[#181636]/92 backdrop-blur-xl border-b border-[#E6E2FA] dark:border-[#2E2B57] transition-colors shadow-[0_8px_28px_-10px_rgba(68,52,138,0.14)]">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-5 lg:px-8 h-14 sm:h-16 xl:h-[4.25rem] flex items-center justify-between gap-1.5 sm:gap-2 min-w-0">
        {/* Brand Logo + Clay Back Pill */}
        <div className="shrink-0 flex items-center gap-1.5 sm:gap-2">
          {!isHomePage && (
            <button
              type="button"
              onClick={handleGoBack}
              className="clay-pill shrink-0 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[#2E2759] dark:text-[#F5F4FD] font-bold text-[11px] sm:text-sm flex items-center gap-1 active:scale-95"
              title={isEn ? "Go Back" : "رجوع للصفحة السابقة"}
            >
              {isEn ? (
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-600" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-600" />
              )}
              <span className="hidden sm:inline">{isEn ? "Back" : "رجوع"}</span>
            </button>
          )}
          <BrandLogo compactOnTablet />
        </div>

        {/* Responsive Primary Navigation: Touch Clay Icons on md/lg, Clay Pill Icon + Text on xl+ */}
        <nav
          aria-label={isEn ? "Primary navigation" : "التنقل الرئيسي"}
          className="hidden md:flex items-center gap-1.5 shrink-0"
        >
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            const itemLabel = isEn ? item.enLabel : item.label;

            // كبسولات برامج العقل الخارق مع القائمة المنسدلة الثلاثية الأبعاد
            if (item.href === "/mental-arithmetic") {
              return (
                <div key={item.href} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      playFx("pop");
                      setProgramsOpen((v) => !v);
                    }}
                    title={itemLabel}
                    aria-label={itemLabel}
                    aria-expanded={programsOpen}
                    className={`w-10 h-10 xl:w-auto xl:h-auto xl:px-3.5 xl:py-2 rounded-2xl text-[13px] font-black transition-all duration-200 flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 ${
                      active || programsOpen
                        ? "clay-btn-purple !rounded-2xl shadow-md"
                        : "bg-[#F7F5FE] dark:bg-[#242146] text-[#4C4578] dark:text-[#D9D5F5] border border-[#E7E3FA] dark:border-[#363268] shadow-[0_4px_10px_-4px_rgba(68,52,138,0.1),inset_0_2px_2px_rgba(255,255,255,0.85)] dark:shadow-none hover:text-brand-600 dark:hover:text-brand-300 hover:-translate-y-0.5"
                    }`}
                  >
                    <Brain className="w-4 h-4 shrink-0 text-brand-600 dark:text-brand-300" />
                    <span className="hidden xl:inline">{itemLabel}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 hidden xl:inline transition-transform duration-200 ${
                        programsOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Mega Dropdown with 3 Main Sections of Soft 3D Programs */}
                  {programsOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setProgramsOpen(false)}
                        aria-hidden="true"
                      />
                      <div className="absolute top-full start-0 mt-2.5 w-[360px] sm:w-[480px] p-4 sm:p-5 clay-card bg-white/98 dark:bg-[#1E1B3E]/98 z-50 border-2 border-brand-500/35 dark:border-brand-500/45 shadow-2xl rounded-[2rem] space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
                        {/* Top Header Row */}
                        <div className="flex items-center justify-between pb-2 border-b border-brand-100 dark:border-brand-900/40">
                          <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-brand-600 dark:text-brand-300" />
                            <span className="text-sm font-black text-[#261E58] dark:text-white">
                              برامج العقل الخارق
                            </span>
                          </div>
                          <Link
                            href="/mental-arithmetic"
                            onClick={() => {
                              playFx("pop");
                              setProgramsOpen(false);
                            }}
                            className="text-[11px] font-black text-brand-600 dark:text-brand-300 hover:underline flex items-center gap-1"
                          >
                            <span>فتح الصفحة كاملة</span>
                            <span>⬅</span>
                          </Link>
                        </div>

                        {/* The 3 Interactive Main Capsules */}
                        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100/90 dark:bg-slate-900/70 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => {
                              playFx("click");
                              setActiveNavCapsule("mental");
                            }}
                            className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                              activeNavCapsule === "mental"
                                ? "bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md scale-102"
                                : "text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white"
                            }`}
                          >
                            <span>🧮</span>
                            <span className="truncate">الحساب الذهني</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              playFx("click");
                              setActiveNavCapsule("iq");
                            }}
                            className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                              activeNavCapsule === "iq"
                                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md scale-102"
                                : "text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-white"
                            }`}
                          >
                            <span>🧩</span>
                            <span className="truncate">أسئلة الذكاء</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              playFx("click");
                              setActiveNavCapsule("vedic");
                            }}
                            className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                              activeNavCapsule === "vedic"
                                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md scale-102"
                                : "text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-white"
                            }`}
                          >
                            <span>✨</span>
                            <span className="truncate">أسرار الرياضيات</span>
                          </button>
                        </div>

                        {/* Capsule 1 Content: أقسام الحساب الذهني الستة */}
                        {activeNavCapsule === "mental" && (
                          <div className="space-y-2.5 animate-in fade-in duration-150">
                            <div className="flex items-center justify-between text-[11px] font-black text-brand-700 dark:text-brand-300 px-1">
                              <span>أقسام منظومة الحساب الذهني (6 أقسام):</span>
                              <Link
                                href="/mental-arithmetic"
                                onClick={() => setProgramsOpen(false)}
                                className="underline hover:text-brand-600"
                              >
                                عرض الكل
                              </Link>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Link
                                href="/mental-arithmetic/abacus"
                                onClick={() => {
                                  playFx("pop");
                                  setProgramsOpen(false);
                                }}
                                className="p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-violet-50/90 hover:bg-violet-100 dark:bg-violet-950/50 dark:hover:bg-violet-900/60 text-violet-900 dark:text-violet-200 border border-violet-200 dark:border-violet-800/60 active:scale-95 shadow-sm"
                              >
                                <span className="text-base">🧮</span>
                                <span className="truncate">العداد (السوروبان)</span>
                              </Link>

                              <Link
                                href="/mental-arithmetic/flash-anzan"
                                onClick={() => {
                                  playFx("pop");
                                  setProgramsOpen(false);
                                }}
                                className="p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-amber-50/90 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-950 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60 active:scale-95 shadow-sm"
                              >
                                <span className="text-base">⚡</span>
                                <span className="truncate">فلاش أنزان السريع</span>
                              </Link>

                              <Link
                                href="/mental-arithmetic/competition"
                                onClick={() => {
                                  playFx("pop");
                                  setProgramsOpen(false);
                                }}
                                className="p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-yellow-50/90 hover:bg-yellow-100 dark:bg-yellow-950/50 dark:hover:bg-yellow-900/60 text-yellow-950 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800/60 active:scale-95 shadow-sm"
                              >
                                <span className="text-base">🏆</span>
                                <span className="truncate">محاكي المسابقات</span>
                              </Link>

                              <Link
                                href="/mental-arithmetic/teams-battle"
                                onClick={() => {
                                  playFx("pop");
                                  setProgramsOpen(false);
                                }}
                                className="p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-sky-50/90 hover:bg-sky-100 dark:bg-sky-950/50 dark:hover:bg-sky-900/60 text-sky-900 dark:text-sky-200 border border-sky-200 dark:border-sky-800/60 active:scale-95 shadow-sm"
                              >
                                <PodiumIcon className="w-4 h-4 text-sky-600 dark:text-sky-300 shrink-0" />
                                <span className="truncate">حلبة تحدي الفرق</span>
                              </Link>

                              <Link
                                href="/mental-arithmetic/balloon-pop"
                                onClick={() => {
                                  playFx("pop");
                                  setProgramsOpen(false);
                                }}
                                className="p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-rose-50/90 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-800/60 active:scale-95 shadow-sm"
                              >
                                <span className="text-base">🎈</span>
                                <span className="truncate">تفجير البالونات</span>
                              </Link>

                              <Link
                                href="/mental-arithmetic/multiplication-division"
                                onClick={() => {
                                  playFx("pop");
                                  setProgramsOpen(false);
                                }}
                                className="p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-emerald-50/90 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/60 active:scale-95 shadow-sm"
                              >
                                <span className="text-base">✖️➗</span>
                                <span className="truncate">الضرب والقسمة</span>
                              </Link>
                            </div>
                          </div>
                        )}

                        {/* Capsule 2 Content: أقسام أسئلة وتحديات الذكاء */}
                        {activeNavCapsule === "iq" && (
                          <div className="space-y-2.5 animate-in fade-in duration-150">
                            <div className="flex items-center justify-between text-[11px] font-black text-violet-700 dark:text-violet-300 px-1">
                              <span>أقسام تحديات وأولمبياد الذكاء:</span>
                              <Link
                                href="/intelligence"
                                onClick={() => setProgramsOpen(false)}
                                className="underline hover:text-violet-600"
                              >
                                استكشاف بنك الأسئلة
                              </Link>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              <Link
                                href="/intelligence/quiz"
                                onClick={() => {
                                  playFx("pop");
                                  setProgramsOpen(false);
                                }}
                                className="p-3 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white flex items-center justify-between shadow-md hover:scale-[1.01] active:scale-95 transition-all"
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="text-xl">🧩</span>
                                  <div className="text-right">
                                    <div className="text-xs font-black">بدء اختبار الذكاء المباشر</div>
                                    <div className="text-[10px] text-white/80">ألغاز التفكير المنطقي والأنماط</div>
                                  </div>
                                </div>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white text-violet-900">
                                  ابدأ الآن 🔥
                                </span>
                              </Link>

                              <Link
                                href="/intelligence"
                                onClick={() => {
                                  playFx("pop");
                                  setProgramsOpen(false);
                                }}
                                className="p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between bg-violet-50/90 hover:bg-violet-100 dark:bg-violet-950/50 dark:hover:bg-violet-900/60 text-violet-900 dark:text-violet-200 border border-violet-200 dark:border-violet-800/60 active:scale-95 shadow-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <span>🏅</span>
                                  <span>أولمبياد الكانغورو والعباقرة</span>
                                </div>
                                <span className="text-[10px] font-black text-violet-600 dark:text-violet-400">
                                  الابتدائي والمتوسط ⬅
                                </span>
                              </Link>
                            </div>
                          </div>
                        )}

                        {/* Capsule 3 Content: أقسام أسرار الرياضيات */}
                        {activeNavCapsule === "vedic" && (
                          <div className="space-y-2.5 animate-in fade-in duration-150">
                            <div className="flex items-center justify-between text-[11px] font-black text-amber-800 dark:text-amber-300 px-1">
                              <span>مستويات أكاديمية أسرار الرياضيات (4 مستويات):</span>
                              <Link
                                href="/secrets-of-numbers"
                                onClick={() => setProgramsOpen(false)}
                                className="underline hover:text-amber-600"
                              >
                                فتح الأكاديمية (20 درساً)
                              </Link>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Link
                                href="/secrets-of-numbers"
                                onClick={() => {
                                  playFx("pop");
                                  setProgramsOpen(false);
                                }}
                                className="p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-emerald-50/90 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/60 active:scale-95 shadow-sm"
                              >
                                <span className="text-sm">🟢</span>
                                <div className="text-right min-w-0">
                                  <div className="font-black truncate">المستوى الأول</div>
                                  <div className="text-[9px] text-emerald-700 dark:text-emerald-300 truncate">أساسيات الحساب السريع</div>
                                </div>
                              </Link>

                              <Link
                                href="/secrets-of-numbers"
                                onClick={() => {
                                  playFx("pop");
                                  setProgramsOpen(false);
                                }}
                                className="p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-sky-50/90 hover:bg-sky-100 dark:bg-sky-950/50 dark:hover:bg-sky-900/60 text-sky-900 dark:text-sky-200 border border-sky-200 dark:border-sky-800/60 active:scale-95 shadow-sm"
                              >
                                <span className="text-sm">🔵</span>
                                <div className="text-right min-w-0">
                                  <div className="font-black truncate">المستوى الثاني</div>
                                  <div className="text-[9px] text-sky-700 dark:text-sky-300 truncate">مهارات الضرب السريع</div>
                                </div>
                              </Link>

                              <Link
                                href="/secrets-of-numbers"
                                onClick={() => {
                                  playFx("pop");
                                  setProgramsOpen(false);
                                }}
                                className="p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-purple-50/90 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800/60 active:scale-95 shadow-sm"
                              >
                                <span className="text-sm">🟣</span>
                                <div className="text-right min-w-0">
                                  <div className="font-black truncate">المستوى الثالث</div>
                                  <div className="text-[9px] text-purple-700 dark:text-purple-300 truncate">التربيع والجذور</div>
                                </div>
                              </Link>

                              <Link
                                href="/secrets-of-numbers"
                                onClick={() => {
                                  playFx("pop");
                                  setProgramsOpen(false);
                                }}
                                className="p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-amber-50/90 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-950 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60 active:scale-95 shadow-sm"
                              >
                                <span className="text-sm">🟠</span>
                                <div className="text-right min-w-0">
                                  <div className="font-black truncate">المستوى الرابع</div>
                                  <div className="text-[9px] text-amber-800 dark:text-amber-200 truncate">التطبيقات والكسور</div>
                                </div>
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            }

            if (item.isSpecial) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => playFx("pop")}
                  title={itemLabel}
                  aria-label={itemLabel}
                  className={`group w-10 h-10 xl:w-auto xl:h-auto xl:px-3.5 xl:py-2 rounded-2xl text-xs xl:text-[13px] font-black transition-all duration-200 flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 ${
                    active
                      ? "bg-gradient-to-b from-[#FB7185] to-[#E11D48] text-white shadow-[0_10px_20px_-6px_rgba(225,29,72,0.45),inset_0_2px_3px_rgba(255,255,255,0.45)]"
                      : "bg-gradient-to-b from-[#FFF2F6] to-[#FFE0EA] dark:from-[#3D182C] dark:to-[#2C101F] text-[#C81E52] dark:text-[#FDA4AF] border border-[#FECDD6] dark:border-[#702446] shadow-clay-sm hover:-translate-y-0.5"
                  }`}
                >
                  <HeartHandshake
                    className={`w-4 h-4 shrink-0 ${
                      active ? "text-white" : "text-rose-500 dark:text-rose-300"
                    }`}
                  />
                  <span className="hidden xl:inline">{itemLabel}</span>
                  <span className="hidden xl:inline-flex text-[10px] px-1.5 py-0.5 rounded-full bg-amber-300/40 text-amber-900 dark:text-amber-200 font-extrabold">
                    ⭐
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => playFx("pop")}
                title={itemLabel}
                aria-label={itemLabel}
                className={`w-10 h-10 xl:w-auto xl:h-auto xl:px-3 xl:py-2 rounded-2xl text-[13px] font-bold transition-all duration-200 flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 ${
                  active
                    ? "clay-btn-purple !rounded-2xl"
                    : "bg-[#F7F5FE] dark:bg-[#242146] text-[#4C4578] dark:text-[#D9D5F5] border border-[#E7E3FA] dark:border-[#363268] shadow-[0_4px_10px_-4px_rgba(68,52,138,0.1),inset_0_2px_2px_rgba(255,255,255,0.85)] dark:shadow-none hover:text-brand-600 dark:hover:text-brand-300 hover:-translate-y-0.5"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="hidden xl:inline">{itemLabel}</span>
              </Link>
            );
          })}

          {/* زر الخطوط: لاختيار اللغة والوضع الليلي/النهاري والتحكم بالأصوات وغيرها */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                playFx("toggle");
                setSettingsOpen((v) => !v);
              }}
              title={isEn ? "Menu & Settings (Language, Theme, Sound)" : "الخطوط: إعدادات المنصة (اللغة، المظهر، الصوت)"}
              aria-label={isEn ? "Menu & Settings" : "الخطوط: إعدادات المنصة"}
              aria-expanded={settingsOpen}
              className={`w-10 h-10 xl:w-auto xl:h-auto xl:px-3.5 xl:py-2 rounded-2xl text-[13px] font-black transition-all duration-200 flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 ${
                settingsOpen
                  ? "clay-btn-purple !rounded-2xl shadow-lg"
                  : "bg-[#F7F5FE] dark:bg-[#242146] text-[#4C4578] dark:text-[#D9D5F5] border border-[#E7E3FA] dark:border-[#363268] shadow-[0_4px_10px_-4px_rgba(68,52,138,0.1),inset_0_2px_2px_rgba(255,255,255,0.85)] dark:shadow-none hover:text-brand-600 dark:hover:text-brand-300 hover:-translate-y-0.5"
              }`}
            >
              <Menu className="w-4 h-4 shrink-0 text-brand-600 dark:text-brand-300" />
              <span className="hidden xl:inline">{isEn ? "Settings" : "الخيارات"}</span>
            </button>

            {/* Dropdown Menu for الخطوط */}
            {settingsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setSettingsOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute top-full end-0 mt-2.5 w-78 sm:w-80 p-4 clay-card bg-white/98 dark:bg-[#1E1B3E]/98 z-50 border border-[#E6E2FA] dark:border-[#343063] shadow-2xl rounded-3xl space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between border-b border-[#E6E2FA] dark:border-[#343063] pb-2.5">
                    <div className="flex items-center gap-2">
                      <Menu className="w-4 h-4 text-brand-600 dark:text-brand-300" />
                      <span className="text-xs font-black text-[#261E58] dark:text-[#F3F0FD]">
                        {isEn ? "Platform Controls" : "إعدادات وتحكم المنصة"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettingsOpen(false)}
                      className="clay-pill p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      title="إغلاق"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* زر البروفايل أولاً مع الصورة والاسم كما طلب المستخدم */}
                  {!isGuest && user ? (
                    <Link
                      href={role === "trainer" ? "/trainer" : "/dashboard"}
                      onClick={() => {
                        playFx("pop");
                        setSettingsOpen(false);
                      }}
                      className="clay-card-sm p-3 bg-gradient-to-r from-brand-50 via-indigo-50 to-purple-50 dark:from-brand-950/70 dark:via-indigo-950/70 dark:to-purple-950/70 border border-brand-200 dark:border-brand-800 flex items-center justify-between gap-3 shadow-sm hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-base shadow-md shrink-0 border border-white/60">
                          {profile?.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={profile.avatar_url} alt={profile?.name || "avatar"} className="w-full h-full object-cover rounded-2xl" />
                          ) : (
                            <span>{(profile?.name || user.email || "ب").charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="text-right min-w-0">
                          <div className="text-xs font-black text-[#261E58] dark:text-[#F3F0FD] truncate">
                            {profile?.name || user.email?.split("@")[0]}
                          </div>
                          <div className="text-[10px] font-bold text-brand-600 dark:text-brand-300 mt-0.5">
                            {role === "trainer" ? "مدرب معتمد 🎓" : role === "admin" ? "لوحة الإدارة 🛡️" : "طالب العقل الخارق 🌟"}
                          </div>
                        </div>
                      </div>
                      <span className="clay-btn-purple px-2.5 py-1 text-[11px] font-black shrink-0 !rounded-xl">
                        البروفايل 👤
                      </span>
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => {
                        playFx("pop");
                        setSettingsOpen(false);
                      }}
                      className="clay-card-sm p-3 bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-950/40 dark:to-indigo-950/40 border border-brand-200 dark:border-brand-800 flex items-center justify-between gap-2.5 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-black text-slate-800 dark:text-white">حساب المنصة</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">سجّل دخولك لحفظ النقاط والواجبات</div>
                        </div>
                      </div>
                      <span className="clay-btn-purple px-3 py-1 text-xs font-bold shrink-0 !rounded-xl">
                        دخول 🚀
                      </span>
                    </Link>
                  )}

                  {/* 1. Language & Theme Controls */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        toggleLanguage();
                        playFx("toggle");
                      }}
                      className="clay-pill flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-bold text-[#2E2759] dark:text-white hover:scale-105 active:scale-95"
                    >
                      <Globe className="w-3.5 h-3.5 text-brand-600 dark:text-brand-300" />
                      <span>{isEn ? "العربية" : "English"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        toggleTheme();
                        playFx("toggle");
                      }}
                      className="clay-pill flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-bold text-[#2E2759] dark:text-white hover:scale-105 active:scale-95"
                    >
                      {theme === "dark" ? (
                        <>
                          <Sun className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isEn ? "Light" : "وضع نهاري"}</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-3.5 h-3.5 text-brand-600" />
                          <span>{isEn ? "Dark" : "وضع ليلي"}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* 2. Sound Quick Toggle */}
                  <div className="clay-card-sm p-2.5 bg-[#F6F4FE] dark:bg-[#211E42] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const next = !soundEnabled;
                          toggleSound();
                          if (next) setTimeout(() => playFx("toggle"), 30);
                        }}
                        className="clay-pill p-1.5 text-[#2E2759] dark:text-white hover:scale-105 active:scale-95"
                        title={soundEnabled ? "كتم الصوت" : "تشغيل الصوت"}
                      >
                        {soundEnabled ? (
                          <Volume2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                      <span className="text-xs font-bold text-[#3B3469] dark:text-[#D5D0F5]">
                        {soundEnabled ? (isEn ? "Sound Enabled" : "الأصوات مفعّلة") : (isEn ? "Muted" : "الأصوات مكتومة")}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        playFx("toggle");
                        setAudioMenuOpen((v) => !v);
                      }}
                      className="clay-pill px-2.5 py-1 text-[11px] font-bold text-brand-600 dark:text-brand-300 hover:scale-105 active:scale-95"
                    >
                      {audioMenuOpen ? (isEn ? "Hide Volume" : "إخفاء الضبط") : (isEn ? "Volume & Voice" : "ضبط الأصوات")}
                    </button>
                  </div>

                  {/* Expanded Audio Settings if toggled */}
                  {audioMenuOpen && (
                    <div className="clay-card-sm p-3 bg-[#F6F4FE] dark:bg-[#211E42] border border-[#E4DFF9] dark:border-[#363268]">
                      <AudioControlPanel compact />
                    </div>
                  )}

                  {/* 3. Install App Option (if not installed) */}
                  {!isStandalone && (
                    <button
                      type="button"
                      onClick={() => {
                        playFx("pop");
                        setSettingsOpen(false);
                        installApp();
                      }}
                      className="w-full clay-card-sm p-2.5 bg-gradient-to-r from-amber-50 to-brand-50 dark:from-amber-950/40 dark:to-brand-950/40 border border-amber-300/80 dark:border-amber-700/60 flex items-center justify-between hover:scale-[1.02] active:scale-95 transition-all text-start"
                    >
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-xs font-black text-[#261E58] dark:text-[#F3F0FD]">
                          {isEn ? "Install Platform App" : "تثبيت المنصة كتطبيق"}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-800 dark:text-amber-200">
                        {isEn ? "Install" : "تثبيت"}
                      </span>
                    </button>
                  )}

                  {/* 4. Auth & Account status in menu */}
                  <div className="pt-1 border-t border-[#E6E2FA] dark:border-[#343063]">
                    {!isGuest && user ? (
                      <div className="flex items-center justify-between">
                        <Link
                          href={role === "trainer" ? "/trainer" : "/dashboard"}
                          onClick={() => {
                            playFx("pop");
                            setSettingsOpen(false);
                          }}
                          className="clay-pill px-3 py-1.5 text-brand-700 dark:text-brand-200 font-bold text-xs flex items-center gap-1.5"
                        >
                          <User className="w-3.5 h-3.5 text-brand-600 dark:text-brand-300" />
                          <span className="truncate max-w-[120px]">{profile?.name || user.email?.split("@")[0]}</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            signOut();
                            playFx("toggle");
                            setSettingsOpen(false);
                          }}
                          className="clay-pill p-1.5 text-rose-600 dark:text-rose-400 hover:scale-105 active:scale-95"
                          title={isEn ? "Sign Out" : "تسجيل الخروج"}
                        >
                          <LogOut className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <Link
                        href="/login"
                        onClick={() => {
                          playFx("pop");
                          setSettingsOpen(false);
                        }}
                        className="clay-btn-purple w-full py-2 !rounded-xl font-bold text-xs text-center block"
                      >
                        {isEn ? "Sign In to Account" : "تسجيل الدخول للمنصة"}
                      </Link>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </nav>

        {/* Action Controls (Clean, minimal, shows profile if logged in) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {!isGuest && user && (
            <div className="hidden sm:flex items-center gap-1.5">
              {role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => playFx("pop")}
                  className="clay-btn-amber px-2.5 sm:px-3.5 py-1.5 !rounded-2xl font-black text-xs flex items-center gap-1.5"
                  title="لوحة الإدارة"
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">لوحة الإدارة</span>
                </Link>
              )}
              <Link
                href={role === "trainer" ? "/trainer" : "/dashboard"}
                onClick={() => playFx("pop")}
                className="clay-pill px-2.5 sm:px-3.5 py-1.5 text-brand-700 dark:text-brand-200 font-bold text-[11px] sm:text-xs flex items-center gap-1.5 max-w-[100px] sm:max-w-[140px]"
                title={profile?.name || user.email || "حسابي"}
              >
                <User className="w-3.5 h-3.5 shrink-0 text-brand-600 dark:text-brand-300" />
                <span className="truncate">{profile?.name || user.email?.split("@")[0]}</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  playFx("toggle");
                }}
                title={isEn ? "Sign Out" : "تسجيل الخروج"}
                className="clay-pill p-2 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Mobile Lines/Menu Button (الخطوط على الهواتف < 768px) */}
          <button
            type="button"
            onClick={() => {
              playFx("toggle");
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="clay-pill p-2 text-[#2E2759] dark:text-[#F5F4FD] md:hidden focus:outline-none"
            aria-label={isEn ? "Quick Settings & Menu" : "الخطوط: الإعدادات والقائمة"}
            title={isEn ? "Menu & Settings" : "الخطوط: الإعدادات والقائمة"}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Direct Touch-Friendly Clay Icon Strip on Small Screens (< 768px) — Always Accessible Without Drawer */}
      <nav
        aria-label={isEn ? "Quick touch navigation" : "شريط الأيقونات السريع"}
        className="flex md:hidden items-center justify-between gap-1 px-2 py-1.5 border-t border-[#E6E2FA] dark:border-[#2E2B57] bg-[#F8F7FE]/95 dark:bg-[#151332]/95"
      >
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          const itemLabel = isEn ? item.enLabel : item.label;

          if (item.isSpecial) {
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  playFx("pop");
                  setMobileMenuOpen(false);
                }}
                title={itemLabel}
                aria-label={itemLabel}
                className={`flex-1 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                  active
                    ? "bg-gradient-to-b from-[#FB7185] to-[#E11D48] text-white shadow-md"
                    : "bg-gradient-to-b from-[#FFF2F6] to-[#FFE0EA] dark:from-[#3D182C] dark:to-[#2C101F] text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-700/60 shadow-clay-sm"
                }`}
              >
                <HeartHandshake className="w-4 h-4 shrink-0" />
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                playFx("pop");
                setMobileMenuOpen(false);
              }}
              title={itemLabel}
              aria-label={itemLabel}
              className={`flex-1 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                active
                  ? "clay-btn-purple !rounded-xl"
                  : "bg-white dark:bg-[#221F44] text-[#554E82] dark:text-[#DAD6F7] border border-[#E7E3FA] dark:border-[#343063] shadow-clay-sm"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
            </Link>
          );
        })}
      </nav>

      {/* Mobile Utility Drawer (< 768px) */}
      {mobileMenuOpen && (
        <div className="md:hidden max-h-[calc(100vh-7rem)] overflow-y-auto border-t border-[#E6E2FA] dark:border-[#2E2B57] bg-white/95 dark:bg-[#181636]/95 backdrop-blur-md px-4 pt-4 pb-8 space-y-4 animate-in slide-in-from-top-2 duration-150">
          {/* زر البروفايل أولاً مع الصورة والاسم كما طلب المستخدم */}
          {!isGuest && user ? (
            <Link
              href={role === "trainer" ? "/trainer" : "/dashboard"}
              onClick={() => {
                playFx("pop");
                setMobileMenuOpen(false);
              }}
              className="clay-card-sm p-3.5 bg-gradient-to-r from-brand-50 via-indigo-50 to-purple-50 dark:from-brand-950/70 dark:via-indigo-950/70 dark:to-purple-950/70 border border-brand-200 dark:border-brand-800 flex items-center justify-between gap-3 shadow-sm active:scale-95 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0 border border-white/60">
                  {profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar_url} alt={profile?.name || "avatar"} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <span>{(profile?.name || user.email || "ب").charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="text-right min-w-0">
                  <div className="text-sm font-black text-[#261E58] dark:text-[#F3F0FD] truncate">
                    {profile?.name || user.email?.split("@")[0]}
                  </div>
                  <div className="text-xs font-bold text-brand-600 dark:text-brand-300 mt-0.5">
                    {role === "trainer" ? "مدرب معتمد 🎓" : role === "admin" ? "لوحة الإدارة 🛡️" : "طالب العقل الخارق 🌟"}
                  </div>
                </div>
              </div>
              <span className="clay-btn-purple px-3 py-1.5 text-xs font-black shrink-0 !rounded-xl">
                البروفايل 👤
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => {
                playFx("pop");
                setMobileMenuOpen(false);
              }}
              className="clay-card-sm p-3.5 bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-950/40 dark:to-indigo-950/40 border border-brand-200 dark:border-brand-800 flex items-center justify-between gap-2.5 active:scale-95 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-slate-800 dark:text-white">تسجيل الدخول للمنصة</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">سجّل دخولك لحفظ الإنجازات والواجبات</div>
                </div>
              </div>
              <span className="clay-btn-purple px-3.5 py-1.5 text-xs font-bold shrink-0 !rounded-xl">
                دخول 🚀
              </span>
            </Link>
          )}

          {/* كبسولات برامج العقل الخارق للهاتف مقسمة 3 كبسولات تفاعلية */}
          <div className="clay-card-sm p-3.5 bg-[#F6F4FE] dark:bg-[#211E42] space-y-3">
            <div className="flex items-center justify-between border-b border-brand-200/60 dark:border-brand-800 pb-2">
              <span className="text-xs font-black text-[#261E58] dark:text-[#F3F0FD] flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-brand-600" />
                <span>برامج العقل الخارق</span>
              </span>
              <Link
                href="/mental-arithmetic"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[10px] font-black px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 hover:underline"
              >
                فتح الصفحة كاملة ⬅
              </Link>
            </div>

            {/* 3 Mobile Capsule Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/70 dark:bg-slate-900/60 rounded-xl border border-brand-200/60 dark:border-brand-800/40">
              <button
                type="button"
                onClick={() => {
                  playFx("click");
                  setActiveNavCapsule("mental");
                }}
                className={`py-1.5 px-1 rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-1 ${
                  activeNavCapsule === "mental"
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                <span>🧮</span>
                <span className="truncate">الحساب</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playFx("click");
                  setActiveNavCapsule("iq");
                }}
                className={`py-1.5 px-1 rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-1 ${
                  activeNavCapsule === "iq"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                <span>🧩</span>
                <span className="truncate">الذكاء</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playFx("click");
                  setActiveNavCapsule("vedic");
                }}
                className={`py-1.5 px-1 rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-1 ${
                  activeNavCapsule === "vedic"
                    ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                <span>✨</span>
                <span className="truncate">الأسرار</span>
              </button>
            </div>

            {/* Sub-sections for selected capsule on mobile */}
            {activeNavCapsule === "mental" && (
              <div className="space-y-1.5 animate-in fade-in duration-150">
                <div className="grid grid-cols-2 gap-1.5">
                  <Link
                    href="/mental-arithmetic/abacus"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-violet-50/90 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200 border border-violet-200/80 dark:border-violet-800/40"
                  >
                    <span>🧮</span>
                    <span className="truncate">العداد (السوروبان)</span>
                  </Link>

                  <Link
                    href="/mental-arithmetic/flash-anzan"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-amber-50/90 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-800/40"
                  >
                    <span>⚡</span>
                    <span className="truncate">فلاش أنزان</span>
                  </Link>

                  <Link
                    href="/mental-arithmetic/competition"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-yellow-50/90 dark:bg-yellow-950/40 text-yellow-900 dark:text-yellow-200 border border-yellow-200/80 dark:border-yellow-800/40"
                  >
                    <span>🏆</span>
                    <span className="truncate">محاكي المسابقات</span>
                  </Link>

                  <Link
                    href="/mental-arithmetic/teams-battle"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-sky-50/90 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 border border-sky-200/80 dark:border-sky-800/40"
                  >
                    <PodiumIcon className="w-3.5 h-3.5 text-sky-600 dark:text-sky-300 shrink-0" />
                    <span className="truncate">حلبة تحدي الفرق</span>
                  </Link>

                  <Link
                    href="/mental-arithmetic/balloon-pop"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-rose-50/90 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border border-rose-200/80 dark:border-rose-800/40"
                  >
                    <span>🎈</span>
                    <span className="truncate">تفجير البالونات</span>
                  </Link>

                  <Link
                    href="/mental-arithmetic/multiplication-division"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-800/40"
                  >
                    <span>✖️➗</span>
                    <span className="truncate">الضرب والقسمة</span>
                  </Link>
                </div>
              </div>
            )}

            {activeNavCapsule === "iq" && (
              <div className="space-y-1.5 animate-in fade-in duration-150">
                <Link
                  href="/intelligence/quiz"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white flex items-center justify-between text-xs font-black shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span>🧩</span>
                    <span>بدء اختبار الذكاء المباشر</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-violet-900">
                    ابدأ 🔥
                  </span>
                </Link>

                <Link
                  href="/intelligence"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-xs font-bold flex items-center justify-between bg-violet-50/90 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200 border border-violet-200/80 dark:border-violet-800/40"
                >
                  <div className="flex items-center gap-1.5">
                    <span>🏅</span>
                    <span>أولمبياد الكانغورو والعباقرة</span>
                  </div>
                  <span className="text-[10px] text-violet-600 dark:text-violet-400">
                    دخول ⬅
                  </span>
                </Link>
              </div>
            )}

            {activeNavCapsule === "vedic" && (
              <div className="space-y-1.5 animate-in fade-in duration-150">
                <Link
                  href="/secrets-of-numbers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center justify-between text-xs font-black shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span>✨</span>
                    <span>أكاديمية أسرار الرياضيات (20 درساً)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 font-black">
                    دخول 🚀
                  </span>
                </Link>

                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold">
                  <Link
                    href="/secrets-of-numbers"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-900/60 border border-amber-200 text-slate-800 dark:text-slate-200 text-center truncate"
                  >
                    🟢 المستوى 1: الأساسيات
                  </Link>
                  <Link
                    href="/secrets-of-numbers"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-900/60 border border-amber-200 text-slate-800 dark:text-slate-200 text-center truncate"
                  >
                    🔵 المستوى 2: مهارات الضرب
                  </Link>
                  <Link
                    href="/secrets-of-numbers"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-900/60 border border-amber-200 text-slate-800 dark:text-slate-200 text-center truncate"
                  >
                    🟣 المستوى 3: التربيع والجذور
                  </Link>
                  <Link
                    href="/secrets-of-numbers"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-900/60 border border-amber-200 text-slate-800 dark:text-slate-200 text-center truncate"
                  >
                    🟠 المستوى 4: التطبيقات
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* عناصر التحكم السريعة (اللغة، الثيم، الصوت) */}
          <div className="clay-card-sm flex items-center justify-between p-3 bg-[#F6F4FE] dark:bg-[#211E42]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  toggleLanguage();
                  playFx("toggle");
                }}
                className="clay-pill px-3 py-1.5 text-[#2E2759] dark:text-white font-black text-xs flex items-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5 text-brand-600" />
                <span>{isEn ? "العربية" : "English"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  toggleTheme();
                  playFx("toggle");
                }}
                className="clay-pill p-2 text-[#2E2759] dark:text-white"
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-brand-600" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  const next = !soundEnabled;
                  toggleSound();
                  if (next) setTimeout(() => playFx("toggle"), 30);
                }}
                className="clay-pill p-2 text-[#2E2759] dark:text-white"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>

            <span className="text-xs text-brand-600 dark:text-brand-300 font-extrabold">
              {isEn ? "SUPER MIND" : "العقل الخارق"}
            </span>
          </div>

          <div className="clay-card-sm p-3.5 bg-[#F6F4FE] dark:bg-[#211E42]">
            <AudioControlPanel compact />
          </div>

          {!isStandalone && (
            <div className="clay-card-sm p-3 bg-gradient-to-r from-amber-50 via-brand-50 to-indigo-50 dark:from-amber-950/40 dark:via-brand-950/40 dark:to-indigo-950/40 border border-amber-300/80 dark:border-amber-700/60 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#1a1738] border border-amber-400/60 flex items-center justify-center shadow-sm shrink-0">
                  <Smartphone className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-right min-w-0">
                  <div className="text-xs font-black text-[#261E58] dark:text-[#F3F0FD] truncate">
                    تثبيت تطبيق SUPER MIND
                  </div>
                  <div className="text-[10px] text-[#635A94] dark:text-[#B6B0E3] truncate">
                    تشغيل سريع وتدريب شاشة كاملة بدون متصفح
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  playFx("pop");
                  setMobileMenuOpen(false);
                  installApp();
                }}
                className="clay-btn-purple px-3 py-1.5 text-xs font-black shrink-0 !rounded-xl"
              >
                تثبيت الآن 📲
              </button>
            </div>
          )}

          {/* أزرار الحساب والإدارة */}
          {!isGuest && user && (
            <div className="pt-1 flex items-center justify-between">
              {role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="clay-btn-amber py-2 px-3 font-black text-xs text-center flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>لوحة الإدارة</span>
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="clay-pill px-4 py-2 text-rose-600 dark:text-rose-300 font-bold text-xs"
              >
                تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
