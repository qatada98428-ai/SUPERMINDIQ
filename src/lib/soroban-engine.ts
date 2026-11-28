/**
 * SUPER MIND — Soroban & Mental Arithmetic Engine
 * Complete decoupled mathematical calculation engine for Soroban, Flash Anzan, and Competitions
 */

import { soundSynth } from "@/lib/audio-synthesizer";
import {
  numberToArabicWords as fullArabicWords,
  numberToEnglishWords as fullEnglishWords,
  formatTermSpeechText,
  loadSpeechPreferences,
  discoverRealVoices,
  hasLocalLanguageVoices,
  isCloudVoiceUri,
  CLOUD_VOICE_FEMALE_URI,
  CLOUD_VOICE_MALE_URI,
  CLOUD_VOICE_MALE_2_URI,
  VoiceGender,
  SpeechPreferences,
} from "@/lib/speech-engine";
import {
  playCloudSpeech,
  stopAllCloudSpeech,
  prefetchCloudSpeech,
} from "@/lib/cloud-tts-client";

export {
  fullArabicWords as numberToArabicWords,
  fullEnglishWords as numberToEnglishWords,
  formatTermSpeechText,
  prefetchCloudSpeech,
  CLOUD_VOICE_FEMALE_URI,
  CLOUD_VOICE_MALE_URI,
  CLOUD_VOICE_MALE_2_URI,
};

export interface SorobanRodState {
  upper: boolean; // Upper deck bead (worth 5 when active, pushed toward reckoning beam)
  lowers: number; // Lower deck beads (0 to 4, active when pushed up toward beam)
}

export type ArithmeticLevel =
  | "simple" // Direct addition and subtraction without friends
  | "complex_5" // Friends of 5 (Small Friends: ±1, ±2, ±3, ±4)
  | "complex_10" // Friends of 10 (Big Friends: ±1 ... ±9)
  | "mixed" // Mixed family rules (combined 5 and 10)
  | "general"; // General random practice (تدريب عام)

export interface FlashAnzanConfig {
  termsCount: number; // Number of numbers in sequence (e.g. 5, 8, 10)
  digitsCount: number; // Number of digits per number (1, 2, 3...)
  showDelayMs: number; // Show time on screen (e.g. 800ms)
  clearDelayMs: number; // Blank interval between numbers (e.g. 300ms)
  allowSubtraction: boolean; // Include minus operations
  allowNegativeTotal?: boolean; // Allow final total to be negative (usually false in early levels)
  level: ArithmeticLevel;
  targetRule?: number; // Legacy single rule: e.g. 1
  targetRules?: number[]; // Multi-rule selection: e.g. [1, 2] or [1, 2, 3]
  numeralSystem: "western" | "arabic";
}

/**
 * Returns single digit value (0..9) of a Soroban rod
 */
export function getRodValue(rod: SorobanRodState): number {
  return (rod.upper ? 5 : 0) + Math.max(0, Math.min(4, rod.lowers));
}

/**
 * Converts a digit (0..9) to Soroban rod state
 */
export function digitToRodState(digit: number): SorobanRodState {
  const d = Math.max(0, Math.min(9, Math.floor(digit)));
  return {
    upper: d >= 5,
    lowers: d % 5,
  };
}

/**
 * Converts a non-negative integer to an array of Soroban rods with fixed width
 */
export function numberToSoroban(num: number, rodCount = 7): SorobanRodState[] {
  const rods: SorobanRodState[] = [];
  let n = Math.max(0, Math.floor(num));
  for (let i = 0; i < rodCount; i++) {
    const digit = n % 10;
    rods.unshift(digitToRodState(digit));
    n = Math.floor(n / 10);
  }
  return rods;
}

/**
 * Calculates total integer value from Soroban rods array
 */
export function sorobanToNumber(rods: SorobanRodState[]): number {
  return rods.reduce((acc, rod, idx) => {
    const place = Math.pow(10, rods.length - 1 - idx);
    return acc + getRodValue(rod) * place;
  }, 0);
}

// ==========================================
// SOROBAN ARITHMETIC CLASSIFICATION RULES
// ==========================================

/**
 * Checks if adding addDigit (0..9) to currentDigit (0..9) on a single rod is Direct / Simple
 * Direct addition means beads can be pushed directly without using 5-decomposition or 10-carry.
 */
export function isSimpleAddition(current: number, add: number): boolean {
  if (add === 0) return true;
  if (current + add > 9) return false; // Requires 10-carry
  const currUpper = current >= 5;
  const currLower = current % 5;
  const addUpper = add >= 5;
  const addLower = add % 5;

  // If add has upper bead, current must not have upper bead
  if (addUpper && currUpper) return false;
  // Lower beads must not exceed 4
  if (currLower + addLower > 4) return false;

  return true;
}

/**
 * Checks if subtracting subDigit (0..9) from currentDigit (0..9) on a single rod is Direct / Simple
 */
