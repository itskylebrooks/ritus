import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CirclePlus, XCircle } from 'lucide-react'
import { emojiCategories, emojiIndex, EmojiItem } from '@/shared/constants/emojis'
import { useEmojiOfTheDay } from '@/shared/hooks/useEmojiOfTheDay'
import useThemeStore from '@/shared/store/theme'

function normalizeQuery(value: string) {
  return value.toLowerCase().replace(/[_\s-]+/g, ' ').trim()
}

export default function EmojiPicker() {
  const { emoji, setEmoji, clearEmoji, emojiId, recents } = useEmojiOfTheDay()
  const theme = useThemeStore((s) => s.theme)
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const closeTimerRef = useRef<number | null>(null)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const categoryRefs = useMemo(() => new Map<string, HTMLDivElement | null>(), [])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const query = normalizeQuery(search)

  const baseCats = useMemo(() => {
    const recentCat = recents.length > 0 ? [{ category: 'recent', categoryLabel: 'Recent', items: recents }] : []
    return [...recentCat, ...emojiCategories]
  }, [recents])

  const filteredCategories = useMemo(() => {
    if (!query) return baseCats
    return baseCats
      .map((category) => {
        const items = category.items.filter((item) => item.searchText.includes(query))
        return { ...category, items }
      })
      .filter((category) => category.items.length > 0)
  }, [query, baseCats])

  const handleSelect = (item: EmojiItem) => {
    if (emojiId === item.id) {
      clearEmoji()
    } else {
      setEmoji(item)
    }
    beginClose()
  }

  // Modal open/close helpers (match Settings modal behavior)
  const CLOSE_DURATION = 280
  function beginClose() {
    if (!open || closing) return
    setClosing(true)
    closeTimerRef.current = window.setTimeout(() => {
      setClosing(false)
      setOpen(false)
    }, CLOSE_DURATION + 40)
  }

  useEffect(() => {
    if (!open) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') beginClose()
    }
    window.addEventListener('keydown', handleKey)
    const id = requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = prev
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current)
    }
  }, [open])

  // keep emoji selection valid even if assets change
  useEffect(() => {
    if (!emojiId) return
    if (!emojiIndex.has(emojiId)) {
      clearEmoji()
    }
  }, [emojiId, clearEmoji])

  const imageStyle = theme === 'dark' ? { filter: 'invert(1) brightness(1.1)' } : undefined

  return (
    <div className="relative" ref={containerRef}>

      <button
        type="button"
        onClick={() => { setSearch(''); setActiveCategory(null); setOpen(true) }}
        className="h-5 w-5 inline-flex items-center justify-center align-baseline rounded-md text-muted hover:text-strong transition-colors focus:outline-none no-focus-ring"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={emoji ? `Emoji of the day: ${emoji.label}. Click to change.` : 'Select emoji of the day'}
      >
        {emoji ? (
          <img
            src={emoji.path}
            alt={emoji.label}
            className="h-5 w-5 transition-transform duration-150 ease-out align-baseline"
            style={imageStyle}
          />
        ) : (
          <CirclePlus className="h-4 w-4" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <div
            className={`fixed inset-0 z-[80] flex items-center justify-center p-5 settings-overlay ${closing ? 'closing bg-transparent' : 'bg-overlay backdrop-blur-sm'}`}
            onClick={beginClose}
          >
            <div
              className={`w-full max-w-md rounded-2xl bg-surface-elevated p-3 ring-1 ring-black/5 dark:ring-neutral-700/5 border border-subtle overflow-hidden settings-panel ${closing ? 'closing' : ''}`}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Emoji of the day"
            >
            <div className="bg-surface-elevated px-3 py-2">
              <label className="flex items-center">
                <input
                  ref={inputRef}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search emoji..."
                  className="w-full rounded-xl border border-subtle bg-transparent px-3 py-2 outline-none ring-0 placeholder:text-muted focus:border-accent no-focus-ring text-sm text-strong"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="text-muted hover:text-strong"
                    aria-label="Clear search"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </label>
            </div>
            {/* Category tabs */}
            <div className="sticky top-0 z-10 bg-surface-elevated/95 backdrop-blur supports-[backdrop-filter]:bg-surface-elevated/80">
              <div className="flex gap-1 overflow-x-auto px-3 py-1">
                {(query ? filteredCategories : baseCats).map((cat) => (
                  <button
                    key={cat.category}
                    type="button"
                    onClick={() => {
                      const el = categoryRefs.get(cat.category)
                      if (el && listRef.current) {
                        listRef.current.scrollTo({ top: el.offsetTop - 4, behavior: 'smooth' })
                        setActiveCategory(cat.category)
                      }
                    }}
                    className={`shrink-0 rounded-full px-3 py-1 text-xs border transition-colors ${
                      activeCategory === cat.category ? 'border-accent text-strong' : 'border-subtle text-muted hover:text-strong'
                    }`}
                  >
                    {cat.categoryLabel}
                  </button>
                ))}
              </div>
            </div>

            <div ref={listRef} className="max-h-[55vh] overflow-y-auto px-3 py-3">
              {filteredCategories.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-sm text-muted">
                  No emojis match "{search}".
                </div>
              ) : (
                filteredCategories.map((category) => (
                  <div
                    key={category.category}
                    className="mb-4 last:mb-0"
                    ref={(el) => categoryRefs.set(category.category, el)}
                  >
                    <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-soft">
                      {category.categoryLabel}
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {category.items.map((item) => (
                        <motion.button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelect(item)}
                          className={`group relative flex h-10 w-10 items-center justify-center rounded-md focus:outline-none ${
                            emojiId === item.id ? 'border border-accent rounded-md' : ''
                          }`}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                        >
                          <img
                            src={item.path}
                            alt={item.label}
                            className="h-8 w-8 pointer-events-none"
                            style={imageStyle}
                          />
                          <span className="sr-only">{item.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
