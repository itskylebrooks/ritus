import { Trophy } from 'lucide-react'
import CollectiblesStoreCard from './components/CollectiblesStoreCard'
import MilestonesHeaderCard from './components/MilestonesHeaderCard'
import TrophiesBoard from './components/TrophiesBoard'
import { useEffect } from 'react'
import { useHabitStore } from '@/shared/store/store'
import fireConfetti from '@/shared/utils/confetti'

export default function Milestones() {
  const unlocked = useHabitStore((s) => s.progress.unlocked || {})
  const seen = useHabitStore((s) => s.progress.seenTrophies || {})
  const markSeen = useHabitStore((s) => s.markTrophiesSeen)

  useEffect(() => {
    // Determine any newly unlocked trophies that haven't been seen yet
    const newly = Object.keys(unlocked).filter((id) => unlocked[id] && !seen[id])
    if (newly.length > 0) {
      fireConfetti()
      markSeen(newly)
    }
  }, [unlocked, seen, markSeen])

  return (
    <div>
      <h2 className="text-xl font-semibold flex items-center gap-2"><Trophy className="w-5 h-5" /> Milestones</h2>
      <div className="mt-4">
        <MilestonesHeaderCard />
      </div>
      <div className="mt-6">
        <TrophiesBoard />
      </div>
      <div className="mt-6">
        <CollectiblesStoreCard />
      </div>
    </div>
  )
}
