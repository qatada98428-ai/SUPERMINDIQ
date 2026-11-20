/**
 * SUPER MIND — Studio Audio Engine for Soft 3D Adventure
 * Uses lightweight pre-rendered WAV SoundBuffers via Web Audio API with
 * per-channel anti-overlap management, dynamics limiting, and zero-latency
 * Flash Anzan scheduling + synthesized oscillator fallback.
 */

export type SoundId =
  | "flash-countdown"
  | "flash-ready"
  | "flash-number"
  | "flash-complete"
  | "correct"
  | "combo"
  | "complete"
  | "excellent"
  | "level-up"
  | "wrong"
  | "ui-click"
  | "ui-toggle"
  | "modal-open"
  | "modal-close"
  | "soroban-bead";

type AudioChannel = "flash" | "celebration" | "ui" | "soroban";

export interface AudioPreferences {
  masterEnabled: boolean;
  masterVolume: number; // 0..1
  flashEnabled: boolean;
  flashVolume: number; // 0..1
}

export const AUDIO_STORAGE_KEYS = {
  MASTER_ENABLED: "supermind_sound",
  MASTER_VOLUME: "supermind_sound_volume",
  FLASH_ENABLED: "supermind_flash_sound",
  FLASH_VOLUME: "supermind_flash_sound_volume",
} as const;

const SOUND_FILES: Record<SoundId, string> = {
  "flash-countdown": "/sounds/flash-countdown.wav",
  "flash-ready": "/sounds/flash-ready.wav",
  "flash-number": "/sounds/flash-number.wav",
  "flash-complete": "/sounds/flash-complete.wav",
  correct: "/sounds/correct.wav",
  combo: "/sounds/combo.wav",
  complete: "/sounds/complete.wav",
  excellent: "/sounds/excellent.wav",
  "level-up": "/sounds/level-up.wav",
  wrong: "/sounds/wrong.wav",
  "ui-click": "/sounds/ui-click.wav",
  "ui-toggle": "/sounds/ui-toggle.wav",
  "modal-open": "/sounds/modal-open.wav",
  "modal-close": "/sounds/modal-close.wav",
  "soroban-bead": "/sounds/soroban-bead.wav",
};

const SOUND_CHANNEL: Record<SoundId, AudioChannel> = {
  "flash-countdown": "flash",
  "flash-ready": "flash",
  "flash-number": "flash",
  "flash-complete": "flash",
  correct: "celebration",
  combo: "celebration",
  complete: "celebration",
  excellent: "celebration",
  "level-up": "celebration",
  wrong: "celebration",
  "ui-click": "ui",
  "ui-toggle": "ui",
  "modal-open": "ui",
  "modal-close": "ui",
  "soroban-bead": "soroban",
};

const SOUND_MIN_COOLDOWN_MS: Record<SoundId, number> = {
  "flash-countdown": 40,
  "flash-ready": 80,
  "flash-number": 16,
  "flash-complete": 80,
  correct: 70,
  combo: 70,
  complete: 180,
  excellent: 220,
  "level-up": 200,
  wrong: 120,
  "ui-click": 40,
  "ui-toggle": 40,
  "modal-open": 100,
  "modal-close": 100,
  "soroban-bead": 16,
};

function clamp01(val: number): number {
  if (!Number.isFinite(val)) return 0.8;
  return Math.max(0, Math.min(1, val));
}

