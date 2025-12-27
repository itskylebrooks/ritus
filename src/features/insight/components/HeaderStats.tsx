import { ChartNoAxesColumnIncreasing, Flame, Info } from 'lucide-react'
import ProgressBar from '@/shared/components/charts/ProgressBar'
import { useHabitStore } from '@/shared/store/store'
import { countCompletionsInWeek, countCompletionsInMonth, hasCompletionOnDay } from '@/shared/utils/scoring'
import { daysThisWeek } from '@/shared/utils/date'

export default function HeaderStats() {
  const habits = useHabitStore((s) => s.habits)
  // subscribe to weekStart so weekly totals update when user changes first day of week
  const weekStart = useHabitStore((s) => s.weekStart)
  // use cumulative totals from the store so they persist across deletions
  const totalPoints = useHabitStore((s) => s.totalPoints)
  const longestStreak = useHabitStore((s) => s.longestStreak)

  const weekStartsOn = weekStart === 'sunday' ? 0 : 1
  const thisWeek = daysThisWeek(new Date(), weekStartsOn)
  const [done, total] = habits.reduce<[number, number]>((acc, h) => {
    if (h.frequency === 'daily') {
      const hits = thisWeek.filter((d) => hasCompletionOnDay(h.completions, d)).length
      return [acc[0] + hits, acc[1] + thisWeek.length]
    }
    if (h.frequency === 'weekly') {
      const target = h.weeklyTarget ?? 1
      const doneWeek = countCompletionsInWeek(h.completions, undefined, weekStartsOn) >= target ? 1 : 0
      return [acc[0] + doneWeek, acc[1] + 1]
    }
    // monthly
    const mtarget = h.monthlyTarget ?? 1
    const doneMonth = countCompletionsInMonth(h.completions) >= mtarget ? 1 : 0
    return [acc[0] + doneMonth, acc[1] + 1]
  }, [0, 0])
  const weeklyPct = total === 0 ? 0 : Math.round((done / total) * 100)

  const totalCompletions = habits.reduce((acc, h) => acc + (h.completions ? h.completions.length : 0), 0)

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border dark:border-neutral-700 p-4 shadow-sm">
        <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-300">
          <span>Total completions</span>
          <ChartNoAxesColumnIncreasing className="h-4 w-4" />
        </div>
        <div className="mt-1 text-2xl font-semibold">{totalCompletions}</div>
      </div>
      <div className="rounded-2xl border dark:border-neutral-700 p-4 shadow-sm">
        <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-300">
          <span>Longest streak</span>
          <Flame className="h-4 w-4" />
        </div>
        <div className="mt-1 text-2xl font-semibold">{longestStreak}d</div>
      </div>
      <div className="col-span-2 rounded-2xl border dark:border-neutral-700 p-4 shadow-sm sm:col-span-1">
        <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-300">
          <span>Weekly completion</span>
          <Info className="h-4 w-4" />
        </div>
        <div className="mt-2">
          <ProgressBar value={weeklyPct} max={100} />
          <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{weeklyPct}%</div>
        </div>
      </div>
    </div>
  )
}
