import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Insight from './pages/Insight'
import Milestones from './pages/Milestones'
import AppHeader from './components/AppHeader'

export default function App() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <AppHeader />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/insight" element={<Insight />} />
          <Route path="/milestones" element={<Milestones />} />
        </Routes>
      </main>
    </div>
  )
}
