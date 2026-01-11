import { COLLECTIBLES } from '@/shared/constants/collectibles';
import { TROPHIES, type TrophyGroup } from '@/shared/constants/trophies';
import type { Frequency, Habit } from '@/shared/types';
import { daysThisWeek, fromISO, iso, isSameDay, lastNDays, startOfWeek } from '@/shared/utils/date';
import { recalc } from '@/shared/utils/scoring';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const TROPHIES_BY_GROUP: Record<TrophyGroup, (typeof TROPHIES)[number][]> = {
  daily_build: [],
  daily_break: [],
  weekly: [],
  monthly: [],
  totals: [],
  milestone: [],
  meta: [],
  emoji: [],
};

for (const trophy of TROPHIES) {
  TROPHIES_BY_GROUP[trophy.group].push(trophy);
}

const AUTO_META_TROPHY_IDS = new Set([
  'meta_first_collectible',
  'meta_10_habits',
  'meta_balance',
  'meta_focus',
  'meta_persistence',
]);

const normalizeUnlockedDates = (
  unlocked: Record<string, string | boolean | undefined> | undefined,
  fallback: string,
): Record<string, string> | undefined => {
  if (!unlocked) return undefined;
  const next: Record<string, string> = {};
  for (const [id, value] of Object.entries(unlocked)) {
    if (!value) continue;
    next[id] = typeof value === 'string' ? value : fallback;
  }
  return next;
};

const computeLongestEmojiStreak = (by: Record<string, string | undefined>): number => {
  const keys = Object.keys(by || {});
  if (!keys.length) return 0;
  const norm = new Set(keys.map((k) => (k.length > 10 ? k.slice(0, 10) : k)));
  const prevDay = (ds: string) => {
    const d = new Date(`${ds}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  };
  const nextDay = (ds: string) => {
    const d = new Date(`${ds}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 1);
    return d.toISOString().slice(0, 10);
  };
  let longest = 0;
  for (const ds of norm) {
    const prevKey = prevDay(ds);
    if (norm.has(prevKey)) continue;
    let count = 0;
    let cur = ds;
    while (norm.has(cur)) {
      count++;
      cur = nextDay(cur);
    }
    if (count > longest) longest = count;
  }
  return longest;
};

const computeDaysWithRitus = (habits: Habit[]): number => {
  const uniqueDays = new Set<string>();
  for (const h of habits) {
    for (const c of h.completions || []) uniqueDays.add(iso(fromISO(c)));
  }
  return uniqueDays.size;
};

