/* Tests for the responsive layer: the breakpoint scale, the touch-target
   block, and the mobile viewport units.

   None of this can be asserted by rendering, because there is no browser
   here. What can be asserted is the shape of the source, and these three
   claims are exactly the kind that rot quietly:

     1. The breakpoint scale. README and css/06-responsive-print.css both
        state that every sheet uses the same five widths. Before 1.3.1 there
        was one screen breakpoint in the responsive sheet and nine ad-hoc
        widths scattered through the others, which is how a 320px screen
        ended up with a layout drawn for a 700px one. The scale is only worth
        stating if adding a tenth width fails something.

     2. The touch-target block is scoped to `screen`. `pointer: coarse` does
        not stop matching when a phone prints, so an unscoped block puts 44px
        rows and 16px inputs onto paper, where nothing is tapped. That is
        invisible on screen and only shows up in a printed page nobody looks
        at until a reader complains.

     3. Every viewport-height declaration has a `dvh` companion. `100vh` is
        the viewport a mobile browser reports with its address bar hidden,
        which is not the viewport the reader has while the bar is showing;
        the pattern is a `vh` line for old engines followed by a `dvh` line
        for the rest. Writing only the first is the easy mistake, and the
        result is a dialog whose buttons sit below the bottom of the screen.

   The behavioural half (what the layout actually does at 320px, whether a
   control is reachable by a finger) needs a real browser and is exercised by
   the Playwright pass documented in .github/CONTRIBUTING.md, not here. */

"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const REPO_ROOT = path.resolve(__dirname, "..");
const CSS_DIR = path.join(REPO_ROOT, "css");

const read = rel => fs.readFileSync(path.join(REPO_ROOT, rel), "utf8");
const cssFiles = () =>
  fs
    .readdirSync(CSS_DIR)
    .filter(f => f.endsWith(".css"))
    .sort();

/* Comments name widths in prose ("the 700px tier"), so they are stripped
   before anything is matched. */
