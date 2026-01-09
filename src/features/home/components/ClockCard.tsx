import { useHabitStore } from '@/shared/store/store';
import { useEffect, useMemo, useState } from 'react';

export default function ClockCard() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const seconds = now.getSeconds();
  const minutes = now.getMinutes() + seconds / 60;
  const hours = (now.getHours() % 12) + minutes / 60;

  const hourDeg = (hours / 12) * 360;
  const minuteDeg = (minutes / 60) * 360;
  const secondDeg = (seconds / 60) * 360;

  const accentApplied = useHabitStore((s) => !!s.progress.appliedCollectibles?.accent);

  const dayLabelColorClass = 'text-accent';

  const dayChunks = useMemo(() => {
    const idx = now.getDay();
    // Hand-tuned splits for readability (max 3 lines)
    switch (idx) {
      case 0:
        return ['SUN', 'DAY'];
      case 1:
        return ['MON', 'DAY'];
      case 2:
        return ['TUES', 'DAY'];
      case 3:
        return ['WED', 'NES', 'DAY'];
      case 4:
        return ['THURS', 'DAY'];
      case 5:
        return ['FRI', 'DAY'];
      case 6:
        return ['SA', 'TUR', 'DAY'];
      default:
        return [];
    }
  }, [now]);

  return (
    <div className="rounded-2xl border border-subtle shadow-sm overflow-hidden w-full h-[200px] sm:w-auto sm:h-full sm:aspect-square sm:min-h-0 sm:justify-self-end">
      <div className="p-2 h-full">
        <div className="relative w-full h-full flex items-center">
          <div className="flex items-center sm:absolute sm:inset-0 sm:justify-center">
            <div className="inline-flex h-full w-auto aspect-square max-h-full sm:max-h-[160px]">
              <svg
                className="w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid meet"
                aria-label="Analog clock"
              >
                <defs>
                  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.03" />
                  </filter>
                </defs>
                <g transform="translate(0,0)" filter="url(#soft)">
                  {/* ticks: 60 marks around a circular ring; longer every 5th (hour) */}
                  {Array.from({ length: 60 }).map((_, i) => {
                    const angle = (i / 60) * Math.PI * 2;
                    const isHour = i % 5 === 0;
                    // Increase radii so ticks sit closer to the card edge (clock fills more)
                    const inner = isHour ? 38 : 42; // distance from center where tick begins
                    const outer = 48; // distance from center where tick ends (near card edge)
                    const x1 = 50 + Math.sin(angle) * inner;
                    const y1 = 50 - Math.cos(angle) * inner;
                    const x2 = 50 + Math.sin(angle) * outer;
                    const y2 = 50 - Math.cos(angle) * outer;
                    const width = isHour ? 1.6 : 0.8;
                    // Use CSS tokens for subtle greys in normal mode (they adapt to .dark).
                    const strokeColor = isHour
                      ? 'var(--color-text-secondary)'
                      : 'var(--color-border-subtle)';

                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={strokeColor}
                        strokeWidth={width}
                      />
                    );
                  })}

                  {/* hour, minute, second hands */}
                  <g transform={`rotate(${hourDeg} 50 50)`}>
                    <line
                      x1="50"
                      y1="50"
                      x2="50"
                      y2="28"
                      stroke="var(--color-text-primary)"
                      strokeWidth={3.8}
                      strokeLinecap="round"
                    />
                  </g>

                  <g transform={`rotate(${minuteDeg} 50 50)`}>
                    <line
                      x1="50"
                      y1="50"
                      x2="50"
                      y2="18"
                      stroke="var(--color-text-secondary)"
                      strokeWidth={2.4}
                      strokeLinecap="round"
                    />
                  </g>

                  <g transform={`rotate(${secondDeg} 50 50)`}>
                    <line
                      x1="50"
                      y1="54"
                      x2="50"
                      y2="14"
                      stroke={accentApplied ? 'var(--color-accent)' : 'var(--color-danger)'}
                      strokeWidth={1.4}
                      strokeLinecap="round"
                    />
                  </g>

                  <circle cx="50" cy="50" r="2" fill="var(--color-text-primary)" />
                </g>
              </svg>
            </div>
          </div>
          {dayChunks.length > 0 && (
            <div className="ml-4 h-full flex-1 flex flex-col items-end justify-center text-right text-5xl font-black tracking-[0.15em] leading-tight uppercase sm:hidden">
              {dayChunks.map((chunk) => (
                <div key={chunk} className={dayLabelColorClass}>
                  {chunk}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
