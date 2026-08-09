import type { Frequency, Habit } from '@/shared/types';
import { fromISO, iso, isSameDay } from '@/shared/utils/date';
import { recalc } from '@/shared/utils/scoring';

export type HabitPatch = Partial<
  Pick<Habit, 'name' | 'frequency' | 'weeklyTarget' | 'monthlyTarget' | 'mode'>
>;

export interface CreateHabitInput {
  name: string;
  frequency: Frequency;
  weeklyTarget: number;
  monthlyTarget: number;
  mode: 'build' | 'break';
}

export interface CompletionToggleResult {
  habit: Habit;
  completionDelta: -1 | 1;
  dayKey: string;
}

export function createLocalId(): string {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  } catch {
    // Fall through for older or restricted browsers.
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createHabit(
  input: CreateHabitInput,
  now: Date,
  generateId: () => string = createLocalId,
): Habit {
  return recalc(
    {
      id: generateId(),
      name: input.name.trim(),
      frequency: input.frequency,
      archived: false,
      mode: input.mode,
      createdAt: now.toISOString(),
      completions: [],
      weeklyTarget: input.frequency === 'weekly' ? input.weeklyTarget : undefined,
      monthlyTarget: input.frequency === 'monthly' ? input.monthlyTarget : undefined,
      streak: 0,
      points: 0,
    },
    now,
  );
}

export function updateHabit(habit: Habit, patch: HabitPatch, now: Date): Habit {
  return recalc({ ...habit, ...patch }, now);
}

export function setHabitArchived(habit: Habit, archived: boolean): Habit {
  return { ...habit, archived };
}

export function toggleHabitCompletion(habit: Habit, date: Date, now: Date): CompletionToggleResult {
  const isAlreadyComplete = habit.completions.some((completion) =>
    isSameDay(fromISO(completion), date),
  );
  const completions = isAlreadyComplete
    ? habit.completions.filter((completion) => !isSameDay(fromISO(completion), date))
    : [...habit.completions, iso(date)];

  return {
    habit: recalc({ ...habit, completions }, now),
    completionDelta: isAlreadyComplete ? -1 : 1,
    dayKey: `${habit.id}@${iso(date)}`,
  };
}
