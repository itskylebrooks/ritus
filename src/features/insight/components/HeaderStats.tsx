import ProgressBar from '@/shared/components/charts/ProgressBar';
import { useHabitStore } from '@/shared/store/store';
import { Calendar, ChartNoAxesColumnIncreasing, Info } from 'lucide-react';
import { useMemo } from 'react';

export default function HeaderStats({ weeklyPct }: { weeklyPct: number }) {
  // use cumulative totals from the store so they persist across deletions
  const totalCompletions = useHabitStore((s) => s.totalCompletions ?? 0);
  const habits = useHabitStore((s) => s.habits);
  const monthCompletions = useMemo(() => {
    const now = new Date();
    const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    let count = 0;
    for (const habit of habits) {
      if (habit.archived || !habit.completions) continue;
      for (const completion of habit.completions) {
        if (completion.startsWith(monthKey)) count += 1;
      }
    }
    return count;
  }, [habits]);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-subtle p-4 shadow-sm">
        <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-300">
          <span>Total Done</span>
          <ChartNoAxesColumnIncreasing className="h-4 w-4" />
        </div>
        <div className="mt-1 text-2xl font-semibold">{totalCompletions}</div>
      </div>
      <div className="rounded-2xl border border-subtle p-4 shadow-sm">
        <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-300">
          <span>This Month</span>
          <Calendar className="h-4 w-4" />
        </div>
        <div className="mt-1 text-2xl font-semibold">{monthCompletions}</div>
      </div>
      <div className="col-span-2 rounded-2xl border border-subtle p-4 shadow-sm sm:col-span-1">
        <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-300">
          <span>This Week</span>
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
