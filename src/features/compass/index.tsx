import { transitions } from '@/shared/animations';
import { useHabitStore } from '@/shared/store/store';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Compass as CompassIcon } from 'lucide-react';
import { useState } from 'react';

interface HabitDef {
  name: string;
  mode: 'build' | 'break';
  frequency: 'daily' | 'weekly' | 'monthly';
  weeklyTarget?: number;
  monthlyTarget?: number;
  description?: string;
}

const COMPASS_SETS = [
  {
    dir: 'North',
    arrow: '↑',
    title: 'Truth & Freedom',
    note: 'I’ve always felt lies and manipulation like static in the air. My North is about honesty, independence, and mental clarity — the kind that lets you breathe. These habits remind me to live by choice, not by autopilot.',
    disclaimer:
      'I share these from personal experience — not all forms of “freedom” feel the same to everyone. Take what fits your rhythm.',
    habits: [
      { name: 'Morning Silence', mode: 'build' as const, frequency: 'daily' as const },
      { name: 'No Social Media in Morning', mode: 'break' as const, frequency: 'daily' as const },
      { name: 'Inbox Once a Day', mode: 'break' as const, frequency: 'daily' as const },
      {
        name: 'Deep Work Session',
        mode: 'build' as const,
        frequency: 'weekly' as const,
        weeklyTarget: 3,
      },
      {
        name: 'Digital Sabbath',
        mode: 'break' as const,
        frequency: 'weekly' as const,
        weeklyTarget: 1,
      },
      { name: 'Plan Tomorrow Before Sleep', mode: 'build' as const, frequency: 'daily' as const },
      {
        name: 'Declutter Workspace',
        mode: 'build' as const,
        frequency: 'weekly' as const,
        weeklyTarget: 1,
      },
      {
        name: 'Monthly Reflection',
        mode: 'build' as const,
        frequency: 'monthly' as const,
        monthlyTarget: 1,
      },
      { name: 'No Multitasking', mode: 'break' as const, frequency: 'daily' as const },
      {
        name: 'Walk Without Headphones',
        mode: 'build' as const,
        frequency: 'weekly' as const,
        weeklyTarget: 2,
      },
      {
        name: 'Minimal Day',
        mode: 'break' as const,
        frequency: 'weekly' as const,
        weeklyTarget: 1,
      },
    ],
  },
  {
    dir: 'East',
    arrow: '→',
    title: 'Faith & Hope',
    note: 'The East is light. For me, faith isn’t dogma — it’s the quiet certainty that meaning still exists, even when logic fails. These habits help me stay open, anchored in something higher than achievement.',
    disclaimer:
      'My reflections here come from a Christian frame, but the point is not religion — it’s faith in something that lifts you beyond yourself.',
    habits: [
      { name: 'Read Before Bed', mode: 'build' as const, frequency: 'daily' as const },
      { name: 'Pray or Meditate', mode: 'build' as const, frequency: 'daily' as const },
      { name: 'No Alcohol', mode: 'break' as const, frequency: 'daily' as const },
      {
        name: 'Write a Blessing',
        mode: 'build' as const,
        frequency: 'weekly' as const,
        weeklyTarget: 1,
      },
      {
        name: 'Attend Aikido',
        mode: 'build' as const,
        frequency: 'weekly' as const,
        weeklyTarget: 2,
      },
      { name: 'Morning Walk', mode: 'build' as const, frequency: 'daily' as const },
      { name: 'Gratitude Prayer', mode: 'build' as const, frequency: 'daily' as const },
      { name: 'Limit News Intake', mode: 'break' as const, frequency: 'daily' as const },
      {
        name: 'Reflect on Scripture / Wisdom Text',
        mode: 'build' as const,
        frequency: 'weekly' as const,
        weeklyTarget: 3,
      },
      {
        name: 'Act of Service',
        mode: 'build' as const,
        frequency: 'weekly' as const,
        weeklyTarget: 1,
      },
    ],
  },
  {
    dir: 'West',
    arrow: '←',
    title: 'Growth & Mastery',
    note: 'I see discipline as art — something built brick by brick. My West keeps me grounded in work, study, and effort that actually changes who I am. It’s not about perfection, just the next small proof that I’m learning.',
    disclaimer:
      'Discipline means different things to different people. Don’t use it to punish yourself — it’s meant to build trust with your future self.',
    habits: [
      { name: 'Code for 1 Hour', mode: 'build' as const, frequency: 'daily' as const },
      {
        name: 'Study English',
        mode: 'build' as const,
        frequency: 'weekly' as const,
        weeklyTarget: 2,
      },
      { name: 'Journal Reflection', mode: 'build' as const, frequency: 'daily' as const },
      { name: 'Cold Shower', mode: 'build' as const, frequency: 'daily' as const },
      {
        name: 'Sunday Review',
        mode: 'build' as const,
        frequency: 'weekly' as const,
        weeklyTarget: 1,
      },
      { name: 'Read 30 Minutes', mode: 'build' as const, frequency: 'daily' as const },
      { name: 'Practice a Skill', mode: 'build' as const, frequency: 'daily' as const },
      { name: 'Limit Distractions', mode: 'break' as const, frequency: 'daily' as const },
      {
        name: 'Weekly Sprint',
        mode: 'build' as const,
        frequency: 'weekly' as const,
        weeklyTarget: 1,
      },
      {
        name: 'Teach What You Learn',
        mode: 'build' as const,
        frequency: 'weekly' as const,
        weeklyTarget: 1,
      },
      {
        name: 'Monthly Review',
        mode: 'build' as const,
        frequency: 'monthly' as const,
        monthlyTarget: 1,
      },
    ],
  },
  {
    dir: 'South',
    arrow: '↓',
    title: 'Love & Care',
    note: 'Even in frustration, I always return to the wish that people around me feel safe. The South reminds me that strength without tenderness becomes armor — and armor isolates.',
    disclaimer:
      'I’m not good at this every day. These habits are simply my practice in learning gentleness — yours might look very different.',
    habits: [
      { name: 'Gratitude Note', mode: 'build' as const, frequency: 'daily' as const },
      { name: 'Evening Stretch', mode: 'build' as const, frequency: 'daily' as const },
      { name: 'No Complaining', mode: 'break' as const, frequency: 'daily' as const },
      {
        name: 'Call a Friend',
        mode: 'build' as const,
        frequency: 'weekly' as const,
        weeklyTarget: 1,
      },
      {
        name: 'Cook Mindfully',
        mode: 'build' as const,
        frequency: 'weekly' as const,
        weeklyTarget: 1,
      },
      { name: 'Listen Without Fixing', mode: 'build' as const, frequency: 'daily' as const },
      { name: 'Compliment Someone', mode: 'build' as const, frequency: 'daily' as const },
      {
        name: 'Family Dinner',
        mode: 'build' as const,
        frequency: 'weekly' as const,
        weeklyTarget: 1,
      },
      {
        name: 'Random Kindness',
        mode: 'build' as const,
        frequency: 'weekly' as const,
        weeklyTarget: 2,
      },
      {
        name: 'Family Budget Review',
        mode: 'build' as const,
        frequency: 'monthly' as const,
        monthlyTarget: 1,
      },
      { name: 'No Gossip', mode: 'break' as const, frequency: 'daily' as const },
    ],
  },
];

