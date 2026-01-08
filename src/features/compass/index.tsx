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
    title: 'Truth and Freedom',
    note: 'I feel lies, pressure, and manipulation almost physically. There’s something in me that cannot tolerate being controlled or forced into a mold. My North pulls me toward truth: to see clearly, to speak plainly, to stop performing for approval, and to refuse rules that violate dignity. Freedom, for me, is not chaos—it’s the right to live from what I actually believe and choose, without self-deception.',
    habits: [
      { name: 'Truth Journal', mode: 'build' as const, frequency: 'daily' as const },
      { name: 'No People-Pleasing "Yes"', mode: 'break' as const, frequency: 'daily' as const },
      { name: 'Speak One Hard Truth', mode: 'build' as const, frequency: 'weekly' as const },
      { name: 'Boundary Check-In', mode: 'build' as const, frequency: 'weekly' as const },
      { name: 'No Social Media in Morning', mode: 'break' as const, frequency: 'daily' as const },
      { name: 'Inbox Once a Day', mode: 'break' as const, frequency: 'daily' as const },
      {
        name: 'Digital Sabbath',
        mode: 'break' as const,
        frequency: 'weekly' as const,
        weeklyTarget: 1,
      },
      {
        name: 'Declutter Commitments',
        mode: 'build' as const,
        frequency: 'weekly' as const,
        weeklyTarget: 1,
      },
      {
        name: 'Monthly Values Review',
        mode: 'build' as const,
        frequency: 'monthly' as const,
        monthlyTarget: 1,
      },
      { name: 'No Multitasking', mode: 'break' as const, frequency: 'daily' as const },
      { name: 'Walk Without Headphones', mode: 'build' as const, frequency: 'weekly' as const },
    ],
  },
  {
    dir: 'East',
    arrow: '→',
    title: 'Silence and Meaning',
    note: 'I don’t rely on a personal rescuer to make life coherent. The world can be indifferent, and some things will never be fully explained. Still, I choose meaning. My East is the quiet place inside me that stays when the noise collapses—the practice of returning to breath, to stillness, to reality as it is. From that silence I regain perspective, and I remember what matters: integrity, dignity, and the next right action. Hope, in my worldview, is not wishing for intervention; it’s trusting that I can meet reality cleanly and keep building anyway.',
    habits: [
      { name: '10-Minute Stillness', mode: 'build' as const, frequency: 'daily' as const },
      { name: 'Breath Reset', mode: 'build' as const, frequency: 'daily' as const },
      { name: 'Morning Quiet', mode: 'build' as const, frequency: 'daily' as const },
      { name: 'Limit News Intake', mode: 'break' as const, frequency: 'daily' as const },
      { name: 'Evening Reflection', mode: 'build' as const, frequency: 'daily' as const },
      { name: 'Nature Walk', mode: 'build' as const, frequency: 'weekly' as const },
      { name: 'Device-Free Hour', mode: 'break' as const, frequency: 'daily' as const },
      { name: 'Weekly Solitude Block', mode: 'build' as const, frequency: 'weekly' as const },
      { name: 'Read a Wisdom Text', mode: 'build' as const, frequency: 'weekly' as const },
      { name: 'Meaning Check-In', mode: 'build' as const, frequency: 'monthly' as const },
    ],
  },
  {
    dir: 'West',
    arrow: '←',
    title: 'Growth and Mastery',
    note: 'Study, coding, projects, and sport are my training ground. For me it’s not about having—it’s about becoming capable. My West is discipline: patient repetition, craft, the steady step forward. It keeps me honest because it doesn’t accept excuses. It turns ideals into skills and dreams into evidence.',
    habits: [
      { name: 'Code for 1 Hour', mode: 'build' as const, frequency: 'daily' as const },
      { name: 'Deliberate Practice', mode: 'build' as const, frequency: 'daily' as const },
      { name: 'Workout', mode: 'build' as const, frequency: 'daily' as const },
      { name: 'Limit Distractions', mode: 'break' as const, frequency: 'daily' as const },
      { name: 'Study Session', mode: 'build' as const, frequency: 'weekly' as const },
      { name: 'Ship One Small Thing', mode: 'build' as const, frequency: 'weekly' as const },
      { name: 'Skill Drill', mode: 'build' as const, frequency: 'daily' as const },
      { name: 'Review Mistakes', mode: 'build' as const, frequency: 'weekly' as const },
      { name: 'Weekly Sprint', mode: 'build' as const, frequency: 'weekly' as const },
      { name: 'Monthly Review', mode: 'build' as const, frequency: 'monthly' as const },
    ],
  },
  {
    dir: 'South',
    arrow: '↓',
    title: 'Love and Care',
    note: 'Even when I’m angry at my family, there’s a core in me that says: “My children will have it better than I did.” I don’t just want to break away—I want to build a circle where it feels warm and safe. My South is protective care: loyalty, gentleness, responsibility, the willingness to repair instead of discard. It’s the part of me that measures success not only by achievement, but by whether people around me feel respected and held.',
    habits: [
      { name: 'Family Check-In', mode: 'build' as const, frequency: 'daily' as const },
      { name: 'Listen Without Fixing', mode: 'build' as const, frequency: 'daily' as const },
      { name: 'Repair One Thing', mode: 'build' as const, frequency: 'weekly' as const },
      { name: 'Acts of Care', mode: 'build' as const, frequency: 'daily' as const },
      { name: 'No Gossip', mode: 'break' as const, frequency: 'daily' as const },
      { name: 'Family Dinner', mode: 'build' as const, frequency: 'weekly' as const },
      { name: 'Gratitude Note', mode: 'build' as const, frequency: 'daily' as const },
      { name: 'Quality Time', mode: 'build' as const, frequency: 'weekly' as const },
      { name: 'Home Responsibility', mode: 'build' as const, frequency: 'daily' as const },
      { name: 'Budget Review', mode: 'build' as const, frequency: 'monthly' as const },
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
          <div
            className="rounded-lg border border-subtle p-4 shadow-sm"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="text-xl text-muted">{set.arrow}</span>
                <span className="text-strong">{set.title}</span>
              </h3>
              <p className="mt-2 text-sm text-muted">{set.note}</p>
              {set.disclaimer && <p className="mt-2 italic text-xs text-soft">{set.disclaimer}</p>}
            </div>

            <div className="mt-4">
              <div className="flex flex-wrap gap-3 justify-center">
                {set.habits.map((h) => (
                  <motion.button
                    key={h.name}
                    type="button"
                    onClick={() => handleAdd(h)}
                    className={`relative inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm transition-colors duration-150 transform-gpu align-middle ${h.mode === 'build' ? 'border-success' : 'border-danger'} text-strong hover:bg-surface-alt ${recentlyAdded.includes(h.name) ? 'cursor-not-allowed' : ''}`}
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
                            className="absolute inset-0 flex items-center justify-center pointer-events-none text-strong"
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
        <div className="text-center space-y-3">
          <p className="text-neutral-600 dark:text-neutral-300">
            When I put all of this together, I get a compass that keeps me from getting lost:
          </p>
          <p className="italic text-neutral-500">
            Freedom without love turns into loneliness.
            <br />
            Love without freedom turns into dependency.
            <br />
            Growth without silence turns into burnout.
            <br />
            Silence without growth turns into escape.
          </p>
          <p className="text-neutral-600 dark:text-neutral-300">
            My task is to hold all four directions—not as a perfect system, but as a daily practice.
            When I drift, I return: to truth, to care, to training, and to quiet.
          </p>
        </div>
      </section>
    </div>
  );
}