export function loadStoredAudioPreferences(): AudioPreferences {
  const defaults: AudioPreferences = {
    masterEnabled: true,
    masterVolume: 0.8,
    flashEnabled: true,
    flashVolume: 0.85,
  };
  if (typeof window === "undefined") return defaults;

  try {
    const rawEnabled = localStorage.getItem(AUDIO_STORAGE_KEYS.MASTER_ENABLED);
    if (rawEnabled !== null) defaults.masterEnabled = rawEnabled === "true";

    const rawVol = localStorage.getItem(AUDIO_STORAGE_KEYS.MASTER_VOLUME);
    if (rawVol !== null) defaults.masterVolume = clamp01(Number(rawVol));

    const rawFlashEnabled = localStorage.getItem(AUDIO_STORAGE_KEYS.FLASH_ENABLED);
    if (rawFlashEnabled !== null) defaults.flashEnabled = rawFlashEnabled === "true";

    const rawFlashVol = localStorage.getItem(AUDIO_STORAGE_KEYS.FLASH_VOLUME);
    if (rawFlashVol !== null) defaults.flashVolume = clamp01(Number(rawFlashVol));
  } catch {
    // Fallback cleanly if storage is unavailable
  }
  return defaults;
}

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private buffers = new Map<SoundId, AudioBuffer>();
  private loadingPromises = new Map<SoundId, Promise<AudioBuffer | null>>();
  private activeChannelSource = new Map<AudioChannel, { source: AudioBufferSourceNode; gain: GainNode }>();
  private lastPlayedAt = new Map<SoundId, number>();
  private preferences: AudioPreferences = {
    masterEnabled: true,
    masterVolume: 0.8,
    flashEnabled: true,
    flashVolume: 0.85,
  };
  private hydratedFromStorage = false;
  private preloadStarted = false;

  private ensurePreferencesHydrated() {
    if (this.hydratedFromStorage || typeof window === "undefined") return;
    this.preferences = loadStoredAudioPreferences();
    this.hydratedFromStorage = true;
  }

  getPreferences(): AudioPreferences {
    this.ensurePreferencesHydrated();
    return { ...this.preferences };
  }

  setPreferences(partial: Partial<AudioPreferences>) {
    this.ensurePreferencesHydrated();
    if (typeof partial.masterEnabled === "boolean") {
      this.preferences.masterEnabled = partial.masterEnabled;
    }
    if (typeof partial.masterVolume === "number") {
      this.preferences.masterVolume = clamp01(partial.masterVolume);
    }
    if (typeof partial.flashEnabled === "boolean") {
      this.preferences.flashEnabled = partial.flashEnabled;
    }
    if (typeof partial.flashVolume === "number") {
      this.preferences.flashVolume = clamp01(partial.flashVolume);
    }

    if (!this.preferences.masterEnabled) {
      this.stopAllActive();
    } else if (!this.preferences.flashEnabled) {
      this.stopChannel("flash");
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    this.ensurePreferencesHydrated();

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx({ latencyHint: "interactive" });
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-10, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(12, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(6, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime);
        this.compressor.connect(this.ctx.destination);
      }
    }

    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  private getOutputNode(ctx: AudioContext): AudioNode {
    return this.compressor || ctx.destination;
  }

  /**
   * Unlocks Web Audio on mobile/Safari/Chrome and preloads lightweight WAV buffers.
   */
  unlockAndPreload(priorityFlash = false) {
    const ctx = this.getContext();
    if (!ctx) return;

    if (priorityFlash) {
      this.preloadList([
        "flash-countdown",
        "flash-ready",
        "flash-number",
        "flash-complete",
        "correct",
        "combo",
        "wrong",
      ]);
      return;
    }

    if (this.preloadStarted) return;
    this.preloadStarted = true;
    const allIds = Object.keys(SOUND_FILES) as SoundId[];
    this.preloadList(allIds);
  }

  preloadFlashSounds() {
    this.unlockAndPreload(true);
  }

  private preloadList(ids: SoundId[]) {
    for (const id of ids) {
      void this.loadBuffer(id);
    }
  }

  private loadBuffer(id: SoundId): Promise<AudioBuffer | null> {
    if (this.buffers.has(id)) {
      return Promise.resolve(this.buffers.get(id)!);
    }
    const pending = this.loadingPromises.get(id);
    if (pending) return pending;

    const ctx = this.getContext();
    if (!ctx) return Promise.resolve(null);

    const promise = fetch(SOUND_FILES[id])
      .then((res) => (res.ok ? res.arrayBuffer() : null))
      .then((arr) => (arr ? ctx.decodeAudioData(arr) : null))
      .then((decoded) => {
        if (decoded) this.buffers.set(id, decoded);
        this.loadingPromises.delete(id);
        return decoded;
      })
      .catch(() => {
        this.loadingPromises.delete(id);
        return null;
      });

    this.loadingPromises.set(id, promise);
    return promise;
  }

  private stopChannel(channel: AudioChannel) {
    const active = this.activeChannelSource.get(channel);
    const ctx = this.ctx;
    if (!active || !ctx) return;

    try {
      const now = ctx.currentTime;
      active.gain.gain.cancelScheduledValues(now);
      active.gain.gain.setTargetAtTime(0.0001, now, 0.008);
      active.source.stop(now + 0.025);
    } catch {
      // Ignore already-stopped nodes
    }
    this.activeChannelSource.delete(channel);
  }

  stopAllActive() {
    (["flash", "celebration", "ui", "soroban"] as AudioChannel[]).forEach((ch) =>
      this.stopChannel(ch)
    );
  }

  /**
   * Central playback gate: checks mute/volume, prevents spam/overlap, plays buffer or crisp synth fallback.
   */
  playSound(
    id: SoundId,
    options?: { playbackRate?: number; gainScale?: number; bypassThrottle?: boolean }
  ) {
    this.ensurePreferencesHydrated();
    if (!this.preferences.masterEnabled || this.preferences.masterVolume <= 0.005) {
      return;
    }

    const channel = SOUND_CHANNEL[id];
    if (channel === "flash") {
      if (!this.preferences.flashEnabled || this.preferences.flashVolume <= 0.005) {
        return;
      }
    }

    const nowMs = typeof performance !== "undefined" ? performance.now() : Date.now();
    const minCooldown = SOUND_MIN_COOLDOWN_MS[id] ?? 40;
    const prevMs = this.lastPlayedAt.get(id) ?? 0;
    if (!options?.bypassThrottle && nowMs - prevMs < minCooldown) {
      return;
    }
    this.lastPlayedAt.set(id, nowMs);

    const ctx = this.getContext();
    if (!ctx) return;

    // Trigger preload lazily if not yet buffered
    if (!this.preloadStarted) {
      this.unlockAndPreload(false);
    }

    const scale = options?.gainScale ?? 1;
    const channelVol =
      channel === "flash"
        ? this.preferences.masterVolume * this.preferences.flashVolume
        : this.preferences.masterVolume;
    const targetVolume = clamp01(channelVol * scale);
    if (targetVolume <= 0.005) return;

    // Prevent harsh overlapping tails inside celebration & high-speed flash channels
    if (channel === "celebration" || id === "flash-number" || id === "flash-countdown") {
      this.stopChannel(channel);
    }

    const buffer = this.buffers.get(id);
    if (buffer) {
      try {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        if (options?.playbackRate && Number.isFinite(options.playbackRate)) {
          source.playbackRate.setValueAtTime(
            Math.max(0.75, Math.min(1.5, options.playbackRate)),
            ctx.currentTime
          );
        }

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(targetVolume, ctx.currentTime);

        source.connect(gain);
        gain.connect(this.getOutputNode(ctx));

        if (channel !== "ui") {
          this.activeChannelSource.set(channel, { source, gain });
          source.onended = () => {
            const cur = this.activeChannelSource.get(channel);
            if (cur?.source === source) {
              this.activeChannelSource.delete(channel);
            }
          };
        }

        source.start(ctx.currentTime);
        return;
      } catch {
        // Fallback smoothly to Web Audio synthesis below
      }
    } else {
      void this.loadBuffer(id);
    }

    this.playSynthesizedFallback(id, targetVolume, options?.playbackRate);
  }

  private playSynthesizedFallback(id: SoundId, volume: number, playbackRate = 1) {
    switch (id) {
      case "flash-number":
      case "flash-countdown":
        this.synthTone(id === "flash-countdown" ? 784 : 1175, 0.045, volume * 0.45, "sine");
        break;
      case "flash-ready":
        this.synthChord([587.33, 880], 0.075, 0.2, volume * 0.4, "sine");
        break;
      case "flash-complete":
        this.synthChord([659.25, 987.77], 0.08, 0.22, volume * 0.42, "sine");
        break;
      case "correct":
        this.synthChord([523.25, 659.25, 1046.5], 0.055, 0.25, volume * 0.42, "sine");
        break;
      case "combo":
        this.synthChord([659.25, 830.61, 987.77, 1318.51], 0.055, 0.25, volume * 0.44, "sine");
        break;
      case "complete":
        this.synthChord([523.25, 659.25, 783.99, 1046.5], 0.08, 0.32, volume * 0.44, "sine");
        break;
      case "excellent":
        this.synthChord([523.25, 659.25, 783.99, 1046.5], 0.1, 0.42, volume * 0.48, "triangle");
        break;
      case "level-up":
        this.synthChord([587.33, 739.99, 880, 1174.66], 0.07, 0.36, volume * 0.44, "sine");
        break;
      case "wrong":
        this.synthChord([329.63, 261.63], 0.1, 0.16, volume * 0.35, "triangle");
        break;
      case "soroban-bead":
        this.synthTone(660 * playbackRate, 0.045, volume * 0.38, "triangle");
        break;
      case "ui-toggle":
        this.synthTone(820, 0.035, volume * 0.25, "triangle");
        break;
      case "modal-open":
        this.synthChord([440, 659.25], 0.045, 0.1, volume * 0.28, "sine");
        break;
      case "modal-close":
        this.synthChord([620, 420], 0.04, 0.09, volume * 0.25, "sine");
        break;
      case "ui-click":
      default:
        this.synthTone(560, 0.04, volume * 0.26, "sine");
        break;
    }
  }

  private synthTone(
    frequency: number,
    durationSec: number,
    volume: number,
    type: OscillatorType
  ) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(Math.max(0.01, volume), now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + durationSec);
    osc.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + durationSec + 0.02);
  }

  private synthChord(
    notes: number[],
    stepSec: number,
    durationSec: number,
    volume: number,
    type: OscillatorType
  ) {
    const ctx = this.getContext();
    if (!ctx) return;
    const base = ctx.currentTime;
    notes.forEach((f, idx) => {
      const start = base + idx * stepSec;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(f, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(Math.max(0.01, volume), start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0005, start + durationSec);
      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx));
      osc.start(start);
      osc.stop(start + durationSec + 0.02);
    });
  }

  // ── High-level semantic helpers ─────────────────────────────────

  playFlashCue(cue: "countdown" | "ready" | "number" | "complete") {
    const map: Record<typeof cue, SoundId> = {
      countdown: "flash-countdown",
      ready: "flash-ready",
      number: "flash-number",
      complete: "flash-complete",
    };
    this.playSound(map[cue], {
      bypassThrottle: cue === "number",
      gainScale: cue === "number" ? 0.88 : 0.95,
    });
  }

  playCorrectFeedback(streakCount = 1) {
    if (streakCount >= 2) {
      const pitchShift = 1 + Math.min(streakCount - 2, 6) * 0.032;
      this.playSound("combo", { playbackRate: pitchShift, gainScale: 0.98 });
    } else {
      this.playSound("correct", { gainScale: 0.95 });
    }
  }

  playOutcomeSound(outcome: "complete" | "excellent" | "levelup") {
    const id: SoundId = outcome === "levelup" ? "level-up" : outcome;
    this.playSound(id, { gainScale: 1.0 });
  }

  playModalSound(action: "open" | "close") {
    this.playSound(action === "open" ? "modal-open" : "modal-close", { gainScale: 0.72 });
  }

  // ── Backward-compatible helper signatures across existing components ─

  playClayPop(frequency = 560, volume = 0.75) {
    const rate = Math.max(0.82, Math.min(1.22, frequency / 560));
    this.playSound("ui-click", { playbackRate: rate, gainScale: Math.min(1, volume * 3.8) });
  }

  playToggle(volume = 0.75) {
    this.playSound("ui-toggle", { gainScale: Math.min(1, volume * 4) });
  }

  playBeadClick(frequency = 520, volume = 0.85) {
    const rate = Math.max(0.88, Math.min(1.16, frequency / 520));
    this.playSound("soroban-bead", {
      playbackRate: rate,
      gainScale: Math.min(1, volume * 3.6),
    });
  }

  playSuccessChime(volume = 0.95) {
    this.playSound("correct", { gainScale: Math.min(1, volume * 3.2) });
  }

  playComboStreak(streakCount = 2) {
    this.playCorrectFeedback(Math.max(2, streakCount));
  }

  playTrainingComplete() {
    this.playSound("complete", { gainScale: 0.95 });
  }

  playLevelUp(volume = 0.95) {
    this.playSound("level-up", { gainScale: Math.min(1, volume * 3.4) });
  }

  playEncouragingMistake(volume = 0.85) {
    this.playSound("wrong", { gainScale: Math.min(1, volume * 3.5) });
  }

  playFlashBeep(volume = 0.9) {
    this.playSound("flash-number", {
      bypassThrottle: true,
      gainScale: Math.min(1, volume * 4),
    });
  }

  playCelebrationFanfare(volume = 1) {
    this.playSound("excellent", { gainScale: Math.min(1, volume * 3.1) });
  }
}

export const soundSynth = new SoundSynthesizer();
