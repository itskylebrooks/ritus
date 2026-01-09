import { NavLink, useLocation } from 'react-router-dom';
import { ChartPie, Home, Trophy } from 'lucide-react';
import { LayoutGroup, motion, type Transition } from 'framer-motion';
import { useMotionPreferences } from '@/shared/animations';
import { useSmartSticky } from '@/shared/hooks/useSmartSticky';

export default function MobileTabBar() {
  const location = useLocation();
  const { prefersReducedMotion } = useMotionPreferences();
  const { isVisible, isMobile } = useSmartSticky();
  const isCompact = isMobile && !isVisible;

  const springLayout: Transition = { type: 'spring', damping: 14, stiffness: 230, mass: 0.7 };
  const springLabel: Transition = { type: 'spring', damping: 16, stiffness: 210, mass: 0.6 };
  const springPill: Transition = { type: 'spring', damping: 12, stiffness: 320, mass: 0.6 };

  const layoutTransition: Transition = prefersReducedMotion ? { duration: 0 } : springLayout;
  const labelTransition: Transition = prefersReducedMotion ? { duration: 0 } : springLabel;
  const pillTransition: Transition = prefersReducedMotion ? { duration: 0 } : springPill;

  return (
    <motion.nav
      className="fixed left-0 right-0 z-30 flex justify-center px-4 pb-[env(safe-area-inset-bottom)] md:hidden select-none"
      animate={{ bottom: isCompact ? '0.75rem' : '1.25rem' }}
      initial={false}
      transition={layoutTransition}
      aria-label="Primary navigation"
    >
      <LayoutGroup>
        <motion.div
          layout
          className={`flex items-center rounded-full border border-subtle bg-surface-elevated shadow-elevated ${
            isCompact ? 'gap-1.5 px-2 py-1' : 'gap-2 px-2 py-2'
          }`}
          transition={layoutTransition}
        >
          {[
            {
              id: 'insight',
              to: '/insight',
              label: 'Insight',
              icon: <ChartPie className="h-5 w-5" aria-hidden />,
            },
            {
              id: 'home',
              to: '/',
              label: 'Home',
              icon: <Home className="h-5 w-5" aria-hidden />,
              end: true,
            },
            {
              id: 'milestones',
              to: '/milestones',
              label: 'Milestones',
              icon: <Trophy className="h-5 w-5" aria-hidden />,
            },
          ].map((tab) => (
            <NavLink
              key={tab.id}
              to={tab.to}
              end={tab.end}
              aria-label={tab.label}
              title={tab.label}
              onClick={(e) => {
                if (location.pathname === tab.to) e.preventDefault();
              }}
              className="relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-text-primary)]"
            >
              {({ isActive }) => (
                <motion.div
                  layout
                  className={`relative flex flex-col items-center justify-center rounded-full px-2 font-medium leading-tight text-center ${
                    isCompact
                      ? 'h-11 w-14 gap-0.5 py-1 text-[10px]'
                      : 'h-14 w-20 gap-1 py-1.5 text-[11px]'
                  }`}
                  style={{ transform: 'translate3d(0, 0, 0)', willChange: 'transform' }}
                  transition={layoutTransition}
                >
                  {isActive && (
                    <motion.span
                      layoutId="mobile-tab-pill"
                      className="absolute inset-0 rounded-full bg-[var(--color-accent)]"
                      transition={pillTransition}
                    />
                  )}
                  <motion.span
                    layout="position"
                    className={`relative z-10 flex h-full flex-col items-center justify-center transition-colors ${
                      isCompact ? 'gap-0' : 'gap-1'
                    } ${isActive ? 'text-[var(--color-accent-contrast)]' : 'text-strong'}`}
                    transition={layoutTransition}
                  >
                    <motion.span
                      layout="position"
                      className="flex h-5 w-5 items-center justify-center"
                      style={{
                        transform: 'translate3d(0, 0, 0)',
                        backfaceVisibility: 'hidden',
                        willChange: 'transform',
                      }}
                      transition={layoutTransition}
                    >
                      {tab.icon}
                    </motion.span>
                    <motion.span
                      aria-hidden
                      className="block overflow-hidden"
                      initial={false}
                      animate={{
                        opacity: isCompact ? 0 : 1,
                        height: isCompact ? 0 : 14,
                        marginTop: isCompact ? 0 : 2,
                        scaleY: isCompact ? 0.6 : 1,
                      }}
                      transition={labelTransition}
                      style={{ transformOrigin: 'top' }}
                    >
                      {tab.label}
                    </motion.span>
                  </motion.span>
                </motion.div>
              )}
            </NavLink>
          ))}
        </motion.div>
      </LayoutGroup>
    </motion.nav>
  );
}
