import type { ComponentType } from 'react'
import { Clock, Timer, SunMoon, Quote, BookOpen, Palette, Flame, Leaf, Star, Compass, Gem, Feather, Gauge, Radar, Target, PlayCircle, Medal, Moon, Hourglass, Bell, Anchor, Lamp, Stamp } from 'lucide-react'

export type CollectibleType = 'clock' | 'quotes' | 'accent' | 'relic'
export type Rarity = 'common' | 'rare' | 'epic'

export interface CollectibleDef {
  id: string
  type: CollectibleType
  title: string
  desc: string
  icon: ComponentType<any>
  rarity: Rarity
  cost: number
}

export const COLLECTIBLES: CollectibleDef[] = [
  // ────────────────────────────────────────────────────────────────────────────
  // CLOCK STYLES (all analog; placeholders only)
  // Keep visuals monochrome and minimal. Implementation to be added later.
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'clock_pilot_markers',
    type: 'clock',
    title: 'Pilot Markers',
    desc: 'Bold 12/3/6/9 indices, tapered hands, high-contrast ticks.',
    icon: Gauge,
    rarity: 'rare',
    cost: 600,
  },
  {
    id: 'clock_nocturne',
    type: 'clock',
    title: 'Nocturne',
    desc: 'Hour-only bars, faint minute ring, deep contrast.',
    icon: Moon,
    rarity: 'common',
    cost: 300,
  },
  {
    id: 'clock_sector',
    type: 'clock',
    title: 'Sector Dial',
    desc: 'Quarter-hour sectors with a fine minute track.',
    icon: Target,
    rarity: 'epic',
    cost: 3000,
  },
  {
    id: 'clock_orbit_subdial',
    type: 'clock',
    title: 'Orbit Subdial',
    desc: 'Small seconds subdial with continuous sweep.',
    icon: SunMoon,
    rarity: 'epic',
    cost: 2500,
  },
  {
    id: 'clock_radar_sweep',
    type: 'clock',
    title: 'Radar Sweep',
    desc: 'Radial index array; slender hands with smooth motion.',
    icon: Radar,
    rarity: 'rare',
    cost: 800,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // QUOTE PACKS (placeholders)
  // NOTE: Populate with ORIGINAL text, PUBLIC-DOMAIN sources, or LICENSED content only.
  // Do not ship copyrighted quotes without permission. Packs may ship empty by default.
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'quotes_hollywood',
    type: 'quotes',
    title: 'Hollywood Voices',
    desc: 'Short, attributed lines. Use licensed or public-domain sources.',
    icon: Star,
    rarity: 'epic',
    cost: 3500,
  },
  {
    id: 'quotes_author_kyle',
    type: 'quotes',
    title: 'Author’s Notes',
    desc: 'Original reflections by the developer.',
    icon: Feather,
    rarity: 'rare',
    cost: 770,
  },
  {
    id: 'quotes_creators',
    type: 'quotes',
    title: 'Creators & Builders',
    desc: 'From video creators and makers. Use licensed/original sources.',
    icon: PlayCircle,
    rarity: 'common',
    cost: 300,
  },
  {
    id: 'quotes_athletes',
    type: 'quotes',
    title: 'Athletes',
    desc: 'Training wisdom and discipline. Use licensed or PD sources.',
    icon: Medal,
    rarity: 'common',
    cost: 250,
  },
  {
    id: 'quotes_christianity',
    type: 'quotes',
    title: 'Christian Wisdom',
    desc: 'Public‑domain scripture and classic commentary only.',
    icon: BookOpen,
    rarity: 'rare',
    cost: 1000,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // ACCENT THEMES (placeholders; monochrome-friendly accents)
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'accent_ocean',
    type: 'accent',
    title: 'Ocean',
    desc: 'Calm blue‑grey accent.',
    icon: Palette,
    rarity: 'epic',
    cost: 4000,
  },
  {
    id: 'accent_ember',
    type: 'accent',
    title: 'Ember',
    desc: 'Warm subtle orange accent.',
    icon: Flame,
    rarity: 'common',
    cost: 500,
  },
  {
    id: 'accent_sage',
    type: 'accent',
    title: 'Sage',
    desc: 'Soft green accent.',
    icon: Leaf,
    rarity: 'rare',
    cost: 800,
  },
  {
    id: 'accent_gold',
    type: 'accent',
    title: 'Gold',
    desc: 'Muted gold accent for highlights.',
    icon: Star,
    rarity: 'epic',
    cost: 2000,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // MYSTERIOUS RELICS (symbolic; placeholders)
  // These can later unlock tiny cosmetic/ritual effects (no scoring changes).
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'relic_compass_core',
    type: 'relic',
    title: 'Compass Core',
    desc: 'Center that orients everything.',
    icon: Compass,
    rarity: 'epic',
    cost: 2500,
  },
  {
    id: 'relic_eclipse_ring',
    type: 'relic',
    title: 'Eclipse Ring',
    desc: 'Shadow and light in balance.',
    icon: Gem,
    rarity: 'epic',
    cost: 2500,
  },
  {
    id: 'relic_lamp',
    type: 'relic',
    title: 'Lamp',
    desc: 'A quiet light to keep going.',
    icon: Lamp,
    rarity: 'epic',
    cost: 2500,
  },
  {
    id: 'relic_phoenix_thread',
    type: 'relic',
    title: 'Phoenix Thread',
    desc: 'Quiet renewal stitched daily.',
    icon: Feather,
    rarity: 'epic',
    cost: 5000,
  },
    {
    id: 'relic_moon_dial',
    type: 'relic',
    title: 'Moon Dial',
    desc: 'A calm lunar arc for nightly review.',
    icon: Moon,
    rarity: 'rare',
    cost: 1700,
  },
  {
    id: 'relic_obsidian_hourglass',
    type: 'relic',
    title: 'Obsidian Hourglass',
    desc: 'Time felt, not forced.',
    icon: Hourglass,
    rarity: 'rare',
    cost: 1300,
  },
  {
    id: 'relic_quiet_bell',
    type: 'relic',
    title: 'Quiet Bell',
    desc: 'A soft chime for gentle wins.',
    icon: Bell,
    rarity: 'rare',
    cost: 1500,
  },
  {
    id: 'relic_anchor_resolve',
    type: 'relic',
    title: 'Anchor of Resolve',
    desc: 'Hold steady when tempted to quit.',
    icon: Anchor,
    rarity: 'common',
    cost: 700,
  },
  {
    id: 'relic_vow_seal',
    type: 'relic',
    title: 'Vow Seal',
    desc: 'A promise kept, quietly.',
    icon: Stamp,
    rarity: 'rare',
    cost: 1200,
  },
]

export default COLLECTIBLES
