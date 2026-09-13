# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **GitHub Pages deploys only through the workflow.** The repository's Pages
  source was still set to a branch, so on every push GitHub built `main` as
  well as running `.github/workflows/deploy-pages.yml`, and the two
  deployments raced: whichever finished last was served. The 1.3.1 push was
  won by the branch build, which published `package.json`, `tests/` and
  `scripts/` next to the site. The source is now GitHub Actions and the
  workflow's artifact is the only deployment; those files return 404 again.
- The README's steps for publishing a fork (both languages) now enable the
  fork's workflows and select GitHub Actions as the Pages source, instead of
  `main` / `(root)`, and say that a custom domain is set in Settings: a
  workflow deployment ignores a `CNAME` file. The workflow's own comment no
  longer claims that a branch source makes the deploy fail; nothing fails,
  the deployments race.

## [1.3.1] - 2026-09-14

A mobile pass. The application was responsive in the sense that it did not
break, and unusable in the sense that mattered: on a 320px screen the welcome
flow's step indicator ran off both edges of the dialog, a card's How-To button
sat on top of the card's own title, the "Reset" tab of the project dialog was
not on screen at all, and the How-To guides wrapped to two or three words a
line. This release is that list, measured rather than eyeballed, plus the
performance work the same measurements turned up.

The project is a checklist for shipping mobile applications. Its own mobile
side is the part a reader is most entitled to judge it by.

### How it was measured

A harness drives seven real device viewports (320, 360, 375, 390, 412, 430 and
768 CSS px) against all three designs and eight application states, and reports
horizontal overflow, elements outside the viewport, touch targets under 44px,
text under 12px, dialogs that do not fit, and fixed chrome that takes more than
a third of the screen. Baseline: **359 distinct problems**. Now: 35, every one
of them a deliberate typographic decision documented under TYPE ON A PHONE in
`css/06-responsive-print.css`.

Performance figures come from an emulated mid-range handset (390x844, 4x CPU
slowdown) on a slow network emulated in the server: 150ms before each response,
1.6 Mbps of shared download bandwidth, gzip, and ETag revalidation. The network
lives in the server rather than on the page because throttling set on the page
does not slow down the requests a Service Worker makes itself, and the page
reports a response the worker served as a few bytes wherever it came from.
Figures are the median of three runs. The Service Worker was also checked on a
real phone, Chrome on Android 16: a first visit that then opens offline, and
the update from 1.3.0 to this release.

### Added

- **A breakpoint scale**, documented at the head of
  `css/06-responsive-print.css` and used by every sheet in the project: 900,
  700, 560, 430 and 360px. Before this there was one screen breakpoint in that
  file (`max-width: 700px`) and nine ad-hoc widths scattered through the other
  sheets (760, 720, 600, 540, 480, 460, 420, 380), which is how a 320px screen
  ended up with a layout designed for a 700px one. Nothing below 380px was
  handled at all.
- **A touch-target pass** (`@media screen and (pointer: coarse)`). Every
  control a reader taps to get through the application is at least 44x44 CSS
  px, the figure Apple's Human Interface Guidelines and Material both use, and
  well above the 24x24 that WCAG 2.2 asks for in success criterion 2.5.8. The
  harness counted **233 distinct controls under that size**; it now counts
  none. Where growing a box would disturb the layout, the target grows with
  padding and is pulled back with a negative margin, so it is bigger to a
  finger and the same size to the eye.
