# Changelog

All notable changes to Walk the Rosary are documented here.

This project is currently pre-1.0. Version dates use the local project timeline.

## Unreleased

### Changed

- Added handle-based drag-and-drop reordering to Custom Builder Preview the flow.
- Wired preview drag/drop into the existing guide-level `guideFlowEdits.itemOrder` model so reordered guides persist into saved guides, Custom Pray, step-by-step prayer mode, Guide Cards, and guide backup import/export.
- Preserved Move up and Move down controls for keyboard access and mobile reliability while keeping guide-level drag/drop separate from Guide Card-only customizations.
- Fixed Custom Builder Leader Notes consistency so notes from Quick Builder, default walk-leader templates, common notes, manual notes, saved guides, and imports share the same builder resolver.
- Updated the Leader Notes section to count, list, edit, and delete active leader notes regardless of their source while staying synchronized with Preview the flow and downstream guide output.
- Improved leader-note save/load behavior so template-created notes can be edited or deleted without being resurrected unexpectedly.
- Added guide-level Custom Builder Preview the flow editing with edit, remove, move up, move down, and prayer full/short controls.
- Added Reset flow edits behavior that restores the generated flow from the current builder settings without erasing guide basics, mystery choices, language choices, saint settings, or other builder options.
- Persisted guide-level flow edits with saved guides so Custom Pray scroll mode, step-by-step prayer mode, Guide Cards generated from an edited guide, and guide backup import/export use the edited flow.
- Kept guide-level flow edits separate from Guide Card-only customizations.
- Added a searchable Saint Invocation picker to the Custom Builder with checkbox selection, selected counts, name/tag search, and a clear search control.
- Added a structured tagged saint directory and saint invocation helpers that preserve manual custom entries, prevent duplicate invocations, and map common invocations to directory entries where possible.
- Preserved selected saint invocations in saved guides, Custom Pray, step-by-step prayer mode, Guide Cards, and guide backup import/export.
- Renamed the user-facing Easy Builder to Quick Builder and Advanced Builder to Custom Builder.
- Reorganized the Custom Builder into a clearer flow for guide basics, repeated-prayer behavior, leader notes, closing prayers, saint invocations, custom guidance, prayer languages, full preview, browser save, and guide backup.
- Moved guide backup controls after browser save and added concise copy explaining that browser-saved guides can be backed up for a more portable copy.
- Moved the repeated-prayer default setting out of the save section and into its own earlier Custom Builder section.
- Made Closing prayers, Add custom guidance, and Prayer languages collapsible with compact status summaries.
- Made all Custom Builder steps except Repeated prayers, Save to browser, and Guide backup use Show/Hide controls that default closed.
- Updated Custom Builder Show/Hide behavior so every step is collapsible, with Guide basics, Repeated prayers, Closing prayers, Save to browser, and Guide backup open by default.
- Moved Prayer languages ahead of Saint invocations and moved Leader notes directly above Add custom guidance.
- Separated Saint invocations into their own Custom Builder section and added an append-only common invocation helper.
- Added explicit Custom Builder leader-note controls, including a common leader-note starter set.
- Expanded Custom Builder Preview the flow to make the full generated flow available instead of truncating at the first 24 items.
- Added practical help popovers for major Custom Builder sections.
- Added Spanish variants for the core Rosary prayers: Sign of the Cross, Apostles' Creed, Our Father, Hail Mary, Glory Be, Fatima Prayer, Hail Holy Queen, Rosary Closing Prayer, Memorare, and St. Michael Prayer.
- Expanded the existing per-prayer language system so saved guides can mix English, Latin, and Spanish prayer variants without adding a global Spanish mode.
- Updated Custom Builder, Quick Builder, and Guide Cards language controls to offer English, Latin, and Spanish prayer choices.
- Updated Custom Pray, step-by-step prayer mode, Guide Cards preview, and print generation to resolve Spanish through the same structured prayer-variant helpers used by English and Latin.
- Added regression coverage for Spanish language resolution, short/full prayer text, mixed-language guide flows, Easy Guide output, card overrides, print parity, storage validation, and guide backup import/export.
- Added step-by-step prayer mode to the Custom Pray page so saved guides can be prayed one focused prayer or action at a time.
- Preserved the existing scroll/read prayer mode and added a clear Read guide / Pray step by step switch.
- Added local repeated-prayer pacing preferences for step-by-step mode, with Count each prayer for app-counted beads and Group repeated prayers for users praying with a physical rosary.
- Built step-by-step prayer data from the existing rosary flow and prayer language resolution so saved guide settings, mysteries, closing prayers, saint invocations, and prayer-language choices remain consistent.
- Added mobile-friendly step navigation with progress, Back, Next, Finish, protected restart, and local per-guide progress restoration.
- Removed unnecessary Exit and Return to guide controls from step-by-step mode so the existing Read guide / Pray step by step switch remains the way back to scroll mode.
- Made Restart safer by moving it out of the main bottom navigation and requiring confirmation before resetting prayer progress.
- Improved step-mode button cursor, hover, focus, and active states with motion-aware lift/press interactions.
- Preserved logical prayer progress when switching between Count each prayer and Group repeated prayers.
- Added regression coverage for step generation, repeated-prayer expansion/grouping, mixed prayer-language settings, saint invocations, closings, and navigation boundaries.
- Added regression coverage for logical step matching between counted and grouped repeated-prayer modes.
- Polished homepage, Builder, Guide Cards, Pray, and Resources copy so first-time users can more quickly understand how to pray, build, print, and lead.
- Added local guide backup UI for backing up the selected guide, backing up all guides, and importing guide backup files without a backend.
- Added a versioned Walk the Rosary guide backup JSON format that includes saved guides and related Guide Cards customizations.
- Added guide backup import handling that validates backup files, remaps duplicate guide IDs, preserves existing guides, and reports friendly success or failure messages.
- Added regression coverage for selected-guide export, all-guide export, single-guide import, multi-guide import with customization remapping, and invalid backup rejection.
- Fixed the Guide Backup panel layout so its explanatory copy no longer gets squeezed beside the backup buttons in narrower page columns.
- Tightened repeated-prayer card incipits for Our Father, Hail Mary, Glory Be, Fatima Prayer, Hail Holy Queen, Memorare, and St. Michael Prayer.
- Fixed mobile Guide Cards preview clipping by preserving print-sized preview faces inside scrollable preview frames.
- Added mobile tap-to-select Guide Card preview items with a bottom action sheet for edit, add above/below, move up/down, full-short toggle, and remove actions.
- Preserved desktop hover/focus preview controls and kept mobile/desktop preview controls out of print output.
- Reworked Guide Cards preview and print layout to use client-side rendered card measurement as the final packing source of truth instead of rough fit estimates.
- Updated Guide Cards packing to fill the front first, then the back, then continuation faces only when measured content no longer fits.
- Preserved shared measured layout decisions between preview and `/cards/print`, including the polished preparing-layout states before cards render or print.
- Made Holy Father's Intentions a compact movable card group with `- ` prayer lines, defaulting just after the Rosary Closing Prayer.
- Removed the wasteful `Final` Guide Cards heading so the closing Sign of the Cross renders as a standalone editable card item.
- Added measured layout regression coverage for compact Holy Father's Intentions structure, Final heading removal, front-first packing, and heading orphan prevention.
- Added Vitest regression coverage for prayer language resolution, guide creation, card content generation, card customization/reordering, card layout packing, preview/print data parity, and storage validation.
- Hardened saved guide, card set, card layout option, and guide-card customization storage parsing with versioned local collection data and safe recovery for invalid or incompatible localStorage values.
- Extracted guide-card customization ordering and override helpers into pure utilities so movement, drag/drop, duplicate ID checks, full-prayer overrides, and edit detection are covered by tests.
- Added a friendly storage recovery notice when older preview data or malformed local app data has to be ignored.
- Updated `npm run check` to include the regression test suite.
- Added Latin variants for the core Rosary prayers while preserving English as the default for existing saved guides.
- Added per-prayer English/Latin selection to saved guide configs, the Custom Builder, and the Quick Builder.
- Added card-specific prayer language controls so Guide Cards can differ from the underlying guide without changing it.
- Updated Custom Pray and Guide Cards rendering so full/short prayer text resolves from the selected language.
- Structured prayer variant data so future language variants can be added without changing canonical prayer IDs.
- Rebranded the project to Walk the Rosary.
- Updated site metadata, browser tab title, README, changelog, AGENTS instructions, and public-facing copy.
- Added a new original SVG favicon/icon concept for the Walk the Rosary brand.
- Updated package metadata and manifest metadata for the new brand.
- Tightened homepage spacing and focused the landing page around praying, building guides, printing guide cards, leading walks, and learning.
- Replaced the generic homepage rhythm card with a Today's Rosary card powered by the existing mystery schedule helper.
- Expanded the footer with useful navigation, contact information, creator attribution, and a permissions reminder.
- Added dependency-free inline SVG icons to the homepage Explore cards.
- Updated README project/contact details to match the polished public site.
- Tightened homepage/header vertical spacing so the hero begins closer to the navigation and the landing page rhythm is less loose.
- Added site-wide motion-aware interaction polish for buttons, navigation links, footer links, clickable cards, builder controls, guide card controls, and prayer page controls.
- Added a subtle header brand hover interaction with lift, icon tilt, and accent underline.
- Added reduced-motion support for the new interaction transitions.
- Revamped the Guide Cards workflow to generate pocket guide cards from saved rosary guides instead of the confusing Master Card editor.
- Added generated front/back card previews that reflect selected mysteries, closing prayers, saint invocations, leader notes, and concise custom guidance.
- Updated the print layout to render generated 4-up front/back cards while preserving variable card count printing and invisible blank slots for alignment.
- Documented the current Vercel deployment and generated guide card workflow in the README.
- Added Guide Card Layout Engine v1 with block-based print layout, short/full prayer controls, adaptive Pocket/Large/Full page card sizes, and estimate-based overflow warnings.
- Removed useless printed card labels so final cards no longer waste space on Card 1/Card 2/Card 3/Card 4.
- Updated guide-card print rendering so cards per page, preview layout, blank slots, and front/back alignment adapt to the selected card size.
- Added Guide Card Layout Engine v2 fixes with compact card-specific prayer text normalization, incipit-based short prayer labels, clearer full-prayer checkbox labels, balanced ordered-block front/back layout, one-sided printing when a back is not needed, and a Tall 3-cards-per-page layout.
- Added guide-card layout orientation options for Pocket 4-up, Tall 3-up, Wide 3-up, Tall 2-up, Wide 2-up, and Full page 1-up printing.
- Centralized guide-card layout definitions so print grid rows, columns, cards per page, labels, descriptions, and fit estimates share one configuration source.
- Clarified that Number of cards needed controls generated card slots while browser print Copies controls duplicate printed sets.
- Added the Quick Builder wizard on the Build a Guide page for low-friction guide creation.
- Added a beginner-friendly one-question-at-a-time flow for purpose, mysteries, help level, closing prayers, saint invocations, print intent, and guide name.
- Added accessible info popovers for mysteries, closing prayers, full-prayer choices, saint invocations, and guide cards.
- Added tasteful modal, progress, step, and option-card interactions with reduced-motion support.
- Saved Quick Builder output as normal rosary guide configs that work with custom prayer, guide cards, print cards, and Custom Builder editing.
- Linked completion actions to Pray this guide, Make guide cards, and Edit in Custom Builder.
- Updated active favicon, manifest icon, and header brand mark to use the new brand SVG assets while preserving the old favicon as a backup.
- Set the active browser-tab favicon and web app manifest icon to `public/favicon.svg`.
- Added tasteful `favicon.svg` and `faviconRiver.svg` usage across the header, homepage Today's Rosary panel, and footer.
- Replaced the homepage Explore card artwork with cohesive handcrafted SVG icons for Pray, Build a Guide, Guide Cards, Lead a Walk, Prayers, and Resources.
- Added card-triggered hover/focus icon animations, including a hammer-and-paper animation for Build a Guide.
- Kept the homepage animation polish dependency-free and reduced-motion aware.
- Refined the homepage Explore icon set with clearer Pray, Build a Guide, and Lead a Walk artwork.
- Redesigned the Pray icon as a clear rosary loop with a hanging cross.
- Redesigned the Build a Guide icon as a clearer hammer-and-document concept with a gentler hammer-tap animation.
- Adjusted the Build a Guide hammer silhouette and tap direction so the hammer head reads clearly and swings into the document.
- Improved the Lead a Walk icon to show footprints following a guided path toward a cross marker while preserving the path animation idea.
- Preserved the Guide Cards and Resources icon concepts.
- Added Guide Card Preview Editing v1 with hover/focus controls for editing, removing, reordering, and toggling card preview items.
- Added cards-only local customizations for guide card item order, removed items, full/short prayer overrides, and text overrides.
- Added Guide Card Preview Editing v2 with preview-only controls for adding new card sections, notes, leader notes, intentions, saint invocations, prayers, and custom text.
- Stored added guide-card preview items as structured cards-only customizations that print with the card preview and are removed by Reset card edits.
- Made guide-card section headings standalone editable, removable, and reorderable items instead of attaching them to the first child line.
- Added direct full/short prayer toggles from the preview while preserving canonical prayer IDs for future multilingual prayer variants.
- Added plain-text preview editing for card titles, subtitles, section headings, prayer lines, mystery lines, instructions, pauses, and saint invocations.
- Added arrow-based and native drag/drop guide card preview reordering with keyboard-accessible arrow controls.
- Added Reset card edits behavior to restore generated defaults without altering the underlying guide.
- Added a second Print / Save as PDF button below the guide card preview.
- Kept preview editing controls out of print output while making the print page consume customized structured card content.

