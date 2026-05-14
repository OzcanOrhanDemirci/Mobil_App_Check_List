#!/usr/bin/env node
/**
 * scripts/capture-screenshots.mjs
 *
 * Captures README screenshots from a running local server using Playwright.
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
 *   2. Run this script (override URL via BASE_URL env var if needed):
 *        BASE_URL=http://localhost:5500 node scripts/capture-screenshots.mjs
 *
 * Output:
 *   assets/screenshots/01-welcome.png       mobile, viewport-sized
 *   assets/screenshots/02-checklist.png     desktop, viewport-sized
 *   assets/screenshots/03-card-flip.png     desktop, viewport-sized
 *   assets/screenshots/04-help.png          desktop, viewport-sized (modal open)
 *
 * Each shot captures the visible viewport (fullPage: false). The prepare()
 * step for each shot positions the relevant UI inside the viewport before
 * the screenshot fires, so the resulting PNG is readable inline.
 *
 * The generated PNGs overwrite the previously committed copies under
 * assets/screenshots/, which the READMEs reference directly.
 */

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const outDir = resolve(repoRoot, 'assets', 'screenshots');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const VIEWPORTS = {
  mobile: { width: 375, height: 812, deviceScaleFactor: 2 },
  desktop: { width: 1280, height: 800, deviceScaleFactor: 1 },
};

/**
 * Each shot describes one capture. `seedStorage` runs BEFORE the first load
 * to seed localStorage (used to skip the welcome flow for shots 02/03/04).
 * `prepare` runs AFTER the reload, just before the screenshot.
 *
 * Selectors target the live app (see index.html and js/*.js). If markup
 * changes, update here. Missing elements only warn, never throw.
 */
const seedActiveProject = () => {
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
  localStorage.setItem("mobil_kontrol_projects_v2", JSON.stringify(projectsStore));
  localStorage.setItem("mobil_kontrol_lang_v1", "tr");
  localStorage.setItem("mobil_kontrol_style_v1", "technical");
  localStorage.setItem("mobil_kontrol_mode_v1", "build");
  localStorage.setItem("mobil_kontrol_theme_v1", "dark");
};

const SHOTS = [
  {
    name: "01-welcome",
    viewport: "mobile",
    fullPage: false,
    seedStorage: null, // empty storage triggers the first-run welcome modal
    prepare: async page => {
      // Welcome modal is the entire visible surface on first launch; just
      // let it animate in.
      await page.waitForSelector("#welcomeModal", { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(300);
    },
  },
  {
    name: "02-checklist",
    viewport: "desktop",
    fullPage: false,
    seedStorage: seedActiveProject,
    prepare: async page => {
      // The welcome modal is opened from a 350 ms setTimeout in
      // showWelcomeIfFirstVisit(); wait long enough that the timer has
      // fired, then dismiss it. Seeded state means we should not see it,
      // but the migration path can re-trigger it; this is defensive.
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
    prepare: async page => {
      await page.waitForTimeout(500);
      await dismissWelcomeModal(page);
      await page.waitForSelector("[data-flip-toggle]", { timeout: 5000 }).catch(() => {});
      // Find the first flippable card, scroll it into view, then flip it.
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
    prepare: async page => {
      await page.waitForTimeout(500);
      await dismissWelcomeModal(page);
      await page.waitForSelector("#helpBtn", { timeout: 5000 }).catch(() => {});
      // Scroll back to the top so the modal opens over the hero rather than
      // an arbitrary mid-page scroll position.
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.evaluate(() => {
        const btn = document.getElementById("helpBtn");
        if (btn) btn.click();
      });
      // Wait for the modal to actually become visible (it toggles a hidden
      // attribute rather than removing the element from the DOM).
      await page.waitForFunction(
        () => {
          const m = document.getElementById("helpModal");
          return m && !m.hidden && m.offsetParent !== null;
        },
        { timeout: 5000 }
      ).catch(() => {});
      await page.waitForTimeout(400);
    },
  },
];

/* Ensures the welcome modal is dismissed before downstream interaction. The
   modal toggles its `hidden` attribute rather than removing itself; flipping
   the attribute is enough to make it disappear without triggering any of the
   step-validation flows. */
async function dismissWelcomeModal(page) {
  await page.evaluate(() => {
    const m = document.getElementById("welcomeModal");
    if (m && !m.hidden) m.hidden = true;
  });
}

async function main() {
  await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch();
  try {
    for (const shot of SHOTS) {
      const vp = VIEWPORTS[shot.viewport] || VIEWPORTS.desktop;
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: vp.deviceScaleFactor,
      });
      const page = await context.newPage();

      console.log(`[capture] ${shot.name} (${shot.viewport}) ${vp.width}x${vp.height}`);
      // Visit once to establish the origin, then seed (or clear) localStorage,
      // then reload so the app picks up the seeded state on its own startup.
      await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
      if (shot.seedStorage) {
        await page.evaluate(shot.seedStorage);
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
        console.warn(`[capture] prepare step failed for ${shot.name}:`, err.message);
      }

      const outPath = resolve(outDir, `${shot.name}.png`);
      // Always shoot the viewport (not the full scrollable page) so the
      // resulting PNG is readable inline in the README and on social cards.
      // Each shot's prepare() positions the page so the relevant UI is
      // already inside the viewport.
      await page.screenshot({ path: outPath, fullPage: shot.fullPage === true });
      console.log(`[capture] wrote ${outPath}`);

      await context.close();
    }
  } finally {
    await browser.close();
  }

  console.log('[capture] done. Remember to update README image links from .svg to .png if needed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
