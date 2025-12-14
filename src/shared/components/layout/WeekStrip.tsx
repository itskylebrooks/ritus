import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { useHabitStore } from '@/shared/store/store'
import { hasCompletionOnDay } from '@/shared/utils/scoring'
import { daysThisWeek } from '@/shared/utils/date'
import type { Habit } from '@/shared/types'

export default function WeekStrip({ habit, onToggle }: { habit: Habit; onToggle: (d: Date) => void }) {
  // subscribe to weekStart so the component re-renders when user changes first day of week
  const weekStart = useHabitStore((s) => s.weekStart)
  const showList = useHabitStore((s) => s.showList ?? false)
  const week = daysThisWeek(new Date(), weekStart === 'sunday' ? 0 : 1)
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  return (
    <div className="flex gap-1.5">
      {week.map((d) => {
        const shortLabel = format(d, 'EE')
        const fullLabel = format(d, 'EEEE')
        const done = hasCompletionOnDay(habit.completions, d)
        const isPast = d < todayStart
        const isFuture = d > todayStart
        const disabled = isFuture || habit.archived

        if (habit.mode === 'break') {
          const isMarked = hasCompletionOnDay(habit.completions, d)
          const contentShort = shortLabel[0]
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
              className={`grid h-8 place-items-center border text-xs font-medium ${
                showList ? 'w-8 rounded-full sm:w-auto sm:px-3 sm:rounded-lg' : 'w-8 rounded-full'
              } ${cls} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
              title={`${shortLabel} ${format(d, 'd MMM')}`}
              whileHover={{ scale: disabled ? 1 : 1.1 }}
              whileTap={{ scale: disabled ? 1 : 0.95 }}
            >
              {showList ? (
                <>
                  <span className="sm:hidden">{contentShort}</span>
                  <span className="hidden sm:inline whitespace-nowrap">{fullLabel}</span>
                </>
              ) : (
                contentShort
              )}
            </motion.button>
          )
        }

        return (
          <motion.button
            key={d.toISOString()}
            onClick={() => { if (!disabled) onToggle(d) }}
            disabled={disabled}
            aria-disabled={disabled}
            className={`grid h-8 place-items-center border text-xs font-medium ${
              showList ? 'w-8 rounded-full sm:w-auto sm:px-3 sm:rounded-lg' : 'w-8 rounded-full'
            } ${
              done
                ? 'weekstrip-done border-transparent bg-black dark:bg-white'
                : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            aria-label={`${format(d, 'EEEE, d MMM')}: ${done ? 'Completed' : disabled ? 'Not available' : 'Not completed'}`}
            title={`${shortLabel} ${format(d, 'd MMM')}`}
            whileHover={{ scale: disabled ? 1 : 1.1 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
          >
            {showList ? (
              <>
                <span className="sm:hidden">{shortLabel[0]}</span>
                <span className="hidden sm:inline whitespace-nowrap">{fullLabel}</span>
              </>
            ) : (
              shortLabel[0]
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
