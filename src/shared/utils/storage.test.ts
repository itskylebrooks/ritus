import { RITUS_STORAGE_KEYS } from '@/shared/constants/storageKeys';
import { clearRitusStorage } from '@/shared/utils/storage';
import { beforeEach, describe, expect, it } from 'vitest';

describe('storage utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('clears only Ritus keys', () => {
    for (const key of RITUS_STORAGE_KEYS) {
      localStorage.setItem(key, 'ritus-value');
    }
    localStorage.setItem('unrelated-key', 'keep-me');

    clearRitusStorage();

    for (const key of RITUS_STORAGE_KEYS) {
      expect(localStorage.getItem(key)).toBeNull();
    }
    expect(localStorage.getItem('unrelated-key')).toBe('keep-me');
  });
});