export interface HabitState {
  habits: Habit[];
  // progression / points
  progress: {
    points: number;
    weekBonusKeys?: Record<string, true | undefined>;
    completionAwardKeys?: Record<string, true | undefined>;
    // trophy id -> ISO date string (start of day)
    unlocked?: Record<string, string>;
    ownedCollectibles?: string[];
    appliedCollectibles?: Record<string, string>;
    seenTrophies?: Record<string, true | undefined>;
    lastUnlockedTrophyAt?: string;
  };
  setPoints: (n: number) => void;
  addPoints: (delta: number) => void;
  tryAwardWeeklyBonus: (habitId: string, weekDate: Date, reached: boolean) => void;
  awardTrophies: (summary: {
    dailyBuildStreak: number;
    dailyBreakStreak: number;
    weeklyStreak: number;
    totalCompletions: number;
    emojiStreak?: number;
  }) => string[];
  purchaseCollectible: (id: string, cost: number) => boolean;
  applyCollectible: (id: string) => boolean;
  markTrophiesSeen: (ids: string[]) => void;
  // display settings
  dateFormat: 'MDY' | 'DMY';
  setDateFormat: (f: 'MDY' | 'DMY') => void;
  weekStart: 'sunday' | 'monday';
  setWeekStart: (w: 'sunday' | 'monday') => void;
  // UI visibility
  showAdd: boolean;
  setShowAdd: (v: boolean) => void;
  showHomeCards: boolean;
  setShowHomeCards: (v: boolean) => void;
  // archived visibility toggle (hide archived by default)
  showArchived: boolean;
  setShowArchived: (v: boolean) => void;
  // display mode: grid (false) or list (true)
  showList: boolean;
  setShowList: (v: boolean) => void;
  // home refresh key: increment to force remount of Home
  homeRefreshKey?: number;
  triggerHomeRefresh: () => void;
  // emoji of the day mapping by date (YYYY-MM-DD) and recents list
  emojiByDate?: Record<string, string | undefined>;
  emojiRecents?: string[];
  setEmojiForDate?: (dateISO: string, emojiId: string | null) => void;
  clearEmojiData?: () => void;
  syncEmojiTrophies: () => string[];
  archiveHabit: (id: string) => void;
  unarchiveHabit: (id: string) => void;
  reminders: { dailyEnabled: boolean; dailyTime: string };
  setReminders: (r: { dailyEnabled: boolean; dailyTime: string }) => void;
  totalPoints: number;
  totalCompletions: number;
  longestStreak: number;
  daysWithRitus: number;
  resetStats: () => void;
  addHabit: (
    name: string,
    frequency: Frequency,
    weeklyTarget?: number,
    monthlyTarget?: number,
    mode?: 'build' | 'break',
  ) => void;
  editHabit: (
    id: string,
    patch: Partial<Pick<Habit, 'name' | 'frequency' | 'weeklyTarget' | 'monthlyTarget' | 'mode'>>,
  ) => void;
  deleteHabit: (id: string) => void;
  toggleCompletion: (id: string, date: Date) => void;
  clearAll: () => void;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      // Progression defaults
      progress: {
        points: 0,
        weekBonusKeys: {},
        completionAwardKeys: {},
        unlocked: {},
        ownedCollectibles: [],
        appliedCollectibles: {},
        seenTrophies: {},
      },
      // display preferences
      dateFormat: 'MDY',
      setDateFormat: (f) => set({ dateFormat: f }),
      weekStart: 'monday',
      setWeekStart: (w) => set({ weekStart: w }),
      // UI visibility
      showAdd: true,
      showHomeCards: true,
      showArchived: false,
      // default to list view
      showList: true,
      setShowAdd: (v) => set({ showAdd: v }),
      setShowHomeCards: (v) => set({ showHomeCards: v }),
      setShowArchived: (v) => set({ showArchived: v }),
      setShowList: (v) => set({ showList: v }),
      homeRefreshKey: 0,
      triggerHomeRefresh: () => set((s) => ({ homeRefreshKey: (s.homeRefreshKey || 0) + 1 })),
      emojiByDate: {},
      emojiRecents: [],
      setEmojiForDate: (dateISO: string, emojiId: string | null) =>
        set((s) => {
          const by = { ...(s.emojiByDate || {}) };
          if (emojiId) by[dateISO] = emojiId;
          else delete by[dateISO];
          let recents = Array.isArray(s.emojiRecents) ? [...(s.emojiRecents as string[])] : [];
          if (emojiId) {
            recents = [emojiId, ...recents.filter((x) => x !== emojiId)].slice(0, 10);
          }
          return { emojiByDate: by, emojiRecents: recents };
        }),
      clearEmojiData: () => set({ emojiByDate: {}, emojiRecents: [] }),
      syncEmojiTrophies: () => {
        const state = get();
        const unlocked = { ...(state.progress.unlocked || {}) };
        const emojiTrophies = TROPHIES_BY_GROUP.emoji;
        const needsEmoji = emojiTrophies.some((t) => !unlocked[t.id]);
        if (!needsEmoji) return [];
        const by = (state.emojiByDate || {}) as Record<string, string | undefined>;
        if (!Object.keys(by).length) return [];
        const longest = computeLongestEmojiStreak(by);
        const newly: string[] = [];
        const unlockedAt = iso(new Date());
        for (const t of emojiTrophies) {
          if (!unlocked[t.id] && longest >= t.threshold) {
            unlocked[t.id] = unlockedAt;
            newly.push(t.id);
          }
        }
        if (newly.length > 0) {
          set((s) => ({
            progress: {
              ...s.progress,
              unlocked,
              lastUnlockedTrophyAt: unlockedAt,
            },
          }));
        }
        return newly;
      },
      reminders: { dailyEnabled: false, dailyTime: '21:00' },
      setReminders: (r: { dailyEnabled: boolean; dailyTime: string }) => set({ reminders: r }),
      totalPoints: 0,
      totalCompletions: 0,
      longestStreak: 0,
      daysWithRitus: 0,
      setPoints: (n: number) =>
        set((s) => ({ progress: { ...s.progress, points: Math.max(0, Math.floor(n)) } })),
      addPoints: (delta: number) =>
        set((s) => ({
          progress: { ...s.progress, points: Math.max(0, Math.floor(s.progress.points + delta)) },
        })),
      tryAwardWeeklyBonus: (habitId: string, weekDate: Date, reached: boolean) =>
        set((s) => {
          const weekStartsOn = s.weekStart === 'sunday' ? 0 : 1;
          const key = `${habitId}@${startOfWeek(weekDate, { weekStartsOn }).toISOString()}`;
          const keys = { ...(s.progress.weekBonusKeys || {}) };
          const has = !!keys[key];
          // Award
          if (reached && !has) {
            const newPoints = Math.max(0, Math.floor(s.progress.points + 10));
            return {
              progress: {
                ...s.progress,
                points: newPoints,
                weekBonusKeys: { ...keys, [key]: true },
              },
            };
          }
          // Revoke
          if (!reached && has) {
            const newPoints = Math.max(0, Math.floor(s.progress.points - 10));
            const nextKeys = { ...keys };
            delete nextKeys[key];
            return {
              progress: {
                ...s.progress,
                points: newPoints,
                weekBonusKeys: nextKeys,
              },
            };
          }
          return {};
        }),
      // award trophies centrally and idempotently based on a summary of stats
      awardTrophies: (summary) => {
        const { progress, habits } = get();
        const newly: string[] = [];
        const unlocked = { ...(progress.unlocked || {}) };
        const unlockedAt = iso(new Date());

        // Build a richer summary from either the provided summary or the current habits
        const allHabits = habits || [];
        const storedTotalCompletions = get().totalCompletions;
        const totalCompletions =
          summary?.totalCompletions ??
          (typeof storedTotalCompletions === 'number'
            ? storedTotalCompletions
            : allHabits.reduce((acc, h) => acc + (h.completions ? h.completions.length : 0), 0));
        const dailyBuildStreak =
          summary?.dailyBuildStreak ??
          Math.max(
            0,
            ...allHabits
              .filter((h) => h.frequency === 'daily' && h.mode === 'build')
              .map((h) => h.streak || 0),
          );
        const dailyBreakStreak =
          summary?.dailyBreakStreak ??
          Math.max(
            0,
            ...allHabits
              .filter((h) => h.frequency === 'daily' && h.mode === 'break')
              .map((h) => h.streak || 0),
          );
        const weeklyStreak =
          summary?.weeklyStreak ??
          Math.max(
            0,
            ...allHabits.filter((h) => h.frequency === 'weekly').map((h) => h.streak || 0),
          );
        const monthlyStreak =
          (summary as { monthlyStreak?: number } | undefined)?.monthlyStreak ??
          Math.max(
            0,
            ...allHabits.filter((h) => h.frequency === 'monthly').map((h) => h.streak || 0),
          );

        const needsEmoji = TROPHIES_BY_GROUP.emoji.some((t) => !unlocked[t.id]);
        const emojiStreak =
          summary?.emojiStreak ??
          (needsEmoji ? computeLongestEmojiStreak(get().emojiByDate || {}) : 0);

        // compute unique days with at least one completion across all habits
        const uniqueDays = new Set<string>();
        for (const h of allHabits) for (const c of h.completions || []) uniqueDays.add(c);
        const daysUsedCount = uniqueDays.size;

        // helper checks for meta trophies
        // max streak across build and break habits
        const maxBuildStreak = Math.max(
          0,
          ...allHabits.filter((h) => h.mode === 'build').map((h) => h.streak || 0),
        );
        const maxBreakStreak = Math.max(
          0,
          ...allHabits.filter((h) => h.mode === 'break').map((h) => h.streak || 0),
        );

        // daily persistence: at least one completion every day for last N days
        const hasContinuousDays = (n: number) => {
          const days = lastNDays(n);
          for (const d of days)
            if (![...uniqueDays].some((u) => isSameDay(fromISO(u), d))) return false;
          return true;
        };

        const allActiveDailyCompletedN = (n: number) => {
          const activeDaily = allHabits.filter((h) => !h.archived && h.frequency === 'daily');
          if (activeDaily.length === 0) return false;
          const days = lastNDays(n);
          for (const d of days) {
            for (const h of activeDaily) {
              if (!h.completions.some((c) => isSameDay(fromISO(c), d))) return false;
            }
          }
          return true;
        };

        const meets = (t: (typeof TROPHIES)[number]) => {
          if (t.group === 'daily_build') return dailyBuildStreak >= t.threshold;
          if (t.group === 'daily_break') return dailyBreakStreak >= t.threshold;
          if (t.group === 'weekly') return weeklyStreak >= t.threshold;
          if (t.group === 'monthly') return monthlyStreak >= t.threshold;
          if (t.group === 'milestone') return daysUsedCount >= t.threshold;
          if (t.group === 'emoji') return emojiStreak >= t.threshold;
          if (t.group === 'meta') {
            // behavioral/meta trophies with custom logic
            switch (t.id) {
              case 'meta_first_collectible':
                // Awarded when user owns at least 1 collectible
                return (get().progress.ownedCollectibles || []).length >= t.threshold;
              case 'meta_10_habits':
                // Awarded when user has created at least 10 habits
                return allHabits.length >= t.threshold;
              case 'meta_balance':
                // require both a build and a break habit to have a long streak
                return maxBuildStreak >= t.threshold && maxBreakStreak >= t.threshold;
              case 'meta_focus':
                return allActiveDailyCompletedN(t.threshold);
              case 'meta_persistence':
                // threshold represents days here
                return hasContinuousDays(t.threshold);
              // meta_awareness intentionally not auto-awarded here
              case 'meta_resilience':
                // complex to detect from static summary; not auto-awarded here
                return false;
              default:
                return false;
            }
          }
          return totalCompletions >= t.threshold;
        };

        for (const t of TROPHIES) {
          if (!unlocked[t.id] && meets(t)) {
            unlocked[t.id] = unlockedAt;
            newly.push(t.id);
          }
        }
        if (newly.length === 0) return newly;
        set((s) => ({
          progress: {
            ...s.progress,
            unlocked,
            lastUnlockedTrophyAt: unlockedAt,
          },
        }));
        return newly;
      },
      purchaseCollectible: (id, cost) => {
        const state = get();
        const owned = new Set(state.progress.ownedCollectibles || []);
        if (owned.has(id) || (state.progress.points || 0) < cost) return false;
        set((s) => ({
          progress: {
            ...s.progress,
            points: Math.max(0, Math.floor((s.progress.points || 0) - cost)),
            ownedCollectibles: [...(s.progress.ownedCollectibles || []), id],
          },
        }));
        return true;
      },
      markTrophiesSeen: (ids: string[]) => {
        if (!ids || ids.length === 0) return;
        set((s) => {
          const seen = { ...(s.progress.seenTrophies || {}) };
          for (const id of ids) seen[id] = true;
          return { progress: { ...s.progress, seenTrophies: seen } };
        });
      },
      // Apply an owned collectible. Records the applied collectible by its type so
      // UI and other modules can react. This does not implement the visual/functional
      // behavior of each collectible — that will be added per-item later.
      applyCollectible: (id: string) => {
        const state = get();
        const owned = new Set(state.progress.ownedCollectibles || []);
        if (!owned.has(id)) return false;
        // find collectible to determine its type
        const def = COLLECTIBLES.find((c) => c.id === id);
        if (!def) return false;
        const type = def.type;
        const current = state.progress.appliedCollectibles?.[type] || '';

        // Handling for multiple selectable items (animations)
        if (type === 'animation') {
          const currentList = current ? current.split(',') : [];
          if (currentList.includes(id)) {
            // Unapply (remove from list)
            const nextList = currentList.filter((item) => item !== id);
            set((s) => {
              const next = { ...(s.progress.appliedCollectibles || {}) };
              // if empty, deleting key is cleaner, or keep empty string?
              if (nextList.length === 0) delete next[type];
              else next[type] = nextList.join(',');
              return { progress: { ...s.progress, appliedCollectibles: next } };
            });
          } else {
            // Apply (add to list)
            const nextList = [...currentList, id];
            set((s) => ({
              progress: {
                ...s.progress,
                appliedCollectibles: {
                  ...(s.progress.appliedCollectibles || {}),
                  [type]: nextList.join(','),
                },
              },
            }));
          }
          return true;
        }

        // Default single-select behavior for other types (accent, quotes, etc.)
        if (current === id) {
          // unapply: remove the applied id for this type
          set((s) => {
            const next = { ...(s.progress.appliedCollectibles || {}) };
            delete next[type];
            return { progress: { ...s.progress, appliedCollectibles: next } };
          });
          return true;
        }
        // apply: set as the active collectible for this type
        set((s) => ({
          progress: {
            ...s.progress,
            appliedCollectibles: { ...(s.progress.appliedCollectibles || {}), [type]: id },
          },
        }));
        return true;
      },
      resetStats: () =>
        set({ totalPoints: 0, totalCompletions: 0, longestStreak: 0, daysWithRitus: 0 }),
      // safe id generation: crypto.randomUUID may not exist on some older mobile browsers
      addHabit: (
        name,
        frequency,
        weeklyTarget = 1,
        monthlyTarget = 1,
        mode: 'build' | 'break' = 'build',
      ) =>
        set((s) => {
          const genId = () => {
            try {
              // prefer native UUID when available
              const g = globalThis as unknown as { crypto?: { randomUUID?: () => string } };
              if (g.crypto?.randomUUID) return g.crypto.randomUUID();
            } catch {
              // ignore and fallback
            }
            // fallback: reasonably-unique id for local-only storage
            return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
          };

          const habit: Habit = {
            id: genId(),
            name: name.trim(),
            frequency,
            archived: false,
            mode,
            createdAt: iso(new Date()),
            completions: [],
            weeklyTarget: frequency === 'weekly' ? weeklyTarget : undefined,
            monthlyTarget: frequency === 'monthly' ? monthlyTarget : undefined,
            streak: 0,
            points: 0,
          };
          const newHabit = recalc(habit);
          const newHabits = [newHabit, ...s.habits];
          // recompute longest streak from current habits so UI reflects live streaks
          const newLongest = Math.max(0, ...newHabits.map((h) => h.streak || 0));
          // totalPoints is cumulative lifetime points and should not be recomputed from current habits
          return { habits: newHabits, longestStreak: newLongest };
        }),
      editHabit: (id, patch) =>
        set((s) => {
          const updated = s.habits.map((h) => (h.id === id ? recalc({ ...h, ...patch }) : h));
          // recompute longest streak from the edited list so stats stay in sync with the UI
          const maxStreak = Math.max(0, ...updated.map((h) => h.streak || 0));
          // Do not recompute/overwrite cumulative totalPoints when editing habit metadata
          return {
            habits: updated,
            longestStreak: maxStreak,
            daysWithRitus: computeDaysWithRitus(updated),
          };
        }),

