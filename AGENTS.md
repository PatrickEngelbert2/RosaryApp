# AGENTS.md

## Project Purpose

This is Walk the Rosary, a Catholic Rosary website for helping people pray the Rosary individually and lead group rosary walks. Keep the experience reverent, calm, fast, readable, mobile-first, and beginner-friendly.

`RosaryApp` may remain an internal local folder name. Public-facing UI, metadata, README, changelog, and browser surfaces should use the official brand name: Walk the Rosary.

## Technical Direction

- Use Next.js App Router, TypeScript, Tailwind CSS, and the `src/` directory.
- Use the `@/*` import alias.
- Treat this as a website-first project that can later become a PWA or be wrapped for Android/iOS.
- Keep the site static/local-content first.
- Do not add a backend, database, CMS, authentication, analytics, payment system, or server-only service unless explicitly requested.
- Avoid unnecessary dependencies.

## React And Component Guidance

- Use React Server Components by default.
- Use Client Components only when interactivity is needed.
- Prefer semantic HTML, accessible landmarks, responsive design, and readable source order.
- Build clean reusable components for shared UI and Rosary-specific presentation.
- Keep mobile readability high, especially for prayer text and step-by-step flows.

## Content Guidance

- Keep prayer text, mysteries, rosary sequences, leader guides, and printable resource metadata in structured content files under `src/content`.
- Preserve prayer language support as a per-prayer variant system. Do not replace it with a global all-or-nothing language mode.
- Keep card templates, card content, user rosary configuration shapes, and printable metadata structured and easy to transform.
- Do not hardcode long prayer flows directly into page components.
- Prefer small helper functions under `src/lib/rosary` for transforming structured content into display flows.
- Keep Custom Pray scroll/read mode and step-by-step prayer mode built from the same structured rosary flow; do not duplicate long prayer sequencing logic by hand.
- Preserve logical step identity for step-by-step prayer progress, especially when switching between counted and grouped repeated-prayer pacing.
- Assume printable PDFs will later live under `/public/printables`.
- For print features, prefer browser print behavior and CSS print rules before adding PDF libraries.
- Guide Cards layout should use rendered measurement as the final source of truth for face packing. Do not reintroduce rough character or line estimates as the final preview/print packing decision.
- Keep Guide Cards preview and `/cards/print` on the same layout model. Measurement hosts, loading states, and print CSS should stay hidden from printed output.
- Guide backup import/export must stay local-only, validate files before saving, preserve existing guides, and include tests for duplicate IDs and invalid backup files.
- Keep the code easy for future Codex sessions to understand and extend.

## Design Direction

- Use a warm light background, deep blue accents, generous spacing, simple cards and buttons, and high contrast text.
- Avoid flashy animation or visual clutter.
- Prioritize calm navigation and beginner-friendly labels.

## Documentation Requirements

- Update `CHANGELOG.md` for every meaningful feature, fix, polish pass, rebrand, or architecture change.
- Update `README.md` when setup steps, scripts, project purpose, major features, deployment notes, or architecture change.
- Run the relevant Vitest tests when changing prayer language resolution, guide creation, guide card content generation, card layout packing, preview customization, print parity, or storage validation.
- Run the step-by-step prayer mode regression tests when changing rosary flow generation, repeated-prayer behavior, prayer language resolution, saved guide prayer rendering, or Custom Pray navigation.
- Run guide backup import/export tests when changing saved guide storage, card customization storage, or backup UI.
- Do not change guide-card layout behavior without running the measured layout, card layout, content preservation, and print parity regression tests.
- Mention whether lint, build, and relevant tests were run in the final response.
- Keep documentation professional and accurate.
- Do not claim features are complete unless they were implemented and tested.
