# Walk the Rosary

Walk the Rosary is a Catholic website for praying the Rosary, leading rosary walks, building custom rosary guides, and printing simple guide cards.

The app is static and local-first. It has no backend, database, authentication, CMS, analytics, payments, or account layer.

Current Vercel deployment: [walktherosary.vercel.app](https://walktherosary.vercel.app/)

## Core Features

- Pray the Rosary from the website.
- Create a saved guide quickly with the Quick Builder wizard.
- Build custom rosary guides.
- Choose today's mysteries or manually select a mystery set.
- Customize closing prayers.
- Mix English, Latin, and Spanish prayer texts per prayer in saved guides.
- Add saint invocations.
- Follow prayers with collapsible text.
- Pray saved guides one step at a time with mobile-friendly Back, Next, Finish, and protected restart controls.
- Group repeated Hail Marys or show them individually.
- Choose whether step-by-step mode counts each repeated prayer or groups repeated prayers for use with a physical rosary.
- Generate printable front/back guide cards.
- Customize guide card previews before printing.
- Add card-only sections, notes, leader notes, intentions, saint invocations, prayers, and custom text from the guide card preview.
- Adjust guide card prayer language per prayer without changing the saved guide.
- Choose Pocket, Tall, Wide, or Full page guide-card layouts.
- Choose which prayers print in full on guide cards.
- Save current guides locally in the browser.
- Back up a selected guide, back up all guides, and import guide backup files.

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
- `npm test` runs the Vitest regression suite once.
- `npm run test:watch` runs Vitest in watch mode.
- `npm run typecheck` runs TypeScript without emitting files.
- `npm run check` runs typecheck, lint, tests, and build.

## Important Routes

- `/` - Home
- `/builder` - Build and save a Rosary guide with the Quick Builder or Custom Builder
- `/pray` - Static default Rosary flow
- `/pray/custom` - Pray a saved custom Rosary
- `/cards` - Build printable guide cards
- `/cards/print` - Print or save front/back guide cards
- `/lead` - Practical guidance for leading a walk
- `/prayers` - Core Rosary prayers
- `/mysteries` - Mystery sets
- `/printables` - Printable resource metadata
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

Custom Rosary guides and card sets are saved in browser localStorage. They are not synced or uploaded. The app is still in preview, so saved-guide and card-customization storage may change. Storage loading is versioned and validated; incompatible or malformed local app data is ignored and rewritten to safe defaults with an in-app recovery notice instead of crashing the page.

Guide backups are local JSON downloads. The backup format includes an app identifier, version, export timestamp, guides, and related Guide Cards customizations. Import validates the file before saving, creates a new guide ID when an imported guide conflicts with an existing guide, and remaps related card customizations to the imported copy. Invalid or incompatible backup files are rejected with a friendly message instead of changing existing saved guides.

## Guide Building Workflow

The Build a Guide page supports two paths:

- Quick Builder: a low-friction wizard for beginners who want to answer a few simple questions and get a usable saved guide.
- Custom Builder: the detailed editor for changing mysteries, repeated-prayer behavior, leader notes, closing prayers, saint invocations, custom guidance, prayer languages, preview, save, and backup options directly.

Quick Builder output is saved as the same `UserRosaryConfig` shape used by the Custom Builder. Guides created in the wizard immediately work with `/pray/custom`, `/cards`, and `/cards/print`; no separate quick-guide format or backend is used.

Saved guides can choose English, Latin, or Spanish per prayer. The Quick Builder keeps this beginner-friendly with an optional language-selection step, while the Custom Builder exposes per-prayer language controls directly. Missing language settings default to English so older saved guides continue to load normally. The interface, mysteries, fruits, labels, and page copy remain English in this pass; Spanish support is for prayer variants only.

The Custom Builder is organized as a guided flow: guide basics, repeated-prayer behavior, leader notes, closing prayers, saint invocations, custom guidance, prayer languages, full flow preview, browser save, and guide backup. Larger optional sections collapse so the page stays approachable while preserving all form state.

The Build a Guide page also includes a Guide Backup section. Use it to download a backup of the selected saved guide, download all saved guides, or import a backup from this version of Walk the Rosary.

## Prayer Workflow

The Custom Pray page at `/pray/custom` has two prayer views for saved guides:

- Read guide: the original scroll-based prayer view with collapsible prayer text, large-text controls, repeated-prayer display controls, and optional leader notes.
- Pray step by step: a focused prayer mode that shows one prayer, mystery announcement, instruction, leader note, pause, saint invocation, or closing action at a time.

Step-by-step mode is generated from the same structured rosary flow as the scroll view, so selected mysteries, closing prayers, saint invocations, leader notes, custom guidance, and English/Latin/Spanish prayer choices stay consistent with the saved guide. The mode stores progress locally per guide in the browser and keeps the repeated-prayer pacing preference locally. Restart is a secondary action that asks for confirmation before resetting progress.

Repeated prayers can be handled two ways:

- Count each prayer expands repeated prayers into individual steps, such as `Hail Mary 4 of 10`. This is useful when someone does not have a physical rosary and wants the site to count each bead.
- Group repeated prayers shows one step, such as `Hail Mary x 10`, and advances after the group. This is useful when someone has a rosary and only wants the site to keep them on track.

Switching between these two pacing modes preserves the current logical prayer position where possible. For example, `Hail Mary 4 of 10` maps back to the grouped `Hail Mary x 10` step for that same decade instead of restarting the guide.

## Guide Card Workflow

Guide cards are generated from saved Rosary guides. Build or edit a guide on `/builder`, save it locally in the browser, then choose that guide on `/cards`. The card generator creates front/back guide cards from the guide's selected mysteries, closing prayers, saint invocations, leader notes, and concise custom guidance.

Users can choose the card count, card size, which prayers print in full, and the prayer language used on the cards. Card language choices can use the saved guide setting or override individual prayers to English, Latin, or Spanish. The preview can also be customized before printing: card items can be added, edited, removed, reordered with arrow controls or drag/drop, and switched between short and full prayer text where a generated canonical prayer ID is available. Added preview items can be sections, notes, leader notes, intentions, saint invocations, prayers, or custom text. Desktop users can use hover/focus controls; touch users can tap an item and use the mobile action sheet. Drag/drop shows a before/after insertion indicator so cross-section moves are clear. These card edits are saved locally as cards-only customizations and do not alter the underlying prayer guide or `/pray/custom` flow.

Supported layouts are:

- Pocket - 4 per page: 2 columns by 2 rows.
- Tall - 3 per page: 3 columns by 1 row.
- Wide - 3 per page: 1 column by 3 rows.
- Tall - 2 per page: 2 columns by 1 row.
- Wide - 2 per page: 1 column by 2 rows.
- Full page - 1 per page: 1 column by 1 row.

The Number of cards needed field controls how many card slots the site generates. It does not control duplicate print copies; use the browser print dialog's Copies setting to print more sets. When a layout changes, the card count auto-adjusts to that layout's cards-per-page default only if the current count still appears to be the previous layout default. If the user has typed a custom count, the app preserves that count. Blank print slots remain invisible so front/back alignment is preserved.

Full-prayer controls show both the prayer title and recognizable first words, such as `Apostles' Creed - I believe in God...`. Short card references use those first words instead of generic labels like `Closing Prayer...`. Repeated prayers print in compact form such as `10x - Hail Mary...`, `10x - Ave Maria, gratia plena...`, or `10x - Dios te salve, María...`. Full prayer lines print as the prayer text without a title prefix. Preview full/short toggles use canonical prayer IDs, so card edits and reset behavior resolve against the selected English, Latin, or Spanish prayer variant.

Guide Card layout uses rendered measurement in the browser. The app renders the same card face typography and spacing offscreen, measures each structured card item, then packs items front-first with the fewest measured faces possible. The front is filled before the back, and continuation faces are created only when measured content no longer fits. If the guide fits on one side, the print page renders front pages only. Browser print is still the output path; this is not a dedicated PDF layout engine.

Holy Father's Intentions renders as a compact movable group after the Rosary Closing Prayer by default, with each child prayer prefixed by `- `. The final Sign of the Cross renders as a standalone item instead of under a separate `Final` heading. Both remain part of the structured card content so card-only editing, reordering, deletion, preview customization, and print output continue to use the same model.

The print view at `/cards/print` uses the same measured layout pipeline before rendering printable sheets. The browser print dialog handles copy count; the site only renders the selected number of card slots. Customized preview content is applied to the print view, but preview controls and measurement elements never print. Persistence is still browser-local; no guide or card data is uploaded.

The Guide Cards page also exposes the same local backup controls so a user can back up the selected guide before printing or import a guide backup and immediately make cards from it.

Custom user-defined card dimensions, card text-size controls, and font controls are not implemented yet. The measured layout architecture is designed for those later settings because it measures the active rendered styles instead of relying on hardcoded line counts as the final source of truth. Saving card preview edits back into the underlying guide is also deferred; current preview edits are intentionally cards-only. The current system intentionally uses a small set of tested US Letter layouts.

## Scripture Readings

The app is prepared for RSV-2CE Scripture readings through optional mystery fields such as `readingTranslation` and `readingText`.

Do not add long RSV-2CE passages unless the text is licensed or explicitly provided with permission. Until then, mystery cards show the Scripture reference and a simple `Read: [reference]` prompt.

## Interaction And Accessibility

Walk the Rosary uses subtle CSS-based hover, focus, and active states for buttons, navigation, links, and action cards. These interactions are intentionally restrained for a prayer-focused site and include reduced-motion support through `prefers-reduced-motion`.

## Documentation Discipline

- Update `README.md` when setup steps, scripts, project purpose, major features, deployment notes, or architecture change.
- Update `CHANGELOG.md` for meaningful features, fixes, polish passes, rebrands, or architecture changes.
- Run the Vitest regression suite when changing prayer language resolution, guide creation, guide cards, card layout, preview customization, print content, or storage validation.
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
npm test
npm audit
```

## Changelog

See `CHANGELOG.md`.
