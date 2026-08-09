import { createHabit, toggleHabitCompletion, updateHabit } from '@/shared/domain/habits';
import { refreshHabitDerivations } from '@/shared/domain/statistics';
import type { Habit } from '@/shared/types';
import { normalizeLocalDate } from '@/shared/utils/date';
import { describe, expect, it } from 'vitest';

function day(value: string) {
  const normalized = normalizeLocalDate(value);
  if (!normalized) throw new Error(`Invalid test date: ${value}`);
  return normalized;
}

describe('habit domain', () => {
  it('creates and updates a habit independently from the store', () => {
    const now = new Date(2024, 0, 10, 12);
    const habit = createHabit(
      {
        name: '  Read  ',
        frequency: 'weekly',
        weeklyTarget: 3,
        monthlyTarget: 1,
        mode: 'build',
      },
      now,
      () => 'habit-1',
    );

    expect(habit).toMatchObject({
      id: 'habit-1',
      name: 'Read',
      frequency: 'weekly',
      weeklyTarget: 3,
    });
    expect(updateHabit(habit, { name: 'Write' }, now).name).toBe('Write');
  });

  it('toggles a LocalDate completion idempotently', () => {
    const now = new Date(2024, 0, 10, 12);
    const habit = createHabit(
      {
        name: 'Read',
        frequency: 'daily',
        weeklyTarget: 1,
        monthlyTarget: 1,
        mode: 'build',
      },
      now,
      () => 'habit-1',
    );

    const added = toggleHabitCompletion(habit, now, now);
    expect(added.completionDelta).toBe(1);
    expect(added.habit.completions).toEqual(['2024-01-10']);

    const removed = toggleHabitCompletion(added.habit, now, now);
    expect(removed.completionDelta).toBe(-1);
    expect(removed.habit.completions).toEqual([]);
  });

  it('refreshes stale time-derived streaks during hydration', () => {
    const staleHabit: Habit = {
      id: 'habit-1',
      name: 'Read',
      frequency: 'daily',
      createdAt: '2024-01-01T00:00:00.000Z',
      completions: [day('2024-01-09')],
      mode: 'build',
      streak: 99,
      points: 5,
    };

    const [refreshed] = refreshHabitDerivations([staleHabit], new Date(2024, 0, 10, 12));
    expect(refreshed.streak).toBe(0);
  });
});
