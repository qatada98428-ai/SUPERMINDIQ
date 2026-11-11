import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Sparkles,
  Trophy,
  Brain,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";
import { INTELLIGENCE_BRANCHES } from "@/lib/kangaroo-data";

export default function IntelligencePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 border border-indigo-800/40 shadow-2xl">
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5 text-right">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-bold">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>بإشراف وتدريب الأستاذ قتادة كريم — مدرب حساب ذهني معتمد وأستاذ رياضيات</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight flex flex-wrap items-center gap-3">
            <span>بنك</span>
            <span className="text-gradient">أسئلة الذكاء والتفكير المنطقي</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30">
              تجريبي
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            تمارين واختبارات تفاعلية حية لتنمية مهارات التفكير المنطقي، حل المشكلات، والبديهة الرياضية، مقسمة إلى فروع متدرجة حسب الصفوف المدرسية مع توضيح خطوات الحل خطوة بخطوة.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/intelligence/quiz"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>بدء تدريب الذكاء الشامل</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Grade Level Branches */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
              <Brain className="w-4 h-4" />
              <span>المستويات والفروع المدرسية</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              اختر المرحلة الدراسية لبدء تدريب الذكاء
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            كل فرع مصمم بمسائل ملائمة لقدرات الفئة العمرية
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {INTELLIGENCE_BRANCHES.map((branch) => (
            <div
              key={branch.id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group space-y-6"
            >
              <div className="space-y-4 text-right">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>{branch.gradesText}</span>
                  </span>
                  <span className="text-xs text-slate-500 font-bold flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    {branch.durationMinutes} دقيقة
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {branch.title}
                  </h3>
                  <p className="text-xs text-brand-600 font-bold mt-1">
                    {branch.subtitle}
                  </p>
                </div>

                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {branch.description}
                </p>

                {/* Topics Covered */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 block">
                    المهارات والمحاور المستهدفة:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {branch.sampleTopics.map((topic, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>{topic}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100">
                <Link
                  href={`/intelligence/quiz?level=${branch.gradeCode}`}
                  className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>بدء أسئلة {branch.gradesText}</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
