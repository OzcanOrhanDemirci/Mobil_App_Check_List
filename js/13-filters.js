/* Filtreleme: arama + (viewMode, viewFilter) çifti.
   Bir feature görünür sayılır ancak ve ancak: en az bir level satırı (viewMode'a uygun
   seviyede ve viewFilter'a uygun status'da) gösterilebiliyorsa. Bu yaklaşım hem dropdown
   menüsündeki 9 kombinasyonun hepsi için tek bir mantıkla çalışır hem de CSS satır
   gizleme kurallarıyla tutarlıdır. */

function applyFilters() {
  const input = document.getElementById("searchInput");
  const q = input.value.trim().toLowerCase();
  const filtering = q !== "" || viewMode !== "both" || viewFilter !== "all";
  document.body.classList.toggle("filtering", filtering);
  /* Search özel: kapalı kategorilerin auto-expand olması yalnızca arama varken */
  document.body.classList.toggle("searching", q !== "");

  document.querySelectorAll(".feature").forEach(f => {
    const matchesSearch = q === "" || f.dataset.search.includes(q);
    let matchesLevel;
    if (viewMode === "both" && viewFilter === "all") {
      matchesLevel = true; // varsayılan: hiçbir level kısıtı yok
    } else {
      /* En az bir level satırı viewMode + viewFilter ile uyuşuyor mu? */
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
    /* Search aktif olup olmamasına göre Tümünü Aç/Kapat butonlarının
       disabled state'i güncellenmeli (CSS auto-expand çakışıyor). */
    if (typeof updateToolbarButtonStates === "function") updateToolbarButtonStates();
  });
}

