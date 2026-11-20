/**
 * SUPER MIND — Full-Number Arabic & English Speech Engine
 * Reads whole numbers, negatives, and decimals strictly in full (never digit-by-digit).
 * Follows Soroban arithmetic rules:
 *  - Addition: speaks the number directly without "زائد" or "Plus".
 *  - Subtraction / Negative: speaks "ناقص" / "Minus" once before the number.
 */

export type SpeechLanguageMode = "arabic" | "english" | "off";
export type FlashTimingMode = "fixed" | "synced";
export type VoiceGender = "male" | "female" | "unknown";

export interface RealVoiceOption {
  voiceURI: string;
  name: string;
  lang: string;
  gender: VoiceGender;
  localService: boolean;
}

export interface LanguageVoiceCatalog {
  male: RealVoiceOption[];
  female: RealVoiceOption[];
  other: RealVoiceOption[];
  all: RealVoiceOption[];
}

export interface SpeechPreferences {
  voiceMode: SpeechLanguageMode;
  voiceUriAr: string; // "" = auto-select best available voice
  voiceUriEn: string; // "" = auto-select best available voice
  speechRate: number; // 0.5 .. 2.0
  speechPitch: number; // 0.5 .. 1.8
  speechVolume: number; // 0.0 .. 1.0
  flashTimingMode: FlashTimingMode;
}

export const SPEECH_STORAGE_KEYS = {
  VOICE_MODE: "supermind_voice_mode",
  VOICE_URI_AR: "supermind_voice_uri_ar",
  VOICE_URI_EN: "supermind_voice_uri_en",
  SPEECH_RATE: "supermind_speech_rate",
  SPEECH_PITCH: "supermind_speech_pitch",
  SPEECH_VOLUME: "supermind_speech_volume",
  FLASH_TIMING_MODE: "supermind_flash_timing_mode",
} as const;

export const DEFAULT_SPEECH_PREFERENCES: SpeechPreferences = {
  voiceMode: "arabic",
  voiceUriAr: "",
  voiceUriEn: "",
  speechRate: 1.2,
  speechPitch: 1.0,
  speechVolume: 0.95,
  flashTimingMode: "fixed",
};

function clamp(val: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(val)) return fallback;
  return Math.max(min, Math.min(max, val));
}

export function loadSpeechPreferences(): SpeechPreferences {
  const prefs: SpeechPreferences = { ...DEFAULT_SPEECH_PREFERENCES };
  if (typeof window === "undefined") return prefs;

  try {
    const mode = localStorage.getItem(SPEECH_STORAGE_KEYS.VOICE_MODE);
    if (mode === "arabic" || mode === "english" || mode === "off") {
      prefs.voiceMode = mode;
    }
    const uriAr = localStorage.getItem(SPEECH_STORAGE_KEYS.VOICE_URI_AR);
    if (uriAr !== null) prefs.voiceUriAr = uriAr;

    const uriEn = localStorage.getItem(SPEECH_STORAGE_KEYS.VOICE_URI_EN);
    if (uriEn !== null) prefs.voiceUriEn = uriEn;

    const rate = localStorage.getItem(SPEECH_STORAGE_KEYS.SPEECH_RATE);
    if (rate !== null) prefs.speechRate = clamp(Number(rate), 0.5, 2.0, 1.2);

    const pitch = localStorage.getItem(SPEECH_STORAGE_KEYS.SPEECH_PITCH);
    if (pitch !== null) prefs.speechPitch = clamp(Number(pitch), 0.5, 1.8, 1.0);

    const vol = localStorage.getItem(SPEECH_STORAGE_KEYS.SPEECH_VOLUME);
    if (vol !== null) prefs.speechVolume = clamp(Number(vol), 0, 1, 0.95);

    const timing = localStorage.getItem(SPEECH_STORAGE_KEYS.FLASH_TIMING_MODE);
    if (timing === "fixed" || timing === "synced") {
      prefs.flashTimingMode = timing;
    }
  } catch {
    // Graceful fallback when storage is restricted
  }
  return prefs;
}

