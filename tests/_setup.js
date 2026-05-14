/* Test setup for the Mobile App Quality Checklist PWA.

   The app uses script-mode globals (no ES modules). To test the real
   resolveLevel and tx functions without modifying source, we load the
   relevant js/*.js files into a fresh node:vm context that has minimal
   browser-style globals stubbed (localStorage, window, document).

   Public surface:
     loadAppContext()                       returns a fresh sandbox object
                                            whose properties are the script-
                                            mode globals of the loaded
                                            files (tx, resolveLevel, ...).

     loadAppContext({ extraFiles: [...] })  same but also loads the listed
                                            extra files into the same realm,
                                            useful for data-driven tests
                                            that need js/03-data.js.

     loadAppContext({ localStorageSeed:     pre-populates the in-memory
       { key: "value", ... } })             localStorage stub BEFORE the
                                            script files run, so migration
                                            tests can simulate a returning
                                            user with legacy data.

   The script-mode globals (`let currentLang` etc.) live in the realm's
   script lexical scope, not on the sandbox object. To mutate them from
   tests, the setup injects an adapter script that exposes
   ctx.__setAxes({lang, style, framework, backend}) and
   ctx.__getAxes() functions on the sandbox. Tests should use those.

   The adapter also mirrors a few common script-mode bindings onto the
   sandbox so tests can read them directly: tx, resolveLevel,
   VALID_FRAMEWORKS, VALID_BACKENDS, and DATA when it has been loaded
   via extraFiles.

   No file under js/ is modified. No network, no real localStorage, no
   timing. The context is fresh per loadAppContext() call so tests are
   independent.
*/

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const REPO_ROOT = path.resolve(__dirname, "..");

/* Source files loaded in order. Only the files needed to define
   tx + resolveLevel and the globals they read are included. Render,
   UI helpers, clipboard, service worker registration, and the app
   bootstrap are intentionally excluded so the sandbox stays minimal. */
const SCRIPT_FILES = [
  "js/01-i18n-strings.js",
  "js/04-projects.js",
  "js/04-storage.js",
  "js/05-framework.js",
  "js/05-backend.js",
  "js/06-view-state.js",
];

/* Convenience: the full list of files that needs to be loaded for tests
   that depend on the populated DATA array. Mirrors the load order in
   index.html: each per-category file pushes its category onto
   window.DATA, and js/03-data.js exposes the const DATA referencing it.
   Pass this list as `extraFiles` to loadAppContext. */
const DATA_FILES = [
  "js/03a-data-01-idea-planning.js",
  "js/03b-data-02-design.js",
  "js/03c-data-03-code-layout.js",
  "js/03d-data-04-git.js",
  "js/03e-data-05-api.js",
  "js/03f-data-06-backend.js",
  "js/03g-data-07-offline.js",
  "js/03h-data-08-testing.js",
  "js/03i-data-09-security.js",
  "js/03j-data-10-a11y.js",
  "js/03k-data-11-release.js",
  "js/03l-data-12-monetization.js",
  "js/03m-data-13-analytics.js",
  "js/03n-data-14-cicd.js",
  "js/03-data.js",
];

/* In-memory localStorage stub. Tests start with no keys, so loadState /
   loadNotes / loadCollapsed / loadFramework / loadBackend all gracefully
   return defaults; currentFramework / currentBackend land as null and
   we override them per test. */
function makeLocalStorageStub() {
  const store = new Map();
  return {
    getItem(k) {
      return store.has(k) ? store.get(k) : null;
    },
    setItem(k, v) {
      store.set(String(k), String(v));
    },
    removeItem(k) {
      store.delete(String(k));
    },
    clear() {
      store.clear();
    },
    key(i) {
      return Array.from(store.keys())[i] ?? null;
    },
    get length() {
      return store.size;
    },
  };
}

/* A no-op DOM element stub. The loaded source files attach top-level
   event listeners (e.g. js/07-ui-helpers.js line 77 binds the confirm
   modal's Yes button at module evaluation time), so loadAppContext
   needs to return something with `addEventListener` from every
   getElementById and querySelector call. The stub is deliberately
   permissive: every common element property and method is a no-op or
   returns another stub, so any unexpected DOM access during module
   evaluation degrades silently instead of crashing the test. */
function makeStubEl() {
  return {
    addEventListener() {},
    removeEventListener() {},
    appendChild() {},
    removeChild() {},
    remove() {},
    setAttribute() {},
    removeAttribute() {},
    getAttribute() {
      return null;
    },
    classList: {
      add() {},
      remove() {},
      toggle() {},
      contains() {
        return false;
      },
      replace() {},
    },
    style: {},
    dataset: {},
    querySelector() {
      return makeStubEl();
    },
    querySelectorAll() {
      return [];
    },
    closest() {
      return null;
    },
    matches() {
      return false;
    },
    textContent: "",
    innerHTML: "",
    value: "",
    hidden: false,
    disabled: false,
    focus() {},
    blur() {},
    click() {},
  };
}

function makeDocStub() {
  return {
    addEventListener() {},
    removeEventListener() {},
    createElement() {
      return makeStubEl();
    },
    createTextNode(text) {
      return { textContent: String(text), nodeType: 3 };
    },
    getElementById() {
      return makeStubEl();
    },
    querySelector() {
      return makeStubEl();
    },
    querySelectorAll() {
      return [];
    },
    body: makeStubEl(),
    documentElement: makeStubEl(),
  };
}

