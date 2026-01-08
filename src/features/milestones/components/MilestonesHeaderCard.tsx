import { useHabitStore } from '@/shared/store/store';
import { Coins } from 'lucide-react';

export default function MilestonesHeaderCard() {
  const points = useHabitStore((s) => s.progress.points || 0);

  return (
    <div className="rounded-2xl border border-subtle p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
        <Coins className="h-4 w-4" />
        <span>Points</span>
      </div>
      <div className="mt-2 text-3xl font-semibold">{points.toLocaleString()}</div>
    </div>
  );
}
