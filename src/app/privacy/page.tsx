"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, UserCheck, EyeOff, ArrowLeft, ArrowRight, HeartHandshake } from "lucide-react";
import { PLATFORM_INFO } from "@/lib/constants";
import { useApp } from "@/context/AppContext";

export default function PrivacyPage() {
  const { language, dir } = useApp();
  const isEn = language === "en";
  const ArrowIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          <span>{isEn ? "Data Protection & Privacy" : "حماية البيانات والخصوصية"}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          {isEn ? "Privacy Policy | SUPER MIND" : "سياسة الخصوصية | منصة العقل الخارق"}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {isEn ? "Last updated: 2026" : "تاريخ التحديث الأخير: 2026"}
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
        {/* Child Safety Principle */}
        <section className="space-y-3 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-black text-base">
            <HeartHandshake className="w-5 h-5 text-emerald-600" />
            <span>{isEn ? "Child Privacy & Safe Learning Environment" : "بيئة آمنة وحماية خصوصية الأطفال"}</span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">
            {isEn
              ? "SUPER MIND is designed for students and children. We do not sell child data, do not display third-party advertisements, and do not track users across external platforms."
              : "منصة العقل الخارق مُصممة لخدمة الأطفال والناشئة، ونلتزم بأعلى معايير الأمان الرقمي؛ حيث لا نقوم ببيع بيانات الأطفال، ولا نعرض إعلانات تجارية خارجية، ولا نتتبع نشاط المستخدمين خارج بيئة المنصة."}
          </p>
        </section>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-brand-600" />
            <span>1. البيانات التي يتم حفظها محلياً (Local Storage)</span>
          </h2>
          <p>
            تستخدم المنصة التخزين المحلي في متصفحك لحفظ تقدم التمارين، سجلات السرعة والدقة في الفلاش أنزان، نتائج مسابقات الفرق، وتفضيلات اللغة والوضع الليلي والصوت. هذه البيانات تظل محفوظة على جهازك الخاص ولا يتم مشاركتها مع أي جهة خارجية.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            <span>2. بيانات دليل المدربين والمدارس</span>
          </h2>
          <p>
            البيانات المنشورة في دليل المدربين ودليل المدارس (مثل الاسم، اللقب، المحافظة، وأرقام التواصل عبر واتساب) يتم إدراجها بموافقة صريحة من أصحابها لغرض تسهيل تواصل أولياء الأمور والطلاب معهم. يمكن لأي مدرب أو مدرسة طلب تعديل أو حذف بياناته في أي وقت عبر التواصل مع الإدارة.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-amber-600" />
            <span>3. التواصل والدعم الفني</span>
          </h2>
          <p>
            عند التواصل معنا عبر واتساب أو البريد الإلكتروني ({PLATFORM_INFO.supportEmail})، نستخدم معلومات التواصل فقط للرد على استفسارك وحل أي مشكلة تقنية، ونشدد دائماً على عدم إرسال أي بيانات سرية أو صور غير مصرح بها.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            4. التواصل بخصوص الخصوصية
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            لأي استفسار يخص سياسة الخصوصية، يرجى مراسلتنا عبر:{" "}
            <strong className="text-brand-600 dark:text-brand-400 font-mono">{PLATFORM_INFO.email}</strong> أو هاتفياً عبر واتساب على الرقم:{" "}
            <strong className="font-mono" dir="ltr">{PLATFORM_INFO.whatsappNumber}</strong>.
          </p>
        </section>
      </div>

      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all"
        >
          <span>{isEn ? "Back to Homepage" : "العودة للصفحة الرئيسية"}</span>
          <ArrowIcon className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
