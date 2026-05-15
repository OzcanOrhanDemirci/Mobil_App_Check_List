/* eslint prefer-const: "off" --
   Every `let` declared in this file is reassigned cross-file: state, notes,
   collapsedCats, currentFramework, currentBackend in js/04-projects.js#reloadActive
   and js/18-app.js (import flow), plus framework/backend assignments in
   js/05-framework.js and js/05-backend.js. ESLint per-file analysis cannot
   see those reassignments. */

/* ==================== STATE ====================
   state, notes, collapsedCats, currentFramework, viewMode, viewFilter, lockState
   are all read from and written to the active project's .data field (04-projects.js).
   When the active project changes, these variables are refreshed via
   reloadActiveProjectAndRender. */

let state = loadState();
let notes = loadNotes();
let collapsedCats = loadCollapsed();
let currentFramework = loadFramework();
let currentBackend = loadBackend();  // "firebase" | "supabase" | ... | "noBackend" | null
let viewMode = loadViewMode();      // "mvp" | "release" | "both"
let viewFilter = loadViewFilter();  // "all" | "pending" | "done"

function loadViewMode() {
  const v = getProjectField("viewMode");
  return (v === "mvp" || v === "release" || v === "both") ? v : "both";
}
function loadViewFilter() {
  const v = getProjectField("viewFilter");
  return (v === "all" || v === "pending" || v === "done") ? v : "all";
}

let lockState = loadLockState();
function loadLockState() {
  return !!getProjectField("lockState");
}
function saveLockState(v) {
  lockState = !!v;
  setProjectField("lockState", lockState);
}

/* Apply the lock's visual and interaction state: body class, disabled state of
   affected buttons, and the lock button's own appearance. Called after every
   state change and on init. */
function applyLock() {
  document.body.classList.toggle("locked", lockState);

  /* Buttons that are disabled while locked (all state-mutating actions). */
  const lockedTargets = ["projectFrameworkBtn", "resetBtn", "importBtn"];
  lockedTargets.forEach(id => {
    const b = document.getElementById(id);
    if (b) b.disabled = lockState;
  });

  /* The lock button itself: icon, label, and active class. */
  const btn = document.getElementById("lockBtn");
  if (btn) {
    btn.classList.toggle("locked", lockState);
    const icon = btn.querySelector(".lock-icon");
    const label = btn.querySelector(".lock-label");
    if (icon) icon.textContent = lockState ? "🔓" : "🔒";
    if (label) label.textContent = lockState ? t("lock.unlockLabel") : t("lock.label");
    btn.title = lockState ? t("btn.lock.unlockTitle") : t("btn.lock.title");
    btn.setAttribute("aria-pressed", lockState ? "true" : "false");
  }
}
function saveViewMode(v) {
  if (v !== "mvp" && v !== "release" && v !== "both") return;
  viewMode = v;
  setProjectField("viewMode", v);
}
function saveViewFilter(v) {
  if (v !== "all" && v !== "pending" && v !== "done") return;
  viewFilter = v;
  setProjectField("viewFilter", v);
}

/* Single applyView entry point: applies both viewMode and viewFilter, updates
   body classes, marks the active hero pill and dropdown menu items, refreshes
   feature/category visibility, and updates the presentation context bar. */
function applyView() {
  /* Body classes drive CSS rules that hide rows by level/filter. */
  document.body.classList.toggle("view-mvp-only", viewMode === "mvp");
  document.body.classList.toggle("view-release-only", viewMode === "release");
  document.body.classList.toggle("filter-pending", viewFilter === "pending");
  document.body.classList.toggle("filter-done", viewFilter === "done");

  /* Hero pill active state + sub-label + dropdown menu active item. */
  document.querySelectorAll(".lv-group").forEach(group => {
    const mode = group.dataset.viewMode;
    const isActive = mode === viewMode;
    const pill = group.querySelector(".level-filter-pill");
    pill.classList.toggle("active", isActive);
    pill.setAttribute("aria-pressed", isActive ? "true" : "false");
    /* Show the sub-label only on the active pill when viewFilter is not "all". */
    const subEl = pill.querySelector(".lv-sub");
    if (subEl) {
      if (isActive && viewFilter !== "all") {
        subEl.hidden = false;
        subEl.textContent = t("viewFilter." + viewFilter);
      } else {
        subEl.hidden = true;
        subEl.textContent = "";
      }
    }
    /* Mark the active menu item only inside the active pill's menu. */
    group.querySelectorAll(".lv-menu button").forEach(b => {
      const isItemActive = isActive && b.dataset.viewFilter === viewFilter;
      b.classList.toggle("active", isItemActive);
    });
  });

  applyFilters();
  updateToolbarButtonStates();
  /* When presentation mode is on, keep its context bar in sync. */
  if (document.body.classList.contains("presentation-mode") && typeof updatePresentationContextBar === "function") {
    updatePresentationContextBar();
  }
}

