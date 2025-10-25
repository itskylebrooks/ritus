import { useMemo } from 'react'
import { Quote } from 'lucide-react'
import { QUOTES } from '../utils/quotes'

export default function QuoteCard() {
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], [])

  return (
    <article className="rounded-2xl border dark:border-neutral-700 p-6 bg-white dark:bg-neutral-950 shadow-sm">
      <div className="flex h-full flex-col">
        <div className="flex-1">
          <Quote className="inline-block w-6 h-6 text-neutral-300 dark:text-neutral-600" />
          <p className="mt-2 text-lg leading-relaxed text-neutral-800 dark:text-neutral-100 italic">{quote.text}</p>
        </div>

        <footer className="mt-4 text-sm text-neutral-600 dark:text-neutral-400 text-right">— {quote.author}</footer>
      </div>
    </article>
  )
}
