"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import {
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Trophy,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  INTELLIGENCE_QUESTIONS,
  IntelligenceQuestion,
} from "@/lib/kangaroo-data";
import { COACH_INFO } from "@/lib/constants";
import { soundSynth } from "@/lib/audio-synthesizer";

function QuizContent() {
  const searchParams = useSearchParams();
  const initialLevelParam = searchParams.get("level") || "all";

  const [selectedLevel, setSelectedLevel] = useState<string>(initialLevelParam);
  const [selectedPointsFilter, setSelectedPointsFilter] = useState<number>(0); // 0 = all
  const [mode, setMode] = useState<"practice" | "exam">("practice");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return INTELLIGENCE_QUESTIONS.filter((q) => {
      const matchesLevel =
        selectedLevel === "all" || q.gradeLevel === selectedLevel;

      const matchesPoints =
        selectedPointsFilter === 0 || q.points === selectedPointsFilter;

      return matchesLevel && matchesPoints;
    });
  }, [selectedLevel, selectedPointsFilter]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, "A" | "B" | "C" | "D" | "E">>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45 * 60);

  // Reset state on filter change
  useEffect(() => {
    setCurrentIdx(0);
    setUserAnswers({});
    setShowExplanation({});
    setIsSubmitted(false);
    setTimeLeft(45 * 60);
  }, [selectedLevel, selectedPointsFilter, mode]);

  // Exam timer countdown
  useEffect(() => {
    if (mode !== "exam" || isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [mode, isSubmitted]);

  const currentQ: IntelligenceQuestion | undefined = filteredQuestions[currentIdx];

  const handleSelectOption = (key: "A" | "B" | "C" | "D" | "E") => {
    if (!currentQ || isSubmitted) return;
    if (mode === "practice" && userAnswers[currentQ.id]) return;

    setUserAnswers((prev) => ({ ...prev, [currentQ.id]: key }));

    if (mode === "practice") {
      setShowExplanation((prev) => ({ ...prev, [currentQ.id]: true }));
      if (key === currentQ.correctAnswer) {
        if (soundEnabled) soundSynth.playSuccessChime();
      } else {
        if (soundEnabled) soundSynth.playEncouragingMistake();
      }
    } else {
      if (soundEnabled) soundSynth.playBeadClick(560);
    }
  };

  const calculateResults = () => {
    let totalScore = 0;
    let maxPossibleScore = 0;
    let correctCount = 0;

    filteredQuestions.forEach((q) => {
      maxPossibleScore += q.points;
      if (userAnswers[q.id] === q.correctAnswer) {
        totalScore += q.points;
        correctCount++;
      }
    });

    return { totalScore, maxPossibleScore, correctCount };
  };

  const handleSubmitExam = () => {
    setIsSubmitted(true);
    const { totalScore, maxPossibleScore } = calculateResults();
    if (maxPossibleScore > 0 && totalScore / maxPossibleScore >= 0.75) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (filteredQuestions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">
          لا توجد أسئلة تطابق الفلتر المحدد حالياً
        </h2>
        <button
          onClick={() => {
            setSelectedLevel("all");
            setSelectedPointsFilter(0);
          }}
          className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold"
        >
          إعادة تعيين الفلاتر
        </button>
      </div>
    );
  }

  const results = isSubmitted ? calculateResults() : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/intelligence"
              className="text-xs text-brand-600 hover:text-brand-700 font-bold inline-flex items-center gap-1"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة لفروع أسئلة الذكاء</span>
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              إشراف: {COACH_INFO.name}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            بنك أسئلة الذكاء والتفكير المنطقي
          </h1>
        </div>

        {/* Mode Selector & Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-colors ${
              soundEnabled
                ? "bg-slate-50 border-slate-200 text-slate-700"
                : "bg-rose-50 border-rose-200 text-rose-600"
            }`}
            title={soundEnabled ? "كتم الصوت" : "تشغيل الصوت"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setMode("practice")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mode === "practice"
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🎓 نمط التدريب والشرح
            </button>
            <button
              onClick={() => setMode("exam")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mode === "exam"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ⏱️ محاكاة الاختبار الزمني
            </button>
          </div>

          {mode === "exam" && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono font-bold">
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>{formatTimer(timeLeft)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs: Levels & Points */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 text-xs">
        {/* Level selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-bold text-slate-500 ml-1">المرحلة:</span>
          <button
            onClick={() => setSelectedLevel("all")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              selectedLevel === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            جميع المراحل ({INTELLIGENCE_QUESTIONS.length})
          </button>
          <button
            onClick={() => setSelectedLevel("1-2")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              selectedLevel === "1-2"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            الصف 1 و 2 ابتدائي
          </button>
          <button
            onClick={() => setSelectedLevel("3-4")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              selectedLevel === "3-4"
                ? "bg-amber-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            الصف 3 و 4 ابتدائي
          </button>
          <button
            onClick={() => setSelectedLevel("5-6")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              selectedLevel === "5-6"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            الصف 5 و 6 ابتدائي
          </button>
          <button
            onClick={() => setSelectedLevel("7-8")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              selectedLevel === "7-8"
                ? "bg-purple-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            المرحلة المتوسطة
          </button>
        </div>

        {/* Points filter */}
        <div className="flex items-center gap-1">
          <span className="font-bold text-slate-500 ml-1">النقاط:</span>
          {[
            { val: 0, label: "الكل" },
            { val: 3, label: "3 نقاط" },
            { val: 4, label: "4 نقاط" },
            { val: 5, label: "5 نقاط 🔥" },
          ].map((p) => (
            <button
              key={p.val}
              onClick={() => setSelectedPointsFilter(p.val)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                selectedPointsFilter === p.val
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress & Pagination Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
          <span>
            السؤال {currentIdx + 1} من {filteredQuestions.length}
          </span>
          <span className="text-brand-600">
            تمت الإجابة: {Object.keys(userAnswers).length} / {filteredQuestions.length}
          </span>
        </div>

        {/* Question Numbers Grid Navigator */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
          {filteredQuestions.map((q, idx) => {
            const isAnswered = userAnswers[q.id] !== undefined;
            const isCurrent = idx === currentIdx;
            const isCorrect = userAnswers[q.id] === q.correctAnswer;

            let badgeStyle = "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200";
            if (mode === "practice" && isAnswered) {
              badgeStyle = isCorrect
                ? "bg-emerald-500 text-white border-emerald-600"
                : "bg-rose-500 text-white border-rose-600";
            } else if (isAnswered) {
              badgeStyle = "bg-brand-600 text-white border-brand-700";
            }

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(idx)}
                className={`w-8 h-8 rounded-xl font-mono text-xs font-black border transition-all ${badgeStyle} ${
                  isCurrent ? "ring-2 ring-brand-500 ring-offset-1 scale-105" : ""
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Card */}
      {currentQ && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-200">
          {/* Question Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold">
                {currentQ.levelName}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                {currentQ.points} نقاط
              </span>
              <span className="text-xs text-slate-500 font-medium">
                محور: {currentQ.topic}
              </span>
            </div>

            <span className="text-xs font-mono font-bold text-slate-400">
              مسألة رقم #{currentQ.questionNumber}
            </span>
          </div>

          {/* Question Title & Text */}
          <div className="space-y-4 text-right">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {currentQ.title}
            </h2>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-base sm:text-lg leading-relaxed font-medium">
              {currentQ.textAr}
            </div>
          </div>

          {/* Options Grid */}
          <div className="space-y-2.5 pt-2">
            <span className="text-xs font-bold text-slate-500 block text-right">
              اختر الإجابة الصحيحة:
            </span>
            <div className="grid grid-cols-1 gap-2.5">
              {currentQ.options.map((opt) => {
                const isSelected = userAnswers[currentQ.id] === opt.key;
                const isCorrect = opt.key === currentQ.correctAnswer;
                const showFeedback =
                  Boolean(mode === "practice" && userAnswers[currentQ.id]) || isSubmitted;

                let optStyle =
                  "bg-slate-50 border-slate-200 text-slate-800 hover:bg-brand-50 hover:border-brand-300";

                if (showFeedback) {
                  if (isCorrect) {
                    optStyle = "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/30";
                  } else if (isSelected && !isCorrect) {
                    optStyle = "bg-rose-50 border-rose-500 text-rose-950 line-through";
                  } else {
                    optStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                  }
                } else if (isSelected) {
                  optStyle = "bg-brand-50 border-brand-500 text-brand-900 ring-2 ring-brand-500/30";
                }

                return (
                  <button
                    key={opt.key}
                    disabled={showFeedback}
                    onClick={() => handleSelectOption(opt.key)}
                    className={`p-4 rounded-2xl border text-right transition-all flex items-center justify-between gap-4 ${optStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0 shadow-xs">
                        {opt.key}
                      </span>
                      <span className="text-sm sm:text-base font-bold">{opt.labelAr}</span>
                    </div>

                    {showFeedback && (
                      <div>
                        {isCorrect && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>الإجابة الصحيحة</span>
                          </span>
                        )}
                        {isSelected && !isCorrect && (
                          <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>إجابة خاطئة</span>
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model Explanation in Practice Mode */}
          {((mode === "practice" && showExplanation[currentQ.id]) || isSubmitted) && (
            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-right space-y-2 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>خطوات الحل والتفسير المنطقي النموذجي:</span>
              </div>
              <p className="text-xs sm:text-sm text-amber-950 leading-relaxed font-medium">
                {currentQ.explanationAr}
              </p>
            </div>
          )}

          {/* Pagination Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent flex items-center gap-1.5"
            >
              <ArrowRight className="w-4 h-4" />
              <span>السابق</span>
            </button>

            {mode === "exam" && !isSubmitted ? (
              <button
                onClick={handleSubmitExam}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
              >
                إنهاء الاختبار وتسليم الإجابات
              </button>
            ) : (
              <span className="text-xs text-slate-400 font-mono">
                {currentIdx + 1} / {filteredQuestions.length}
              </span>
            )}

            <button
              onClick={() =>
                setCurrentIdx((prev) => Math.min(filteredQuestions.length - 1, prev + 1))
              }
              disabled={currentIdx === filteredQuestions.length - 1}
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm disabled:opacity-40 flex items-center gap-1.5 shadow-sm"
            >
              <span>التالي</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Results Summary Modal / Card */}
      {results && (
        <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 space-y-6 text-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8 text-amber-400" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black">نتيجة اختبار أسئلة الذكاء</h3>
            <p className="text-slate-400 text-sm">
              أداء رائع! إليك ملخص درجاتك وإجاباتك
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
            <div className="bg-slate-800 p-3.5 rounded-2xl">
              <span className="text-xs text-slate-400 block">الدرجة المحققة</span>
              <span className="font-mono font-black text-2xl text-emerald-400">
                {results.totalScore}
              </span>
            </div>
            <div className="bg-slate-800 p-3.5 rounded-2xl">
              <span className="text-xs text-slate-400 block">الدرجة الكلية</span>
              <span className="font-mono font-black text-2xl text-slate-200">
                {results.maxPossibleScore}
              </span>
            </div>
            <div className="bg-slate-800 p-3.5 rounded-2xl">
              <span className="text-xs text-slate-400 block">الإجابات الصحيحة</span>
              <span className="font-mono font-black text-2xl text-amber-400">
                {results.correctCount}/{filteredQuestions.length}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => {
                setUserAnswers({});
                setShowExplanation({});
                setIsSubmitted(false);
                setCurrentIdx(0);
                setTimeLeft(45 * 60);
              }}
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة الاختبار</span>
            </button>
            <Link
              href="/intelligence"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm"
            >
              العودة لقائمة الفروع
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function IntelligenceQuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-600">جارٍ تحميل بنك أسئلة الذكاء...</p>
          </div>
        </div>
      }
    >
      <QuizContent />
    </Suspense>
  );
}
