/* eslint-disable no-empty */
import { defaultEase, useMotionPreferences } from '@/shared/animations';
import defaultHabits, {
  defaultEmojiByDate,
  defaultEmojiRecents,
  defaultProgress,
} from '@/shared/store/defaultHabits';
import { useHabitStore } from '@/shared/store/store';
import { fromISO, iso } from '@/shared/utils/date';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import ConfirmModal from './ConfirmModal';

interface GuideModalProps {
  open: boolean;
  onClose: () => void;
  onLoadExample?: () => void;
}

type GuideStep = { title: string; body: string };
const STEPS: GuideStep[] = [
  {
    title: 'Welcome to Ritus',
    body: 'A minimalist, local-first habit tracker to help you build or break routines. You can even install it as an app for quick access from Settings.',
  },
  {
    title: 'Create a habit',
    body: 'Tap Add to create a habit, give it a clear name, then choose Daily, Weekly or Monthly frequency, and Build or Break type.',
  },
  {
    title: 'Track completions',
    body: 'Mark days as Done (or Clean) directly from the card or use the small week strip. Weekly and monthly habits count toward your set targets — stay consistent to grow your streaks.',
  },
  {
    title: 'Emoji of the Day',
    body: 'Tap the emoji button in the header to record your mood or daily highlight. Over time, your emoji history will appear in Insights — a quick reflection of your days.',
  },
  {
    title: 'Points & milestones',
    body: 'Each completion earns points and strengthens streaks. Your points are visible in Milestones, while Insights show your consistency and trends.',
  },
  {
    title: 'Import example data',
    body: "Click 'Load data' below to explore Ritus with sample habits. If you already have data, you’ll be asked to confirm — importing replaces your current habits.",
  },
];

type LayerPhase = 'enter' | 'exit';
type LayerDir = 'forward' | 'back';
interface StepLayer {
  key: number;
  idx: number;
  phase: LayerPhase;
  dir: LayerDir;
}

