import { resolveEmojiId } from '@/shared/constants/emojis';
import {
  BACKUP_SCHEMA_VERSION,
  decodeBackup,
  mergeEmojiData,
  mergeProgress,
  normalizeProgress,
} from '@/shared/persistence/schema';
import { useHabitStore } from '@/shared/store/store';
import pkg from '../../../package.json';
import { fromISO, iso, setWeekStartsOnPreference } from './date';
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
  daysWithRitusPrev: number;
  daysWithRitusNew: number;
}

export type ImportResultFail = {
  ok: false;
  reason: 'invalid' | 'not_ritus' | 'unsupported_version';
};

export function exportAllData() {
  const s = useHabitStore.getState();
  const habitsForExport = s.habits.map((h) => recalc(h));
  return {
    app: 'ritus',
    version: pkg.version,
    schemaVersion: BACKUP_SCHEMA_VERSION,
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
    // days with ritus (unique days with at least one completion across all habits)
    daysWithRitus: (() => {
      const set = new Set<string>();
      for (const h of habitsForExport)
        for (const c of h.completions || []) set.add(iso(fromISO(c)));
      return set.size;
    })(),
    // progression state (points + bookkeeping keys)
    progress:
      normalizeProgress(s.progress, new Date().toISOString()) ||
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
    const parsed: unknown = JSON.parse(txt);
    const decoded = decodeBackup(parsed);
    if (!decoded.ok) return decoded;
    const backup = decoded.value;
    const incomingHabits = backup.habits;
    const incomingDateFormat = backup.dateFormat;
    const incomingWeekStart = backup.weekStart;
    const incomingShowArchived = backup.showArchived;
    const incomingTotal = backup.totalPoints;
    const incomingTotalCompletions = backup.totalCompletions;
    const incomingLongest = backup.longestStreak;
    const incomingDaysWithRitus = backup.daysWithRitus;
    const incomingProgress = backup.progress;
    const incomingEmojiByDateRaw = backup.emojiByDate;
    const normalizeId = (id: unknown) => (typeof id === 'string' ? resolveEmojiId(id) : null);
    let incomingEmojiByDate = incomingEmojiByDateRaw
      ? Object.entries(incomingEmojiByDateRaw).reduce<Record<string, string>>(
          (acc, [key, value]) => {
            const normalized = normalizeId(value);
            if (normalized) acc[key] = normalized;
            return acc;
          },
          {},
        )
      : undefined;
    let incomingEmojiRecents: unknown[] | undefined = backup.emojiRecents;
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
        incomingEmojiByDate = { [today]: normalized };
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
    const toAdd = incomingHabits.filter((h) => !existingIds.has(h.id));
    const duplicateHabits = incomingHabits.length - toAdd.length;
    const invalidHabits = backup.invalidHabits;

    const normalized = toAdd.map((h) =>
      recalc({
        id: h.id,
        name: String(h.name ?? ''),
        frequency: h.frequency,
        createdAt: h.createdAt,
        // Normalize incoming completions to date-only ISO strings (no time component)
        completions: Array.isArray(h.completions) ? h.completions.map((c) => iso(fromISO(c))) : [],
        mode: h.mode ?? 'build',
        weeklyTarget: h.weeklyTarget,
        monthlyTarget: h.monthlyTarget,
        archived: Boolean(h.archived ?? false),
        streak: h.streak,
        points: h.points,
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

    // recompute unique days used across merged habits
    const recomputedDaysSet = new Set<string>();
    for (const h of mergedHabits)
      for (const c of h.completions || []) recomputedDaysSet.add(iso(fromISO(c)));
    const recomputedDaysWithRitus = recomputedDaysSet.size;

    // choose conservative maximum across incoming, current, and recomputed
    const newDaysWithRitus = Math.max(
      incomingDaysWithRitus || 0,
      cur.daysWithRitus || 0,
      recomputedDaysWithRitus,
    );

    // apply to store/persisted state
    const mergedEmoji = mergeEmojiData(
      cur.emojiByDate || {},
      cur.emojiRecents || [],
      incomingEmojiByDate,
      incomingEmojiRecents as string[] | undefined,
    );
    const updated = {
      // only persist the partial snapshot used by our persist `partialize`
      habits: mergedHabits,
      reminders: cur.reminders,
      totalPoints: newTotal,
      totalCompletions: newTotalCompletions,
      longestStreak: newLongest,
      daysWithRitus: newDaysWithRitus,
      // restore formatting settings from import when available
      dateFormat: incomingDateFormat ?? cur.dateFormat,
      weekStart: incomingWeekStart ?? cur.weekStart,
      showArchived: incomingShowArchived ?? cur.showArchived,
      showAdd: cur.showAdd,
      // include progress when persisting import
      progress: mergeProgress(cur.progress, incomingProgress),
      emojiByDate: mergedEmoji.emojiByDate,
      emojiRecents: mergedEmoji.emojiRecents,
    };

    setWeekStartsOnPreference(updated.weekStart);

    // Update in-memory store so the UI reflects the import immediately.
    // Use setState to update only the persisted fields; keep other funcs intact.
    useHabitStore.setState(() => ({
      habits: updated.habits,
      totalPoints: updated.totalPoints,
      totalCompletions: updated.totalCompletions,
      longestStreak: updated.longestStreak,
      daysWithRitus: updated.daysWithRitus,
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
      daysWithRitusPrev: cur.daysWithRitus || 0,
      daysWithRitusNew: newDaysWithRitus,
    };
  } catch {
    return { ok: false, reason: 'invalid' };
  }
}
