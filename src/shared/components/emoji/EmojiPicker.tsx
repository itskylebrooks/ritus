import { useMotionPreferences } from '@/shared/animations';
import { emojiCategories, emojiIndex, EmojiItem } from '@/shared/constants/emojis';
import { useEmojiOfTheDay } from '@/shared/hooks/useEmojiOfTheDay';
import { useHabitStore } from '@/shared/store/store';
import { createEmojiRain } from '@/shared/utils/emojiRain';
import { CirclePlus } from 'lucide-react';
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';

/* eslint-disable no-empty */

function normalizeQuery(value: string) {
  return value
    .toLowerCase()
    .replace(/[_\s-]+/g, ' ')
    .trim();
}

export default function EmojiPicker() {
  const { emoji, setEmoji, clearEmoji, emojiId, recents } = useEmojiOfTheDay();
  const { prefersReducedMotion } = useMotionPreferences();
  const appliedCollectibles = useHabitStore((s) => s.progress.appliedCollectibles || {});
  const animStr = appliedCollectibles['animation'] || '';
  const hasEmojiRain = animStr.includes('anim_emoji_rain');
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [entering, setEntering] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const enterRaf = useRef<number | null>(null);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const categoryRefs = useMemo(() => new Map<string, HTMLDivElement | null>(), []);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const deferredSearch = useDeferredValue(search);
  const query = normalizeQuery(deferredSearch);

  const baseCats = useMemo(() => {
    const recentCat =
      recents.length > 0 ? [{ category: 'recent', categoryLabel: 'Recent', items: recents }] : [];
    return [...recentCat, ...emojiCategories];
  }, [recents]);

  const filteredCategories = useMemo(() => {
    if (!query) return baseCats;
    return baseCats
      .map((category) => {
        const items = category.items.filter((item) => item.searchText.includes(query));
        return { ...category, items };
      })
      .filter((category) => category.items.length > 0);
  }, [query, baseCats]);

  const handleSelect = (item: EmojiItem) => {
    const wasSelected = emojiId === item.id;
    if (wasSelected) {
      clearEmoji();
    } else {
      setEmoji(item);
      // Trigger emoji rain effect when new emoji is selected
      if (hasEmojiRain && !prefersReducedMotion) {
        createEmojiRain({ emoji: item.emoji });
      }
    }
    beginClose();
  };

  const CLOSE_DURATION = 220;

  const beginClose = useCallback(() => {
    if (!visible || closing) return;
    setClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setVisible(false);
      setClosing(false);
      setOpen(false);
    }, CLOSE_DURATION);
  }, [visible, closing]);

  useEffect(() => {
    if (open) {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      if (enterRaf.current) cancelAnimationFrame(enterRaf.current);
      setVisible(true);
      setClosing(false);
      setEntering(true);
      enterRaf.current = requestAnimationFrame(() => {
        enterRaf.current = requestAnimationFrame(() => setEntering(false));
      });
    } else if (visible) {
      setClosing(true);
      closeTimerRef.current = window.setTimeout(() => {
        setVisible(false);
        setClosing(false);
        setOpen(false);
      }, CLOSE_DURATION);
    }

    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      if (enterRaf.current) cancelAnimationFrame(enterRaf.current);
    };
  }, [open, visible]);

  useEffect(() => {
    if (!visible) {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      return;
    }

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') beginClose();
    };
    window.addEventListener('keydown', handleKey);

    let raf: number | null = null;
    try {
      const isCoarse =
        typeof window !== 'undefined' &&
        'matchMedia' in window &&
        window.matchMedia('(pointer: coarse)').matches;
      const isSmall =
        typeof window !== 'undefined' &&
        'matchMedia' in window &&
        window.matchMedia('(max-width: 768px)').matches;
      const shouldFocus = !(isCoarse && isSmall);
      if (shouldFocus) {
        raf = requestAnimationFrame(() => {
          inputRef.current?.focus();
          inputRef.current?.select();
        });
      }
    } catch {}

    const body = document.body;
    const prevOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      window.removeEventListener('keydown', handleKey);
      body.style.overflow = prevOverflow;
    };
  }, [visible, beginClose]);

  useEffect(() => {
    if (!emojiId) return;
    if (!emojiIndex.has(emojiId)) {
      clearEmoji();
    }
  }, [emojiId, clearEmoji]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          setSearch('');
          setActiveCategory(null);
          setOpen(true);
        }}
        className="inline-flex items-center h-10 text-2xl leading-none text-muted hover:text-strong transition-colors focus:outline-none no-focus-ring"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={
          emoji ? `Emoji of the day: ${emoji.label}. Click to change.` : 'Select emoji of the day'
        }
      >
        {emoji ? (
          <span aria-hidden className="inline-block align-baseline leading-none">
            {emoji.emoji}
          </span>
        ) : (
          <CirclePlus className="inline-block h-[1em] w-[1em] align-[-0.1em]" />
        )}
      </button>

      {visible && (
        <div
          className={`fixed inset-0 z-[80] flex items-center justify-center p-5 transition-colors duration-200 settings-overlay ${closing || entering ? 'bg-transparent' : 'bg-overlay backdrop-blur-sm'}`}
          onClick={() => {
            if (!closing) beginClose();
          }}
        >
          <div
            className={`w-full max-w-md rounded-2xl bg-surface-elevated p-3 ring-1 ring-black/5 dark:ring-neutral-700/5 border border-subtle overflow-hidden transition-all duration-200 settings-panel ${closing || entering ? 'opacity-0 scale-[0.95] translate-y-1 pointer-events-none' : 'opacity-100 scale-100 translate-y-0'}`}
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                      const firstCategory = filteredCategories[0];
                      const firstItem = firstCategory?.items?.[0];
                      if (firstItem) {
                        handleSelect(firstItem);
                      } else {
                        inputRef.current?.blur();
                      }
                    }
                  }}
                  placeholder="Search emoji..."
                  maxLength={50}
                  className="w-full rounded-xl border border-subtle bg-transparent px-3 py-2 outline-none ring-0 placeholder:text-muted focus:border-accent no-focus-ring text-base sm:text-sm text-strong"
                />
              </label>
            </div>
            <div className="sticky top-0 z-10 bg-surface-elevated/95 backdrop-blur supports-[backdrop-filter]:bg-surface-elevated/80">
              <div className="flex gap-1 overflow-x-auto px-3 py-1">
                {(query ? filteredCategories : baseCats).map((cat) => (
                  <button
                    key={cat.category}
                    type="button"
                    onClick={() => {
                      const el = categoryRefs.get(cat.category);
                      if (el) {
                        try {
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        } catch {
                          const scroller = listRef.current;
                          if (scroller) {
                            const rect = el.getBoundingClientRect();
                            const srect = scroller.getBoundingClientRect();
                            const top = scroller.scrollTop + (rect.top - srect.top);
                            scroller.scrollTo({ top, behavior: 'smooth' });
                          }
                        }
                        setActiveCategory(cat.category);
                      }
                    }}
                    className={`shrink-0 rounded-full px-3 py-1 text-xs border transition-colors ${
                      activeCategory === cat.category
                        ? 'border-accent text-strong'
                        : 'border-subtle text-muted hover:text-strong'
                    }`}
                  >
                    {cat.categoryLabel}
                  </button>
                ))}
              </div>
            </div>

            <div ref={listRef} className="max-h-[55vh] overflow-y-auto no-scrollbar px-3 py-3">
              {filteredCategories.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-sm text-muted">
                  No emojis match "{search}".
                </div>
              ) : (
                filteredCategories.map((category) => (
                  <div
                    key={category.category}
                    className="mb-4 last:mb-0 scroll-mt-3"
                    style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' }}
                    ref={(el) => categoryRefs.set(category.category, el)}
                  >
                    <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-soft">
                      {category.categoryLabel}
                    </div>
                    <div className="grid grid-cols-[repeat(6,3rem)] justify-between gap-y-2">
                      {category.items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelect(item)}
                          className={`group relative flex h-12 w-12 items-center justify-center rounded-md focus:outline-none ${
                            emojiId === item.id ? 'border border-accent rounded-md' : ''
                          }`}
                        >
                          <span
                            aria-hidden
                            className={`text-3xl leading-none transition-transform ${
                              prefersReducedMotion
                                ? ''
                                : 'duration-150 ease-out hover:scale-[1.18] active:scale-95'
                            }`}
                          >
                            {item.emoji}
                          </span>
                          <span className="sr-only">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
