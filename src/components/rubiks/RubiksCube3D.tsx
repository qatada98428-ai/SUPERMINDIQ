"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  RotateCcw,
  Play,
  Pause,
  SkipForward,
  Compass,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  CubeState,
  FaceName,
  COLOR_HEX,
  MoveNotation,
  isCubeSolved,
} from "@/lib/rubiks/rubiks-engine";

interface RubiksCube3DProps {
  cube: CubeState;
  onMove?: (move: MoveNotation) => void;
  onReset?: () => void;
  activeAlgorithm?: string;
  className?: string;
  showControls?: boolean;
}

export default function RubiksCube3D({
  cube,
  onMove,
  onReset,
  activeAlgorithm = "",
  className = "",
  showControls = true,
}: RubiksCube3DProps) {
  // 3D Orbit Angles
  const [rotX, setRotX] = useState<number>(-24);
  const [rotY, setRotY] = useState<number>(-36);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; rotX: number; rotY: number }>({
    x: 0,
    y: 0,
    rotX: -24,
    rotY: -36,
  });

  // Algorithm Player State
  const [algoMoves, setAlgoMoves] = useState<MoveNotation[]>([]);
  const [algoStep, setAlgoStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"3d" | "flat">("3d");

  // Sync active algorithm
  useEffect(() => {
    if (!activeAlgorithm) {
      setAlgoMoves([]);
      setAlgoStep(0);
      setIsPlaying(false);
      return;
    }
    const parsed = activeAlgorithm.trim().split(/\s+/).filter(Boolean) as MoveNotation[];
    setAlgoMoves(parsed);
    setAlgoStep(0);
    setIsPlaying(false);
  }, [activeAlgorithm]);

  // Handle Play/Pause
  useEffect(() => {
    if (!isPlaying) return;
    if (algoStep >= algoMoves.length) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      const nextMove = algoMoves[algoStep];
      onMove?.(nextMove);
      setAlgoStep((prev) => prev + 1);
    }, 700);

    return () => clearTimeout(timer);
  }, [isPlaying, algoStep, algoMoves, onMove]);

  // Touch and Mouse Orbit Controls
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotX,
      rotY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    // Rotate with smooth sensitivity
    setRotY(dragStartRef.current.rotY + dx * 0.65);
    setRotX(Math.max(-85, Math.min(85, dragStartRef.current.rotX - dy * 0.65)));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const setAnglePreset = (preset: "iso" | "front" | "top" | "right") => {
    if (preset === "iso") {
      setRotX(-24);
      setRotY(-36);
    } else if (preset === "front") {
      setRotX(0);
      setRotY(0);
    } else if (preset === "top") {
      setRotX(-85);
      setRotY(0);
    } else if (preset === "right") {
      setRotX(0);
      setRotY(-90);
    }
  };

  const executeMove = (m: MoveNotation) => {
    onMove?.(m);
  };

  const stepNextAlgo = () => {
    if (algoStep < algoMoves.length) {
      const m = algoMoves[algoStep];
      onMove?.(m);
      setAlgoStep((prev) => prev + 1);
    }
  };

  const solved = isCubeSolved(cube);

  // Render a 3x3 face with tactile 3D competition cubie tiles
  const renderFaceGrid = (faceName: FaceName) => {
    const faceColors = cube[faceName];
    return (
      <div className="grid grid-cols-3 grid-rows-3 gap-2 p-2 w-full h-full bg-[#111018] rounded-3xl shadow-[0_12px_28px_rgba(0,0,0,0.65),inset_0_2px_4px_rgba(255,255,255,0.2)] border-2 border-black/90 select-none">
        {faceColors.map((color, idx) => (
          <div
            key={idx}
            className="w-full h-full rounded-[9px] shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),inset_0_-2px_4px_rgba(0,0,0,0.35),0_2px_4px_rgba(0,0,0,0.4)] border border-black/30 transition-colors duration-200"
            style={{ backgroundColor: COLOR_HEX[color] }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={`clay-card !p-4 sm:!p-6 flex flex-col items-center justify-between gap-5 ${className}`}>
      {/* Top Header / View Switcher & Solved Badge */}
      <div className="w-full flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === "3d" ? "flat" : "3d")}
            className="clay-pill px-3 py-1.5 text-xs font-black text-brand-700 dark:text-brand-300 flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{viewMode === "3d" ? "عرض المخطط المسطح" : "عرض ثلاثي الأبعاد 3D"}</span>
          </button>

          <button
            type="button"
            onClick={() => setAnglePreset("iso")}
            className="clay-pill px-2.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1"
            title="إعادة توجيه زاوية الرؤية"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">منظور أصلي</span>
          </button>
        </div>

        <div>
          {solved ? (
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white shadow-md flex items-center gap-1.5 animate-bounce">
              <Sparkles className="w-3.5 h-3.5" />
              <span>محلول بالكامل! 🎉</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/60">
              قيد التدريب والتحدي 🧊
            </span>
          )}
        </div>
      </div>

      {/* Main 3D Canvas / Flat View */}
      {viewMode === "3d" ? (
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="relative w-full h-[280px] sm:h-[340px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none touch-none py-6"
          style={{ perspective: "1000px" }}
        >
          {/* Subtle 3D Depth Floor Glow */}
          <div className="absolute w-56 h-56 rounded-full bg-brand-500/15 dark:bg-brand-500/25 blur-3xl pointer-events-none" />

          {/* Physical Ground Floor Shadow */}
          <div
            className="absolute w-44 h-16 rounded-[50%] bg-black/40 dark:bg-black/70 blur-xl pointer-events-none"
            style={{
              transform: "translateY(115px) rotateX(80deg)",
              transformOrigin: "center",
            }}
          />

          {/* Interactive CSS 3D Cube Container */}
          <div
            className="relative w-[180px] h-[180px] transition-transform duration-75 ease-out"
            style={{
              transformStyle: "preserve-3d",
              WebkitTransformStyle: "preserve-3d",
              transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
            }}
          >
            {/* Front Face (F - Green) */}
            <div
              className="absolute inset-0"
              style={{
                transform: "translateZ(90px)",
                transformOrigin: "center",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                filter: "brightness(0.98)",
              }}
            >
              {renderFaceGrid("F")}
            </div>

            {/* Back Face (B - Blue) */}
            <div
              className="absolute inset-0"
              style={{
                transform: "rotateY(180deg) translateZ(90px)",
                transformOrigin: "center",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                filter: "brightness(0.80)",
              }}
            >
              {renderFaceGrid("B")}
            </div>

            {/* Top Face (U - Yellow) */}
            <div
              className="absolute inset-0"
              style={{
                transform: "rotateX(90deg) translateZ(90px)",
                transformOrigin: "center",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                filter: "brightness(1.18)",
              }}
            >
              {renderFaceGrid("U")}
            </div>

            {/* Bottom Face (D - White) */}
            <div
              className="absolute inset-0"
              style={{
                transform: "rotateX(-90deg) translateZ(90px)",
                transformOrigin: "center",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                filter: "brightness(0.68)",
              }}
            >
              {renderFaceGrid("D")}
            </div>

            {/* Right Face (R - Red) */}
            <div
              className="absolute inset-0"
              style={{
                transform: "rotateY(90deg) translateZ(90px)",
                transformOrigin: "center",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                filter: "brightness(0.88)",
              }}
            >
              {renderFaceGrid("R")}
            </div>

            {/* Left Face (L - Orange) */}
            <div
              className="absolute inset-0"
              style={{
                transform: "rotateY(-90deg) translateZ(90px)",
                transformOrigin: "center",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                filter: "brightness(0.92)",
              }}
            >
              {renderFaceGrid("L")}
            </div>
          </div>

          <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-black/60 px-3.5 py-1 rounded-full backdrop-blur-sm border border-black/10 dark:border-white/10 shadow-sm">
              اسحب للتدوير الحر في الفضاء ثلاثي الأبعاد 3D 🔄
            </span>
          </div>
        </div>
      ) : (
        /* Flat Unfolded 2D Cube Net View */
        <div className="w-full py-4 flex flex-col items-center justify-center gap-1 select-none overflow-x-auto">
          {/* Top: U Face */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 mb-1">
            <div className="text-[10px] font-bold text-center text-slate-600 dark:text-slate-300 mb-0.5">العلوي U (أصفر)</div>
            {renderFaceGrid("U")}
          </div>

          {/* Middle Row: L, F, R, B Faces */}
          <div className="flex items-center gap-1">
            <div className="w-24 h-24 sm:w-28 sm:h-28">
              <div className="text-[10px] font-bold text-center text-slate-600 dark:text-slate-300 mb-0.5">يسار L (برتقالي)</div>
              {renderFaceGrid("L")}
            </div>
            <div className="w-24 h-24 sm:w-28 sm:h-28">
              <div className="text-[10px] font-bold text-center text-slate-600 dark:text-slate-300 mb-0.5">أمام F (أخضر)</div>
              {renderFaceGrid("F")}
            </div>
            <div className="w-24 h-24 sm:w-28 sm:h-28">
              <div className="text-[10px] font-bold text-center text-slate-600 dark:text-slate-300 mb-0.5">يمين R (أحمر)</div>
              {renderFaceGrid("R")}
            </div>
            <div className="w-24 h-24 sm:w-28 sm:h-28">
              <div className="text-[10px] font-bold text-center text-slate-600 dark:text-slate-300 mb-0.5">خلف B (أزرق)</div>
              {renderFaceGrid("B")}
            </div>
          </div>

          {/* Bottom: D Face */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 mt-1">
            <div className="text-[10px] font-bold text-center text-slate-600 dark:text-slate-300 mb-0.5">السفلي D (أبيض)</div>
            {renderFaceGrid("D")}
          </div>
        </div>
      )}

      {/* Algorithm Step-by-Step Player (If Active Algorithm Loaded) */}
      {algoMoves.length > 0 && (
        <div className="w-full p-3 sm:p-4 rounded-2xl bg-[#F6F4FE] dark:bg-[#14122B] border border-brand-200 dark:border-brand-800/60 space-y-3">
          <div className="flex items-center justify-between text-xs font-black">
            <span className="text-brand-700 dark:text-brand-300">
              مشغل الخوارزمية ({algoStep}/{algoMoves.length})
            </span>
            <span className="font-mono text-slate-700 dark:text-slate-200">
              {algoMoves.map((m, idx) => (
                <span
                  key={idx}
                  className={`px-1.5 py-0.5 rounded ${
                    idx === algoStep
                      ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                      : idx < algoStep
                      ? "text-slate-600 dark:text-slate-300 line-through"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {m}
                </span>
              ))}
            </span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                onReset?.();
                setAlgoStep(0);
                setIsPlaying(false);
              }}
              className="clay-pill px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة للبداية</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="clay-btn-purple px-4 py-1.5 text-xs font-black flex items-center gap-1.5 !rounded-xl"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? "إيقاف مؤقت" : "تشغيل تلقائي"}</span>
            </button>

            <button
              type="button"
              onClick={stepNextAlgo}
              disabled={algoStep >= algoMoves.length}
              className="clay-pill px-3 py-1.5 text-xs font-bold text-brand-700 dark:text-brand-300 flex items-center gap-1 disabled:opacity-40"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>الحركة التالية</span>
            </button>
          </div>
        </div>
      )}

      {/* Manual Face Turn Controls Pad */}
      {showControls && (
        <div className="w-full space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-black text-slate-700 dark:text-slate-300">
            <span>لوحة الحركات اليدوية (Rotation Pad):</span>
            <button
              type="button"
              onClick={onReset}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-bold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>تصفير المكعب</span>
            </button>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-6 gap-1.5">
            {(["R", "R'", "U", "U'", "F", "F'"] as MoveNotation[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => executeMove(m)}
                className="py-2 rounded-xl bg-white dark:bg-[#1E1B3E] hover:bg-brand-50 dark:hover:bg-brand-900/40 text-xs font-black font-mono text-brand-800 dark:text-brand-200 border border-brand-200/70 dark:border-brand-800/70 shadow-sm active:scale-95 transition-all text-center"
              >
                {m}
              </button>
            ))}
            {(["L", "L'", "D", "D'", "B", "B'"] as MoveNotation[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => executeMove(m)}
                className="py-2 rounded-xl bg-white dark:bg-[#1E1B3E] hover:bg-brand-50 dark:hover:bg-brand-900/40 text-xs font-black font-mono text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 shadow-sm active:scale-95 transition-all text-center"
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
