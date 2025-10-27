import { Trophy } from 'lucide-react'
import { TROPHIES } from '@/shared/constants/trophies'
import { useHabitStore } from '@/shared/store/store'

export default function TrophiesBoard() {
  const unlocked = useHabitStore((s) => s.progress.unlocked || {})
  const items = TROPHIES.filter((t) => unlocked[t.id])

  return (
  <div className="rounded-2xl border border-subtle p-5 shadow-sm bg-surface-elevated dark:bg-[#000000]">
      <div className="mb-4 text-center uppercase tracking-wider text-sm md:text-base font-semibold text-muted">
        TROPHY BOARD
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.length === 0 ? (
            <div className="col-span-2 md:col-span-4 flex flex-col items-center gap-3 rounded-lg border border-subtle p-6 bg-[#f9fafb] dark:bg-[#0b0b0b]">
            <div className="p-2 rounded-md">
              <Trophy className="h-8 w-8 text-accent" />
            </div>
            <div className="text-base font-semibold text-strong text-center">No trophies yet</div>
            <div className="text-sm text-muted text-center max-w-xl">
              Trophies appear here as you complete habits, reach streaks, and hit milestones. Keep going — your achievements will show up on this board.
            </div>
          </div>
        ) : (
          items.map(({ id, label, Icon, reason }) => (
            <div key={id} className="flex flex-col items-center justify-between gap-3 rounded-lg border border-subtle p-4 min-h-[140px] bg-[#f9fafb] dark:bg-[#0b0b0b]">
              <div className="p-2 rounded-md">
                <Icon className="h-7 w-7 text-accent" />
              </div>
              <div className="text-sm font-semibold text-strong text-center">{label}</div>
              <div className="text-xs text-muted text-center">{reason}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
