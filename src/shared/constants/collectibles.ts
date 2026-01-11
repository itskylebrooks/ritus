import {
  Atom,
  BookOpen,
  Cake,
  Droplet,
  Feather,
  Flame,
  Gem,
  Laugh,
  Leaf,
  Lightbulb,
  Medal,
  PlayCircle,
  Rainbow,
  Ship,
  Sparkles,
  Sprout,
  Star,
  Sun,
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
    cost: 4000,
    implemented: false,
  },
  {
    id: 'quotes_author',
    type: 'quotes',
    title: 'Author’s Notes',
    desc: 'Reflections and short lines by Kyle Brooks.',
    icon: Feather,
    cost: 770,
    implemented: true,
  },
  {
    id: 'quotes_creators',
    type: 'quotes',
    title: 'Creators & Builders',
    desc: 'From video creators and makers. Use licensed/original sources.',
    icon: PlayCircle,
    cost: 1000,
    implemented: false,
  },
  {
    id: 'quotes_athletes',
    type: 'quotes',
    title: 'Athletes',
    desc: 'Training wisdom and discipline. Use licensed or PD sources.',
    icon: Medal,
    cost: 1500,
    implemented: false,
  },
  {
    id: 'quotes_christianity',
    type: 'quotes',
    title: 'Christian Wisdom',
    desc: 'Public‑domain scripture and classic commentary only.',
    icon: BookOpen,
    cost: 3000,
    implemented: false,
  },
  {
    id: 'quotes_zen_fragments',
    type: 'quotes',
    title: 'Zen Fragments',
    desc: 'Concise, present-moment koans and reflections inspired by Zen practice.',
    icon: Sprout,
    cost: 1700,
    implemented: false,
  },
  {
    id: 'quotes_mediterranean',
    type: 'quotes',
    title: 'Mediterranean Ease',
    desc: 'Gentle reminders inspired by Mediterranean living—slow, savory pauses (dolce far niente / mañana) framed for healthy balance.',
    icon: Sun,
    cost: 500,
    implemented: false,
  },
  {
    id: 'quotes_nordic_friluftsliv',
    type: 'quotes',
    title: 'Nordic Friluftsliv',
    desc: 'Short reflections on simple living and a love of the outdoors (friluftsliv) — calm, nature-centered prompts.',
    icon: Ship,
    cost: 900,
    implemented: false,
  },
  {
    id: 'quotes_stoic_classics',
    type: 'quotes',
    title: 'Stoic Calm',
    desc: 'Stoic-inspired lines from Greek and Roman thought—practical, composed guidance for steady habits.',
    icon: BookOpen,
    cost: 1200,
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
    title: 'Crimson',
    desc: 'A vivid, rich red tone that energizes the interface.',
    icon: Atom,
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
  {
    id: 'accent_corall_pink',
    type: 'accent',
    title: 'Corall Pink',
    desc: 'A soft yet vivid coral-pink hue with lively warmth.',
    icon: Rainbow,
    cost: 2000,
    implemented: true,
  },
  {
    id: 'accent_gold',
    type: 'accent',
    title: 'Gold',
    desc: 'A classic, luminous gold that conveys richness and celebration.',
    icon: Cake,
    cost: 2400,
    implemented: true,
  },
  {
    id: 'accent_sand',
    type: 'accent',
    title: 'Sand',
    desc: 'A warm beige—subtle and sandy for gentle, neutral accents.',
    icon: Star,
    cost: 900,
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
    icon: Lightbulb,
    cost: 2500,
    implemented: true,
  },
  {
    id: 'anim_whisper_text',
    type: 'animation',
    title: 'Whisper Text',
    desc: 'Words reveal themselves character by character, like a quiet whisper.',
    icon: Feather,
    cost: 3000,
    implemented: true,
  },
  {
    id: 'anim_sparkle_progress',
    type: 'animation',
    title: 'Sparkle Progress',
    desc: 'Your progress is celebrated with a magical sparkle effect as the bar fills.',
    icon: Sparkles,
    cost: 1000,
    implemented: true,
  },
  {
    id: 'anim_confetti_button',
    type: 'animation',
    title: 'Celebration Pop',
    desc: 'A delightful burst of micro-confetti pops whenever you complete a habit.',
    icon: Target,
    cost: 1700,
    implemented: true,
  },
  {
    id: 'anim_emoji_rain',
    type: 'animation',
    title: 'Emoji Rain',
    desc: 'Your chosen emoji falls like rain when you set it for the day.',
    icon: Laugh,
    cost: 1200,
    implemented: true,
  },
];

export default COLLECTIBLES;
