"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Zap,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Loader2,
} from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";

export default function LoginPage() {
  const router = useRouter();
  const { language, dir, playFx } = useApp();
  const isEn = language === "en";
  const ArrowIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

  const {
    signInWithEmail,
    signInWithGoogle,
    resetPasswordForEmail,
    enterGuestMode,
    isSupabaseReady,
    isGoogleConfigured,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password Reset Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [resetError, setResetError] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage(isEn ? "Please enter both email and password." : "يرجى إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }

    setIsSubmitting(true);
    playFx("click");

    const res = await signInWithEmail(email, password);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(
        res.error || (isEn ? "Failed to sign in. Please verify your credentials." : "فشل تسجيل الدخول. يرجى التحقق من صحة البيانات.")
      );
      playFx("wrong");
    } else {
      setSuccessMessage(isEn ? "Welcome back! Redirecting..." : "أهلاً بك مجدداً! جاري التحويل...");
      playFx("fanfare");
      setTimeout(() => {
        router.push("/dashboard");
      }, 700);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);

    if (!isSupabaseReady) {
      setErrorMessage(
        isEn
          ? "Supabase credentials are not configured yet. Please add them to your environment variables."
          : "خدمة المصادقة عبر Google بانتظار إدخال مفاتيح Supabase في ملف الإعدادات."
      );
      return;
    }

    playFx("click");
    setIsSubmitting(true);
    const res = await signInWithGoogle();
    if (!res.success) {
      setIsSubmitting(false);
      setErrorMessage(res.error || (isEn ? "Google login failed" : "فشل تسجيل الدخول باستخدام Google"));
      playFx("wrong");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    setResetStatus("loading");
    setResetError("");

    const res = await resetPasswordForEmail(resetEmail);
    if (res.success) {
      setResetStatus("success");
      playFx("correct");
    } else {
      setResetStatus("error");
      setResetError(res.error || (isEn ? "Failed to send reset link." : "تعذر إرسال رابط الاستعادة."));
      playFx("wrong");
    }
  };

  const handleStartGuestMode = () => {
    playFx("fanfare");
    enterGuestMode();
    router.push("/mental-arithmetic");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <BrandLogo size="lg" />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-4">
            {isEn ? "Sign In to SUPER MIND" : "تسجيل الدخول إلى المنصة"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isEn
              ? "Access your personal training profile, track progress, and climb the leaderboard."
              : "ادخل إلى حسابك لمتابعة تدريبك اليومي، مراجعة دقة إجاباتك، والمنافسة في التحديات."}
          </p>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5 shadow-sm">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-semibold">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-bold">{successMessage}</div>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          {/* Google OAuth Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-2xl border transition-all flex items-center justify-center gap-3 font-bold text-xs sm:text-sm shadow-xs ${
                isGoogleConfigured && isSupabaseReady
                  ? "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-slate-400 active:scale-98"
                  : "bg-slate-100 dark:bg-slate-800/60 text-slate-400 border-slate-200 dark:border-slate-800 cursor-not-allowed"
              }`}
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isEn ? "Continue with Google" : "المتابعة باستخدام Google"}</span>
            </button>
            {!isSupabaseReady && (
              <span className="block text-[10px] text-center text-slate-400 mt-1">
                {isEn ? "(Active upon adding Supabase Google OAuth keys)" : "(يتم تفعيل المتابعة الفورية عند إدخال مفاتيح الربط)"}
              </span>
            )}
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-400 shrink-0">
              {isEn ? "Or with email" : "أو بالبريد الإلكتروني"}
            </span>
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {isEn ? "Email Address" : "البريد الإلكتروني"}
              </label>
              <div className="relative">
                <Mail className={`w-4 h-4 text-slate-400 absolute ${dir === "rtl" ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2`} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full ${dir === "rtl" ? "pr-10 pl-3.5" : "pl-10 pr-3.5"} py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-colors`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {isEn ? "Password" : "كلمة المرور"}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(true);
                    setResetStatus("idle");
                    setResetEmail(email);
                  }}
                  className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                >
                  {isEn ? "Forgot password?" : "نسيت كلمة المرور؟"}
                </button>
              </div>
              <div className="relative">
                <Lock className={`w-4 h-4 text-slate-400 absolute ${dir === "rtl" ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2`} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full ${dir === "rtl" ? "pr-10 pl-3.5" : "pl-10 pr-3.5"} py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-colors`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-black text-sm shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isEn ? "Signing in..." : "جاري تسجيل الدخول..."}</span>
                </>
              ) : (
                <>
                  <span>{isEn ? "Sign In" : "تسجيل الدخول"}</span>
                  <ArrowIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            {isEn ? "Don't have an account yet?" : "ليس لديك حساب بعد؟"}{" "}
            <Link href="/register" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
              {isEn ? "Create Free Account" : "إنشاء حساب جديد مجاناً"}
            </Link>
          </div>
        </div>

        {/* =========================================================================
            SECTION 2: PROMINENT GREEN GUEST MODE (تجربة المنصة مجاناً دون تسجيل)
           ========================================================================= */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white p-6 sm:p-7 shadow-xl shadow-emerald-600/20 border-2 border-emerald-400/80 space-y-4">
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-white/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md text-emerald-100 shrink-0 border border-white/25">
              <Zap className="w-6 h-6 text-amber-300 fill-amber-300" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black tracking-wide uppercase border border-white/20">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>{isEn ? "100% Free Practice" : "تدريب مجاني 100%"}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                {isEn ? "Try the Platform Free Without Signing In!" : "جرّب المنصة مجاناً دون تسجيل!"}
              </h2>
              <p className="text-emerald-100 text-xs leading-relaxed">
                {isEn
                  ? "Start training immediately. Your progress, speed, and accuracy will be saved on this device and browser."
                  : "ابدأ التدريب فوراً، وسيُحفظ تقدمك على هذا الجهاز والمتصفح."}
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-1">
            <button
              type="button"
              onClick={handleStartGuestMode}
              className="w-full py-3.5 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-950 font-black text-xs sm:text-sm shadow-lg transition-transform hover:scale-101 active:scale-98 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{isEn ? "Start Training for Free" : "ابدأ التدريب مجاناً"}</span>
              <ArrowIcon className="w-4 h-4 text-emerald-800 transition-transform group-hover:translate-x-1" />
            </button>

            <p className="text-[11px] text-emerald-200 text-center mt-2.5 leading-snug">
              {isEn
                ? "Note: Progress may be lost if browser cache is cleared. Create a free account to sync achievements across all devices."
                : "قد يُفقد التقدم عند حذف بيانات المتصفح. أنشئ حساباً مجانياً لحفظ إنجازاتك عبر الأجهزة."}
            </p>
          </div>
        </section>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {isEn ? "Reset Password" : "استعادة كلمة المرور"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isEn ? "Enter your email to receive a password reset link." : "أدخل بريدك الإلكتروني لإرسال رابط إعادة تعيين كلمة المرور."}
                </p>
              </div>
            </div>

            {resetStatus === "success" ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-xs text-emerald-900 dark:text-emerald-300 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{isEn ? "Reset link sent successfully!" : "تم إرسال رابط الاستعادة بنجاح!"}</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {isEn
                    ? "Check your inbox (and spam folder) for the reset link."
                    : "يرجى تفقد صندوق الوارد أو البريد غير الهام (Spam) لفتح الرابط وإعادة تعيين كلمة المرور."}
                </p>
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="w-full mt-3 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  {isEn ? "Close" : "إغلاق"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {resetError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                    {resetError}
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    {isEn ? "Registered Email" : "البريد الإلكتروني المسجل"}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={resetStatus === "loading"}
                    className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {resetStatus === "loading" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isEn ? "Send Reset Link" : "إرسال رابط الاستعادة"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
                  >
                    {isEn ? "Cancel" : "إلغاء"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