export default function Compass() {
  const addHabit = useHabitStore((s) => s.addHabit);
  const [recentlyAdded, setRecentlyAdded] = useState<string[]>([]);

  const handleAdd = (h: HabitDef) => {
    const freq = h.frequency;
    const weekly = h.weeklyTarget ?? 1;
    const monthly = h.monthlyTarget ?? 1;
    addHabit(h.name, freq, weekly, monthly, h.mode);
    setRecentlyAdded((s) => [...s, h.name]);
    setTimeout(() => setRecentlyAdded((s) => s.filter((n) => n !== h.name)), 1400);
  };

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
      {/* Hero */}
      <section>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CompassIcon className="w-5 h-5" /> The Compass
        </h2>
        <p className="mt-4 text-neutral-600 dark:text-neutral-300">
          Ritus is more than a tracker. It’s a way to stay oriented when life feels scattered. Over
          time, I noticed that my own habits follow a kind of compass — four directions that keep me
          balanced when I drift too far toward work, pressure, or noise. This isn’t a system or a
          rulebook. It’s just how I’ve learned to stay grounded. Maybe some of it will resonate with
          you, maybe not — and that’s perfectly fine.
        </p>
      </section>

      {COMPASS_SETS.map((set) => (
        <section key={set.dir}>
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-black shadow-sm">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="text-xl text-neutral-600 dark:text-neutral-400">{set.arrow}</span>
                <span className="text-neutral-800 dark:text-neutral-100">{set.title}</span>
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{set.note}</p>
              <p className="mt-2 italic text-xs text-neutral-500">{set.disclaimer}</p>
            </div>

            <div className="mt-4">
              <div className="flex flex-wrap gap-3 justify-center">
                {set.habits.map((h) => (
                  <motion.button
                    key={h.name}
                    type="button"
                    onClick={() => handleAdd(h)}
                    className={`relative inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm transition-colors duration-150 transform-gpu align-middle ${h.mode === 'build' ? 'border-emerald-600 dark:border-emerald-500' : 'border-red-500 dark:border-red-500'} text-neutral-800 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-900 ${recentlyAdded.includes(h.name) ? 'cursor-not-allowed' : ''}`}
                    title={`${h.name} — ${h.mode} · ${h.frequency}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={transitions.fadeSm}
                  >
                    <>
                      {/* Keep name and frequency in DOM to preserve pill width; fade them when showing the added overlay */}
                      <span
                        className={`${recentlyAdded.includes(h.name) ? 'opacity-0' : 'opacity-100'} whitespace-normal leading-tight transition-opacity duration-150`}
                      >
                        {h.name}
                      </span>
                      <span
                        className={`${recentlyAdded.includes(h.name) ? 'opacity-0' : 'opacity-60'} text-[10px] ml-1 flex-none transition-opacity duration-150`}
                      >
                        {h.frequency === 'daily'
                          ? 'D'
                          : h.frequency === 'weekly'
                            ? `W${h.weeklyTarget ? h.weeklyTarget : ''}`
                            : `M${h.monthlyTarget ?? 1}`}
                      </span>
                      <AnimatePresence>
                        {recentlyAdded.includes(h.name) && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={transitions.fadeSm}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none text-neutral-800 dark:text-neutral-100"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            <span className="text-sm">Added</span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Center Balance */}
      <section>
        <div className="text-center">
          <p className="italic text-neutral-500">
            Freedom without love turns into loneliness. Love without freedom turns into dependency.
            Growth without faith turns into burnout. Faith without growth turns into stagnation.
          </p>
        </div>
      </section>
    </div>
  );
}
