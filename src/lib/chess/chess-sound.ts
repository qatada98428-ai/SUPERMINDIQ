/**
 * Soft, tactile wooden chess sound synthesizer (Web Audio API)
 * Produces a gentle, muted wooden piece tap instead of sharp UI clicks.
 */

let sharedAudioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedAudioCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

export type ChessSoundType = "move" | "capture" | "select" | "check" | "win" | "reset";

export function playSoftChessSound(type: ChessSoundType) {
  const ctx = getAudioCtx();
  if (!ctx) return;

  const now = ctx.currentTime;

  const woodTap = (startTime: number, freq: number, volume: number, duration: number) => {
    // Filtered soft sine+triangle warm wood knock
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, startTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.42, startTime + duration);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(620, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
  };

  try {
    switch (type) {
      case "select":
        // Whisper-soft piece touch
        woodTap(now, 320, 0.045, 0.035);
        break;
      case "move":
        // Gentle warm wooden piece placement
        woodTap(now, 235, 0.11, 0.065);
        woodTap(now + 0.015, 165, 0.06, 0.055);
        break;
      case "capture":
        // Slightly fuller soft double wooden knock
        woodTap(now, 290, 0.12, 0.055);
        woodTap(now + 0.045, 185, 0.11, 0.075);
        break;
      case "check":
        // Soft warm two-note wooden alert
        woodTap(now, 380, 0.09, 0.09);
        woodTap(now + 0.09, 460, 0.08, 0.11);
        break;
      case "win":
        // Gentle calming 3-note chime
        [392, 493.88, 587.33].forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(f, now + idx * 0.11);
          gain.gain.setValueAtTime(0.0001, now + idx * 0.11);
          gain.gain.linearRampToValueAtTime(0.075, now + idx * 0.11 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.11 + 0.32);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.11);
          osc.stop(now + idx * 0.11 + 0.34);
        });
        break;
      case "reset":
        woodTap(now, 210, 0.07, 0.05);
        break;
    }
  } catch {
    // Ignore audio errors on muted/restricted devices
  }
}
