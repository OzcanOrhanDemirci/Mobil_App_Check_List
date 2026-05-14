/* Schema and content-integrity tests for js/03-data.js.

   The data file is hand-authored and growing. These tests guard against the
   easy-to-miss regressions that the resolver tests cannot catch:

     - The big-picture counts (14 categories, 55 features) drift silently.
     - A new feature lands without one of its required TR / EN translations.
     - A feature id is duplicated, breaking deep-link / search by id.
     - A new framework or backend variant key is misspelled and silently
       falls through the resolver chain.
     - An em-dash slips into prose content (violates the project's
       em-dash content rule documented in CONTRIBUTING.md). The standalone
       placeholder string "—" is allowed; see the resolver and 03-data.js
       comments for the "empty cell" convention.

   The tests load the real js/03-data.js into a node:vm sandbox via
   _setup.js, so no test fixture has to be kept in sync with the data file.
*/

"use strict";

const { describe, it, before } = require("node:test");
const assert = require("node:assert/strict");
const { loadAppContext, DATA_FILES } = require("./_setup.js");

/* Expected counts, in lockstep with README.md and CHANGELOG.md.
   Changing the data file SHOULD force a docs update; this test makes
   that requirement explicit. */
const EXPECTED_CATEGORY_COUNT = 14;
const EXPECTED_FEATURE_COUNT = 55;

const PLACEHOLDER = "—";
const EM_DASH = "—";

/* Walk an arbitrarily nested JS value and invoke `visit(value, pathParts)`
   for every string leaf. pathParts is the chain of property names / array
   indices leading to the leaf, useful for error messages. */
function walkStrings(value, visit, pathParts = []) {
  if (typeof value === "string") {
    visit(value, pathParts);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, i) => walkStrings(item, visit, [...pathParts, i]));
    return;
  }
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      walkStrings(value[key], visit, [...pathParts, key]);
    }
  }
}

/* Load DATA + axis constants once for the whole suite. The tests are
   read-only against the loaded data, so sharing is safe and keeps run
   time low even for the 855 KB data file. */
let DATA;
let VALID_FRAMEWORKS;
let VALID_BACKENDS;

before(() => {
  /* Load every per-category file plus the combining stub. DATA_FILES is
     exported from _setup.js so the file list stays in one place if a new
     category is added or renamed. */
  const ctx = loadAppContext({ extraFiles: DATA_FILES });
  DATA = ctx.DATA;
  VALID_FRAMEWORKS = ctx.VALID_FRAMEWORKS;
  VALID_BACKENDS = ctx.VALID_BACKENDS;
});

describe("DATA top-level shape", () => {
  it("is an array", () => {
    assert.ok(Array.isArray(DATA), "DATA must be an array");
  });

  it(`has exactly ${EXPECTED_CATEGORY_COUNT} categories (matches README and CHANGELOG)`, () => {
    assert.equal(DATA.length, EXPECTED_CATEGORY_COUNT);
  });

  it(`has exactly ${EXPECTED_FEATURE_COUNT} features across all categories (matches README and CHANGELOG)`, () => {
    const total = DATA.reduce((acc, cat) => acc + (cat.features ? cat.features.length : 0), 0);
    assert.equal(total, EXPECTED_FEATURE_COUNT);
  });
});

describe("Category records", () => {
  it("every category has id, title, sub, features", () => {
    for (const cat of DATA) {
      assert.equal(typeof cat.id, "string", `category id must be a string (got ${cat.id})`);
      assert.ok(cat.title && typeof cat.title === "object", `category ${cat.id} must have a title object`);
      assert.ok(cat.sub && typeof cat.sub === "object", `category ${cat.id} must have a sub object`);
      assert.ok(Array.isArray(cat.features), `category ${cat.id} must have a features array`);
    }
  });

  it("every category id is unique", () => {
    const seen = new Set();
    for (const cat of DATA) {
      assert.ok(!seen.has(cat.id), `duplicate category id: ${cat.id}`);
      seen.add(cat.id);
    }
  });

  it("every category id is a two-digit, zero-padded string from 01..N", () => {
    DATA.forEach((cat, i) => {
      const expected = String(i + 1).padStart(2, "0");
      assert.equal(cat.id, expected, `category at index ${i} has id ${cat.id}, expected ${expected}`);
    });
  });

  it("every category title has non-empty TR and EN", () => {
    for (const cat of DATA) {
      assert.ok(cat.title.tr && cat.title.tr.trim(), `category ${cat.id} missing or empty title.tr`);
      assert.ok(cat.title.en && cat.title.en.trim(), `category ${cat.id} missing or empty title.en`);
    }
  });

  it("every category sub has non-empty TR and EN", () => {
    for (const cat of DATA) {
      assert.ok(cat.sub.tr && cat.sub.tr.trim(), `category ${cat.id} missing or empty sub.tr`);
      assert.ok(cat.sub.en && cat.sub.en.trim(), `category ${cat.id} missing or empty sub.en`);
    }
  });
});

