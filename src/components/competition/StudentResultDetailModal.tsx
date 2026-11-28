"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  Award,
  Layers,
  Printer,
  User,
  Mail,
  MapPin,
  RotateCcw,
} from "lucide-react";
import {
  AssignmentSubmission,
  AssignmentAttemptRecord,
  formatAttemptLabelAr,
} from "@/lib/platform-store";

interface StudentResultDetailModalProps {
  submission: AssignmentSubmission | null;
  assignmentTitle?: string;
  rank?: number;
  onClose: () => void;
}

export default function StudentResultDetailModal({
  submission,
  assignmentTitle,
  rank,
  onClose,
}: StudentResultDetailModalProps) {
  const [filter, setFilter] = useState<"all" | "wrong" | "correct">("all");
  const [selectedAttemptIdx, setSelectedAttemptIdx] = useState<number>(-1);

  const attemptsList: AssignmentAttemptRecord[] = submission
    ? submission.attempts && submission.attempts.length > 0
      ? submission.attempts
      : [
          {
            attemptNumber: Math.max(1, submission.attemptNumber || 1),
            score: submission.score,
            totalQuestions: submission.totalQuestions,
            correctAnswers: submission.correctAnswers,
            wrongAnswers: submission.wrongAnswers,
            unansweredCount: submission.unansweredCount,
            accuracy: submission.accuracy,
            durationSeconds: submission.durationSeconds,
            avgSecondsPerQuestion: submission.avgSecondsPerQuestion,
            ruleBreakdown: submission.ruleBreakdown,
            questionDetails: submission.questionDetails,
            completedAt: submission.completedAt,
          },
        ]
    : [];

  useEffect(() => {
    if (submission) {
      setSelectedAttemptIdx(Math.max(0, attemptsList.length - 1));
      setFilter("all");
    }
  }, [submission, attemptsList.length]);

  if (!submission) return null;

  const activeAttempt =
    attemptsList[
      selectedAttemptIdx >= 0 && selectedAttemptIdx < attemptsList.length
        ? selectedAttemptIdx
        : attemptsList.length - 1
    ];

  const wrongCount =
    activeAttempt.wrongAnswers ??
    Math.max(0, activeAttempt.totalQuestions - activeAttempt.correctAnswers);
  const unanswered = activeAttempt.unansweredCount ?? 0;
  const avgSec =
    activeAttempt.avgSecondsPerQuestion ??
    (activeAttempt.totalQuestions > 0
      ? Number((activeAttempt.durationSeconds / activeAttempt.totalQuestions).toFixed(1))
      : 0);

  const mins = Math.floor(activeAttempt.durationSeconds / 60);
  const secs = activeAttempt.durationSeconds % 60;
  const formattedDuration =
    mins > 0 ? `${mins} د ${secs} ث` : `${secs} ثانية`;

  const details = activeAttempt.questionDetails || [];
  const filteredDetails = details.filter((q) => {
    if (filter === "wrong") return !q.isCorrect;
    if (filter === "correct") return q.isCorrect;
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border-2 border-brand-400/70 shadow-2xl p-5 sm:p-7 my-6 space-y-5 max-h-[90vh] flex flex-col text-right"
      >
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 shrink-0 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              {rank !== undefined && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
                  {rank === 1 ? "🥇 المركز الأول" : rank === 2 ? "🥈 المركز الثاني" : rank === 3 ? "🥉 المركز الثالث" : `الترتيب #${rank}`}
                </span>
              )}
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-black inline-flex items-center gap-1 ${
                  activeAttempt.attemptNumber >= 2
                    ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700"
                    : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                }`}
              >
                <RotateCcw className="w-3 h-3" />
                <span>{formatAttemptLabelAr(activeAttempt.attemptNumber)}</span>
              </span>
              <span className="text-xs font-bold text-slate-500">
                {new Date(activeAttempt.completedAt).toLocaleString("ar-IQ")}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-brand-600" />
              <span>تقرير نتيجة الطالب: {submission.studentName}</span>
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-bold">
              {assignmentTitle && <span>🏆 المسابقة: {assignmentTitle}</span>}
              {submission.studentEmail && (
                <span className="flex items-center gap-1 font-mono">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{submission.studentEmail}</span>
                </span>
              )}
              {submission.governorate && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{submission.governorate}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-black flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {/* Multiple Attempts Switcher */}
          {attemptsList.length > 1 && (
            <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-2">
              <div className="text-xs font-black text-indigo-800 dark:text-indigo-200 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>سجل محاولات الطالب في هذه البطولة ({attemptsList.length} محاولات — اضغط لاستعراض تفاصيل أي محاولة):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {attemptsList.map((att, idx) => {
                  const isActive =
                    (selectedAttemptIdx >= 0 ? selectedAttemptIdx : attemptsList.length - 1) === idx;
                  return (
                    <button
                      key={`${att.attemptNumber}-${att.completedAt}`}
                      type="button"
                      onClick={() => {
                        setSelectedAttemptIdx(idx);
                        setFilter("all");
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-black border transition-all flex items-center gap-2 ${
                        isActive
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                          : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-indigo-200 dark:border-slate-700 hover:border-indigo-400"
                      }`}
                    >
                      <span>{formatAttemptLabelAr(att.attemptNumber)}</span>
                      <span className="font-mono opacity-90">
                        ({att.correctAnswers}/{att.totalQuestions} • {att.accuracy}%)
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Summary KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
              <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                نسبة الدقة
              </div>
              <div className="text-xl font-black font-mono text-emerald-700 dark:text-emerald-300 mt-0.5">
                {activeAttempt.accuracy}%
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 text-center">
              <div className="text-[11px] font-bold text-brand-700 dark:text-brand-300">
                الإجابات الصحيحة
              </div>
              <div className="text-xl font-black font-mono text-brand-700 dark:text-brand-300 mt-0.5">
                {activeAttempt.correctAnswers}/{activeAttempt.totalQuestions}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center">
              <div className="text-[11px] font-bold text-rose-700 dark:text-rose-300">
                الأخطاء
              </div>
              <div className="text-xl font-black font-mono text-rose-700 dark:text-rose-300 mt-0.5">
                {wrongCount}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                بدون إجابة
              </div>
              <div className="text-xl font-black font-mono text-slate-700 dark:text-slate-200 mt-0.5">
                {unanswered}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
              <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" />
                <span>الزمن الكلي</span>
              </div>
              <div className="text-base font-black font-mono text-amber-800 dark:text-amber-300 mt-1">
                {formattedDuration}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-center">
              <div className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center justify-center gap-1">
                <Award className="w-3 h-3" />
                <span>السرعة / سؤال</span>
              </div>
              <div className="text-base font-black font-mono text-indigo-700 dark:text-indigo-300 mt-1">
                {avgSec} ث
              </div>
            </div>
          </div>

          {/* Per-Rule Group Performance Breakdown */}
          {activeAttempt.ruleBreakdown && activeAttempt.ruleBreakdown.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-600" />
                <span>تحليل أداء الطالب حسب كل قاعدة في المسابقة:</span>
              </div>
              <div className="space-y-2.5">
                {activeAttempt.ruleBreakdown.map((rb, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-black">
                      <span className="text-slate-800 dark:text-slate-100">
                        ({idx + 1}) {rb.groupLabel}
                      </span>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-emerald-600">✅ {rb.correct}</span>
                        <span className="text-rose-600">❌ {rb.wrong}</span>
                        {rb.unanswered > 0 && (
                          <span className="text-slate-400">⬜ {rb.unanswered}</span>
                        )}
                        <span className="px-2 py-0.5 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                          {rb.accuracy}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          rb.accuracy >= 85
                            ? "bg-emerald-500"
                            : rb.accuracy >= 60
                            ? "bg-amber-400"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${Math.max(4, rb.accuracy)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Question-by-Question Answer Sheet */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500" />
                <span>ورقة إجابات الطالب سؤالاً بسؤال ({details.length} سؤال):</span>
              </div>
              {details.length > 0 && (
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-black">
                  <button
                    type="button"
                    onClick={() => setFilter("all")}
                    className={`px-2.5 py-1 rounded-lg ${
                      filter === "all"
                        ? "bg-brand-600 text-white"
                        : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    الكل ({details.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter("wrong")}
                    className={`px-2.5 py-1 rounded-lg ${
                      filter === "wrong"
                        ? "bg-rose-600 text-white"
                        : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    الأخطاء ({details.filter((d) => !d.isCorrect).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter("correct")}
                    className={`px-2.5 py-1 rounded-lg ${
                      filter === "correct"
                        ? "bg-emerald-600 text-white"
                        : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    الصحيحة ({details.filter((d) => d.isCorrect).length})
                  </button>
                </div>
              )}
            </div>

            {details.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500">
                هذه النتيجة سُجّلت قبل تفعيل تفصيل الأسئلة الفردية — جميع النتائج الجديدة ستعرض كل سؤال وإجابة الطالب هنا بالتفصيل.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {filteredDetails.map((q) => (
                  <div
                    key={q.id}
                    className={`p-3 rounded-2xl border text-xs space-y-2 ${
                      q.isCorrect
                        ? "bg-emerald-50/50 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-800"
                        : "bg-rose-50/60 dark:bg-rose-950/25 border-rose-200 dark:border-rose-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-700 dark:text-slate-200">
                        سؤال #{q.id}
                      </span>
                      <span className="flex items-center gap-1 font-black">
                        {q.isCorrect ? (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            صحيح
                          </span>
                        ) : (
                          <span className="text-rose-600 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" />
                            خطأ
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="text-[10px] font-bold text-slate-500 truncate">
                      {q.groupLabel}
                    </div>

                    <div
                      dir="ltr"
                      className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700 font-mono font-bold text-center text-slate-800 dark:text-slate-100 tracking-wide"
                    >
                      {q.numbers.map((n, i) => (i === 0 ? `${n}` : n >= 0 ? ` + ${n}` : ` - ${Math.abs(n)}`)).join("")}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] font-bold">
                      <span>
                        إجابة الطالب:{" "}
                        <strong
                          className={`font-mono ${
                            q.isCorrect ? "text-emerald-700 dark:text-emerald-300" : "text-rose-600"
                          }`}
                        >
                          {q.userAnswer?.trim() ? q.userAnswer : "— (فارغ)"}
                        </strong>
                      </span>
                      <span>
                        الصحيح:{" "}
                        <strong className="font-mono text-emerald-700 dark:text-emerald-300">
                          {q.correctAnswer}
                        </strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
