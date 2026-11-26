"use client";

import React, { useState, useEffect } from "react";
import {
  Lightbulb,
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Target,
  ShieldAlert,
} from "lucide-react";
import { SudokuHint, SudokuSmartHintStep } from "@/lib/sudoku/sudoku-engine";

interface SmartHintModalProps {
  hint: SudokuHint | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (row: number, col: number, val: number) => void;
  playFx: (name: "click" | "pop" | "bubble" | "correct" | "modal_close") => void;
  onStepChange?: (step: SudokuSmartHintStep | null) => void;
}

export default function SmartHintModal({
  hint,
  isOpen,
  onClose,
  onApply,
  playFx,
  onStepChange,
}: SmartHintModalProps) {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIdx(0);
      if (hint?.steps && hint.steps.length > 0 && onStepChange) {
        onStepChange(hint.steps[0]);
      }
    } else {
      if (onStepChange) onStepChange(null);
    }
  }, [isOpen, hint, onStepChange]);

  if (!isOpen || !hint) return null;

  const steps = hint.steps || [];
  const currentStep: SudokuSmartHintStep | undefined = steps[currentStepIdx];

  const handleStepSelect = (idx: number) => {
    playFx("click");
    setCurrentStepIdx(idx);
    if (steps[idx] && onStepChange) {
      onStepChange(steps[idx]);
    }
  };

  const handleNext = () => {
    if (currentStepIdx < steps.length - 1) {
      handleStepSelect(currentStepIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      handleStepSelect(currentStepIdx - 1);
    }
  };

  const handleApply = () => {
    playFx("correct");
    onApply(hint.row, hint.col, hint.val);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="smart-hint-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="fixed inset-0"
        onClick={() => {
          playFx("modal_close");
          onClose();
        }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg clay-card !p-5 sm:!p-6 bg-gradient-to-b from-white via-[#FAF8FE] to-[#F2EDFD] dark:from-[#1E1B3E] dark:via-[#191637] dark:to-[#221C4A] border-2 border-amber-400/50 rounded-3xl shadow-2xl z-10 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#E6E1FA] dark:border-[#332D65] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shrink-0">
              <Lightbulb className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  id="smart-hint-title"
                  className="text-base sm:text-lg font-black text-[#261E58] dark:text-[#F3F0FD]"
                >
                  التلميح الذكي وشرح الحل 💡
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  {hint.techniqueAr}
                </span>
              </div>
              <p className="text-xs text-[#6A629B] dark:text-[#C5BFEE] mt-0.5">
                شرح تعليمي تفاعلي من 3 خطوات يوضح كيف تم استنتاج الجواب
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              playFx("modal_close");
              onClose();
            }}
            className="clay-pill p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Step Stepper Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#EDE8FD] dark:bg-[#25204F] border border-[#DDD6FE] dark:border-[#3D357A]">
          {steps.map((st, idx) => {
            const isActive = currentStepIdx === idx;
            const isDone = currentStepIdx > idx;

            return (
              <button
                key={st.stepNumber}
                type="button"
                onClick={() => handleStepSelect(idx)}
                className={`py-2 px-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  isActive
                    ? "bg-white dark:bg-brand-600 text-brand-700 dark:text-white shadow-sm"
                    : isDone
                    ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/30"
                    : "text-[#625992] dark:text-[#B6B0E3] hover:text-brand-600"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-200 text-[10px] flex items-center justify-center font-bold">
                  {isDone ? "✓" : st.stepNumber}
                </span>
                <span className="truncate">{st.stepNameAr}</span>
              </button>
            );
          })}
        </div>

        {/* Current Step Body Card */}
        {currentStep ? (
          <div className="clay-card-sm !p-4 bg-white dark:bg-[#201C46] space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 className="text-sm font-black text-brand-700 dark:text-brand-300 flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500" />
                <span>{currentStep.titleAr}</span>
              </h4>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-300">
                خطوة {currentStep.stepNumber} من 3
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              {currentStep.descriptionAr}
            </p>

            {/* Visual Highlight Hints Legend */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] font-bold">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                المنطقة المظللة على اللوحة
              </span>
              {currentStep.stepNumber === 2 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  <ShieldAlert className="w-3 h-3 text-rose-500" />
                  الأرقام المستبعدة
                </span>
              )}
              {currentStep.stepNumber === 3 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  الرقم المكتشف ({hint.val})
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="clay-card-sm !p-4 bg-white dark:bg-[#201C46] text-xs text-slate-600 dark:text-slate-300">
            {hint.explanationAr}
          </div>
        )}

        {/* Stepper Navigation & Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E6E1FA] dark:border-[#332D65]">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStepIdx === 0}
            className={`clay-pill py-2 px-3 text-xs font-bold flex items-center gap-1 ${
              currentStepIdx === 0
                ? "opacity-40 cursor-not-allowed text-slate-400"
                : "text-slate-700 dark:text-slate-200 hover:text-brand-600"
            }`}
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>السابق</span>
          </button>

          <div className="flex items-center gap-2">
            {currentStepIdx < steps.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="clay-btn-purple py-2 px-4 text-xs font-black flex items-center gap-1.5 !rounded-xl"
              >
                <span>الخطوة التالية</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApply}
                className="clay-btn-purple py-2 px-4 text-xs font-black flex items-center gap-1.5 !rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                <span>تطبيق الحل في اللوحة ({hint.val})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}