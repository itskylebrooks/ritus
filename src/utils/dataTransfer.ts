import pkg from '../../package.json'
import { useHabitStore } from '../store/store'
import type { Habit } from '../types'
import { recalc } from './scoring'
import { iso, fromISO } from './date'

export interface ImportResult {
  ok: true
  addedHabits: number
  duplicateHabits: number
  invalidHabits: number
  totalHabits: number
  totalPointsPrev: number
  totalPointsNew: number
  longestStreakPrev: number
  longestStreakNew: number
}

export type ImportResultFail = { ok: false; reason: 'invalid' | 'not_ritus' }

export function exportAllData() {
  const s = useHabitStore.getState()
  return {
    app: 'ritus',
    version: pkg.version,
    exportedAt: new Date().toISOString(),
    // Ensure exported completions are date-only ISO strings (no time part)
    habits: s.habits.map((h) => ({ ...h, completions: (h.completions || []).map((c) => iso(fromISO(c))) })),
    // export formatting settings so they can be restored on import
    dateFormat: s.dateFormat,
    weekStart: s.weekStart,
    // no reminders in export
    totalPoints: s.totalPoints,
    longestStreak: s.longestStreak,
  }
}

export function importAllData(txt: string): ImportResult | ImportResultFail {
  try {
    const parsed = JSON.parse(txt)
    if (!parsed || typeof parsed !== 'object') return { ok: false, reason: 'invalid' }
    if (parsed.app !== 'ritus') return { ok: false, reason: 'not_ritus' }
    const incomingHabits: Partial<Habit>[] = Array.isArray(parsed.habits) ? parsed.habits : []
  const incomingDateFormat: 'DMY' | 'MDY' | undefined = parsed.dateFormat === 'DMY' ? 'DMY' : parsed.dateFormat === 'MDY' ? 'MDY' : undefined
  const incomingWeekStart: 'sunday' | 'monday' | undefined = parsed.weekStart === 'sunday' ? 'sunday' : parsed.weekStart === 'monday' ? 'monday' : undefined
    const incomingTotal = typeof parsed.totalPoints === 'number' ? parsed.totalPoints : 0
    const incomingLongest = typeof parsed.longestStreak === 'number' ? parsed.longestStreak : 0

    const cur = useHabitStore.getState()
    const existingIds = new Set(cur.habits.map((h) => h.id))
    const validIncoming = incomingHabits.filter((h) => h && (h as Habit).id)
    const toAdd = validIncoming.filter((h) => !existingIds.has((h as Habit).id as string))
    const duplicateHabits = validIncoming.length - toAdd.length
    const invalidHabits = incomingHabits.length - validIncoming.length

    const normalized = toAdd.map((h) =>
      recalc({
        id: String((h as Habit).id),
        name: String(h.name ?? ''),
        frequency: (h as Habit).frequency ?? 'daily',
        createdAt: String((h as Habit).createdAt ?? new Date().toISOString()),
        // Normalize incoming completions to date-only ISO strings (no time component)
        completions: Array.isArray(h.completions)
          ? (h.completions as string[]).map((c) => iso(fromISO(String(c))))
          : [],
        mode: (h as Habit).mode ?? 'build',
        weeklyTarget: (h as Habit).weeklyTarget,
        streak: Number((h as Habit).streak ?? 0),
        points: Number((h as Habit).points ?? 0),
      })
    )
    const mergedHabits = [...cur.habits, ...normalized]

    // stats: recompute totalPoints from merged habits; keep max for longestStreak
    const newTotal = mergedHabits.reduce((acc, h) => acc + (h.points || 0), 0)
    const newLongest = Math.max(cur.longestStreak || 0, incomingLongest || 0)

    // apply to store/persisted state
    const updated = {
      // only persist the partial snapshot used by our persist `partialize`
      habits: mergedHabits,
      reminders: cur.reminders,
      totalPoints: newTotal,
      longestStreak: newLongest,
      // restore formatting settings from import when available
      dateFormat: incomingDateFormat ?? cur.dateFormat,
      weekStart: incomingWeekStart ?? cur.weekStart,
      showAdd: cur.showAdd,
    }

    try {
      const key = 'ritus-habits'
      // Persist the same shape the app expects (no {state,version} wrapper).
      localStorage.setItem(key, JSON.stringify(updated))
    } catch {
      // ignore write errors; we'll still update in-memory store below
    }

    // Update in-memory store so the UI reflects the import immediately.
    // Use setState to update only the persisted fields; keep other funcs intact.
    useHabitStore.setState((s) => ({
      habits: updated.habits,
      totalPoints: updated.totalPoints,
      longestStreak: updated.longestStreak,
      dateFormat: updated.dateFormat,
      weekStart: updated.weekStart,
    }))

    return {
      ok: true,
      addedHabits: normalized.length,
      duplicateHabits,
      invalidHabits,
      totalHabits: mergedHabits.length,
      totalPointsPrev: cur.totalPoints || 0,
      totalPointsNew: newTotal,
      longestStreakPrev: cur.longestStreak || 0,
      longestStreakNew: newLongest,
    }
  } catch {
    return { ok: false, reason: 'invalid' }
  }
}
