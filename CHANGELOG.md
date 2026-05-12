# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-05-12

First public release. The application reached feature completeness as a static,
build-free, installable PWA, with bilingual content, four-axis content resolution,
and per-item how-to guidance.

### Added

- Interactive checklist with 14 categories and 55 items covering planning, design,
  code layout, Git, API, backend, offline, testing, security, accessibility,
  release, monetization, analytics, and CI/CD.
- Two completion tiers per item (MVP and Release) with per-tier filtering.
- Four-axis content resolver (language, explanation style, framework, backend)
  with a priority chain so each item can be authored once and specialized only
  where it differs (`resolveLevel` in `js/05-framework.js`).
- Bilingual interface (Turkish and English) with a live language switcher that
  updates the `lang` attribute, UI strings, and all per-item content.
- Two explanation styles, Simple and Technical: Simple text avoids package names,
  version numbers, and acronyms in favor of everyday metaphors.
- Six framework profiles: Flutter, React Native, Swift (iOS), Kotlin (Android),
  Expo, and PWA, each with its own labels, install snippets, and setup
  assumptions.
- Nine backend profiles: Firebase, Supabase, Appwrite, PocketBase, AWS Amplify,
  Convex, Custom server, Local development, and No backend. When "No backend" is
  chosen, items flagged `backendStep: true` are hidden entirely.
- Per-item How-To guide on the back face of each card, with individually
  checkable steps and an auto-calculated completion percentage.
- Multi-project management: up to 20 projects in a single browser, with per
  project checks, notes, framework, and backend kept isolated. Instant switching
  via the hero pill.
- JSON export and import for projects (backup and move across devices).
- Two usage modes: Development (building my own app) and Review (auditing
  someone else's app).
- Seven-step welcome flow that captures language, usage mode, explanation style,
  project name, framework, and backend before the first render.
- Search across all 55 items with `/` keyboard shortcut to focus the input.
- 3-by-3 view filter (To do / Done / All, crossed with MVP / Release / Both).
- Presentation mode with a `P` keyboard shortcut for full-screen projector view.
- Print / PDF output for both the checklist itself and the How-To guide.
- AI prompt generator that emits the current item plus the user's stack choices
  as Markdown or JSON, ready to paste into Cursor, Claude, or ChatGPT.
- In-app help accordion and a granular reset flow split per scope (checks,
  notes, project, all data).
- PWA support: `manifest.webmanifest` declares standalone mode and inline SVG
  icons (`any` and `maskable`); `sw.js` implements a network-first strategy with
  a cache fallback (cache key `mobil-kontrol-v3`) and cleans up old caches on
  activation.
- Service Worker registration with a blob-URL fallback path for `file://`
  scenarios where `./sw.js` cannot be reached.
- Light and dark theme that follows the system preference.
- Accessibility groundwork: ARIA landmarks, semantic HTML, focus-visible
  outlines, keyboard navigation, and `lang` attribute updates on language
  change.
- Modular file layout: 16 JavaScript files and 6 CSS files, each with a single
  responsibility and a numeric prefix that fixes the load order, with no build
  tool or transpiler.
- MIT license and a bilingual README (`README.md` in Turkish, `README.en.md` in
  English) with a language switcher at the top of each file.
- Open Graph social preview image (`og-image.png`, 1200 by 630) and SEO
  metadata in `index.html`.
- GitHub long-press and LinkedIn easter eggs, plus a version stamp.

### Changed

- Split the original single-file PWA into modular CSS and JS during the
  pre-release refactor so contributors and AI assistants can navigate the
  codebase by responsibility rather than scrolling through one file.
- Mobile layout: compacted the sticky top area, collapsed actions behind a
  hamburger menu, flattened action-group boxes, switched the legend pill to a
  single column on small screens, and made the sticky bar fully opaque.
- Modal stacking context fixed so titles do not bleed into the header when the
  modal is scrolled.
- Welcome and switcher flows reworked to mirror the framework selection pattern
  for backends, then extended again when explanation style was added as a
  fourth axis.
- Softened the Simple-mode wording for six items where the text had stayed
  technical, to match the no-jargon rule for Simple authoring.
- Reworded the "5.1 release" item to be framework-neutral.
- Audit pass on the checklist content: factual fixes, package version updates,
  two new items added, and AI prompt template cleanup.
- README audit pass to align all claims with the code (icons, Service Worker
  behavior, asset sizes, typos).

### Fixed

- Backend-adjacent items no longer show generic instructions when a specific
  backend is selected; they now adapt through `backendVariants`.
- Mobile legend pill and footer title wrapping corrected.
- Modal header no longer overlaps with scrolled content because of an explicit
  stacking context.
- How-To back face audit fixed step ordering, factual claims, and front-to-back
  alignment for each item.

### Security

- All user data (checks, notes, projects) stays in `localStorage` in the
  browser; nothing is sent to a server. No analytics, no cookies, no
  third-party trackers.
- Service Worker scope limited to same-origin GET requests; non-GET and
  cross-origin requests bypass the cache entirely.

[Unreleased]: https://github.com/OzcanOrhanDemirci/Mobil_App_Check_List/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/OzcanOrhanDemirci/Mobil_App_Check_List/releases/tag/v1.0.0
