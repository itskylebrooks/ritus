import type { ReactNode } from 'react';

export default function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-subtle px-2 py-0.5 text-xs font-medium text-strong">
      {children}
    </span>
  );
}
