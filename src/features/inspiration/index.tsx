import { Lightbulb } from 'lucide-react';

export default function Inspiration() {
  return (
    <div className="allow-select prose prose-neutral dark:prose-invert max-w-none space-y-8">
      {/* Hero */}
      <section>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Lightbulb className="w-5 h-5" /> Inspiration
        </h2>
        <p className="mt-4 text-neutral-600 dark:text-neutral-300">
          Ritus isn’t about control. It’s about rhythm—the small choices that shape who you become.
          This page is grounded in ideas from James Clear’s <i>Atomic Habits</i>: habits aren’t
          built by willpower alone, but by shaping the system around you so the right action becomes
          the easiest action.
        </p>
      </section>
      <div className="border-t border-subtle" />
      {/* How habits form */}
      <section>
        <h2 className="text-lg font-medium">How habits really form</h2>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          <i>Atomic Habits</i> frames habits as identity in motion: every repetition is a vote for
          the kind of person you want to be. The goal isn’t a perfect streak—it’s becoming someone
          who returns. Consistency matters more than intensity because habits are strengthened by
          repetition, not ambition. Most habits fail when people rely on motivation, which naturally
          rises and falls. A better approach is to lower friction: make the good habit easier to
          start, and make the bad habit harder to repeat.
        </p>
        <p className="mt-4 italic text-muted">
          Clear summarizes this as the Four Laws of Behavior Change: make it obvious, make it
          attractive, make it easy, and make it satisfying.
        </p>
      </section>
      <div className="border-t border-subtle" />

      {/* Why breaking habits */}
      <section>
        <h2 className="text-lg font-medium">Why breaking habits feels harder</h2>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          Bad habits often exist for a reason. They deliver immediate relief—less stress, less
          boredom, a quick hit of comfort. <i>Atomic Habits</i> emphasizes that you don’t simply
          “remove” a habit; you replace the cue → craving → response → reward loop with a response
          that serves you better. If you only fight the behavior without addressing the reward,
          you’ll keep snapping back.
        </p>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          Instead of “don’t scroll,” you design an alternative that still meets the need: “when I
          feel restless, I stand up and walk for two minutes.” Instead of “don’t snack,” you change
          the environment so the default is easier: healthier food visible, tempting food less
          available.
        </p>
      </section>
      <div className="border-t border-subtle" />
      {/* How to start new habits */}
      <section>
        <h2 className="text-lg font-medium">How to start new habits</h2>
        <ul className="mt-2 space-y-2 text-neutral-600 dark:text-neutral-300">
          <li>
            <strong>Start smaller than your pride wants.</strong> In <i>Atomic Habits</i>, a habit
            should be easy enough that you can do it even on a bad day. Build the identity first;
            increase the effort later.
          </li>
          <li>
            <strong>Attach it to an existing cue.</strong> Use habit stacking: “After I pour my
            coffee, I do one stretch.” When the cue is stable, the habit becomes stable.
          </li>
          <li>
            <strong>Design the environment.</strong> Put the right tool where you’ll see it. Remove
            friction from the habit you want and add friction to the habit you don’t.
          </li>
          <li>
            <strong>Protect the streak by protecting the return.</strong> Missing once is an event;
            missing twice is the beginning of a new habit. Your goal is not perfection—it’s getting
            back on track quickly.
          </li>
          <li>
            <strong>Track to remember, not to punish.</strong> Ritus is a mirror, not a judge: it
            helps you notice patterns and keep rhythm, so the system supports you even when
            motivation doesn’t.
          </li>
        </ul>
      </section>

      {/* Compass content moved to its own page */}
    </div>
  );
}
