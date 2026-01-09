import { TROPHIES } from '@/shared/constants/trophies';
import { useHabitStore } from '@/shared/store/store';
import { Calendar, Coins, Trophy } from 'lucide-react';
import { useMemo } from 'react';

export default function HeaderStats() {
  const availablePoints = useHabitStore((s) => s.progress.points || 0);
  const daysWithRitus = useHabitStore((s) => s.daysWithRitus || 0);
  const lastTrophyId = useHabitStore((s) => s.progress.lastUnlockedTrophyId);
  const lastTrophy = useMemo(
    () => (lastTrophyId ? TROPHIES.find((t) => t.id === lastTrophyId) : undefined),
    [lastTrophyId],
  );

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border dark:border-neutral-700 p-4 shadow-sm">
        <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-300">
          <span>Available Points</span>
          <Coins className="h-4 w-4" />
        </div>
        <div className="mt-1 text-2xl font-semibold">{availablePoints.toLocaleString()}</div>
      </div>
      <div className="rounded-2xl border dark:border-neutral-700 p-4 shadow-sm">
        <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-300">
          <span>Days with Ritus</span>
          <Calendar className="h-4 w-4" />
        </div>
        <div className="mt-1 text-2xl font-semibold">{daysWithRitus}</div>
      </div>
      <div className="col-span-2 rounded-2xl border border-subtle p-4 shadow-sm sm:col-span-1">
        <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-300">
          <span>Last Trophy</span>
          <Trophy className="h-4 w-4" />
        </div>
        {lastTrophy ? (
          <div className="mt-1 sm:h-7 sm:flex sm:items-end">
            <span className="text-lg font-semibold leading-none sm:hidden">
              {lastTrophy.label}
              {lastTrophy.reason ? (
                <>
                  : <span className="text-sm font-medium">{lastTrophy.reason}</span>
                </>
              ) : null}
            </span>
            <span className="hidden text-xl font-semibold leading-none sm:inline">
              {lastTrophy.label}
            </span>
          </div>
        ) : (
          <div className="mt-1 sm:h-7 sm:flex sm:items-end text-neutral-400 dark:text-neutral-500">
            <span className="text-lg font-semibold leading-none">—</span>
          </div>
        )}
      </div>
    </div>
  );
}
