import { useEffect, useMemo, useRef, useState } from 'react'
import { addDays, addYears, endOfYear, format, isAfter, isSameDay, startOfWeek, startOfYear } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useHabitStore } from '@/shared/store/store'
import { iso } from '@/shared/utils/date'
import { emojiIndex } from '@/shared/constants/emojis'

export default function EmojiHistoryCard() {
  const emojiByDate = useHabitStore((s) => s.emojiByDate || {})
  const ws = useHabitStore((s) => (s.weekStart === 'sunday' ? 0 : 1))
  const [yearDate, setYearDate] = useState<Date>(startOfYear(new Date()))

  const today = new Date()

  function buildCols(rangeStart: Date, rangeEnd: Date) {
    const startAligned = startOfWeek(rangeStart, { weekStartsOn: ws as 0 | 1 })
    const minDate = rangeStart
    const end = rangeEnd
    const cols: (Date | null)[][] = []
    let cur = new Date(startAligned)
    while (cur <= end) {
      const col: (Date | null)[] = Array.from({ length: 7 }).map(() => null)
      for (let r = 0; r < 7; r++) {
        const d = addDays(cur, r)
        if (d >= minDate && d <= end) col[r] = d
      }
      cols.push(col)
      cur = addDays(cur, 7)
    }
    return cols
  }

  const yearCols = useMemo(() => buildCols(startOfYear(yearDate), endOfYear(yearDate)), [yearDate, ws])

  const weekdayLabels = useMemo(() => {
    const short = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return Array.from({ length: 7 }).map((_, r) => short[(ws + r) % 7])
  }, [ws])

  const CELL = 18 // px default

  const Container: React.FC<{ cols: (Date | null)[][]; showMonthLabels?: boolean; fillWidth?: boolean; baseYear?: number }> = ({ cols, showMonthLabels, fillWidth, baseYear }) => {
    const scrollerRef = useRef<HTMLDivElement | null>(null)
    const labels = useMemo(() => {
      if (!showMonthLabels) return [] as (string | null)[]
      const year = typeof baseYear === 'number' ? baseYear : new Date().getFullYear()
      const out = Array(cols.length).fill(null) as (string | null)[]
      const positions1Based = [1, 6, 10, 15, 19, 23, 28, 32, 37, 41, 45, 50]
      const monthNames = Array.from({ length: 12 }, (_, m) => format(new Date(year, m, 1), 'MMM'))
      positions1Based.forEach((pos, idx) => {
        const i = pos - 1
        if (i >= 0 && i < out.length) out[i] = monthNames[idx]
      })
      return out
    }, [cols.length, showMonthLabels, baseYear])

    const weeks = cols.length
    const gap = 4 // px (gap-1)
    const leftCol = 32 // px (w-8)
    const leftGap = 8 // px (mr-2)
    const cellVar = `calc((100% - ${leftCol}px - ${leftGap}px - ${(weeks - 1) * gap}px) / ${weeks})`

    // Align scroller so the current week is visible (on current year)
    useEffect(() => {
      try {
        const y = typeof baseYear === 'number' ? baseYear : startOfYear(new Date()).getFullYear()
        if (y !== startOfYear(today).getFullYear()) return
        const el = scrollerRef.current
        if (!el) return
        const colEls = Array.from(el.querySelectorAll('[data-col]')) as HTMLElement[]
        const idx = cols.findIndex((col) => col.some((d) => d && isSameDay(d, today)))
        const target = idx >= 0 ? colEls[idx] : null
        if (target) {
          const scrollLeft = target.offsetLeft + target.offsetWidth - el.clientWidth
          el.scrollLeft = scrollLeft > 0 ? scrollLeft : 0
        }
      } catch {}
    }, [cols.length, baseYear])

    return (
      <div ref={scrollerRef} className={`mt-2 ${fillWidth ? 'overflow-y-hidden' : 'overflow-x-auto overflow-y-hidden'}`} style={fillWidth ? { overflowX: 'hidden' } : undefined}>
        {showMonthLabels && (
          <div className="mb-2 flex items-center gap-2">
            <div className="w-8 text-sm text-neutral-600 dark:text-neutral-300">&nbsp;</div>
            <div
              className="flex gap-1"
              style={{ marginLeft: fillWidth ? `calc(${cellVar} / 2)` : `${18 / 2}px` }}
            >
              {(() => {
                // Shift labels right by one column
                const shifted = [null, ...labels].slice(0, cols.length)
                return shifted.map((lab, i) => (
                  <div
                    key={i}
                    className="text-[11px] text-neutral-600 dark:text-neutral-300 text-center"
                    style={{ width: fillWidth ? `calc(${cellVar})` : 18 }}
                  >
                    {lab}
                  </div>
                ))
              })()}
            </div>
          </div>
        )}
        <div className="flex gap-3" style={fillWidth ? { ['--cell' as any]: cellVar } : undefined}>
          {/* weekday labels */}
          <div className="flex flex-col items-end gap-1 mr-2">
            {weekdayLabels.map((d) => {
              const style = fillWidth ? { height: `calc(${cellVar})`, lineHeight: `calc(${cellVar})` } : { height: 18, lineHeight: '18px' }
              return (
                <div key={d} className="text-[12px] text-neutral-600 dark:text-neutral-300" style={style}>{d}</div>
              )
            })}
          </div>
          {/* grid */}
          <div className="flex gap-1">
            {cols.map((col, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-1" data-col>
                {col.map((d, rIdx) => {
                  if (!d) return <div key={rIdx} style={{ height: CELL, width: CELL }} />
                  const key = iso(d)
                  const short = key.slice(0, 10)
                  const id = emojiByDate[key] || emojiByDate[short]
                  const e = id ? emojiIndex.get(id) : null
                  const title = format(d, 'EEE, d MMM yyyy')
                  return (
                    <div key={rIdx} title={title} className="grid place-items-center" style={fillWidth ? { height: `calc(${cellVar})`, width: `calc(${cellVar})` } : { height: CELL, width: CELL }}>
                      {e ? (
                        <span className="text-base leading-none" aria-hidden>{e.emoji}</span>
                      ) : (
                        <span className="text-muted" style={fillWidth ? { fontSize: 'calc(var(--cell, 14px) * 0.6)', lineHeight: `calc(${cellVar})` } : { fontSize: 11, lineHeight: `${CELL}px` }}>•</span>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Year navigation (match habit stats cards)
  function shiftYear(delta: number) {
    setYearDate((prev) => {
      const base = startOfYear(prev)
      const candidate = addYears(base, delta)
      const nowYearStart = startOfYear(new Date())
      return isAfter(candidate, nowYearStart) ? nowYearStart : candidate
    })
  }

  return (
    <div className="rounded-2xl border dark:border-neutral-700 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-neutral-600 dark:text-neutral-300 font-medium">Emoji history</div>
        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
          <button
            onClick={() => shiftYear(-1)}
            className="rounded-xl p-1 hover:bg-neutral-100 dark:hover:bg-neutral-900"
            aria-label="Previous year"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="tabular-nums">{new Intl.DateTimeFormat('en', { year: 'numeric' }).format(yearDate)}</div>
          <button
            onClick={() => shiftYear(1)}
            disabled={startOfYear(yearDate).getFullYear() >= startOfYear(today).getFullYear()}
            className="rounded-xl p-1 hover:bg-neutral-100 dark:hover:bg-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Next year"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <Container cols={yearCols} showMonthLabels baseYear={startOfYear(yearDate).getFullYear()} />
    </div>
  )
}
