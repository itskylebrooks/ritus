import pkg from '../../package.json'
import { useHabitStore } from '../store/store'
import type { Habit } from '../types'
import { recalc } from './scoring'

export interface ImportResult {
  ok: true
  addedHabits: number
  duplicateHabits: number
  invalidHabits: number
  totalHabits: number
  usernameChanged: boolean
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
    habits: s.habits,
    username: s.username,
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
    const incomingUsername = typeof parsed.username === 'string' ? parsed.username : undefined
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
        completions: Array.isArray(h.completions) ? (h.completions as string[]) : [],
        mode: (h as Habit).mode ?? 'build',
        weeklyTarget: (h as Habit).weeklyTarget,
        streak: Number((h as Habit).streak ?? 0),
        points: Number((h as Habit).points ?? 0),
      })
    )
    const mergedHabits = [...cur.habits, ...normalized]

    const newUsername = incomingUsername ?? cur.username
    // stats: recompute totalPoints from merged habits; keep max for longestStreak
    const newTotal = mergedHabits.reduce((acc, h) => acc + (h.points || 0), 0)
    const newLongest = Math.max(cur.longestStreak || 0, incomingLongest || 0)

    // apply to store/persisted state
    if (newUsername && newUsername !== cur.username) useHabitStore.getState().setUsername(newUsername)
    const updated = {
      ...cur,
      habits: mergedHabits,
      username: newUsername,
      totalPoints: newTotal,
      longestStreak: newLongest,
    }
    try {
      const key = 'ritus-habits'
      localStorage.setItem(key, JSON.stringify({ state: updated, version: 1 }))
    } catch {
      // ignore; UI will still show feedback
    }

    return {
      ok: true,
      addedHabits: normalized.length,
      duplicateHabits,
      invalidHabits,
      totalHabits: mergedHabits.length,
      usernameChanged: newUsername !== cur.username,
      totalPointsPrev: cur.totalPoints || 0,
      totalPointsNew: newTotal,
      longestStreakPrev: cur.longestStreak || 0,
      longestStreakNew: newLongest,
    }
  } catch {
    return { ok: false, reason: 'invalid' }
  }
}
