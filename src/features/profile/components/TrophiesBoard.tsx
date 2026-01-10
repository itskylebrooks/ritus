import { TROPHIES } from '@/shared/constants/trophies';
import { useHabitStore } from '@/shared/store/store';
import { fromISO } from '@/shared/utils/date';
import { format } from 'date-fns';
import { WandSparkles } from 'lucide-react';
import { useMemo } from 'react';

export default function TrophiesBoard() {
  const unlocked = useHabitStore((s) => s.progress.unlocked || {});
  const dateFormat = useHabitStore((s) => s.dateFormat);
  const datePattern = dateFormat === 'MDY' ? 'MMM d, yyyy' : 'd MMM yyyy';
  const items = useMemo(() => {
    const filtered = TROPHIES.filter((t) => unlocked[t.id]);
    return filtered.sort((a, b) => {
      const aDate = unlocked[a.id] || '';
      const bDate = unlocked[b.id] || '';
      return bDate.localeCompare(aDate);
    });
  }, [unlocked]);
  const formatDate = (value?: string) => {
    if (!value) return null;
    try {
      return format(fromISO(value), datePattern);
    } catch {
      return null;
    }
  };

  return (
    <div>
      <div className="mb-4 uppercase tracking-wider text-sm md:text-base font-semibold text-muted text-center">
        TROPHY BOARD
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.length === 0 ? (
          <div className="col-span-2 md:col-span-4 flex flex-col items-center gap-3 rounded-lg border border-subtle p-6">
            <div className="p-2 rounded-md">
              <WandSparkles className="h-8 w-8 text-accent" />
            </div>
            <div className="text-base font-semibold text-strong text-center">No trophies yet</div>
            <div className="text-sm text-muted text-center max-w-xl">
              Trophies appear here as you complete habits, reach streaks, and hit milestones. Keep
              going — your achievements will show up on this board.
            </div>
          </div>
        ) : (
          items.map(({ id, label, Icon, reason }) => {
            const dateLabel = formatDate(unlocked[id]);
            return (
              <div
                key={id}
                className="flex flex-col items-center justify-between gap-2 rounded-lg border border-subtle p-4 min-h-[140px]"
              >
                <div className="p-1 rounded-md">
                  <Icon className="h-7 w-7 text-accent" />
                </div>
                <div className="text-sm font-semibold text-strong text-center">{label}</div>
                <div className="text-xs text-muted text-center">{reason}</div>
                {dateLabel ? (
                  <div className="text-[10px] uppercase tracking-wide text-muted">{dateLabel}</div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
