import type { ComponentType } from 'react'
import { Zap, ShieldCheck, CalendarRange, Trophy, Medal } from 'lucide-react'

export type TrophyGroup = 'daily_build' | 'daily_break' | 'weekly' | 'totals'
export interface TrophyDef {
  id: string
  label: string
  group: TrophyGroup
  threshold: number
  Icon: ComponentType<any>
  // short reason/description shown under the title (e.g. "7-day streak")
  reason?: string
}

export const TROPHIES: TrophyDef[] = [
  { id: 'streak_daily_build_7',   label: 'First Flame',      group: 'daily_build', threshold: 7,  Icon: Zap, reason: '7-day streak' },
  { id: 'streak_daily_build_14',  label: 'Quiet Momentum',   group: 'daily_build', threshold: 14, Icon: Zap, reason: '14-day streak' },
  { id: 'streak_daily_build_30',  label: 'Steady Ember',     group: 'daily_build', threshold: 30, Icon: Zap, reason: '30-day streak' },
  { id: 'streak_daily_build_50',  label: 'Rhythm Keeper',    group: 'daily_build', threshold: 50, Icon: Zap, reason: '50-day streak' },
  { id: 'streak_daily_build_100', label: 'Enduring Flame',   group: 'daily_build', threshold: 100,Icon: Zap, reason: '100-day streak' },

  { id: 'streak_daily_break_7',   label: 'Clean Start',      group: 'daily_break', threshold: 7,  Icon: ShieldCheck, reason: '7-day clean streak' },
  { id: 'streak_daily_break_14',  label: 'Clear Mind',       group: 'daily_break', threshold: 14, Icon: ShieldCheck, reason: '14-day clean streak' },
  { id: 'streak_daily_break_30',  label: 'Bright Path',      group: 'daily_break', threshold: 30, Icon: ShieldCheck, reason: '30-day clean streak' },
  { id: 'streak_daily_break_60',  label: 'Strong Will',      group: 'daily_break', threshold: 60, Icon: ShieldCheck, reason: '60-day clean streak' },
  { id: 'streak_daily_break_100', label: 'Unbroken',         group: 'daily_break', threshold: 100,Icon: ShieldCheck, reason: '100-day clean streak' },

  { id: 'streak_weekly_4',        label: 'One Month Strong', group: 'weekly',      threshold: 4,  Icon: CalendarRange, reason: '4 consecutive weekly wins' },
  { id: 'streak_weekly_12',       label: 'Season of Focus',  group: 'weekly',      threshold: 12, Icon: CalendarRange, reason: '12 consecutive weekly wins' },
  { id: 'streak_weekly_26',       label: 'Half-Year Pace',   group: 'weekly',      threshold: 26, Icon: CalendarRange, reason: '26 consecutive weekly wins' },
  { id: 'streak_weekly_52',       label: 'Year of Practice', group: 'weekly',      threshold: 52, Icon: CalendarRange, reason: '52 consecutive weekly wins' },

  { id: 'total_50',               label: 'Momentum Starter', group: 'totals',      threshold: 50,  Icon: Medal, reason: '50 total completions' },
  { id: 'total_200',              label: 'Daily Craftsman',  group: 'totals',      threshold: 200, Icon: Medal, reason: '200 total completions' },
  { id: 'total_500',              label: 'Habit Architect',  group: 'totals',      threshold: 500, Icon: Medal, reason: '500 total completions' },
  { id: 'total_1000',             label: 'Ritus Veteran',    group: 'totals',      threshold: 1000,Icon: Medal, reason: '1000 total completions' },
]

export default TROPHIES
