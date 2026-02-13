/* eslint-disable no-empty */
import { desktopDropdownVariants } from '@/shared/animations';
import EmojiPicker from '@/shared/components/emoji/EmojiPicker';
import GuideModal from '@/shared/components/modals/GuideModal';
import SettingsModal from '@/shared/components/modals/SettingsModal';
import { STORAGE_KEYS } from '@/shared/constants/storageKeys';
import { useHabitStore } from '@/shared/store/store';
import { safeGetItem, safeSetItem } from '@/shared/utils/storage';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Archive,
  ChartPie,
  ChevronDown,
  CircleHelp,
  Compass as CompassIcon,
  Home,
  LayoutGrid,
  LayoutList,
  Lightbulb,
  MinusCircle,
  PlusCircle,
  Settings as SettingsIcon,
  Trophy,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import MobileTabBar from './MobileTabBar';

function DateDisplay() {
  const dateFormat = useHabitStore((s) => s.dateFormat);
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const yyyy = String(now.getFullYear());
  return <span>{dateFormat === 'MDY' ? `${mm}/${dd}/${yyyy}` : `${dd}/${mm}/${yyyy}`}</span>;
}

// Inline title + emoji + date layout handled directly in header

export default function AppHeader() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [moreDesktopOpen, setMoreDesktopOpen] = useState(false);
  const showAdd = useHabitStore((s) => s.showAdd);
  const setShowAdd = useHabitStore((s) => s.setShowAdd);
  const showArchived = useHabitStore((s) => s.showArchived);
  const setShowArchived = useHabitStore((s) => s.setShowArchived);
  const showList = useHabitStore((s) => s.showList);
  const setShowList = useHabitStore((s) => s.setShowList);
  const triggerHomeRefresh = useHabitStore((s) => s.triggerHomeRefresh);
  const moreRef = useRef<HTMLDivElement | null>(null);
  const moreButtonRef = useRef<HTMLButtonElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const isProfile = location.pathname === '/profile';
  const isInspiration = location.pathname === '/inspiration';
  const isCompass = location.pathname === '/compass';
  const isArchiveHidden = isProfile || isInspiration || isCompass;
  const navLinkBase =
    'rounded-lg border border-subtle px-3 text-sm transition-colors duration-150 ease-in-out inline-flex items-center gap-2 h-10';

  // Close desktop More on outside click / Esc
  useEffect(() => {
    if (!moreDesktopOpen) return;

    const handleClick = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (moreRef.current?.contains(t) || moreButtonRef.current?.contains(t)) return;
      setMoreDesktopOpen(false);
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoreDesktopOpen(false);
        moreButtonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    window.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
      window.removeEventListener('keydown', handleKey);
    };
  }, [moreDesktopOpen]);

  // Show guide automatically for first-time visitors (persisted in localStorage)
  useEffect(() => {
    try {
      const seen = safeGetItem(STORAGE_KEYS.SEEN_GUIDE);
      if (!seen) {
        // show guide on first visit
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setGuideOpen(true);
      }
    } catch {
      // ignore localStorage errors
    }
  }, []);

  // When header switches to mobile layout (< sm), automatically switch habit view to list
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 640px)');

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (!e.matches && isHome) {
        try {
          setShowList(true);
        } catch {}
      }
    };

    // Ensure correct mode on initial load
    handleChange(mq);

    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handleChange);
      return () => mq.removeEventListener('change', handleChange);
    } else {
      mq.addListener(handleChange);
      return () => mq.removeListener(handleChange);
    }
  }, [isHome, setShowList]);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between bg-app py-2.5 sm:py-3">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            aria-label="Go to home"
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault();
                try {
                  triggerHomeRefresh();
                } catch {}
              }
            }}
            className="inline-flex items-center h-10 text-2xl leading-none font-bold uppercase tracking-wider hover-change-color transition-colors"
          >
            Ritus
          </Link>
          <EmojiPicker />
        </div>

        {/* Centered desktop nav with icons only (truly centered to header width) */}
        <nav className="hidden sm:flex absolute left-1/2 -translate-x-1/2 z-10">
          {/* Desktop-only page links — centered, icons only */}
          <ul className="flex items-center gap-2">
            {/* Order icons so Home sits in the middle */}
            <li>
              <NavLink
                to="/insight"
                aria-label="Insight"
                title="Insight"
                onClick={(e) => {
                  if (location.pathname === '/insight') e.preventDefault();
                }}
                className={({ isActive }: { isActive: boolean }) =>
                  `${navLinkBase} ${isActive ? 'bg-accent text-inverse border-transparent hover-accent-fade' : 'text-strong hover-nonaccent'}`
                }
              >
                <ChartPie className="w-4 h-4" />
                <span className="text-sm">Insight</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/"
                end
                aria-label="Home"
                title="Home"
                onClick={(e) => {
                  if (location.pathname === '/') e.preventDefault();
                }}
                className={({ isActive }: { isActive: boolean }) =>
                  `${navLinkBase} ${isActive ? 'bg-accent text-inverse border-transparent hover-accent-fade' : 'text-strong hover-nonaccent'}`
                }
              >
                <Home className="w-4 h-4" />
                <span className="text-sm">Home</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/profile"
                aria-label="Profile"
                title="Profile"
                onClick={(e) => {
                  if (location.pathname === '/profile') e.preventDefault();
                }}
                className={({ isActive }: { isActive: boolean }) =>
                  `${navLinkBase} ${isActive ? 'bg-accent text-inverse border-transparent hover-accent-fade' : 'text-strong hover-nonaccent'}`
                }
              >
                <Trophy className="w-4 h-4" />
                <span className="text-sm">Profile</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Right side: date then More button */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center px-3 text-sm text-muted h-10">
            <DateDisplay />
          </div>
          {/* More dropdown (contains Add/Guide/Settings) */}
          <div className="flex items-center gap-2 relative">
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
                    ref={moreRef}
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
                            onClick={() => {
                              setMoreDesktopOpen(false);
                              setShowAdd(!showAdd);
                            }}
                            className="w-full text-left px-3 py-2 rounded-md text-strong transition-colors duration-150 hover-nonaccent"
                          >
                            <span className="flex items-center gap-2">
                              {showAdd ? (
                                <MinusCircle className="w-4 h-4" />
                              ) : (
                                <PlusCircle className="w-4 h-4" />
                              )}
                              <span>{showAdd ? 'Hide add' : 'Show add'}</span>
                            </span>
                          </button>
                        </li>
                      )}
                      {/* Guide (moved closer to Inspiration) */}
                      {!isArchiveHidden && (
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              setMoreDesktopOpen(false);
                              setShowArchived(!showArchived);
                            }}
                            className="w-full text-left px-3 py-2 rounded-md text-strong transition-colors duration-150 hover-nonaccent"
                          >
                            <span className="flex items-center gap-2">
                              <Archive className="w-4 h-4" />
                              {showArchived ? 'Hide archived' : 'Show archived'}
                            </span>
                          </button>
                        </li>
                      )}
                      {isHome && (
                        <li className="hidden sm:block">
                          <button
                            type="button"
                            onClick={() => {
                              setMoreDesktopOpen(false);
                              setShowList(!showList);
                            }}
                            className="w-full text-left px-3 py-2 rounded-md text-strong transition-colors duration-150 hover-nonaccent"
                          >
                            <span className="flex items-center gap-2">
                              {showList ? (
                                <LayoutGrid className="w-4 h-4" />
                              ) : (
                                <LayoutList className="w-4 h-4" />
                              )}
                              {showList ? 'Show as grid' : 'Show as list'}
                            </span>
                          </button>
                        </li>
                      )}

                      {/* Separator line before Guide - only show if there are options above */}
                      {(isHome || !isArchiveHidden) && (
                        <li className="my-1 border-t border-subtle"></li>
                      )}

                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            setMoreDesktopOpen(false);
                            setSettingsOpen(true);
                          }}
                          className="w-full text-left px-3 py-2 rounded-md text-strong transition-colors duration-150 hover-nonaccent"
                        >
                          <span className="flex items-center gap-2">
                            <SettingsIcon className="w-4 h-4" />
                            Settings
                          </span>
                        </button>
                      </li>
                      <li>
                        <NavLink
                          to="/compass"
                          onClick={(e) => {
                            if (location.pathname === '/compass') e.preventDefault();
                            setMoreDesktopOpen(false);
                          }}
                          className={({ isActive }: { isActive: boolean }) =>
                            `block w-full text-left px-3 py-2 rounded-md transition-colors duration-150 ${isActive ? 'bg-accent text-inverse hover:bg-accent-soft' : 'text-strong hover-nonaccent'}`
                          }
                        >
                          <CompassIcon className="inline-block w-4 h-4 mr-2" />
                          Compass
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/inspiration"
                          onClick={(e) => {
                            if (location.pathname === '/inspiration') e.preventDefault();
                            setMoreDesktopOpen(false);
                          }}
                          className={({ isActive }: { isActive: boolean }) =>
                            `block w-full text-left px-3 py-2 rounded-md transition-colors duration-150 ${isActive ? 'bg-accent text-inverse hover:bg-accent-soft' : 'text-strong hover-nonaccent'}`
                          }
                        >
                          <Lightbulb className="inline-block w-4 h-4 mr-2" />
                          Inspiration
                        </NavLink>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            setMoreDesktopOpen(false);
                            setGuideOpen(true);
                          }}
                          className="w-full text-left px-3 py-2 rounded-md text-strong transition-colors duration-150 hover-nonaccent"
                        >
                          <span className="flex items-center gap-2">
                            <CircleHelp className="w-4 h-4" />
                            Guide
                          </span>
                        </button>
                      </li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <MobileTabBar />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onManageSync={() => {
          if (location.pathname !== '/sync') navigate('/sync');
        }}
        onShowGuide={() => {
          setGuideOpen(true);
          setSettingsOpen(false);
        }}
      />
      <GuideModal
        open={guideOpen}
        onClose={() => {
          setGuideOpen(false);
          try {
            safeSetItem(STORAGE_KEYS.SEEN_GUIDE, '1');
          } catch {}
        }}
      />
    </>
  );
}
