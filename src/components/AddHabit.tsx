import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronDown } from 'lucide-react'
import { useHabitStore } from '../store/store'
import type { Frequency } from '../types'
import { HABIT_SUGGESTIONS } from '../data/habitSuggestions'

export default function AddHabit() {
  const addHabit = useHabitStore((s) => s.addHabit)
  const [name, setName] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const [frequency, setFrequency] = useState<Frequency>('daily')
  const [weeklyTarget, setWeeklyTarget] = useState<number>(1)
  const [mode, setMode] = useState<'build' | 'break'>('build')
  const buildPlaceholder = 'e.g., Morning Run'
  const breakPlaceholder = 'e.g., No Alcohol'
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState<string>(mode === 'build' ? buildPlaceholder : breakPlaceholder)
  const typingTimer = useRef<number | null>(null)
  const firstMount = useRef(true)
  const [isReady, setIsReady] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    try {
  addHabit(name.trim(), frequency, weeklyTarget, mode)
    } catch (err) {
      // on some mobile browsers/storage modes this can throw (e.g., blocked storage or missing APIs)
      // surface to console and avoid crashing the UI
      // keep reset of inputs only if add succeeded; here we still reset so user can retry
      // developer can inspect errors via remote debugging
      // eslint-disable-next-line no-console
      console.error('Failed to add habit', err)
    }
    setName('')
    setFrequency('daily')
  setWeeklyTarget(1)
  setMode('build')
  }

  function selectSuggestion(s: string) {
    setName(s.slice(0, 60))
    setShowSuggestions(false)
    setActiveIndex(-1)
  }

  // Mark app ready after first mount to avoid initial load animations in dev StrictMode
  useEffect(() => { setIsReady(true) }, [])

  // Close suggestions on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return
      if (e.target instanceof Node && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  useEffect(() => {
    // Don't animate on first mount
    if (firstMount.current || !isReady) {
      firstMount.current = false
      return
    }

    // Only animate if input is empty
    if (name.trim()) return

    const target = mode === 'build' ? buildPlaceholder : breakPlaceholder
    // clear any existing timer
    if (typingTimer.current) {
      clearTimeout(typingTimer.current)
      typingTimer.current = null
    }

    setDisplayedPlaceholder('')
    let i = 0
    const step = () => {
      i += 1
      setDisplayedPlaceholder(target.slice(0, i))
      if (i < target.length) {
        typingTimer.current = window.setTimeout(step, 28)
      } else {
        typingTimer.current = null
      }
    }

    // small initial delay then start typing
    typingTimer.current = window.setTimeout(step, 120)

    return () => {
      if (typingTimer.current) {
        clearTimeout(typingTimer.current)
        typingTimer.current = null
      }
    }
  }, [mode, name])

  return (
  <motion.form layout onSubmit={submit} className="flex flex-col gap-3 rounded-2xl border dark:border-neutral-700 p-3 shadow-sm sm:flex-row sm:items-end">
  <motion.div className="flex-1" layout="position" transition={{ layout: { type: 'spring', stiffness: 300, damping: 30 } }} style={{ minWidth: 0 }}>
        <div className="flex items-baseline justify-between">
          <label className="block text-sm text-neutral-600 dark:text-neutral-300">
            Habit name {name.length > 0 && <span className="ml-1">({name.length}/60)</span>}
          </label>
        </div>
        <div className="relative mt-1" ref={wrapperRef}>
          <input
            className="w-full rounded-xl border bg-white px-3 py-2 outline-none ring-0 placeholder:text-neutral-400 focus:border-black/40 dark:bg-neutral-950 dark:border-neutral-700 dark:focus:border-neutral-700/50"
            placeholder={displayedPlaceholder}
            value={name}
            maxLength={60}
            onChange={(e) => {
              if (typingTimer.current) {
                clearTimeout(typingTimer.current)
                typingTimer.current = null
              }
              const val = e.target.value.slice(0, 60)
              setName(val)
              // update suggestions
              const q = val.trim().toLowerCase()
              if (q.length === 0) {
                setFilteredSuggestions([])
                setShowSuggestions(false)
                setActiveIndex(-1)
              } else {
                const filtered = HABIT_SUGGESTIONS.filter((s) => s.toLowerCase().includes(q)).slice(0, 8)
                setFilteredSuggestions(filtered)
                setShowSuggestions(filtered.length > 0)
                setActiveIndex(-1)
              }
            }}
            onFocus={() => {
              if (typingTimer.current) {
                clearTimeout(typingTimer.current)
                typingTimer.current = null
              }
              // if we have text, show suggestions
              if (name.trim().length > 0) {
                const q = name.trim().toLowerCase()
                const filtered = HABIT_SUGGESTIONS.filter((s) => s.toLowerCase().includes(q)).slice(0, 8)
                setFilteredSuggestions(filtered)
                setShowSuggestions(filtered.length > 0)
              }
            }}
            onKeyDown={(e) => {
              if (!showSuggestions) return
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActiveIndex((i) => Math.min(i + 1, filteredSuggestions.length - 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActiveIndex((i) => Math.max(i - 1, 0))
              } else if (e.key === 'Enter') {
                if (activeIndex >= 0 && filteredSuggestions[activeIndex]) {
                  e.preventDefault()
                  selectSuggestion(filteredSuggestions[activeIndex])
                }
              } else if (e.key === 'Escape') {
                setShowSuggestions(false)
                setActiveIndex(-1)
              }
            }}
          />

          <AnimatePresence>
            {showSuggestions && filteredSuggestions.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.12 }}
                role="listbox"
                aria-label="Habit suggestions"
                className="absolute left-0 right-0 z-50 mt-2 rounded-lg border bg-white shadow-lg dark:bg-neutral-950 dark:border-neutral-700"
                // show only 5 items worth of height; make the list scrollable for more
                style={{ maxHeight: 5 * 40, overflowY: 'auto' }}
              >
                {filteredSuggestions.map((s, idx) => (
                  <li
                    key={s}
                    role="option"
                    aria-selected={activeIndex === idx}
                    onMouseDown={(ev) => {
                      // use onMouseDown to avoid losing focus before click
                      ev.preventDefault()
                      selectSuggestion(s)
                    }}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={
                      'cursor-pointer px-3 py-2 text-sm ' + (activeIndex === idx ? 'bg-neutral-100 dark:bg-neutral-800' : 'hover:bg-neutral-50 dark:hover:bg-neutral-900')
                    }
                  >
                    {s}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
  {/* On mobile: show 'I want to' and 'Frequency' side-by-side (two columns). */}
  <div className="grid grid-cols-2 gap-3" style={{ minWidth: 0 }}>
    <motion.div layout transition={{ layout: { type: 'spring', stiffness: 300, damping: 30 } }} style={{ minWidth: 0 }}>
      <label className="block text-sm text-neutral-600 dark:text-neutral-300">I want to</label>
      <div className="mt-1 flex gap-2">
        <label
          className={"px-3 py-2 rounded-xl border dark:border-neutral-700 cursor-pointer transform transition-all duration-150 ease-in-out " + (mode === 'build' ? 'bg-black text-white dark:bg-white dark:text-black scale-100 shadow-md' : 'bg-white text-black dark:bg-transparent dark:text-neutral-300 scale-95 hover:bg-neutral-700 hover:text-white dark:hover:bg-neutral-700 dark:hover:text-white')}
        >
          <input className="sr-only" type="radio" name="mode" checked={mode === 'build'} onChange={() => setMode('build')} />
          Build
        </label>

        <label
          className={"px-3 py-2 rounded-xl border dark:border-neutral-700 cursor-pointer transform transition-all duration-150 ease-in-out " + (mode === 'break' ? 'bg-black text-white dark:bg-white dark:text-black scale-100 shadow-md' : 'bg-white text-black dark:bg-transparent dark:text-neutral-300 scale-95 hover:bg-neutral-700 hover:text-white dark:hover:bg-neutral-700 dark:hover:text-white')}
        >
          <input className="sr-only" type="radio" name="mode" checked={mode === 'break'} onChange={() => setMode('break')} />
          Break
        </label>
      </div>
    </motion.div>

      <motion.div layout transition={{ layout: { type: 'spring', stiffness: 300, damping: 30 } }} style={{ minWidth: 0 }}>
      <label className="block text-sm text-neutral-600 dark:text-neutral-300">Frequency</label>
      <div className="relative mt-1">
        <select
          className="appearance-none mt-0 w-full rounded-xl border bg-white px-3 py-2 pr-9 dark:bg-neutral-950 dark:border-neutral-700"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as Frequency)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-300" />
      </div>
    </motion.div>
  </div>
  <AnimatePresence initial={false} mode="popLayout">
        {frequency === 'weekly' && (
          <motion.div
            key="days-week"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            layout
            style={{ minWidth: 0 }}
          >
            <label className="block text-sm text-neutral-600 dark:text-neutral-300">Days / week</label>
            <div className="relative mt-1">
              <select
                className="appearance-none mt-0 w-full rounded-xl border bg-white px-3 py-2 pr-9 dark:bg-neutral-950 dark:border-neutral-700"
                value={weeklyTarget}
                onChange={(e) => setWeeklyTarget(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n} day{n > 1 ? 's' : ''}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-300" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        layout
        transition={{ layout: { type: 'spring', stiffness: 300, damping: 30 } }}
        style={{ minWidth: 0 }}
        type="submit"
  className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-2 text-white transition-colors duration-150 ease-in-out hover:bg-neutral-600 active:scale-[.98] dark:bg-white dark:text-black dark:hover:bg-neutral-300"
        aria-label="Add habit"
      >
        <Plus className="h-4 w-4" /> Add
      </motion.button>
  </motion.form>
  )
}
