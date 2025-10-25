import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useHabitStore } from '../store/store'
import type { Frequency } from '../types'

export default function AddHabit() {
  const addHabit = useHabitStore((s) => s.addHabit)
  const [name, setName] = useState('')
  const [frequency, setFrequency] = useState<Frequency>('daily')
  const [weeklyTarget, setWeeklyTarget] = useState<number>(1)
  const [mode, setMode] = useState<'build' | 'break'>('build')
  const buildPlaceholder = 'e.g., Morning Run'
  const breakPlaceholder = 'e.g., No Alcohol'
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState<string>(mode === 'build' ? buildPlaceholder : breakPlaceholder)
  const typingTimer = useRef<number | null>(null)
  const firstMount = useRef(true)
  const [isReady, setIsReady] = useState(false)

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

  // Mark app ready after first mount to avoid initial load animations in dev StrictMode
  useEffect(() => { setIsReady(true) }, [])

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
  <motion.form layout onSubmit={submit} className="flex flex-col gap-3 rounded-2xl border dark:border-neutral-700 p-4 shadow-sm sm:flex-row sm:items-end">
  <motion.div className="flex-1" layout="position" transition={{ layout: { type: 'spring', stiffness: 300, damping: 30 } }} style={{ minWidth: 0 }}>
        <label className="block text-sm text-neutral-600 dark:text-neutral-300">Habit name</label>
        <input
          className="mt-1 w-full rounded-xl border bg-white px-3 py-2 outline-none ring-0 placeholder:text-neutral-400 focus:border-black/40 dark:bg-neutral-950 dark:border-neutral-700 dark:focus:border-neutral-700/50"
          placeholder={displayedPlaceholder}
          value={name}
          onChange={(e) => {
            if (typingTimer.current) {
              clearTimeout(typingTimer.current)
              typingTimer.current = null
            }
            setName(e.target.value)
          }}
          onFocus={() => {
            if (typingTimer.current) {
              clearTimeout(typingTimer.current)
              typingTimer.current = null
            }
          }}
        />
      </motion.div>
  <motion.div layout transition={{ layout: { type: 'spring', stiffness: 300, damping: 30 } }} style={{ minWidth: 0 }}>
        <label className="block text-sm text-neutral-600 dark:text-neutral-300">I want to</label>
        <div className="mt-1 flex gap-2">
          <label
            className={"px-3 py-2 rounded-xl border dark:border-neutral-700 cursor-pointer transform transition-all duration-150 ease-in-out " + (mode === 'build' ? 'bg-black text-white scale-100 shadow-md' : 'bg-white text-black scale-95')}
          >
            <input className="sr-only" type="radio" name="mode" checked={mode === 'build'} onChange={() => setMode('build')} />
            Build
          </label>

          <label
            className={"px-3 py-2 rounded-xl border dark:border-neutral-700 cursor-pointer transform transition-all duration-150 ease-in-out " + (mode === 'break' ? 'bg-black text-white scale-100 shadow-md' : 'bg-white text-black scale-95')}
          >
            <input className="sr-only" type="radio" name="mode" checked={mode === 'break'} onChange={() => setMode('break')} />
            Break
          </label>
        </div>
  </motion.div>

  <motion.div layout transition={{ layout: { type: 'spring', stiffness: 300, damping: 30 } }} style={{ minWidth: 0 }}>
        <label className="block text-sm text-neutral-600 dark:text-neutral-300">Frequency</label>
        <select
          className="mt-1 w-full rounded-xl border bg-white px-3 py-2 dark:bg-neutral-950 dark:border-neutral-700"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as Frequency)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
  </motion.div>
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
            <select
              className="mt-1 w-full rounded-xl border bg-white px-3 py-2 dark:bg-neutral-950 dark:border-neutral-700"
              value={weeklyTarget}
              onChange={(e) => setWeeklyTarget(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n} day{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        layout
        transition={{ layout: { type: 'spring', stiffness: 300, damping: 30 } }}
        style={{ minWidth: 0 }}
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-2 text-white transition active:scale-[.98] dark:bg-white dark:text-black"
        aria-label="Add habit"
      >
        <Plus className="h-4 w-4" /> Add
      </motion.button>
  </motion.form>
  )
}
