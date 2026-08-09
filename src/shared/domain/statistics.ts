import type { Habit } from '@/shared/types';
import { fromISO, iso } from '@/shared/utils/date';
import { recalc } from '@/shared/utils/scoring';

export interface HabitStatistics {
  totalCompletions: number;
  longestStreak: number;
  daysWithRitus: number;
}

export function computeDaysWithRitus(habits: Habit[]): number {
  const uniqueDays = new Set<string>();
  for (const habit of habits) {
    for (const completion of habit.completions || []) {
      uniqueDays.add(iso(fromISO(completion)));
    }
  }
  return uniqueDays.size;
}

export function computeHabitStatistics(habits: Habit[]): HabitStatistics {
  return {
    totalCompletions: habits.reduce((total, habit) => total + (habit.completions?.length || 0), 0),
    longestStreak: Math.max(0, ...habits.map((habit) => habit.streak || 0)),
    daysWithRitus: computeDaysWithRitus(habits),
  };
}

export function refreshHabitDerivations(habits: Habit[], now: Date): Habit[] {
  return habits.map((habit) => recalc(habit, now));
}
