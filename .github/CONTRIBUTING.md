# Contributing to Mobile App Quality Checklist

Thanks for your interest in improving the **Mobile App Quality Checklist** (Mobil Uygulama Kalite Kontrol Listesi), an installable PWA with 14 categories and 55 items written to help indie developers ship their mobile apps with confidence.

This document walks a first-time contributor from `git clone` to merged PR.

## Local setup

The app is a static PWA with **zero runtime dependencies**. There is no build step. Service Workers and PWA features require an HTTP origin, however; opening `index.html` directly via `file://` will not register the Service Worker and several features will silently degrade.

1. Clone the repo:

   ```bash
   git clone https://github.com/OzcanOrhanDemirci/Mobil_App_Check_List.git
   cd Mobil_App_Check_List
   ```

2. Start a local web server. Pick one:

   ```bash
   # Option A: Python (preinstalled on most systems)
   python -m http.server 8000

   # Option B: Node (requires Node 20+)
   npx serve .
   ```

3. Open `http://localhost:8000` in a modern browser (Chrome, Edge, Safari, Firefox).

That's it. Edit any file, refresh the page, see the result.

## Project layout

Files are organized to be browsable in load order. Numbered prefixes drive the `<script>` and `<link>` sequence in `index.html`.

```text
index.html                 Single page, all modals inline
manifest.webmanifest       PWA manifest
sw.js                      Service Worker (network-first + cache fallback)
css/
  01-base.css              Reset, CSS custom properties, typography
  02-layout.css            Hero, page layout, project pill
  03-categories.css        Category cards, item cards, flip
  04-presentation.css      Presentation mode
  05-modals.css            Modals, welcome flow
  06-responsive-print.css  Mobile, tablet, desktop, print
js/
  01-i18n-strings.js       UI strings dictionary (TR/EN) + t() / tx()
  02-help-content.js       Help modal content
  03-data.js               55 items, all variants (~3000 lines)
  04-projects.js           Multi-project storage
  04-storage.js            Mark / note state wrapper
  05-framework.js          Framework definitions + resolveLevel
  05-backend.js            Backend definitions + hiding logic
  06-view-state.js         Current framework / backend / view mode
  07-ui-helpers.js         Theme, modal helpers, toast
  08-i18n-dom.js           Apply i18n to DOM, switch language
  09-ai-prompt.js          AI prompt generator (markdown + JSON)
  10-clipboard.js          Clipboard helper
  11-render.js             Main render loop, card template
  12-progress.js           Percentage, celebrations
  13-filters.js            Search + 3x3 view filter
  14-app.js                Orchestration, welcome flow, init
tests/                     Unit tests for the resolver and i18n
```

The data model lives in `js/03-data.js`. UI strings live in `js/01-i18n-strings.js`. Everything else is logic and presentation.

## How to add a checklist item

1. Open `js/03-data.js`.
2. Find the right category (planning, design, code, git, api, backend, offline, testing, security, a11y, release, monetization, analytics, ci-cd).
3. Append a new object to that category's `features` array, mirroring the shape of existing items:

   ```js
   {
     id: "6.7",
     title: { tr: "Webhook entegrasyonu", en: "Webhook integration" },
     desc:  { tr: "...", en: "..." },
     mvp:     { tr: "...", en: "..." },
     release: { tr: "...", en: "..." },
     howto: {
       mvp:     { tr: "1) ...", en: "1) ..." },
       release: { tr: "1) ...", en: "1) ..." }
     }
   }
   ```

4. If the item only makes sense when a backend is configured, add `backendStep: true`. It will hide automatically when the user selects "No backend".

## How to add a language

The codebase is structured so adding a third language touches a known list of files:

1. `js/01-i18n-strings.js`: for every key in `UI_STRINGS`, add the new-language counterpart (for example `de` for German).
2. `js/03-data.js`: every `{tr, en}` pair throughout the file needs a new locale key (for example `de`). This includes titles, descriptions, MVP / Release texts, and How-To steps inside the `simple`, `simpleBackend`, `variants`, and `backendVariants` blocks.
3. `index.html`: extend the language pill / toggle so users can pick the new locale; wire any new `data-i18n` keys you introduced.

The resolver reads `obj[currentLang]`, so the addition is structurally risk-free.

## How to add a framework

1. `js/05-framework.js`:
   - Add the key to `VALID_FRAMEWORKS`.
   - Add a record to `FRAMEWORK_META` (label, short name, icon, AI prompt label).
   - Add an entry to `INSTALL_EXAMPLES` (CLI install snippet shown in the welcome flow).
   - Add an entry to `SETUP_ASSUMPTIONS` (a short text describing the assumed baseline setup).
2. `js/05-backend.js`: for every existing backend, add a `BACKEND_INSTALL_EXAMPLES.{backend}.{new-framework}` snippet so the AI prompt can render correctly.
3. `index.html`: add a card to:
   - the welcome step grid (`data-welcome-fw="..."`),
   - the framework switcher grid (`data-switch-fw="..."`),
   - the add-new-project grid (`data-add-fw="..."`).
