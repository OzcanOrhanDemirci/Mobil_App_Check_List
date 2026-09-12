/* Tests for the design axis (js/19-design.js) and the invariants the three
   designs have to keep.

   Three things here are worth more than the unit coverage:

     1. DEFAULT_DESIGN is duplicated. js/00-bootstrap.js has to inline the
        same value because it runs before this module, so a change in one
        place and not the other would show up as a flash of the wrong
        design before the deferred script catches up. The test reads both
        files and asserts they agree.

     2. Every design rule must live inside `@media screen`. That is the
        mechanism behind the promise stated in the picker and the README:
        a printed checklist looks the same whichever design the author was
        looking at. A rule that escapes the block would break that
        silently, on paper, where nobody would notice.

     3. Each design id must actually be selected somewhere. A typo in a
        selector renders as "the design applied but nothing changed",
        which is easy to ship and hard to spot in review.

   The behavioral half of this surface (live switching, detach hygiene,
   reduced motion, the gauges matching the progress card) needs a real
   browser and is exercised by the Playwright pass documented in
   .github/CONTRIBUTING.md, not here. */

"use strict";

const { describe, it, before } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { loadAppContext } = require("./_setup.js");

const REPO_ROOT = path.resolve(__dirname, "..");
const read = rel => fs.readFileSync(path.join(REPO_ROOT, rel), "utf8");

const DESIGN_FILE = "js/19-design.js";
const BOOTSTRAP_FILE = "js/00-bootstrap.js";
const DESIGN_CSS = ["css/07-design-minimal.css", "css/08-design-showcase.css"];
const EXPECTED_DESIGNS = ["classic", "minimal", "showcase"];

/* Load js/19-design.js on top of the usual sandbox and return a handle that
   merges the sandbox with the module's own exports.

   The app is script-mode, so a top-level `const` lives in the realm's script
   lexical scope and is not a property of the global object, in the browser or
   here. js/19-design.js therefore publishes its surface on `window` on
   purpose (js/18-app.js and js/08-i18n-dom.js reach it the same way), and the
   tests read exactly that published surface rather than reaching into the
   realm. */
function loadDesign(seed) {
  const ctx = loadAppContext({ extraFiles: [DESIGN_FILE], localStorageSeed: seed });
  return {
    localStorage: ctx.localStorage,
    document: ctx.document,
    applyDesign: ctx.window.applyDesign,
    normalizeDesign: ctx.window.normalizeDesign,
    resolveInitialDesign: ctx.window.resolveInitialDesign,
    openDesignPicker: ctx.window.openDesignPicker,
    DEFAULT_DESIGN: ctx.window.DEFAULT_DESIGN,
    VALID_DESIGNS: ctx.window.VALID_DESIGNS,
  };
}

let ctx;
before(() => {
  ctx = loadDesign();
});

describe("Design axis constants", () => {
  it("declares exactly the three shipped designs", () => {
    /* Spread into a host-realm array first: the value comes from the vm
       realm, and deepStrictEqual compares prototypes as well as contents. */
    assert.deepEqual([...ctx.VALID_DESIGNS], EXPECTED_DESIGNS);
  });

  it("defaults to a design that is in the list", () => {
    assert.ok(EXPECTED_DESIGNS.includes(ctx.DEFAULT_DESIGN), `DEFAULT_DESIGN is ${ctx.DEFAULT_DESIGN}`);
  });

  it("agrees with the copy of DEFAULT_DESIGN inlined in js/00-bootstrap.js", () => {
    const boot = read(BOOTSTRAP_FILE);
    const m = /const DEFAULT_DESIGN = "([a-z]+)";/.exec(boot);
    assert.ok(m, "js/00-bootstrap.js no longer declares DEFAULT_DESIGN in the expected shape");
    assert.equal(
      m[1],
      ctx.DEFAULT_DESIGN,
      "js/00-bootstrap.js and js/19-design.js disagree on the default design; the page would paint one and then swap to the other"
    );
  });

  it("agrees with the list of designs js/00-bootstrap.js validates against", () => {
    const boot = read(BOOTSTRAP_FILE);
    const m = /const DESIGNS = \[([^\]]+)\];/.exec(boot);
    assert.ok(m, "js/00-bootstrap.js no longer declares DESIGNS in the expected shape");
    const bootDesigns = m[1]
      .split(",")
      .map(s => s.trim().replace(/^"|"$/g, ""))
      .filter(Boolean);
    assert.deepEqual(bootDesigns, [...ctx.VALID_DESIGNS]);
  });
});

