import { useHabitStore } from '@/shared/store/store';
import { getWeekStartsOn, setWeekStartsOnPreference } from '@/shared/utils/date';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { exportAllData, importAllData } from './dataTransfer';

const baseProgress = {
  points: 0,
  weekBonusKeys: {},
  completionAwardKeys: {},
  unlocked: {},
  ownedCollectibles: [],
  appliedCollectibles: {},
  seenTrophies: {},
};

function resetHabitStore() {
  setWeekStartsOnPreference('monday');
  useHabitStore.setState({
    habits: [],
    progress: baseProgress,
    dateFormat: 'MDY',
    weekStart: 'monday',
    showAdd: true,
    showHomeCards: true,
    showArchived: false,
    showList: true,
    homeRefreshKey: 0,
    emojiByDate: {},
    emojiRecents: [],
    reminders: { dailyEnabled: false, dailyTime: '21:00' },
    totalPoints: 0,
    totalCompletions: 0,
    longestStreak: 0,
    daysWithRitus: 0,
  });
  useHabitStore.persist?.clearStorage?.();
}

describe('data transfer', () => {
  beforeEach(() => {
    localStorage.clear();
    resetHabitStore();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-10T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('round-trips key fields and week start preference', () => {
    const store = useHabitStore.getState();
    store.setDateFormat('DMY');
    store.setWeekStart('sunday');
    store.addHabit('Read', 'daily');
    const habitId = useHabitStore.getState().habits[0].id;
    store.toggleCompletion(habitId, new Date('2024-01-10T12:00:00Z'));
    useHabitStore.getState().setEmojiForDate?.('2024-01-10T00:00:00.000Z', '1F60A');

    const exported = JSON.stringify(exportAllData());

    resetHabitStore();
    useHabitStore.getState().setDateFormat('MDY');
    useHabitStore.getState().setWeekStart('monday');

    const result = importAllData(exported);
    expect(result.ok).toBe(true);

    const imported = useHabitStore.getState();
    expect(imported.habits).toHaveLength(1);
    expect(imported.habits[0].name).toBe('Read');
    expect(imported.dateFormat).toBe('DMY');
    expect(imported.weekStart).toBe('sunday');
    expect(imported.totalCompletions).toBe(1);
    expect(imported.emojiByDate?.['2024-01-10T00:00:00.000Z']).toBe('1F60A');
    expect(getWeekStartsOn()).toBe(0);
  });
});
