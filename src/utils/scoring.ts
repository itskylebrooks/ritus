import { Habit } from '../types'
import { addDays, fromISO, isSameCalendarWeek, isSameDay, startOfWeek, WSO } from './date'

export const POINTS_PER_COMPLETION = 10
export const DAILY_MILESTONE = 7   // 7-day streak bonus
export const WEEKLY_MILESTONE = 4  // 4-week streak bonus
export const MILESTONE_BONUS = 50

export function hasCompletionOnDay(completions: string[], day: Date) {
  return completions.some((c) => isSameDay(fromISO(c), day))
}

export function hasCompletionInWeek(completions: string[], dayInWeek: Date) {
  return completions.some((c) => isSameCalendarWeek(fromISO(c), dayInWeek))
}

export function calcDailyStreak(h: Habit, ref: Date = new Date()) {
  let s = 0
  let cur = new Date(ref)
  if (h.mode === 'break') {
    // For break habits, streak is consecutive days with a completion (user-marked clean days)
    while (hasCompletionOnDay(h.completions, cur)) {
      s += 1
      cur = addDays(cur, -1)
    }
  } else {
    while (hasCompletionOnDay(h.completions, cur)) {
      s += 1
      cur = addDays(cur, -1)
    }
  }
  return s
}

export function calcWeeklyStreak(h: Habit, ref: Date = new Date()) {
  // Count consecutive weeks with at least `weeklyTarget` completions, backwards from current week
  const target = h.weeklyTarget ?? 1
  let s = 0
  let cursor = new Date(ref)
  if (h.mode === 'break') {
    // For break habits, count consecutive calendar weeks that have at least one completion (user marked week as clean)
    while (true) {
      const weekCount = h.completions.filter((c) => isSameCalendarWeek(fromISO(c), cursor)).length
      if (weekCount > 0) {
        s += 1
        cursor = addDays(cursor, -7)
      } else break
    }
  } else {
    while (true) {
      // count completions in the week of cursor
      const weekCount = h.completions.filter((c) => isSameCalendarWeek(fromISO(c), cursor)).length
      if (weekCount >= target) {
        s += 1
        cursor = addDays(cursor, -7)
      } else break
    }
  }
  return s
}

export function calcPoints(h: Habit): number {
  let pts = 0

  if (h.mode === 'break') {
    // For break habits, points are based on user-marked clean days stored in completions
    const dates = [...h.completions].map(fromISO).sort((a, b) => a.getTime() - b.getTime())
    let streak = 0
    let prev: Date | null = null
    for (const d of dates) {
      if (!prev || isSameDay(d, addDays(prev, 1))) streak += 1
      else if (isSameDay(d, prev)) continue
      else streak = 1
      pts += POINTS_PER_COMPLETION
      if (streak % DAILY_MILESTONE === 0) pts += MILESTONE_BONUS
      prev = d
    }
  } else {
    // build behavior (existing)
    pts = h.completions.length * POINTS_PER_COMPLETION
    const dates = [...h.completions]
      .map(fromISO)
      .sort((a, b) => a.getTime() - b.getTime())

    if (h.frequency === 'daily') {
      let streak = 0
      let prev: Date | null = null
      for (const d of dates) {
        if (!prev || isSameDay(d, addDays(prev, 1))) streak += 1
        else if (isSameDay(d, prev)) continue
        else streak = 1
        if (streak % DAILY_MILESTONE === 0) pts += MILESTONE_BONUS
        prev = d
      }
    } else {
      // Weekly scoring: consider a week a 'hit' if completions in that calendar week >= weeklyTarget
      const target = h.weeklyTarget ?? 1
      // build list of week-start dates representing weeks with at least target completions
      const weeks: Date[] = []
      let lastWeek: Date | null = null
      for (const d of dates) {
        // find week of this date
        const wk = startOfWeek(d, WSO)
        if (lastWeek && isSameCalendarWeek(wk, lastWeek)) continue
        const count = h.completions.filter((c) => isSameCalendarWeek(fromISO(c), wk)).length
        if (count >= target) weeks.push(wk)
        lastWeek = wk
      }

      let streak = 0
      let prev: Date | null = null
      for (const wk of weeks) {
        if (!prev || isSameCalendarWeek(wk, addDays(prev, 7))) streak += 1
        else streak = 1
        if (streak % WEEKLY_MILESTONE === 0) pts += MILESTONE_BONUS
        prev = wk
      }
    }
  }

  return pts
}

export function recalc(h: Habit): Habit {
  const base = { ...h }
  base.streak = h.frequency === 'daily' ? calcDailyStreak(h) : calcWeeklyStreak(h)
  base.points = calcPoints(h)
  return base
}
