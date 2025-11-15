import { useMemo, useState } from 'react'
import { Check, Quote } from 'lucide-react'
import { QUOTES } from '@/shared/utils/quotes'

export default function QuoteCard() {
  // Choose a random quote once and keep it so copying doesn't change it
  const [selectedQuote] = useState(() =>
    QUOTES.length ? QUOTES[Math.floor(Math.random() * QUOTES.length)] : { text: '', author: '' }
  )

  const [copied, setCopied] = useState(false)

  const sizeClass = useMemo(() => {
    const len = selectedQuote.text.length
    // Match the habit title size as the default, then shrink only for long quotes.
    // Habit title uses `text-lg font-semibold leading-tight` — we match `text-lg`.
    if (len > 420) return 'text-sm leading-tight'
    if (len > 260) return 'text-base leading-relaxed'
    return 'text-lg leading-tight'
  }, [selectedQuote.text])

  const copyQuote = async () => {
  const formatted = `"${selectedQuote.text}" — ${selectedQuote.author}`
    try {
      await navigator.clipboard.writeText(formatted)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch (err) {
      // fallback: try execCommand (older browsers) or log
      try {
        const textarea = document.createElement('textarea')
        textarea.value = formatted
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'absolute'
        textarea.style.left = '-9999px'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1400)
      } catch (err2) {
        // eslint-disable-next-line no-console
        console.error('Copy failed', err2)
      }
    }
  }

  return (
  <article className="rounded-2xl border dark:border-neutral-700 p-4 shadow-sm w-full max-w-full sm:h-[160px] relative">
      <div className="flex h-full flex-col gap-3">
          <button
            type="button"
            onClick={copyQuote}
            aria-label="Copy quote"
            className="group rounded-md p-0.5 transition-colors duration-150 ease-in-out absolute right-3 top-3 z-10"
            title="Copy quote"
          >
                <span className="relative inline-block w-5 h-5">
                  {/* Quote icon (fades out when copied) */}
                  <Quote
                    className={
                      `absolute inset-0 m-auto w-5 h-5 transition-all duration-200 ease-out text-neutral-400 dark:text-neutral-600 pointer-events-none group-hover:text-neutral-600 dark:group-hover:text-neutral-300 ` +
                      (copied ? 'opacity-0 scale-95' : 'opacity-100 scale-100')
                    }
                  />

                  {/* Check icon (fades in when copied). Uses same base color as quote icon */}
                  <Check
                    className={
                      `absolute inset-0 m-auto w-5 h-5 transition-all duration-200 ease-out text-neutral-400 dark:text-neutral-600 pointer-events-none group-hover:text-neutral-600 dark:group-hover:text-neutral-300 ` +
                      (copied ? 'opacity-100 scale-100' : 'opacity-0 scale-95')
                    }
                  />
              </span>
          </button>
        <div className="flex-1 relative overflow-auto">
          {/* Reduce font-size for long quotes to keep the layout fixed */}
          <p className={`mt-1.5 text-neutral-800 dark:text-neutral-100 italic break-words pr-10 ${sizeClass}`}>{selectedQuote.text}</p>
        </div>
        <footer className="mt-4 text-sm text-neutral-600 dark:text-neutral-400 text-right absolute right-3 bottom-3">— {selectedQuote.author}</footer>
      </div>
    </article>
  )
}
