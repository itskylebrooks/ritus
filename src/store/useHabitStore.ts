import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Habit, Frequency } from '../types'
import { iso, fromISO, isSameCalendarWeek, isSameDay } from '../utils/date'
import { recalc } from '../utils/scoring'

interface HabitState {
  habits: Habit[]
  addHabit: (name: string, frequency: Frequency) => void
  editHabit: (id: string, patch: Partial<Pick<Habit, 'name' | 'frequency'>>) => void
  deleteHabit: (id: string) => void
  toggleCompletion: (id: string, date: Date) => void
  clearAll: () => void
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      addHabit: (name, frequency) =>
        set((s) => {
          const habit: Habit = {
            id: crypto.randomUUID(),
            name: name.trim(),
            frequency,
            createdAt: iso(new Date()),
            completions: [],
            streak: 0,
            points: 0,
          }
          return { habits: [recalc(habit), ...s.habits] }
        }),
      editHabit: (id, patch) =>
        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? recalc({ ...h, ...patch }) : h)),
        })),
      deleteHabit: (id) => set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),
      toggleCompletion: (id, date) =>
        set((s) => {
          const day = new Date(date)
          const updated = s.habits.map((h) => {
            if (h.id !== id) return h
            let completions = [...h.completions]

            if (h.frequency === 'daily') {
              // toggle by exact day
              if (completions.some((c) => isSameDay(fromISO(c), day))) {
                completions = completions.filter((c) => !isSameDay(fromISO(c), day))
              } else {
                completions.push(iso(day))
              }
            } else {
              // weekly: allow at most one completion per calendar week
              const rest = completions.filter((c) => !isSameCalendarWeek(fromISO(c), day))
              const inWeek = completions.length - rest.length
              if (inWeek > 0) completions = rest
              else completions = [...rest, iso(day)]
            }

            return recalc({ ...h, completions })
          })
          return { habits: updated }
        }),
      clearAll: () => set({ habits: [] }),
    }),
    {
      name: 'ritus-habits',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({ habits: state.habits }),
    }
  )
)
