import HeaderStats from './components/HeaderStats'
import AddHabit from './components/AddHabit'
import HabitCard from './components/HabitCard'
import SettingsModal from './components/SettingsModal'
import GuideModal from './components/GuideModal'
import { useHabitStore } from './store/useHabitStore'
import { fromISO, isSameCalendarWeek, isSameDay, daysThisWeek } from './utils/date'
import { hasCompletionInWeek, hasCompletionOnDay } from './utils/scoring'
import React from "react";
import { motion, AnimatePresence } from 'framer-motion';

function EmptyState() {
  return (
    <motion.div layout key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.28 }} className="rounded-2xl border p-10 text-center text-neutral-600 dark:text-neutral-300">
      <p className="text-lg font-medium">No habits yet</p>
      <p className="mt-1 text-sm">Create your first habit to get started.</p>
    </motion.div>
  )
}

// Footer controls removed

export default function App() {
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [guideOpen, setGuideOpen] = React.useState(false)
  const habits = useHabitStore((s) => s.habits)

  const sorted = React.useMemo(() => {
    const today = new Date()
    const weekDays = daysThisWeek(today)
    return [...habits].sort((a, b) => {
      const aDone = a.frequency === 'daily'
        ? hasCompletionOnDay(a.completions, today)
        : // weekly: only mark done when completions this week >= weeklyTarget
          weekDays.filter((d) => hasCompletionOnDay(a.completions, d)).length >= (a.weeklyTarget ?? 1)

      const bDone = b.frequency === 'daily'
        ? hasCompletionOnDay(b.completions, today)
        : weekDays.filter((d) => hasCompletionOnDay(b.completions, d)).length >= (b.weeklyTarget ?? 1)

      if (aDone !== bDone) return aDone ? 1 : -1
      return fromISO(b.createdAt).getTime() - fromISO(a.createdAt).getTime()
    })
  }, [habits])

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ritus · Habit Tracker</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">Minimal, fast, and local-first.</p>
        </div>
        <div>
          <button onClick={() => setSettingsOpen(true)} className="rounded-lg border px-3 py-2 text-sm" aria-label="Open settings">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 lucide lucide-bolt-icon lucide-bolt">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </button>
        </div>
      </header>

  <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} entries={[]} onShowGuide={() => { setGuideOpen(true); setSettingsOpen(false); }} />
  <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />

      <HeaderStats />

      <div className="mt-6">
        <AddHabit />
      </div>

      <main className="mt-6 grid gap-4">
  <AnimatePresence>
          {sorted.length === 0 ? (
            <EmptyState />
          ) : (
            sorted.map((h) => (
              <motion.div
                key={h.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <HabitCard habit={h} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </main>

  {/* Footer removed */}
    </div>
  )
}
