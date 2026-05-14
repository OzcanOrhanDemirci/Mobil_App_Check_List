/* ==================== SUNUM MODU ====================
   Toolbar Sun butonu ve P tusu ile girilen tam-ekran tek-kategori
   gorunumu. Filtreler (viewMode/viewFilter) sunumda da aktif kalir;
   getPresentableCategories filtreye gore bos kalmayan kategorileri
   dondurur. Klavye oklari + space/PageUp/PageDown ile gezinme,
   Esc ile cikis (klavye dinleyici 18-app.js'tedir; enterPresentation
   / exitPresentation / showPresentationCategory / presentationIndex
   buradan global olarak erisilir). */

/* ==================== SUNUM MODU ==================== */
let presentationIndex = 0;

/* Sunulabilir kategoriler: aktif filtrelerle gizlenmemiş olanlar.
   Bu sayede "Yapılan MVP" filtresinde sadece o filtreye uyan kategoriler arası geçilir. */
function getPresentableCategories() {
  return [...document.querySelectorAll(".category:not(.hidden)")];
}

function enterPresentation() {
  const cats = getPresentableCategories();
  if (cats.length === 0) {
    /* Filtre + arama hiçbir şeyle eşleşmiyorsa sunum boş olur — uyarı verip iptal */
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
  /* Önce tüm presenting class'ını temizle (önceki sunumlardan kalmamış olsun) */
  document.querySelectorAll(".category.presenting").forEach(c => c.classList.remove("presenting"));
  /* Aktif olan görünür kategoriye presenting ekle, kapalıysa aç */
  const activeCat = cats[index];
  if (activeCat) {
    activeCat.classList.add("presenting");
    activeCat.classList.remove("collapsed");
  }
  window.scrollTo(0, 0);
  document.getElementById("presIndex").textContent = `${index + 1} / ${cats.length}`;
  updatePresentationContextBar();
}

/* Sunum modu üst başlık çubuğunu mevcut filter + level view'e göre günceller.
   Hangi süzgeçle sunum yapıldığını ve görünür madde sayısını gösterir. */
function updatePresentationContextBar() {
  const labelEl = document.getElementById("presContextLabel");
  const countEl = document.getElementById("presContextCount");
  if (!labelEl || !countEl) return;

  /* Chip rengi: viewMode mvp ise yeşil, release ise mavi, both ise nötr */
  document.body.classList.toggle("pres-filter-mvp", viewMode === "mvp");
  document.body.classList.toggle("pres-filter-release", viewMode === "release");

  /* Bağlam etiketi: 9 kombinasyon (viewMode × viewFilter) */
  let labelKey = "pres.context.all";
  if (viewMode === "mvp" && viewFilter === "all") labelKey = "pres.context.mvp";
  else if (viewMode === "mvp" && viewFilter === "pending") labelKey = "pres.context.mvpPending";
  else if (viewMode === "mvp" && viewFilter === "done") labelKey = "pres.context.mvpDone";
  else if (viewMode === "release" && viewFilter === "all") labelKey = "pres.context.release";
  else if (viewMode === "release" && viewFilter === "pending") labelKey = "pres.context.releasePending";
  else if (viewMode === "release" && viewFilter === "done") labelKey = "pres.context.releaseDone";
  else if (viewMode === "both" && viewFilter === "pending") labelKey = "pres.context.bothPending";
  else if (viewMode === "both" && viewFilter === "done") labelKey = "pres.context.bothDone";
  /* both + all → "Tüm Liste" (default labelKey) */
  labelEl.textContent = t(labelKey);

  /* Görünür madde sayısı: aktif (presenting) kategorideki .feature:not(.hidden) sayısı */
  const activeCat = document.querySelector(".category.presenting");
  const visibleCount = activeCat ? activeCat.querySelectorAll(".feature:not(.hidden)").length : 0;
  countEl.textContent = visibleCount === 1 ? t("pres.itemCountOne") : t("pres.itemCount", { n: visibleCount });
}

document.getElementById("presentBtn").addEventListener("click", enterPresentation);
document.getElementById("presExit").addEventListener("click", exitPresentation);
document.getElementById("presPrev").addEventListener("click", () => showPresentationCategory(presentationIndex - 1));
document.getElementById("presNext").addEventListener("click", () => showPresentationCategory(presentationIndex + 1));
