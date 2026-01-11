import { useState } from 'react';

/**
 * Simple hook to detect Safari browsers (desktop + iOS) to provide
 * fallback animations that avoid animating expensive CSS properties
 * like `filter` which can cause jank on Safari.
 */
export default function useIsSafari() {
  const [isSafari] = useState(() => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    // Safari UA contains "Safari" but not Chromium-based markers
    return /Safari/.test(ua) && !/(Chrome|Chromium|CriOS|CrMo|Edg|OPR|FxiOS)/.test(ua);
  });

  return isSafari;
}
