import { useEffect, useState } from 'react';

const MOBILE_QUERY = '(max-width: 768px)';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia(MOBILE_QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const onChange = () => setIsMobile(mediaQuery.matches);
    onChange();
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', onChange);
      return () => mediaQuery.removeEventListener('change', onChange);
    }
    const legacyQuery = mediaQuery as MediaQueryList & {
      addListener?: (listener: () => void) => void;
      removeListener?: (listener: () => void) => void;
    };
    legacyQuery.addListener?.(onChange);
    return () => legacyQuery.removeListener?.(onChange);
  }, []);

  return isMobile;
}