export function isSimpleSubtraction(current: number, sub: number): boolean {
  if (sub === 0) return true;
  if (current < sub) return false; // Requires borrowing from 10
  const currUpper = current >= 5;
  const currLower = current % 5;
  const subUpper = sub >= 5;
  const subLower = sub % 5;

  // If sub requires upper bead, current must have upper bead
  if (subUpper && !currUpper) return false;
  // Lower beads must be sufficient
  if (currLower < subLower) return false;

  return true;
}

/**
 * Checks if adding addDigit (1..4) requires Friends of 5 rule:
 * +d = +5 - (5 - d)
 * Requires upper bead is NOT active, but lower beads would exceed 4.
 */
export function isFriendsOf5Addition(current: number, add: number, targetFriends?: number[] | number): boolean {
  const c = Math.abs(current);
  const u = c % 10;
  if (add <= 0 || add >= 5) return false;
  if (u >= 5) return false; // 5 bead is already down
  if (u + add > 9) return false; // Exceeds rod capacity
  if (u + add < 5) return false; // Direct addition (e.g. 1 + 2 = 3)

  if (targetFriends !== undefined) {
    const list = Array.isArray(targetFriends) ? targetFriends : [targetFriends];
    if (list.length > 0 && !list.includes(add)) return false;
  }
  return true;
}

/**
 * Checks if subtracting subDigit (1..4) requires Friends of 5 rule:
 * -d = -5 + (5 - d)
 * Requires upper bead IS active, and lower beads are not enough to subtract d directly.
 */
export function isFriendsOf5Subtraction(current: number, sub: number, targetFriends?: number[] | number): boolean {
  const c = Math.abs(current);
  if (c < sub) return false;
  const u = c % 10;
  if (sub <= 0 || sub >= 5) return false;
  if (u < 5) return false; // 5 bead is not active
  const lower = u % 5;
  if (lower >= sub) return false; // Simple subtraction (e.g. 7 - 2 = 5)

  if (targetFriends !== undefined) {
    const list = Array.isArray(targetFriends) ? targetFriends : [targetFriends];
    if (list.length > 0 && !list.includes(sub)) return false;
  }
  return true;
}

/**
 * Checks if adding addDigit (1..9) requires Friends of 10 rule:
 * +d = +10 - (10 - d)
 */
export function isFriendsOf10Addition(current: number, add: number, targetFriends?: number[] | number): boolean {
  const c = Math.abs(current);
  const u = c % 10;
  if (add <= 0 || add > 9) return false;
  if (u + add < 10) return false; // Does not trigger 10-carry

  if (targetFriends !== undefined) {
    const list = Array.isArray(targetFriends) ? targetFriends : [targetFriends];
    if (list.length > 0 && !list.includes(add)) return false;
  }
  return true;
}

/**
 * Checks if subtracting subDigit (1..9) requires Friends of 10 rule:
 * -d = -10 + (10 - d)
 */
export function isFriendsOf10Subtraction(current: number, sub: number, targetFriends?: number[] | number): boolean {
  if (current < sub || current < 10) return false;
  const u = current % 10;
  if (sub <= 0 || sub > 9) return false;
  if (u >= sub) return false; // Can be subtracted directly on rod without 10-borrow

  if (targetFriends !== undefined) {
    const list = Array.isArray(targetFriends) ? targetFriends : [targetFriends];
    if (list.length > 0 && !list.includes(sub)) return false;
  }
  return true;
}

// ==========================================
// FLASH ANZAN SEQUENCE GENERATION ENGINE
// ==========================================

/**
 * Strict Simple Series Generator (البسيط المباشر)
 * Ensures EVERY rod (units, tens, hundreds...) performs only direct bead movements
 * without ever needing Friends of 5 or Friends of 10.
 */
