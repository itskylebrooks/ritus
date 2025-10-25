import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useMemo, useState, useRef } from 'react'
import { Check, Flame, Pencil, Trash2, Archive, Inbox, Diamond } from 'lucide-react'
import { useHabitStore } from '../store/store'
import type { Habit } from '../types'
import WeekStrip from './WeekStrip'
import ProgressBar from './ProgressBar'
import Badge from './Badge'
import { DAILY_MILESTONE, MILESTONE_BONUS, POINTS_PER_COMPLETION, WEEKLY_MILESTONE, countCompletionsInWeek } from '../utils/scoring'
import ConfirmModal from './ConfirmModal'

export default function HabitCard({ habit, disableEntryAnim = false }: { habit: Habit; disableEntryAnim?: boolean }) {
  const toggleCompletion = useHabitStore((s) => s.toggleCompletion)
  const editHabit = useHabitStore((s) => s.editHabit)
  const deleteHabit = useHabitStore((s) => s.deleteHabit)
  const archiveHabit = useHabitStore((s) => (s as any).archiveHabit)
  const unarchiveHabit = useHabitStore((s) => (s as any).unarchiveHabit)

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(habit.name)
  const [isRemoving, setIsRemoving] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  // Capture the initial value of disableEntryAnim so it doesn't flip
  // on the first parent-triggered re-render (which caused the entry
  // animation to run for all cards after any button click).
  const initialDisableEntry = useRef(disableEntryAnim)

  useEffect(() => {
    setName(habit.name)
  }, [habit.name])

  const weeklyMax = habit.frequency === 'daily' ? 7 : habit.weeklyTarget ?? 1
  const weeklyVal = useMemo(() => countCompletionsInWeek(habit.completions), [habit.completions])

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
      className={`rounded-2xl border dark:border-neutral-700 p-4 shadow-sm ${isRemoving ? 'habit-remove' : (initialDisableEntry.current ? '' : 'habit-add')}`}
    >
      <div className="flex items-start justify-between gap-3">
  <div className="min-w-0 flex-1 min-h-[48px]">
          <AnimatePresence mode="wait" initial={false}>
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
                  className="w-full rounded-xl border dark:border-neutral-700 bg-white px-3 py-2 dark:bg-neutral-950"
                />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="rounded-xl bg-black px-3 py-2 text-white dark:bg-white dark:text-black">Save</button>
                  <button onClick={() => setEditing(false)} className="rounded-xl border dark:border-neutral-700 px-3 py-2">Cancel</button>
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
                {habit.archived && <Badge>archived</Badge>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <AnimatePresence mode="wait" initial={false}>
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
                  className="rounded-xl border dark:border-neutral-700 p-2 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                  aria-label="Edit habit"
                  title="Edit"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Pencil className="h-4 w-4" />
                </motion.button>
                <motion.button
                  onClick={() => (habit.archived ? unarchiveHabit(habit.id) : archiveHabit(habit.id))}
                  className="rounded-xl border dark:border-neutral-700 p-2 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                  aria-label={habit.archived ? 'Unarchive habit' : 'Archive habit'}
                  title={habit.archived ? 'Unarchive' : 'Archive'}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {habit.archived ? <Inbox className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                </motion.button>
                <motion.button
                  onClick={() => setConfirmDeleteOpen(true)}
                  className="rounded-xl border dark:border-neutral-700 p-2 hover:bg-neutral-50 text-red-500 dark:hover:bg-neutral-900"
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
        <div className="flex justify-center md:justify-start">
          <WeekStrip habit={habit} onToggle={(d) => toggleCompletion(habit.id, d)} />
        </div>
        {habit.mode === 'break' ? (
          <button
            onClick={() => toggleCompletion(habit.id, new Date())}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm text-white transition active:scale-[.98] md:justify-self-end"
          >
            <Check className="h-4 w-4" />
            <span className="text-sm">Mark clean</span>
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

      <div className="mt-4">
        {/* Mobile top row: streak (left) and points (right, icon above number) */}
        <div className="flex items-center justify-between sm:hidden">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-black dark:text-white" aria-hidden />
            <div className="text-lg font-semibold">{habit.streak}</div>
            <span className="sr-only">{habit.mode === 'break' ? 'Clean streak' : 'Streak'}</span>
          </div>
          <div className="flex flex-col items-center">
            <Diamond className="h-5 w-5 text-black dark:text-white" aria-hidden />
            <div className="text-lg font-semibold">{habit.points}</div>
            <span className="sr-only">Points</span>
          </div>
        </div>

        {/* Mobile progress bar full width */}
        <div className="mt-2 sm:hidden flex items-center gap-3">
          <div className="flex-1"><ProgressBar value={weeklyVal} max={weeklyMax} /></div>
          <div className="text-sm text-neutral-600 dark:text-neutral-300 tabular-nums">{weeklyVal}/{weeklyMax}</div>
        </div>

        {/* Desktop/tablet: three-column centered layout */}
        <div className="hidden sm:grid sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-3">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-black dark:text-white" aria-hidden />
            <div className="text-lg font-semibold">{habit.streak}</div>
            <span className="sr-only">{habit.mode === 'break' ? 'Clean streak' : 'Streak'}</span>
          </div>

          <div className="flex items-center gap-2 justify-center justify-self-center">
            <div className="w-56"><ProgressBar value={weeklyVal} max={weeklyMax} /></div>
            <div className="text-sm text-neutral-600 dark:text-neutral-300 tabular-nums ml-3">{weeklyVal}/{weeklyMax}</div>
            <span className="sr-only">Weekly progress</span>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Diamond className="h-5 w-5 text-black dark:text-white" aria-hidden />
            <div className="sr-only">Points</div>
            <div className="text-xl font-semibold">{habit.points}</div>
          </div>
        </div>
      </div>

      {/* Points text moved to the quick guide modal per UX request */}
      <ConfirmModal
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={() => { setConfirmDeleteOpen(false); deleteHabitWithAnimation() }}
        title="Delete habit?"
        message={`Delete "${habit.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
      />
    </div>
  )
}
