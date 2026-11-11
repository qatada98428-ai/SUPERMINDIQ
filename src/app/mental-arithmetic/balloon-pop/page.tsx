"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Settings,
  Play,
  Trophy,
  RefreshCw,
  Star,
  Zap,
  Home,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  generateFlashAnzanSeries,
  playSoundEffect,
  ArithmeticLevel,
  FlashAnzanConfig,
  isSimpleAddition,
  isSimpleSubtraction,
} from "@/lib/soroban-engine";

// ============================================================
// TYPES
// ============================================================
type VoiceMode = "arabic" | "english" | "off";
type GamePhase = "settings" | "countdown" | "flash" | "balloons" | "result" | "summary";

interface GameConfig {
  level: ArithmeticLevel;
  targetRules: number[];
  digitsCount: number;        // 1=آحاد, 2=عشرات, 3=مئات
  allowSubtraction: boolean;
  numberCount: number;        // how many numbers to flash
  flashSpeed: number;         // ms per number
  balloonCount: number;       // total balloons shown
  maxWrongPops: number;       // -1 = unlimited
  teamCount: number;
  teams: Team[];
  totalRounds: number;
  voiceMode: VoiceMode;
}

interface Balloon {
  id: string;
  value: number;
  x: number;
  color: string;
  size: number;
  speed: number;
  delay: number;
  swayOffset: number;
  state: "flying" | "popped-correct" | "popped-wrong" | "escaped";
}

interface Team {
  name: string;
  color: string;
  emoji: string;
  score: number;
}

interface Question {
  numbers: number[];
  answer: number;
  display: string;
}

interface RoundResult {
  question: string;
  answer: number;
  correct: boolean;
  wrongAttempts: number;
  teamName: string;
  teamColor: string;
}

// ============================================================
// CONSTANTS
// ============================================================
const BALLOON_COLORS = [
  { bg: "#ef4444", glow: "#fca5a5", dark: "#b91c1c" },
  { bg: "#3b82f6", glow: "#93c5fd", dark: "#1d4ed8" },
  { bg: "#22c55e", glow: "#86efac", dark: "#15803d" },
  { bg: "#f59e0b", glow: "#fcd34d", dark: "#b45309" },
  { bg: "#a855f7", glow: "#d8b4fe", dark: "#7e22ce" },
  { bg: "#ec4899", glow: "#f9a8d4", dark: "#be185d" },
  { bg: "#14b8a6", glow: "#5eead4", dark: "#0f766e" },
  { bg: "#f97316", glow: "#fdba74", dark: "#c2410c" },
  { bg: "#6366f1", glow: "#a5b4fc", dark: "#4338ca" },
  { bg: "#84cc16", glow: "#bef264", dark: "#4d7c0f" },
];

const TEAM_PRESETS: Team[] = [
  { name: "الفريق الأحمر",  color: "#ef4444", emoji: "🔴", score: 0 },
  { name: "الفريق الأزرق",  color: "#3b82f6", emoji: "🔵", score: 0 },
  { name: "الفريق الأخضر", color: "#22c55e", emoji: "🟢", score: 0 },
  { name: "الفريق الأصفر", color: "#eab308", emoji: "🟡", score: 0 },
];

const SPEED_OPTIONS = [
  { label: "1.5 ث", value: 1500 },
  { label: "1.2 ث", value: 1200 },
  { label: "1.0 ث", value: 1000 },
  { label: "0.8 ث", value: 800 },
  { label: "0.6 ث", value: 600 },
  { label: "0.4 ث", value: 400 },
  { label: "0.3 ث", value: 300 },
  { label: "0.2 ث", value: 200 },
  { label: "0.15 ث", value: 150 },
];

// ============================================================
// VOICE HELPERS
// ============================================================
const ARABIC_DIGITS: Record<number, string> = {
  0: "صفر", 1: "واحد", 2: "اثنان", 3: "ثلاثة", 4: "أربعة",
  5: "خمسة", 6: "ستة", 7: "سبعة", 8: "ثمانية", 9: "تسعة",
  10: "عشرة", 11: "أحد عشر", 12: "اثنا عشر", 13: "ثلاثة عشر",
  14: "أربعة عشر", 15: "خمسة عشر", 16: "ستة عشر", 17: "سبعة عشر",
  18: "ثمانية عشر", 19: "تسعة عشر", 20: "عشرون",
};
const ENGLISH_DIGITS: Record<number, string> = {
  0: "Zero", 1: "One", 2: "Two", 3: "Three", 4: "Four",
  5: "Five", 6: "Six", 7: "Seven", 8: "Eight", 9: "Nine",
  10: "Ten", 11: "Eleven", 12: "Twelve", 13: "Thirteen",
  14: "Fourteen", 15: "Fifteen", 16: "Sixteen", 17: "Seventeen",
  18: "Eighteen", 19: "Nineteen", 20: "Twenty",
};

