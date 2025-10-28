import { computeLevel } from '@/shared/constants/progression'
import { iso, lastNDays } from '@/shared/utils/date'
import type { Habit } from '@/shared/types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers to generate realistic completion timelines without hand‑typing dates
// ─────────────────────────────────────────────────────────────────────────────
const toISO = (d: Date) => d.toISOString().slice(0, 10);
function dateRange(start: string, end: string, stepDays = 1): string[] {
  const out: string[] = [];
  let d = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  while (d <= e) {
    out.push(toISO(d));
    d.setDate(d.getDate() + stepDays);
  }
  return out;
}
function dailyStreakEndingOn(dates: string[], today = '2025-10-26'): number {
  const set = new Set(dates);
  let streak = 0;
  let d = new Date(`${today}T00:00:00`);
  while (set.has(toISO(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

// Precomputed sequences for 2025 based on the current date (2025‑10‑26)
const NO_ALCOHOL_COMPLETIONS_2025 = dateRange('2025-01-01', '2025-10-26');
// Journal cadence: early year every other day, spring/summer every 3 days,
// August every other day, then daily for whole September and first two weeks of October
const JOURNAL_COMPLETIONS_2025 = [
  // Sept: daily
  ...dateRange('2025-09-01', '2025-09-30', 1),
  // first two weeks of October
  ...dateRange('2025-10-01', '2025-10-12', 1),
];

const NO_ALCOHOL_STREAK = dailyStreakEndingOn(NO_ALCOHOL_COMPLETIONS_2025);
const JOURNAL_STREAK = dailyStreakEndingOn(JOURNAL_COMPLETIONS_2025);

// Aikido: every Tuesday & Thursday through the year, and additionally Fridays during August
const AIKIDO_COMPLETIONS_2025 = (() => {
  const out: string[] = [];
  const start = new Date('2025-01-01T00:00:00');
  const end = new Date('2025-10-26T00:00:00');
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay(); // 0 Sun .. 6 Sat
    // Tuesday (2) or Thursday (4)
    if (dow === 3 || dow === 5) out.push(toISO(new Date(d)));
    // Fridays during August (month 7)
    if (d.getMonth() === 7 && dow === 6) out.push(toISO(new Date(d)));
  }
  return Array.from(new Set(out)).sort();
})();

// No-sugar: keep earlier weekly checks, but add a full week in May, a full week in July,
// and a set of ~15 other scattered days across the year
const NO_SUGAR_COMPLETIONS_2025 = (() => {
  const early = [
    '2025-01-26','2025-02-02','2025-02-09','2025-02-16','2025-02-23',
    '2025-03-02','2025-03-09','2025-03-16','2025-03-23','2025-03-30',
    '2025-04-06','2025-04-13','2025-04-20','2025-04-27','2025-05-04',
    '2025-05-11','2025-05-18','2025-05-25','2025-06-01','2025-06-08','2025-06-15'
  ];

  const mayWeek = dateRange('2025-05-10', '2025-05-16', 1);
  const julWeek = dateRange('2025-07-07', '2025-07-13', 1);

  const randoms = [
    '2025-02-04','2025-02-20','2025-03-17','2025-04-11','2025-04-25',
    '2025-06-21','2025-06-29','2025-08-09','2025-08-16','2025-09-02',
    '2025-09-14','2025-09-21','2025-10-05','2025-10-12','2025-10-19'
  ];

  return Array.from(new Set([...early, ...mayWeek, ...julWeek, ...randoms])).sort();
})();

// points per‑day heuristics (kept simple to avoid touching scoring logic elsewhere)
const PPD_NO_ALCOHOL = 50;  // consistent with prior sample (18 days → 900)
const PPD_JOURNAL = 25;     // consistent with prior sample (12 entries → 300)

// Realistic default dataset for Kyle Brooks (creative developer & student)
export const defaultHabits: Habit[] = [
  {
    id: 'habit-001',
    name: 'Morning Run',
    frequency: 'daily',
    mode: 'build',
    createdAt: '2025-03-05',
    // several runs spread through spring/summer, very consistent in October
    completions: [
      '2025-03-05','2025-03-06','2025-03-08','2025-03-10','2025-03-14','2025-03-22',
      '2025-04-02','2025-04-05','2025-04-12','2025-04-20',
      '2025-05-03','2025-05-10','2025-05-17','2025-05-24',
      '2025-06-01','2025-06-07','2025-06-14','2025-06-21','2025-06-28',
      '2025-07-05','2025-07-12','2025-07-20',
      '2025-08-02','2025-08-09','2025-08-16','2025-08-25',
      '2025-09-01','2025-09-08','2025-09-15','2025-09-22',
      // current strong streak (~20 days) up to 2025-10-26
      '2025-10-07','2025-10-08','2025-10-09','2025-10-11',
      '2025-10-12','2025-10-15','2025-10-16',

    ],
    streak: 20,
    points: 420
  },

  {
    id: 'habit-002',
    name: 'Code for 1 Hour',
    frequency: 'daily',
    mode: 'build',
    createdAt: '2025-01-12',
    // consistent habit with a few longer breaks (late Apr, mid-Aug)
    completions: [
      '2025-01-13','2025-01-14','2025-01-15','2025-01-17','2025-01-20',
      '2025-02-03','2025-02-10','2025-02-17','2025-02-24',
      '2025-03-03','2025-03-10','2025-03-17','2025-03-24','2025-03-31',
      '2025-04-05','2025-04-06','2025-04-07',
      // gap in late April
      '2025-05-02','2025-05-03','2025-05-04','2025-05-05','2025-05-12',
      '2025-06-01','2025-06-02','2025-06-03','2025-06-10','2025-06-17',
      '2025-07-01','2025-07-02','2025-07-03','2025-07-15','2025-07-16',
      '2025-09-01','2025-09-02','2025-09-03','2025-09-15',
      // recent small streak
      '2025-10-23','2025-10-24','2025-10-25','2025-10-26'
    ],
    streak: 4,
    points: 860
  },

  {
    id: 'habit-003',
    name: 'Read Something Before Bed',
    frequency: 'daily',
    mode: 'build',
    createdAt: '2025-06-10',
    // started mid-year, steady reading with some gaps while traveling
    completions: [
      '2025-06-11','2025-06-12','2025-06-13','2025-06-17','2025-06-18',
      '2025-07-01','2025-07-02','2025-07-03','2025-07-10','2025-07-11',
      '2025-08-05','2025-08-06','2025-08-07','2025-09-10','2025-09-11',
      // current moderate streak (~9 days)
      '2025-10-18','2025-10-19','2025-10-20','2025-10-21','2025-10-22',
      '2025-10-23','2025-10-24','2025-10-25','2025-10-26'
    ],
    streak: 9,
    points: 210
  },

  {
    id: 'habit-004',
    name: 'Aikido Practice',
    frequency: 'weekly',
    mode: 'build',
    createdAt: '2025-01-15',
    // Weekly aikido in 2025: Tuesdays & Thursdays, plus Fridays during August
    completions: AIKIDO_COMPLETIONS_2025,
    weeklyTarget: 1,
    streak: 38,
    points: 520
  },

  {
    id: 'habit-005',
    name: 'Write Journal Entry',
    frequency: 'daily',
    mode: 'build',
    createdAt: '2025-01-01',
    // early year: every other day, spring/summer every 3 days, August every other day, Sept–Oct daily
    completions: JOURNAL_COMPLETIONS_2025,
    streak: JOURNAL_STREAK,
    points: JOURNAL_COMPLETIONS_2025.length * PPD_JOURNAL,
  },

  {
    id: 'habit-006',
    name: 'No Alcohol',
    frequency: 'daily',
    mode: 'break',
    createdAt: '2025-01-01',
    // every single day of 2025 up to today
    completions: NO_ALCOHOL_COMPLETIONS_2025,
    streak: NO_ALCOHOL_STREAK,
    points: NO_ALCOHOL_COMPLETIONS_2025.length * PPD_NO_ALCOHOL,
  },

  {
    id: 'habit-007',
    name: 'No Social Media',
    frequency: 'daily',
    mode: 'break',
    createdAt: '2025-01-20',
    // more scattered, random days through the year with light return in October
    completions: [
      '2025-01-21','2025-01-22','2025-01-23','2025-01-24','2025-01-25',
      '2025-02-01','2025-02-02','2025-02-03','2025-03-01','2025-03-02',
      '2025-04-01','2025-04-02','2025-04-03','2025-05-01','2025-05-02',
      '2025-06-14','2025-07-03','2025-07-21','2025-08-15','2025-08-28',
      '2025-09-10','2025-09-11',
      // small resume in October — current short streak
      '2025-10-25','2025-10-26'
    ],
    streak: 2,
    points: 120
  },

  {
    id: 'habit-008',
    name: 'No Sugar Drinks',
    frequency: 'weekly',
    mode: 'break',
    createdAt: '2025-01-25',
    // consistent early weekly checks; add a full week in May, a full week in July,
    // and ~15 scattered other days through the year
    completions: NO_SUGAR_COMPLETIONS_2025,
    weeklyTarget: 1,
    archived: true,
    streak: 0,
    points: 70
  },

  {
    id: 'habit-009',
    name: 'English Study Sessions',
    frequency: 'weekly',
    mode: 'build',
    createdAt: '2025-01-12',
    // weekly sessions during the semester, archived in June after semester end
    completions: [
      '2025-01-15','2025-01-22','2025-01-29','2025-02-05','2025-02-12',
      '2025-02-19','2025-02-26','2025-03-05','2025-03-12','2025-03-19',
      '2025-03-26','2025-04-02','2025-04-09','2025-04-16','2025-04-23',
      '2025-04-30','2025-05-07','2025-05-14','2025-05-21','2025-05-28',
      '2025-06-04'
    ],
    weeklyTarget: 1,
    archived: true,
    streak: 0,
    points: 160
  },

  {
    id: 'habit-010',
    name: 'Evening Stretch',
    frequency: 'daily',
    mode: 'build',
    createdAt: '2025-02-20',
    // strong spring streaks, then inactive after summer (stops around Aug)
    completions: [
      '2025-03-01','2025-03-02','2025-03-03','2025-03-04','2025-03-05',
      '2025-04-01','2025-04-02','2025-04-03','2025-04-04','2025-05-01',
      '2025-05-02','2025-05-03','2025-06-10','2025-06-11','2025-06-12',
      '2025-07-05','2025-07-06','2025-07-07','2025-08-01'
    ],
    streak: 0,
    points: 95,
    archived: false
  }
  ,
  {
    id: 'habit-011',
    name: 'Review Finances',
    frequency: 'monthly',
    mode: 'build',
    createdAt: '2025-01-05',
    // monthly review roughly once per month through the year
    completions: [
      '2025-01-05','2025-02-04','2025-03-06','2025-04-02','2025-05-05','2025-06-03','2025-07-02','2025-08-04','2025-09-03','2025-10-05'
    ],
    monthlyTarget: 1,
    streak: 10,
    points: 50
  }
];

export default defaultHabits;

// Example default progress that pairs with the example habits above.
export const defaultProgress = {
  // lifetime essence (example)
  essence: 4320,
  // spendable points
  points: 200,
  // derived level
  level: computeLevel(4320),
  // bookkeeping maps (empty by default for example data)
  weekBonusKeys: {},
  completionAwardKeys: {},
  // Kyle’s initial pick list for shop UI. These are also granted as owned when
  // loading the example data so the store UI shows them as "Owned".
  preferredCollectibles: ['clock_nocturne', 'accent_ocean'],
  // Mark these as owned by default when example data is loaded
  ownedCollectibles: ['clock_nocturne', 'accent_ocean'],
  // example unlocked trophies (empty by default)
  unlocked: {},
}

// Example emoji diary data: provide a rich, varied history across the year
// Rotate through a diverse set of base emoji hexcodes and map from Jan 1 to today.
// All IDs are plain base emojis present in Emojibase.
const EMOJI_ROTATION = [
  '1F600', // 😀 grinning
  '1F603', // 😃
  '1F604', // 😄
  '1F60A', // 😊
  '1F642', // 🙂
  '1F60D', // 😍
  '1F44D', // 👍
  '1F389', // 🎉
  '1F4A1', // 💡
  '1F4DD', // 📝
  '1F680', // 🚀
  '1F525', // 🔥
  '1F4DA', // 📚
  '1F3C3', // 🏃
  '1F3A8', // 🎨
  '1F3B5', // 🎵
  '26A1',  // ⚡
  '1F4AA', // 💪
  '1F4C8', // 📈
  '1F6B6', // 🚶
  '1F34E', // 🍎
  '1F31E', // 🌞
  '1F319', // 🌙
  '1F33B', // 🌻
]

export const defaultEmojiByDate: Record<string, string> = (() => {
  // Use the same end date as the rest of the example data for consistency
  const endISO = '2025-10-26'
  const days = dateRange('2025-01-01', endISO, 1)
  const out: Record<string, string> = {}
  const end = new Date(`${endISO}T00:00:00`)

  const withinFinalStreak = (d: Date) => {
    const diffMs = end.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))
    // Keep a solid 30+ day streak ending on endISO
    return diffDays <= 34
  }

  days.forEach((ds, i) => {
    const d = new Date(`${ds}T00:00:00`)
    const m = d.getMonth() + 1 // 1..12
    const dom = d.getDate()

    let include = false
    if (withinFinalStreak(d)) {
      include = true
    } else if (m === 1 || m === 2) {
      // Winter: every other day
      include = dom % 2 === 1
    } else if (m === 3 || m === 4 || m === 5) {
      // Spring: ~2/3 coverage
      include = dom % 3 !== 0
    } else if (m === 6 || m === 7) {
      // Summer start: ~1/3 coverage
      include = dom % 3 === 1
    } else if (m === 8) {
      // Late summer: every other day
      include = dom % 2 === 1
    } else if (m === 9) {
      // September: daily to build into the October streak
      include = true
    } else {
      // default: sparse
      include = dom % 3 === 1
    }

    if (include) {
      out[ds] = EMOJI_ROTATION[i % EMOJI_ROTATION.length]
    }
  })
  return out
})()

export const defaultEmojiRecents: string[] = Array.from(new Set(Object.values(defaultEmojiByDate))).slice(0, 10)
