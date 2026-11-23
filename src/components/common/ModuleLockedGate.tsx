"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Lock,
  Construction,
  Shield,
  ArrowRight,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  ProgramModuleId,
  checkModuleAccess,
  isLocalDevMode,
} from "@/lib/module-access";

interface ModuleLockedGateProps {
  moduleId: ProgramModuleId;
  moduleNameAr: string;
  moduleIcon: string;
  children: React.ReactNode;
}

export default function ModuleLockedGate({
  moduleId,
  moduleNameAr,
  moduleIcon,
  children,
}: ModuleLockedGateProps) {
  const { role, user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [devAdminOverride, setDevAdminOverride] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasOverride =
      typeof window !== "undefined" &&
      window.localStorage.getItem("supermind_dev_admin_override") === "true";
    setDevAdminOverride(hasOverride);
  }, []);

  const access = checkModuleAccess(
    moduleId,
    devAdminOverride ? "admin" : role,
    user?.email
  );

  const toggleDevAdmin = () => {
    if (typeof window === "undefined") return;
    const nextVal = !devAdminOverride;
    if (nextVal) {
      window.localStorage.setItem("supermind_dev_admin_override", "true");
    } else {
      window.localStorage.removeItem("supermind_dev_admin_override");
    }
    setDevAdminOverride(nextVal);
    window.location.reload();
  };

  // Prevent flash of locked screen during SSR / initial hydration
  if (!mounted) {
    return <div className="min-h-screen bg-[#F8F7FF] dark:bg-[#120F24]" />;
  }

  // User has access (e.g. Admin or Trainer for their respective modules)
  if (access.isAccessible) {
    const isUnderDevNotice = access.status !== "open";

    return (
      <div className="relative min-h-screen">
        {/* Development & Testing Mode Top Ribbon */}
        {isUnderDevNotice && (
          <div
            className={`w-full py-2 px-4 text-xs font-black flex flex-wrap items-center justify-between gap-2 border-b z-50 ${
              access.status === "trainer_only"
                ? "bg-amber-400 text-slate-950 border-amber-500 shadow-sm"
                : "bg-purple-900 text-purple-100 border-purple-700 shadow-sm"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {access.status === "trainer_only" ? "🚧" : "🛠️"}
              </span>
              <span>
                {access.status === "trainer_only"
                  ? `جاري التطوير — متاح حالياً لمعاينة وتدريب المدربين (${moduleNameAr})`
                  : `وضع التطوير والمعاينة الخاص بالأدمن (Admin Mode) — ${moduleNameAr} مقفول لباقي المستخدمين`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isLocalDevMode() && (
                <button
                  type="button"
                  onClick={toggleDevAdmin}
                  className="px-2.5 py-0.5 rounded-lg bg-black/20 hover:bg-black/30 text-[11px] font-bold transition-all"
                  title="التبديل لواجهة الطالب لاختبار القفل"
                >
                  {devAdminOverride ? "تجربة واجهة الطالب 👤" : "تفعيل كأدمن 🛡️"}
                </button>
              )}
              <Link
                href="/mental-arithmetic"
                className="underline hover:opacity-80 text-[11px]"
              >
                العودة للبرامج
              </Link>
            </div>
          </div>
        )}

        {children}
      </div>
    );
  }

  // Module is locked for the current user:
  const isTrainerOnly = access.status === "trainer_only";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F7FF] via-[#F2EEFF] to-[#E9E4FC] dark:from-[#130F26] dark:via-[#191535] dark:to-[#0F0C20] py-12 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-xl w-full clay-card !p-6 sm:!p-8 text-center space-y-6 shadow-2xl border-2 border-brand-500/30 rounded-[2.5rem]">
        {/* Animated Badge & Icon */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-black shadow-md flex items-center gap-1.5 ${
                isTrainerOnly
                  ? "bg-amber-400 text-slate-950"
                  : "bg-purple-600 text-white"
              }`}
            >
              {isTrainerOnly ? (
                <>
                  <Construction className="w-3.5 h-3.5" />
                  <span>جاري التطوير والتحديث 🚧</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>قريباً في التحديث القادم 🔒</span>
                </>
              )}
            </span>
          </div>

          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center text-5xl shadow-xl border-4 border-white/60 dark:border-white/10 animate-bounce duration-1000">
            {moduleIcon}
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-2.5">
          <h1 className="text-xl sm:text-2xl font-black text-[#261E58] dark:text-white">
            برنامج {moduleNameAr}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-md mx-auto">
            {isTrainerOnly ? (
              <>
                هذا القسم يخضع حالياً لعمليات تطوير وتوسعة شاملة 🚧 ومتاح
                حالياً <strong>للكادر التدريبي وإدارة المنصة فقط</strong>.
                ترقبوا إطلاقه لجميع الطلاب قريباً جداً في التحديث القادم!
              </>
            ) : (
              <>
                يجري العمل على إعداد واختبار هذا البرنامج بأعلى معايير الجودة
                والاحترافية 🔒. هذا القسم متاح حالياً{" "}
                <strong>لإدارة المنصة (Admin) فقط</strong> أثناء مرحلة
                التطوير وسيتوفر لجميع أبطالنا قريباً بإذن الله!
              </>
            )}
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-black/30 border border-brand-200/60 dark:border-brand-900/50 text-xs font-bold text-slate-700 dark:text-slate-300 space-y-2 text-right">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              {isTrainerOnly
                ? "متاح لمعاينة وتدريب المدربين المعتمدين وإدارة المنصة"
                : "قيد المراجعة والاختبار المحلي من قبل إدارة المنصة"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              أقسام الحساب الذهني، الذاكرة، وأكاديمية السودوكو مفتوحة للتدريب
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Link
            href="/mental-arithmetic"
            className="clay-btn-purple w-full py-3.5 px-5 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl !rounded-2xl"
          >
            <ArrowRight className="w-4 h-4" />
            <span>الانتقال إلى الأقسام المفتوحة للتدريب 🧮</span>
          </Link>

          {!user && (
            <Link
              href="/login"
              className="clay-btn-amber w-full py-3 px-4 font-black text-xs flex items-center justify-center gap-2 shadow-md !rounded-2xl text-slate-950"
            >
              <Shield className="w-4 h-4" />
              <span>
                {isTrainerOnly
                  ? "تسجيل دخول كمدرب أو مسؤول 👨‍🏫"
                  : "تسجيل دخول كمسؤول (Admin) 🛡️"}
              </span>
            </Link>
          )}

          {/* Local Development Mode Quick Switcher */}
          {isLocalDevMode() && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={toggleDevAdmin}
                className="w-full py-2 px-3 rounded-xl bg-purple-100 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200 text-[11px] font-black flex items-center justify-center gap-1.5 hover:bg-purple-200 transition-all"
              >
                <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                <span>
                  {devAdminOverride
                    ? "أنت في وضع الأدمن حالياً (انقر لإعادة القفل)"
                    : "⚡ تفعيل صلاحية الأدمن للاختبار المحلي الفوري"}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
