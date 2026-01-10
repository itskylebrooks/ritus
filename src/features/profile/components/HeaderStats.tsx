import { useHabitStore } from '@/shared/store/store';
import { Calendar, Coins, Heart } from 'lucide-react';

export default function HeaderStats() {
  const availablePoints = useHabitStore((s) => s.progress.points || 0);
  const daysWithRitus = useHabitStore((s) => s.daysWithRitus || 0);
  const totalPoints = useHabitStore((s) => s.totalPoints || 0);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-subtle p-4 shadow-sm">
        <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-300">
          <span>Total Points</span>
          <Heart className="h-4 w-4" />
        </div>
        <div className="mt-1 text-2xl font-semibold">{totalPoints.toLocaleString()}</div>
      </div>
      <div className="rounded-2xl border border-subtle p-4 shadow-sm">
        <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-300">
          <span>Available Points</span>
          <Coins className="h-4 w-4" />
        </div>
        <div className="mt-1 text-2xl font-semibold">{availablePoints.toLocaleString()}</div>
      </div>
      <div className="col-span-2 rounded-2xl border border-subtle p-4 shadow-sm sm:col-span-1">
        <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-300">
          <span>Days with Ritus</span>
          <Calendar className="h-4 w-4" />
        </div>
        <div className="mt-1 text-2xl font-semibold">{daysWithRitus}</div>
      </div>
    </div>
  );
}
