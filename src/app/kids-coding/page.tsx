"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Code,
  Cpu,
  Bot,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowUp,
  RotateCw,
  Repeat,
  Trash2,
  Sliders,
  Send,
  Zap,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import ClayIcon from "@/components/design-system/ClayIcon";
import {
  MAZE_PUZZLES,
  MazePuzzle,
  RobotState,
  BlockType,
  ProgramBlock,
  executeRobotStep,
  INITIAL_AI_ITEMS,
  TrainingItem,
  predictAIClass,
} from "@/lib/kids-coding/coding-engine";
import { getSupabaseClient } from "@/lib/supabase/client";
import ModuleLockedGate from "@/components/common/ModuleLockedGate";

type CodingTab = "maze" | "ai-lab" | "prompt-lab";

export default function KidsCodingPage() {
  const { language, playFx } = useApp();
  const { user } = useAuth();
  const isAr = language === "ar";

  const [activeTab, setActiveTab] = useState<CodingTab>("maze");

  // -------------------------------------------------------------
  // TAB 1: ROBOT MAZE RUNNER
  // -------------------------------------------------------------
  const [currentLevelIdx, setCurrentLevelIdx] = useState<number>(0);
  const puzzle: MazePuzzle = MAZE_PUZZLES[currentLevelIdx];

  const [robot, setRobot] = useState<RobotState>(puzzle.start);
  const [program, setProgram] = useState<ProgramBlock[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [gameResult, setGameResult] = useState<"idle" | "success" | "crash">("idle");
  const [currentGrid, setCurrentGrid] = useState<string[][]>(puzzle.grid);

  // Reset level
  const resetRobotLevel = useCallback(() => {
    setRobot(puzzle.start);
    setIsRunning(false);
    setActiveBlockId(null);
    setGameResult("idle");
    setCurrentGrid(puzzle.grid.map((row) => [...row]));
  }, [puzzle]);

  useEffect(() => {
    resetRobotLevel();
    setProgram([]);
  }, [currentLevelIdx, resetRobotLevel]);

  const addBlock = (type: BlockType) => {
    if (isRunning) return;
    if (program.length >= puzzle.maxBlocks) {
      playFx("wrong");
      return;
    }
    playFx("click");
    const newBlock: ProgramBlock = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      repeatCount: type === "repeat" ? 3 : undefined,
    };
    setProgram((prev) => [...prev, newBlock]);
  };

  const removeBlock = (id: string) => {
    if (isRunning) return;
    playFx("click");
    setProgram((prev) => prev.filter((b) => b.id !== id));
  };

  const clearProgram = () => {
    if (isRunning) return;
    playFx("click");
    setProgram([]);
  };

  // Run the sequence of commands
  const runProgram = async () => {
    if (isRunning || program.length === 0) return;
    setIsRunning(true);
    setGameResult("idle");
    playFx("bubble");

    // Flatten blocks (expand repeat)
    const flatActions: { blockId: string; action: "forward" | "turn_right" | "turn_left" }[] = [];
    for (const b of program) {
      if (b.type === "repeat") {
        const count = b.repeatCount || 2;
        for (let i = 0; i < count; i++) {
          flatActions.push({ blockId: b.id, action: "forward" });
        }
      } else {
        flatActions.push({ blockId: b.id, action: b.type });
      }
    }

    let curRobot = { ...robot };
    const curGrid = currentGrid.map((row) => [...row]);
    let success = false;
    let crashed = false;

    for (let i = 0; i < flatActions.length; i++) {
      const step = flatActions[i];
      setActiveBlockId(step.blockId);

      const res = executeRobotStep(curRobot, step.action, curGrid);
      curRobot = res.nextRobot;
      setRobot(curRobot);

      if (!res.valid) {
        crashed = true;
        playFx("wrong");
        break;
      }

      if (res.collectedCoin) {
        playFx("click");
        curGrid[curRobot.y][curRobot.x] = ".";
        setCurrentGrid([...curGrid]);
      }

      if (res.hitTarget) {
        success = true;
        playFx("correct");
        break;
      }

      await new Promise((r) => setTimeout(r, 450));
    }

    setActiveBlockId(null);
    setIsRunning(false);

    if (success) {
      setGameResult("success");
      // Save completion
      if (user) {
        const supabase = getSupabaseClient();
        if (supabase) {
          void supabase.from("training_sessions").insert({
            user_id: user.id,
            session_type: "kids_coding",
            status: "completed",
            score: 150 * (currentLevelIdx + 1),
            metadata: { puzzleId: puzzle.id, programLength: program.length },
          });
        }
      }
    } else if (crashed) {
      setGameResult("crash");
    } else {
      setGameResult("crash"); // Did not reach battery
    }
  };

  // -------------------------------------------------------------
  // TAB 2: INTERACTIVE AI CLASSIFIER LAB
  // -------------------------------------------------------------
  const [trainingData, setTrainingData] = useState<TrainingItem[]>(INITIAL_AI_ITEMS);
  const [testSample, setTestSample] = useState<Omit<TrainingItem, "id" | "label">>({
    color: "orange",
    earType: "pointy",
    sound: "meow",
  });
  const [aiPrediction, setAiPrediction] = useState(() =>
    predictAIClass(
      { color: "orange", earType: "pointy", sound: "meow" },
      INITIAL_AI_ITEMS
    )
  );

  const handlePredict = () => {
    playFx("bubble");
    const res = predictAIClass(testSample, trainingData);
    setAiPrediction(res);
  };

  const addTrainingExample = (label: "cat" | "dog") => {
    playFx("click");
    const newItem: TrainingItem = {
      id: Math.random().toString(36).substring(2, 7),
      label,
      ...testSample,
    };
    const nextData = [...trainingData, newItem];
    setTrainingData(nextData);
    setAiPrediction(predictAIClass(testSample, nextData));
  };

  // -------------------------------------------------------------
  // TAB 3: PROMPT ENGINEERING PLAYGROUND
  // -------------------------------------------------------------
  const [promptRole, setPromptRole] = useState<string>("مستكشف فضاء عبقري");
  const [promptMission, setPromptMission] = useState<string>("بناء محطة طاقة شمسية على المريخ");
  const [promptTone, setPromptTone] = useState<string>("حماس ومغامرة للأطفال");
  const [aiStoryOutput, setAiStoryOutput] = useState<string | null>(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState<boolean>(false);

  const generateKidStory = () => {
    playFx("bubble");
    setIsGeneratingStory(true);
    setAiStoryOutput(null);

    setTimeout(() => {
      setIsGeneratingStory(false);
      setAiStoryOutput(
        `🚀 مرحباً يا بطل سوبرمايند! بصفتي ${promptRole}، تلقيت إشارتك وبدأت فوراً في ${promptMission}!\n\nركّبتُ ألواح الطاقة الشمسية المصنوعة من بلورات النجوم، والآن محطتنا الفضائية تشع نوراً بنفسجياً رائعاً يضيء سماء المريخ! الذكاء الاصطناعي يقول أننا ننتج طاقة تكفي 1,000 روبوت فضائي! 🤖✨`
      );
      playFx("correct");
    }, 1200);
  };

  return (
    <ModuleLockedGate moduleId="kids-coding" moduleNameAr="البرمجة والذكاء الاصطناعي للأطفال" moduleIcon="💻">
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
              <ClayIcon name="code" size="xs" />
              <span>{isAr ? "أكاديمية البرمجة والذكاء الاصطناعي" : "Kids Coding & AI"}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-xs">
              <Cpu className="w-4 h-4" />
              <span>{isAr ? "المستقبل والتكنولوجيا" : "Future Tech"}</span>
            </div>
          </div>
        </div>

        {/* Hero Title */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-700 via-indigo-600 to-violet-500 bg-clip-text text-transparent">
            {isAr ? "البرمجة والذكاء الاصطناعي 💻" : "Kids Coding & AI 💻"}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            {isAr
              ? "تعلم التفكير البرمجي التأسيسي وبرمجة الروبوت بالكتل البرمجية، واكتشف أسرار تدريب نماذج الذكاء الاصطناعي وهندسة الأوامر!"
              : "Learn computational thinking, visual block robot coding, machine learning classifiers, and prompt engineering!"}
          </p>
        </div>

        {/* Main Navigation Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-100 dark:bg-[#16132C] p-2 rounded-2xl border border-purple-100 dark:border-purple-900/40">
          {[
            { id: "maze", label: isAr ? "برمجة الروبوت بالمتاهة" : "Robot Maze Coding", icon: Bot },
            { id: "ai-lab", label: isAr ? "مختبر الذكاء الاصطناعي" : "AI Machine Learning", icon: Cpu },
            { id: "prompt-lab", label: isAr ? "مختبر هندسة الأوامر" : "Prompt Engineering", icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playFx("click");
                  setActiveTab(tab.id as CodingTab);
                }}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                  active
                    ? "bg-white dark:bg-[#231F46] text-purple-700 dark:text-purple-300 shadow-md scale-[1.02] border border-purple-200 dark:border-purple-800"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-purple-600" : ""}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: ROBOT MAZE RUNNER */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "maze" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Maze Grid (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-[#1C1A3A] p-6 sm:p-8 rounded-3xl shadow-xl border border-purple-100 dark:border-purple-900/50 space-y-6">
              {/* Level Selector & Info */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-50 dark:border-purple-900/30 pb-4">
                <div>
                  <div className="text-xs font-bold text-purple-600 dark:text-purple-400">
                    {puzzle.conceptAr}
                  </div>
                  <h2 className="text-xl font-black text-purple-900 dark:text-purple-200">
                    {puzzle.titleAr}
                  </h2>
                </div>
                <div className="flex items-center gap-1.5">
                  {MAZE_PUZZLES.map((pz, idx) => (
                    <button
                      key={pz.id}
                      onClick={() => setCurrentLevelIdx(idx)}
                      className={`w-8 h-8 rounded-xl font-bold text-xs transition-all ${
                        currentLevelIdx === idx
                          ? "bg-purple-600 text-white shadow-md scale-105"
                          : "bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid Canvas */}
              <div className="flex justify-center py-4">
                <div
                  className="grid gap-2 p-3 bg-slate-900 rounded-3xl shadow-2xl border-4 border-purple-600/40"
                  style={{
                    gridTemplateColumns: `repeat(${puzzle.gridSize}, minmax(0, 1fr))`,
                    width: `${Math.min(420, puzzle.gridSize * 70)}px`,
                    height: `${Math.min(420, puzzle.gridSize * 70)}px`,
                  }}
                >
                  {currentGrid.map((row, rIdx) =>
                    row.map((cell, cIdx) => {
                      const isRobotHere = robot.x === cIdx && robot.y === rIdx;
                      const isWall = cell === "#";
                      const isTarget = cell === "T";
                      const isCoin = cell === "C";

                      return (
                        <div
                          key={`${rIdx}-${cIdx}`}
                          className={`w-full h-full rounded-2xl relative flex items-center justify-center transition-all ${
                            isWall
                              ? "bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600 shadow-inner"
                              : "bg-slate-800/80 border border-slate-700/50"
                          }`}
                        >
                          {/* Target Battery */}
                          {isTarget && (
                            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 font-black flex items-center justify-center shadow-lg shadow-amber-400/50 animate-pulse">
                              <Zap className="w-6 h-6 fill-current" />
                            </div>
                          )}

                          {/* Coin */}
                          {isCoin && (
                            <div className="w-7 h-7 rounded-full bg-emerald-400 text-emerald-950 flex items-center justify-center shadow-md animate-bounce">
                              <Sparkles className="w-4 h-4 fill-current" />
                            </div>
                          )}

                          {/* Robot Character */}
                          {isRobotHere && (
                            <div
                              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-purple-500/60 transition-all duration-300 transform"
                              style={{
                                transform: `rotate(${robot.dir * 90}deg)`,
                              }}
                            >
                              <Bot className="w-7 h-7" />
                              <div className="absolute -top-1 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm" />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Status Banner */}
              {gameResult === "success" && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-center font-bold text-sm space-y-2 animate-bounce">
                  <p>🎉 عبقري! الروبوت نفّذ الخوارزمية بنجاح ووصل لبلورة الطاقة!</p>
                  {currentLevelIdx < MAZE_PUZZLES.length - 1 && (
                    <button
                      onClick={() => setCurrentLevelIdx((c) => c + 1)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
                    >
                      {isAr ? "الانتقال للمتاهة التالية" : "Next Level"}
                    </button>
                  )}
                </div>
              )}
              {gameResult === "crash" && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-center font-bold text-sm space-y-2">
                  <p>💥 لم يصل الروبوت للهدف أو اصطدم بالجدار! تفقد خطوات الخوارزمية وأعد المحاولة.</p>
                  <button
                    onClick={resetRobotLevel}
                    className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
                  >
                    {isAr ? "إعادة تعيين الروبوت" : "Reset Robot"}
                  </button>
                </div>
              )}
            </div>

            {/* Right: Block Coding Workspace (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Block Palette */}
              <div className="bg-white dark:bg-[#1C1A3A] p-6 rounded-3xl shadow-xl border border-purple-100 dark:border-purple-900/50 space-y-4">
                <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Code className="w-4 h-4 text-purple-600" />
                  <span>{isAr ? "كتل الأوامر البرمجية:" : "Available Blocks:"}</span>
                </h3>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    disabled={isRunning}
                    onClick={() => addBlock("forward")}
                    className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:scale-102 active:scale-95 transition-all"
                  >
                    <ArrowUp className="w-4 h-4" />
                    <span>{isAr ? "تحرك للأمام" : "Move Forward"}</span>
                  </button>

                  <button
                    disabled={isRunning}
                    onClick={() => addBlock("turn_right")}
                    className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:scale-102 active:scale-95 transition-all"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span>{isAr ? "استدر يميناً" : "Turn Right"}</span>
                  </button>

                  <button
                    disabled={isRunning}
                    onClick={() => addBlock("turn_left")}
                    className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:scale-102 active:scale-95 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{isAr ? "استدر يساراً" : "Turn Left"}</span>
                  </button>

                  {puzzle.allowedBlocks.includes("repeat") && (
                    <button
                      disabled={isRunning}
                      onClick={() => addBlock("repeat")}
                      className="p-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:scale-102 active:scale-95 transition-all"
                    >
                      <Repeat className="w-4 h-4" />
                      <span>{isAr ? "تكرار (3x)" : "Repeat (3x)"}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Program Queue */}
              <div className="bg-white dark:bg-[#1C1A3A] p-6 rounded-3xl shadow-xl border border-purple-100 dark:border-purple-900/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {isAr ? "محرر الخوارزمية" : "Program Queue"}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold">
                      {program.length} / {puzzle.maxBlocks}
                    </span>
                  </div>
                  {program.length > 0 && (
                    <button
                      disabled={isRunning}
                      onClick={clearProgram}
                      className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isAr ? "مسح الكل" : "Clear"}</span>
                    </button>
                  )}
                </div>

                {/* Blocks Stack */}
                <div className="space-y-2 min-h-48 max-h-72 overflow-y-auto p-3 rounded-2xl bg-[#FAF8FF] dark:bg-[#141228] border border-purple-100 dark:border-purple-900/40 shadow-inner">
                  {program.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      {isAr
                        ? "اضغط على الكتل أعلاه لبناء خوارزمية الروبوت"
                        : "Click blocks above to build your program"}
                    </div>
                  ) : (
                    program.map((block, idx) => {
                      const isActive = activeBlockId === block.id;
                      return (
                        <div
                          key={block.id}
                          className={`flex items-center justify-between p-3 rounded-xl border font-bold text-xs transition-all ${
                            isActive
                              ? "bg-purple-600 text-white scale-102 shadow-lg shadow-purple-500/40 border-purple-400"
                              : "bg-white dark:bg-[#231F46] text-slate-700 dark:text-slate-200 border-purple-100 dark:border-purple-800"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                            <span>
                              {block.type === "forward" && (isAr ? "تحرك للأمام ⬆️" : "Forward ⬆️")}
                              {block.type === "turn_right" && (isAr ? "استدر يميناً ↪️" : "Turn Right ↪️")}
                              {block.type === "turn_left" && (isAr ? "استدر يساراً ↩️" : "Turn Left ↩️")}
                              {block.type === "repeat" && (isAr ? `تكرار للأمام (${block.repeatCount} مرات) 🔁` : `Repeat ${block.repeatCount}x`)}
                            </span>
                          </div>
                          {!isRunning && (
                            <button
                              onClick={() => removeBlock(block.id)}
                              className="text-slate-400 hover:text-rose-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Control Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    disabled={isRunning}
                    onClick={resetRobotLevel}
                    className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>

                  <button
                    disabled={isRunning || program.length === 0}
                    onClick={runProgram}
                    className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-purple-500/30 hover:scale-102 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{isAr ? "تشغيل الخوارزمية ▶" : "Run Algorithm ▶"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: INTERACTIVE AI CLASSIFIER LAB */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "ai-lab" && (
          <div className="bg-white dark:bg-[#1C1A3A] p-6 sm:p-8 rounded-3xl shadow-xl border border-purple-100 dark:border-purple-900/50 space-y-8">
            <div className="border-b border-purple-50 dark:border-purple-900/30 pb-4">
              <h2 className="text-xl font-black text-purple-900 dark:text-purple-200 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-600" />
                {isAr ? "مختبر تدريب الذكاء الاصطناعي (AI Classifier)" : "Machine Learning Classifier"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {isAr
                  ? "كيف يفكر الذكاء الاصطناعي؟ اختر الخصائص، درّب النموذج على تصنيف القطط والكلاب، وشاهد دقة التنبؤ وقرار الآلة!"
                  : "Train an AI model on features (color, ears, sounds) and see how it predicts classes with confidence!"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Feature Customizer */}
              <div className="p-6 rounded-3xl bg-[#FAF8FF] dark:bg-[#141228] border border-purple-100 dark:border-purple-900/40 space-y-6">
                <h3 className="font-bold text-sm text-purple-900 dark:text-purple-200 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-600" />
                  <span>{isAr ? "1. خصائص الكائن الجديد (Features):" : "1. Feature Extraction:"}</span>
                </h3>

                {/* Color Feature */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500">{isAr ? "لون الفراء:" : "Color:"}</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "orange", label: isAr ? "برتقالي 🦊" : "Orange" },
                      { id: "white", label: isAr ? "أبيض 🤍" : "White" },
                      { id: "black", label: isAr ? "أسود 🖤" : "Black" },
                    ].map((col) => (
                      <button
                        key={col.id}
                        onClick={() => setTestSample((s) => ({ ...s, color: col.id as "orange" | "white" | "black" }))}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          testSample.color === col.id
                            ? "bg-purple-600 text-white border-purple-600"
                            : "bg-white dark:bg-[#231F46] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {col.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ear Type */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500">{isAr ? "شكل الأذنين:" : "Ears:"}</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "pointy", label: isAr ? "مثلثة مدببة 🐱" : "Pointy" },
                      { id: "floppy", label: isAr ? "متدلية ناعمة 🐶" : "Floppy" },
                    ].map((ear) => (
                      <button
                        key={ear.id}
                        onClick={() => setTestSample((s) => ({ ...s, earType: ear.id as "pointy" | "floppy" }))}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          testSample.earType === ear.id
                            ? "bg-purple-600 text-white border-purple-600"
                            : "bg-white dark:bg-[#231F46] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {ear.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sound */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500">{isAr ? "الصوت:" : "Sound:"}</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "meow", label: isAr ? "مواء (Meow) 🐱" : "Meow" },
                      { id: "woof", label: isAr ? "نباح (Woof) 🐕" : "Woof" },
                    ].map((snd) => (
                      <button
                        key={snd.id}
                        onClick={() => setTestSample((s) => ({ ...s, sound: snd.id as "meow" | "woof" }))}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          testSample.sound === snd.id
                            ? "bg-purple-600 text-white border-purple-600"
                            : "bg-white dark:bg-[#231F46] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {snd.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prediction Action */}
                <button
                  onClick={handlePredict}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-purple-500/30 hover:scale-102 active:scale-95 transition-all"
                >
                  {isAr ? "🤖 اسأل الذكاء الاصطناعي ما هذا الكائن؟" : "Ask AI to Predict"}
                </button>
              </div>

              {/* AI Inference & Training Database */}
              <div className="space-y-6">
                {/* Prediction Output Card */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-900 to-indigo-950 text-white shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300">{isAr ? "توقع الذكاء الاصطناعي:" : "AI Prediction:"}</span>
                    <span className="px-3 py-1 rounded-full bg-purple-800 text-purple-200 text-xs font-bold">
                      {isAr ? `الثقة: ${aiPrediction.confidence}%` : `Confidence: ${aiPrediction.confidence}%`}
                    </span>
                  </div>

                  <div className="text-center py-4 space-y-2">
                    <div className="text-6xl animate-bounce">
                      {aiPrediction.prediction === "cat" ? "🐱" : "🐶"}
                    </div>
                    <div className="text-2xl font-black">
                      {aiPrediction.prediction === "cat" ? (isAr ? "قطة (Cat)" : "Cat") : (isAr ? "كلب (Dog)" : "Dog")}
                    </div>
                  </div>

                  <p className="text-xs text-purple-200 bg-purple-950/60 p-3 rounded-xl border border-purple-800/50">
                    💡 {aiPrediction.reasonAr}
                  </p>
                </div>

                {/* Training Set Manager */}
                <div className="p-6 rounded-3xl bg-[#FAF8FF] dark:bg-[#141228] border border-purple-100 dark:border-purple-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                      {isAr ? `بيانات التدريب (${trainingData.length} أمثلة):` : "Training Dataset:"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {trainingData.map((t) => (
                      <span
                        key={t.id}
                        className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#231F46] border border-purple-100 dark:border-purple-800 text-xs font-bold"
                      >
                        {t.label === "cat" ? "🐱 قطة" : "🐶 كلب"} ({t.color})
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => addTrainingExample("cat")}
                      className="flex-1 py-2 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-200"
                    >
                      + {isAr ? "علّم الآلة: هذه قطة" : "Train as Cat"}
                    </button>
                    <button
                      onClick={() => addTrainingExample("dog")}
                      className="flex-1 py-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold text-xs hover:bg-indigo-200"
                    >
                      + {isAr ? "علّم الآلة: هذا كلب" : "Train as Dog"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: PROMPT ENGINEERING PLAYGROUND */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "prompt-lab" && (
          <div className="bg-white dark:bg-[#1C1A3A] p-6 sm:p-8 rounded-3xl shadow-xl border border-purple-100 dark:border-purple-900/50 space-y-8">
            <div className="border-b border-purple-50 dark:border-purple-900/30 pb-4">
              <h2 className="text-xl font-black text-purple-900 dark:text-purple-200 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                {isAr ? "مختبر هندسة الأوامر الذكية (Prompt Engineering)" : "Prompt Engineering Playground"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {isAr
                  ? "تعلم كيف تتحدث مع الذكاء الاصطناعي وتوجهه بدقة لتوليد قصص وأفكار مذهلة باتباع قاعدة: (الدور + المهمة + الأسلوب)."
                  : "Master the art of prompting: Role + Mission + Tone = Super AI Results!"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Prompt Controls */}
              <div className="space-y-4">
                {/* Role */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    {isAr ? "1. حدد دور الذكاء الاصطناعي (Role):" : "1. System Role:"}
                  </label>
                  <select
                    value={promptRole}
                    onChange={(e) => setPromptRole(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-[#FAF8FF] dark:bg-[#141228] border border-purple-200 dark:border-purple-800 font-bold text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="مستكشف فضاء عبقري">{isAr ? "👨‍🚀 مستكشف فضاء عبقري" : "Space Explorer"}</option>
                    <option value="عالم رياضيات سحري">{isAr ? "🧙‍♂️ عالم رياضيات سحري" : "Math Wizard"}</option>
                    <option value="قبطان سفينة شجاع">{isAr ? "🏴‍☠️ قبطان سفينة شجاع" : "Brave Captain"}</option>
                    <option value="مخترع روبوتات المستقبل">{isAr ? "🤖 مخترع روبوتات المستقبل" : "Robot Inventor"}</option>
                  </select>
                </div>

                {/* Mission */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    {isAr ? "2. حدد المهمة والهدف (Mission):" : "2. Mission Task:"}
                  </label>
                  <select
                    value={promptMission}
                    onChange={(e) => setPromptMission(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-[#FAF8FF] dark:bg-[#141228] border border-purple-200 dark:border-purple-800 font-bold text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="بناء محطة طاقة شمسية على المريخ">{isAr ? "🪐 بناء محطة طاقة شمسية على المريخ" : "Build Martian Solar Station"}</option>
                    <option value="حل لغز خريطة الكنز المفقود">{isAr ? "🗺️ حل لغز خريطة الكنز المفقود" : "Decode Mystery Treasure Map"}</option>
                    <option value="اختراع أسرع حاسوب ذكي في العالم">{isAr ? "💻 اختراع أسرع حاسوب ذكي في العالم" : "Invent Fastest Quantum Computer"}</option>
                  </select>
                </div>

                {/* Tone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    {isAr ? "3. أسلوب السرد (Tone):" : "3. Tone:"}
                  </label>
                  <select
                    value={promptTone}
                    onChange={(e) => setPromptTone(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-[#FAF8FF] dark:bg-[#141228] border border-purple-200 dark:border-purple-800 font-bold text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="حماس ومغامرة للأطفال">{isAr ? "🔥 حماس ومغامرة للأطفال" : "Adventure & Fun"}</option>
                    <option value="فكاهي ومضحك">{isAr ? "😂 فكاهي ومضحك" : "Humorous"}</option>
                    <option value="علمي ومشوق">{isAr ? "🔬 علمي ومشوق" : "Scientific & Intriguing"}</option>
                  </select>
                </div>

                {/* Prompt Preview */}
                <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-xs text-purple-900 dark:text-purple-200">
                  <span className="font-bold">{isAr ? "الأمر الموجه للذكاء الاصطناعي:" : "Compiled Prompt:"}</span>
                  <p className="mt-1 font-mono text-[11px] text-purple-700 dark:text-purple-300">
                    &quot;تحدث بصفتك {promptRole}، واكتب قصة قصيرة عن {promptMission}، بأسلوب {promptTone}.&quot;
                  </p>
                </div>

                <button
                  disabled={isGeneratingStory}
                  onClick={generateKidStory}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-purple-500/30 hover:scale-102 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isGeneratingStory ? (isAr ? "جاري التوليد..." : "Generating...") : (isAr ? "توليد القصة بواسطة الذكاء الاصطناعي ✨" : "Generate Story ✨")}</span>
                </button>
              </div>

              {/* Story Output */}
              <div className="p-6 rounded-3xl bg-[#FAF8FF] dark:bg-[#141228] border-2 border-purple-100 dark:border-purple-900/60 min-h-80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 border-b border-purple-100 dark:border-purple-900/40 pb-3 mb-4">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                      {isAr ? "استجابة نموذج الذكاء الاصطناعي:" : "AI Model Generation:"}
                    </span>
                  </div>

                  {aiStoryOutput ? (
                    <div className="text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line animate-fadeIn">
                      {aiStoryOutput}
                    </div>
                  ) : (
                    <div className="text-center py-20 text-slate-400 text-xs">
                      {isAr
                        ? "اختر مكونات الأمر واضغط على 'توليد القصة' لترى إبداع الذكاء الاصطناعي!"
                        : "Configure prompt and hit generate to see AI magic in action!"}
                    </div>
                  )}
                </div>

                {aiStoryOutput && (
                  <div className="pt-4 border-t border-purple-100 dark:border-purple-900/40 flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 font-bold">
                    <span>{isAr ? "✅ تم بنجاح تطبيق قواعد هندسة الأوامر" : "Prompt applied successfully"}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </ModuleLockedGate>
  );
}
