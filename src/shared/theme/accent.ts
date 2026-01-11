/* eslint-disable no-empty */
import { useHabitStore } from '@/shared/store/store';

type AccentId =
  | 'accent_ocean'
  | 'accent_ember'
  | 'accent_sage'
  | 'accent_lagoon'
  | 'accent_citrine'
  | 'accent_amethyst'
  | 'accent_corall_pink'
  | 'accent_gold'
  | 'accent_sand'
  | 'default';

// Define light/dark pairs with appropriate text contrast
export const ACCENTS: Record<
  AccentId,
  { light: string; lightContrast: string; dark: string; darkContrast: string }
> = {
  default: {
    light: '#0f0f0f',
    lightContrast: '#ffffff',
    dark: '#e5e7eb',
    darkContrast: '#050505',
  },
  accent_ocean: {
    // Ocean: more saturated in both modes
    light: '#1f3b66',
    lightContrast: '#ffffff',
    dark: '#5fa8ff',
    darkContrast: '#050505',
  },
  accent_ember: {
    // Ember: darker, more saturated in dark mode
    light: '#c1300b',
    lightContrast: '#ffffff',
    dark: '#ff5c21',
    darkContrast: '#050505',
  },
  accent_sage: {
    // Soft green
    light: '#166534',
    lightContrast: '#ffffff',
    dark: '#31ed76',
    darkContrast: '#050505',
  },
  accent_lagoon: {
    // Cool teal
    light: '#0f766e',
    lightContrast: '#ffffff',
    dark: '#33d6c7',
    darkContrast: '#050505',
  },
  accent_citrine: {
    // Rich red
    light: '#b91c1c',
    lightContrast: '#ffffff',
    dark: '#ff4d4f',
    darkContrast: '#050505',
  },
  accent_amethyst: {
    // Rich violet
    light: '#5b21b6',
    lightContrast: '#ffffff',
    dark: '#c084fc',
    darkContrast: '#050505',
  },
  accent_corall_pink: {
    // Corall Pink
    light: '#ff6b6b',
    lightContrast: '#050505',
    dark: '#ff9aa2',
    darkContrast: '#050505',
  },
  accent_gold: {
    // Gold
    light: '#b8860b',
    lightContrast: '#ffffff',
    dark: '#ffd43b',
    darkContrast: '#050505',
  },
  accent_sand: {
    // Warm beige (Sand)
    light: '#d6c4a4',
    lightContrast: '#050505',
    dark: '#efe5d3',
    darkContrast: '#050505',
  },
};

function applyAccentVars(id: AccentId) {
  if (typeof document === 'undefined') return;
  const def = ACCENTS[id] || ACCENTS.default;
  const root = document.documentElement;
  root.style.setProperty('--accent-light', def.light);
  root.style.setProperty('--accent-contrast-light', def.lightContrast);
  root.style.setProperty('--accent-dark', def.dark);
  root.style.setProperty('--accent-contrast-dark', def.darkContrast);
}

function resolveCurrentAccentId(): AccentId {
  try {
    const s = useHabitStore.getState();
    const id = s.progress?.appliedCollectibles?.accent as AccentId | undefined;
    return id && id in ACCENTS ? id : 'default';
  } catch {
    return 'default';
  }
}

export function initAccentSync() {
  // Apply once on init
  try {
    applyAccentVars(resolveCurrentAccentId());
  } catch {}

  // Subscribe to changes in the applied accent collectible
  try {
    let prev: AccentId = resolveCurrentAccentId();
    const unsub = useHabitStore.subscribe((s) => {
      try {
        const next = (s.progress?.appliedCollectibles?.accent as AccentId | undefined) || 'default';
        if (next !== prev) {
          prev = next;
          applyAccentVars(prev);
        }
      } catch {}
    });
    // Expose a teardown on window for debugging; optional and safe
    (window as Window & { __ritusAccentUnsub?: () => void }).__ritusAccentUnsub = unsub;
  } catch {}
}

export default initAccentSync;
