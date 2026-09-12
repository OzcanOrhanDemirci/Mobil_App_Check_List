/* ==================== SHOWCASE MOTION LAYER ====================

   The optional enhancement layer for the Showcase design. It is an IIFE
   with no globals (bar one test hook) and it does nothing at all unless
   data-design is "showcase", so the other two designs pay only this
   file's parse cost.

   What it adds, all of it purely presentational:

     1. A hero stage with three progress gauges. They render numbers that
        already exist as accessible text in .progress-card, so the stage
        is aria-hidden: nothing is announced twice.
     2. A hairline at the top of the viewport tracking reading position.
     3. Reveal-on-scroll for chapters and cards, via IntersectionObserver.
     4. Scroll-spy on the chapter index, so the rail marks where you are.

   Two rules it follows strictly:

     - It attaches and detaches. Every node it injects, every class it
       adds and every listener it binds is undone in detach(), which runs
       when the design changes. Switching to Minimal must not leave a
       card stranded at opacity 0 or a stray fixed-position element on
       screen.
     - It never owns content. It subscribes to checklist:rendered and
       checklist:progress (emitted from js/11-render.js and
       js/12-progress.js) rather than wrapping either function, so the
       render path stays readable and works with this file deleted.

   Under `prefers-reduced-motion: reduce` the reveal step is skipped
   entirely (nothing is ever hidden), the gauges are written without a
   transition and the scroll line is not built. The layout and depth of
   the design are untouched; only movement is. */

