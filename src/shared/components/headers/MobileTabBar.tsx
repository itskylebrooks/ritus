import { NavLink, useLocation } from 'react-router-dom'
import { ChartPie, Home, Trophy } from 'lucide-react'

export default function MobileTabBar() {
  const location = useLocation()

  return (
    <nav
      className="fixed bottom-4 left-0 right-0 z-30 flex justify-center px-4 pb-[env(safe-area-inset-bottom)] sm:hidden"
      aria-label="Primary"
    >
      <div className="flex items-center gap-4 rounded-full border border-subtle bg-surface-elevated px-3 py-2 shadow-elevated">
        {[
          { id: 'insight', to: '/insight', label: 'Insight', icon: <ChartPie className="h-5 w-5" aria-hidden /> },
          { id: 'home', to: '/', label: 'Home', icon: <Home className="h-5 w-5" aria-hidden />, end: true },
          { id: 'milestones', to: '/milestones', label: 'Milestones', icon: <Trophy className="h-5 w-5" aria-hidden /> },
        ].map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.to}
            end={tab.end}
            aria-label={tab.label}
            title={tab.label}
            onClick={(e) => { if (location.pathname === tab.to) e.preventDefault() }}
            className="relative flex h-12 w-14 items-center justify-center rounded-full"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    className="absolute inset-0 rounded-full bg-[var(--color-text-primary)]"
                  />
                )}
                <span
                  className={`relative z-10 flex h-5 w-5 items-center justify-center ${
                    isActive ? 'text-[var(--color-surface)]' : 'text-[var(--color-text-primary)]'
                  }`}
                >
                  {tab.icon}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