function generateStrictSimpleSeries(
  termsCount: number,
  digitsCount: number,
  allowSubtraction: boolean
): number[] {
  const safeStartDigits = [1, 2, 3, 5, 6, 7];

  for (let attempt = 0; attempt < 200; attempt++) {
    // Build starting number rod by rod
    let startNum = 0;
    for (let d = 0; d < digitsCount; d++) {
      const place = Math.pow(10, d);
      const digit = safeStartDigits[Math.floor(Math.random() * safeStartDigits.length)];
      startNum += digit * place;
    }

    const series: number[] = [startNum];
    let running = startNum;
    let validSequence = true;

    for (let step = 1; step < termsCount; step++) {
      // Decide possible operations (+ or -) that are valid across all rods
      const possibleMoves: number[] = [];

      // Try addition moves
      const addDigitsPerRod: number[][] = [];
      let canAdd = true;
      for (let d = 0; d < digitsCount; d++) {
        const currDigit = Math.floor(running / Math.pow(10, d)) % 10;
        const validAdd: number[] = [];
        const minD = d === digitsCount - 1 ? 1 : 0; // Highest rod must be >= 1 if digitsCount > 1, or for 1-digit minD = 1
        for (let val = minD; val <= 9; val++) {
          if (isSimpleAddition(currDigit, val)) {
            validAdd.push(val);
          }
        }
        if (validAdd.length === 0) {
          canAdd = false;
          break;
        }
        addDigitsPerRod.push(validAdd);
      }

      if (canAdd) {
        for (let sample = 0; sample < 6; sample++) {
          let moveVal = 0;
          for (let d = 0; d < digitsCount; d++) {
            const choices = addDigitsPerRod[d];
            const picked = choices[Math.floor(Math.random() * choices.length)];
            moveVal += picked * Math.pow(10, d);
          }
          if (moveVal > 0) possibleMoves.push(moveVal);
        }
      }

      // Try subtraction moves if allowed (or if addition is blocked on some rod and we need a valid simple subtraction)
      const trySub = allowSubtraction || possibleMoves.length === 0;
      if (trySub) {
        const subDigitsPerRod: number[][] = [];
        let canSub = true;
        for (let d = 0; d < digitsCount; d++) {
          const currDigit = Math.floor(running / Math.pow(10, d)) % 10;
          const validSub: number[] = [];
          const minD = d === digitsCount - 1 ? 1 : 0;
          for (let val = minD; val <= 9; val++) {
            if (isSimpleSubtraction(currDigit, val)) {
              validSub.push(val);
            }
          }
          if (validSub.length === 0) {
            canSub = false;
            break;
          }
          subDigitsPerRod.push(validSub);
        }

        if (canSub) {
          for (let sample = 0; sample < 6; sample++) {
            let moveVal = 0;
            for (let d = 0; d < digitsCount; d++) {
              const choices = subDigitsPerRod[d];
              const picked = choices[Math.floor(Math.random() * choices.length)];
              moveVal += picked * Math.pow(10, d);
            }
            if (moveVal > 0 && running - moveVal >= 0) {
              possibleMoves.push(-moveVal);
            }
          }
        }
      }

      // If allowSubtraction is false and we had no pure n-digit addition, fail this attempt and retry
      const filteredMoves = allowSubtraction
        ? possibleMoves
        : possibleMoves.filter((m) => m > 0);

      if (filteredMoves.length === 0) {
        validSequence = false;
        break;
      }

      const chosen = filteredMoves[Math.floor(Math.random() * filteredMoves.length)];
      series.push(chosen);
      running += chosen;
    }

    if (validSequence && running >= 0) {
      return series;
    }
  }

  // Fallback guaranteed simple sequence
  const unit = Math.pow(10, digitsCount - 1);
  if (termsCount <= 4) {
    return [unit, unit, 2 * unit, 5 * unit].slice(0, termsCount);
  }
  const fb: number[] = [2 * unit, 2 * unit, 5 * unit];
  let total = 9 * unit;
  while (fb.length < termsCount) {
    if (total >= 3 * unit) {
      fb.push(-2 * unit);
      total -= 2 * unit;
    } else {
      fb.push(2 * unit);
      total += 2 * unit;
    }
  }
  return fb;
}

