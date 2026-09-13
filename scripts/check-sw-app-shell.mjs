#!/usr/bin/env node
/**
 * scripts/check-sw-app-shell.mjs
 *
 * Enforces that the APP_SHELL list in `sw.js` is exactly the set of files
 * the page needs in order to open: the page itself (`./`), every local
 * stylesheet, script, icon and manifest that `index.html` references (in
 * document order), and the icons `manifest.webmanifest` declares.
 *
 * Why the list is generated rather than written by hand: the Service Worker
 * stores these files while it installs, which is what lets a first visit
 * work offline. Both ways of drifting are silent in a browser:
 *
 *   - A file index.html loads but APP_SHELL omits still works online and is
 *     simply missing offline, which nobody notices until they are offline.
 *   - A file APP_SHELL lists but that no longer exists makes `cache.addAll`
 *     reject, and then the worker never installs at all: no offline, no
 *     cache, and no error anywhere a reader would see it.
 *
 * Exit codes:
 *   0   sw.js matches
 *   1   mismatch, a referenced file missing on disk, or a file cannot be parsed
 *
 * Usage:
 *   node scripts/check-sw-app-shell.mjs            # check only
 *   node scripts/check-sw-app-shell.mjs --fix      # rewrite the list in sw.js
 *
 * Wired into:
 *   - `.githooks/pre-commit` (mirrors CI gate locally)
 *   - `.github/workflows/ci.yml` (job: sw-cache-check)
 *   - `package.json` scripts: `sw:check` and `sw:sync`
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";

const SW_PATH = "sw.js";
const HTML_PATH = "index.html";
const MANIFEST_PATH = "manifest.webmanifest";
const TAG = "[check-sw-app-shell]";

/* `<link>` relations that make the browser fetch the target for this page.
   `canonical`, `alternate` and friends name a URL without loading it. */
const LOADED_LINK_RELS = new Set(["stylesheet", "icon", "apple-touch-icon", "manifest"]);

/* The list is matched from its declaration to the closing bracket on a line
   of its own, so the comment above it can say anything. */
const APP_SHELL_RE = /(const\s+APP_SHELL\s*=\s*\[)([\s\S]*?)(\r?\n\];)/;

function fail(message) {
  console.error(`${TAG} ${message}`);
  process.exit(1);
}

function read(path) {
  try {
    return readFileSync(path, "utf8");
  } catch (err) {
    return fail(`Cannot read ${path}: ${err.message}`);
  }
}

function attribute(tag, name) {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"));
  return m ? (m[2] ?? m[3]) : null;
}

/* Absolute (`https:`, `data:`) and protocol-relative URLs are not part of
   the shell; a leading `./` is dropped so each file has one spelling. */
function localPath(url) {
  if (!url || /^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url)) return null;
  return url.replace(/^\.\//, "").split("#")[0];
}

function fromHtml(html) {
  const body = html.replace(/<!--[\s\S]*?-->/g, "");
  const files = [];
  for (const m of body.matchAll(/<(link|script)\b[^>]*>/gi)) {
    const tag = m[0];
    let url = null;
    if (m[1].toLowerCase() === "script") {
      url = attribute(tag, "src");
    } else {
      const rels = (attribute(tag, "rel") || "").toLowerCase().split(/\s+/);
      if (rels.some(rel => LOADED_LINK_RELS.has(rel))) url = attribute(tag, "href");
    }
    const file = localPath(url);
    if (file) files.push(file);
  }
  return files;
}

function fromManifest(raw) {
  let manifest;
  try {
    manifest = JSON.parse(raw);
  } catch (err) {
    return fail(`${MANIFEST_PATH} is not valid JSON: ${err.message}`);
  }
  return (manifest.icons || []).map(icon => localPath(icon.src)).filter(Boolean);
}

function expectedShell() {
  const ordered = ["./", ...fromHtml(read(HTML_PATH)), ...fromManifest(read(MANIFEST_PATH))];
  return [...new Set(ordered)];
}

function currentShell(sw) {
  const match = sw.match(APP_SHELL_RE);
  if (!match) {
    return fail(`No \`const APP_SHELL = [ ... ];\` list found in ${SW_PATH} (the closing \`];\` must start a line).`);
  }
  const entries = [...match[2].matchAll(/'([^']*)'|"([^"]*)"/g)].map(m => m[1] ?? m[2]);
  return { match, entries };
}

function render(entries, eol) {
  return entries.map((entry, i) => `  '${entry}'${i < entries.length - 1 ? "," : ""}`).join(eol);
}

const expected = expectedShell();

const missingOnDisk = expected.filter(file => !existsSync(file === "./" ? HTML_PATH : file));
if (missingOnDisk.length) {
  fail(
    `index.html or ${MANIFEST_PATH} references files that do not exist:\n` +
      missingOnDisk.map(file => `  ${file}`).join("\n") +
      "\nThe worker would fail to install. Fix the reference, then run `npm run sw:sync`."
  );
}

const sw = read(SW_PATH);
const { match, entries } = currentShell(sw);

if (JSON.stringify(entries) === JSON.stringify(expected)) {
  console.log(`${TAG} sw.js APP_SHELL lists the ${expected.length} files index.html and the manifest reference.`);
  process.exit(0);
}

if (process.argv.includes("--fix")) {
  const eol = sw.includes("\r\n") ? "\r\n" : "\n";
  const next = sw.replace(APP_SHELL_RE, (_, open, _body, close) => `${open}${eol}${render(expected, eol)}${close}`);
  writeFileSync(SW_PATH, next);
  console.log(`${TAG} Rewrote APP_SHELL in sw.js: ${entries.length} -> ${expected.length} entries.`);
  process.exit(0);
}

const missing = expected.filter(file => !entries.includes(file));
const extra = entries.filter(file => !expected.includes(file));
console.error(`${TAG} sw.js APP_SHELL does not match index.html and ${MANIFEST_PATH}:`);
for (const file of missing) console.error(`  missing: ${file}`);
for (const file of extra) console.error(`  not referenced any more: ${file}`);
if (!missing.length && !extra.length) console.error("  same files, different order");
console.error("");
console.error("Run `npm run sw:sync` (or `node scripts/check-sw-app-shell.mjs --fix`) to rewrite the list in place.");
process.exit(1);
