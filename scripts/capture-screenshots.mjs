#!/usr/bin/env node
/**
 * scripts/capture-screenshots.mjs
 *
 * Captures README screenshots from a running local server using Playwright.
 * Runs one pass per supported language (Turkish + English) and writes the
 * resulting PNGs into language-keyed subdirectories so the two READMEs can
 * reference their own translations:
 *
 *   assets/screenshots/tr/   referenced by README.tr.md
 *   assets/screenshots/en/   referenced by README.md (English, primary)
 *
 * Prerequisites (NOT added to package.json on purpose; install only if you
 * want to regenerate the visuals):
 *   npm install -D playwright
 *   npx playwright install chromium
 *
 * Usage:
 *   1. Start a local server in the repo root, for example:
 *        npx serve .                     # http://localhost:3000
 *      or
 *        python -m http.server 5500      # http://localhost:5500
 *
 *   2. Run this script (override URL via BASE_URL, restrict to one
 *      language via SHOT_LANG, override the design the main shots use
 *      via SHOT_DESIGN):
 *        BASE_URL=http://localhost:5500 node scripts/capture-screenshots.mjs
 *        SHOT_LANG=en node scripts/capture-screenshots.mjs
 *        SHOT_DESIGN=classic node scripts/capture-screenshots.mjs
 *
 * Output:
 *   assets/screenshots/{tr,en}/01-welcome.png          mobile, viewport-sized
 *   assets/screenshots/{tr,en}/02-checklist.png        desktop, viewport-sized
 *   assets/screenshots/{tr,en}/03-card-flip.png        desktop, viewport-sized
 *   assets/screenshots/{tr,en}/04-help.png             desktop, viewport-sized
 *   assets/screenshots/{tr,en}/05-theme-picker.png     desktop, viewport-sized
 *   assets/screenshots/{tr,en}/06-theme-classic.png    desktop, viewport-sized
 *   assets/screenshots/{tr,en}/07-theme-showcase.png   desktop, viewport-sized
 *
 * Shots 01-05 use MAIN_DESIGN (the application's default unless SHOT_DESIGN
 * says otherwise); 06 and 07 pin their own design so the README can show
 * all three. Every seed writes the design key explicitly, so a shot never
 * depends on what the default happened to be the day it was taken.
 *
 * Each shot captures the visible viewport (fullPage: false). The prepare()
 * step for each shot positions the relevant UI inside the viewport before
 * the screenshot fires, so the resulting PNG is readable inline.
 *
 * IMPORTANT: seed functions cannot rely on outer-scope closures. Playwright
 * serializes the function body and runs it inside the browser realm, where
 * Node-side variables are not visible. Pass any per-language data through
 * the `seedArgs` field; page.evaluate(fn, seedArgs) wires them up.
 */

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const screenshotsRoot = resolve(repoRoot, "assets", "screenshots");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

/* Both languages by default. Pass SHOT_LANG=tr or SHOT_LANG=en to restrict. */
const ALL_LANGS = ["tr", "en"];
const REQUESTED_LANG = (process.env.SHOT_LANG || "").toLowerCase();
const LANGS = ALL_LANGS.includes(REQUESTED_LANG) ? [REQUESTED_LANG] : ALL_LANGS;

/* Design used by the main shots (01-05). Defaults to the application's own
   default; SHOT_DESIGN overrides it. Shots 06 and 07 pin their design
   regardless, so the README gallery always shows all three. */
const ALL_DESIGNS = ["classic", "minimal", "showcase"];
const REQUESTED_DESIGN = (process.env.SHOT_DESIGN || "").toLowerCase();
const MAIN_DESIGN = ALL_DESIGNS.includes(REQUESTED_DESIGN) ? REQUESTED_DESIGN : "minimal";

/* `touch` turns on Chromium's mobile emulation, which is what makes
   `(pointer: coarse)` match. Without it a 375px-wide context still reports a
   fine pointer, and the mobile shot would show the desktop control sizes at
   a phone's width: the one thing that shot exists to show. */
const VIEWPORTS = {
  mobile: { width: 375, height: 812, deviceScaleFactor: 2, touch: true },
  desktop: { width: 1280, height: 800, deviceScaleFactor: 1, touch: false },
};

/* Seed function: language preference only. Used by the welcome shot, where
   no project is seeded so the welcome modal still triggers; the language
   preference is read before the modal renders so the labels appear in the
   right language. The function body runs inside the browser realm; `args`
   carries the language code from Node. */
