import { RITUS_STORAGE_KEYS, STORAGE_KEYS } from '@/shared/constants/storageKeys';

type WeekStart = 'sunday' | 'monday';

function getStorage(): Storage | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function safeGetItem(key: string): string | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetItem(key: string, value: string): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function safeRemoveItem(key: string): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    // Ignore storage removals in restricted environments.
  }
}

export function clearRitusStorage(): void {
  for (const key of RITUS_STORAGE_KEYS) {
    safeRemoveItem(key);
  }
}

export function readPersistedWeekStart(defaultValue: WeekStart = 'monday'): WeekStart {
  const raw = safeGetItem(STORAGE_KEYS.HABITS);
  if (!raw) return defaultValue;

  try {
    const parsed = JSON.parse(raw) as
      | { weekStart?: unknown; state?: { weekStart?: unknown } }
      | null;
    const candidate = parsed?.state?.weekStart ?? parsed?.weekStart;
    return candidate === 'sunday' ? 'sunday' : 'monday';
  } catch {
    return defaultValue;
  }
}
