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

// week start option is now configurable by user and persisted in the main habit store.
// To avoid import cycles we read the persisted setting directly from localStorage.
export function getWeekStartsOn(): 0 | 1 {
  try {
    const raw = localStorage.getItem('ritus-habits');
    if (!raw) return 1;
    const parsed = JSON.parse(raw);
    const ws = parsed && parsed.weekStart ? parsed.weekStart : 'monday';
    return ws === 'sunday' ? 0 : 1;
  } catch {
    return 1;
  }
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
