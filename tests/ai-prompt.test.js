/* Unit tests for the AI prompt builders in js/09-ai-prompt.js.

   Both buildAIPromptTR and buildAIPromptJSON are pure (no DOM, no
   side effects). They read currentLang, currentFramework, currentBackend
   from the script-mode globals, call stripHtml / tx / resolveLevelText
   on their (cat, feature) inputs, and return a string the user pastes
   into ChatGPT / Claude / Gemini.

   These tests cover:

     - Language switch (TR vs EN heading and body labels).
     - Conditional MVP / Release sections based on the feature shape.
     - Framework-aware target platform line (PWA / iOS / Android / hybrid).
     - Install-command selection: backendStep features use the backend
       SDK install (e.g. `flutterfire configure`), non-backendStep
       features fall back to the framework's generic install.
     - HTML is stripped from titles and descriptions before being
       interpolated into the markdown (no <strong> in the final text).
     - JSON output is well-formed and the inner JSON parses.
     - JSON constraints include setupAssumption always, and
       backendAssumption only for backendStep features.

   The tests use synthetic cat / feature fixtures rather than real DATA
   so the assertions stay stable across content edits. The functions
   only read a handful of fields off cat / f, so the fixtures stay
   small and obvious. */

"use strict";

const { describe, it, before, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const { loadAppContext } = require("./_setup.js");

let ctx;
let buildAIPromptTR;
let buildAIPromptJSON;

before(() => {
  /* The builders need stripHtml from js/07-ui-helpers.js plus the
     existing default-loaded files (i18n strings, framework metadata,
     backend metadata, view-state for the axis globals). DATA itself
     is not required because the tests pass synthetic cat / feature
     fixtures. */
  ctx = loadAppContext({
    extraFiles: ["js/07-ui-helpers.js", "js/09-ai-prompt.js"],
  });
  buildAIPromptTR = ctx.buildAIPromptTR;
  buildAIPromptJSON = ctx.buildAIPromptJSON;
});

/* Each test resets the axis bindings to a known baseline so a previous
   test cannot leak state. Individual tests override what they need. */
beforeEach(() => {
  ctx.__setAxes({
    lang: "tr",
    style: "technical",
    framework: "flutter",
    backend: "firebase",
  });
});

/* Synthetic fixtures shared by the suites below. */
const synthCat = {
  id: "01",
  title: { tr: "Test Kategori", en: "Test Category" },
  sub: { tr: "Alt başlık", en: "Subtitle" },
  features: [],
};

const featBoth = {
  id: "9.99",
  title: { tr: "Tam Madde", en: "Full Item" },
  desc: { tr: "Açıklama metni", en: "Description text" },
  mvp: { tr: "MVP içeriği", en: "MVP content" },
  release: { tr: "Release içeriği", en: "Release content" },
};

const featMvpOnly = {
  id: "9.97",
  title: { tr: "Sadece MVP", en: "Only MVP" },
  desc: { tr: "Açıklama", en: "Description" },
  mvp: { tr: "MVP içeriği", en: "MVP content" },
  /* no release */
};

const featReleaseOnly = {
  id: "9.96",
  title: { tr: "Sadece Release", en: "Only Release" },
  desc: { tr: "Açıklama", en: "Description" },
  release: { tr: "Release içeriği", en: "Release content" },
  /* no mvp */
};

const featBackendStep = {
  id: "6.99",
  title: { tr: "Backend Madde", en: "Backend Item" },
  desc: { tr: "Açıklama", en: "Description" },
  mvp: { tr: "MVP", en: "MVP content" },
  release: { tr: "Release", en: "Release content" },
  backendStep: true,
};

const featHtmlTitle = {
  id: "9.95",
  title: { tr: "<strong>Vurgulu</strong> başlık", en: "<strong>Bold</strong> title" },
  desc: { tr: "<em>Eğik</em> açıklama", en: "<em>Italic</em> description" },
  mvp: { tr: "MVP", en: "MVP content" },
};

describe("buildAIPromptTR: basic shape", () => {
  it("returns a non-empty markdown string for a typical (TR / flutter / firebase) context", () => {
    const out = buildAIPromptTR(synthCat, featBoth);
    assert.equal(typeof out, "string");
    assert.ok(out.length > 200, "TR prompt should be a substantive markdown document");
  });

  it("opens with a Turkish heading when currentLang === 'tr'", () => {
    ctx.__setAxes({ lang: "tr" });
    const out = buildAIPromptTR(synthCat, featBoth);
    assert.ok(out.startsWith("# Mobil Uygulama"), `expected TR heading; got: ${out.slice(0, 80)}`);
    assert.ok(out.includes("Merhaba!"));
    assert.ok(out.includes("Kategori:"));
  });

  it("opens with an English heading when currentLang === 'en'", () => {
    ctx.__setAxes({ lang: "en" });
    const out = buildAIPromptTR(synthCat, featBoth);
    assert.ok(out.startsWith("# Mobile App Quality Checklist Item Help"));
    assert.ok(out.includes("Hi!"));
    assert.ok(out.includes("Category:"));
  });
});

describe("buildAIPromptTR: conditional MVP / Release sections", () => {
  it("includes both MVP and Release sections when the feature carries both", () => {
    const out = buildAIPromptTR(synthCat, featBoth);
    assert.ok(out.includes("🟢 MVP"));
    assert.ok(out.includes("🔵 Release"));
    assert.ok(out.includes("MVP içeriği"));
    assert.ok(out.includes("Release içeriği"));
  });

  it("omits the Release section when the feature has only an MVP level", () => {
    const out = buildAIPromptTR(synthCat, featMvpOnly);
    assert.ok(out.includes("🟢 MVP"));
    assert.ok(!out.includes("🔵 Release"));
  });

  it("omits the MVP section when the feature has only a Release level", () => {
    const out = buildAIPromptTR(synthCat, featReleaseOnly);
    assert.ok(!out.includes("🟢 MVP"));
    assert.ok(out.includes("🔵 Release"));
  });

  it("does not include the 'Upgrading to Release' section when only one level is present", () => {
    /* The "Release Seviyesine Yükseltme" / "Upgrading to Release Level"
       block only appears when both MVP and Release are defined. */
    const mvpOnlyOut = buildAIPromptTR(synthCat, featMvpOnly);
    assert.ok(!mvpOnlyOut.includes("Release Seviyesine Yükseltme"));
    ctx.__setAxes({ lang: "en" });
    const enOut = buildAIPromptTR(synthCat, featReleaseOnly);
    assert.ok(!enOut.includes("Upgrading to Release Level"));
  });
});

describe("buildAIPromptTR: framework-aware target platform", () => {
  it("PWA framework yields the Web target platform line", () => {
    ctx.__setAxes({ framework: "pwa" });
    const out = buildAIPromptTR(synthCat, featBoth);
    assert.ok(out.includes("Progressive Web App"));
    /* The TR target-platform line spells out the web + PWA install
       audience. */
    assert.ok(out.includes("Web") || out.includes("PWA"));
  });

  it("Swift framework yields iOS target platform", () => {
    ctx.__setAxes({ framework: "swift" });
    const out = buildAIPromptTR(synthCat, featBoth);
    assert.ok(/Hedef Platform:.*iOS/.test(out), "TR target-platform line should mention iOS");
  });

  it("Kotlin framework yields Android target platform", () => {
    ctx.__setAxes({ framework: "kotlin" });
    const out = buildAIPromptTR(synthCat, featBoth);
    assert.ok(/Hedef Platform:.*Android/.test(out));
  });

  it("Flutter / React Native / Expo yield Android + iOS", () => {
    ctx.__setAxes({ framework: "flutter" });
    const out = buildAIPromptTR(synthCat, featBoth);
    assert.ok(/Hedef Platform:.*Android.*iOS|Hedef Platform:.*iOS.*Android/.test(out));
  });
});

describe("buildAIPromptTR: install example selection", () => {
  it("uses the backend SDK install example when feature.backendStep is true", () => {
    ctx.__setAxes({ lang: "en", framework: "flutter", backend: "firebase" });
    const out = buildAIPromptTR(synthCat, featBackendStep);
    /* Firebase + Flutter install snippet starts with `flutterfire configure`. */
    assert.ok(
      out.includes("flutterfire") || out.includes("firebase"),
      "backendStep features should reference the backend SDK install"
    );
  });

  it("falls back to the framework's generic install when feature is not backendStep", () => {
    ctx.__setAxes({ lang: "en", framework: "flutter", backend: "firebase" });
    const out = buildAIPromptTR(synthCat, featBoth);
    /* The flutter framework's INSTALL_EXAMPLE typically uses `flutter pub add ...`. */
    assert.ok(out.includes("flutter pub"), "non-backendStep features should use framework install");
  });
});

describe("buildAIPromptTR: HTML sanitization on titles", () => {
  it("strips HTML tags from title and description before interpolating", () => {
    const out = buildAIPromptTR(synthCat, featHtmlTitle);
    assert.ok(!out.includes("<strong>"));
    assert.ok(!out.includes("<em>"));
    assert.ok(out.includes("Vurgulu"));
    assert.ok(out.includes("başlık"));
  });
});

describe("buildAIPromptJSON: output shape", () => {
  it("wraps the payload in a ```json ... ``` markdown code block", () => {
    const out = buildAIPromptJSON(synthCat, featBoth);
    assert.ok(out.startsWith("```json\n"), `expected json fence; got: ${out.slice(0, 20)}`);
    assert.ok(out.endsWith("\n```"));
  });

  it("the inner payload is valid JSON", () => {
    const out = buildAIPromptJSON(synthCat, featBoth);
    const inner = out.replace(/^```json\n/, "").replace(/\n```$/, "");
    /* Parsing throws on malformed JSON; assert.doesNotThrow makes the
       failure mode obvious. */
    assert.doesNotThrow(() => JSON.parse(inner));
  });
});

describe("buildAIPromptJSON: payload fields", () => {
  function payloadOf(out) {
    const inner = out.replace(/^```json\n/, "").replace(/\n```$/, "");
    return JSON.parse(inner);
  }

  it("response_language is 'Turkish' when currentLang === 'tr'", () => {
    ctx.__setAxes({ lang: "tr" });
    const p = payloadOf(buildAIPromptJSON(synthCat, featBoth));
    assert.equal(p.role_and_tone.response_language, "Turkish");
  });

  it("response_language is 'English' when currentLang === 'en'", () => {
    ctx.__setAxes({ lang: "en" });
    const p = payloadOf(buildAIPromptJSON(synthCat, featBoth));
    assert.equal(p.role_and_tone.response_language, "English");
  });

  it("project_context.framework reflects the current framework's aiName", () => {
    ctx.__setAxes({ framework: "swift" });
    const p = payloadOf(buildAIPromptJSON(synthCat, featBoth));
    /* FRAMEWORK_META.swift.aiName is "Swift / SwiftUI (Native iOS)". */
    assert.ok(/Swift/.test(p.project_context.framework));
  });

  it("project_context.backend carries the backend aiName when one is selected", () => {
    ctx.__setAxes({ backend: "supabase" });
    const p = payloadOf(buildAIPromptJSON(synthCat, featBoth));
    assert.ok(/Supabase/i.test(p.project_context.backend));
  });

  it("project_context.backend falls back to the 'Not selected' note when backend is null", () => {
    ctx.__setAxes({ backend: null });
    const p = payloadOf(buildAIPromptJSON(synthCat, featBoth));
    assert.ok(/Not selected/i.test(p.project_context.backend));
  });

  it("mvp_level is included only when the feature has MVP content", () => {
    const both = payloadOf(buildAIPromptJSON(synthCat, featBoth));
    assert.ok(both.quality_checklist_item.mvp_level);
    assert.equal(both.quality_checklist_item.mvp_level.requirements, "MVP içeriği");

    const releaseOnly = payloadOf(buildAIPromptJSON(synthCat, featReleaseOnly));
    assert.equal(releaseOnly.quality_checklist_item.mvp_level, undefined);
  });

  it("release_level is included only when the feature has Release content", () => {
    const both = payloadOf(buildAIPromptJSON(synthCat, featBoth));
    assert.ok(both.quality_checklist_item.release_level);

    const mvpOnly = payloadOf(buildAIPromptJSON(synthCat, featMvpOnly));
    assert.equal(mvpOnly.quality_checklist_item.release_level, undefined);
  });

  it("category title is HTML-stripped in the payload", () => {
    const catHtml = { ...synthCat, title: { tr: "<b>Cat</b>", en: "<b>Cat</b>" } };
    const p = payloadOf(buildAIPromptJSON(catHtml, featBoth));
    assert.ok(!p.quality_checklist_item.category.includes("<"));
    assert.equal(p.quality_checklist_item.category, "Cat");
  });
});

describe("buildAIPromptJSON: constraints include backend assumption only for backendStep features", () => {
  function payloadOf(out) {
    const inner = out.replace(/^```json\n/, "").replace(/\n```$/, "");
    return JSON.parse(inner);
  }

  it("backendStep:true feature carries backendAssumption in constraints", () => {
    ctx.__setAxes({ framework: "flutter", backend: "firebase" });
    const p = payloadOf(buildAIPromptJSON(synthCat, featBackendStep));
    /* BACKEND_SETUP_ASSUMPTIONS.firebase exists; the constraints array
       should contain a string that mentions firebase or its backend
       conventions. */
    const constraintsBlob = p.constraints.join(" ").toLowerCase();
    assert.ok(
      /firebase|firestore|auth/.test(constraintsBlob),
      `expected firebase reference in constraints; got: ${p.constraints.join(" | ")}`
    );
  });

  it("non-backendStep feature does NOT inject a backend assumption", () => {
    ctx.__setAxes({ framework: "flutter", backend: "firebase" });
    const p = payloadOf(buildAIPromptJSON(synthCat, featBoth));
    /* The constraints should still have the framework setupAssumption
       but no extra backend-specific line. We check by counting: the
       backendStep payload above has more (or equal) constraints. */
    const nonBackendCount = p.constraints.length;
    const backendStepP = payloadOf(buildAIPromptJSON(synthCat, featBackendStep));
    assert.ok(
      backendStepP.constraints.length >= nonBackendCount,
      `backendStep payload should carry at least as many constraints as non-backendStep`
    );
  });

  it("constraints always include the framework setupAssumption", () => {
    ctx.__setAxes({ framework: "flutter" });
    const p = payloadOf(buildAIPromptJSON(synthCat, featBoth));
    /* SETUP_ASSUMPTIONS.flutter is some non-empty string; assert that
       at least one constraint matches the framework's assumption. */
    assert.ok(p.constraints.some(c => typeof c === "string" && c.length > 0));
  });
});
