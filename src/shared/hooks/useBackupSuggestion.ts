import { STORAGE_KEYS } from '@/shared/constants/storageKeys';
import { exportAllData } from '@/shared/utils/dataTransfer';
import { safeGetItem, safeSetItem } from '@/shared/utils/storage';
import { useCallback, useEffect, useState } from 'react';

function getCurrentYearMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function isBeginningOfMonthWindow(): boolean {
  // Consider the first 5 days of the month as "beginning"
  const d = new Date();
  return d.getDate() <= 5;
}

export default function useBackupSuggestion() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const last = safeGetItem(STORAGE_KEYS.BACKUP_SUGGESTION_LAST_SHOWN);
      const current = getCurrentYearMonth();
      if (last === current) return; // already shown this month
      if (!isBeginningOfMonthWindow()) return; // only show at start of month
      // Don't show for brand-new users before they've seen the quick guide
      const seenGuide = safeGetItem(STORAGE_KEYS.SEEN_GUIDE);
      if (!seenGuide) return;
      setOpen(true);
    } catch (err) {
      console.debug('useBackupSuggestion storage error', err);
    }
  }, []);

  const markShown = useCallback(() => {
    try {
      safeSetItem(STORAGE_KEYS.BACKUP_SUGGESTION_LAST_SHOWN, getCurrentYearMonth());
    } catch (err) {
      console.debug('useBackupSuggestion markShown error', err);
    }
    setOpen(false);
  }, []);

  const handleExport = useCallback(() => {
    try {
      const payload = exportAllData();
      const json = JSON.stringify(payload, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const now = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `ritus-export-${now}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.debug('useBackupSuggestion export error', err);
    } finally {
      markShown();
    }
  }, [markShown]);

  return {
    open,
    close: markShown,
    exportNow: handleExport,
  } as const;
}
