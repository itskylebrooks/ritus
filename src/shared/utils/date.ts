import {
  addDays,
  eachDayOfInterval,
  endOfWeek,
  isSameDay,
  isSameWeek,
  isValid,
  parseISO,
  startOfDay,
  startOfWeek,
  subDays,
} from 'date-fns';
import type { LocalDate } from '@/shared/types';
import { readPersistedWeekStart } from './storage';
import { systemClock, type Clock } from './clock';

let weekStartsOnPreference: 0 | 1 = readPersistedWeekStart() === 'sunday' ? 0 : 1;

export function setWeekStartsOnPreference(value: 'sunday' | 'monday' | 0 | 1) {
  weekStartsOnPreference = value === 'sunday' || value === 0 ? 0 : 1;
}

export function getWeekStartsOn(): 0 | 1 {
  return weekStartsOnPreference;
}

const LOCAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const toLocalDate = (date: Date): LocalDate => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}` as LocalDate;
};

export function normalizeLocalDate(value: string): LocalDate | null {
  const parsed = parseISO(value);
  if (!isValid(parsed)) return null;
  if (LOCAL_DATE_PATTERN.test(value) && toLocalDate(parsed) !== value) return null;
  return toLocalDate(parsed);
}

export const today = (clock: Clock = systemClock): LocalDate => toLocalDate(clock.now());

// Backwards-compatible aliases while callers move to explicit LocalDate terminology.
export const iso = toLocalDate;
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
