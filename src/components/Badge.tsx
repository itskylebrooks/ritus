import React from 'react'

export default function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium text-neutral-700 dark:text-neutral-200">
      {children}
    </span>
  )
}
