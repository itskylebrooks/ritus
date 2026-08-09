/* eslint-disable no-empty */
import { emojiIndex, EmojiItem, resolveEmojiId } from '@/shared/constants/emojis';
import { useHabitStore } from '@/shared/store/store';
import { today } from '@/shared/utils/date';
import { useCallback, useEffect, useMemo } from 'react';

export interface EmojiOfTheDayState {
  emoji: EmojiItem | null;
  emojiId: string | null;
  setEmojiId: (id: string | null) => void;
  setEmoji: (emoji: EmojiItem | null) => void;
  clearEmoji: () => void;
  recents: EmojiItem[];
}

export function useEmojiOfTheDay(): EmojiOfTheDayState {
  const todayKey = today();
  const rawEmojiId = useHabitStore((s) => (s.emojiByDate || {})[todayKey] || null);
  const setEmojiForDate = useHabitStore((s) => s.setEmojiForDate);
  const recentsIds = useHabitStore((s) => (Array.isArray(s.emojiRecents) ? s.emojiRecents : []));
  const emojiId = rawEmojiId ? resolveEmojiId(rawEmojiId) : null;

  useEffect(() => {
    if (!rawEmojiId || !emojiId || rawEmojiId === emojiId) return;
    try {
      setEmojiForDate?.(todayKey, emojiId);
    } catch {}
  }, [rawEmojiId, emojiId, setEmojiForDate, todayKey]);

  useEffect(() => {
    if (!recentsIds.length) return;
    const normalizedRecents = recentsIds
      .map((id) => resolveEmojiId(id) ?? null)
      .filter((id): id is string => !!id);
    const hasDiff =
      normalizedRecents.length !== recentsIds.length ||
      normalizedRecents.some((id, idx) => id !== recentsIds[idx]);
    if (!hasDiff) return;
    queueMicrotask(() => {
      try {
        useHabitStore.setState?.((state) => ({
          ...state,
          emojiRecents: normalizedRecents,
        }));
      } catch {}
    });
  }, [recentsIds]);

  const setEmojiId = useCallback(
    (id: string | null) => {
      try {
        setEmojiForDate?.(todayKey, id);
      } catch {}
    },
    [setEmojiForDate, todayKey],
  );

  const clearEmoji = useCallback(() => {
    setEmojiId(null);
  }, [setEmojiId]);

  const setEmoji = useCallback(
    (emoji: EmojiItem | null) => {
      setEmojiId(emoji ? emoji.id : null);
    },
    [setEmojiId],
  );

  const emoji = emojiId ? (emojiIndex.get(emojiId) ?? null) : null;
  const recents = useMemo(
    () =>
      recentsIds
        .map((id) => resolveEmojiId(id))
        .map((id) => (id ? emojiIndex.get(id) : null))
        .filter(Boolean) as EmojiItem[],
    [recentsIds],
  );

  return { emoji, emojiId, setEmojiId, setEmoji, clearEmoji, recents };
}

export type { EmojiItem } from '@/shared/constants/emojis';
