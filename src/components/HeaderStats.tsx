import { Trophy, Flame, Info } from 'lucide-react'
import { useHabitStore } from '../store/store'
import { daysThisWeek } from '../utils/date'
import { hasCompletionOnDay, countCompletionsInWeek } from '../utils/scoring'
import ProgressBar from './ProgressBar'

export default function HeaderStats() {
  const habits = useHabitStore((s) => s.habits)
  // use cumulative totals from the store so they persist across deletions
  const totalPoints = useHabitStore((s) => s.totalPoints)
  const longestStreak = useHabitStore((s) => s.longestStreak)

  const thisWeek = daysThisWeek()
  const [done, total] = habits.reduce<[number, number]>((acc, h) => {
    if (h.frequency === 'daily') {
      const hits = thisWeek.filter((d) => hasCompletionOnDay(h.completions, d)).length
      return [acc[0] + hits, acc[1] + thisWeek.length]
    } else {
      const target = h.weeklyTarget ?? 1
      const doneWeek = countCompletionsInWeek(h.completions) >= target ? 1 : 0
      return [acc[0] + doneWeek, acc[1] + 1]
    }
  }, [0, 0])
  const weeklyPct = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border p-4 shadow-sm">
        <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-300">
          <span>Total points</span>
          <Trophy className="h-4 w-4" />
        </div>
        <div className="mt-1 text-2xl font-semibold">{totalPoints}</div>
      </div>
      <div className="rounded-2xl border p-4 shadow-sm">
        <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-300">
          <span>Longest streak</span>
          <Flame className="h-4 w-4" />
        </div>
        <div className="mt-1 text-2xl font-semibold">{longestStreak}d</div>
      </div>
      <div className="rounded-2xl border p-4 shadow-sm">
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