describe("Feature records", () => {
  it("every feature has id, title, desc", () => {
    for (const cat of DATA) {
      for (const f of cat.features) {
        assert.equal(typeof f.id, "string", `feature in category ${cat.id} has non-string id (${f.id})`);
        assert.ok(f.title && typeof f.title === "object", `feature ${f.id} must have a title object`);
        assert.ok(f.desc && typeof f.desc === "object", `feature ${f.id} must have a desc object`);
      }
    }
  });

  it("every feature title has non-empty TR and EN", () => {
    for (const cat of DATA) {
      for (const f of cat.features) {
        assert.ok(f.title.tr && f.title.tr.trim(), `feature ${f.id} missing or empty title.tr`);
        assert.ok(f.title.en && f.title.en.trim(), `feature ${f.id} missing or empty title.en`);
      }
    }
  });

  it("every feature desc has non-empty TR and EN", () => {
    for (const cat of DATA) {
      for (const f of cat.features) {
        assert.ok(f.desc.tr && f.desc.tr.trim(), `feature ${f.id} missing or empty desc.tr`);
        assert.ok(f.desc.en && f.desc.en.trim(), `feature ${f.id} missing or empty desc.en`);
      }
    }
  });

  it("every feature id is unique across the whole DATA", () => {
    const seen = new Map();
    for (const cat of DATA) {
      for (const f of cat.features) {
        if (seen.has(f.id)) {
          assert.fail(`duplicate feature id ${f.id}: appears in category ${seen.get(f.id)} and ${cat.id}`);
        }
        seen.set(f.id, cat.id);
      }
    }
  });

  it('feature id prefix matches the parent category number (e.g. "6.3" lives in category "06")', () => {
    for (const cat of DATA) {
      const expectedPrefix = String(Number(cat.id));
      for (const f of cat.features) {
        const dotIndex = f.id.indexOf(".");
        assert.ok(dotIndex > 0, `feature id ${f.id} must contain a "." separator`);
        const actualPrefix = f.id.slice(0, dotIndex);
        assert.equal(
          actualPrefix,
          expectedPrefix,
          `feature ${f.id} is in category ${cat.id} but its id prefix is "${actualPrefix}" (expected "${expectedPrefix}")`
        );
      }
    }
  });
});

describe("Axis variant keys", () => {
  it("every variants key is a valid framework", () => {
    for (const cat of DATA) {
      for (const f of cat.features) {
        if (!f.variants) continue;
        for (const key of Object.keys(f.variants)) {
          assert.ok(
            VALID_FRAMEWORKS.includes(key),
            `feature ${f.id} has variants.${key}; not in VALID_FRAMEWORKS [${VALID_FRAMEWORKS.join(", ")}]`
          );
        }
      }
    }
  });

  it("every backendVariants key is a valid backend", () => {
    for (const cat of DATA) {
      for (const f of cat.features) {
        if (!f.backendVariants) continue;
        for (const key of Object.keys(f.backendVariants)) {
          assert.ok(
            VALID_BACKENDS.includes(key),
            `feature ${f.id} has backendVariants.${key}; not in VALID_BACKENDS [${VALID_BACKENDS.join(", ")}]`
          );
        }
      }
    }
  });

  it('inside backendVariants[backend], keys are "_default" or a valid framework', () => {
    for (const cat of DATA) {
      for (const f of cat.features) {
        if (!f.backendVariants) continue;
        for (const backend of Object.keys(f.backendVariants)) {
          for (const innerKey of Object.keys(f.backendVariants[backend])) {
            if (innerKey === "_default") continue;
            assert.ok(
              VALID_FRAMEWORKS.includes(innerKey),
              `feature ${f.id} has backendVariants.${backend}.${innerKey}; expected "_default" or a valid framework`
            );
          }
        }
      }
    }
  });

  it("every simpleBackend key is a valid backend", () => {
    for (const cat of DATA) {
      for (const f of cat.features) {
        if (!f.simpleBackend) continue;
        for (const key of Object.keys(f.simpleBackend)) {
          assert.ok(VALID_BACKENDS.includes(key), `feature ${f.id} has simpleBackend.${key}; not in VALID_BACKENDS`);
        }
      }
    }
  });
});

