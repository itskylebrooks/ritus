import { Routes, Route, useLocation } from 'react-router-dom'
import Home from '@/features/home'
import Insight from '@/features/insight'
import Milestones from '@/features/milestones'
import Inspiration from '@/features/inspiration'
import AppHeader from '@/shared/components/headers/AppHeader'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { createPageMotion } from '@/shared/animations'

export default function App() {
  const location = useLocation()
  const shouldReduceMotion = useReducedMotion()

  const { initial, animate, transition } = createPageMotion(shouldReduceMotion)

  const Page = ({ children }: { children: React.ReactNode }) => (
    <motion.main className="w-full" initial={initial} animate={animate} transition={transition}>
      {children}
    </motion.main>
  )

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <AppHeader />

      <main>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Page><Home /></Page>} />
            <Route path="/insight" element={<Page><Insight /></Page>} />
            <Route path="/milestones" element={<Page><Milestones /></Page>} />
            <Route path="/inspiration" element={<Page><Inspiration /></Page>} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  )
}
