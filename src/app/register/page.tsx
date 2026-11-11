"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  UserCheck,
  Lock,
  Mail,
  User,
  Phone,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";

export default function RegisterPage() {
  const router = useRouter();
  const { language, dir, playFx } = useApp();
  const isEn = language === "en";
  const ArrowIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

  const { signUpWithEmail } = useAuth();

  const [requestedRole, setRequestedRole] = useState<"student" | "trainer">("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage(isEn ? "Please enter your full name." : "يرجى إدخال الاسم الثلاثي.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage(isEn ? "Please enter your email." : "يرجى إدخال البريد الإلكتروني.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage(isEn ? "Password must be at least 6 characters." : "يجب أن تتكون كلمة المرور من 6 خانات على الأقل.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage(isEn ? "Passwords do not match." : "كلمتا المرور غير متطابقتين.");
      return;
    }

    setIsSubmitting(true);
    playFx("click");

    const res = await signUpWithEmail(email, password, name, phone, requestedRole);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || (isEn ? "Failed to create account." : "تعذر إنشاء الحساب. يرجى التأكد من صحة البيانات."));
      playFx("wrong");
    } else {
      if (requestedRole === "trainer") {
        setSuccessMessage(
          isEn
            ? "Account created! Your trainer application has been submitted for administrative review."
            : "تم إنشاء الحساب بنجاح! تم استلام طلب الاعتماد كمدرب ويخضع للتدقيق الإداري."
        );
      } else {
        setSuccessMessage(
          isEn
            ? "Account created successfully! Welcome to SUPER MIND."
            : "تم إنشاء حسابك بنجاح! أهلاً بك في منصة العقل الخارق."
        );
      }
      playFx("fanfare");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <BrandLogo size="lg" />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-4">
            {isEn ? "Create New Account" : "إنشاء حساب جديد على المنصة"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isEn
              ? "Join the champions of mental arithmetic and start your interactive journey today."
              : "انضم إلى أبطال الحساب الذهني وابدأ التدريب التفاعلي اليوم."}
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

        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          {/* Role selector */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setRequestedRole("student")}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                requestedRole === "student"
                  ? "bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>{isEn ? "Student Account" : "تسجيل طالب"}</span>
            </button>

            <button
              type="button"
              onClick={() => setRequestedRole("trainer")}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                requestedRole === "trainer"
                  ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{isEn ? "Trainer Request" : "طلب اعتماد مدرب"}</span>
            </button>
          </div>

          {requestedRole === "trainer" && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-900 dark:text-amber-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {isEn
                  ? "Trainer accreditation requires administrative review and verification before elevated coach privileges are granted."
                  : "تمنح صلاحيات المدرب المعتمد بعد مراجعة الإدارة وتدقيق رخصة التدريب لضمان جودة التعليم."}
              </p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {isEn ? "Full Name" : "الاسم الثلاثي"} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className={`w-4 h-4 text-slate-400 absolute ${dir === "rtl" ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2`} />
                <input
                  type="text"
                  required
                  placeholder={isEn ? "e.g. Ali Haidar" : "مثال: علي حيدر الزبيدي"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full ${dir === "rtl" ? "pr-10 pl-3.5" : "pl-10 pr-3.5"} py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {isEn ? "Phone Number (WhatsApp)" : "رقم الهاتف (واتساب)"}
              </label>
              <div className="relative">
                <Phone className={`w-4 h-4 text-slate-400 absolute ${dir === "rtl" ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2`} />
                <input
                  type="tel"
                  placeholder="0780xxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full ${dir === "rtl" ? "pr-10 pl-3.5" : "pl-10 pr-3.5"} py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {isEn ? "Email Address" : "البريد الإلكتروني"} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className={`w-4 h-4 text-slate-400 absolute ${dir === "rtl" ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2`} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full ${dir === "rtl" ? "pr-10 pl-3.5" : "pl-10 pr-3.5"} py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {isEn ? "Password" : "كلمة المرور (6 خانات فأكثر)"} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className={`w-4 h-4 text-slate-400 absolute ${dir === "rtl" ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2`} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full ${dir === "rtl" ? "pr-10 pl-3.5" : "pl-10 pr-3.5"} py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {isEn ? "Confirm Password" : "تأكيد كلمة المرور"} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className={`w-4 h-4 text-slate-400 absolute ${dir === "rtl" ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2`} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full ${dir === "rtl" ? "pr-10 pl-3.5" : "pl-10 pr-3.5"} py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded-2xl text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-70 mt-2 ${
                requestedRole === "student"
                  ? "bg-brand-600 hover:bg-brand-500 shadow-brand-500/20"
                  : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isEn ? "Creating Account..." : "جاري إنشاء الحساب..."}</span>
                </>
              ) : (
                <>
                  <span>
                    {requestedRole === "student"
                      ? isEn
                        ? "Create Student Account"
                        : "إنشاء حساب طالب"
                      : isEn
                      ? "Submit Trainer Application"
                      : "إرسال طلب اعتماد مدرب"}
                  </span>
                  <ArrowIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            {isEn ? "Already have an account?" : "لديك حساب بالفعل؟"}{" "}
            <Link href="/login" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
              {isEn ? "Sign in here" : "تسجيل الدخول من هنا"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
