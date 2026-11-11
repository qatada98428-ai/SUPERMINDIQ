"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Globe,
  Sparkles,
  Calculator,
  Award,
  Users,
  HelpCircle,
  HeartHandshake,
  ShieldCheck,
  User,
  LogOut,
} from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { language, theme, soundEnabled, toggleLanguage, toggleTheme, toggleSound, playFx } = useApp();
  const { user, profile, role, isGuest, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isEn = language === "en";
  const isHomePage = pathname === "/";

  // Clean, quiet navigation items with "الداعمون" highlighted with a distinctive prestigious theme
  const navItems = [
    { href: "/", label: "الرئيسية", enLabel: "Home", icon: Sparkles },
    { href: "/mental-arithmetic", label: "الحساب الذهني", enLabel: "Mental Math", icon: Calculator },
    { href: "/trainers", label: "الاعتمادات والشركاء", enLabel: "Accreditations & Partners", icon: Award },
    {
      href: "/supporters",
      label: "الداعمون",
      enLabel: "Supporters",
      icon: HeartHandshake,
      isSpecial: true, // Special distinctive styling requested by user
    },
    { href: "/about", label: "من نحن", enLabel: "About Us", icon: Users },
    { href: "/support", label: "الدعم الفني", enLabel: "Support", icon: HelpCircle },
  ];

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="shrink-0">
          <BrandLogo />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const active = isActive(item.href);

            // Special Distinctive Styling for "الداعمون"
            if (item.isSpecial) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => playFx("click")}
                  className={`px-3.5 py-1.5 rounded-2xl text-xs xl:text-sm font-black transition-all duration-300 flex items-center gap-1.5 border shadow-sm ${
                    active
                      ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white border-amber-400 shadow-md scale-105"
                      : "bg-gradient-to-r from-amber-500/10 via-rose-500/15 to-amber-500/10 dark:from-amber-950/40 dark:via-rose-950/50 dark:to-amber-950/40 text-rose-700 dark:text-rose-300 border-rose-300/80 dark:border-rose-700/60 hover:from-rose-500 hover:to-amber-500 hover:text-white hover:border-transparent hover:scale-105"
                  }`}
                >
                  <HeartHandshake className="w-4 h-4 text-rose-500 group-hover:text-white animate-pulse" />
                  <span>{isEn ? item.enLabel : item.label}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400/30 text-amber-900 dark:text-amber-200 font-extrabold">
                    ⭐️
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => playFx("click")}
                className={`px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${
                  active
                    ? "bg-brand-50 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
                }`}
              >
                <span>{isEn ? item.enLabel : item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Controls: Quiet and Uncluttered */}
        <div className="flex items-center gap-2">
          {/* Language & Day/Night Mode: Appears in the Navbar on the Homepage as requested */}
          {isHomePage && (
            <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              {/* Language Switcher */}
              <button
                onClick={() => {
                  toggleLanguage();
                  playFx("click");
                }}
                title={isEn ? "التبديل إلى العربية" : "Switch to English"}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-800 dark:text-slate-200 text-xs font-black shadow-xs transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span>{isEn ? "عربي" : "EN"}</span>
              </button>

              {/* Theme Mode Switcher */}
              <button
                onClick={() => {
                  toggleTheme();
                  playFx("click");
                }}
                title={theme === "dark" ? "الوضع الفاتح" : "الوضع الليلي"}
                className="p-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 shadow-xs transition-colors"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>

              {/* Sound Toggle */}
              <button
                onClick={() => {
                  toggleSound();
                  if (!soundEnabled) playFx("click");
                }}
                title={soundEnabled ? "كتم الصوت" : "تشغيل الصوت"}
                className="p-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 shadow-xs transition-colors"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
          )}

          {/* Auth Action Controls */}
          {!isGuest && user ? (
            <div className="flex items-center gap-1.5">
              {role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => playFx("click")}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-sm flex items-center gap-1.5 transition-transform hover:scale-102"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">لوحة الإدارة</span>
                </Link>
              )}
              <Link
                href={role === "trainer" ? "/trainer" : "/dashboard"}
                onClick={() => playFx("click")}
                className="px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 font-bold text-xs flex items-center gap-1.5 max-w-[130px]"
                title={profile?.name || user.email || "حسابي"}
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{profile?.name || user.email?.split("@")[0]}</span>
              </Link>
              <button
                onClick={() => {
                  signOut();
                  playFx("click");
                }}
                title={isEn ? "Sign Out" : "تسجيل الخروج"}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => playFx("click")}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
            >
              {isEn ? "Sign In" : "تسجيل الدخول"}
            </Link>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 lg:hidden focus:outline-none"
            aria-label="القائمة الرئيسية"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-4 pt-4 pb-8 space-y-4 animate-in slide-in-from-top duration-200">
          {/* Toggles inside Mobile Menu */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  toggleLanguage();
                  playFx("click");
                }}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-black text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-xs"
              >
                <Globe className="w-3.5 h-3.5 text-brand-600" />
                <span>{isEn ? "العربية" : "English"}</span>
              </button>

              <button
                onClick={() => {
                  toggleTheme();
                  playFx("click");
                }}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 shadow-xs"
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  toggleSound();
                  if (!soundEnabled) playFx("click");
                }}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 shadow-xs"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>

            <span className="text-xs text-slate-500 font-bold">
              {isEn ? "SUPER MIND" : "العقل الخارق"}
            </span>
          </div>

          {/* Clean Links in Drawer */}
          <div className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              if (item.isSpecial) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-2xl text-sm font-black flex items-center justify-between bg-gradient-to-r from-amber-500/15 via-rose-500/20 to-amber-500/15 dark:from-amber-950/60 dark:via-rose-950/60 dark:to-amber-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700"
                  >
                    <div className="flex items-center gap-3">
                      <HeartHandshake className="w-5 h-5 text-rose-500 animate-pulse" />
                      <span>{isEn ? item.enLabel : item.label}</span>
                    </div>
                    <span className="text-xs">⭐️ شركاء صناعة العقول</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors ${
                    active
                      ? "bg-brand-50 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 border-r-4 border-brand-600"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-brand-600" : "text-slate-400"}`} />
                  <span>{isEn ? item.enLabel : item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            {!isGuest && user ? (
              <div className="space-y-2">
                {role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs text-center flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>الدخول إلى لوحة الإدارة العليا</span>
                  </Link>
                )}
                <div className="flex items-center gap-2">
                  <Link
                    href={role === "trainer" ? "/trainer" : "/dashboard"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs text-center"
                  >
                    {role === "trainer" ? "لوحة المدرب" : "لوحة الطالب"}
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs"
                  >
                    خروج
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-block text-center py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md"
                >
                  {isEn ? "Sign In to Account" : "تسجيل الدخول للمنصة"}
                </Link>
                <Link
                  href="/mental-arithmetic"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-block text-center py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  {isEn ? "Practice as Guest (Free)" : "التدريب مجاناً (وضع الزائر)"}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
