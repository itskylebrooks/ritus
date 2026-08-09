import { MILESTONE_BONUS, POINTS_PER_COMPLETION } from '@/shared/utils/scoring';

type AwardKeys = Record<string, true | undefined>;

export interface RewardReconciliation {
  keys: AwardKeys;
  pointsDelta: number;
}

function reconcileAward(
  current: AwardKeys,
  key: string,
  earned: boolean,
  points: number,
): RewardReconciliation {
  const keys = { ...current };
  const wasEarned = keys[key] === true;
  if (earned === wasEarned) return { keys, pointsDelta: 0 };
  if (earned) keys[key] = true;
  else delete keys[key];
  return { keys, pointsDelta: earned ? points : -points };
}

export function reconcileCompletionReward(
  current: AwardKeys,
  key: string,
  completed: boolean,
): RewardReconciliation {
  return reconcileAward(current, key, completed, POINTS_PER_COMPLETION);
}

export function reconcileWeeklyTargetReward(
  current: AwardKeys,
  key: string,
  reached: boolean,
): RewardReconciliation {
  return reconcileAward(current, key, reached, MILESTONE_BONUS);
}
