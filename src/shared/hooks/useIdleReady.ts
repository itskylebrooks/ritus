import { useMemo, useSyncExternalStore } from 'react';

type Listener = () => void;

type IdleStore = {
  subscribe: (listener: Listener) => () => void;
  getSnapshot: () => boolean;
  getServerSnapshot: () => boolean;
};

const createIdleStore = (): IdleStore => {
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

  return {
    subscribe: (listener: Listener) => {
      listeners.add(listener);
      scheduleReady();
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => isReady,
    getServerSnapshot: () => true,
  };
};

const globalIdleStore = createIdleStore();

export function useIdleReady(options?: { resetOnMount?: boolean }) {
  const store = useMemo(
    () => (options?.resetOnMount ? createIdleStore() : globalIdleStore),
    [options?.resetOnMount],
  );
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}
