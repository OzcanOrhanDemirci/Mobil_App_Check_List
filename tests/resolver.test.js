/* Unit tests for the two core content-resolution functions:

     resolveLevel(f, level)
       Reads currentStyle, currentFramework, currentBackend from the
       module scope. Resolution priority:
         A) currentStyle === "simple":
            1. f.simpleBackend[currentBackend][level]
            2. f.simple[level]
            (fall through to B if neither present)
         B) Technical / fallback:
            3. f.backendVariants[currentBackend][currentFramework][level]
            4. f.backendVariants[currentBackend]._default[level]
            5. f.variants[currentFramework][level]
            6. f[level]
       Returns the raw value (string or {tr, en} object) or undefined.

     tx(obj)
       Reads currentLang and currentStyle from the module scope.
       Accepts:
         1. plain string             returned as-is
         2. { tr, en }               returns obj[currentLang] or fallback
         3. { tr, en, simple:{tr,en} } when currentStyle === "simple"
                                     returns simple[currentLang] with
                                     graceful fallback to other lang and
                                     to non-simple block.
       Returns "" for null / undefined.

   The tests load real source via tests/_setup.js into a node:vm
   sandbox so we test the actual functions without modifying source.
*/

"use strict";

const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const { loadAppContext } = require("./_setup.js");

/* Fresh context per test suite (and re-set globals per test) keeps
   tests deterministic and isolated. */
let ctx;
beforeEach(() => {
  ctx = loadAppContext();
});

/* Helper: set axis globals via the sandbox adapter. The real script
   declares currentLang etc. with let, so they are not accessible as
   sandbox properties; the adapter installed by loadAppContext()
   exposes __setAxes which DOES sit in the same lexical scope. */
function setAxes(opts) {
  ctx.__setAxes(opts);
}

/* ==================== resolveLevel ==================== */