/* Public API: change mode and filter in a single call.
   Example: setView("mvp", "pending") yields MVP + pending items. */
function setView(mode, filter) {
  if (mode !== undefined) saveViewMode(mode);
  if (filter !== undefined) saveViewFilter(filter);
  applyView();
}

/* ==================== TOOLBAR TOGGLE "USER CHOSE" FLAGS ====================
   The "Expand All / Collapse All" and "All How / All List" toolbar pairs get
   the orange ".active" highlight only when DOM state matches them. However,
   on first launch the state starts with defaults (all categories collapsed,
   mode "build"); those defaults are NOT a deliberate user choice. So we
   suppress the highlight until the user actually interacts with the relevant
   control.

   The flag is set when:
     - A toolbar button is clicked (expandAll, collapseAll, flipAllHow,
       flipAllChecklist), OR
     - Individual interaction changes state (clicking a category header,
       auto-open via category nav link, flipping a single item card).

   The flag is NOT set when:
     - The welcome flow picks a usage mode (build/review): this still counts
       as "first launch".
     - applyInitialCardMode flips cards post-render: that applies an existing
       choice to the DOM, it isn't a new choice.

   The flag is cleared when:
     - "Reset > Whole System" runs localStorage.clear().
     - "Reset > Settings" scope runs clearCollapseFlipTouchFlags so the user
       feels they returned to defaults. */

const COLLAPSE_TOUCHED_KEY = "mobil_kontrol_user_chose_collapse_v1";
const FLIP_TOUCHED_KEY = "mobil_kontrol_user_chose_flip_v1";

function userChoseCollapseExplicitly() {
  try {
    return localStorage.getItem(COLLAPSE_TOUCHED_KEY) === "1";
  } catch {
    return false;
  }
}
function userChoseFlipExplicitly() {
  try {
    return localStorage.getItem(FLIP_TOUCHED_KEY) === "1";
  } catch {
    return false;
  }
}
function markCollapseTouched() {
  try {
    localStorage.setItem(COLLAPSE_TOUCHED_KEY, "1");
  } catch {}
}
function markFlipTouched() {
  try {
    localStorage.setItem(FLIP_TOUCHED_KEY, "1");
  } catch {}
}
function clearCollapseFlipTouchFlags() {
  try {
    localStorage.removeItem(COLLAPSE_TOUCHED_KEY);
    localStorage.removeItem(FLIP_TOUCHED_KEY);
  } catch {}
}

/* Disabled state for hero dropdown options and the adjacent toolbar buttons:
   - Pending option: disabled when the level has zero checks (filtering would
     show every item = pointless).
   - Done option: disabled when the level has zero checks (nothing to show).
   - All option: always enabled.
   - If the active viewFilter lands on a disabled option, fall back to "all".
   - Expand All / Collapse All: disabled when a search is active (CSS
     auto-expand overrides manual collapse during search). */
