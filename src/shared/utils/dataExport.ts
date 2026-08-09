import { BACKUP_SCHEMA_VERSION, normalizeProgress } from '@/shared/persistence/schema';
import { useHabitStore } from '@/shared/store/store';
import pkg from '../../../package.json';
import { systemClock } from './clock';
import { fromISO, iso } from './date';
import { recalc } from './scoring';

export function exportAllData() {
  const state = useHabitStore.getState();
  const habitsForExport = state.habits.map((habit) => recalc(habit));
  return {
    app: 'ritus',
    version: pkg.version,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: systemClock.now().toISOString(),
    habits: habitsForExport.map((habit) => ({
      ...habit,
      completions: (habit.completions || []).map((completion) => iso(fromISO(completion))),
    })),
    dateFormat: state.dateFormat,
    weekStart: state.weekStart,
    showArchived: state.showArchived,
    totalPoints: state.totalPoints,
    totalCompletions: state.totalCompletions,
    longestStreak: state.longestStreak,
    daysWithRitus: (() => {
      const days = new Set<string>();
      for (const habit of habitsForExport) {
        for (const completion of habit.completions || []) days.add(iso(fromISO(completion)));
      }
      return days.size;
    })(),
    progress:
      normalizeProgress(state.progress, systemClock.now().toISOString()) ||
      ({
        points: 0,
        weekBonusKeys: {},
        completionAwardKeys: {},
      } as const),
    emojiByDate: state.emojiByDate || {},
    emojiRecents: Array.isArray(state.emojiRecents) ? state.emojiRecents : [],
  };
}