describe("resolveLevel", () => {
  it("returns top-level mvp block when no variants are defined", () => {
    setAxes({ style: "technical", framework: "flutter", backend: "firebase" });
    const feature = {
      mvp: { tr: "Top MVP TR", en: "Top MVP EN" },
      release: { tr: "Top Release TR", en: "Top Release EN" },
    };
    assert.deepEqual(ctx.resolveLevel(feature, "mvp"), { tr: "Top MVP TR", en: "Top MVP EN" });
  });

  it("returns top-level release block when level is release", () => {
    setAxes({ style: "technical", framework: "flutter", backend: "firebase" });
    const feature = {
      mvp: { tr: "Top MVP TR", en: "Top MVP EN" },
      release: { tr: "Top Release TR", en: "Top Release EN" },
    };
    assert.deepEqual(ctx.resolveLevel(feature, "release"), { tr: "Top Release TR", en: "Top Release EN" });
  });

  it("framework variant overrides the top-level block for the matching framework", () => {
    setAxes({ style: "technical", framework: "flutter", backend: "firebase" });
    const feature = {
      mvp: { tr: "Default MVP", en: "Default MVP" },
      variants: {
        flutter: { mvp: { tr: "Flutter MVP", en: "Flutter MVP" } },
      },
    };
    assert.deepEqual(ctx.resolveLevel(feature, "mvp"), { tr: "Flutter MVP", en: "Flutter MVP" });
  });

  it("framework variant is ignored when current framework does not match", () => {
    setAxes({ style: "technical", framework: "swift", backend: "firebase" });
    const feature = {
      mvp: { tr: "Default MVP", en: "Default MVP" },
      variants: {
        flutter: { mvp: { tr: "Flutter MVP", en: "Flutter MVP" } },
      },
    };
    assert.deepEqual(ctx.resolveLevel(feature, "mvp"), { tr: "Default MVP", en: "Default MVP" });
  });

  it("backendVariants[backend][framework] beats backendVariants[backend]._default", () => {
    setAxes({ style: "technical", framework: "flutter", backend: "firebase" });
    const feature = {
      mvp: { tr: "Top MVP", en: "Top MVP" },
      backendVariants: {
        firebase: {
          _default: { mvp: { tr: "Firebase default", en: "Firebase default" } },
          flutter: { mvp: { tr: "Firebase Flutter", en: "Firebase Flutter" } },
        },
      },
    };
    assert.deepEqual(ctx.resolveLevel(feature, "mvp"), { tr: "Firebase Flutter", en: "Firebase Flutter" });
  });

  it("backendVariants[backend]._default applies when framework key is absent", () => {
    setAxes({ style: "technical", framework: "kotlin", backend: "firebase" });
    const feature = {
      mvp: { tr: "Top MVP", en: "Top MVP" },
      backendVariants: {
        firebase: {
          _default: { mvp: { tr: "Firebase default", en: "Firebase default" } },
          flutter: { mvp: { tr: "Firebase Flutter", en: "Firebase Flutter" } },
        },
      },
    };
    assert.deepEqual(ctx.resolveLevel(feature, "mvp"), { tr: "Firebase default", en: "Firebase default" });
  });

  it("backendVariants take precedence over variants when both match", () => {
    setAxes({ style: "technical", framework: "flutter", backend: "firebase" });
    const feature = {
      mvp: { tr: "Top MVP", en: "Top MVP" },
      variants: {
        flutter: { mvp: { tr: "Plain Flutter", en: "Plain Flutter" } },
      },
      backendVariants: {
        firebase: {
          flutter: { mvp: { tr: "Firebase Flutter", en: "Firebase Flutter" } },
        },
      },
    };
    assert.deepEqual(ctx.resolveLevel(feature, "mvp"), { tr: "Firebase Flutter", en: "Firebase Flutter" });
  });

  it("falls back to framework variant when current backend has no entry in backendVariants", () => {
    setAxes({ style: "technical", framework: "flutter", backend: "supabase" });
    const feature = {
      mvp: { tr: "Top MVP", en: "Top MVP" },
      variants: {
        flutter: { mvp: { tr: "Plain Flutter", en: "Plain Flutter" } },
      },
      backendVariants: {
        firebase: {
          flutter: { mvp: { tr: "Firebase Flutter", en: "Firebase Flutter" } },
        },
      },
    };
    assert.deepEqual(ctx.resolveLevel(feature, "mvp"), { tr: "Plain Flutter", en: "Plain Flutter" });
  });

  it("falls back through the whole chain to top-level when no variant matches", () => {
    setAxes({ style: "technical", framework: "swift", backend: "convex" });
    const feature = {
      mvp: { tr: "Top MVP", en: "Top MVP" },
      variants: {
        flutter: { mvp: { tr: "Plain Flutter", en: "Plain Flutter" } },
      },
      backendVariants: {
        firebase: {
          _default: { mvp: { tr: "Firebase default", en: "Firebase default" } },
        },
      },
    };
    assert.deepEqual(ctx.resolveLevel(feature, "mvp"), { tr: "Top MVP", en: "Top MVP" });
  });

  it("returns undefined when no variant matches and no top-level level block exists", () => {
    setAxes({ style: "technical", framework: "flutter", backend: "firebase" });
    const feature = { mvp: { tr: "Only MVP", en: "Only MVP" } };
    assert.equal(ctx.resolveLevel(feature, "release"), undefined);
  });

  it("simple style: prefers simpleBackend[backend][level] over simple[level]", () => {
    setAxes({ style: "simple", framework: "flutter", backend: "noBackend" });
    const feature = {
      mvp: { tr: "Technical MVP", en: "Technical MVP" },
      simple: { mvp: { tr: "Simple MVP", en: "Simple MVP" } },
      simpleBackend: {
        noBackend: { mvp: { tr: "Simple noBackend MVP", en: "Simple noBackend MVP" } },
      },
    };
    assert.deepEqual(ctx.resolveLevel(feature, "mvp"), { tr: "Simple noBackend MVP", en: "Simple noBackend MVP" });
  });

  it("simple style: falls back to simple[level] when simpleBackend lacks the current backend", () => {
    setAxes({ style: "simple", framework: "flutter", backend: "firebase" });
    const feature = {
      mvp: { tr: "Technical MVP", en: "Technical MVP" },
      simple: { mvp: { tr: "Simple MVP", en: "Simple MVP" } },
      simpleBackend: {
        noBackend: { mvp: { tr: "Simple noBackend MVP", en: "Simple noBackend MVP" } },
      },
    };
    assert.deepEqual(ctx.resolveLevel(feature, "mvp"), { tr: "Simple MVP", en: "Simple MVP" });
  });

  it("simple style: falls through to technical chain when no simple content exists", () => {
    setAxes({ style: "simple", framework: "flutter", backend: "firebase" });
    const feature = {
      mvp: { tr: "Top MVP", en: "Top MVP" },
      variants: {
        flutter: { mvp: { tr: "Flutter MVP", en: "Flutter MVP" } },
      },
    };
    assert.deepEqual(ctx.resolveLevel(feature, "mvp"), { tr: "Flutter MVP", en: "Flutter MVP" });
  });

  it("plain string values pass through unchanged", () => {
    setAxes({ style: "technical", framework: "flutter", backend: "firebase" });
    const feature = { mvp: "Same for both languages" };
    assert.equal(ctx.resolveLevel(feature, "mvp"), "Same for both languages");
  });

  it("unknown framework falls back to top-level block", () => {
    setAxes({ style: "technical", framework: "thereIsNoSuchFramework", backend: "firebase" });
    const feature = {
      mvp: { tr: "Top MVP", en: "Top MVP" },
      variants: {
        flutter: { mvp: { tr: "Flutter MVP", en: "Flutter MVP" } },
      },
    };
    assert.deepEqual(ctx.resolveLevel(feature, "mvp"), { tr: "Top MVP", en: "Top MVP" });
  });

  it("null currentFramework / currentBackend still works (uses top-level)", () => {
    setAxes({ style: "technical", framework: null, backend: null });
    const feature = {
      mvp: { tr: "Top MVP", en: "Top MVP" },
      variants: { flutter: { mvp: { tr: "Flutter MVP", en: "Flutter MVP" } } },
      backendVariants: { firebase: { _default: { mvp: { tr: "FB default", en: "FB default" } } } },
    };
    assert.deepEqual(ctx.resolveLevel(feature, "mvp"), { tr: "Top MVP", en: "Top MVP" });
  });
});

