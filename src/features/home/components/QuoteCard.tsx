import { QUOTES } from '@/shared/utils/quotes';
import { type KeyboardEvent, useState } from 'react';

export default function QuoteCard() {
  // Choose a random quote once and keep it so copying doesn't change it
  const [selectedQuote] = useState(() =>
    QUOTES.length ? QUOTES[Math.floor(Math.random() * QUOTES.length)] : { text: '', author: '' },
  );

  const [copied, setCopied] = useState(false);

  const copyQuote = async () => {
    const formatted = `"${selectedQuote.text}" — ${selectedQuote.author}`;
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // fallback: try execCommand (older browsers) or log
      try {
        const textarea = document.createElement('textarea');
        textarea.value = formatted;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1400);
      } catch {
        console.error('Copy failed');
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      copyQuote();
    }
  };

  return (
    <article
      className="rounded-2xl border border-subtle p-4 shadow-sm w-full max-w-full cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={copyQuote}
      onKeyDown={handleKeyDown}
      aria-label="Copy quote"
    >
      <div className="flex flex-col gap-3">
        <p className="text-neutral-800 dark:text-neutral-100 italic break-words text-lg leading-tight">
          {selectedQuote.text}
        </p>
        <footer className="text-sm text-neutral-600 dark:text-neutral-400 text-right">
          — {selectedQuote.author}
        </footer>
      </div>
      <span className="sr-only" aria-live="polite">
        {copied ? 'Quote copied.' : ''}
      </span>
    </article>
  );
}