### Fixed

- Removed prototype-like "sample" wording from the default Pray page and clarified the saved-guide prayer flow.
- Fixed Guide Cards prematurely moving content to back or continuation faces by measuring rendered card item heights before packing card faces.
- Fixed continuation warnings so they are shown only when measured continuation faces are actually generated.
- Reduced wasted Guide Cards space around Holy Father's Intentions and the final Sign of the Cross while keeping both as structured editable card content.
- Fixed invalid or malformed saved guide data being able to crash app pages during localStorage normalization.
- Fixed guide-card full-prayer checkbox labels so they reflect the effective card language after guide-level or card-specific language choices.
- Kept each Guide Card mystery and its fruit of the mystery together when card content flows across front/back or continuation sides.
- Fixed guide-card mystery rendering so each mystery sentence and its fruit of the mystery are one card item, preventing a fruit line from splitting onto another side by itself.
- Cleaned guide-card prayer rendering so repeated prayers use `3x -` or `10x -` compact text, full prayers print without title prefixes, Glory Be uses `Glory be to the Father...`, and Sign of the Cross short text is just the prayer title.
- Fixed duplicate React keys when Guide Card preview items are moved across visual sections by separating canonical source item IDs from generated layout instance IDs.
- Improved Guide Card preview drag/drop placement feedback with item target highlighting, before/after insertion lines, and a lifted dragged-item state.
- Clarified cross-section Guide Card preview moves so reordering removes the item from its old visual position and inserts it at the indicated target.
- Preserved clean Guide Card print output by keeping drag/drop indicators and preview controls hidden from print.
- Replaced remaining prototype/default branding where appropriate while keeping localStorage keys stable.
- Removed placeholder printable language from the homepage Explore section.
- Reduced excessive whitespace above the homepage hero and between the hero and next section.
- Improved guide-card overflow behavior by moving whole blocks to later sides where possible and warning when selected content is too dense.
- Removed the hardcoded back-side "Closing prayers and leader reminders" assumption and corrected Large/Full page print behavior so those layouts do not duplicate old 4-up card output by default.
- Preserved custom card counts when switching guide-card layouts, while still auto-adjusting the count when it appears to be the previous layout default.
- Fixed Easy Guide Builder info popovers being clipped by the modal scroll container by rendering them in a body-level portal with viewport-aware fixed positioning.
- Added click-to-pin, close-button, click-away, and Escape-key closing behavior for Easy Guide Builder info popovers while preserving hover, focus, and mobile tap access.

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
- Updated navigation and homepage copy around the prayer, guide, and card flow.

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
- Added structured Rosary templates for a Standard Rosary and walk leader guide.
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
  - Lead a Walk
  - Prayers
  - Mysteries
  - Printables
  - Resources
- Added initial structured prayer, mystery, leader guide, printable, and Rosary sequence content.
- Added `AGENTS.md` with durable project guidance for future Codex work.