/* ==================== tx ==================== */

describe("tx", () => {
  it("returns empty string for null", () => {
    setAxes({ lang: "tr", style: "technical" });
    assert.equal(ctx.tx(null), "");
  });

  it("returns empty string for undefined", () => {
    setAxes({ lang: "tr", style: "technical" });
    assert.equal(ctx.tx(undefined), "");
  });

  it("returns plain strings unchanged regardless of lang/style", () => {
    setAxes({ lang: "en", style: "simple" });
    assert.equal(ctx.tx("just a string"), "just a string");
  });

  it("returns the Turkish field when currentLang is tr", () => {
    setAxes({ lang: "tr", style: "technical" });
    assert.equal(ctx.tx({ tr: "Merhaba", en: "Hello" }), "Merhaba");
  });

  it("returns the English field when currentLang is en", () => {
    setAxes({ lang: "en", style: "technical" });
    assert.equal(ctx.tx({ tr: "Merhaba", en: "Hello" }), "Hello");
  });

  it("falls back to tr when current lang field is missing", () => {
    setAxes({ lang: "en", style: "technical" });
    assert.equal(ctx.tx({ tr: "Yalniz TR" }), "Yalniz TR");
  });

  it("falls back to en when current lang field is missing and tr is also missing", () => {
    setAxes({ lang: "tr", style: "technical" });
    assert.equal(ctx.tx({ en: "Only EN" }), "Only EN");
  });

  it("simple style returns simple[currentLang] when present", () => {
    setAxes({ lang: "tr", style: "simple" });
    const obj = {
      tr: "Teknik TR",
      en: "Technical EN",
      simple: { tr: "Basit TR", en: "Simple EN" },
    };
    assert.equal(ctx.tx(obj), "Basit TR");
  });

  it("simple style picks simple.en for English", () => {
    setAxes({ lang: "en", style: "simple" });
    const obj = {
      tr: "Teknik TR",
      en: "Technical EN",
      simple: { tr: "Basit TR", en: "Simple EN" },
    };
    assert.equal(ctx.tx(obj), "Simple EN");
  });

  it("simple style: falls back to other-language simple field when current lang simple is missing", () => {
    setAxes({ lang: "en", style: "simple" });
    const obj = {
      tr: "Teknik TR",
      en: "Technical EN",
      simple: { tr: "Sadece basit TR" },
    };
    assert.equal(ctx.tx(obj), "Sadece basit TR");
  });

  it("simple style: falls back to technical block when simple block has no usable text", () => {
    setAxes({ lang: "en", style: "simple" });
    const obj = {
      tr: "Teknik TR",
      en: "Technical EN",
      simple: {},
    };
    assert.equal(ctx.tx(obj), "Technical EN");
  });

  it("simple style without a simple block behaves like technical", () => {
    setAxes({ lang: "tr", style: "simple" });
    const obj = { tr: "Teknik TR", en: "Technical EN" };
    assert.equal(ctx.tx(obj), "Teknik TR");
  });

  it("technical style ignores the simple block", () => {
    setAxes({ lang: "tr", style: "technical" });
    const obj = {
      tr: "Teknik TR",
      en: "Technical EN",
      simple: { tr: "Basit TR", en: "Simple EN" },
    };
    assert.equal(ctx.tx(obj), "Teknik TR");
  });

  it("numbers and other non-string non-object values are coerced via String()", () => {
    setAxes({ lang: "tr", style: "technical" });
    assert.equal(ctx.tx(42), "42");
    assert.equal(ctx.tx(true), "true");
  });

  it("object missing both lang and simple returns empty string", () => {
    setAxes({ lang: "tr", style: "technical" });
    assert.equal(ctx.tx({}), "");
  });

  it("integrates with resolveLevel: tx(resolveLevel(...)) yields the right string for a 4-axis combo", () => {
    setAxes({ lang: "en", style: "simple", framework: "flutter", backend: "noBackend" });
    const feature = {
      mvp: { tr: "Teknik MVP", en: "Technical MVP" },
      variants: { flutter: { mvp: { tr: "Flutter teknik", en: "Flutter technical" } } },
      simple: { mvp: { tr: "Basit MVP", en: "Simple MVP" } },
      simpleBackend: { noBackend: { mvp: { tr: "Basit no-backend MVP", en: "Simple no-backend MVP" } } },
    };
    /* Resolver picks simpleBackend.noBackend.mvp (simple style + matching backend);
       tx then picks the English string from that block. */
    assert.equal(ctx.tx(ctx.resolveLevel(feature, "mvp")), "Simple no-backend MVP");
  });
});
