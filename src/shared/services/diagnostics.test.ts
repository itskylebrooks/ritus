import { reportWarningOnce } from '@/shared/services/diagnostics';
import { describe, expect, it, vi } from 'vitest';

describe('diagnostics', () => {
  it('deduplicates expected environmental warnings', () => {
    const warningSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    reportWarningOnce('test:storage-denied', new Error('denied'), { area: 'storage' });
    reportWarningOnce('test:storage-denied', new Error('denied again'), { area: 'storage' });

    expect(warningSpy).toHaveBeenCalledTimes(1);
    warningSpy.mockRestore();
  });
});
