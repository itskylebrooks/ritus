import type { HabitState } from '@/shared/store/store';
import type { Frequency, Habit } from '@/shared/types';

export const BACKUP_SCHEMA_VERSION = 1;
export const HABIT_STORE_VERSION = 1;

type Progress = HabitState['progress'];

export interface DecodedBackup {
  schemaVersion: number;
  habits: Habit[];
  invalidHabits: number;
  dateFormat?: HabitState['dateFormat'];
  weekStart?: HabitState['weekStart'];
  showArchived?: boolean;
  totalPoints: number;
  totalCompletions: number;
  longestStreak: number;
  daysWithRitus?: number;
  progress?: Progress;
  emojiByDate?: Record<string, string>;
  emojiRecents?: string[];
}

export type DecodeBackupResult =
  | { ok: true; value: DecodedBackup }
  | { ok: false; reason: 'invalid' | 'not_ritus' | 'unsupported_version' };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function finiteNonNegative(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : fallback;
}

function positiveInteger(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : undefined;
}

function stringArray(value: unknown, limit = Number.POSITIVE_INFINITY): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === 'string'))].slice(
    0,
    limit,
  );
}

function trueMap(value: unknown): Record<string, true> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, true] => entry[0].length > 0 && entry[1] === true,
    ),
  );
}

function stringMap(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => entry[0].length > 0 && typeof entry[1] === 'string',
    ),
  );
}

function unlockedMap(value: unknown, fallback: string): Record<string, string> {
  if (!isRecord(value)) return {};
  const result: Record<string, string> = {};
  for (const [id, unlockedAt] of Object.entries(value)) {
    if (!id || !unlockedAt) continue;
    result[id] = typeof unlockedAt === 'string' ? unlockedAt : fallback;
  }
  return result;
}

export function normalizeProgress(value: unknown, fallbackDate: string): Progress | undefined {
  if (!isRecord(value)) return undefined;

  const lastUnlockedTrophyAt =
    typeof value.lastUnlockedTrophyAt === 'string' ? value.lastUnlockedTrophyAt : undefined;
  const progress: Progress = {
    points: finiteNonNegative(value.points),
    weekBonusKeys: trueMap(value.weekBonusKeys),
    completionAwardKeys: trueMap(value.completionAwardKeys),
    unlocked: unlockedMap(value.unlocked, lastUnlockedTrophyAt ?? fallbackDate),
    ownedCollectibles: stringArray(value.ownedCollectibles),
    appliedCollectibles: stringMap(value.appliedCollectibles),
    seenTrophies: trueMap(value.seenTrophies),
    ...(lastUnlockedTrophyAt ? { lastUnlockedTrophyAt } : {}),
  };

  return progress;
}

function normalizeFrequency(value: unknown): Frequency | null {
  return value === 'daily' || value === 'weekly' || value === 'monthly' ? value : null;
}

function normalizeHabit(value: unknown): Habit | null {
  if (!isRecord(value) || typeof value.id !== 'string' || !value.id.trim()) return null;
  const frequency = normalizeFrequency(value.frequency);
  if (!frequency) return null;

  const completions = Array.isArray(value.completions)
    ? value.completions.filter(
        (completion): completion is string =>
          typeof completion === 'string' && Number.isFinite(Date.parse(completion)),
      )
    : [];
  const createdAt =
    typeof value.createdAt === 'string' && Number.isFinite(Date.parse(value.createdAt))
      ? value.createdAt
      : new Date(0).toISOString();

  return {
    id: value.id,
    name: typeof value.name === 'string' ? value.name.trim().slice(0, 60) : '',
    frequency,
    createdAt,
    completions,
    archived: value.archived === true,
    mode: value.mode === 'break' ? 'break' : 'build',
    weeklyTarget: frequency === 'weekly' ? (positiveInteger(value.weeklyTarget) ?? 1) : undefined,
    monthlyTarget:
      frequency === 'monthly' ? (positiveInteger(value.monthlyTarget) ?? 1) : undefined,
    streak: finiteNonNegative(value.streak),
    points: finiteNonNegative(value.points),
  };
}

