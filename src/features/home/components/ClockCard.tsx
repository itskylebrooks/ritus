import { useEffect, useState } from 'react'
import { useHabitStore } from '@/shared/store/store'

export default function ClockCard() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const seconds = now.getSeconds()
  const minutes = now.getMinutes() + seconds / 60
  const hours = (now.getHours() % 12) + minutes / 60

  const hourDeg = (hours / 12) * 360
  const minuteDeg = (minutes / 60) * 360
  const secondDeg = (seconds / 60) * 360

  // subscribe to applied collectibles so the clock updates reactively
  const applied = useHabitStore((s) => s.progress.appliedCollectibles || {})
  const nocturne = applied['clock'] === 'clock_nocturne'

  return (
  <div className="rounded-2xl border dark:border-neutral-700 shadow-sm overflow-hidden h-full">
      <div className="p-2 h-full flex items-center justify-center">
        <div className="w-full h-full max-w-full max-h-full">
          <div className="aspect-square w-full h-full">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-label="Analog clock">
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
                  // Use CSS tokens for subtle greys in normal mode (they adapt to .dark)
                  // When nocturne collectible is applied, keep high-contrast monochrome ticks.
                  const strokeColor = nocturne
                    ? 'currentColor'
                    : isHour
                      ? 'var(--color-text-secondary)'
                      : 'var(--color-border-subtle)'

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

                {/* hour, minute, second hands: adjust when nocturne collectible is applied */}
                {(() => {
                  const armColorClass = nocturne ? 'text-neutral-900 dark:text-neutral-100' : ''
                  return (
                    <>
                      <g transform={`rotate(${hourDeg} 50 50)`}>
                        <line x1="50" y1="50" x2="50" y2="28" stroke={nocturne ? 'currentColor' : 'var(--color-text-primary)'} strokeWidth={3.8} strokeLinecap="round" className={nocturne ? armColorClass : 'dark:stroke-neutral-100'} />
                      </g>

                      {/* minute hand: kept under nocturne but styled monochrome */}
                      <g transform={`rotate(${minuteDeg} 50 50)`}>
                        <line x1="50" y1="50" x2="50" y2="18" stroke={nocturne ? 'currentColor' : 'var(--color-text-secondary)'} strokeWidth={2.4} strokeLinecap="round" className={nocturne ? armColorClass : 'dark:stroke-neutral-200'} />
                      </g>

                      {/* second hand */}
                      <g transform={`rotate(${secondDeg} 50 50)`}>
                        <line x1="50" y1="54" x2="50" y2="14" stroke={nocturne ? 'currentColor' : 'var(--color-danger)'} strokeWidth={1.4} strokeLinecap="round" className={nocturne ? armColorClass : ''} />
                      </g>

                      {/* center */}
                      <circle cx="50" cy="50" r="2" fill={nocturne ? 'currentColor' : 'var(--color-text-primary)'} className={nocturne ? armColorClass : 'dark:fill-neutral-100'} />
                    </>
                  )
                })()}
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
