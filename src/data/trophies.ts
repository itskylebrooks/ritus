import type { ComponentType } from 'react'
import { Flame, ShieldCheck, CalendarRange, Trophy } from 'lucide-react'

export type TrophyGroup = 'daily_build' | 'daily_break' | 'weekly' | 'totals'
export interface TrophyDef {
  id: string
  label: string
  group: TrophyGroup
  threshold: number
  Icon: ComponentType<any>
}

export const TROPHIES: TrophyDef[] = [
  { id: 'streak_daily_build_7',   label: 'First Flame',      group: 'daily_build', threshold: 7,  Icon: Flame },
  { id: 'streak_daily_build_14',  label: 'Quiet Momentum',   group: 'daily_build', threshold: 14, Icon: Flame },
  { id: 'streak_daily_build_30',  label: 'Steady Ember',     group: 'daily_build', threshold: 30, Icon: Flame },
  { id: 'streak_daily_build_50',  label: 'Rhythm Keeper',    group: 'daily_build', threshold: 50, Icon: Flame },
  { id: 'streak_daily_build_100', label: 'Enduring Flame',   group: 'daily_build', threshold: 100,Icon: Flame },

  { id: 'streak_daily_break_7',   label: 'Clean Start',      group: 'daily_break', threshold: 7,  Icon: ShieldCheck },
  { id: 'streak_daily_break_14',  label: 'Clear Mind',       group: 'daily_break', threshold: 14, Icon: ShieldCheck },
  { id: 'streak_daily_break_30',  label: 'Bright Path',      group: 'daily_break', threshold: 30, Icon: ShieldCheck },
  { id: 'streak_daily_break_60',  label: 'Strong Will',      group: 'daily_break', threshold: 60, Icon: ShieldCheck },
  { id: 'streak_daily_break_100', label: 'Unbroken',         group: 'daily_break', threshold: 100,Icon: ShieldCheck },

  { id: 'streak_weekly_4',        label: 'One Month Strong', group: 'weekly',      threshold: 4,  Icon: CalendarRange },
  { id: 'streak_weekly_12',       label: 'Season of Focus',  group: 'weekly',      threshold: 12, Icon: CalendarRange },
  { id: 'streak_weekly_26',       label: 'Half-Year Pace',   group: 'weekly',      threshold: 26, Icon: CalendarRange },
  { id: 'streak_weekly_52',       label: 'Year of Practice', group: 'weekly',      threshold: 52, Icon: CalendarRange },

  { id: 'total_50',               label: 'Momentum Starter', group: 'totals',      threshold: 50,  Icon: Trophy },
  { id: 'total_200',              label: 'Daily Craftsman',  group: 'totals',      threshold: 200, Icon: Trophy },
  { id: 'total_500',              label: 'Habit Architect',  group: 'totals',      threshold: 500, Icon: Trophy },
  { id: 'total_1000',             label: 'Ritus Veteran',    group: 'totals',      threshold: 1000,Icon: Trophy },
]

export default TROPHIES
