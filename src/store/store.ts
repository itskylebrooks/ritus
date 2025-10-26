import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Habit, Frequency } from '../types'
import { iso, fromISO, isSameDay, startOfWeek, daysThisWeek } from '../utils/date'
import { TROPHIES } from '../data/trophies'
import { recalc } from '../utils/scoring'
import { computeLevel } from '../data/progression'

export interface HabitState {
  habits: Habit[]
  // progression / XP
  progress: { essence: number; points: number; level: number; weekBonusKeys?: Record<string, true | undefined>; completionAwardKeys?: Record<string, true | undefined>; unlocked?: Record<string, true | undefined> }
  setEssence: (n: number) => void
  addEssence: (delta: number) => void
  setPoints: (n: number) => void
  addPoints: (delta: number) => void
  tryAwardWeeklyBonus: (habitId: string, weekDate: Date, reached: boolean) => void
  awardTrophies: (summary: { dailyBuildStreak: number; dailyBreakStreak: number; weeklyStreak: number; totalCompletions: number }) => string[]
  // display settings
  dateFormat: 'MDY' | 'DMY'
  setDateFormat: (f: 'MDY' | 'DMY') => void
  weekStart: 'sunday' | 'monday'
  setWeekStart: (w: 'sunday' | 'monday') => void
  // UI visibility
  showAdd: boolean
  setShowAdd: (v: boolean) => void
  // archived visibility toggle (hide archived by default)
  showArchived: boolean
  setShowArchived: (v: boolean) => void
  // display mode: grid (false) or list (true)
  showList: boolean
  setShowList: (v: boolean) => void
  archiveHabit: (id: string) => void
  unarchiveHabit: (id: string) => void
  reminders: { dailyEnabled: boolean; dailyTime: string }
  setReminders: (r: { dailyEnabled: boolean; dailyTime: string }) => void
  totalPoints: number
  longestStreak: number
  resetStats: () => void
  addHabit: (name: string, frequency: Frequency, weeklyTarget?: number, mode?: 'build' | 'break') => void
  editHabit: (id: string, patch: Partial<Pick<Habit, 'name' | 'frequency' | 'weeklyTarget' | 'mode'>>) => void
  deleteHabit: (id: string) => void
  toggleCompletion: (id: string, date: Date) => void
  clearAll: () => void
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
  // Progression defaults (essence = lifetime XP that determines level)
  progress: { essence: 0, points: 0, level: 1, weekBonusKeys: {}, completionAwardKeys: {}, unlocked: {} },
  // display preferences
  dateFormat: 'MDY',
  setDateFormat: (f) => set({ dateFormat: f }),
  weekStart: 'monday',
  setWeekStart: (w) => set({ weekStart: w }),
  // UI visibility
  showAdd: true,
  showArchived: false,
  // default to list view
  showList: true,
  setShowAdd: (v) => set({ showAdd: v }),
  setShowArchived: (v) => set({ showArchived: v }),
  setShowList: (v) => set({ showList: v }),
  // user / preferences (no username — removed)
      reminders: { dailyEnabled: false, dailyTime: '21:00' },
      setReminders: (r: { dailyEnabled: boolean; dailyTime: string }) => set({ reminders: r }),
      // cumulative stats that persist even if habits are deleted
      totalPoints: 0,
      longestStreak: 0,
      // progression helpers
      setEssence: (n: number) =>
        set((s) => {
          const essence = Math.max(0, Math.floor(n))
          const level = computeLevel(essence)
          return { progress: { ...s.progress, essence, level } }
        }),
      addEssence: (delta: number) =>
        set((s) => {
          const essence = Math.max(0, Math.floor(s.progress.essence + delta))
          const level = computeLevel(essence)
          return { progress: { ...s.progress, essence, level } }
        }),
      setPoints: (n: number) => set((s) => ({ progress: { ...s.progress, points: Math.max(0, Math.floor(n)) } })),
      addPoints: (delta: number) => set((s) => ({ progress: { ...s.progress, points: Math.max(0, Math.floor(s.progress.points + delta)) } })),
      tryAwardWeeklyBonus: (habitId: string, weekDate: Date, reached: boolean) =>
        set((s) => {
          const key = `${habitId}@${startOfWeek(weekDate, { weekStartsOn: 1 }).toISOString()}`
          const keys = { ...(s.progress.weekBonusKeys || {}) }
          const has = !!keys[key]
          // Award
          if (reached && !has) {
            const newEssence = Math.max(0, Math.floor(s.progress.essence + 10))
            const newLevel = computeLevel(newEssence)
            const newPoints = Math.max(0, Math.floor(s.progress.points + 10))
            return {
              progress: {
                ...s.progress,
                essence: newEssence,
                level: newLevel,
                points: newPoints,
                weekBonusKeys: { ...keys, [key]: true },
              },
            }
          }
          // Revoke
          if (!reached && has) {
            const newEssence = Math.max(0, Math.floor(s.progress.essence - 10))
            const newLevel = computeLevel(newEssence)
            const newPoints = Math.max(0, Math.floor(s.progress.points - 10))
            const nextKeys = { ...keys }
            delete nextKeys[key]
            return {
              progress: {
                ...s.progress,
                essence: newEssence,
                level: newLevel,
                points: newPoints,
                weekBonusKeys: nextKeys,
              },
            }
          }
          return {}
        }),
      // award trophies centrally and idempotently based on a summary of stats
      awardTrophies: (summary) => {
        const { progress } = get()
        const newly: string[] = []
        const unlocked = { ...(progress.unlocked || {}) }
        const meets = (t: typeof TROPHIES[number]) => {
          if (t.group === 'daily_build') return summary.dailyBuildStreak >= t.threshold
          if (t.group === 'daily_break') return summary.dailyBreakStreak >= t.threshold
          if (t.group === 'weekly') return summary.weeklyStreak >= t.threshold
          return summary.totalCompletions >= t.threshold
        }
        for (const t of TROPHIES) {
          if (!unlocked[t.id] && meets(t)) {
            unlocked[t.id] = true
            newly.push(t.id)
          }
        }
        if (newly.length === 0) return newly
        set((s) => ({ progress: { ...s.progress, unlocked } }))
        return newly
      },
      resetStats: () => set({ totalPoints: 0, longestStreak: 0 }),
  // safe id generation: crypto.randomUUID may not exist on some older mobile browsers
      addHabit: (name, frequency, weeklyTarget = 1, mode: 'build' | 'break' = 'build') =>
        set((s) => {
          const genId = () => {
            try {
              // prefer native UUID when available
              const g = globalThis as unknown as { crypto?: { randomUUID?: () => string } }
              if (g.crypto?.randomUUID) return g.crypto.randomUUID()
            } catch {
              // ignore and fallback
            }
            // fallback: reasonably-unique id for local-only storage
            return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
          }

          const habit: Habit = {
            id: genId(),
            name: name.trim(),
            frequency,
            archived: false,
            mode,
            createdAt: iso(new Date()),
            completions: [],
            weeklyTarget: frequency === 'weekly' ? weeklyTarget : undefined,
            streak: 0,
            points: 0,
          }
          const newHabit = recalc(habit)
          const newHabits = [newHabit, ...s.habits]
          // update longest streak to the max observed (preserve historical max)
          const newLongest = Math.max(s.longestStreak, newHabit.streak)
          // totalPoints is cumulative lifetime points and should not be recomputed from current habits
          return { habits: newHabits, longestStreak: newLongest }
        }),
      editHabit: (id, patch) =>
        set((s) => {
          const updated = s.habits.map((h) => (h.id === id ? recalc({ ...h, ...patch }) : h))
          // update longestStreak if any habit's streak exceeds stored longest (preserve historical max)
          const maxStreak = Math.max(s.longestStreak, ...updated.map((h) => h.streak))
          // Do not recompute/overwrite cumulative totalPoints when editing habit metadata
          return { habits: updated, longestStreak: maxStreak }
        }),
      
