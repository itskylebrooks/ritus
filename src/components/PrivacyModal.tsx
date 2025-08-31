import { useEffect, useRef, useState } from 'react'

interface PrivacyModalProps {
  open: boolean
  onClose: () => void
}

export default function PrivacyModal({ open, onClose }: PrivacyModalProps) {
  const [visible, setVisible] = useState(open)
  const [closing, setClosing] = useState(false)
  const [entering, setEntering] = useState(false)
  const closeTimer = useRef<number | null>(null)
  const enterRaf = useRef<number | null>(null)

  useEffect(() => {
    if (open) {
      if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null }
      if (enterRaf.current) cancelAnimationFrame(enterRaf.current)
      setVisible(true)
      setClosing(false)
      setEntering(true)
      enterRaf.current = requestAnimationFrame(() => {
        enterRaf.current = requestAnimationFrame(() => setEntering(false))
      })
    } else if (visible) {
      setClosing(true)
      closeTimer.current = window.setTimeout(() => { setVisible(false); setClosing(false) }, 260)
    }
  }, [open, visible])

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    if (enterRaf.current) cancelAnimationFrame(enterRaf.current)
  }, [])

  // Prevent background scrolling while visible
  useEffect(() => {
    if (!visible) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [visible])

  if (!visible) return null
  return (
    <div
      className={`fixed inset-0 z-[60] flex items-stretch sm:items-center justify-center p-0 sm:p-5 transition-colors duration-250 ${closing || entering ? 'bg-black/0' : 'bg-black/70 backdrop-blur-sm'}`}
      onClick={() => { if (!closing) onClose() }}
    >
      <div
        className={`w-full h-full sm:h-auto max-w-none sm:max-w-sm rounded-none sm:rounded-2xl ring-1 ring-black/5 dark:ring-white/5 p-6 pt-7 pb-8 relative transition-all duration-250 ${closing || entering ? 'opacity-0 scale-[0.98] -translate-y-2' : 'opacity-100 scale-100 translate-y-0'} bg-white dark:bg-neutral-950 overflow-y-auto`}
        style={{ WebkitOverflowScrolling: 'touch', paddingBottom: 'max(env(safe-area-inset-bottom), 32px)' }}
        onClick={(e) => { e.stopPropagation() }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-title"
      >
        <div className="absolute top-2 right-2">
          <button
            aria-label="Close privacy policy"
            onClick={() => { if (!closing) onClose() }}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-black/70 dark:text-neutral-300 transition"
          >
            ✕
          </button>
        </div>
        <div className="text-[11px] tracking-wide uppercase text-black/40 dark:text-white/40 mb-2">Privacy</div>
        <h2 id="privacy-title" className="text-lg font-semibold mb-1 text-neutral-900 dark:text-neutral-100">Ritus Privacy Policy</h2>
        <div className="mt-4 pr-1">
          <div className="space-y-5 text-sm text-neutral-700 dark:text-neutral-300">
            <section>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">Local only</div>
              <p className="mt-2">Ritus does not require an account, login, or cloud sync. All habits, preferences, and settings are stored only in your browser’s local storage.</p>
            </section>

            <section>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">No tracking</div>
              <p className="mt-2">We do not collect analytics or run trackers in the web app. Nothing leaves your device unless you choose to export and share it yourself.</p>
            </section>

            <section>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">Your control</div>
              <p className="mt-2">You can export your data as a JSON file, import it on another browser, or clear everything from Settings at any time.</p>
            </section>

            <section>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">Future features</div>
              <p className="mt-2">Optional sync may come later, but it will always be opt-in and clearly explained.</p>
            </section>

            <section>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">Contact</div>
              <p className="mt-2">For questions or feedback, contact me: <a href="mailto:itskylebrooks@icloud.com" className="text-blue-500 hover:underline">itskylebrooks@icloud.com</a>.</p>
            </section>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button onClick={() => { if (!closing) onClose() }} className="rounded-md px-3 py-2 text-sm font-medium bg-black text-white dark:bg-white dark:text-black">Close</button>
        </div>
      </div>
    </div>
  )
}
