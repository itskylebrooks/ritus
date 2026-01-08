import { emphasizeEase, transitions } from '@/shared/animations';
import { useHabitStore } from '@/shared/store/store';
import { daysThisWeek, iso } from '@/shared/utils/date';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import AddHabit from './components/AddHabit';
import ClockCard from './components/ClockCard';
import HabitCard from './components/HabitCard';
import QuoteCard from './components/QuoteCard';

const nameCollator = new Intl.Collator(undefined, { sensitivity: 'base' });
const EMPTY_SET = new Set<string>();
const EMPTY_ARRAY: string[] = [];

function EmptyState({ disableAnim = false }: { disableAnim?: boolean }) {
  return (
    <motion.div
      layout
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

export default function Home() {
  const showAdd = useHabitStore((s) => s.showAdd);

  const showList = useHabitStore((s) => s.showList);
  const showHomeCards = useHabitStore((s) => s.showHomeCards ?? true);

  const habits = useHabitStore((s) => s.habits);
  const showArchived = useHabitStore((s) => s.showArchived);
  const weekStart = useHabitStore((s) => s.weekStart);
  const [initialListRender, setInitialListRender] = useState(true);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInitialListRender(false);
  }, []);
  const [emptyReady, setEmptyReady] = useState(habits.length === 0);
  const emptyTimer = useRef<number | null>(null);
  const prevCount = useRef(habits.length);
  const completionCache = useRef(
    new Map<string, { completions: string[]; set: Set<string> }>(),
  );
  const weekKeys = useMemo(() => {
    const weekStartsOn = weekStart === 'sunday' ? 0 : 1;
    return daysThisWeek(new Date(), weekStartsOn).map((d) => iso(d).slice(0, 10));
  }, [weekStart]);
  const completionKeysById = useMemo(() => {
    const map = new Map<string, Set<string>>();
    const cache = completionCache.current;
    const activeIds = new Set<string>();

    for (const h of habits) {
      if (h.archived && !showArchived) continue;
      activeIds.add(h.id);
      const completions = h.completions ?? EMPTY_ARRAY;
      const cached = cache.get(h.id);
      if (cached && cached.completions === completions) {
        map.set(h.id, cached.set);
        continue;
      }
      const keys = new Set(completions.map((c) => (c.length > 10 ? c.slice(0, 10) : c)));
      cache.set(h.id, { completions, set: keys });
      map.set(h.id, keys);
    }

    for (const id of cache.keys()) {
      if (!activeIds.has(id)) cache.delete(id);
    }

    return map;
  }, [habits, showArchived]);

  useEffect(() => {
    const cur = habits.length;
    const prev = prevCount.current;
    prevCount.current = cur;
    if (cur === 0) {
      if (prev > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setEmptyReady(false);
        if (emptyTimer.current) window.clearTimeout(emptyTimer.current);
        emptyTimer.current = window.setTimeout(() => {
          setEmptyReady(true);
          emptyTimer.current = null;
        }, 300);
      } else {
        setEmptyReady(true);
      }
    } else {
      if (emptyTimer.current) {
        window.clearTimeout(emptyTimer.current);
        emptyTimer.current = null;
      }
      setEmptyReady(false);
    }
    return () => {
      if (emptyTimer.current) {
        window.clearTimeout(emptyTimer.current);
        emptyTimer.current = null;
      }
    };
  }, [habits.length]);

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
      <div className="mt-4 grid gap-4 sm:[grid-template-columns:minmax(0,1fr)_minmax(0,160px)] items-stretch">
        {showHomeCards && (
          <div className="h-full min-w-0 sm:row-start-1 sm:col-start-1 sm:col-span-1">
            <QuoteCard />
          </div>
        )}

        <div
          className={`space-y-4 ${
            showHomeCards ? 'sm:col-span-2 sm:row-start-2' : 'sm:col-span-2 sm:row-start-1'
          }`}
        >
          {showAdd && (
            <div>
              <AddHabit />
            </div>
          )}

          <motion.main layout className={`grid gap-4 ${showList ? '' : 'sm:grid-cols-2'}`}>
            <AnimatePresence initial={false} mode="popLayout">
              {groupedHabits.incompleteToday.length === 0 &&
              groupedHabits.completedToday.length === 0 &&
              (!showArchived || groupedHabits.archived.length === 0) ? (
                emptyReady ? (
                  <EmptyState disableAnim={initialListRender} />
                ) : null
              ) : (
                <>
                  {groupedHabits.incompleteToday.map((h) => (
                    <motion.div
                      key={h.id}
                      layout
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={transitions.fadeXl}
                    >
                    <HabitCard
                      habit={h}
                      completionKeys={completionKeysById.get(h.id) ?? EMPTY_SET}
                      weekKeys={weekKeys}
                      disableEntryAnim={initialListRender}
                    />
                  </motion.div>
                  ))}

                  {groupedHabits.completedToday.length > 0 &&
                    groupedHabits.incompleteToday.length > 0 && (
                      <motion.div
                        key="divider-completed"
                        layout
                        className="col-span-full text-xs font-semibold tracking-[0.6em] text-neutral-400 dark:text-neutral-500 text-center uppercase"
                      >
                        COMPLETED
                      </motion.div>
                    )}

                  {groupedHabits.completedToday.map((h) => (
                    <motion.div
                      key={h.id}
                      layout
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={transitions.fadeXl}
                    >
                    <HabitCard
                      habit={h}
                      completionKeys={completionKeysById.get(h.id) ?? EMPTY_SET}
                      weekKeys={weekKeys}
                      disableEntryAnim={initialListRender}
                    />
                  </motion.div>
                  ))}

                  {showArchived && groupedHabits.archived.length > 0 && (
                    <>
                      {(groupedHabits.incompleteToday.length > 0 ||
                        groupedHabits.completedToday.length > 0) && (
                        <motion.div
                          key="divider-archived"
                          layout
                          className="col-span-full text-xs font-semibold tracking-[0.6em] text-neutral-400 dark:text-neutral-500 text-center uppercase"
                        >
                          ARCHIVED
                        </motion.div>
                      )}

                      {groupedHabits.archived.map((h) => (
                        <motion.div
                          key={h.id}
                          layout
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={transitions.fadeXl}
                        >
                          <HabitCard
                            habit={h}
                            completionKeys={completionKeysById.get(h.id) ?? EMPTY_SET}
                            weekKeys={weekKeys}
                            disableEntryAnim={initialListRender}
                          />
                        </motion.div>
                      ))}
                    </>
                  )}
                </>
              )}
            </AnimatePresence>
          </motion.main>
        </div>

        {showHomeCards && (
          <div className="h-full sm:row-start-1 sm:col-start-2 sm:col-span-1">
            <ClockCard />
          </div>
        )}
      </div>
    </div>
  );
}
