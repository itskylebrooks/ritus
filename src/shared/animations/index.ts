import { useEffect, useState } from 'react'
import type { Transition, Variants } from 'framer-motion'

export const defaultEase = [0.2, 0.8, 0.2, 1] as const
export const emphasizeEase = [0.4, 0, 0.2, 1] as const

export const durations = {
  xxs: 0.06,
  xs: 0.12,
  sm: 0.18,
  md: 0.22,
  lg: 0.24,
  xl: 0.3,
} as const

export const transitions = {
  fadeXs: { duration: durations.xs },
  fadeSm: { duration: durations.sm },
  fadeMd: { duration: durations.md },
  fadeLg: { duration: durations.lg },
  fadeXl: { duration: durations.xl },
  layoutSpring: { layout: { type: 'spring', stiffness: 300, damping: 30 } },
  spring: { type: 'spring', stiffness: 300, damping: 30 },
} as const

export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
} as const

export const pageTransition = transitions.fadeMd

/**
 * Centralized motion settings used across the app.
 * - Respects `prefers-reduced-motion`
 * - Exposes reusable transitions for panels/backdrops
 */
export const createOverlayMotion = (prefersReducedMotion: boolean) => {
  const panelTransition: Transition = prefersReducedMotion
    ? { duration: durations.xxs }
    : { type: 'spring', stiffness: 700, damping: 30, mass: 0.6 }

  const backdropTransition: Transition = prefersReducedMotion
    ? { duration: durations.xxs }
    : { duration: durations.sm, ease: defaultEase }

  return { panelTransition, backdropTransition } as const
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

export type OverlayMotion = ReturnType<typeof createOverlayMotion>

export const desktopDropdownVariants: Variants = {
  initial: { opacity: 0, y: 6, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: durations.sm, ease: defaultEase } },
  exit: { opacity: 0, y: -6, scale: 0.98, transition: { duration: durations.sm, ease: defaultEase } },
} as const

export const submenuVariants: Variants = {
  initial: { opacity: 0, y: -4, height: 0 },
  animate: { opacity: 1, y: 0, height: 'auto', transition: { duration: durations.md, ease: defaultEase } },
  exit: { opacity: 0, y: -4, height: 0, transition: { duration: durations.sm, ease: defaultEase } },
} as const

export const createMobileMenuVariants = (prefersReducedMotion: boolean, overlayMotion?: OverlayMotion): Variants => {
  const motion = overlayMotion ?? createOverlayMotion(prefersReducedMotion)
  return {
    initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 },
    animate: prefersReducedMotion
      ? { opacity: 1, transition: { duration: durations.xs } }
      : { opacity: 1, y: 0, scale: 1, transition: motion.panelTransition },
    exit: prefersReducedMotion
      ? { opacity: 0, transition: { duration: durations.xs } }
      : { opacity: 0, y: -8, scale: 0.98, transition: { duration: durations.xl, ease: defaultEase } },
  } as const
}

export const createPageMotion = (prefersReducedMotion: boolean | null) => {
  if (prefersReducedMotion) {
    return {
      initial: undefined,
      animate: undefined,
      transition: undefined,
    } as const
  }
  return {
    initial: pageVariants.initial,
    animate: pageVariants.animate,
    transition: pageTransition,
  } as const
}
