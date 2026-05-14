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
index.html                       Single page, all modals inline
manifest.webmanifest             PWA manifest
sw.js                            Service Worker (network-first + cache fallback)
css/
  01-base.css                    Reset, CSS custom properties, typography
  02-layout.css                  Hero, page layout, project pill
  03-categories.css              Category cards, item cards, flip
  04-presentation.css            Presentation mode
  05-hero-pills.css              Hero pill (vertical card) + lang/style pills
  05-modals-core.css             Modal skeleton + shared styles
  05-modals-welcome.css          7-step welcome flow
  05-modals-projects.css         Project / framework / backend tabs
  05-modals-install.css          PWA install guidance
  05-modals-feedback.css         Toast notifications + celebration modal
  06-responsive-print.css        Mobile, tablet, desktop, print
js/
  00-bootstrap.js                Sync IIFE: theme + lang before first paint
  01-i18n-strings.js             UI strings dictionary (TR/EN) + t() / tx()
  02-help-content.js             Help modal content
  03a-data-01-idea-planning.js   Category 01 data
  03b-data-02-design.js          Category 02 data
  03c-data-03-code-layout.js     Category 03 data
  03d-data-04-git.js             Category 04 data
  03e-data-05-api.js             Category 05 data
  03f-data-06-backend.js         Category 06 data
  03g-data-07-offline.js         Category 07 data
  03h-data-08-testing.js         Category 08 data
  03i-data-09-security.js        Category 09 data
  03j-data-10-a11y.js            Category 10 data
  03k-data-11-release.js         Category 11 data
  03l-data-12-monetization.js    Category 12 data
  03m-data-13-analytics.js       Category 13 data
  03n-data-14-cicd.js            Category 14 data
  03-data.js                     Stub: exposes window.DATA as const DATA
  04-projects.js                 Multi-project storage
  04-storage.js                  Mark / note state wrapper
  05-framework.js                Framework definitions + resolveLevel
  05-backend.js                  Backend definitions + hiding logic
  06-view-state.js               Current framework / backend / view mode
  07-ui-helpers.js               Theme, modal helpers, toast, escapeHtml, stripHtml
  08-i18n-dom.js                 Apply i18n to DOM, switch language
  09-ai-prompt.js                AI prompt generator (markdown + JSON)
  10-clipboard.js                Clipboard helper
  11-render.js                   Main render loop, card template
  12-progress.js                 Percentage, celebrations, countLevels
  13-filters.js                  Search + 3x3 view filter
  14-welcome.js                  7-step welcome flow + welcome help
  15-projects.js                 Project / framework / backend modal + CRUD
  16-presentation.js             Presentation mode (P key, ESC, arrows)
  17-install.js                  PWA install banner + platform-manual fallback
  18-app.js                      Orchestration: toolbar, reset, lock, help
                                 accordion, print, export/import, keyboard
                                 shortcuts, PWA manifest/SW setup, init
scripts/                         Build-less utility scripts (em-dash check,
                                 sw cache version check, githooks installer)
tests/                           Unit tests for resolver, data schema, the
                                 multi-project store, the XSS-defense
                                 helpers, and the progress counter
