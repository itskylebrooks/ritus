import { reconcileCompletionReward, reconcileWeeklyTargetReward } from '@/shared/domain/rewards';
import { describe, expect, it } from 'vitest';

describe('reward reconciliation', () => {
  it('awards each completion once and revokes the matching award', () => {
    const awarded = reconcileCompletionReward({}, 'habit-1@2024-01-10', true);
    expect(awarded).toEqual({ keys: { 'habit-1@2024-01-10': true }, pointsDelta: 5 });
    expect(reconcileCompletionReward(awarded.keys, 'habit-1@2024-01-10', true).pointsDelta).toBe(0);
    expect(reconcileCompletionReward(awarded.keys, 'habit-1@2024-01-10', false)).toEqual({
      keys: {},
      pointsDelta: -5,
    });
  });

  it('uses the canonical milestone bonus for weekly targets', () => {
    const awarded = reconcileWeeklyTargetReward({}, 'habit-1@week', true);
    expect(awarded.pointsDelta).toBe(10);
    expect(reconcileWeeklyTargetReward(awarded.keys, 'habit-1@week', false).pointsDelta).toBe(-10);
  });
});
