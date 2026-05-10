/* ==================== STATE ====================
   state, notes, collapsedCats, currentFramework, viewMode, viewFilter, lockState
   hepsi aktif projenin .data alanından okunup yazılır (04-projects.js).
   Aktif proje değişince bu değişkenler reloadActiveProjectAndRender ile yenilenir. */

let state = loadState();
let notes = loadNotes();
let collapsedCats = loadCollapsed();
let currentFramework = loadFramework();
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

/* Kilit görsel/etkileşim durumunu uygular: body class, etkilenen butonların disabled,
   kilit butonunun kendi görüntüsü. Çağrı her state değişiminden sonra ve init'te. */
function applyLock() {
  document.body.classList.toggle("locked", lockState);

  /* Kilitliyken devre dışı kalacak butonlar (state değiştiren tüm aksiyonlar) */
  const lockedTargets = ["projectFrameworkBtn", "resetBtn", "importBtn"];
  lockedTargets.forEach(id => {
    const b = document.getElementById(id);
    if (b) b.disabled = lockState;
  });

  /* Kilit butonunun kendisi: ikon + etiket + active class */
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

/* Tek setView fonksiyonu: hem viewMode hem viewFilter'ı uygular,
   body class'larını günceller, hero pill'lerini ve dropdown'ları işaretler,
   feature/category visibility'sini ve sunum bağlam çubuğunu yeniler. */
function applyView() {
  /* Body class'ları: CSS satır gizleme kuralları için */
  document.body.classList.toggle("view-mvp-only", viewMode === "mvp");
  document.body.classList.toggle("view-release-only", viewMode === "release");
  document.body.classList.toggle("filter-pending", viewFilter === "pending");
  document.body.classList.toggle("filter-done", viewFilter === "done");

  /* Hero pill aktif state + sub-label + dropdown menü active item */
  document.querySelectorAll(".lv-group").forEach(group => {
    const mode = group.dataset.viewMode;
    const isActive = mode === viewMode;
    const pill = group.querySelector(".level-filter-pill");
    pill.classList.toggle("active", isActive);
    pill.setAttribute("aria-pressed", isActive ? "true" : "false");
    /* Sub-label: aktif pill'de ve viewFilter "all" değilse göster */
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
    /* Menü active item — sadece aktif pill'in menüsünde işaretle */
    group.querySelectorAll(".lv-menu button").forEach(b => {
      const isItemActive = isActive && b.dataset.viewFilter === viewFilter;
      b.classList.toggle("active", isItemActive);
    });
  });

  applyFilters();
  updateToolbarButtonStates();
  /* Sunum modu açıksa context bar'ı güncelle */
  if (document.body.classList.contains("presentation-mode") && typeof updatePresentationContextBar === "function") {
    updatePresentationContextBar();
  }
}

/* Genel API: hem mode hem filter'ı tek seferde değiştir.
   Örn: setView("mvp", "pending") → MVP + Yapılacak. */
function setView(mode, filter) {
  if (mode !== undefined) saveViewMode(mode);
  if (filter !== undefined) saveViewFilter(filter);
  applyView();
}

/* Hero dropdown'larındaki opsiyonların ve toolbar yan butonlarının disabled state'i:
   - Pending opsiyonu: ilgili seviyede hiç işaret yoksa devre dışı (filtre tüm maddeyi gösterir = gereksiz).
   - Done opsiyonu: ilgili seviyede hiç işaret yoksa devre dışı (gösterecek bir şey yok).
   - Tümü opsiyonu: her zaman aktif.
   - Aktif viewFilter devre dışı bir opsiyona düşerse otomatik "all"a fallback yapılır.
   - Tümünü Aç / Kapat: viewFilter "all" değilse devre dışı (filtre aktifken collapse çelişkili). */
function updateToolbarButtonStates() {
  const expandBtn   = document.getElementById("expandAllBtn");
  const collapseBtn = document.getElementById("collapseAllBtn");
  if (!expandBtn || !collapseBtn) return;

  const counts = (typeof countLevels === "function") ? countLevels() : { mvpChecked: 0, releaseChecked: 0, totalChecked: 0 };
  const mvpHasNoChecks = counts.mvpChecked === 0;
  const relHasNoChecks = counts.releaseChecked === 0;

  /* Hero dropdown'larında her opsiyonu disabled veya değil olarak işaretle */
  document.querySelectorAll(".lv-group").forEach(group => {
    const mode = group.dataset.viewMode; // mvp | release | both
    const items = group.querySelectorAll(".lv-menu button");
    items.forEach(btn => {
      const filt = btn.dataset.viewFilter; // all | pending | done
      let disabled = false;
      if (filt === "all") {
        disabled = false;
      } else if (mode === "mvp") {
        disabled = mvpHasNoChecks;
      } else if (mode === "release") {
        disabled = relHasNoChecks;
      } else { // both
        /* "both + pending/done" en az bir seviyede işaret varsa anlamlı */
        disabled = mvpHasNoChecks && relHasNoChecks;
      }
      btn.disabled = disabled;
    });
  });

  /* Aktif kombinasyon devre dışı kaldıysa "all"a fallback */
  let invalid = false;
  if (viewFilter === "pending" || viewFilter === "done") {
    if (viewMode === "mvp" && mvpHasNoChecks) invalid = true;
    else if (viewMode === "release" && relHasNoChecks) invalid = true;
    else if (viewMode === "both" && mvpHasNoChecks && relHasNoChecks) invalid = true;
  }
  if (invalid) {
    saveViewFilter("all");
    document.body.classList.remove("filter-pending", "filter-done");
    /* Aktif menü item'ı güncelle, sub-label'ı sıfırla */
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

  /* Tümünü Aç/Kapat: yalnızca aktif aramada devre dışı (CSS auto-expand override
     ediyor, manuel toggle görünmez kalır). viewMode/viewFilter aktif olsa bile
     kullanıcı kategorileri manuel açıp kapayabilir. */
  const isSearching = document.body.classList.contains("searching");
  expandBtn.disabled = isSearching;
  collapseBtn.disabled = isSearching;

  /* Kilit butonu: hiç işaret yoksa gri */
  const lockBtn = document.getElementById("lockBtn");
  if (lockBtn) {
    lockBtn.disabled = !lockState && counts.totalChecked === 0;
  }

  /* Dışa Aktar: hiç işaret VE not yoksa devre dışı (yedeklenecek bir şey yok).
     Notes sadece dolu (trim'li) içerikleri tutuyor (saveNotes boşları siliyor),
     bu yüzden Object.keys(notes).length === 0 = "hiç not yok" demek. */
  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) {
    const hasAnyData = counts.totalChecked > 0 || (notes && Object.keys(notes).length > 0);
    exportBtn.disabled = !hasAnyData;
  }
}