      // deleting a habit keeps cumulative points but recomputes longest streak from remaining habits
      deleteHabit: (id) =>
        set((s) => {
          const remaining = s.habits.filter((h) => h.id !== id);
          const nextLongest = Math.max(0, ...remaining.map((h) => h.streak || 0));
          return {
            habits: remaining,
            longestStreak: nextLongest,
            daysWithRitus: computeDaysWithRitus(remaining),
          };
        }),
      // archive/unarchive a habit (archived habits are hidden from default lists)
      archiveHabit: (id: string) =>
        set((s) => ({ habits: s.habits.map((h) => (h.id === id ? { ...h, archived: true } : h)) })),
      unarchiveHabit: (id: string) =>
        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? { ...h, archived: false } : h)),
        })),
      toggleCompletion: (id, date) =>
        set((s) => {
          const day = new Date(date);
          let pointsDelta = 0; // for totalPoints (habit-level points changes)
          let completionDelta = 0;
          // work on copies of award keys so we can atomically update progress at the end
          const compKeys = { ...(s.progress.completionAwardKeys || {}) };
          const weekKeys = { ...(s.progress.weekBonusKeys || {}) };
          let pointsAwardDelta = 0;

          const updated = s.habits.map((h) => {
            if (h.id !== id) return h;

            // Toggle completion for both build and break habits
            let completions = [...h.completions];
            const isAlready = completions.some((c) => isSameDay(fromISO(c), day));
            const dayKey = `${h.id}@${iso(day)}`;
            if (isAlready) {
              // user removed a completion
              completions = completions.filter((c) => !isSameDay(fromISO(c), day));
              completionDelta -= 1;
              // if we had awarded for this completion previously, revoke it
              if (compKeys[dayKey]) {
                pointsAwardDelta -= 5;
                delete compKeys[dayKey];
              }
            } else {
              // adding a completion
              completions.push(iso(day));
              completionDelta += 1;
              // only award if we haven't rewarded this specific day before
              if (!compKeys[dayKey]) {
                pointsAwardDelta += 5;
                compKeys[dayKey] = true;
              }
            }

            const newHabit = recalc({ ...h, completions });
            const oldPts = h.points || 0;
            const newPts = newHabit.points || 0;
            const delta = newPts - oldPts;
            pointsDelta += delta;

            // For weekly bonus: evaluate after the toggle for this habit-week (only for weekly habits)
            if (h.frequency === 'weekly') {
              const weekStartsOn = s.weekStart === 'sunday' ? 0 : 1;
              const days = daysThisWeek(day, weekStartsOn);
              const weekSet = new Set(days.map((d) => iso(d)));
              const count = completions.filter((c) => weekSet.has(c)).length;
              const target = h.weeklyTarget ?? 1;
              const weekKey = `${h.id}@${startOfWeek(day, { weekStartsOn }).toISOString()}`;
              const hadWeek = !!weekKeys[weekKey];
              const reached = count >= target;
              if (reached && !hadWeek) {
                // award weekly bonus
                pointsAwardDelta += 10;
                weekKeys[weekKey] = true;
              }
              if (!reached && hadWeek) {
                // revoke weekly bonus
                pointsAwardDelta -= 10;
                delete weekKeys[weekKey];
              }
            }

            return newHabit;
          });

          // recompute longest streak from updated habits so insights stay accurate
          const newLongest = Math.max(0, ...updated.map((h) => h.streak || 0));
          const uniqueDaysSet = new Set<string>();
          for (const h of updated) {
            for (const c of h.completions || []) uniqueDaysSet.add(iso(fromISO(c)));
          }
          const daysWithRitus = uniqueDaysSet.size;

          // update cumulative totalPoints by the net delta from toggles (allow reductions when user unmarks)
          // clamp to zero so we never go negative.
          const newTotal = Math.max(0, s.totalPoints + pointsDelta);
          const newTotalCompletions = Math.max(
            0,
            (typeof s.totalCompletions === 'number' ? s.totalCompletions : 0) + completionDelta,
          );

          // apply award/revoke deltas to persisted progress
          const newPoints = Math.max(0, Math.floor(s.progress.points + pointsAwardDelta));
          let lastUnlockedId: string | undefined;
          const unlockedAt = iso(new Date());

          return {
            habits: updated,
            totalPoints: newTotal,
            totalCompletions: newTotalCompletions,
            longestStreak: newLongest,
            progress: {
              ...s.progress,
              points: newPoints,
              weekBonusKeys: weekKeys,
              completionAwardKeys: compKeys,
              // evaluate trophies idempotently based on updated habits
              unlocked: (() => {
                const existing = { ...(s.progress.unlocked || {}) };
                const allHabits = updated;
                const totalCompletions = newTotalCompletions;
                const needs = (group: TrophyGroup) =>
                  TROPHIES_BY_GROUP[group].some((t) => !existing[t.id]);

                const needsDailyBuild = needs('daily_build');
                const needsDailyBreak = needs('daily_break');
                const needsWeekly = needs('weekly');
                const needsMonthly = needs('monthly');
                const needsMilestone = needs('milestone');

                const dailyBuildStreak = needsDailyBuild
                  ? Math.max(
                      0,
                      ...allHabits
                        .filter((hh) => hh.frequency === 'daily' && hh.mode === 'build')
                        .map((hh) => hh.streak || 0),
                    )
                  : 0;
                const dailyBreakStreak = needsDailyBreak
                  ? Math.max(
                      0,
                      ...allHabits
                        .filter((hh) => hh.frequency === 'daily' && hh.mode === 'break')
                        .map((hh) => hh.streak || 0),
                    )
                  : 0;
                const weeklyStreak = needsWeekly
                  ? Math.max(
                      0,
                      ...allHabits
                        .filter((hh) => hh.frequency === 'weekly')
                        .map((hh) => hh.streak || 0),
                    )
                  : 0;
                const monthlyStreak = needsMonthly
                  ? Math.max(
                      0,
                      ...allHabits
                        .filter((hh) => hh.frequency === 'monthly')
                        .map((hh) => hh.streak || 0),
                    )
                  : 0;

                const metaTrophies = TROPHIES_BY_GROUP.meta.filter(
                  (t) => AUTO_META_TROPHY_IDS.has(t.id) && !existing[t.id],
                );
                const needsMetaBalance = metaTrophies.some((t) => t.id === 'meta_balance');
                const needsMetaFocus = metaTrophies.some((t) => t.id === 'meta_focus');
                const needsMetaPersistence = metaTrophies.some((t) => t.id === 'meta_persistence');

                const daysUsedCount =
                  needsMilestone || needsMetaPersistence ? uniqueDaysSet.size : 0;
                const maxBuildStreak = needsMetaBalance
                  ? Math.max(
                      0,
                      ...allHabits.filter((h) => h.mode === 'build').map((h) => h.streak || 0),
                    )
                  : 0;
                const maxBreakStreak = needsMetaBalance
                  ? Math.max(
                      0,
                      ...allHabits.filter((h) => h.mode === 'break').map((h) => h.streak || 0),
                    )
                  : 0;

                const hasContinuousDays = (n: number) => {
                  if (!needsMetaPersistence) return false;
                  const days = lastNDays(n);
                  const daySet = uniqueDaysSet;
                  for (const d of days) if (!daySet.has(iso(d))) return false;
                  return true;
                };

                const allActiveDailyCompletedN = (n: number) => {
                  if (!needsMetaFocus) return false;
                  const activeDaily = allHabits.filter(
                    (h) => !h.archived && h.frequency === 'daily',
                  );
                  if (activeDaily.length === 0) return false;
                  const completionSets = new Map<string, Set<string>>();
                  for (const h of activeDaily) {
                    completionSets.set(
                      h.id,
                      new Set((h.completions || []).map((c) => iso(fromISO(c)))),
                    );
                  }
                  const days = lastNDays(n);
                  for (const d of days) {
                    const key = iso(d);
                    for (const h of activeDaily) {
                      if (!completionSets.get(h.id)?.has(key)) return false;
                    }
                  }
                  return true;
                };

                for (const t of TROPHIES) {
                  if (existing[t.id]) continue;
                  if (t.group === 'emoji') continue;
                  let meets = false;
                  if (t.group === 'daily_build') meets = dailyBuildStreak >= t.threshold;
                  else if (t.group === 'daily_break') meets = dailyBreakStreak >= t.threshold;
                  else if (t.group === 'weekly') meets = weeklyStreak >= t.threshold;
                  else if (t.group === 'monthly') meets = monthlyStreak >= t.threshold;
                  else if (t.group === 'milestone') meets = daysUsedCount >= t.threshold;
                  else if (t.group === 'meta') {
                    switch (t.id) {
                      case 'meta_balance':
                        meets = maxBuildStreak >= t.threshold && maxBreakStreak >= t.threshold;
                        break;
                      case 'meta_focus':
                        meets = allActiveDailyCompletedN(t.threshold);
                        break;
                      case 'meta_persistence':
                        meets = hasContinuousDays(t.threshold);
                        break;
                      // meta_awareness intentionally not auto-awarded here
                      case 'meta_resilience':
                        meets = false;
                        break;
                      default:
                        meets = false;
                    }
                  } else if (t.group === 'totals') {
                    meets = totalCompletions >= t.threshold;
                  } else {
                    meets = false;
                  }
                  if (meets) {
                    existing[t.id] = unlockedAt;
                    lastUnlockedId = t.id;
                  }
                }
                return existing;
              })(),
              lastUnlockedTrophyAt: lastUnlockedId ? unlockedAt : s.progress.lastUnlockedTrophyAt,
            },
            daysWithRitus,
          };
        }),
      // clearing current habits resets longest streak so insights reflect empty state (totalPoints handled via resetStats)
      clearAll: () =>
        set({ habits: [], longestStreak: 0, daysWithRitus: 0, emojiByDate: {}, emojiRecents: [] }),
    }),
    {
      name: 'ritus-habits',
      storage: createJSONStorage(() => localStorage),
      // Single DB version: no migrations required. Persisted shape will be the
      // `partialize` snapshot below. If you need to change persisted shape in
      // the future, handle it explicitly (for now keep storage simple).
      partialize: (state) => ({
        habits: state.habits,
        progress: state.progress,
        reminders: state.reminders,
        totalPoints: state.totalPoints,
        totalCompletions: state.totalCompletions,
        longestStreak: state.longestStreak,
        daysWithRitus: state.daysWithRitus,
        showArchived: state.showArchived,
        showList: state.showList,
        dateFormat: state.dateFormat,
        weekStart: state.weekStart,
        showAdd: state.showAdd,
        showHomeCards: state.showHomeCards,
        emojiByDate: state.emojiByDate || {},
        emojiRecents: state.emojiRecents || [],
      }),
      merge: (persistedState, currentState) => {
        const incoming = persistedState as Partial<HabitState> | undefined;
        const merged = { ...currentState, ...(incoming || {}) };
        if (merged.progress) {
          const cleaned = { ...(merged.progress as Record<string, unknown>) };
          delete cleaned.essence;
          delete cleaned.level;
          const unlockedRaw = cleaned.unlocked as
            | Record<string, string | boolean | undefined>
            | undefined;
          if (unlockedRaw) {
            const fallback =
              typeof cleaned.lastUnlockedTrophyAt === 'string'
                ? cleaned.lastUnlockedTrophyAt
                : iso(new Date());
            const normalized = normalizeUnlockedDates(unlockedRaw, fallback);
            if (normalized) cleaned.unlocked = normalized;
          }
          merged.progress = cleaned as HabitState['progress'];
        }
        const hasPersistedTotal =
          incoming && Object.prototype.hasOwnProperty.call(incoming, 'totalCompletions');
        if (!hasPersistedTotal) {
          merged.totalCompletions = (merged.habits || []).reduce(
            (acc, h) => acc + (h.completions ? h.completions.length : 0),
            0,
          );
        }
        const hasPersistedDays =
          incoming && Object.prototype.hasOwnProperty.call(incoming, 'daysWithRitus');
        if (!hasPersistedDays) {
          merged.daysWithRitus = computeDaysWithRitus(merged.habits || []);
        }
        return merged;
      },
    },
  ),
);
