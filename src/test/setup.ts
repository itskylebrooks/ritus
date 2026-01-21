import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

const noop = () => {};

afterEach(() => {
  cleanup();
});

if (typeof window !== 'undefined') {
  if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as typeof window.matchMedia;
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (cb: FrameRequestCallback) =>
      window.setTimeout(() => cb(performance.now()), 0);
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = (id: number) => window.clearTimeout(id);
  }

  if (!window.scrollTo) {
    window.scrollTo = noop;
  }
}

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (!globalThis.localStorage || typeof globalThis.localStorage.clear !== 'function') {
  let store: Record<string, string> = {};
  const storage = {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };
  Object.defineProperty(globalThis, 'localStorage', { value: storage });
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', { value: storage });
  }
}