const withoutComments = css => css.replace(/\/\*[\s\S]*?\*\//g, "");

/* The scale, as documented at the head of css/06-responsive-print.css. */
const SCALE = [900, 700, 560, 430, 360];

/* Three widths are deliberately off the scale. Each is tied to a specific
   element's own width rather than to a class of device, so folding them into
   the scale would say something about phones that is not true. Listing them
   here rather than widening the scale keeps every exception visible, with
   the reason attached: a fourth entry should have to be argued for. */
const EXCEPTIONS = new Map([
  [720, "css/05-modals-welcome.css: the theme step's dialog is 720px wide, so its fallback is tied to that width"],
  [1140, "css/07-design-minimal.css: the width at which the category index becomes a fixed rail in the page gutter"],
  [1320, "css/08-design-showcase.css: the width at which the chapter rail has room to sit beside the content"],
]);

describe("Responsive: the breakpoint scale", () => {
  it("is used by every stylesheet, with no ad-hoc widths", () => {
    const offenders = [];
    for (const file of cssFiles()) {
      const body = withoutComments(read(path.join("css", file)));
      for (const m of body.matchAll(/\((?:min|max)-width:\s*(\d+)px\)/g)) {
        const px = Number(m[1]);
        if (SCALE.includes(px) || EXCEPTIONS.has(px)) continue;
        offenders.push(`css/${file}: ${px}px`);
      }
    }
    assert.deepEqual(
      offenders,
      [],
      `Width media queries outside the documented scale [${SCALE.join(", ")}].\n` +
        `Use the nearest tier, or add the width to EXCEPTIONS here with the reason.\n` +
        offenders.join("\n")
    );
  });

  it("documents the scale where a reader will look for it", () => {
    const sheet = read("css/06-responsive-print.css");
    for (const px of SCALE) {
      assert.match(
        sheet,
        new RegExp(`^\\s{7}${px}px\\s{3}\\S`, "m"),
        `The tier table at the head of css/06-responsive-print.css does not describe ${px}px`
      );
    }
  });

  it("keeps every exception accounted for", () => {
    for (const [px, why] of EXCEPTIONS) {
      const used = cssFiles().some(f => withoutComments(read(path.join("css", f))).includes(`-width: ${px}px)`));
      assert.ok(used, `EXCEPTIONS lists ${px}px (${why}) but no stylesheet uses it any more; drop the entry`);
    }
  });
});

describe("Responsive: touch targets", () => {
  const sheet = () => withoutComments(read("css/06-responsive-print.css"));

  it("live in a block scoped to screen, so a printed page does not get them", () => {
    assert.match(
      sheet(),
      /@media\s+screen\s+and\s+\(pointer:\s*coarse\)/,
      "css/06-responsive-print.css must carry the touch-target block as `@media screen and (pointer: coarse)`"
    );
  });

  /* The guard can come from the block itself or from an enclosing one: the
     two design sheets put their whole contents inside `@media screen`, which
     design.test.js enforces separately, so a coarse block nested in there is
     already covered. Reading the enclosing chain rather than one prelude is
     the difference between a rule and a lint that has to be argued with. */
  const coarseBlocksWithoutScreenGuard = css => {
    const body = withoutComments(css);
    const bad = [];
    const stack = [];
    let i = 0;
    while (i < body.length) {
      const open = body.indexOf("{", i);
      const close = body.indexOf("}", i);
      if (open === -1 && close === -1) break;
      if (open !== -1 && (close === -1 || open < close)) {
        const prelude = body.slice(i, open).trim().split("\n").pop().trim();
        stack.push(prelude);
        if (/\(pointer:\s*coarse\)/.test(prelude) && !stack.some(p => /@media[^{]*\bscreen\b/.test(p))) {
          bad.push(prelude);
        }
        i = open + 1;
      } else {
        stack.pop();
        i = close + 1;
      }
    }
    return bad;
  };

  it("are never declared for a coarse pointer without the screen guard", () => {
    const offenders = [];
    for (const file of cssFiles()) {
      for (const prelude of coarseBlocksWithoutScreenGuard(read(path.join("css", file)))) {
        offenders.push(`css/${file}: ${prelude}`);
      }
    }
    assert.deepEqual(
      offenders,
      [],
      "A coarse-pointer block needs `screen` on it or on a block around it; `pointer` keeps " +
        "matching when a phone prints.\n" +
        offenders.join("\n")
    );
  });

  it("set 16px on text fields, which is what stops Safari zooming the page in", () => {
    assert.match(
      sheet(),
      /input\[type="text"\][\s\S]{0,200}font-size:\s*16px/,
      "The coarse-pointer block must raise text fields to 16px"
    );
  });
});

describe("Responsive: viewport units", () => {
  it("pair every vh height with a dvh line", () => {
    const offenders = [];
    for (const file of cssFiles()) {
      const lines = withoutComments(read(path.join("css", file))).split("\n");
      lines.forEach((line, i) => {
        const m = /^(\s*)(min-height|max-height|height):\s*([\d.]+)vh;/.exec(line);
        if (!m) return;
        const [, , prop, value] = m;
        const next = lines[i + 1] || "";
        const wanted = new RegExp(`^\\s*${prop}:\\s*${value.replace(".", "\\.")}dvh;`);
        if (!wanted.test(next)) {
          offenders.push(`css/${file}:${i + 1}  ${line.trim()}  (no ${prop}: ${value}dvh on the next line)`);
        }
      });
    }
    assert.deepEqual(
      offenders,
      [],
      "A vh height needs a dvh line straight after it, or the box is taller than the screen " +
        "for as long as a mobile browser is showing its address bar.\n" +
        offenders.join("\n")
    );
  });
});

describe("Service Worker: the caching strategy", () => {
  const sw = () => read("sw.js");

  it("serves navigations network-first, so a release is picked up", () => {
    assert.match(sw(), /request\.mode\s*===\s*['"]navigate['"]/, "sw.js must branch on a navigation request");
    assert.match(sw(), /function\s+networkFirst\s*\(/, "sw.js must define networkFirst");
    assert.match(sw(), /NAVIGATION_TIMEOUT_MS/, "the navigation path must give way to the cache after a timeout");
  });

  it("serves everything else from the cache, revalidating behind it", () => {
    assert.match(sw(), /function\s+staleWhileRevalidate\s*\(/, "sw.js must define staleWhileRevalidate");
    assert.match(
      sw(),
      /respondWith\(staleWhileRevalidate\(request\)\)/,
      "non-navigation requests must take the stale-while-revalidate path"
    );
  });

  it("never stores a partial response as if it were the whole resource", () => {
    assert.match(sw(), /headers\.has\(['"]range['"]\)/, "sw.js must pass range requests straight through");
  });

  it("is paired with a page that reloads once when a new worker takes over", () => {
    const app = read("js/18-app.js");
    assert.match(app, /addEventListener\(\s*["']controllerchange["']/, "js/18-app.js must listen for controllerchange");
    assert.match(app, /hadController/, "the reload must be guarded so it does not fire on a first visit");
    assert.match(app, /location\.reload\(\)/, "the guard must end in a reload");
  });
});
