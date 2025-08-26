import {
  addDays,
  eachDayOfInterval,
  endOfWeek,
  isSameDay,
  isSameWeek,
  parseISO,
  startOfDay,
  startOfWeek,
  subDays,
} from 'date-fns'

export const WSO = { weekStartsOn: 1 as const } // Monday

export const iso = (d: Date) => startOfDay(d).toISOString()
export const fromISO = (s: string) => startOfDay(parseISO(s))

export const isSameCalendarWeek = (a: Date, b: Date) => isSameWeek(a, b, WSO)

export function daysThisWeek(ref: Date = new Date()) {
  const start = startOfWeek(ref, WSO)
  const end = endOfWeek(ref, WSO)
  return eachDayOfInterval({ start, end })
}

export function lastNDays(n: number, ref: Date = new Date()) {
  const start = startOfDay(subDays(ref, n - 1))
  return eachDayOfInterval({ start, end: startOfDay(ref) })
}

export { addDays, isSameDay, startOfDay, startOfWeek }
