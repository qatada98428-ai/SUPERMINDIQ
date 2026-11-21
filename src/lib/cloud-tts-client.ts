/**
/**
 * SUPER MIND — Smart Cloud Text-To-Speech Client
 * Seamlessly provides studio-quality Arabic & English narration for all devices
 * when no local OS speech package is detected, completely eliminating the "missing voice pack" error.
 */

import { VoiceGender } from "./speech-engine";

export interface PlayCloudSpeechOptions {
  lang: "arabic" | "english";
  gender?: VoiceGender;
  rate?: number; // 0.8 .. 1.8
  volume?: number; // 0.0 .. 1.0
  onComplete?: () => void;
}

// In-memory cache for audio elements to enable 0ms instantaneous replay
const audioCache = new Map<string, HTMLAudioElement>();
let activeAudio: HTMLAudioElement | null = null;
let activeOnComplete: (() => void) | null = null;

export function getCloudTtsUrl(
  text: string,
  lang: "arabic" | "english",
  gender: VoiceGender = "female"
): string {
  const langCode = lang === "arabic" ? "ar" : "en";
  const genderCode = gender === "male" ? "male" : "female";
  return `/api/tts?text=${encodeURIComponent(text)}&lang=${langCode}&gender=${genderCode}`;
}

/**
 * Prefetches an array of speech phrases (e.g. during the 3-2-1 countdown).
 * Ensures that when numbers flash, audio is already fully buffered in memory.
 */
export function prefetchCloudSpeech(
  phrases: string[],
  lang: "arabic" | "english",
  gender: VoiceGender = "female"
): void {
  if (typeof window === "undefined") return;

  for (const phrase of phrases) {
    const trimmed = phrase.trim();
    if (!trimmed) continue;
    const cacheKey = `${lang}:${gender}:${trimmed}`;
    if (audioCache.has(cacheKey)) continue;

    try {
      const url = getCloudTtsUrl(trimmed, lang, gender);
      const audio = new Audio(url);
      audio.preload = "auto";
      // Load into memory
      audio.load();
      audioCache.set(cacheKey, audio);
    } catch {
      // Ignore prefetch failures
    }
  }
}

/**
 * Stops any currently playing cloud audio cleanly.
 */
export function stopAllCloudSpeech(): void {
  if (typeof window === "undefined") return;
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch {
      // Ignore
    }
    activeAudio = null;
  }
  if (activeOnComplete) {
    const cb = activeOnComplete;
    activeOnComplete = null;
    cb();
  }
}

/**
 * Plays speech text through the Cloud TTS service with caching and error fallbacks.
 * Returns a cancel function to stop speech immediately.
 */
export function playCloudSpeech(
  text: string,
  options: PlayCloudSpeechOptions
): () => void {
  if (typeof window === "undefined") {
    options.onComplete?.();
    return () => {};
  }

  stopAllCloudSpeech();

  const trimmed = text.trim();
  if (!trimmed) {
    options.onComplete?.();
    return () => {};
  }

  const gender = options.gender || "female";
  const cacheKey = `${options.lang}:${gender}:${trimmed}`;
  let audio = audioCache.get(cacheKey);

  if (!audio) {
    const url = getCloudTtsUrl(trimmed, options.lang, gender);
    audio = new Audio(url);
    audio.preload = "auto";
    audioCache.set(cacheKey, audio);
  }

  // Clone or reuse clean instance
  try {
    audio.currentTime = 0;
  } catch {
    // Ignore
  }

  const volume = options.volume !== undefined ? Math.max(0, Math.min(1, options.volume)) : 1.0;
  audio.volume = volume;

  // Rate tuning (playbackRate works smoothly on HTMLAudioElement in all modern browsers)
  if (options.rate && Number.isFinite(options.rate)) {
    try {
      audio.playbackRate = Math.max(0.7, Math.min(2.0, options.rate));
    } catch {
      // Ignore
    }
  }

  let settled = false;
  activeAudio = audio;

  const handleFinish = () => {
    if (settled) return;
    settled = true;
    cleanup();
    options.onComplete?.();
  };

  const cleanup = () => {
    if (activeAudio === audio) {
      activeAudio = null;
      activeOnComplete = null;
    }
    audio?.removeEventListener("ended", handleFinish);
    audio?.removeEventListener("error", handleFinish);
  };

  activeOnComplete = options.onComplete || null;

  audio.addEventListener("ended", handleFinish, { once: true });
  audio.addEventListener("error", handleFinish, { once: true });

  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch((err) => {
      // Autoplay restriction or network error -> finish gracefully so app doesn't stall
      console.warn("Cloud TTS playback error:", err);
      handleFinish();
    });
  }

  // Safety fallback timer: ensure onComplete is invoked if audio hangs
  const safetyTimer = setTimeout(() => {
    if (!settled) {
      handleFinish();
    }
  }, 6000);

  return () => {
    clearTimeout(safetyTimer);
    if (!settled) {
      settled = true;
      cleanup();
      try {
        audio?.pause();
        if (audio) audio.currentTime = 0;
      } catch {
        // Ignore
      }
    }
  };
}
