import { format } from 'date-fns'
import { daysThisWeek } from '../utils/date'
import { hasCompletionOnDay } from '../utils/scoring'
import { useHabitStore } from '../store/store'
import type { Habit } from '../types'

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

        if (habit.mode === 'break') {
          const isMarked = hasCompletionOnDay(habit.completions, d)
          const content = isMarked ? '✓' : (isPast ? '✕' : label[0])
          const cls = isMarked
            ? 'border-transparent bg-emerald-600 text-white'
            : isPast
            ? 'border-transparent bg-red-600 text-white'
            : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900'

          return (
            <button
              key={d.toISOString()}
              onClick={() => { if (!isFuture) onToggle(d) }}
              disabled={isFuture}
              aria-label={`${format(d, 'EEEE, d MMM')}: ${isMarked ? 'Marked clean' : isPast ? 'Missed' : 'Not set'}`}
              className={`grid h-8 w-8 place-items-center rounded-full border text-xs font-medium transition ${cls} ${isFuture ? 'opacity-60 cursor-not-allowed' : ''}`}
              title={`${label} ${format(d, 'd MMM')}`}
            >
              {content}
            </button>
          )
        }

        return (
          <button
            key={d.toISOString()}
            onClick={() => { if (!isFuture) onToggle(d) }}
            disabled={isFuture}
            className={`grid h-8 w-8 place-items-center rounded-full border text-xs font-medium transition ${
              done
                ? 'border-transparent bg-black text-white dark:bg-white dark:text-black'
                : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900'
            } ${isFuture ? 'opacity-60 cursor-not-allowed' : ''}`}
            aria-label={`${format(d, 'EEEE, d MMM')}: ${done ? 'Completed' : isFuture ? 'In future' : 'Not completed'}`}
            title={`${label} ${format(d, 'd MMM')}`}
          >
            {label[0]}
          </button>
        )
      })}
    </div>
  )
}
