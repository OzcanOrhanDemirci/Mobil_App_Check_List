/* Tests for the Service Worker (sw.js).

   sw.js is a plain script that registers three listeners on `self`. Here it
   runs inside a node:vm context whose `self`, `caches`, `fetch`, `Request`
   and `setTimeout` are small in-memory stand-ins, so the tests dispatch the
   same events a browser would and then look at what the worker stored and
   what it answered with. No file under the repository is modified.

   What is covered, and why each part matters:

     1. `install` stores every APP_SHELL file and revalidates each one
        (`cache: 'no-cache'`). This is what lets a first visit work offline:
        a worker filled only by its fetch handler is still empty when the
        visit that installed it ends, because it took control of the page
        after the page had loaded.
     2. `install` fails as a whole when one file fails, so a worker holding
        half a shell is never activated.
     3. `activate` deletes every other cache and claims open pages.
     4. Navigations go to the network first, fall back to the cached page on
        a network error or after NAVIGATION_TIMEOUT_MS, and ignore the query
        string on the way back.
     5. Everything else is served from the cache and refreshed behind it; a
        file that is not cached yet is fetched and stored.
     6. Requests the worker must leave alone: non-GET, cross-origin, ranges.
     7. APP_SHELL covers every stylesheet and script index.html loads and
        names no file that does not exist. scripts/check-sw-app-shell.mjs
        generates the list; this is an independent second reading of
        index.html, so a bug in that script cannot quietly agree with itself.

   Not covered: the browser's own lifecycle (when it looks for an update, how
   it swaps one worker for the next). That needs a real browser; see the
   Playwright pass described in .github/CONTRIBUTING.md. */

"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const REPO_ROOT = path.resolve(__dirname, "..");
const SCOPE = "https://example.test/app/";

/* ---------- Stand-ins for the worker's globals ---------- */

class FakeResponse {
  constructor(body, { status = 200, type = "basic" } = {}) {
    this.body = body;
    this.status = status;
    this.ok = status >= 200 && status < 300;
    this.type = type;
  }
  clone() {
    return new FakeResponse(this.body, { status: this.status, type: this.type });
  }
  async text() {
    return this.body;
  }
}

/* Relative URLs resolve against the worker's scope, as they do in a worker
   whose script sits at the root of that scope. */
class FakeRequest {
  constructor(input, init = {}) {
    this.url = new URL(input, SCOPE).href;
    this.method = init.method || "GET";
    this.mode = init.mode || "cors";
    this.cache = init.cache || "default";
    this.headers = new Headers(init.headers || {});
  }
}

const hrefOf = request => (typeof request === "string" ? new URL(request, SCOPE).href : request.url);

const withoutSearch = href => {
  const url = new URL(href);
  url.search = "";
  return url.href;
};

class FakeCache {
  constructor(env) {
    this.env = env;
    this.entries = new Map();
  }
  async put(request, response) {
    this.entries.set(hrefOf(request), response);
  }
  async match(request, options = {}) {
    const href = hrefOf(request);
    if (this.entries.has(href)) return this.entries.get(href).clone();
    if (options.ignoreSearch) {
      for (const [key, response] of this.entries) {
        if (withoutSearch(key) === withoutSearch(href)) return response.clone();
      }
    }
    return undefined;
  }
  async keys() {
    return [...this.entries.keys()].map(href => new FakeRequest(href));
  }
  /* As specified: every response must be ok, or nothing is stored. */
  async addAll(requests) {
    const responses = await Promise.all(requests.map(request => this.env.fetch(request)));
    responses.forEach((response, i) => {
      if (!response.ok) throw new TypeError(`addAll: ${requests[i].url} answered ${response.status}`);
    });
    requests.forEach((request, i) => this.entries.set(request.url, responses[i]));
  }
}

class FakeCacheStorage {
  constructor(env) {
    this.env = env;
    this.byName = new Map();
  }
  async open(name) {
    if (!this.byName.has(name)) this.byName.set(name, new FakeCache(this.env));
    return this.byName.get(name);
  }
  async keys() {
    return [...this.byName.keys()];
  }
  async delete(name) {
    return this.byName.delete(name);
  }
  async match(request, options) {
    for (const cache of this.byName.values()) {
      const hit = await cache.match(request, options);
      if (hit) return hit;
    }
    return undefined;
  }
}

