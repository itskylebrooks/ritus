import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

type LazyMountProps = {
  children: ReactNode;
  enabled?: boolean;
  placeholder?: ReactNode;
  className?: string;
  minHeight?: number | string;
  rootMargin?: string;
  threshold?: number | number[];
  unmountOnExit?: boolean;
};

function normalizeMinHeight(minHeight?: number | string) {
  if (minHeight === undefined) return undefined;
  return typeof minHeight === 'number' ? `${minHeight}px` : minHeight;
}

export default function LazyMount({
  children,
  enabled = true,
  placeholder = null,
  className,
  minHeight,
  rootMargin = '0px',
  threshold = 0,
  unmountOnExit = false,
}: LazyMountProps) {
  const [isVisible, setIsVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canObserve = enabled && typeof IntersectionObserver === 'function';
    if (!canObserve) return;
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else if (unmountOnExit) {
          setIsVisible(false);
        }
      },
      { root: null, rootMargin, threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, rootMargin, threshold, unmountOnExit]);

  const canObserve = enabled && typeof IntersectionObserver === 'function';

  if (!enabled || !canObserve) {
    return <>{children}</>;
  }

  const minHeightValue = normalizeMinHeight(minHeight);
  const style =
    minHeightValue && !isVisible
      ? { minHeight: minHeightValue, height: minHeightValue }
      : undefined;

  return (
    <div ref={rootRef} className={className} style={style}>
      {isVisible ? children : placeholder}
    </div>
  );
}
