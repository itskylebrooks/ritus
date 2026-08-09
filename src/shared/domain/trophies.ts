import { TROPHIES, type TrophyGroup } from '@/shared/constants/trophies';
import type { Habit } from '@/shared/types';
import { fromISO, iso, lastNDays } from '@/shared/utils/date';

export interface TrophyEvaluationInput {
  habits: Habit[];
  totalCompletions: number;
  emojiByDate: Record<string, string | undefined>;
  ownedCollectibles: string[];
  unlocked: Record<string, string>;
  now: Date;
  groups?: readonly TrophyGroup[];
  excludedIds?: readonly string[];
}

export interface TrophyEvaluationResult {
  unlocked: Record<string, string>;
  newlyUnlocked: string[];
  unlockedAt: string;
}

export function computeLongestEmojiStreak(emojiByDate: Record<string, string | undefined>): number {
  const days = new Set(Object.keys(emojiByDate).map((key) => key.slice(0, 10)));
  let longest = 0;
  for (const day of days) {
    const current = fromISO(day);
    current.setDate(current.getDate() - 1);
    if (days.has(iso(current))) continue;

    let length = 0;
    const cursor = fromISO(day);
    while (days.has(iso(cursor))) {
      length += 1;
      cursor.setDate(cursor.getDate() + 1);
    }
    longest = Math.max(longest, length);
  }
  return longest;
}

function maximumStreak(habits: Habit[], predicate: (habit: Habit) => boolean): number {
  return Math.max(0, ...habits.filter(predicate).map((habit) => habit.streak || 0));
}

export function evaluateTrophyUnlocks(input: TrophyEvaluationInput): TrophyEvaluationResult {
  const unlocked = { ...input.unlocked };
  const newlyUnlocked: string[] = [];
  const unlockedAt = iso(input.now);
  const allowedGroups = input.groups ? new Set(input.groups) : null;
  const excludedIds = new Set(input.excludedIds || []);
  const completionDays = new Set(
    input.habits.flatMap((habit) => habit.completions.map((completion) => completion.slice(0, 10))),
  );
  const activeDaily = input.habits.filter(
    (habit) => !habit.archived && habit.frequency === 'daily',
  );
  const dailyBuildStreak = maximumStreak(
    input.habits,
    (habit) => habit.frequency === 'daily' && habit.mode === 'build',
  );
  const dailyBreakStreak = maximumStreak(
    input.habits,
    (habit) => habit.frequency === 'daily' && habit.mode === 'break',
  );
  const weeklyStreak = maximumStreak(input.habits, (habit) => habit.frequency === 'weekly');
  const monthlyStreak = maximumStreak(input.habits, (habit) => habit.frequency === 'monthly');
  const maxBuildStreak = maximumStreak(input.habits, (habit) => habit.mode === 'build');
  const maxBreakStreak = maximumStreak(input.habits, (habit) => habit.mode === 'break');
  const emojiStreak = computeLongestEmojiStreak(input.emojiByDate);

  const hasContinuousDays = (count: number) =>
    lastNDays(count, input.now).every((day) => completionDays.has(iso(day)));
  const allActiveDailyCompleted = (count: number) =>
    activeDaily.length > 0 &&
    lastNDays(count, input.now).every((day) =>
      activeDaily.every((habit) => habit.completions.includes(iso(day))),
    );

  const meets = (trophy: (typeof TROPHIES)[number]): boolean => {
    switch (trophy.group) {
      case 'daily_build':
        return dailyBuildStreak >= trophy.threshold;
      case 'daily_break':
        return dailyBreakStreak >= trophy.threshold;
      case 'weekly':
        return weeklyStreak >= trophy.threshold;
      case 'monthly':
        return monthlyStreak >= trophy.threshold;
      case 'totals':
        return input.totalCompletions >= trophy.threshold;
      case 'milestone':
        return completionDays.size >= trophy.threshold;
      case 'emoji':
        return emojiStreak >= trophy.threshold;
      case 'meta':
        switch (trophy.id) {
          case 'meta_first_collectible':
            return input.ownedCollectibles.length >= trophy.threshold;
          case 'meta_10_habits':
            return input.habits.length >= trophy.threshold;
          case 'meta_balance':
            return maxBuildStreak >= trophy.threshold && maxBreakStreak >= trophy.threshold;
          case 'meta_focus':
            return allActiveDailyCompleted(trophy.threshold);
          case 'meta_persistence':
            return hasContinuousDays(trophy.threshold);
          default:
            return false;
        }
    }
  };

  for (const trophy of TROPHIES) {
    if (
      unlocked[trophy.id] ||
      excludedIds.has(trophy.id) ||
      (allowedGroups && !allowedGroups.has(trophy.group))
    )
      continue;
    if (!meets(trophy)) continue;
    unlocked[trophy.id] = unlockedAt;
    newlyUnlocked.push(trophy.id);
  }

  return { unlocked, newlyUnlocked, unlockedAt };
}