/* Loads the real sw.js into a fresh realm. `worker.respondWith` decides what
   the network does; `worker.timers` holds every setTimeout the worker set, so
   a test fires a timeout by calling it rather than by waiting three seconds. */
function loadWorker() {
  const worker = {
    listeners: {},
    timers: [],
    requests: [],
    skippedWaiting: false,
    claimed: false,
    network: () => Promise.reject(new TypeError("Failed to fetch")),
  };
  worker.fetch = request => {
    worker.requests.push(request);
    return worker.network(request);
  };
  worker.caches = new FakeCacheStorage(worker);

  const self = {
    location: new URL("sw.js", SCOPE),
    addEventListener: (type, listener) => {
      worker.listeners[type] = listener;
    },
    skipWaiting: () => {
      worker.skippedWaiting = true;
      return Promise.resolve();
    },
    clients: {
      claim: () => {
        worker.claimed = true;
        return Promise.resolve();
      },
    },
  };

  const context = vm.createContext({
    self,
    caches: worker.caches,
    fetch: worker.fetch,
    Request: FakeRequest,
    URL,
    setTimeout: (fn, ms) => worker.timers.push({ fn, ms }),
  });
  const source = fs.readFileSync(path.join(REPO_ROOT, "sw.js"), "utf8");
  vm.runInContext(`${source}\n;self.__exports = { APP_SHELL, CACHE_NAME, NAVIGATION_TIMEOUT_MS };`, context, {
    filename: "sw.js",
  });
  const { APP_SHELL, CACHE_NAME, NAVIGATION_TIMEOUT_MS } = self.__exports;
  /* Copied into this realm: an array built inside the sandbox carries the
     sandbox's Array.prototype, and assert.deepStrictEqual rejects it. */
  Object.assign(worker, { APP_SHELL: [...APP_SHELL], CACHE_NAME, NAVIGATION_TIMEOUT_MS });
  return worker;
}

async function install(worker) {
  const pending = [];
  worker.listeners.install({ waitUntil: promise => pending.push(promise) });
  await Promise.all(pending);
}

async function activate(worker) {
  const pending = [];
  worker.listeners.activate({ waitUntil: promise => pending.push(promise) });
  await Promise.all(pending);
}

function dispatchFetch(worker, request) {
  const event = {
    request,
    handled: false,
    response: undefined,
    respondWith(promise) {
      this.handled = true;
      this.response = Promise.resolve(promise);
    },
  };
  worker.listeners.fetch(event);
  return event;
}

const navigation = url => new FakeRequest(url, { mode: "navigate" });

/* Lets the worker's background work (the refresh behind a cached answer, the
   copy of a late network answer) run to completion. */
const settle = () => new Promise(resolve => setImmediate(() => setImmediate(resolve)));

function deferred() {
  let resolve;
  const promise = new Promise(r => (resolve = r));
  return { promise, resolve };
}

async function cachedText(worker, url) {
  const cache = await worker.caches.open(worker.CACHE_NAME);
  const response = await cache.match(url);
  return response ? response.text() : undefined;
}

/* ---------- 1-2. install ---------- */

