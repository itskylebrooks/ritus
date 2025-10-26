import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useMemo, useState, useRef } from 'react'
import { Check, Flame, Pencil, Trash2, Archive, Inbox, Diamond, Settings2 } from 'lucide-react'
import { useHabitStore } from '../store/store'
import type { Habit } from '../types'
import WeekStrip from './WeekStrip'
import ProgressBar from './ProgressBar'
import Badge from './Badge'
import { DAILY_MILESTONE, MILESTONE_BONUS, POINTS_PER_COMPLETION, WEEKLY_MILESTONE, countCompletionsInWeek } from '../utils/scoring'
import ConfirmModal from './ConfirmModal'

type ButtonsMenuProps = {
  habit: Habit
  archiveHabit: (id: string) => void
  unarchiveHabit: (id: string) => void
  setEditing: (v: boolean) => void
  setConfirmDeleteOpen: (v: boolean) => void
}

function ButtonsMenu({ habit, archiveHabit, unarchiveHabit, setEditing, setConfirmDeleteOpen }: ButtonsMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onScroll = () => setOpen(false)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  // Close the menu when clicking/tapping outside the menu while it's open
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
  <div ref={rootRef} className="flex items-center gap-2">
      <AnimatePresence initial={false} mode="wait">
        {!open ? (
          <motion.button
            key="settings"
            onClick={() => setOpen(true)}
            className="rounded-xl border dark:border-neutral-700 p-2 hover:bg-neutral-50 dark:hover:bg-neutral-900"
            aria-label="More actions"
            title="More"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings2 className="h-4 w-4" />
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-2"
          >
            <motion.button
              onClick={() => { setOpen(false); setEditing(true) }}
              className="rounded-xl border dark:border-neutral-700 p-2 hover:bg-neutral-50 dark:hover:bg-neutral-900"
              aria-label="Edit habit"
              title="Edit"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Pencil className="h-4 w-4" />
            </motion.button>

            <motion.button
              onClick={() => { setOpen(false); (habit.archived ? unarchiveHabit(habit.id) : archiveHabit(habit.id)) }}
              className="rounded-xl border dark:border-neutral-700 p-2 hover:bg-neutral-50 dark:hover:bg-neutral-900"
              aria-label={habit.archived ? 'Unarchive habit' : 'Archive habit'}
              title={habit.archived ? 'Unarchive' : 'Archive'}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {habit.archived ? <Inbox className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
            </motion.button>

            <motion.button
              onClick={() => { setOpen(false); setConfirmDeleteOpen(true) }}
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
  )
}

export default function HabitCard({ habit, disableEntryAnim = false }: { habit: Habit; disableEntryAnim?: boolean }) {
  const toggleCompletion = useHabitStore((s) => s.toggleCompletion)
  const editHabit = useHabitStore((s) => s.editHabit)
  const deleteHabit = useHabitStore((s) => s.deleteHabit)
  const archiveHabit = useHabitStore((s) => (s as any).archiveHabit)
  const unarchiveHabit = useHabitStore((s) => (s as any).unarchiveHabit)
  const showList = useHabitStore((s) => (s as any).showList)

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

  // If points are large, render the number smaller so it fits the card
  const pointsClass = habit.points && habit.points > 999 ? 'text-sm font-semibold tabular-nums' : 'text-base font-semibold tabular-nums'

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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="flex flex-col gap-2 sm:flex-row sm:items-center"
                  >
                    <div className="w-full">
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value.slice(0, 60))}
                        maxLength={60}
                        className="w-full rounded-xl border dark:border-neutral-700 bg-white px-3 py-2 dark:bg-neutral-950"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="normal-mode"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="relative top-1 flex flex-wrap items-center gap-2"
                  >
                {/* Title with badges inline so badges sit immediately after the end of the title text */}
                <div className="w-full">
                  <div className="text-lg font-semibold whitespace-normal break-words leading-tight">
                    <span className="inline after:content-[''] after:inline-block after:w-2">{habit.name}</span>
                    <span className="inline-flex items-center gap-2 align-text-bottom">
                      {/* Compact badge labels: daily -> D, weekly -> W{n}, archived -> A */}
                      <Badge>{habit.frequency === 'daily' ? 'D' : habit.frequency === 'weekly' ? `W${habit.weeklyTarget ?? 1}` : String(habit.frequency).charAt(0).toUpperCase()}</Badge>
                      {habit.archived && <Badge>A</Badge>}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <AnimatePresence mode="wait" initial={false}>
            {editing ? (
              <motion.div
                key="edit-actions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="flex items-center gap-2"
              >
                <button onClick={saveEdit} className="rounded-xl bg-black px-3 py-2 text-white dark:bg-white dark:text-black">Save</button>
                <button onClick={() => { setEditing(false); setName(habit.name) }} className="rounded-xl border dark:border-neutral-700 px-3 py-2">Cancel</button>
              </motion.div>
            ) : (
              <motion.div
                key="buttons"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="flex items-center"
              >
                <ButtonsMenu
                  habit={habit}
                  archiveHabit={archiveHabit}
                  unarchiveHabit={unarchiveHabit}
                  setEditing={setEditing}
                  setConfirmDeleteOpen={setConfirmDeleteOpen}
                />
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
              showList ? (
                <button
                  onClick={() => { if (!habit.archived) toggleCompletion(habit.id, new Date()) }}
                  disabled={habit.archived}
                  aria-disabled={habit.archived}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm text-white transition-colors duration-150 ease-in-out hover:bg-emerald-700 dark:hover:bg-emerald-500 active:scale-[.98] md:justify-self-end ${habit.archived ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <Check className="h-4 w-4" />
                  <span>Mark clean</span>
                </button>
              ) : (
                <button
                  onClick={() => { if (!habit.archived) toggleCompletion(habit.id, new Date()) }}
                  disabled={habit.archived}
                  aria-disabled={habit.archived}
                  aria-label="Mark clean"
                  className={`inline-flex items-center justify-center rounded-xl bg-emerald-600 p-2 text-white transition-colors duration-150 ease-in-out hover:bg-emerald-700 dark:hover:bg-emerald-500 active:scale-[.98] md:justify-self-end ${habit.archived ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <Check className="h-4 w-4" />
                  <span className="sr-only">Mark clean</span>
                </button>
              )
            ) : (
              showList ? (
                <button
                  onClick={() => { if (!habit.archived) toggleCompletion(habit.id, new Date()) }}
                  disabled={habit.archived}
                  aria-disabled={habit.archived}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-2 text-sm text-white transition-colors duration-150 ease-in-out hover:bg-neutral-700 active:scale-[.98] md:justify-self-end dark:bg-white dark:text-black dark:hover:bg-neutral-300 ${habit.archived ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <Check className="h-4 w-4" />
                  <span>Done today</span>
                </button>
              ) : (
                <button
                  onClick={() => { if (!habit.archived) toggleCompletion(habit.id, new Date()) }}
                  disabled={habit.archived}
                  aria-disabled={habit.archived}
                  aria-label="Done today"
                  className={`inline-flex items-center justify-center rounded-xl bg-black p-2 text-white transition-colors duration-150 ease-in-out hover:bg-neutral-700 active:scale-[.98] md:justify-self-end dark:bg-white dark:text-black dark:hover:bg-neutral-300 ${habit.archived ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <Check className="h-4 w-4" />
                  <span className="sr-only">Done today</span>
                </button>
              )
            )}
      </div>

      <div className="mt-4">
        {/* Mobile top row: streak (left) and points (right, icon beside number) */}
        <div className="flex items-center justify-between sm:hidden">
      <div className="flex items-center gap-2">
        <Flame className="h-4 w-4 text-black dark:text-white" aria-hidden />
        <div className="text-base font-semibold">{habit.streak}</div>
            <span className="sr-only">{habit.mode === 'break' ? 'Clean streak' : 'Streak'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Diamond className="h-4 w-4 text-black dark:text-white" aria-hidden />
            <div className={pointsClass}>{habit.points}</div>
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
            <Flame className="h-4 w-4 text-black dark:text-white" aria-hidden />
            <div className="text-base font-semibold">{habit.streak}</div>
            <span className="sr-only">{habit.mode === 'break' ? 'Clean streak' : 'Streak'}</span>
          </div>

          <div className="flex items-center gap-2 justify-center justify-self-center">
            <div className="w-56 md:w-40"><ProgressBar value={weeklyVal} max={weeklyMax} /></div>
            <div className="text-sm text-neutral-600 dark:text-neutral-300 tabular-nums ml-3">{weeklyVal}/{weeklyMax}</div>
            <span className="sr-only">Weekly progress</span>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Diamond className="h-4 w-4 text-black dark:text-white" aria-hidden />
            <div className="sr-only">Points</div>
            <div className={pointsClass}>{habit.points}</div>
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
