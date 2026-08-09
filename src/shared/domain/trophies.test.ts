import { computeLongestEmojiStreak, evaluateTrophyUnlocks } from '@/shared/domain/trophies';
import { describe, expect, it } from 'vitest';

describe('trophy evaluation', () => {
  it('calculates consecutive emoji days using LocalDate keys', () => {
    const emojiByDate = {
      '2024-01-01': '1F60A',
      '2024-01-02': '1F604',
      '2024-01-03': '1F603',
      '2024-01-05': '1F642',
    };

    expect(computeLongestEmojiStreak(emojiByDate)).toBe(3);
  });

  it('awards selected trophy groups idempotently', () => {
    const result = evaluateTrophyUnlocks({
      habits: [],
      totalCompletions: 50,
      emojiByDate: {},
      ownedCollectibles: [],
      unlocked: {},
      now: new Date(2024, 0, 10, 12),
      groups: ['totals'],
    });

    expect(result.newlyUnlocked).toContain('total_50');
    expect(
      evaluateTrophyUnlocks({
        habits: [],
        totalCompletions: 50,
        emojiByDate: {},
        ownedCollectibles: [],
        unlocked: result.unlocked,
        now: new Date(2024, 0, 10, 12),
        groups: ['totals'],
      }).newlyUnlocked,
    ).toEqual([]);
  });
});
