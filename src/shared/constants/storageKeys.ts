export const STORAGE_KEYS = {
  HABITS: 'ritus-habits',
  THEME_STORE: 'ritus-theme-store',
  THEME_MODE: 'ritus-theme',
  THEME_LAST_RESOLVED: 'ritus-last-theme',
  SEEN_GUIDE: 'ritus_seen_guide',
  BACKUP_SUGGESTION_LAST_SHOWN: 'ritus-backup-suggestion-lastShown',
} as const;

export const RITUS_STORAGE_KEYS: readonly string[] = Object.values(STORAGE_KEYS);
