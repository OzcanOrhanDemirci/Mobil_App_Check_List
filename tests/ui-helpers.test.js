/* Unit tests for the HTML escape and strip helpers in js/07-ui-helpers.js.

   These two functions are the entire XSS defense for user-controlled data
   that gets interpolated into HTML attribute and text contexts:

     - Project names (rendered into the project pill title attribute, into
       project list rows, into modal confirmation messages).
     - Free-form note bodies (rendered into the back of each feature card
       and as note preview text on the front).
     - JSON-imported state and notes (the import handler in js/18-app.js
       passes both through the same render path).

   The 1.1.0 audit flagged that these helpers had no direct test coverage.
   This file plugs that gap with a five-character escape table, common
   XSS attack vectors as defense-in-depth fixtures, type coercion of
   null / undefined / primitive inputs, and the stripper's
   entity-decode + whitespace-collapse behaviors.

   No DOM is touched: both helpers are pure string transforms. */

"use strict";

const { describe, it, before } = require("node:test");
const assert = require("node:assert/strict");
const { loadAppContext } = require("./_setup.js");

let escapeHtml;
let stripHtml;

before(() => {
  /* js/07-ui-helpers.js is not in the default SCRIPT_FILES list (the
     defaults stay minimal for the resolver / projects tests), so we load
     it here via extraFiles. The adapter mirror in _setup.js exposes
     escapeHtml and stripHtml when the file is present. */
  const ctx = loadAppContext({ extraFiles: ["js/07-ui-helpers.js"] });
  escapeHtml = ctx.escapeHtml;
  stripHtml = ctx.stripHtml;
});

describe("escapeHtml: the five XSS-relevant characters", () => {
  it("escapes ampersand", () => {
    assert.equal(escapeHtml("Tom & Jerry"), "Tom &amp; Jerry");
  });

  it("escapes less-than", () => {
    assert.equal(escapeHtml("a < b"), "a &lt; b");
  });

  it("escapes greater-than", () => {
    assert.equal(escapeHtml("b > a"), "b &gt; a");
  });

  it("escapes double quote", () => {
    assert.equal(escapeHtml('say "hello"'), "say &quot;hello&quot;");
  });

  it("escapes single quote as numeric entity (HTML5 safe across renderers)", () => {
    /* &apos; is HTML5-only and not honored in all XML-mode renderers, so
       the helper uses the numeric entity &#39; instead. */
    assert.equal(escapeHtml("it's"), "it&#39;s");
  });

  it("escapes all five characters in one pass", () => {
    assert.equal(
      escapeHtml(`<a href="x" onclick='y'>&</a>`),
      "&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&lt;/a&gt;"
    );
  });

  it("ampersand is escaped first so other entities are not double-encoded", () => {
    /* If "<" were escaped before "&", the resulting "&lt;" would have its
       "&" re-escaped to "&amp;lt;". The implementation must run the "&"
       pass first; this fixture proves it. */
    assert.equal(escapeHtml("<"), "&lt;");
    assert.equal(escapeHtml("&<"), "&amp;&lt;");
  });
});

describe("escapeHtml: input coercion", () => {
  it("returns empty string for empty input", () => {
    assert.equal(escapeHtml(""), "");
  });

  it("coerces null via String() (no separate null guard)", () => {
    /* String(null) === "null"; the helper passes that through unchanged
       because "null" has no XSS-relevant characters. */
    assert.equal(escapeHtml(null), "null");
  });

  it("coerces undefined via String()", () => {
    assert.equal(escapeHtml(undefined), "undefined");
  });

  it("coerces numbers", () => {
    assert.equal(escapeHtml(42), "42");
    assert.equal(escapeHtml(0), "0");
    assert.equal(escapeHtml(-3.14), "-3.14");
  });

  it("coerces booleans", () => {
    assert.equal(escapeHtml(true), "true");
    assert.equal(escapeHtml(false), "false");
  });

  it("coerces objects via toString (used as a safety net, not a feature)", () => {
    /* Object inputs are not part of the contract, but the helper must
       not throw on them: the import handler can technically pass an
       array or object before our sanitizers reject it. */
    assert.equal(escapeHtml({ toString: () => "abc" }), "abc");
    assert.equal(escapeHtml([1, 2, 3]), "1,2,3");
  });
});

