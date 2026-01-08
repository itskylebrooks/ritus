import { useSyncExternalStore } from 'react';

type Listener = () => void;

let isReady = false;
let scheduled = false;
const listeners = new Set<Listener>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

const scheduleReady = () => {
  if (scheduled || isReady) return;
  scheduled = true;
  if (typeof window === 'undefined') {
    isReady = true;
    return;
  }
  const win = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
  };
  const markReady = () => {
    if (isReady) return;
    isReady = true;
    notify();
  };
  if (win.requestIdleCallback) {
    win.requestIdleCallback(markReady, { timeout: 800 });
  } else {
    window.setTimeout(markReady, 0);
  }
};

const subscribe = (listener: Listener) => {
  listeners.add(listener);
  scheduleReady();
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => isReady;

const getServerSnapshot = () => true;

export function useIdleReady() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
