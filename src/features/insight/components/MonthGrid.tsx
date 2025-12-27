import { useEffect, useMemo, useRef } from 'react'
import { addDays, endOfYear, format, isSameDay, startOfWeek, startOfYear } from 'date-fns'
import { useHabitStore } from '@/shared/store/store'
import type { Habit } from '@/shared/types'
import { fromISO } from '@/shared/utils/date'

// Render a GitHub-style contributions heatmap: columns = weeks, rows = weekdays.
// Non-interactive (read-only) view. Shows ~52 weeks ending at the provided month reference.
export default function MonthGrid({ habit, month, allowScroll = true, alignToNow = false, completionDays }: { habit: Habit; month: Date; allowScroll?: boolean; alignToNow?: boolean; completionDays?: Set<number> }) {
  const weekStart = useHabitStore((s) => s.weekStart)
  const ws = weekStart === 'sunday' ? 0 : 1
  const completionSet = useMemo(() => {
    if (completionDays) return completionDays
    return new Set((habit.completions || []).map((c) => fromISO(c).getTime()))
  }, [completionDays, habit.completions])

  // Build columns for the calendar year where each column has 7 rows (weekdays).
  // The top row corresponds to the user's selected weekStart (0 = Sunday, 1 = Monday).
  // Jan 1 should appear in the column 0 at the correct row for its weekday; cells
  // before Jan 1 are null placeholders. Continue filling columns left-to-right until
  // Dec 31 is placed; the remaining cells in the final column are null placeholders.
  const yearStartDate = startOfYear(month)
  const yearEndDate = endOfYear(month)
  const cols: (Date | null)[][] = []
  let cur = new Date(yearStartDate)
  // Determine row index in column for Jan 1 relative to weekStart
  const jan1 = new Date(yearStartDate)
  const jan1Weekday = jan1.getDay() // 0..6
  const jan1Row = ((jan1Weekday - ws) + 7) % 7

  // First column: fill placeholders until jan1Row, then fill with dates
  let col: (Date | null)[] = Array.from({ length: 7 }).map(() => null)
  // place jan1 at jan1Row
  // fill preceding rows with null (already null)
  col[jan1Row] = new Date(cur)
  cur = addDays(cur, 1)
  // fill remaining rows in first col
  for (let r = jan1Row + 1; r < 7; r++) {
    if (cur <= yearEndDate) {
      col[r] = new Date(cur)
      cur = addDays(cur, 1)
    } else col[r] = null
  }
  cols.push(col)

  // subsequent columns
  while (cur <= yearEndDate) {
    const c: (Date | null)[] = Array.from({ length: 7 }).map(() => null)
    for (let r = 0; r < 7; r++) {
      if (cur <= yearEndDate) {
        c[r] = new Date(cur)
        cur = addDays(cur, 1)
      } else c[r] = null
    }
    cols.push(c)
  }

  const today = new Date()
  const containerRef = useRef<HTMLDivElement | null>(null)

  // when alignToNow is requested, scroll the container so the week containing `today`
  // is aligned to the right edge of the visible area.
  useEffect(() => {
    if (!alignToNow) return
    const el = containerRef.current
    if (!el) return
    // Allow layout to settle
    requestAnimationFrame(() => {
      try {
        const colEls = Array.from(el.querySelectorAll('[data-col]')) as HTMLElement[]
        const idx = cols.findIndex((col) => col.some((d) => d !== null && isSameDay(d, today)))
        const target = colEls[idx]
        if (target) {
          const scrollLeft = target.offsetLeft + target.offsetWidth - el.clientWidth
          el.scrollLeft = scrollLeft > 0 ? scrollLeft : 0
        }
      } catch {}
    })
  }, [alignToNow, cols.length])

  // compute month labels: show the month only on the first column where that month appears
  const targetYear = startOfYear(month).getFullYear()
  const rawLabels: (string | null)[] = cols.map((col) => {
    const first = col.find((d) => d && d.getFullYear() === targetYear) ?? null
    return first ? format(first, 'MMM') : null
  })
  const monthLabels: (string | null)[] = []
  let lastLabel: string | null = null
  for (let i = 0; i < rawLabels.length; i++) {
    const l = rawLabels[i]
    if (!l) monthLabels.push(null)
    else if (l === lastLabel) monthLabels.push(null)
    else {
      monthLabels.push(l)
      lastLabel = l
    }
  }

  // weekday labels: top row should be user's configured weekStart
  const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const weekdayLabels = Array.from({ length: 7 }).map((_, r) => shortDays[(ws + r) % 7])

  // shift month labels to the right by 2 columns as requested by UX
  const displayMonthLabels: (string | null)[] = [...Array(2).fill(null), ...monthLabels].slice(0, monthLabels.length)

  return (
    <div ref={containerRef} className={`mt-3 ${allowScroll ? 'overflow-x-auto' : 'overflow-x-hidden'} overflow-y-hidden`}>
      <div className="mb-2 flex items-center gap-2">
        <div className="w-8 text-sm text-neutral-600 dark:text-neutral-300">&nbsp;</div>
        <div className="flex gap-1">
          {displayMonthLabels.map((lab, i) => (
            <div key={i} className="w-3 text-[11px] text-neutral-600 dark:text-neutral-300 text-center">
              {lab}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        {/* weekday labels column */}
        <div className="flex flex-col items-end gap-1 mr-2">
          {weekdayLabels.map((d) => (
            <div key={d} className="h-3 text-[12px] text-neutral-600 dark:text-neutral-300 leading-3">{d}</div>
          ))}
        </div>

        <div className="flex gap-1">
          {cols.map((col, colIdx) => (
            <div key={colIdx} data-col className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, row) => {
                const d = col[row]
                const done = d ? completionSet.has(d.getTime()) : false
                const inFuture = d ? d > today : false

                const base = 'h-3 w-3 rounded-sm transition'
                // If there's no date for this cell (placeholder before Jan 1 or after Dec 31)
                // render it with the same color as the system background so it visually
                // blends into the card (not the grey day color).
                const cls = d == null
                  ? 'bg-white dark:bg-neutral-950 border-transparent'
                  : done
                  ? 'bg-black dark:bg-white border-transparent'
                  : 'bg-neutral-900/10 dark:bg-neutral-700/60 border-transparent'

                return (
                  <div
                    key={row}
                    title={d ? format(d, 'EEE, d MMM yyyy') : ''}
                    className={`${base} ${cls} ${inFuture ? 'opacity-40' : ''}`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
        {/* month labels are rendered above the grid (only on first column of each month) */}
    </div>
  )
}
