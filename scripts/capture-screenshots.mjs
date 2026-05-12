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
 * Each shot describes one capture. `prepare` runs inside the page before
 * the screenshot is taken; it can click buttons, open modals, etc.
 *
 * Selectors target the live app (see index.html). If markup changes, update
 * here. The script tolerates missing elements and logs a warning instead
 * of throwing.
 */
const SHOTS = [
  {
    name: '01-welcome',
    viewport: 'mobile',
    prepare: async (page) => {
      // First-run welcome modal appears automatically if storage is empty.
      // We clear storage in the context to guarantee it.
    },
  },
  {
    name: '02-checklist',
    viewport: 'desktop',
    prepare: async (page) => {
      // Dismiss welcome if present, then wait for the main list.
      await page.evaluate(() => {
        const closeBtn = document.querySelector('#welcomeStart, [data-welcome-close]');
        if (closeBtn) closeBtn.click();
      });
      await page.waitForSelector('.cat-list, .category, main', { timeout: 5000 }).catch(() => {});
    },
  },
  {
    name: '03-card-flip',
    viewport: 'desktop',
    prepare: async (page) => {
      // Open the first checklist card detail (selector best-effort).
      await page.evaluate(() => {
        const card = document.querySelector('.item, .check-item, [data-item-id]');
        if (card) card.click();
      });
      await page.waitForTimeout(400);
    },
  },
  {
    name: '04-help',
    viewport: 'desktop',
    prepare: async (page) => {
      // Open the help modal via its button if available.
      await page.evaluate(() => {
        const helpBtn = document.querySelector('#helpBtn, [data-help], [aria-label*="Help"], [aria-label*="Yardım"]');
        if (helpBtn) helpBtn.click();
      });
      await page.waitForTimeout(400);
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
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await page.evaluate(() => {
        try { localStorage.clear(); } catch (_) { /* ignore */ }
      });
      await page.reload({ waitUntil: 'networkidle' });

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
