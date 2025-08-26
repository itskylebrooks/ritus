export default function ProgressBar({ value, max = 1 }: { value: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)))
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
      <div
        className="h-full rounded-full bg-black/80 dark:bg-white/80 transition-[width]"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
