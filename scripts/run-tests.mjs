#!/usr/bin/env node
/**
 * scripts/run-tests.mjs
 *
 * Portable wrapper around `node --test` that auto-discovers .test.js and
 * .test.mjs files under tests/ and passes them as explicit paths.
 *
 * Why this exists:
 *   - Node 22+ supports glob patterns in --test args, Node 20 does not.
 *   - Node 24 rejects bare directory paths as module specifiers.
 *   - The portable common ground is passing explicit file paths, which
 *     works on every Node version that supports the test runner (>= 18).
 *
 * Exits 0 when there are no tests (CI must not fail on an empty suite).
 */
import { readdirSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const TESTS_DIR = "tests";

if (!existsSync(TESTS_DIR)) {
  console.log(`[run-tests] No ${TESTS_DIR}/ directory found; nothing to test.`);
  process.exit(0);
}

const files = readdirSync(TESTS_DIR)
  .filter(f => f.endsWith(".test.js") || f.endsWith(".test.mjs"))
  .map(f => join(TESTS_DIR, f));

if (files.length === 0) {
  console.log("[run-tests] No .test.js or .test.mjs files found; nothing to test.");
  process.exit(0);
}

const result = spawnSync("node", ["--test", ...files], { stdio: "inherit" });
process.exit(result.status ?? 1);
