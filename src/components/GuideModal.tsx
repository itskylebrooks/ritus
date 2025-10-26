import { useState, useEffect, useRef } from 'react'
import defaultHabits from '../store/defaultHabits'
import { useHabitStore } from '../store/store'

interface GuideModalProps {
  open: boolean
  onClose: () => void
  onLoadExample?: () => void
}

type GuideStep = { title: string; body: string }
const STEPS: GuideStep[] = [
  {
    title: 'Welcome to Ritus',
    body: 'Ritus helps you build or break habits. New: build/break modes, weekly targets, streaks, points, archive and export — all local-first.'
  },
  {
    title: 'Create a habit',
    body: 'Tap Add, name your habit, choose Daily or Weekly. For weekly habits set a weekly target (how many days/week count).' 
  },
  {
    title: 'Track completions',
    body: 'Tap Done on a card or use the week strip to mark days. Weekly habits count when you meet the weekly target; gaps are normal — pick up where you left off.'
  },
  {
    title: 'Points & streaks',
    body: 'Completions earn points and grow streaks. Header and Insights show totals and weekly percent. Milestones give bonus points for long streaks.'
  },
  {
    title: 'Manage & backup',
    body: 'Edit habits with the pencil, archive finished ones, or export/import JSON from Settings. Data stays on your device unless you export or opt into sync.'
  },
  {
    title: 'Try example data',
    body: "Click 'Load data' below to populate sample habits. If you already have data you'll be asked to confirm; loading will replace your current habits."
  }
]

type LayerPhase = 'enter' | 'exit'
type LayerDir = 'forward' | 'back'
interface StepLayer { key: number; idx: number; phase: LayerPhase; dir: LayerDir }

