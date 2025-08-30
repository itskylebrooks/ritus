import { useState, useEffect, useRef } from 'react'

interface GuideModalProps {
  open: boolean
  onClose: () => void
}

type GuideStep = { title: string; body: string }
const STEPS: GuideStep[] = [
  {
    title: 'Welcome to Ritus',
    body: 'Ritus helps you build small habits. Create a habit, pick its frequency, and track progress with a single tap.'
  },
  {
    title: 'Add a habit',
    body: 'Tap Add, give your habit a name and choose Daily or Weekly. For weekly habits, pick how many days per week you want to complete.'
  },
  {
    title: 'Mark completions',
    body: 'Use the week strip or the Done button on a card to mark a habit complete for a day. Weekly habits let you pick multiple days per week.'
  },
  {
    title: 'Streaks & points',
    body: 'Ritus awards points per completion and tracks streaks. Weekly streaks count when you reach your chosen days/week target.'
  },
  {
    title: 'Edit & manage',
    body: 'Tap the pencil to rename or change frequency. You can delete habits or reset all data from Settings.'
  },
  {
    title: 'Progress at a glance',
    body: 'HeaderStats shows total points and weekly completion percent. Cards show streak, weekly progress, and points.'
  },
  {
    title: 'Local-first & export',
    body: 'Your data is stored locally in the browser. Use Settings to export/import JSON for backups or device transfer.'
  },
  {
    title: 'Privacy & sync',
    body: 'Ritus is local-first. Cloud sync is optional and opt-in; settings expose placeholder controls for future sync.'
  }
]

type LayerPhase = 'enter' | 'exit'
type LayerDir = 'forward' | 'back'
interface StepLayer { key: number; idx: number; phase: LayerPhase; dir: LayerDir }

export default function GuideModal({ open, onClose }: GuideModalProps) {
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
        className={`w-full max-w-sm rounded-2xl ring-1 ring-black/5 dark:ring-white/5 p-6 relative transition-all duration-250 ${closing || entering ? 'opacity-0 scale-[0.94] -translate-y-2' : 'opacity-100 scale-100 translate-y-0'} bg-white dark:bg-neutral-950` }
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
          {step>0 && (
      <button onClick={()=> queueStep(Math.max(0, step-1))} className="flex-1 rounded-md px-3 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-black/80 dark:text-neutral-300 transition">Back</button>
          )}
      <button onClick={()=> { if(last) onClose(); else queueStep(Math.min(STEPS.length-1, step+1)); }} className="flex-1 rounded-md px-3 py-2 text-sm font-medium bg-black text-white dark:bg-white dark:text-black">{last? 'Finish':'Next'}</button>
        </div>
      </div>
    </div>
  )
}
