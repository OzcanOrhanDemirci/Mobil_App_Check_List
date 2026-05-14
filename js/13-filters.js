/* Filtering: search query combined with the (viewMode, viewFilter) pair.
   A feature is considered visible if and only if at least one level row
   matches both viewMode (level scope) and viewFilter (status). This single
   rule covers all 9 combinations in the dropdown menu and stays consistent
   with the CSS row-hiding rules. */

function applyFilters() {
  const input = document.getElementById("searchInput");
  const q = input.value.trim().toLowerCase();
  const filtering = q !== "" || viewMode !== "both" || viewFilter !== "all";
  document.body.classList.toggle("filtering", filtering);
  /* Search-only flag: collapsed categories auto-expand only while a query is active. */
  document.body.classList.toggle("searching", q !== "");

  document.querySelectorAll(".feature").forEach(f => {
    const matchesSearch = q === "" || f.dataset.search.includes(q);
    let matchesLevel;
    if (viewMode === "both" && viewFilter === "all") {
      matchesLevel = true; // default: no level constraint
    } else {
      /* Does at least one level row match both viewMode and viewFilter? */
      const levels = f.querySelectorAll(".level");
      let hasMatch = false;
      for (const lvl of levels) {
        const isMvp = lvl.classList.contains("mvp");
        const isRelease = lvl.classList.contains("release");
        const isChecked = lvl.classList.contains("checked");
        if (viewMode === "mvp" && !isMvp) continue;
        if (viewMode === "release" && !isRelease) continue;
        if (viewFilter === "pending" && isChecked) continue;
        if (viewFilter === "done" && !isChecked) continue;
        hasMatch = true;
        break;
      }
      matchesLevel = hasMatch;
    }
    f.classList.toggle("hidden", !(matchesSearch && matchesLevel));
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