function updateToolbarButtonStates() {
  const expandBtn   = document.getElementById("expandAllBtn");
  const collapseBtn = document.getElementById("collapseAllBtn");
  if (!expandBtn || !collapseBtn) return;

  const counts = (typeof countLevels === "function") ? countLevels() : { mvpChecked: 0, releaseChecked: 0, totalChecked: 0 };
  const mvpHasNoChecks = counts.mvpChecked === 0;
  const relHasNoChecks = counts.releaseChecked === 0;

  /* Mark each hero dropdown option as disabled or enabled. */
  document.querySelectorAll(".lv-group").forEach(group => {
    const mode = group.dataset.viewMode; // mvp | release | both
    const items = group.querySelectorAll(".lv-menu button");
    items.forEach(btn => {
      const filt = btn.dataset.viewFilter; // all | pending | done
      let disabled;
      if (filt === "all") {
        disabled = false;
      } else if (mode === "mvp") {
        disabled = mvpHasNoChecks;
      } else if (mode === "release") {
        disabled = relHasNoChecks;
      } else { // both
        /* "both + pending/done" is meaningful only if at least one level has checks. */
        disabled = mvpHasNoChecks && relHasNoChecks;
      }
      btn.disabled = disabled;
    });
  });

  /* Fall back to "all" if the active combination just became invalid. */
  let invalid = false;
  if (viewFilter === "pending" || viewFilter === "done") {
    if (viewMode === "mvp" && mvpHasNoChecks) invalid = true;
    else if (viewMode === "release" && relHasNoChecks) invalid = true;
    else if (viewMode === "both" && mvpHasNoChecks && relHasNoChecks) invalid = true;
  }
  if (invalid) {
    saveViewFilter("all");
    document.body.classList.remove("filter-pending", "filter-done");
    /* Update the active menu item and clear the sub-label. */
    document.querySelectorAll(".lv-group").forEach(group => {
      const mode = group.dataset.viewMode;
      const isActive = mode === viewMode;
      const pill = group.querySelector(".level-filter-pill");
      const subEl = pill?.querySelector(".lv-sub");
      if (subEl) { subEl.hidden = true; subEl.textContent = ""; }
      group.querySelectorAll(".lv-menu button").forEach(b => {
        b.classList.toggle("active", isActive && b.dataset.viewFilter === "all");
      });
    });
    if (typeof applyFilters === "function") applyFilters();
  }

  /* Expand All / Collapse All: disabled only when a search is active (CSS
     auto-expand overrides manual toggles during search). Even when viewMode
     or viewFilter is active, the user can still expand and collapse
     categories manually. */
  const isSearching = document.body.classList.contains("searching");
  expandBtn.disabled = isSearching;
  collapseBtn.disabled = isSearching;

  /* "Expand All" / "Collapse All" active highlight. If every category is open
     (collapsedCats empty), highlight Expand; if every category is collapsed,
     highlight Collapse; in a mixed state, neither is highlighted. The user
     gets an instant "all open" or "all closed" cue. Total category count
     comes from DATA; if DATA is not loaded yet (test environment, edge
     case), we fall back to counting .category elements in the DOM.

     Extra condition: even when the state happens to match a default, do not
     show the highlight until the user has explicitly touched this control
     (userChoseCollapseExplicitly returning false). See the flag comment
     block above this function for full rationale. */
  const totalCats = (typeof DATA !== "undefined" && Array.isArray(DATA))
    ? DATA.length
    : document.querySelectorAll(".category").length;
  const collapsedCount = collapsedCats ? collapsedCats.size : 0;
  const allOpen   = totalCats > 0 && collapsedCount === 0;
  const allClosed = totalCats > 0 && collapsedCount === totalCats;
  const collapseExplicit = userChoseCollapseExplicitly();
  const expandActive   = collapseExplicit && allOpen;
  const collapseActive = collapseExplicit && allClosed;
  expandBtn.classList.toggle("active", expandActive);
  expandBtn.setAttribute("aria-pressed", expandActive ? "true" : "false");
  collapseBtn.classList.toggle("active", collapseActive);
  collapseBtn.setAttribute("aria-pressed", collapseActive ? "true" : "false");

  /* "All How" / "All List" active highlight. Reading currentMode is not
     enough: after the user clicks a bulk button they can still flip
     individual cards, which puts the DOM in a "mixed" state where neither
     button should be active (symmetric to the Expand All / Collapse All
     pair). So we derive the state live from .feature and .feature.flipped
     DOM counts.

     Extra condition: same as the collapse pair, no highlight is applied
     until the user has performed a real flip interaction (the welcome mode
     pick is excluded). */
  const howBtn  = document.getElementById("flipAllHowBtn");
  const listBtn = document.getElementById("flipAllChecklistBtn");
  if (howBtn && listBtn) {
    const totalFeatures   = document.querySelectorAll(".feature").length;
    const flippedFeatures = document.querySelectorAll(".feature.flipped").length;
    const allFlipped  = totalFeatures > 0 && flippedFeatures === totalFeatures;
    const noneFlipped = totalFeatures > 0 && flippedFeatures === 0;
    const flipExplicit = userChoseFlipExplicitly();
    const howActive  = flipExplicit && allFlipped;
    const listActive = flipExplicit && noneFlipped;
    howBtn.classList.toggle("active", howActive);
    howBtn.setAttribute("aria-pressed", howActive ? "true" : "false");
    listBtn.classList.toggle("active", listActive);
    listBtn.setAttribute("aria-pressed", listActive ? "true" : "false");
  }

  /* Lock button: greyed out when there are no checks (nothing worth locking). */
  const lockBtn = document.getElementById("lockBtn");
  if (lockBtn) {
    lockBtn.disabled = !lockState && counts.totalChecked === 0;
  }

  /* Export: disabled when there are no checks AND no notes (nothing to back
     up). notes only holds non-empty trimmed entries (saveNotes deletes empty
     ones), so Object.keys(notes).length === 0 means "no notes at all". */
  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) {
    const hasAnyData = counts.totalChecked > 0 || (notes && Object.keys(notes).length > 0);
    exportBtn.disabled = !hasAnyData;
  }
}

