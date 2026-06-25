# Walk the Rosary

Walk the Rosary is a Catholic website for praying the Rosary, leading rosary walks, building custom rosary guides, and printing simple guide cards.

The app is static and local-first. It has no backend, database, authentication, CMS, analytics, payments, or account layer.

Current Vercel deployment: [walktherosary.vercel.app](https://walktherosary.vercel.app/)

## Core Features

- Pray the Rosary from the website.
- Create a saved guide quickly with the Easy Guide Builder wizard.
- Build custom rosary guides.
- Choose today's mysteries or manually select a mystery set.
- Customize closing prayers.
- Add saint invocations.
- Follow prayers with collapsible text.
- Group repeated Hail Marys or show them individually.
- Generate printable front/back guide cards.
- Choose Pocket, Tall, Wide, or Full page guide-card layouts.
- Choose which prayers print in full on guide cards.
- Save current guides locally in the browser.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- localStorage for current saved guide persistence
- Browser print for card/PDF output

## Local Development

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
- `npm run dev` starts the Next.js dev server without the browser-opening wrapper.
- `npm run dev:open` is an alias for the browser-opening dev server.
- `npm run build` creates a production build.
- `npm run start:production` runs `next start` after a production build.
- `npm run lint` runs ESLint.
- `npm run typecheck` runs TypeScript without emitting files.
- `npm run check` runs typecheck, lint, and build.

## Important Routes

- `/` - Home
- `/builder` - Build and save a custom Rosary guide with the easy wizard or advanced builder
- `/pray` - Static default Rosary flow
- `/pray/custom` - Pray a saved custom Rosary
- `/cards` - Build printable guide cards
- `/cards/print` - Print or save front/back guide cards
- `/lead` - Practical guidance for leading a walk
- `/prayers` - Core Rosary prayers
- `/mysteries` - Mystery sets
- `/printables` - Placeholder printable metadata
- `/resources` - Beginner-friendly Rosary resources

## Project And Contact

Walk the Rosary is designed for individual prayer, parish groups, and outdoor rosary walks. The homepage focuses on the current core actions: praying a saved guide, building a guide, printing guide cards, leading a walk, and learning the prayers.

For questions, corrections, or parish use, contact `patrickengelbert2@gmail.com`.

Creator site: [patrickengelbert.com](https://patrickengelbert.com)

## Content And Architecture

Long-form prayer and Rosary content should stay in structured files:

- `src/content/prayers.ts`
- `src/content/mysteries.ts`
- `src/content/rosary-sequences.ts`
- `src/content/leader-guides.ts`
- `src/content/printables.ts`

Rosary transformation logic lives under `src/lib/rosary`. Pages should render structured data instead of hardcoding long prayer flows.

Custom Rosary guides and card sets are saved in browser localStorage. They are not synced or uploaded. Existing localStorage keys intentionally remain stable to avoid breaking saved guides.

## Guide Building Workflow

The Build a Guide page supports two paths:

- Easy Guide Builder: a low-friction wizard for beginners who want to answer a few simple questions and get a usable saved guide.
- Advanced Builder: the detailed editor for changing mysteries, closing prayers, saint invocations, custom guidance, leader notes, and preferences directly.

Easy Guide Builder output is saved as the same `UserRosaryConfig` shape used by the advanced builder. Guides created in the wizard immediately work with `/pray/custom`, `/cards`, and `/cards/print`; no separate easy-guide format or backend is used.

## Guide Card Workflow

Guide cards are generated from saved Rosary guides. Build or edit a guide on `/builder`, save it locally in the browser, then choose that guide on `/cards`. The card generator creates front/back guide cards from the guide's selected mysteries, closing prayers, saint invocations, leader notes, and concise custom guidance.

Users can choose the card count, card size, and which prayers print in full. Supported layouts are:

- Pocket - 4 per page: 2 columns by 2 rows.
- Tall - 3 per page: 3 columns by 1 row.
- Wide - 3 per page: 1 column by 3 rows.
- Tall - 2 per page: 2 columns by 1 row.
- Wide - 2 per page: 1 column by 2 rows.
- Full page - 1 per page: 1 column by 1 row.

The Number of cards needed field controls how many card slots the site generates. It does not control duplicate print copies; use the browser print dialog's Copies setting to print more sets. When a layout changes, the card count auto-adjusts to that layout's cards-per-page default only if the current count still appears to be the previous layout default. If the user has typed a custom count, the app preserves that count. Blank print slots remain invisible so front/back alignment is preserved.

Full-prayer controls show both the prayer title and recognizable first words, such as `Apostles' Creed - I believe in God...`. Short card references use those first words instead of generic labels like `Closing Prayer...`.

Overflow handling is block-based and estimate-driven. The app keeps prayer and guide sections together where possible, balances ordered guide blocks across card faces when a second side is needed, and warns when a selected card size or full-prayer combination may be too dense. If the guide fits on one side, the print page renders front pages only. Browser print is still the output path; this is not yet a dedicated PDF layout engine.

The print view at `/cards/print` uses browser print / Save as PDF. The browser print dialog handles copy count; the site only renders the selected number of card slots. Persistence is still browser-local; no guide or card data is uploaded.

Custom user-defined card dimensions are not implemented yet. The current system intentionally uses a small set of tested US Letter layouts.

## Scripture Readings

The app is prepared for RSV-2CE Scripture readings through optional mystery fields such as `readingTranslation` and `readingText`.

Do not add long RSV-2CE passages unless the text is licensed or explicitly provided with permission. Until then, mystery cards show the Scripture reference and a simple `Read: [reference]` prompt.

## Interaction And Accessibility

Walk the Rosary uses subtle CSS-based hover, focus, and active states for buttons, navigation, links, and action cards. These interactions are intentionally restrained for a prayer-focused site and include reduced-motion support through `prefers-reduced-motion`.

## Documentation Discipline

- Update `README.md` when setup steps, scripts, project purpose, major features, deployment notes, or architecture change.
- Update `CHANGELOG.md` for meaningful features, fixes, polish passes, rebrands, or architecture changes.
- Keep documentation professional, accurate, and current.

## Security And Privacy

- No backend services are used.
- No user accounts are used.
- No analytics are used.
- No payments are used.
- No third-party runtime APIs are called by the app.
- Security headers are configured in `next.config.ts`.

Before shipping changes, run:

```bash
npm run check
npm audit
```

## Changelog

See `CHANGELOG.md`.
