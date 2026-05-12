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
 *   assets/screenshots/01-welcome.png
 *   assets/screenshots/02-checklist.png
 *   assets/screenshots/03-card-flip.png
 *   assets/screenshots/04-help.png
 *
 * The generated PNG files override the placeholder SVGs referenced from the
 * READMEs. Update the README markdown image links from `.svg` to `.png`
 * after you have captured real shots, or keep the placeholders if you do
 * not want to ship binary assets yet.
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
    seedStorage: null, // empty storage triggers the first-run welcome modal
    prepare: async () => {},
  },
  {
    name: "02-checklist",
    viewport: "desktop",
    seedStorage: seedActiveProject,
    prepare: async page => {
      await page.waitForSelector(".feature, .category", { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(300);
    },
  },
  {
    name: "03-card-flip",
    viewport: "desktop",
    seedStorage: seedActiveProject,
    prepare: async page => {
      await page.waitForSelector("[data-flip-toggle]", { timeout: 5000 }).catch(() => {});
      // Flip the first card via its dedicated trigger.
      await page.evaluate(() => {
        const btn = document.querySelector("[data-flip-toggle]");
        if (btn) btn.click();
      });
      await page.waitForTimeout(700);
    },
  },
  {
    name: "04-help",
    viewport: "desktop",
    seedStorage: seedActiveProject,
    prepare: async page => {
      await page.waitForSelector("#helpBtn", { timeout: 5000 }).catch(() => {});
      await page.evaluate(() => {
        const btn = document.getElementById("helpBtn");
        if (btn) btn.click();
      });
      await page.waitForTimeout(500);
    },
  },
];

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
      await page.screenshot({ path: outPath, fullPage: shot.viewport === 'desktop' });
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