export function generateFlashAnzanSeries(config: FlashAnzanConfig): number[] {
  const { termsCount, digitsCount, allowSubtraction, level, targetRules, targetRule } = config;

  // 1. Strict Simple Level
  if (level === "simple") {
    return generateStrictSimpleSeries(termsCount, digitsCount, allowSubtraction);
  }

  let activeRules: number[] = [];
  if (targetRules && targetRules.length > 0) {
    activeRules = targetRules;
  } else if (targetRule !== undefined) {
    activeRules = [targetRule];
  } else if (level === "complex_5") {
    activeRules = [1, 2, 3, 4];
  } else if (level === "complex_10" || level === "mixed") {
    activeRules = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  }

  const min = Math.pow(10, digitsCount - 1);
  const max = Math.pow(10, digitsCount) - 1;

  // Try generating a natural, non-monotonous sequence where target rules occur organically
  for (let attempt = 0; attempt < 120; attempt++) {
    const series: number[] = [];
    let runningTotal = 0;
    let targetRuleAppliedCount = 0;

    // STEP 0: Natural varied starting number
    let startNum = 0;
    if (level === "complex_5" && activeRules.length > 0) {
      const validRules = activeRules.filter((r) => r >= 1 && r <= 4);
      const rulesToUse = validRules.length > 0 ? validRules : [1, 2, 3, 4];
      const r = rulesToUse[Math.floor(Math.random() * rulesToUse.length)];
      const wantSub = allowSubtraction && Math.random() < 0.45;
      if (wantSub) {
        const validUnits: number[] = [];
        for (let u = 5; u <= 5 + r - 1; u++) validUnits.push(u);
        startNum = validUnits[Math.floor(Math.random() * validUnits.length)];
      } else {
        const validUnits: number[] = [];
        for (let u = 5 - r; u <= 4; u++) validUnits.push(u);
        startNum = validUnits[Math.floor(Math.random() * validUnits.length)];
      }
    } else if ((level === "complex_10" || level === "mixed") && activeRules.length > 0) {
      const r = activeRules[Math.floor(Math.random() * activeRules.length)];
      const wantSub = allowSubtraction && Math.random() < 0.4;
      if (wantSub) {
        startNum = 10 + Math.floor(Math.random() * Math.max(1, r));
      } else {
        startNum = 10 - r + Math.floor(Math.random() * r);
      }
    } else {
      startNum = Math.floor(Math.random() * (max - min + 1)) + min;
    }

    if (digitsCount > 1 && startNum < min) {
      let higherPart = 0;
      for (let d = 1; d < digitsCount; d++) {
        const digit = Math.floor(Math.random() * 4) + 1; // 1..4 on higher rods so room to add
        higherPart += digit * Math.pow(10, d);
      }
      startNum = (startNum % 10) + higherPart;
    }

    series.push(startNum);
    runningTotal = startNum;

    // STEPS 1 .. termsCount - 1
    let sequenceFailed = false;
    for (let step = 1; step < termsCount; step++) {
      const u = runningTotal % 10;
      const targetCandidates: { val: number }[] = [];

      if (level === "complex_5") {
        const rules5 = activeRules.filter((r) => r >= 1 && r <= 4);
        const list = rules5.length > 0 ? rules5 : [1, 2, 3, 4];
        for (const r of list) {
          if (isFriendsOf5Addition(runningTotal, r)) targetCandidates.push({ val: r });
          if (allowSubtraction && isFriendsOf5Subtraction(runningTotal, r)) targetCandidates.push({ val: -r });
        }
      } else if (level === "complex_10") {
        for (const r of activeRules) {
          if (isFriendsOf10Addition(runningTotal, r)) targetCandidates.push({ val: r });
          if (allowSubtraction && isFriendsOf10Subtraction(runningTotal, r)) targetCandidates.push({ val: -r });
        }
      } else if (level === "mixed") {
        for (const r of [1, 2, 3, 4]) {
          if (isFriendsOf5Addition(runningTotal, r)) targetCandidates.push({ val: r });
          if (allowSubtraction && isFriendsOf5Subtraction(runningTotal, r)) targetCandidates.push({ val: -r });
        }
        for (const r of activeRules) {
          if (isFriendsOf10Addition(runningTotal, r)) targetCandidates.push({ val: r });
          if (allowSubtraction && isFriendsOf10Subtraction(runningTotal, r)) targetCandidates.push({ val: -r });
        }
      }

      // Helper to attach higher digits safely without creating negative total or unintended 10-carry in complex_5
      const attachHigherDigits = (unitMove: number): number | null => {
        if (digitsCount === 1) {
          return runningTotal + unitMove >= 0 ? unitMove : null;
        }
        const isNeg = unitMove < 0;
        const absUnit = Math.abs(unitMove);
        let higherMove = 0;
        for (let d = 1; d < digitsCount; d++) {
          const currDigit = Math.floor(runningTotal / Math.pow(10, d)) % 10;
          const validDigits: number[] = [];
          for (let hd = 1; hd <= 4; hd++) {
            if (!isNeg && isSimpleAddition(currDigit, hd)) validDigits.push(hd);
            if (isNeg && isSimpleSubtraction(currDigit, hd)) validDigits.push(hd);
          }
          const picked = validDigits.length > 0
            ? validDigits[Math.floor(Math.random() * validDigits.length)]
            : 1;
          higherMove += picked * Math.pow(10, d);
        }
        const fullVal = isNeg ? -(absUnit + higherMove) : (absUnit + higherMove);
        if (runningTotal + fullVal < 0) {
          return runningTotal + unitMove >= 0 ? unitMove : null;
        }
        return fullVal;
      };

      // Execute target rule move if available
      if (targetCandidates.length > 0 && (targetRuleAppliedCount === 0 || Math.random() < 0.65)) {
        const picked = targetCandidates[Math.floor(Math.random() * targetCandidates.length)];
        const fullVal = attachHigherDigits(picked.val);
        if (fullVal !== null) {
          series.push(fullVal);
          runningTotal += fullVal;
          targetRuleAppliedCount++;
          continue;
        }
      }

      // Natural Bridge Moves (Simple moves guiding toward target state)
      const bridgeMoves: number[] = [];
      if (level === "complex_5") {
        const rules5 = activeRules.filter((r) => r >= 1 && r <= 4);
        const list = rules5.length > 0 ? rules5 : [1, 2, 3, 4];
        const targetR = list[Math.floor(Math.random() * list.length)];
        const desiredUnits: number[] = [];
        for (let du = 5 - targetR; du <= 4; du++) desiredUnits.push(du);

        for (let d = 1; d <= 9; d++) {
          if (isSimpleAddition(u, d)) {
            const nextU = u + d;
            const weight = desiredUnits.includes(nextU) ? 4 : 1;
            for (let k = 0; k < weight; k++) bridgeMoves.push(d);
          }
          if (allowSubtraction && isSimpleSubtraction(u, d) && runningTotal - d >= 0) {
            const nextU = u - d;
            const weight = desiredUnits.includes(nextU) ? 4 : 1;
            for (let k = 0; k < weight; k++) bridgeMoves.push(-d);
          }
        }
      } else if (level === "complex_10" || level === "mixed") {
        const targetR = activeRules[Math.floor(Math.random() * activeRules.length)] || 5;
        const desiredUnits: number[] = [];
        for (let du = 10 - targetR; du <= 9; du++) desiredUnits.push(du);

        for (let d = 1; d <= 9; d++) {
          if (isSimpleAddition(u, d)) {
            const nextU = u + d;
            const weight = desiredUnits.includes(nextU) ? 4 : 1;
            for (let k = 0; k < weight; k++) bridgeMoves.push(d);
          }
          if (allowSubtraction && isSimpleSubtraction(u, d) && runningTotal - d >= 0) {
            bridgeMoves.push(-d);
          }
        }
      } else {
        // General level
        for (let d = min; d <= max; d++) {
          bridgeMoves.push(d);
          if (allowSubtraction && runningTotal - d >= 0) {
            bridgeMoves.push(-d);
          }
        }
      }

      if (bridgeMoves.length > 0) {
        const rawMove = bridgeMoves[Math.floor(Math.random() * bridgeMoves.length)];
        const finalMove = level === "general" ? rawMove : attachHigherDigits(rawMove);
        if (finalMove !== null && runningTotal + finalMove >= 0) {
          series.push(finalMove);
          runningTotal += finalMove;
        } else {
          sequenceFailed = true;
          break;
        }
      } else {
        sequenceFailed = true;
        break;
      }
    }

    if (sequenceFailed) continue;

    // Ensure the target rule was applied at least once in the series
    if ((level === "complex_5" || level === "complex_10" || level === "mixed") && targetRuleAppliedCount === 0) {
      continue;
    }

    return series;
  }

  // Graceful fallback
  if (level === "complex_5") return [3, 2, 1].slice(0, termsCount);
  if (level === "complex_10") return [7, 3, 2].slice(0, termsCount);
  return [2, 2, 5].slice(0, termsCount);
}

