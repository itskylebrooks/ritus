import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Insight from './pages/Insight'
import Milestones from './pages/Milestones'
import Inspiration from './pages/Inspiration'
import AppHeader from './components/headers/AppHeader'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

export default function App() {
  const location = useLocation()
  const shouldReduceMotion = useReducedMotion()

  const Page = ({ children }: { children: React.ReactNode }) => (
    <motion.main
      className="w-full"
      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 8 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
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
