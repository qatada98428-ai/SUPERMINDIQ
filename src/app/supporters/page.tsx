"use client";

import React from "react";
import Link from "next/link";
import {
  Heart,
  HeartHandshake,
  Sparkles,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Users,
  Lightbulb,
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Award,
} from "lucide-react";
import {
  SUPPORTERS_CONTENT,
  getSupporterApplicationLink,
  PLATFORM_INFO,
} from "@/lib/constants";
import { useApp } from "@/context/AppContext";

export default function SupportersPage() {
  const { language, dir, playFx } = useApp();
  const isEn = language === "en";
  const ArrowIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

  const supporterLink = getSupporterApplicationLink();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-14">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-8 sm:p-14 lg:p-16 border border-indigo-800/40 shadow-2xl text-center">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-10 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs sm:text-sm font-bold">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
            <span>{isEn ? "Social & Educational Mission" : "رسالة إنسانية وتعليمية مشتركة"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
            {isEn ? SUPPORTERS_CONTENT.enTitle : SUPPORTERS_CONTENT.title}
          </h1>

          {/* User Exact Quote */}
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3">
            <p className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-300 leading-snug">
              &quot;{isEn ? SUPPORTERS_CONTENT.enQuote : SUPPORTERS_CONTENT.quote}&quot;
            </p>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl mx-auto">
              {isEn ? SUPPORTERS_CONTENT.enBody : SUPPORTERS_CONTENT.body}
            </p>
          </div>

          {/* User Exact Tagline & CTA */}
          <p className="text-lg sm:text-xl font-bold text-emerald-300">
            {isEn ? SUPPORTERS_CONTENT.enCallToAction : SUPPORTERS_CONTENT.callToAction}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a
              href={supporterLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playFx("click")}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-black text-base shadow-xl shadow-rose-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2.5"
            >
              <HeartHandshake className="w-5 h-5 text-rose-200" />
              <span>{isEn ? "Become a Platform Supporter" : "كن داعماً للمنصة"}</span>
              <ArrowIcon className="w-4 h-4" />
            </a>

            <Link
              href="/dashboard"
              className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-colors flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>{isEn ? "Explore Free Platform" : "استكشف الأدوات المجانية للطلاب"}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Free Education Absolute Guarantee Badge */}
      <section className="bg-emerald-50 dark:bg-emerald-950/40 rounded-3xl p-6 sm:p-8 border-2 border-emerald-400/50 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-600 text-white">
                {PLATFORM_INFO.freeEducationBadge}
              </span>
              <h3 className="text-base sm:text-lg font-black text-emerald-950 dark:text-emerald-200">
                {isEn ? "Unconditional Commitment to Free Education" : "ميثاق الالتزام بمجانية التعليم للطلاب"}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed max-w-3xl">
              {isEn
                ? SUPPORTERS_CONTENT.enFreeEducationGuarantee
                : SUPPORTERS_CONTENT.freeEducationGuarantee}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <Link
            href="/mental-arithmetic"
            className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-200 font-bold text-xs border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 transition-colors inline-block"
          >
            {isEn ? "Start Learning Now" : "تدرّب الآن مجاناً"}
          </Link>
        </div>
      </section>

      {/* How Support Fuels Impact */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-bold">
            <Lightbulb className="w-4 h-4 text-brand-600" />
            <span>{isEn ? "Impact of Your Support" : "أين يذهب أثر دعمك؟"}</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            {isEn ? "Building the Next Generation of Thinkers" : "كيف يصنع دعمك مستقبلاً مشرقاً للأطفال؟"}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            {isEn
              ? "Your contributions empower us to maintain fast servers, design new interactive challenges, and sponsor talented students."
              : "كل مساهمة ودعم يتيح لنا الحفاظ على خوادم سريعة ومجانية، ابتكار مئات التمارين التفاعلية الجديدة، وإطلاق بطولات للأيتام والمتفوقين."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEn ? "Free Access for Every Child" : "إتاحة مجانية مستمرة لكل طفل"}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
              {isEn
                ? "Ensuring that no child is excluded from mastering mental math regardless of economic circumstances."
                : "ضمان عدم حرمان أي طفل أو طالب من تعلم خوارزميات السوروبان والفلاش أنزان لأسباب مادية أو جغرافية."}
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEn ? "Advanced Digital Innovation" : "تطوير برمجيات ومحاكيات متقدمة"}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
              {isEn
                ? "Developing faster real-time physics engines, voice-guided mental arithmetic, and multi-team arena simulators."
                : "تطوير محاكيات فيزيائية متطورة للعداد، الصوت الصوتي التفاعلي، وأنظمة تنافس الفرق المباشرة."}
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEn ? "Honoring Top Achievers" : "تكريم الأبطال ورعاية المسابقات"}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
              {isEn
                ? "Sponsoring medals, trophies, and participation kits for regional and national championships."
                : "توفير كؤوس وميداليات وشهادات تقديرية للمتميزين في المسابقات والبطولات لتشجيعهم على التفوق المستمر."}
            </p>
          </div>
        </div>
      </section>

      {/* Partnership Forms */}
      <section className="bg-slate-900 text-white rounded-[2.5rem] p-8 sm:p-12 space-y-8">
        <div className="max-w-2xl space-y-3">
          <span className="text-amber-400 font-bold text-xs uppercase tracking-wider">
            {isEn ? "Forms of Collaboration" : "مسارات الشراكة والرعاية"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">
            {isEn ? "How can you or your company support the platform?" : "كيف يمكنك المساهمة كشريك داعم؟"}
          </h2>
          <p className="text-slate-400 text-sm">
            {isEn
              ? "Whether you are an individual patron, an educational foundation, or a tech enterprise, your collaboration matters."
              : "نرحب بالرعايات المؤسسية والتعاون مع المؤسسات التعليمية ورجال الأعمال المهتمين بالمسؤولية المجتمعية والتعليم."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
            <div className="text-amber-400 font-black text-lg">1. الرعاية الفردية والمجتمعية</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              مساهمات تطوعية لدعم طلاب العائلات المتعففة أو تقديم أجهزة تابلت ومعدادات خشبية للجمعيات الخيرية.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>مساهمة خيرية غير ربحية</span>
            </div>
          </div>

          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
            <div className="text-indigo-400 font-black text-lg">2. رعاية البطولات والمسابقات</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              رعاية فعاليات بطولات الحساب الذهني المدرسية ووضع شعار مؤسستك أو شركتك على منصات التتويج والشهادات.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>ظهور إعلامي ورعاية رسمية</span>
            </div>
          </div>

          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
            <div className="text-rose-400 font-black text-lg">3. الشراكة التقنية واللوجستية</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              دعم استضافة الخوادم وسيرفرات الفلاش السريعة أو تقديم تجهيزات طباعة الحقائب والمناهج التدريبية.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>شراكة استراتيجية وتطويرية</span>
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
          <a
            href={supporterLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playFx("click")}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{isEn ? "Contact Management to Partner" : "تواصل مع الإدارة لبحث أوجه الدعم"}</span>
          </a>

          <span className="text-xs text-slate-400">
            أو عبر البريد الإلكتروني: <strong className="text-white font-mono">{PLATFORM_INFO.email}</strong>
          </span>
        </div>
      </section>
    </div>
  );
}
