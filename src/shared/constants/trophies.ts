import type { ComponentType } from 'react'
import { Zap, ShieldCheck, Sunrise, CalendarRange, Smile, Medal, Scale, HeartPulse, Focus, BatteryFull, Clock, Hourglass, Infinity } from 'lucide-react'

export type TrophyGroup = 'daily_build' | 'daily_break' | 'weekly' | 'monthly' | 'totals' | 'meta' | 'milestone' | 'emoji'
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
  // Daily build trophies (streaks)
  { id: 'streak_daily_build_7',   label: 'First Flame',      group: 'daily_build', threshold: 7,  Icon: Zap, reason: '7-day streak' },
  { id: 'streak_daily_build_14',  label: 'Quiet Momentum',   group: 'daily_build', threshold: 14, Icon: Zap, reason: '14-day streak' },
  { id: 'streak_daily_build_30',  label: 'Steady Ember',     group: 'daily_build', threshold: 30, Icon: Zap, reason: '30-day streak' },
  { id: 'streak_daily_build_50',  label: 'Rhythm Keeper',    group: 'daily_build', threshold: 50, Icon: Zap, reason: '50-day streak' },
  { id: 'streak_daily_build_100', label: 'Enduring Flame',   group: 'daily_build', threshold: 100,Icon: Zap, reason: '100-day streak' },
  // Daily break trophies (clean streaks)
  { id: 'streak_daily_break_7',   label: 'Clean Start',      group: 'daily_break', threshold: 7,  Icon: ShieldCheck, reason: '7-day clean streak' },
  { id: 'streak_daily_break_14',  label: 'Clear Mind',       group: 'daily_break', threshold: 14, Icon: ShieldCheck, reason: '14-day clean streak' },
  { id: 'streak_daily_break_30',  label: 'Bright Path',      group: 'daily_break', threshold: 30, Icon: ShieldCheck, reason: '30-day clean streak' },
  { id: 'streak_daily_break_60',  label: 'Strong Will',      group: 'daily_break', threshold: 60, Icon: ShieldCheck, reason: '60-day clean streak' },
  { id: 'streak_daily_break_100', label: 'Unbroken',         group: 'daily_break', threshold: 100,Icon: ShieldCheck, reason: '100-day clean streak' },
  // Weekly habit trophies (consecutive weekly wins)
  { id: 'streak_weekly_4',        label: 'One Month Strong', group: 'weekly',      threshold: 4,  Icon: CalendarRange, reason: '4 consecutive weekly wins' },
  { id: 'streak_weekly_12',       label: 'Season of Focus',  group: 'weekly',      threshold: 12, Icon: CalendarRange, reason: '12 consecutive weekly wins' },
  { id: 'streak_weekly_26',       label: 'Half-Year Pace',   group: 'weekly',      threshold: 26, Icon: CalendarRange, reason: '26 consecutive weekly wins' },
  { id: 'streak_weekly_52',       label: 'Year of Practice', group: 'weekly',      threshold: 52, Icon: CalendarRange, reason: '52 consecutive weekly wins' },
  // Total completions trophies
  { id: 'total_50',               label: 'Momentum Starter', group: 'totals',      threshold: 50,  Icon: Medal, reason: '50 total completions' },
  { id: 'total_200',              label: 'Daily Craftsman',  group: 'totals',      threshold: 200, Icon: Medal, reason: '200 total completions' },
  { id: 'total_500',              label: 'Habit Architect',  group: 'totals',      threshold: 500, Icon: Medal, reason: '500 total completions' },
  { id: 'total_1000',             label: 'Ritus Veteran',    group: 'totals',      threshold: 1000,Icon: Medal, reason: '1000 total completions' },
  // Monthly habit trophies (consecutive monthly wins)
  { id: 'streak_monthly_1',      label: 'Monthly Novice',   group: 'monthly',     threshold: 1,  Icon: Sunrise, reason: '1 consecutive monthly win' },
  { id: 'streak_monthly_3',      label: 'Quarterly Keeper',  group: 'monthly',     threshold: 3,  Icon: Sunrise, reason: '3 consecutive monthly wins' },
  { id: 'streak_monthly_6',      label: 'Half-Year Ritual',  group: 'monthly',     threshold: 6,  Icon: Sunrise, reason: '6 consecutive monthly wins' },
  { id: 'streak_monthly_12',     label: 'Year of Rituals',   group: 'monthly',     threshold: 12, Icon: Sunrise, reason: '12 consecutive monthly wins' },
  // Behavioral / meta trophies
  { id: 'meta_balance',         label: 'Equilibrium',      group: 'meta',        threshold: 30, Icon: Scale,       reason: 'Maintained at least one build and one break habit active for 30 days' },
  { id: 'meta_resilience',      label: 'Fell and Rose',    group: 'meta',        threshold: 10, Icon: HeartPulse, reason: 'Broke a long streak and rebuilt it to 10 days' },
  { id: 'meta_focus',           label: 'Uninterrupted',    group: 'meta',        threshold: 7,  Icon: Focus,      reason: 'Completed all active daily habits for 7 days straight' },
  { id: 'meta_persistence',     label: 'Quiet Power',      group: 'meta',        threshold: 30, Icon: BatteryFull,reason: 'Logged at least one completion every day for a full month' },
  // Temporal / milestone trophies
  { id: 'meta_90days',         label: 'Season Walker',     group: 'milestone',   threshold: 90, Icon: Clock,      reason: 'Used Ritus for 90 days' },
  { id: 'meta_180days',        label: 'Half-Year Light',   group: 'milestone',   threshold: 180,Icon: Hourglass,  reason: 'Used Ritus for 180 days' },
  { id: 'meta_365days',        label: 'Circle Complete',   group: 'milestone',   threshold: 365,Icon: Infinity,   reason: 'Used Ritus for a full year' },
  // Emoji journaling trophies (consecutive days with an emoji of the day)
  { id: 'emoji_streak_1',      label: 'First Emoji',       group: 'emoji',       threshold: 1,  Icon: Smile, reason: 'First emoji of your journey' },
  { id: 'emoji_streak_7',      label: 'Mood Starter',      group: 'emoji',       threshold: 7,  Icon: Smile, reason: '7 days of emojis' },
  { id: 'emoji_streak_14',     label: 'Mood Keeper',       group: 'emoji',       threshold: 14, Icon: Smile, reason: '14 days of emojis' },
  { id: 'emoji_streak_30',     label: 'Emoji Journaler',   group: 'emoji',       threshold: 30, Icon: Smile, reason: '30 days without a break' },
]

export default TROPHIES