// ==========================================
// CENTRALIZED SOUND & SPEECH PRONUNCIATION ENGINE
// ==========================================

/**
 * Comfortable & Soothing Sound Player
 */
export function playSoundEffect(
  type: "beep" | "correct" | "wrong" | "tick" | "ready" | "complete" | "combo" | "excellent" | "levelup"
) {
  if (typeof window === "undefined") return;
  try {
    if (type === "beep") {
      soundSynth.playFlashCue("number");
    } else if (type === "ready") {
      soundSynth.playFlashCue("ready");
    } else if (type === "complete") {
      soundSynth.playFlashCue("complete");
    } else if (type === "tick") {
      soundSynth.playSound("flash-countdown");
    } else if (type === "correct") {
      soundSynth.playCorrectFeedback(1);
    } else if (type === "combo") {
      soundSynth.playCorrectFeedback(2);
    } else if (type === "excellent") {
      soundSynth.playOutcomeSound("excellent");
    } else if (type === "levelup") {
      soundSynth.playOutcomeSound("levelup");
    } else if (type === "wrong") {
      soundSynth.playSound("wrong");
    }
  } catch {
    // Ignore audio errors
  }
}

let cachedVoices: SpeechSynthesisVoice[] = [];

export function getRawBrowserVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) cachedVoices = voices;
  return cachedVoices;
}

