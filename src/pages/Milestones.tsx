import { Trophy, Award, Circle } from 'lucide-react'
import ProgressBar from '../components/ProgressBar'
import { useHabitStore } from '../store/store'
import { LEVEL_TITLES, DEFAULT_POINTS_TARGET, levelWindow } from '../data/progression'

function MilestonesHeaderCard() {
  const essence = useHabitStore((s) => s.progress.essence)
  const points = useHabitStore((s) => s.progress.points)
  const level = useHabitStore((s) => s.progress.level)

  const { curMin, nextMin, within, needed, pct } = levelWindow(essence)
  const levelTitle = LEVEL_TITLES[level - 1] ?? '—'

  const ptsWithin = Math.min(points, DEFAULT_POINTS_TARGET)
  const ptsPct = Math.round((ptsWithin / DEFAULT_POINTS_TARGET) * 100)

  return (
    <div className="rounded-2xl border p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm text-neutral-600 dark:text-neutral-300">Level</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold">L{level}</span>
            <span className="text-neutral-600 dark:text-neutral-300">{levelTitle}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
          <Award className="h-4 w-4" />
          <span>{essence.toLocaleString()} essence</span>
          <Circle className="h-4 w-4" />
          <span>{points.toLocaleString()} points</span>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-300">
          <span>Essence to next level</span>
          <span>{within.toLocaleString()} / {needed.toLocaleString()}</span>
        </div>
        <div className="mt-1">
          <ProgressBar value={within} max={needed} />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-300">
          <span>Points (to next craft)</span>
          <span>{ptsWithin} / {DEFAULT_POINTS_TARGET}</span>
        </div>
        <div className="mt-1">
          <ProgressBar value={ptsWithin} max={DEFAULT_POINTS_TARGET} />
        </div>
      </div>
    </div>
  )
}

export default function Milestones() {
  return (
    <div>
      <h2 className="text-xl font-semibold flex items-center gap-2"><Trophy className="w-5 h-5" /> Milestones</h2>
      <div className="mt-4">
        <MilestonesHeaderCard />
      </div>
    </div>
  )
}