export default function GuideModal({ open, onClose, onLoadExample }: GuideModalProps) {
  const [step, setStep] = useState(0);
  const [renderedSteps, setRenderedSteps] = useState<StepLayer[]>([
    { key: 0, idx: 0, phase: 'enter', dir: 'forward' },
  ]);
  const [visible, setVisible] = useState(open);
  const [closing, setClosing] = useState(false);
  const [entering, setEntering] = useState(false);
  const { prefersReducedMotion } = useMotionPreferences();
  const btnTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.18, ease: defaultEase };
  const closeTimer = useRef<number | null>(null);
  const enterRaf = useRef<number | null>(null);
  const stepAnimTimer = useRef<number | null>(null);
  const stepKeyRef = useRef(0);

  // state for in-app confirmation when loading example data
  const [confirmLoadOpen, setConfirmLoadOpen] = useState(false);

  const doLoad = async () => {
    const attemptLoad = async () => {
      // compute cumulative totals from example data
      const total = (defaultHabits || []).reduce((s, h) => s + (h.points || 0), 0);
      const totalCompletions = (defaultHabits || []).reduce(
        (s, h) => s + (h.completions ? h.completions.length : 0),
        0,
      );
      const longest = (defaultHabits || []).reduce((m, h) => Math.max(m, h.streak || 0), 0);
      const uniqueDays = new Set<string>();
      for (const h of defaultHabits || []) {
        for (const c of h.completions || []) uniqueDays.add(iso(fromISO(c)));
      }
      // also set example progress when loading sample data (points + award keys)
      const base = {
        habits: defaultHabits,
        totalPoints: total,
        totalCompletions,
        longestStreak: longest,
        daysWithRitus: uniqueDays.size,
      };
      const emoji = { emojiByDate: defaultEmojiByDate, emojiRecents: defaultEmojiRecents };
      if (defaultProgress) {
        useHabitStore.setState({ ...base, ...emoji, progress: defaultProgress });
      } else {
        useHabitStore.setState({ ...base, ...emoji });
      }

      // Compute trophy summary from the example habits and award any trophies idempotently
      try {
        const summary = {
          dailyBuildStreak: Math.max(
            0,
            ...defaultHabits
              .filter((h) => h.frequency === 'daily' && h.mode === 'build')
              .map((h) => h.streak || 0),
          ),
          dailyBreakStreak: Math.max(
            0,
            ...defaultHabits
              .filter((h) => h.frequency === 'daily' && h.mode === 'break')
              .map((h) => h.streak || 0),
          ),
          weeklyStreak: Math.max(
            0,
            ...defaultHabits.filter((h) => h.frequency === 'weekly').map((h) => h.streak || 0),
          ),
          totalCompletions,
          // longest emoji streak across the dataset (UTC-safe), not just trailing today
          emojiStreak: (() => {
            const by = defaultEmojiByDate || {};
            const keys = Object.keys(by);
            if (!keys.length) return 0;
            const norm = new Set(keys.map((k) => (k.length > 10 ? k.slice(0, 10) : k)));
            const prevDay = (ds: string) => {
              const d = new Date(`${ds}T00:00:00Z`);
              d.setUTCDate(d.getUTCDate() - 1);
              return d.toISOString().slice(0, 10);
            };
            const nextDay = (ds: string) => {
              const d = new Date(`${ds}T00:00:00Z`);
              d.setUTCDate(d.getUTCDate() + 1);
              return d.toISOString().slice(0, 10);
            };
            let longest = 0;
            for (const ds of norm) {
              const pk = prevDay(ds);
              if (norm.has(pk)) continue;
              let count = 0;
              let cur = ds;
              while (norm.has(cur)) {
                count++;
                cur = nextDay(cur);
              }
              if (count > longest) longest = count;
            }
            return longest;
          })(),
        };
        try {
          useHabitStore.getState().awardTrophies(summary);
        } catch {}
      } catch {}
    };

    if (onLoadExample) {
      try {
        await onLoadExample();
      } catch {
        await attemptLoad();
      }
    } else {
      await attemptLoad();
    }

    if (!closing) onClose();
  };

  const handleLoadClick = () => {
    const state = useHabitStore.getState();
    const existing = state.habits || [];
    if (existing.length > 0) {
      setConfirmLoadOpen(true);
    } else {
      void doLoad();
    }
  };

  useEffect(() => {
    if (open) {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
      if (enterRaf.current) cancelAnimationFrame(enterRaf.current);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      setClosing(false);
      setEntering(true);
      setStep(0);
      stepKeyRef.current++;
      setRenderedSteps([{ key: stepKeyRef.current, idx: 0, phase: 'enter', dir: 'forward' }]);
      enterRaf.current = requestAnimationFrame(() => {
        enterRaf.current = requestAnimationFrame(() => setEntering(false));
      });
    } else if (visible) {
      setClosing(true);
      closeTimer.current = window.setTimeout(() => {
        setVisible(false);
        setClosing(false);
      }, 260);
    }
  }, [open, visible]);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      if (enterRaf.current) cancelAnimationFrame(enterRaf.current);
      if (stepAnimTimer.current) clearTimeout(stepAnimTimer.current);
    },
    [],
  );

  // Prevent background scrolling while guide is visible
  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  const queueStep = (next: number) => {
    if (next === step) return;
    const dir: LayerDir = next > step ? 'forward' : 'back';
    // update step immediately so controls (Back/Next) animate right away
    setStep(next);
    // mark existing layers as exiting first (content will transition after a short exit)
    setRenderedSteps((prev) => prev.map((p) => ({ ...p, phase: 'exit' as const, dir })));
    // after exit animation, insert new entering layer
    if (stepAnimTimer.current) clearTimeout(stepAnimTimer.current);
    // make transitions snappier: short exit, then insert new entering layer
    const EXIT_MS = 200;
    stepAnimTimer.current = window.setTimeout(() => {
      stepKeyRef.current++;
      setRenderedSteps([{ key: stepKeyRef.current, idx: next, phase: 'enter', dir }]);
      // cleanup after enter animation completes
      stepAnimTimer.current = window.setTimeout(() => {
        setRenderedSteps((curr) => curr.filter((layer) => layer.phase === 'enter'));
      }, 260);
    }, EXIT_MS);
  };

  if (!visible) return null;
  const last = step === STEPS.length - 1;
  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center p-5 transition-colors duration-250 ${closing || entering ? 'bg-transparent' : 'bg-overlay backdrop-blur-sm'}`}
      onClick={() => {
        if (!closing) onClose();
      }}
    >
      <div
        className={`w-full max-w-sm rounded-2xl ring-1 ring-black/5 dark:ring-neutral-700/5 border border-subtle p-6 relative transition-all duration-250 ${closing || entering ? 'opacity-0 scale-[0.94] -translate-y-2' : 'opacity-100 scale-100 translate-y-0'} bg-surface-elevated`}
        onClick={(e) => {
          e.stopPropagation();
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
      >
        <div className="absolute top-2 right-2">
          <button
            aria-label="Close guide"
            onClick={() => {
              if (!closing) onClose();
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-control text-muted transition duration-200 hover-nonaccent"
          >
            ✕
          </button>
        </div>
        <div className="text-[11px] tracking-wide uppercase text-muted mb-2">Quick guide</div>
        {/* Hidden heading for accessibility to label the dialog */}
        <h2 id="guide-title" className="sr-only">
          {STEPS[step].title}
        </h2>
        <div className="relative min-h-[120px]">
          {renderedSteps.map((layer) => {
            const data = STEPS[layer.idx];
            const stateClass =
              layer.phase === 'enter'
                ? layer.dir === 'forward'
                  ? 'guide-step-enter-forward'
                  : 'guide-step-enter-back'
                : layer.dir === 'forward'
                  ? 'guide-step-exit-forward'
                  : 'guide-step-exit-back';
            return (
              <div key={layer.key} className={`guide-step-layer ${stateClass}`}>
                <h3 className="text-lg font-semibold mb-3 text-strong">{data.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{data.body}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-5 flex items-center justify-between text-xs text-muted">
          <div>
            Step {step + 1} / {STEPS.length}
          </div>
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${i === step ? 'bg-accent' : 'bg-chip'}`}
              />
            ))}
          </div>
        </div>
        <div className="mt-6">
          {last ? (
            // On final step: left -> Load data, right -> Finish (titles and actions swapped; styles unchanged)
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  handleLoadClick();
                }}
                className="flex-1 rounded-md px-3 py-2 text-sm font-medium bg-control text-strong transition duration-200 hover-nonaccent"
              >
                Load data
              </button>
              <button
                onClick={() => {
                  if (!closing) onClose();
                }}
                className="flex-1 rounded-md px-3 py-2 text-sm font-medium bg-accent text-inverse transition duration-200 hover-accent-fade"
              >
                Finish
              </button>
            </div>
          ) : (
            <div className="flex w-full items-center gap-3">
              <AnimatePresence initial={false} mode="popLayout">
                {step > 0 && (
                  <button
                    key="back"
                    onClick={() => queueStep(Math.max(0, step - 1))}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium bg-control text-strong hover-nonaccent transition-opacity ${prefersReducedMotion ? '' : 'duration-180'}`}
                    style={{
                      opacity: step > 0 ? 1 : 0,
                      pointerEvents: step > 0 ? 'auto' : 'none',
                      willChange: 'opacity',
                      WebkitTransform: 'translateZ(0)',
                      WebkitBackfaceVisibility: 'hidden',
                    }}
                    aria-hidden={step === 0}
                    disabled={step === 0}
                    tabIndex={step > 0 ? 0 : -1}
                  >
                    Back
                  </button>
                )}

                <motion.button
                  key="next"
                  layout
                  transition={btnTransition}
                  onClick={() => queueStep(Math.min(STEPS.length - 1, step + 1))}
                  // Restrict CSS transitions to color only so Framer Motion controls layout/transform
                  className="flex-1 rounded-md px-3 py-2 text-sm font-medium bg-accent text-inverse transition-colors duration-200 hover-accent-fade"
                  style={{ willChange: 'transform, width', WebkitBackfaceVisibility: 'hidden' }}
                >
                  Next
                </motion.button>
              </AnimatePresence>
            </div>
          )}
        </div>

        <ConfirmModal
          open={confirmLoadOpen}
          onClose={() => setConfirmLoadOpen(false)}
          onConfirm={async () => {
            setConfirmLoadOpen(false);
            await doLoad();
          }}
          title="Load example data?"
          message="Load example data will replace your current habits. Continue?"
          confirmLabel="Load"
          cancelLabel="Cancel"
          destructive
        />
      </div>
    </div>
  );
}
