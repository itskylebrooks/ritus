import { useEffect, useState } from 'react';

/**
 * Simple hook to detect Safari browsers (desktop + iOS) to provide
 * fallback animations that avoid animating expensive CSS properties
 * like `filter` which can cause jank on Safari.
 */
export default function useIsSafari() {
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    const ua = navigator.userAgent || '';
    // Safari UA contains "Safari" but not Chromium-based markers
    const safari = /Safari/.test(ua) && !/(Chrome|Chromium|CriOS|CrMo|Edg|OPR|FxiOS)/.test(ua);
    setIsSafari(safari);
  }, []);

  return isSafari;
}
