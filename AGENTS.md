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
- Keep card templates, card content, user rosary configuration shapes, and printable metadata structured and easy to transform.
- Do not hardcode long prayer flows directly into page components.
- Prefer small helper functions under `src/lib/rosary` for transforming structured content into display flows.
- Assume printable PDFs will later live under `/public/printables`.
- For print features, prefer browser print behavior and CSS print rules before adding PDF libraries.
- Keep the code easy for future Codex sessions to understand and extend.

## Design Direction

- Use a warm light background, deep blue accents, generous spacing, simple cards and buttons, and high contrast text.
- Avoid flashy animation or visual clutter.
- Prioritize calm navigation and beginner-friendly labels.

## Documentation Requirements

- Update `CHANGELOG.md` for every meaningful feature, fix, polish pass, rebrand, or architecture change.
- Update `README.md` when setup steps, scripts, project purpose, major features, deployment notes, or architecture change.
- Run the relevant Vitest tests when changing prayer language resolution, guide creation, guide card content generation, card layout packing, preview customization, print parity, or storage validation.
- Do not change guide-card layout behavior without running the card layout/content preservation regression tests.
- Mention whether lint, build, and relevant tests were run in the final response.
- Keep documentation professional and accurate.
- Do not claim features are complete unless they were implemented and tested.