      // deleting a habit should NOT reduce cumulative stats (totalPoints/longestStreak)
      deleteHabit: (id) => set((s) => {
        const remaining = s.habits.filter((h) => h.id !== id)
        // preserve totalPoints and longestStreak as they are lifetime aggregates
        return { habits: remaining }
      }),
  // archive/unarchive a habit (archived habits are hidden from default lists)
      archiveHabit: (id: string) => set((s) => ({ habits: s.habits.map((h) => (h.id === id ? { ...h, archived: true } : h)) })),
      unarchiveHabit: (id: string) => set((s) => ({ habits: s.habits.map((h) => (h.id === id ? { ...h, archived: false } : h)) })),
      toggleCompletion: (id, date) =>
        set((s) => {
          const day = new Date(date)
          let pointsDelta = 0 // for totalPoints (habit-level points changes)
          // work on copies of award keys so we can atomically update progress at the end
          const compKeys = { ...(s.progress.completionAwardKeys || {}) }
          const weekKeys = { ...(s.progress.weekBonusKeys || {}) }
          let essenceDelta = 0
          let pointsAwardDelta = 0

          const updated = s.habits.map((h) => {
            if (h.id !== id) return h

            // Toggle completion for both build and break habits
            let completions = [...h.completions]
            const isAlready = completions.some((c) => isSameDay(fromISO(c), day))
            const dayKey = `${h.id}@${iso(day)}`
            if (isAlready) {
              // user removed a completion
              completions = completions.filter((c) => !isSameDay(fromISO(c), day))
              // if we had awarded for this completion previously, revoke it
              if (compKeys[dayKey]) {
                essenceDelta -= 5
                pointsAwardDelta -= 5
                delete compKeys[dayKey]
              }
            } else {
              // adding a completion
              completions.push(iso(day))
              // only award if we haven't rewarded this specific day before
              if (!compKeys[dayKey]) {
                essenceDelta += 5
                pointsAwardDelta += 5
                compKeys[dayKey] = true
              }
            }

            const newHabit = recalc({ ...h, completions })
            const oldPts = h.points || 0
            const newPts = newHabit.points || 0
            const delta = newPts - oldPts
            pointsDelta += delta

            // For weekly bonus: evaluate after the toggle for this habit-week
            const days = daysThisWeek(day, 1) // Mon–Sun week
            const weekSet = new Set(days.map((d) => iso(d)))
            const count = completions.filter((c) => weekSet.has(c)).length
            const target = h.frequency === 'daily' ? (h.weeklyTarget ?? 7) : (h.weeklyTarget ?? 1)
            const weekKey = `${h.id}@${startOfWeek(day, { weekStartsOn: 1 }).toISOString()}`
            const hadWeek = !!weekKeys[weekKey]
            const reached = count >= target
            if (reached && !hadWeek) {
              // award weekly bonus
              essenceDelta += 10
              pointsAwardDelta += 10
              weekKeys[weekKey] = true
            }
            if (!reached && hadWeek) {
              // revoke weekly bonus
              essenceDelta -= 10
              pointsAwardDelta -= 10
              delete weekKeys[weekKey]
            }

            return newHabit
          })

          // compute new longest streak if any updated habit exceeded historical max
          const newLongest = Math.max(s.longestStreak, ...updated.map((h) => h.streak))

          // update cumulative totalPoints by the net delta from toggles (allow reductions when user unmarks)
          // clamp to zero so we never go negative.
          const newTotal = Math.max(0, s.totalPoints + pointsDelta)

          // apply award/revoke deltas to persisted progress
          const newEssence = Math.max(0, Math.floor(s.progress.essence + essenceDelta))
          const newLevel = computeLevel(newEssence)
          const newPoints = Math.max(0, Math.floor(s.progress.points + pointsAwardDelta))

          return {
            habits: updated,
            totalPoints: newTotal,
            longestStreak: newLongest,
            progress: {
              ...s.progress,
              essence: newEssence,
              level: newLevel,
              points: newPoints,
              weekBonusKeys: weekKeys,
              completionAwardKeys: compKeys,
              // evaluate trophies idempotently based on updated habits
              unlocked: (() => {
                const existing = { ...(s.progress.unlocked || {}) }
                const summary = {
                  dailyBuildStreak: Math.max(0, ...updated.filter((hh) => hh.frequency === 'daily' && hh.mode === 'build').map((hh) => hh.streak || 0)),
                  dailyBreakStreak: Math.max(0, ...updated.filter((hh) => hh.frequency === 'daily' && hh.mode === 'break').map((hh) => hh.streak || 0)),
                  weeklyStreak: Math.max(0, ...updated.filter((hh) => hh.frequency === 'weekly').map((hh) => hh.streak || 0)),
                  totalCompletions: updated.reduce((acc, hh) => acc + (hh.completions ? hh.completions.length : 0), 0),
                }
                for (const t of TROPHIES) {
                  const meets = t.group === 'daily_build'
                    ? summary.dailyBuildStreak >= t.threshold
                    : t.group === 'daily_break'
                      ? summary.dailyBreakStreak >= t.threshold
                      : t.group === 'weekly'
                        ? summary.weeklyStreak >= t.threshold
                        : summary.totalCompletions >= t.threshold
                  if (!existing[t.id] && meets) existing[t.id] = true
                }
                return existing
              })(),
            },
          }
        }),
      // clearing current habits should not reset cumulative stats (there's a separate resetStats)
      clearAll: () => set({ habits: [] }),
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
        longestStreak: state.longestStreak,
        showArchived: state.showArchived,
        showList: state.showList,
        dateFormat: state.dateFormat,
        weekStart: state.weekStart,
        showAdd: state.showAdd,
      }),
    }
  )
)
