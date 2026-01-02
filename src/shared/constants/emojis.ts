import emojiData from 'emojibase-data/en/data.json';
import groupsMeta from 'emojibase-data/meta/groups.json';
import messages from 'emojibase-data/en/messages.json';
import shortcodes from 'emojibase-data/en/shortcodes/emojibase.json';

interface EmojibaseEntry {
  label: string;
  hexcode: string;
  emoji?: string;
  text?: string;
  tags?: string[];
  order?: number;
  group?: number;
  subgroup?: number;
  skins?: EmojibaseEntry[];
}

interface MessagesGroupsEntry {
  key: string;
  message: string;
  order: number;
}

const GROUP_SLUG_BY_INDEX = groupsMeta.groups as Record<string, string>;
const GROUP_LABEL_BY_SLUG = new Map<string, string>();
const GROUP_ORDER_BY_SLUG = new Map<string, number>();

function toTitleCase(input: string): string {
  return input
    .split(/\s+/)
    .map((token) => {
      if (!token) return token;
      // Keep ampersand and similar symbols unchanged
      if (token === '&' || token === '–' || token === '-') return token;
      const first = token.charAt(0);
      return first.toUpperCase() + token.slice(1);
    })
    .join(' ');
}

messages.groups.forEach((entry) => {
  const { key, message, order } = entry as MessagesGroupsEntry;
  GROUP_LABEL_BY_SLUG.set(key, toTitleCase(message));
  GROUP_ORDER_BY_SLUG.set(key, order);
});

function normalizeWords(value: string | undefined | null): string[] {
  if (!value) return [];
  return value
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function buildSearchText(parts: string[]): string {
  return Array.from(new Set(parts.map((p) => p.toLowerCase().trim()).filter(Boolean))).join(' ');
}

export interface EmojiItem {
  id: string;
  emoji: string;
  label: string;
  category: string;
  categoryLabel: string;
  order: number;
  keywords: string[];
  searchText: string;
}

export interface EmojiCategory {
  category: string;
  categoryLabel: string;
  items: EmojiItem[];
}

const emojiIndex = new Map<string, EmojiItem>();
const categoryMap = new Map<string, EmojiItem[]>();
const legacyIdMap = new Map<string, string>();

function toLegacyKey(input?: string | null): string | null {
  if (!input) return null;
  const key = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return key || null;
}

function registerLegacyKeys(item: EmojiItem, entry: EmojibaseEntry, base?: EmojibaseEntry) {
  const push = (key?: string | null) => {
    if (!key) return;
    if (!legacyIdMap.has(key)) legacyIdMap.set(key, item.id);
  };

  push(item.id.toLowerCase());
  push(toLegacyKey(entry.label));
  push(toLegacyKey(base?.label));
}

function resolveCategory(entry: EmojibaseEntry, fallback?: EmojibaseEntry) {
  const groupIndex = entry.group ?? fallback?.group ?? 0;
  const slug = GROUP_SLUG_BY_INDEX[String(groupIndex)] ?? 'symbols';
  const label = GROUP_LABEL_BY_SLUG.get(slug) ?? toTitleCase(slug.replace(/[-_]/g, ' '));
  const order = GROUP_ORDER_BY_SLUG.get(slug) ?? groupIndex;
  return { slug, label, order };
}

function collectKeywords(entry: EmojibaseEntry, base?: EmojibaseEntry): string[] {
  const keywords = new Set<string>();

  const add = (vals?: string[] | string | null) => {
    if (!vals) return;
    if (Array.isArray(vals)) {
      vals.forEach((val) => normalizeWords(val).forEach((word) => keywords.add(word)));
    } else {
      normalizeWords(vals).forEach((word) => keywords.add(word));
    }
  };

  add(entry.label);
  add(base?.label);
  add(entry.tags);
  add(base?.tags);

  const addShortcodes = (hex?: string) => {
    if (!hex) return;
    const codes = (shortcodes as Record<string, string[] | undefined>)[hex];
    if (!codes) return;
    add(codes);
  };

  addShortcodes(entry.hexcode);
  if (base?.hexcode && base.hexcode !== entry.hexcode) addShortcodes(base.hexcode);

  return Array.from(keywords);
}

function register(entry: EmojibaseEntry, base?: EmojibaseEntry) {
  if (!entry.emoji) return;

  const { slug, label: categoryLabel, order: categoryOrder } = resolveCategory(entry, base);
  const keywords = collectKeywords(entry, base);
  const searchTokens = [...keywords];
  if (entry.label) searchTokens.push(entry.label);
  if (base?.label) searchTokens.push(base.label);
  const searchText = buildSearchText(searchTokens);

  const item: EmojiItem = {
    id: entry.hexcode,
    emoji: entry.emoji,
    label: entry.label || base?.label || entry.emoji,
    category: slug,
    categoryLabel,
    order: entry.order ?? base?.order ?? Number.MAX_SAFE_INTEGER,
    keywords,
    searchText,
  };

  emojiIndex.set(item.id, item);
  registerLegacyKeys(item, entry, base);

  const list = categoryMap.get(slug);
  if (list) {
    list.push(item);
  } else {
    categoryMap.set(slug, [item]);
  }

  // Store category order for later sorting if not already stored.
  if (!GROUP_ORDER_BY_SLUG.has(slug)) {
    GROUP_ORDER_BY_SLUG.set(slug, categoryOrder);
  }
}

(emojiData as EmojibaseEntry[]).forEach((entry) => {
  // Always register the base entry
  register(entry);

  // For People & Body, do not register skin tone variants.
  // Instead, map toned hexcodes back to the base so old IDs still resolve.
  const baseCategory = resolveCategory(entry);
  if (baseCategory.slug === 'people-body') {
    if (entry.skins) {
      entry.skins.forEach((skin) => {
        const toned = (skin.hexcode || '').toLowerCase();
        if (toned) legacyIdMap.set(toned, entry.hexcode);
      });
    }
    return;
  }

  // For all other categories, include skin tone variants when available
  if (entry.skins) {
    entry.skins.forEach((skin) => register(skin, entry));
  }
});

const emojiCategories: EmojiCategory[] = Array.from(categoryMap.entries())
  .map(([category, items]) => {
    const categoryLabel = items[0]?.categoryLabel ?? category;
    return {
      category,
      categoryLabel,
      items: items.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label)),
    };
  })
  .sort((a, b) => {
    const aOrder = GROUP_ORDER_BY_SLUG.get(a.category) ?? 999;
    const bOrder = GROUP_ORDER_BY_SLUG.get(b.category) ?? 999;
    return aOrder - bOrder || a.categoryLabel.localeCompare(b.categoryLabel);
  });

export { emojiCategories, emojiIndex };

export function resolveEmojiId(value: string | null | undefined): string | null {
  if (!value) return null;
  if (emojiIndex.has(value)) return value;
  const lower = value.toLowerCase();
  const normalized = toLegacyKey(lower);
  if (normalized && legacyIdMap.has(normalized)) return legacyIdMap.get(normalized) ?? null;
  if (legacyIdMap.has(lower)) return legacyIdMap.get(lower) ?? null;
  const parts = lower.split('/');
  if (parts.length > 1) {
    const last = parts[parts.length - 1];
    const lastNormalized = toLegacyKey(last);
    if (lastNormalized && legacyIdMap.has(lastNormalized))
      return legacyIdMap.get(lastNormalized) ?? null;
    if (legacyIdMap.has(last)) return legacyIdMap.get(last) ?? null;
  }
  return null;
}
