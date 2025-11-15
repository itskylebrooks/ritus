import { useEffect, useMemo, useState } from 'react'
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
  const clockStyle = applied['clock']
  const nocturne = clockStyle === 'clock_nocturne'
  const hasClockStyle = !!clockStyle
  const accentApplied = !!applied['accent']

  const dayLabelColorClass = accentApplied
    ? 'text-accent'
    : nocturne
      ? 'text-[var(--color-text-primary)] opacity-80'
      : 'text-[var(--color-border-subtle)] opacity-70'

  const dayChunks = useMemo(() => {
    const idx = now.getDay()
    // Hand-tuned splits for readability (max 3 lines)
    switch (idx) {
      case 0: return ['SUN', 'DAY']
      case 1: return ['MON', 'DAY']
      case 2: return ['TUES', 'DAY']
      case 3: return ['WED', 'NES', 'DAY']
      case 4: return ['THURS', 'DAY']
      case 5: return ['FRI', 'DAY']
      case 6: return ['SA', 'TUR', 'DAY']
      default: return []
    }
  }, [now])

  return (
    <div className="rounded-2xl border dark:border-neutral-700 shadow-sm overflow-hidden w-full h-[200px] sm:h-[160px] sm:w-[160px] sm:aspect-square sm:justify-self-end">
      <div className="p-2 h-full flex items-center justify-center">
        <div className="w-full h-full max-w-full max-h-full flex items-center sm:block">
          <div className="h-full aspect-square max-h-full sm:aspect-square sm:w-full sm:h-full">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-label="Analog clock">
              <defs>
                <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.03" />
                </filter>
              </defs>
              <g transform="translate(0,0)" filter="url(#soft)">
                {/* ticks: 60 marks around a circular ring; longer every 5th (hour) */}
                {Array.from({ length: 60 }).map((_, i) => {
                  const angle = (i / 60) * Math.PI * 2
                  const isHour = i % 5 === 0
                  // Increase radii so ticks sit closer to the card edge (clock fills more)
                  const inner = isHour ? 38 : 42 // distance from center where tick begins
                  const outer = 48 // distance from center where tick ends (near card edge)
                  const x1 = 50 + Math.sin(angle) * inner
                  const y1 = 50 - Math.cos(angle) * inner
                  const x2 = 50 + Math.sin(angle) * outer
                  const y2 = 50 - Math.cos(angle) * outer
                  const width = isHour ? 1.6 : 0.8
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
                  )
                })}

                {/* hour, minute, second hands: adjust when nocturne collectible is applied */}
                {(() => {
                  // When nocturne is active, use the current accent color for the clock
                  // by setting the element color to `var(--color-accent)` via the
                  // `text-accent` utility. This allows the clock to adapt when the
                  // user switches accent collectibles. Otherwise, fall back to the
                  // existing neutral/monochrome styling.
                  const armColorClass = nocturne ? 'text-accent' : ''

                  // Second hand color:
                  // - If a custom clock style is applied, keep existing behavior.
                  // - If no custom clock style but an accent is applied, use accent.
                  // - If no accent is applied, fall back to red (danger).
                  const secondStroke = nocturne
                    ? 'currentColor'
                    : !hasClockStyle && accentApplied
                      ? 'var(--color-accent)'
                      : 'var(--color-danger)'

                  const secondClassName = nocturne
                    ? armColorClass
                    : !hasClockStyle && accentApplied
                      ? 'text-accent'
                      : ''
                  return (
                    <>
                      <g transform={`rotate(${hourDeg} 50 50)`} className={nocturne ? 'text-accent' : ''}>
                        <line x1="50" y1="50" x2="50" y2="28" stroke={nocturne ? 'currentColor' : 'var(--color-text-primary)'} strokeWidth={3.8} strokeLinecap="round" className={nocturne ? armColorClass : 'dark:stroke-neutral-100'} />
                      </g>

                      {/* minute hand: kept under nocturne but styled monochrome */}
                      <g transform={`rotate(${minuteDeg} 50 50)`} className={nocturne ? 'text-accent' : ''}>
                        <line x1="50" y1="50" x2="50" y2="18" stroke={nocturne ? 'currentColor' : 'var(--color-text-secondary)'} strokeWidth={2.4} strokeLinecap="round" className={nocturne ? armColorClass : 'dark:stroke-neutral-200'} />
                      </g>

                      {/* second hand */}
                      <g transform={`rotate(${secondDeg} 50 50)`} className={nocturne ? 'text-accent' : ''}>
                        <line
                          x1="50"
                          y1="54"
                          x2="50"
                          y2="14"
                          stroke={secondStroke}
                          strokeWidth={1.4}
                          strokeLinecap="round"
                          className={secondClassName}
                        />
                      </g>

                      {/* center */}
                      <circle cx="50" cy="50" r="2" fill={nocturne ? 'currentColor' : 'var(--color-text-primary)'} className={nocturne ? armColorClass : 'dark:fill-neutral-100'} />
                    </>
                  )
                })()}
              </g>
            </svg>
          </div>
          {dayChunks.length > 0 && (
            <div
              className="ml-4 h-full flex-1 flex flex-col items-end justify-center text-right text-4xl font-black tracking-[0.15em] leading-tight uppercase sm:hidden"
            >
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
  )
}
