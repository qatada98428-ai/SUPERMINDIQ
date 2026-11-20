"use client";

import React from "react";
import Link from "next/link";
import { Clock, CheckCircle2, GraduationCap, ArrowLeft } from "lucide-react";
import { INTELLIGENCE_BRANCHES } from "@/lib/kangaroo-data";
import ClayIcon from "@/components/design-system/ClayIcon";
import { ClayActionCircle } from "@/components/design-system/ClayMotion";
import { useApp } from "@/context/AppContext";

export default function IntelligencePage() {
  const { playFx } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Soft 3D Lavender Hero Banner */}
      <div className="clay-banner-lavender relative overflow-hidden text-white p-7 sm:p-11">
        <div className="absolute -top-12 -right-12 w-72 h-72 bg-white/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-3xl space-y-4 text-right">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-amber-200 text-xs sm:text-sm font-extrabold">
              <ClayIcon name="trophy" tone="none" size="xs" />
              <span>بإشراف وتدريب الأستاذ قتادة كريم — مدرب حساب ذهني معتمد وأستاذ رياضيات</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight flex flex-wrap items-center gap-3">
              <span>بنك أسئلة الذكاء والتفكير المنطقي</span>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-300 text-[#1E1B3A]">
                تجريبي
              </span>
            </h1>

            <p className="text-white/90 text-sm sm:text-base leading-relaxed">
              تمارين واختبارات تفاعلية حية لتنمية مهارات التفكير المنطقي، حل المشكلات، والبديهة الرياضية، مقسمة إلى فروع متدرجة حسب الصفوف المدرسية مع توضيح خطوات الحل خطوة بخطوة.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/intelligence/quiz"
                onClick={() => playFx("pop")}
                className="clay-btn-amber px-7 py-3.5 font-black text-sm sm:text-base inline-flex items-center gap-2.5"
              >
                <ClayIcon name="sparkles" tone="none" size="xs" />
                <span>بدء تدريب الذكاء الشامل</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4 shrink-0">
            <ClayIcon name="brain" tone="pink" size="xl" className="scale-125" />
            <ClayIcon name="shapes" tone="mint" size="xl" className="translate-y-4" />
          </div>
        </div>
      </div>

      {/* Grade Level Branches */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ClayIcon name="shapes" tone="sky" size="md" />
            <div>
              <span className="text-xs font-extrabold text-brand-600 dark:text-brand-300 block">
                المستويات والفروع المدرسية
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1E1B3A] dark:text-white">
                اختر المرحلة الدراسية لبدء تدريب الذكاء
              </h2>
            </div>
          </div>
          <span className="clay-pill px-4 py-1.5 text-xs text-[#5E5985] dark:text-[#BEB9E2] font-bold">
            كل فرع مصمم بمسائل ملائمة لقدرات الفئة العمرية
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {INTELLIGENCE_BRANCHES.map((branch, idx) => (
            <div
              key={branch.id}
              className="clay-card p-6 sm:p-7 flex flex-col justify-between group space-y-5 hover:-translate-y-1"
            >
              <div className="space-y-4 text-right">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <ClayIcon
                      name={idx % 2 === 0 ? "brain" : "shapes"}
                      tone={idx % 2 === 0 ? "lavender" : "mint"}
                      size="md"
                    />
                    <span className="clay-pill px-3.5 py-1 text-brand-700 dark:text-brand-200 text-xs font-extrabold flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>{branch.gradesText}</span>
                    </span>
                  </div>
                  <span className="clay-pill px-3 py-1 text-xs text-[#56517A] dark:text-[#D5D0F2] font-black flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    {branch.durationMinutes} دقيقة
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#1E1B3A] dark:text-white group-hover:text-brand-600 transition-colors">
                    {branch.title}
                  </h3>
                  <p className="text-xs text-brand-600 dark:text-brand-300 font-bold mt-1">
                    {branch.subtitle}
                  </p>
                </div>

                <p className="text-[#5E5985] dark:text-[#BEB9E2] text-xs sm:text-sm leading-relaxed">
                  {branch.description}
                </p>

                <div className="pt-3 border-t border-[#EEEBFA] dark:border-[#2E2B57] space-y-2">
                  <span className="text-[11px] font-bold text-[#6E6A94] dark:text-[#A19CC7] block">
                    المهارات والمحاور المستهدفة:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {branch.sampleTopics.map((topic, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-xl bg-[#F5F3FE] dark:bg-[#242146] border border-[#E6E1FB] dark:border-[#363268] text-[#3F3A66] dark:text-[#E2DFF7] text-[11px] font-bold flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>{topic}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EEEBFA] dark:border-[#2E2B57]">
                <Link
                  href={`/intelligence/quiz?level=${branch.gradeCode}`}
                  onClick={() => playFx("pop")}
                  className="clay-btn-purple w-full py-3 px-5 font-extrabold text-xs sm:text-sm flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <ClayIcon name="sparkles" tone="none" size="xs" />
                    <span>بدء أسئلة {branch.gradesText}</span>
                  </span>
                  <ClayActionCircle variant="play" size="sm" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
