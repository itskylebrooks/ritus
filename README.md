# Ritus — A Minimal, Local-First Habit Tracker

Ritus invites you to build better days with a habit tracker designed for simplicity, privacy, and local-first reliability. It helps you create and maintain habits, track completions and streaks, and reward your progress with tokens you can spend on cosmetic collectibles — all stored securely in your browser.

## Overview

Ritus embraces a local-first approach: your data stays with you, saved directly in your browser’s `localStorage`. There are no accounts, no analytics, and no cloud syncing. It supports daily, weekly, and monthly habits, with flexible modes to either build new habits or break old ones. Progression is meaningful, with progress XP that translates into levels and spendable tokens. You’ll find trophies to celebrate milestones and a small collectibles store for personalization.

Data management is straightforward: export and import your data as JSON, or clear it entirely from the app’s Settings.

## Features at a Glance

Create, edit, archive, and delete habits with ease. Choose frequencies—daily, weekly, or monthly—and modes that help you either build habits or break them. Weekly and monthly habits support numeric targets, such as completing a habit three times per week.

Mark completions quickly through a week strip (Monday through Sunday) or with a single tap. Each habit view offers insights like streaks, progress bars, completion counts, and preview charts.

There is also an "Emoji of the day" feature that comes originally from my side-project Flowday. It surfaces a curated daily emoji and integrates with the emoji picker and history to add personality to your logs.

Progression is rewarding: earn progress XP (lifetime XP) and level up as you progress. Tokens are awarded not only for completions but also for meeting weekly consistency goals, and these tokens can be spent in the collectibles store. Weekly bonuses and one-time trophies recognize your dedication and milestones.

The collectibles store offers cosmetic customizations—clock styles, quote packs, accent themes, and relics—that personalize your experience without affecting gameplay. Purchases deduct tokens and mark items as owned.

Manage your data and preferences easily: export and import JSON with robust deduplication and summaries, clear local data to start fresh, and customize themes (system, light, or dark), date formats (MM/DD or DD/MM), and week start days (Sunday or Monday). While reminders are part of the data model, the on-screen reminder UI is reserved for future updates.

## Privacy and Data Ownership

Your data belongs to you. Ritus requires no login, no cloud sync, and collects no analytics. All information is stored locally in your browser via a persisted Zustand store. You can export your data at any time and re-import it locally. Clearing data removes it completely from your browser.

## Technology Stack

Ritus is built with modern, efficient tools:

- React 18 and TypeScript for a robust UI
- Vite for fast development and production builds
- Tailwind CSS for styling
- Zustand for local persisted state management
- Framer Motion for smooth UI animations
- Date-fns for reliable date utilities
- Lucide-react for crisp icons
- Recharts for compact, informative charts

All dependencies are declared in `package.json`.

## Getting Started

Clone the repository and install dependencies with your preferred package manager:

```bash
pnpm install    # or npm install / yarn
pnpm run dev    # start the development server (Vite)
```

To build and preview the production version:

```bash
pnpm run build
pnpm run preview
```

## Project Structure

Here’s a high-level overview of key files and folders:

- `src/pages/` — main app pages: `Home.tsx`, `Insight.tsx`, `Inspiration.tsx`, `Milestones.tsx`
- `src/components/` — reusable UI elements such as cards, charts, modals, and forms
  - `components/forms/AddHabit.tsx` — form to add or edit habits
  - `components/cards/HabitCard.tsx` — habit display with streaks, editing, and completion toggles
  - `components/cards/CollectiblesStoreCard.tsx` — the in-app collectibles store UI
  - `components/cards/TrophiesBoard.tsx` — display unlocked trophies
  - `components/layout/WeekStrip.tsx` and `MonthGrid.tsx` — calendar and week views
  - `components/modals/SettingsModal.tsx` — export/import, theme settings, and data clearing
- `src/store/store.ts` — main Zustand store managing habits, progression, purchases, and persistence
- `src/utils/` — utilities for date handling, scoring, data transfer, and quotes
- `src/data/` — sample data for collectibles, trophies, progression, and habit suggestions

If you modify persisted state shapes, remember to update the storage partialization in `src/store/store.ts`.

## Implementation Details

The habit model supports daily, weekly, and monthly frequencies, with numeric targets for weekly and monthly habits. Completions are recorded as ISO dates; toggling a completion updates habit tokens, streaks, and global progression. The store manages progress XP and tokens, awarding bonuses for completions and weekly consistency, and calculates trophies idempotently.

The import process merges data safely, adding new habits, skipping duplicates, and providing a summary. The collectibles store remains cosmetic, with placeholder items defined in `src/data/collectibles.ts`.

## Contributing

Contributions are welcome. Please open an issue or submit a pull request with small, focused changes. Follow existing style conventions and aim for concise, reviewable commits. For any added third-party quotes, ensure they are public domain or properly licensed; the app ships with placeholder packs only.

## License and Copyright

This project is original work by Kyle Brooks. See the `LICENSE` and `NOTICE` files in the project root for details.
