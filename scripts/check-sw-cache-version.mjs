#!/usr/bin/env node
/**
 * scripts/check-sw-cache-version.mjs
 *
 * Enforces that the Service Worker cache key in `sw.js` matches the
 * current `version` field in `package.json`. The PWA cache key drives
 * client-side cache invalidation: when the key changes, every client
 * downloads fresh copies of the static assets on its next visit. Tying
 * the key to the package version means a release bump automatically
 * invalidates the old cache, with no separate "remember to bump sw.js"
 * step in the release process.
 *
 * Expected line in sw.js (single quotes, matching the historical style):
 *
 *   const CACHE_NAME = 'mobil-kontrol-v{version}';
 *
 * Exit codes:
 *   0   sw.js matches package.json
 *   1   mismatch (or sw.js cannot be parsed); details printed
 *
 * Usage:
 *   node scripts/check-sw-cache-version.mjs            # check only
 *   node scripts/check-sw-cache-version.mjs --fix      # rewrite sw.js
 *
 * Wired into:
 *   - `.githooks/pre-commit` (mirrors CI gate locally)
 *   - `.github/workflows/ci.yml` (job: sw-cache-check)
 *   - `package.json` scripts: `sw:check` and `sw:sync`
 */

import { readFileSync, writeFileSync } from "node:fs";

const PKG_PATH = "package.json";
const SW_PATH = "sw.js";
const PREFIX = "mobil-kontrol-v";

/* The CACHE_NAME assignment is matched anchored to the keyword and the
   variable name to avoid false matches against unrelated string
   literals. Both quote styles are accepted; the original style is
   preserved on --fix via the captured groups. */
const CACHE_NAME_RE = /(const\s+CACHE_NAME\s*=\s*['"])([^'"]+)(['"]\s*;)/;

function readPackageVersion() {
  let raw;
  try {
    raw = readFileSync(PKG_PATH, "utf8");
  } catch (err) {
    console.error(`[check-sw-cache-version] Cannot read ${PKG_PATH}: ${err.message}`);
    process.exit(1);
  }
  let pkg;
  try {
    pkg = JSON.parse(raw);
  } catch (err) {
    console.error(`[check-sw-cache-version] ${PKG_PATH} is not valid JSON: ${err.message}`);
    process.exit(1);
  }
  if (typeof pkg.version !== "string" || !pkg.version.trim()) {
    console.error(`[check-sw-cache-version] ${PKG_PATH} is missing a non-empty "version" field.`);
    process.exit(1);
  }
  return pkg.version.trim();
}

function readSw() {
  try {
    return readFileSync(SW_PATH, "utf8");
  } catch (err) {
    console.error(`[check-sw-cache-version] Cannot read ${SW_PATH}: ${err.message}`);
    process.exit(1);
  }
}

const version = readPackageVersion();
const expected = `${PREFIX}${version}`;
const sw = readSw();
const match = sw.match(CACHE_NAME_RE);

if (!match) {
  console.error(`[check-sw-cache-version] No \`const CACHE_NAME = "..."\` line found in ${SW_PATH}.`);
  console.error("Add or restore the assignment so this check can keep it aligned with package.json.");
  process.exit(1);
}

const actual = match[2];

if (actual === expected) {
  console.log(`[check-sw-cache-version] sw.js CACHE_NAME (${actual}) matches package.json version (${version}).`);
  process.exit(0);
}

const wantsFix = process.argv.includes("--fix");
if (wantsFix) {
  const next = sw.replace(CACHE_NAME_RE, `$1${expected}$3`);
  writeFileSync(SW_PATH, next);
  console.log(`[check-sw-cache-version] Rewrote CACHE_NAME: "${actual}" -> "${expected}".`);
  process.exit(0);
}

console.error(`[check-sw-cache-version] Mismatch detected:`);
console.error(`  sw.js CACHE_NAME : "${actual}"`);
console.error(`  package.json     : "${version}"  (expected CACHE_NAME "${expected}")`);
console.error("");
console.error("Run `npm run sw:sync` (or `node scripts/check-sw-cache-version.mjs --fix`) to rewrite sw.js in place.");
process.exit(1);
