import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  // Allow alternate confirm button color variants (e.g. success/green)
  confirmVariant?: 'accent' | 'success';
}

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  confirmVariant = 'accent',
}: ConfirmModalProps) {
  const [visible, setVisible] = useState(open);
  const [closing, setClosing] = useState(false);
  const [entering, setEntering] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const enterRaf = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
      if (enterRaf.current) cancelAnimationFrame(enterRaf.current);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      setClosing(false);
      setEntering(true);
      enterRaf.current = requestAnimationFrame(() => {
        enterRaf.current = requestAnimationFrame(() => setEntering(false));
      });
    } else if (visible) {
      setClosing(true);
      closeTimer.current = window.setTimeout(() => {
        setVisible(false);
        setClosing(false);
      }, 220);
    }
  }, [open, visible]);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      if (enterRaf.current) cancelAnimationFrame(enterRaf.current);
    },
    [],
  );

  // Prevent background scrolling while visible
  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  if (!visible) return null;
  return createPortal(
    <div
      className={`fixed inset-0 z-[80] flex flex-col items-center p-5 transition-colors duration-200 ${closing || entering ? 'bg-transparent' : 'bg-overlay backdrop-blur-sm'}`}
      onClick={() => {
        if (!closing) onClose();
      }}
    >
      <div className="flex-[4] min-h-[40px] pointer-events-none" />
      <div
        className={`w-full max-w-sm rounded-2xl ring-1 ring-black/5 dark:ring-neutral-700/5 border border-subtle p-5 relative transition-all duration-200 ${closing || entering ? 'opacity-0 scale-[0.95] translate-y-1' : 'opacity-100 scale-100 translate-y-0'} bg-surface-elevated`}
        onClick={(e) => {
          e.stopPropagation();
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <h2
          id="confirm-title"
          className="text-base font-semibold text-neutral-900 dark:text-neutral-100"
        >
          {title}
        </h2>
        {message && (
          <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">{message}</p>
        )}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            className="rounded-md border border-subtle px-3 py-2 text-sm font-medium bg-surface text-strong hover-nonaccent"
            onClick={() => {
              if (!closing) onClose();
            }}
          >
            {cancelLabel}
          </button>
          <button
            className={`rounded-md px-3 py-2 text-sm font-medium ${destructive ? 'bg-danger hover:bg-danger-soft text-inverse' : confirmVariant === 'success' ? 'bg-success text-inverse hover:bg-success-soft' : 'bg-accent text-inverse hover:bg-accent-soft'}`}
            onClick={() => {
              if (!closing) {
                onConfirm();
              }
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
      <div className="flex-[6] pointer-events-none" />
    </div>,
    document.body,
  );
}
