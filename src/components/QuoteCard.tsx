import { useMemo } from 'react'
import { Quote } from 'lucide-react'

const QUOTES = [
  {
    text:
      "No matter how many mistakes you make or how slow you progress, you are still way ahead of everyone who isn't trying.",
    author: 'Tony Robbins',
  },
  {
    text: 'Expect the best. Prepare for the worst. Capitalize on what comes.',
    author: 'Zig Ziglar',
  },
  {
    text: "Nothing is impossible, the word itself says ‘I’m possible.’",
    author: 'Audrey Hepburn',
  },
  {
    text:
      'For there is always light. If only we’re brave enough to see it. If only we’re brave enough to be it.',
    author: 'Amanda Gorman',
  },
  {
    text: "Do your thing and don't care if they like it.",
    author: 'Tina Fey',
  },
  {
    text: 'I’d rather regret the things I’ve done than the things I haven’t done.',
    author: 'Lucille Ball',
  },
  {
    text: 'Try to be a rainbow in someone else’s cloud.',
    author: 'Maya Angelou',
  },
  {
    text: 'A dead end is just a good place to turn around.',
    author: 'Naomi Judd',
  },
]

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
