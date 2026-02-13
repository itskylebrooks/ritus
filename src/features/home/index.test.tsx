import { useHabitStore } from '@/shared/store/store';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Home from './index';

vi.mock('./components/AddHabit', () => ({
  default: () => <div data-testid="add-habit" />,
}));

vi.mock('./components/HabitCard', () => ({
  default: () => <div data-testid="habit-card" />,
}));

vi.mock('./components/QuoteCard', () => ({
  default: () => <div data-testid="quote-card" />,
}));

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

describe('Home', () => {
  beforeEach(() => {
    localStorage.clear();
    resetHabitStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not trigger render-phase state update warnings when showAdd changes', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<Home />);

    act(() => {
      useHabitStore.getState().setShowAdd(false);
      useHabitStore.getState().setShowAdd(true);
    });

    const hasRenderPhaseWarning = errorSpy.mock.calls.some((call) =>
      call
        .map((value) => String(value))
        .join(' ')
        .includes('Cannot update a component while rendering a different component'),
    );

    expect(hasRenderPhaseWarning).toBe(false);
  });
});
