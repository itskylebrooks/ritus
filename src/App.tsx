import HeaderStats from './components/HeaderStats'
import AddHabit from './components/AddHabit'
import QuoteCard from './components/QuoteCard'
import ClockCard from './components/ClockCard'
import HabitCard from './components/HabitCard'
import SettingsModal from './components/SettingsModal'
import GuideModal from './components/GuideModal'
import { useHabitStore } from './store/store'
import { fromISO } from './utils/date'
import { hasCompletionOnDay, countCompletionsInWeek } from './utils/scoring'
import { useMemo, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CircleHelp, PlusCircle, MinusCircle } from 'lucide-react'

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
      transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
  className="rounded-2xl border dark:border-neutral-700 p-10 text-center text-neutral-600 dark:text-neutral-300"
    >
      <p className="text-lg font-medium">No habits yet</p>
      <p className="mt-1 text-sm">Create your first habit to get started.</p>
    </motion.div>
  )
}

// Footer controls removed

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [showAdd, setShowAdd] = useState(true)
  
  const habits = useHabitStore((s) => s.habits)
  const initialListRender = useRef(true)
  useEffect(() => { initialListRender.current = false }, [])
  const [emptyReady, setEmptyReady] = useState(habits.length === 0)
  const emptyTimer = useRef<number | null>(null)
  const prevCount = useRef(habits.length)

  // Ensure empty state appears smoothly after deleting the last habit
  useEffect(() => {
    const cur = habits.length
    const prev = prevCount.current
    prevCount.current = cur
    if (cur === 0) {
      // If transitioning from some items to none, wait for exit animation
      if (prev > 0) {
        setEmptyReady(false)
        if (emptyTimer.current) window.clearTimeout(emptyTimer.current)
        emptyTimer.current = window.setTimeout(() => { setEmptyReady(true); emptyTimer.current = null }, 300)
      } else {
        // Initial load with no habits: show immediately (but with animations disabled)
        setEmptyReady(true)
      }
    } else {
      // When we have items, hide empty state immediately
      if (emptyTimer.current) { window.clearTimeout(emptyTimer.current); emptyTimer.current = null }
      setEmptyReady(false)
    }
    return () => {
      if (emptyTimer.current) { window.clearTimeout(emptyTimer.current); emptyTimer.current = null }
    }
  }, [habits.length])

  const sortedHabits = useMemo(() => {
    const today = new Date()
    return [...habits].sort((a, b) => {
      const aDone = a.frequency === 'daily'
        ? hasCompletionOnDay(a.completions, today)
        : countCompletionsInWeek(a.completions, today) >= (a.weeklyTarget ?? 1)

      const bDone = b.frequency === 'daily'
        ? hasCompletionOnDay(b.completions, today)
        : countCompletionsInWeek(b.completions, today) >= (b.weeklyTarget ?? 1)

      if (aDone !== bDone) return aDone ? 1 : -1
      return fromISO(b.createdAt).getTime() - fromISO(a.createdAt).getTime()
    })
  }, [habits])

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-baseline gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Ritus</h1>
          <div className="text-sm text-neutral-600 dark:text-neutral-400" aria-hidden>
            {/* date shown at right of title; format controlled by settings */}
            <DateDisplay />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdd((s) => !s)}
              className="rounded-lg border dark:border-neutral-700 px-3 py-2 text-sm"
              aria-label={showAdd ? 'Hide add habit' : 'Show add habit'}
              title={showAdd ? 'Hide add habit' : 'Show add habit'}
            >
              {showAdd ? <MinusCircle className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            </button>

            <button onClick={() => setGuideOpen(true)} className="rounded-lg border dark:border-neutral-700 px-3 py-2 text-sm" aria-label="Open guide" title="Open guide">
              <CircleHelp className="w-5 h-5" />
            </button>

            <button onClick={() => setSettingsOpen(true)} className="rounded-lg border dark:border-neutral-700 px-3 py-2 text-sm" aria-label="Open settings" title="Open settings">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 lucide lucide-bolt-icon lucide-bolt">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </button>
          </div>
        </div>
      </header>

  <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onShowGuide={() => { setGuideOpen(true); setSettingsOpen(false); }}
      />
  <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
  

      <HeaderStats />

  <div className="mt-4 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-3 items-stretch">
          <div className="sm:col-span-2 h-full">
            <QuoteCard />
          </div>

          <div className="sm:col-span-1 h-full">
            <ClockCard />
          </div>
        </div>

        {showAdd && (
          <div>
            <AddHabit />
          </div>
        )}

      <motion.main layout className="grid gap-4">
        <AnimatePresence initial={false} mode="popLayout">
          {sortedHabits.length === 0 ? (
            emptyReady ? <EmptyState disableAnim={initialListRender.current} /> : null
          ) : (
            sortedHabits.map((h) => (
              <motion.div
                key={h.id}
                layout
                // Keep exit so only the removed card animates out.
                // Rely on layout for siblings to smoothly shift with no fade.
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <HabitCard habit={h} disableEntryAnim={initialListRender.current} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.main>

      </div>

  {/* Footer removed */}
    </div>
  )
}
