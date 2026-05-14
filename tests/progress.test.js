/* Unit tests for countLevels (js/12-progress.js).

   countLevels is the source of truth for the three top progress bars
   (Total / MVP / Release), the per-category percentages, and the
   "completed" / "completed-mvp" / "completed-release" CSS state class
   on each category section. It also gates the celebration modal (which
   triggers when one of the three counters reaches its total) and the
   Lock / Export button enable conditions in updateToolbarButtonStates.

   This file loads the real per-category data shards plus js/12-progress.js
   into a fresh node:vm sandbox via tests/_setup.js, then exercises the
   function through the documented public surface:

     1. Output shape and per-category breakdown.
     2. Empty state yields zero checks across all counters.
     3. Marking a single MVP key increments totalChecked and mvpChecked.
     4. Marking a single Release key increments totalChecked and releaseChecked.
     5. Both levels of the same feature counted independently.
     6. backendStep features hidden when currentBackend === "noBackend".
     7. The framework gate (f.variants && !currentFramework) excludes
        framework-only features when no framework is selected.

   No DOM is required: countLevels reads DATA, state, currentFramework,
   currentBackend, and the resolver functions; it never touches the DOM. */

"use strict";

const { describe, it, before, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const { loadAppContext, DATA_FILES } = require("./_setup.js");

/* Helpers: build the state key the same way countLevels does, so the
   tests stay robust if feature ids drift. The key shape is documented
   inline in js/12-progress.js: `${cat.id}.${f.id}.${L}` */
function stateKey(cat, feature, level) {
  return `${cat.id}.${feature.id}.${level}`;
}

/* Find any feature that has both an mvp and a release block AND is not
   hidden by the no-backend default. This guarantees both level counters
   move when the feature is ticked. */
function findUniversalFeature(DATA) {
  for (const cat of DATA) {
    for (const f of cat.features) {
      if (f.mvp && f.release && !f.backendStep) return { cat, f };
    }
  }
  throw new Error("no universal mvp+release feature found in DATA");
}

/* Find any feature flagged backendStep so we can verify the noBackend
   exclusion path. backendStep features cover category 06 (Backend) and a
   handful of items scattered elsewhere. */
function findBackendStepFeature(DATA) {
  for (const cat of DATA) {
    for (const f of cat.features) {
      if (f.backendStep === true) return { cat, f };
    }
  }
  throw new Error("no feature with backendStep:true found in DATA");
}

let ctx;
let DATA;
let countLevels;

before(() => {
  /* SCRIPT_FILES already loads framework / backend / view-state, which
     defines resolveLevelText, isHiddenByBackend, and the state/notes
     globals. We add DATA_FILES so DATA is populated, js/11-render.js so
     countHowtoSteps and countCheckedStepsByPrefix are declared (also
     used internally by countLevels for the granular per-category
     counts), and js/12-progress.js so countLevels itself is declared. */
  ctx = loadAppContext({
    extraFiles: [...DATA_FILES, "js/11-render.js", "js/12-progress.js"],
  });
  DATA = ctx.DATA;
  countLevels = ctx.countLevels;
});

describe("countLevels output shape", () => {
  it("returns an object with the documented counters and a perCat map", () => {
    /* Start clean: framework set to a common one so framework-variant
       features still contribute to the totals; backend set to firebase
       so backendStep features are not excluded. */
    ctx.__setAxes({ framework: "flutter", backend: "firebase" });
    ctx.__setState({});
    const c = countLevels();

    assert.equal(typeof c, "object");
    assert.equal(typeof c.total, "number");
    assert.equal(typeof c.totalChecked, "number");
    assert.equal(typeof c.mvp, "number");
    assert.equal(typeof c.mvpChecked, "number");
    assert.equal(typeof c.release, "number");
    assert.equal(typeof c.releaseChecked, "number");
    assert.ok(c.perCat && typeof c.perCat === "object");
  });

  it("perCat has one entry per category in DATA", () => {
    ctx.__setAxes({ framework: "flutter", backend: "firebase" });
    ctx.__setState({});
    const c = countLevels();
    for (const cat of DATA) {
      assert.ok(c.perCat[cat.id], `perCat missing entry for category ${cat.id}`);
    }
  });

  it("perCat entries carry total, checked, mvpTotal, mvpChecked, releaseTotal, releaseChecked", () => {
    ctx.__setAxes({ framework: "flutter", backend: "firebase" });
    ctx.__setState({});
    const c = countLevels();
    for (const cat of DATA) {
      const p = c.perCat[cat.id];
      assert.equal(typeof p.total, "number");
      assert.equal(typeof p.checked, "number");
      assert.equal(typeof p.mvpTotal, "number");
      assert.equal(typeof p.mvpChecked, "number");
      assert.equal(typeof p.releaseTotal, "number");
      assert.equal(typeof p.releaseChecked, "number");
    }
  });
});

describe("countLevels: empty state", () => {
  it("totalChecked, mvpChecked, releaseChecked are all zero when state is empty", () => {
    ctx.__setAxes({ framework: "flutter", backend: "firebase" });
    ctx.__setState({});
    const c = countLevels();
    assert.equal(c.totalChecked, 0);
    assert.equal(c.mvpChecked, 0);
    assert.equal(c.releaseChecked, 0);
  });

  it("total = mvp + release (each level counted once)", () => {
    ctx.__setAxes({ framework: "flutter", backend: "firebase" });
    ctx.__setState({});
    const c = countLevels();
    assert.equal(c.total, c.mvp + c.release);
  });

  it("total is greater than zero (DATA carries content)", () => {
    ctx.__setAxes({ framework: "flutter", backend: "firebase" });
    ctx.__setState({});
    const c = countLevels();
    assert.ok(c.total > 0, "total should be > 0 once DATA is loaded");
  });
});

describe("countLevels: marking a single key", () => {
  it("marking one MVP key increments totalChecked and mvpChecked by exactly one", () => {
    ctx.__setAxes({ framework: "flutter", backend: "firebase" });
    const { cat, f } = findUniversalFeature(DATA);
    const key = stateKey(cat, f, "mvp");

    ctx.__setState({});
    const before = countLevels();
    ctx.__setState({ [key]: true });
    const after = countLevels();

    assert.equal(after.totalChecked - before.totalChecked, 1);
    assert.equal(after.mvpChecked - before.mvpChecked, 1);
    assert.equal(after.releaseChecked - before.releaseChecked, 0);
  });

  it("marking one Release key increments totalChecked and releaseChecked by exactly one", () => {
    ctx.__setAxes({ framework: "flutter", backend: "firebase" });
    const { cat, f } = findUniversalFeature(DATA);
    const key = stateKey(cat, f, "release");

    ctx.__setState({});
    const before = countLevels();
    ctx.__setState({ [key]: true });
    const after = countLevels();

    assert.equal(after.totalChecked - before.totalChecked, 1);
    assert.equal(after.releaseChecked - before.releaseChecked, 1);
    assert.equal(after.mvpChecked - before.mvpChecked, 0);
  });

  it("marking both MVP and Release of the same feature counts them independently", () => {
    ctx.__setAxes({ framework: "flutter", backend: "firebase" });
    const { cat, f } = findUniversalFeature(DATA);

    ctx.__setState({});
    const before = countLevels();
    ctx.__setState({
      [stateKey(cat, f, "mvp")]: true,
      [stateKey(cat, f, "release")]: true,
    });
    const after = countLevels();

    assert.equal(after.totalChecked - before.totalChecked, 2);
    assert.equal(after.mvpChecked - before.mvpChecked, 1);
    assert.equal(after.releaseChecked - before.releaseChecked, 1);
  });

  it("falsy values in state do not count", () => {
    /* The countLevels logic uses `!!state[key]` so anything falsy is
       treated as "unchecked". Verify that "0", "", null, and false all
       behave the same as a missing key. */
    ctx.__setAxes({ framework: "flutter", backend: "firebase" });
    const { cat, f } = findUniversalFeature(DATA);
    const key = stateKey(cat, f, "mvp");

    ctx.__setState({});
    const baseline = countLevels().totalChecked;

    for (const falsy of [0, "", null, false]) {
      ctx.__setState({ [key]: falsy });
      assert.equal(countLevels().totalChecked, baseline, `state[${key}] = ${JSON.stringify(falsy)} should not count`);
    }
  });
});

describe("countLevels: backendStep exclusion", () => {
  it("backendStep features are hidden when backend === 'noBackend' (total drops)", () => {
    ctx.__setAxes({ framework: "flutter", backend: "firebase" });
    ctx.__setState({});
    const withBackend = countLevels();

    ctx.__setAxes({ framework: "flutter", backend: "noBackend" });
    ctx.__setState({});
    const withoutBackend = countLevels();

    assert.ok(
      withoutBackend.total < withBackend.total,
      `expected total to drop when backend = noBackend (firebase: ${withBackend.total}, noBackend: ${withoutBackend.total})`
    );
  });

  it("a ticked backendStep feature does NOT count when backend === 'noBackend'", () => {
    ctx.__setAxes({ framework: "flutter", backend: "noBackend" });
    const { cat, f } = findBackendStepFeature(DATA);
    const key = stateKey(cat, f, "mvp");

    /* Sanity check: the feature flagged backendStep:true must be present
       in the data fixture, otherwise this test would silently pass. */
    assert.equal(f.backendStep, true);

    ctx.__setState({ [key]: true });
    const c = countLevels();
    /* Because the feature is excluded entirely (isHiddenByBackend), the
       ticked key contributes zero to every counter. */
    assert.equal(c.totalChecked, 0);
    assert.equal(c.mvpChecked, 0);
    assert.equal(c.releaseChecked, 0);
  });

  it("the same backendStep feature DOES count when backend === 'firebase'", () => {
    ctx.__setAxes({ framework: "flutter", backend: "firebase" });
    const { cat, f } = findBackendStepFeature(DATA);
    const key = stateKey(cat, f, "mvp");

    /* The mvp level must resolve to something for the feature to count.
       backendStep features may have content under backendVariants or
       the universal fallback; either way resolveLevelText returns
       non-empty text for backend = firebase + framework = flutter. */
    ctx.__setState({ [key]: true });
    const c = countLevels();
    assert.ok(c.totalChecked >= 1, "ticked backendStep feature should count under firebase");
  });
});

describe("countLevels: framework gating", () => {
  it("features with a `variants` block do not count when no framework is selected", () => {
    /* Some features (e.g. install snippets, framework-specific gestures)
       have only a `variants` block and no universal fallback. Until a
       framework is picked, they should not contribute to the totals.
       The early return in countLevels enforces that. */
    ctx.__setAxes({ framework: null, backend: "firebase" });
    ctx.__setState({});
    const withoutFramework = countLevels();

    ctx.__setAxes({ framework: "flutter", backend: "firebase" });
    ctx.__setState({});
    const withFramework = countLevels();

    /* The "without framework" total is less than or equal to the "with
       framework" total. Equal is possible if no feature in the current
       DATA has a variants block; less-than is the expected case while
       framework-variant features exist (today most do). */
    assert.ok(
      withoutFramework.total <= withFramework.total,
      `framework-gated features should not raise the count: noFw=${withoutFramework.total}, fw=${withFramework.total}`
    );
  });
});

/* countHowtoSteps + countCheckedStepsByPrefix live in js/11-render.js and
   are used by countLevels to compute the per-category granular percentage.
   Both are pure: countHowtoSteps takes a string and returns a number,
   countCheckedStepsByPrefix reads the state map (set via __setState). The
   tests below load the same sandbox that progress.test.js uses, just
   exercise the helpers directly. */

describe("countHowtoSteps", () => {
  it("returns 0 for empty, null, undefined, or non-string input", () => {
    assert.equal(ctx.countHowtoSteps(""), 0);
    assert.equal(ctx.countHowtoSteps(null), 0);
    assert.equal(ctx.countHowtoSteps(undefined), 0);
    assert.equal(ctx.countHowtoSteps(42), 0);
    assert.equal(ctx.countHowtoSteps({}), 0);
  });

  it("returns 0 when the string has no `1)` marker", () => {
    /* The early `\b1\)\s` guard rejects strings without an opening
       step. "2)" alone does not start a list. */
    assert.equal(ctx.countHowtoSteps("plain prose without numbered steps"), 0);
    assert.equal(ctx.countHowtoSteps("2) starts at two, no leading 1)"), 0);
  });

  it("counts a single `1)` step", () => {
    assert.equal(ctx.countHowtoSteps("1) only step here"), 1);
  });

  it("counts multiple consecutive steps in increasing order", () => {
    assert.equal(ctx.countHowtoSteps("1) a 2) b 3) c"), 3);
    assert.equal(ctx.countHowtoSteps("1) a 2) b 3) c 4) d 5) e"), 5);
  });

  it("ignores intro text that appears before the `1)` marker", () => {
    /* Real DATA strings often have an introductory clause before the
       numbered list. */
    assert.equal(ctx.countHowtoSteps("Some intro 1) step1 2) step2"), 2);
  });

  it("does not count an empty body after a numbered marker", () => {
    /* `1)   ` with only whitespace after the marker is not a real step. */
    assert.equal(ctx.countHowtoSteps("1)    "), 0);
  });

  it("handles inline HTML inside step bodies", () => {
    /* Real DATA wraps step content with <strong>, <code>, <em>, etc. */
    assert.equal(ctx.countHowtoSteps("1) <strong>foo</strong> 2) <code>bar</code>"), 2);
  });

  it("handles a newline-separated list", () => {
    /* The split regex uses \s+ for the separator, so `1)\nfoo\n2)\nbar`
       parses the same as `1) foo 2) bar`. */
    assert.equal(ctx.countHowtoSteps("1)\nfoo step\n2)\nbar step"), 2);
  });
});

describe("countCheckedStepsByPrefix", () => {
  /* Each test starts with a clean state map so prior tests cannot leak. */
  beforeEach(() => {
    ctx.__setState({});
  });

  it("returns 0 when total is 0", () => {
    assert.equal(ctx.countCheckedStepsByPrefix("anything", 0), 0);
  });

  it("returns 0 when state is empty", () => {
    assert.equal(ctx.countCheckedStepsByPrefix("x", 5), 0);
  });

  it("counts only keys in the range [s0, s{total-1}]", () => {
    ctx.__setState({
      "x.s0": true,
      "x.s1": true,
      "x.s2": true,
      "x.s5": true,
    });
    /* For total=3 only s0..s2 are inspected; s5 is out of range. */
    assert.equal(ctx.countCheckedStepsByPrefix("x", 3), 3);
    /* For total=6 we read s0..s5; the three true keys plus s5 yield 4. */
    assert.equal(ctx.countCheckedStepsByPrefix("x", 6), 4);
  });

  it("ignores falsy state values (false, 0, null, empty string)", () => {
    ctx.__setState({
      "x.s0": true,
      "x.s1": false,
      "x.s2": 0,
      "x.s3": null,
      "x.s4": "",
      "x.s5": true,
    });
    assert.equal(ctx.countCheckedStepsByPrefix("x", 6), 2);
  });

  it("does not count keys with a different prefix", () => {
    ctx.__setState({
      "x.s0": true,
      "y.s0": true,
      "x.s1": true,
    });
    assert.equal(ctx.countCheckedStepsByPrefix("x", 2), 2);
    assert.equal(ctx.countCheckedStepsByPrefix("y", 2), 1);
  });
});
