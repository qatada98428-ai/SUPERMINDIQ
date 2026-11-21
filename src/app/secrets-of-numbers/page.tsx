"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  Brain,
  ArrowRight,
  BookOpen,
  Star,
  Award,
  Search,
  Layers,
} from "lucide-react";
import {
  VEDIC_LEVELS,
  VedicLesson,
  VedicLevel,
} from "@/lib/vedic-math-data";
import VedicLessonModal from "@/components/vedic/VedicLessonModal";
import { useApp } from "@/context/AppContext";

export default function SecretsOfNumbersPage() {
  const { playFx, language } = useApp();
  const isEn = language === "en";

  const [selectedLevelId, setSelectedLevelId] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLesson, setActiveLesson] = useState<VedicLesson | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  // Load progress from localStorage
  useEffect(() => {
    try {
      const map: Record<string, number> = {};
      for (const lvl of VEDIC_LEVELS) {
        for (const l of lvl.lessons) {
          const raw = localStorage.getItem(`vedic_progress_${l.id}`);
          if (raw) {
            const parsed = JSON.parse(raw);
            map[l.id] = parsed.stars || 1;
          }
        }
      }
      setProgressMap(map);
    } catch {
      // ignore
    }
  }, []);

  const handleLessonComplete = (lessonId: string, stars: number) => {
    setProgressMap((prev) => ({
      ...prev,
      [lessonId]: Math.max(prev[lessonId] || 0, stars),
    }));
  };

  const filteredLevels = useMemo(() => {
    return VEDIC_LEVELS.map((level) => {
      const matchesLevel = selectedLevelId === "all" || selectedLevelId === level.id;
      if (!matchesLevel) return null;

      const matchedLessons = level.lessons.filter((l) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          l.titleAr.toLowerCase().includes(q) ||
          l.titleEn.toLowerCase().includes(q) ||
          l.subtitleAr.toLowerCase().includes(q)
        );
      });

      return {
        ...level,
        lessons: matchedLessons,
      };
    }).filter((lvl): lvl is VedicLevel => lvl !== null && lvl.lessons.length > 0);
  }, [selectedLevelId, searchQuery]);

  const totalCompleted = Object.keys(progressMap).length;
  const totalLessons = 20;
  const progressPercent = Math.round((totalCompleted / totalLessons) * 100);

  return (
    <div className="min-h-screen bg-[#F7F5FE] dark:bg-[#100F24] pb-24 pt-6 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            onClick={() => playFx("pop")}
            className="clay-pill px-3 py-1.5 text-xs font-bold text-brand-700 dark:text-brand-300 flex items-center gap-1 active:scale-95"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>الرئيسية</span>
          </Link>
          <span className="text-slate-400">/</span>
          <Link
            href="/mental-arithmetic"
            onClick={() => playFx("pop")}
            className="clay-pill px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 active:scale-95"
          >
            برامج العقل الخارق
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-xs font-black text-brand-600 dark:text-brand-300">
            أسرار الرياضيات ورياضيات الفيدا
          </span>
        </div>

        {/* Hero Header matching royal purple platform theme */}
        <div className="clay-banner-lavender relative overflow-hidden p-6 sm:p-10 text-white rounded-[2.5rem] shadow-2xl">
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-4 max-w-3xl text-center lg:text-start">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-amber-300 text-xs sm:text-sm font-black shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>أكاديمية أسرار الرياضيات • منهج معتمد من 4 مستويات متكاملة</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                أسرار الرياضيات ورياضيات الفيدا (Vedic Math)
              </h1>

              <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-2xl">
                20 قاعدة ذهنية خارقة للضرب السريع، القسمة، التربيع، الجذور، الكسور، والنسب المئوية. مناهج تفاعلية تشرح الفكرة خطوة بخطوة مع تدريبات فورية واختبارات سرعة لطلاب الابتدائية والمتوسطة والإعدادية!
              </p>

              {/* Stats badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <div className="px-3.5 py-1.5 rounded-xl bg-white/15 border border-white/20 text-xs font-black flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-300" />
                  <span>4 مستويات دراسية</span>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-white/15 border border-white/20 text-xs font-black flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-300" />
                  <span>20 درساً وقاعدة تفاعلية</span>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-white/15 border border-white/20 text-xs font-black flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>إتقانك الحالي: {totalCompleted} من 20 ({progressPercent}%)</span>
                </div>
              </div>
            </div>

            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white/15 border-4 border-white/30 backdrop-blur-md flex items-center justify-center shadow-2xl shrink-0">
              <Brain className="w-16 h-16 sm:w-20 sm:h-20 text-amber-300 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Level Filters & Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playFx("toggle");
                  setSelectedLevelId("all");
                }}
                className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all active:scale-95 ${
                  selectedLevelId === "all"
                    ? "clay-btn-purple text-white shadow-md"
                    : "clay-pill text-slate-700 dark:text-slate-300"
                }`}
              >
                جميع المستويات (20 درساً)
              </button>

              {VEDIC_LEVELS.map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => {
                    playFx("toggle");
                    setSelectedLevelId(lvl.id);
                  }}
                  className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all active:scale-95 ${
                    selectedLevelId === lvl.id
                      ? "clay-btn-purple text-white shadow-md"
                      : "clay-pill text-slate-700 dark:text-slate-300"
                  }`}
                >
                  المستوى {lvl.id}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن أي قاعدة رياضية..."
                className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white dark:bg-[#1E1B3E] border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold text-slate-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

        {/* Level Sections */}
        <div className="space-y-12">
          {filteredLevels.map((level) => (
            <div key={level.id} className="space-y-5">
              {/* Level Heading */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-brand-200/60 dark:border-brand-900/40 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                    {level.id}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#261E58] dark:text-white">
                      {isEn ? level.titleEn : level.titleAr}
                    </h2>
                    <p className="text-xs text-brand-600 dark:text-brand-300 font-bold">
                      {isEn ? level.taglineEn : level.taglineAr}
                    </p>
                  </div>
                </div>

                <span className="clay-pill px-3.5 py-1 text-xs font-black text-slate-600 dark:text-slate-300 self-start sm:self-auto">
                  {level.lessons.length} دروس
                </span>
              </div>

              {/* Lessons Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {level.lessons.map((lesson) => {
                  const stars = progressMap[lesson.id] || 0;

                  return (
                    <div
                      key={lesson.id}
                      className="clay-card !p-5 sm:!p-6 bg-white dark:bg-[#1E1B3E] border border-brand-200/80 dark:border-brand-800/60 rounded-3xl flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300 shadow-md"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="w-11 h-11 rounded-2xl bg-[#F6F4FE] dark:bg-[#25214D] border border-brand-100 dark:border-brand-900/50 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
                            {lesson.icon}
                          </span>

                          <div className="flex items-center gap-1">
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={s}
                                className={`w-4 h-4 ${
                                  s <= stars
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-slate-200 dark:text-slate-700"
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-black mb-1">
                            {isEn ? lesson.badgeEn : lesson.badgeAr}
                          </div>
                          <h3 className="text-base sm:text-lg font-black text-[#261E58] dark:text-white group-hover:text-brand-600 transition-colors">
                            {isEn ? lesson.titleEn : lesson.titleAr}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {isEn ? lesson.subtitleEn : lesson.subtitleAr}
                          </p>
                        </div>

                        <div className="p-3 rounded-2xl bg-[#F8F6FE] dark:bg-[#25214D] border border-brand-100 dark:border-brand-900/30 text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-2">
                          💡 {isEn ? lesson.ruleExplanationEn : lesson.ruleExplanationAr}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between gap-3">
                        <span className="text-[11px] font-bold text-slate-400">
                          {lesson.workedExamples.length} أمثلة محلولة
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            playFx("modal_open");
                            setActiveLesson(lesson);
                          }}
                          className="clay-btn-purple px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95"
                        >
                          <span>فتح الدرس والتدريب 🚀</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Lesson Modal */}
      {activeLesson && (
        <VedicLessonModal
          lesson={activeLesson}
          onClose={() => setActiveLesson(null)}
          onComplete={handleLessonComplete}
        />
      )}
    </div>
  );
}