function resolveSpeechVoice(
  langMode: "arabic" | "english",
  preferredVoiceUri?: string
): SpeechSynthesisVoice | null {
  const voices = getRawBrowserVoices();
  if (voices.length === 0) return null;

  if (preferredVoiceUri) {
    const exact = voices.find((v) => v.voiceURI === preferredVoiceUri);
    if (exact) return exact;
  }

  const catalog = discoverRealVoices(voices, langMode);
  return catalog.all.length > 0
    ? voices.find((v) => v.voiceURI === catalog.all[0].voiceURI) || null
    : null;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

// =========================================================================
// UNIFIED SINGLE-CHANNEL SPEECH COORDINATOR (ZERO OVERLAP / ZERO DUPLICATION)
// =========================================================================

let activeSpeechToken = 0;
let activeUtteranceRef: SpeechSynthesisUtterance | null = null;
let pendingSpeakTimer: ReturnType<typeof setTimeout> | null = null;
let lastSpokenKey = "";
let lastSpokenAt = 0;
const unreliableLocalLangs = new Set<"arabic" | "english">();

/**
 * Warms up voice discovery & Web Audio safely on user gesture without queuing dummy utterances
 * (queuing silent utterances + cancel() causes Android Chrome to glitch/drop subsequent speech).
 */
export function warmupSpeechEngine() {
  if (typeof window === "undefined") return;
  if ("speechSynthesis" in window) {
    try {
      cachedVoices = window.speechSynthesis.getVoices();
    } catch {
      // Ignore
    }
  }
}

export function shouldUseCloudSpeech(
  langMode: "arabic" | "english",
  prefs: SpeechPreferences
): { useCloud: boolean; gender: VoiceGender } {
  const uri = langMode === "arabic" ? prefs.voiceUriAr : prefs.voiceUriEn;
  const detectGender = (): VoiceGender => {
    if (uri === CLOUD_VOICE_MALE_2_URI || uri.includes("male_2") || uri.includes("tarik")) {
      return "male_2";
    }
    if (
      uri === CLOUD_VOICE_MALE_URI ||
      uri.toLowerCase().includes("male") ||
      uri.includes("ذكر") ||
      uri.includes("hamed") ||
      uri.includes("shakir") ||
      uri.includes("naayf")
    ) {
      return "male";
    }
    return "female";
  };

  if (isCloudVoiceUri(uri)) {
    return { useCloud: true, gender: detectGender() };
  }

  // If local OS speech already proved broken/unreliable for this language in this session,
  // keep ONE consistent studio cloud voice rather than alternating between two voices.
  if (unreliableLocalLangs.has(langMode)) {
    return { useCloud: true, gender: detectGender() };
  }

  const voices = getRawBrowserVoices();
  const hasLocal = hasLocalLanguageVoices(voices, langMode);
  if (!hasLocal) {
    return { useCloud: true, gender: detectGender() };
  }

  return {
    useCloud: false,
    gender: detectGender(),
  };
}

/**
 * Immediately halts EVERY active speech channel (both OS SpeechSynthesis & Cloud TTS)
 * and invalidates any in-flight callbacks so cancelled speech can NEVER trigger a second voice.
 */
export function stopActiveSpeech() {
  activeSpeechToken += 1;
  if (pendingSpeakTimer) {
    clearTimeout(pendingSpeakTimer);
    pendingSpeakTimer = null;
  }
  if (activeUtteranceRef) {
    activeUtteranceRef.onend = null;
    activeUtteranceRef.onerror = null;
    activeUtteranceRef = null;
  }

  if (typeof window === "undefined") return;
  try {
    stopAllCloudSpeech();
  } catch {
    // Ignore
  }
  try {
    if ("speechSynthesis" in window) {
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }
    }
  } catch {
    // Ignore
  }
}

function getEffectiveSpeechSettings(overrides?: Partial<SpeechPreferences>): SpeechPreferences {
  const saved = loadSpeechPreferences();
  return {
    ...saved,
    ...overrides,
  };
}

function getEffectiveSpeechVolume(): number {
  const audioPrefs = soundSynth.getPreferences();
  if (!audioPrefs.masterEnabled) return 0;
  return Math.max(0, Math.min(1, audioPrefs.masterVolume));
}

/**
 * Automatically tunes speech playback rate to match Flash Anzan question speed (showDelayMs).
 */
export function computeAdaptiveSpeechRate(speedMs = 800): number {
  if (speedMs <= 420) return 1.95;
  if (speedMs <= 550) return 1.75;
  if (speedMs <= 750) return 1.52;
  if (speedMs <= 950) return 1.32;
  if (speedMs <= 1250) return 1.15;
  return 1.02;
}

function createConfiguredUtterance(
  text: string,
  langMode: "arabic" | "english",
  prefs: SpeechPreferences,
  speedMs?: number,
  explicitRate?: number
): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance(text);
  const targetUri = langMode === "arabic" ? prefs.voiceUriAr : prefs.voiceUriEn;
  const voice = resolveSpeechVoice(langMode, targetUri);
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang || (langMode === "arabic" ? "ar-SA" : "en-US");
  const rate =
    explicitRate !== undefined
      ? explicitRate
      : speedMs !== undefined
      ? computeAdaptiveSpeechRate(speedMs)
      : 1.15;
  utterance.rate = Math.max(0.5, Math.min(2.0, rate));

  const isMale2 =
    targetUri === CLOUD_VOICE_MALE_2_URI ||
    targetUri.includes("male_2") ||
    targetUri.includes("tarik") ||
    targetUri.includes("naayf");
  const isMale1 =
    targetUri === CLOUD_VOICE_MALE_URI ||
    targetUri.includes("shakir") ||
    targetUri.includes("maged") ||
    targetUri.includes("male");

  let pitch = 1.04;
  if (isMale1) {
    pitch = 0.84;
  } else if (isMale2) {
    pitch = 0.98;
  }
  utterance.pitch = pitch;
  utterance.volume = getEffectiveSpeechVolume();
  return utterance;
}

interface UnifiedSpeakOptions {
  speedMs?: number;
  explicitRate?: number;
  overrides?: Partial<SpeechPreferences>;
  force?: boolean; // Bypass short deduplication window (e.g., manual replay button)
  onComplete?: () => void;
}

/**
 * Single authoritative speech dispatcher across the entire platform.
 * - Cancels ALL previous OS & Cloud voices atomically via activeSpeechToken.
 * - Deduplicates accidental double-triggers within 260ms (unless force=true).
 * - Never triggers a fallback cloud voice when an OS utterance was merely canceled/interrupted.
 */
