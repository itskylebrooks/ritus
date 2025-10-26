import { useState } from 'react'
import { ChartPie, ChevronLeft, ChevronRight } from 'lucide-react'
import { useHabitStore } from '../store/store'
import type { Habit } from '../types'
import MonthGrid from '../components/MonthGrid'
import HeaderStats from '../components/HeaderStats'
import Badge from '../components/Badge'
import { addYears, startOfMonth, isAfter, startOfYear } from 'date-fns'

export default function Insight() {
  const habits = useHabitStore((s) => s.habits)
  const showArchived = useHabitStore((s) => s.showArchived)
  const toggleCompletion = useHabitStore((s) => s.toggleCompletion)

  // local month state per habit keyed by habit id
  const [months, setMonths] = useState<Record<string, Date>>({})

  function monthFor(h: Habit) {
    return months[h.id] ?? new Date()
  }

  function shiftYear(h: Habit, delta: number) {
    setMonths((m) => {
      const cur = monthFor(h)
      // normalize to Jan 1 of current selected year so shifting changes year only
      const base = new Date(cur.getFullYear(), 0, 1)
      const candidate = addYears(base, delta)
      const nowYearStart = new Date(new Date().getFullYear(), 0, 1)
      // never allow navigating into the future beyond the current year
      const next = isAfter(candidate, nowYearStart) ? nowYearStart : candidate
      return { ...m, [h.id]: next }
    })
  }

  const visible = habits.filter((h) => (showArchived ? true : !h.archived))

  return (
    <div>
      <h2 className="text-xl font-semibold flex items-center gap-2"><ChartPie className="w-5 h-5" /> Insight</h2>

      <div className="mt-4">
        <HeaderStats />
      </div>

      <div className="mt-4 space-y-4">
        {visible.length === 0 && (
          <p className="text-neutral-600 dark:text-neutral-300">No habits to show. Add some habits on the Home page.</p>
        )}

        {visible.map((h) => (
          <div key={h.id} className="rounded-2xl border dark:border-neutral-700 p-4 shadow-sm w-full">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="text-lg font-semibold truncate after:content-[''] after:inline-block after:w-2">{h.name}</h3>
                <span className="inline-flex items-center align-text-bottom gap-2">
                  <Badge>{h.frequency === 'daily' ? 'D' : h.frequency === 'weekly' ? `W${h.weeklyTarget ?? 1}` : String(h.frequency).charAt(0).toUpperCase()}</Badge>
                  {h.archived && <Badge>A</Badge>}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                <button
                  onClick={() => shiftYear(h, -1)}
                  className="rounded-xl p-1 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  aria-label="Previous year"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="tabular-nums">{new Intl.DateTimeFormat('en', { year: 'numeric' }).format(monthFor(h))}</div>
                {/* Disable next arrow when we're at or beyond the current year */}
                <button
                  onClick={() => shiftYear(h, 1)}
                  disabled={monthFor(h).getFullYear() >= new Date().getFullYear()}
                  className="rounded-xl p-1 hover:bg-neutral-100 dark:hover:bg-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Next year"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* determine if this card is in its default (initial) view */}
            {(() => {
              const isDefault = !months[h.id]
              // allow horizontal scrolling for all years so user can pan previous years
              return <MonthGrid habit={h} month={monthFor(h)} allowScroll={true} alignToNow={isDefault} />
            })()}
          </div>
        ))}
      </div>
    </div>
  )
}
