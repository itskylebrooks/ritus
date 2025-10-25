import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Habit, Frequency } from '../types'
import { iso, fromISO, isSameDay } from '../utils/date'
import { recalc } from '../utils/scoring'

export interface HabitState {
  habits: Habit[]
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
  // display preferences
  dateFormat: 'MDY',
  setDateFormat: (f) => set({ dateFormat: f }),
  weekStart: 'monday',
  setWeekStart: (w) => set({ weekStart: w }),
  // UI visibility
  showAdd: true,
  showArchived: false,
  setShowAdd: (v) => set({ showAdd: v }),
  setShowArchived: (v) => set({ showArchived: v }),
  // user / preferences (no username — removed)
      reminders: { dailyEnabled: false, dailyTime: '21:00' },
      setReminders: (r: { dailyEnabled: boolean; dailyTime: string }) => set({ reminders: r }),
      // cumulative stats that persist even if habits are deleted
      totalPoints: 0,
      longestStreak: 0,
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
          let pointsDelta = 0
          const updated = s.habits.map((h) => {
            if (h.id !== id) return h
            // Toggle completion for both build and break habits: for break mode a completion = successful clean day

            // Toggle by exact day (same behavior for daily/weekly; weekly allows multiple days per week)
            let completions = [...h.completions]
            const isAlready = completions.some((c) => isSameDay(fromISO(c), day))
            if (isAlready) {
              // user removed a completion — do not deduct from lifetime totalPoints
              completions = completions.filter((c) => !isSameDay(fromISO(c), day))
            } else {
              completions.push(iso(day))
            }

            const newHabit = recalc({ ...h, completions })
              // compute change in habit points caused by this toggle and accumulate the delta
              // Note: allow negative deltas so that unmarking a day will reduce the user's total points.
              // We will clamp the cumulative totalPoints to a minimum of 0 below.
              const oldPts = h.points || 0
              const newPts = newHabit.points || 0
              const delta = newPts - oldPts
              pointsDelta += delta
            return newHabit
          })

          // compute new longest streak if any updated habit exceeded historical max
          const newLongest = Math.max(s.longestStreak, ...updated.map((h) => h.streak))

          // update cumulative totalPoints by the net delta from toggles (allow reductions when user unmarks)
          // clamp to zero so we never go negative.
          const newTotal = Math.max(0, s.totalPoints + pointsDelta)
          return { habits: updated, totalPoints: newTotal, longestStreak: newLongest }
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
        reminders: state.reminders,
        totalPoints: state.totalPoints,
        longestStreak: state.longestStreak,
        showArchived: state.showArchived,
        dateFormat: state.dateFormat,
        weekStart: state.weekStart,
        showAdd: state.showAdd,
      }),
    }
  )
)