function speakNumber(num: number, voiceMode: VoiceMode) {
  if (voiceMode === "off" || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const isNeg = num < 0;
  const abs = Math.abs(num);
  let text: string;
  if (voiceMode === "arabic") {
    const word = ARABIC_DIGITS[abs] ?? abs.toString();
    text = isNeg ? `ناقص ${word}` : word;
  } else {
    const word = ENGLISH_DIGITS[abs] ?? abs.toString();
    text = isNeg ? `Minus ${word}` : word;
  }
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = voiceMode === "arabic" ? "ar-SA" : "en-US";
  utt.rate = 1.65;
  utt.pitch = 1.1;
  window.speechSynthesis.speak(utt);
}

function speakCountdown(count: number, voiceMode: VoiceMode) {
  if (voiceMode === "off" || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  let text: string;
  if (count === 0) {
    text = voiceMode === "arabic" ? "ابدأ" : "Go";
  } else {
    text = voiceMode === "arabic"
      ? (ARABIC_DIGITS[count] ?? count.toString())
      : (ENGLISH_DIGITS[count] ?? count.toString());
  }
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = voiceMode === "arabic" ? "ar-SA" : "en-US";
  utt.rate = 1.2;
  utt.pitch = 1.2;
  window.speechSynthesis.speak(utt);
}

// ============================================================
// QUESTION GENERATOR
// ============================================================

/**
 * بسيط (Simple): حركات مباشرة بدون أي تكملة.
 * - الوحدات: لا تحتاج خرزة الخمسة (مركب 5) ولا حمل للعمود التالي (مركب 10)
 * - نبدأ بأرقام آمنة (خانة الآحاد 1-3 أو 5-7) لضمان وجود حركات مباشرة
 */
function generateSimpleSeries(
  termsCount: number,
  digitsCount: number,
  allowSubtraction: boolean
): number[] {
  // خانات آحاد آمنة: 1,2,3 أسفل الخمسة / 5,6,7 فوقها — كل منها يوفر حركات بسيطة
  const safeUnits = [1, 2, 3, 5, 6, 7];

  for (let attempt = 0; attempt < 150; attempt++) {
    const startU = safeUnits[Math.floor(Math.random() * safeUnits.length)];

    // بناء الرقم الأول حسب عدد الخانات المطلوب
    let startNum = startU;
    if (digitsCount >= 2) {
      startNum += (Math.floor(Math.random() * 9) + 1) * 10;   // عشرات 10-90
    }
    if (digitsCount >= 3) {
      startNum += (Math.floor(Math.random() * 9) + 1) * 100;  // مئات 100-900
    }

    const series: number[] = [startNum];
    let running = startNum;
    let failed = false;

    for (let step = 1; step < termsCount; step++) {
      const u = running % 10; // خانة الآحاد فقط هي التي تحكم القاعدة
      const candidates: number[] = [];

      for (let d = 1; d <= 9; d++) {
        if (isSimpleAddition(u, d)) {
          // للأرقام متعددة الخانات: أضف مكوّن عشرات/مئات بسيط
          const delta = buildDelta(d, running, digitsCount, false);
          if (delta !== null) candidates.push(delta);
        }
        if (allowSubtraction && isSimpleSubtraction(u, d) && running - d >= 0) {
          const delta = buildDelta(d, running, digitsCount, true);
          if (delta !== null) candidates.push(delta);
        }
      }

      if (candidates.length === 0) { failed = true; break; }

      const move = candidates[Math.floor(Math.random() * candidates.length)];
      series.push(move);
      running += move;
    }

    if (!failed && running >= 0) return series;
  }

  // Fallback آمن مطلق: 2+1+1+...
  return [2, ...Array(termsCount - 1).fill(1)];
}

/**
 * يبني قيمة الحركة الكاملة (آحاد + عشرات/مئات) بحيث تظل الآحاد بسيطة
 */
function buildDelta(
  unitsDelta: number,
  running: number,
  digitsCount: number,
  isNeg: boolean
): number | null {
  if (digitsCount === 1) {
    const val = isNeg ? -unitsDelta : unitsDelta;
    if (isNeg && running + val < 0) return null;
    return val;
  }

  // للعشرات والمئات: أضف مكوّن أعلى عشوائياً صغيراً (0-3 × 10 أو 0-3 × 100)
  const highUnit = Math.pow(10, digitsCount - 1);
  const maxHigh = Math.floor(Math.random() * 3); // 0 أو 1 أو 2
  const high = maxHigh * highUnit;

  const val = isNeg ? -(unitsDelta + high) : (unitsDelta + high);
  if (isNeg && running + val < 0) {
    // جرّب بدون مكوّن عالٍ
    const fallbackVal = isNeg ? -unitsDelta : unitsDelta;
    return running + fallbackVal >= 0 ? fallbackVal : null;
  }
  return val;
}

function generateQuestion(config: GameConfig): Question {
  let series: number[];

  if (config.level === "simple") {
    // البسيط: نستخدم generator خاص يضمن الحركات المباشرة فقط
    series = generateSimpleSeries(
      config.numberCount,
      config.digitsCount,
      config.allowSubtraction
    );
  } else {
    // مركب 5 ومركب 10 والعام: نستخدم محرك السوروبان مباشرة
    const sorobanConfig: FlashAnzanConfig = {
      termsCount: config.numberCount,
      digitsCount: config.digitsCount,
      showDelayMs: 0,
      clearDelayMs: 0,
      allowSubtraction: config.allowSubtraction,
      allowNegativeTotal: false,
      level: config.level,
      targetRules: config.targetRules.length > 0 ? config.targetRules : undefined,
      numeralSystem: "western",
    };
    series = generateFlashAnzanSeries(sorobanConfig);
  }

  const answer = series.reduce((s, n) => s + n, 0);
  const display = series
    .map((n, i) => (i === 0 ? `${n}` : n >= 0 ? `+ ${n}` : `− ${Math.abs(n)}`))
    .join("  ");

  return { numbers: series, answer, display };
}

function generateBalloons(correct: number, count: number): Balloon[] {
  const values = new Set<number>([correct]);
  let attempts = 0;
  while (values.size < count && attempts < 300) {
    attempts++;
    const spread = Math.max(Math.abs(correct) * 2, 20);
    const offset = Math.floor(Math.random() * spread) - Math.floor(spread / 2);
    const v = correct + offset;
    if (v >= 0 && v !== correct) values.add(v);
  }
  let extra = 1;
  while (values.size < count) {
    if (!values.has(correct + extra)) values.add(correct + extra);
    if (correct - extra >= 0 && !values.has(correct - extra)) values.add(correct - extra);
    extra++;
  }

  const arr = Array.from(values).sort(() => Math.random() - 0.5);
  const cols = arr.length;
  return arr.map((val, i) => {
    const colWidth = 85 / cols;
    const x = 5 + colWidth * i + Math.random() * (colWidth * 0.6);
    return {
      id: `b-${i}-${Date.now()}`,
      value: val,
      x,
      color: BALLOON_COLORS[i % BALLOON_COLORS.length].bg,
      size: 76 + Math.floor(Math.random() * 24),
      speed: 8 + Math.random() * 6,
      delay: i * 0.15 + Math.random() * 0.3,
      swayOffset: Math.random() > 0.5 ? 1 : -1,
      state: "flying" as const,
    };
  });
}

// ============================================================
// SPARKLE BURST COMPONENT
// ============================================================
function SparklesBurst({ color = "#fbbf24", count = 16 }: { color?: string; count?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: count }).map((_, i) => {
        const angle = (360 / count) * i + Math.random() * 20;
        const dist = 50 + Math.random() * 50;
        const tx = Math.cos((angle * Math.PI) / 180) * dist;
        const ty = Math.sin((angle * Math.PI) / 180) * dist;
        const size = 6 + Math.random() * 8;
        return (
          <div
            key={i}
            className="absolute rounded-full left-1/2 top-1/2"
            style={{
              width: size,
              height: size,
              backgroundColor: color,
              ["--tx" as string]: `${tx}px`,
              ["--ty" as string]: `${ty}px`,
              animation: `burst 0.65s ease-out ${Math.random() * 0.1}s forwards`,
              transform: "translate(-50%, -50%)",
              opacity: 0,
            }}
          />
        );
      })}
    </div>
  );
}

