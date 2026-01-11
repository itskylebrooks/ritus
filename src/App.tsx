import Compass from '@/features/compass';
import Home from '@/features/home';
import Insight from '@/features/insight';
import Inspiration from '@/features/inspiration';
import Profile from '@/features/profile';
import { createPageMotion } from '@/shared/animations';
import AppHeader from '@/shared/components/headers/AppHeader';
import BackupSuggestion from '@/shared/components/modals/BackupSuggestion';
import { useHabitStore } from '@/shared/store/store';
import type { TargetAndTransition, Transition } from 'framer-motion';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import MistOverlay from '@/shared/components/layout/MistOverlay';
import useIsSafari from '@/shared/hooks/useIsSafari';

// Define Page component outside of App to avoid recreating during render
type PageChildProps = { pageTransitioning?: boolean };
const Page = ({
  children,
  initial,
  animate,
  transition,
  overlay,
}: {
  children: React.ReactElement<PageChildProps>;
  initial?: TargetAndTransition;
  animate?: TargetAndTransition;
  transition?: Transition;
  overlay?: React.ReactNode;
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const child = React.isValidElement(children)
    ? React.cloneElement(children, { pageTransitioning: isAnimating })
    : children;

  return (
    <motion.main
      className="w-full relative overflow-hidden"
      initial={initial}
      animate={animate}
      transition={transition}
      onAnimationStart={() => setIsAnimating(true)}
      onAnimationComplete={() => setIsAnimating(false)}
    >
      {child}
      {overlay}
    </motion.main>
  );
};

export default function App() {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const appliedCollectibles = useHabitStore((s) => s.progress.appliedCollectibles || {});
  const mistFade = (appliedCollectibles['animation'] || '').includes('anim_mist_fade');

  const baseMotion = createPageMotion(shouldReduceMotion);
  let initial: TargetAndTransition | undefined = baseMotion.initial;
  let animate: TargetAndTransition | undefined = baseMotion.animate;
  let transition: Transition | undefined = baseMotion.transition;

  const isSafari = useIsSafari();
  const safariMist = mistFade && !shouldReduceMotion && isSafari;

  if (mistFade && !shouldReduceMotion) {
    if (safariMist) {
      // Safari: avoid animating `filter` (heavy). Use a simple opacity + y motion
      // and a lightweight overlay that fades out. This dramatically reduces jank on macOS Safari.
      initial = { opacity: 0, y: 8 };
      animate = { opacity: 1, y: 0 };
      transition = { duration: 0.48, ease: 'easeInOut' };
    } else {
      // Non-Safari: preserve the mist blur effect
      initial = { opacity: 0, filter: 'blur(4px)' };
      animate = { opacity: 1, filter: 'blur(0px)' };
      transition = { duration: 0.5, ease: 'easeInOut' };
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 sm:pb-6">
      <AppHeader />

      <BackupSuggestion />

      <main>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <Page initial={initial} animate={animate} transition={transition}>
                  <Home />
                </Page>
              }
            />
            <Route
              path="/insight"
              element={
                <Page initial={initial} animate={animate} transition={transition}>
                  <Insight />
                </Page>
              }
            />
            <Route
              path="/profile"
              element={
                <Page
                  initial={initial}
                  animate={animate}
                  transition={transition}
                  overlay={safariMist ? <MistOverlay /> : undefined}
                >
                  <Profile />
                </Page>
              }
            />
            <Route
              path="/inspiration"
              element={
                <Page initial={initial} animate={animate} transition={transition}>
                  <Inspiration />
                </Page>
              }
            />
            <Route
              path="/compass"
              element={
                <Page initial={initial} animate={animate} transition={transition}>
                  <Compass />
                </Page>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}
