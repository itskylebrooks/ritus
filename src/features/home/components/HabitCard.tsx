import { transitions } from '@/shared/animations';
import Badge from '@/shared/components/cards/Badge';
import ProgressBar from '@/shared/components/charts/ProgressBar';
import WeekStrip from '@/shared/components/layout/WeekStrip';
import ConfirmModal from '@/shared/components/modals/ConfirmModal';
import { useHabitStore } from '@/shared/store/store';
import type { Habit } from '@/shared/types';
import { fireConfetti } from '@/shared/utils/confetti';
import { iso } from '@/shared/utils/date';
import { AnimatePresence, motion } from 'framer-motion';
import { Archive, Check, Diamond, Flame, Inbox, Pencil, Settings2, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type ButtonsMenuProps = {
  habit: Habit;
  archiveHabit: (id: string) => void;
  unarchiveHabit: (id: string) => void;
  setEditing: (v: boolean) => void;
  setConfirmDeleteOpen: (v: boolean) => void;
};

function ButtonsMenu({
  habit,
  archiveHabit,
  unarchiveHabit,
  setEditing,
  setConfirmDeleteOpen,
}: ButtonsMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  // Close the menu when clicking/tapping outside the menu while it's open
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="flex items-center gap-2">
      <AnimatePresence initial={false} mode="wait">
        {!open ? (
          <motion.button
            key="settings"
            onClick={() => setOpen(true)}
            className="rounded-xl border border-subtle p-2 transition-colors duration-150 ease-in-out hover-nonaccent"
            aria-label="More actions"
            title="More"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transitions.fadeSm}
          >
            <Settings2 className="h-4 w-4" />
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transitions.fadeSm}
            className="flex items-center gap-2"
          >
            <motion.button
              onClick={() => {
                setOpen(false);
                setEditing(true);
              }}
              className="rounded-xl border border-subtle p-2 transition-colors duration-150 ease-in-out hover-nonaccent"
              aria-label="Edit habit"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </motion.button>

            <motion.button
              onClick={() => {
                setOpen(false);
                if (habit.archived) {
                  unarchiveHabit(habit.id);
                } else {
                  archiveHabit(habit.id);
                }
              }}
              className="rounded-xl border border-subtle p-2 transition-colors duration-150 ease-in-out hover-nonaccent"
              aria-label={habit.archived ? 'Unarchive habit' : 'Archive habit'}
              title={habit.archived ? 'Unarchive' : 'Archive'}
            >
              {habit.archived ? <Inbox className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
            </motion.button>

            <motion.button
              onClick={() => {
                setOpen(false);
                setConfirmDeleteOpen(true);
              }}
              className="rounded-xl border border-subtle p-2 transition-colors duration-150 ease-in-out hover-nonaccent text-red-500"
              aria-label="Delete habit"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HabitCard({
  habit,
  completionKeys,
  weekKeys,
  disableEntryAnim = false,
}: {
  habit: Habit;
  completionKeys: Set<string>;
  weekKeys: string[];
  disableEntryAnim?: boolean;
}) {
  const toggleCompletion = useHabitStore((s) => s.toggleCompletion);
  const editHabit = useHabitStore((s) => s.editHabit);
  const deleteHabit = useHabitStore((s) => s.deleteHabit);
  const archiveHabit = useHabitStore((s) => s.archiveHabit);
  const unarchiveHabit = useHabitStore((s) => s.unarchiveHabit);
  const showList = useHabitStore((s) => s.showList);
  const appliedCollectibles = useHabitStore((s) => s.progress.appliedCollectibles || {});
  const accentApplied = !!appliedCollectibles['accent'];

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(habit.name);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Capture the initial value of disableEntryAnim so it doesn't flip
  // on the first parent-triggered re-render (which caused the entry
  // animation to run for all cards after any button click).
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_initialDisableEntry] = useState(disableEntryAnim);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(habit.name);
  }, [habit.name]);

  const progressMax =
    habit.frequency === 'daily'
      ? 7
      : habit.frequency === 'weekly'
        ? (habit.weeklyTarget ?? 1)
        : (habit.monthlyTarget ?? 1);
  const progressVal = useMemo(
    () =>
      habit.frequency === 'monthly'
        ? (() => {
            const monthKey = iso(new Date()).slice(0, 7);
            let count = 0;
            completionKeys.forEach((key) => {
              if (key.startsWith(monthKey)) count += 1;
            });
            return count;
          })()
        : weekKeys.reduce((acc, key) => acc + (completionKeys.has(key) ? 1 : 0), 0),
    [completionKeys, habit.frequency, weekKeys],
  );

  // If points are large, render the number smaller so it fits the card
  const pointsClass =
    habit.points && habit.points > 999
      ? 'text-sm font-semibold tabular-nums'
      : 'text-base font-semibold tabular-nums';
  const breakPrimaryBgClass = accentApplied ? 'bg-accent' : 'bg-success';
  const todayKey = iso(new Date()).slice(0, 10);
  const doneToday = completionKeys.has(todayKey);
  const StatusIcon = doneToday ? X : Check;

  function saveEdit() {
    const trimmed = name.trim();
    if (!trimmed) return setEditing(false);
    editHabit(habit.id, { name: trimmed });
    setEditing(false);
  }

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (habit.archived) return;

    // Fire confetti if enabling 'done' state and animation is active
    if (!doneToday && appliedCollectibles['animation']?.includes('anim_confetti_button')) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      fireConfetti({
        particleCount: 40,
        spread: 60,
        origin: { x, y },
      });
    }

    toggleCompletion(habit.id, new Date());
  };

  // deletion will rely on parent AnimatePresence exit animation

  return (
    <div className="rounded-2xl border border-subtle bg-surface p-4 shadow-sm text-strong">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 min-h-[48px]">
          <AnimatePresence mode="wait" initial={false}>
            {editing ? (
              <motion.div
                key="edit-mode"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={transitions.fadeMd}
                className="flex flex-col gap-2 sm:flex-row sm:items-center"
              >
                <div className="w-full">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 60))}
                    maxLength={60}
                    className="w-full rounded-xl border border-subtle bg-white px-3 py-2 dark:bg-neutral-950 text-sm text-strong dark:text-neutral-100 placeholder:text-muted dark:placeholder:text-neutral-300"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="normal-mode"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={transitions.fadeMd}
                className="relative top-1 flex flex-wrap items-center gap-2"
              >
                {/* Title with badges inline so badges sit immediately after the end of the title text */}
                <div className="w-full">
                  <div className="text-lg font-semibold whitespace-normal break-words leading-tight">
                    <span className="inline after:content-[''] after:inline-block after:w-2">
                      {habit.name}
                    </span>
                    <span className="inline-flex items-center gap-2 align-text-bottom">
                      {/* Compact badge labels: daily -> D, weekly -> W{n}, monthly -> M{n}, archived -> A */}
                      <Badge>
                        {habit.frequency === 'daily'
                          ? 'D'
                          : habit.frequency === 'weekly'
                            ? `W${habit.weeklyTarget ?? 1}`
                            : habit.frequency === 'monthly'
                              ? `M${habit.monthlyTarget ?? 1}`
                              : String(habit.frequency).charAt(0).toUpperCase()}
                      </Badge>
                      {habit.archived && <Badge>A</Badge>}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <AnimatePresence mode="wait" initial={false}>
            {editing ? (
              <motion.div
                key="edit-actions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={transitions.fadeMd}
                className="flex items-center gap-2"
              >
                <button
                  onClick={saveEdit}
                  className="rounded-xl bg-accent px-3 py-2 text-sm text-inverse hover-accent-fade"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setName(habit.name);
                  }}
                  className="rounded-xl border border-subtle px-3 py-2 text-sm transition-colors duration-150 ease-in-out hover-nonaccent"
                >
                  Cancel
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="buttons"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={transitions.fadeSm}
                className="flex items-center"
              >
                <ButtonsMenu
                  habit={habit}
                  archiveHabit={archiveHabit}
                  unarchiveHabit={unarchiveHabit}
                  setEditing={setEditing}
                  setConfirmDeleteOpen={setConfirmDeleteOpen}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-0 flex items-center gap-3 md:grid md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex shrink-0 justify-start">
          <WeekStrip
            habit={habit}
            completionKeys={completionKeys}
            onToggle={(d) => toggleCompletion(habit.id, d)}
          />
        </div>
        {habit.mode === 'break' ? (
          showList ? (
            <button
              onClick={handleToggle}
              disabled={habit.archived}
              aria-disabled={habit.archived}
              aria-label="Clean today"
              className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl ${breakPrimaryBgClass} p-2 text-sm text-inverse transition transform duration-150 ease-in-out sm:flex-none sm:px-3 sm:py-2 sm:w-full md:w-[124px] ${habit.archived ? 'opacity-60 cursor-not-allowed' : 'hover-accent-fade active:scale-[.98]'} md:justify-self-end`}
            >
              <StatusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Clean today</span>
            </button>
          ) : (
            <button
              onClick={handleToggle}
              disabled={habit.archived}
              aria-disabled={habit.archived}
              aria-label="Clean today"
              className={`inline-flex items-center justify-center rounded-xl ${breakPrimaryBgClass} p-2 text-inverse transition transform duration-150 ease-in-out md:w-12 ${habit.archived ? 'opacity-60 cursor-not-allowed' : 'hover-accent-fade active:scale-[.98]'} md:justify-self-end`}
            >
              <StatusIcon className="h-4 w-4" />
              {/* Visible label on mobile, hidden on small+ so grid view buttons stay icon-only */}
              <span className="ml-2 inline sm:hidden">Clean today</span>
            </button>
          )
        ) : showList ? (
          <button
            onClick={handleToggle}
            disabled={habit.archived}
            aria-disabled={habit.archived}
            aria-label="Done today"
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent p-2 text-sm text-inverse transition transform duration-150 ease-in-out sm:flex-none sm:px-3 sm:py-2 sm:w-full md:w-[124px] ${habit.archived ? 'opacity-60 cursor-not-allowed' : 'hover-accent-fade active:scale-[.98]'} md:justify-self-end`}
          >
            <StatusIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Done today</span>
          </button>
        ) : (
          <button
            onClick={handleToggle}
            disabled={habit.archived}
            aria-disabled={habit.archived}
            aria-label="Done today"
            className={`inline-flex items-center justify-center rounded-xl bg-accent p-2 text-inverse transition transform duration-150 ease-in-out md:w-12 ${habit.archived ? 'opacity-60 cursor-not-allowed' : 'hover-accent-fade active:scale-[.98]'} md:justify-self-end`}
          >
            <StatusIcon className="h-4 w-4" />
            {/* Visible label on mobile, hidden on small+ so grid view buttons stay icon-only */}
            <span className="ml-2 inline sm:hidden">Done today</span>
          </button>
        )}
      </div>

      <div className="mt-4">
        {/* Mobile: streak, compact progress bar, and points all on one row */}
        <div className="flex items-center justify-between gap-2 sm:hidden">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-accent" aria-hidden />
            <div className="text-base font-semibold">{habit.streak}</div>
            <span className="sr-only">{habit.mode === 'break' ? 'Clean streak' : 'Streak'}</span>
          </div>

          <div className="flex items-center justify-center flex-1">
            <div className="flex-1">
              <ProgressBar value={progressVal} max={progressMax} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Diamond className="h-4 w-4 text-accent" aria-hidden />
            <div className={pointsClass}>{habit.points}</div>
            <span className="sr-only">Points</span>
          </div>
        </div>

        {/* Desktop/tablet: layout adjusted in list view to bring progress bar closer to streak/points */}
        <div className="hidden sm:grid sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-3">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-accent" aria-hidden />
            <div className="text-base font-semibold">{habit.streak}</div>
            <span className="sr-only">{habit.mode === 'break' ? 'Clean streak' : 'Streak'}</span>
          </div>

          <div
            className={`flex items-center gap-2 ${showList ? 'justify-between' : 'justify-center justify-self-center'}`}
          >
            <div className={`${showList ? 'flex-1' : 'w-56 md:w-40'}`}>
              <ProgressBar value={progressVal} max={progressMax} />
            </div>
            <span className="sr-only">Weekly progress</span>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Diamond className="h-4 w-4 text-accent" aria-hidden />
            <div className="sr-only">Points</div>
            <div className={pointsClass}>{habit.points}</div>
          </div>
        </div>
      </div>

      {/* Points text moved to the quick guide modal per UX request */}
      <ConfirmModal
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={() => {
          setConfirmDeleteOpen(false);
          deleteHabit(habit.id);
        }}
        title="Delete habit?"
        message={`Delete "${habit.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}
