# Ritus — Minimal Habit Tracker

A clean, local-first habit tracker built with React + TypeScript. Daily/weekly habits, streaks, points, and a tiny sparkline — all stored in your browser.

## Features (MVP)
- Create, edit, delete habits (daily or weekly)
- One-tap **Done today** and a Mon–Sun strip to toggle any day
- Live streaks, weekly progress, and a points system (+10 per completion, milestone bonuses)
- Local persistence via `localStorage`
- Responsive UI with dark-mode support (follows system)

## Tech
- React + TypeScript + Vite
- Tailwind CSS
- Zustand (with persistence middleware)
- date-fns
- Recharts (tiny sparkline)
- lucide-react (icons)

## Quickstart
```bash
pnpm i   # or npm i / yarn
pnpm dev # start dev server
```

## Scripts
- `dev` — run Vite dev server
- `build` — type-check + production build
- `preview` — preview the production build

## Project Structure
```text
/src
 ├─ components/         # Reusable pieces
 │   ├─ AddHabit.tsx
 │   ├─ Badge.tsx
 │   ├─ HabitCard.tsx
 │   ├─ HeaderStats.tsx
 │   ├─ MiniChart.tsx
 │   └─ WeekStrip.tsx
 ├─ store/
 │   └─ useHabitStore.ts
 ├─ utils/
 │   ├─ date.ts
 │   └─ scoring.ts
 ├─ types.ts
 ├─ App.tsx
 ├─ main.tsx
 └─ styles.css          # Tailwind entry
```

## Design Notes
- Minimal UI; most styling via Tailwind utilities
- Dark mode uses your OS setting
- Points: +10 per completion, +50 bonus for 7-day (daily) or 4-week (weekly) streaks
- Sorting: unfinished habits for today/this week float to the top

## Roadmap
- [ ] Settings: theme toggle, custom point values
- [ ] Heatmap + trends
- [ ] Reminders (web push), optional auth + cloud sync
- [ ] Unit tests (Jest + RTL)

---

Built for learning and everyday use. PRs welcome.