// ============================================================
// BALLOON COMPONENT
// ============================================================
function BalloonItem({
  balloon,
  onPop,
  disabled,
  wrongPopsLeft,
}: {
  balloon: Balloon;
  onPop: (id: string, value: number) => void;
  disabled: boolean;
  wrongPopsLeft: number;
}) {
  const colorEntry = BALLOON_COLORS.find((c) => c.bg === balloon.color) ?? BALLOON_COLORS[0];
  const isFlying = balloon.state === "flying";
  const isCorrect = balloon.state === "popped-correct";
  const isWrong = balloon.state === "popped-wrong";
  const canPop = isFlying && !disabled;

  return (
    <div
      className="absolute select-none"
      style={{
        left: `${balloon.x}%`,
        bottom: 0,
        animation: isFlying
          ? `rise ${balloon.speed}s linear ${balloon.delay}s both`
          : "none",
      }}
    >
      {/* Balloon body */}
      {isFlying && (
        <button
          onClick={() => canPop && onPop(balloon.id, balloon.value)}
          disabled={!canPop}
          className="relative flex flex-col items-center focus:outline-none group"
          style={{ cursor: canPop ? "pointer" : "default" }}
        >
          <div
            className="relative flex items-center justify-center transition-transform duration-100"
            style={{ width: balloon.size, height: balloon.size * 1.25 }}
          >
            <svg
              viewBox="0 0 100 130"
              className="absolute inset-0 w-full h-full drop-shadow-lg"
              style={{
                filter: canPop ? `drop-shadow(0 0 12px ${colorEntry.bg}99)` : undefined,
                transition: "filter 0.2s",
              }}
            >
              <ellipse cx="50" cy="55" rx="44" ry="52" fill={colorEntry.bg} />
              <ellipse cx="37" cy="32" rx="12" ry="8" fill="white" opacity="0.25" />
              <polygon points="50,105 46,112 54,112" fill={colorEntry.dark} />
              <path d="M 50 112 Q 45 120 50 128" stroke={colorEntry.dark} strokeWidth="2" fill="none" />
            </svg>
            <span
              className="relative z-10 font-black tabular-nums leading-none"
              style={{
                fontSize: balloon.size > 88 ? "1.35rem" : "1.05rem",
                color: "white",
                textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                marginTop: "-10px",
              }}
            >
              {balloon.value}
            </span>
          </div>
          {canPop && (
            <div
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: `${colorEntry.bg}22`, borderRadius: "50%", border: `2px solid ${colorEntry.bg}66` }}
            />
          )}
        </button>
      )}

      {isCorrect && (
        <div
          className="relative flex items-center justify-center"
          style={{ width: balloon.size + 30, height: balloon.size + 30 }}
        >
          <div
            className="rounded-full flex items-center justify-center text-4xl"
            style={{ width: balloon.size + 30, height: balloon.size + 30, animation: "popCorrect 0.6s ease-out forwards" }}
          >
            ✅
          </div>
          <SparklesBurst color="#34d399" count={20} />
          <SparklesBurst color="#fbbf24" count={12} />
        </div>
      )}

      {isWrong && (
        <div
          className="relative flex items-center justify-center"
          style={{ width: balloon.size, height: balloon.size }}
        >
          <div
            className="rounded-full flex items-center justify-center text-3xl"
            style={{ width: balloon.size, height: balloon.size, animation: "popWrong 0.5s ease-out forwards" }}
          >
            💥
          </div>
          <SparklesBurst color="#f43f5e" count={10} />
          {wrongPopsLeft >= 0 && wrongPopsLeft < 3 && (
            <div
              className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-black text-rose-300 whitespace-nowrap"
              style={{ animation: "floatUp 1s ease-out forwards" }}
            >
              {wrongPopsLeft === 0 ? "لا محاولات!" : `${wrongPopsLeft} محاولة متبقية`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// COUNTDOWN SCREEN (pre-game)
// ============================================================
function CountdownScreen({ voiceMode, onDone }: { voiceMode: VoiceMode; onDone: () => void }) {
  const [count, setCount] = useState(3);
  const [showGo, setShowGo] = useState(false);

  useEffect(() => {
    playSoundEffect("beep");
    speakCountdown(3, voiceMode);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (showGo) {
      const t = setTimeout(() => onDone(), 800);
      return () => clearTimeout(t);
    }
    if (count <= 0) return;

    const t = setTimeout(() => {
      const next = count - 1;
      if (next === 0) {
        setShowGo(true);
        playSoundEffect("correct");
        speakCountdown(0, voiceMode);
      } else {
        setCount(next);
        playSoundEffect("beep");
        speakCountdown(next, voiceMode);
      }
    }, 900);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, showGo]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%)",
      }}
    >
      {/* Animated rings */}
      <div
        className="absolute rounded-full border-4 border-white/20"
        style={{
          width: 320, height: 320,
          animation: "ping 1s cubic-bezier(0,0,0.2,1) infinite",
        }}
      />
      <div
        className="absolute rounded-full border-4 border-white/10"
        style={{
          width: 420, height: 420,
          animation: "ping 1s cubic-bezier(0,0,0.2,1) infinite 0.3s",
        }}
      />

      {showGo ? (
        <div
          key="go"
          className="text-white font-black text-center"
          style={{
            fontSize: "clamp(5rem, 25vw, 12rem)",
            textShadow: "0 0 60px rgba(255,255,255,0.8), 0 4px 20px rgba(0,0,0,0.3)",
            animation: "popCorrect 0.5s ease-out forwards",
          }}
        >
          ابدأ!
        </div>
      ) : (
        <div
          key={count}
          className="text-white font-black"
          style={{
            fontSize: "clamp(8rem, 35vw, 16rem)",
            textShadow: "0 0 80px rgba(255,255,255,0.7), 0 4px 20px rgba(0,0,0,0.3)",
            lineHeight: 1,
            animation: "countPop 0.4s ease-out forwards",
          }}
        >
          {count}
        </div>
      )}

      <p className="text-white/60 font-bold text-lg mt-6">
        {showGo ? "🎈 اصطد البالونة الصحيحة!" : "استعد..."}
      </p>
    </div>
  );
}

// ============================================================
// FLASH DISPLAY
// ============================================================
function FlashDisplay({
  numbers,
  speed,
  voiceMode,
  onDone,
}: {
  numbers: number[];
  speed: number;
  voiceMode: VoiceMode;
  onDone: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (idx >= numbers.length) {
      onDoneRef.current();
      return;
    }
    setVisible(true);
    speakNumber(numbers[idx], voiceMode);
    const hide = setTimeout(() => setVisible(false), speed * 0.75);
    const next = setTimeout(() => setIdx((i) => i + 1), speed);
    return () => { clearTimeout(hide); clearTimeout(next); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, speed]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
      {/* Progress dots */}
      <div className="flex gap-2">
        {numbers.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-200"
            style={{
              width: 10, height: 10,
              background: i < idx ? "#34d399" : i === idx ? "white" : "rgba(255,255,255,0.2)",
              transform: i === idx ? "scale(1.4)" : "scale(1)",
            }}
          />
        ))}
      </div>

      {idx < numbers.length ? (
        <div
          key={idx}
          className="font-black tabular-nums text-white transition-all duration-75"
          style={{
            fontSize: "clamp(5rem, 20vw, 11rem)",
            textShadow: "0 0 60px rgba(255,255,255,0.6)",
            opacity: visible ? 1 : 0,
            transform: visible ? "scale(1)" : "scale(0.7)",
          }}
        >
          {numbers[idx]}
        </div>
      ) : null}

      <div className="text-white/40 text-sm font-bold">
        {idx < numbers.length ? `${idx + 1} / ${numbers.length}` : ""}
      </div>
    </div>
  );
}

