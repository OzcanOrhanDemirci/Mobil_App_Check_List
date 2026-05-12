/* Test setup for the Mobile App Quality Checklist PWA.

   The app uses script-mode globals (no ES modules). To test the real
   resolveLevel and tx functions without modifying source, we load the
   relevant js/*.js files into a fresh node:vm context that has minimal
   browser-style globals stubbed (localStorage, window, document).

   Public surface:
     loadAppContext()   returns a fresh sandbox object whose properties
                        are the script-mode globals of the loaded files,
                        e.g. ctx.tx, ctx.resolveLevel, ctx.currentLang,
                        ctx.currentStyle, ctx.currentFramework,
                        ctx.currentBackend.

   The script-mode globals (`let currentLang` etc.) live in the realm's
   script lexical scope, not on the sandbox object. To mutate them from
   tests, the setup injects an adapter script that exposes
   ctx.__setAxes({lang, style, framework, backend}) and
   ctx.__getAxes() functions on the sandbox. Tests should use those.

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

function loadAppContext() {
  const localStorage = makeLocalStorageStub();
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

  for (const rel of SCRIPT_FILES) {
    const abs = path.join(REPO_ROOT, rel);
    const src = fs.readFileSync(abs, "utf8");
    vm.runInContext(src, ctx, { filename: rel });
  }

  /* Adapter: script-scoped let bindings (currentLang, currentStyle,
     currentFramework, currentBackend) are shared across runInContext
     calls in the same realm, but not visible as sandbox properties.
     We inject setter / getter functions that DO close over the same
     lexical scope, then attach them to the sandbox. */
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
      /* Mirror tx / resolveLevel onto the sandbox so tests can call them. */
      globalThis.tx           = tx;
      globalThis.resolveLevel = resolveLevel;
    })();
  `;
  vm.runInContext(adapterSrc, ctx, { filename: "tests/_adapter.js" });

  return sandbox;
}

module.exports = { loadAppContext };
