"use client";

import React from "react";
import Link from "next/link";
import {
  Calculator,
  Zap,
  ArrowLeft,
  ArrowRight,
  Trophy,
  BookOpen,
  Brain,
  Sparkles,
  CheckCircle2,
  PlayCircle,
  Target,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function MentalArithmeticPage() {
  const { language, dir, playFx } = useApp();
  const isEn = language === "en";
  const ArrowIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      {/* Serene Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs sm:text-sm font-bold">
          <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>{isEn ? "SUPER MIND Mental Arithmetic Hub" : "منظومة الحساب الذهني | برنامج العقل الخارق"}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          {isEn ? "Mental Arithmetic & Brain Training" : "أقسام الحساب الذهني والتدريب العقلي"}
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
          {isEn
            ? "Choose your learning path: explore staged video lessons, practice on the interactive Soroban, boost speed with Flash Anzan, or compete in team tournaments."
            : "بيئة تعليمية هادئة وشاملة تضم كافة أدوات التدرج من الصفر؛ بدءاً من شروح المراحل والمعداد الحر، مروراً بالفلاش أنزان، وصولاً إلى حلبات تحدي الفرق والضرب والقسمة."}
        </p>
      </div>

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* 1. قسم التعليم (دليل المراحل) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold border border-indigo-200 dark:border-indigo-800 group-hover:scale-105 transition-transform">
                <BookOpen className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                10 مراحل شاملة 📖
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                {isEn ? "1. Learning Stages Guide" : "1. قسم التعليم (شرح المراحل)"}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {isEn
                  ? "Step-by-step curriculum starting from the basics of mental math, bead representation, simple addition/subtraction, to 5 and 10 complements."
                  : "شرح تفصيلي متدرج يبدأ من أهمية الحساب الذهني في عصر التكنولوجيا، تمثيل الأرقام، الجمع والطرح التمهيدي والبسيط، مكملات الخمسة والعشرة، وحتى الضرب والقسمة مع معداد حي متحرك."}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>شرح مبسط مدعوم بمعداد فيزيائي يوضح تمثيل كل قاعدة</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>أمثلة تطبيقية واختبارات قياس استيعاب فورية</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/learn"
              onClick={() => playFx("click")}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>{isEn ? "Enter Learning Guide" : "دخول قسم التعليم والمراحل"}</span>
              <ArrowIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 2. المعداد الحر (السوروبان التفاعلي) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold border border-amber-200 dark:border-amber-800 group-hover:scale-105 transition-transform">
                <Calculator className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                تدريب حر وتفاعلي 🧮
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                {isEn ? "2. Free Soroban Abacus" : "2. المعداد الحر (السوروبان)"}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {isEn
                  ? "Realistic Japanese Soroban simulation with touch and mouse control, supporting custom column counts and target number practice."
                  : "لوحة معداد ياباني مفتوحة بالكامل؛ تحريك سلس باللمس أو الماوس، تصفير بضغطة زر، وتدريب حر على تشكيل الأرقام وإجراء العمليات الحسابية بحرية تامة."}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>دعم من 3 أعمدة وحتى 17 عموداً مع قراءة القيمة فورياً</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>وضع التحدي والهدف (Target Mode) لتدريب الطالب</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/mental-arithmetic/abacus"
              onClick={() => playFx("click")}
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>{isEn ? "Open Interactive Abacus" : "دخول المعداد الحر"}</span>
              <ArrowIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 3. فلاش أنزان (Flash Anzan) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold border border-brand-200 dark:border-brand-800 group-hover:scale-105 transition-transform">
                <Zap className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                تدريب السرعة والبديهة ⚡️
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                {isEn ? "3. Flash Anzan Trainer" : "3. فلاش أنزان (Flash Anzan)"}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {isEn
                  ? "Flashing consecutive numbers at customizable speeds to train photographic memory and fast mental calculation with voice pronunciation."
                  : "تمرين ومضات الأرقام المتلاحقة بسرعة قابلة للتخصيص، مع دعم نطق الأرقام بالصوت (عربي وإنكليزي)، لتطوير التخيل الذهني وسرعة الاستجابة الفائقة."}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>سرعات دقيقة من 0.2 ثانية إلى 3.0 ثوانٍ</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>اختيار خانة الآحاد، العشرات، أو المئات مع خيارات الصوت</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/mental-arithmetic/flash-anzan"
              onClick={() => playFx("click")}
              className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>{isEn ? "Start Flash Session" : "بدء تمارين الفلاش أنزان"}</span>
              <ArrowIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 4. تحدي الفرق (Teams Battle) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold border border-amber-300 dark:border-amber-700 group-hover:scale-105 transition-transform">
                <Trophy className="w-7 h-7" />
              </div>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                بطولة حية للفرق 🏆
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                {isEn ? "4. Teams Championship Battle" : "4. تحدي الفرق والبطولات"}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {isEn
                  ? "Live multi-team competition arena (2 to 5 teams: A, B, C, D, E) with speed bonuses, live race tracks, and Olympic 3D podium crowning."
                  : "حلبة تنافسية جماعية للصفوف والمدارس بين الفرق (من فريقين إلى 5 فرق: A, B, C, D, E) مع قياس سرعة الإجابة بالمللي ثانية ومضمار سباق وتتويج بطل الأبطال."}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>تخصيص أسماء وألوان وأيقونات الفرق</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>منصة تتويج احتفالية وكؤوس ذهبية وفضية وبرونزية</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/mental-arithmetic/teams-battle"
              onClick={() => playFx("click")}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>{isEn ? "Launch Teams Battle" : "دخول حلبة تحدي الفرق"}</span>
              <ArrowIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Row 2: Balloon Pop Game (Full width highlight) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-700 to-violet-800 p-7 sm:p-8 shadow-2xl shadow-indigo-500/30 border border-indigo-400/30">
        {/* Decorative balloons */}
        <div className="absolute top-0 right-0 text-9xl opacity-10 pointer-events-none select-none leading-none">🎈</div>
        <div className="absolute bottom-0 left-6 text-7xl opacity-10 pointer-events-none select-none leading-none rotate-12">🎈</div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-black px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/20 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                <span>لعبة تفاعلية</span>
              </span>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-sm">
                جديد 🆕
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              🎈 لعبة صيد البالونات
            </h2>
            <p className="text-indigo-200 text-sm leading-relaxed max-w-lg">
              تُعرض أرقام الفلاش أنزان، ثم تطير بالونات تحمل أرقاماً — اصطد البالونة التي تحمل الإجابة الصحيحة!
              تدعم منافسة حتى 4 فرق على نفس الشاشة.
            </p>

            <div className="flex flex-wrap gap-4 text-xs text-indigo-200">
              <span className="flex items-center gap-1.5">✅ بالونات طائرة بأنيميشن</span>
              <span className="flex items-center gap-1.5">💥 انفجار للخاطئة وسحر للصحيحة</span>
              <span className="flex items-center gap-1.5">👥 حتى 4 فرق</span>
              <span className="flex items-center gap-1.5">⚙️ إعدادات كاملة</span>
            </div>
          </div>

          <Link
            href="/mental-arithmetic/balloon-pop"
            onClick={() => playFx("click")}
            className="shrink-0 px-8 py-4 rounded-2xl bg-white hover:bg-indigo-50 text-indigo-900 font-black text-sm shadow-xl transition-all hover:scale-105 active:scale-98 flex items-center gap-2.5 whitespace-nowrap"
          >
            <span className="text-xl">🎈</span>
            <span>العب الآن!</span>
          </Link>
        </div>
      </div>

      {/* Row 3: Multiplication & Division + IQ Quizzes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Card: الضرب والقسمة بالسوروبان */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-amber-950/30 rounded-3xl p-7 sm:p-8 border border-amber-200 dark:border-amber-800/60 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-400 text-slate-950">
                الضرب والقسمة ✖️➗
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                حتى 5 مراتب
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {isEn ? "Soroban Multiplication & Division" : "محاكي الضرب والقسمة وحفظ الجدول"}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {isEn
                ? "Times table qualification test (1-10) followed by a live Soroban multiplication and division simulator with carry rods and step-by-step animation."
                : "فعالية مميزة لاختبار وحفظ جدول الضرب من 1 إلى 10، متبوعة بمحاكي فيزيائي لتطبيق الضرب حتى 5 مراتب (تمثيل الأعداد يساراً وترحيل البواقي يميناً) والقسمة العكسية."}
            </p>
          </div>

          <Link
            href="/mental-arithmetic/multiplication"
            onClick={() => playFx("click")}
            className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
          >
            <PlayCircle className="w-4 h-4" />
            <span>{isEn ? "Open Multiplication Simulator" : "دخول محاكي الضرب والقسمة"}</span>
          </Link>
        </div>

        {/* Card: أسئلة الذكاء والتفكير المنطقي (تجريبي) */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-indigo-950/30 rounded-3xl p-7 sm:p-8 border border-indigo-200 dark:border-indigo-800/60 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black px-3 py-1 rounded-full bg-indigo-600 text-white flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" />
                <span>تحديات الذكاء</span>
              </span>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 border border-amber-500/30 shadow-xs">
                تجريبي 🧪
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>{isEn ? "IQ & Mathematical Logic" : "أسئلة الذكاء والتفكير المنطقي"}</span>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-extrabold">(تجريبي)</span>
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {isEn
                ? "Experimental interactive question bank simulating global olympiad logic challenges, graded by school levels."
                : "بنك أسئلة واختبارات تفاعلية حية (نسخة تجريبية) مقسمة حسب المراحل الدراسية لتعزيز التفكير المنطقي والهندسي وحل المعضلات الرياضية خطوة بخطوة."}
            </p>
          </div>

          <Link
            href="/intelligence"
            onClick={() => playFx("click")}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Brain className="w-4 h-4" />
            <span>{isEn ? "Enter IQ Challenges (Beta)" : "دخول قسم أسئلة الذكاء (تجريبي)"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
