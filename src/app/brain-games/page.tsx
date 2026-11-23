"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  RotateCcw,
  Sparkles,
  Trophy,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
  HelpCircle,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import {
  createHanoiGame,
  moveHanoiDisc,
  HanoiState,
  RAVEN_PROBLEMS,
  BALANCE_PROBLEMS,
} from "@/lib/brain-games/brain-games-engine";
import { getSupabaseClient } from "@/lib/supabase/client";
import ModuleLockedGate from "@/components/common/ModuleLockedGate";

type BrainGameTab = "hanoi" | "raven" | "balance";

export default function BrainGamesPage() {
  const { playFx } = useApp();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<BrainGameTab>("hanoi");

  // 1. Tower of Hanoi State
  const [hanoiDiscsCount, setHanoiDiscsCount] = useState<number>(3);
  const [hanoi, setHanoi] = useState<HanoiState>(() => createHanoiGame(3));
  const [selectedPeg, setSelectedPeg] = useState<number | null>(null);
  const [hanoiMessage, setHanoiMessage] = useState<string | null>(null);

  // 2. Raven Matrices State
  const [ravenIdx, setRavenIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [ravenFeedback, setRavenFeedback] = useState<string | null>(null);

  // 3. Weight Balance State
  const [balanceIdx, setBalanceIdx] = useState<number>(0);
  const [selectedBalanceOpt, setSelectedBalanceOpt] = useState<number | null>(null);
  const [balanceFeedback, setBalanceFeedback] = useState<string | null>(null);

  const activeRaven = RAVEN_PROBLEMS[ravenIdx];
  const activeBalance = BALANCE_PROBLEMS[balanceIdx];

  // Hanoi Click Handler
  const handlePegClick = (pegIdx: number) => {
    if (hanoi.isSolved) return;

    if (selectedPeg === null) {
      if (hanoi.pegs[pegIdx].length > 0) {
        setSelectedPeg(pegIdx);
        playFx("pop");
      }
    } else {
      if (selectedPeg === pegIdx) {
        setSelectedPeg(null);
      } else {
        const { state: nextState, valid } = moveHanoiDisc(hanoi, selectedPeg, pegIdx);
        if (valid) {
          setHanoi(nextState);
          playFx("click");
          if (nextState.isSolved) {
            setHanoiMessage(`ألف مبروك! حللت البرج في ${nextState.movesCount} نقلة! 🎉 (الحد الأدنى: ${nextState.minMoves})`);
            playFx("fanfare");
            saveBrainSession("hanoi", nextState.movesCount <= nextState.minMoves + 2 ? 100 : 70);
          } else {
            setHanoiMessage(null);
          }
        } else {
          setHanoiMessage("حركة غير قانونية: لا يمكن وضع قرص كبير فوق قرص أصغر منه! ⚠️");
          playFx("modal_close");
        }
        setSelectedPeg(null);
      }
    }
  };

  const handleResetHanoi = (discs: number = hanoiDiscsCount) => {
    setHanoi(createHanoiGame(discs));
    setSelectedPeg(null);
    setHanoiMessage(null);
    playFx("toggle");
  };

  // Raven Click Handler
  const handleRavenOptionClick = (optIdx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optIdx);

    if (optIdx === activeRaven.correctOptionIndex) {
      setRavenFeedback("إجابة عبقرية وصحيحة 100%! 🌟");
      playFx("celebrate");
      saveBrainSession("raven", 100);
    } else {
      setRavenFeedback("إجابة غير صحيحة، طالع القاعدة التوضيحية بالأسفل!");
      playFx("modal_close");
    }
  };

  // Balance Click Handler
  const handleBalanceOptionClick = (optIdx: number) => {
    if (selectedBalanceOpt !== null) return;
    setSelectedBalanceOpt(optIdx);

    if (optIdx === activeBalance.correctIndex) {
      setBalanceFeedback("استنتاج منطقي باهر! إجابة صحيحة 100%! ⚖️");
      playFx("celebrate");
      saveBrainSession("balance", 100);
    } else {
      setBalanceFeedback("استنتاج غير دقيق، راجع المعادلتين بالأعلى!");
      playFx("modal_close");
    }
  };

  const saveBrainSession = async (gameType: string, score: number) => {
    if (!user) return;
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from("training_sessions").insert({
          user_id: user.id,
          session_type: "brain_games",
          level: gameType,
          total_questions: 1,
          correct_answers: 1,
          wrong_answers: 0,
          accuracy_rate: score,
          duration_seconds: 45,
          score,
          metadata: { subGame: gameType },
        });
      }
    } catch (err) {
      console.warn("Could not sync brain game session:", err);
    }
  };

  const DISC_COLORS = [
    "#EF4444", // 1 (Red)
    "#F97316", // 2 (Orange)
    "#FBBF24", // 3 (Yellow)
    "#10B981", // 4 (Green)
    "#3B82F6", // 5 (Blue)
    "#8B5CF6", // 6 (Purple)
    "#EC4899", // 7 (Pink)
  ];

  return (
    <ModuleLockedGate moduleId="brain-games" moduleNameAr="ألعاب العقل والمنطق" moduleIcon="🧠">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8" dir="rtl">
      {/* Top Banner */}
      <div className="clay-banner-lavender relative overflow-hidden p-5 sm:p-7 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center md:text-start">
          <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-3xl shrink-0 shadow-sm">
            🧩
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                مختبر ألعاب العقل والتفكير المنطقي
              </h1>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                ذكاء واستنتاج 💡
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/90 font-medium mt-1 leading-relaxed">
              تمارين وألغاز منطقية تفاعلية لتنمية التفكير التحليلي، برج هانوي، مصفوفات الأنماط، وموازين الاستنتاج.
            </p>
          </div>
        </div>

        <Link
          href="/mental-arithmetic"
          onClick={() => playFx("pop")}
          className="clay-pill px-4 py-2 text-xs font-black text-slate-950 bg-white hover:bg-amber-100 flex items-center gap-1.5 shrink-0 shadow-md transition-all active:scale-95"
        >
          <ArrowRight className="w-4 h-4 text-brand-600" />
          <span>العودة للبرامج</span>
        </Link>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => {
            setActiveTab("hanoi");
            playFx("toggle");
          }}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 active:scale-95 ${
            activeTab === "hanoi"
              ? "clay-btn-purple !rounded-2xl shadow-lg"
              : "clay-pill text-slate-700 dark:text-slate-200"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>برج هانوي الرياضي (Tower of Hanoi)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("raven");
            playFx("toggle");
          }}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 active:scale-95 ${
            activeTab === "raven"
              ? "clay-btn-purple !rounded-2xl shadow-lg"
              : "clay-pill text-slate-700 dark:text-slate-200"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>مصفوفات ريفن للأنماط (Raven Matrices)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("balance");
            playFx("toggle");
          }}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 active:scale-95 ${
            activeTab === "balance"
              ? "clay-btn-purple !rounded-2xl shadow-lg"
              : "clay-pill text-slate-700 dark:text-slate-200"
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>ميزان الكتل والاستنتاج (Weight Balance)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. TOWER OF HANOI GAME                                                    */}
      {/* ========================================================================= */}
      {activeTab === "hanoi" && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="clay-card !p-6 bg-white dark:bg-[#1C183D] rounded-3xl space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-start">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  انقل الأقراص من العمود الأول (A) إلى العمود الأخير (C)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  القاعدة الذهبية: لا يجوز نهائياً وضع قرص أكبر فوق قرص أصغر منه!
                </p>
              </div>

              {/* Discs Count Selector */}
              <div className="flex items-center gap-1.5 bg-[#F6F4FE] dark:bg-[#14122B] p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
                {[3, 4, 5].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => {
                      setHanoiDiscsCount(cnt);
                      handleResetHanoi(cnt);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      hanoiDiscsCount === cnt
                        ? "clay-btn-purple text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {cnt} أقراص
                  </button>
                ))}
              </div>
            </div>

            {/* Score & Moves Header */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F6F4FE] dark:bg-[#14122B] border border-brand-200/60 text-xs font-bold text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-3">
                <span>الحركات المنجزة: <strong className="text-brand-600 font-mono text-sm">{hanoi.movesCount}</strong></span>
                <span>أقل عدد حركات ممكن: <strong className="text-amber-500 font-mono text-sm">{hanoi.minMoves}</strong></span>
              </div>

              <button
                type="button"
                onClick={() => handleResetHanoi()}
                className="clay-pill px-3 py-1 text-xs font-black flex items-center gap-1 text-brand-700 dark:text-brand-300"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة المحاولة</span>
              </button>
            </div>

            {/* Visual Hanoi Arena */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 pb-2 min-h-[220px] sm:min-h-[260px] items-end justify-center select-none">
              {[0, 1, 2].map((pegIdx) => {
                const isSelected = selectedPeg === pegIdx;
                const pegDiscs = hanoi.pegs[pegIdx];
                const pegLetters = ["A (البداية)", "B (المساعد)", "C (الهدف)"];

                return (
                  <div
                    key={pegIdx}
                    onClick={() => handlePegClick(pegIdx)}
                    className={`relative flex flex-col items-center justify-end h-48 sm:h-56 p-2 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? "bg-brand-50/80 dark:bg-brand-950/40 ring-2 ring-brand-500"
                        : "hover:bg-slate-50 dark:hover:bg-slate-900/40"
                    }`}
                  >
                    {/* Vertical Peg Rod */}
                    <div className="absolute bottom-2 w-3 sm:w-3.5 h-40 sm:h-48 rounded-t-full bg-slate-300 dark:bg-slate-700 shadow-inner" />

                    {/* Stack of Discs on this peg */}
                    <div className="relative z-10 flex flex-col-reverse items-center gap-1.5 w-full mb-1">
                      {pegDiscs.map((discSize) => {
                        const widthPct = 25 + (discSize / hanoi.numDiscs) * 70;
                        const color = DISC_COLORS[discSize - 1] || "#6366F1";

                        return (
                          <div
                            key={discSize}
                            className="h-6 sm:h-7 rounded-xl shadow-md border border-white/60 flex items-center justify-center text-[10px] sm:text-xs font-black text-white transition-all duration-200"
                            style={{
                              width: `${widthPct}%`,
                              backgroundColor: color,
                            }}
                          >
                            {discSize}
                          </div>
                        );
                      })}
                    </div>

                    {/* Peg Base Platform */}
                    <div className="relative z-10 w-full h-3 rounded-full bg-slate-400 dark:bg-slate-600 shadow" />
                    <span className="text-[11px] font-black text-slate-500 mt-2">
                      {pegLetters[pegIdx]}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Message Alert */}
            {hanoiMessage && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-black text-center animate-in fade-in ${
                  hanoi.isSolved
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200"
                    : "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200"
                }`}
              >
                {hanoiMessage}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. RAVEN LOGIC MATRICES                                                   */}
      {/* ========================================================================= */}
      {activeTab === "raven" && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="clay-card !p-6 bg-white dark:bg-[#1C183D] rounded-3xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300">
                  لغز الأنماط #{ravenIdx + 1} من {RAVEN_PROBLEMS.length}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-2">
                  {activeRaven.titleAr}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={ravenIdx === 0}
                  onClick={() => {
                    setRavenIdx((prev) => prev - 1);
                    setSelectedOption(null);
                    setRavenFeedback(null);
                  }}
                  className="clay-pill p-2 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={ravenIdx === RAVEN_PROBLEMS.length - 1}
                  onClick={() => {
                    setRavenIdx((prev) => prev + 1);
                    setSelectedOption(null);
                    setRavenFeedback(null);
                  }}
                  className="clay-pill p-2 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 3x3 Problem Matrix */}
            <div className="grid grid-cols-3 grid-rows-3 gap-2.5 max-w-sm mx-auto p-4 rounded-3xl bg-[#F6F4FE] dark:bg-[#14122B] border-2 border-brand-200/80 dark:border-brand-800/80 shadow-inner select-none">
              {activeRaven.matrix.map((row, rIdx) =>
                row.map((cell, cIdx) => (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className="aspect-square rounded-2xl bg-white dark:bg-[#231F4A] border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center p-2"
                  >
                    {cell ? (
                      <div
                        className="flex items-center justify-center gap-1 flex-wrap"
                        style={{ transform: `rotate(${cell.rotationDeg}deg)` }}
                      >
                        {Array(cell.count)
                          .fill(0)
                          .map((_, i) => (
                            <span
                              key={i}
                              className="text-2xl sm:text-3xl font-black drop-shadow"
                              style={{ color: cell.color }}
                            >
                              {cell.shape === "circle" ? "●" : cell.shape === "square" ? "■" : cell.shape === "star" ? "★" : cell.shape === "diamond" ? "◆" : "▲"}
                            </span>
                          ))}
                      </div>
                    ) : (
                      <span className="text-2xl font-black text-brand-600 animate-pulse">?</span>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                اختر الشكل المناسب لإكمال علامة الاستفهام (?):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {activeRaven.options.map((opt, oIdx) => {
                  const isPicked = selectedOption === oIdx;
                  const isCorrect = oIdx === activeRaven.correctOptionIndex;

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={selectedOption !== null}
                      onClick={() => handleRavenOptionClick(oIdx)}
                      className={`aspect-square rounded-2xl border-2 flex items-center justify-center p-3 transition-all active:scale-95 shadow-sm ${
                        isPicked
                          ? isCorrect
                            ? "bg-emerald-100 border-emerald-500 dark:bg-emerald-950"
                            : "bg-rose-100 border-rose-500 dark:bg-rose-950"
                          : "bg-white dark:bg-[#1E1B3E] hover:border-brand-500 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <div
                        className="flex items-center justify-center gap-1 flex-wrap"
                        style={{ transform: `rotate(${opt.rotationDeg}deg)` }}
                      >
                        {Array(opt.count)
                          .fill(0)
                          .map((_, i) => (
                            <span
                              key={i}
                              className="text-2xl sm:text-3xl font-black"
                              style={{ color: opt.color }}
                            >
                              {opt.shape === "circle" ? "●" : opt.shape === "square" ? "■" : opt.shape === "star" ? "★" : opt.shape === "diamond" ? "◆" : "▲"}
                            </span>
                          ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Explanation card after answering */}
            {selectedOption !== null && (
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-900 dark:text-indigo-200 space-y-1.5 animate-in fade-in">
                <div className="font-black text-sm flex items-center gap-1 text-indigo-800 dark:text-indigo-300">
                  <HelpCircle className="w-4 h-4" />
                  <span>توضيح القاعدة المنطقية:</span>
                </div>
                <p className="leading-relaxed">{activeRaven.ruleExplanationAr}</p>
                {ravenFeedback && <div className="font-black text-sm text-brand-600 mt-1">{ravenFeedback}</div>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. WEIGHT BALANCE LOGIC                                                   */}
      {/* ========================================================================= */}
      {activeTab === "balance" && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="clay-card !p-6 bg-white dark:bg-[#1C183D] rounded-3xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-400 text-slate-950">
                  لغز الميزان #{balanceIdx + 1}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-2">
                  {activeBalance.titleAr}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={balanceIdx === 0}
                  onClick={() => {
                    setBalanceIdx((prev) => prev - 1);
                    setSelectedBalanceOpt(null);
                    setBalanceFeedback(null);
                  }}
                  className="clay-pill p-2 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={balanceIdx === BALANCE_PROBLEMS.length - 1}
                  onClick={() => {
                    setBalanceIdx((prev) => prev + 1);
                    setSelectedBalanceOpt(null);
                    setBalanceFeedback(null);
                  }}
                  className="clay-pill p-2 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2 Balances Visual Representation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Scale 1 */}
              <div className="p-4 rounded-2xl bg-[#F6F4FE] dark:bg-[#14122B] border border-brand-200/60 text-center space-y-2">
                <span className="text-xs font-black text-slate-500">الميزان الأول:</span>
                <div className="flex items-center justify-center gap-3 text-2xl font-black">
                  <div className="p-2 rounded-xl bg-white dark:bg-[#231F4A] shadow-sm">
                    {activeBalance.premise1.left.join(" ")}
                  </div>
                  <span className="text-brand-600 font-black">=</span>
                  <div className="p-2 rounded-xl bg-white dark:bg-[#231F4A] shadow-sm">
                    {activeBalance.premise1.right.join(" ")}
                  </div>
                </div>
              </div>

              {/* Scale 2 */}
              <div className="p-4 rounded-2xl bg-[#F6F4FE] dark:bg-[#14122B] border border-brand-200/60 text-center space-y-2">
                <span className="text-xs font-black text-slate-500">الميزان الثاني:</span>
                <div className="flex items-center justify-center gap-3 text-2xl font-black">
                  <div className="p-2 rounded-xl bg-white dark:bg-[#231F4A] shadow-sm">
                    {activeBalance.premise2.left.join(" ")}
                  </div>
                  <span className="text-brand-600 font-black">=</span>
                  <div className="p-2 rounded-xl bg-white dark:bg-[#231F4A] shadow-sm">
                    {activeBalance.premise2.right.join(" ")}
                  </div>
                </div>
              </div>
            </div>

            {/* The Question Scale */}
            <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 text-center space-y-3">
              <span className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-widest">
                المطلوب استنتاجه:
              </span>
              <div className="flex items-center justify-center gap-4 text-3xl font-black">
                <div className="p-3 rounded-2xl bg-white dark:bg-[#1E1B3E] shadow-md">
                  {activeBalance.questionTarget.join(" ")}
                </div>
                <span className="text-amber-600 font-black">=</span>
                <span className="p-3 rounded-2xl bg-white dark:bg-[#1E1B3E] text-brand-600 shadow-md font-mono">
                  ?
                </span>
              </div>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {activeBalance.options.map((opt, oIdx) => {
                const isPicked = selectedBalanceOpt === oIdx;
                const isCorrect = oIdx === activeBalance.correctIndex;

                return (
                  <button
                    key={oIdx}
                    type="button"
                    disabled={selectedBalanceOpt !== null}
                    onClick={() => handleBalanceOptionClick(oIdx)}
                    className={`p-4 rounded-2xl text-center font-black text-lg sm:text-xl border-2 transition-all active:scale-95 shadow-sm ${
                      isPicked
                        ? isCorrect
                          ? "bg-emerald-100 border-emerald-500 dark:bg-emerald-950"
                          : "bg-rose-100 border-rose-500 dark:bg-rose-950"
                        : "bg-white dark:bg-[#1E1B3E] hover:border-brand-500 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <span>{opt.count} </span>
                    <span>{opt.symbol}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback & Explanation */}
            {selectedBalanceOpt !== null && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 font-semibold space-y-1 animate-in fade-in">
                <div className="font-black text-sm flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>خطوات الاستنتاج الرياضي:</span>
                </div>
                <p className="leading-relaxed">{activeBalance.explanationAr}</p>
                {balanceFeedback && <div className="font-black text-sm mt-1">{balanceFeedback}</div>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </ModuleLockedGate>
  );
}
