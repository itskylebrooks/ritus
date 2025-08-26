import HeaderStats from './components/HeaderStats'
import AddHabit from './components/AddHabit'
import HabitCard from './components/HabitCard'
import SettingsModal from './components/SettingsModal'
import GuideModal from './components/GuideModal'
import { useHabitStore } from './store/useHabitStore'
import { fromISO, isSameCalendarWeek, isSameDay, daysThisWeek } from './utils/date'
import { hasCompletionInWeek, hasCompletionOnDay } from './utils/scoring'
import React from "react";

function EmptyState() {
  return (
    <div className="rounded-2xl border p-10 text-center text-neutral-600 dark:text-neutral-300">
      <p className="text-lg font-medium">No habits yet</p>
      <p className="mt-1 text-sm">Create your first habit to get started.</p>
    </div>
  )
}

function FooterControls() {
  const clearAll = useHabitStore((s) => s.clearAll)
  const [confirm, setConfirm] = React.useState(false)
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
      <div className="text-xs text-neutral-500 dark:text-neutral-400">
        Data is stored locally in your browser (localStorage). Switch on system dark mode for dark theme.
      </div>
      <div className="flex items-center gap-2">
        {confirm ? (
          <>
            <button onClick={() => setConfirm(false)} className="rounded-xl border px-3 py-2 text-sm">Cancel</button>
            <button
              onClick={() => { clearAll(); setConfirm(false) }}
              className="rounded-xl bg-red-600 px-3 py-2 text-sm text-white"
            >
              Reset all data
            </button>
          </>
        ) : (
          <button onClick={() => setConfirm(true)} className="rounded-xl border px-3 py-2 text-sm">Reset data…</button>
        )}
      </div>
    </div>
  )
}

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
          <button onClick={() => setSettingsOpen(true)} className="rounded-lg border px-3 py-2 text-sm">Settings</button>
        </div>
      </header>

  <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} entries={[]} onShowGuide={() => { setGuideOpen(true); setSettingsOpen(false); }} />
  <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />

      <HeaderStats />

      <div className="mt-6">
        <AddHabit />
      </div>

      <main className="mt-6 grid gap-4">
        {sorted.length === 0 ? <EmptyState /> : sorted.map((h) => <HabitCard key={h.id} habit={h} />)}
      </main>

      <FooterControls />

      <footer className="mt-8 text-center text-xs text-neutral-500 dark:text-neutral-400">
        Built with React + TypeScript · Zustand · date-fns · Recharts
      </footer>
    </div>
  )
}
