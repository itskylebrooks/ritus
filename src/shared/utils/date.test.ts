import { migrateHabitStoreState } from '@/shared/persistence/schema';
import { fromISO, normalizeLocalDate, toLocalDate } from '@/shared/utils/date';
import { describe, expect, it } from 'vitest';

describe('LocalDate', () => {
  it('formats and parses a local calendar day without a timezone component', () => {
    const local = new Date(2024, 0, 10, 23, 30);

    expect(toLocalDate(local)).toBe('2024-01-10');
    expect(normalizeLocalDate('2024-01-10')).toBe('2024-01-10');
    expect(fromISO('2024-01-10').getFullYear()).toBe(2024);
    expect(fromISO('2024-01-10').getMonth()).toBe(0);
    expect(fromISO('2024-01-10').getDate()).toBe(10);
  });

  it('migrates day-indexed persisted values to LocalDate keys', () => {
    const migrated = migrateHabitStoreState({
      habits: [
        {
          id: 'habit-1',
          name: 'Read',
          frequency: 'daily',
          createdAt: '2024-01-01T00:00:00.000Z',
          completions: ['2024-01-10'],
          streak: 1,
          points: 5,
        },
      ],
      emojiByDate: { '2024-01-10': '1F60A' },
      progress: { points: 5 },
    });

    expect(migrated).toMatchObject({
      habits: [{ completions: ['2024-01-10'] }],
      emojiByDate: { '2024-01-10': '1F60A' },
    });
  });
});