function speakUnified(
  rawText: string,
  langMode: "arabic" | "english",
  options: UnifiedSpeakOptions = {}
): () => void {
  if (typeof window === "undefined") {
    options.onComplete?.();
    return () => {};
  }

  const text = rawText.trim();
  const prefs = getEffectiveSpeechSettings(options.overrides);
  const volume = getEffectiveSpeechVolume();

  if (!text || volume <= 0) {
    options.onComplete?.();
    return () => {};
  }

  // Guard against accidental React double-invocation or rapid duplicate triggers
  const now = Date.now();
  const dedupeKey = `${langMode}:${text}`;
  if (!options.force && dedupeKey === lastSpokenKey && now - lastSpokenAt < 260) {
    return () => {};
  }
  lastSpokenKey = dedupeKey;
  lastSpokenAt = now;

  // Atomically halt every existing speech stream and acquire an exclusive token
  stopActiveSpeech();
  const myToken = ++activeSpeechToken;

  const cloudStatus = shouldUseCloudSpeech(langMode, prefs);
  const resolvedRate =
    options.explicitRate !== undefined
      ? options.explicitRate
      : options.speedMs !== undefined
      ? computeAdaptiveSpeechRate(options.speedMs)
      : 1.1;

  let settled = false;
  let cancelCloud: (() => void) | null = null;

  const finishOnce = () => {
    if (settled) return;
    settled = true;
    if (myToken === activeSpeechToken) {
      if (activeUtteranceRef) {
    activeUtteranceRef.onend = null;
    activeUtteranceRef.onerror = null;
    activeUtteranceRef = null;
  }
      options.onComplete?.();
    }
  };

  const cancelThis = () => {
    if (settled) return;
    settled = true;
    if (cancelCloud) {
      cancelCloud();
      cancelCloud = null;
    }
    if (myToken === activeSpeechToken) {
      stopActiveSpeech();
    }
  };

  const runCloud = () => {
    if (settled || myToken !== activeSpeechToken) return;
    cancelCloud = playCloudSpeech(text, {
      lang: langMode,
      gender: cloudStatus.gender,
      rate: resolvedRate,
      volume,
      onComplete: finishOnce,
    });
  };

  if (cloudStatus.useCloud || !("speechSynthesis" in window)) {
    runCloud();
    return cancelThis;
  }

  // Use local OS SpeechSynthesis cleanly with a tiny 20ms yield after cancel() on mobile browsers
  // so Android Chrome / iOS Safari never drop or overlap the new utterance.
  const dispatchLocal = () => {
    if (settled || myToken !== activeSpeechToken) return;
    try {
      const utterance = createConfiguredUtterance(
        text,
        langMode,
        prefs,
        options.speedMs,
        options.explicitRate
      );
      activeUtteranceRef = utterance;

      utterance.onend = () => {
        if (myToken !== activeSpeechToken) return;
        finishOnce();
      };

      utterance.onerror = (ev) => {
        // CRITICAL: Ignore canceled/interrupted events completely so they NEVER spawn a 2nd voice!
        if (myToken !== activeSpeechToken) return;
        const errCode = (ev as SpeechSynthesisErrorEvent | undefined)?.error;
        if (errCode === "canceled" || errCode === "interrupted") {
          return;
        }
        // Genuine local engine error -> switch this language cleanly to studio Cloud TTS for the session
        unreliableLocalLangs.add(langMode);
        runCloud();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      if (myToken === activeSpeechToken) {
        unreliableLocalLangs.add(langMode);
        runCloud();
      }
    }
  };

  // On mobile WebKit/Blink, a micro-delay after cancel() guarantees the previous utterance is flushed
  pendingSpeakTimer = setTimeout(() => {
    pendingSpeakTimer = null;
    dispatchLocal();
  }, 18);

  return cancelThis;
}

/**
 * Cleanly speaks any custom Arabic/English text (for Memory-Focus, Multiplication, etc.)
 * through the unified single-channel speech engine.
 */
export function speakCustomText(
  text: string,
  langMode: "arabic" | "english" = "arabic",
  options?: { rate?: number; force?: boolean; onComplete?: () => void }
): () => void {
  return speakUnified(text, langMode, {
    explicitRate: options?.rate ?? 1.05,
    force: options?.force,
    onComplete: options?.onComplete,
  });
}

/**
 * Speaks a flashed/question number cleanly according to fixed-speed rules.
 */
export function speakSorobanNumber(
  num: number,
  voiceMode: "arabic" | "english" | "off",
  speedMs = 700,
  overrides?: Partial<SpeechPreferences>
) {
  if (typeof window === "undefined") return;

  // Crisp digital cue strictly synced to the digit appearance
  soundSynth.playFlashCue("number");

  const volume = getEffectiveSpeechVolume();
  if (voiceMode === "off" || volume <= 0) return;

  // At extreme rapid fixed speeds (<= 300ms), keep crisp digital cue only so speech never queues
  if (speedMs <= 300) return;

  const text = formatTermSpeechText(num, voiceMode);
  speakUnified(text, voiceMode, {
    speedMs,
    overrides,
    force: true, // Consecutive identical numbers in Flash Anzan (e.g. +2, +2) MUST both be spoken!
  });
}

/**
 * Async variant for Flash Anzan Synchronized Speech mode:
 * Speaks the full number tuned to speedMs and invokes onComplete when speech finishes.
 */
export function speakSorobanNumberAsync(
  num: number,
  voiceMode: "arabic" | "english" | "off",
  options: {
    speedMs?: number;
    minVisibleMs?: number;
    maxWaitMs?: number;
    overrides?: Partial<SpeechPreferences>;
    onComplete: () => void;
  }
): () => void {
  if (typeof window === "undefined") {
    options.onComplete();
    return () => {};
  }

  soundSynth.playFlashCue("number");

  const volume = getEffectiveSpeechVolume();
  const minVisibleMs = options.minVisibleMs ?? 320;
  const maxWaitMs = options.maxWaitMs ?? 4500;
  const startedAt = Date.now();

  let settled = false;
  let minTimer: ReturnType<typeof setTimeout> | null = null;
  let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
  let cancelSpeech: (() => void) | null = null;

  const clearTimers = () => {
    if (minTimer) {
      clearTimeout(minTimer);
      minTimer = null;
    }
    if (fallbackTimer) {
      clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }
  };

  const cleanup = () => {
    settled = true;
    clearTimers();
    if (cancelSpeech) {
      cancelSpeech();
      cancelSpeech = null;
    }
  };

  const finishRespectingMin = () => {
    if (settled) return;
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, minVisibleMs - elapsed);
    if (remaining === 0) {
      settled = true;
      clearTimers();
      options.onComplete();
    } else {
      minTimer = setTimeout(() => {
        if (!settled) {
          settled = true;
          clearTimers();
          options.onComplete();
        }
      }, remaining);
    }
  };

  if (voiceMode === "off" || volume <= 0) {
    fallbackTimer = setTimeout(finishRespectingMin, minVisibleMs);
    return cleanup;
  }

  const text = formatTermSpeechText(num, voiceMode);
  fallbackTimer = setTimeout(finishRespectingMin, maxWaitMs);

  cancelSpeech = speakUnified(text, voiceMode, {
    speedMs: options.speedMs,
    overrides: options.overrides,
    force: true,
    onComplete: finishRespectingMin,
  });

  return cleanup;
}

