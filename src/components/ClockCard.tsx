import { useEffect, useState } from 'react'

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

  return (
    <div className="rounded-2xl border dark:border-neutral-700 bg-white dark:bg-neutral-950 shadow-sm overflow-hidden">
      <div className="w-full" style={{ paddingBottom: '100%', position: 'relative' }}>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-label="Analog clock">
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
            // Start the tick a bit further inside for hour ticks so they look longer
            const inner = isHour ? 36 : 42; // distance from center where tick begins
            const outer = 46;               // distance from center where tick ends (near card edge)
            const x1 = 50 + Math.sin(angle) * inner;
            const y1 = 50 - Math.cos(angle) * inner;
            const x2 = 50 + Math.sin(angle) * outer;
            const y2 = 50 - Math.cos(angle) * outer;
            const stroke = isHour ? '#94a3b8' : '#cbd5e1';
            const width = isHour ? 1.6 : 0.8;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={stroke}
                strokeWidth={width}
                className={isHour ? 'dark:stroke-neutral-400' : 'dark:stroke-neutral-600'}
              />
            );
          })}

          {/* hour hand */}
          <g transform={`rotate(${hourDeg} 50 50)`}>
            <line x1="50" y1="50" x2="50" y2="30" stroke="#111827" strokeWidth={3.5} strokeLinecap="round" className="dark:stroke-neutral-100" />
          </g>

          {/* minute hand */}
          <g transform={`rotate(${minuteDeg} 50 50)`}>
            <line x1="50" y1="50" x2="50" y2="22" stroke="#374151" strokeWidth={2.2} strokeLinecap="round" className="dark:stroke-neutral-200" />
          </g>

          {/* second hand */}
          <g transform={`rotate(${secondDeg} 50 50)`}>
            <line x1="50" y1="54" x2="50" y2="18" stroke="#ef4444" strokeWidth={1.4} strokeLinecap="round" />
          </g>

          {/* center */}
          <circle cx="50" cy="50" r="2" fill="#111827" className="dark:fill-neutral-100" />
        </g>
        </svg>
      </div>
    </div>
  )
}