- **An opaque `--popover` token**, defined by each design. Floating surfaces
  (the level filter's dropdown) cannot use `--surface`: two of the three
  designs define it as a translucent wash, which is right for a panel sitting
  in the page and wrong for a menu floating over other text.
- **Named backdrop-blur tokens in the Showcase design**
  (`--s-blur-pill`, `-card`, `-bar`, `-hero`, `-dialog`), so the phone tier at
  the foot of that file has one place to switch them all off and a reader has
  one place to see how much blur the design is asking for.
- **Dismiss on scroll** for the mobile actions menu, alongside the existing
  dismiss on an action, on a tap outside and on Escape. The panel lives inside
  the sticky bar, so an open panel travels down the page with it; on a 320px
  screen the bar plus the panel is about two thirds of the viewport.
- **`APP_SHELL` in `sw.js`, and `scripts/check-sw-app-shell.mjs` to keep it
  true.** The 59 files the page needs in order to open are listed once,
  generated from `index.html` and `manifest.webmanifest` by `npm run sw:sync`,
  and the CI job that already checks the cache key now also fails when the
  list has drifted. Both ways of drifting are silent in a browser: a file the
  page loads but the list omits is simply missing offline, and a listed file
  that no longer exists stops the worker installing at all.
- `tests/responsive.test.js` (suite 281 to 292) holds the breakpoint scale,
  the `screen` guard on the touch-target block, 16px text fields on a coarse
  pointer and a `dvh` companion for every `vh` height.
- `tests/service-worker.test.js` (suite 292 to 313), the first unit tests for
  the worker. `sw.js` runs in a `node:vm` context with in-memory stand-ins for
  `caches`, `fetch`, `Request` and `setTimeout`, and the tests dispatch the
  events a browser would: install, activate, a navigation online, offline and
  on a slow network, and a cached file served and refreshed. Removing the
  install step turns five of them red.

### Changed

- **Service Worker: the app shell on install, then two strategies instead of
  one.** Navigations stay network-first, now with a 3 second timeout so a weak
  signal costs a moment rather than the page, and fall back to the cached page
  matched without its query string. Everything else (37 scripts, 14
  stylesheets, the icons, the manifest) is served from the cache and
  revalidated in the background. A repeat visit went from **1951ms to 522ms**
  before the checklist is usable, and its network cost is 53 revalidations
  that answer 304, about 8 KB, when nothing has changed. Through 1.3.0 every
  one of those requests was waited on before the page could render.
  - Installing the worker now stores every file of the shell, requested with
    `cache: 'no-cache'`: from a server that sends validators, as GitHub Pages
    does, the files the first visit has just loaded come back as 304s, so a
    first visit costs 59 extra requests and
    about 12 KB (the manifest and six icons the page does not load itself),
    not a second download.
  - The page reloads itself once when a new worker takes control, which is
    what keeps that safe: for one load after a release, network-first
    navigation could otherwise pair a new document with subresources still
    cached from the old one. On the phone, the update from 1.3.0 opened the
    new document, found the new worker two seconds later, reloaded once at
    3.6 seconds, and made no further request: the old cache was gone and the
    new one held all 59 files.
- **The category index is one scrolling row on a phone.** Fourteen chips
  wrapping down the page came to **638px on a 320px screen**, a full screen of
  navigation between the toolbar and the first checklist item. It is 46px now,
  with scroll-snap, and every chip is still reachable.
- **The How-To guide is one column below 560px.** The MVP / Release chip took
  a third of the text column, and the numbered steps inside it took another
  36px, leaving about 138px for the text: two or three words a line. The chip
  takes a row of its own now and the guide gets the full width.
- **Level rows stack their tag above their text below 560px**, for the same
  reason: a 72px tag column out of a 230px row is not affordable.
- **The sticky area is one surface on a phone.** The toolbar card and the
  progress card had a 12px gap between them, and the checklist scrolled through
  it in a legible strip, so headings appeared to run through the middle of the
  toolbar. The two cards close up into one block with a single hairline seam,
  and all three designs give that block an opaque fill.
- **Backdrop blur is off below 700px.** Each one is a compositing pass that
  re-samples whatever is behind the element, repeated on every frame that
  element or the page under it moves. The Showcase design asked for one on the
  hero, the sticky bar, every chip, every dialog and **all 55 cards**. What sits
  behind them is the page's own gradient, smooth enough that blurring it
  changes nothing a reader can see. `background-attachment: fixed` goes with
  it: it repaints the viewport on every scrolled frame and Safari on iOS has
  never implemented it faithfully anyway.
- **`will-change` is scoped to the animation that needs it.** It was set on all
  55 cards for the whole session, on a device that may have no memory to spare,
  to smooth a flip that runs on one card at a time. `js/11-render.js` adds
  `.flipping` for the half-second the animation lasts.
- **Dialogs use `dvh`, not `vh`.** `85vh` is 85% of the viewport a mobile
  browser reports with its address bar hidden, which is not the viewport the
  reader has while the bar is showing: a dialog's footer buttons ended up below
  the bottom of the screen. Dialogs also take 92% of the height and a 12px
  margin below 560px, where 20px a side was 40px of a 320px screen. The same
  change applies to `body` and to presentation mode's slides.
- **Safe-area insets** on `.wrap`, on dialogs, on presentation mode's bars.
  `viewport-fit=cover` was already set, which means the notch and the home
  indicator can sit over the content.
- Text fields are 16px on a coarse pointer. Safari on iOS zooms the page in
  when a field with a smaller font takes focus and does not zoom back out.
  This is keyed on the input method rather than on width: an iPad in landscape
  is 1024px wide and does it too.
- Type below 12px was raised where a reader has to read it (framework and
  backend names, the progress counters, control labels, the item number) and
  left alone where it captions a larger value beside it, or is a decorative
  glyph, or is `aria-hidden` because it restates something the page already
  says in words. The reasoning is written out in the sheet.
- `touch-action: manipulation` and a tinted tap highlight on every control. The
  first removes the double-tap-to-zoom wait, which on a checklist tapped in
  quick succession turns two taps on neighbouring rows into a zoom. The second
  keeps the feedback Android gives for free rather than zeroing it out, as is
  the reflex.
- Scrolling is contained: a dialog no longer hands the rest of a gesture to the
  page behind it, and the page behind a dialog does not move at all.

### Fixed

- **A first visit did not make the application available offline.** A Service
  Worker only sees the requests a page makes after it has taken control, and
  the page registers it once its stylesheets and scripts have already arrived.
  The worker cached only what passed through it, so when a first visit ended
  its cache was empty: opening the application offline after one visit failed,
  it took a second visit to fill the cache, and a link carrying a query string
  failed offline even then. The same was true of 1.3.0 and of every earlier
  tagged release. The worker now stores the whole shell while it installs (see
  Changed). In the harness, opening offline after one visit went from 0 of 3
  runs to 3 of 3; on a real phone the new worker opened offline after a single
  visit, through a link with a query string as well.
- **The How-To button sat on top of the card title.** It is positioned in the
  card's corner and took no space in the flow, so on a narrow card the title
  ran underneath it. Measured across the three designs at phone widths, that
  was **up to 31 of the 55 cards** at a time. The heading takes a row of its
  own now, the item number and the button read as the card's header row, and a
  short float holds the corner open for the heading's first line.
- **The welcome flow's step indicator ran off both edges.** Eight dots at 26px
  with seven connectors and fifteen gaps ask for about 340px; a 320px screen
  offers the dialog 220px, so the first and last steps were cut in half. The
  dots and spacing step down below 560px and the connectors go entirely below
  430px.
- **The project dialog's fourth tab was off screen.** Four tabs at 14px with
  18px of padding a side ask for about 420px against the 280px a phone gives
  the dialog, so "Backend" was cut off and "Reset" was not visible at all. A
  tab a reader cannot see is a tab that does not exist. They are equal columns
  below 560px, which fits all four down to 320px.
- **The mode and style steps of the welcome flow rendered their descriptions
  in uppercase with wide letter-spacing.** That treatment belongs to the
  language step, where the description is a single word ("Turkish"); the two
  steps that reuse the same classes have a full sentence there, which came out
  three words a line in cards several times taller than they needed to be. It
  is keyed on the language buttons now, and sentence-length cards stack below
  560px.
- **The level filter's dropdown was see-through in the Showcase design.** It
  drew itself on `--surface`, which that design defines as a 3.8% white wash,
  so the project pill's labels read straight through the menu's own.
- **Long identifiers pushed the page sideways.** `UITraitCollection.userInterfaceStyle`
  and its kind have no space to break at, and inline code in the How-To steps
  ran up to **125px past the viewport**; in the Showcase design the document
  itself scrolled 34px.
- **Presentation mode's controls covered the end of every slide.** The bar
  floats over the foot of the slide, which a wide screen rarely reaches and a
  phone always does.
- **Cumulative Layout Shift on the first load: 0.109, 0.138 and 0.041, now
  0.001** in Minimal, Classic and Showcase, against the 0.1 that counts as
  good. What is left comes from the category index filling in, which is one
  46px row on a phone; it is deliberately not reserved, because the row's
  height depends on how the chips wrap and a wrong reservation would shift
  more than it saves. The checklist is written into
  `#content` by a script that cannot run until 37 files have arrived; until
  then the element had no height, the footer sat in the first screen, and the
  arrival of the checklist threw it thousands of pixels down the page. The
  element holds a screen's worth of height open while it is empty.
- **The hero's language and style pills were laid out by a rule that matched
  nothing.** It selected them as direct children of `.hero-controls-right`,
  where they are grandchildren, so the two blocks wrapped onto separate rows at
  inconsistent widths.
- The search field's minimum content width kept the toolbar from being narrower
  than it wanted to be, and pushed the document 3px sideways at 320px.
- The bullet the help dialog draws in front of prose list items appeared in
  front of the project list's rows, which are controls rather than paragraphs.
- The welcome flow's call to action inherited `white-space: nowrap` from the
  shared button rule, and it carries a sentence: on a 320px screen the language
  step's button ran 108px past the edge of the screen.

## [1.3.0] - 2026-09-12

Three design themes, a content refresh against current platform sources,
and an accessibility pass.

The visual system became an axis of its own, next to the existing light and
dark color mode:

```
data-design   classic | minimal | showcase   layout, shape, typography, motion
data-theme    dark | light                   color mode
```

Six combinations over one DOM, one data set and one feature set. Every theme
carries the whole application: 14 categories, 55 items, notes, the AI prompt
generator, multi-project, presentation mode, filters, search, export and
import, PWA install. A theme changes how the page looks, never what it can
do, and the printed output is identical in all three.

Alongside that, every factual claim in the 14 category data files was
re-verified against primary sources (platform documentation, store policy
pages, vendor release notes) and the stale ones corrected: the content freeze
had been in May 2026 and four months of platform churn had moved several
store requirements.

Upgrading is a page reload. All existing marks, notes and projects are kept;
nothing in `localStorage` changes shape. Anyone who has never opened the
theme picker will see the new default (Minimal) and can return to the
previous look in two clicks.

### Added

- `scripts/serve-local.py`: a development server that disables caching, for
  the reason in Fixed below. `npm run serve` uses it.
- A **theme step** in the welcome flow, immediately after the language step,
  taking it from seven steps to eight. It applies the pick to the page behind
  the dialog straight away (`persist: false`) so the reader chooses by looking
  rather than by reading a description, and opens with the active design
  already selected so anyone without an opinion can press Next. The choice is
  written to storage in `welcomeStart`, like every other answer in the flow.
  The three cards reuse the picker's CSS-drawn previews.
- `tests/design.test.js` grew a "Welcome flow theme step" suite (suite 277 to
  281): the panes, the indicator dots and the connectors must agree on the
  step count, the step must offer exactly `VALID_DESIGNS`, the preview and the
  persist halves must both be present, and every `setWelcomeStep` target must
  land on a step that exists. The step count lives in six files; inserting a
  step meant renumbering all of them by hand, which is the kind of edit that
  half-lands.

- `assets/screenshots/{tr,en}/05-theme-picker.png`,
  `06-theme-classic.png`, `07-theme-showcase.png`: a theme gallery for
  both READMEs, in both languages. Shots 01 to 05 use the application's
  default theme; 06 and 07 pin their own, so the gallery always shows all
  three regardless of what the default is on the day it is regenerated.
- `SHOT_DESIGN` environment override in `scripts/capture-screenshots.mjs`,
  alongside the existing `BASE_URL` and `SHOT_LANG`. Every seed now writes
  the design key explicitly, so a shot never silently changes meaning when
  the default design changes.

- `js/19-design.js`: the design axis. `applyDesign()`, the picker dialog,
  persistence under `mobil_kontrol_design_v1`, the toolbar button label,
  the `T` shortcut, and `resolveInitialDesign()`. A saved choice always
  wins; anyone who has never opened the picker gets the default.
- `css/07-design-minimal.css`: the **Minimal** theme, and the new
  default. Neutral palette, hairline rules instead of card chrome, one
  non-chromatic accent, decorative emoji hidden, a denser toolbar and
  list. From 1140px the category index becomes a fixed rail in a
  reserved left gutter and the page reads like documentation.
- `css/08-design-showcase.css` + `js/20-showcase-motion.js`: the
  **Showcase** theme. Display typography, a layered background, glass
  surfaces, a hero stage with three animated progress rings,
  reveal-on-scroll for chapters and cards, a reading-progress hairline,
  and a chapter rail with scroll-spy from 1320px. The motion layer is an
  IIFE that attaches only while Showcase is active and removes every
  node and class it added when the theme changes.
- `css/09-design-picker.css`: the picker dialog. Each theme's preview is
  drawn in CSS rather than shipped as a screenshot, so the three
  miniatures follow the reader's color mode and cannot go stale against
  the real page.
- `emitAppEvent()` in `js/07-ui-helpers.js`, plus the
  `checklist:rendered`, `checklist:progress` and `design:changed` events.
  Enhancement layers subscribe instead of patching the render path.
- `tests/design.test.js`: 34 tests (suite 243 to 277). `normalizeDesign`
  including the near misses, the full `resolveInitialDesign` decision
  table, and `applyDesign` persistence including the `persist: false`
  path. It also locks three cross-file invariants: that `DEFAULT_DESIGN`
  and the design list match the copies inlined in `js/00-bootstrap.js`,
  that every design rule sits inside `@media screen` (the mechanism
  behind print parity), and that the Showcase layer's `detach()` clears
  each class and node its `attach()` adds.
- `.btn-emoji`: the emoji that used to sit inside four translated button
  labels now live in their own `aria-hidden` span.

### Changed

- README screenshots regenerated. The four existing shots were taken
  against the old single look and no longer matched the application.
- `README.md`, `README.tr.md`: a "The three themes" gallery under
  Screenshots, and the capture note explains which shots pin a theme.
- PWA chrome colors follow the default design: `theme-color` in
  `index.html` and `theme_color` / `background_color` in
  `manifest.webmanifest` move from the Classic grounds (`#0b0f17`,
  `#f6f7fb`) to the Minimal ones (`#0a0a0b`, `#ffffff`).
- `.github/CODEOWNERS` covers the five design files. One DOM carries three
  designs, so a change there can break a design nobody opened in review.
- `.github/ISSUE_TEMPLATE/bug_report.yml`: required Theme and Color mode
  dropdowns, because a visual bug is now usually specific to one of the
  six combinations. The OS options and the browser-version placeholder
  had drifted about two years behind and were refreshed.

- `js/00-bootstrap.js` resolves and applies the design before first
  paint, next to the color mode and language it already handled.
- The default look for a first visit is **Minimal**. A saved choice is
  always honored, so nobody who has picked a theme is moved off it.
- Wording in both languages: the light / dark switch is now a "mode",
  and "theme" names the design. The help modal gained a Theme section
  and a rewritten Light / Dark Mode section; `T` joined the shortcut
  table.
- `.btn-icon-text` was a marker class with no rules, so the icon in the
  theme, lock and design buttons was spaced only by the emoji glyph's own
  side bearing. It is now a flex row with a gap, which is what a drawn
  SVG icon needs.
- The two new designs restate the three surfaces the base sheets
  hardcode a color for (the "MVP + Release" pill, the install banner and
  its call to action) in their own palettes, rather than those values
  being changed in the base sheets, which would alter Classic.
- `README.md`, `README.tr.md`: a Design themes section, an updated
  feature list, refreshed tech-stack rows and file counts (14 CSS, 37
  JS), a new FAQ entry, and the design files in the project tree.
- `.github/CONTRIBUTING.md`: the file layout covers the three new
  stylesheets and the two new modules; a "Working with the three
  designs" section states the four rules that keep the arrangement
  honest; the test section documents the seventh suite and notes that
  the behavioral half needs a browser.
- `tests/_setup.js`: the DOM element stub remembers attributes instead of
  swallowing them. `js/19-design.js` round-trips through
  `documentElement`'s `data-design`, so a stub that always returned null
  made every `applyDesign` call look like a change.

- **Apple submission floor**: the App Store SDK requirement moved from
  "Xcode 16 + iOS 18 SDK since 24 April 2025" to "Xcode 26 + iOS 26 SDK
  since 28 April 2026" in `js/03k-data-11-release.js` and
  `js/03c-data-03-code-layout.js`.
- **Play Store target API floor**: `targetSdk 35` (Android 15) became
  `targetSdk 36` (Android 16), required for new apps and updates since
  31 August 2026, with the extension window to 1 November 2026 and the
  separate Wear OS / Automotive (35) and TV / XR (34) floors spelled
  out. The `windowOptOutEdgeToEdgeEnforcement` note now says the flag
  is honored only at `targetSdk 35`.
- **App Store screenshots**: the requirement is a 6.9" set, or a 6.5"
  set when 6.9" is not uploaded; the retired 6.7" slot was removed, the
  other dimensions accepted into the 6.9" slot (1290x2796, 1260x2736)
  were added, and the 13" iPad set is now correctly described as
  required when the app runs on iPad rather than optional. Simulator
  examples no longer name a single 2024 device.
- **React Native**: the New Architecture note moved from "RN 0.76+" to
  "RN 0.82+", which removed the legacy architecture outright.
- **Flutter rendering**: Impeller is now described as the only renderer
  on iOS (no Skia opt-out) and the default on desktop since Flutter
  3.47, alongside the existing Android API 29+ note.
- **Lighthouse**: the PWA category was removed in Lighthouse 12 (April
  2024, shipped in Chrome 126 DevTools). The previous text credited the
  removal to Chrome 117, which only deprecated it.
- **GitHub**: branch protection steps now point at repository rulesets
  (Settings > Rules > Rulesets), which is where GitHub steers new
  repositories, with a note that an existing classic rule can be
  converted. Secret scanning moved to Settings > Advanced Security >
  Secret Protection, and the text records that it is free on public
  repositories. History rewriting recommends `git filter-repo` instead
  of the discouraged `git filter-branch`.
- **Accessibility**: the contrast item now cites WCAG 2.2 AA, adds the
  2.2 Target Size (Minimum) criterion with the Apple and Android
  equivalents, and notes that the European Accessibility Act has been
  enforceable since 28 June 2025 with EN 301 549 v4.1.1 (published 2
  September 2026) as the technical yardstick.
- **Node floor**: React Native's own setup guide asks for Node 22.11+;
  Node 20 reached end-of-life on 30 April 2026. The tooling followed:
  `package.json` `engines` is now `>=22.13.0`, the CI lint and test
  matrix runs Node 22 and 24 instead of 20 and 22, the single-version
  jobs run Node 24, and `.github/CONTRIBUTING.md` matches.
- **AI model examples** in the fallback-ladder item refreshed to
  current model identifiers.
- Footer content date moved from May 2026 to September 2026.

### Fixed

- **The theme picker had no horizontal padding.** Its contents were direct
  children of `.modal-content`, which carries none; every other modal gets it
  from `.modal-body`. Title, copy, cards and the Done button all sat against
  the dialog's border. They are now inside a `.modal-body` like everywhere
  else.
- **Buttons that own a surface lost it in the two new designs.** Both design
  stylesheets reset `.btn` with `background: transparent` (Minimal) or a glass
  fill (Showcase) at the same specificity as `.btn.primary`,
  `.btn.danger-solid` and `.btn-install-cta`, and loaded later, so the
  background was replaced while the paired text color stayed. The reset
  confirmation's "Evet, devam et" was white on white. The surface reset is now
  scoped with `:not()` so those variants keep the background their text color
  was chosen for, and a variant added later cannot regress the same way.
- **`.btn.danger` was unreadable in light mode** (1.7:1). It had one red tuned
  for a dark surface; light mode now has its own. This affected Classic as
  well as Showcase.
- **The welcome flow's active step dot** used a hardcoded dark label, which
  assumes a light accent. Minimal and Showcase accent with a dark blue in
  light mode, where it measured 2.8:1. The label now flips with the color
  mode, and the hardcoded orange glow follows the accent.
- **Muted and accent text below WCAG AA**, found by measuring rendered pixels
  across three designs, two color modes and twelve UI states: `--text-mute` in
  Minimal (4.1:1) and Showcase (3.7:1), `--text-mute` and `--accent` in
  Classic light (3.6:1 and 2.5:1), the picker's own explanatory copy (3.3:1),
  the destructive reset option's title (3.0:1), and the Showcase instructor
  badge in light mode (3.1:1). The audit went from 76 failing text runs to 36.
- The step indicator's connectors were a fixed 36px, so the eighth dot pushed
  the row to 544px inside a 480px column. They flex now and fit any number of
  steps.
- **Local review could show a page built from a mix of fresh and stale
  files.** `python -m http.server`, which the docs and the `serve` script both
  used, sends `Last-Modified` but no `Cache-Control`; browsers then fall back
  to heuristic freshness and reuse a subresource for minutes without
  revalidating. The visible result was a feature that rendered from fresh HTML
  but did not respond because its module was the previous version, which is
  indistinguishable from a real bug. `scripts/serve-local.py` serves the repo
  with `Cache-Control: no-store`; `npm run serve`, both READMEs and
  CONTRIBUTING now point at it. Reproduced and verified: the same reload that
  served a stale module before serves the current one now.

- `scripts/capture-screenshots.mjs` seeded its demo project as
  `{ active, list }`, which is not the shape `js/04-projects.js` stores
  (`{ version, activeId, projects }`). The store rejected it, so every
  screenshot was taken with no active project and the hero pill rendered
  empty.
- The `03-card-flip` shot had stopped showing a flipped card: categories
  start collapsed, so the flip button existed in the DOM but inside a
  zero-height container, and clicking it produced an image identical to
  `02-checklist`. The shot now expands the first category before flipping.

- The counts the UI quotes back to the user were wrong. The framework
  picker claimed "28 items vary by framework, the remaining 25 are
  universal" (which also does not sum to 55); the data says 24 vary by
  framework and 30 adapt to the stack once backend variants count. All
  five places that quoted a number, in both languages, now match the
  data, and `tests/data.test.js` asserts both splits so the next drift
  fails CI instead of shipping.
- The help modal said the list has "53 features" in the overview and
  "53 items" in the language section. It has 55.

### Removed

- The 239-line static copy of the Turkish help text inside
  `index.html`. `applyI18nToDom()` overwrites `#helpModalBody` with
  `HELP_HTML` from `js/02-help-content.js` on every init, so the inline
  copy was never rendered; it had silently drifted (53 features, a
  three-step welcome flow) and its sections lacked the `.help-section`
  class the accordion needs. A short fallback paragraph plus a comment
  explaining the ownership rule replaces it, and `index.html` drops
  from 1170 to 938 lines.

### Known, not fixed

- Classic's light mode still paints several labels in `--accent-2`
  (`#f97316`), which measures 2.3 to 2.5:1 on its light surfaces: the hero
  eyebrow, the item ids, the active half of the language and style pills, and
  the project pill's name. Darkening that token would also darken the surfaces
  it fills (the instructor badge, the primary button gradient), so it is a
  deliberate change to the published look rather than a contrast fix, and it
  is left for a decision instead of being made silently.

## [1.2.1] - 2026-05-15

Maintenance release: dependency bumps, ESLint 10 migration, branch
protection on `main`, and documentation cleanup. No runtime behavior
changes.

### Changed

- Branch protection enabled on `main`: every change must arrive
  through a pull request whose eight CI status checks (lint on Node
  20 and 22, unit tests on Node 20 and 22, HTML validation, PWA
  sanity, em-dash rule, Service Worker cache version) pass before
  merge. Force pushes and branch deletion are blocked.
- GitHub Actions bumped: `actions/checkout` 4 → 6 and
  `actions/setup-node` 4 → 6 across `.github/workflows/ci.yml` and
  `.github/workflows/deploy-pages.yml`. Picks up Node 24 support and
  the move to a separate credential file under `$RUNNER_TEMP`.
- Dev dependencies bumped: `eslint` 9.39.4 → 10.3.0, `@eslint/js`
  9.39.4 → 10.0.1, `globals` 15.15.0 → 17.6.0. ESLint 10 raises the
  development Node floor to 20.19+ or 22.13+; the CI matrix
  (`["20", "22"]`) already runs on patch versions above that floor.
- `.github/CONTRIBUTING.md` updated in two places: the Tests and
  linting section calls out the new Node floor, and the Pull request
  process section documents the branch-protection flow.
- `.github/CODEOWNERS` now covers the 14 per-category data shards
  (`03a-data-*.js` through `03n-data-*.js`) introduced in 1.1.0, so
  shard PRs route to the maintainer by an explicit rule rather than
  the `*` catch-all. The comment block reflects the post-split
  layout.

### Fixed

- `updateToolbarButtonStates` in `js/06-view-state.js`: dropped the
  dead initializer `let disabled = false;`. Every branch of the
  following if/else unconditionally overwrote the value, so the
  initial assignment was never read. Caught by the new
  `no-useless-assignment` rule in `@eslint/js` 10's recommended set.
  No behavior change.

## [1.2.0] - 2026-05-14

Public release. This is the first version tagged for the world: the
1.0 and 1.1 entries below were internal milestones (feature freeze on
2026-05-12, then a hardening round on 2026-05-14) that prepared the
codebase. The 1.2 pass focused on what an external contributor would
actually see when they land on the repository: documentation that
matches the on-disk reality, a default README in English with
language-keyed screenshots, automated Service Worker cache versioning,
a tripled test surface (151 to 241 tests), form-based issue templates
with dropdowns for framework / backend / language / style, and
explicit XSS-safety invariants on the content data.

### Added

- `scripts/check-sw-cache-version.mjs`: enforces that the Service Worker
  cache key in `sw.js` matches the version in `package.json`. Exits
  non-zero when they differ; pass `--fix` to rewrite `sw.js` in place.
  Wired into the pre-commit hook (`.githooks/pre-commit`) and CI (a new
  `sw-cache-check` job in `.github/workflows/ci.yml`). Two new npm
  scripts surface the same script: `npm run sw:check` and
  `npm run sw:sync`.
- `tests/ui-helpers.test.js`: unit tests for `escapeHtml` and
  `stripHtml` (`js/07-ui-helpers.js`). Covers the five XSS-relevant
  character escapes, double-escape idempotency for the round-trip
  property, type coercion of `null` / `undefined` / numeric / object
  inputs, common XSS attack-vector strings as defense-in-depth
  fixtures, and the stripper's entity decode plus whitespace collapse.
  Plugs the largest test-coverage gap flagged in the 1.1.0 audit (the
  XSS defense had no direct test).
- `tests/progress.test.js`: unit tests for `countLevels`
  (`js/12-progress.js`). Covers empty state, partial state, all-done
  state, MVP-only completion, Release-only completion, backend-gated
  feature exclusion when `currentBackend === "noBackend"`, and the
  per-category breakdown counts the UI reads.
- `tests/_setup.js`: adapter mirror now exposes `escapeHtml`,
  `stripHtml`, `countLevels`, `countHowtoSteps`,
  `countCheckedStepsByPrefix`, `buildAIPromptTR`,
  `buildAIPromptJSON`, `shouldShowFeature`, and a `__setState(state)`
  helper so test files can drive state-dependent paths without
  touching the realm directly. The `extraFiles` option remains the
  canonical way to load the helper files; the mirror is guarded by
  `typeof` so the legacy resolver / projects / data tests do not need
  to change.
- `tests/data.test.js` XSS-safety invariants (+20 tests): walks every
  DATA string and rejects `<script>`, `<iframe>`, `<object>`,
  `<embed>`, `<svg>`, `<style>`, `<link>`, `<meta>`, `<base>`,
  `<form>`, `<input>`, `<textarea>`, `<button>`, `<select>`,
  `<option>` tags; inline `on*=` event handlers; `javascript:`,
  `vbscript:`, `data:text/html` URLs; and non-http(s) `<a href>`.
  Pins the "DATA may contain safe display HTML but never anything
  executable" contract that the render path in `js/11-render.js`
  relies on when interpolating `tx(...)` values into innerHTML
  without `escapeHtml`. A future contributor who pastes a `<script>`
  tag or an `onclick=` handler into a data shard now trips CI
  immediately.
- `tests/filters.test.js` (new, 30 tests) covers
  `shouldShowFeature`: the default `both` / `all` short-circuit,
  search-text matching (case-sensitive at the predicate level), the
  3 x 3 `viewMode` x `viewFilter` dropdown matrix, empty-levels
  behavior, and a state matrix that walks every (mvp checked?
  release checked?) combination through every (mode, filter) pair.
- `tests/ai-prompt.test.js` (new, 27 tests) covers
  `buildAIPromptTR` and `buildAIPromptJSON`: language switch
  (TR / EN headings), conditional MVP / Release sections,
  framework-aware target-platform line (PWA / iOS / Android /
  hybrid), install-command selection (backend SDK for backendStep
  features, framework SDK otherwise), HTML stripping on titles,
  JSON output shape (wrapped in a fenced json code block, inner
  parseable), response_language, project_context.framework and
  project_context.backend wiring, conditional `mvp_level` /
  `release_level` payload, and `backendAssumption` injection only
  for `backendStep` features.
- `tests/progress.test.js` (+13 tests) now also covers
  `countHowtoSteps` and `countCheckedStepsByPrefix` from
  `js/11-render.js`. `countHowtoSteps` is exercised with empty
  input, no `1)` marker, single step, multi-step, intro-then-steps,
  empty body, inline HTML in steps, and newline separators.
  `countCheckedStepsByPrefix` is exercised with zero total, empty
  state, in-range vs out-of-range index counting, falsy state
  values, and prefix isolation.
- `.github/ISSUE_TEMPLATE/bug_report.yml` and
  `.github/ISSUE_TEMPLATE/feature_request.yml`: GitHub form-based issue
  templates replace the markdown versions. Dropdowns capture browser,
  operating system, framework, backend, language, explanation style,
  and PWA install status as structured fields, so triage no longer has
  to re-parse free-text bodies. Required fields are enforced by the
  form engine. The old markdown templates were removed.

### Changed

- **Default README is now English.** `README.md` (English) is the file
  GitHub renders at the repo root; the Turkish version moves to
  `README.tr.md`. Both files cross-link at the top so language
  switching is one click either way. The repo metadata, social card,
  and external links all already pointed at the English content; this
  change makes the GitHub homepage match the rest. The app itself
  still defaults to Turkish per browser language, unchanged.
- **Screenshots split per language.** Existing Turkish screenshots
  moved from `assets/screenshots/*.png` to `assets/screenshots/tr/*.png`
  (preserving git history via `git mv`). A new
  `assets/screenshots/en/*.png` set was captured for the English
  README. Each README now references its own language's screenshot
  folder.
- `scripts/capture-screenshots.mjs` regenerates both languages in a
  single run by default. Pass `SHOT_LANG=tr` or `SHOT_LANG=en` to
  restrict to one. The seed functions now take a `seedArgs` object
  (with a `lang` field) instead of capturing language via closure;
  Playwright serializes the function body without the outer scope so
  closure-captured variables would be lost in the browser realm.
- `js/13-filters.js`: extracted the level-matching loop inside
  `applyFilters` into a pure `shouldShowFeature` predicate at
  module scope. The predicate takes the search query, view mode,
  view filter, search text, and a plain-object level array, and
  returns a boolean. Behavior is byte-identical, including the
  lazy DOM read for the default `both` + `all` combination (the
  predicate is skipped entirely in that case so 55 features do
  not trigger 55 useless `.level` queries per keystroke). The
  extracted form is unit-testable without constructing a DOM;
  `tests/filters.test.js` exercises the full filter matrix.
- `sw.js` cache key is now derived from the project version
  (`mobil-kontrol-v1.2.0` for this release) so a release bump
  automatically invalidates the old PWA cache. Manual cache bumps
  (the old `mobil-kontrol-v3` constant) are no longer required.
- `js/15-projects.js` row-button `title` attribute no longer leaks the
  Turkish phrase "projesine geç" in English mode. A new
  `proj.switch.rowTitle` UI string in `js/01-i18n-strings.js` carries
  the bilingual wording "Switch to {name}" / "{name} projesine geç";
  the row markup passes it through `t(...)` and `escapeHtml` so the
  user-controlled name stays safe in the attribute context.
- `js/18-app.js` import handler now validates the JSON payload before
  applying it. State entries are coerced to booleans, notes entries
  are coerced to strings and capped at 8 KB each, and both maps are
  capped at reasonable entry counts (5000 / 1000). The catch block now
  logs the underlying parse or shape failure via `console.warn` so a
  contributor reviewing DevTools can diagnose the bad file without
  re-opening it manually; the user-facing toast remains the same.
  Defends against malformed exports replacing `state` or `notes` with
  non-object values that would break `renderContent` or
  `updateProgress`.

### Fixed

- README.md, README.en.md, and `.github/CONTRIBUTING.md` were out of
  date after the 1.1.0 split: the modular file-layout sections still
  described a single ~3000-line `js/03-data.js` and a six-file CSS
  layout, while the actual repository carries 14 per-category data
  shards (`js/03a-data-01-idea-planning.js` through
  `js/03n-data-14-cicd.js`), a stub `js/03-data.js` that exposes the
  combined `DATA` constant, and an 11-file CSS layout (the modal
  split). The "Add a checklist item" guidance pointed at the wrong
  file. All three documents now match the on-disk reality.
- A new "Migrating local edits from 1.0 to 1.1" section in
  `.github/CONTRIBUTING.md` tells fork holders which shard to apply
  their old single-file diff against.
- `.github/SECURITY.md` supported-version table updated from `1.0.x`
  to `1.1.x`. Older `1.0.x` releases are no longer maintained;
  reporters are pointed at the current `package.json` version and the
  Releases page.
- README.md "PWA strategy" section no longer claims the
  `manifest.webmanifest` ships inline SVG icons. The 1.1.0 release
  replaced those SVGs with real PNG icons under `assets/icons/`; the
  inline SVG manifest now exists only in the `file://` blob fallback
  inside `js/18-app.js`.
- CHANGELOG 1.1.0 entry corrected: the per-category data shards are
  named `*-idea-planning.js` (not `*-idea.js`), and the modal-split
  CSS files use the plain `05-` numeric prefix (not `05a..05f`), with
  the toast and celebration surface combined under
  `05-modals-feedback.css` (not `05f-modals-celebration.css`).
- Stale `js/14-app.js` references in `js/11-render.js` and
  `js/12-progress.js` comments now point at `js/18-app.js`.

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
  files (`js/03a-data-01-idea-planning.js` through
  `js/03n-data-14-cicd.js`). Each file appends its category to a
  `window.DATA` array, lowering the merge-conflict surface for content
  contributors. The resolver, ESLint globals, tests, and the em-dash
  check were updated to match.
- Split `css/05-modals.css` (2132 lines, ~57 KB) into focused files
  by surface (`05-modals-core.css`, `05-modals-welcome.css`,
  `05-modals-projects.css`, `05-modals-install.css`,
  `05-hero-pills.css`, `05-modals-feedback.css`). `index.html` now
  links the parts in the same numeric load order; the visual output
  is identical.
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

[Unreleased]: https://github.com/OzcanOrhanDemirci/Mobil_App_Check_List/compare/v1.3.1...HEAD
[1.3.1]: https://github.com/OzcanOrhanDemirci/Mobil_App_Check_List/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/OzcanOrhanDemirci/Mobil_App_Check_List/compare/v1.2.1...v1.3.0
[1.2.1]: https://github.com/OzcanOrhanDemirci/Mobil_App_Check_List/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/OzcanOrhanDemirci/Mobil_App_Check_List/compare/2d92f1e...v1.2.0
[1.1.0]: https://github.com/OzcanOrhanDemirci/Mobil_App_Check_List/compare/v1.0.0...2d92f1e
[1.0.0]: https://github.com/OzcanOrhanDemirci/Mobil_App_Check_List/releases/tag/v1.0.0
