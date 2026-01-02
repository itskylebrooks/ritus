import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { endOfMonth, format, startOfMonth, startOfWeek, subMonths, subWeeks } from 'date-fns';
import type { Habit } from '@/shared/types';
import { useHabitStore } from '@/shared/store/store';
import { fromISO } from '@/shared/utils/date';

// Progress accrual constants (mirror store toggle logic)
const ESSENCE_PER_COMPLETION = 5;
const WEEKLY_BONUS = 10;

type Mode = 'week' | 'month';

type PreparedHabit = {
  habit: Habit;
  weekCounts: Map<number, number>;
  monthCounts: Map<number, number>;
};

function computeWeeklySeries(habits: PreparedHabit[], weekStartsOn: 0 | 1, count: number = 12) {
  const now = new Date();
  const weeks: { start: Date; label: string; value: number }[] = [];
  // Build from oldest to newest
  for (let i = count - 1; i >= 0; i--) {
    const ref = subWeeks(now, i);
    const start = startOfWeek(ref, { weekStartsOn });
    const key = start.getTime();
    let total = 0;
    for (const { habit, weekCounts } of habits) {
      const compCount = weekCounts.get(key) ?? 0;
      total += compCount * ESSENCE_PER_COMPLETION;
      // weekly bonus applies for weekly-frequency habits when target met
      if (habit.frequency === 'weekly') {
        const target = habit.weeklyTarget ?? 1;
        if (compCount >= target) total += WEEKLY_BONUS;
      }
    }
    weeks.push({ start, label: format(start, 'MMM d'), value: total });
  }
  return weeks;
}

function computeMonthlySeries(habits: PreparedHabit[], count: number = 12) {
  const now = new Date();
  const months: { start: Date; label: string; value: number }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const ref = subMonths(now, i);
    const start = startOfMonth(ref);
    const end = endOfMonth(ref);
    const startMs = start.getTime();
    const endMs = end.getTime();
    let total = 0;
    for (const { habit, monthCounts, weekCounts } of habits) {
      const compCount = monthCounts.get(startMs) ?? 0;
      total += compCount * ESSENCE_PER_COMPLETION;
      if (habit.frequency === 'weekly') {
        const target = habit.weeklyTarget ?? 1;
        weekCounts.forEach((count, wkStart) => {
          if (wkStart >= startMs && wkStart <= endMs && count >= target) total += WEEKLY_BONUS;
        });
      }
    }
    months.push({ start, label: format(start, 'MMM'), value: total });
  }
  return months;
}

export default function HistoryChart() {
  const habits = useHabitStore((s) => s.habits);
  const weekStart = useHabitStore((s) => s.weekStart);
  const weekStartsOn: 0 | 1 = weekStart === 'sunday' ? 0 : 1;
  const [mode, setMode] = useState<Mode>('week');

  const preparedHabits = useMemo<PreparedHabit[]>(() => {
    return habits.map((h) => {
      const weekCounts = new Map<number, number>();
      const monthCounts = new Map<number, number>();
      for (const c of h.completions || []) {
        const d = fromISO(c);
        const wkKey = startOfWeek(d, { weekStartsOn }).getTime();
        const mKey = startOfMonth(d).getTime();
        weekCounts.set(wkKey, (weekCounts.get(wkKey) ?? 0) + 1);
        monthCounts.set(mKey, (monthCounts.get(mKey) ?? 0) + 1);
      }
      return { habit: h, weekCounts, monthCounts };
    });
  }, [habits, weekStartsOn]);

  const data = useMemo(() => {
    return mode === 'week'
      ? computeWeeklySeries(preparedHabits, weekStartsOn, 12)
      : computeMonthlySeries(preparedHabits, 12);
  }, [preparedHabits, weekStartsOn, mode]);

  const accent = 'var(--color-accent)';
  const grid = 'rgba(148, 163, 184, 0.25)';
  const axis = 'var(--color-text-tertiary)';
  // Y-axis ticks: only numbers divisible by 5
  const yMax = useMemo(() => Math.max(0, ...data.map((d) => d.value)), [data]);
  const yTop = useMemo(() => Math.max(5, Math.ceil(yMax / 5) * 5), [yMax]);
  const yTicks = useMemo(
    () => Array.from({ length: Math.floor(yTop / 5) + 1 }, (_, i) => i * 5),
    [yTop],
  );

  return (
    <div className="rounded-2xl border dark:border-neutral-700 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-neutral-600 dark:text-neutral-300 font-medium">
          Practice Arc
        </div>
        <div className="inline-flex rounded-lg border border-subtle overflow-hidden">
          <button
            onClick={() => setMode('week')}
            className={`px-2 py-1 text-xs ${mode === 'week' ? 'bg-accent text-inverse' : 'text-muted hover-nonaccent'}`}
          >
            Weekly
          </button>
          <button
            onClick={() => setMode('month')}
            className={`px-2 py-1 text-xs ${mode === 'month' ? 'bg-accent text-inverse' : 'text-muted hover-nonaccent'}`}
          >
            Monthly
          </button>
        </div>
      </div>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="histFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity={0.28} />
                <stop offset="100%" stopColor={accent} stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" />
            <XAxis dataKey="label" stroke={axis} tick={{ fontSize: 11 }} />
            <YAxis
              stroke={axis}
              tick={{ fontSize: 11 }}
              width={34}
              allowDecimals={false}
              domain={[0, yTop]}
              ticks={yTicks}
            />
            <Tooltip
              wrapperStyle={{ outline: 'none' }}
              contentStyle={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 8,
              }}
              labelFormatter={(l) => `${l}`}
              formatter={(v: any) => [`${v} progress`, mode === 'week' ? 'Week' : 'Month']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={accent}
              strokeWidth={2}
              fill="url(#histFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
