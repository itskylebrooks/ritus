import type { Habit } from '@/shared/types';
import { setWeekStartsOnPreference } from '@/shared/utils/date';
import {
  calcMonthlyStreak,
  calcPoints,
  calcWeeklyStreak,
  countCompletionsInMonth,
} from '@/shared/utils/scoring';
import { beforeEach, describe, expect, it } from 'vitest';

function makeHabit(partial: Partial<Habit>): Habit {
  return {
    id: 'habit-1',
    name: 'Habit',
    frequency: 'daily',
    createdAt: '2024-01-01T00:00:00.000Z',
    completions: [],
    streak: 0,
    points: 0,
    mode: 'build',
    ...partial,
  };
}

describe('scoring', () => {
  beforeEach(() => {
    setWeekStartsOnPreference('monday');
  });

  it('calculates weekly streak as consecutive achieved weeks ending at current week', () => {
    const habit = makeHabit({
      frequency: 'weekly',
      weeklyTarget: 1,
      completions: ['2024-01-02T00:00:00.000Z', '2024-01-10T00:00:00.000Z', '2024-01-16T00:00:00.000Z'],
    });

    const streak = calcWeeklyStreak(habit, new Date('2024-01-18T12:00:00.000Z'));
    expect(streak).toBe(3);
  });

  it('resets weekly streak when current week target is not met', () => {
    const habit = makeHabit({
      frequency: 'weekly',
      weeklyTarget: 1,
      completions: ['2024-01-02T00:00:00.000Z', '2024-01-10T00:00:00.000Z'],
    });

    const streak = calcWeeklyStreak(habit, new Date('2024-01-18T12:00:00.000Z'));
    expect(streak).toBe(0);
  });

  it('calculates monthly streak as consecutive achieved months ending at current month', () => {
    const habit = makeHabit({
      frequency: 'monthly',
      monthlyTarget: 1,
      completions: ['2024-01-09T00:00:00.000Z', '2024-02-08T00:00:00.000Z', '2024-03-07T00:00:00.000Z'],
    });

    const streak = calcMonthlyStreak(habit, new Date('2024-03-15T12:00:00.000Z'));
    expect(streak).toBe(3);
  });

  it('deduplicates month completion counts by day', () => {
    const count = countCompletionsInMonth(
      ['2024-03-07T00:00:00.000Z', '2024-03-07T00:00:00.000Z', '2024-02-20T00:00:00.000Z'],
      new Date('2024-03-12T12:00:00.000Z'),
    );

    expect(count).toBe(1);
  });

  it('deduplicates weekly build points and awards weekly milestones correctly', () => {
    const habit = makeHabit({
      frequency: 'weekly',
      weeklyTarget: 1,
      completions: [
        '2024-01-01T00:00:00.000Z',
        '2024-01-08T00:00:00.000Z',
        '2024-01-15T00:00:00.000Z',
        '2024-01-22T00:00:00.000Z',
        '2024-01-22T00:00:00.000Z',
      ],
    });

    expect(calcPoints(habit)).toBe(70);
  });

  it('deduplicates break-habit points by day', () => {
    const habit = makeHabit({
      mode: 'break',
      frequency: 'daily',
      completions: [
        '2024-01-10T00:00:00.000Z',
        '2024-01-10T00:00:00.000Z',
        '2024-01-11T00:00:00.000Z',
      ],
    });

    expect(calcPoints(habit)).toBe(10);
  });
});
