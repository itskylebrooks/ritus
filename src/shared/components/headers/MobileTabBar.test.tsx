import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import MobileTabBar from './MobileTabBar';

vi.mock('@/shared/hooks/useSmartSticky', () => ({
  useSmartSticky: () => ({ isVisible: true, isMobile: true, headerRef: { current: null } }),
}));

vi.mock('@/shared/animations', () => ({
  useMotionPreferences: () => ({ prefersReducedMotion: true }),
}));

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

describe('MobileTabBar', () => {
  it('marks the current route as active', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <LocationDisplay />
        <MobileTabBar />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText('Home')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByLabelText('Insight')).not.toHaveAttribute('aria-current');
    expect(screen.getByLabelText('Profile')).not.toHaveAttribute('aria-current');
  });

  it('navigates between tabs without re-triggering the active tab', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <LocationDisplay />
        <MobileTabBar />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('location')).toHaveTextContent('/');

    await user.click(screen.getByLabelText('Insight'));
    expect(screen.getByTestId('location')).toHaveTextContent('/insight');

    await user.click(screen.getByLabelText('Insight'));
    expect(screen.getByTestId('location')).toHaveTextContent('/insight');
  });
});
