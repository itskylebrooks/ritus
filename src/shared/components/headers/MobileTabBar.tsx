import { useMotionPreferences } from '@/shared/animations';
import { useSmartSticky } from '@/shared/hooks/useSmartSticky';
import { LayoutGroup, motion, type Transition } from 'framer-motion';
import { ChartPie, Home, Trophy } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const tabs = [
  { id: 'insight', to: '/insight', label: 'Insight', icon: ChartPie, end: false },
  { id: 'home', to: '/', label: 'Home', icon: Home, end: true },
  { id: 'profile', to: '/profile', label: 'Profile', icon: Trophy, end: false },
] as const;

// Fixed dimensions for the floating dock
const COMPACT = { width: 56, gap: 6, paddingX: 6, paddingY: 6, height: 44 };
const EXPANDED = { width: 80, gap: 8, paddingX: 8, paddingY: 8, height: 56 };

export default function MobileTabBar() {
  const location = useLocation();
  const { prefersReducedMotion } = useMotionPreferences();
  const { isVisible, isMobile } = useSmartSticky(location.pathname);
  const isCompact = isMobile && !isVisible;
  const dims = isCompact ? COMPACT : EXPANDED;

  // Spring transitions - all use the same spring for synchronized movement
  const springExpand: Transition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring', damping: 22, stiffness: 280, mass: 0.8 };

  const springLabel: Transition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring', damping: 18, stiffness: 240, mass: 0.6 };

  return (
    <div
      className="fixed left-1/2 z-30 -translate-x-1/2 w-max pb-[env(safe-area-inset-bottom)] md:hidden select-none"
      style={{ bottom: '1rem' }}
    >
      <motion.nav
        className="w-max"
        initial={false}
        animate={{ y: isCompact ? 4 : -4 }}
        transition={springExpand}
        aria-label="Primary navigation"
      >
        <LayoutGroup id="mobile-tab-bar">
          <motion.div
            className="relative inline-flex items-center rounded-full border border-subtle bg-surface-elevated shadow-elevated mobile-tab-bar"
            initial={false}
            animate={{
              gap: dims.gap,
              paddingLeft: dims.paddingX,
              paddingRight: dims.paddingX,
              paddingTop: dims.paddingY,
              paddingBottom: dims.paddingY,
            }}
            transition={springExpand}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <NavLink
                  key={tab.id}
                  to={tab.to}
                  end={tab.end}
                  aria-label={tab.label}
                  title={tab.label}
                  onClick={(e) => {
                    if (location.pathname === tab.to) e.preventDefault();
                  }}
                  className="relative z-10 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-text-primary)]"
                >
                  {({ isActive }) => (
                    <motion.div
                      className="relative flex flex-col items-center justify-center rounded-full font-medium leading-tight text-center"
                      initial={false}
                      animate={{
                        height: dims.height,
                        width: dims.width,
                        paddingTop: isCompact ? 4 : 6,
                        paddingBottom: isCompact ? 4 : 6,
                        paddingLeft: 8,
                        paddingRight: 8,
                      }}
                      transition={springExpand}
                    >
                      {isActive && (
                        <motion.span
                          className="absolute inset-0 rounded-full bg-[var(--color-accent)]"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={springExpand}
                        />
                      )}
                      <motion.span
                        className={`relative z-10 flex flex-col items-center justify-center ${
                          isActive ? 'text-inverse' : 'text-strong'
                        }`}
                      >
                        <motion.span
                          className="flex items-center justify-center shrink-0"
                          initial={false}
                          animate={{
                            scale: isCompact ? 1.05 : 1,
                          }}
                          transition={springExpand}
                        >
                          <Icon className="h-5 w-5" aria-hidden />
                        </motion.span>
                        <motion.span
                          aria-hidden
                          className="block overflow-hidden text-center whitespace-nowrap"
                          initial={false}
                          animate={{
                            opacity: isCompact ? 0 : 1,
                            height: isCompact ? 0 : 14,
                            marginTop: isCompact ? 0 : 4,
                            scaleY: isCompact ? 0.5 : 1,
                          }}
                          transition={springLabel}
                          style={{
                            fontSize: '11px',
                            transformOrigin: 'top center',
                          }}
                        >
                          {tab.label}
                        </motion.span>
                      </motion.span>
                    </motion.div>
                  )}
                </NavLink>
              );
            })}
          </motion.div>
        </LayoutGroup>
      </motion.nav>
    </div>
  );
}
