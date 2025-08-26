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
      // safe id generation: crypto.randomUUID may not exist on some older mobile browsers
      addHabit: (name, frequency) =>
        set((s) => {
          const genId = () => {
            try {
              // prefer native UUID when available
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
                // @ts-ignore
                return crypto.randomUUID()
              }
            } catch (e) {
              // ignore and fallback
            }
            // fallback: reasonably-unique id for local-only storage
            return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
          }

          const habit: Habit = {
            id: genId(),
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
              // weekly: toggle the exact day. We allow multiple selected days in a week.
              if (completions.some((c) => isSameDay(fromISO(c), day))) {
                completions = completions.filter((c) => !isSameDay(fromISO(c), day))
              } else {
                completions.push(iso(day))
              }
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
