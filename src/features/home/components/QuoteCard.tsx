import { useHabitStore } from '@/shared/store/store';
import { QUOTES } from '@/shared/utils/quotes';
import { motion } from 'framer-motion';
import { type KeyboardEvent, useEffect, useState } from 'react';

export default function QuoteCard() {
  const appliedCollectibles = useHabitStore((s) => s.progress.appliedCollectibles || {});
  const hasTypingAnimation = (appliedCollectibles['animation'] || '').includes('anim_whisper_text');

  // Choose a random quote once and keep it so copying doesn't change it
  const [selectedQuote] = useState(() =>
    QUOTES.length ? QUOTES[Math.floor(Math.random() * QUOTES.length)] : { text: '', author: '' },
  );

  const [copied, setCopied] = useState(false);
  const [displayedText, setDisplayedText] = useState(hasTypingAnimation ? '' : selectedQuote.text);
  const [isTyping, setIsTyping] = useState(hasTypingAnimation);

  useEffect(() => {
    if (!hasTypingAnimation) {
      setDisplayedText(selectedQuote.text);
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(selectedQuote.text.slice(0, i + 1));
      i++;
      if (i >= selectedQuote.text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 30); // Typing speed

    return () => clearInterval(interval);
  }, [hasTypingAnimation, selectedQuote.text]);

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
      className={`rounded-2xl border p-4 shadow-sm w-full max-w-full cursor-pointer transition-colors duration-150 ${
        copied ? 'border-accent bg-accent/10' : 'border-subtle'
      }`}
      role="button"
      tabIndex={0}
      onClick={copyQuote}
      onKeyDown={handleKeyDown}
      aria-label="Copy quote"
    >
      <div className="flex flex-col gap-3">
        <div className="text-neutral-800 dark:text-neutral-100 italic break-words text-lg leading-tight min-h-[1.5em]">
          {hasTypingAnimation ? (
            <>
              {displayedText}
              {isTyping && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-[2px] h-[1em] bg-current ml-[1px] align-middle"
                />
              )}
            </>
          ) : (
            selectedQuote.text
          )}
        </div>
        <footer className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
          <span className={`text-xs font-semibold ${copied ? 'text-accent' : 'text-transparent'}`}>
            Copied
          </span>
          {hasTypingAnimation ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: selectedQuote.text.length * 0.03 + 0.3 }}
            >
              — {selectedQuote.author}
            </motion.span>
          ) : (
            <span>— {selectedQuote.author}</span>
          )}
        </footer>
      </div>
      <span className="sr-only" aria-live="polite">
        {copied ? 'Quote copied.' : ''}
      </span>
    </article>
  );
}
