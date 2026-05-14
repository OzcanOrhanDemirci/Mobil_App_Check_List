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
    document: { addEventListener() {}, removeEventListener() {} },
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

module.exports = { loadAppContext };