```

**Content lives in the 14 per-category data files** (`js/03a-data-01-idea-planning.js` through `js/03n-data-14-cicd.js`). At runtime each file appends its category onto `window.DATA`, and the 15-line stub `js/03-data.js` re-exports the populated array as `const DATA`. Do not put new items in the stub; pick the file that matches your category. UI strings live in `js/01-i18n-strings.js`. Everything else is logic and presentation.

## How to add a checklist item

1. Find the file that owns your category. The 14 categories map one-to-one with these files:

   | Category                     | File                              |
   | ---------------------------- | --------------------------------- |
   | 01 Project Idea and Planning | `js/03a-data-01-idea-planning.js` |
   | 02 Design                    | `js/03b-data-02-design.js`        |
   | 03 Code Layout               | `js/03c-data-03-code-layout.js`   |
   | 04 Git and Version Control   | `js/03d-data-04-git.js`           |
   | 05 API                       | `js/03e-data-05-api.js`           |
   | 06 Backend                   | `js/03f-data-06-backend.js`       |
   | 07 Offline and Cache         | `js/03g-data-07-offline.js`       |
   | 08 Testing                   | `js/03h-data-08-testing.js`       |
   | 09 Security                  | `js/03i-data-09-security.js`      |
   | 10 Accessibility             | `js/03j-data-10-a11y.js`          |
   | 11 Release and Store         | `js/03k-data-11-release.js`       |
   | 12 Monetization              | `js/03l-data-12-monetization.js`  |
   | 13 Analytics                 | `js/03m-data-13-analytics.js`     |
   | 14 CI/CD                     | `js/03n-data-14-cicd.js`          |

2. Append a new object to that file's `features` array, mirroring the shape of existing items:

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

3. If the item only makes sense when a backend is configured, add `backendStep: true`. It will hide automatically when the user selects "No backend".

4. **Bump the count fixtures.** `tests/data.test.js` locks `EXPECTED_FEATURE_COUNT` to the figure quoted in README.md / README.tr.md / CHANGELOG.md. Add `1` to that constant and the `55 items` line in both READMEs, otherwise the test suite will fail. The data-schema test is intentional: it forces a docs update on every content change.

## How to add a language

The codebase is structured so adding a third language touches a known list of files:

1. `js/01-i18n-strings.js`: for every key in `UI_STRINGS`, add the new-language counterpart (for example `de` for German).
2. All 14 data files (`js/03a-data-01-idea-planning.js` through `js/03n-data-14-cicd.js`): every `{tr, en}` pair throughout each file needs a new locale key (for example `de`). This includes titles, descriptions, MVP / Release texts, and How-To steps inside the `simple`, `simpleBackend`, `variants`, and `backendVariants` blocks. Do not touch the `js/03-data.js` stub; it only re-exports the combined array.
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
4. Data files (`js/03a-data-01-idea-planning.js` ... `js/03n-data-14-cicd.js`): optionally add `variants.{new-framework}` or `backendVariants.{*}.{new-framework}` entries on items that need framework-specific code samples. The resolver falls back to the universal value if you don't.

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
3. Data files (`js/03a-data-01-idea-planning.js` ... `js/03n-data-14-cicd.js`): for backend-dependent items, add `backendVariants.{new-backend}._default` blocks (and optional per-framework overrides). Backend-only items live mostly in `js/03f-data-06-backend.js`; items in other categories whose behavior changes per backend (analytics, push, auth, storage flows) carry the same blocks.

## Migrating local edits from 1.0 to 1.1

If you forked the repository at 1.0 and carried local edits on the old single-file `js/03-data.js`, the 1.1.0 release split that file into 14 per-category shards. Cherry-picking your old diff onto `main` will produce a merge conflict at every line because the line numbers no longer match. The migration is mechanical but tedious; here is the shortest path:

1. **Identify which categories your diff touched.** Open your fork's `js/03-data.js` from before 1.1.0 and note which category `id` your edits land in (the categories appear in numerical order from `01` to `14`).
2. **Map each category to the new shard.** The 14 categories now own these files:

   ```
   01 Project Idea and Planning   →  js/03a-data-01-idea-planning.js
   02 Design                      →  js/03b-data-02-design.js
   03 Code Layout                 →  js/03c-data-03-code-layout.js
   04 Git and Version Control     →  js/03d-data-04-git.js
   05 API                         →  js/03e-data-05-api.js
   06 Backend                     →  js/03f-data-06-backend.js
   07 Offline and Cache           →  js/03g-data-07-offline.js
   08 Testing                     →  js/03h-data-08-testing.js
   09 Security                    →  js/03i-data-09-security.js
   10 Accessibility               →  js/03j-data-10-a11y.js
   11 Release and Store           →  js/03k-data-11-release.js
   12 Monetization                →  js/03l-data-12-monetization.js
   13 Analytics                   →  js/03m-data-13-analytics.js
   14 CI/CD                       →  js/03n-data-14-cicd.js
   ```

3. **Apply edits one category at a time** to the matching shard file. Each shard begins with `(window.DATA = window.DATA || []).push({ id: "NN", ..., features: [...] });` and the `features` array shape is identical to the pre-1.1.0 layout, so item-shape edits paste in verbatim.
4. **Do not touch `js/03-data.js`.** In 1.1.0 it is a 15-line stub that re-exports the populated `window.DATA` as `const DATA`. Any content edit to the stub is silently lost on the next render.
5. **Run the suite.** `npm test` exercises the DATA-schema test (`tests/data.test.js`), which catches id collisions, missing TR / EN translations, and feature-count drift. If you added or removed items, also bump `EXPECTED_FEATURE_COUNT` in that file and the `55 items` line in both READMEs.
6. **Optional, for sanity:** `node scripts/check-em-dash.mjs` against your changes locally, so the CI em-dash check does not surprise you on PR submission.

If your diff also touched the orchestration layer that was split out of `js/14-app.js` in 1.1.0 (welcome, projects, presentation, install, app), see the CHANGELOG entry for 1.1.0 for the new file boundaries: `14-welcome.js`, `15-projects.js`, `16-presentation.js`, `17-install.js`, `18-app.js`.

## Coding standards

- **Never use the em dash character (`—`) in any user-facing text or data.** Use commas, colons, semicolons, parentheses, or hyphens (`-`) instead. This rule applies to translation strings, item content, How-To steps, and anything a user might read. CI runs `node scripts/check-em-dash.mjs` against `js/01-i18n-strings.js`, `js/02-help-content.js`, every `js/03*-data*.js` shard (the stub plus the 14 per-category files), and `index.html` to enforce it. The standalone placeholder string `"—"` used inside the data files for empty cells is explicitly allowed; anything else that contains an em-dash is rejected.
- 2-space indentation, semicolons at end of statements, double quotes (`"..."`) in all `js/` files. The sole exception is `sw.js`, which uses single quotes by historical convention.
- Plain `<script>`-loaded JavaScript, not ES modules. Functions and constants are intentionally global so files can share state without an import graph. Preserve this pattern. **When you add a new top-level function or constant in any `js/*.js` file, also add its name to the matching `projectGlobals` block in `eslint.config.js`.** ESLint's flat config tracks the project's globals explicitly because there is no module system; a missing entry shows up as a `no-undef` error in the file that consumes it.
- ES2020+ syntax is fine. No transpilation runs, so avoid features that are not supported by the [browsers we target](../README.md#browser-support).
- CSS: edit the category file that owns the affected area. Use existing custom properties (`var(--...)`) for colors, radii, spacing.

## Tests and linting

The project uses ESLint (flat config), Prettier, and the Node built-in test runner. Install dev tooling once:

```bash
npm install
```

Before opening a PR, run all of the following locally:

```bash
npm run lint                              # ESLint with --max-warnings=0
npm run format:check                      # Prettier check; run `npm run format` to auto-fix
npm test                                  # node --test against tests/*.test.js
node scripts/check-em-dash.mjs            # content rule: no em-dash in user-facing files
node scripts/check-sw-cache-version.mjs   # sw.js CACHE_NAME must match package.json
```

Each must exit cleanly (no warnings, no failures). CI runs the same commands plus an HTML validator (`npx html-validate index.html`) and a JS syntax check on every `js/*.js` file. Lint rules live in `eslint.config.js`. After bumping the version in `package.json`, run `npm run sw:sync` to regenerate the Service Worker cache key (or pass `--fix` to the check script directly).

### Test suites

Five suites live under `tests/`. All of them load the real `js/*.js` files into a fresh `node:vm` sandbox via `tests/_setup.js`, so the tests exercise production code paths without any fixture duplication.

- `tests/resolver.test.js` covers the four-axis resolver (`resolveLevel`) and the i18n picker (`tx`).
- `tests/data.test.js` covers the DATA schema integrity: category and feature counts (locked to the figures in README and CHANGELOG), id uniqueness, axis variant key validity, non-empty TR / EN translations on every required field, and the em-dash content rule (with the placeholder exemption). The DATA array is loaded by passing the `DATA_FILES` list from `_setup.js` as `extraFiles`; tests do not need to re-list the per-category files.
- `tests/projects.test.js` covers the multi-project store (`js/04-projects.js`): create / rename / delete validation, the 20-project cap, legacy v1 to v2 migration, the `localStorage` round-trip, and active-project re-selection on delete.
- `tests/ui-helpers.test.js` covers the HTML escape / strip pair in `js/07-ui-helpers.js`: the five XSS-relevant character escapes, idempotency of double-escaping, type coercion of null / undefined / number / object inputs, common XSS attack-vector strings, and the stripper's entity decoding plus whitespace collapse.
- `tests/progress.test.js` covers `countLevels` in `js/12-progress.js`: empty state, partial state, all-done state, MVP-only completion, Release-only completion, backend-gated feature exclusion when `currentBackend === "noBackend"`, and the per-category breakdown counts.

When adding a new test file, follow the existing patterns:

- `loadAppContext()` returns a sandbox with the default minimal set of files loaded (i18n strings, projects, storage, framework, backend, view-state).
- `loadAppContext({ extraFiles: ["js/07-ui-helpers.js"] })` also loads extra source files, useful when tests need helpers that are not in the default set. Use `DATA_FILES` (exported from `_setup.js`) when the test needs the populated DATA array.
- `loadAppContext({ localStorageSeed: { key: "value" } })` pre-populates the in-memory `localStorage` stub before the scripts run, useful for migration tests.
- The sandbox exposes test-only helpers: `ctx.__setAxes({lang, style, framework, backend})` mutates the script-mode axis bindings, and `ctx.__setState(stateObject)` seeds the `state` map countLevels reads.
- The adapter mirrors `escapeHtml`, `stripHtml`, and `countLevels` onto the sandbox automatically when their host file is in `extraFiles`. Other helpers can be added the same way by extending the `typeof X === "function"` guarded block in `_setup.js`.

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

## License of contributions

This project is released under the [MIT License](../LICENSE). By submitting a pull request, you confirm that your contribution is your own work (or that you have the right to submit it) and you agree that it will be licensed to the project and its users under the same MIT License, without any additional terms or conditions. No separate Contributor License Agreement is required; the inbound license matches the outbound license.
