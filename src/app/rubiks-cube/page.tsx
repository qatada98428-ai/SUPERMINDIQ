"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Timer,
  Zap,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Play,
  RotateCw,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import RubiksCube3D from "@/components/rubiks/RubiksCube3D";
import {
  CubeState,
  createSolvedCube,
  applyMove,
  generateWcaScramble,
  LBL_STAGES,
  CFOP_LIBRARY,
  MoveNotation,
} from "@/lib/rubiks/rubiks-engine";
import { getSupabaseClient } from "@/lib/supabase/client";
import ModuleLockedGate from "@/components/common/ModuleLockedGate";

type RubiksTab = "academy" | "timer" | "algorithms" | "sandbox";

interface SolveRecord {
  id: string;
  timeMs: number;
  scramble: string;
  date: string;
}

export default function RubiksCubePage() {
  const { playFx } = useApp();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<RubiksTab>("academy");

  // Cube State
  const [cube, setCube] = useState<CubeState>(createSolvedCube());
  const [activeAlgorithm, setActiveAlgorithm] = useState<string>("");

  // Academy Lesson State
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(0);
  const [completedStages, setCompletedStages] = useState<Record<string, boolean>>({});

  // Speedcubing Timer State
  const [timerState, setTimerState] = useState<"idle" | "inspecting" | "running" | "stopped">("idle");
  const [timeMs, setTimeMs] = useState<number>(0);
  const [inspectionSeconds, setInspectionSeconds] = useState<number>(15);
  const [useInspection, setUseInspection] = useState<boolean>(true);
  const [currentScramble, setCurrentScramble] = useState<string>(generateWcaScramble(20));
  const [solves, setSolves] = useState<SolveRecord[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const inspectionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Algorithms Filter
  const [algoCategory, setAlgoCategory] = useState<"ALL" | "OLL" | "PLL">("ALL");

  // Handle Manual Moves
  const handleMove = useCallback((move: MoveNotation) => {
    setCube((prev) => applyMove(prev, move));
    playFx("click");
  }, [playFx]);

  // Handle Cube Reset
  const handleReset = useCallback(() => {
    setCube(createSolvedCube());
    playFx("toggle");
  }, [playFx]);

  // Apply Scramble to Cube
  const handleApplyScramble = (scrambleStr: string) => {
    let next = createSolvedCube();
    const moves = scrambleStr.trim().split(/\s+/).filter(Boolean) as MoveNotation[];
    for (const m of moves) {
      next = applyMove(next, m);
    }
    setCube(next);
    playFx("pop");
  };

  // Generate and apply new scramble
  const handleNewScramble = () => {
    const sc = generateWcaScramble(20);
    setCurrentScramble(sc);
    handleApplyScramble(sc);
  };

  // Timer Start / Stop Logic
  const startSolveTimer = useCallback(() => {
    if (inspectionTimerRef.current) clearInterval(inspectionTimerRef.current);
    setTimerState("running");
    startTimeRef.current = Date.now();
    playFx("toggle");

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeMs(Date.now() - startTimeRef.current);
    }, 10);
  }, [playFx]);

  const startInspection = useCallback(() => {
    setTimerState("inspecting");
    setInspectionSeconds(15);
    playFx("pop");

    if (inspectionTimerRef.current) clearInterval(inspectionTimerRef.current);
    inspectionTimerRef.current = setInterval(() => {
      setInspectionSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(inspectionTimerRef.current!);
          startSolveTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [playFx, startSolveTimer]);

  const stopSolveTimer = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (inspectionTimerRef.current) clearInterval(inspectionTimerRef.current);

    const finalTime = Date.now() - startTimeRef.current;
    setTimeMs(finalTime);
    setTimerState("stopped");
    playFx("celebrate");

    const newRecord: SolveRecord = {
      id: Date.now().toString(),
      timeMs: finalTime,
      scramble: currentScramble,
      date: new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" }),
    };

    setSolves((prev) => [newRecord, ...prev.slice(0, 49)]);

    // Save session to Supabase if authenticated
    if (user) {
      try {
        const supabase = getSupabaseClient();
        if (supabase) {
          await supabase.from("training_sessions").insert({
            user_id: user.id,
            session_type: "rubiks",
            level: "wca_timer",
            total_questions: 1,
            correct_answers: 1,
            wrong_answers: 0,
            accuracy_rate: 100,
            duration_seconds: Math.max(1, Math.round(finalTime / 1000)),
            score: Math.max(10, Math.round(100000 / (finalTime / 1000))),
            metadata: {
              scramble: currentScramble,
              solveTimeMs: finalTime,
            },
          });
        }
      } catch (err) {
        console.warn("Could not sync Rubik's solve session:", err);
      }
    }

    // Prepare next scramble
    const nextSc = generateWcaScramble(20);
    setCurrentScramble(nextSc);
  }, [currentScramble, playFx, user]);

  const handleTimerClick = useCallback(() => {
    if (timerState === "idle" || timerState === "stopped") {
      if (useInspection) {
        startInspection();
      } else {
        startSolveTimer();
      }
    } else if (timerState === "inspecting") {
      startSolveTimer();
    } else if (timerState === "running") {
      void stopSolveTimer();
    }
  }, [timerState, useInspection, startInspection, startSolveTimer, stopSolveTimer]);

  // Keyboard Spacebar listener for Timer
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== "timer") return;
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        handleTimerClick();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeTab, handleTimerClick]);

  // Statistics Calculations
  const bestTime = solves.length > 0 ? Math.min(...solves.map((s) => s.timeMs)) : null;

  const calculateAo = (n: number): number | null => {
    if (solves.length < n) return null;
    const slice = solves.slice(0, n).map((s) => s.timeMs);
    slice.sort((a, b) => a - b);
    // Trim fastest and slowest, average the rest
    const trimmed = slice.slice(1, n - 1);
    const sum = trimmed.reduce((acc, v) => acc + v, 0);
    return Math.round(sum / trimmed.length);
  };

  const ao5 = calculateAo(5);
  const ao12 = calculateAo(12);

  const formatTimerDigits = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const millis = Math.floor((ms % 1000) / 10);
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, "0")}.${millis.toString().padStart(2, "0")}`;
    }
    return `${secs}.${millis.toString().padStart(2, "0")}`;
  };

  const currentLesson = LBL_STAGES[selectedStageIdx];

  const filteredCfop =
    algoCategory === "ALL"
      ? CFOP_LIBRARY
      : CFOP_LIBRARY.filter((a) => a.category === algoCategory);

  return (
    <ModuleLockedGate moduleId="rubiks-cube" moduleNameAr="مكعب روبيك" moduleIcon="🧊">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8" dir="rtl">
      {/* Top Banner matching Super Mind 3D Clay Aesthetic */}
      <div className="clay-banner-lavender relative overflow-hidden p-5 sm:p-7 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center md:text-start">
          <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-3xl shrink-0 shadow-sm">
            🧊
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                أكاديمية مكعب روبيك ثلاثي الأبعاد
              </h1>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                من الصفر للاحتراف 🚀
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/90 font-medium mt-1 leading-relaxed">
              منهج متكامل لتعلم خطوات الحل (LBL) وخوارزميات السرعة (CFOP) مع مكعب ثلاثي الأبعاد تفاعلي ومؤقت WCA الرسمي.
            </p>
          </div>
        </div>

        <Link
          href="/mental-arithmetic"
          onClick={() => playFx("pop")}
          className="clay-pill px-4 py-2 text-xs font-black text-slate-950 bg-white hover:bg-amber-100 flex items-center gap-1.5 shrink-0 shadow-md transition-all active:scale-95"
        >
          <ArrowRight className="w-4 h-4 text-brand-600" />
          <span>العودة لكافة البرامج</span>
        </Link>
      </div>

      {/* Main Tab Navigation Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => {
            setActiveTab("academy");
            playFx("toggle");
          }}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 active:scale-95 ${
            activeTab === "academy"
              ? "clay-btn-purple !rounded-2xl shadow-lg"
              : "clay-pill text-slate-700 dark:text-slate-200"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>أكاديمية التعلم خطوة بخطوة (LBL)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("timer");
            playFx("toggle");
          }}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 active:scale-95 ${
            activeTab === "timer"
              ? "clay-btn-purple !rounded-2xl shadow-lg"
              : "clay-pill text-slate-700 dark:text-slate-200"
          }`}
        >
          <Timer className="w-4 h-4" />
          <span>مؤقت التحدي وسرعة الحل (WCA Timer)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("algorithms");
            playFx("toggle");
          }}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 active:scale-95 ${
            activeTab === "algorithms"
              ? "clay-btn-purple !rounded-2xl shadow-lg"
              : "clay-pill text-slate-700 dark:text-slate-200"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>بنك خوارزميات السرعة (CFOP)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("sandbox");
            playFx("toggle");
          }}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 active:scale-95 ${
            activeTab === "sandbox"
              ? "clay-btn-purple !rounded-2xl shadow-lg"
              : "clay-pill text-slate-700 dark:text-slate-200"
          }`}
        >
          <RotateCw className="w-4 h-4" />
          <span>المحاكي الحر والخلط المفتوح</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. TAB: ACADEMY (LBL STEP-BY-STEP TUTORIAL)                               */}
      {/* ========================================================================= */}
      {activeTab === "academy" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive 3D Rubik's Cube */}
          <div className="lg:col-span-5 space-y-4">
            <RubiksCube3D
              cube={cube}
              onMove={handleMove}
              onReset={handleReset}
              activeAlgorithm={activeAlgorithm}
            />

            {/* Quick Algorithm Practice Buttons from Current Lesson */}
            <div className="clay-card !p-4 bg-white/90 dark:bg-[#1C183D] space-y-3">
              <span className="text-xs font-black text-brand-700 dark:text-brand-300">
                خوارزميات التدريب الخاصة بهذه المرحلة:
              </span>
              <div className="flex flex-wrap gap-2">
                {currentLesson.practiceAlgorithms.map((algo) => (
                  <button
                    key={algo}
                    type="button"
                    onClick={() => {
                      setActiveAlgorithm(algo);
                      playFx("pop");
                    }}
                    className="clay-pill px-3 py-1.5 text-xs font-mono font-black text-slate-900 dark:text-white hover:text-brand-600 active:scale-95"
                  >
                    ▶ {algo}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Stage Curriculum Details */}
          <div className="lg:col-span-7 space-y-4">
            {/* Stage Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {LBL_STAGES.map((stg, idx) => {
                const isSelected = idx === selectedStageIdx;
                const isDone = completedStages[stg.id];
                return (
                  <button
                    key={stg.id}
                    type="button"
                    onClick={() => {
                      setSelectedStageIdx(idx);
                      playFx("click");
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black shrink-0 transition-all active:scale-95 flex items-center gap-1.5 ${
                      isSelected
                        ? "clay-btn-purple !rounded-xl shadow-md text-white"
                        : "clay-pill text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <span>{idx + 1}</span>
                    <span>{stg.titleAr.split(":")[0]}</span>
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                );
              })}
            </div>

            {/* Lesson Detail Card */}
            <div className="clay-card !p-6 bg-white dark:bg-[#1C183D] border-2 border-brand-200/80 dark:border-brand-800/80 rounded-3xl space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-black px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300">
                    المرحلة {currentLesson.stageNumber} من 7
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-[#261E58] dark:text-white mt-1">
                    {currentLesson.titleAr}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    {currentLesson.taglineAr}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCompletedStages((prev) => ({
                      ...prev,
                      [currentLesson.id]: !prev[currentLesson.id],
                    }));
                    playFx("celebrate");
                  }}
                  className={`clay-pill px-3 py-1.5 text-xs font-black flex items-center gap-1.5 shrink-0 ${
                    completedStages[currentLesson.id]
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                      : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{completedStages[currentLesson.id] ? "تم الإتقان ✓" : "تحديد كمتقن"}</span>
                </button>
              </div>

              {/* Goal Box */}
              <div className="p-3.5 rounded-2xl bg-[#F6F4FE] dark:bg-[#14122B] border border-brand-100 dark:border-brand-900/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                🎯 <strong className="text-brand-700 dark:text-brand-300">الهدف التعليمي:</strong> {currentLesson.goalAr}
              </div>

              {/* Step by Step Breakdown */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  خطوات التنفيذ العملية:
                </h3>
                {currentLesson.steps.map((step, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-4 rounded-2xl bg-white dark:bg-[#231F4A] border border-slate-200/80 dark:border-slate-700 space-y-2 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-brand-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                        {sIdx + 1}
                      </span>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                        {step.titleAr}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {step.descriptionAr}
                    </p>

                    {step.algorithm && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8F6FE] dark:bg-[#15122F] border border-brand-200/70 dark:border-brand-800/60 text-xs">
                        <span className="font-mono font-black text-brand-700 dark:text-brand-300 text-sm">
                          {step.algorithm}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveAlgorithm(step.algorithm!);
                            playFx("pop");
                          }}
                          className="clay-pill px-3 py-1 text-[11px] font-black text-brand-700 dark:text-brand-300 flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" />
                          <span>تطبيق على المكعب</span>
                        </button>
                      </div>
                    )}

                    {step.tipAr && (
                      <div className="text-[11px] text-amber-800 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-200 dark:border-amber-800/60">
                        💡 تلميح العباقرة: {step.tipAr}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Prev / Next Stage Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={selectedStageIdx === 0}
                  onClick={() => {
                    setSelectedStageIdx((prev) => Math.max(0, prev - 1));
                    playFx("click");
                  }}
                  className="clay-pill px-4 py-2 text-xs font-black flex items-center gap-1 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>المرحلة السابقة</span>
                </button>

                <button
                  type="button"
                  disabled={selectedStageIdx === LBL_STAGES.length - 1}
                  onClick={() => {
                    setSelectedStageIdx((prev) => Math.min(LBL_STAGES.length - 1, prev + 1));
                    playFx("click");
                  }}
                  className="clay-btn-purple px-5 py-2 text-xs font-black flex items-center gap-1 disabled:opacity-40 !rounded-xl"
                >
                  <span>المرحلة التالية</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB: WCA PRO SPEEDCUBING TIMER                                         */}
      {/* ========================================================================= */}
      {activeTab === "timer" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Cube View for Visual Scramble Verification */}
          <div className="lg:col-span-5 space-y-4">
            <RubiksCube3D
              cube={cube}
              onMove={handleMove}
              onReset={handleReset}
              showControls={false}
            />

            <div className="clay-card !p-4 bg-white/90 dark:bg-[#1C183D] space-y-2 text-center">
              <span className="text-xs font-black text-slate-500">تطبيق الخلطة على المكعب:</span>
              <button
                type="button"
                onClick={() => handleApplyScramble(currentScramble)}
                className="clay-btn-purple w-full py-2.5 text-xs font-black flex items-center justify-center gap-2 !rounded-xl"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>خلط المكعب الافتراضي بالخلطة الحالية</span>
              </button>
            </div>
          </div>

          {/* Right Column: Speedcubing Arena & StopWatch */}
          <div className="lg:col-span-7 space-y-5">
            {/* Scramble Display Card */}
            <div className="clay-card !p-4 sm:!p-5 bg-white dark:bg-[#1C183D] rounded-3xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-brand-700 dark:text-brand-300">
                  خلطة WCA الرسمية (Scramble):
                </span>
                <button
                  type="button"
                  onClick={handleNewScramble}
                  className="clay-pill px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 active:scale-95"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>خلطة جديدة</span>
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F6F4FE] dark:bg-[#14122B] text-center font-mono font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-widest select-all">
                {currentScramble}
              </div>
            </div>

            {/* Giant Speedcubing Stopwatch Display */}
            <div
              onClick={handleTimerClick}
              className={`clay-card !p-8 sm:!p-12 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 cursor-pointer select-none transition-all duration-150 ${
                timerState === "inspecting"
                  ? "bg-amber-500 text-slate-950 border-4 border-amber-300 scale-[1.02]"
                  : timerState === "running"
                  ? "bg-emerald-600 text-white border-4 border-emerald-400 scale-[1.01]"
                  : "bg-gradient-to-br from-white via-[#FAF8FF] to-[#EDE7FF] dark:from-[#1E1B3E] dark:via-[#221D47] dark:to-[#191538] border-2 border-brand-500/40"
              }`}
            >
              {timerState === "inspecting" ? (
                <div className="text-center space-y-2">
                  <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-900">
                    وقت المعاينة (WCA Inspection)
                  </span>
                  <div className="text-7xl sm:text-8xl font-black font-mono">
                    {inspectionSeconds}
                  </div>
                  <span className="text-xs font-bold text-slate-900/80">
                    المس الشاشة أو اضغط المسافة لبدء المؤقت فوراً!
                  </span>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <div className="text-6xl sm:text-8xl font-black font-mono tracking-tight text-[#261E58] dark:text-white">
                    {formatTimerDigits(timeMs)}
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-slate-500 dark:text-slate-300">
                    {timerState === "running"
                      ? "اضغط الشاشة أو مسطرة المسافة للإيقاف! ⏱️"
                      : "اضغط الشاشة أو زر المسافة (Spacebar) للانطلاق 🚀"}
                  </div>
                </div>
              )}
            </div>

            {/* Timer Settings & Inspection Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#1C183D] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useInspection}
                  onChange={(e) => setUseInspection(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <span>تفعيل وقت المعاينة الرسمي (15s Inspection)</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setTimeMs(0);
                  setTimerState("idle");
                }}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-bold"
              >
                تصفير التوقيت
              </button>
            </div>

            {/* Performance Stats Cards (PB, Ao5, Ao12) */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="clay-card !p-3 sm:!p-4 bg-white dark:bg-[#1C183D] text-center space-y-1">
                <span className="text-[10px] sm:text-xs font-bold text-slate-500">أفضل توقيت (PB) 🏆</span>
                <div className="text-base sm:text-xl font-black font-mono text-amber-500">
                  {bestTime !== null ? formatTimerDigits(bestTime) : "--:--"}
                </div>
              </div>

              <div className="clay-card !p-3 sm:!p-4 bg-white dark:bg-[#1C183D] text-center space-y-1">
                <span className="text-[10px] sm:text-xs font-bold text-slate-500">متوسط 5 (Ao5)</span>
                <div className="text-base sm:text-xl font-black font-mono text-brand-600 dark:text-brand-400">
                  {ao5 !== null ? formatTimerDigits(ao5) : "--:--"}
                </div>
              </div>

              <div className="clay-card !p-3 sm:!p-4 bg-white dark:bg-[#1C183D] text-center space-y-1">
                <span className="text-[10px] sm:text-xs font-bold text-slate-500">متوسط 12 (Ao12)</span>
                <div className="text-base sm:text-xl font-black font-mono text-emerald-500">
                  {ao12 !== null ? formatTimerDigits(ao12) : "--:--"}
                </div>
              </div>
            </div>

            {/* Recent Solves Table */}
            {solves.length > 0 && (
              <div className="clay-card !p-4 bg-white dark:bg-[#1C183D] rounded-2xl space-y-2">
                <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                  سجل المحاولات الأخيرة ({solves.length} حلة مسجلة):
                </span>
                <div className="max-h-40 overflow-y-auto space-y-1 text-xs font-mono">
                  {solves.map((s, idx) => (
                    <div
                      key={s.id}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between"
                    >
                      <span className="font-bold text-slate-500">#{solves.length - idx}</span>
                      <span className="font-black text-slate-900 dark:text-white">
                        {formatTimerDigits(s.timeMs)}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                        {s.scramble}
                      </span>
                      <span className="text-[10px] text-slate-400">{s.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB: CFOP ADVANCED ALGORITHM LIBRARY                                   */}
      {/* ========================================================================= */}
      {activeTab === "algorithms" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-black text-[#261E58] dark:text-white">
                بنك خوارزميات السرعة العالمية (CFOP Speedcubing Algorithms)
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                اختر أي خوارزمية لتجربتها وتطبيقها مباشرة خطوة بخطوة على المكعب ثلاثي الأبعاد.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-[#F6F4FE] dark:bg-[#14122B] p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
              {(["ALL", "OLL", "PLL"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setAlgoCategory(cat);
                    playFx("click");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    algoCategory === cat
                      ? "clay-btn-purple !rounded-xl text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {cat === "ALL" ? "الكل" : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCfop.map((algo) => (
              <div
                key={algo.name}
                className="clay-card !p-5 bg-white dark:bg-[#1C183D] border border-brand-200/80 dark:border-brand-800/60 rounded-3xl flex flex-col justify-between space-y-3 shadow-sm hover:scale-[1.02] transition-transform"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300">
                      {algo.category}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {algo.difficulty === "beginner" ? "مبتدئ" : algo.difficulty === "intermediate" ? "متوسط" : "متقدم"}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {algo.name}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {algo.descriptionAr}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="p-2 rounded-xl bg-[#F6F4FE] dark:bg-[#14122B] font-mono font-black text-xs sm:text-sm text-brand-700 dark:text-brand-300 text-center select-all">
                    {algo.notation}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveAlgorithm(algo.notation);
                      setActiveTab("academy");
                      playFx("pop");
                    }}
                    className="clay-btn-purple w-full py-2 text-xs font-black flex items-center justify-center gap-1.5 !rounded-xl"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>تشغيل على المكعب 3D</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB: FREE PLAY SANDBOX                                                 */}
      {/* ========================================================================= */}
      {activeTab === "sandbox" && (
        <div className="max-w-2xl mx-auto space-y-6">
          <RubiksCube3D
            cube={cube}
            onMove={handleMove}
            onReset={handleReset}
          />

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="clay-pill py-3 text-xs font-black flex items-center justify-center gap-2 text-slate-800 dark:text-slate-200 active:scale-95"
            >
              <RotateCcw className="w-4 h-4 text-brand-600" />
              <span>إعادة حل المكعب كاملاً</span>
            </button>

            <button
              type="button"
              onClick={handleNewScramble}
              className="clay-btn-purple py-3 text-xs font-black flex items-center justify-center gap-2 !rounded-2xl shadow-lg active:scale-95"
            >
              <RotateCw className="w-4 h-4" />
              <span>خلط عشوائي جديد (Scramble)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  </ModuleLockedGate>
  );
}