describe("Service Worker: install stores the app shell", () => {
  it("stores every APP_SHELL file under its absolute URL before the worker activates", async () => {
    const worker = loadWorker();
    worker.network = request => Promise.resolve(new FakeResponse(`body of ${request.url}`));

    await install(worker);

    const cache = await worker.caches.open(worker.CACHE_NAME);
    const stored = (await cache.keys()).map(request => request.url).sort();
    const expected = worker.APP_SHELL.map(file => new URL(file, SCOPE).href).sort();
    assert.deepEqual(stored, expected);
    assert.equal(worker.skippedWaiting, true, "install must call skipWaiting()");
  });

  it("stores the page itself, so a first visit can open offline", async () => {
    const worker = loadWorker();
    worker.network = request => Promise.resolve(new FakeResponse(`body of ${request.url}`));

    await install(worker);

    assert.equal(worker.APP_SHELL[0], "./");
    assert.equal(await cachedText(worker, SCOPE), `body of ${SCOPE}`);
  });

  it("revalidates each file rather than trusting the HTTP cache", async () => {
    const worker = loadWorker();
    worker.network = () => Promise.resolve(new FakeResponse("ok"));

    await install(worker);

    assert.equal(worker.requests.length, worker.APP_SHELL.length);
    const notRevalidated = worker.requests.filter(request => request.cache !== "no-cache").map(r => r.url);
    assert.deepEqual(notRevalidated, [], "every shell request must use cache: 'no-cache'");
  });

  it("fails as a whole when one file fails, and stores nothing", async () => {
    const worker = loadWorker();
    worker.network = request =>
      Promise.resolve(
        request.url.endsWith("/js/18-app.js") ? new FakeResponse("missing", { status: 404 }) : new FakeResponse("ok")
      );

    await assert.rejects(install(worker));

    const cache = await worker.caches.open(worker.CACHE_NAME);
    assert.equal((await cache.keys()).length, 0);
  });

  it("fails as a whole when the network drops mid-install", async () => {
    const worker = loadWorker();
    let calls = 0;
    worker.network = () =>
      ++calls === 7 ? Promise.reject(new TypeError("Failed to fetch")) : Promise.resolve(new FakeResponse("ok"));

    await assert.rejects(install(worker));
  });
});

/* ---------- 3. activate ---------- */

describe("Service Worker: activate", () => {
  it("deletes every cache but its own and claims open pages", async () => {
    const worker = loadWorker();
    await worker.caches.open("mobil-kontrol-v1.3.0");
    await worker.caches.open("mobil-kontrol-v1.2.1");
    await worker.caches.open(worker.CACHE_NAME);

    await activate(worker);

    assert.deepEqual(await worker.caches.keys(), [worker.CACHE_NAME]);
    assert.equal(worker.claimed, true);
  });
});

/* ---------- 4. navigations ---------- */

describe("Service Worker: navigations are network first", () => {
  it("answer from the network when it answers, and keep a copy", async () => {
    const worker = loadWorker();
    worker.network = () => Promise.resolve(new FakeResponse("fresh page"));

    const event = dispatchFetch(worker, navigation(SCOPE));
    assert.equal(await (await event.response).text(), "fresh page");

    await settle();
    assert.equal(await cachedText(worker, SCOPE), "fresh page");
  });

  it("fall back to the cached page when the network fails", async () => {
    const worker = loadWorker();
    await (await worker.caches.open(worker.CACHE_NAME)).put(SCOPE, new FakeResponse("cached page"));

    const event = dispatchFetch(worker, navigation(SCOPE));

    assert.equal(await (await event.response).text(), "cached page");
  });

  it("find the cached page when the link carries a query string", async () => {
    const worker = loadWorker();
    await (await worker.caches.open(worker.CACHE_NAME)).put(SCOPE, new FakeResponse("cached page"));

    const event = dispatchFetch(worker, navigation(`${SCOPE}?utm_source=share`));

    assert.equal(await (await event.response).text(), "cached page");
  });

  it("give way to the cached page after NAVIGATION_TIMEOUT_MS, and still store the late answer", async () => {
    const worker = loadWorker();
    await (await worker.caches.open(worker.CACHE_NAME)).put(SCOPE, new FakeResponse("cached page"));
    const slow = deferred();
    worker.network = () => slow.promise;

    const event = dispatchFetch(worker, navigation(SCOPE));
    await settle();
    assert.equal(worker.timers.length, 1);
    assert.equal(worker.timers[0].ms, worker.NAVIGATION_TIMEOUT_MS);
    worker.timers[0].fn();

    assert.equal(await (await event.response).text(), "cached page");

    slow.resolve(new FakeResponse("late page"));
    await settle();
    assert.equal(await cachedText(worker, SCOPE), "late page");
  });

  it("keep waiting for the network when nothing is cached yet", async () => {
    const worker = loadWorker();
    const slow = deferred();
    worker.network = () => slow.promise;

    const event = dispatchFetch(worker, navigation(SCOPE));
    await settle();
    worker.timers[0].fn();
    slow.resolve(new FakeResponse("first page"));

    assert.equal(await (await event.response).text(), "first page");
  });
});

