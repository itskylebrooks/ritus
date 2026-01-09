import { resolveEmojiId } from '@/shared/constants/emojis';
import { useHabitStore, type HabitState } from '@/shared/store/store';
import type { Habit } from '@/shared/types';
import pkg from '../../../package.json';
import { fromISO, iso } from './date';
import { recalc } from './scoring';

export interface ImportResult {
  ok: true;
  addedHabits: number;
  duplicateHabits: number;
  invalidHabits: number;
  totalHabits: number;
  totalPointsPrev: number;
  totalPointsNew: number;
  totalCompletionsPrev: number;
  totalCompletionsNew: number;
  longestStreakPrev: number;
  longestStreakNew: number;
}

export type ImportResultFail = { ok: false; reason: 'invalid' | 'not_ritus' };

const normalizeUnlockedDates = (
  unlocked: Record<string, string | boolean | undefined> | undefined,
  fallback: string,
): Record<string, string> | undefined => {
  if (!unlocked) return undefined;
  const next: Record<string, string> = {};
  for (const [id, value] of Object.entries(unlocked)) {
    if (!value) continue;
    next[id] = typeof value === 'string' ? value : fallback;
  }
  return next;
};

const normalizeProgress = (progress: unknown): HabitState['progress'] | undefined => {
  if (!progress || typeof progress !== 'object') return undefined;
  const cleaned = { ...(progress as HabitState['progress'] & Record<string, unknown>) };
  delete cleaned.essence;
  delete cleaned.level;
  const candidate = cleaned as HabitState['progress'];
  const points = typeof candidate.points === 'number' ? candidate.points : 0;
  const fallback =
    typeof candidate.lastUnlockedTrophyAt === 'string'
      ? candidate.lastUnlockedTrophyAt
      : iso(new Date());
  const normalizedUnlocked = normalizeUnlockedDates(
    cleaned.unlocked as Record<string, string | boolean | undefined> | undefined,
    fallback,
  );
  return { ...candidate, points, ...(normalizedUnlocked ? { unlocked: normalizedUnlocked } : {}) };
};

export function exportAllData() {
  const s = useHabitStore.getState();
  const habitsForExport = s.habits.map((h) => recalc(h));
  return {
    app: 'ritus',
    version: pkg.version,
    exportedAt: new Date().toISOString(),
    // Ensure exported completions are date-only ISO strings (no time part)
    habits: habitsForExport.map((h) => ({
      ...h,
      completions: (h.completions || []).map((c) => iso(fromISO(c))),
    })),
    // export formatting settings so they can be restored on import
    dateFormat: s.dateFormat,
    weekStart: s.weekStart,
    // UI visibility flags
    showArchived: s.showArchived,
    // no reminders in export
    totalPoints: s.totalPoints,
    totalCompletions: s.totalCompletions,
    longestStreak: s.longestStreak,
    // progression state (points + bookkeeping keys)
    progress:
      normalizeProgress(s.progress) ||
      ({
        points: 0,
        weekBonusKeys: {},
        completionAwardKeys: {},
      } as const),
    // emoji data
    emojiByDate: s.emojiByDate || {},
    emojiRecents: Array.isArray(s.emojiRecents) ? s.emojiRecents : [],
  };
}

