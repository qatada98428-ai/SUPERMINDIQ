"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  Calculator,
  Brain,
  Trophy,
  Flame,
  Clock,
  Target,
  ArrowLeft,
  Play,
  BarChart2,
  Award,
} from "lucide-react";
import { MOCK_STUDENT } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";

export default function StudentDashboardPage() {
  const { user, profile, isGuest, guestProgress } = useAuth();
  const student = MOCK_STUDENT;
  const [selectedFilter, setSelectedFilter] = useState<"all" | "flash" | "abacus" | "quiz">("all");

  const displayName = isGuest
    ? "بطل التدريب الحر (زائر)"
    : profile?.name || user?.email?.split("@")[0] || student.name;
  const displayLevel = isGuest ? guestProgress.currentLevel : student.level;
  const totalExercisesCount = isGuest ? guestProgress.completedExercises : student.stats.totalExercises;
  const accuracyRateDisplay = isGuest
    ? guestProgress.totalAnswers > 0
      ? guestProgress.accuracyRate
      : 100
    : student.stats.accuracyRate;

  const filteredSessions = student.recentSessions.filter((session) => {
    if (selectedFilter === "flash") return session.type === "flash-anzan";
    if (selectedFilter === "abacus") return session.type === "abacus";
    if (selectedFilter === "quiz") return session.type === "quiz";
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-brand-700 via-brand-600 to-indigo-900 text-white p-6 sm:p-10 shadow-xl">
        <div className="absolute top-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{displayLevel}</span>
              {isGuest && (
                <span className="text-[10px] bg-emerald-400/30 text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  وضع الزائر المجاني
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black">
              أهلاً بك يا بطل الحساب الذهني، {displayName} 👋
            </h1>

            <p className="text-slate-200 text-sm sm:text-base max-w-xl">
              أنت الآن في رحلة التميّز مع المدرب:{" "}
              <span className="font-bold text-white underline decoration-amber-400 decoration-2 underline-offset-4">
                {student.trainerName}
              </span>{" "}
              ضمن {student.groupName}. استمر في تحقيق أرقام قياسية جديدة اليوم!
            </p>
          </div>

          {/* Quick Streak & Points Badges */}
          <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[100px]">
              <div className="flex items-center justify-center gap-1 text-amber-300 mb-1">
                <Flame className="w-5 h-5 fill-amber-300 animate-bounce" />
                <span className="font-black font-mono text-xl">{student.streakDays}</span>
              </div>
              <div className="text-xs text-slate-200 font-medium">أيام حماس متتالية</div>
            </div>

            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[100px]">
              <div className="flex items-center justify-center gap-1 text-sky-300 mb-1">
                <Trophy className="w-5 h-5" />
                <span className="font-black font-mono text-xl">{student.points}</span>
              </div>
              <div className="text-xs text-slate-200 font-medium">نقاط التميز</div>
            </div>
          </div>
        </div>

        {/* Daily Goal Progress Bar */}
        <div className="mt-8 pt-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:max-w-md space-y-2">
            <div className="flex justify-between text-xs text-slate-200 font-bold">
              <span>الهدف اليومي: إنجاز {student.dailyGoal.target} تمرين</span>
              <span>{student.dailyGoal.current} / {student.dailyGoal.target} تمرين</span>
            </div>
            <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                style={{
                  width: `${(student.dailyGoal.current / student.dailyGoal.target) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-200 font-bold">باقي تمرينان فقط لإتمام الهدف! 🎯</span>
          </div>
        </div>
      </div>

      {/* Core Stats Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>إجمالي التمارين المحلولة</span>
            <Target className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {totalExercisesCount}
          </div>
          <div className="text-xs text-emerald-600 font-bold flex items-center gap-1">
            <span>{isGuest ? "تمارين محفوظة محلياً" : "+18 تمرين اليوم"}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>معدل الدقة العام</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
            {accuracyRateDisplay}%
          </div>
          <div className="text-xs text-slate-500 font-medium">
            ممتاز! أعلى من متوسط المجموعة
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>متوسط سرعة الإجابة</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {student.stats.avgSpeedSeconds}s
          </div>
          <div className="text-xs text-slate-500 font-medium">
            لكل عملية في الفلاش أنزان
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>جلسات السوروبان المكتملة</span>
            <Calculator className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {student.stats.abacusSessions}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            تمارين الجمع والطرح بالعداد
          </div>
        </div>
      </div>

      {/* Main Training Modules Quick Launcher Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            أقسام التدريب اليومية الموصى بها
          </h2>
          <span className="text-xs text-slate-500">اختر التمرين وابدأ فوراً</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Module 1: Soroban Abacus */}
          <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold">
                  <Calculator className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                  تدريب تفاعلي
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900">العداد الياباني (السوروبان)</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                تدريب حر وموجه على تمثيل الأرقام، الجمع والطرح البسيط، ومساعدات الخمسة ومكملات العشرة.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                href="/mental-arithmetic/abacus"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>فتح العداد والبدء</span>
              </Link>
            </div>
          </div>

          {/* Module 2: Flash Anzan */}
          <div className="bg-white rounded-3xl p-6 border-2 border-brand-300 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/15 text-brand-700 flex items-center justify-center font-bold">
                  <Zap className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-bold">
                  سرعة وتركيز
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900">فلاش أنزان (Flash Anzan)</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                تدريب وميضي سريع، حدد عدد الأرقام والسرعة بالمللي ثانية لتحدي قدراتك الذهنية.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                href="/mental-arithmetic/flash-anzan"
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>بدء تحدي الفلاش</span>
              </Link>
            </div>
          </div>

          {/* Module 3: Intelligence Challenges */}
          <div className="bg-white rounded-3xl p-6 border-2 border-indigo-200 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-700 flex items-center justify-center font-bold">
                  <Brain className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
                  أولمبياد وتفكير
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900">تحديات الذكاء والرياضيات</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                مسائل استدلالية وتفكير منطقي متعدد الخيارات مع شرح تفصيلي لطرق الحل الذكية.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                href="/intelligence"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>خوض اختبار الذكاء</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Activity Progress & Recent Sessions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Chart / Progress representation */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-brand-600" />
              <span>نشاط الأسبوع الحالي</span>
            </h3>
            <span className="text-xs text-slate-500">تمارين منجزة يومياً</span>
          </div>

          <div className="space-y-3">
            {student.weeklyProgress.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{item.day}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-900 font-bold">{item.count} تمرين</span>
                    <span className="text-emerald-600 text-[11px]">({item.accuracy}%)</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full"
                    style={{ width: `${(item.count / 40) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
            <span>يوم الثلاثاء حققت أعلى إنجاز (40 تمرين بدقة 98%)! ممتاز يا بطل.</span>
          </div>
        </div>

        {/* Recent Sessions List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">سجل الجلسات الأخيرة</h3>
              <p className="text-xs text-slate-500">التمارين والنتائج المسجلة بحسابك</p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setSelectedFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setSelectedFilter("flash")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedFilter === "flash" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                }`}
              >
                فلاش أنزان
              </button>
              <button
                onClick={() => setSelectedFilter("abacus")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedFilter === "abacus" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                }`}
              >
                السوروبان
              </button>
              <button
                onClick={() => setSelectedFilter("quiz")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedFilter === "quiz" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                }`}
              >
                الذكاء
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredSessions.map((session) => (
              <div key={session.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                      session.type === "flash-anzan"
                        ? "bg-brand-50 text-brand-600"
                        : session.type === "abacus"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-indigo-50 text-indigo-600"
                    }`}
                  >
                    {session.type === "flash-anzan" ? (
                      <Zap className="w-5 h-5" />
                    ) : session.type === "abacus" ? (
                      <Calculator className="w-5 h-5" />
                    ) : (
                      <Brain className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{session.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {session.time}
                      </span>
                      <span>•</span>
                      <span>{session.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="text-left shrink-0">
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    {session.score}
                  </div>
                  <div
                    className={`text-xs font-bold ${
                      session.accuracy >= 90
                        ? "text-emerald-600"
                        : session.accuracy >= 75
                        ? "text-amber-600"
                        : "text-rose-600"
                    }`}
                  >
                    دقة {session.accuracy}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-center border-t border-slate-100">
            <Link
              href="/progress"
              className="text-xs text-brand-600 hover:text-brand-700 font-bold inline-flex items-center gap-1"
            >
              <span>عرض التقرير الإحصائي والتحليلي الكامل</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