/* ---------- 5. everything else ---------- */

describe("Service Worker: other files are served from the cache and refreshed", () => {
  const STYLE = `${SCOPE}css/01-base.css`;

  it("serve a cached file at once and refresh it behind the page", async () => {
    const worker = loadWorker();
    await (await worker.caches.open(worker.CACHE_NAME)).put(STYLE, new FakeResponse("old css"));
    worker.network = () => Promise.resolve(new FakeResponse("new css"));

    const event = dispatchFetch(worker, new FakeRequest(STYLE));
    assert.equal(await (await event.response).text(), "old css");

    await settle();
    assert.equal(await cachedText(worker, STYLE), "new css");
  });

  it("keep serving the cached file when the refresh fails", async () => {
    const worker = loadWorker();
    await (await worker.caches.open(worker.CACHE_NAME)).put(STYLE, new FakeResponse("old css"));

    const event = dispatchFetch(worker, new FakeRequest(STYLE));
    assert.equal(await (await event.response).text(), "old css");

    await settle();
    assert.equal(await cachedText(worker, STYLE), "old css");
  });

  it("fetch and store a file that is not cached yet", async () => {
    const worker = loadWorker();
    worker.network = () => Promise.resolve(new FakeResponse("new css"));

    const event = dispatchFetch(worker, new FakeRequest(STYLE));
    assert.equal(await (await event.response).text(), "new css");

    await settle();
    assert.equal(await cachedText(worker, STYLE), "new css");
  });

  it("pass an error response through without storing it", async () => {
    const worker = loadWorker();
    worker.network = () => Promise.resolve(new FakeResponse("not found", { status: 404 }));

    const event = dispatchFetch(worker, new FakeRequest(STYLE));
    assert.equal((await event.response).status, 404);

    await settle();
    assert.equal(await cachedText(worker, STYLE), undefined);
  });
});

/* ---------- 6. requests left alone ---------- */

describe("Service Worker: requests it must leave to the browser", () => {
  it("does not answer a request that is not a GET", () => {
    const worker = loadWorker();
    assert.equal(dispatchFetch(worker, new FakeRequest(`${SCOPE}api`, { method: "POST" })).handled, false);
  });

  it("does not answer a cross-origin request", () => {
    const worker = loadWorker();
    assert.equal(dispatchFetch(worker, new FakeRequest("https://cdn.example.org/lib.js")).handled, false);
  });

  it("does not answer a range request", () => {
    const worker = loadWorker();
    const request = new FakeRequest(`${SCOPE}clip.mp4`, { headers: { range: "bytes=0-" } });
    assert.equal(dispatchFetch(worker, request).handled, false);
  });
});

/* ---------- 7. APP_SHELL against index.html ---------- */

describe("Service Worker: APP_SHELL matches what the page loads", () => {
  const { APP_SHELL } = loadWorker();
  const html = fs.readFileSync(path.join(REPO_ROOT, "index.html"), "utf8").replace(/<!--[\s\S]*?-->/g, "");

  it("covers every stylesheet and script index.html loads", () => {
    const loaded = [
      ...[...html.matchAll(/<link\s[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(m => m[1]),
      ...[...html.matchAll(/<script\s[^>]*src="([^"]+)"/g)].map(m => m[1]),
    ];
    assert.ok(loaded.length > 40, `expected to find the page's stylesheets and scripts, found ${loaded.length}`);
    const missing = loaded.filter(file => !APP_SHELL.includes(file));
    assert.deepEqual(missing, [], "run `npm run sw:sync` to regenerate APP_SHELL");
  });

  it("names only files that exist", () => {
    const absent = APP_SHELL.filter(file => !fs.existsSync(path.join(REPO_ROOT, file === "./" ? "index.html" : file)));
    assert.deepEqual(absent, [], "a missing file makes cache.addAll reject and the worker never installs");
  });

  it("names each file once", () => {
    assert.equal(new Set(APP_SHELL).size, APP_SHELL.length);
  });
});
