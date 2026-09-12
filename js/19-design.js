/* ==================== DESIGN AXIS ====================

   The application ships three designs. They share one DOM, one data set
   and one feature set; only layout, shape, typography and motion differ:

     classic   the 1.0-1.2 look: gradient hero, orange accent, pill chrome
     minimal   neutral, hairline-ruled, documentation-style, low chrome
     showcase  display typography, layered surfaces, motion on scroll

   The axis is orthogonal to the light / dark color mode (data-theme), so
   every design works in both modes. It is stored on <html> as
   data-design and persisted under mobil_kontrol_design_v1.

   Why an attribute and not a stylesheet swap: the design files are plain
   CSS loaded up front and scoped with [data-design="..."]. Switching is
   therefore a single attribute write with no network request, no flash
   of unstyled content and no build step, which keeps the project's
   zero-build promise intact.

   Print output is deliberately identical in all three designs: every
   design rule lives inside `@media screen`, so a printed checklist never
   depends on which design the author happened to be looking at. */

const DESIGN_KEY = "mobil_kontrol_design_v1";
const VALID_DESIGNS = ["classic", "minimal", "showcase"];

/* Kept in sync with js/00-bootstrap.js, which has to inline the same
   value to avoid a flash of the wrong design before this file runs.
   tests/design.test.js asserts the two agree. */
const DEFAULT_DESIGN = "minimal";

/* Meta for the picker: the label and one-line rationale come from i18n at
   render time, so only the stable parts live here. */
const DESIGN_META = {
  classic: { key: "classic", labelKey: "design.classic", descKey: "design.classic.desc" },
  minimal: { key: "minimal", labelKey: "design.minimal", descKey: "design.minimal.desc" },
  showcase: { key: "showcase", labelKey: "design.showcase", descKey: "design.showcase.desc" },
};

/**
 * Coerce any value to a valid design id.
 *
 * @param {*} value - Candidate design id (may come from storage or a DOM attribute).
 * @returns {string|null} The value when it is a known design, otherwise null.
 */
function normalizeDesign(value) {
  return VALID_DESIGNS.indexOf(value) === -1 ? null : value;
}

/**
 * Decide which design to start on.
 *
 * A design the user actually picked always wins. Everyone else, including
 * people arriving from an older version, gets DEFAULT_DESIGN: the 1.3
 * release changes the default look on purpose, and a returning visitor
 * who never opened the picker has expressed no preference to honor.
 *
 * @returns {string} A valid design id.
 */
function resolveInitialDesign() {
  let saved = null;
  try {
    saved = localStorage.getItem(DESIGN_KEY);
  } catch {
    /* Private mode / storage disabled: fall through to the default. */
  }
  return normalizeDesign(saved) || DEFAULT_DESIGN;
}

/**
 * Apply a design to the document and (optionally) remember it.
 *
 * Applying is a single attribute write; everything visual follows from
 * the `[data-design="..."]` rules in css/07-design-minimal.css and
 * css/08-design-showcase.css. The `design:changed` event lets optional
 * enhancement layers (js/20-showcase-motion.js) attach and detach
 * without this file knowing they exist.
 *
 * @param {string} design - Design id; anything invalid falls back to the default.
 * @param {{persist?: boolean}} [opts] - persist:false previews without saving.
 * @returns {string} The design that was actually applied.
 */
function applyDesign(design, opts = {}) {
  const next = normalizeDesign(design) || DEFAULT_DESIGN;
  const previous = document.documentElement.getAttribute("data-design");

  document.documentElement.setAttribute("data-design", next);

  if (opts.persist !== false) {
    try {
      localStorage.setItem(DESIGN_KEY, next);
    } catch {
      /* Preference is lost on reload; the session still looks right. */
    }
  }

  syncDesignButton(next);
  syncDesignPicker(next);

  if (previous !== next && typeof emitAppEvent === "function") {
    emitAppEvent("design:changed", { design: next, previous });
  }
  return next;
}

/**
 * Refresh the toolbar button so its label names the active design.
 *
 * @param {string} design - The active design id.
 */
function syncDesignButton(design) {
  const btn = document.getElementById("designToggle");
  if (!btn) return;
  const label = btn.querySelector(".design-label");
  const meta = DESIGN_META[design];
  if (label && meta && typeof t === "function") label.textContent = t(meta.labelKey);
  btn.setAttribute("data-active-design", design);
}

/**
 * Mark the selected card in the picker dialog.
 *
 * The cards are toggle buttons in a labeled group rather than an ARIA
 * radiogroup: all three stay in the tab order, which is what a reader
 * comparing them expects, and `aria-pressed` already says which one is on.
 *
 * @param {string} design - The active design id.
 */
function syncDesignPicker(design) {
  document.querySelectorAll("[data-design-option]").forEach(card => {
    const active = card.dataset.designOption === design;
    card.classList.toggle("active", active);
    card.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

/* The dialog is markup in index.html rather than generated here so it is
   visible to html-validate and to anyone reading the page source. This
   only wires it up. */
function openDesignPicker() {
  syncDesignPicker(document.documentElement.getAttribute("data-design") || DEFAULT_DESIGN);
  if (typeof openModal === "function") openModal("designModal");
  const active = document.querySelector("[data-design-option].active");
  if (active) active.focus();
}

document.getElementById("designToggle")?.addEventListener("click", () => {
  openDesignPicker();
});

/* Picking inside the dialog applies immediately and leaves the dialog
   open, so the three can be compared against the real page behind it
   instead of against a thumbnail. */
document.getElementById("designModal")?.addEventListener("click", e => {
  const card = e.target.closest("[data-design-option]");
  if (!card) return;
  const picked = applyDesign(card.dataset.designOption);
  const meta = DESIGN_META[picked];
  if (typeof showToast === "function" && meta && typeof t === "function") {
    showToast(t("design.toast").replace("{name}", t(meta.labelKey)), "info", 1400);
  }
});

/* Arrow keys move between the cards and apply as they go, so the designs
   can be flipped through without reaching for the mouse. Space and Enter
   already activate a button, so they are left alone. */
document.getElementById("designModal")?.addEventListener("keydown", e => {
  const card = e.target.closest("[data-design-option]");
  if (!card) return;

  const step =
    e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
  if (!step) return;

  const cards = [...document.querySelectorAll("[data-design-option]")];
  const target = cards[(cards.indexOf(card) + step + cards.length) % cards.length];

  e.preventDefault();
  applyDesign(target.dataset.designOption);
  target.focus();
});

/* ==================== INIT ====================
   js/00-bootstrap.js already put the right value on <html> before first
   paint; this only brings the UI that depends on it into line (the
   toolbar label, the picker's selected card). persist:false because the
   user has not chosen anything yet: writing here would turn "no
   preference" into a stored preference and freeze whoever loaded the page
   once onto whatever the default happened to be that day. */
applyDesign(resolveInitialDesign(), { persist: false });

/* Expose for the test sandbox and for js/18-app.js (reset to defaults). */
if (typeof window !== "undefined") {
  window.applyDesign = applyDesign;
  window.normalizeDesign = normalizeDesign;
  window.resolveInitialDesign = resolveInitialDesign;
  window.openDesignPicker = openDesignPicker;
  window.DEFAULT_DESIGN = DEFAULT_DESIGN;
  window.VALID_DESIGNS = VALID_DESIGNS;
}