describe("Optional level blocks (mvp / release / simple)", () => {
  it("simple block, when present, has at least one of mvp or release with TR or EN content", () => {
    for (const cat of DATA) {
      for (const f of cat.features) {
        if (!f.simple) continue;
        const hasMvp = f.simple.mvp && (f.simple.mvp.tr || f.simple.mvp.en);
        const hasRelease = f.simple.release && (f.simple.release.tr || f.simple.release.en);
        assert.ok(
          hasMvp || hasRelease,
          `feature ${f.id} has a simple block but neither mvp nor release inside it carries content`
        );
      }
    }
  });

  it("backendStep, when present, is a boolean", () => {
    for (const cat of DATA) {
      for (const f of cat.features) {
        if (!("backendStep" in f)) continue;
        assert.equal(
          typeof f.backendStep,
          "boolean",
          `feature ${f.id} backendStep must be boolean (got ${typeof f.backendStep})`
        );
      }
    }
  });
});

describe("How-to guide shape", () => {
  it("if howto is present it is an object", () => {
    for (const cat of DATA) {
      for (const f of cat.features) {
        if (!("howto" in f)) continue;
        assert.ok(f.howto && typeof f.howto === "object", `feature ${f.id} has a non-object howto`);
      }
    }
  });

  it("howto.variants keys, if present, are valid frameworks", () => {
    for (const cat of DATA) {
      for (const f of cat.features) {
        if (!f.howto || !f.howto.variants) continue;
        for (const key of Object.keys(f.howto.variants)) {
          assert.ok(
            VALID_FRAMEWORKS.includes(key),
            `feature ${f.id} has howto.variants.${key}; not in VALID_FRAMEWORKS`
          );
        }
      }
    }
  });

  it("howto.backendVariants keys, if present, are valid backends", () => {
    for (const cat of DATA) {
      for (const f of cat.features) {
        if (!f.howto || !f.howto.backendVariants) continue;
        for (const key of Object.keys(f.howto.backendVariants)) {
          assert.ok(
            VALID_BACKENDS.includes(key),
            `feature ${f.id} has howto.backendVariants.${key}; not in VALID_BACKENDS`
          );
        }
      }
    }
  });
});

describe("Em-dash content rule", () => {
  it('no string value inside DATA contains an em-dash, except the standalone placeholder "—"', () => {
    const violations = [];
    walkStrings(DATA, (str, pathParts) => {
      if (str === PLACEHOLDER) return;
      if (str.includes(EM_DASH)) {
        violations.push(`${pathParts.join(".")}: ${str.slice(0, 120)}`);
      }
    });
    assert.equal(
      violations.length,
      0,
      `${violations.length} em-dash violation(s) inside DATA strings:\n  ${violations.slice(0, 10).join("\n  ")}${violations.length > 10 ? "\n  ..." : ""}`
    );
  });
});

/* The render path in js/11-render.js writes DATA strings directly into
   HTML via template literals (e.g. `<h3>${fTitle}</h3>`, `<p>${fDesc}</p>`)
   with no escapeHtml step. This is deliberate: DATA is hand-authored
   content that legitimately contains tags like <strong>, <em>, <code>,
   <span class="hint">, and <a href="https://..."> for documentation
   links. The invariants below pin the trust boundary, so a future
   contributor who adds a <script> tag, an inline event handler, or a
   javascript: URL trips the suite immediately.

   The XSS defense at the application layer is escapeHtml in
   js/07-ui-helpers.js, which is applied to user-controlled inputs
   (project names, free-form notes, JSON-imported state). DATA is on
   the OTHER side of that boundary; these tests enforce its safety
   directly. */
