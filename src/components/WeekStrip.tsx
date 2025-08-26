import { format } from 'date-fns'
import { daysThisWeek } from '../utils/date'
import { hasCompletionInWeek, hasCompletionOnDay } from '../utils/scoring'
import type { Habit } from '../types'

export default function WeekStrip({ habit, onToggle }: { habit: Habit; onToggle: (d: Date) => void }) {
  const week = daysThisWeek()
  return (
    <div className="flex gap-1.5">
      {week.map((d) => {
        // For daily habits we mark days with exact matches.
        // For weekly habits we also mark the exact day so users can choose multiple days in a week.
        const done = hasCompletionOnDay(habit.completions, d)
        const label = format(d, 'EE')
        return (
          <button
            key={d.toISOString()}
            onClick={() => onToggle(d)}
            className={`grid h-8 w-8 place-items-center rounded-full border text-xs font-medium transition ${
              done
                ? 'border-transparent bg-black text-white dark:bg-white dark:text-black'
                : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-900'
            }`}
            title={`${label} ${format(d, 'd MMM')}`}
          >
            {label[0]}
          </button>
        )
      })}
    </div>
  )
}