function loadAppContext({ extraFiles = [], localStorageSeed = null } = {}) {
  const localStorage = makeLocalStorageStub();
  if (localStorageSeed && typeof localStorageSeed === "object") {
    for (const key of Object.keys(localStorageSeed)) {
      localStorage.setItem(key, localStorageSeed[key]);
    }
  }
  const sandbox = {
    /* Browser-ish globals the loaded scripts reference at evaluation time. */
    localStorage,
    window: {},
    document: makeDocStub(),
    console,
  };
  /* Make window self-referential and expose localStorage on window too,
     mirroring real browser semantics in case any script accesses it
     either way. */
  sandbox.window.localStorage = localStorage;
  sandbox.globalThis = sandbox;

  const ctx = vm.createContext(sandbox);

  /* Load the default minimal set of files first, then any caller-requested
     extras. The order matters: extras may depend on earlier definitions
     (e.g. js/03-data.js relies on no earlier file but may grow to). */
  for (const rel of [...SCRIPT_FILES, ...extraFiles]) {
    const abs = path.join(REPO_ROOT, rel);
    const src = fs.readFileSync(abs, "utf8");
    vm.runInContext(src, ctx, { filename: rel });
  }

  /* Adapter: script-scoped let / const bindings (currentLang, DATA, ...)
     are shared across runInContext calls in the same realm, but not
     visible as sandbox properties. We inject setter / getter functions
     and selective mirrors that close over the same lexical scope. */
  const adapterSrc = `
    (function () {
      globalThis.__setAxes = function (opts) {
        if (opts && "lang"      in opts) currentLang      = opts.lang;
        if (opts && "style"     in opts) currentStyle     = opts.style;
        if (opts && "framework" in opts) currentFramework = opts.framework;
        if (opts && "backend"   in opts) currentBackend   = opts.backend;
      };
      globalThis.__getAxes = function () {
        return {
          lang:      currentLang,
          style:     currentStyle,
          framework: currentFramework,
          backend:   currentBackend
        };
      };
      /* Mirror commonly-tested script bindings onto the sandbox. The DATA
         constant is only defined when the caller loaded js/03-data.js via
         extraFiles, so guard with typeof to avoid a ReferenceError. */
      globalThis.tx               = tx;
      globalThis.resolveLevel     = resolveLevel;
      globalThis.VALID_FRAMEWORKS = VALID_FRAMEWORKS;
      globalThis.VALID_BACKENDS   = VALID_BACKENDS;
      if (typeof DATA !== "undefined") globalThis.DATA = DATA;

      /* UI helpers, render helpers, progress, AI prompt builders, and
         filter helpers: mirrored only when the caller loaded the relevant
         source via extraFiles. Typeof guards keep this safe for the
         legacy resolver / projects / data tests that do not need them. */
      if (typeof escapeHtml              === "function") globalThis.escapeHtml              = escapeHtml;
      if (typeof stripHtml               === "function") globalThis.stripHtml               = stripHtml;
      if (typeof countLevels             === "function") globalThis.countLevels             = countLevels;
      if (typeof countHowtoSteps         === "function") globalThis.countHowtoSteps         = countHowtoSteps;
      if (typeof countCheckedStepsByPrefix === "function") globalThis.countCheckedStepsByPrefix = countCheckedStepsByPrefix;
      if (typeof buildAIPromptTR         === "function") globalThis.buildAIPromptTR         = buildAIPromptTR;
      if (typeof buildAIPromptJSON       === "function") globalThis.buildAIPromptJSON       = buildAIPromptJSON;
      if (typeof shouldShowFeature       === "function") globalThis.shouldShowFeature       = shouldShowFeature;

      /* Test-only state setter. The script-mode "state" let binding is
         declared in js/06-view-state.js (loaded by SCRIPT_FILES) and is
         mutated cross-file in the real app via the JSON import handler
         and the reset flows. Tests use this helper to seed state without
         touching the realm directly. Non-object inputs are coerced to an
         empty object so "wipe state" is trivial. */
      globalThis.__setState = function (next) {
        state = (next && typeof next === "object" && !Array.isArray(next)) ? next : {};
      };

      /* Multi-project store: mirror the public API and constants. The
         private projectsStore binding is exposed through a getter so tests
         can inspect raw state without being able to clobber it accidentally. */
      globalThis.createProject          = createProject;
      globalThis.renameProject          = renameProject;
      globalThis.deleteProject          = deleteProject;
      globalThis.listProjects           = listProjects;
      globalThis.projectsCount          = projectsCount;
      globalThis.findProjectById        = findProjectById;
      globalThis.projectExistsByName    = projectExistsByName;
      globalThis.getActiveProject       = getActiveProject;
      globalThis.getActiveProjectData   = getActiveProjectData;
      globalThis.getActiveProjectId     = getActiveProjectId;
      globalThis.getProjectField        = getProjectField;
      globalThis.setProjectField        = setProjectField;
      globalThis.setActiveProjectId     = setActiveProjectId;
      globalThis.resetAllProjects       = resetAllProjects;
      globalThis.emptyProjectData       = emptyProjectData;
      globalThis.PROJECTS_KEY           = PROJECTS_KEY;
      globalThis.PROJECTS_LIMIT         = PROJECTS_LIMIT;
      globalThis.PROJECT_NAME_MAX       = PROJECT_NAME_MAX;
      globalThis.LEGACY_KEYS            = LEGACY_KEYS;
      globalThis.__getProjectsStore     = function () { return projectsStore; };
    })();
  `;
  vm.runInContext(adapterSrc, ctx, { filename: "tests/_adapter.js" });

  return sandbox;
}

module.exports = { loadAppContext, DATA_FILES };
