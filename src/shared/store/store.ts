import { COLLECTIBLES } from '@/shared/constants/collectibles';
import { STORAGE_KEYS } from '@/shared/constants/storageKeys';
import {
  createHabit,
  setHabitArchived,
  toggleHabitCompletion,
  updateHabit,
} from '@/shared/domain/habits';
import { computeHabitStatistics, refreshHabitDerivations } from '@/shared/domain/statistics';
import { reconcileCompletionReward, reconcileWeeklyTargetReward } from '@/shared/domain/rewards';
import { evaluateTrophyUnlocks } from '@/shared/domain/trophies';
import {
  HABIT_STORE_VERSION,
  migrateHabitStoreState,
  normalizeProgress,
} from '@/shared/persistence/schema';
import type { HabitState } from '@/shared/store/types';
import { createDefaultProgress, DEFAULT_REMINDERS } from '@/shared/store/defaults';
import {
  daysThisWeek,
  fromISO,
  iso,
  setWeekStartsOnPreference,
  startOfWeek,
} from '@/shared/utils/date';
import { readPersistedWeekStart } from '@/shared/utils/storage';
import { systemClock } from '@/shared/utils/clock';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const initialWeekStart = readPersistedWeekStart('monday');
setWeekStartsOnPreference(initialWeekStart);

