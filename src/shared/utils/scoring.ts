import { addMonths, isSameMonth, startOfMonth } from 'date-fns'
import { addDays, daysThisWeek, fromISO, getWeekStartsOn, isSameCalendarWeek, isSameDay, startOfWeek } from './date'
import type { Habit } from '@/shared/types'

export const POINTS_PER_COMPLETION = 5
export const DAILY_MILESTONE = 7   // 7-day streak bonus
export const WEEKLY_MILESTONE = 4  // 4-week streak bonus
export const MILESTONE_BONUS = 10

export function hasCompletionOnDay(completions: string[], day: Date) {
  return completions.some((c) => isSameDay(fromISO(c), day))
}

export function hasCompletionInWeek(completions: string[], dayInWeek: Date) {
  return completions.some((c) => isSameCalendarWeek(fromISO(c), dayInWeek))
}

export function hasCompletionInMonth(completions: string[], dayInMonth: Date) {
  return completions.some((c) => isSameMonth(fromISO(c), dayInMonth))
}

export function countCompletionsInWeek(completions: string[], ref: Date = new Date(), weekStartsOn?: 0 | 1): number {
  const week = daysThisWeek(ref, weekStartsOn ?? getWeekStartsOn())
  return week.filter((d) => hasCompletionOnDay(completions, d)).length
}

export function countCompletionsInMonth(completions: string[], ref: Date = new Date()): number {
  // count unique days within the calendar month that have a completion
  return completions.map(fromISO).filter((d) => isSameMonth(d, ref)).length
}

export function calcDailyStreak(h: Habit, ref: Date = new Date()) {
  let s = 0
  let cur = new Date(ref)
  // For both 'build' and 'break' modes, daily streak counts consecutive
  // days with a completion (clean day for 'break', done for 'build').
  while (hasCompletionOnDay(h.completions, cur)) {
    s += 1
    cur = addDays(cur, -1)
  }
  return s
}

export function calcWeeklyStreak(h: Habit) {
  // Count total weeks with at least `weeklyTarget` completions
  const target = h.weeklyTarget ?? 1
  const dates = [...h.completions].map(fromISO).sort((a, b) => a.getTime() - b.getTime())
  const weeks = new Set<string>()

  for (const d of dates) {
    const weekStart = startOfWeek(d, { weekStartsOn: getWeekStartsOn() }).toISOString()
    weeks.add(weekStart)
  }

  let streak = 0
  for (const week of weeks) {
    const weekDate = fromISO(week)
    const completionsInWeek = h.completions.filter((c) => isSameCalendarWeek(fromISO(c), weekDate)).length
    if (completionsInWeek >= target) {
      streak++
    }
  }

  return streak
}

export function calcMonthlyStreak(h: Habit) {
  // Count total months with at least `monthlyTarget` completions
  const target = h.monthlyTarget ?? 1
  const dates = [...h.completions].map(fromISO).sort((a, b) => a.getTime() - b.getTime())
  const months = new Set<string>()

  for (const d of dates) {
    const monthStart = startOfMonth(d).toISOString()
    months.add(monthStart)
  }

  let streak = 0
  for (const month of months) {
    const monthDate = fromISO(month)
    const completionsInMonth = h.completions.filter((c) => isSameMonth(fromISO(c), monthDate)).length
    if (completionsInMonth >= target) {
      streak++
    }
  }

  return streak
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
    } else if (h.frequency === 'weekly') {
      // Weekly scoring: consider a week a 'hit' if completions in that calendar week >= weeklyTarget
      const target = h.weeklyTarget ?? 1
      // build list of week-start dates representing weeks with at least target completions
      const weeks: Date[] = []
      let lastWeek: Date | null = null
      for (const d of dates) {
        // find week of this date
        const wk = startOfWeek(d, { weekStartsOn: getWeekStartsOn() })
        if (lastWeek && isSameCalendarWeek(wk, lastWeek)) continue
        const count = h.completions.filter((c) => isSameCalendarWeek(fromISO(c), wk)).length
        if (count >= target) weeks.push(wk)
        lastWeek = wk
      }

      // Award a per-week completion bonus for each week that met the weekly target.
      // This gives weekly habits a +MILESTONE_BONUS for completing the "week challenge".
      if (weeks.length > 0) pts += weeks.length * MILESTONE_BONUS

      let streak = 0
      let prev: Date | null = null
      for (const wk of weeks) {
        if (!prev || isSameCalendarWeek(wk, addDays(prev, 7))) streak += 1
        else streak = 1
        if (streak % WEEKLY_MILESTONE === 0) pts += MILESTONE_BONUS
        prev = wk
      }
    } else if (h.frequency === 'monthly') {
      // Monthly scoring: consider a month a 'hit' if completions in that calendar month >= monthlyTarget
      const target = h.monthlyTarget ?? 1
      // build list of month-start dates representing months with at least target completions
      const months: Date[] = []
      let lastMonth: Date | null = null
      for (const d of dates) {
        const mo = startOfMonth(d)
        if (lastMonth && isSameMonth(mo, lastMonth)) continue
        const count = h.completions.filter((c) => isSameMonth(fromISO(c), mo)).length
        if (count >= target) months.push(mo)
        lastMonth = mo
      }

      if (months.length > 0) pts += months.length * MILESTONE_BONUS

      let streak = 0
      let prev: Date | null = null
      for (const mo of months) {
        if (!prev || isSameMonth(mo, addMonths(prev, 1))) streak += 1
        else streak = 1
        // reuse weekly milestone constant here for monthly streak milestones
        if (streak % WEEKLY_MILESTONE === 0) pts += MILESTONE_BONUS
        prev = mo
      }
    }
  }

  return pts
}

export function recalc(h: Habit): Habit {
  const base = { ...h }
  base.streak = h.frequency === 'daily' ? calcDailyStreak(h) : h.frequency === 'weekly' ? calcWeeklyStreak(h) : calcMonthlyStreak(h)
  base.points = calcPoints(h)
  return base
}
