import type { Frequency, Habit } from '@/shared/types';

export interface ProgressState {
  points: number;
  weekBonusKeys?: Record<string, true | undefined>;
  completionAwardKeys?: Record<string, true | undefined>;
  unlocked?: Record<string, string>;
  ownedCollectibles?: string[];
  appliedCollectibles?: Record<string, string>;
  seenTrophies?: Record<string, true | undefined>;
  lastUnlockedTrophyAt?: string;
}

export interface HabitState {
  habits: Habit[];
  progress: ProgressState;
  setPoints: (n: number) => void;
  addPoints: (delta: number) => void;
  tryAwardWeeklyBonus: (habitId: string, weekDate: Date, reached: boolean) => void;
  awardTrophies: (summary: {
    dailyBuildStreak: number;
    dailyBreakStreak: number;
    weeklyStreak: number;
    totalCompletions: number;
    emojiStreak?: number;
  }) => string[];
  purchaseCollectible: (id: string, cost: number) => boolean;
  applyCollectible: (id: string) => boolean;
  markTrophiesSeen: (ids: string[]) => void;
  dateFormat: 'MDY' | 'DMY';
  setDateFormat: (f: 'MDY' | 'DMY') => void;
  weekStart: 'sunday' | 'monday';
  setWeekStart: (w: 'sunday' | 'monday') => void;
  showAdd: boolean;
  setShowAdd: (v: boolean) => void;
  showHomeCards: boolean;
  setShowHomeCards: (v: boolean) => void;
  showArchived: boolean;
  setShowArchived: (v: boolean) => void;
  showList: boolean;
  setShowList: (v: boolean) => void;
  homeRefreshKey?: number;
  triggerHomeRefresh: () => void;
  emojiByDate?: Record<string, string | undefined>;
  emojiRecents?: string[];
  setEmojiForDate?: (dateISO: string, emojiId: string | null) => void;
  clearEmojiData?: () => void;
  syncEmojiTrophies: () => string[];
  archiveHabit: (id: string) => void;
  unarchiveHabit: (id: string) => void;
  reminders: { dailyEnabled: boolean; dailyTime: string };
  setReminders: (r: { dailyEnabled: boolean; dailyTime: string }) => void;
  totalPoints: number;
  totalCompletions: number;
  longestStreak: number;
  daysWithRitus: number;
  resetStats: () => void;
  addHabit: (
    name: string,
    frequency: Frequency,
    weeklyTarget?: number,
    monthlyTarget?: number,
    mode?: 'build' | 'break',
  ) => void;
  editHabit: (
    id: string,
    patch: Partial<Pick<Habit, 'name' | 'frequency' | 'weeklyTarget' | 'monthlyTarget' | 'mode'>>,
  ) => void;
  deleteHabit: (id: string) => void;
  toggleCompletion: (id: string, date: Date) => void;
  clearAll: () => void;
}
