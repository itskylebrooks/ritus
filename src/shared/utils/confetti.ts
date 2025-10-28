// Lightweight confetti trigger using canvas-confetti (dynamically imported)
// Uses the current accent color CSS variable so the effect stays on-brand.

export async function fireConfetti(particleCount: number = 120) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  try {
    const mod = await import('canvas-confetti')
    const confetti = mod.default
    // Resolve current accent color from CSS variables
    const root = document.documentElement
    const styles = getComputedStyle(root)
    // Prefer explicit color-accent variable; fallback to --accent-dark/light if needed
    const accent = (styles.getPropertyValue('--color-accent') || styles.getPropertyValue('--accent-dark') || styles.getPropertyValue('--accent-light') || '#5fa8ff').trim()

    // Two bursts for a nicer look
    const defaults = { origin: { y: 0.3 } }
    confetti({
      ...defaults,
      particleCount: Math.floor(particleCount * 0.65),
      spread: 70,
      startVelocity: 45,
      colors: [accent],
      ticks: 220,
      scalar: 1.0,
      zIndex: 9999,
    })
    confetti({
      ...defaults,
      particleCount: Math.floor(particleCount * 0.35),
      angle: 120,
      spread: 55,
      startVelocity: 55,
      colors: [accent],
      ticks: 200,
      zIndex: 9999,
    })
  } catch (e) {
    // Silently ignore if module fails; non-critical UX
  }
}

export default fireConfetti

