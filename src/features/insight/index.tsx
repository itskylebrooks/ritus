import Badge from '@/shared/components/cards/Badge';
import LazyMount from '@/shared/components/layout/LazyMount';
import { useIdleReady } from '@/shared/hooks/useIdleReady';
import { useIsMobile } from '@/shared/hooks/useIsMobile';
import { useHabitStore } from '@/shared/store/store';
import type { Habit } from '@/shared/types';
import { daysThisWeek, iso } from '@/shared/utils/date';
import { addYears, isAfter } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import EmojiHistoryCard from './components/EmojiHistoryCard';
import HeaderStats from './components/HeaderStats';
import MonthGrid from './components/MonthGrid';

const habitNameCollator = new Intl.Collator(undefined, { sensitivity: 'base' });
const EMPTY_SET = new Set<string>();

function EmptyState() {
  return (
    <div className="rounded-2xl border border-subtle p-10 text-center text-muted">
      <p className="text-lg font-medium">No habits to show</p>
      <p className="mt-1 text-sm">Add some habits on the Home page.</p>
    </div>
  );
}

export default function Insight() {
  const habits = useHabitStore((s) => s.habits);
  const showArchived = useHabitStore((s) => s.showArchived);
  const weekStart = useHabitStore((s) => s.weekStart);
  const isMobile = useIsMobile();

  // local month state per habit keyed by habit id
  const [months, setMonths] = useState<Record<string, Date>>({});
  const calcReady = useIdleReady({ resetOnMount: true });

  const weekKeys = useMemo(() => {
    const weekStartsOn = weekStart === 'sunday' ? 0 : 1;
    return daysThisWeek(new Date(), weekStartsOn).map((d) => iso(d).slice(0, 10));
  }, [weekStart]);

  const summary = useMemo(() => {
    if (!calcReady) {
      return { completionKeysById: new Map<string, Set<string>>(), weeklyPct: 0 };
    }
    const weekKeySet = new Set(weekKeys);
    const completionKeysById = new Map<string, Set<string>>();
    let achievedGoalsCount = 0;
    let totalGoalsCount = 0;

    for (const h of habits) {
      // Skip archived habits - only count active habits
      if (h.archived && !showArchived) continue;

      const keys = new Set<string>();
      let weekCount = 0;
      for (const c of h.completions || []) {
        const key = c.length > 10 ? c.slice(0, 10) : c;
        if (keys.has(key)) continue;
        keys.add(key);
        if (weekKeySet.has(key)) weekCount += 1;
      }
      completionKeysById.set(h.id, keys);

      // Calculate if this habit's weekly goal is achieved
      // Each habit contributes a single binary goal state for the week
      if (h.frequency === 'daily') {
        // Daily habit: achieved if completed all 7 days this week
        const target = 7;
        if (weekCount >= target) achievedGoalsCount += 1;
        totalGoalsCount += 1;
      } else if (h.frequency === 'weekly') {
        // Weekly habit: achieved if met the weekly target
        const target = h.weeklyTarget ?? 1;
        if (weekCount >= target) achievedGoalsCount += 1;
        totalGoalsCount += 1;
      }
      // Monthly habits are excluded from "This Week" calculation
    }

    const weeklyPct =
      totalGoalsCount === 0 ? 0 : Math.round((achievedGoalsCount / totalGoalsCount) * 100);
    return { completionKeysById, weeklyPct };
  }, [calcReady, habits, weekKeys, showArchived]);

  function monthFor(h: Habit) {
    return months[h.id] ?? new Date();
  }

  function shiftYear(h: Habit, delta: number) {
    setMonths((m) => {
      const cur = monthFor(h);
      // normalize to Jan 1 of current selected year so shifting changes year only
      const base = new Date(cur.getFullYear(), 0, 1);
      const candidate = addYears(base, delta);
      const nowYearStart = new Date(new Date().getFullYear(), 0, 1);
      // never allow navigating into the future beyond the current year
      const next = isAfter(candidate, nowYearStart) ? nowYearStart : candidate;
      return { ...m, [h.id]: next };
    });
  }

  const { activeHabits, archivedHabits } = useMemo(() => {
    if (!calcReady) return { activeHabits: [], archivedHabits: [] };
    const active: Habit[] = [];
    const archived: Habit[] = [];
    for (const h of habits) {
      if (h.archived) archived.push(h);
      else active.push(h);
    }
    const byName = (a: Habit, b: Habit) => habitNameCollator.compare(a.name, b.name);
    return { activeHabits: active.sort(byName), archivedHabits: archived.sort(byName) };
  }, [calcReady, habits]);

  const renderHabitCard = (h: Habit) => {
    const completionKeys = calcReady
      ? (summary.completionKeysById.get(h.id) ?? EMPTY_SET)
      : undefined;
    return (
      <LazyMount
        key={h.id}
        enabled={isMobile}
        className="w-full"
        minHeight={210}
        unmountOnExit={false}
        placeholder={
          <div className="h-full rounded-2xl border border-subtle bg-neutral-200 dark:bg-neutral-900/40" />
        }
      >
        <div className="rounded-2xl border border-subtle p-4 shadow-sm w-full">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="text-lg font-semibold truncate after:content-[''] after:inline-block after:w-2">
                {h.name}
              </h3>
              <span className="inline-flex items-center align-text-bottom gap-2">
                <Badge>
                  {h.frequency === 'daily'
                    ? 'D'
                    : h.frequency === 'weekly'
                      ? `W${h.weeklyTarget ?? 1}`
                      : h.frequency === 'monthly'
                        ? `M${h.monthlyTarget ?? 1}`
                        : String(h.frequency).charAt(0).toUpperCase()}
                </Badge>
                {h.archived && <Badge>A</Badge>}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
              <button
                onClick={() => shiftYear(h, -1)}
                className="rounded-xl p-1 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                aria-label="Previous year"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="tabular-nums">
                {new Intl.DateTimeFormat('en', { year: 'numeric' }).format(monthFor(h))}
              </div>
              {/* Disable next arrow when we're at or beyond the current year */}
              <button
                onClick={() => shiftYear(h, 1)}
                disabled={monthFor(h).getFullYear() >= new Date().getFullYear()}
                className="rounded-xl p-1 hover:bg-neutral-100 dark:hover:bg-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next year"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* determine if this card is in its default (initial) view */}
          {(() => {
            const isDefault = !months[h.id];
            // allow horizontal scrolling for all years so user can pan previous years
            return calcReady ? (
              <div className="fade-in-soft">
                <MonthGrid
                  habit={h}
                  month={monthFor(h)}
                  allowScroll={true}
                  alignToNow={isDefault}
                  completionKeys={completionKeys}
                />
              </div>
            ) : (
              <div className="mt-3 h-[140px] rounded-xl bg-neutral-200 dark:bg-neutral-900/40" />
            );
          })()}
        </div>
      </LazyMount>
    );
  };

  return (
    <div>
      <div className="mt-4">
        <HeaderStats weeklyPct={summary.weeklyPct} />
      </div>

      <div className="mt-4">
        <EmojiHistoryCard ready={calcReady} />
      </div>

      <div className="mt-4 space-y-4">
        {calcReady ? (
          <>
            {activeHabits.length === 0 && (!showArchived || archivedHabits.length === 0) && (
              <EmptyState />
            )}

            {activeHabits.map(renderHabitCard)}

            {showArchived && archivedHabits.length > 0 && (
              <>
                {activeHabits.length > 0 && (
                  <div className="text-xs font-semibold tracking-[0.6em] text-neutral-400 dark:text-neutral-500 text-center uppercase">
                    ARCHIVED
                  </div>
                )}
                {archivedHabits.map(renderHabitCard)}
              </>
            )}
          </>
        ) : (
          <>
            <div className="h-[140px] rounded-2xl border border-subtle bg-neutral-200 dark:bg-neutral-900/40" />
            <div className="h-[140px] rounded-2xl border border-subtle bg-neutral-200 dark:bg-neutral-900/40" />
            <div className="h-[140px] rounded-2xl border border-subtle bg-neutral-200 dark:bg-neutral-900/40" />
          </>
        )}
      </div>
    </div>
  );
}
