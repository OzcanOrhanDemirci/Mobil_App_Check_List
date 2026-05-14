#!/usr/bin/env node
/**
 * scripts/install-githooks.mjs
 *
 * Points the local Git repository at the project's pre-commit hook by
 * setting `core.hooksPath` to `.githooks`. Runs automatically after
 * `npm install` via the "prepare" script in package.json.
 *
 * Skips silently when:
 *   - not in a Git repository (e.g. tarball install)
 *   - the CI environment variable is set (no need to install hooks
 *     inside ephemeral CI runners)
 *   - the SKIP_GITHOOKS_INSTALL env var is set (escape hatch)
 *
 * Cross-platform: invokes `git` via execFileSync, no shell required.
 */

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");

function log(msg) {
  process.stdout.write(`[install-githooks] ${msg}\n`);
}

function skip(reason) {
  log(`skipped (${reason})`);
  process.exit(0);
}

if (process.env.CI) skip("CI environment");
if (process.env.SKIP_GITHOOKS_INSTALL) skip("SKIP_GITHOOKS_INSTALL set");
if (!existsSync(join(repoRoot, ".git"))) skip("not a Git working tree");
if (!existsSync(join(repoRoot, ".githooks", "pre-commit"))) {
  skip("no .githooks/pre-commit found");
}

try {
  execFileSync("git", ["config", "core.hooksPath", ".githooks"], {
    cwd: repoRoot,
    stdio: "ignore",
  });
  log("core.hooksPath set to .githooks");
} catch (err) {
  log(`could not set core.hooksPath: ${err.message}`);
  // Do not fail the install on hook configuration errors; the hook is
  // a developer convenience, not a hard requirement.
  process.exit(0);
}
