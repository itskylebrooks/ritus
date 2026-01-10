import { transitions } from '@/shared/animations';
import { HABIT_SUGGESTIONS } from '@/shared/constants/habitSuggestions';
import { useHabitStore } from '@/shared/store/store';
import type { Frequency } from '@/shared/types';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function AddHabit({
  disableInitialLayout = false,
}: {
  disableInitialLayout?: boolean;
}) {
  // disableInitialLayout: when true, avoid framer-motion 'layout' animations on mount
  // (used by Home to avoid initial reflow animations when Quote height differs)
  const addHabit = useHabitStore((s) => s.addHabit);
  const [name, setName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [weeklyTarget, setWeeklyTarget] = useState<number>(1);
  const [monthlyTarget, setMonthlyTarget] = useState<number>(1);
  const [mode, setMode] = useState<'build' | 'break'>('build');
  const buildPlaceholder = 'e.g., Morning Run';
  const breakPlaceholder = 'e.g., No Alcohol';
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState<string>(
    mode === 'build' ? buildPlaceholder : breakPlaceholder,
  );
  const typingTimer = useRef<number | null>(null);
  const firstMount = useRef(true);
  const [isReady, setIsReady] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      // call store.addHabit with weeklyTarget and monthlyTarget (store will ignore the irrelevant one)
      addHabit(name.trim(), frequency, weeklyTarget, monthlyTarget, mode);
    } catch (err) {
      // on some mobile browsers/storage modes this can throw (e.g., blocked storage or missing APIs)
      // surface to console and avoid crashing the UI
      // keep reset of inputs only if add succeeded; here we still reset so user can retry
      // developer can inspect errors via remote debugging
      console.error('Failed to add habit', err);
    }
    setName('');
    setFrequency('daily');
    setWeeklyTarget(1);
    setMonthlyTarget(1);
    setMode('build');
  }

  function selectSuggestion(s: string) {
    setName(s.slice(0, 60));
    setShowSuggestions(false);
    setActiveIndex(-1);
  }

  // Mark app ready after first mount to avoid initial load animations in dev StrictMode
  useEffect(() => {
    setIsReady(true);
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (e.target instanceof Node && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  useEffect(() => {
    // Don't animate on first mount
    if (firstMount.current || !isReady) {
      firstMount.current = false;
      return;
    }

    // Only animate if input is empty
    if (name.trim()) return;

    const target = mode === 'build' ? buildPlaceholder : breakPlaceholder;
    // clear any existing timer
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }

    setDisplayedPlaceholder('');
    let i = 0;
    const step = () => {
      i += 1;
      setDisplayedPlaceholder(target.slice(0, i));
      if (i < target.length) {
        typingTimer.current = window.setTimeout(step, 28);
      } else {
        typingTimer.current = null;
      }
    };

    // small initial delay then start typing
    typingTimer.current = window.setTimeout(step, 120);

    return () => {
      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
        typingTimer.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, name]);

  return (
    <motion.form
      layout={!disableInitialLayout}
      onSubmit={submit}
      className="flex flex-col gap-3 rounded-2xl border border-subtle p-3 shadow-sm sm:flex-row sm:items-end"
    >
      <motion.div
        className="flex-1"
        layout={disableInitialLayout ? false : 'position'}
        transition={transitions.layoutSpring}
        style={{ minWidth: 0 }}
      >
        <div className="flex items-baseline justify-between">
          <label className="block text-sm text-muted">
            Habit name
            <AnimatePresence initial={false}>
              {name.length > 0 && (
                <motion.span
                  key="counter"
                  className="ml-1"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={transitions.fadeXs}
                >
                  ({name.length}/60)
                </motion.span>
              )}
            </AnimatePresence>
          </label>
        </div>
        <div className="relative mt-1" ref={wrapperRef}>
          <input
            className="w-full rounded-xl border border-subtle bg-transparent px-3 py-2 outline-none ring-0 placeholder:text-muted focus:border-accent"
            placeholder={displayedPlaceholder}
            value={name}
            maxLength={60}
            onChange={(e) => {
              if (typingTimer.current) {
                clearTimeout(typingTimer.current);
                typingTimer.current = null;
              }
              const val = e.target.value.slice(0, 60);
              setName(val);
              // update suggestions
              const q = val.trim().toLowerCase();
              if (q.length === 0) {
                setFilteredSuggestions([]);
                setShowSuggestions(false);
                setActiveIndex(-1);
              } else {
                const filtered = HABIT_SUGGESTIONS.filter((s) => s.toLowerCase().includes(q)).slice(
                  0,
                  8,
                );
                setFilteredSuggestions(filtered);
                setShowSuggestions(filtered.length > 0);
                setActiveIndex(-1);
              }
            }}
            onFocus={() => {
              if (typingTimer.current) {
                clearTimeout(typingTimer.current);
                typingTimer.current = null;
              }
              // if we have text, show suggestions
              if (name.trim().length > 0) {
                const q = name.trim().toLowerCase();
                const filtered = HABIT_SUGGESTIONS.filter((s) => s.toLowerCase().includes(q)).slice(
                  0,
                  8,
                );
                setFilteredSuggestions(filtered);
                setShowSuggestions(filtered.length > 0);
              }
            }}
            onKeyDown={(e) => {
              if (!showSuggestions) return;
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex((i) => Math.min(i + 1, filteredSuggestions.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex((i) => Math.max(i - 1, 0));
              } else if (e.key === 'Enter') {
                if (activeIndex >= 0 && filteredSuggestions[activeIndex]) {
                  e.preventDefault();
                  selectSuggestion(filteredSuggestions[activeIndex]);
                }
              } else if (e.key === 'Escape') {
                setShowSuggestions(false);
                setActiveIndex(-1);
              }
            }}
          />

          <AnimatePresence>
            {showSuggestions && filteredSuggestions.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={transitions.fadeXs}
                role="listbox"
                aria-label="Habit suggestions"
                className="absolute left-0 right-0 z-50 mt-2 rounded-lg border border-subtle bg-surface-elevated shadow-elevated"
                style={{ maxHeight: 5 * 40, overflowY: 'auto' }}
              >
                {filteredSuggestions.map((s, idx) => (
                  <li
                    key={s}
                    role="option"
                    aria-selected={activeIndex === idx}
                    onMouseDown={(ev) => {
                      // use onMouseDown to avoid losing focus before click
                      ev.preventDefault();
                      selectSuggestion(s);
                    }}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`cursor-pointer px-3 py-2 text-sm ${activeIndex === idx ? 'bg-subtle text-strong' : 'text-muted hover:bg-subtle hover:text-strong'}`}
                  >
                    {s}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      {/* On mobile: show 'I want to' and 'Frequency' side-by-side (two columns). */}
      <div className="grid grid-cols-2 gap-3" style={{ minWidth: 0 }}>
        <motion.div
          layout={!disableInitialLayout}
          transition={transitions.layoutSpring}
          style={{ minWidth: 0 }}
        >
          <label className="block text-sm text-muted">I want to</label>
          <div className="mt-1 flex gap-2">
            <label
              className={`px-3 py-2 rounded-xl border border-subtle cursor-pointer transition-all duration-150 ease-in-out ${mode === 'build' ? 'bg-accent text-inverse shadow-elevated hover-accent-fade' : 'bg-surface-elevated text-muted hover-nonaccent'}`}
            >
              <input
                className="sr-only"
                type="radio"
                name="mode"
                checked={mode === 'build'}
                onChange={() => setMode('build')}
              />
              Build
            </label>

            <label
              className={`px-3 py-2 rounded-xl border border-subtle cursor-pointer transition-all duration-150 ease-in-out ${mode === 'break' ? 'bg-accent text-inverse shadow-elevated hover-accent-fade' : 'bg-surface-elevated text-muted hover-nonaccent'}`}
            >
              <input
                className="sr-only"
                type="radio"
                name="mode"
                checked={mode === 'break'}
                onChange={() => setMode('break')}
              />
              Break
            </label>
          </div>
        </motion.div>

        <motion.div
          layout={!disableInitialLayout}
          transition={transitions.layoutSpring}
          style={{ minWidth: 0 }}
        >
          <label className="block text-sm text-muted">Frequency</label>
          <div className="relative mt-1">
            <select
              className="appearance-none mt-0 w-full rounded-xl border border-subtle bg-transparent px-3 py-2 pr-9 text-strong"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as Frequency)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          </div>
        </motion.div>
      </div>
      <AnimatePresence initial={false} mode="popLayout">
        {frequency === 'weekly' && (
          <motion.div
            key="days-week"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={transitions.spring}
            layout={!disableInitialLayout}
            style={{ minWidth: 0 }}
          >
            <label className="block text-sm text-muted">Days / week</label>
            <div className="relative mt-1">
              <select
                className="appearance-none mt-0 w-full rounded-xl border border-subtle bg-transparent px-3 py-2 pr-9 text-strong"
                value={weeklyTarget}
                onChange={(e) => setWeeklyTarget(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} day{n > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            </div>
          </motion.div>
        )}
        {frequency === 'monthly' && (
          <motion.div
            key="times-month"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={transitions.spring}
            layout={!disableInitialLayout}
            style={{ minWidth: 0 }}
          >
            <label className="block text-sm text-muted">Times / month</label>
            <div className="relative mt-1">
              <select
                className="appearance-none mt-0 w-full rounded-xl border border-subtle bg-transparent px-3 py-2 pr-9 text-strong"
                value={monthlyTarget}
                onChange={(e) => setMonthlyTarget(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} time{n > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        layout={!disableInitialLayout}
        transition={transitions.layoutSpring}
        style={{ minWidth: 0 }}
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2 text-inverse transition-colors duration-150 ease-in-out hover-accent-fade active:scale-[.98]"
        aria-label="Add habit"
      >
        <Plus className="h-4 w-4" /> Add
      </motion.button>
    </motion.form>
  );
}
