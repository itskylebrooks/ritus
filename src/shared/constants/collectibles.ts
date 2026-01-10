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
    desc: 'A deep, calming blue-grey reminiscent of the open sea.',
    icon: Waves,
    cost: 4000,
    implemented: true,
  },
  {
    id: 'accent_ember',
    type: 'accent',
    title: 'Ember',
    desc: 'A subtle, warming orange glow like dying embers.',
    icon: Flame,
    cost: 500,
    implemented: true,
  },
  {
    id: 'accent_sage',
    type: 'accent',
    title: 'Sage',
    desc: 'A calm, muted green inspired by natural sage leaves.',
    icon: Leaf,
    cost: 800,
    implemented: true,
  },
  {
    id: 'accent_lagoon',
    type: 'accent',
    title: 'Lagoon',
    desc: 'A refreshing cool teal that evokes hidden tropical waters.',
    icon: Droplet,
    cost: 1200,
    implemented: true,
  },
  {
    id: 'accent_citrine',
    type: 'accent',
    title: 'Citrine',
    desc: 'A bright, warm golden tone that radiates energy.',
    icon: Sun,
    cost: 2200,
    implemented: true,
  },
  {
    id: 'accent_amethyst',
    type: 'accent',
    title: 'Amethyst',
    desc: 'A luxurious, deep violet hue representing wisdom and calm.',
    icon: Gem,
    cost: 2600,
    implemented: true,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // ANIMATIONS
  // These unlock visual effects across the app.
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'anim_mist_fade',
    type: 'animation',
    title: 'Mist Fade',
    desc: 'Pages dissolve into one another like morning mist clearing.',
    icon: Waves,
    cost: 2000,
    implemented: true,
  },
  {
    id: 'anim_lumina_touch',
    type: 'animation',
    title: 'Lumina Touch',
    desc: 'Completing a habit ignites a soft, radiant glow under your touch.',
    icon: Sun,
    cost: 2500,
    implemented: true,
  },
  {
    id: 'anim_whisper_text',
    type: 'animation',
    title: 'Whisper Text',
    desc: 'Words reveal themselves character by character, like a quiet whisper.',
    icon: Feather,
    cost: 1500,
    implemented: true,
  },
  {
    id: 'anim_sparkle_progress',
    type: 'animation',
    title: 'Sparkle Progress',
    desc: 'Your progress is celebrated with a magical sparkle effect as the bar fills.',
    icon: Sparkles,
    cost: 1800,
    implemented: true,
  },
  {
    id: 'anim_confetti_button',
    type: 'animation',
    title: 'Celebration Pop',
    desc: 'A delightful burst of micro-confetti pops whenever you complete a habit.',
    icon: Target,
    cost: 2200,
    implemented: true,
  },
];

export default COLLECTIBLES;
