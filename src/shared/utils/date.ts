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
} from 'date-fns';
import { readPersistedWeekStart } from './storage';

let weekStartsOnPreference: 0 | 1 = readPersistedWeekStart() === 'sunday' ? 0 : 1;

export function setWeekStartsOnPreference(value: 'sunday' | 'monday' | 0 | 1) {
  weekStartsOnPreference = value === 'sunday' || value === 0 ? 0 : 1;
}

export function getWeekStartsOn(): 0 | 1 {
  return weekStartsOnPreference;
}

export const iso = (d: Date) => startOfDay(d).toISOString();
export const fromISO = (s: string) => startOfDay(parseISO(s));

export const isSameCalendarWeek = (a: Date, b: Date) =>
  isSameWeek(a, b, { weekStartsOn: getWeekStartsOn() });

export function daysThisWeek(ref: Date = new Date(), weekStartsOn: 0 | 1 = 1) {
  const start = startOfWeek(ref, { weekStartsOn });
  const end = endOfWeek(ref, { weekStartsOn });
  return eachDayOfInterval({ start, end });
}

export function lastNDays(n: number, ref: Date = new Date()) {
  const start = startOfDay(subDays(ref, n - 1));
  return eachDayOfInterval({ start, end: startOfDay(ref) });
}

export { addDays, isSameDay, startOfDay, startOfWeek };
