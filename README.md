# Catholic Rosary Walks

Catholic Rosary Walks is a website-first Rosary toolkit for personal prayer and outdoor group rosary walks. It helps a leader build a group-specific Rosary flow, pray from a saved local configuration, and print simple guide cards for participants.

The project is intentionally static and local-content-first. It has no backend, database, authentication, CMS, analytics, payment system, or account layer.

## Features

- Build a custom Rosary from a Standard Rosary or Rosary Walk Leader template.
- Save custom Rosary guides in browser localStorage.
- Choose today's mysteries or a manually selected mystery set.
- Select closing prayers, including the Hail Holy Queen, Closing Prayer, Memorare, and St. Michael Prayer.
- Add saint invocations such as `Saint Joseph, pray for us.`
- Insert custom guidance at practical points in the prayer flow.
- Pray a saved Rosary with collapsible prayers and grouped repeated Hail Marys.
- Toggle repeated prayers between grouped and individual display.
- Create guide card sets with a linked master card and optional per-card overrides.
- Print or save front/back guide cards using the browser print dialog.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- ESLint
- React Server Components by default
- Client Components only for browser state, localStorage, print controls, and interactive prayer/card UI

## Requirements

- Node.js 20 or newer is recommended.
- npm is used for package scripts and dependency management.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the local development server and open the site:

```bash
npm start
```

By default this opens `http://localhost:3000` in your default browser. To start without opening a browser:

```bash
NO_OPEN=1 npm start
```

On Windows PowerShell:

```powershell
$env:NO_OPEN="1"; npm start
```

## Scripts

- `npm start` starts the local Next.js dev server and opens the browser.
- `npm run dev` starts the Next.js dev server without the custom browser-opening wrapper.
- `npm run dev:open` is an alias for the browser-opening dev server.
- `npm run build` creates a production build.
- `npm run start:production` runs `next start` after a production build.
- `npm run lint` runs ESLint.
- `npm run typecheck` runs TypeScript without emitting files.
- `npm run check` runs typecheck, lint, and build.

## Important Routes

- `/` - Home and toolkit overview
- `/builder` - Build and save a custom Rosary guide
- `/pray` - Static default Rosary flow
- `/pray/custom` - Pray a saved custom Rosary
- `/cards` - Build printable guide cards
- `/cards/print` - Print or save front/back guide cards
- `/lead` - Practical guide for leading a Rosary walk
- `/prayers` - Core Rosary prayers
- `/mysteries` - Mystery sets
- `/printables` - Placeholder printable metadata
- `/resources` - Beginner-friendly Rosary resources

## Content Model

Long-form prayer and Rosary content should stay in structured files:

- `src/content/prayers.ts`
- `src/content/mysteries.ts`
- `src/content/rosary-sequences.ts`
- `src/content/leader-guides.ts`
- `src/content/printables.ts`

Rosary transformation logic lives under `src/lib/rosary`. Pages should render structured data instead of hardcoding long prayer flows.

## Local Storage

Custom Rosary guides and card sets are saved locally in the user's browser. They are not synced, uploaded, or stored on a server.

Current storage keys are versioned:

- `rosary-walks:rosary-configs:v1`
- `rosary-walks:active-config:v1`
- `rosary-walks:card-sets:v1`
- `rosary-walks:active-card-set:v1`

## Scripture Readings

The app is prepared for RSV-2CE Scripture readings through optional mystery fields such as `readingTranslation` and `readingText`.

Do not add long RSV-2CE passages unless the text is licensed or explicitly provided for this project. Until then, mystery cards show the Scripture reference and a simple `Read: [reference]` prompt.

## Security And Privacy

- No backend services are used.
- No user accounts are used.
- No analytics are used.
- No payments are used.
- No third-party runtime APIs are called by the app.
- Security headers are configured in `next.config.ts`.

## Development Notes

Project conventions for future Codex sessions are documented in `AGENTS.md`.

Before shipping changes, run:

```bash
npm run check
npm audit
```

## Changelog

See `CHANGELOG.md`.
