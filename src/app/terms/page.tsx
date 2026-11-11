"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, CheckCircle2, ShieldCheck, ArrowLeft, ArrowRight, HeartHandshake } from "lucide-react";
import { PLATFORM_INFO } from "@/lib/constants";
import { useApp } from "@/context/AppContext";

export default function TermsPage() {
  const { language, dir } = useApp();
  const isEn = language === "en";
  const ArrowIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold">
          <BookOpen className="w-4 h-4 text-amber-600" />
          <span>{isEn ? "Terms & Conditions" : "شروط وأحكام الاستخدام"}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          {isEn ? "Terms of Use | SUPER MIND" : "شروط الاستخدام | منصة العقل الخارق"}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {isEn ? "Terms updated for year 2026" : "وثيقة الشروط والأحكام المعتمدة لعام 2026"}
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
        {/* Free Education Policy */}
        <section className="space-y-3 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-black text-base">
            <HeartHandshake className="w-5 h-5 text-emerald-600" />
            <span>{isEn ? "100% Free Training Commitment" : "التزام مجانية التدريب للطلاب"}</span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">
            {isEn
              ? "All individual student exercises, interactive Soroban simulators, and Flash Anzan trainers are 100% free of charge for students and learners."
              : "جميع أدوات التدريب والتمارين ومحاكيات السوروبان والفلاش أنزان وبنك أسئلة الذكاء متاحة مجاناً 100% لجميع الطلاب والمتعلمين، ولا يُفرض أي مقابل مالي على التدريب اليومي."}
          </p>
        </section>

        {/* Section 1: Intellectual Property */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-600" />
            <span>1. حقوق الملكية الفكرية والعلامة التجارية</span>
          </h2>
          <p>
            تعتبر مناهج، وتصاميم، وبرمجيات، ومحاكيات، وخوارزميات &quot;برنامج العقل الخارق | SUPER MIND&quot; ملكية فكرية حصرية تحت إشراف الأستاذ قتادة كريم. يُمنع استنساخ البرمجيات أو إعادة بيعها أو استخدام الهوية البصرية لأغراض تجارية دون إذن كتابي رسمي مسبق.
          </p>
        </section>

        {/* Section 2: Directory Listings */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            <span>2. شروط إدراج المدربين والمدارس</span>
          </h2>
          <p>
            يخضع إدراج المدربين (اشتراك سنوي 25,000 د.ع) وإدراج المدارس (اشتراك سنوي 75,000 د.ع) للمراجعة والتدقيق الإداري للتأكد من صحة البيانات ومؤهلات المدرب أو المؤسسة التعليمية. تحتفظ إدارة المنصة بحق رفض أو إيقاف أي إدراج يخالف الآداب العامة أو يقدم معلومات مضللة.
          </p>
        </section>

        {/* Section 3: Safe Usage */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <span>3. الاستخدام العادل والمسابقات</span>
          </h2>
          <p>
            تُجرى مسابقات وتحديات الفرق (Teams Battle) في إطار تربوي وتعليمي نزيه يهدف لترسيخ الروح الرياضية وحب الرياضيات، ويُحظر استخدام أي أدوات برمجية للغش أو التلاعب بنتائج التوقيت والسرعة.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            4. التعديلات والاستفسارات
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            تحتفظ إدارة المنصة بالحق في تحديث هذه الشروط بما يخدم المصلحة التعليمية والأمن الرقمي. لأي استفسار يرجى مراسلتنا على:{" "}
            <strong className="text-brand-600 dark:text-brand-400 font-mono">{PLATFORM_INFO.email}</strong>.
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
