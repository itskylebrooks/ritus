import { TROPHIES } from '../data/trophies'
import { useHabitStore } from '../store/store'
import { Trophy } from 'lucide-react'

export default function TrophiesBoard() {
  const unlocked = useHabitStore((s) => s.progress.unlocked || {})
  const items = TROPHIES.filter((t) => unlocked[t.id])

  return (
    <div className="rounded-2xl border dark:border-neutral-700 p-5 shadow-sm bg-white dark:bg-neutral-950">
      <div className="mb-4 text-center uppercase tracking-wider text-sm md:text-base font-semibold text-neutral-600 dark:text-neutral-300">
        TROPHY BOARD
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.length === 0 ? (
          <div className="col-span-2 md:col-span-4 flex flex-col items-center gap-3 rounded-lg border dark:border-neutral-700 p-6">
            <div className="p-2 rounded-md">
              <Trophy className="h-8 w-8 text-black dark:text-white" />
            </div>
            <div className="text-base font-semibold text-neutral-900 dark:text-neutral-100 text-center">No trophies yet</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-300 text-center max-w-xl">
              Trophies appear here as you complete habits, reach streaks, and hit milestones. Keep going — your achievements will show up on this board.
            </div>
          </div>
        ) : (
          items.map(({ id, label, Icon, reason }) => (
            <div key={id} className="flex flex-col items-center justify-between gap-3 rounded-lg border dark:border-neutral-700 p-4 min-h-[140px]">
              <div className="p-2 rounded-md">
                <Icon className="h-7 w-7 text-black dark:text-white" />
              </div>
              <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 text-center">{label}</div>
              <div className="text-xs text-neutral-600 dark:text-neutral-300 text-center">{reason}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
