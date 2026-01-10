// Lightweight confetti trigger using canvas-confetti (dynamically imported)
// Uses the current accent color CSS variable so the effect stays on-brand.

export interface ConfettiOptions {
  particleCount?: number;
  origin?: { x: number; y: number };
  spread?: number;
  colors?: string[];
  disableAccent?: boolean;
}

export async function fireConfetti(options?: ConfettiOptions | number) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // Backwards compatibility for when first arg was just particleCount
  const opts: ConfettiOptions =
    typeof options === 'number' ? { particleCount: options } : options || {};

  const particleCount = opts.particleCount ?? 120;
  const origin = opts.origin ?? { y: 0.3 };

  try {
    const mod = await import('canvas-confetti');
    const confetti = mod.default;

    let colors = opts.colors;

    if (!colors && !opts.disableAccent) {
      // Resolve current accent color from CSS variables
      const root = document.documentElement;
      const styles = getComputedStyle(root);
      // Prefer explicit color-accent variable; fallback to --accent-dark/light if needed
      const accent = (
        styles.getPropertyValue('--color-accent') ||
        styles.getPropertyValue('--accent-dark') ||
        styles.getPropertyValue('--accent-light') ||
        '#5fa8ff'
      ).trim();
      colors = [accent];
    }

    // Two bursts for a nicer look if it's the default large celebration
    // If it's a specific origin point (like a button click), usually one spread is better controlled
    if (opts.origin) {
      confetti({
        particleCount: particleCount,
        spread: opts.spread ?? 70,
        startVelocity: 30, // lower velocity for small button pops
        colors: colors,
        origin: origin,
        ticks: 200,
        zIndex: 9999,
        scalar: 0.8, // smaller bits for button interactions
      });
    } else {
      // Default global celebration
      const defaults = { origin: { y: 0.3 } };
      confetti({
        ...defaults,
        particleCount: Math.floor(particleCount * 0.65),
        spread: 70,
        startVelocity: 45,
        colors: colors,
        ticks: 220,
        scalar: 1.0,
        zIndex: 9999,
      });
      confetti({
        ...defaults,
        particleCount: Math.floor(particleCount * 0.35),
        angle: 120,
        spread: 55,
        startVelocity: 55,
        colors: colors,
        ticks: 200,
        zIndex: 9999,
      });
    }
  } catch {
    // Silently ignore if module fails; non-critical UX
  }
}

export default fireConfetti;
