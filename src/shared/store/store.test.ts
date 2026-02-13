import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { setWeekStartsOnPreference } from '@/shared/utils/date';
import { useHabitStore } from './store';

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

describe('useHabitStore', () => {
  beforeEach(() => {
    localStorage.clear();
    resetHabitStore();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-10T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds a habit with trimmed name and correct targets', () => {
    const { addHabit } = useHabitStore.getState();
    addHabit('  Drink Water  ', 'weekly', 3);

    const { habits } = useHabitStore.getState();
    expect(habits).toHaveLength(1);
    expect(habits[0].name).toBe('Drink Water');
    expect(habits[0].frequency).toBe('weekly');
    expect(habits[0].weeklyTarget).toBe(3);
    expect(habits[0].monthlyTarget).toBeUndefined();
    expect(habits[0].archived).toBe(false);
  });

  it('toggles completions and awards weekly bonuses', () => {
    const { addHabit, toggleCompletion } = useHabitStore.getState();
    addHabit('Weekly Goal', 'weekly', 2);
    const habitId = useHabitStore.getState().habits[0].id;

    toggleCompletion(habitId, new Date('2024-01-10T12:00:00Z'));
    let state = useHabitStore.getState();
    expect(state.totalCompletions).toBe(1);
    expect(state.progress.points).toBe(5);
    expect(state.totalPoints).toBe(5);

    toggleCompletion(habitId, new Date('2024-01-11T12:00:00Z'));
    state = useHabitStore.getState();
    expect(state.totalCompletions).toBe(2);
    expect(state.progress.points).toBe(20);
    expect(state.totalPoints).toBe(20);

    toggleCompletion(habitId, new Date('2024-01-11T12:00:00Z'));
    state = useHabitStore.getState();
    expect(state.totalCompletions).toBe(1);
    expect(state.progress.points).toBe(5);
    expect(state.totalPoints).toBe(5);
  });

  it('archives, unarchives, and deletes habits', () => {
    const { addHabit, archiveHabit, unarchiveHabit, deleteHabit } = useHabitStore.getState();
    addHabit('Archive Me', 'daily');
    const habitId = useHabitStore.getState().habits[0].id;

    archiveHabit(habitId);
    expect(useHabitStore.getState().habits[0].archived).toBe(true);

    unarchiveHabit(habitId);
    expect(useHabitStore.getState().habits[0].archived).toBe(false);

    deleteHabit(habitId);
    expect(useHabitStore.getState().habits).toHaveLength(0);
  });
});
