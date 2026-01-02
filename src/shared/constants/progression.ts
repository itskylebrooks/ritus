export const LEVEL_THRESHOLDS = [
  0, // L1
  200, // L2
  600, // L3
  1200, // L4
  2000, // L5
  3000, // L6
  4200, // L7
  5600, // L8
  7200, // L9
  9000, // L10
  11000, // L11
  13200, // L12
  15600, // L13
  18200, // L14
  21000, // L15
  24000, // L16
  27200, // L17
  30600, // L18
  34200, // L19
  38000, // L20
  42000, // L21
  46200, // L22
  50600, // L23
  55200, // L24
  60000, // L25
  65000, // L26
  70200, // L27
  75600, // L28
  81200, // L29
  87000, // L30
];

export const LEVEL_TITLES = [
  'Seed',
  'Spark',
  'Routine',
  'Rhythm',
  'Flow',
  'Focus',
  'Steady',
  'Consistent',
  'Clarity',
  'Balance',
  'Resolve',
  'Momentum',
  'Craft',
  'Resilience',
  'Mastery',
  'Insight',
  'Harmony',
  'Endurance',
  'Integrity',
  'Compass',
  'Presence',
  'Discipline',
  'Patience',
  'Fortitude',
  'Devotion',
  'Equanimity',
  'Wisdom',
  'Serenity',
  'Constancy',
  'Zenith',
] as const;

export const DEFAULT_POINTS_TARGET = 100; // for the points progress bar

export function computeLevel(essence: number): number {
  const T = LEVEL_THRESHOLDS;
  let lvl = 1;
  for (let i = T.length - 1; i >= 0; i--) {
    if (essence >= T[i]) {
      lvl = i + 1;
      break;
    }
  }
  return lvl;
}

export function levelWindow(essence: number) {
  const lvl = computeLevel(essence);
  const curMin = LEVEL_THRESHOLDS[lvl - 1] ?? 0;
  const nextMin = LEVEL_THRESHOLDS[lvl] ?? curMin;
  const within = Math.max(0, essence - curMin);
  const needed = Math.max(1, nextMin - curMin);
  const pct = Math.max(0, Math.min(100, Math.round((within / needed) * 100)));
  return { lvl, curMin, nextMin, within, needed, pct };
}