/**
 * Speaks a full question sequence following SUPER MIND rules (NO "زائد"/"Plus" on addition).
 */
export function speakQuestionSequence(
  series: number[],
  voiceMode: "arabic" | "english" | "off",
  overrides?: Partial<SpeechPreferences>,
  options?: { force?: boolean }
) {
  if (typeof window === "undefined") return;
  const volume = getEffectiveSpeechVolume();

  if (voiceMode === "off" || volume <= 0) {
    soundSynth.playFlashCue("number");
    return;
  }

  const parts = series.map((n) => formatTermSpeechText(n, voiceMode));
  const text = parts.join(voiceMode === "arabic" ? " ، " : ", ");

  speakUnified(text, voiceMode, {
    speedMs: 950,
    explicitRate: 1.08,
    overrides,
    force: options?.force,
  });
}

/**
 * Plays countdown ticks (3, 2, 1, Go / ابدأ) cleanly on the unified speech channel.
 */
export function speakSorobanCountdown(
  count: number,
  voiceMode: "arabic" | "english" | "off",
  overrides?: Partial<SpeechPreferences>
) {
  if (typeof window === "undefined") return;
  soundSynth.playFlashCue(count === 0 ? "ready" : "countdown");

  const volume = getEffectiveSpeechVolume();
  if (voiceMode === "off" || volume <= 0) return;

  const arMap: Record<number, string> = { 3: "ثلاثة", 2: "اثنان", 1: "واحد", 0: "ابدأ" };
  const enMap: Record<number, string> = { 3: "Three", 2: "Two", 1: "One", 0: "Go" };
  const text = voiceMode === "arabic" ? arMap[count] || "" : enMap[count] || "";
  if (!text) return;

  speakUnified(text, voiceMode, {
    explicitRate: 1.15,
    overrides,
  });
}

/**
 * Speaks a test sample phrase immediately using chosen language & voice.
 */
export function speakTestSample(
  langMode: "arabic" | "english",
  overrides?: Partial<SpeechPreferences>
): boolean {
  if (typeof window === "undefined") return false;
  const volume = getEffectiveSpeechVolume();
  if (volume <= 0) return false;

  const sampleTerms = [25, -7, 14.5];
  const sampleText = sampleTerms
    .map((t) => formatTermSpeechText(t, langMode))
    .join(langMode === "arabic" ? " ، " : ", ");

  speakUnified(sampleText, langMode, {
    explicitRate: 1.05,
    overrides,
    force: true,
  });
  return true;
}
