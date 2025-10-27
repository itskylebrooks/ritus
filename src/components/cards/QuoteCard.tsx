import { Quote, Check } from 'lucide-react'
import { useState } from 'react'
import { QUOTES } from '../../utils/quotes'

export default function QuoteCard() {
  // Choose a random quote once and keep it so copying doesn't change it
  const [selectedQuote] = useState(() =>
    QUOTES.length ? QUOTES[Math.floor(Math.random() * QUOTES.length)] : { text: '', author: '' }
  )

  const [copied, setCopied] = useState(false)

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
  <article className="rounded-2xl border dark:border-neutral-700 p-6 shadow-sm h-full">
      <div className="flex h-full flex-col">
        <div className="flex-1">
          <button
            type="button"
            onClick={copyQuote}
            aria-label="Copy quote"
            className="group -ml-1 rounded-md p-1 transition-colors duration-150 ease-in-out"
            title="Copy quote"
          >
                <span className="relative inline-block w-6 h-6">
                  {/* Quote icon (fades out when copied) */}
                  <Quote
                    className={
                      `absolute inset-0 m-auto w-6 h-6 transition-all duration-200 ease-out text-neutral-400 dark:text-neutral-600 pointer-events-none group-hover:text-neutral-600 dark:group-hover:text-neutral-300 ` +
                      (copied ? 'opacity-0 scale-95' : 'opacity-100 scale-100')
                    }
                  />

                  {/* Check icon (fades in when copied). Uses same base color as quote icon */}
                  <Check
                    className={
                      `absolute inset-0 m-auto w-6 h-6 transition-all duration-200 ease-out text-neutral-400 dark:text-neutral-600 pointer-events-none group-hover:text-neutral-600 dark:group-hover:text-neutral-300 ` +
                      (copied ? 'opacity-100 scale-100' : 'opacity-0 scale-95')
                    }
                  />
                </span>
          </button>
          <p className="mt-2 text-lg leading-relaxed text-neutral-800 dark:text-neutral-100 italic">{selectedQuote.text}</p>
        </div>

        <footer className="mt-4 text-sm text-neutral-600 dark:text-neutral-400 text-right">— {selectedQuote.author}</footer>
      </div>
    </article>
  )
}
