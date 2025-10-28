const emojiModules = import.meta.glob<string>('../../emoji/**/*.svg', {
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
  path: string
  searchText: string
}

export interface EmojiCategory {
  category: string
  categoryLabel: string
  items: EmojiItem[]
}

const byCategory = new Map<string, EmojiItem[]>()
const emojiIndex = new Map<string, EmojiItem>()

for (const [fullPath, mod] of Object.entries(emojiModules)) {
  const parts = fullPath.split('/')
  if (parts.length < 3) continue
  const fileName = parts[parts.length - 1]
  const category = parts[parts.length - 2]
  const id = `${category}/${fileName.replace(/\.svg$/i, '')}`
  const categoryLabel = formatLabel(category)
  const label = formatLabel(fileName)
  const path = mod

  const searchText = buildSearchText([label, categoryLabel, fileName, category])

  const item: EmojiItem = {
    id,
    category,
    categoryLabel,
    label,
    fileName,
    path,
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
