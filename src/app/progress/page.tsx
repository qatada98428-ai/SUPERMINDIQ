"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowLeft } from "lucide-react";
import { MOCK_STUDENT } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import ClayIcon from "@/components/design-system/ClayIcon";
import { ClayProgressBar } from "@/components/design-system/ClayMotion";

export default function ProgressPage() {
  const { user, profile, isGuest, guestProgress } = useAuth();
  const { playFx } = useApp();
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Clay Banner */}
      <div className="clay-banner-lavender text-white p-6 sm:p-9 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-[22px] overflow-hidden border-2 border-white/50 shadow-clay shrink-0 bg-[#C9B9FF]">
            <Image
              src="/images/clay/champion-reward-kid.jpg"
              alt="تقرير التقدم"
              width={240}
              height={140}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-black flex items-center gap-2.5">
              <span>تقرير التقدم والأداء التحليلي</span>
            </h1>
            <p className="text-white/90 text-xs sm:text-sm mt-1">
              سجل إنجازات وتطور سرعة ودقة الطالب:{" "}
              <strong className="text-amber-200">{displayName}</strong>
              {isGuest && (
                <span className="mr-2 text-[10px] bg-white/20 text-white px-2.5 py-0.5 rounded-full font-bold">
                  وضع الزائر (محفوظ على هذا المتصفح)
                </span>
              )}
            </p>
          </div>
        </div>

        <Link
          href="/dashboard"
          onClick={() => playFx("pop")}
          className="clay-btn-secondary px-5 py-3 text-xs sm:text-sm font-extrabold flex items-center gap-2 shrink-0"
        >
          <span>العودة للوحة الطالب</span>
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* Sculpted Metrics Clay Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="clay-card p-5 sm:p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6E6A94] dark:text-[#B3AED6]">إجمالي التمارين</span>
            <ClayIcon name="book" tone="lavender" size="sm" />
          </div>
          <div className="text-3xl font-black font-mono text-[#1E1B3A] dark:text-white">{totalExercises}</div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold block">
            {isGuest ? "تمارين محفوظة محلياً" : "معدل ممتاز"}
          </span>
        </div>

        <div className="clay-card p-5 sm:p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6E6A94] dark:text-[#B3AED6]">نسبة الدقة التراكمية</span>
            <ClayIcon name="medal" tone="mint" size="sm" />
          </div>
          <div className="text-3xl font-black font-mono text-[#109D8A] dark:text-[#5EEAD4]">{accuracyRate}%</div>
          <span className="text-xs text-[#6E6A94] dark:text-[#B3AED6] block">من مجمل المحاولات</span>
        </div>

        <div className="clay-card p-5 sm:p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6E6A94] dark:text-[#B3AED6]">متوسط زمن الاستجابة</span>
            <ClayIcon name="flash" tone="sky" size="sm" />
          </div>
          <div className="text-3xl font-black font-mono text-brand-600 dark:text-brand-300">
            {student.stats.avgSpeedSeconds}s
          </div>
          <span className="text-xs text-[#6E6A94] dark:text-[#B3AED6] block">لكل رقم وميضي</span>
        </div>

        <div className="clay-card p-5 sm:p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6E6A94] dark:text-[#B3AED6]">أيام الالتزام المتواصل</span>
            <ClayIcon name="flame" tone="peach" size="sm" />
          </div>
          <div className="text-3xl font-black font-mono text-amber-500">{isGuest ? 1 : student.streakDays} يوماً</div>
          <span className="text-xs text-amber-600 dark:text-amber-300 font-bold block">شعلة حماس متقدة</span>
        </div>
      </div>

      {/* Weekly Breakdown Clay Card */}
      <div className="clay-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-[#1E1B3A] dark:text-white flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-brand-600" />
            <span>توزيع الإنجاز الأسبوعي</span>
          </h3>
          <ClayIcon name="chart" tone="lavender" size="sm" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5">
          {student.weeklyProgress.map((item, idx) => (
            <div
              key={idx}
              className="clay-card-sm bg-[#F8F7FE] dark:bg-[#242146] p-4 text-center space-y-2.5"
            >
              <span className="text-xs font-extrabold text-[#4F4A75] dark:text-[#D5D0F2] block">
                {item.day}
              </span>
              <div className="text-2xl font-black font-mono text-[#1E1B3A] dark:text-white">
                {item.count}
              </div>
              <ClayProgressBar value={item.accuracy} tone={item.accuracy >= 90 ? "mint" : "purple"} />
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-extrabold block">
                {item.accuracy}% دقة
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
