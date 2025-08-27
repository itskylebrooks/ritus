import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Check, Flame, Pencil, Trash2 } from 'lucide-react'
import { useHabitStore } from '../store/store'
import type { Habit, Frequency } from '../types'
import WeekStrip from './WeekStrip'
import ProgressBar from './ProgressBar'
import Badge from './Badge'
import { daysThisWeek } from '../utils/date'
import { hasCompletionInWeek, hasCompletionOnDay, DAILY_MILESTONE, MILESTONE_BONUS, POINTS_PER_COMPLETION, WEEKLY_MILESTONE } from '../utils/scoring'

export default function HabitCard({ habit }: { habit: Habit }) {
  const toggleCompletion = useHabitStore((s) => s.toggleCompletion)
  const editHabit = useHabitStore((s) => s.editHabit)
  const deleteHabit = useHabitStore((s) => s.deleteHabit)

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(habit.name)
  const [isRemoving, setIsRemoving] = useState(false)

  useEffect(() => {
    setName(habit.name)
  }, [habit.name])

  const thisWeekDays = daysThisWeek()
  const weeklyMax = habit.frequency === 'daily' ? 7 : habit.weeklyTarget ?? 1
  const weeklyVal = useMemo(() => {
    if (habit.frequency === 'daily') return thisWeekDays.filter((d) => hasCompletionOnDay(habit.completions, d)).length
    return thisWeekDays.filter((d) => hasCompletionOnDay(habit.completions, d)).length
  }, [habit.completions, habit.frequency, habit.weeklyTarget])

  function saveEdit() {
    const trimmed = name.trim()
    if (!trimmed) return setEditing(false)
    editHabit(habit.id, { name: trimmed })
    setEditing(false)
  }

  const deleteHabitWithAnimation = () => {
    setIsRemoving(true)
    setTimeout(() => deleteHabit(habit.id), 300) // Match animation duration
  }

  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${isRemoving ? 'habit-remove' : 'habit-add'}`}
    >
      <div className="flex items-start justify-between gap-3">
  <div className="min-w-0 flex-1 min-h-[48px]">
          <AnimatePresence mode="wait">
            {editing ? (
              <motion.div
                key="edit-mode"
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-start gap-2 sm:flex-row sm:items-center"
              >
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border bg-white px-3 py-2 dark:bg-neutral-950 dark:border-neutral-800"
                />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="rounded-xl bg-black px-3 py-2 text-white dark:bg-white dark:text-black">Save</button>
                  <button onClick={() => setEditing(false)} className="rounded-xl border px-3 py-2">Cancel</button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="normal-mode"
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex flex-wrap items-center gap-2"
              >
                <h3 className="truncate text-lg font-semibold">{habit.name}</h3>
                <Badge>{habit.frequency}</Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <AnimatePresence mode="wait">
            {!editing && (
              <motion.div
                key="buttons"
                layout
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-2"
              >
                <motion.button
                  onClick={() => setEditing(true)}
                  className="rounded-xl border p-2 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                  aria-label="Edit habit"
                  title="Edit"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Pencil className="h-4 w-4" />
                </motion.button>
                <motion.button
                  onClick={deleteHabitWithAnimation}
                  className="rounded-xl border p-2 hover:bg-neutral-50 text-red-600 dark:hover:bg-neutral-900"
                  aria-label="Delete habit"
                  title="Delete"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Trash2 className="h-4 w-4" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

  <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <WeekStrip habit={habit} onToggle={(d) => toggleCompletion(habit.id, d)} />
        {habit.mode === 'break' ? (
          <button
            onClick={() => toggleCompletion(habit.id, new Date())}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm text-white transition active:scale-[.98] md:justify-self-end"
          >
            <span className="text-sm font-semibold">Mark clean</span>
          </button>
        ) : (
          <button
            onClick={() => toggleCompletion(habit.id, new Date())}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-2 text-sm text-white transition active:scale-[.98] md:justify-self-end dark:bg-white dark:text-black"
          >
            <Check className="h-4 w-4" /> Done today
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <div className="text-sm text-neutral-600 dark:text-neutral-300">{habit.mode === 'break' ? 'Clean streak' : 'Streak'}</div>
          <div className="mt-1 flex items-center gap-1 text-xl font-semibold">
            <Flame className="h-5 w-5" /> {habit.streak}
          </div>
        </div>
        <div>
          <div className="text-sm text-neutral-600 dark:text-neutral-300">Weekly progress</div>
          <div className="mt-2"><ProgressBar value={weeklyVal} max={weeklyMax} /></div>
          <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
            {weeklyVal}/{weeklyMax}
          </div>
        </div>
        <div>
          <div className="text-sm text-neutral-600 dark:text-neutral-300">Points</div>
          <div className="mt-1 text-xl font-semibold">{habit.points}</div>
        </div>
      </div>

      <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
        +{POINTS_PER_COMPLETION} pts per completion. Milestone bonus: {MILESTONE_BONUS} pts every {habit.frequency === 'daily' ? DAILY_MILESTONE + '-day' : WEEKLY_MILESTONE + '-week'} streak.
      </p>
    </div>
  )
}