4. `js/03-data.js`: optionally add `variants.{new-framework}` or `backendVariants.{*}.{new-framework}` entries on items that need framework-specific code samples. The resolver falls back to the universal value if you don't.

## How to add a backend

Mirror the framework process:

1. `js/05-backend.js`:
   - Add the key to `VALID_BACKENDS`.
   - Add a record to `BACKEND_META` (label, short name, icon, AI name).
   - Add entries to `BACKEND_INSTALL_EXAMPLES` (one per framework).
   - Add an entry to `BACKEND_SETUP_ASSUMPTIONS`.
2. `index.html`: add a card to:
   - the welcome step grid (`data-welcome-be="..."`),
   - the backend switcher grid (`data-switch-be="..."`).
3. `js/03-data.js`: for backend-dependent items, add `backendVariants.{new-backend}._default` blocks (and optional per-framework overrides).

## Coding standards

- **Never use the em dash character (`—`) in any user-facing text or data.** Use commas, colons, semicolons, parentheses, or hyphens (`-`) instead. This rule applies to translation strings, item content, How-To steps, and anything a user might read. CI runs `node scripts/check-em-dash.mjs` against `js/01-i18n-strings.js`, `js/02-help-content.js`, `js/03-data.js`, and `index.html` to enforce it. The standalone placeholder string `"—"` used inside `js/03-data.js` for empty cells is explicitly allowed; anything else that contains an em-dash is rejected.
- 2-space indentation, semicolons at end of statements, double quotes (`"..."`) in all `js/` files. The sole exception is `sw.js`, which uses single quotes by historical convention.
- Plain `<script>`-loaded JavaScript, not ES modules. Functions and constants are intentionally global so files can share state without an import graph. Preserve this pattern. **When you add a new top-level function or constant in any `js/*.js` file, also add its name to the matching `projectGlobals` block in `eslint.config.js`.** ESLint's flat config tracks the project's globals explicitly because there is no module system; a missing entry shows up as a `no-undef` error in the file that consumes it.
- ES2020+ syntax is fine. No transpilation runs, so avoid features that are not supported by the [browsers we target](../README.en.md#browser-support).
- CSS: edit the category file that owns the affected area. Use existing custom properties (`var(--...)`) for colors, radii, spacing.

## Tests and linting

The project uses ESLint (flat config), Prettier, and the Node built-in test runner. Install dev tooling once:

```bash
npm install
```

Before opening a PR, run all of the following locally:

```bash
npm run lint                       # ESLint with --max-warnings=0
npm run format:check               # Prettier check; run `npm run format` to auto-fix
npm test                           # node --test against tests/*.test.js
node scripts/check-em-dash.mjs     # content rule: no em-dash in user-facing files
```

Each must exit cleanly (no warnings, no failures). CI runs the same commands plus an HTML validator (`npx html-validate index.html`) and a JS syntax check on every `js/*.js` file. Lint rules live in `eslint.config.js`.

### Test suites

Three suites live under `tests/`. All of them load the real `js/*.js` files into a fresh `node:vm` sandbox via `tests/_setup.js`, so the tests exercise production code paths without any fixture duplication.

- `tests/resolver.test.js` covers the four-axis resolver (`resolveLevel`) and the i18n picker (`tx`).
- `tests/data.test.js` covers `js/03-data.js` schema integrity: category and feature counts (locked to the figures in README and CHANGELOG), id uniqueness, axis variant key validity, non-empty TR / EN translations on every required field, and the em-dash content rule (with the placeholder exemption).
- `tests/projects.test.js` covers the multi-project store (`js/04-projects.js`): create / rename / delete validation, the 20-project cap, legacy v1 to v2 migration, the localStorage round-trip, and active-project re-selection on delete.

When adding a new test file, follow the existing patterns:

- `loadAppContext()` returns a sandbox with the default minimal set of files loaded.
- `loadAppContext({ extraFiles: ["js/03-data.js"] })` also loads extra source files, useful when tests need DATA.
- `loadAppContext({ localStorageSeed: { key: "value" } })` pre-populates the in-memory localStorage stub before the scripts run, useful for migration tests.

Cross-realm note: objects constructed inside the sandbox carry the sandbox realm's `Object.prototype`. `assert.deepStrictEqual` from `node:assert/strict` rejects them as not-equal even when the structure matches a main-realm literal. Use a JSON round-trip helper (see `plain()` in `tests/projects.test.js`) before comparing complex sandbox-realm values.

## Commit message convention

- Use the imperative mood: `Add webhook integration item`, `Fix progress bar overflow on iOS`.
- Focus on the **why** in the body, not just the **what**.
- Reference issues with `#N` when applicable: `Fix print layout on Safari (closes #42)`.

Conventional commit prefixes (`feat:`, `fix:`, `docs:`, `refactor:`) are welcome but not required.

## Pull request process

1. Fork the repository.
2. Cut a feature branch off `main`: `git checkout -b feat/short-description`.
3. Make a small, focused change. Keep PRs reviewable.
4. Run `npm run lint` and `npm test` locally.
5. Follow the PR template (it pops up automatically when you open the PR).
6. Request review from the maintainer. UI changes need a screenshot.

## Code of Conduct

Participation in this project is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By contributing, you agree to abide by its terms.
