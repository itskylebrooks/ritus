export default function Sync() {
  return (
    <div className="allow-select prose prose-neutral dark:prose-invert max-w-none space-y-8">
      <section>
        <h2 className="text-xl font-semibold">Sync</h2>
        <p className="mt-4 text-neutral-600 dark:text-neutral-300">
          Sync is an optional feature planned for Ritus. It is designed for people who use
          Ritus on multiple devices and want their habits, progress, and preferences to stay in
          sync automatically.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium">What sync will do</h2>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          When sync is available, Ritus will keep a secure copy of your personal app data
          up to date so you can move between devices without manual transfers. The goal is simple:
          open Ritus anywhere and continue with the same habits, streaks, trophies, and settings.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium">What sync will not do</h2>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          Sync will not lock core habit tracking behind a paywall. Ritus stays fully usable
          without signing in, and local-only use remains supported.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium">Local-first stays the default</h2>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          Even with sync, your data will still exist on your device. Sync is intended as
          convenience, not a requirement. If you stay offline, your normal Ritus workflow does not
          change.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium">Export and import remain available</h2>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          You can still export backups and import them whenever you want. Sync is meant to
          reduce manual work, not remove your control over data portability.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium">Why it's a paid feature</h2>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          Sync has ongoing costs: secure servers, storage, and maintenance. A small subscription
          would cover those costs and help support long-term development of Ritus. If you choose
          to pay for sync, you are paying for convenience and reliability across devices, not for
          access to basic habit tracking.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium">Status</h2>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          Sync is not implemented yet. This page exists to document the direction clearly
          before launch. When it becomes available, you will be able to decide whether to enable
          it, and Ritus will remain usable either way.
        </p>
      </section>
    </div>
  );
}
