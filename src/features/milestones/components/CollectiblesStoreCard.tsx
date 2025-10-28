import { useState } from 'react'
import { COLLECTIBLES } from '@/shared/constants/collectibles'
import { useHabitStore } from '@/shared/store/store'
import type { CollectibleType } from '@/shared/constants/collectibles'

export default function CollectiblesStoreCard() {
  const points = useHabitStore((s) => s.progress.points || 0)
  const ownedArr = useHabitStore((s) => s.progress.ownedCollectibles || [])
  const owned = new Set(ownedArr)
  const applied = useHabitStore((s) => s.progress.appliedCollectibles || {})
  const buy = useHabitStore((s) => s.purchaseCollectible)
  const apply = useHabitStore((s) => (s as any).applyCollectible as (id: string) => boolean)

  // transient icon flash state keyed by collectible id
  const [flash, setFlash] = useState<Record<string, boolean>>({})

  const triggerFlash = (id: string) => {
    setFlash((prev) => ({ ...prev, [id]: true }))
    // remove after animation completes to allow re-triggering
    window.setTimeout(() => {
      setFlash((prev) => ({ ...prev, [id]: false }))
    }, 700)
  }

  const groups: { label: string; type: CollectibleType }[] = [
    { label: 'Clock styles', type: 'clock' },
    { label: 'Quote packs', type: 'quotes' },
    { label: 'Accent themes', type: 'accent' },
    { label: 'Mysterious relics', type: 'relic' },
  ]

  return (
    <div className="rounded-2xl border border-subtle p-5 shadow-sm bg-surface-elevated dark:bg-[#000000]">
      <div className="mb-4 text-center uppercase tracking-wider text-sm md:text-base font-semibold text-muted">
        COLLECTIBLES STORE
      </div>

      <div className="text-xs text-center text-muted mb-3">All items are placeholders for now — the store is in development.</div>

      <div className="space-y-5">
        {groups.map((g) => {
          const items = COLLECTIBLES.filter((i) => i.type === g.type).slice().sort((a, b) => {
            if (a.cost !== b.cost) return a.cost - b.cost
            return a.title.localeCompare(b.title)
          })
          return (
            <div key={g.type}>
              <div className="mb-2 text-sm font-medium text-strong">{g.label}</div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => {
                  const ItemIcon = item.icon
                  const Owned = owned.has(item.id)
                  const canBuy = !Owned && points >= item.cost
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-subtle p-3 transform-gpu motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out hover:-translate-y-1 motion-reduce:transition-none motion-reduce:transform-none flex flex-col bg-[#f9fafb] dark:bg-[#0b0b0b]"
                      style={{ willChange: 'transform' }}
                    >
                      <div className="flex items-center gap-2">
                        <span className={flash[item.id] ? 'collectible-flash' : undefined}>
                          <ItemIcon className="h-5 w-5 text-accent" />
                        </span>
                        <div className="font-medium text-strong">{item.title}</div>
                      </div>
                      <p className="mt-2 text-xs text-muted flex-1">{item.desc}</p>
                      <div className="mt-3 flex items-center justify-between text-sm" style={{ minHeight: 32 }}>
                        <span className="text-muted">{item.cost} pts</span>
                          <div className="flex-1 flex justify-center">
                            <span className="rounded-full border border-subtle px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">{item.rarity}</span>
                          </div>
                        {Owned ? (
                          // Owned items show an Apply button so the user can activate them.
                          applied[item.type] === item.id ? (
                            // When already applied, show a button that allows the user to unapply
                            <button
                              onClick={() => {
                                const ok = apply(item.id)
                                if (ok) triggerFlash(item.id)
                              }}
                              className="inline-flex items-center justify-center rounded-lg border border-subtle h-8 px-3 text-xs text-muted hover-nonaccent"
                            >
                              Unapply
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                const ok = apply(item.id)
                                if (ok) triggerFlash(item.id)
                              }}
                              className="inline-flex items-center justify-center rounded-lg bg-accent border border-subtle h-8 px-3 text-xs text-inverse hover-accent-fade"
                            >
                              Apply
                            </button>
                          )
                        ) : (
                            <button
                              onClick={() => {
                                if (!canBuy) return
                                const ok = buy(item.id, item.cost)
                                if (ok) {
                                  // Celebrate successful purchase
                                  import('@/shared/utils/confetti').then(({ default: fire }) => fire())
                                }
                              }}
                              disabled={!canBuy}
                              className="inline-flex items-center justify-center rounded-lg bg-accent h-8 px-3 text-xs text-inverse hover-accent-fade disabled:opacity-50"
                            >
                              Unlock
                            </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
