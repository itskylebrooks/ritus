import { Trophy } from 'lucide-react'
import MilestonesHeaderCard from '../components/MilestonesHeaderCard'

export default function Milestones() {
  return (
    <div>
      <h2 className="text-xl font-semibold flex items-center gap-2"><Trophy className="w-5 h-5" /> Milestones</h2>
      <div className="mt-4">
        <MilestonesHeaderCard />
      </div>
    </div>
  )
}
