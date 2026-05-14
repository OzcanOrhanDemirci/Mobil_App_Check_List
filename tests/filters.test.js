/* Unit tests for shouldShowFeature in js/13-filters.js.

   shouldShowFeature is the pure predicate that decides whether a
   single feature card stays visible under the current filter state.
   The full applyFilters function calls it once per feature, but the
   logic is fully testable in isolation: no DOM, no globals, just five
   inputs and a boolean output.

   This suite drives the 3 x 3 dropdown matrix (viewMode x viewFilter)
   and the search-text interaction, with the "level rows" passed as
   plain JavaScript objects rather than DOM elements. The applyFilters
   wrapper handles the lowercasing of q and the construction of the
   levels array from .level DOM nodes; the wrapper is exercised by
   manual testing rather than by the unit suite because its remaining
   responsibility is purely DOM glue. */

"use strict";

const { describe, it, before } = require("node:test");
const assert = require("node:assert/strict");
const { loadAppContext } = require("./_setup.js");

let shouldShowFeature;

before(() => {
  /* js/13-filters.js declares the predicate and applyFilters. Only the
     predicate is needed; loading the file is otherwise side-effect free. */
  const ctx = loadAppContext({ extraFiles: ["js/13-filters.js"] });
  shouldShowFeature = ctx.shouldShowFeature;
});

/* Convenience: a level row in the input shape that shouldShowFeature
   expects. Defaults are picked so an unspecified row is "MVP, unchecked". */
function lvl(kind, checked = false) {
  return {
    isMvp: kind === "mvp",
    isRelease: kind === "release",
    isChecked: checked,
  };
}

describe("shouldShowFeature: default 'both' / 'all' combination", () => {
  it("always returns true when there is no search and the defaults are in effect", () => {
    assert.equal(shouldShowFeature("", "both", "all", "anything", []), true);
    assert.equal(shouldShowFeature("", "both", "all", "", []), true);
    assert.equal(shouldShowFeature("", "both", "all", "title body", [lvl("mvp")]), true);
  });

  it("short-circuits without inspecting levels (an empty levels array is OK)", () => {
    /* In the real app applyFilters skips the DOM read when the default
       combination is active; the predicate must not require any level
       rows in that case. */
    assert.equal(shouldShowFeature("", "both", "all", "x", []), true);
  });
});

describe("shouldShowFeature: search text interaction", () => {
  it("hides the feature when the query is not found in searchText", () => {
    /* Defaults: 'both' / 'all'. Search alone decides visibility. */
    assert.equal(shouldShowFeature("zebra", "both", "all", "no match here", []), false);
  });

  it("shows the feature when the query is a substring of searchText", () => {
    assert.equal(shouldShowFeature("api", "both", "all", "rest api guide", []), true);
  });

  it("treats the search check as case-sensitive on already-lowercased inputs", () => {
    /* applyFilters lowercases q with q.toLowerCase() and the render
       layer lowercases searchText at build time. The predicate is the
       last-mile equality check; it does not lowercase again. */
    assert.equal(shouldShowFeature("API", "both", "all", "rest api guide", []), false);
    assert.equal(shouldShowFeature("api", "both", "all", "REST API guide", []), false);
  });

  it("rejects the feature even when level filter would match, if search fails", () => {
    /* The level filter would match (mvp + done with checked mvp), but
       the search query is unrelated; the feature must stay hidden. */
    assert.equal(shouldShowFeature("zebra", "mvp", "done", "rest api guide", [lvl("mvp", true)]), false);
  });
});

describe("shouldShowFeature: viewMode filters (mvp / release)", () => {
  it("mvp + all shows features with at least one mvp row regardless of checked state", () => {
    assert.equal(shouldShowFeature("", "mvp", "all", "x", [lvl("mvp")]), true);
    assert.equal(shouldShowFeature("", "mvp", "all", "x", [lvl("mvp", true)]), true);
  });

  it("mvp + all hides features with only release rows", () => {
    assert.equal(shouldShowFeature("", "mvp", "all", "x", [lvl("release")]), false);
    assert.equal(shouldShowFeature("", "mvp", "all", "x", [lvl("release", true)]), false);
  });

  it("release + all shows features with at least one release row", () => {
    assert.equal(shouldShowFeature("", "release", "all", "x", [lvl("release")]), true);
    assert.equal(shouldShowFeature("", "release", "all", "x", [lvl("release", true)]), true);
  });

  it("release + all hides features with only mvp rows", () => {
    assert.equal(shouldShowFeature("", "release", "all", "x", [lvl("mvp")]), false);
    assert.equal(shouldShowFeature("", "release", "all", "x", [lvl("mvp", true)]), false);
  });

  it("both + all (with non-default viewFilter set later) considers any row of any kind", () => {
    /* When viewMode is "both" the loop accepts both mvp and release
       rows; viewFilter narrows that further. Here we test with
       viewFilter still "all" but a non-default mode would have been
       hit by the default short-circuit; instead exercise it with
       a specific viewFilter below. */
    assert.equal(shouldShowFeature("", "both", "pending", "x", [lvl("mvp"), lvl("release")]), true);
  });
});

