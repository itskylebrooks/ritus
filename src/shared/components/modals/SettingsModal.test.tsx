import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { STORAGE_KEYS } from '@/shared/constants/storageKeys';
import { useHabitStore } from '@/shared/store/store';
import SettingsModal from './SettingsModal';
import useThemeStore from '@/shared/store/theme';

vi.mock('@/shared/hooks/useIsMobile', () => ({
  useIsMobile: () => false,
}));

vi.mock('@/shared/hooks/usePWA', () => ({
  usePWA: () => ({
    isInstalled: false,
    canInstall: false,
    install: vi.fn(),
    isIosDevice: false,
    isAndroidDevice: false,
  }),
}));

vi.mock('@/shared/utils/dataTransfer', () => ({
  exportAllData: vi.fn(() => ({})),
  importAllData: vi.fn(() => ({ ok: true })),
}));

describe('SettingsModal', () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.setState({ mode: 'system', theme: 'light' });
    useHabitStore.setState({
      reminders: { dailyEnabled: false, dailyTime: '21:00' },
      dateFormat: 'MDY',
      weekStart: 'monday',
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('updates the theme mode when selecting a theme button', async () => {
    const user = userEvent.setup();
    render(<SettingsModal open onClose={vi.fn()} />);

    const lightButton = await screen.findByLabelText('Light');
    await user.click(lightButton);

    expect(useThemeStore.getState().mode).toBe('light');
    expect(lightButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onClose after the close animation', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<SettingsModal open onClose={onClose} />);

    act(() => {
      vi.runOnlyPendingTimers();
    });

    fireEvent.click(screen.getByLabelText('Close settings'));

    act(() => {
      vi.advanceTimersByTime(220);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('resets only ritus storage keys', async () => {
    const user = userEvent.setup();
    localStorage.setItem(STORAGE_KEYS.HABITS, '{"state":{}}');
    localStorage.setItem(STORAGE_KEYS.THEME_MODE, 'dark');
    localStorage.setItem('unrelated-key', 'keep-me');

    render(<SettingsModal open onClose={vi.fn()} />);

    await user.click(screen.getByLabelText('Reset local data'));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    const habitsRaw = localStorage.getItem(STORAGE_KEYS.HABITS);
    expect(habitsRaw).not.toBeNull();
    const habitsState = JSON.parse(habitsRaw as string) as {
      state?: { habits?: unknown[] };
    };
    expect(habitsState.state?.habits ?? []).toHaveLength(0);
    expect(localStorage.getItem(STORAGE_KEYS.THEME_MODE)).toBeNull();
    expect(localStorage.getItem('unrelated-key')).toBe('keep-me');
    expect(useHabitStore.getState().habits).toHaveLength(0);
  });
});
