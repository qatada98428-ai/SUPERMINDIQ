import confetti from "canvas-confetti";

const CLAY_CONFETTI_COLORS = ["#7C5CFC", "#FBBF24", "#48CEBC", "#FF6B9E", "#60A5FA"];

/**
 * Fires a lightweight, pastel-clay confetti burst while respecting reduced-motion preference.
 */
export function triggerClayCelebration(intensity: "small" | "milestone" = "small") {
  if (typeof window === "undefined") return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  try {
    if (intensity === "milestone") {
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.62 },
        colors: CLAY_CONFETTI_COLORS,
        disableForReducedMotion: true,
      });
    } else {
      confetti({
        particleCount: 36,
        spread: 58,
        origin: { y: 0.68 },
        colors: CLAY_CONFETTI_COLORS,
        disableForReducedMotion: true,
      });
    }
  } catch {
    // Graceful no-op if canvas cannot initialize
  }
}