export function saveSpeechPreferences(prefs: SpeechPreferences): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SPEECH_STORAGE_KEYS.VOICE_MODE, prefs.voiceMode);
    localStorage.setItem(SPEECH_STORAGE_KEYS.VOICE_URI_AR, prefs.voiceUriAr);
    localStorage.setItem(SPEECH_STORAGE_KEYS.VOICE_URI_EN, prefs.voiceUriEn);
    localStorage.setItem(SPEECH_STORAGE_KEYS.SPEECH_RATE, String(prefs.speechRate));
    localStorage.setItem(SPEECH_STORAGE_KEYS.SPEECH_PITCH, String(prefs.speechPitch));
    localStorage.setItem(SPEECH_STORAGE_KEYS.SPEECH_VOLUME, String(prefs.speechVolume));
    localStorage.setItem(SPEECH_STORAGE_KEYS.FLASH_TIMING_MODE, prefs.flashTimingMode);
  } catch {
    // Ignore quota errors
  }
}

// =========================================================================
// FULL ARABIC & ENGLISH NUMBER-TO-WORDS VERBALIZATION
// =========================================================================

const ARABIC_ONES = [
  "صفر", "واحد", "اثنان", "ثلاثة", "أربعة",
  "خمسة", "ستة", "سبعة", "ثمانية", "تسعة",
  "عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر",
  "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر",
];

const ARABIC_TENS = [
  "", "", "عشرون", "ثلاثون", "أربعون",
  "خمسون", "ستون", "سبعون", "ثمانون", "تسعون",
];

const ARABIC_HUNDREDS = [
  "", "مئة", "مئتان", "ثلاثمئة", "أربعمئة",
  "خمسمئة", "ستمئة", "سبعمئة", "ثمانمئة", "تسعمئة",
];

function integerToArabicWords(n: number): string {
  const num = Math.floor(Math.abs(n));
  if (num < 20) return ARABIC_ONES[num];

  if (num < 100) {
    const u = num % 10;
    const t = Math.floor(num / 10);
    return u === 0 ? ARABIC_TENS[t] : `${ARABIC_ONES[u]} و${ARABIC_TENS[t]}`;
  }

  if (num < 1000) {
    const h = Math.floor(num / 100);
    const rem = num % 100;
    return rem === 0
      ? ARABIC_HUNDREDS[h]
      : `${ARABIC_HUNDREDS[h]} و${integerToArabicWords(rem)}`;
  }

  if (num < 1_000_000) {
    const thousands = Math.floor(num / 1000);
    const rem = num % 1000;
    let thousandText = "";
    if (thousands === 1) {
      thousandText = "ألف";
    } else if (thousands === 2) {
      thousandText = "ألفان";
    } else if (thousands >= 3 && thousands <= 10) {
      thousandText = `${ARABIC_ONES[thousands]} آلاف`;
    } else {
      thousandText = `${integerToArabicWords(thousands)} ألفًا`;
    }
    return rem === 0
      ? thousandText
      : `${thousandText} و${integerToArabicWords(rem)}`;
  }

  if (num < 1_000_000_000) {
    const millions = Math.floor(num / 1_000_000);
    const rem = num % 1_000_000;
    let millionText = "";
    if (millions === 1) {
      millionText = "مليون";
    } else if (millions === 2) {
      millionText = "مليونان";
    } else if (millions >= 3 && millions <= 10) {
      millionText = `${ARABIC_ONES[millions]} ملايين`;
    } else {
      millionText = `${integerToArabicWords(millions)} مليونًا`;
    }
    return rem === 0
      ? millionText
      : `${millionText} و${integerToArabicWords(rem)}`;
  }

  return String(num);
}