function seedLangOnly(args) {
  // eslint-disable-next-line no-undef -- runs inside the browser page
  localStorage.setItem("mobil_kontrol_lang_v1", args.lang);
  // eslint-disable-next-line no-undef
  localStorage.setItem("mobil_kontrol_design_v1", args.design);
}

/* Seed function: a single Demo project plus consistent language / style /
   theme preferences, so the welcome modal does NOT trigger and the list
   renders deterministically for shots 02 / 03 / 04. */
function seedActiveProject(args) {
  /* Shape must match js/04-projects.js: { version, activeId, projects: [] }.
     An earlier version of this seed used `active` / `list`, which the store
     rejected as unparseable, so every shot was taken with no active project
     and the hero pill read as empty. */
  const projectsStore = {
    version: 1,
    activeId: "proj_demo",
    projects: [
      {
        id: "proj_demo",
        name: "Demo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        data: {
          framework: "flutter",
          backend: "firebase",
          state: {},
          notes: {},
          collapsed: [],
          celebrations: {},
          viewMode: "both",
          viewFilter: "all",
          lockState: false,
          collapseInit: false,
        },
      },
    ],
  };
  // eslint-disable-next-line no-undef -- runs inside the browser page
  localStorage.setItem("mobil_kontrol_projects_v2", JSON.stringify(projectsStore));
  // eslint-disable-next-line no-undef
  localStorage.setItem("mobil_kontrol_lang_v1", args.lang);
  // eslint-disable-next-line no-undef
  localStorage.setItem("mobil_kontrol_style_v1", "technical");
  // eslint-disable-next-line no-undef
  localStorage.setItem("mobil_kontrol_mode_v1", "build");
  // eslint-disable-next-line no-undef
  localStorage.setItem("mobil_kontrol_theme_v1", "dark");
  /* Pinned explicitly: a shot must not silently change the day the
     default design changes. */
  // eslint-disable-next-line no-undef
  localStorage.setItem("mobil_kontrol_design_v1", args.design);
}

/* SHOTS factory: closes over `lang` only to populate seedArgs; the seed
   function itself receives lang via its argument so Playwright can
   serialize it cleanly. */
