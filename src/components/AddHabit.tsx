import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useHabitStore } from '../store/useHabitStore'
import type { Frequency } from '../types'

export default function AddHabit() {
  const addHabit = useHabitStore((s) => s.addHabit)
  const [name, setName] = useState('')
  const [frequency, setFrequency] = useState<Frequency>('daily')
  const [weeklyTarget, setWeeklyTarget] = useState<number>(1)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    try {
      addHabit(name.trim(), frequency, weeklyTarget)
    } catch (err) {
      // on some mobile browsers/storage modes this can throw (e.g., blocked storage or missing APIs)
      // surface to console and avoid crashing the UI
      // keep reset of inputs only if add succeeded; here we still reset so user can retry
      // developer can inspect errors via remote debugging
      // eslint-disable-next-line no-console
      console.error('Failed to add habit', err)
    }
    setName('')
    setFrequency('daily')
  setWeeklyTarget(1)
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-2xl border p-4 shadow-sm sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="block text-sm text-neutral-600 dark:text-neutral-300">Habit name</label>
        <input
          className="mt-1 w-full rounded-xl border bg-white px-3 py-2 outline-none ring-0 placeholder:text-neutral-400 focus:border-black/40 dark:bg-neutral-950 dark:border-neutral-800 dark:focus:border-white/50"
          placeholder="e.g., Morning Run"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm text-neutral-600 dark:text-neutral-300">Frequency</label>
        <select
          className="mt-1 w-full rounded-xl border bg-white px-3 py-2 dark:bg-neutral-950 dark:border-neutral-800"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as Frequency)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>
      {frequency === 'weekly' && (
        <div>
          <label className="block text-sm text-neutral-600 dark:text-neutral-300">Days / week</label>
          <select
            className="mt-1 w-full rounded-xl border bg-white px-3 py-2 dark:bg-neutral-950 dark:border-neutral-800"
            value={weeklyTarget}
            onChange={(e) => setWeeklyTarget(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>{n} day{n > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
      )}
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-2 text-white transition active:scale-[.98] dark:bg-white dark:text-black"
        aria-label="Add habit"
      >
        <Plus className="h-4 w-4" /> Add
      </button>
    </form>
  )
}
