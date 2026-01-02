export default function ProgressBar({ value, max = 1 }: { value: number; max?: number }) {
  const safeMax = max <= 0 ? 1 : max;
  const pct = Math.max(0, Math.min(100, Math.round((value / safeMax) * 100)));
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-progress-track"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-progress transition-[width]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
