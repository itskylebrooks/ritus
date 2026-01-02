import { Lightbulb } from 'lucide-react';

export default function Inspiration() {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
      {/* Hero */}
      <section>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Lightbulb className="w-5 h-5" /> Inspiration
        </h2>
        <p className="mt-4 text-neutral-600 dark:text-neutral-300">
          Ritus isn’t about control. It’s about rhythm — the daily choices that makes you better.
          This page gathers small insights and examples to help you understand habits, build them
          with intention, and replace what holds you back.
        </p>
      </section>

      {/* How habits form */}
      <section>
        <h2 className="text-lg font-medium">How habits really form</h2>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          A habit isn’t a rule you follow — it’s a vote for the person you want to become.
          Consistency matters more than intensity: five minutes done every day beats an hour done
          once a week. Most habits fail because people expect motivation to last forever. But
          discipline isn’t about feeling ready — it’s about making action easier than resistance.
        </p>
        <div
          className="mt-4 rounded-md border border-subtle p-3"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          <p className="text-sm italic text-center text-muted">
            “Make it obvious, make it easy, make it rewarding.” — three quiet laws of behavioral
            design.
          </p>
        </div>
      </section>

      {/* Why breaking habits */}
      <section>
        <h2 className="text-lg font-medium">Why breaking habits feels harder</h2>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          Bad habits often solve a real need — stress, comfort, boredom. That’s why willpower alone
          rarely works. To stop something, you have to replace it with something better. “Don’t
          scroll” becomes “go for a walk.” “Don’t drink” becomes “call a friend.” Every habit you
          break must make space for something gentler to take its place.
        </p>
      </section>

      {/* How to start new habits */}
      <section>
        <h2 className="text-lg font-medium">How to start new habits</h2>
        <ul className="mt-2 space-y-2 text-neutral-600 dark:text-neutral-300">
          <li>
            Start embarrassingly small. Do less than you think you should — consistency first,
            expansion later.
          </li>
          <li>
            Pair new with existing. Attach a habit to a trigger (“after coffee, I’ll stretch”).
          </li>
          <li>Forgive breaks. Missing one day doesn’t matter. Missing twice does.</li>
          <li>Track to remember, not to punish. The goal is awareness, not perfection.</li>
        </ul>
      </section>

      {/* Compass content moved to its own page */}
    </div>
  );
}
