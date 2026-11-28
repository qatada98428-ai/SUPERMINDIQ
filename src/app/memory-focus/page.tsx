"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Brain,
  Eye,
  Volume2,
  Zap,
  Target,
  ArrowRight,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Activity,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import ClayIcon from "@/components/design-system/ClayIcon";
import {
  createSpatialLevel,
  SpatialState,
  createChimpLevel,
  ChimpState,
  generateAuditoryProblem,
  AuditoryProblem,
  generateStroopQuestion,
  StroopQuestion,
  STROOP_COLORS,
  calculateCognitiveScore,
  CognitiveProfile,
} from "@/lib/memory/memory-engine";
import { speakCustomText, stopActiveSpeech } from "@/lib/soroban-engine";
import { getSupabaseClient } from "@/lib/supabase/client";
import ModuleLockedGate from "@/components/common/ModuleLockedGate";

type MemoryTab = "spatial" | "chimp" | "auditory" | "stroop" | "reaction" | "profile";

export default function MemoryFocusPage() {
  const { language, playFx } = useApp();
  const { user } = useAuth();
  const isAr = language === "ar";

  const [activeTab, setActiveTab] = useState<MemoryTab>("spatial");

  // Track player best records
  const [spatialMaxLevel, setSpatialMaxLevel] = useState<number>(1);
  const [chimpMaxNumbers, setChimpMaxNumbers] = useState<number>(4);
  const [auditoryMaxLen, setAuditoryMaxLen] = useState<number>(3);
  const [stroopStats, setStroopStats] = useState<{ total: number; correct: number }>({ total: 0, correct: 0 });
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);

  // -------------------------------------------------------------
  // TAB 1: SPATIAL MATRIX MEMORY
  // -------------------------------------------------------------
  const [spatialState, setSpatialState] = useState<SpatialState>(() => createSpatialLevel(1));
  const [spatialStatus, setSpatialStatus] = useState<"preview" | "playing" | "success" | "fail">("preview");

  const startSpatialLevel = useCallback((lvl: number) => {
    const nextState = createSpatialLevel(lvl);
    setSpatialState(nextState);
    setSpatialStatus("preview");

    // Reveal for 1.4 seconds, then hide
    const timer = setTimeout(() => {
      setSpatialState((prev) => ({ ...prev, revealed: false }));
      setSpatialStatus("playing");
    }, 1400);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (activeTab === "spatial") {
      const cleanup = startSpatialLevel(1);
      return cleanup;
    }
  }, [activeTab, startSpatialLevel]);

  const handleSpatialClick = (idx: number) => {
    if (spatialStatus !== "playing") return;
    if (spatialState.selectedTiles.includes(idx)) return;

    const isTarget = spatialState.activeTiles.includes(idx);
    if (isTarget) {
      playFx("click");
      const nextSelected = [...spatialState.selectedTiles, idx];
      const allFound = spatialState.activeTiles.every((t) => nextSelected.includes(t));

      if (allFound) {
        playFx("correct");
        setSpatialStatus("success");
        setSpatialMaxLevel((m) => Math.max(m, spatialState.level + 1));
        setTimeout(() => {
          startSpatialLevel(spatialState.level + 1);
        }, 1200);
      } else {
        setSpatialState((prev) => ({ ...prev, selectedTiles: nextSelected }));
      }
    } else {
      playFx("wrong");
      const strikes = spatialState.strikes + 1;
      if (strikes >= spatialState.maxStrikes) {
        setSpatialStatus("fail");
      } else {
        setSpatialState((prev) => ({
          ...prev,
          strikes,
          selectedTiles: [...prev.selectedTiles, idx],
        }));
      }
    }
  };

  // -------------------------------------------------------------
  // TAB 2: CHIMP TEST (AYUMU SEQUENTIAL)
  // -------------------------------------------------------------
  const [chimpCount, setChimpCount] = useState<number>(4);
  const [chimpState, setChimpState] = useState<ChimpState>(() => createChimpLevel(4));

  const startChimpRound = useCallback((count: number) => {
    setChimpCount(count);
    setChimpState(createChimpLevel(count));
  }, []);

  const handleChimpClick = (val: number) => {
    if (chimpState.completed || chimpState.failed) return;

    if (val === chimpState.expectedVal) {
      playFx("click");
      if (val === chimpState.totalNumbers) {
        playFx("correct");
        setChimpState((prev) => ({ ...prev, completed: true }));
        setChimpMaxNumbers((m) => Math.max(m, chimpCount));
      } else {
        setChimpState((prev) => ({
          ...prev,
          hidden: true, // hide numbers immediately once first is touched
          expectedVal: prev.expectedVal + 1,
        }));
      }
    } else {
      playFx("wrong");
      setChimpState((prev) => ({ ...prev, failed: true }));
    }
  };

  // -------------------------------------------------------------
  // TAB 3: AUDITORY NUMBER SEQUENCE
  // -------------------------------------------------------------
  const [auditoryLen, setAuditoryLen] = useState<number>(3);
  const [auditoryProblem, setAuditoryProblem] = useState<AuditoryProblem | null>(null);
  const [auditoryInput, setAuditoryInput] = useState<string>("");
  const [auditorySpeaking, setAuditorySpeaking] = useState<boolean>(false);
  const [auditoryResult, setAuditoryResult] = useState<"idle" | "correct" | "wrong">("idle");
  const auditoryRunIdRef = useRef<number>(0);
  const auditoryNextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      auditoryRunIdRef.current += 1;
      if (auditoryNextTimerRef.current) clearTimeout(auditoryNextTimerRef.current);
      stopActiveSpeech();
    };
  }, []);

  const playArabicNumberAudio = useCallback((problem: AuditoryProblem) => {
    auditoryRunIdRef.current += 1;
    const runId = auditoryRunIdRef.current;
    if (auditoryNextTimerRef.current) {
      clearTimeout(auditoryNextTimerRef.current);
      auditoryNextTimerRef.current = null;
    }
    stopActiveSpeech();

    setAuditorySpeaking(true);
    setAuditoryResult("idle");
    setAuditoryInput("");

    let index = 0;

    const speakNext = () => {
      if (auditoryRunIdRef.current !== runId) return;
      if (index >= problem.spokenWords.length) {
        setAuditorySpeaking(false);
        return;
      }

      const word = problem.spokenWords[index];
      speakCustomText(word, "arabic", {
        rate: 0.9,
        force: true,
        onComplete: () => {
          if (auditoryRunIdRef.current !== runId) return;
          index++;
          auditoryNextTimerRef.current = setTimeout(speakNext, 550);
        },
      });
    };

    speakNext();
  }, []);

  const startAuditoryRound = useCallback((len: number) => {
    const prob = generateAuditoryProblem(len);
    setAuditoryProblem(prob);
    playArabicNumberAudio(prob);
  }, [playArabicNumberAudio]);

  const verifyAuditoryInput = () => {
    if (!auditoryProblem) return;
    const expected = auditoryProblem.digits.join("");
    if (auditoryInput === expected) {
      playFx("correct");
      setAuditoryResult("correct");
      setAuditoryMaxLen((m) => Math.max(m, auditoryLen));
      setTimeout(() => {
        const nextLen = auditoryLen + 1;
        setAuditoryLen(nextLen);
        startAuditoryRound(nextLen);
      }, 1500);
    } else {
      playFx("wrong");
      setAuditoryResult("wrong");
    }
  };

  // -------------------------------------------------------------
  // TAB 4: STROOP ATTENTION
  // -------------------------------------------------------------
  const [stroopQ, setStroopQ] = useState<StroopQuestion>(() => generateStroopQuestion());
  const [stroopScore, setStroopScore] = useState<number>(0);
  const [stroopStreak, setStroopStreak] = useState<number>(0);

  const handleStroopAnswer = (selectedIdx: number) => {
    const correctIdx = stroopQ.mode === "color" ? stroopQ.colorIndex : stroopQ.wordIndex;
    const isCorrect = selectedIdx === correctIdx;

    setStroopStats((prev) => ({
      total: prev.total + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
    }));

    if (isCorrect) {
      playFx("correct");
      setStroopScore((s) => s + 10 + stroopStreak * 2);
      setStroopStreak((st) => st + 1);
    } else {
      playFx("wrong");
      setStroopStreak(0);
    }

    setStroopQ(generateStroopQuestion());
  };

  // -------------------------------------------------------------
  // TAB 5: REACTION TIME TEST
  // -------------------------------------------------------------
  const [reactionPhase, setReactionPhase] = useState<"idle" | "waiting" | "ready" | "early" | "result">("idle");
  const [currentReactionMs, setCurrentReactionMs] = useState<number | null>(null);
  const readyStartTime = useRef<number>(0);
  const waitTimeout = useRef<NodeJS.Timeout | null>(null);

  const startReactionTest = () => {
    setReactionPhase("waiting");
    setCurrentReactionMs(null);

    // Random delay between 1.8s and 4.5s
    const delay = 1800 + Math.random() * 2700;
    waitTimeout.current = setTimeout(() => {
      readyStartTime.current = Date.now();
      setReactionPhase("ready");
      playFx("bubble");
    }, delay);
  };

  const handleReactionClick = () => {
    if (reactionPhase === "waiting") {
      if (waitTimeout.current) clearTimeout(waitTimeout.current);
      setReactionPhase("early");
      playFx("wrong");
    } else if (reactionPhase === "ready") {
      const elapsed = Date.now() - readyStartTime.current;
      setCurrentReactionMs(elapsed);
      setReactionTimes((prev) => [...prev, elapsed]);
      setReactionPhase("result");
      playFx("correct");
    }
  };

  // -------------------------------------------------------------
  // COGNITIVE PROFILE RADAR
  // -------------------------------------------------------------
  const avgReaction =
    reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 320;

  const stroopAcc =
    stroopStats.total > 0 ? (stroopStats.correct / stroopStats.total) * 100 : 75;

  const profile: CognitiveProfile = calculateCognitiveScore({
    spatialMaxLevel,
    chimpMaxNumbers,
    auditoryMaxLen,
    stroopAccuracy: stroopAcc,
    avgReactionMs: avgReaction,
  });

  // Sync to database
  useEffect(() => {
    if (user && (spatialMaxLevel > 1 || reactionTimes.length > 0)) {
      const supabase = getSupabaseClient();
      if (supabase) {
        void supabase.from("training_sessions").insert({
          user_id: user.id,
          session_type: "memory_focus",
          status: "completed",
          score: spatialMaxLevel * 100 + stroopScore,
          metadata: {
            profile,
            spatialMaxLevel,
            chimpMaxNumbers,
            auditoryMaxLen,
            avgReaction,
          },
        });
      }
    }
  }, [user, spatialMaxLevel, chimpMaxNumbers, auditoryMaxLen, stroopScore, avgReaction, profile, reactionTimes.length]);

  return (
    <ModuleLockedGate moduleId="memory-focus" moduleNameAr="الذاكرة والتركيز الفائق" moduleIcon="🎯">
      <div className="min-h-screen bg-[#FAF8FF] dark:bg-[#0F0D1E] text-slate-800 dark:text-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/mental-arithmetic"
              className="flex items-center gap-2 text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 bg-white dark:bg-[#1C1A3A] px-4 py-2 rounded-xl shadow-sm border border-brand-100 dark:border-brand-900/40"
            >
              <ArrowRight className={`w-4 h-4 ${isAr ? "" : "rotate-180"}`} />
              <span>{isAr ? "العودة للبرامج" : "Back to Hub"}</span>
            </Link>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <ClayIcon name="target" size="xs" />
              <span>{isAr ? "أكاديمية الذاكرة والتركيز" : "Memory & Focus Academy"}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-xs">
              <Brain className="w-4 h-4" />
              <span>{isAr ? "تطوير الدماغ والأعصاب" : "Neuro-Cognitive"}</span>
            </div>
          </div>
        </div>

        {/* Hero Title */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-700 via-indigo-600 to-violet-500 bg-clip-text text-transparent">
            {isAr ? "الذاكرة والتركيز الفائق 🎯" : "Memory & Super Focus 🎯"}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            {isAr
              ? "تمارين علمية تفاعلية مصممة خصيصاً لتقوية الذاكرة البصرية والسمعية، تسريع الاستجابة الذهنية، وزيادة التركيز الحاد للأطفال."
              : "Scientifically designed interactive cognitive games to boost visual & auditory memory, reaction speed, and hyper-focus."}
          </p>
        </div>

        {/* Main Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 bg-slate-100 dark:bg-[#16132C] p-2 rounded-2xl border border-purple-100 dark:border-purple-900/40">
          {[
            { id: "spatial", label: isAr ? "الذاكرة المكانية" : "Spatial Matrix", icon: Eye },
            { id: "chimp", label: isAr ? "تسلسل الشمبانزي" : "Chimp Test", icon: Sparkles },
            { id: "auditory", label: isAr ? "صدى الأرقام" : "Auditory Recall", icon: Volume2 },
            { id: "stroop", label: isAr ? "انتباه ستروب" : "Stroop Focus", icon: Target },
            { id: "reaction", label: isAr ? "سرعة الاستجابة" : "Reaction Time", icon: Zap },
            { id: "profile", label: isAr ? "مخطط الذكاء" : "Radar Profile", icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playFx("click");
                  setActiveTab(tab.id as MemoryTab);
                }}
                className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
                  active
                    ? "bg-white dark:bg-[#231F46] text-purple-700 dark:text-purple-300 shadow-md scale-[1.02] border border-purple-200 dark:border-purple-800"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-purple-600" : ""}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB CONTENT: 1. SPATIAL MATRIX */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "spatial" && (
          <div className="bg-white dark:bg-[#1C1A3A] p-6 sm:p-8 rounded-3xl shadow-xl border border-purple-100 dark:border-purple-900/50 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-50 dark:border-purple-900/30 pb-4">
              <div>
                <h2 className="text-xl font-bold text-purple-900 dark:text-purple-200 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-600" />
                  {isAr ? "الذاكرة البصرية المكانية" : "Visual Spatial Memory"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {spatialStatus === "preview"
                    ? isAr
                      ? "👀 احفظ مواقع المربعات المضيئة قبل أن تختفي!"
                      : "Memorize the glowing tiles before they vanish!"
                    : isAr
                    ? "🎯 اضغط على جميع المربعات التي كانت مضيئة"
                    : "Click all the tiles that were lit up"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 font-bold text-sm text-purple-700 dark:text-purple-300">
                  {isAr ? `المستوى ${spatialState.level}` : `Level ${spatialState.level}`}
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: spatialState.maxStrikes }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3.5 h-3.5 rounded-full ${
                        i < spatialState.strikes ? "bg-red-500" : "bg-purple-200 dark:bg-purple-800"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Matrix Grid */}
            <div className="flex justify-center py-6">
              <div
                className="grid gap-3.5 p-4 rounded-3xl bg-[#FAF8FF] dark:bg-[#131126] border-2 border-purple-100 dark:border-purple-900/60 shadow-inner"
                style={{
                  gridTemplateColumns: `repeat(${spatialState.gridSize}, minmax(0, 1fr))`,
                  width: `${Math.min(420, spatialState.gridSize * 76)}px`,
                  height: `${Math.min(420, spatialState.gridSize * 76)}px`,
                }}
              >
                {Array.from({ length: spatialState.gridSize * spatialState.gridSize }).map((_, idx) => {
                  const isTarget = spatialState.activeTiles.includes(idx);
                  const isSelected = spatialState.selectedTiles.includes(idx);
                  const isRevealed = spatialState.revealed && isTarget;

                  let cellBg = "bg-white dark:bg-[#231F46] border border-purple-100 dark:border-purple-800/60";
                  if (isRevealed) {
                    cellBg = "bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-lg shadow-purple-500/40 border-purple-400 animate-pulse";
                  } else if (isSelected && isTarget) {
                    cellBg = "bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-md border-emerald-300";
                  } else if (isSelected && !isTarget) {
                    cellBg = "bg-gradient-to-tr from-rose-500 to-red-400 shadow-md border-red-300";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={spatialStatus !== "playing" || isSelected}
                      onClick={() => handleSpatialClick(idx)}
                      className={`w-full h-full rounded-2xl transition-all duration-300 transform active:scale-95 flex items-center justify-center ${cellBg}`}
                    >
                      {isSelected && isTarget && <CheckCircle2 className="w-6 h-6 text-white" />}
                      {isSelected && !isTarget && <XCircle className="w-6 h-6 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status Feedback Banner */}
            {spatialStatus === "success" && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-center font-bold text-sm animate-bounce">
                {isAr ? "🌟 رائع جداً! إجابة صحيحة بالكامل.. ننتقل للمستوى التالي!" : "Awesome! Advancing to next level!"}
              </div>
            )}
            {spatialStatus === "fail" && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-center font-bold text-sm space-y-2">
                <p>{isAr ? "انتهت المحاولات! لا بأس، العقل يتطور بالتمرين." : "Attempts finished! Practice makes perfect."}</p>
                <button
                  onClick={() => startSpatialLevel(1)}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
                >
                  {isAr ? "إعادة المحاولة" : "Try Again"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB CONTENT: 2. CHIMP SEQUENTIAL MEMORY */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "chimp" && (
          <div className="bg-white dark:bg-[#1C1A3A] p-6 sm:p-8 rounded-3xl shadow-xl border border-purple-100 dark:border-purple-900/50 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-50 dark:border-purple-900/30 pb-4">
              <div>
                <h2 className="text-xl font-bold text-purple-900 dark:text-purple-200 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  {isAr ? "اختبار الشمبانزي (الذاكرة الفورية اللحظية)" : "Chimp Sequential Test"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {isAr
                    ? "اضغط الرقم (1)، وبمجرد لمسه ستختفي كل الأرقام! تذكر أماكنها واضغط (2, 3, 4...) بالترتيب."
                    : "Touch (1), all numbers will mask! Recall their positions and tap in ascending sequence."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">{isAr ? "عدد الأرقام:" : "Numbers:"}</span>
                {[4, 5, 6, 7, 8].map((n) => (
                  <button
                    key={n}
                    onClick={() => startChimpRound(n)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                      chimpCount === n
                        ? "bg-purple-600 text-white"
                        : "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Chimp Board */}
            <div className="flex justify-center py-4">
              <div className="grid grid-cols-8 gap-2.5 p-4 rounded-3xl bg-[#FAF8FF] dark:bg-[#131126] border-2 border-purple-100 dark:border-purple-900/60 shadow-inner w-full max-w-2xl h-80">
                {Array.from({ length: 40 }).map((_, idx) => {
                  const tile = chimpState.tiles.find((t) => t.index === idx);
                  if (!tile) {
                    return <div key={idx} className="w-full h-full rounded-xl opacity-0" />;
                  }

                  const isAlreadyClicked = tile.val < chimpState.expectedVal;
                  if (isAlreadyClicked) {
                    return <div key={idx} className="w-full h-full rounded-xl opacity-0" />;
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleChimpClick(tile.val)}
                      className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-500 to-purple-700 text-white font-black text-lg sm:text-xl shadow-md border-2 border-indigo-300 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                    >
                      {chimpState.hidden ? "" : tile.val}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results */}
            {chimpState.completed && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-center font-bold text-sm space-y-2">
                <p>{isAr ? `🎉 عبقري! أتممت تسلسل ${chimpCount} أرقام بدقة خارقة!` : `Brilliant! Completed ${chimpCount} numbers!`}</p>
                <button
                  onClick={() => startChimpRound(Math.min(8, chimpCount + 1))}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
                >
                  {isAr ? "التالي (تحدي أصعب)" : "Next Challenge"}
                </button>
              </div>
            )}
            {chimpState.failed && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-center font-bold text-sm space-y-2">
                <p>{isAr ? "أخطأت في الترتيب! لا بأس، أعد المحاولة وركز جيداً." : "Order missed! Try again."}</p>
                <button
                  onClick={() => startChimpRound(chimpCount)}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
                >
                  {isAr ? "إعادة المحاولة" : "Try Again"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB CONTENT: 3. AUDITORY NUMBER RECALL */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "auditory" && (
          <div className="bg-white dark:bg-[#1C1A3A] p-6 sm:p-8 rounded-3xl shadow-xl border border-purple-100 dark:border-purple-900/50 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-50 dark:border-purple-900/30 pb-4">
              <div>
                <h2 className="text-xl font-bold text-purple-900 dark:text-purple-200 flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-purple-600" />
                  {isAr ? "الذاكرة السمعية (صدى الأرقام)" : "Auditory Recall"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {isAr
                    ? "استمع بتركيز للأرقام المنطوقة، ثم اكتبها بنفس الترتيب الذي سمعته."
                    : "Listen closely to spoken numbers, then enter the sequence in order."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => startAuditoryRound(auditoryLen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isAr ? "ابدأ الاستماع" : "Start Listening"}</span>
                </button>
              </div>
            </div>

            {/* Listening Speaker Animation */}
            <div className="text-center py-6 space-y-4">
              <div
                className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center transition-all ${
                  auditorySpeaking
                    ? "bg-purple-600 text-white shadow-xl shadow-purple-500/50 animate-ping"
                    : "bg-purple-100 dark:bg-purple-900/40 text-purple-600"
                }`}
              >
                <Volume2 className="w-12 h-12" />
              </div>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                {auditorySpeaking
                  ? isAr
                    ? "🎧 جاري نطق الأرقام... استمع جيداً!"
                    : "Listening... keep your focus!"
                  : isAr
                  ? "أدخل الأرقام التي سمعتها:"
                  : "Type the digits you heard:"}
              </p>

              {/* Input Display */}
              <div className="flex justify-center gap-2 text-2xl font-black text-purple-700 dark:text-purple-300 tracking-widest bg-slate-50 dark:bg-[#141228] max-w-xs mx-auto py-3 px-6 rounded-2xl border border-purple-200 dark:border-purple-800">
                {auditoryInput || "— — —"}
              </div>

              {/* On-screen Keypad */}
              <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d) => (
                  <button
                    key={d}
                    disabled={auditorySpeaking}
                    onClick={() => {
                      playFx("click");
                      setAuditoryInput((prev) => prev + d);
                    }}
                    className={`py-3.5 rounded-xl bg-white dark:bg-[#231F46] font-bold text-lg text-slate-700 dark:text-slate-200 shadow-sm border border-slate-200 dark:border-slate-700 hover:border-purple-500 active:scale-95 ${
                      d === 0 ? "col-start-2" : ""
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div className="flex justify-center gap-3 max-w-xs mx-auto pt-2">
                <button
                  onClick={() => setAuditoryInput("")}
                  className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 font-bold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-300"
                >
                  {isAr ? "مسح" : "Clear"}
                </button>
                <button
                  onClick={verifyAuditoryInput}
                  disabled={!auditoryInput}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 font-bold text-xs text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  {isAr ? "تحقق" : "Submit"}
                </button>
              </div>

              {auditoryResult === "correct" && (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-center font-bold text-sm">
                  {isAr ? "✅ أحسنت! ذاكرتك السمعية دقيقة جداً." : "Spot on! Advancing length."}
                </div>
              )}
              {auditoryResult === "wrong" && (
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-center font-bold text-sm">
                  {isAr ? `❌ لم تكن صحيحة. الإجابة كانت: ${auditoryProblem?.digits.join("")}` : "Incorrect."}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB CONTENT: 4. STROOP ATTENTION TEST */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "stroop" && (
          <div className="bg-white dark:bg-[#1C1A3A] p-6 sm:p-8 rounded-3xl shadow-xl border border-purple-100 dark:border-purple-900/50 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-50 dark:border-purple-900/30 pb-4">
              <div>
                <h2 className="text-xl font-bold text-purple-900 dark:text-purple-200 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  {isAr ? "اختبار ستروب للانتباه والتركيز الحاد" : "Stroop Attention & Inhibition"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {stroopQ.mode === "color"
                    ? isAr
                      ? "🎨 انتبه! اختر لون الخط متجاهلاً معنى الكلمة المكتوبة"
                      : "Choose the INK COLOR, ignore the word meaning!"
                    : isAr
                    ? "📝 اختر الكلمة المكتوبة متجاهلاً لون الخط"
                    : "Choose the WRITTEN WORD, ignore ink color!"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 font-bold text-xs text-purple-700 dark:text-purple-300">
                  {isAr ? `النقاط: ${stroopScore}` : `Score: ${stroopScore}`}
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-900/30 font-bold text-xs text-amber-700 dark:text-amber-300">
                  {isAr ? `التتابع: ${stroopStreak} 🔥` : `Streak: ${stroopStreak} 🔥`}
                </div>
              </div>
            </div>

            {/* Stimulus Word Card */}
            <div className="py-12 text-center bg-[#FAF8FF] dark:bg-[#131126] rounded-3xl border-2 border-purple-100 dark:border-purple-900/60 shadow-inner space-y-4">
              <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                {stroopQ.mode === "color"
                  ? isAr
                    ? "🎨 المطلوب: لون الخط"
                    : "Target: Font Color"
                  : isAr
                  ? "📝 المطلوب: الكلمة المكتوبة"
                  : "Target: Written Word"}
              </div>
              <div
                className="text-5xl sm:text-7xl font-black tracking-wide select-none drop-shadow-md transition-transform"
                style={{ color: STROOP_COLORS[stroopQ.colorIndex].css }}
              >
                {STROOP_COLORS[stroopQ.wordIndex].nameAr}
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stroopQ.options.map((optIdx) => {
                const optColor = STROOP_COLORS[optIdx];
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleStroopAnswer(optIdx)}
                    className="py-4 px-4 rounded-2xl bg-white dark:bg-[#231F46] border-2 border-purple-100 dark:border-purple-800/80 font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100 hover:border-purple-500 hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <span
                      className="w-4 h-4 rounded-full inline-block"
                      style={{ backgroundColor: optColor.css }}
                    />
                    <span>{optColor.nameAr}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB CONTENT: 5. REACTION TIME TEST */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "reaction" && (
          <div className="bg-white dark:bg-[#1C1A3A] p-6 sm:p-8 rounded-3xl shadow-xl border border-purple-100 dark:border-purple-900/50 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-50 dark:border-purple-900/30 pb-4">
              <div>
                <h2 className="text-xl font-bold text-purple-900 dark:text-purple-200 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  {isAr ? "اختبار سرعة الاستجابة ورد الفعل" : "Reaction Speed Test"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {isAr
                    ? "عندما تتحول الدائرة للون الأخضر، اضغط بأسرع ما يمكنك!"
                    : "When the circle turns green, click as fast as humanly possible!"}
                </p>
              </div>
              {reactionTimes.length > 0 && (
                <div className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 font-bold text-xs text-purple-700 dark:text-purple-300">
                  {isAr ? `المتوسط: ${avgReaction} مللي ثانية` : `Avg: ${avgReaction} ms`}
                </div>
              )}
            </div>

            {/* Reaction Trigger Zone */}
            <div className="flex justify-center py-6">
              {reactionPhase === "idle" && (
                <button
                  onClick={startReactionTest}
                  className="w-64 h-64 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold text-lg shadow-2xl flex flex-col items-center justify-center gap-3 hover:scale-105 transition-all"
                >
                  <Play className="w-12 h-12" />
                  <span>{isAr ? "اضغط لبدء الاختبار" : "Click to Start"}</span>
                </button>
              )}

              {reactionPhase === "waiting" && (
                <div
                  onClick={handleReactionClick}
                  className="w-64 h-64 rounded-full bg-rose-600 text-white font-bold text-xl shadow-2xl flex flex-col items-center justify-center gap-3 cursor-pointer animate-pulse"
                >
                  <div className="w-8 h-8 rounded-full bg-white/30" />
                  <span>{isAr ? "استعد... (أحمر)" : "Wait for Green..."}</span>
                </div>
              )}

              {reactionPhase === "ready" && (
                <div
                  onClick={handleReactionClick}
                  className="w-64 h-64 rounded-full bg-emerald-500 text-white font-black text-2xl shadow-2xl shadow-emerald-500/50 flex flex-col items-center justify-center gap-3 cursor-pointer scale-110 transition-all"
                >
                  <Zap className="w-12 h-12 animate-bounce" />
                  <span>{isAr ? "اضغط الآن!" : "CLICK NOW!"}</span>
                </div>
              )}

              {reactionPhase === "early" && (
                <div className="w-64 h-64 rounded-full bg-amber-500 text-white font-bold text-center flex flex-col items-center justify-center gap-3 p-4">
                  <p className="text-lg">{isAr ? "تسرعت! ضغطت قبل الضوء الأخضر" : "Too Early!"}</p>
                  <button
                    onClick={startReactionTest}
                    className="px-4 py-2 rounded-xl bg-white text-amber-700 font-bold text-xs"
                  >
                    {isAr ? "إعادة" : "Retry"}
                  </button>
                </div>
              )}

              {reactionPhase === "result" && (
                <div className="w-64 h-64 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-700 text-white font-bold text-center flex flex-col items-center justify-center gap-3 p-4 shadow-xl">
                  <div className="text-3xl font-black">{currentReactionMs} ms</div>
                  <p className="text-xs text-purple-200">
                    {currentReactionMs && currentReactionMs < 250
                      ? isAr
                        ? "⚡ استجابة خاطفة استثنائية!"
                        : "⚡ Lightning fast!"
                      : isAr
                      ? "جيد جداً، حاول تحسين رقمك"
                      : "Good job!"}
                  </p>
                  <button
                    onClick={startReactionTest}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-purple-700 font-bold text-xs hover:bg-purple-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isAr ? "جولة أخرى" : "Try Again"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB CONTENT: 6. COGNITIVE RADAR PROFILE */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "profile" && (
          <div className="bg-white dark:bg-[#1C1A3A] p-6 sm:p-8 rounded-3xl shadow-xl border border-purple-100 dark:border-purple-900/50 space-y-6">
            <div className="border-b border-purple-50 dark:border-purple-900/30 pb-4">
              <h2 className="text-xl font-bold text-purple-900 dark:text-purple-200 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                {isAr ? "مخطط البصمة المعرفية والذكاء الشامل" : "Cognitive Radar Profile"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {isAr
                  ? "تحليل دقيق لأداء الطفل عبر القدرات العقلية الخمس الأساسية بناءً على نتائجه في التمارين."
                  : "Accurate evaluation of the child's performance across 5 key cognitive pillars."}
              </p>
            </div>

            {/* Radar Diagram Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* SVG Radar Polygon */}
              <div className="flex justify-center">
                <svg viewBox="0 0 320 320" className="w-72 h-72 sm:w-80 sm:h-80">
                  {/* Background concentric pentagons */}
                  {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, i) => {
                    const r = 120 * scale;
                    const points = [0, 1, 2, 3, 4]
                      .map((idx) => {
                        const angle = (idx * 2 * Math.PI) / 5 - Math.PI / 2;
                        const x = 160 + r * Math.cos(angle);
                        const y = 160 + r * Math.sin(angle);
                        return `${x},${y}`;
                      })
                      .join(" ");
                    return (
                      <polygon
                        key={i}
                        points={points}
                        fill="none"
                        stroke="currentColor"
                        className="text-purple-100 dark:text-purple-900/60"
                        strokeWidth="1.5"
                      />
                    );
                  })}

                  {/* Axes */}
                  {[0, 1, 2, 3, 4].map((idx) => {
                    const angle = (idx * 2 * Math.PI) / 5 - Math.PI / 2;
                    const x = 160 + 120 * Math.cos(angle);
                    const y = 160 + 120 * Math.sin(angle);
                    return (
                      <line
                        key={idx}
                        x1="160"
                        y1="160"
                        x2={x}
                        y2={y}
                        stroke="currentColor"
                        className="text-purple-200 dark:text-purple-800/80"
                        strokeDasharray="3 3"
                      />
                    );
                  })}

                  {/* Player Polygon */}
                  {(() => {
                    const metrics = [
                      profile.visualMemory,
                      profile.workingMemory,
                      profile.auditoryMemory,
                      profile.selectiveAttention,
                      profile.reactionSpeed,
                    ];
                    const pts = metrics
                      .map((val, idx) => {
                        const r = (120 * Math.max(15, val)) / 100;
                        const angle = (idx * 2 * Math.PI) / 5 - Math.PI / 2;
                        const x = 160 + r * Math.cos(angle);
                        const y = 160 + r * Math.sin(angle);
                        return `${x},${y}`;
                      })
                      .join(" ");

                    return (
                      <>
                        <polygon
                          points={pts}
                          fill="rgba(139, 92, 246, 0.4)"
                          stroke="#8B5CF6"
                          strokeWidth="2.5"
                        />
                        {metrics.map((val, idx) => {
                          const r = (120 * Math.max(15, val)) / 100;
                          const angle = (idx * 2 * Math.PI) / 5 - Math.PI / 2;
                          const x = 160 + r * Math.cos(angle);
                          const y = 160 + r * Math.sin(angle);
                          return (
                            <circle
                              key={idx}
                              cx={x}
                              cy={y}
                              r="5"
                              fill="#6344F5"
                              stroke="#FFF"
                              strokeWidth="2"
                            />
                          );
                        })}
                      </>
                    );
                  })()}
                </svg>
              </div>

              {/* Metric Breakdown Bars */}
              <div className="space-y-4">
                {[
                  { label: isAr ? "الذاكرة البصرية المكانية" : "Visual Memory", val: profile.visualMemory, color: "bg-purple-600" },
                  { label: isAr ? "الذاكرة العاملة اللحظية" : "Working Memory", val: profile.workingMemory, color: "bg-indigo-600" },
                  { label: isAr ? "الذاكرة السمعية وصدى الأرقام" : "Auditory Memory", val: profile.auditoryMemory, color: "bg-violet-600" },
                  { label: isAr ? "الانتباه الانتقائي والتركيز" : "Selective Focus", val: profile.selectiveAttention, color: "bg-amber-500" },
                  { label: isAr ? "سرعة الاستجابة الحركية" : "Reaction Speed", val: profile.reactionSpeed, color: "bg-emerald-500" },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>{item.label}</span>
                      <span className="text-purple-600 dark:text-purple-400">{item.val}%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                        style={{ width: `${item.val}%` }}
                      />
                    </div>
                  </div>
                ))}

                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center gap-3 mt-6">
                  <Trophy className="w-8 h-8 text-amber-500 shrink-0" />
                  <div>
                    <div className="text-xs text-slate-500">
                      {isAr ? "مستوى التطور الإجمالي" : "Overall Neuro-IQ Score"}
                    </div>
                    <div className="text-lg font-black text-purple-900 dark:text-purple-200">
                      {Math.round(
                        (profile.visualMemory +
                          profile.workingMemory +
                          profile.auditoryMemory +
                          profile.selectiveAttention +
                          profile.reactionSpeed) /
                          5
                      )}{" "}
                      / 100
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </ModuleLockedGate>
  );
}
