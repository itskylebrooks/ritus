// Import SVGs as raw strings so we can normalize colors to currentColor
// and also as URLs for any legacy <img> usage.
const emojiModulesRaw = import.meta.glob<string>('../../emoji/**/*.svg', {
  eager: true,
  as: 'raw',
})
const emojiModulesUrl = import.meta.glob<string>('../../emoji/**/*.svg', {
  eager: true,
  import: 'default',
})

function formatLabel(input: string): string {
  return input
    .replace(/\.[^/.]+$/, '') // drop extension
    .replace(/[_-]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function buildSearchText(parts: string[]): string {
  return parts
    .join(' ')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export interface EmojiItem {
  id: string
  category: string
  categoryLabel: string
  label: string
  fileName: string
  // Original asset URL (kept for any legacy usage)
  path?: string
  // Normalized inline SVG content set to use currentColor
  svg: string
  searchText: string
}

export interface EmojiCategory {
  category: string
  categoryLabel: string
  items: EmojiItem[]
}

const byCategory = new Map<string, EmojiItem[]>()
const emojiIndex = new Map<string, EmojiItem>()

function normalizeSvgToCurrentColor(src: string): string {
  let s = src
  // Ensure width/height are scalable with font-size
  s = s.replace(/<svg\b([^>]*?)>/i, (m, attrs) => {
    // Drop existing width/height attrs and replace with 1em
    const clean = attrs
      .replace(/\swidth="[^"]*"/gi, '')
      .replace(/\sheight="[^"]*"/gi, '')
    return `<svg${clean} width="1em" height="1em">`
  })
  // Replace fills (except 'none') with currentColor
  s = s.replace(/fill="(?!none)[^"]*"/gi, 'fill="currentColor"')
  // Replace strokes (except 'none') with currentColor as well, for outline icons
  s = s.replace(/stroke="(?!none)[^"]*"/gi, 'stroke="currentColor"')
  return s
}

for (const [fullPath, raw] of Object.entries(emojiModulesRaw)) {
  const parts = fullPath.split('/')
  if (parts.length < 3) continue
  const fileName = parts[parts.length - 1]
  const category = parts[parts.length - 2]
  const id = `${category}/${fileName.replace(/\.svg$/i, '')}`
  const categoryLabel = formatLabel(category)
  const label = formatLabel(fileName)
  const svg = normalizeSvgToCurrentColor(raw)
  const url = (emojiModulesUrl as Record<string, string>)[fullPath]

  const searchText = buildSearchText([label, categoryLabel, fileName, category])

  const item: EmojiItem = {
    id,
    category,
    categoryLabel,
    label,
    fileName,
    path: url,
    svg,
    searchText,
  }

  emojiIndex.set(id, item)

  const arr = byCategory.get(category) ?? []
  arr.push(item)
  byCategory.set(category, arr)
}

const emojiCategories: EmojiCategory[] = Array.from(byCategory.entries())
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([category, items]) => ({
    category,
    categoryLabel: formatLabel(category),
    items: items.sort((a, b) => a.label.localeCompare(b.label)),
  }))

export { emojiCategories, emojiIndex }
