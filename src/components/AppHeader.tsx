import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { CircleHelp, PlusCircle, MinusCircle, ChartPie, Trophy, Home } from 'lucide-react'
import { useHabitStore } from '../store/store'
import SettingsModal from './SettingsModal'
import GuideModal from './GuideModal'

function DateDisplay() {
  const dateFormat = useHabitStore((s) => s.dateFormat)
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const yyyy = String(now.getFullYear())
  return <span>{dateFormat === 'MDY' ? `${mm}/${dd}/${yyyy}` : `${dd}/${mm}/${yyyy}`}</span>
}

export default function AppHeader() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const showAdd = useHabitStore((s) => s.showAdd)
  const setShowAdd = useHabitStore((s) => s.setShowAdd)

  return (
    <header className="mb-6 flex items-center justify-between">
      <div className="flex items-baseline gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Ritus</h1>
        <div className="text-sm text-neutral-600 dark:text-neutral-400" aria-hidden>
          <DateDisplay />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <nav>
          <ul className="flex items-center gap-2">
            <li>
              <NavLink to="/" className={({ isActive }: { isActive: boolean }) => `rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-neutral-100 dark:bg-neutral-800' : 'border dark:border-neutral-700'}`} end>
                <Home className="inline-block w-4 h-4 mr-2" />Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/insight" className={({ isActive }: { isActive: boolean }) => `rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-neutral-100 dark:bg-neutral-800' : 'border dark:border-neutral-700'}`}>
                <ChartPie className="inline-block w-4 h-4 mr-2" />Insight
              </NavLink>
            </li>
            <li>
              <NavLink to="/milestones" className={({ isActive }: { isActive: boolean }) => `rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-neutral-100 dark:bg-neutral-800' : 'border dark:border-neutral-700'}`}>
                <Trophy className="inline-block w-4 h-4 mr-2" />Milestones
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdd(!showAdd)}
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

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onShowGuide={() => { setGuideOpen(true); setSettingsOpen(false); }}
      />
      <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </header>
  )
}
