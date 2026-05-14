# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Split `js/14-app.js` (2392 lines, the post-1.0 orchestration / glue
  layer) into five files so each concern is browsable on its own and a
  newcomer is not asked to scroll through one mixed-purpose module:
  - `js/14-welcome.js` (368 lines): 7-step welcome flow + the welcome
    modal's inline help switcher.
  - `js/15-projects.js` (888 lines): hero project pill,
    `applyFrameworkUI` / `applyBackendUI`, the project / framework /
    backend modal with its CRUD list, add / rename / delete flows,
    the "pick which project to continue with" modal, and backend
    switch confirmation.
  - `js/16-presentation.js` (90 lines): presentation mode and its
    toolbar buttons. The P / arrow / Esc keyboard handling stays
    inside the global shortcut listener in `js/18-app.js`.
  - `js/17-install.js` (389 lines): PWA install banner, platform-
    specific manual instructions, and the deferredInstallPrompt
    plumbing.
  - `js/18-app.js` (839 lines, renamed from `js/14-app.js` via
    `git mv` so history is preserved): the remaining orchestration
    (toolbar wiring, reset UI, lock, mobile actions toggle, easter
    eggs, help accordion, print, export / import, keyboard shortcuts,
    PWA manifest + service worker setup IIFEs, hero level filter,
    hero style toggle, init sequence).
- `index.html` script tag order updated so the 14..18 scripts load
  before any user interaction can fire (still `defer`, still in
  document order).
- `eslint.config.js` globals section regrouped to match the new five
  files. One new global, `projfwResetUi`, is declared writable: it
  is created in `js/18-app.js` (which loads after `js/15-projects.js`)
  and read inside `setProjFwTab` only at user-click time, so the
  cross-file lookup resolves correctly even though ESLint cannot
  prove it lexically.
- `README.md`, `README.en.md`, and `.github/CONTRIBUTING.md` file
  listings now show the new layout. The performance note that
  referenced `14-app.js` now lists the five files together.

This change is behaviour-preserving: every function moved verbatim,
no signatures changed, no side effects reordered. The split was
performed via a one-shot helper script (`scripts/_split-app.mjs`,
deleted after use) that extracted bottom-up by line range to keep
earlier line numbers stable, then Prettier was applied to the new
files. Verification: ESLint clean, Prettier clean, all 103 tests
pass, em-dash check clean, html-validate clean.

### Added

- `tests/data.test.js`: schema integrity tests for `js/03-data.js`. Locks
  category and feature counts to the figures in the README and this
  CHANGELOG, validates feature id uniqueness and category-prefix matching,
  rejects unknown framework or backend keys inside `variants` /
  `backendVariants` / `simpleBackend`, and asserts every required TR / EN
  translation is non-empty.
- `tests/projects.test.js`: coverage for the multi-project store
  (`js/04-projects.js`). Exercises `createProject`, `renameProject`,
  `deleteProject`, `setActiveProjectId`, and `setProjectField`, the
  20-project cap and 60-character name cap, case- and trim-insensitive
  duplicate detection, the legacy v1 to v2 migration that runs at module
  load (including backend backfill and stale `activeId` repair), and the
  `localStorage` round-trip.
- `scripts/check-em-dash.mjs`: a Node script that scans
  `js/01-i18n-strings.js`, `js/02-help-content.js`, `js/03-data.js`, and
  `index.html` for em-dash characters in user-facing strings. The
  standalone placeholder string `"—"` used in the data file for empty
  cells is explicitly allowed; anything else fails the check.
- New CI job `em-dash-check` runs `scripts/check-em-dash.mjs` on every
  push and pull request, so the project's em-dash content rule documented
  in `.github/CONTRIBUTING.md` is now enforced automatically.
- `.github/CODEOWNERS`: every path is owned by the maintainer; sensitive
  metadata (license, security policy, CI definitions, dependabot config,
  core content surfaces, resolver and axis modules) is called out
  explicitly so reviews are routed correctly.
- `.github/FUNDING.yml`: a template with every supported platform listed
  as a commented-out line. The file is intentionally inert until a
  platform is uncommented; no "Sponsor" button appears in its default
  state.

### Changed

- `tests/_setup.js` now accepts options. The `extraFiles` option loads
  additional source files into the same realm (used by the data tests to
  pull in `js/03-data.js`), and the `localStorageSeed` option
  pre-populates the in-memory localStorage stub before the scripts run
  (used by the migration tests to simulate a returning v1 or
  pre-backend user). The adapter mirrors the project store's public API
  onto the sandbox so tests can drive `createProject`,
  `setActiveProjectId`, and the rest directly. Existing callers using
  `loadAppContext()` with no arguments are unaffected.
- `.github/CONTRIBUTING.md` now documents the em-dash CI check and its
  placeholder exemption, the requirement to declare every new top-level
  global in `eslint.config.js`, the three test suites that live under
  `tests/`, the loader options on `tests/_setup.js`, and the cross-realm
  caveat for `assert.deepStrictEqual` against sandbox-realm values.
- `.github/workflows/ci.yml`: the header comment lists every job the
  workflow runs, now including `em-dash-check`.

### Fixed

- Replaced 104 prose em-dash characters across 65 lines with
  context-appropriate punctuation (comma, colon, semicolon, or
  parentheses) in `js/01-i18n-strings.js` (7 lines: 2 UI strings and 5
  internal comments), `js/03-data.js` (55 lines, holding 93 em-dashes
  spread across feature content and How-To steps in both TR and EN), and
  `index.html` (3 lines, all HTML comments). The placeholder `"—"`
  strings inside `js/03-data.js`, which represent intentionally-empty
  cells in the resolver, were left in place; the new CI check explicitly
  allows them.

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
