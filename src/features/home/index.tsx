import { emphasizeEase, transitions } from '@/shared/animations';
import LazyMount from '@/shared/components/layout/LazyMount';
import { useHabitStore } from '@/shared/store/store';
import type { Habit } from '@/shared/types';
import { daysThisWeek, iso } from '@/shared/utils/date';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import AddHabit from './components/AddHabit';
import HabitCard from './components/HabitCard';
import QuoteCard from './components/QuoteCard';

const nameCollator = new Intl.Collator(undefined, { sensitivity: 'base' });
const EMPTY_SET = new Set<string>();
const EMPTY_ARRAY: string[] = [];

function EmptyState({
  disableEntry = false,
  disableLayout = false,
}: {
  disableEntry?: boolean;
  disableLayout?: boolean;
}) {
  return (
    <motion.div
      layout={!disableLayout}
      key="empty"
      initial={disableEntry ? false : { opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ ...transitions.fadeLg, ease: emphasizeEase }}
      className="rounded-2xl border border-subtle p-10 text-center text-muted"
    >
      <p className="text-lg font-medium">No habits yet</p>
      <p className="mt-1 text-sm">Create your first habit to get started.</p>
    </motion.div>
  );
}

export default function Home({ pageTransitioning = false }: { pageTransitioning?: boolean }) {
  const showAdd = useHabitStore((s) => s.showAdd);

  const showList = useHabitStore((s) => s.showList);

  const habits = useHabitStore((s) => s.habits);
  const showArchived = useHabitStore((s) => s.showArchived);
  const weekStart = useHabitStore((s) => s.weekStart);

  // Disable initial layout/entry animations while the page transition is running
  // so cards and the Add form don't animate into place during page open.
  const initialListRender = pageTransitioning;
  const [hasInteracted, setHasInteracted] = useState(true);
  const disableEntryAnim = pageTransitioning;
  const [isTogglingAdd, setIsTogglingAdd] = useState(false);

  const prevShowAddRef = useRef<boolean>(showAdd);

  // Suppress layout animations for a brief moment after mount to allow
  // variable-height elements (like QuoteCard) to settle without triggering
  // a visible slide/jump (layout animation) of the content below.
  const [layoutReady, setLayoutReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLayoutReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  const disableLayoutAnim = pageTransitioning || !layoutReady;

  useEffect(() => {
    if (hasInteracted || typeof window === 'undefined') return;
    const onInteract = () => setHasInteracted(true);
    window.addEventListener('scroll', onInteract, { passive: true });
    window.addEventListener('pointerdown', onInteract);
    window.addEventListener('keydown', onInteract);
    window.addEventListener('touchstart', onInteract, { passive: true });
    return () => {
      window.removeEventListener('scroll', onInteract);
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
      window.removeEventListener('touchstart', onInteract);
    };
  }, [hasInteracted]);

  // Watch for showAdd toggles and briefly suppress layout animations so
  // the Add form appears/disappears instantly and cards don't animate.
  useEffect(() => {
    const prev = prevShowAddRef.current;
    if (prev !== showAdd) {
      setIsTogglingAdd(true);
      const timer = setTimeout(() => setIsTogglingAdd(false), 600);
      prevShowAddRef.current = showAdd;
      return () => clearTimeout(timer);
    }
    prevShowAddRef.current = showAdd;
  }, [showAdd]);

  const canAnimateLayout = !disableLayoutAnim;
  const weekKeys = useMemo(() => {
    const weekStartsOn = weekStart === 'sunday' ? 0 : 1;
    return daysThisWeek(new Date(), weekStartsOn).map((d) => iso(d).slice(0, 10));
  }, [weekStart]);
  const completionKeysById = useMemo(() => {
    const map = new Map<string, Set<string>>();

    for (const h of habits) {
      if (h.archived && !showArchived) continue;
      const completions = h.completions ?? EMPTY_ARRAY;
      const keys = new Set(completions.map((c) => (c.length > 10 ? c.slice(0, 10) : c)));
      map.set(h.id, keys);
    }

    return map;
  }, [habits, showArchived]);

  const groupedHabits = useMemo(() => {
    const todayShort = iso(new Date()).slice(0, 10);
    const byName = (a: Habit, b: Habit) => nameCollator.compare(a.name, b.name);

    const incompleteToday: Habit[] = [];
    const completedToday: Habit[] = [];
    const archived: Habit[] = [];

    for (const h of habits) {
      if (h.archived) {
        archived.push(h);
        continue;
      }
      const doneToday = completionKeysById.get(h.id)?.has(todayShort) ?? false;
      if (doneToday) completedToday.push(h);
      else incompleteToday.push(h);
    }

    return {
      incompleteToday: incompleteToday.sort(byName),
      completedToday: completedToday.sort(byName),
      archived: archived.sort(byName),
    };
  }, [completionKeysById, habits]);

  const isEmpty =
    groupedHabits.incompleteToday.length === 0 &&
    groupedHabits.completedToday.length === 0 &&
    (!showArchived || groupedHabits.archived.length === 0);

  return (
    <div>
      <div className="mt-4 space-y-4">
        <div className="w-full">
          <LazyMount
            enabled={false}
            className="w-full"
            minHeight={180}
            unmountOnExit={false}
            placeholder={
              <div className="h-full rounded-2xl border border-subtle bg-neutral-200 dark:bg-neutral-900/40" />
            }
          >
            <QuoteCard />
          </LazyMount>
        </div>

        <div>
          <AnimatePresence initial={false}>
            {showAdd && (
              <motion.div
                key="add-habit-wrapper"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{
                  opacity: { duration: 0.2 },
                  height: transitions.spring,
                  marginBottom: transitions.spring,
                }}
                className={`w-full ${showAdd ? 'overflow-visible' : 'overflow-hidden'}`}
              >
                <AddHabit disableInitialLayout={disableLayoutAnim} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Disable layout-based motion on initial mount so quote height changes don't animate cards into position */}
          <motion.main
            layout
            transition={canAnimateLayout ? undefined : { duration: 0 }}
            className={`grid gap-4 ${showList ? '' : 'sm:grid-cols-2'}`}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {groupedHabits.incompleteToday.length === 0 &&
              groupedHabits.completedToday.length === 0 &&
              (!showArchived || groupedHabits.archived.length === 0) ? (
                <EmptyState
                  key="empty"
                  disableEntry={initialListRender}
                  disableLayout={!canAnimateLayout}
                />
              ) : (
                groupedHabits.incompleteToday.map((h: Habit, i: number) => (
                  <motion.div
                    key={h.id}
                    layout
                    initial={false}
                    exit={{ opacity: 0 }}
                    transition={{
                      opacity: transitions.fadeXs,
                      layout: canAnimateLayout ? transitions.spring : { duration: 0 },
                    }}
                    className="relative z-20 bg-surface rounded-2xl text-strong"
                  >
                    <LazyMount
                      enabled={i > 5}
                      className="w-full"
                      minHeight={180}
                      unmountOnExit={false}
                      placeholder={
                        <div className="h-full rounded-2xl border border-subtle bg-neutral-200 dark:bg-neutral-900/40" />
                      }
                    >
                      <HabitCard
                        habit={h}
                        completionKeys={completionKeysById.get(h.id) ?? EMPTY_SET}
                        weekKeys={weekKeys}
                        disableEntryAnim={disableEntryAnim}
                      />
                    </LazyMount>
                  </motion.div>
                ))
              )}

              {!isEmpty && groupedHabits.completedToday.length > 0 && (
                <motion.div
                  key="divider-completed"
                  layout
                  initial={false}
                  exit={{ opacity: 0 }}
                  transition={{
                    ...transitions.fadeXs,
                    layout: canAnimateLayout ? transitions.spring : { duration: 0 },
                  }}
                  className="col-span-full relative z-0 py-2 text-xs font-semibold tracking-[0.6em] text-neutral-400 dark:text-neutral-500 text-center uppercase"
                >
                  COMPLETED
                </motion.div>
              )}

              {!isEmpty &&
                groupedHabits.completedToday.map((h: Habit, i: number) => (
                  <motion.div
                    key={h.id}
                    layout
                    initial={false}
                    exit={{ opacity: 0 }}
                    transition={{
                      opacity: transitions.fadeXs,
                      layout: canAnimateLayout ? transitions.spring : { duration: 0 },
                    }}
                    className="relative z-20 bg-surface rounded-2xl text-strong"
                  >
                    <LazyMount
                      enabled={groupedHabits.incompleteToday.length === 0 ? i > 5 : true}
                      className="w-full"
                      minHeight={180}
                      unmountOnExit={false}
                      placeholder={
                        <div className="h-full rounded-2xl border border-subtle bg-neutral-200 dark:bg-neutral-900/40" />
                      }
                    >
                      <HabitCard
                        habit={h}
                        completionKeys={completionKeysById.get(h.id) ?? EMPTY_SET}
                        weekKeys={weekKeys}
                        disableEntryAnim={disableEntryAnim}
                      />
                    </LazyMount>
                  </motion.div>
                ))}
            </AnimatePresence>
          </motion.main>

          {/* Archived habits are rendered outside the main grid so toggling them does not
            trigger layout/position changes for active cards. */}
          {showArchived && groupedHabits.archived.length > 0 && (
            <div className="mt-4 space-y-4">
              {(groupedHabits.incompleteToday.length > 0 ||
                groupedHabits.completedToday.length > 0) && (
                <motion.div
                  key="divider-archived"
                  layout
                  initial={false}
                  exit={{ opacity: 0 }}
                  transition={{
                    ...transitions.fadeXs,
                    layout: canAnimateLayout ? transitions.spring : { duration: 0 },
                  }}
                  className="relative z-0 py-2 text-xs font-semibold tracking-[0.6em] text-neutral-400 dark:text-neutral-500 text-center uppercase"
                >
                  ARCHIVED
                </motion.div>
              )}

              <div className="grid gap-4">
                <AnimatePresence initial={false}>
                  {groupedHabits.archived.map((h: Habit) => (
                    <motion.div
                      key={h.id}
                      layout
                      initial={false}
                      exit={{ opacity: 0 }}
                      transition={{
                        opacity: transitions.fadeXs,
                        layout: canAnimateLayout ? transitions.spring : { duration: 0 },
                      }}
                      className="relative z-20 bg-surface rounded-2xl text-strong"
                    >
                      <LazyMount
                        enabled={true}
                        className="w-full"
                        minHeight={180}
                        unmountOnExit={false}
                        placeholder={
                          <div className="h-full rounded-2xl border border-subtle bg-neutral-200 dark:bg-neutral-900/40" />
                        }
                      >
                        <HabitCard
                          habit={h}
                          completionKeys={completionKeysById.get(h.id) ?? EMPTY_SET}
                          weekKeys={weekKeys}
                          disableEntryAnim={disableEntryAnim}
                        />
                      </LazyMount>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
