import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { useHabitStore } from '@/shared/store/store'
import { hasCompletionOnDay } from '@/shared/utils/scoring'
import { daysThisWeek } from '@/shared/utils/date'
import type { Habit } from '@/shared/types'

export default function WeekStrip({ habit, onToggle }: { habit: Habit; onToggle: (d: Date) => void }) {
  // subscribe to weekStart so the component re-renders when user changes first day of week
  const weekStart = useHabitStore((s) => s.weekStart)
  const week = daysThisWeek(new Date(), weekStart === 'sunday' ? 0 : 1)
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  return (
    <div className="flex gap-1.5">
      {week.map((d) => {
        const label = format(d, 'EE')
        const done = hasCompletionOnDay(habit.completions, d)
        const isPast = d < todayStart
        const isFuture = d > todayStart
        const disabled = isFuture || habit.archived

  if (habit.mode === 'break') {
          const isMarked = hasCompletionOnDay(habit.completions, d)
          // Always show the first letter for break-mode days; use bg color to indicate state
          const content = label[0]
          const cls = isMarked
            ? 'border-transparent bg-emerald-600 text-white'
            : isPast
            ? 'border-transparent bg-red-500 text-white'
            : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900'

          return (
            <motion.button
              key={d.toISOString()}
              onClick={() => { if (!disabled) onToggle(d) }}
              disabled={disabled}
              aria-disabled={disabled}
              aria-label={`${format(d, 'EEEE, d MMM')}: ${isMarked ? 'Marked clean' : isPast ? 'Missed' : 'Not set'}`}
              className={`grid h-8 w-8 place-items-center rounded-full border text-xs font-medium ${cls} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
              title={`${label} ${format(d, 'd MMM')}`}
              whileHover={{ scale: disabled ? 1 : 1.1 }}
              whileTap={{ scale: disabled ? 1 : 0.95 }}
            >
              {content}
            </motion.button>
          )
        }

        return (
          <motion.button
            key={d.toISOString()}
            onClick={() => { if (!disabled) onToggle(d) }}
            disabled={disabled}
            aria-disabled={disabled}
            className={`grid h-8 w-8 place-items-center rounded-full border text-xs font-medium ${
          done
            ? 'weekstrip-done border-transparent bg-black dark:bg-white'
            : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            aria-label={`${format(d, 'EEEE, d MMM')}: ${done ? 'Completed' : disabled ? 'Not available' : 'Not completed'}`}
            title={`${label} ${format(d, 'd MMM')}`}
            whileHover={{ scale: disabled ? 1 : 1.1 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
          >
            {label[0]}
          </motion.button>
        )
      })}
    </div>
  )
}
