import { useEffect, useState } from 'react'

export const defaultEase = [0.2, 0.8, 0.2, 1] as const

/**
 * Centralized motion settings used across the app.
 * - Respects `prefers-reduced-motion`
 * - Exposes reusable transitions for panels/backdrops
 */
export const createOverlayMotion = (prefersReducedMotion: boolean) => {
  return {
    // fast spring for entrance, but switch to short duration when reduced motion requested
    panelTransition: prefersReducedMotion
      ? { duration: 0.06 }
      : { type: 'spring', stiffness: 700, damping: 30, mass: 0.6 },
    // subtle fade backdrop
    backdropTransition: prefersReducedMotion
      ? { duration: 0.06 }
      : { duration: 0.18, ease: defaultEase },
  } as const
}

export function useMotionPreferences() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = () => setPrefersReducedMotion(!!mq.matches)
    handler()
    if (mq.addEventListener) {
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    } else {
      mq.addListener(handler)
      return () => mq.removeListener(handler)
    }
  }, [])

  return {
    prefersReducedMotion,
    overlayMotion: createOverlayMotion(prefersReducedMotion),
  } as const
}
