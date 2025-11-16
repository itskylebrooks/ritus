import { Coins, HeartPulse } from 'lucide-react'
import ProgressBar from '@/shared/components/charts/ProgressBar'
import { LEVEL_TITLES, levelWindow } from '@/shared/constants/progression'
import { useHabitStore } from '@/shared/store/store'

export default function MilestonesHeaderCard() {
  const essence = useHabitStore((s) => s.progress.essence)
  const points = useHabitStore((s) => s.progress.points)
  const level = useHabitStore((s) => s.progress.level)

  const { curMin, nextMin, within, needed, pct } = levelWindow(essence)
  const levelTitle = LEVEL_TITLES[level - 1] ?? '—'

  // points progress bar removed per design; keep top-right display only

  return (
    <div className="rounded-2xl border dark:border-neutral-700 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold">Level {level}</span>
            <span className="text-neutral-600 dark:text-neutral-300">{levelTitle}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
          <HeartPulse className="h-4 w-4" />
          <span>{essence.toLocaleString()} progress</span>
          <Coins className="h-4 w-4" />
          <span>{points.toLocaleString()} tokens</span>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-300">
          <span>Progress to next level</span>
          <span>{within.toLocaleString()} / {needed.toLocaleString()}</span>
        </div>
        <div className="mt-1">
          <ProgressBar value={within} max={needed} />
        </div>
      </div>

      {/* Points progress removed; top-right displays current spendable points */}
    </div>
  )
}
