# Ritus — Minimal, Local‑First Habit Tracker

Build better days with a fast, privacy‑first habit tracker. Create daily or weekly habits, track streaks and points, and see progress at a glance — all stored on your device. No accounts. No analytics. Just momentum.

## Why Ritus
- Local‑first: your data stays in the browser (no servers).
- One‑tap tracking: mark today or any day this week in seconds.
- Motivation built‑in: streaks, weekly goals, and points with milestone bonuses.
- Simple by design: clean UI, smooth animations, dark mode, mobile‑friendly.

## What You Can Do
- Create, edit, and delete habits
  - Frequency: `daily` or `weekly` with custom days/week targets
  - Mode: `build` a habit or `break` one (e.g., “No sugar”)
- Track completions via a Mon–Sun week strip or a one‑tap button
- See progress for each habit
  - Streaks (daily or weekly)
  - Weekly progress bar and counts
  - Points (+10 per completion, +50 milestone bonus for 7‑day daily streaks or 4‑week weekly streaks)
- View overall stats in the header
  - Total points, longest streak, weekly completion %
- Manage data from Settings
  - Export/Import JSON
  - Clear all local data
  - Set a username (local only)
  - Privacy policy (no tracking, optional sync may come later)

## Privacy
- No login, no cloud, no analytics.
- Everything is stored in `localStorage` and can be exported/imported as JSON.
- You’re always in control: delete local data anytime in Settings.

## Tech Stack
- React, TypeScript, Vite
- Tailwind CSS for styling
- Zustand (persisted store)
- date‑fns for dates
- lucide‑react for icons

## Getting Started
```bash
npm install   # or pnpm i / yarn
npm run dev   # start the dev server
```

Build and preview a production bundle:
```bash
npm run build
npm run preview
```

## Project Structure
```text
src/
 ├─ components/
 │   ├─ AddHabit.tsx          # Create new habits (build/break, daily/weekly)
 │   ├─ HabitCard.tsx         # Habit UI: edit, delete, streaks, points
 │   ├─ HeaderStats.tsx       # Total points, longest streak, weekly %
 │   ├─ WeekStrip.tsx         # Mon–Sun toggles
 │   ├─ ProgressBar.tsx       # Lightweight progress UI
 │   ├─ SettingsModal.tsx     # Username, data import/export, privacy
 │   ├─ GuideModal.tsx        # Quick onboarding guide
 │   └─ PrivacyModal.tsx      # Local‑first policy
 ├─ store/store.ts            # Zustand store (persisted)
 ├─ utils/{date,scoring,dataTransfer}.ts
 ├─ App.tsx, main.tsx, styles.css
```

## License

This code is for **personal viewing and inspiration only**.  
All rights reserved © 2025 Kyle Brooks.  
No commercial use or redistribution without permission.

# Ritus — Minimal, Local‑First Habit Tracker

Build better days with a fast, privacy‑first habit tracker. Create daily or weekly habits, track streaks and progress, and see your year at a glance — all stored on your device. No accounts. No analytics. Just momentum.

## Why Ritus
- **Local‑first:** your data lives in the browser (no servers).
- **Frictionless:** one‑tap tracking; quick week strip (Mon–Sun).
- **Keeps you coming back:** streaks, weekly goals, levels, and gentle trophies.
- **Calm design:** clean UI, smooth micro‑animations, dark‑first, mobile‑friendly.

## Features

### Tracking
- Create, edit, archive, and delete habits.
  - **Mode:** `build` a habit or `break` one (e.g., “No sugar”).
  - **Frequency:** `daily` or `weekly` with custom `days/week` targets.
- Mark completions via a **week strip** or a **single button** (“Done today” / “Mark clean”).
- Per‑habit status:
  - **Streaks** (daily clean streak or weekly consecutive wins)
  - **Weekly progress** (bar + counts)
  - **Points** earned

### Insight
- **Year heatmaps** per habit (GitHub‑style MonthGrid).
- Header stats: **total completions**, **longest streak**, **weekly completion %**.
- Lightweight, monochrome visuals that match the rest of Ritus.

### Milestones
- **Levels:** lifetime **essence** (XP) determines level; **points** are spendable.
  - Essence/points are awarded on completions, with small weekly bonuses for consistency.
  - Essence never decreases; points can be spent without affecting level.
- **Trophies:** one‑time badges for key streaks and totals (unlocked badges only; no “locked” placeholders).
- **Collectibles store (cosmetic placeholders):** clock styles, quote packs, accent themes, and symbolic relics. Purchasing marks items as owned; no gameplay effects yet.

### More
- **Inspiration:** short notes on habit‑building + curated example “sets” you can add.
- **Settings:** theme (system/light/dark), username (local), export/import JSON, privacy policy.
- **Design touches:** Telegram‑style surface, analog clock tile, subtle hover & press states.

## Privacy
- **No login, no cloud, no analytics.**
- Everything is stored in `localStorage` and can be exported/imported as JSON.
- You control your data: clear local data anytime in **Settings**.

> Quote packs ship as categories/placeholders. If you add quotes, use your own writing or public‑domain/licensed sources.

## Tech Stack
- React + TypeScript + Vite
- Tailwind CSS for styling
- Zustand (persisted store)
- date‑fns for calendar math
- lucide‑react for icons

## Getting Started
```bash
npm install   # or pnpm i / yarn
npm run dev   # start the dev server
```

Build and preview a production bundle:
```bash
npm run build
npm run preview
```

## Roadmap
- Optional reminders (local notifications)
- PWA polish (offline install)
- Sync (opt‑in) when/if it adds real value
- More collectible visuals (clock styles, accents), gentle confetti for big trophies

## License

This code is for **personal viewing and inspiration only**.  
All rights reserved © 2025 Kyle Brooks.  
No commercial use or redistribution without permission.