describe("escapeHtml: defense-in-depth against known XSS vectors", () => {
  /* The CSP at index.html forbids inline scripts, so these payloads are
     non-executable even without escaping. The tests below cement the
     belt-and-suspenders contract: the escape happens regardless. */

  it("neutralizes a <script> tag", () => {
    const out = escapeHtml("<script>alert(1)</script>");
    assert.ok(!out.includes("<script>"), "raw <script> tag must not survive");
    assert.equal(out, "&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  it("neutralizes an <img onerror> payload", () => {
    const out = escapeHtml(`<img src=x onerror="alert(1)">`);
    assert.ok(!out.includes("<img"), "raw <img tag must not survive");
    assert.ok(out.includes("&quot;"));
  });

  it("neutralizes an SVG onload payload", () => {
    const out = escapeHtml(`<svg onload="alert(1)"></svg>`);
    assert.ok(!out.includes("<svg"));
    assert.ok(!out.includes('"alert(1)"'));
  });

  it("neutralizes attribute-context single-quote breakout", () => {
    /* If escapeHtml left single quotes alone, an attribute value quoted
       with single quotes (title='${...}') would be vulnerable. */
    const out = escapeHtml(`x' onclick='alert(1)`);
    assert.ok(!out.includes("'"));
    assert.ok(out.includes("&#39;"));
  });

  it("does not introduce unwanted characters when the input is benign", () => {
    /* Sanity check: ordinary prose with no special characters is passed
       through verbatim. Helps prove that future "smart escaping" tweaks
       do not over-escape benign text. */
    const input = "MVP and Release tiers, Turkish and English copy.";
    assert.equal(escapeHtml(input), input);
  });
});

describe("stripHtml: tag removal and entity decoding", () => {
  it("removes a simple tag", () => {
    assert.equal(stripHtml("<p>Hello</p>"), "Hello");
  });

  it("removes nested tags", () => {
    assert.equal(stripHtml("<p><strong>Hi</strong> there</p>"), "Hi there");
  });

  it("removes self-closing tags (no space inserted between adjacent text)", () => {
    /* The contract is "matched by /<[^>]+>/g"; this includes void and
       self-closing forms. Important caveat: the helper does not insert
       a separator where a tag was removed, so "A<br/>B" becomes "AB",
       not "A B". The single in-app use site for stripHtml feeds HTML
       that already separates words with whitespace, so this is benign;
       a future caller that relies on word boundaries should normalize
       its input first or insert spaces around tag removal. */
    assert.equal(stripHtml("Line A<br />Line B"), "Line ALine B");
    assert.equal(stripHtml("Line A<br/>Line B"), "Line ALine B");
  });

  it("decodes the five XSS escapes back to plain characters", () => {
    /* stripHtml is the inverse direction: takes display HTML, returns the
       plain text that should appear in search-index fields. The decode
       order is the reverse of escapeHtml (everything else, then &amp;
       last) so encoded ampersands do not double-decode prematurely. */
    assert.equal(stripHtml("Tom &amp; Jerry"), "Tom & Jerry");
    assert.equal(stripHtml("a &lt; b"), "a < b");
    assert.equal(stripHtml("b &gt; a"), "b > a");
    assert.equal(stripHtml("&quot;quoted&quot;"), `"quoted"`);
    assert.equal(stripHtml("it&#39;s"), "it's");
  });

  it("decodes a non-breaking space to a regular space", () => {
    assert.equal(stripHtml("a&nbsp;b"), "a b");
  });

  it("collapses runs of whitespace into a single space", () => {
    /* This is what makes the result usable as a `data-search` attribute
       value: search-by-substring runs against a normalized form. */
    assert.equal(stripHtml("  a    b   c  "), "a b c");
    assert.equal(stripHtml("a\n\n\nb"), "a b");
    assert.equal(stripHtml("a\t\t\tb"), "a b");
  });

  it("returns empty string for null", () => {
    /* The helper uses `String(str || "")`, so null and undefined both
       collapse to "" before the regex pass. */
    assert.equal(stripHtml(null), "");
  });

  it("returns empty string for undefined", () => {
    assert.equal(stripHtml(undefined), "");
  });

  it("returns empty string for empty input", () => {
    assert.equal(stripHtml(""), "");
  });

  it("returns empty string for a string of only tags or whitespace", () => {
    assert.equal(stripHtml("<div></div>"), "");
    assert.equal(stripHtml("   \n\t  "), "");
  });

  it("coerces numbers via String()", () => {
    /* Same coercion contract as escapeHtml: must not throw on a numeric
       input. */
    assert.equal(stripHtml(42), "42");
  });

  it("handles a mixed HTML + entity payload", () => {
    const input = "<p>Tom &amp; Jerry&#39;s &lt;b&gt;day&lt;/b&gt;</p>";
    assert.equal(stripHtml(input), "Tom & Jerry's <b>day</b>");
  });

  it("strips a payload that contains an inline-script attempt (defense in depth)", () => {
    /* The strip helper is used for the data-search attribute. If the
       source contained a payload like the one below, the search index
       must still be the readable text. */
    const input = `<a href="x" onclick="alert(1)">click me</a>`;
    assert.equal(stripHtml(input), "click me");
  });
});

describe("escapeHtml + stripHtml: round-trip behavior on benign text", () => {
  /* The two helpers are not strict inverses (escape -> strip would lose
     real ampersands in the round-trip), but on text that contains no
     entities the round-trip is the identity function. This is enough to
     guarantee that ordinary search-index values stay readable after one
     escape and one strip pass. */
  it("plain prose survives escape -> strip", () => {
    const input = "Backend cevap suresini olc.";
    assert.equal(stripHtml(escapeHtml(input)), input);
  });

  it("text with quotes survives escape -> strip", () => {
    const input = `say "hi" and 'bye'`;
    assert.equal(stripHtml(escapeHtml(input)), input);
  });

  it("text with angle brackets survives escape -> strip", () => {
    const input = "a < b > c";
    assert.equal(stripHtml(escapeHtml(input)), input);
  });
});
