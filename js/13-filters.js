/* Filtering: search query combined with the (viewMode, viewFilter) pair.
   A feature is considered visible if and only if at least one level row
   matches both viewMode (level scope) and viewFilter (status). This single
   rule covers all 9 combinations in the dropdown menu and stays consistent
   with the CSS row-hiding rules. */

/* Pure visibility predicate. Returns true iff the feature should be shown
   given the current filter inputs. Inputs are normalized:
     - q: already-lowercased and trimmed search query (applyFilters does
       this before calling).
     - searchText: the value of the .feature[data-search] attribute,
       populated at render time to a lowercased, tag-stripped
       concatenation of title + description + MVP + Release.
     - levels: array of { isMvp, isRelease, isChecked } records, one per
       level row inside the feature card. Empty array means the feature
       has no level rows; the level filter then never matches and the
       function returns false unless the default "both" / "all"
       early-exit took over first.
   Pulled out so tests in tests/filters.test.js can drive the matrix
   without constructing a DOM. */
function shouldShowFeature(q, viewMode, viewFilter, searchText, levels) {
  /* 1. Search match (or no search active). */
  const matchesSearch = q === "" || searchText.includes(q);
  if (!matchesSearch) return false;

  /* 2. Level match. The default combination "both" + "all" needs no
     per-level inspection. */
  if (viewMode === "both" && viewFilter === "all") return true;

  for (const lvl of levels) {
    if (viewMode === "mvp" && !lvl.isMvp) continue;
    if (viewMode === "release" && !lvl.isRelease) continue;
    if (viewFilter === "pending" && lvl.isChecked) continue;
    if (viewFilter === "done" && !lvl.isChecked) continue;
    return true;
  }
  return false;
}

function applyFilters() {
  const input = document.getElementById("searchInput");
  const q = input.value.trim().toLowerCase();
  const filtering = q !== "" || viewMode !== "both" || viewFilter !== "all";
  document.body.classList.toggle("filtering", filtering);
  /* Search-only flag: collapsed categories auto-expand only while a query is active. */
  document.body.classList.toggle("searching", q !== "");

  /* Skip the per-level DOM read when the default combination keeps every
     level visible; this preserves the original fast path on 55 features. */
  const inspectLevels = !(viewMode === "both" && viewFilter === "all");

  document.querySelectorAll(".feature").forEach(f => {
    const levels = inspectLevels
      ? Array.from(f.querySelectorAll(".level"), lvl => ({
          isMvp: lvl.classList.contains("mvp"),
          isRelease: lvl.classList.contains("release"),
          isChecked: lvl.classList.contains("checked"),
        }))
      : [];
    const visible = shouldShowFeature(q, viewMode, viewFilter, f.dataset.search, levels);
    f.classList.toggle("hidden", !visible);
  });
  document.querySelectorAll(".category").forEach(cat => {
    const visibleFeatures = cat.querySelectorAll(".feature:not(.hidden)").length;
    cat.classList.toggle("hidden", visibleFeatures === 0);
  });
}

function attachSearch() {
  const input = document.getElementById("searchInput");
  input.addEventListener("input", () => {
    applyFilters();
    /* The Expand-All / Collapse-All buttons need their disabled state
       refreshed depending on whether search is active (CSS auto-expand
       would otherwise conflict). */
    if (typeof updateToolbarButtonStates === "function") updateToolbarButtonStates();
  });
}

