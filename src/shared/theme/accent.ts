import { useHabitStore } from '@/shared/store/store';

type AccentId = 'accent_ocean' | 'accent_ember' | 'accent_sage' | 'default';

// Define light/dark pairs with appropriate text contrast
const ACCENTS: Record<
  AccentId,
  { light: string; lightContrast: string; dark: string; darkContrast: string }
> = {
  default: {
    light: '#111827',
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
    return id && (ACCENTS as any)[id] ? id : 'default';
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
    (window as any).__ritusAccentUnsub = unsub;
  } catch {}
}

export default initAccentSync;
