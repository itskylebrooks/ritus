import Compass from '@/features/compass';
import Home from '@/features/home';
import Insight from '@/features/insight';
import Inspiration from '@/features/inspiration';
import Milestones from '@/features/milestones';
import { createPageMotion } from '@/shared/animations';
import AppHeader from '@/shared/components/headers/AppHeader';
import type { TargetAndTransition, Transition } from 'framer-motion';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

// Define Page component outside of App to avoid recreating during render
const Page = ({
  children,
  initial,
  animate,
  transition,
}: {
  children: React.ReactNode;
  initial: TargetAndTransition | undefined;
  animate: TargetAndTransition | undefined;
  transition: Transition | undefined;
}) => (
  <motion.main className="w-full" initial={initial} animate={animate} transition={transition}>
    {children}
  </motion.main>
);

export default function App() {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const { initial, animate, transition } = createPageMotion(shouldReduceMotion);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 sm:pb-6">
      <AppHeader />

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
              path="/milestones"
              element={
                <Page initial={initial} animate={animate} transition={transition}>
                  <Milestones />
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
