import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Habit, Frequency } from '../types'
import { iso, fromISO, isSameDay } from '../utils/date'
import { recalc } from '../utils/scoring'

export interface HabitState {
  habits: Habit[]
  username: string
  setUsername: (u: string) => void
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
      // user / preferences
      username: '',
      setUsername: (u: string) => set({ username: u }),
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
            mode,
            createdAt: iso(new Date()),
            completions: [],
            weeklyTarget: frequency === 'weekly' ? weeklyTarget : undefined,
            streak: 0,
            points: 0,
          }
          const newHabit = recalc(habit)
          const newHabits = [newHabit, ...s.habits]
          // update longest streak to the max observed
          const newLongest = Math.max(s.longestStreak, newHabit.streak)
          const sumPoints = newHabits.reduce((acc, h) => acc + (h.points || 0), 0)
          return { habits: newHabits, longestStreak: newLongest, totalPoints: sumPoints }
        }),
      editHabit: (id, patch) =>
        set((s) => {
          const updated = s.habits.map((h) => (h.id === id ? recalc({ ...h, ...patch }) : h))
          // update longestStreak if any habit's streak exceeds stored longest
          const maxStreak = Math.max(s.longestStreak, ...updated.map((h) => h.streak))
          const sumPoints = updated.reduce((acc, h) => acc + (h.points || 0), 0)
          return { habits: updated, longestStreak: maxStreak, totalPoints: sumPoints }
        }),
      
      // deleting a habit updates derived totals
      deleteHabit: (id) => set((s) => {
        const remaining = s.habits.filter((h) => h.id !== id)
        const sumPoints = remaining.reduce((acc, h) => acc + (h.points || 0), 0)
        // longestStreak remains cumulative max historically achieved
        return { habits: remaining, totalPoints: sumPoints }
      }),
      toggleCompletion: (id, date) =>
        set((s) => {
          const day = new Date(date)
          const updated = s.habits.map((h) => {
            if (h.id !== id) return h
            // Toggle completion for both build and break habits: for break mode a completion = successful clean day

            // Toggle by exact day (same behavior for daily/weekly; weekly allows multiple days per week)
            let completions = [...h.completions]
            if (completions.some((c) => isSameDay(fromISO(c), day))) {
              completions = completions.filter((c) => !isSameDay(fromISO(c), day))
            } else {
              completions.push(iso(day))
            }

            const newHabit = recalc({ ...h, completions })
            return newHabit
          })

          // compute new longest streak if any updated habit exceeded it
          const newLongest = Math.max(s.longestStreak, ...updated.map((h) => h.streak))

          const sumPoints = updated.reduce((acc, h) => acc + (h.points || 0), 0)
          return { habits: updated, totalPoints: sumPoints, longestStreak: newLongest }
        }),
      clearAll: () => set({ habits: [] }),
    }),
    {
      name: 'ritus-habits',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persisted: any, prevVersion: number) => {
        // Normalize from previous versions: recompute totalPoints from habits
        if (prevVersion < 2 && persisted && typeof persisted === 'object') {
          const habits: Habit[] = Array.isArray(persisted.habits) ? persisted.habits : []
          const sumPoints = habits.reduce((acc, h) => acc + (h.points || 0), 0)
          return { ...persisted, totalPoints: sumPoints }
        }
        return persisted as any
      },
      partialize: (state) => ({
        habits: state.habits,
        username: state.username,
        reminders: state.reminders,
        totalPoints: state.totalPoints,
        longestStreak: state.longestStreak,
      }),
    }
  )
)
