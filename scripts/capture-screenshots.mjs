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
 *      language via SHOT_LANG):
 *        BASE_URL=http://localhost:5500 node scripts/capture-screenshots.mjs
 *        SHOT_LANG=en node scripts/capture-screenshots.mjs
 *
 * Output:
 *   assets/screenshots/{tr,en}/01-welcome.png       mobile, viewport-sized
 *   assets/screenshots/{tr,en}/02-checklist.png     desktop, viewport-sized
 *   assets/screenshots/{tr,en}/03-card-flip.png     desktop, viewport-sized
 *   assets/screenshots/{tr,en}/04-help.png          desktop, viewport-sized
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

const VIEWPORTS = {
  mobile: { width: 375, height: 812, deviceScaleFactor: 2 },
  desktop: { width: 1280, height: 800, deviceScaleFactor: 1 },
};

/* Seed function: language preference only. Used by the welcome shot, where
   no project is seeded so the welcome modal still triggers; the language
   preference is read before the modal renders so the labels appear in the
   right language. The function body runs inside the browser realm; `args`
   carries the language code from Node. */
function seedLangOnly(args) {
  // eslint-disable-next-line no-undef -- runs inside the browser page
  localStorage.setItem("mobil_kontrol_lang_v1", args.lang);
}

/* Seed function: a single Demo project plus consistent language / style /
   theme preferences, so the welcome modal does NOT trigger and the list
   renders deterministically for shots 02 / 03 / 04. */
function seedActiveProject(args) {
  const projectsStore = {
    active: "proj_demo",
    list: [
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
    seedArgs: { lang },
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
    seedArgs: { lang },
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
    seedArgs: { lang },
    prepare: async (page) => {
      await page.waitForTimeout(500);
      await dismissWelcomeModal(page);
      await page.waitForSelector("[data-flip-toggle]", { timeout: 5000 }).catch(() => {});
      await page.evaluate(() => {
        const btn = document.querySelector("[data-flip-toggle]");
        if (!btn) return;
        const card = btn.closest(".feature") || btn;
        card.scrollIntoView({ behavior: "instant", block: "center" });
        btn.click();
      });
      await page.waitForTimeout(700);
    },
  },
  {
    name: "04-help",
    viewport: "desktop",
    fullPage: false,
    seedStorage: seedActiveProject,
    seedArgs: { lang },
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
    });
    const page = await context.newPage();

    console.log(`[capture:${lang}] ${shot.name} (${shot.viewport}) ${vp.width}x${vp.height}`);
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
