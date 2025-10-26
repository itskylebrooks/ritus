import { TROPHIES } from '../data/trophies'
import { useHabitStore } from '../store/store'

export default function TrophiesBoard() {
  const unlocked = useHabitStore((s) => s.progress.unlocked || {})
  const items = TROPHIES.filter((t) => unlocked[t.id])
  if (!items || items.length === 0) return null

  return (
    <div className="rounded-2xl border p-5 shadow-sm">
      <div className="mb-3 text-sm text-neutral-600 dark:text-neutral-300">Trophies</div>
      <div className="flex flex-wrap gap-2">
        {items.map(({ id, label, Icon }) => (
          <span key={id}
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-neutral-700 dark:text-neutral-200"
            title={label}
          >
            <Icon className="h-4 w-4" />
            <span className="leading-none">{label}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