export function importAllData(txt: string): ImportResult | ImportResultFail {
  try {
    const parsed = JSON.parse(txt);
    if (!parsed || typeof parsed !== 'object') return { ok: false, reason: 'invalid' };
    if (parsed.app !== 'ritus') return { ok: false, reason: 'not_ritus' };
    const incomingHabits: Partial<Habit>[] = Array.isArray(parsed.habits) ? parsed.habits : [];
    const incomingDateFormat: 'DMY' | 'MDY' | undefined =
      parsed.dateFormat === 'DMY' ? 'DMY' : parsed.dateFormat === 'MDY' ? 'MDY' : undefined;
    const incomingWeekStart: 'sunday' | 'monday' | undefined =
      parsed.weekStart === 'sunday'
        ? 'sunday'
        : parsed.weekStart === 'monday'
          ? 'monday'
          : undefined;
    const incomingShowArchived: boolean | undefined =
      typeof parsed.showArchived === 'boolean' ? parsed.showArchived : undefined;
    const incomingTotal = typeof parsed.totalPoints === 'number' ? parsed.totalPoints : 0;
    const incomingTotalCompletions =
      typeof parsed.totalCompletions === 'number' ? parsed.totalCompletions : 0;
    const incomingLongest = typeof parsed.longestStreak === 'number' ? parsed.longestStreak : 0;
    const incomingProgress =
      parsed && typeof parsed.progress === 'object'
        ? normalizeProgress(parsed.progress)
        : undefined;
    const incomingEmojiByDateRaw =
      parsed && typeof parsed.emojiByDate === 'object'
        ? (parsed.emojiByDate as Record<string, string>)
        : undefined;
    const normalizeId = (id: unknown) => (typeof id === 'string' ? resolveEmojiId(id) : null);
    const incomingEmojiByDate = incomingEmojiByDateRaw
      ? Object.entries(incomingEmojiByDateRaw).reduce<Record<string, string>>(
          (acc, [key, value]) => {
            const normalized = normalizeId(value);
            if (normalized) acc[key] = normalized;
            return acc;
          },
          {},
        )
      : undefined;
    let incomingEmojiRecents = Array.isArray(parsed.emojiRecents)
      ? (parsed.emojiRecents as unknown[])
      : undefined;
    // Back-compat: if old exports had only emojiOfTheDay, map to today's date
    const parsedUnknown = parsed as Record<string, unknown>;
    if (!incomingEmojiByDate && parsedUnknown.emojiOfTheDay) {
      const candidate =
        typeof parsedUnknown.emojiOfTheDay === 'string'
          ? parsedUnknown.emojiOfTheDay
          : typeof parsedUnknown.emojiOfTheDay === 'object' &&
              parsedUnknown.emojiOfTheDay !== null &&
              'id' in parsedUnknown.emojiOfTheDay
            ? (parsedUnknown.emojiOfTheDay as { id: string }).id
            : undefined;
      const normalized = normalizeId(candidate);
      if (normalized) {
        const today = new Date().toISOString().slice(0, 10);
        incomingEmojiRecents = [normalized];
        parsedUnknown.emojiByDate = { [today]: normalized };
      }
    }
    if (incomingEmojiRecents) {
      incomingEmojiRecents = incomingEmojiRecents
        .map((id) => normalizeId(id))
        .filter((id): id is string => Boolean(id))
        .filter((id, index, self) => self.indexOf(id) === index)
        .slice(0, 10);
    }

    const cur = useHabitStore.getState();
    const existingIds = new Set(cur.habits.map((h) => h.id));
    const validIncoming = incomingHabits.filter((h) => h && (h as Habit).id);
    const toAdd = validIncoming.filter((h) => !existingIds.has((h as Habit).id as string));
    const duplicateHabits = validIncoming.length - toAdd.length;
    const invalidHabits = incomingHabits.length - validIncoming.length;

    const normalized = toAdd.map((h) =>
      recalc({
        id: String((h as Habit).id),
        name: String(h.name ?? ''),
        frequency: (h as Habit).frequency ?? 'daily',
        createdAt: String((h as Habit).createdAt ?? new Date().toISOString()),
        // Normalize incoming completions to date-only ISO strings (no time component)
        completions: Array.isArray(h.completions)
          ? (h.completions as string[]).map((c) => iso(fromISO(String(c))))
          : [],
        mode: (h as Habit).mode ?? 'build',
        weeklyTarget: (h as Habit).weeklyTarget,
        monthlyTarget: (h as Habit).monthlyTarget,
        archived: Boolean((h as Habit & { archived?: boolean }).archived ?? false),
        streak: Number((h as Habit).streak ?? 0),
        points: Number((h as Habit).points ?? 0),
      }),
    );
    const mergedHabits = [...cur.habits, ...normalized].map((h) => recalc(h));

    // stats: preserve cumulative totalPoints semantics and longest streak
    // totalPoints is cumulative lifetime points and should not be strictly
    // recomputed from current habits. Prefer the highest seen value among
    // existing, incoming export, and a safety recompute from merged habits.
    const recomputedTotal = mergedHabits.reduce((acc, h) => acc + (h.points || 0), 0);
    const recomputedCompletions = mergedHabits.reduce(
      (acc, h) => acc + (h.completions ? h.completions.length : 0),
      0,
    );
    const newTotal = Math.max(incomingTotal || 0, cur.totalPoints || 0, recomputedTotal);
    const newTotalCompletions = Math.max(
      incomingTotalCompletions || 0,
      cur.totalCompletions || 0,
      recomputedCompletions,
    );
    const newLongest = Math.max(
      incomingLongest || 0,
      cur.longestStreak || 0,
      ...mergedHabits.map((h) => h.streak || 0),
    );

    // apply to store/persisted state
    const updated = {
      // only persist the partial snapshot used by our persist `partialize`
      habits: mergedHabits,
      reminders: cur.reminders,
      totalPoints: newTotal,
      totalCompletions: newTotalCompletions,
      longestStreak: newLongest,
      // restore formatting settings from import when available
      dateFormat: incomingDateFormat ?? cur.dateFormat,
      weekStart: incomingWeekStart ?? cur.weekStart,
      showArchived: incomingShowArchived ?? cur.showArchived,
      showAdd: cur.showAdd,
      // include progress when persisting import
      progress: incomingProgress ?? normalizeProgress(cur.progress) ?? cur.progress,
      emojiByDate:
        incomingEmojiByDate ??
        (cur as typeof cur & { emojiByDate?: Record<string, string> }).emojiByDate ??
        {},
      emojiRecents:
        incomingEmojiRecents ??
        (cur as typeof cur & { emojiRecents?: string[] }).emojiRecents ??
        [],
    };

    try {
      const key = 'ritus-habits';
      // Persist the same shape the app expects (no {state,version} wrapper).
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {
      // ignore write errors; we'll still update in-memory store below
    }

    // Update in-memory store so the UI reflects the import immediately.
    // Use setState to update only the persisted fields; keep other funcs intact.
    useHabitStore.setState(() => ({
      habits: updated.habits,
      totalPoints: updated.totalPoints,
      totalCompletions: updated.totalCompletions,
      longestStreak: updated.longestStreak,
      dateFormat: updated.dateFormat,
      weekStart: updated.weekStart,
      progress: updated.progress,
      emojiByDate: updated.emojiByDate,
      emojiRecents: Array.isArray(updated.emojiRecents)
        ? updated.emojiRecents.filter((id): id is string => typeof id === 'string')
        : [],
    }));

    // No separate localStorage key; emoji data is part of the store snapshot above

    return {
      ok: true,
      addedHabits: normalized.length,
      duplicateHabits,
      invalidHabits,
      totalHabits: mergedHabits.length,
      totalPointsPrev: cur.totalPoints || 0,
      totalPointsNew: newTotal,
      totalCompletionsPrev: cur.totalCompletions || 0,
      totalCompletionsNew: newTotalCompletions,
      longestStreakPrev: cur.longestStreak || 0,
      longestStreakNew: newLongest,
    };
  } catch {
    return { ok: false, reason: 'invalid' };
  }
}