export type { HabitState } from '@/shared/store/types';

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      progress: createDefaultProgress(),
      dateFormat: 'MDY',
      setDateFormat: (f) => set({ dateFormat: f }),
      weekStart: initialWeekStart,
      setWeekStart: (w) => {
        setWeekStartsOnPreference(w);
        set({ weekStart: w });
      },
      showAdd: true,
      showHomeCards: true,
      showArchived: false,
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
        const result = evaluateTrophyUnlocks({
          habits: state.habits,
          totalCompletions: state.totalCompletions,
          emojiByDate: state.emojiByDate || {},
          ownedCollectibles: state.progress.ownedCollectibles || [],
          unlocked: state.progress.unlocked || {},
          now: systemClock.now(),
          groups: ['emoji'],
        });
        if (result.newlyUnlocked.length > 0) {
          set((s) => ({
            progress: {
              ...s.progress,
              unlocked: result.unlocked,
              lastUnlockedTrophyAt: result.unlockedAt,
            },
          }));
        }
        return result.newlyUnlocked;
      },
      reminders: { ...DEFAULT_REMINDERS },
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
          const reward = reconcileWeeklyTargetReward(s.progress.weekBonusKeys || {}, key, reached);
          return {
            progress: {
              ...s.progress,
              points: Math.max(0, Math.floor(s.progress.points + reward.pointsDelta)),
              weekBonusKeys: reward.keys,
            },
          };
        }),
      awardTrophies: () => {
        const state = get();
        const result = evaluateTrophyUnlocks({
          habits: state.habits,
          totalCompletions: state.totalCompletions,
          emojiByDate: state.emojiByDate || {},
          ownedCollectibles: state.progress.ownedCollectibles || [],
          unlocked: state.progress.unlocked || {},
          now: systemClock.now(),
        });
        if (result.newlyUnlocked.length === 0) return [];
        set((s) => ({
          progress: {
            ...s.progress,
            unlocked: result.unlocked,
            lastUnlockedTrophyAt: result.unlockedAt,
          },
        }));
        return result.newlyUnlocked;
      },
      purchaseCollectible: (id) => {
        const state = get();
        const collectible = COLLECTIBLES.find((candidate) => candidate.id === id);
        if (!collectible || collectible.implemented === false) return false;
        const owned = new Set(state.progress.ownedCollectibles || []);
        if (owned.has(id) || (state.progress.points || 0) < collectible.cost) return false;
        set((s) => ({
          progress: {
            ...s.progress,
            points: Math.max(0, Math.floor((s.progress.points || 0) - collectible.cost)),
            ownedCollectibles: [...(s.progress.ownedCollectibles || []), id],
          },
        }));
        // Re-evaluate trophies (e.g. meta_first_collectible) after purchase
        try {
          get().awardTrophies();
        } catch {
          // swallow any errors to avoid breaking purchase flow
        }
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
      // Track the applied collectible by type; visual effects live elsewhere.
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
          const now = systemClock.now();
          const newHabit = createHabit({ name, frequency, weeklyTarget, monthlyTarget, mode }, now);
          const newHabits = [newHabit, ...s.habits];
          return {
            habits: newHabits,
            longestStreak: computeHabitStatistics(newHabits).longestStreak,
          };
        }),
      editHabit: (id, patch) =>
        set((s) => {
          const now = systemClock.now();
          const updated = s.habits.map((habit) =>
            habit.id === id ? updateHabit(habit, patch, now) : habit,
          );
          const statistics = computeHabitStatistics(updated);
          return {
            habits: updated,
            longestStreak: statistics.longestStreak,
            daysWithRitus: statistics.daysWithRitus,
          };
        }),

      // deleting a habit keeps cumulative points but recomputes longest streak from remaining habits
      deleteHabit: (id) =>
        set((s) => {
          const remaining = s.habits.filter((h) => h.id !== id);
          const statistics = computeHabitStatistics(remaining);
          return {
            habits: remaining,
            longestStreak: statistics.longestStreak,
            daysWithRitus: statistics.daysWithRitus,
          };
        }),
      // archive/unarchive a habit (archived habits are hidden from default lists)
      archiveHabit: (id: string) =>
        set((s) => ({
          habits: s.habits.map((habit) =>
            habit.id === id ? setHabitArchived(habit, true) : habit,
          ),
        })),
      unarchiveHabit: (id: string) =>
        set((s) => ({
          habits: s.habits.map((habit) =>
            habit.id === id ? setHabitArchived(habit, false) : habit,
          ),
        })),
      toggleCompletion: (id, date) =>
        set((s) => {
          const day = new Date(date);
          let pointsDelta = 0; // for totalPoints (habit-level points changes)
          let completionDelta = 0;
          // work on copies of award keys so we can atomically update progress at the end
          let compKeys = { ...(s.progress.completionAwardKeys || {}) };
          let weekKeys = { ...(s.progress.weekBonusKeys || {}) };
          let pointsAwardDelta = 0;

          const updated = s.habits.map((h) => {
            if (h.id !== id) return h;

            const toggled = toggleHabitCompletion(h, day, systemClock.now());
            const completions = toggled.habit.completions;
            const dayKey = toggled.dayKey;
            completionDelta += toggled.completionDelta;
            const completionReward = reconcileCompletionReward(
              compKeys,
              dayKey,
              toggled.completionDelta > 0,
            );
            compKeys = completionReward.keys;
            pointsAwardDelta += completionReward.pointsDelta;

            const newHabit = toggled.habit;
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
              const reached = count >= target;
              const weeklyReward = reconcileWeeklyTargetReward(weekKeys, weekKey, reached);
              weekKeys = weeklyReward.keys;
              pointsAwardDelta += weeklyReward.pointsDelta;
            }

            return newHabit;
          });

          // recompute longest streak from updated habits so insights stay accurate
          const newLongest = computeHabitStatistics(updated).longestStreak;
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
          const trophyResult = evaluateTrophyUnlocks({
            habits: updated,
            totalCompletions: newTotalCompletions,
            emojiByDate: s.emojiByDate || {},
            ownedCollectibles: s.progress.ownedCollectibles || [],
            unlocked: s.progress.unlocked || {},
            now: systemClock.now(),
            groups: [
              'daily_build',
              'daily_break',
              'weekly',
              'monthly',
              'totals',
              'milestone',
              'meta',
            ],
            excludedIds: ['meta_first_collectible', 'meta_10_habits'],
          });

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
              unlocked: trophyResult.unlocked,
              lastUnlockedTrophyAt:
                trophyResult.newlyUnlocked.length > 0
                  ? trophyResult.unlockedAt
                  : s.progress.lastUnlockedTrophyAt,
            },
            daysWithRitus,
          };
        }),
      // clearing current habits resets longest streak so insights reflect empty state (totalPoints handled via resetStats)
      clearAll: () =>
        set({ habits: [], longestStreak: 0, daysWithRitus: 0, emojiByDate: {}, emojiRecents: [] }),
      resetAllData: () => {
        setWeekStartsOnPreference('monday');
        set({
          habits: [],
          progress: createDefaultProgress(),
          dateFormat: 'MDY',
          weekStart: 'monday',
          showAdd: true,
          showHomeCards: true,
          showArchived: false,
          showList: true,
          homeRefreshKey: 0,
          emojiByDate: {},
          emojiRecents: [],
          reminders: { ...DEFAULT_REMINDERS },
          totalPoints: 0,
          totalCompletions: 0,
          longestStreak: 0,
          daysWithRitus: 0,
        });
      },
    }),
    {
      name: STORAGE_KEYS.HABITS,
      version: HABIT_STORE_VERSION,
      migrate: (persistedState, version) => migrateHabitStoreState(persistedState, version),
      storage: createJSONStorage(() => localStorage),
      // Persist only the snapshot below. Schema changes must bump
      // HABIT_STORE_VERSION and be handled by migrateHabitStoreState.
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
          merged.progress =
            normalizeProgress(merged.progress, iso(systemClock.now())) ?? currentState.progress;

          // If the user already owned collectibles before this trophy existed,
          // award `meta_first_collectible` once on load so we don't need to
          // evaluate the owned-collectibles condition repeatedly at runtime.
          try {
            const owned = (merged.progress.ownedCollectibles || []) as string[];
            const unlocked = (merged.progress.unlocked || {}) as Record<string, string>;
            const metaId = 'meta_first_collectible';
            if (owned.length > 0 && !unlocked[metaId]) {
              const at =
                typeof merged.progress.lastUnlockedTrophyAt === 'string'
                  ? merged.progress.lastUnlockedTrophyAt
                  : iso(systemClock.now());
              merged.progress.unlocked = { ...unlocked, [metaId]: at };
              merged.progress.lastUnlockedTrophyAt = at;
            }
          } catch {
            // swallow to avoid breaking merge on unexpected persisted shapes
          }
        }
        const refreshedHabits = refreshHabitDerivations(
          Array.isArray(merged.habits) ? merged.habits : [],
          systemClock.now(),
        );
        const refreshedStatistics = computeHabitStatistics(refreshedHabits);
        merged.habits = refreshedHabits;
        merged.longestStreak = refreshedStatistics.longestStreak;
        const hasPersistedTotal =
          incoming && Object.prototype.hasOwnProperty.call(incoming, 'totalCompletions');
        if (!hasPersistedTotal) {
          merged.totalCompletions = refreshedStatistics.totalCompletions;
        }
        const hasPersistedDays =
          incoming && Object.prototype.hasOwnProperty.call(incoming, 'daysWithRitus');
        if (!hasPersistedDays) {
          merged.daysWithRitus = refreshedStatistics.daysWithRitus;
        }
        setWeekStartsOnPreference(merged.weekStart === 'sunday' ? 'sunday' : 'monday');
        return merged;
      },
    },
  ),
);
