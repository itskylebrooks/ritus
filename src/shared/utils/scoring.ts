import { addMonths, isSameMonth, startOfMonth } from 'date-fns';
import {
  addDays,
  daysThisWeek,
  fromISO,
  getWeekStartsOn,
  isSameCalendarWeek,
  isSameDay,
  startOfWeek,
} from './date';
import type { Habit } from '@/shared/types';

export const POINTS_PER_COMPLETION = 5;
export const DAILY_MILESTONE = 7; // 7-day streak bonus
export const WEEKLY_MILESTONE = 4; // 4-week streak bonus
export const MILESTONE_BONUS = 10;

function uniqueSortedCompletionDates(completions: string[]): Date[] {
  const byDay = new Map<number, Date>();
  for (const completion of completions) {
    const day = fromISO(completion);
    const key = day.getTime();
    if (!byDay.has(key)) byDay.set(key, day);
  }
  return [...byDay.values()].sort((a, b) => a.getTime() - b.getTime());
}

function buildWeeklyCounts(dates: Date[], weekStartsOn: 0 | 1): Map<number, number> {
  const counts = new Map<number, number>();
  for (const day of dates) {
    const week = startOfWeek(day, { weekStartsOn });
    const key = week.getTime();
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

function buildMonthlyCounts(dates: Date[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const day of dates) {
    const month = startOfMonth(day);
    const key = month.getTime();
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

function achievedWeeksFromCounts(counts: Map<number, number>, target: number): Date[] {
  return [...counts.entries()]
    .filter(([, count]) => count >= target)
    .map(([key]) => new Date(key))
    .sort((a, b) => a.getTime() - b.getTime());
}

function achievedMonthsFromCounts(counts: Map<number, number>, target: number): Date[] {
  return [...counts.entries()]
    .filter(([, count]) => count >= target)
    .map(([key]) => new Date(key))
    .sort((a, b) => a.getTime() - b.getTime());
}

export function hasCompletionOnDay(completions: string[], day: Date) {
  return completions.some((c) => isSameDay(fromISO(c), day));
}

export function hasCompletionInWeek(completions: string[], dayInWeek: Date) {
  return completions.some((c) => isSameCalendarWeek(fromISO(c), dayInWeek));
}

export function hasCompletionInMonth(completions: string[], dayInMonth: Date) {
  return completions.some((c) => isSameMonth(fromISO(c), dayInMonth));
}

export function countCompletionsInWeek(
  completions: string[],
  ref: Date = new Date(),
  weekStartsOn?: 0 | 1,
): number {
  const week = daysThisWeek(ref, weekStartsOn ?? getWeekStartsOn());
  return week.filter((d) => hasCompletionOnDay(completions, d)).length;
}

export function countCompletionsInMonth(completions: string[], ref: Date = new Date()): number {
  // count unique days within the calendar month that have a completion
  return uniqueSortedCompletionDates(completions).filter((d) => isSameMonth(d, ref)).length;
}

export function calcDailyStreak(h: Habit, ref: Date = new Date()) {
  let s = 0;
  let cur = new Date(ref);
  // For both 'build' and 'break' modes, daily streak counts consecutive
  // days with a completion (clean day for 'break', done for 'build').
  while (hasCompletionOnDay(h.completions, cur)) {
    s += 1;
    cur = addDays(cur, -1);
  }
  return s;
}

export function calcWeeklyStreak(h: Habit, ref: Date = new Date()) {
  // Weekly streak is consecutive achieved weeks ending at the current calendar week.
  const target = h.weeklyTarget ?? 1;
  const weekStartsOn = getWeekStartsOn();
  const dates = uniqueSortedCompletionDates(h.completions || []);
  const weekCounts = buildWeeklyCounts(dates, weekStartsOn);
  let cur = startOfWeek(ref, { weekStartsOn });
  let streak = 0;
  while ((weekCounts.get(cur.getTime()) || 0) >= target) {
    streak += 1;
    cur = addDays(cur, -7);
  }
  return streak;
}

export function calcMonthlyStreak(h: Habit, ref: Date = new Date()) {
  // Monthly streak is consecutive achieved months ending at the current calendar month.
  const target = h.monthlyTarget ?? 1;
  const dates = uniqueSortedCompletionDates(h.completions || []);
  const monthCounts = buildMonthlyCounts(dates);
  let cur = startOfMonth(ref);
  let streak = 0;
  while ((monthCounts.get(cur.getTime()) || 0) >= target) {
    streak += 1;
    cur = addMonths(cur, -1);
  }
  return streak;
}

export function calcPoints(h: Habit): number {
  let pts = 0;
  const dates = uniqueSortedCompletionDates(h.completions || []);
  const uniqueCompletionCount = dates.length;
  const weekStartsOn = getWeekStartsOn();

  if (h.mode === 'break') {
    // For break habits, points are based on user-marked clean days stored in completions
    let streak = 0;
    let prev: Date | null = null;
    for (const d of dates) {
      if (!prev || isSameDay(d, addDays(prev, 1))) streak += 1;
      else streak = 1;
      pts += POINTS_PER_COMPLETION;
      if (streak % DAILY_MILESTONE === 0) pts += MILESTONE_BONUS;
      prev = d;
    }
  } else {
    pts = uniqueCompletionCount * POINTS_PER_COMPLETION;

    if (h.frequency === 'daily') {
      let streak = 0;
      let prev: Date | null = null;
      for (const d of dates) {
        if (!prev || isSameDay(d, addDays(prev, 1))) streak += 1;
        else streak = 1;
        if (streak % DAILY_MILESTONE === 0) pts += MILESTONE_BONUS;
        prev = d;
      }
    } else if (h.frequency === 'weekly') {
      const target = h.weeklyTarget ?? 1;
      const weekCounts = buildWeeklyCounts(dates, weekStartsOn);
      const weeks = achievedWeeksFromCounts(weekCounts, target);

      // Award a per-week completion bonus for each week that met the weekly target.
      // This gives weekly habits a +MILESTONE_BONUS for completing the "week challenge".
      if (weeks.length > 0) pts += weeks.length * MILESTONE_BONUS;

      let streak = 0;
      let prev: Date | null = null;
      for (const wk of weeks) {
        if (!prev || isSameCalendarWeek(wk, addDays(prev, 7))) streak += 1;
        else streak = 1;
        if (streak % WEEKLY_MILESTONE === 0) pts += MILESTONE_BONUS;
        prev = wk;
      }
    } else if (h.frequency === 'monthly') {
      const target = h.monthlyTarget ?? 1;
      const monthCounts = buildMonthlyCounts(dates);
      const months = achievedMonthsFromCounts(monthCounts, target);

      if (months.length > 0) pts += months.length * MILESTONE_BONUS;

      let streak = 0;
      let prev: Date | null = null;
      for (const mo of months) {
        if (!prev || isSameMonth(mo, addMonths(prev, 1))) streak += 1;
        else streak = 1;
        // reuse weekly milestone constant here for monthly streak milestones
        if (streak % WEEKLY_MILESTONE === 0) pts += MILESTONE_BONUS;
        prev = mo;
      }
    }
  }

  return pts;
}

export function recalc(h: Habit): Habit {
  const base = { ...h };
  base.streak =
    h.frequency === 'daily'
      ? calcDailyStreak(h)
      : h.frequency === 'weekly'
        ? calcWeeklyStreak(h)
        : calcMonthlyStreak(h);
  base.points = calcPoints(h);
  return base;
}