// ============================================================
// SETTINGS SCREEN
// ============================================================
function SettingsScreen({ onStart }: { onStart: (cfg: GameConfig) => void }) {
  const [level, setLevel] = useState<ArithmeticLevel>("simple");
  const [targetRules, setTargetRules] = useState<number[]>([]);
  const [digitsCount, setDigitsCount] = useState(1);
  const [allowSubtraction, setAllowSubtraction] = useState(false);
  const [numberCount, setNumberCount] = useState(3);
  const [flashSpeed, setFlashSpeed] = useState(600);
  const [balloonCount, setBalloonCount] = useState(8);
  const [maxWrongPops, setMaxWrongPops] = useState(-1);
  const [teamCount, setTeamCount] = useState(1);
  const [totalRounds, setTotalRounds] = useState(5);
  const [teams, setTeams] = useState<Team[]>(TEAM_PRESETS.map((t) => ({ ...t, score: 0 })));
  const [voiceMode, setVoiceMode] = useState<VoiceMode>("arabic");

  const updateTeamName = (i: number, name: string) =>
    setTeams((prev) => prev.map((t, j) => (j === i ? { ...t, name } : t)));

  const toggleRule = (r: number) => {
    setTargetRules((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  };

  const handleLevelChange = (l: ArithmeticLevel) => {
    setLevel(l);
    setTargetRules([]);
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-3">
      <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block">
        {title}
      </label>
      {children}
    </div>
  );

  const OptionBtn = ({
    active,
    onClick,
    children,
    color = "brand",
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
    color?: string;
  }) => {
    const activeClasses: Record<string, string> = {
      brand: "bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20",
      green: "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20",
      amber: "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-400/20",
      indigo: "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20",
      violet: "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/20",
      rose: "bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-500/20",
      orange: "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-400/20",
    };
    return (
      <button
        onClick={onClick}
        className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all border ${
          active
            ? activeClasses[color] ?? activeClasses.brand
            : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400"
        }`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="min-h-[90vh] flex items-start justify-center py-8 px-4">
      <div className="max-w-2xl w-full space-y-5">
        {/* Header */}
        <div className="text-center space-y-1.5 pb-2">
          <div className="text-5xl">🎈</div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">لعبة صيد البالونات</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">اضبط الإعدادات ثم ابدأ!</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">

          {/* ── مستوى التمرين ── */}
          <div className="p-5 space-y-4">
            <Section title="📐 مستوى التمرين">
              <div className="grid grid-cols-2 gap-2">
                <OptionBtn active={level === "simple"} onClick={() => handleLevelChange("simple")} color="green">
                  <div>✅ بسيط</div>
                  <div className="text-[10px] opacity-70 font-normal mt-0.5">بدون تكملة</div>
                </OptionBtn>
                <OptionBtn active={level === "complex_5"} onClick={() => handleLevelChange("complex_5")} color="green">
                  <div>5️⃣ مركب خمسة</div>
                  <div className="text-[10px] opacity-70 font-normal mt-0.5">تكملة الخمسة</div>
                </OptionBtn>
                <OptionBtn active={level === "complex_10"} onClick={() => handleLevelChange("complex_10")} color="green">
                  <div>🔟 مركب عشرة</div>
                  <div className="text-[10px] opacity-70 font-normal mt-0.5">تكملة العشرة</div>
                </OptionBtn>
                <OptionBtn active={level === "general"} onClick={() => handleLevelChange("general")} color="green">
                  <div>🎲 تدريب عام</div>
                  <div className="text-[10px] opacity-70 font-normal mt-0.5">كل الأنماط</div>
                </OptionBtn>
              </div>
            </Section>

            {/* Target Rules for complex_5 */}
            {level === "complex_5" && (
              <Section title="🎯 قواعد مركب خمسة (اختر واحدة أو أكثر)">
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4].map((r) => (
                    <button
                      key={r}
                      onClick={() => toggleRule(r)}
                      className={`px-3 py-2 rounded-xl text-xs font-black transition-all border ${
                        targetRules.includes(r)
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      ±{r}
                    </button>
                  ))}
                  <span className="text-xs text-slate-400 self-center">
                    {targetRules.length === 0 ? "(الكل)" : `المحدد: ${targetRules.map((r) => `±${r}`).join(", ")}`}
                  </span>
                </div>
              </Section>
            )}

            {/* Target Rules for complex_10 */}
            {level === "complex_10" && (
              <Section title="🎯 قواعد مركب عشرة (اختر واحدة أو أكثر)">
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((r) => (
                    <button
                      key={r}
                      onClick={() => toggleRule(r)}
                      className={`px-3 py-2 rounded-xl text-xs font-black transition-all border ${
                        targetRules.includes(r)
                          ? "bg-blue-600 text-white border-blue-600 shadow-md"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      ±{r}
                    </button>
                  ))}
                  <span className="text-xs text-slate-400 self-center">
                    {targetRules.length === 0 ? "(الكل)" : `المحدد: ${targetRules.map((r) => `±${r}`).join(", ")}`}
                  </span>
                </div>
              </Section>
            )}

            {/* Digits / خانات */}
            <Section title="🔢 عدد الخانات">
              <div className="flex gap-2">
                <OptionBtn active={digitsCount === 1} onClick={() => setDigitsCount(1)} color="indigo">
                  <div>آحاد</div>
                  <div className="text-[10px] opacity-70">1-9</div>
                </OptionBtn>
                <OptionBtn active={digitsCount === 2} onClick={() => setDigitsCount(2)} color="indigo">
                  <div>عشرات</div>
                  <div className="text-[10px] opacity-70">10-99</div>
                </OptionBtn>
                <OptionBtn active={digitsCount === 3} onClick={() => setDigitsCount(3)} color="indigo">
                  <div>مئات</div>
                  <div className="text-[10px] opacity-70">100-999</div>
                </OptionBtn>
              </div>
            </Section>

            {/* Subtraction */}
            <Section title="➕➖ نوع العمليات">
              <div className="flex gap-2">
                <OptionBtn active={!allowSubtraction} onClick={() => setAllowSubtraction(false)} color="brand">
                  ➕ جمع فقط
                </OptionBtn>
                <OptionBtn active={allowSubtraction} onClick={() => setAllowSubtraction(true)} color="brand">
                  🔀 جمع وطرح
                </OptionBtn>
              </div>
            </Section>

            {/* Number count */}
            <Section title={`🔢 عدد الأرقام: ${numberCount}`}>
              <div className="flex gap-2">
                {[2, 3, 4, 5, 6, 7].map((n) => (
                  <OptionBtn key={n} active={numberCount === n} onClick={() => setNumberCount(n)} color="violet">
                    {n}
                  </OptionBtn>
                ))}
              </div>
            </Section>
          </div>

          {/* ── سرعة الفلاش ── */}
          <div className="p-5 space-y-3">
            <Section title="⚡ سرعة الفلاش">
              <div className="flex flex-wrap gap-2">
                {SPEED_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setFlashSpeed(s.value)}
                    className={`px-3 py-2 rounded-xl text-xs font-black transition-all border ${
                      flashSpeed === s.value
                        ? "bg-amber-500 text-white border-amber-500 shadow-md"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400"
                    }`}
                  >
                    {s.label}
                    {s.value <= 300 ? " 🚀" : s.value >= 1200 ? " 🐢" : ""}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400">
                السرعة الحالية: <span className="font-black text-amber-500">{flashSpeed} مللي ثانية</span> لكل رقم
              </p>
            </Section>
          </div>

          {/* ── الصوت ── */}
          <div className="p-5 space-y-3">
            <Section title="🔊 الصوت">
              <div className="flex gap-2">
                <OptionBtn active={voiceMode === "arabic"} onClick={() => setVoiceMode("arabic")} color="orange">
                  <div>🔊 عربي</div>
                  <div className="text-[10px] opacity-70 font-normal">لفظ بالعربية</div>
                </OptionBtn>
                <OptionBtn active={voiceMode === "english"} onClick={() => setVoiceMode("english")} color="orange">
                  <div>🔊 English</div>
                  <div className="text-[10px] opacity-70 font-normal">English speech</div>
                </OptionBtn>
                <OptionBtn active={voiceMode === "off"} onClick={() => setVoiceMode("off")} color="orange">
                  <div>🔇 بدون صوت</div>
                  <div className="text-[10px] opacity-70 font-normal">نقر بسيط فقط</div>
                </OptionBtn>
              </div>
            </Section>
          </div>

          {/* ── إعدادات البالونات ── */}
          <div className="p-5 space-y-4">
            <Section title={`🎈 عدد البالونات: ${balloonCount}`}>
              <div className="flex gap-2 flex-wrap">
                {[4, 6, 8, 10, 12].map((n) => (
                  <OptionBtn key={n} active={balloonCount === n} onClick={() => setBalloonCount(n)} color="rose">
                    {n}
                  </OptionBtn>
                ))}
              </div>
            </Section>

            <Section title="💥 عدد المحاولات الخاطئة المسموحة">
              <div className="flex gap-2">
                <OptionBtn active={maxWrongPops === 0} onClick={() => setMaxWrongPops(0)} color="rose">
                  <div>0</div>
                  <div className="text-[10px] opacity-70">من أول مرة!</div>
                </OptionBtn>
                <OptionBtn active={maxWrongPops === 1} onClick={() => setMaxWrongPops(1)} color="rose">
                  <div>1</div>
                  <div className="text-[10px] opacity-70">محاولة</div>
                </OptionBtn>
                <OptionBtn active={maxWrongPops === 2} onClick={() => setMaxWrongPops(2)} color="rose">
                  <div>2</div>
                  <div className="text-[10px] opacity-70">محاولتان</div>
                </OptionBtn>
                <OptionBtn active={maxWrongPops === 3} onClick={() => setMaxWrongPops(3)} color="rose">
                  <div>3</div>
                  <div className="text-[10px] opacity-70">محاولات</div>
                </OptionBtn>
                <OptionBtn active={maxWrongPops === -1} onClick={() => setMaxWrongPops(-1)} color="rose">
                  <div>∞</div>
                  <div className="text-[10px] opacity-70">بلا حد</div>
                </OptionBtn>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {maxWrongPops === 0
                  ? "⚡ وضع الصواب من المرة الأولى — أصعب وضع!"
                  : maxWrongPops === -1
                  ? "🛡️ لا يوجد حد — يفقع بالونات حتى يجد الصحيحة"
                  : `🎯 تنتهي الجولة تلقائياً بعد ${maxWrongPops} خطأ`}
              </p>
            </Section>
          </div>

          {/* ── الجولات والفرق ── */}
          <div className="p-5 space-y-4">
            <Section title={`🔁 عدد الجولات: ${totalRounds}`}>
              <div className="flex gap-2">
                {[3, 5, 7, 10, 15].map((r) => (
                  <OptionBtn key={r} active={totalRounds === r} onClick={() => setTotalRounds(r)} color="amber">
                    {r}
                  </OptionBtn>
                ))}
              </div>
            </Section>

            <Section title="👥 عدد الفرق">
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <OptionBtn key={n} active={teamCount === n} onClick={() => setTeamCount(n)} color="violet">
                    {n === 1 ? "🧑 فردي" : `${n} فرق`}
                  </OptionBtn>
                ))}
              </div>
              {teamCount > 1 && (
                <div className="space-y-2 pt-2">
                  {teams.slice(0, teamCount).map((team, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full shrink-0" style={{ background: team.color }} />
                      <input
                        value={team.name}
                        onChange={(e) => updateTeamName(i, e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>

          {/* ── Summary before start ── */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
              <span>📐 {level === "simple" ? "بسيط" : level === "complex_5" ? "مركب 5" : level === "complex_10" ? "مركب 10" : "عام"}</span>
              <span>⚡ {flashSpeed}ms/رقم</span>
              <span>🔢 {numberCount} أرقام</span>
              <span>🔢 {digitsCount} خانة</span>
              <span>🎈 {balloonCount} بالونة</span>
              <span>💥 {maxWrongPops === -1 ? "∞" : maxWrongPops} خطأ مسموح</span>
              <span>🔁 {totalRounds} جولة</span>
              <span>👥 {teamCount === 1 ? "فردي" : `${teamCount} فرق`}</span>
              <span>{voiceMode === "off" ? "🔇 بدون صوت" : voiceMode === "arabic" ? "🔊 عربي" : "🔊 English"}</span>
            </div>
            <button
              onClick={() =>
                onStart({
                  level, targetRules, digitsCount, allowSubtraction,
                  numberCount, flashSpeed, balloonCount, maxWrongPops,
                  teamCount, teams: teams.slice(0, teamCount), totalRounds, voiceMode,
                })
              }
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-black text-base shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-98"
            >
              <Play className="w-5 h-5" />
              ابدأ اللعبة 🎈
            </button>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/mental-arithmetic"
            className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 flex items-center justify-center gap-1.5 font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة إلى الحساب الذهني
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SUMMARY SCREEN
// ============================================================
function SummaryScreen({
  teams, results, totalRounds, onRestart, config,
}: {
  teams: Team[]; results: RoundResult[]; totalRounds: number;
  onRestart: () => void; config: GameConfig;
}) {
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  const correctCount = results.filter((r) => r.correct).length;
  const avgWrong = results.length > 0
    ? (results.reduce((s, r) => s + r.wrongAttempts, 0) / results.length).toFixed(1)
    : "0";

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-8 px-4">
      <div className="max-w-lg w-full space-y-5 text-center">
        <div className="text-6xl" style={{ animation: "bounce 1s ease infinite" }}>🏆</div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">انتهت اللعبة!</h2>

        {teams.length > 1 ? (
          <div
            className="p-6 rounded-3xl text-white font-black text-xl shadow-2xl border-4"
            style={{ borderColor: sorted[0].color, background: `linear-gradient(135deg, ${sorted[0].color}, ${sorted[0].color}bb)` }}
          >
            <div>{sorted[0].emoji} الفائز: {sorted[0].name}</div>
            <div className="text-3xl mt-1">{sorted[0].score} نقطة</div>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl">
            <div className="text-5xl font-black">{correctCount}/{totalRounds}</div>
            <div className="font-bold mt-1">إجابة صحيحة</div>
            <div className="text-sm opacity-80 mt-1">
              {Math.round((correctCount / totalRounds) * 100)}% دقة · متوسط أخطاء: {avgWrong}
            </div>
          </div>
        )}

        {teams.length > 1 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
            {sorted.map((team, i) => (
              <div key={team.name} className="flex items-center gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <span className="text-2xl font-black text-slate-400 w-6">{i + 1}</span>
                <div className="w-4 h-4 rounded-full" style={{ background: team.color }} />
                <span className="flex-1 text-right font-bold text-slate-800 dark:text-slate-200">{team.name}</span>
                <span className="font-black text-lg" style={{ color: team.color }}>{team.score}</span>
                {i === 0 && <Star className="w-5 h-5 text-amber-400 fill-amber-400" />}
              </div>
            ))}
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden text-sm">
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 text-xs font-black text-slate-500 uppercase tracking-wider text-right">
            سجل الجولات
          </div>
          {results.map((r, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
              <span className="text-base">{r.correct ? "✅" : "❌"}</span>
              <span className="flex-1 font-mono text-slate-700 dark:text-slate-300 text-right">{r.question} = <strong>{r.answer}</strong></span>
              {r.wrongAttempts > 0 && (
                <span className="text-xs text-rose-400 font-bold">-{r.wrongAttempts}💥</span>
              )}
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-400 dark:text-slate-500 flex flex-wrap justify-center gap-3">
          <span>⚡ {config.flashSpeed}ms</span>
          <span>🎈 {config.balloonCount} بالونة</span>
          <span>💥 {config.maxWrongPops === -1 ? "∞" : config.maxWrongPops} خطأ مسموح</span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onRestart}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] transition-transform"
          >
            <RefreshCw className="w-4 h-4" />
            العب مجدداً
          </button>
          <Link
            href="/mental-arithmetic"
            className="flex-1 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            القائمة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN GAME
// ============================================================
export default function BalloonPopPage() {
  const { playFx } = useApp();

  const [phase, setPhase] = useState<GamePhase>("settings");
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [round, setRound] = useState(0);
  const [question, setQuestion] = useState<Question | null>(null);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [lastResult, setLastResult] = useState<{ correct: boolean } | null>(null);
  const [activeTeamIdx, setActiveTeamIdx] = useState(0);
  const [balloonsDisabled, setBalloonsDisabled] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [wrongPopsThisRound, setWrongPopsThisRound] = useState(0);

  const escapeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (escapeRef.current) clearTimeout(escapeRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  // ── New round setup ──────────────────────────────────────────
  const setupRound = useCallback((cfg: GameConfig, roundNum: number) => {
    const q = generateQuestion(cfg);
    setQuestion(q);
    setRound(roundNum);
    setLastResult(null);
    setWrongPopsThisRound(0);
    setBalloonsDisabled(false);
  }, []);

  // ── Start game → go to countdown ────────────────────────────
  const startGame = useCallback((cfg: GameConfig) => {
    setConfig(cfg);
    setTeams(cfg.teams.map((t) => ({ ...t, score: 0 })));
    setResults([]);
    setActiveTeamIdx(0);
    setupRound(cfg, 0);
    setPhase("countdown");
  }, [setupRound]);

  // ── Countdown done → go to flash ────────────────────────────
  const handleCountdownDone = useCallback(() => {
    setPhase("flash");
  }, []);

  // ── Flash done → show balloons ───────────────────────────────
  const handleFlashDone = useCallback(() => {
    if (!question || !config) return;
    const bs = generateBalloons(question.answer, config.balloonCount);
    setBalloons(bs);
    setPhase("balloons");
    setBalloonsDisabled(false);
    setCountdown(12);
    clearTimers();

    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c === null || c <= 1) { clearInterval(countdownRef.current!); return null; }
        return c - 1;
      });
    }, 1000);

    escapeRef.current = setTimeout(() => {
      clearTimers();
      setBalloonsDisabled(true);
      setBalloons((prev) => prev.map((b) => b.state === "flying" ? { ...b, state: "escaped" } : b));
      setLastResult(null);
      setPhase("result");
    }, 13000);
  }, [question, config, clearTimers]);

  // ── Pop balloon ──────────────────────────────────────────────
  const handlePop = useCallback((id: string, value: number) => {
    if (!question || !config || balloonsDisabled) return;
    const isCorrect = value === question.answer;
    playFx(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      clearTimers();
      setCountdown(null);
      setBalloonsDisabled(true);
      setBalloons((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, state: "popped-correct" } : b.state === "flying" ? { ...b, state: "escaped" } : b
        )
      );
      setTeams((prev) => prev.map((t, i) => i === activeTeamIdx ? { ...t, score: t.score + 1 } : t));
      setLastResult({ correct: true });
      setResults((prev) => [
        ...prev,
        {
          question: question.display,
          answer: question.answer,
          correct: true,
          wrongAttempts: wrongPopsThisRound,
          teamName: config.teams[activeTeamIdx]?.name ?? "فردي",
          teamColor: config.teams[activeTeamIdx]?.color ?? "#64748b",
        },
      ]);
      setPhase("result");
    } else {
      const newWrong = wrongPopsThisRound + 1;
      setWrongPopsThisRound(newWrong);
      setBalloons((prev) => prev.map((b) => b.id === id ? { ...b, state: "popped-wrong" } : b));

      if (config.teamCount > 1) {
        setTimeout(() => setActiveTeamIdx((p) => (p + 1) % config.teamCount), 400);
      }

      if (config.maxWrongPops !== -1 && newWrong >= config.maxWrongPops) {
        clearTimers();
        setCountdown(null);
        setTimeout(() => {
          setBalloons((prev) =>
            prev.map((b) =>
              b.value === question.answer ? { ...b, state: "popped-correct" } : b.state === "flying" ? { ...b, state: "escaped" } : b
            )
          );
          setBalloonsDisabled(true);
          setLastResult({ correct: false });
          setResults((prev) => [
            ...prev,
            {
              question: question.display,
              answer: question.answer,
              correct: false,
              wrongAttempts: newWrong,
              teamName: config.teams[activeTeamIdx]?.name ?? "فردي",
              teamColor: config.teams[activeTeamIdx]?.color ?? "#64748b",
            },
          ]);
          setTimeout(() => setPhase("result"), 800);
        }, 500);
      }
    }
  }, [question, config, balloonsDisabled, activeTeamIdx, wrongPopsThisRound, clearTimers, playFx]);

  // ── Next round ───────────────────────────────────────────────
  const handleNextRound = useCallback(() => {
    if (!config) return;
    const next = round + 1;
    if (next >= config.totalRounds) { setPhase("summary"); return; }
    if (config.teamCount > 1) setActiveTeamIdx((p) => (p + 1) % config.teamCount);
    setupRound(config, next);
    setBalloons([]);
    setPhase("countdown");
  }, [config, round, setupRound]);

  // ── Restart ──────────────────────────────────────────────────
  const handleRestart = useCallback(() => { clearTimers(); setPhase("settings"); setConfig(null); }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  // ── RENDER ───────────────────────────────────────────────────
  if (phase === "settings") return <SettingsScreen onStart={startGame} />;

  if (phase === "countdown" && config)
    return <CountdownScreen voiceMode={config.voiceMode} onDone={handleCountdownDone} />;

  if (phase === "summary" && config)
    return <SummaryScreen teams={teams} results={results} totalRounds={config.totalRounds} onRestart={handleRestart} config={config} />;

  const activeTeam = config && config.teamCount > 1 ? teams[activeTeamIdx] : null;
  const wrongLeft = config
    ? config.maxWrongPops === -1 ? -1 : config.maxWrongPops - wrongPopsThisRound
    : -1;

  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-b from-indigo-950 via-violet-950 to-slate-950 flex flex-col">
      {/* ── Global CSS ── */}
      <style>{`
        @keyframes rise {
          0%   { transform: translateY(0) rotate(0deg);   opacity: 1; }
          20%  { transform: translateY(-20vh) rotate(-3deg); }
          40%  { transform: translateY(-40vh) rotate(3deg); }
          60%  { transform: translateY(-60vh) rotate(-3deg); }
          80%  { transform: translateY(-80vh) rotate(2deg); }
          100% { transform: translateY(-115vh) rotate(0deg); opacity: 0.2; }
        }
        @keyframes burst {
          0%   { transform: translate(-50%,-50%) scale(1); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--tx,0px)), calc(-50% + var(--ty,0px))) scale(0.1); opacity: 0; }
        }
        @keyframes popCorrect {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.4); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes popWrong {
          0%   { transform: scale(0.5); opacity: 0; }
          40%  { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1);   opacity: 0.8; }
        }
        @keyframes floatUp {
          0%   { transform: translateX(-50%) translateY(0);  opacity: 1; }
          100% { transform: translateX(-50%) translateY(-30px); opacity: 0; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes countPop {
          0%   { transform: scale(1.4); opacity: 0; }
          40%  { transform: scale(0.9); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>

      {/* ── HUD ── */}
      <div className="relative z-20 flex items-center justify-between px-4 py-3 bg-black/30 backdrop-blur-sm border-b border-white/5">
        <button onClick={handleRestart} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
          <Settings className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <span className="text-white/60 text-xs font-bold hidden sm:block">جولة {round + 1}/{config?.totalRounds}</span>
          <div className="flex gap-1.5">
            {Array.from({ length: config?.totalRounds ?? 0 }).map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all"
                style={{
                  width: i === round ? 20 : 8,
                  height: 8,
                  background: i < round ? "#34d399" : i === round ? "white" : "rgba(255,255,255,0.15)",
                }}
              />
            ))}
          </div>
        </div>

        {config && config.teamCount > 1 ? (
          <div className="flex gap-1.5">
            {teams.map((team, i) => (
              <div
                key={i}
                className="flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-black transition-all"
                style={{
                  background: `${team.color}25`,
                  border: `2px solid ${team.color}${i === activeTeamIdx ? "ff" : "60"}`,
                  color: "white",
                  transform: i === activeTeamIdx ? "scale(1.08)" : "scale(1)",
                }}
              >
                <span>{team.emoji}</span>
                <span>{team.score}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-10" />
        )}
      </div>

      {/* ── FLASH PHASE ── */}
      {phase === "flash" && question && config && (
        <div className="flex-1 relative overflow-hidden" style={{ background: "rgba(99,102,241,0.12)" }}>
          <div className="absolute inset-0 opacity-20" style={{
            background: "radial-gradient(ellipse at center, rgba(139,92,246,0.5) 0%, transparent 70%)",
            animation: "rise 2s ease-in-out infinite alternate",
          }} />

          <div className="absolute top-4 left-0 right-0 text-center z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs font-black border border-white/10">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              تذكر الأرقام
            </span>
          </div>

          <FlashDisplay
            numbers={question.numbers}
            speed={config.flashSpeed}
            voiceMode={config.voiceMode}
            onDone={handleFlashDone}
          />

          <div className="absolute bottom-6 left-0 right-0 text-center">
            <span className="text-white/20 text-xs font-mono">
              {question.numbers.length} أرقام · {config.level === "simple" ? "بسيط" : config.level === "complex_5" ? "مركب 5" : config.level === "complex_10" ? "مركب 10" : "عام"}
            </span>
          </div>
        </div>
      )}

      {/* ── BALLOONS PHASE ── */}
      {phase === "balloons" && question && config && (
        <div className="flex-1 relative overflow-hidden">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/20"
              style={{
                width: 2 + Math.random() * 2,
                height: 2 + Math.random() * 2,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}

          <div className="relative z-10 mx-4 mt-3">
            <div className="py-3 px-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 text-center">
              <p className="text-white/50 text-xs font-bold mb-0.5">ما هو الجواب؟</p>
              <p className="text-white text-2xl sm:text-3xl font-black">{question.display} = ?</p>
              {activeTeam && (
                <p className="text-xs font-black mt-1" style={{ color: activeTeam.color }}>
                  {activeTeam.emoji} دور {activeTeam.name}
                </p>
              )}
            </div>

            {config.maxWrongPops !== -1 && (
              <div className="flex items-center justify-center gap-1.5 mt-2">
                {Array.from({ length: config.maxWrongPops }).map((_, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full border-2 border-white/30 transition-all"
                    style={{
                      background: i < wrongPopsThisRound ? "#f43f5e" : "transparent",
                      borderColor: i < wrongPopsThisRound ? "#f43f5e" : "rgba(255,255,255,0.3)",
                    }}
                  />
                ))}
                {config.maxWrongPops > 0 && (
                  <span className="text-white/40 text-xs font-bold mr-1">
                    {config.maxWrongPops - wrongPopsThisRound} متبقية
                  </span>
                )}
              </div>
            )}
          </div>

          {countdown !== null && (
            <div className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-black/40 border-2 border-white/20 flex items-center justify-center">
              <span className={`text-lg font-black ${countdown <= 3 ? "text-rose-400" : "text-white"}`}>
                {countdown}
              </span>
            </div>
          )}

          <div className="absolute inset-0 top-28">
            {balloons.map((b) => (
              <BalloonItem
                key={b.id}
                balloon={b}
                onPop={handlePop}
                disabled={balloonsDisabled}
                wrongPopsLeft={wrongLeft}
              />
            ))}
          </div>

          {balloons.filter((b) => b.state === "flying").length <= 2 &&
           balloons.some((b) => b.state === "flying") && (
            <div className="absolute bottom-6 left-0 right-0 text-center z-10 pointer-events-none">
              <span className="text-xs text-amber-300 font-black bg-black/40 px-4 py-1.5 rounded-full animate-pulse">
                ⚠️ بالونات قليلة تبقت!
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── RESULT PHASE ── */}
      {phase === "result" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-4">
          {lastResult ? (
            lastResult.correct ? (
              <div className="text-center space-y-3">
                <div className="text-7xl" style={{ animation: "bounce 0.8s ease infinite" }}>🎉</div>
                <h2 className="text-4xl font-black text-emerald-400">ممتاز!</h2>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-4 border border-white/10">
                  <p className="text-white/60 text-sm">الجواب الصحيح</p>
                  <p className="text-white text-4xl font-black">{question?.answer}</p>
                  {question && <p className="text-white/50 text-sm mt-1 font-mono">{question.display}</p>}
                </div>
                {wrongPopsThisRound > 0 && (
                  <p className="text-rose-300 text-sm font-bold">بعد {wrongPopsThisRound} محاولة خاطئة</p>
                )}
                {activeTeam && (
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-sm border-2"
                    style={{ borderColor: activeTeam.color, color: activeTeam.color, background: `${activeTeam.color}22` }}
                  >
                    {activeTeam.emoji} +1 نقطة لـ {activeTeam.name}!
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-3">
                <div className="text-7xl">❌</div>
                <h2 className="text-4xl font-black text-rose-400">وقت الجولة انتهى!</h2>
                <div className="bg-white/10 rounded-2xl px-8 py-4 border border-white/10">
                  <p className="text-white/60 text-sm">كان الجواب الصحيح</p>
                  <p className="text-white text-4xl font-black">{question?.answer}</p>
                </div>
              </div>
            )
          ) : (
            <div className="text-center space-y-3">
              <div className="text-7xl">⏰</div>
              <h2 className="text-3xl font-black text-amber-400">انتهى الوقت!</h2>
              <div className="bg-white/10 rounded-2xl px-8 py-4 border border-white/10">
                <p className="text-white/60 text-sm">كان الجواب</p>
                <p className="text-white text-4xl font-black">{question?.answer}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleNextRound}
            className="mt-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-indigo-500 text-white font-black text-lg shadow-xl hover:scale-105 active:scale-98 transition-transform flex items-center gap-3"
          >
            {round + 1 >= (config?.totalRounds ?? 0) ? (
              <><Trophy className="w-5 h-5" />عرض النتائج</>
            ) : (
              <><Zap className="w-5 h-5" />الجولة التالية {round + 2}/{config?.totalRounds}</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