describe("XSS-safety invariants (DATA is interpolated into innerHTML)", () => {
  /* Tags that either run script (<script>), can host script through
     attributes (<svg> via on*=), pull external resources (<iframe>,
     <object>, <embed>, <link>, <meta>, <base>), inject style (<style>),
     or break out of a documentation context (<form> and friends). The
     allow-list is by absence: anything not banned here is fine, so
     <strong>, <em>, <code>, <span class="hint">, <a href="https://...">,
     and ordinary inline / block formatting all pass. */
  const DANGEROUS_TAG_PATTERNS = [
    { name: "<script>", re: /<script\b/i },
    { name: "<iframe>", re: /<iframe\b/i },
    { name: "<object>", re: /<object\b/i },
    { name: "<embed>", re: /<embed\b/i },
    { name: "<svg>", re: /<svg\b/i },
    { name: "<style>", re: /<style\b/i },
    { name: "<link>", re: /<link\b/i },
    { name: "<meta>", re: /<meta\b/i },
    { name: "<base>", re: /<base\b/i },
    { name: "<form>", re: /<form\b/i },
    { name: "<input>", re: /<input\b/i },
    { name: "<textarea>", re: /<textarea\b/i },
    { name: "<button>", re: /<button\b/i },
    { name: "<select>", re: /<select\b/i },
    { name: "<option>", re: /<option\b/i },
  ];

  /* Inline event-handler attribute. Must be preceded by whitespace
     (attribute context); otherwise innocent words like "one" or
     "online" would match. The pattern is " onSOMETHING=" with optional
     spaces around the equals sign. */
  const EVENT_HANDLER_RE = /\son[a-z]+\s*=/i;

  /* URL schemes that can execute script or render hostile content when
     interpolated into href / src attributes. data: is allowed for image
     URLs (data:image/png;base64,...) but text/html is rejected because
     it can carry script. */
  const DANGEROUS_URL_PATTERNS = [
    { name: "javascript: URL", re: /javascript:/i },
    { name: "vbscript: URL", re: /vbscript:/i },
    { name: "data:text/html URL", re: /data:\s*text\/html/i },
  ];

  for (const { name, re } of DANGEROUS_TAG_PATTERNS) {
    it(`no DATA string contains a ${name} tag`, () => {
      const hits = [];
      walkStrings(DATA, (str, pathParts) => {
        if (re.test(str)) hits.push(`${pathParts.join(".")}: ${str.slice(0, 120)}`);
      });
      assert.equal(
        hits.length,
        0,
        `${hits.length} ${name} violation(s):\n  ${hits.slice(0, 5).join("\n  ")}${hits.length > 5 ? "\n  ..." : ""}`
      );
    });
  }

  it("no DATA string contains an inline event-handler attribute (onclick=, onerror=, onload=, etc.)", () => {
    const hits = [];
    walkStrings(DATA, (str, pathParts) => {
      if (EVENT_HANDLER_RE.test(str)) hits.push(`${pathParts.join(".")}: ${str.slice(0, 120)}`);
    });
    assert.equal(
      hits.length,
      0,
      `${hits.length} event-handler violation(s):\n  ${hits.slice(0, 5).join("\n  ")}${hits.length > 5 ? "\n  ..." : ""}`
    );
  });

  for (const { name, re } of DANGEROUS_URL_PATTERNS) {
    it(`no DATA string contains a ${name}`, () => {
      const hits = [];
      walkStrings(DATA, (str, pathParts) => {
        if (re.test(str)) hits.push(`${pathParts.join(".")}: ${str.slice(0, 120)}`);
      });
      assert.equal(
        hits.length,
        0,
        `${hits.length} ${name} violation(s):\n  ${hits.slice(0, 5).join("\n  ")}${hits.length > 5 ? "\n  ..." : ""}`
      );
    });
  }

  it("every <a> tag, if present, uses an http(s) href (not javascript:, not data:)", () => {
    /* Belt-and-suspenders: the URL checks above already reject
       javascript: / data:text/html anywhere in DATA. This test makes the
       intent explicit at the <a> tag level so a contributor reading the
       failure understands the contract: links must be public URLs. */
    const hits = [];
    const anchorWithHref = /<a\s+[^>]*href\s*=\s*["']([^"']*)["']/gi;
    walkStrings(DATA, (str, pathParts) => {
      let m;
      while ((m = anchorWithHref.exec(str)) !== null) {
        const href = m[1].trim().toLowerCase();
        if (!/^https?:\/\//.test(href)) {
          hits.push(`${pathParts.join(".")}: href="${href}"`);
        }
      }
    });
    assert.equal(hits.length, 0, `${hits.length} non-http(s) anchor href(s):\n  ${hits.slice(0, 5).join("\n  ")}`);
  });
});
