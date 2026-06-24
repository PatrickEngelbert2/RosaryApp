# Changelog

All notable changes to Catholic Rosary Walks are documented here.

This project is currently pre-1.0. Version dates use the local project timeline.

## 0.3.0 - 2026-06-24

### Added

- Added a full custom Rosary prayer experience at `/pray/custom`.
- Added grouped repeated-prayer rendering so opening Hail Marys and decade Hail Marys can display as `x 3` or `x 10`.
- Added a `Show each repeated prayer` toggle for users who want every repeated prayer rendered individually.
- Added a builder preference for showing repeated prayers individually by default.
- Added compact, purpose-built mystery prayer cards with expandable reading sections.
- Added RSV-2CE-ready Scripture reading fields without bundling copyrighted passage text.
- Added support for local custom Rosary configurations with:
  - selected mystery mode
  - selected manual mystery set
  - selected closing prayers
  - saint invocations
  - custom guidance insertion points
  - leader notes
- Added guide card builder pages at `/cards` and `/cards/print`.
- Added front/back printable guide card rendering with four cards per US Letter sheet.
- Added variable card counts with linked master cards and per-card overrides.
- Added browser-print-first print styles for guide cards.

### Changed

- Reworked `buildRosaryFlow` into the canonical resolver for builder previews and prayer rendering.
- Replaced hardcoded closing-prayer rendering with saved configuration data.
- Cleaned up custom prayer page spacing, controls, focus states, mystery presentation, and section dividers.
- Updated localStorage handling to normalize older saved configuration shapes defensively.
- Updated navigation and homepage copy around the Rosary Walk Toolkit flow.

### Fixed

- Fixed Memorare and St. Michael Prayer not appearing on the custom prayer page when selected.
- Fixed unchecked closing prayers still appearing because template defaults were overriding user choices.
- Fixed custom guidance always appearing at the end of the prayer flow.
- Fixed saint invocations missing from saved custom guides.
- Fixed deleting saved custom guides from the builder and custom prayer page.
- Fixed duplicate mystery numbering such as `37. 3. The Descent of the Holy Spirit`.
- Fixed generic internal labels such as `section heading` leaking into the prayer UI.

### Security

- Added application security headers in `next.config.ts`.
- Disabled the `X-Powered-By` header.
- Kept the app static/local-first with no backend, database, authentication, analytics, payments, or third-party runtime services.

## 0.2.0 - 2026-06-23

### Added

- Added the Rosary Builder route at `/builder`.
- Added structured Rosary templates for a Standard Rosary and Rosary Walk Leader Version.
- Added localStorage persistence for custom Rosary configurations and printable card sets.
- Added editable guide card content, card count controls, and print layout helpers.
- Added reusable card, prayer, mystery, and builder components.

### Changed

- Expanded the data model for prayers, mysteries, Rosary steps, templates, user preferences, and card sets.
- Moved long Rosary content into structured files under `src/content`.

## 0.1.0 - 2026-06-23

### Added

- Created the initial Next.js App Router project with TypeScript, Tailwind CSS, ESLint, and the `src/` directory.
- Added static pages for:
  - Home
  - Pray the Rosary
  - Lead a Rosary Walk
  - Prayers
  - Mysteries
  - Printables
  - Resources
- Added initial structured prayer, mystery, leader guide, printable, and Rosary sequence content.
- Added `AGENTS.md` with durable project guidance for future Codex work.