export default function GuideModal({ open, onClose, onLoadExample }: GuideModalProps) {
  const [step, setStep] = useState(0)
  const [renderedSteps, setRenderedSteps] = useState<StepLayer[]>([{ key: 0, idx: 0, phase: 'enter', dir: 'forward' }])
  const [visible, setVisible] = useState(open)
  const [closing, setClosing] = useState(false)
  const [entering, setEntering] = useState(false)
  const closeTimer = useRef<number | null>(null)
  const enterRaf = useRef<number | null>(null)
  const stepAnimTimer = useRef<number | null>(null)
  const stepKeyRef = useRef(0)

  useEffect(()=>{
    if (open) {
      if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null }
      if (enterRaf.current) cancelAnimationFrame(enterRaf.current)
      setVisible(true)
      setClosing(false)
      setEntering(true)
      setStep(0)
      stepKeyRef.current++
      setRenderedSteps([{ key: stepKeyRef.current, idx: 0, phase: 'enter', dir: 'forward' }])
      enterRaf.current = requestAnimationFrame(()=> {
        enterRaf.current = requestAnimationFrame(()=> setEntering(false))
      })
    } else if (visible) {
      setClosing(true)
      closeTimer.current = window.setTimeout(()=> { setVisible(false); setClosing(false); }, 260)
    }
  }, [open, visible])

  useEffect(()=>()=>{
    if (closeTimer.current) clearTimeout(closeTimer.current)
    if (enterRaf.current) cancelAnimationFrame(enterRaf.current)
    if (stepAnimTimer.current) clearTimeout(stepAnimTimer.current)
  }, [])

  // Prevent background scrolling while guide is visible
  useEffect(() => {
    if (!visible) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [visible])

  const queueStep = (next: number) => {
    if (next === step) return
    const dir: LayerDir = next > step ? 'forward' : 'back'
    // mark existing layers as exiting first
    setRenderedSteps(prev => prev.map(p => ({ ...p, phase: 'exit' as const, dir })))
    // after exit animation, insert new entering layer
    if (stepAnimTimer.current) clearTimeout(stepAnimTimer.current)
    // make transitions snappier: short exit, then insert new entering layer
    const EXIT_MS = 200
    stepAnimTimer.current = window.setTimeout(()=> {
      stepKeyRef.current++
      setRenderedSteps([{ key: stepKeyRef.current, idx: next, phase: 'enter', dir }])
      setStep(next)
      // cleanup after enter animation completes
      stepAnimTimer.current = window.setTimeout(()=> {
        setRenderedSteps(curr => curr.filter(layer => layer.phase === 'enter'))
      }, 260)
    }, EXIT_MS)
  }

  if (!visible) return null
  const last = step === STEPS.length - 1
  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center p-5 transition-colors duration-250 ${closing || entering ? 'bg-black/0' : 'bg-black/70 backdrop-blur-sm'}`} onClick={()=>{ if(!closing) onClose(); }}>
      <div
      className={`w-full max-w-sm rounded-2xl ring-1 ring-black/5 dark:ring-neutral-700/5 border border-neutral-200 dark:border-neutral-700 p-6 relative transition-all duration-250 ${closing || entering ? 'opacity-0 scale-[0.94] -translate-y-2' : 'opacity-100 scale-100 translate-y-0'} bg-white dark:bg-neutral-950` }
        onClick={(e)=> { e.stopPropagation(); }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
      >
        <div className="absolute top-2 right-2">
          <button aria-label="Close guide" onClick={()=>{ if(!closing) onClose(); }} className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-black/70 dark:text-neutral-300 transition">
            ✕
          </button>
        </div>
        <div className="text-[11px] tracking-wide uppercase text-black/40 mb-2">Quick guide</div>
        {/* Hidden heading for accessibility to label the dialog */}
        <h2 id="guide-title" className="sr-only">{STEPS[step].title}</h2>
        <div className="relative min-h-[120px]">
          {renderedSteps.map(layer => {
            const data = STEPS[layer.idx]
            const stateClass = layer.phase === 'enter'
              ? (layer.dir === 'forward' ? 'guide-step-enter-forward' : 'guide-step-enter-back')
              : (layer.dir === 'forward' ? 'guide-step-exit-forward' : 'guide-step-exit-back')
            return (
              <div key={layer.key} className={`guide-step-layer ${stateClass}`}>
        <h3 className="text-lg font-semibold mb-3 text-neutral-900 dark:text-neutral-100">{data.title}</h3>
        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{data.body}</p>
              </div>
            )
          })}
        </div>
    <div className="mt-5 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
          <div>Step {step+1} / {STEPS.length}</div>
          <div className="flex gap-1">
      {STEPS.map((_,i)=> <span key={i} className={`h-1.5 w-1.5 rounded-full ${i===step? 'bg-neutral-900 dark:bg-neutral-100':'bg-neutral-300 dark:bg-neutral-700'}`}/>) }
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          {last ? (
            // On final step show Finish (left) and Load data (right)
            <>
              <button onClick={()=> { if(!closing) onClose(); }} className="flex-1 rounded-md px-3 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-black/80 dark:text-neutral-300 transition">Finish</button>
              <button onClick={async()=> {
                // prefer parent-provided loader, otherwise do an internal load
                const attemptLoad = async () => {
                  const state = useHabitStore.getState()
                  const existing = state.habits || []
                  if (existing.length > 0) {
                    const ok = window.confirm('Load example data will replace your current habits. Continue?')
                    if (!ok) return
                  }
                  // compute cumulative totals from example data
                  const total = (defaultHabits || []).reduce((s, h) => s + (h.points || 0), 0)
                  const longest = (defaultHabits || []).reduce((m, h) => Math.max(m, h.streak || 0), 0)
                  useHabitStore.setState({ habits: defaultHabits, totalPoints: total, longestStreak: longest })
                }

                if (onLoadExample) {
                  try { await onLoadExample() } catch { await attemptLoad() }
                } else {
                  await attemptLoad()
                }

                if(!closing) onClose()
              }} className="flex-1 rounded-md px-3 py-2 text-sm font-medium bg-black text-white dark:bg-white dark:text-black">Load data</button>
            </>
          ) : (
            <>
              {step>0 && (
                <button onClick={()=> queueStep(Math.max(0, step-1))} className="flex-1 rounded-md px-3 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-black/80 dark:text-neutral-300 transition">Back</button>
              )}
              <button onClick={()=> queueStep(Math.min(STEPS.length-1, step+1))} className="flex-1 rounded-md px-3 py-2 text-sm font-medium bg-black text-white dark:bg-white dark:text-black">Next</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