(function () {
  "use strict";

  /* 2 * pi * 44, matching the r=44 circle in css/08-design-showcase.css. */
  const RING_CIRCUMFERENCE = 276.46;

  /* Kept in sync with the ids the progress card writes to; see
     js/12-progress.js#updateProgress. */
  const GAUGES = [
    { key: "total", labelKey: "progress.total" },
    { key: "mvp", labelKey: "level.mvp" },
    { key: "release", labelKey: "level.release" },
  ];

  let attached = false;
  let revealObserver = null;
  let spyObserver = null;
  let stageEl = null;
  let scrollLineEl = null;
  let rafPending = false;

  function prefersReducedMotion() {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      return false;
    }
  }

  function label(key, fallback) {
    return typeof t === "function" ? t(key) : fallback;
  }

  /* ---------------------------------------------------------- hero stage */

  function buildStage() {
    const hero = document.querySelector("header.hero");
    if (!hero || document.querySelector(".sc-stage")) return;

    stageEl = document.createElement("div");
    stageEl.className = "sc-stage";
    /* The same three figures are already in .progress-card as text. */
    stageEl.setAttribute("aria-hidden", "true");

    stageEl.innerHTML = GAUGES.map(
      g => `
      <div class="sc-gauge" data-gauge="${g.key}">
        <svg class="sc-ring" viewBox="0 0 100 100" focusable="false">
          <circle class="sc-ring-track" cx="50" cy="50" r="44"></circle>
          <circle class="sc-ring-fill" cx="50" cy="50" r="44"></circle>
        </svg>
        <span class="sc-gauge-text">
          <span class="sc-gauge-value" data-gauge-value>0%</span>
          <span class="sc-gauge-label" data-gauge-label></span>
          <span class="sc-gauge-sub" data-gauge-sub>0 / 0</span>
        </span>
      </div>`
    ).join("");

    hero.appendChild(stageEl);
    syncStageLabels();
  }

  /* Labels come from the i18n dictionary, so they follow a language
     switch without the stage being rebuilt. */
  function syncStageLabels() {
    if (!stageEl) return;
    GAUGES.forEach(g => {
      const el = stageEl.querySelector(`[data-gauge="${g.key}"] [data-gauge-label]`);
      if (el) el.textContent = label(g.labelKey, g.key.toUpperCase());
    });
  }

  /**
   * Push the current counters into the three gauges.
   *
   * @param {object} counters - The object countLevels() returns: total,
   *   totalChecked, mvp, mvpChecked, release, releaseChecked.
   */
  function updateStage(counters) {
    if (!stageEl || !counters) return;
    const pairs = {
      total: [counters.totalChecked, counters.total],
      mvp: [counters.mvpChecked, counters.mvp],
      release: [counters.releaseChecked, counters.release],
    };

    Object.keys(pairs).forEach(key => {
      const [done, all] = pairs[key];
      const pct = all > 0 ? Math.round((done / all) * 100) : 0;
      const gauge = stageEl.querySelector(`[data-gauge="${key}"]`);
      if (!gauge) return;

      const fill = gauge.querySelector(".sc-ring-fill");
      if (fill) {
        fill.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - pct / 100));
      }
      const value = gauge.querySelector("[data-gauge-value]");
      if (value) value.textContent = pct + "%";
      const sub = gauge.querySelector("[data-gauge-sub]");
      if (sub) sub.textContent = `${done} / ${all}`;
    });
  }

  /* Read the numbers straight from the progress card when we attach
     mid-session: updateProgress() may have run long before this layer did. */
  function readCountersFromDom() {
    const parse = id => {
      const el = document.getElementById(id);
      if (!el) return [0, 0];
      const m = /(\d+)\s*\/\s*(\d+)/.exec(el.textContent || "");
      return m ? [Number(m[1]), Number(m[2])] : [0, 0];
    };
    const [totalChecked, total] = parse("total-num");
    const [mvpChecked, mvp] = parse("mvp-num");
    const [releaseChecked, release] = parse("release-num");
    return { total, totalChecked, mvp, mvpChecked, release, releaseChecked };
  }

  /* -------------------------------------------------------- scroll line */

  function buildScrollLine() {
    if (prefersReducedMotion() || document.querySelector(".sc-scrollline")) return;
    scrollLineEl = document.createElement("div");
    scrollLineEl.className = "sc-scrollline";
    scrollLineEl.setAttribute("aria-hidden", "true");
    scrollLineEl.innerHTML = "<span></span>";
    document.body.appendChild(scrollLineEl);
    updateScrollLine();
  }

  function updateScrollLine() {
    if (!scrollLineEl) return;
    const bar = scrollLineEl.firstElementChild;
    if (!bar) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
    bar.style.width = pct + "%";
  }

  function onScroll() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      updateScrollLine();
    });
  }

  /* ------------------------------------------------------------- reveal */

  /* Cards and chapters start hidden and are released as they come into
     view. Anything already on screen when we attach is released in the
     observer's first callback, so the top of the page never sits blank. */
  function markRevealTargets() {
    if (prefersReducedMotion() || !revealObserver) return;
    document.querySelectorAll("section.category, .feature").forEach(el => {
      if (el.classList.contains("sc-reveal")) return;
      el.classList.add("sc-reveal");
      revealObserver.observe(el);
    });
  }

  function buildRevealObserver() {
    if (prefersReducedMotion() || typeof IntersectionObserver !== "function") return;
    revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("sc-in");
          /* One-shot: an element that has arrived stays arrived, so
             scrolling back up does not replay the animation. */
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.04 }
    );
  }

  /* ---------------------------------------------------------- scroll-spy */

  function buildSpy() {
    if (typeof IntersectionObserver !== "function") return;
    spyObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id.replace(/^cat-/, "");
          document.querySelectorAll(".cat-nav a[data-cat-nav]").forEach(a => {
            a.classList.toggle("sc-active", a.dataset.catNav === id);
          });
        });
      },
      /* A band across the upper third: the chapter whose heading has just
         passed the top of the viewport is the one being read. */
      { rootMargin: "-12% 0px -70% 0px", threshold: 0 }
    );
    observeSections();
  }

  function observeSections() {
    if (!spyObserver) return;
    document.querySelectorAll("section.category[id]").forEach(s => spyObserver.observe(s));
  }

  /* ------------------------------------------------------ attach / detach */

  function attach() {
    if (attached) return;
    attached = true;

    buildStage();
    updateStage(readCountersFromDom());
    buildScrollLine();
    buildRevealObserver();
    markRevealTargets();
    buildSpy();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
  }

  function detach() {
    if (!attached) return;
    attached = false;

    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);

    if (revealObserver) {
      revealObserver.disconnect();
      revealObserver = null;
    }
    if (spyObserver) {
      spyObserver.disconnect();
      spyObserver = null;
    }

    /* Undo every mark. A card left with .sc-reveal and no .sc-in would be
       invisible in another design, which is the one bug this layer could
       cause outside its own design. */
    document.querySelectorAll(".sc-reveal, .sc-in").forEach(el => {
      el.classList.remove("sc-reveal", "sc-in");
    });
    document.querySelectorAll(".cat-nav a.sc-active").forEach(a => a.classList.remove("sc-active"));

    if (stageEl) {
      stageEl.remove();
      stageEl = null;
    }
    if (scrollLineEl) {
      scrollLineEl.remove();
      scrollLineEl = null;
    }
  }

  function sync() {
    if (document.documentElement.getAttribute("data-design") === "showcase") attach();
    else detach();
  }

  /* ------------------------------------------------------------- wiring */

  document.addEventListener("design:changed", sync);

  /* A re-render replaces every card node, so the previous reveal marks and
     spy targets went with them. */
  document.addEventListener("checklist:rendered", () => {
    if (!attached) return;
    markRevealTargets();
    observeSections();
    syncStageLabels();
  });

  document.addEventListener("checklist:progress", e => {
    if (attached) updateStage(e.detail);
  });

  /* This file loads with `defer`, so the DOM is parsed by the time it
     runs, but js/18-app.js's first render may not have happened yet.
     Attaching now is still correct: markRevealTargets() and
     observeSections() re-run on checklist:rendered. */
  sync();

  /* Test hook only. The layer is otherwise entirely self-contained. */
  if (typeof window !== "undefined") {
    window.__showcaseMotion = { attach, detach, sync, updateStage, isAttached: () => attached };
  }
})();