describe("normalizeDesign", () => {
  for (const d of EXPECTED_DESIGNS) {
    it(`accepts "${d}"`, () => {
      assert.equal(ctx.normalizeDesign(d), d);
    });
  }

  const rejected = [
    ["an unknown id", "neon"],
    ["a near miss", "minimalist"],
    ["different casing", "Minimal"],
    ["surrounding whitespace", " minimal "],
    ["an empty string", ""],
    ["null", null],
    ["undefined", undefined],
    ["a number", 3],
    ["an object", { design: "minimal" }],
  ];
  for (const [label, value] of rejected) {
    it(`rejects ${label}`, () => {
      assert.equal(ctx.normalizeDesign(value), null);
    });
  }
});

describe("resolveInitialDesign", () => {
  it("returns the default when nothing is stored", () => {
    const c = loadDesign();
    assert.equal(c.resolveInitialDesign(), c.DEFAULT_DESIGN);
  });

  for (const d of EXPECTED_DESIGNS) {
    it(`honors a stored choice of "${d}"`, () => {
      const c = loadDesign({ mobil_kontrol_design_v1: d });
      assert.equal(c.resolveInitialDesign(), d);
    });
  }

  it("falls back to the default when the stored value is not a design", () => {
    const c = loadDesign({ mobil_kontrol_design_v1: "wat" });
    assert.equal(c.resolveInitialDesign(), c.DEFAULT_DESIGN);
  });

  it("falls back to the default when localStorage throws (private mode)", () => {
    const c = loadDesign();
    const original = c.localStorage.getItem;
    c.localStorage.getItem = () => {
      throw new Error("SecurityError: storage is disabled");
    };
    try {
      assert.equal(c.resolveInitialDesign(), c.DEFAULT_DESIGN);
    } finally {
      c.localStorage.getItem = original;
    }
  });
});

describe("applyDesign", () => {
  it("writes data-design on the document element", () => {
    const c = loadDesign();
    c.applyDesign("showcase");
    assert.equal(c.document.documentElement.getAttribute("data-design"), "showcase");
  });

  it("persists the choice by default", () => {
    const c = loadDesign();
    c.applyDesign("classic");
    assert.equal(c.localStorage.getItem("mobil_kontrol_design_v1"), "classic");
  });

  it("does not persist when persist is false (live preview and relabeling)", () => {
    const c = loadDesign();
    c.applyDesign("showcase", { persist: false });
    assert.equal(c.document.documentElement.getAttribute("data-design"), "showcase");
    assert.equal(c.localStorage.getItem("mobil_kontrol_design_v1"), null);
  });

  it("coerces an invalid design to the default rather than writing it through", () => {
    const c = loadDesign();
    const applied = c.applyDesign("rainbow");
    assert.equal(applied, c.DEFAULT_DESIGN);
    assert.equal(c.document.documentElement.getAttribute("data-design"), c.DEFAULT_DESIGN);
  });

  it("returns the design it actually applied", () => {
    const c = loadDesign();
    assert.equal(c.applyDesign("minimal"), "minimal");
    assert.equal(c.applyDesign(undefined), c.DEFAULT_DESIGN);
  });

  it("survives a localStorage that refuses writes", () => {
    const c = loadDesign();
    c.localStorage.setItem = () => {
      throw new Error("QuotaExceededError");
    };
    assert.doesNotThrow(() => c.applyDesign("classic"));
    assert.equal(c.document.documentElement.getAttribute("data-design"), "classic");
  });
});

