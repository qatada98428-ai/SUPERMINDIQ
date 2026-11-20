import React from "react";
import {
  CheckCircle2,
  Sparkles,
  MessageCircle,
  ShieldCheck,
  GraduationCap,
  Award,
  Building2,
} from "lucide-react";
import { getWhatsAppLink } from "@/lib/constants";
import { SUBSCRIPTION_PLANS } from "@/lib/platform-store";

export default function SubscriptionsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="clay-banner-lavender text-white p-7 sm:p-11 text-center max-w-5xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/25 text-amber-200 text-xs sm:text-sm font-extrabold">
          <Sparkles className="w-4 h-4" />
          <span>خطط ورخص الاشتراك الرسمية في منصة العقل الخارق</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white">
          باقات الاشتراك للطلاب والمدربين والمدارس
        </h1>
        <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
          قسم التعليم، المعداد الحر (السوروبان)، والفلاش أنزان متاحة مجاناً للجميع، مع 100 سؤال مجاناً كل شهر في محاكي المسابقة لكل طالب مسجل بحساب رسمي! وللوصول المفتوح بلا حدود وتوثيق الحساب اختر باقتك:
        </p>
      </div>

      {/* 1. Student Subscriptions (25k / 50k / 100k) */}
      <section className="space-y-6">
        <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
          <GraduationCap className="w-7 h-7 text-brand-600" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              أولاً: باقات الطالب الفردي (فتح محاكي المسابقة والبطولات بلا حدود)
            </h2>
            <p className="text-xs text-slate-500">
              يتم تثبيت تاريخ بدء وانتهاء الاشتراك تلقائياً في بروفايل البطل
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUBSCRIPTION_PLANS.student.map((plan) => (
            <div
              key={plan.id}
              className={`clay-card p-7 flex flex-col justify-between transition-all hover:-translate-y-1 ${
                plan.popular ? "ring-2 ring-brand-500 shadow-glow" : ""
              }`}
            >
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-black text-xs">
                  {plan.badge}
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {plan.name}
                </h3>
                <div className="text-3xl font-black text-brand-600 dark:text-amber-400 font-mono">
                  {plan.priceFormatted}
                </div>
                <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={getWhatsAppLink(
                  `مرحباً إدارة منصة العقل الخارق، أود الاشتراك للطالب وتفعيل (${plan.name} - بسعر ${plan.priceFormatted}).`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>اضغط للتواصل مع إدارة المنصة</span>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Trainer Subscriptions (25k / 50k / 100k) */}
      <section className="space-y-6">
        <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
          <Award className="w-7 h-7 text-amber-500" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              ثانياً: باقات توثيق واعتماد المدربين (لوحة المدرب + الدليل + الواجبات)
            </h2>
            <p className="text-xs text-slate-500">
              توثيق حساب المدرب بالشارة الرسمية ونشر معلوماته وصورته وكؤوسه في دليل المدربين المعتمدين
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUBSCRIPTION_PLANS.trainer.map((plan) => (
            <div
              key={plan.id}
              className={`clay-card p-7 flex flex-col justify-between transition-all hover:-translate-y-1 ${
                plan.popular ? "ring-2 ring-amber-400 shadow-glow" : ""
              }`}
            >
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-black text-xs">
                  {plan.badge}
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {plan.name}
                </h3>
                <div className="text-3xl font-black text-brand-600 dark:text-amber-400 font-mono">
                  {plan.priceFormatted}
                </div>
                <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={getWhatsAppLink(
                  `مرحباً إدارة منصة العقل الخارق، أنا مدرب حساب ذهني وأود الاشتراك وتوثيق حسابي ضمن (${plan.name} - بسعر ${plan.priceFormatted}).`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>اضغط للتواصل مع إدارة المنصة</span>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* 3. School Annual Accreditation (150k IQD) */}
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-10 border-2 border-amber-400/60 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black">
              <Building2 className="w-4 h-4" />
              <span>{SUBSCRIPTION_PLANS.school.badge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">
              ثالثاً: {SUBSCRIPTION_PLANS.school.name}
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              مخصص للمدارس الأهلية والروضات والمراكز التعليمية المعتمدة لمنهاج وبرنامج العقل الخارق، مع فتح كامل مميزات المنصة للشاشات الذكية ونشر معلومات المدرسة والتواصل المباشر معها في الدليل الرسمي.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {SUBSCRIPTION_PLANS.school.features.map((feat, i) => (
                <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-emerald-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 text-center space-y-4">
            <div className="text-xs font-bold text-amber-300">الاشتراك السنوي للمدارس المعتمدة</div>
            <div className="text-3xl sm:text-4xl font-black text-white font-mono">
              150,000 د.ع
            </div>
            <div className="text-xs text-slate-300">لمدة سنة دراسية كاملة مع النشر في الدليل</div>
            <a
              href={getWhatsAppLink(
                "مرحباً إدارة منصة العقل الخارق، نود اعتماد مدرستنا ضمن باقة المدارس السنوية (150,000 د.ع) ونشر معلومات المدرسة في الدليل."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg"
            >
              <MessageCircle className="w-5 h-5" />
              <span>اضغط للتواصل مع إدارة المنصة</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
