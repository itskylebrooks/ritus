import { emphasizeEase, transitions } from '@/shared/animations';
import LazyMount from '@/shared/components/layout/LazyMount';
import { useHabitStore } from '@/shared/store/store';
import { daysThisWeek, iso } from '@/shared/utils/date';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import AddHabit from './components/AddHabit';
import HabitCard from './components/HabitCard';
import QuoteCard from './components/QuoteCard';

const nameCollator = new Intl.Collator(undefined, { sensitivity: 'base' });
const EMPTY_SET = new Set<string>();
const EMPTY_ARRAY: string[] = [];

function EmptyState({ disableAnim = false }: { disableAnim?: boolean }) {
  return (
    <motion.div
      layout={!disableAnim}
      key="empty"
      initial={disableAnim ? false : { opacity: 0, y: 8, scale: 0.98 }}
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
  const [, setSuppressAddToggleAnim] = useState(false);
  const prevShowAddRef = useRef<boolean>(showAdd);

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
      const start = window.setTimeout(() => setSuppressAddToggleAnim(true), 0);
      const end = window.setTimeout(() => setSuppressAddToggleAnim(false), 320);
      prevShowAddRef.current = showAdd;
      return () => {
        clearTimeout(start);
        clearTimeout(end);
      };
    }
    prevShowAddRef.current = showAdd;
  }, [showAdd]);
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
    const byName = (a: (typeof habits)[number], b: (typeof habits)[number]) =>
      nameCollator.compare(a.name, b.name);

    const incompleteToday: (typeof habits)[number][] = [];
    const completedToday: (typeof habits)[number][] = [];
    const archived: (typeof habits)[number][] = [];

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

  return (
    <div>
      <div className="mt-4 space-y-4">
        <div className="w-full">
          <LazyMount
            enabled={true}
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

        <div className="space-y-4">
          {showAdd && (
            <div>
              <LazyMount
                enabled={true}
                className="w-full"
                minHeight={200}
                unmountOnExit={false}
                placeholder={
                  <div className="h-full rounded-2xl border border-subtle bg-neutral-200 dark:bg-neutral-900/40" />
                }
              >
                <AddHabit disableInitialLayout={initialListRender} />
              </LazyMount>
            </div>
          )}

          {/* Disable layout-based motion on initial mount so quote height changes don't animate cards into position */}
          <motion.main
            layout={!initialListRender}
            className={`grid gap-4 ${showList ? '' : 'sm:grid-cols-2'}`}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {groupedHabits.incompleteToday.length === 0 &&
              groupedHabits.completedToday.length === 0 &&
              (!showArchived || groupedHabits.archived.length === 0) ? (
                <EmptyState disableAnim={initialListRender} />
              ) : (
                <>
                  {groupedHabits.incompleteToday.map((h) => (
                    <motion.div
                      key={h.id}
                      layout={!initialListRender}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={transitions.fadeXl}
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

                  {groupedHabits.completedToday.length > 0 &&
                    groupedHabits.incompleteToday.length > 0 && (
                      <motion.div
                        key="divider-completed"
                        layout={!initialListRender}
                        className="col-span-full text-xs font-semibold tracking-[0.6em] text-neutral-400 dark:text-neutral-500 text-center uppercase"
                      >
                        COMPLETED
                      </motion.div>
                    )}

                  {groupedHabits.completedToday.map((h) => (
                    <motion.div
                      key={h.id}
                      layout={!initialListRender}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={transitions.fadeXl}
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

                  {showArchived && groupedHabits.archived.length > 0 && (
                    <>
                      {(groupedHabits.incompleteToday.length > 0 ||
                        groupedHabits.completedToday.length > 0) && (
                        <motion.div
                          key="divider-archived"
                          layout={!initialListRender}
                          className="col-span-full text-xs font-semibold tracking-[0.6em] text-neutral-400 dark:text-neutral-500 text-center uppercase"
                        >
                          ARCHIVED
                        </motion.div>
                      )}

                      {groupedHabits.archived.map((h) => (
                        <motion.div
                          key={h.id}
                          layout={!initialListRender}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={transitions.fadeXl}
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
                    </>
                  )}
                </>
              )}
            </AnimatePresence>
          </motion.main>
        </div>
      </div>
    </div>
  );
}
