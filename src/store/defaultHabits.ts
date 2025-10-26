import { Habit } from '../types';
import { computeLevel } from '../data/progression'

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
      '2025-03-05','2025-03-06','2025-03-08','2025-03-10','2025-03-14',
      '2025-04-02','2025-04-05','2025-04-12','2025-04-20',
      '2025-05-03','2025-05-10','2025-05-17','2025-05-24',
      '2025-06-01','2025-06-07','2025-06-14','2025-06-21','2025-06-28',
      '2025-07-05','2025-07-12','2025-07-20',
      '2025-08-02','2025-08-09','2025-08-16',
      '2025-09-01','2025-09-08','2025-09-15','2025-09-22',
      // current strong streak (~20 days) up to 2025-10-26
      '2025-10-07','2025-10-08','2025-10-09','2025-10-10','2025-10-11',
      '2025-10-12','2025-10-13','2025-10-14','2025-10-15','2025-10-16',
      '2025-10-17','2025-10-18','2025-10-19','2025-10-20','2025-10-21',
      '2025-10-22','2025-10-23','2025-10-24','2025-10-25','2025-10-26'
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
    // weekly class, mostly Sundays through the year
    completions: [
      '2025-01-19','2025-01-26','2025-02-02','2025-02-09','2025-02-16',
      '2025-02-23','2025-03-02','2025-03-09','2025-03-16','2025-03-23',
      '2025-03-30','2025-04-06','2025-04-13','2025-04-20','2025-04-27',
      '2025-05-04','2025-05-11','2025-05-18','2025-05-25','2025-06-01',
      '2025-06-08','2025-06-15','2025-06-22','2025-06-29','2025-07-06',
      '2025-07-13','2025-07-20','2025-07-27','2025-08-03','2025-08-10',
      '2025-08-17','2025-08-24','2025-08-31','2025-09-07','2025-09-14',
      '2025-09-21','2025-09-28','2025-10-05','2025-10-12','2025-10-19',
      '2025-10-26'
    ],
    weeklyTarget: 1,
    streak: 38,
    points: 520
  },

  {
    id: 'habit-005',
    name: 'Write Journal in Flowday',
    frequency: 'daily',
    mode: 'build',
    createdAt: '2025-02-01',
    // frequent journaling, sometimes skips a week but generally consistent
    completions: [
      '2025-02-02','2025-02-03','2025-02-04','2025-02-05','2025-02-10',
      '2025-03-01','2025-03-02','2025-03-03','2025-03-04','2025-03-10',
      '2025-04-11','2025-04-12','2025-04-13','2025-04-14','2025-05-01',
      '2025-06-02','2025-06-03','2025-06-04','2025-07-20','2025-07-21',
      // resumed regular entries in October; current streak ~12
      '2025-10-15','2025-10-16','2025-10-17','2025-10-18','2025-10-19',
      '2025-10-20','2025-10-21','2025-10-22','2025-10-23','2025-10-24',
      '2025-10-25','2025-10-26'
    ],
    streak: 12,
    points: 300
  },

  {
    id: 'habit-006',
    name: 'No Alcohol',
    frequency: 'daily',
    mode: 'break',
    createdAt: '2025-01-10',
    // mostly clean year with a few lapses (valentine, 4th of July, late Sep)
    completions: [
      // Jan–Mar strong
      '2025-01-10','2025-01-11','2025-01-12','2025-01-13','2025-01-14',
      '2025-02-01','2025-02-02','2025-02-03','2025-02-05','2025-02-06',
      // lapse on 2025-02-14 (not included)
      '2025-03-01','2025-03-02','2025-03-03','2025-04-01','2025-04-02',
      '2025-05-10','2025-05-11','2025-05-12','2025-06-01','2025-06-02',
      '2025-07-01','2025-07-02',
      // lapse around 2025-07-04 (not included)
      '2025-08-01','2025-08-02','2025-08-03','2025-09-01','2025-09-02',
      // lapse 2025-09-20 (not included)
      // long clean stretch in October
      '2025-10-09','2025-10-10','2025-10-11','2025-10-12','2025-10-13',
      '2025-10-14','2025-10-15','2025-10-16','2025-10-17','2025-10-18',
      '2025-10-19','2025-10-20','2025-10-21','2025-10-22','2025-10-23',
      '2025-10-24','2025-10-25','2025-10-26'
    ],
    streak: 18,
    points: 900
  },

  {
    id: 'habit-007',
    name: 'No Social Media in Morning',
    frequency: 'daily',
    mode: 'break',
    createdAt: '2025-01-20',
    // good early streak, drop-off mid-year, light return in October
    completions: [
      '2025-01-21','2025-01-22','2025-01-23','2025-01-24','2025-01-25',
      '2025-02-01','2025-02-02','2025-02-03','2025-03-01','2025-03-02',
      '2025-04-01','2025-04-02','2025-04-03','2025-05-01','2025-05-02',
      // drop-off (fewer completions Jun-Aug)
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
    // consistent early weekly checks, archived mid-year (stopped after June)
    completions: [
      '2025-01-26','2025-02-02','2025-02-09','2025-02-16','2025-02-23',
      '2025-03-02','2025-03-09','2025-03-16','2025-03-23','2025-03-30',
      '2025-04-06','2025-04-13','2025-04-20','2025-04-27','2025-05-04',
      '2025-05-11','2025-05-18','2025-05-25','2025-06-01','2025-06-08',
      '2025-06-15'
    ],
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
];

export default defaultHabits;

// Example default progress that pairs with the example habits above.
export const defaultProgress = {
  // lifetime essence (example)
  essence: 4200,
  // spendable points
  points: 150,
  // derived level
  level: computeLevel(4200),
  // bookkeeping maps (empty by default for example data)
  weekBonusKeys: {},
  completionAwardKeys: {},
  // example unlocked trophies (empty by default)
  unlocked: {},
}
