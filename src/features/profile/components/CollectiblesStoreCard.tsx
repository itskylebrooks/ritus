import type { CollectibleType } from '@/shared/constants/collectibles';
import { COLLECTIBLES } from '@/shared/constants/collectibles';
import { useHabitStore } from '@/shared/store/store';
import { useMemo, useState } from 'react';

const COLLECTIBLE_GROUPS: { label: string; type: CollectibleType }[] = [
  { label: 'Quote packs', type: 'quotes' },
  { label: 'Accent themes', type: 'accent' },
  { label: 'Mysterious relics', type: 'relic' },
];

export default function CollectiblesStoreCard() {
  const points = useHabitStore((s) => s.progress.points || 0);
  const ownedArr = useHabitStore((s) => s.progress.ownedCollectibles || []);
  const owned = useMemo(() => new Set(ownedArr), [ownedArr]);
  const applied = useHabitStore((s) => s.progress.appliedCollectibles || {});
  const buy = useHabitStore((s) => s.purchaseCollectible);
  const apply = useHabitStore((s) => s.applyCollectible);

  // transient icon flash state keyed by collectible id
  const [flash, setFlash] = useState<Record<string, boolean>>({});

  const triggerFlash = (id: string) => {
    setFlash((prev) => ({ ...prev, [id]: true }));
    // remove after animation completes to allow re-triggering
    window.setTimeout(() => {
      setFlash((prev) => ({ ...prev, [id]: false }));
    }, 700);
  };

  const groups = useMemo(
    () =>
      COLLECTIBLE_GROUPS.map((g) => ({
        ...g,
        items: COLLECTIBLES.filter((i) => i.type === g.type)
          .slice()
          .sort((a, b) => {
            if (a.cost !== b.cost) return a.cost - b.cost;
            return a.title.localeCompare(b.title);
          }),
      })),
    [],
  );

  return (
    <div>
      <div className="uppercase tracking-wider text-sm md:text-base font-semibold text-muted text-center">
        COLLECTIBLES STORE
      </div>

      <div className="space-y-4">
        {groups.map((g, index) => {
          const items = g.items;
          return (
            <div key={g.type} className={index === 0 ? 'mt-2' : undefined}>
              <div className="mb-2 text-sm font-medium text-strong text-center">{g.label}</div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => {
                  const ItemIcon = item.icon;
                  const Owned = owned.has(item.id);
                  const isImplemented = item.implemented ?? true;
                  const canBuy = !Owned && isImplemented && points >= item.cost;
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-subtle p-3 transform-gpu motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out hover:-translate-y-1 motion-reduce:transition-none motion-reduce:transform-none flex flex-col"
                      style={{ willChange: 'transform' }}
                    >
                      <div className="flex items-center gap-2">
                        <span className={flash[item.id] ? 'collectible-flash' : undefined}>
                          <ItemIcon className="h-5 w-5 text-accent" />
                        </span>
                        <div className="font-medium text-strong">{item.title}</div>
                      </div>
                      <p className="mt-2 text-xs text-muted flex-1">{item.desc}</p>
                      <div
                        className="mt-3 flex items-center justify-between text-sm"
                        style={{ minHeight: 32 }}
                      >
                        <span className="text-muted">{item.cost} pts</span>
                        <div className="flex-1 flex justify-center">
                          <span className="rounded-full border border-subtle px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                            {item.rarity}
                          </span>
                        </div>
                        {Owned ? (
                          // Owned items show an Apply button so the user can activate them.
                          applied[item.type] === item.id ? (
                            // When already applied, show a button that allows the user to unapply
                            <button
                              onClick={() => {
                                const ok = apply(item.id);
                                if (ok) triggerFlash(item.id);
                              }}
                              className="inline-flex items-center justify-center rounded-lg border border-subtle h-8 px-3 text-xs text-muted hover-nonaccent"
                            >
                              Unapply
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                const ok = apply(item.id);
                                if (ok) triggerFlash(item.id);
                              }}
                              className="inline-flex items-center justify-center rounded-lg bg-accent border border-subtle h-8 px-3 text-xs text-inverse hover-accent-fade"
                            >
                              Apply
                            </button>
                          )
                        ) : (
                          <button
                            onClick={() => {
                              if (!canBuy) return;
                              const ok = buy(item.id, item.cost);
                              if (ok) {
                                // Celebrate successful purchase
                                import('@/shared/utils/confetti').then(({ default: fire }) =>
                                  fire(),
                                );
                              }
                            }}
                            disabled={!canBuy}
                            title={isImplemented ? undefined : 'Coming soon'}
                            className={
                              isImplemented
                                ? 'inline-flex items-center justify-center rounded-lg bg-accent h-8 px-3 text-xs text-inverse hover-accent-fade disabled:opacity-50'
                                : 'inline-flex items-center justify-center rounded-lg border border-subtle h-8 px-3 text-xs text-muted disabled:opacity-50'
                            }
                          >
                            {isImplemented ? 'Unlock' : 'Soon'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
