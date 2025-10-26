import { useState, useRef, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { CircleHelp, PlusCircle, MinusCircle, ChartPie, Trophy, Home, Menu, ChevronDown, Settings as SettingsIcon, Archive, LayoutList, LayoutGrid } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMotionPreferences, defaultEase } from '../ui/motion'
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
  const [moreDesktopOpen, setMoreDesktopOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [moreMobileOpen, setMoreMobileOpen] = useState(false)
  const showAdd = useHabitStore((s) => s.showAdd)
  const setShowAdd = useHabitStore((s) => s.setShowAdd)
  const showArchived = useHabitStore((s) => (s as any).showArchived)
  const setShowArchived = useHabitStore((s) => (s as any).setShowArchived)
  const showList = useHabitStore((s) => (s as any).showList)
  const setShowList = useHabitStore((s) => (s as any).setShowList)
  const moreRef = useRef<HTMLDivElement | null>(null)
  const moreButtonRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)
  const { overlayMotion, prefersReducedMotion } = useMotionPreferences()
  const location = useLocation()
  const isHome = location.pathname === '/'

  // Motion variants used for mobile menu and desktop "more" dropdown
  const mobileMenuVariants = {
    initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 },
    animate: prefersReducedMotion
      ? { opacity: 1, transition: { duration: 0.06 } }
      : { opacity: 1, y: 0, scale: 1, transition: overlayMotion.panelTransition },
    exit: prefersReducedMotion
      ? { opacity: 0, transition: { duration: 0.06 } }
      : { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.28, ease: defaultEase } },
  } as const

  // Slightly different animation for small width desktop dropdowns:
  const desktopDropdownVariants = {
    initial: { opacity: 0, y: 6, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: defaultEase } },
    exit: { opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.16, ease: defaultEase } },
  } as const

  // Submenu variants used for the nested "More" on mobile (height animation)
  const submenuVariants = {
    initial: { opacity: 0, y: -4, height: 0 },
    animate: { opacity: 1, y: 0, height: 'auto', transition: { duration: 0.22, ease: defaultEase } },
    exit: { opacity: 0, y: -4, height: 0, transition: { duration: 0.18, ease: defaultEase } },
  } as const

  // Close desktop More on outside click / Esc
  useEffect(() => {
    if (!moreDesktopOpen) return

    const handleClick = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node | null
      if (!t) return
      if (moreRef.current?.contains(t) || moreButtonRef.current?.contains(t)) return
      setMoreDesktopOpen(false)
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoreDesktopOpen(false)
        moreButtonRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('touchstart', handleClick)
    window.addEventListener('keydown', handleKey)

    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('touchstart', handleClick)
      window.removeEventListener('keydown', handleKey)
    }
  }, [moreDesktopOpen])

  // Close mobile menu on outside click
  useEffect(() => {
    if (!menuOpen) return

    const handleClick = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node | null
      if (!t) return
      if (menuRef.current?.contains(t) || menuButtonRef.current?.contains(t)) return
      setMenuOpen(false)
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('touchstart', handleClick)

    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('touchstart', handleClick)
    }
  }, [menuOpen])

  return (
    <header className="mb-6 flex items-center justify-between">
      <div className="flex items-baseline gap-4">
        <Link to="/" aria-label="Go to home" className="text-2xl font-semibold tracking-tight hover:underline hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors">Ritus</Link>
        <div className="text-sm text-neutral-600 dark:text-neutral-400" aria-hidden>
          <DateDisplay />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <nav>
          {/* Desktop-only page links — hidden on mobile, pages moved into mobile menu */}
          <ul className="hidden md:flex items-center gap-2">
            <li>
              <NavLink to="/" className="rounded-lg border px-3 py-2 text-sm border-neutral-300 dark:border-neutral-700" end>
                <Home className="inline-block w-4 h-4 mr-2" />Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/insight" className="rounded-lg border px-3 py-2 text-sm border-neutral-300 dark:border-neutral-700">
                <ChartPie className="inline-block w-4 h-4 mr-2" />Insight
              </NavLink>
            </li>
            <li>
              <NavLink to="/milestones" className="rounded-lg border px-3 py-2 text-sm border-neutral-300 dark:border-neutral-700">
                <Trophy className="inline-block w-4 h-4 mr-2" />Milestones
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Desktop: page links + More dropdown (contains Add/Guide/Settings) */}
        <div className="hidden md:flex items-center gap-2 relative">
          <div className="flex items-center gap-2 relative">
            <button
              ref={moreButtonRef}
              type="button"
              onClick={() => setMoreDesktopOpen((v) => !v)}
              className="rounded-lg border dark:border-neutral-700 px-3 py-2 text-sm inline-flex items-center gap-2"
              aria-haspopup="menu"
              aria-expanded={moreDesktopOpen}
            >
              More
              <ChevronDown className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {moreDesktopOpen && (
                <motion.div
                  ref={moreRef as any}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={desktopDropdownVariants as any}
                  className="absolute right-0 top-full mt-2 w-44 rounded-lg border bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 shadow-lg z-30"
                >
                  <ul className="p-2">
                  {isHome && (
                    <li>
                      <button
                        type="button"
                        onClick={() => { setMoreDesktopOpen(false); setShowAdd(!showAdd); }}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <span className="flex items-center gap-2">{showAdd ? <MinusCircle className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}<span>{showAdd ? 'Hide add' : 'Show add'}</span></span>
                      </button>
                    </li>
                  )}
                  <li>
                    <button
                      type="button"
                      onClick={() => { setMoreDesktopOpen(false); setGuideOpen(true); }}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <span className="flex items-center gap-2"><CircleHelp className="w-4 h-4" />Guide</span>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => { setMoreDesktopOpen(false); setShowArchived(!showArchived); }}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <span className="flex items-center gap-2"><Archive className="w-4 h-4" />{showArchived ? 'Hide archived' : 'Show archived'}</span>
                    </button>
                  </li>
                  {isHome && (
                    <li>
                      <button
                        type="button"
                        onClick={() => { setMoreDesktopOpen(false); setShowList(!showList); }}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <span className="flex items-center gap-2">{showList ? <LayoutGrid className="w-4 h-4" /> : <LayoutList className="w-4 h-4" />}{showList ? 'Show as grid' : 'Show as list'}</span>
                      </button>
                    </li>
                  )}
                  <li>
                    <button
                      type="button"
                      onClick={() => { setMoreDesktopOpen(false); setSettingsOpen(true); }}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <span className="flex items-center gap-2"><SettingsIcon className="w-4 h-4" />Settings</span>
                    </button>
                  </li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile: hamburger menu which contains page links and a More submenu */}
        <div className="md:hidden relative">
          <div className="flex items-center gap-2">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="px-2 py-1.5 rounded-lg border dark:border-neutral-700 text-sm inline-flex items-center gap-2"
              aria-expanded={menuOpen}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                ref={menuRef as any}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={mobileMenuVariants as any}
                className="absolute right-0 mt-2 w-56 rounded-lg border bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 shadow-lg z-30"
              >
                <ul className="p-2">
                <li>
                  <NavLink to="/" onClick={() => setMenuOpen(false)} className={({ isActive }: { isActive: boolean }) => `block rounded-md px-3 py-2 text-base ${isActive ? 'bg-neutral-100 dark:bg-neutral-800' : ''}`} end>
                    <Home className="inline-block w-4 h-4 mr-2" />Home
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/insight" onClick={() => setMenuOpen(false)} className={({ isActive }: { isActive: boolean }) => `block rounded-md px-3 py-2 text-base ${isActive ? 'bg-neutral-100 dark:bg-neutral-800' : ''}`}>
                    <ChartPie className="inline-block w-4 h-4 mr-2" />Insight
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/milestones" onClick={() => setMenuOpen(false)} className={({ isActive }: { isActive: boolean }) => `block rounded-md px-3 py-2 text-base ${isActive ? 'bg-neutral-100 dark:bg-neutral-800' : ''}`}>
                    <Trophy className="inline-block w-4 h-4 mr-2" />Milestones
                  </NavLink>
                </li>

                {/* More trigger inside mobile list */}
                <li>
                  <button
                    type="button"
                    onClick={() => setMoreMobileOpen((v) => !v)}
                    className={`w-full text-left px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between`}
                    aria-expanded={moreMobileOpen}
                  >
                    <span className="flex items-center gap-2">More</span>
                    <ChevronDown className={`w-4 h-4 ${moreMobileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {moreMobileOpen && (
                      <motion.ul
                        id="mobile-more-submenu"
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={submenuVariants as any}
                        className="mt-1 pl-2 overflow-hidden"
                      >
                      {isHome && (
                        <li>
                          <button
                            type="button"
                            onClick={() => { setMenuOpen(false); setMoreMobileOpen(false); setShowAdd(!showAdd); }}
                            className="w-full text-left px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          >
                            <span className="flex items-center gap-2">{showAdd ? <MinusCircle className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}<span>{showAdd ? 'Hide add' : 'Show add'}</span></span>
                          </button>
                        </li>
                      )}
                      <li>
                        <button
                          type="button"
                          onClick={() => { setMenuOpen(false); setMoreMobileOpen(false); setGuideOpen(true); }}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          <span className="flex items-center gap-2"><CircleHelp className="w-4 h-4" />Guide</span>
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => { setMenuOpen(false); setMoreMobileOpen(false); setShowArchived(!showArchived); }}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          <span className="flex items-center gap-2"><Archive className="w-4 h-4" />{showArchived ? 'Hide archived' : 'Show archived'}</span>
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => { setMenuOpen(false); setMoreMobileOpen(false); setSettingsOpen(true); }}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          <span className="flex items-center gap-2"><SettingsIcon className="w-4 h-4" />Settings</span>
                        </button>
                      </li>
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </li>
              </ul>
              </motion.div>
            )}
          </AnimatePresence>
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