export function decodeBackup(value: unknown, now = new Date()): DecodeBackupResult {
  if (!isRecord(value)) return { ok: false, reason: 'invalid' };
  if (value.app !== 'ritus') return { ok: false, reason: 'not_ritus' };

  const schemaVersion = finiteNonNegative(value.schemaVersion, 0);
  if (schemaVersion > BACKUP_SCHEMA_VERSION) {
    return { ok: false, reason: 'unsupported_version' };
  }

  const rawHabits = Array.isArray(value.habits) ? value.habits : [];
  const habits = rawHabits.map(normalizeHabit).filter((habit): habit is Habit => habit !== null);
  const fallbackDate = now.toISOString();

  return {
    ok: true,
    value: {
      schemaVersion,
      habits,
      invalidHabits: rawHabits.length - habits.length,
      dateFormat:
        value.dateFormat === 'DMY' || value.dateFormat === 'MDY' ? value.dateFormat : undefined,
      weekStart:
        value.weekStart === 'sunday' || value.weekStart === 'monday' ? value.weekStart : undefined,
      showArchived: typeof value.showArchived === 'boolean' ? value.showArchived : undefined,
      totalPoints: finiteNonNegative(value.totalPoints),
      totalCompletions: finiteNonNegative(value.totalCompletions),
      longestStreak: finiteNonNegative(value.longestStreak),
      daysWithRitus:
        typeof value.daysWithRitus === 'number'
          ? finiteNonNegative(value.daysWithRitus)
          : undefined,
      progress: normalizeProgress(value.progress, fallbackDate),
      emojiByDate: isRecord(value.emojiByDate) ? stringMap(value.emojiByDate) : undefined,
      emojiRecents: Array.isArray(value.emojiRecents)
        ? stringArray(value.emojiRecents, 10)
        : undefined,
    },
  };
}

function laterDate(a?: string, b?: string): string | undefined {
  if (!a) return b;
  if (!b) return a;
  return Date.parse(a) >= Date.parse(b) ? a : b;
}

export function mergeProgress(current: Progress, incoming?: Progress): Progress {
  if (!incoming) return current;
  return {
    points: Math.max(current.points || 0, incoming.points || 0),
    weekBonusKeys: { ...(incoming.weekBonusKeys || {}), ...(current.weekBonusKeys || {}) },
    completionAwardKeys: {
      ...(incoming.completionAwardKeys || {}),
      ...(current.completionAwardKeys || {}),
    },
    unlocked: { ...(incoming.unlocked || {}), ...(current.unlocked || {}) },
    ownedCollectibles: [
      ...new Set([...(current.ownedCollectibles || []), ...(incoming.ownedCollectibles || [])]),
    ],
    appliedCollectibles: {
      ...(incoming.appliedCollectibles || {}),
      ...(current.appliedCollectibles || {}),
    },
    seenTrophies: { ...(incoming.seenTrophies || {}), ...(current.seenTrophies || {}) },
    lastUnlockedTrophyAt: laterDate(current.lastUnlockedTrophyAt, incoming.lastUnlockedTrophyAt),
  };
}

export function mergeEmojiData(
  currentByDate: Record<string, string | undefined>,
  currentRecents: string[],
  incomingByDate?: Record<string, string>,
  incomingRecents?: string[],
) {
  return {
    emojiByDate: { ...(incomingByDate || {}), ...currentByDate },
    emojiRecents: [...new Set([...(currentRecents || []), ...(incomingRecents || [])])].slice(
      0,
      10,
    ),
  };
}

export function migrateHabitStoreState(persistedState: unknown): Record<string, unknown> {
  if (!isRecord(persistedState)) return {};
  const migrated = { ...persistedState };
  migrated.progress =
    normalizeProgress(persistedState.progress, new Date().toISOString()) ?? persistedState.progress;
  migrated.habits = Array.isArray(persistedState.habits)
    ? persistedState.habits.map(normalizeHabit).filter((habit): habit is Habit => habit !== null)
    : [];
  return migrated;
}