const ENGLISH_ONES = [
  "Zero", "One", "Two", "Three", "Four",
  "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen",
  "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];

const ENGLISH_TENS = [
  "", "", "Twenty", "Thirty", "Forty",
  "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function integerToEnglishWords(n: number): string {
  const num = Math.floor(Math.abs(n));
  if (num < 20) return ENGLISH_ONES[num];

  if (num < 100) {
    const u = num % 10;
    const t = Math.floor(num / 10);
    return u === 0 ? ENGLISH_TENS[t] : `${ENGLISH_TENS[t]}-${ENGLISH_ONES[u].toLowerCase()}`;
  }

  if (num < 1000) {
    const h = Math.floor(num / 100);
    const rem = num % 100;
    return rem === 0
      ? `${ENGLISH_ONES[h]} hundred`
      : `${ENGLISH_ONES[h]} hundred ${integerToEnglishWords(rem).toLowerCase()}`;
  }

  if (num < 1_000_000) {
    const thousands = Math.floor(num / 1000);
    const rem = num % 1000;
    const prefix = `${integerToEnglishWords(thousands)} thousand`;
    return rem === 0
      ? prefix
      : `${prefix} ${integerToEnglishWords(rem).toLowerCase()}`;
  }

  if (num < 1_000_000_000) {
    const millions = Math.floor(num / 1_000_000);
    const rem = num % 1_000_000;
    const prefix = `${integerToEnglishWords(millions)} million`;
    return rem === 0
      ? prefix
      : `${prefix} ${integerToEnglishWords(rem).toLowerCase()}`;
  }

  return String(num);
}

function normalizeDecimalAbsString(n: number): string {
  if (!Number.isFinite(n)) return "0";
  const abs = Math.abs(n);
  if (Number.isInteger(abs)) return String(abs);
  // Clean floating point artifacts (e.g., 12.300000000000001 -> "12.3")
  return Number(abs.toFixed(6)).toString();
}

/**
 * Converts a non-negative magnitude (integer or decimal) into full Arabic words.
 */
export function numberToArabicWords(n: number): string {
  const cleaned = normalizeDecimalAbsString(n);
  const parts = cleaned.split(".");
  const intText = integerToArabicWords(Number(parts[0] || "0"));
  if (parts.length === 1 || !parts[1]) return intText;

  const fracRaw = parts[1];
  const leadingZeros = fracRaw.match(/^0+/)?.[0].length ?? 0;
  const zeroWords = leadingZeros > 0 ? `${Array(leadingZeros).fill("صفر").join(" ")} ` : "";
  const fracNum = Number(fracRaw);
  const fracText = fracNum > 0 ? integerToArabicWords(fracNum) : "";
  return `${intText} فاصلة ${zeroWords}${fracText}`.trim();
}

/**
 * Converts a non-negative magnitude (integer or decimal) into full English words.
 */
export function numberToEnglishWords(n: number): string {
  const cleaned = normalizeDecimalAbsString(n);
  const parts = cleaned.split(".");
  const intText = integerToEnglishWords(Number(parts[0] || "0"));
  if (parts.length === 1 || !parts[1]) return intText;

  const fracRaw = parts[1];
  const leadingZeros = fracRaw.match(/^0+/)?.[0].length ?? 0;
  const zeroWords = leadingZeros > 0 ? `${Array(leadingZeros).fill("zero").join(" ")} ` : "";
  const fracNum = Number(fracRaw);
  const fracText = fracNum > 0 ? integerToEnglishWords(fracNum).toLowerCase() : "";
  return `${intText} point ${zeroWords}${fracText}`.trim();
}

/**
 * Formats an arithmetic term strictly following SUPER MIND rules:
 * - Positive / Addition term: speaks the number ONLY (NO "زائد" or "Plus").
 * - Negative / Subtraction term: speaks "ناقص" / "Minus" ONCE before magnitude.
 */
export function formatTermSpeechText(
  value: number,
  lang: "arabic" | "english",
  options?: { isSubtraction?: boolean }
): string {
  const isNegative = value < 0 || (Boolean(options?.isSubtraction) && value >= 0);
  const abs = Math.abs(value);
  const words =
    lang === "arabic" ? numberToArabicWords(abs) : numberToEnglishWords(abs);

  if (abs === 0) return words;
  if (!isNegative) return words;
  return lang === "arabic" ? `ناقص ${words}` : `Minus ${words}`;
}

// =========================================================================
// REAL BROWSER VOICE DISCOVERY & CLASSIFICATION (NO MOCK VOICES)
// =========================================================================

const ARABIC_FEMALE_PATTERNS = [
  "hoda", "salma", "mariam", "laila", "leila", "amira", "rana",
  "nour", "fatima", "zahra", "sara", "reem", "female", "zena", "layla",
  "سلمى", "هدى", "مريم", "ليلى", "زينة", "سارة",
];
const ARABIC_MALE_PATTERNS = [
  "naayf", "shakir", "tarik", "maged", "hamdan", "jamal", "omar",
  "khaled", "youssef", "zaid", "male", "bassel", "rami",
  "نايف", "شاكر", "طارق", "ماجد", "عمر", "حمدان",
];

const ENGLISH_FEMALE_PATTERNS = [
  "zira", "jenny", "aria", "sara", "michelle", "samantha", "victoria",
  "karen", "kate", "libby", "sonia", "serena", "fiona", "ava", "allison",
  "susan", "moira", "tessa", "hazel", "female", "english united states female",
];
const ENGLISH_MALE_PATTERNS = [
  "david", "mark", "guy", "andrew", "brian", "ryan", "daniel", "oliver",
  "arthur", "alex", "fred", "christopher", "eric", "george", "richard",
  "male", "english united kingdom male", "rishi", "james",
];

export function classifyVoiceGender(
  name: string,
  langMode: "arabic" | "english"
): VoiceGender {
  const low = name.toLowerCase();
  const femaleList =
    langMode === "arabic" ? ARABIC_FEMALE_PATTERNS : ENGLISH_FEMALE_PATTERNS;
  const maleList =
    langMode === "arabic" ? ARABIC_MALE_PATTERNS : ENGLISH_MALE_PATTERNS;

  if (femaleList.some((p) => low.includes(p))) return "female";
  if (maleList.some((p) => low.includes(p))) return "male";
  return "unknown";
}

function scoreVoiceQuality(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase();
  let score = 0;
  if (name.includes("natural")) score += 40;
  if (name.includes("neural") || name.includes("online")) score += 30;
  if (name.includes("google") || name.includes("microsoft") || name.includes("apple")) score += 20;
  if (v.localService) score += 10;
  if (v.default) score += 5;
  return score;
}

/**
 * Inspects real OS/Browser SpeechSynthesis voices and returns up to 3 Male + 3 Female
 * (plus unclassified real OS voices) strictly for what is genuinely available on this device.
 */
export function discoverRealVoices(
  rawVoices: SpeechSynthesisVoice[],
  langMode: "arabic" | "english"
): LanguageVoiceCatalog {
  const prefix = langMode === "arabic" ? "ar" : "en";
  const matching = rawVoices
    .filter((v) => v.lang.toLowerCase().startsWith(prefix))
    .sort((a, b) => scoreVoiceQuality(b) - scoreVoiceQuality(a));

  const seenUri = new Set<string>();
  const male: RealVoiceOption[] = [];
  const female: RealVoiceOption[] = [];
  const other: RealVoiceOption[] = [];

  for (const v of matching) {
    if (seenUri.has(v.voiceURI)) continue;
    seenUri.add(v.voiceURI);

    const gender = classifyVoiceGender(v.name, langMode);
    const option: RealVoiceOption = {
      voiceURI: v.voiceURI,
      name: v.name,
      lang: v.lang,
      gender,
      localService: v.localService,
    };

    if (gender === "male") {
      if (male.length < 3) male.push(option);
    } else if (gender === "female") {
      if (female.length < 3) female.push(option);
    } else {
      if (other.length < 3) other.push(option);
    }
  }

  return {
    male,
    female,
    other,
    all: [...male, ...female, ...other],
  };
}
