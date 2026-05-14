# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-05-14

Second public release. Focused on open-source readiness: a tighter
contributor experience (multi-Node CI matrix, cross-platform pre-commit
hook, deploy workflow), a stricter content security policy, modular file
splits to lower the bar for first-time contributions, and bilingual
documentation polish.

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
- `.github/FUNDING.yml`: GitHub Sponsors entry activated so the "Sponsor"
  button surfaces on the repository page. Other platforms remain
  commented out as templates ready to be uncommented if needed.
- `.github/workflows/deploy-pages.yml`: a dedicated deployment workflow
  uses `actions/configure-pages@v5` and `actions/deploy-pages@v4` to
  publish a curated artifact (development-only paths excluded) on every
  push to `main`, replacing the implicit Pages-from-branch setup.
- `.gitattributes`: pins line endings to LF for every tracked text file
  and marks images and font binaries explicitly, so cross-platform
  contributors get identical working trees regardless of `core.autocrlf`.
- `.githooks/pre-commit` plus `scripts/install-githooks.mjs`: an opt-in
  local pre-commit hook that mirrors the CI gate (lint, format check,
  em-dash check, tests). The install script wires `core.hooksPath` via
  the `npm install` lifecycle and is a no-op outside Git working trees
  or inside CI runners.
- `og-image-en.png`: a dedicated English social-preview card; the
  English README now embeds it via a `<picture>` switch so locale-
  specific previews render on social platforms.
- Inbound-equals-outbound license note in `.github/CONTRIBUTING.md`,
  making the MIT contribution agreement explicit without a separate CLA.
- Roadmap entries in both READMEs now carry quarterly target tags
  (Q3 2026, Q4 2026, 2027 and beyond) so adoption signals are visible
  to contributors and downstream users.

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
- Split `js/03-data.js` (3079 lines, ~855 KB) into 14 per-category
  files (`js/03a-data-01-idea.js` through `js/03n-data-14-cicd.js`).
  Each file appends its category to a `window.DATA` array, lowering
  the merge-conflict surface for content contributors. The resolver,
  ESLint globals, tests, and the em-dash check were updated to match.
- Split `css/05-modals.css` (2132 lines, ~57 KB) into focused files
  by surface (`05a-modals-core.css`, `05b-modals-welcome.css`,
  `05c-modals-projects.css`, `05d-modals-install.css`,
  `05e-hero-pills.css`, `05f-modals-celebration.css`). `index.html`
  now links the parts in the same numeric load order; the visual
  output is identical.
- Replaced the four 26-byte SVG home-screen icons in
  `manifest.webmanifest` with full-resolution PNGs (192×192 and
  512×512, both `any` and `maskable`) generated from the same orange
  check-on-dark visual as `og-image.png`. The `apple-touch-icon` link
  and the SVG `rel="icon"` in `index.html` now use real PNG assets,
  too, so installed-app icons render crisply on iOS, Android, and
  desktop launchers.
- `index.html` Content Security Policy hardened: the
  `script-src 'unsafe-inline'` allowance is removed and the inline
  theme / language bootstrap is moved into `js/00-bootstrap.js`,
  loaded synchronously before any other resource so the dark theme
  applies on the first paint and prevents the light flash.
- `js/07-ui-helpers.js#escapeHtml` now also escapes single quotes
  (`'` → `&#39;`), closing a defensive gap in attributes that may
  be quoted with single quotes in future markup.
- `js/18-app.js` import-failure path no longer uses `alert()`; the
  toast helper carries the same message with a longer linger time
  for consistency with the rest of the UI.
- `tests/_setup.js` now accepts options. The `extraFiles` option loads
  additional source files into the same realm (used by the data tests to
  pull in the per-category data files), and the `localStorageSeed` option
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
- `.github/workflows/ci.yml`: the lint and test jobs now run on a Node
  20 + 22 matrix, the header comment lists every job the workflow runs
  (including `em-dash-check`), and the documentation block reflects the
  multi-version coverage.
- `package.json` bumps the version to `1.1.0`, registers the new
  `prepare` script for the local hook installer, and updates the
  `keywords` list with `open-source` and `pwa-checklist` for better
  discoverability.
- README and CONTRIBUTING file listings now reflect the post-split
  layout (`js/` carries 18 files, the per-category data files are
  documented separately, the modular CSS layout is referenced where
  relevant). Issue and PR templates are cross-linked from both READMEs
  so contributors do not need to discover them by accident.
- README.en.md received a light linguistic pass for native-near
  fluency (lead paragraphs and the screenshots section primarily);
  no factual changes.

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
- README and README.en.md no longer contradict the actual repository
  layout: the screenshot section now matches the committed PNGs (the
  obsolete "placeholders" wording is gone), the issue-template
  references match the real bug / feature templates, the JS file count
  is corrected to 18, and the "no template required" sentence is
  replaced with a pointer to the issue chooser.
- The stale `js/14-app.js` reference inside the prefer-const eslint
  override comment in `js/06-view-state.js` now points at `js/18-app.js`
  (the file the orchestration code was renamed to in this release).
- `scripts/capture-screenshots.mjs` no longer captures full-page rolls
  for the desktop shots; the visible viewport is shot instead, and the
  help-modal capture now waits for the modal to appear before the
  screenshot fires so `04-help.png` actually shows the help modal.

### Security

- Content Security Policy in `index.html` now disallows inline scripts
  (`script-src 'self' blob:` only, `'unsafe-inline'` removed) by moving
  the bootstrap IIFE into `js/00-bootstrap.js`. Defense-in-depth: any
  future innerHTML sink that escapes its data through `escapeHtml`
  (now single-quote-safe) is doubly protected from injected `<script>`
  tags.
- The local pre-commit hook runs the em-dash content check on every
  commit, ensuring that user-facing strings cannot regress to em-dash
  punctuation in the absence of CI.

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

[Unreleased]: https://github.com/OzcanOrhanDemirci/Mobil_App_Check_List/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/OzcanOrhanDemirci/Mobil_App_Check_List/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/OzcanOrhanDemirci/Mobil_App_Check_List/releases/tag/v1.0.0
