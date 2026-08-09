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

  it('merges progression and emoji history without losing newer local data', () => {
    useHabitStore.setState({
      progress: {
        ...baseProgress,
        points: 120,
        ownedCollectibles: ['accent_ocean'],
        unlocked: { local_trophy: '2024-01-09T00:00:00.000Z' },
      },
      emojiByDate: { '2024-01-10T00:00:00.000Z': '1F60A' },
      emojiRecents: ['1F60A'],
    });

    const result = importAllData(
      JSON.stringify({
        app: 'ritus',
        schemaVersion: 1,
        habits: [],
        progress: {
          points: 20,
          ownedCollectibles: ['accent_ember'],
          unlocked: { imported_trophy: '2024-01-01T00:00:00.000Z' },
        },
        emojiByDate: { '2024-01-08T00:00:00.000Z': '1F604' },
        emojiRecents: ['1F604'],
      }),
    );

    expect(result.ok).toBe(true);
    const state = useHabitStore.getState();
    expect(state.progress.points).toBe(120);
    expect(state.progress.ownedCollectibles).toEqual(['accent_ocean', 'accent_ember']);
    expect(state.progress.unlocked).toMatchObject({
      local_trophy: '2024-01-09T00:00:00.000Z',
      imported_trophy: '2024-01-01T00:00:00.000Z',
    });
    expect(state.emojiByDate).toMatchObject({
      '2024-01-10T00:00:00.000Z': '1F60A',
      '2024-01-08T00:00:00.000Z': '1F604',
    });
    expect(state.emojiRecents).toEqual(['1F60A', '1F604']);
  });

  it('rejects future schemas and reports malformed habits', () => {
    expect(importAllData(JSON.stringify({ app: 'ritus', schemaVersion: 99, habits: [] }))).toEqual({
      ok: false,
      reason: 'unsupported_version',
    });

    const result = importAllData(
      JSON.stringify({
        app: 'ritus',
        habits: [
          { id: 'invalid', name: 'Invalid', frequency: 'yearly' },
          {
            id: 'valid',
            name: 'Valid',
            frequency: 'daily',
            createdAt: '2024-01-01T00:00:00.000Z',
            completions: [],
          },
        ],
      }),
    );

    expect(result).toMatchObject({ ok: true, addedHabits: 1, invalidHabits: 1 });
  });
});
