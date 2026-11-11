"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  Calculator,
  Brain,
  GraduationCap,
  Users,
  Award,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  PlayCircle,
  HelpCircle,
  Trophy,
  HeartHandshake,
} from "lucide-react";
import SorobanTeaser from "@/components/home/SorobanTeaser";
import HeroIllustration from "@/components/home/HeroIllustration";
import {
  PLATFORM_INFO,
  getWhatsAppLink,
} from "@/lib/constants";
import { useApp } from "@/context/AppContext";

export default function HomePage() {
  const { language, dir, playFx } = useApp();

  const isEn = language === "en";
  const ArrowIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

  const whatsappHref = getWhatsAppLink(
    "مرحباً إدارة العقل الخارق SUPER MIND، أود الاستفسار عن تفاصيل الاشتراك والانضمام للمنصة."
  );

  return (
    <div className="space-y-24 sm:space-y-32">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24">
        {/* Soft decorative background circles */}
        <div className="absolute top-1/4 right-5 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-10 left-5 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Right text column (Arabic RTL / LTR English) */}
            <div className={`lg:col-span-7 space-y-6 ${dir === "rtl" ? "text-right" : "text-left"}`}>
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs sm:text-sm font-bold shadow-xs">
                  <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400 animate-pulse" />
                  <span>
                    {isEn
                      ? "Integrated Arabic platform for teaching mental arithmetic from scratch to mastery."
                      : "منصة عربية متكاملة لتعليم الحساب الذهني من الصفر إلى الاحتراف."}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-black shadow-xs">
                  <HeartHandshake className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    {isEn ? "Learning & Training is Free for Everyone" : "التعلّم والتدريب مجاناً للجميع ⭐️"}
                  </span>
                </div>
              </div>

              {/* Main title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.25]">
                {isEn ? "SUPER MIND Platform" : "منصة برنامج "}{" "}
                <span className="text-gradient">
                  {isEn ? "Mental Math" : "العقل الخارق"}
                </span>
                <br />
                <span className="text-3xl sm:text-4xl lg:text-5xl text-slate-800 dark:text-slate-200 font-extrabold">
                  SUPER MIND
                </span>
              </h1>

              {/* Tagline: العبارة التسويقية */}
              <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
                {isEn
                  ? "From Scratch to Mastery… A Journey Towards a Super Mind!"
                  : "من الصفر إلى الاحتراف… رحلة نحو عقلٍ خارق!"}
              </p>

              {/* Description: الوصف */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-normal">
                {isEn
                  ? "Discover an interactive educational experience combining mental math and cognitive development through progressive levels, advanced training tools, fun exercises, and inspiring challenges."
                  : "اكتشف تجربة تعليمية تفاعلية تجمع بين الحساب الذهني وتنمية القدرات العقلية، من خلال مستويات متدرجة، وأدوات تدريبية متطورة، وتمارين ممتعة وتحديات تحفّز الإبداع والإنجاز."}
              </p>

              {/* Motivational Tagline: العبارة التحفيزية */}
              <div className="inline-block p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                <span>
                  {isEn
                    ? "Learn Smart • Train Confidently • Challenge Yourself • Create Your Achievement"
                    : "تعلّم بذكاء • تدرّب بثقة • تحدَّ قدراتك • اصنع إنجازك"}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                {/* PROMINENT FREE TRAINING BUTTON */}
                <Link
                  href="/dashboard"
                  onClick={() => playFx("click")}
                  className="px-7 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-black text-base shadow-xl shadow-brand-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2.5 ring-4 ring-brand-500/20 group"
                >
                  <PlayCircle className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
                  <span>{isEn ? "Start Training Free 🚀" : "ابدأ التدريب مجاناً 🚀"}</span>
                  <ArrowIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/mental-arithmetic/teams-battle"
                  onClick={() => playFx("click")}
                  className="px-6 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg shadow-amber-400/25 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 border border-amber-500/30"
                >
                  <Trophy className="w-4 h-4 text-slate-950" />
                  <span>{isEn ? "Teams Battle 🏆" : "حلبة تحدي الفرق 🏆"}</span>
                  <ArrowIcon className="w-4 h-4" />
                </Link>

                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm border-2 border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2 shadow-xs"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{isEn ? "WhatsApp Contact" : "تواصل عبر واتساب"}</span>
                </a>

                <Link
                  href="/mental-arithmetic"
                  onClick={() => playFx("click")}
                  className="px-4 py-4 rounded-2xl text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/50 font-bold text-sm transition-colors flex items-center gap-1.5"
                >
                  <span>{isEn ? "Explore Mental Math" : "استعراض أقسام الحساب الذهني"}</span>
                  <ArrowIcon className="w-4 h-4" />
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">+10,000</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {isEn ? "Interactive Exercises" : "تمرين ومسألة تفاعلية"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">0.3s - 2.0s</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {isEn ? "Customizable Speeds" : "سرعات فلاش قابلة للتخصيص"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-black text-brand-600 font-mono">100%</div>
                  <div className="text-xs text-slate-500 font-medium">بيئة تدريبية عربية آمنة</div>
                </div>
              </div>
            </div>

            {/* Left column: 3D Classroom animated illustration */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* Main Educational Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold">
            <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>{isEn ? "Pillars of Cognitive Excellence" : "ركائز التفوق الذهني في المنصة"}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            {isEn ? "Integrated Tools for Mental Math & Agility" : "أدوات متكاملة لبناء عبقرية الحساب وسرعة البديهة"}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
            {isEn
              ? "Every section of the SUPER MIND platform is designed to develop both right and left brain hemispheres simultaneously."
              : "تم تصميم كل ركن في منصة العقل الخارق SUPER MIND بالتعاون مع خبراء الحساب الذهني لتطوير شقي الدماغ الأيمن والأيسر بالتزامن."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Interactive Soroban */}
          <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold border border-amber-200 dark:border-amber-800 group-hover:scale-110 transition-transform">
                <Calculator className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {isEn ? "Soroban Abacus" : "العداد الياباني (السوروبان)"}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {isEn
                  ? "Realistic physics simulation of Soroban beads with touch, mouse, and keyboard interaction."
                  : "محاكاة فيزيائية واقعية لخرزات السوروبان (خرزة خماسية علوية وأربع حبات آحاد سفلية) مع دعم التحكم باللمس والماوس مع قراءة آنية للأرقام."}
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
              <Link
                href="/mental-arithmetic/abacus"
                className="text-amber-600 dark:text-amber-400 hover:underline font-bold text-sm inline-flex items-center gap-1.5"
              >
                <span>{isEn ? "Enter Abacus" : "دخول العداد التفاعلي"}</span>
                <ArrowIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Flash Anzan */}
          <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold border border-brand-200 dark:border-brand-800 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {isEn ? "Flash Anzan" : "فلاش أنزان (Flash Anzan)"}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {isEn
                  ? "Rapid flashing numbers to train speed of response, supporting Arabic and English voice pronunciation."
                  : "تدريب متقدم على وميض الأرقام المتتالية بسرعة مبرمجة لترقية سرعة الاستجابة الذهنية، مع اختيار الأرقام العربية والغربية وأصوات العد التنازلي."}
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
              <Link
                href="/mental-arithmetic/flash-anzan"
                className="text-brand-600 dark:text-brand-400 hover:underline font-bold text-sm inline-flex items-center gap-1.5"
              >
                <span>{isEn ? "Start Flash" : "بدء تمارين الفلاش"}</span>
                <ArrowIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 3: Intelligence & Math Quiz */}
          <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold border border-indigo-200 dark:border-indigo-800 group-hover:scale-110 transition-transform">
                <Brain className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {isEn ? "IQ & Math Quizzes" : "تحديات الذكاء والرياضيات"}
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {isEn ? "Olympiad" : "أولمبياد"}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {isEn
                  ? "Innovative question bank simulating international olympiads and cognitive puzzles for logical thinking."
                  : "بنك أسئلة مبتكرة متعددة الخيارات تحاكي المسابقات والأولمبياد العالمية لتنمية التفكير المنطقي والهندسي مع حلول وتفسيرات علمية."}
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
              <Link
                href="/intelligence"
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold text-sm inline-flex items-center gap-1.5"
              >
                <span>{isEn ? "Take Quizzes" : "خوض التحديات"}</span>
                <ArrowIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 4: Trainer & Student Portals */}
          <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold border border-emerald-200 dark:border-emerald-800 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {isEn ? "Trainers & Schools" : "لوحات المدربين والطلاب"}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {isEn
                  ? "Accurate monitoring of speed and accuracy rates, with classroom management tools for certified centers."
                  : "متابعة دقيقة لمعدلات الدقة والسرعة وتاريخ التدريب، مع إمكانية إدارة المجموعات والصفوف للأساتذة والمراكز التعليمية المعتمدة."}
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
              <Link
                href="/trainer"
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold text-sm inline-flex items-center gap-1.5"
              >
                <span>{isEn ? "Trainer Portal" : "استعراض لوحة المدرب"}</span>
                <ArrowIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* NEW: Teams Tournament Banner */}
        <div className="mt-8 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-2 border-amber-500/30 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
              <Trophy className="w-3.5 h-3.5" />
              <span>ميزة البطولات الحية للفرق (A, B, C, D)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              حلبة تحدي الفرق ومضمار السباق التفاعلي 🏁
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              تنافس بين الفرق في الصفوف والمسابقات مع قياس زمن الإجابة بالمللي ثانية، تتويج أولمبي 3D، ولقب «مركز بطل الأبطال».
            </p>
          </div>
          <Link
            href="/mental-arithmetic/teams-battle"
            className="shrink-0 px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm transition-all shadow-lg shadow-amber-400/20 flex items-center gap-2"
          >
            <span>بدء بطولة الفرق الآن</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Live Interactive Soroban Experience */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>تجربة تفاعلية حية</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
            جرب تحريك خرزات العداد الياباني (السوروبان) مباشرة
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            انقر على الخرزات لتتعلم طريقة تمثيل الأرقام وقراءتها لحظياً:
          </p>
        </div>
        <SorobanTeaser />
      </section>

      {/* Methodology Section: The 4-Stage SUPER MIND Journey */}
      <section className="bg-slate-900 text-white py-20 rounded-3xl mx-4 sm:mx-6 lg:mx-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-amber-400 font-bold text-sm tracking-wider uppercase">
              منهجية العقل الخارق العلمية
            </span>
            <h2 className="text-3xl sm:text-4xl font-black">
              كيف يتحول الطالب من الحساب العادي إلى سرعة الخارقين؟
            </h2>
            <p className="text-slate-400 text-base">
              تسلسل تدريبي مدروس ينقل العقل من المعالجة الحسية إلى التخيل الفضائي المجرد.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-lg">
                1
              </div>
              <h4 className="text-lg font-bold text-white">التجسيد الحسي</h4>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                التعرف على خرزات السوروبان، حركة الأصابع، وتشكيل الأرقام ومكملات الخمسة والعشرة.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500 text-white font-black flex items-center justify-center text-lg">
                2
              </div>
              <h4 className="text-lg font-bold text-white">التخيل الذهني</h4>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                رسم صورة ذهنية افتراضية للعداد داخل مخيلة الطالب وتحريك الخرزات خيالياً دون لمس.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500 text-white font-black flex items-center justify-center text-lg">
                3
              </div>
              <h4 className="text-lg font-bold text-white">تسريع الفلاش أنزان</h4>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                معالجة ومضات الأرقام المتلاحقة في أجزاء من الثانية وجمع وطرح سلاسل طويلة بدقة تامة.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-lg">
                4
              </div>
              <h4 className="text-lg font-bold text-white">التفوق والأولمبياد</h4>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                تطبيق المهارة على حل المعضلات الرياضية، مسائل الأولمبياد والذكاء، وتحقيق بطولات دولية.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audiences: Students, Trainers, Educational Centers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            {isEn ? "Who Benefits from the Platform?" : "من يستفيد من المنصة؟"}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base">
            {isEn
              ? "A flexible platform catering to eager young learners, professional trainers, and forward-thinking schools."
              : "بيئة مرنة تلبي طموحات البراعم الصغار واحتياجات المدربين والمدارس والمراكز التخصصية."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Persona 1: Students */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {isEn ? "For Children & Students" : "للأطفال والطلاب"}
              </h3>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{isEn ? "Gamified interactive exercises" : "تمارين ترفيهية تشبه الألعاب التفاعلية"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{isEn ? "Track stars, trophies & badges" : "متابعة الإنجاز اليومي والنجوم والأوسمة"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{isEn ? "Eliminate math anxiety & build confidence" : "التخلص من رهبة الرياضيات وصعوبة الحفظ"}</span>
                </li>
              </ul>
            </div>
            <Link
              href="/dashboard"
              className="w-full inline-block text-center py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/50 text-brand-700 dark:text-brand-300 font-bold text-sm transition-colors"
            >
              {isEn ? "Enter Student Portal (Free)" : "دخول بوابة الطالب (مجاناً)"}
            </Link>
          </div>

          {/* Persona 2: Trainers */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border-2 border-brand-500 shadow-md space-y-5 relative flex flex-col justify-between">
            <span className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-brand-600 text-white text-xs font-bold shadow-xs">
              {isEn ? "Most Popular for Coaches" : "دليل المدربين المعتمدين"}
            </span>
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {isEn ? "For Trainers & Teachers" : "للمدربين والأساتذة"}
              </h3>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{isEn ? "Manage student groups in one portal" : "إدارة قوائم الطلاب والمجموعات في مكان واحد"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{isEn ? "Profile listing in Trainers Directory (25k IQD)" : "إدراج الاسم في دليل المدربين (25 ألف د.ع)"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{isEn ? "Custom homework speeds & certificates" : "رخص اعتماد وتقارير أداء دورية تطبع للطلاب"}</span>
                </li>
              </ul>
            </div>
            <div className="space-y-2 pt-2">
              <Link
                href="/trainers"
                className="w-full inline-block text-center py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-colors shadow-sm"
              >
                {isEn ? "Explore Trainers Directory" : "استعراض دليل المدربين"}
              </Link>
              <Link
                href="/trainer"
                className="w-full inline-block text-center py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                {isEn ? "Trainer Dashboard" : "لوحة تحكم المدرب"}
              </Link>
            </div>
          </div>

          {/* Persona 3: Centers & Academies */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {isEn ? "For Schools & Centers" : "للمراكز والمدارس"}
              </h3>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{isEn ? "Curriculum series with Soroban workbooks" : "سلسلة مناهج العقل الخارق وحقائب السوروبان"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{isEn ? "Smart board multi-team battle arenas" : "تشغيل القاعات الذكية وشاشات العرض الكبيرة"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{isEn ? "School directory listing (75k IQD/yr)" : "إدراج مدرستك في دليل المنصة (75 ألف د.ع)"}</span>
                </li>
              </ul>
            </div>
            <div className="space-y-2 pt-2">
              <Link
                href="/schools"
                className="w-full inline-block text-center py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors shadow-sm"
              >
                {isEn ? "Schools Directory" : "استعراض دليل المدارس"}
              </Link>
              <Link
                href="/supporters"
                className="w-full inline-block text-center py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                {isEn ? "Partners in Mind Building" : "شركاء في صناعة العقول"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Official WhatsApp Contact Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/50 border border-emerald-400/30 text-emerald-100 text-xs font-bold">
                <MessageCircle className="w-4 h-4" />
                <span>خدمة الاستفسارات والاشتراكات المباشرة</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black">
                تواصل مباشرة مع إدارة منصة العقل الخارق
              </h2>
              <p className="text-emerald-100 text-sm sm:text-base max-w-2xl leading-relaxed">
                هل لديك استفسار عن تسجيل الطلاب، دورات إعداد المدربين، أو ترخيص الأكاديميات؟
                فريقنا متاح عبر واتساب لتقديم الدعم والمساعدة الفورية.
              </p>
              <div className="text-emerald-200 font-mono font-bold text-sm pt-1">
                الرقم المعتمد: {PLATFORM_INFO.whatsappNumber}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-800 font-black text-base shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <span>محادثة واتساب فورية</span>
              </a>
              <Link
                href="/subscriptions"
                className="px-6 py-4 rounded-2xl bg-emerald-900/60 hover:bg-emerald-900 text-white font-bold text-base border border-emerald-500/40 transition-colors flex items-center justify-center"
              >
                عرض باقات الاشتراك
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
            <HelpCircle className="w-4 h-4 text-brand-600" />
            <span>الأسئلة الشائعة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            كل ما تود معرفته عن منصة العقل الخارق
          </h2>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-base mb-2">
              هل يحتاج الطالب لمعرفة سابقة بالعداد الصيني السوروبان؟
            </h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              كلا، تبدأ المنصة مع الطالب من الصفر خطوة بخطوة؛ عبر التعرف على الخرزات، وقيمتها، وقواعد الجمع والطرح البسيطة والمركبة ومكملات الأرقام.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-base mb-2">
              ما الفرق بين تمارين العداد التفاعلي والفلاش أنزان؟
            </h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              العداد التفاعلي يُمكّن الطالب من تحريك الخرزات بلمس الشاشة لترسيخ المفاهيم المادية، بينما الفلاش أنزان يعرض أرقاماً تومض بسرعة محددة لتدريب الطالب على الحساب الذهني الخالص والتخيل دون تحريك أي خرزة فعلية.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-base mb-2">
              كيف يمكن للمدرب إنشاء مجموعة لطلابه ومتابعة نتائجهم؟
            </h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              توفر المنصة لوحة تحكم مخصصة للمدرب (Trainer Dashboard) تمكنه من استعراض قائمة طلابه، مراقبة نسب الدقة وسرعة الإنجاز، وإرسال التوجيهات والواجبات عبر واتساب أو النظام مباشرة.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-base mb-2">
              هل تعمل المنصة على الأجهزة اللوحية والهواتف الذكية؟
            </h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              نعم، المنصة مبنية بتصميم متجاوب بالكامل وتدعم اللمس المتعدد على الآيباد، التابلت، والهواتف الذكية والحواسيب بنظام شاشات اللمس.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
