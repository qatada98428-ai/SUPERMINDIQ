/**
 * SUPER MIND — Smart Cloud Text-To-Speech Client (Single-Channel Hardened)
 * Guarantees at most ONE cloud audio stream plays at any moment across the entire app.
 * Uses monotonic playback sequencing so cancelled/superseded promises can never overlap or replay.
 */

import { VoiceGender } from "./speech-engine";

export interface PlayCloudSpeechOptions {
  lang: "arabic" | "english";
  gender?: VoiceGender;
  rate?: number; // 0.8 .. 1.8
  volume?: number; // 0.0 .. 1.0
  onComplete?: () => void;
}

// In-memory cache of audio URLs -> preloaded HTMLAudioElement (bounded to avoid mobile RAM bloat)
const MAX_AUDIO_CACHE = 80;
const audioCache = new Map<string, HTMLAudioElement>();
let activeAudio: HTMLAudioElement | null = null;
let activeCleanup: (() => void) | null = null;
let cloudPlaybackSeq = 0;

export function getCloudTtsUrl(
  text: string,
  lang: "arabic" | "english",
  gender: VoiceGender = "female"
): string {
  const langCode = lang === "arabic" ? "ar" : "en";
  const genderCode = gender === "male_2" ? "male_2" : gender === "male" ? "male" : "female";
  return `/api/tts?text=${encodeURIComponent(text)}&lang=${langCode}&gender=${genderCode}`;
}

/**
 * Prefetches an array of speech phrases (e.g. during the 3-2-1 countdown).
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
      if (audioCache.size >= MAX_AUDIO_CACHE) {
        const firstKey = audioCache.keys().next().value;
        if (firstKey) audioCache.delete(firstKey);
      }
      const url = getCloudTtsUrl(trimmed, lang, gender);
      const audio = new Audio(url);
      audio.preload = "auto";
      audio.load();
      audioCache.set(cacheKey, audio);
    } catch {
      // Ignore prefetch failures
    }
  }
}

/**
 * Stops any currently playing cloud audio cleanly without firing stale completion callbacks.
 */
export function stopAllCloudSpeech(): void {
  cloudPlaybackSeq += 1;
  if (typeof window === "undefined") return;

  if (activeCleanup) {
    const fn = activeCleanup;
    activeCleanup = null;
    try {
      fn();
    } catch {
      // Ignore
    }
  }

  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch {
      // Ignore
    }
    activeAudio = null;
  }
}

/**
 * Plays speech text through the Cloud TTS service with strict single-channel locking.
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

  // Stop any previous cloud audio and claim a fresh sequence ID
  stopAllCloudSpeech();
  const mySeq = ++cloudPlaybackSeq;

  const trimmed = text.trim();
  if (!trimmed) {
    options.onComplete?.();
    return () => {};
  }

  const gender = options.gender || "female";
  const cacheKey = `${options.lang}:${gender}:${trimmed}`;
  let audio = audioCache.get(cacheKey);

  if (!audio) {
    if (audioCache.size >= MAX_AUDIO_CACHE) {
      const firstKey = audioCache.keys().next().value;
      if (firstKey) audioCache.delete(firstKey);
    }
    const url = getCloudTtsUrl(trimmed, options.lang, gender);
    audio = new Audio(url);
    audio.preload = "auto";
    audioCache.set(cacheKey, audio);
  }

  try {
    audio.pause();
    audio.currentTime = 0;
  } catch {
    // Ignore
  }

  const volume = options.volume !== undefined ? Math.max(0, Math.min(1, options.volume)) : 1.0;
  audio.volume = volume;

  const baseRate = options.rate && Number.isFinite(options.rate) ? options.rate : 1.0;
  try {
    if (gender === "male") {
      audio.playbackRate = Math.max(0.65, Math.min(2.0, baseRate * 0.94));
    } else if (gender === "male_2") {
      audio.playbackRate = Math.max(0.7, Math.min(2.0, baseRate * 1.08));
    } else {
      audio.playbackRate = Math.max(0.7, Math.min(2.0, baseRate));
    }
  } catch {
    // Ignore
  }

  let settled = false;
  let safetyTimer: ReturnType<typeof setTimeout> | null = null;
  const currentAudio = audio;
  activeAudio = currentAudio;

  const detach = () => {
    if (safetyTimer) {
      clearTimeout(safetyTimer);
      safetyTimer = null;
    }
    currentAudio.removeEventListener("ended", handleFinish);
    currentAudio.removeEventListener("error", handleFinish);
    if (activeAudio === currentAudio) {
      activeAudio = null;
    }
    if (activeCleanup === cancelSelf) {
      activeCleanup = null;
    }
  };

  const handleFinish = () => {
    if (settled) return;
    settled = true;
    detach();
    // Only invoke onComplete if this playback was NOT superseded/cancelled
    if (mySeq === cloudPlaybackSeq) {
      options.onComplete?.();
    }
  };

  const cancelSelf = () => {
    if (settled) return;
    settled = true;
    detach();
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
      // Ignore
    }
  };

  activeCleanup = cancelSelf;
  currentAudio.addEventListener("ended", handleFinish, { once: true });
  currentAudio.addEventListener("error", handleFinish, { once: true });

  const playPromise = currentAudio.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        // If cancelled while play() was resolving (common on mobile Safari/Chrome!), pause immediately!
        if (settled || mySeq !== cloudPlaybackSeq) {
          try {
            currentAudio.pause();
            currentAudio.currentTime = 0;
          } catch {
            // Ignore
          }
        }
      })
      .catch(() => {
        handleFinish();
      });
  }

  // Safety fallback timer so synced modes never hang on poor networks
  safetyTimer = setTimeout(() => {
    if (!settled) {
      handleFinish();
    }
  }, 6500);

  return cancelSelf;
}
