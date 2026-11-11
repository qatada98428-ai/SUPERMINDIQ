/**
 * SUPER MIND — Gentle & Harmonic Audio Synthesizer
 * Produces soft, pleasant acoustic and marimba-like tones comfortable for children's ears
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Soothing, soft wooden bead click / marimba tap
   */
  playBeadClick(frequency = 520, volume = 0.25) {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.5, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  }

  /**
   * Soft, uplifting harmonic chime chord for success / correct answer
   * Plays a warm ascending arpeggio: C5 -> E5 -> G5 -> C6
   */
  playSuccessChime(volume = 0.3) {
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);

      const startTime = ctx.currentTime + idx * 0.07;
      const duration = 0.45;

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.02);
    });
  }

  /**
   * Gentle, soft encouraging tone for wrong answer (never jarring or harsh)
   */
  playEncouragingMistake(volume = 0.25) {
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [293.66, 261.63]; // D4 -> C4 soft descending pulse
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle"; // Softer than square/sawtooth
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

      const startTime = ctx.currentTime + idx * 0.12;
      const duration = 0.25;

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.02);
    });
  }

  /**
   * Soft flash beep for number transition
   */
  playFlashBeep(volume = 0.2) {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(680, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(820, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  }

  /**
   * Triumphant harmonic fanfare for tournament champions
   */
  playCelebrationFanfare(volume = 0.35) {
    const ctx = this.getContext();
    if (!ctx) return;

    const fanfare = [
      { f: 523.25, t: 0, d: 0.14 },    // C5
      { f: 523.25, t: 0.16, d: 0.14 }, // C5
      { f: 523.25, t: 0.32, d: 0.14 }, // C5
      { f: 659.25, t: 0.48, d: 0.38 }, // E5
      { f: 783.99, t: 0.88, d: 0.22 }, // G5
      { f: 1046.5, t: 1.12, d: 0.85 }, // C6 (High triumph)
    ];

    fanfare.forEach(({ f, t, d }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(f, ctx.currentTime + t);

      gain.gain.setValueAtTime(0.001, ctx.currentTime + t);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + d + 0.05);
    });
  }
}

export const soundSynth = new SoundSynthesizer();
