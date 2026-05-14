#!/usr/bin/env node
/**
 * scripts/check-em-dash.mjs
 *
 * Enforces the project rule: em-dash characters (U+2014, "—") must not appear
 * in user-facing strings or in user-readable comments. Replace with commas,
 * colons, semicolons, parentheses, or hyphens ("-").
 *
 * The single exception is the standalone placeholder string, written as
 * exactly `"—"` or `'—'`, which is used in `js/03-data.js` to mark a feature
 * cell that intentionally has no content (the resolver returns it verbatim
 * and the UI renders a single em-dash glyph). This is a sentinel value, not
 * prose, so it is allowed.
 *
 * Targets (user-facing surfaces):
 *   - js/01-i18n-strings.js   UI strings dictionary
 *   - js/02-help-content.js   Help modal HTML strings
 *   - js/03-data.js           14 categories, 55 items, all variants
 *   - index.html              Page chrome, modal titles, visible labels
 *
 * Comments inside these files are inspected too, on the principle that anyone
 * reading the source (issue reporters, contributors, AI assistants browsing
 * for context) is also a reader. The internal "code comment is not user-
 * facing" carve-out is intentionally narrow: it does not apply to the four
 * files above, only to behavioural / orchestration modules.
 *
 * Exit codes:
 *   0   no prose em-dash found
 *   1   one or more prose em-dashes found (details printed)
 *
 * Usage:
 *   node scripts/check-em-dash.mjs
 */

import { readFileSync, readdirSync } from "node:fs";

/* The data file was split into 14 per-category files in 1.1.0; pick up
   all `js/03*-data*.js` files plus the combiner stub `js/03-data.js`
   dynamically so the target list stays correct even when a category is
   added or renamed. Other targets (i18n strings, help, HTML) are fixed. */
const dataTargets = readdirSync("js")
  .filter((f) => /^03[a-z]?-data.*\.js$/.test(f))
  .sort()
  .map((f) => `js/${f}`);

const TARGETS = [
  "js/01-i18n-strings.js",
  "js/02-help-content.js",
  ...dataTargets,
  "index.html",
];

const EM_DASH = "—";

/**
 * Strip the standalone placeholder strings `"—"`, `'—'`, and `` `—` `` from a
 * line. After stripping, any remaining em-dash is by definition prose-style.
 *
 * The placeholder is exactly one em-dash between matching quotes, with
 * nothing else inside the quotes. Backticks are included for completeness
 * even though the data file does not currently use template literals.
 */
function stripPlaceholders(line) {
  return line
    .replace(/"—"/g, "")
    .replace(/'—'/g, "")
    .replace(/`—`/g, "");
}

let totalViolations = 0;
const violationsByFile = {};

for (const file of TARGETS) {
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch (err) {
    console.error(`[check-em-dash] Cannot read ${file}: ${err.message}`);
    process.exitCode = 1;
    continue;
  }

  const lines = content.split("\n");
  const hits = [];

  lines.forEach((line, idx) => {
    if (!line.includes(EM_DASH)) return;
    const stripped = stripPlaceholders(line);
    if (!stripped.includes(EM_DASH)) return;
    hits.push({ lineNumber: idx + 1, text: line.trim().slice(0, 200) });
  });

  if (hits.length > 0) {
    violationsByFile[file] = hits;
    totalViolations += hits.length;
  }
}

if (totalViolations === 0) {
  console.log("[check-em-dash] No prose em-dash found in user-facing files.");
  process.exit(0);
}

console.error(`[check-em-dash] Found ${totalViolations} prose em-dash occurrence(s):\n`);
for (const [file, hits] of Object.entries(violationsByFile)) {
  console.error(`  ${file}`);
  for (const { lineNumber, text } of hits) {
    console.error(`    ${file}:${lineNumber}  ${text}`);
  }
  console.error("");
}
console.error("Replace each em-dash with a comma, colon, semicolon, parenthesis, or hyphen (-).");
console.error("The standalone placeholder \"—\" is allowed in data files for empty cells.");
process.exit(1);
