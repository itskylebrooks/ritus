import { COLLECTIBLES } from '../../data/collectibles'
import { useHabitStore } from '../../store/store'
import type { CollectibleType } from '../../data/collectibles'

export default function CollectiblesStoreCard() {
  const points = useHabitStore((s) => s.progress.points || 0)
  const ownedArr = useHabitStore((s) => s.progress.ownedCollectibles || [])
  const owned = new Set(ownedArr)
  const buy = useHabitStore((s) => s.purchaseCollectible)

  const groups: { label: string; type: CollectibleType }[] = [
    { label: 'Clock styles', type: 'clock' },
    { label: 'Quote packs', type: 'quotes' },
    { label: 'Accent themes', type: 'accent' },
    { label: 'Mysterious relics', type: 'relic' },
  ]

  return (
    <div className="rounded-2xl border dark:border-neutral-700 p-5 shadow-sm bg-white dark:bg-neutral-950">
      <div className="mb-4 text-center uppercase tracking-wider text-sm md:text-base font-semibold text-neutral-600 dark:text-neutral-300">
        COLLECTIBLES STORE
      </div>

      <div className="text-xs text-center text-neutral-600 dark:text-neutral-400 mb-3">All items are placeholders for now — the store is in development.</div>

      <div className="space-y-5">
        {groups.map((g) => {
          const items = COLLECTIBLES.filter((i) => i.type === g.type).slice().sort((a, b) => {
            if (a.cost !== b.cost) return a.cost - b.cost
            return a.title.localeCompare(b.title)
          })
          return (
            <div key={g.type}>
              <div className="mb-2 text-sm font-medium text-neutral-800 dark:text-neutral-100">{g.label}</div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => {
                  const ItemIcon = item.icon
                  const Owned = owned.has(item.id)
                  const canBuy = !Owned && points >= item.cost
                  return (
                    <div key={item.id} className="rounded-xl border dark:border-neutral-700 p-3 transition-transform hover:-translate-y-0.5 flex flex-col">
                      <div className="flex items-center gap-2">
                        <ItemIcon className="h-5 w-5 text-black dark:text-white" />
                        <div className="font-medium text-neutral-900 dark:text-neutral-100">{item.title}</div>
                      </div>
                      <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-300 flex-1">{item.desc}</p>
                      <div className="mt-3 flex items-center justify-between text-sm" style={{ minHeight: 32 }}>
                        <span className="text-neutral-600 dark:text-neutral-300">{item.cost} pts</span>
                          <div className="flex-1 flex justify-center">
                            <span className="rounded-full border dark:border-neutral-700 px-2 py-0.5 text-[10px] uppercase tracking-wide text-neutral-600 dark:text-neutral-300">{item.rarity}</span>
                          </div>
                        {Owned ? (
                          <span className="inline-flex items-center justify-center h-8 px-3 rounded-lg border dark:border-neutral-700 text-xs text-neutral-600 dark:text-neutral-300">Owned</span>
                        ) : (
                          <button
                            onClick={() => canBuy && buy(item.id, item.cost)}
                            disabled={!canBuy}
                            className="inline-flex items-center justify-center rounded-lg bg-black h-8 px-3 text-xs text-white disabled:opacity-50 dark:bg-white dark:text-black"
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
