import {
  BookOpen,
  Droplet,
  Feather,
  Flame,
  Gauge,
  Gem,
  Leaf,
  Medal,
  Moon,
  PlayCircle,
  Radar,
  Sparkles,
  Star,
  Sun,
  SunMoon,
  Target,
  Wand2,
  Waves,
} from 'lucide-react';
import type { ComponentType } from 'react';

export type CollectibleType = 'clock' | 'quotes' | 'accent' | 'animation';
export interface CollectibleDef {
  id: string;
  type: CollectibleType;
  title: string;
  desc: string;
  icon: ComponentType<React.SVGProps<SVGSVGElement>>;
  cost: number;
  implemented?: boolean;
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
    cost: 600,
    implemented: false,
  },
  {
    id: 'clock_nocturne',
    type: 'clock',
    title: 'Nocturne',
    desc: 'Hour-only bars, faint minute ring, deep contrast.',
    icon: Moon,
    cost: 300,
    implemented: false,
  },
  {
    id: 'clock_sector',
    type: 'clock',
    title: 'Sector Dial',
    desc: 'Quarter-hour sectors with a fine minute track.',
    icon: Target,
    cost: 3000,
    implemented: false,
  },
  {
    id: 'clock_orbit_subdial',
    type: 'clock',
    title: 'Orbit Subdial',
    desc: 'Small seconds subdial with continuous sweep.',
    icon: SunMoon,
    cost: 2500,
    implemented: false,
  },
  {
    id: 'clock_radar_sweep',
    type: 'clock',
    title: 'Radar Sweep',
    desc: 'Radial index array; slender hands with smooth motion.',
    icon: Radar,
    cost: 800,
    implemented: false,
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
    cost: 3500,
    implemented: false,
  },
  {
    id: 'quotes_author_kyle',
    type: 'quotes',
    title: 'Author’s Notes',
    desc: 'Original reflections by the developer.',
    icon: Feather,
    cost: 770,
    implemented: false,
  },
  {
    id: 'quotes_creators',
    type: 'quotes',
    title: 'Creators & Builders',
    desc: 'From video creators and makers. Use licensed/original sources.',
    icon: PlayCircle,
    cost: 300,
    implemented: false,
  },
  {
    id: 'quotes_athletes',
    type: 'quotes',
    title: 'Athletes',
    desc: 'Training wisdom and discipline. Use licensed or PD sources.',
    icon: Medal,
    cost: 250,
    implemented: false,
  },
  {
    id: 'quotes_christianity',
    type: 'quotes',
    title: 'Christian Wisdom',
    desc: 'Public‑domain scripture and classic commentary only.',
    icon: BookOpen,
    cost: 1000,
    implemented: false,
  },
  {
    id: 'quotes_mindset',
    type: 'quotes',
    title: 'Mindset',
    desc: 'Short affirmations and reframes from licensed or original sources.',
    icon: Star,
    cost: 400,
    implemented: false,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // ACCENT THEMES (placeholders; monochrome-friendly accents)
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'accent_ocean',
    type: 'accent',
    title: 'Ocean',
    desc: 'Calm blue‑grey accent.',
    icon: Waves,
    cost: 4000,
    implemented: true,
  },
  {
    id: 'accent_ember',
    type: 'accent',
    title: 'Ember',
    desc: 'Warm subtle orange accent.',
    icon: Flame,
    cost: 500,
    implemented: true,
  },
  {
    id: 'accent_sage',
    type: 'accent',
    title: 'Sage',
    desc: 'Soft green accent.',
    icon: Leaf,
    cost: 800,
    implemented: true,
  },
  {
    id: 'accent_lagoon',
    type: 'accent',
    title: 'Lagoon',
    desc: 'Cool teal accent.',
    icon: Droplet,
    cost: 1200,
    implemented: true,
  },
  {
    id: 'accent_citrine',
    type: 'accent',
    title: 'Citrine',
    desc: 'Warm golden accent.',
    icon: Sun,
    cost: 2200,
    implemented: true,
  },
  {
    id: 'accent_amethyst',
    type: 'accent',
    title: 'Amethyst',
    desc: 'Rich violet accent.',
    icon: Gem,
    cost: 2600,
    implemented: true,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // ANIMATIONS (placeholders)
  // These can later unlock visual motion (no scoring changes).
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'anim_veilstep',
    type: 'animation',
    title: 'Veilstep Passage',
    desc: 'Soft page transitions with a drifting veil.',
    icon: Wand2,
    cost: 2400,
    implemented: false,
  },
  {
    id: 'anim_glyph_pulse',
    type: 'animation',
    title: 'Glyph Pulse',
    desc: 'Completion marks bloom with a subtle pulse.',
    icon: Sparkles,
    cost: 1400,
    implemented: false,
  },
  {
    id: 'anim_silent_wake',
    type: 'animation',
    title: 'Silent Wake',
    desc: 'Cards slip in with a gentle wake on page load.',
    icon: Moon,
    cost: 1800,
    implemented: false,
  },
];

export default COLLECTIBLES;