describe("shouldShowFeature: viewFilter filters (pending / done)", () => {
  it("mvp + pending shows when an mvp row is unchecked", () => {
    assert.equal(shouldShowFeature("", "mvp", "pending", "x", [lvl("mvp")]), true);
    assert.equal(shouldShowFeature("", "mvp", "pending", "x", [lvl("mvp", true)]), false);
  });

  it("mvp + done shows when an mvp row is checked", () => {
    assert.equal(shouldShowFeature("", "mvp", "done", "x", [lvl("mvp", true)]), true);
    assert.equal(shouldShowFeature("", "mvp", "done", "x", [lvl("mvp")]), false);
  });

  it("release + pending shows when a release row is unchecked", () => {
    assert.equal(shouldShowFeature("", "release", "pending", "x", [lvl("release")]), true);
    assert.equal(shouldShowFeature("", "release", "pending", "x", [lvl("release", true)]), false);
  });

  it("release + done shows when a release row is checked", () => {
    assert.equal(shouldShowFeature("", "release", "done", "x", [lvl("release", true)]), true);
    assert.equal(shouldShowFeature("", "release", "done", "x", [lvl("release")]), false);
  });

  it("both + pending shows when any row of any kind is unchecked", () => {
    assert.equal(shouldShowFeature("", "both", "pending", "x", [lvl("mvp", true), lvl("release")]), true);
    assert.equal(shouldShowFeature("", "both", "pending", "x", [lvl("mvp"), lvl("release", true)]), true);
    assert.equal(shouldShowFeature("", "both", "pending", "x", [lvl("mvp", true), lvl("release", true)]), false);
  });

  it("both + done shows when any row of any kind is checked", () => {
    assert.equal(shouldShowFeature("", "both", "done", "x", [lvl("mvp", true), lvl("release")]), true);
    assert.equal(shouldShowFeature("", "both", "done", "x", [lvl("mvp"), lvl("release", true)]), true);
    assert.equal(shouldShowFeature("", "both", "done", "x", [lvl("mvp"), lvl("release")]), false);
  });
});

describe("shouldShowFeature: empty levels array (non-default mode)", () => {
  it("returns false when no level rows are provided and the mode is non-default", () => {
    /* Without a default short-circuit, the for-of finds nothing and
       falls through to `return false`. This is the right behavior
       for an item with no MVP and no Release content under a specific
       level filter. */
    assert.equal(shouldShowFeature("", "mvp", "all", "x", []), false);
    assert.equal(shouldShowFeature("", "release", "done", "x", []), false);
    assert.equal(shouldShowFeature("", "both", "pending", "x", []), false);
  });
});

describe("shouldShowFeature: realistic two-level feature combinations", () => {
  /* The typical feature card has exactly one MVP row and one Release
     row. The combinations below cover every (mvp checked? release
     checked?) state crossed with every (viewMode, viewFilter). */

  const cases = [
    /* MVP unchecked, Release unchecked */
    { state: "uu", levels: [lvl("mvp"), lvl("release")] },
    /* MVP checked, Release unchecked */
    { state: "cu", levels: [lvl("mvp", true), lvl("release")] },
    /* MVP unchecked, Release checked */
    { state: "uc", levels: [lvl("mvp"), lvl("release", true)] },
    /* MVP checked, Release checked */
    { state: "cc", levels: [lvl("mvp", true), lvl("release", true)] },
  ];

  /* Expected matrix: state -> { "mode_filter": visible }. Hand-derived
     so the tests double-check the predicate against the spec. */
  const expected = {
    uu: {
      mvp_all: true,
      mvp_pending: true,
      mvp_done: false,
      release_all: true,
      release_pending: true,
      release_done: false,
      both_pending: true,
      both_done: false,
    },
    cu: {
      mvp_all: true,
      mvp_pending: false,
      mvp_done: true,
      release_all: true,
      release_pending: true,
      release_done: false,
      both_pending: true,
      both_done: true,
    },
    uc: {
      mvp_all: true,
      mvp_pending: true,
      mvp_done: false,
      release_all: true,
      release_pending: false,
      release_done: true,
      both_pending: true,
      both_done: true,
    },
    cc: {
      mvp_all: true,
      mvp_pending: false,
      mvp_done: true,
      release_all: true,
      release_pending: false,
      release_done: true,
      both_pending: false,
      both_done: true,
    },
  };

  for (const { state, levels } of cases) {
    const e = expected[state];
    it(`state ${state}: mvp_all=${e.mvp_all} mvp_pending=${e.mvp_pending} mvp_done=${e.mvp_done}`, () => {
      assert.equal(shouldShowFeature("", "mvp", "all", "x", levels), e.mvp_all);
      assert.equal(shouldShowFeature("", "mvp", "pending", "x", levels), e.mvp_pending);
      assert.equal(shouldShowFeature("", "mvp", "done", "x", levels), e.mvp_done);
    });
    it(`state ${state}: release_all=${e.release_all} release_pending=${e.release_pending} release_done=${e.release_done}`, () => {
      assert.equal(shouldShowFeature("", "release", "all", "x", levels), e.release_all);
      assert.equal(shouldShowFeature("", "release", "pending", "x", levels), e.release_pending);
      assert.equal(shouldShowFeature("", "release", "done", "x", levels), e.release_done);
    });
    it(`state ${state}: both_pending=${e.both_pending} both_done=${e.both_done}`, () => {
      assert.equal(shouldShowFeature("", "both", "pending", "x", levels), e.both_pending);
      assert.equal(shouldShowFeature("", "both", "done", "x", levels), e.both_done);
    });
  }
});
