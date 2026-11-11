"use client";

import React from "react";
import Link from "next/link";
import {
  TrendingUp,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import { MOCK_STUDENT } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";

export default function ProgressPage() {
  const { user, profile, isGuest, guestProgress } = useAuth();
  const student = MOCK_STUDENT;

  const displayName = isGuest
    ? "بطل التدريب الحر (زائر)"
    : profile?.name || user?.email?.split("@")[0] || student.name;

  const totalExercises = isGuest ? guestProgress.completedExercises : student.stats.totalExercises;
  const accuracyRate = isGuest
    ? guestProgress.totalAnswers > 0
      ? guestProgress.accuracyRate
      : 100
    : student.stats.accuracyRate;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-brand-600" />
            <span>تقرير التقدم والأداء التحليلي</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            سجل إنجازات وتطور سرعة ودقة الطالب: <strong className="text-slate-800 dark:text-slate-200">{displayName}</strong>
            {isGuest && (
              <span className="mr-2 text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                وضع الزائر (محفوظ على هذا المتصفح)
              </span>
            )}
          </p>
        </div>

        <Link
          href="/dashboard"
          className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5 self-start"
        >
          <span>العودة للوحة الطالب</span>
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">إجمالي التمارين</span>
          <div className="text-3xl font-black font-mono text-slate-900 dark:text-white">{totalExercises}</div>
          <span className="text-xs text-emerald-600 font-bold">
            {isGuest ? "تمارين محفوظة محلياً" : "معدل ممتاز"}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">نسبة الدقة التراكمية</span>
          <div className="text-3xl font-black font-mono text-emerald-600">{accuracyRate}%</div>
          <span className="text-xs text-slate-500">من مجمل المحاولات</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">متوسط زمن الاستجابة</span>
          <div className="text-3xl font-black font-mono text-brand-600">{student.stats.avgSpeedSeconds}s</div>
          <span className="text-xs text-slate-500">لكل رقم وميضي</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">أيام الالتزام المتواصل</span>
          <div className="text-3xl font-black font-mono text-amber-500">{isGuest ? 1 : student.streakDays} يوماً</div>
          <span className="text-xs text-amber-600 font-bold">شعلة حماس متقدة</span>
        </div>
      </div>

      {/* Weekly Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-brand-600" />
          <span>توزيع الإنجاز الأسبوعي</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {student.weeklyProgress.map((item, idx) => (
            <div key={idx} className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">{item.day}</span>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">{item.count}</div>
              <span className="text-[11px] text-emerald-600 font-bold block">{item.accuracy}% دقة</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
