/* ==================== PRESENTATION MODE ====================
   Full-screen, one-category-at-a-time view entered from the toolbar
   "Present" button or the P key. Filters (viewMode / viewFilter) stay
   active during presentation; getPresentableCategories returns the
   categories that are not empty under the current filter. Navigation
   is via arrow keys plus Space / PageUp / PageDown, and Esc exits
   (the keyboard listener lives in 18-app.js; enterPresentation,
   exitPresentation, showPresentationCategory, and presentationIndex
   are exposed globally from here). */

/* ==================== PRESENTATION MODE ==================== */
let presentationIndex = 0;

/* Presentable categories: those not hidden by the active filters.
   This way, under a filter like "Done MVP", navigation only steps
   through the categories that still match. */
function getPresentableCategories() {
  return [...document.querySelectorAll(".category:not(.hidden)")];
}

function enterPresentation() {
  const cats = getPresentableCategories();
  if (cats.length === 0) {
    /* If filter + search match nothing, presentation would be empty; warn and cancel. */
    showToast(t("pres.empty") || "Sunulacak madde yok", "info", 1800);
    return;
  }
  document.body.classList.add("presentation-mode");
  presentationIndex = 0;
  showPresentationCategory(0);
  updatePresentationContextBar();
}

function exitPresentation() {
  document.body.classList.remove("presentation-mode", "pres-filter-mvp", "pres-filter-release");
  document.querySelectorAll(".category.presenting").forEach(c => c.classList.remove("presenting"));
  applyFilters();
}

function showPresentationCategory(index) {
  const cats = getPresentableCategories();
  if (cats.length === 0) return;
  if (index < 0) index = 0;
  if (index >= cats.length) index = cats.length - 1;
  presentationIndex = index;
  /* Clear every existing .presenting class first (no leftovers from previous runs). */
  document.querySelectorAll(".category.presenting").forEach(c => c.classList.remove("presenting"));
  /* Mark the active visible category as presenting and expand it if collapsed. */
  const activeCat = cats[index];
  if (activeCat) {
    activeCat.classList.add("presenting");
    activeCat.classList.remove("collapsed");
  }
  window.scrollTo(0, 0);
  document.getElementById("presIndex").textContent = `${index + 1} / ${cats.length}`;
  updatePresentationContextBar();
}

/* Refreshes the presentation header bar to reflect the current filter
   and level view, showing which filter is active and how many items
   are visible. */
function updatePresentationContextBar() {
  const labelEl = document.getElementById("presContextLabel");
  const countEl = document.getElementById("presContextCount");
  if (!labelEl || !countEl) return;

  /* Chip color: green for viewMode "mvp", blue for "release", neutral for "both". */
  document.body.classList.toggle("pres-filter-mvp", viewMode === "mvp");
  document.body.classList.toggle("pres-filter-release", viewMode === "release");

  /* Context label: 9 combinations of viewMode x viewFilter. */
  let labelKey = "pres.context.all";
  if (viewMode === "mvp" && viewFilter === "all") labelKey = "pres.context.mvp";
  else if (viewMode === "mvp" && viewFilter === "pending") labelKey = "pres.context.mvpPending";
  else if (viewMode === "mvp" && viewFilter === "done") labelKey = "pres.context.mvpDone";
  else if (viewMode === "release" && viewFilter === "all") labelKey = "pres.context.release";
  else if (viewMode === "release" && viewFilter === "pending") labelKey = "pres.context.releasePending";
  else if (viewMode === "release" && viewFilter === "done") labelKey = "pres.context.releaseDone";
  else if (viewMode === "both" && viewFilter === "pending") labelKey = "pres.context.bothPending";
  else if (viewMode === "both" && viewFilter === "done") labelKey = "pres.context.bothDone";
  /* both + all falls through to "Tüm Liste" / "All Items" (the default labelKey). */
  labelEl.textContent = t(labelKey);

  /* Visible item count: number of .feature:not(.hidden) inside the active (presenting) category. */
  const activeCat = document.querySelector(".category.presenting");
  const visibleCount = activeCat ? activeCat.querySelectorAll(".feature:not(.hidden)").length : 0;
  countEl.textContent = visibleCount === 1 ? t("pres.itemCountOne") : t("pres.itemCount", { n: visibleCount });
}

document.getElementById("presentBtn").addEventListener("click", enterPresentation);
document.getElementById("presExit").addEventListener("click", exitPresentation);
document.getElementById("presPrev").addEventListener("click", () => showPresentationCategory(presentationIndex - 1));
document.getElementById("presNext").addEventListener("click", () => showPresentationCategory(presentationIndex + 1));
