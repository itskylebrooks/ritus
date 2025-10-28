import { useCallback, useEffect, useMemo } from 'react'
import { emojiIndex, EmojiItem, resolveEmojiId } from '@/shared/constants/emojis'
import { useHabitStore } from '@/shared/store/store'
import { iso } from '@/shared/utils/date'

export interface EmojiOfTheDayState {
  emoji: EmojiItem | null
  emojiId: string | null
  setEmojiId: (id: string | null) => void
  setEmoji: (emoji: EmojiItem | null) => void
  clearEmoji: () => void
  recents: EmojiItem[]
}

export function useEmojiOfTheDay(): EmojiOfTheDayState {
  const today = iso(new Date())
  const rawEmojiId = useHabitStore((s) => (s.emojiByDate || {})[today] || null)
  const setEmojiForDate = useHabitStore((s) => (s as any).setEmojiForDate as (d: string, id: string | null) => void)
  const recentsIds = useHabitStore((s) => (Array.isArray(s.emojiRecents) ? s.emojiRecents : []))
  const emojiId = rawEmojiId ? resolveEmojiId(rawEmojiId) : null

  useEffect(() => {
    if (!rawEmojiId || !emojiId || rawEmojiId === emojiId) return
    try { setEmojiForDate(today, emojiId) } catch {}
  }, [rawEmojiId, emojiId, setEmojiForDate, today])

  useEffect(() => {
    if (!recentsIds.length) return
    const normalizedRecents = recentsIds
      .map((id) => resolveEmojiId(id) ?? null)
      .filter((id): id is string => !!id)
    const hasDiff =
      normalizedRecents.length !== recentsIds.length ||
      normalizedRecents.some((id, idx) => id !== recentsIds[idx])
    if (!hasDiff) return
    try {
      useHabitStore.setState((state) => ({
        ...state,
        emojiRecents: normalizedRecents,
      }))
    } catch {}
  }, [recentsIds])

  const setEmojiId = useCallback((id: string | null) => {
    try { setEmojiForDate(today, id) } catch {}
  }, [setEmojiForDate, today])

  const clearEmoji = useCallback(() => {
    setEmojiId(null)
  }, [setEmojiId])

  const setEmoji = useCallback((emoji: EmojiItem | null) => {
    setEmojiId(emoji ? emoji.id : null)
  }, [setEmojiId])

  const emoji = emojiId ? emojiIndex.get(emojiId) ?? null : null
  const recents = useMemo(() => recentsIds
    .map((id) => resolveEmojiId(id))
    .map((id) => (id ? emojiIndex.get(id) : null))
    .filter(Boolean) as EmojiItem[], [recentsIds])

  return { emoji, emojiId, setEmojiId, setEmoji, clearEmoji, recents }
}

export type { EmojiItem } from '@/shared/constants/emojis'
