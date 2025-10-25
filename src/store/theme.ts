import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type ThemeMode = 'system' | 'light' | 'dark'
type Theme = 'light' | 'dark'

interface ThemeState {
  // selected mode (what the user picked)
  mode: ThemeMode
  // resolved theme used by the UI: 'light' | 'dark'
  theme: Theme
  setMode: (m: ThemeMode) => void
}

// Module-level references to avoid duplicate listeners across store re-creations
let mq: MediaQueryList | null = null
let mqListener: ((e: MediaQueryListEvent) => void) | null = null

const STORAGE_KEY = 'ritus-theme' // keeps compatibility with existing inline script

function applyThemeClass(resolved: Theme) {
  if (typeof document === 'undefined' || !document.documentElement) return
  if (resolved === 'dark') document.documentElement.classList.add('dark')
  else document.documentElement.classList.remove('dark')
}

function readSystemPref(): Theme {
  try {
    if (typeof window === 'undefined') return 'light'
    const m = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)')
    if (m && m.matches) return 'dark'
  } catch {}
  return 'light'
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      theme: readSystemPref(),
      setMode: (m: ThemeMode) => {
        // update mode and resolve theme immediately
        const resolved: Theme = m === 'dark' ? 'dark' : m === 'light' ? 'light' : readSystemPref()
        set({ mode: m, theme: resolved })
        try {
          // persist selected mode under STORAGE_KEY for early-index script compatibility
          localStorage.setItem(STORAGE_KEY, m)
        } catch {}

        // update DOM class
        applyThemeClass(resolved)

        // manage system listener: only active when mode === 'system'
        try {
          if (mq && mqListener && mq.removeEventListener) mq.removeEventListener('change', mqListener)
          else if (mq && mqListener && (mq as any).removeListener) (mq as any).removeListener(mqListener)
        } catch {}

        mq = null
        mqListener = null

        if (m === 'system' && typeof window !== 'undefined') {
          try {
            mq = window.matchMedia('(prefers-color-scheme: dark)')
            mqListener = (e: MediaQueryListEvent) => {
              const newResolved: Theme = e.matches ? 'dark' : 'light'
              set({ theme: newResolved })
              applyThemeClass(newResolved)
              try { localStorage.setItem('ritus-last-theme', newResolved) } catch {}
            }
            if (mq && mq.addEventListener) mq.addEventListener('change', mqListener)
            else if (mq && (mq as any).addListener) (mq as any).addListener(mqListener)
          } catch {}
        } else {
          // write last-resolved theme
          try { localStorage.setItem('ritus-last-theme', resolved) } catch {}
        }
      },
    }),
    {
      name: 'ritus-theme-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ mode: state.mode, theme: state.theme }),
      // When the store is rehydrated, ensure DOM and listeners align with stored mode
      onRehydrateStorage: () => (state) => {
        try {
          const m = state?.mode ?? (localStorage.getItem(STORAGE_KEY) as ThemeMode) ?? 'system'
          // small delay to allow hydration to finish
          setTimeout(() => {
            // use getState to call setMode so side-effects run
            try {
              const s = useThemeStore.getState()
              s.setMode(m)
            } catch {}
          }, 0)
        } catch {}
      },
    }
  )
)

// Cross-tab sync: if user changes selected mode in another tab, update this store
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    try {
      if (e.key === STORAGE_KEY) {
        const next = (e.newValue as ThemeMode) || 'system'
        const s = useThemeStore.getState()
        if (s.mode !== next) s.setMode(next)
      }
      if (e.key === 'ritus-last-theme') {
        // if only last theme changed (unlikely directly), reflect resolved theme
        const last = (e.newValue as Theme) || null
        if (last) {
          const st = useThemeStore.getState()
          if (st.theme !== last) {
            (useThemeStore as any).setState({ theme: last })
            applyThemeClass(last)
          }
        }
      }
    } catch {}
  })
}

// Initialize once on module load to set a theme asap (for SPA navigation after initial HTML script)
try {
  const initialMode = (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) as ThemeMode | null
  if (initialMode) {
    // Defer to the store's setMode to ensure listeners and DOM class are consistent
    setTimeout(() => {
      try { useThemeStore.getState().setMode(initialMode) } catch {}
    }, 0)
  } else {
    // ensure class reflects system pref if nothing stored
    setTimeout(() => {
      try { useThemeStore.getState().setMode('system') } catch {}
    }, 0)
  }
} catch {}

export default useThemeStore
