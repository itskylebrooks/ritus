import type { ProgressState } from '@/shared/store/types';

export const DEFAULT_REMINDERS = { dailyEnabled: false, dailyTime: '21:00' } as const;

export function createDefaultProgress(): ProgressState {
  return {
    points: 0,
    weekBonusKeys: {},
    completionAwardKeys: {},
    unlocked: {},
    ownedCollectibles: [],
    appliedCollectibles: {},
    seenTrophies: {},
  };
}
