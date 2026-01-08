import ProgressBar from '@/shared/components/charts/ProgressBar';
import { useHabitStore } from '@/shared/store/store';
import { ChartNoAxesColumnIncreasing, Flame, Info } from 'lucide-react';

export default function HeaderStats({ weeklyPct }: { weeklyPct: number }) {
  // use cumulative totals from the store so they persist across deletions
  const longestStreak = useHabitStore((s) => s.longestStreak);
  const totalCompletions = useHabitStore((s) => s.totalCompletions ?? 0);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border dark:border-neutral-700 p-4 shadow-sm">
        <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-300">
          <span>Total completions</span>
          <ChartNoAxesColumnIncreasing className="h-4 w-4" />
        </div>
        <div className="mt-1 text-2xl font-semibold">{totalCompletions}</div>
      </div>
      <div className="rounded-2xl border dark:border-neutral-700 p-4 shadow-sm">
        <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-300">
          <span>Longest streak</span>
          <Flame className="h-4 w-4" />
        </div>
        <div className="mt-1 text-2xl font-semibold">{longestStreak}d</div>
      </div>
      <div className="col-span-2 rounded-2xl border border-subtle p-4 shadow-sm sm:col-span-1">
        <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-300">
          <span>Weekly completion</span>
          <Info className="h-4 w-4" />
        </div>
        <div className="mt-2">
          <ProgressBar value={weeklyPct} max={100} />
          <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{weeklyPct}%</div>
        </div>
      </div>
    </div>
  );
}
