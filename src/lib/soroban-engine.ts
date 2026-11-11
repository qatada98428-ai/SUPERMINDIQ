/**
 * SUPER MIND — Soroban & Mental Arithmetic Engine
 * Complete decoupled mathematical calculation engine for Soroban and Flash Anzan
 */

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
 * Checks if adding addDigit (1..9) to currentDigit (0..9) on a single rod is Direct / Simple
 * Direct addition means beads can be pushed directly without using 5-decomposition or 10-carry.
 */
export function isSimpleAddition(current: number, add: number): boolean {
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
 * Checks if subtracting subDigit (1..9) from currentDigit (0..9) on a single rod is Direct / Simple
 */
export function isSimpleSubtraction(current: number, sub: number): boolean {
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
 * Conditions:
 * Requires carrying 1 to the tens rod (u + add >= 10).
 * For rule 1: u must be 9 (9 + 1 = 10).
 * For rule 2: u must be 8 or 9.
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
 * Conditions:
 * Total must be >= 10 (or >= sub), and units digit is less than sub (requiring 10 borrow).
 * For rule 1: u must be 0 (10 - 1 = 9, 20 - 1 = 19...).
 * For rule 2: u must be 0 or 1 (10 - 2 = 8, 11 - 2 = 9...).
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

export function generateFlashAnzanSeries(config: FlashAnzanConfig): number[] {
  const { termsCount, digitsCount, allowSubtraction, level, targetRules, targetRule } = config;

  let activeRules: number[] = [];
  if (targetRules && targetRules.length > 0) {
    activeRules = targetRules;
  } else if (targetRule !== undefined) {
    activeRules = [targetRule];
  } else if (level === "complex_5") {
    activeRules = [1, 2, 3, 4];
  } else if (level === "complex_10") {
    activeRules = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  }

  const min = Math.pow(10, digitsCount - 1);
  const max = Math.pow(10, digitsCount) - 1;

  // Try generating a natural, non-monotonous sequence where target rules occur organically
  for (let attempt = 0; attempt < 70; attempt++) {
    const series: number[] = [];
    let runningTotal = 0;
    let targetRuleAppliedCount = 0;

    // STEP 0: Natural varied starting number (e.g., 2, 3, 1, or sometimes direct setup)
    let startNum = 0;
    if (level === "complex_5" && activeRules.length > 0) {
      if (Math.random() < 0.35) {
        // Direct setup start
        const r = activeRules[Math.floor(Math.random() * activeRules.length)];
        const wantSub = allowSubtraction && Math.random() < 0.5;
        if (wantSub) {
          const validUnits: number[] = [];
          for (let u = 5; u <= 5 + r - 1; u++) validUnits.push(u);
          startNum = validUnits[Math.floor(Math.random() * validUnits.length)];
        } else {
          const validUnits: number[] = [];
          for (let u = 5 - r; u <= 4; u++) validUnits.push(u);
          startNum = validUnits[Math.floor(Math.random() * validUnits.length)];
        }
      } else {
        // Natural varied start (1, 2, 3, etc.)
        startNum = Math.floor(Math.random() * 3) + 1;
      }
    } else if (level === "complex_10" && activeRules.length > 0) {
      if (Math.random() < 0.35) {
        const r = activeRules[Math.floor(Math.random() * activeRules.length)];
        const wantSub = allowSubtraction && Math.random() < 0.5;
        if (wantSub) {
          startNum = 10;
        } else {
          startNum = 10 - r + Math.floor(Math.random() * r);
        }
      } else {
        startNum = Math.floor(Math.random() * 6) + 2; // 2, 3, 4, 5, 6, 7
      }
    } else {
      startNum = Math.floor(Math.random() * (max - min + 1)) + min;
    }

    if (digitsCount > 1) {
      const high = Math.floor(Math.random() * (Math.pow(10, digitsCount - 1) - 1) + 1) * 10;
      startNum += high;
    }

    series.push(startNum);
    runningTotal = startNum;

    // STEPS 1 .. termsCount - 1
    for (let step = 1; step < termsCount; step++) {
      const u = runningTotal % 10;
      const targetCandidates: { val: number }[] = [];

      if (level === "complex_5") {
        for (const r of activeRules) {
          if (isFriendsOf5Addition(runningTotal, r)) targetCandidates.push({ val: r });
          if (allowSubtraction && isFriendsOf5Subtraction(runningTotal, r)) targetCandidates.push({ val: -r });
        }
      } else if (level === "complex_10") {
        for (const r of activeRules) {
          if (isFriendsOf10Addition(runningTotal, r)) targetCandidates.push({ val: r });
          if (allowSubtraction && isFriendsOf10Subtraction(runningTotal, r)) targetCandidates.push({ val: -r });
        }
      }

      // If target rule moves are available, execute one (prioritize if not applied yet, or 60% chance)
      if (targetCandidates.length > 0 && (targetRuleAppliedCount === 0 || Math.random() < 0.6)) {
        const picked = targetCandidates[Math.floor(Math.random() * targetCandidates.length)];
        let val = picked.val;
        if (digitsCount > 1) {
          const high = Math.floor(Math.random() * Math.pow(10, digitsCount - 1)) * 10;
          val = val > 0 ? val + high : val - high;
        }
        series.push(val);
        runningTotal += val;
        targetRuleAppliedCount++;
        continue;
      }

      // Natural Bridge Moves (Simple additions / subtractions that guide the beads toward the target state)
      const bridgeMoves: number[] = [];
      if (level === "complex_5") {
        const targetR = activeRules[Math.floor(Math.random() * activeRules.length)];
        const desiredUnits: number[] = [];
        for (let du = 5 - targetR; du <= 4; du++) desiredUnits.push(du);

        for (let d = 1; d <= 4; d++) {
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
      } else if (level === "complex_10") {
        const targetR = activeRules[Math.floor(Math.random() * activeRules.length)];
        const desiredUnits: number[] = [];
        for (let du = 10 - targetR; du <= 9; du++) desiredUnits.push(du);

        for (let d = 1; d <= 9; d++) {
          if (u + d <= 9) {
            const nextU = u + d;
            const weight = desiredUnits.includes(nextU) ? 4 : 1;
            for (let k = 0; k < weight; k++) bridgeMoves.push(d);
          }
          if (allowSubtraction && u - d >= 0 && runningTotal - d >= 0) {
            bridgeMoves.push(-d);
          }
        }
      } else {
        // Simple level
        for (let d = 1; d <= 9; d++) {
          if (isSimpleAddition(u, d)) bridgeMoves.push(d);
          if (allowSubtraction && isSimpleSubtraction(u, d) && runningTotal - d >= 0) bridgeMoves.push(-d);
        }
      }

      if (bridgeMoves.length > 0) {
        let move = bridgeMoves[Math.floor(Math.random() * bridgeMoves.length)];
        if (digitsCount > 1) {
          const high = Math.floor(Math.random() * Math.pow(10, digitsCount - 1)) * 10;
          move = move > 0 ? move + high : move - high;
        }
        series.push(move);
        runningTotal += move;
      } else {
        const fallback = (allowSubtraction && runningTotal > 2) ? -1 : 1;
        series.push(fallback);
        runningTotal += fallback;
      }
    }

    // Ensure the target rule was applied at least once in the series
    if ((level === "complex_5" || level === "complex_10") && targetRuleAppliedCount === 0) {
      continue;
    }

    return series;
  }

  // Graceful fallback if strict generation times out
  return [2, 2, 1];
}

import { soundSynth } from "@/lib/audio-synthesizer";

/**
 * Comfortable & Soothing Sound Player
 */
export function playSoundEffect(type: "beep" | "correct" | "wrong") {
  if (typeof window === "undefined") return;
  try {
    if (type === "beep") {
      soundSynth.playFlashBeep(0.22);
    } else if (type === "correct") {
      soundSynth.playSuccessChime(0.28);
    } else if (type === "wrong") {
      soundSynth.playEncouragingMistake(0.22);
    }
  } catch {
    // Ignore audio errors
  }
}
