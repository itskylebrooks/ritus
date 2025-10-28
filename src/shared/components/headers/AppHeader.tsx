import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Archive, ChartPie, ChevronDown, CircleHelp, Home, LayoutGrid, LayoutList, Lightbulb, Menu, MinusCircle, PlusCircle, Settings as SettingsIcon, Trophy } from 'lucide-react'
import { createMobileMenuVariants, desktopDropdownVariants, submenuVariants, useMotionPreferences } from '@/shared/animations'
import { useHabitStore } from '@/shared/store/store'
import GuideModal from '@/shared/components/modals/GuideModal'
import SettingsModal from '@/shared/components/modals/SettingsModal'
import EmojiPicker from '@/shared/components/emoji/EmojiPicker'

function DateDisplay() {
  const dateFormat = useHabitStore((s) => s.dateFormat)
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const yyyy = String(now.getFullYear())
  return <span>{dateFormat === 'MDY' ? `${mm}/${dd}/${yyyy}` : `${dd}/${mm}/${yyyy}`}</span>
}

// Inline title + emoji + date layout handled directly in header

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
  const isMilestones = location.pathname === '/milestones'
  const isInspiration = location.pathname === '/inspiration'
  const isArchiveHidden = isMilestones || isInspiration
  const navLinkBase = 'rounded-lg border border-subtle px-3 text-sm transition-colors duration-150 ease-in-out inline-flex items-center h-10'
  const mobileNavLinkBase = 'block rounded-md px-3 py-2 text-base transition-colors duration-150 ease-in-out'

  const mobileMenuVariants = createMobileMenuVariants(prefersReducedMotion, overlayMotion)

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

  // Show guide automatically for first-time visitors (persisted in localStorage)
  useEffect(() => {
    try {
      const seen = localStorage.getItem('ritus_seen_guide')
      if (!seen) {
        // show guide on first visit
        setGuideOpen(true)
      }
    } catch (e) {
      // ignore localStorage errors
    }
  }, [])

  return (
    <header className="mb-6 relative flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link
          to="/"
          aria-label="Go to home"
          className="inline-flex items-center h-10 text-2xl leading-none font-bold uppercase tracking-wider hover-change-color transition-colors"
        >
          Ritus
        </Link>
        <EmojiPicker />
      </div>

      {/* Centered desktop nav with icons only (truly centered to header width) */}
      <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-10">
        {/* Desktop-only page links — centered, icons only */}
        <ul className="flex items-center gap-2">
          {/* Order icons so Home sits in the middle */}
          <li>
            <NavLink
              to="/insight"
              aria-label="Insight"
              title="Insight"
              className={({ isActive }: { isActive: boolean }) =>
                `${navLinkBase} ${isActive ? 'bg-accent text-inverse border-transparent hover-accent-fade' : 'text-strong hover-nonaccent'}`
              }
            >
              <ChartPie className="w-4 h-4" />
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/"
              end
              aria-label="Home"
              title="Home"
              className={({ isActive }: { isActive: boolean }) =>
                `${navLinkBase} ${isActive ? 'bg-accent text-inverse border-transparent hover-accent-fade' : 'text-strong hover-nonaccent'}`
              }
            >
              <Home className="w-4 h-4" />
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/milestones"
              aria-label="Milestones"
              title="Milestones"
              className={({ isActive }: { isActive: boolean }) =>
                `${navLinkBase} ${isActive ? 'bg-accent text-inverse border-transparent hover-accent-fade' : 'text-strong hover-nonaccent'}`
              }
            >
              <Trophy className="w-4 h-4" />
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Right side: date then More button */}
      <div className="flex items-center gap-2">
        <div className="hidden md:inline-flex items-center rounded-lg border border-subtle px-3 text-sm text-muted h-10">
          <DateDisplay />
        </div>
        {/* Desktop: More dropdown (contains Add/Guide/Settings) */}
        <div className="hidden md:flex items-center gap-2 relative">
          <div className="flex items-center gap-2 relative">
            <button
              ref={moreButtonRef}
              type="button"
              onClick={() => setMoreDesktopOpen((v) => !v)}
              className="rounded-lg border border-subtle px-3 text-sm inline-flex items-center gap-2 h-10 transition-colors duration-150 hover-nonaccent"
              aria-haspopup="menu"
              aria-expanded={moreDesktopOpen}
            >
              <span className="sr-only">More</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {moreDesktopOpen && (
                <motion.div
                  ref={moreRef as any}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={desktopDropdownVariants}
                  className="absolute right-0 top-full mt-2 w-44 rounded-lg border border-subtle bg-surface-elevated text-strong shadow-elevated z-30"
                >
                  <ul className="p-2">
                    {isHome && (
                      <li>
                        <button
                          type="button"
                          onClick={() => { setMoreDesktopOpen(false); setShowAdd(!showAdd); }}
                          className="w-full text-left px-3 py-2 rounded-md text-strong transition-colors duration-150 hover-nonaccent"
                        >
                          <span className="flex items-center gap-2">{showAdd ? <MinusCircle className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}<span>{showAdd ? 'Hide add' : 'Show add'}</span></span>
                        </button>
                      </li>
                    )}
                    {/* Guide (moved closer to Inspiration) */}
                    {!isArchiveHidden && (
                      <li>
                        <button
                          type="button"
                          onClick={() => { setMoreDesktopOpen(false); setShowArchived(!showArchived); }}
                          className="w-full text-left px-3 py-2 rounded-md text-strong transition-colors duration-150 hover-nonaccent"
                        >
                          <span className="flex items-center gap-2"><Archive className="w-4 h-4" />{showArchived ? 'Hide archived' : 'Show archived'}</span>
                        </button>
                      </li>
                    )}
                    {isHome && (
                      <li>
                        <button
                          type="button"
                          onClick={() => { setMoreDesktopOpen(false); setShowList(!showList); }}
                          className="w-full text-left px-3 py-2 rounded-md text-strong transition-colors duration-150 hover-nonaccent"
                        >
                          <span className="flex items-center gap-2">{showList ? <LayoutGrid className="w-4 h-4" /> : <LayoutList className="w-4 h-4" />}{showList ? 'Show as grid' : 'Show as list'}</span>
                        </button>
                      </li>
                    )}

                    {/* Guide placed directly above Inspiration */}
                    <li>
                      <button
                        type="button"
                        onClick={() => { setMoreDesktopOpen(false); setGuideOpen(true); }}
                        className="w-full text-left px-3 py-2 rounded-md text-strong transition-colors duration-150 hover-nonaccent"
                      >
                        <span className="flex items-center gap-2"><CircleHelp className="w-4 h-4" />Guide</span>
                      </button>
                    </li>
                      <li>
                      <NavLink
                        to="/inspiration"
                        onClick={() => setMoreDesktopOpen(false)}
                        className={({ isActive }: { isActive: boolean }) =>
                          `block w-full text-left px-3 py-2 rounded-md text-strong transition-colors duration-150 ${isActive ? 'bg-subtle' : 'hover-nonaccent'}`
                        }
                      >
                        <Lightbulb className="inline-block w-4 h-4 mr-2" />Inspiration
                      </NavLink>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => { setMoreDesktopOpen(false); setSettingsOpen(true); }}
                        className="w-full text-left px-3 py-2 rounded-md text-strong transition-colors duration-150 hover-nonaccent"
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
              className="px-2 py-1.5 rounded-lg border border-subtle text-sm inline-flex items-center gap-2 transition-colors duration-150 hover-nonaccent"
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
                variants={mobileMenuVariants}
                  className="absolute right-0 mt-2 w-56 rounded-lg border border-subtle bg-surface-elevated text-strong shadow-elevated z-30"
              >
                <ul className="p-2">
                <li>
                  <NavLink
                    to="/"
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }: { isActive: boolean }) =>
                      `${mobileNavLinkBase} ${isActive ? 'bg-accent text-inverse border-transparent hover:bg-accent-soft' : 'text-strong hover-nonaccent'}`
                    }
                    end
                  >
                    <Home className="inline-block w-4 h-4 mr-2" />Home
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/insight"
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }: { isActive: boolean }) =>
                      `${mobileNavLinkBase} ${isActive ? 'bg-accent text-inverse border-transparent hover:bg-accent-soft' : 'text-strong hover-nonaccent'}`
                    }
                  >
                    <ChartPie className="inline-block w-4 h-4 mr-2" />Insight
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/milestones"
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }: { isActive: boolean }) =>
                      `${mobileNavLinkBase} ${isActive ? 'bg-accent text-inverse border-transparent hover:bg-accent-soft' : 'text-strong hover-nonaccent'}`
                    }
                  >
                    <Trophy className="inline-block w-4 h-4 mr-2" />Milestones
                  </NavLink>
                </li>

                {/* More trigger inside mobile list */}
                <li>
                  <button
                    type="button"
                    onClick={() => setMoreMobileOpen((v) => !v)}
                    className="w-full text-left px-3 py-2 rounded-md text-strong transition-colors duration-150 hover-nonaccent flex items-center justify-between"
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
                        variants={submenuVariants}
                        className="mt-1 pl-2 overflow-hidden"
                      >
                      {/* Inspiration will be placed just above Settings in the mobile More submenu */}
                      {isHome && (
                        <li>
                          <button
                            type="button"
                            onClick={() => { setMenuOpen(false); setMoreMobileOpen(false); setShowAdd(!showAdd); }}
                            className="w-full text-left px-3 py-2 rounded-md text-strong transition-colors duration-150 hover-nonaccent"
                          >
                            <span className="flex items-center gap-2">{showAdd ? <MinusCircle className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}<span>{showAdd ? 'Hide add' : 'Show add'}</span></span>
                          </button>
                        </li>
                      )}
                      {!isArchiveHidden && (
                        <li>
                          <button
                            type="button"
                            onClick={() => { setMenuOpen(false); setMoreMobileOpen(false); setShowArchived(!showArchived); }}
                            className="w-full text-left px-3 py-2 rounded-md text-strong transition-colors duration-150 hover-nonaccent"
                          >
                            <span className="flex items-center gap-2"><Archive className="w-4 h-4" />{showArchived ? 'Hide archived' : 'Show archived'}</span>
                          </button>
                        </li>
                      )}
                      {/* Guide placed directly above Inspiration */}
                      <li>
                        <button
                          type="button"
                          onClick={() => { setMenuOpen(false); setMoreMobileOpen(false); setGuideOpen(true); }}
                          className="w-full text-left px-3 py-2 rounded-md text-strong transition-colors duration-150 hover-nonaccent"
                        >
                          <span className="flex items-center gap-2"><CircleHelp className="w-4 h-4" />Guide</span>
                        </button>
                      </li>
                      <li>
                        <NavLink
                          to="/inspiration"
                          onClick={() => { setMenuOpen(false); setMoreMobileOpen(false); }}
                          className={({ isActive }: { isActive: boolean }) =>
                            `${mobileNavLinkBase} ${isActive ? 'bg-accent text-inverse border-transparent hover:bg-accent-soft' : 'text-strong hover-nonaccent'}`
                          }
                        >
                          <Lightbulb className="inline-block w-4 h-4 mr-2" />Inspiration
                        </NavLink>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => { setMenuOpen(false); setMoreMobileOpen(false); setSettingsOpen(true); }}
                          className="w-full text-left px-3 py-2 rounded-md text-strong transition-colors duration-150 hover-nonaccent"
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
      <GuideModal
        open={guideOpen}
        onClose={() => { setGuideOpen(false); try { localStorage.setItem('ritus_seen_guide', '1') } catch {} }}
      />
    </header>
  )
}
