import { format } from 'date-fns'
import { lastNDays } from '../../utils/date'
import { hasCompletionOnDay } from '../../utils/scoring'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Habit } from '../../types'

export default function MiniChart({ habit }: { habit: Habit }) {
  const days = lastNDays(14)
  const data = days.map((d) => ({
    day: format(d, 'd MMM'),
    value: hasCompletionOnDay(habit.completions, d) ? 1 : 0,
  }))

  const fillId = `fill-${habit.id}`

  return (
    <div className="h-24 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, bottom: 4, left: 0, right: 0 }}>
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity={0.7} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" hide tickMargin={4} />
          <YAxis hide domain={[0, 1]} />
          <Tooltip contentStyle={{ borderRadius: 12 }} />
          <Area type="monotone" dataKey="value" stroke="currentColor" fill={`url(#${fillId})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