const makeShots = (lang) => [
  {
    name: "01-welcome",
    viewport: "mobile",
    fullPage: false,
    seedStorage: seedLangOnly,
    seedArgs: { lang, design: MAIN_DESIGN },
    prepare: async (page) => {
      await page.waitForSelector("#welcomeModal", { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(300);
    },
  },
  {
    name: "02-checklist",
    viewport: "desktop",
    fullPage: false,
    seedStorage: seedActiveProject,
    seedArgs: { lang, design: MAIN_DESIGN },
    prepare: async (page) => {
      await page.waitForTimeout(500);
      await dismissWelcomeModal(page);
      await page.waitForSelector(".feature, .category", { timeout: 5000 }).catch(() => {});
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
    },
  },
  {
    name: "03-card-flip",
    viewport: "desktop",
    fullPage: false,
    seedStorage: seedActiveProject,
    seedArgs: { lang, design: MAIN_DESIGN },
    prepare: async (page) => {
      await page.waitForTimeout(500);
      await dismissWelcomeModal(page);
      await page.waitForSelector("[data-flip-toggle]", { timeout: 5000 }).catch(() => {});
      /* Categories start collapsed, so the flip button exists in the DOM
         but is inside a zero-height container: clicking it produced a shot
         identical to 02-checklist. Expand the first category first, then
         flip its first card. */
      await page.evaluate(() => {
        const cat = document.querySelector("section.category");
        if (cat) cat.classList.remove("collapsed");
      });
      await page.waitForTimeout(300);
      await page.evaluate(() => {
        const btn = document.querySelector("section.category [data-flip-toggle]");
        if (!btn) return;
        const card = btn.closest(".feature") || btn;
        card.scrollIntoView({ behavior: "instant", block: "center" });
        btn.click();
      });
      await page.waitForTimeout(900);
    },
  },
  {
    name: "04-help",
    viewport: "desktop",
    fullPage: false,
    seedStorage: seedActiveProject,
    seedArgs: { lang, design: MAIN_DESIGN },
    prepare: async (page) => {
      await page.waitForTimeout(500);
      await dismissWelcomeModal(page);
      await page.waitForSelector("#helpBtn", { timeout: 5000 }).catch(() => {});
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.evaluate(() => {
        const btn = document.getElementById("helpBtn");
        if (btn) btn.click();
      });
      await page
        .waitForFunction(
          () => {
            const m = document.getElementById("helpModal");
            return m && !m.hidden && m.offsetParent !== null;
          },
          { timeout: 5000 }
        )
        .catch(() => {});
      await page.waitForTimeout(400);
    },
  },
  {
    /* The picker itself: the one screen that explains the axis. */
    name: "05-theme-picker",
    viewport: "desktop",
    fullPage: false,
    seedStorage: seedActiveProject,
    seedArgs: { lang, design: MAIN_DESIGN },
    prepare: async (page) => {
      await page.waitForTimeout(500);
      await dismissWelcomeModal(page);
      await page.evaluate(() => window.scrollTo(0, 0));
      /* The toolbar collapses behind a menu button on narrow viewports;
         click it first if it is visible, then open the picker. */
      await page.evaluate(() => {
        const toggle = document.getElementById("actionsToggle");
        if (toggle && toggle.offsetParent !== null) toggle.click();
        const btn = document.getElementById("designToggle");
        if (btn) btn.click();
      });
      await page.waitForTimeout(500);
    },
  },
  {
    name: "06-theme-classic",
    viewport: "desktop",
    fullPage: false,
    seedStorage: seedActiveProject,
    seedArgs: { lang, design: "classic" },
    prepare: async (page) => {
      await page.waitForTimeout(500);
      await dismissWelcomeModal(page);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
    },
  },
  {
    name: "07-theme-showcase",
    viewport: "desktop",
    fullPage: false,
    seedStorage: seedActiveProject,
    seedArgs: { lang, design: "showcase" },
    prepare: async (page) => {
      await page.waitForTimeout(500);
      await dismissWelcomeModal(page);
      await page.evaluate(() => window.scrollTo(0, 0));
      /* Showcase reveals sections on scroll and draws its gauges over
         about a second; wait for both to settle before shooting. */
      await page.waitForTimeout(1400);
    },
  },
];

/* The welcome modal toggles its `hidden` attribute rather than removing
   itself; flipping the attribute is enough to make it disappear without
   triggering any of the step-validation flows. Used by shots 02 / 03 /
   04 as a safety net in case migration paths re-open it. */
async function dismissWelcomeModal(page) {
  await page.evaluate(() => {
    const m = document.getElementById("welcomeModal");
    if (m && !m.hidden) m.hidden = true;
  });
}

async function captureLanguage(browser, lang) {
  const outDir = resolve(screenshotsRoot, lang);
  await mkdir(outDir, { recursive: true });
  const shots = makeShots(lang);

  for (const shot of shots) {
    const vp = VIEWPORTS[shot.viewport] || VIEWPORTS.desktop;
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.deviceScaleFactor,
      isMobile: vp.touch,
      hasTouch: vp.touch,
    });
    const page = await context.newPage();

    const shotDesign = (shot.seedArgs && shot.seedArgs.design) || MAIN_DESIGN;
    console.log(
      `[capture:${lang}] ${shot.name} (${shot.viewport}) ${vp.width}x${vp.height} design=${shotDesign}`
    );
    /* Visit once to establish the origin, then seed (or clear)
       localStorage, then reload so the app picks up the seeded state on
       its own startup. */
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    if (shot.seedStorage) {
      await page.evaluate(shot.seedStorage, shot.seedArgs);
    } else {
      await page.evaluate(() => {
        try {
          localStorage.clear();
        } catch (_) {
          /* ignore */
        }
      });
    }
    await page.reload({ waitUntil: "networkidle" });

    try {
      await shot.prepare(page);
    } catch (err) {
      console.warn(`[capture:${lang}] prepare step failed for ${shot.name}:`, err.message);
    }

    const outPath = resolve(outDir, `${shot.name}.png`);
    /* Always shoot the viewport (not the full scrollable page) so the
       resulting PNG is readable inline in the README and on social
       cards. Each shot's prepare() positions the page so the relevant
       UI is already inside the viewport. */
    await page.screenshot({ path: outPath, fullPage: shot.fullPage === true });
    console.log(`[capture:${lang}] wrote ${outPath}`);

    await context.close();
  }
}

async function main() {
  const browser = await chromium.launch();
  try {
    for (const lang of LANGS) {
      await captureLanguage(browser, lang);
    }
  } finally {
    await browser.close();
  }

  console.log("[capture] done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