describe("Design stylesheets", () => {
  it("scope every rule inside @media screen, so print is design-independent", () => {
    for (const file of DESIGN_CSS) {
      const css = read(file);
      /* Strip comments first: the prose above each file mentions selectors
         and would otherwise be mistaken for rules. */
      const body = css.replace(/\/\*[\s\S]*?\*\//g, "");
      const open = body.indexOf("@media screen");
      assert.ok(open !== -1, `${file} has no @media screen block`);

      /* Everything before the block must be whitespace, and the block must
         run to the end of the file. Brace counting is enough here because
         the files contain no strings with braces. */
      assert.equal(body.slice(0, open).trim(), "", `${file} has rules before the @media screen block`);

      let depth = 0;
      let end = -1;
      for (let i = body.indexOf("{", open); i < body.length; i++) {
        if (body[i] === "{") depth++;
        else if (body[i] === "}") {
          depth--;
          if (depth === 0) {
            end = i;
            break;
          }
        }
      }
      assert.ok(end !== -1, `${file} has an unbalanced @media screen block`);
      assert.equal(body.slice(end + 1).trim(), "", `${file} has rules after the @media screen block`);
    }
  });

  it("select each non-default design by its own attribute value", () => {
    const all = DESIGN_CSS.map(read).join("\n");
    for (const d of EXPECTED_DESIGNS.filter(x => x !== "classic")) {
      assert.ok(
        all.includes(`[data-design="${d}"]`),
        `no rule selects [data-design="${d}"]; the design would apply and change nothing`
      );
    }
  });

  it("leave Classic to the base stylesheets (it has no design file)", () => {
    const all = DESIGN_CSS.map(read)
      .join("\n")
      .replace(/\/\*[\s\S]*?\*\//g, "");
    assert.ok(
      !all.includes('[data-design="classic"]'),
      "Classic is the unstyled baseline; a rule targeting it belongs in the base sheets"
    );
  });

  it("honor prefers-reduced-motion", () => {
    for (const file of DESIGN_CSS) {
      assert.ok(read(file).includes("prefers-reduced-motion"), `${file} has no reduced-motion block`);
    }
  });
});

describe("Showcase motion layer", () => {
  const SHOWCASE_JS = "js/20-showcase-motion.js";

  it("is a single IIFE, so it leaks nothing into the shared script scope", () => {
    const src = read(SHOWCASE_JS).replace(/\/\*[\s\S]*?\*\//g, "");
    const firstCode = src.search(/\S/);
    assert.ok(src.slice(firstCode).startsWith("(function"), "the file should open with an IIFE");
  });

  it("detaches everything it attaches", () => {
    const src = read(SHOWCASE_JS);
    /* Each of these is injected or added on attach; leaving one behind
       when the reader switches to another design is the one bug this
       layer can cause outside its own design. */
    for (const marker of ["sc-stage", "sc-scrollline", "sc-reveal", "sc-in", "sc-active"]) {
      assert.ok(src.includes(marker), `${marker} is not referenced at all`);
    }
    const detach = src.slice(src.indexOf("function detach()"), src.indexOf("function sync()"));
    assert.ok(detach.includes("sc-reveal") && detach.includes("sc-in"), "detach() does not clear the reveal classes");
    assert.ok(detach.includes("sc-active"), "detach() does not clear the scroll-spy class");
    assert.ok(
      detach.includes("stageEl") && detach.includes("scrollLineEl"),
      "detach() does not remove the injected nodes"
    );
    assert.ok(detach.includes("removeEventListener"), "detach() does not unbind the scroll listener");
    assert.ok(detach.includes("disconnect"), "detach() does not disconnect its observers");
  });
});
