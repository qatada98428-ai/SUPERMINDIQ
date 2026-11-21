"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Timer,
  Award,
  BookOpen,
  Zap,
  Star,
  ArrowRight,
} from "lucide-react";
import {
  VedicLesson,
  GeneratedQuestion,
} from "@/lib/vedic-math-data";
import { useApp } from "@/context/AppContext";
import { soundSynth } from "@/lib/audio-synthesizer";

interface VedicLessonModalProps {
  lesson: VedicLesson;
  onClose: () => void;
  onComplete?: (lessonId: string, stars: number) => void;
}

type TabType = "learn" | "practice" | "mastery";

export default function VedicLessonModal({
  lesson,
  onClose,
  onComplete,
}: VedicLessonModalProps) {
  const { playFx, language } = useApp();
  const isEn = language === "en";

  const [activeTab, setActiveTab] = useState<TabType>("learn");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");

  // Practice state
  const [currentQ, setCurrentQ] = useState<GeneratedQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [practiceStats, setPracticeStats] = useState({ correct: 0, total: 0 });

  // Mastery Test state
  const [masteryActive, setMasteryActive] = useState(false);
  const [masteryIndex, setMasteryIndex] = useState(0);
  const [masteryQuestions, setMasteryQuestions] = useState<GeneratedQuestion[]>([]);
  const [masteryAnswers, setMasteryAnswers] = useState<boolean[]>([]);
  const [masteryTimeLeft, setMasteryTimeLeft] = useState(60);
  const [masteryFinished, setMasteryFinished] = useState(false);

  // Load new practice question
  const loadNewPracticeQuestion = useCallback(
    (diff: "easy" | "medium" | "hard" = difficulty) => {
      const q = lesson.generateQuestion(diff);
      setCurrentQ(q);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
      setIsCorrect(false);
      setShowHint(false);
    },
    [lesson, difficulty]
  );

  useEffect(() => {
    loadNewPracticeQuestion("easy");
  }, [loadNewPracticeQuestion]);

  // Handle Practice Answer Selection
  const handleSelectAnswer = (ans: number | string) => {
    if (isAnswerChecked) return;
    playFx("pop");
    setSelectedAnswer(ans);
    setIsAnswerChecked(true);

    const correct = String(ans).trim() === String(currentQ?.correctAnswer).trim();
    setIsCorrect(correct);

    if (correct) {
      soundSynth.playCorrectFeedback();
      setPracticeStats((prev) => ({
        correct: prev.correct + 1,
        total: prev.total + 1,
      }));
    } else {
      soundSynth.playEncouragingMistake();
      setPracticeStats((prev) => ({
        correct: prev.correct,
        total: prev.total + 1,
      }));
    }
  };

  // Start Mastery Test
  const startMasteryTest = () => {
    playFx("pop");
    const qs: GeneratedQuestion[] = [
      lesson.generateQuestion("easy"),
      lesson.generateQuestion("easy"),
      lesson.generateQuestion("medium"),
      lesson.generateQuestion("medium"),
      lesson.generateQuestion("hard"),
    ];
    setMasteryQuestions(qs);
    setMasteryIndex(0);
    setMasteryAnswers([]);
    setMasteryTimeLeft(60);
    setMasteryFinished(false);
    setMasteryActive(true);
  };

  // Mastery Timer
  useEffect(() => {
    if (!masteryActive || masteryFinished) return;
    const interval = setInterval(() => {
      setMasteryTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setMasteryFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [masteryActive, masteryFinished]);

  // Handle Mastery Question Answer
  const handleMasteryAnswer = (ans: number | string) => {
    if (!masteryActive || masteryFinished) return;
    const currentMasteryQ = masteryQuestions[masteryIndex];
    const correct = String(ans).trim() === String(currentMasteryQ.correctAnswer).trim();

    if (correct) {
      soundSynth.playCorrectFeedback();
    } else {
      soundSynth.playEncouragingMistake();
    }

    const nextAnswers = [...masteryAnswers, correct];
    setMasteryAnswers(nextAnswers);

    if (masteryIndex + 1 < masteryQuestions.length) {
      setMasteryIndex((idx) => idx + 1);
    } else {
      setMasteryFinished(true);
      const score = nextAnswers.filter(Boolean).length;
      let stars = 1;
      if (score >= 5) stars = 3;
      else if (score >= 3) stars = 2;

      // Save progress to localStorage
      try {
        const key = `vedic_progress_${lesson.id}`;
        localStorage.setItem(
          key,
          JSON.stringify({
            lessonId: lesson.id,
            stars,
            score,
            date: new Date().toISOString(),
          })
        );
      } catch {
        // storage ignored
      }

      if (onComplete) onComplete(lesson.id, stars);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#120F29]/75 backdrop-blur-md p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="clay-card !p-0 bg-white dark:bg-[#1E1B3E] border-2 border-brand-500/40 rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/40 flex items-center justify-center text-2xl shrink-0 shadow-sm">
              {lesson.icon}
            </div>
            <div className="text-right min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] mb-1">
                <Sparkles className="w-3 h-3" />
                <span>{isEn ? lesson.badgeEn : lesson.badgeAr}</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-white truncate">
                {isEn ? lesson.titleEn : lesson.titleAr}
              </h3>
              <p className="text-xs text-white/80 truncate">
                {isEn ? lesson.subtitleEn : lesson.subtitleAr}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playFx("pop");
              onClose();
            }}
            className="w-10 h-10 rounded-2xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center shrink-0 transition-transform active:scale-95"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-around border-b border-slate-200 dark:border-slate-800 bg-[#F8F6FE] dark:bg-[#181534] px-4 py-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              playFx("toggle");
              setActiveTab("learn");
            }}
            className={`px-4 sm:px-6 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
              activeTab === "learn"
                ? "clay-btn-purple text-white shadow-md"
                : "text-slate-600 dark:text-slate-300 hover:text-brand-600"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{isEn ? "1. Learn Rule" : "١. شرح القاعدة والأمثلة"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playFx("toggle");
              setActiveTab("practice");
            }}
            className={`px-4 sm:px-6 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
              activeTab === "practice"
                ? "clay-btn-purple text-white shadow-md"
                : "text-slate-600 dark:text-slate-300 hover:text-brand-600"
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>{isEn ? "2. Interactive Practice" : "٢. تدريب تفاعلي مستمر"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playFx("toggle");
              setActiveTab("mastery");
            }}
            className={`px-4 sm:px-6 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
              activeTab === "mastery"
                ? "clay-btn-purple text-white shadow-md"
                : "text-slate-600 dark:text-slate-300 hover:text-brand-600"
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>{isEn ? "3. Mastery Speed Test" : "٣. اختبار الإتقان والسرعة"}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-right">
          {/* TAB 1: LEARN & EXAMPLES */}
          {activeTab === "learn" && (
            <div className="space-y-6">
              {/* Rule Explanation */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-brand-50 to-indigo-50 dark:from-brand-950/40 dark:to-indigo-950/40 border border-brand-200 dark:border-brand-800 space-y-3 shadow-sm">
                <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300 font-black text-sm">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>الشرح التعليمي المبسط:</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-line">
                  {isEn ? lesson.ruleExplanationEn : lesson.ruleExplanationAr}
                </p>
              </div>

              {/* Math Theory & Conditions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    📐 الفكرة والبرهان الرياضي:
                  </span>
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-center text-xs sm:text-sm font-black text-slate-800 dark:text-white" dir="ltr">
                    {isEn ? lesson.mathTheoryEn : lesson.mathTheoryAr}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    ✅ شروط التطبيق وحدود القاعدة:
                  </span>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                    {(isEn ? lesson.conditionsEn : lesson.conditionsAr).map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                    <li className="text-amber-700 dark:text-amber-400 font-bold">
                      {isEn ? lesson.limitsEn : lesson.limitsAr}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Step-by-Step Worked Examples */}
              <div className="space-y-3">
                <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>📖 أمثلة محلولة خطوة بخطوة من السهل إلى الصعب:</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lesson.workedExamples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                        <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          مثال {idx + 1} ({ex.difficulty === "easy" ? "سهل" : ex.difficulty === "medium" ? "متوسط" : "متقدم"})
                        </span>
                        <span className="font-mono font-black text-base text-brand-600 dark:text-brand-300" dir="ltr">
                          {ex.problem} = {ex.answer}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {ex.steps.map((st) => (
                          <div
                            key={st.stepNumber}
                            className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300"
                          >
                            <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                              {st.stepNumber}
                            </span>
                            <div className="space-y-0.5">
                              <p>{isEn ? st.explanationEn : st.explanationAr}</p>
                              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold block" dir="ltr">
                                {st.mathExpression}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ready CTA */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    playFx("pop");
                    setActiveTab("practice");
                  }}
                  className="clay-btn-purple px-8 py-3.5 rounded-2xl font-black text-sm inline-flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>انتقل إلى التدريب التفاعلي الآن 🚀</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE PRACTICE */}
          {activeTab === "practice" && (
            <div className="space-y-6">
              {/* Difficulty selector & score bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F8F6FE] dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">مستوى الصعوبة:</span>
                  {(["easy", "medium", "hard"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        playFx("toggle");
                        setDifficulty(d);
                        loadNewPracticeQuestion(d);
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                        difficulty === d
                          ? "bg-brand-600 text-white shadow-sm"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {d === "easy" ? "سهل" : d === "medium" ? "متوسط" : "متقدم"}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 text-xs font-black">
                  <span className="text-emerald-600 dark:text-emerald-400">
                    صحيح: {practiceStats.correct}
                  </span>
                  <span className="text-slate-400">/</span>
                  <span className="text-slate-600 dark:text-slate-300">
                    المجموع: {practiceStats.total}
                  </span>
                </div>
              </div>

              {/* Question Card */}
              {currentQ && (
                <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border-2 border-brand-200 dark:border-brand-800 text-center space-y-6">
                  <span className="text-xs font-extrabold text-brand-600 dark:text-brand-300">
                    احسب الناتج ذهنياً باستخدام القاعدة:
                  </span>

                  <div
                    className="font-black text-4xl sm:text-6xl text-slate-900 dark:text-white font-mono tracking-wide"
                    dir="ltr"
                  >
                    {currentQ.problem} = ?
                  </div>

                  {/* Multiple Choice Answers */}
                  <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto pt-2">
                    {currentQ.options.map((opt, i) => {
                      const isThisSelected = selectedAnswer === opt;
                      const isThisCorrect = String(opt).trim() === String(currentQ.correctAnswer).trim();

                      let btnStyle = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-brand-500 hover:scale-[1.02]";
                      if (isAnswerChecked) {
                        if (isThisCorrect) {
                          btnStyle = "bg-emerald-500 text-white border-emerald-600 shadow-md";
                        } else if (isThisSelected && !isCorrect) {
                          btnStyle = "bg-rose-500 text-white border-rose-600 shadow-md";
                        } else {
                          btnStyle = "opacity-50 bg-slate-100 dark:bg-slate-800 text-slate-400";
                        }
                      }

                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSelectAnswer(opt)}
                          disabled={isAnswerChecked}
                          className={`p-4 rounded-2xl border-2 font-mono font-black text-xl sm:text-2xl transition-all shadow-sm active:scale-95 ${btnStyle}`}
                          dir="ltr"
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback & Step-by-Step Explanation when answered */}
                  {isAnswerChecked && (
                    <div
                      className={`p-4 sm:p-5 rounded-2xl text-right space-y-2 animate-in fade-in duration-200 ${
                        isCorrect
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-900 dark:text-emerald-200"
                          : "bg-rose-50 dark:bg-rose-950/40 border border-rose-300 text-rose-900 dark:text-rose-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-black text-sm">
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            <span>إجابة صحيحة خارقة! أحسنت يا بطل! 🌟</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                            <span>إجابة غير صحيحة، إليك خطوات الحل الصحيح بالتفصيل:</span>
                          </>
                        )}
                      </div>

                      <div className="text-xs space-y-1 font-medium pr-7">
                        {currentQ.explanationSteps.map((step, idx) => (
                          <p key={idx} className="leading-relaxed">
                            • {step}
                          </p>
                        ))}
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => loadNewPracticeQuestion()}
                          className="clay-btn-purple px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                        >
                          <span>السؤال التالي</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Hint Toggle */}
                  {!isAnswerChecked && (
                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setShowHint(!showHint)}
                        className="text-xs font-bold text-brand-600 dark:text-brand-300 hover:underline inline-flex items-center gap-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{showHint ? "إخفاء التلميح" : "تلميح سريع للحل؟"}</span>
                      </button>
                      {showHint && (
                        <p className="mt-2 text-xs font-bold text-amber-600 dark:text-amber-400 animate-in fade-in">
                          💡 {isEn ? currentQ.hintEn : currentQ.hintAr}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MASTERY SPEED TEST */}
          {activeTab === "mastery" && (
            <div className="space-y-6">
              {!masteryActive && !masteryFinished && (
                <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-300 dark:border-amber-700/60 text-center space-y-5 max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-3xl bg-amber-400 text-slate-950 flex items-center justify-center text-3xl mx-auto shadow-md">
                    ⏱️
                  </div>
                  <h4 className="text-xl font-black text-amber-950 dark:text-amber-200">
                    اختبار الإتقان والسرعة الذهنية
                  </h4>
                  <p className="text-xs text-amber-900/80 dark:text-amber-300 leading-relaxed">
                    5 أسئلة متدرجة تقيس سرعتك ودقتك في تطبيق هذه القاعدة خلال 60 ثانية. احصل على 3 نجوم للإتقان الكامل!
                  </p>
                  <button
                    type="button"
                    onClick={startMasteryTest}
                    className="clay-btn-amber px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
                  >
                    <span>ابدأ الاختبار الآن (60 ثانية) 🔥</span>
                  </button>
                </div>
              )}

              {masteryActive && !masteryFinished && masteryQuestions[masteryIndex] && (
                <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border-2 border-amber-400 text-center space-y-6">
                  {/* Timer & Question Index */}
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <span className="text-xs font-black text-brand-600 dark:text-brand-300">
                      السؤال {masteryIndex + 1} من {masteryQuestions.length}
                    </span>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-mono font-black text-sm">
                      <Timer className="w-4 h-4 text-amber-500 animate-spin" />
                      <span>{masteryTimeLeft} ثانية</span>
                    </div>
                  </div>

                  <div
                    className="font-black text-4xl sm:text-6xl text-slate-900 dark:text-white font-mono tracking-wide"
                    dir="ltr"
                  >
                    {masteryQuestions[masteryIndex].problem} = ?
                  </div>

                  <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto pt-2">
                    {masteryQuestions[masteryIndex].options.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleMasteryAnswer(opt)}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-amber-400 font-mono font-black text-xl sm:text-2xl transition-all shadow-sm active:scale-95"
                        dir="ltr"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {masteryFinished && (
                <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 text-center space-y-5 max-w-lg mx-auto shadow-xl">
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3].map((star) => {
                      const score = masteryAnswers.filter(Boolean).length;
                      const active =
                        star === 1 ? score >= 1 : star === 2 ? score >= 3 : score >= 5;
                      return (
                        <Star
                          key={star}
                          className={`w-10 h-10 ${
                            active
                              ? "text-amber-400 fill-amber-400 animate-bounce"
                              : "text-slate-300 dark:text-slate-700"
                          }`}
                        />
                      );
                    })}
                  </div>

                  <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                    {masteryAnswers.filter(Boolean).length >= 4
                      ? "إتقان خارق وعبقرية رياضية! 🏆"
                      : "نتيجة ممتازة وتدريب رائع! 👏"}
                  </h4>

                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    أجبت على {masteryAnswers.filter(Boolean).length} من 5 أسئلة صحيحة في{" "}
                    {60 - masteryTimeLeft} ثانية.
                  </p>

                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={startMasteryTest}
                      className="clay-pill px-5 py-2.5 text-xs font-bold flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>إعادة الاختبار</span>
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="clay-btn-purple px-6 py-2.5 text-xs font-black rounded-xl"
                    >
                      <span>تمت المذاكرة</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
