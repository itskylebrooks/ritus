import { useMemo, useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { emphasizeEase, transitions } from '@/shared/animations'
import { hasCompletionOnDay } from '@/shared/utils/scoring'
import { fromISO } from '@/shared/utils/date'
import { useHabitStore } from '@/shared/store/store'
import AddHabit from './components/AddHabit'
import QuoteCard from './components/QuoteCard'
import ClockCard from './components/ClockCard'
import HabitCard from './components/HabitCard'

function DateDisplay() {
  const dateFormat = useHabitStore((s) => s.dateFormat)
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const yyyy = String(now.getFullYear())
  return <span>{dateFormat === 'MDY' ? `${mm}/${dd}/${yyyy}` : `${dd}/${mm}/${yyyy}`}</span>
}

function EmptyState({ disableAnim = false }: { disableAnim?: boolean }) {
  return (
    <motion.div
      layout
      key="empty"
      initial={disableAnim ? false : { opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ ...transitions.fadeLg, ease: emphasizeEase }}
      className="rounded-2xl border dark:border-neutral-700 p-10 text-center text-neutral-600 dark:text-neutral-300"
    >
      <p className="text-lg font-medium">No habits yet</p>
      <p className="mt-1 text-sm">Create your first habit to get started.</p>
    </motion.div>
  )
}

export default function Home() {
  const showAdd = useHabitStore((s) => s.showAdd)
  const setShowAdd = useHabitStore((s) => s.setShowAdd)

  const showList = useHabitStore((s) => (s as any).showList)

  const habits = useHabitStore((s) => s.habits)
  const showArchived = useHabitStore((s) => (s as any).showArchived)
  const initialListRender = useRef(true)
  useEffect(() => { initialListRender.current = false }, [])
  const [emptyReady, setEmptyReady] = useState(habits.length === 0)
  const emptyTimer = useRef<number | null>(null)
  const prevCount = useRef(habits.length)

  useEffect(() => {
    const cur = habits.length
    const prev = prevCount.current
    prevCount.current = cur
    if (cur === 0) {
      if (prev > 0) {
        setEmptyReady(false)
        if (emptyTimer.current) window.clearTimeout(emptyTimer.current)
        emptyTimer.current = window.setTimeout(() => { setEmptyReady(true); emptyTimer.current = null }, 300)
      } else {
        setEmptyReady(true)
      }
    } else {
      if (emptyTimer.current) { window.clearTimeout(emptyTimer.current); emptyTimer.current = null }
      setEmptyReady(false)
    }
    return () => {
      if (emptyTimer.current) { window.clearTimeout(emptyTimer.current); emptyTimer.current = null }
    }
  }, [habits.length])

  const sortedHabits = useMemo(() => {
    const today = new Date()
    const source = showArchived ? habits : habits.filter((h) => !h.archived)
    return [...source].sort((a, b) => {
      // Check if today specifically was marked done/clean for any frequency type
      const aDone = hasCompletionOnDay(a.completions, today)
      const bDone = hasCompletionOnDay(b.completions, today)

      if (aDone !== bDone) return aDone ? 1 : -1
      return fromISO(b.createdAt).getTime() - fromISO(a.createdAt).getTime()
    })
  }, [habits, showArchived])

  return (
    <div>

      <div className="mt-4 grid gap-4">
        <div className="order-last sm:order-first">
          <div className="grid gap-4 sm:grid-cols-3 items-stretch">
            <div className="sm:col-span-2 h-full">
              <QuoteCard />
            </div>

            <div className="sm:col-span-1 h-full">
              <ClockCard />
            </div>
          </div>
        </div>

        <div className="order-first sm:order-last space-y-4">
          {showAdd && (
            <div>
              <AddHabit />
            </div>
          )}

          <motion.main layout className={`grid gap-4 ${showList ? '' : 'sm:grid-cols-2'}`}>
            <AnimatePresence initial={false} mode="popLayout">
              {sortedHabits.length === 0 ? (
                emptyReady ? <EmptyState disableAnim={initialListRender.current} /> : null
              ) : (
                sortedHabits.map((h) => (
                  <motion.div
                    key={h.id}
                    layout
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={transitions.fadeXl}
                  >
                    <HabitCard habit={h} disableEntryAnim={initialListRender.current} />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.main>
        </div>
      </div>

    </div>
  )
}
