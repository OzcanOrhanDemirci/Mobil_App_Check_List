/* Tümünü Aç */
document.getElementById("expandAllBtn").addEventListener("click", () => {
  document.querySelectorAll(".category").forEach(c => {
    c.classList.remove("collapsed");
    collapsedCats.delete(c.id);
  });
  saveCollapsed();
});

/* Tümünü Kapat */
document.getElementById("collapseAllBtn").addEventListener("click", () => {
  document.querySelectorAll(".category").forEach(c => {
    c.classList.add("collapsed");
    collapsedCats.add(c.id);
  });
  saveCollapsed();
});

/* Reset (2 aşamalı: scope seçimi → onay → uygula) */
document.getElementById("resetBtn").addEventListener("click", () => {
  if (lockState) return;
  /* Modalı her açılışta sıfırla: tüm checkbox'ları temizle, "İleri" disabled */
  document.querySelectorAll("[data-reset-scope]").forEach(cb => {
    cb.checked = false;
    cb.disabled = false;
  });
  document.getElementById("resetScopeNext").disabled = true;
  openModal("resetScopeModal");
});

/* Scope seçim kuralları (4 seçenek: selections, notes, settings, system):
   - "system" seçilirse diğer 3 otomatik kapanır + disable olur (zaten her şeyi kapsar)
   - "system" işareti kaldırılırsa diğer 3 enable olur
   - Diğer 3'ten biri seçilirken "system" varsa otomatik kapanır (defansif)
   - "İleri" en az 1 seçim varsa enable olur */
const RESET_INDEPENDENT_SCOPES = ["selections", "notes", "settings"];
document.querySelectorAll("[data-reset-scope]").forEach(cb => {
  cb.addEventListener("change", () => {
    const others = RESET_INDEPENDENT_SCOPES.map(s => document.querySelector(`[data-reset-scope="${s}"]`));
    const sys = document.querySelector('[data-reset-scope="system"]');
    if (cb === sys) {
      if (sys.checked) {
        others.forEach(o => { o.checked = false; o.disabled = true; });
      } else {
        others.forEach(o => { o.disabled = false; });
      }
    } else if (cb.checked && sys.checked) {
      sys.checked = false;
      others.forEach(o => { o.disabled = false; });
    }
    const anyChecked = sys.checked || others.some(o => o.checked);
    document.getElementById("resetScopeNext").disabled = !anyChecked;
  });
});

/* "İleri" → 1. modalı kapat, customConfirm (2. adım) aç */
document.getElementById("resetScopeNext").addEventListener("click", () => {
  const scope = {
    selections: document.querySelector('[data-reset-scope="selections"]').checked,
    notes:      document.querySelector('[data-reset-scope="notes"]').checked,
    settings:   document.querySelector('[data-reset-scope="settings"]').checked,
    system:     document.querySelector('[data-reset-scope="system"]').checked,
  };
  closeModal("resetScopeModal");

  /* Onay HTML'ini dinamik kur: "system" ise tek satır uyarı; diğer 1-3 kombinasyonu ise liste */
  let html, yesKey = "reset.yes";
  if (scope.system) {
    html = t("reset.confirm.system");
    yesKey = "reset.yesSystem";
  } else {
    const parts = [];
    if (scope.selections) parts.push(t("reset.confirm.part.selections"));
    if (scope.notes)      parts.push(t("reset.confirm.part.notes"));
    if (scope.settings)   parts.push(t("reset.confirm.part.settings"));
    if (parts.length === 0) return;
    html = `
      <p class="fw-switch-intro">${t("reset.confirm.intro")}</p>
      <ul class="fw-switch-effects">
        ${parts.map(p => `<li class="effect-clear"><span class="effect-icon">⚠</span><span>${p}</span></li>`).join("")}
      </ul>
    `;
  }

  customConfirm(
    html,
    () => performReset(scope),
    { title: t("reset.confirmTitle"), yesText: t(yesKey), cancelText: t("confirm.cancel"), html: true, wide: !scope.system }
  );
});

/* Asıl sıfırlama mantığı, scope objesine göre */
function performReset(scope) {
  /* "Tüm Sistem": localStorage'ı tamamen temizle ve sayfayı yenile.
     Böylece welcome akışı yeniden tetiklenir, kullanıcı baştan başlar. */
  if (scope.system) {
    showToast("✓", "info", 600);
    setTimeout(() => {
      try { localStorage.clear(); } catch {}
      location.reload();
    }, 200);
    return;
  }

  /* Seçimler: işaretler + kutlama bayrakları */
  if (scope.selections) {
    state = {};
    saveState();
    celebrations = {};
    saveCelebrations();
    document.querySelectorAll(".level.checked").forEach(el => el.classList.remove("checked"));
  }

  /* Notlar: tüm notlar silinir */
  if (scope.notes) {
    notes = {};
    saveNotes();
    /* Açık not textarea'larını temizle, has-note class'ını kaldır, sunum-notu textini sil */
    document.querySelectorAll("[data-note-input]").forEach(ta => { ta.value = ""; });
    document.querySelectorAll(".feature.has-note").forEach(f => f.classList.remove("has-note"));
    document.querySelectorAll(".note-display-text").forEach(el => { el.textContent = ""; });
    /* Not toggle butonlarındaki ikon/etiket güncelle ("+ Not ekle" haline dön) */
    document.querySelectorAll("[data-note-toggle]").forEach(btn => {
      const icon = btn.querySelector(".note-icon");
      const label = btn.querySelector(".note-label");
      if (icon) icon.textContent = "+";
      if (label) label.textContent = t("note.add");
    });
  }

  /* Ayarlar: kategori collapse + tema + view + lock */
  if (scope.settings) {
    collapsedCats = new Set(DATA.map(c => `cat-${c.id}`));
    saveCollapsed();
    applyTheme("dark");
    saveViewMode("both");
    saveViewFilter("all");
    saveLockState(false);
  }

  /* UI'ı yenile */
  if (scope.selections || scope.notes || scope.settings) {
    if (scope.settings) {
      /* renderContent collapsedCats'i uygular (tüm cats kapalı) — selections/notes
         de zaten yeni state'i okuyarak doğru render edecek */
      renderContent();
      attachClickHandlers();
    }
    applyView();      // body class'ları, hero pill'leri, filter
    applyLock();      // lock UI
    updateProgress(); // ilerleme barı + toolbar buton state'leri
    applyFilters();   // feature/category visibility
  }

  /* Toast */
  if (scope.selections || scope.notes || scope.settings) {
    showToast(t("reset.toast.done"), "info", 1500);
  }
}

/* ==================== KİLİT (LOCK) ==================== */
document.getElementById("lockBtn").addEventListener("click", () => {
  if (!lockState) {
    /* Kilitle: zengin onay UI'ı */
    const html = `
      <div class="lock-confirm">
        <p class="fw-switch-intro">${t("lock.intro")}</p>
        <ul class="fw-switch-effects">
          <li class="effect-clear"><span class="effect-icon">🔒</span><span>${t("lock.effect.marks")}</span></li>
          <li class="effect-clear"><span class="effect-icon">🔒</span><span>${t("lock.effect.fw")}</span></li>
          <li class="effect-clear"><span class="effect-icon">🔒</span><span>${t("lock.effect.reset")}</span></li>
          <li class="effect-keep"><span class="effect-icon">✓</span><span>${t("lock.effect.print")}</span></li>
          <li class="effect-keep"><span class="effect-icon">✓</span><span>${t("lock.effect.normal")}</span></li>
        </ul>
      </div>
    `;
    customConfirm(
      html,
      () => {
        saveLockState(true);
        applyLock();
        showToast(t("lock.locked"), "success", 1600);
      },
      { title: t("lock.confirmTitle"), yesText: t("lock.confirmYes"), cancelText: t("lock.confirmCancel"), html: true, wide: true }
    );
  } else {
    /* Kilidi aç: daha basit onay */
    const html = `
      <div class="lock-confirm">
        <p class="fw-switch-intro">${t("lock.unlockIntro")}</p>
        <ul class="fw-switch-effects">
          <li class="effect-keep"><span class="effect-icon">🔓</span><span>${t("lock.unlockEffect.marks")}</span></li>
          <li class="effect-keep"><span class="effect-icon">🔓</span><span>${t("lock.unlockEffect.fw")}</span></li>
          <li class="effect-keep"><span class="effect-icon">🔓</span><span>${t("lock.unlockEffect.reset")}</span></li>
        </ul>
      </div>
    `;
    customConfirm(
      html,
      () => {
        saveLockState(false);
        applyLock();
        showToast(t("lock.unlocked"), "info", 1400);
      },
      { title: t("lock.unlockTitle"), yesText: t("lock.unlockYes"), cancelText: t("lock.confirmCancel"), html: true, wide: true }
    );
  }
});

/* Mobil eylem menüsü aç/kapa
   Mobil ekranda sticky alan kompakttır: arama + 3 mini ilerleme barı görünür,
   diğer butonlar ≡ düğmesinin arkasında durur. Burada açma/kapama davranışı,
   panel dışına tıklama ile kapatma ve eylem sonrası otomatik kapatma var. */
(function setupMobileActionsToggle() {
  const toggleBtn = document.getElementById("actionsToggle");
  const toolbarEl = toggleBtn ? toggleBtn.closest(".toolbar") : null;
  if (!toggleBtn || !toolbarEl) return;

  const close = () => {
    toolbarEl.classList.remove("actions-open");
    toggleBtn.setAttribute("aria-expanded", "false");
  };
  const open = () => {
    toolbarEl.classList.add("actions-open");
    toggleBtn.setAttribute("aria-expanded", "true");
  };

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (toolbarEl.classList.contains("actions-open")) close(); else open();
  });

  /* Toolbar dışında bir yere tıklayınca paneli kapat */
  document.addEventListener("click", (e) => {
    if (!toolbarEl.classList.contains("actions-open")) return;
    if (toolbarEl.contains(e.target)) return;
    close();
  });

  /* Filtre toggle butonları (MVP/Release Eksik) görsel toggle olduğu için
     panel açık kalsın. Diğer eylemler genelde modal/işlem açar; tıklayınca
     mobilde görüş alanını boşaltmak için paneli kapat. */
  const KEEP_OPEN_IDS = new Set(["filterMvpPending", "filterMvpDone", "filterReleasePending", "filterReleaseDone"]);
  toolbarEl.querySelectorAll(".actions .btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (KEEP_OPEN_IDS.has(btn.id)) return;
      close();
    });
  });

  /* Esc ile de kapansın (mevcut keydown handler'ı bozmadan ayrı dinleyici) */
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!toolbarEl.classList.contains("actions-open")) return;
    /* Açık modal varsa onun esc handler'ı önce çalışsın */
    const openModalEl = [...document.querySelectorAll(".modal")].find(m => !m.hidden);
    if (openModalEl) return;
    close();
  });
})();

/* Long-press easter egg, generic kurulum.
   Kısa tıklama hiçbir şey yapmaz; ~3 sn basılı tutunca verilen URL
   yeni sekmede açılır. Mouse + dokunma desteklenir; parmak >14px
   kayarsa basış iptal olur (kullanıcı sayfayı kaydırmaya çalışırsa
   kazara tetiklenmesin). Mobilde context menü engellenir. */
function setupLongPressEasterEgg(el, link, toastMsg) {
  if (!el) return;
  const HOLD_MS = 3000;
  const MOVE_TOLERANCE = 14;
  let timer = null;
  let startX = 0, startY = 0;

  const start = () => {
    cancel();
    el.classList.add("pressing");
    timer = setTimeout(() => {
      el.classList.remove("pressing");
      el.classList.add("triggered");
      try {
        const msg = (typeof toastMsg === "function") ? toastMsg() : toastMsg;
        showToast(msg, "info", 1600);
      } catch {}
      window.open(link, "_blank", "noopener,noreferrer");
      setTimeout(() => el.classList.remove("triggered"), 800);
      timer = null;
    }, HOLD_MS);
  };

  const cancel = () => {
    if (timer) { clearTimeout(timer); timer = null; }
    el.classList.remove("pressing");
  };

  /* Mouse */
  el.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    start();
  });
  el.addEventListener("mouseup", cancel);
  el.addEventListener("mouseleave", cancel);

  /* Touch */
  el.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    startX = t.clientX; startY = t.clientY;
    start();
  }, { passive: true });
  el.addEventListener("touchmove", (e) => {
    if (!timer) return;
    const t = e.touches[0];
    if (Math.abs(t.clientX - startX) > MOVE_TOLERANCE
     || Math.abs(t.clientY - startY) > MOVE_TOLERANCE) cancel();
  }, { passive: true });
  el.addEventListener("touchend", cancel);
  el.addEventListener("touchcancel", cancel);

  /* Mobil long-press menüsünü engelle */
  el.addEventListener("contextmenu", (e) => e.preventDefault());
}

/* Hero rozeti -> LinkedIn; footer versiyon damgası -> GitHub.
   toastMsg her seferinde t() ile çözülsün diye fonksiyonel olarak verilebilir
   ama mevcut setup kuralı statik string istiyor; aşağıda lazy çağrı için
   her tetiklenmede currentLang üzerinden çevir. setup'a fonksiyonel desteği
   eklemek yerine, çeviri için bir wrapper kullanıyoruz. */
setupLongPressEasterEgg(
  document.querySelector(".instructor"),
  "https://www.linkedin.com/in/ozcan-orhan-demirci/",
  () => t("easter.linkedin")
);
setupLongPressEasterEgg(
  document.getElementById("footVersion"),
  "https://github.com/OzcanOrhanDemirci",
  () => t("easter.github")
);

/* Yardım butonu (toolbar) — anlık dil switcher'ı göstermez (zaten dil seçilmiştir,
   üst-sağdaki global 🌐 TR/EN butonu var). */
document.getElementById("helpBtn").addEventListener("click", () => {
  if (typeof setHelpLangSwitchVisible === "function") setHelpLangSwitchVisible(false);
  /* Eğer önceki açılıştan in-modal switcher ile dil değişmiş kaldıysa global dile çek */
  if (typeof applyHelpDisplayLang === "function") applyHelpDisplayLang(currentLang);
  openModal("helpModal");
});

/* Print */
document.getElementById("printBtn").addEventListener("click", () => window.print());

/* Export: state + notes birlikte */
document.getElementById("exportBtn").addEventListener("click", () => {
  const data = JSON.stringify({
    version: 2,
    state: state,
    notes: notes,
    exportedAt: new Date().toISOString()
  }, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mobil-kontrol-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

/* Import: yeni format (state + notes) ve eski format (sadece state) */
const importFile = document.getElementById("importFile");
document.getElementById("importBtn").addEventListener("click", () => {
  if (lockState) return;
  importFile.click();
});
importFile.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      if (typeof data !== "object" || data === null) throw new Error(t("misc.invalidFormat"));

      if (data.version && data.state) {
        state = data.state || {};
        notes = data.notes || {};
      } else {
        state = data;
      }
      saveState();
      saveNotes();
      renderContent();
      attachClickHandlers();
      updateProgress();
      applyFilters();
    } catch { alert(t("misc.invalidFile")); }
  };
  reader.readAsText(file);
  importFile.value = "";
});

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
  countEl.textContent = visibleCount === 1
    ? t("pres.itemCountOne")
    : t("pres.itemCount", { n: visibleCount });
}

document.getElementById("presentBtn").addEventListener("click", enterPresentation);
document.getElementById("presExit").addEventListener("click", exitPresentation);
document.getElementById("presPrev").addEventListener("click", () => showPresentationCategory(presentationIndex - 1));
document.getElementById("presNext").addEventListener("click", () => showPresentationCategory(presentationIndex + 1));

/* ==================== KLAVYE KISAYOLLARI ==================== */
document.addEventListener("keydown", (e) => {
  const inPres = document.body.classList.contains("presentation-mode");
  const inField = e.target.matches("input, textarea");

  /* Esc her durumda: önce açık modal, sonra açık AI paneli, sonra sunum */
  if (e.key === "Escape") {
    const openModalEl = [...document.querySelectorAll(".modal")].find(m => !m.hidden);
    if (openModalEl) {
      /* Karşılama modalı Esc ile kapanmaz, kullanıcı bilinçli olarak Tamam'a basmalı */
      if (openModalEl.id === "welcomeModal") return;
      e.preventDefault();
      openModalEl.hidden = true;
      /* Yardım modalı Esc ile kapatıldıysa anlık dil switcher'ını sıfırla */
      if (openModalEl.id === "helpModal" && typeof setHelpLangSwitchVisible === "function") {
        setHelpLangSwitchVisible(false);
        if (typeof applyHelpDisplayLang === "function") applyHelpDisplayLang(currentLang);
      }
      return;
    }
    const openAi = document.querySelector(".feature-ai-wrap.ai-open");
    if (openAi) {
      e.preventDefault();
      openAi.classList.remove("ai-open");
      return;
    }
    if (inPres) { e.preventDefault(); exitPresentation(); return; }
  }

  if (inPres) {
    if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
      if (inField) return;
      e.preventDefault();
      showPresentationCategory(presentationIndex + 1);
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      if (inField) return;
      e.preventDefault();
      showPresentationCategory(presentationIndex - 1);
    }
    return;
  }

  if (inField) return;

  if (e.key === "?") {
    e.preventDefault();
    openModal("helpModal");
  } else if (e.key === "/") {
    e.preventDefault();
    document.getElementById("searchInput").focus();
  } else if (e.key.toLowerCase() === "p" && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    enterPresentation();
  }
});

/* ==================== PWA MANIFEST ====================
   http(s) ortamında <link rel="manifest" href="manifest.webmanifest">
   statik referansı kullanılır. file:// ile (offline tek-dosya açılış)
   manifest.webmanifest yüklenemediğinde blob URL'li bir manifest
   üretip statik linki onunla değiştiririz, böylece offline indirilen
   tek HTML dosyası da çalışır. */
(function setupManifest() {
  if (location.protocol !== "file:") return;
  try {
    const existing = document.getElementById("manifestLink");
    if (existing) existing.parentNode.removeChild(existing);

    const iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="42" fill="#0b0f17"/><path d="M52 96 L84 128 L140 64" stroke="#f97316" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
    const iconUrl = "data:image/svg+xml," + encodeURIComponent(iconSvg);
    const manifest = {
      name: "Mobil Uygulama Kalite Kontrol Listesi",
      short_name: "Kontrol Listesi",
      description: "Geliştirilen mobil uygulamanın MVP ve Release seviyelerinde kalite kontrolünü yapmaya yarayan interaktif kontrol listesi.",
      start_url: ".",
      scope: ".",
      display: "standalone",
      orientation: "portrait",
      background_color: "#0b0f17",
      theme_color: "#0b0f17",
      icons: [
        { src: iconUrl, sizes: "192x192", type: "image/svg+xml", purpose: "any" },
        { src: iconUrl, sizes: "512x512", type: "image/svg+xml", purpose: "any" },
        { src: iconUrl, sizes: "192x192", type: "image/svg+xml", purpose: "maskable" },
        { src: iconUrl, sizes: "512x512", type: "image/svg+xml", purpose: "maskable" }
      ]
    };
    const blob = new Blob([JSON.stringify(manifest)], { type: "application/manifest+json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("link");
    link.rel = "manifest";
    link.href = url;
    document.head.appendChild(link);
  } catch (err) { /* sessizce geç */ }
})();

/* ==================== SERVICE WORKER ====================
   Gerçek bir sw.js dosyası kayıt için kullanılır, Chrome/Edge gibi
   Chromium tabanlı tarayıcılarda PWA install prompt için ZORUNLU
   (blob: URL'li SW kayıtları install kriterlerini geçmiyor).
   Eğer ./sw.js yüklenemezse (file:// veya 404), blob URL'li bir
   yedek SW devreye girer; Chromium yine reddederse sessizce geçilir. */
(function setupServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (!window.isSecureContext) return;
  if (location.protocol !== "https:" && location.protocol !== "http:") return;

  navigator.serviceWorker.register("./sw.js", { scope: "./" })
    .catch(() => {
      /* sw.js bulunamadıysa (örn. tek-dosya offline kullanım) blob fallback */
      try {
        const swCode = `
          const CACHE_NAME = 'mobil-kontrol-v1';
          self.addEventListener('install', (e) => { self.skipWaiting(); });
          self.addEventListener('activate', (e) => {
            e.waitUntil(Promise.all([
              caches.keys().then((keys) => Promise.all(
                keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
              )),
              self.clients.claim()
            ]));
          });
          self.addEventListener('fetch', (e) => {
            if (e.request.method !== 'GET') return;
            const url = new URL(e.request.url);
            if (url.origin !== self.location.origin) return;
            e.respondWith(
              fetch(e.request).then((response) => {
                if (response && response.ok && response.type === 'basic') {
                  const clone = response.clone();
                  caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
                }
                return response;
              }).catch(() => caches.match(e.request))
            );
          });
        `;
        const swBlob = new Blob([swCode], { type: "application/javascript" });
        const swUrl = URL.createObjectURL(swBlob);
        navigator.serviceWorker.register(swUrl, { scope: "./" }).catch(() => {
          /* Chromium blob URL'li SW'yi reddeder; sessizce geç */
        });
      } catch { /* sessizce */ }
    });
})();

/* ==================== KARŞILAMA (WELCOME) MODALI ==================== */
/* Framework henüz seçilmediyse karşılama modalını 3 adımda göster:
   1) Dil seçimi  2) Framework seçimi  3) Tanıtım / Başlayalım
   Dil seçilene dek 1. adım, framework seçilene dek 2. adımda CTA disabled. */
function showWelcomeIfFirstVisit() {
  if (currentFramework) return;
  setTimeout(() => {
    setWelcomeStep(1);
    openModal("welcomeModal");
  }, 350);
}

/* Welcome modalı içindeki seçimler — buton tıklanana dek kalıcılaştırılmaz */
let pendingFramework = null;
let pendingLang = null;

function setWelcomeStep(n) {
  /* 1 → dil, 2 → framework, 3 → karşılama / nasıl kullanılır */
  document.querySelectorAll(".welcome-pane").forEach(p => {
    p.hidden = String(p.dataset.pane) !== String(n);
  });
  /* Adım göstergesini güncelle */
  document.querySelectorAll("[data-step-dot]").forEach(d => {
    const idx = Number(d.dataset.stepDot);
    d.classList.toggle("active", idx === n);
    d.classList.toggle("done", idx < n);
  });
  /* İki çizgi var: 1→2 ve 2→3 */
  document.querySelectorAll("[data-step-line]").forEach(line => {
    const after = Number(line.dataset.stepLine); // 1 → 1.dot ile 2.dot arasındaki çizgi
    line.classList.toggle("done", n > after);
  });
  /* Modalın hangi adımda olduğunu CSS'in görebilmesi için data-step attribute'u
     (örn. 1. adımda yardım butonunun yazısı CSS ile gizleniyor — kullanıcı
     henüz dil seçmediği için "Yardım/Help" iki dilde yer kaplamasın). */
  const modal = document.getElementById("welcomeModal");
  if (modal) modal.setAttribute("data-step", String(n));
}

/* 1. ADIM: Dil seçimi */
document.querySelectorAll("[data-welcome-lang]").forEach(btn => {
  btn.addEventListener("click", () => {
    pendingLang = btn.dataset.welcomeLang;
    window.pendingLang = pendingLang;
    document.querySelectorAll("[data-welcome-lang]").forEach(b => {
      b.classList.toggle("selected", b === btn);
    });
    const nextBtn = document.getElementById("welcomeLangNext");
    nextBtn.disabled = false;
    nextBtn.textContent = t("welcome.cta.next");
  });
});

document.getElementById("welcomeLangNext").addEventListener("click", () => {
  if (!pendingLang) return;
  /* Seçilen dili anında uygula: bundan sonraki adımlar bu dilde gözüksün */
  if (pendingLang !== currentLang) {
    saveLang(pendingLang);
    applyLang();
  }
  setWelcomeStep(2);
});

/* 2. ADIM: Framework seçimi */
document.querySelectorAll("[data-welcome-fw]").forEach(btn => {
  btn.addEventListener("click", () => {
    pendingFramework = btn.dataset.welcomeFw;
    window.pendingFramework = pendingFramework;
    document.querySelectorAll("[data-welcome-fw]").forEach(b => {
      b.classList.toggle("selected", b === btn);
    });
    const nextBtn = document.getElementById("welcomeNext");
    nextBtn.disabled = false;
    nextBtn.textContent = t("welcome.cta.next");
  });
});

document.getElementById("welcomeNext").addEventListener("click", () => {
  if (!pendingFramework) return;
  setWelcomeStep(3);
});

document.getElementById("welcomeFwBack").addEventListener("click", () => {
  setWelcomeStep(1);
});

/* 3. ADIM: Karşılama */
document.getElementById("welcomeBack").addEventListener("click", () => {
  setWelcomeStep(2);
});

/* Welcome modalı içindeki yardım butonu — yardım modalını üstte açar, welcome'ı kapatmaz.
   helpModal DOM'da welcomeModal'dan önce, ikisi aynı z-index'te. Help'i welcome üstüne
   getirebilmek için z-index'i geçici olarak yükselt. Yardım modalını kapattığında welcome
   modalı altta görünür kalır.
   1. adımda (kullanıcı henüz dil seçmediyse) yardım modalı içinde anlık TR/EN switcher
   gösterilir; sadece o açılış için yardım metnini değiştirir, currentLang'a dokunmaz. */
document.getElementById("welcomeHelpBtn").addEventListener("click", () => {
  const helpEl = document.getElementById("helpModal");
  if (helpEl) helpEl.style.zIndex = "10001";
  /* Welcome 1. adımda mı? */
  const onLangStep = document.getElementById("welcomeModal")?.getAttribute("data-step") === "1";
  setHelpLangSwitchVisible(onLangStep);
  openModal("helpModal");
});

/* Yardım modalındaki anlık dil değiştirici, görünürlük kontrolü.
   Switcher görünürken aktif buton currentLang ile senkron olur. */
function setHelpLangSwitchVisible(visible) {
  const sw = document.getElementById("helpLangSwitch");
  if (!sw) return;
  sw.hidden = !visible;
  if (visible) {
    /* Aktif butonu currentLang ile senkronla */
    sw.querySelectorAll("[data-help-lang]").forEach(b => {
      b.classList.toggle("active", b.dataset.helpLang === currentLang);
    });
  }
}

/* Yardım metnini sadece bu modalda geçici olarak verilen dile çevir.
   currentLang ve localStorage'a dokunmaz; modal kapanıp tekrar açıldığında
   global dil neyse oraya geri döner (applyI18nToDom yeniden uygulayarak). */
function applyHelpDisplayLang(lang) {
  if (lang !== "tr" && lang !== "en") return;
  const helpBody = document.getElementById("helpModalBody");
  if (helpBody && HELP_HTML[lang]) {
    helpBody.innerHTML = HELP_HTML[lang];
  }
  const helpTitle = document.getElementById("helpTitle");
  if (helpTitle && UI_STRINGS["help.title"]) {
    helpTitle.textContent = UI_STRINGS["help.title"][lang] || helpTitle.textContent;
  }
  /* Switcher butonlarındaki active state'i güncelle */
  document.querySelectorAll("[data-help-lang]").forEach(b => {
    b.classList.toggle("active", b.dataset.helpLang === lang);
  });
}

document.querySelectorAll("[data-help-lang]").forEach(btn => {
  btn.addEventListener("click", () => {
    applyHelpDisplayLang(btn.dataset.helpLang);
  });
});

/* Yardım modalı her kapatıldığında switcher'i sıfırla:
   bir sonraki açılış doğru bağlamda davransın. data-modal-close dinleyicisi
   zaten var, ama oraya bağlama yerine modalın "hidden" değişimini izlemek
   yerine, kapanma noktalarına özel olarak switcher'i gizliyoruz. */
function closeHelpModal() {
  const helpEl = document.getElementById("helpModal");
  if (helpEl) helpEl.hidden = true;
  setHelpLangSwitchVisible(false);
  /* Eğer kullanıcı in-modal switcher ile dil değiştirmişse, currentLang'a göre
     doğru içeriği geri yükle (sonraki açılış global dilde olsun). */
  applyHelpDisplayLang(currentLang);
}

document.getElementById("welcomeStart").addEventListener("click", () => {
  if (!pendingFramework) return;
  saveFramework(pendingFramework);
  closeModal("welcomeModal");
  applyFrameworkUI();
  renderContent();
  attachClickHandlers();
  applyFilters();
  updateProgress();
});

/* ==================== FRAMEWORK SEÇİCİ (TOOLBAR + SWITCH MODALI) ==================== */
function applyFrameworkUI() {
  /* Toolbar pill etiketini güncelle */
  const meta = currentFramework ? FRAMEWORK_META[currentFramework] : null;
  const pillIcon = document.querySelector("#frameworkBtn .fw-pill-icon");
  const pillLabel = document.querySelector("#frameworkBtn .fw-pill-label");
  if (meta && pillIcon && pillLabel) {
    pillIcon.textContent = meta.icon;
    pillLabel.textContent = tx(meta.short);
  }
  /* Switch modalında mevcut seçimi vurgula */
  document.querySelectorAll("[data-switch-fw]").forEach(b => {
    b.classList.toggle("selected", b.dataset.switchFw === currentFramework);
  });
}

document.getElementById("frameworkBtn").addEventListener("click", () => {
  /* Mobil toolbar otomatik kapanması zaten setupMobileActionsToggle içinde halledilmiş */
  applyFrameworkUI();
  openModal("frameworkModal");
});

document.querySelectorAll("[data-switch-fw]").forEach(btn => {
  btn.addEventListener("click", () => {
    const fw = btn.dataset.switchFw;
    if (fw === currentFramework) {
      closeModal("frameworkModal");
      return;
    }

    /* Geçişi gerçekleştiren ortak fonksiyon */
    const performSwitch = (clearMarks) => {
      if (clearMarks) {
        state = {};
        saveState();
        celebrations = {};
        saveCelebrations();
      }
      saveFramework(fw);
      applyFrameworkUI();
      renderContent();
      attachClickHandlers();
      applyFilters();
      updateProgress();
      closeModal("frameworkModal");
      const msg = clearMarks
        ? t("fwSwitch.toastReset", { name: fwLabel(fw) })
        : t("fwSwitch.toast", { name: fwLabel(fw) });
      showToast(msg, "success", clearMarks ? 1800 : 1400);
    };

    /* Eğer en az bir madde işaretliyse onay iste — geçiş yapılırsa state sıfırlanır.
       Hiç işaret yoksa (yeni kullanıcı veya temizlenmiş liste) doğrudan geç. */
    const hasMarks = Object.keys(state).length > 0;
    if (!hasMarks) {
      performSwitch(false);
      return;
    }

    /* Onay popup'ı için önce framework switch modalını kapat (üst üste binmesin) */
    closeModal("frameworkModal");
    const currentMeta = (currentFramework && FRAMEWORK_META[currentFramework]) || { icon: "?", label: currentFramework || "—" };
    const newMeta = FRAMEWORK_META[fw];
    const html = `
      <div class="fw-switch-confirm">
        <p class="fw-switch-intro">${t("fwModal.intro")}</p>
        <div class="fw-switch-row">
          <div class="fw-switch-card from">
            <div class="fw-switch-tag">${t("fwModal.tagFrom")}</div>
            <div class="fw-switch-emoji">${currentMeta.icon}</div>
            <div class="fw-switch-name">${tx(currentMeta.label)}</div>
          </div>
          <div class="fw-switch-arrow" aria-hidden="true">→</div>
          <div class="fw-switch-card to">
            <div class="fw-switch-tag">${t("fwModal.tagTo")}</div>
            <div class="fw-switch-emoji">${newMeta.icon}</div>
            <div class="fw-switch-name">${tx(newMeta.label)}</div>
          </div>
        </div>
        <ul class="fw-switch-effects">
          <li class="effect-clear"><span class="effect-icon">⚠</span><span>${t("fwModal.effect.marksReset")}</span></li>
          <li class="effect-clear"><span class="effect-icon">⚠</span><span>${t("fwModal.effect.barsZero")}</span></li>
          <li class="effect-keep"><span class="effect-icon">✓</span><span>${t("fwModal.effect.notesKept")}</span></li>
          <li class="effect-keep"><span class="effect-icon">✓</span><span>${t("fwModal.effect.catsKept")}</span></li>
        </ul>
      </div>
    `;
    customConfirm(
      html,
      () => performSwitch(true),
      { title: t("fwModal.confirmTitle"), yesText: t("fwModal.confirmYes"), cancelText: t("fwModal.confirmCancel"), html: true, wide: true }
    );
  });
});

/* İlk yüklemede (eğer framework varsa) hero pill'i doğru göster */
applyFrameworkUI();

/* ==================== HERO LEVEL/STATUS FİLTRESİ (3x3 = 9 kombinasyon) ==================== */
/* Üç pill (MVP / Release / MVP+Release) + her birinin altında 3 opsiyonlu dropdown
   (Tümü / Yapılacak / Yapılan). Pill'e tıklamak dropdown'u açar; menü item'ı
   tıklandığında setView ile hem viewMode hem viewFilter atanır. */

function closeAllLvMenus() {
  document.querySelectorAll(".lv-menu").forEach(m => m.hidden = true);
  document.querySelectorAll(".level-filter-pill").forEach(p => p.setAttribute("aria-expanded", "false"));
}

document.querySelectorAll(".lv-group").forEach(group => {
  const pill = group.querySelector(".level-filter-pill");
  const menu = group.querySelector(".lv-menu");
  pill.addEventListener("click", (e) => {
    e.stopPropagation();
    const wasOpen = !menu.hidden;
    closeAllLvMenus();
    if (!wasOpen) {
      menu.hidden = false;
      pill.setAttribute("aria-expanded", "true");
    }
  });
  menu.querySelectorAll("button").forEach(opt => {
    opt.addEventListener("click", (e) => {
      e.stopPropagation();
      if (opt.disabled) return;
      const newMode = group.dataset.viewMode;
      const newFilter = opt.dataset.viewFilter;
      setView(newMode, newFilter);
      closeAllLvMenus();
    });
  });
});

/* Dış tıklama menüyü kapatır */
document.addEventListener("click", (e) => {
  if (!e.target.closest(".lv-group")) closeAllLvMenus();
});

/* Esc menüyü kapatır (mevcut Esc handler'ından önce çalışsın diye capture) */
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (document.querySelector(".lv-menu:not([hidden])")) {
    e.preventDefault();
    e.stopPropagation();
    closeAllLvMenus();
  }
}, true);

/* İlk yüklemede mevcut view'i uygula */
applyView();

/* ==================== UYGULAMA YÜKLE (PWA INSTALL) ==================== */
let deferredInstallPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  showInstallBanner();
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  hideInstallBanner();
  try { localStorage.setItem(INSTALL_DISMISS_KEY, "installed"); } catch {}
  showToast(t("install.installed"), "success", 3200);
});

const INSTALL_DISMISS_KEY = "mobil_kontrol_install_dismissed_v1";

function showInstallBanner() {
  /* Daha önce kapatılmışsa veya yüklenmişse gösterme */
  try {
    if (localStorage.getItem(INSTALL_DISMISS_KEY)) return;
  } catch {}
  const banner = document.getElementById("installBanner");
  if (banner) banner.hidden = false;
}

function hideInstallBanner() {
  const banner = document.getElementById("installBanner");
  if (banner) banner.hidden = true;
}

function isStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches
    || window.matchMedia("(display-mode: minimal-ui)").matches
    || window.navigator.standalone === true;
}

function isIOSDevice() {
  return /iPhone|iPad|iPod/.test(navigator.userAgent);
}

function detectPlatform() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) {
    return /CriOS|FxiOS|EdgiOS|OPiOS/.test(ua) ? "ios-other" : "ios-safari";
  }
  if (/Android/.test(ua)) {
    if (/SamsungBrowser/.test(ua)) return "android-samsung";
    if (/Firefox\//.test(ua)) return "android-firefox";
    return "android-chrome";
  }
  if (/Edg\//.test(ua)) return "edge";
  if (/Firefox\//.test(ua)) return "firefox";
  if (/Chrome\//.test(ua)) return "chrome";
  if (/Safari\//.test(ua)) return "macos-safari";
  return "other";
}

const INSTALL_STEPS_DATA = {
  "ios-safari": {
    emoji: "🍎",
    title: { tr: "iPhone / iPad · Safari", en: "iPhone / iPad · Safari" },
    steps: {
      tr: [
        "Safari'nin altındaki <strong>Paylaş</strong> butonuna bas (kutudan yukarı çıkan ok ikonu).",
        "Açılan menüde aşağı kaydırıp <strong>\"Ana Ekrana Ekle\"</strong> seçeneğine bas.",
        "Sağ üstteki <strong>\"Ekle\"</strong> butonuna bas.",
      ],
      en: [
        "Tap Safari's <strong>Share</strong> button at the bottom (the box-with-up-arrow icon).",
        "Scroll down and tap <strong>\"Add to Home Screen\"</strong>.",
        "Tap <strong>\"Add\"</strong> in the top right.",
      ]
    },
    note: { tr: "Uygulama ana ekranında simge olarak görünecek. Tıkladığında tam ekran açılacak ve adres çubuğu gözükmeyecek.", en: "The app appears as an icon on your home screen. Tapping it opens fullscreen with no address bar." }
  },
  "ios-other": {
    emoji: "🍎",
    title: { tr: "iPhone / iPad", en: "iPhone / iPad" },
    steps: {
      tr: [
        "Bu özelliği kullanmak için sayfayı <strong>Safari</strong>'de açman gerekiyor.",
        "Mevcut tarayıcının üst köşesindeki menüden sayfayı kopyala, Safari'de aç.",
        "Safari'de Paylaş butonuna basıp <strong>\"Ana Ekrana Ekle\"</strong> seçeneğini kullan.",
      ],
      en: [
        "To use this feature, the page must be opened in <strong>Safari</strong>.",
        "Copy the page URL from the top corner menu of the current browser and open it in Safari.",
        "In Safari, tap the Share button and use <strong>\"Add to Home Screen\"</strong>.",
      ]
    },
    note: { tr: "iOS'ta yalnızca Safari uygulama olarak yükleme işlemini destekliyor.", en: "On iOS only Safari supports installing as an app." }
  },
  "android-chrome": {
    emoji: "🤖",
    title: { tr: "Android · Chrome", en: "Android · Chrome" },
    steps: {
      tr: [
        "Tarayıcının sağ üstündeki <strong>üç nokta</strong> menüsüne bas.",
        "<strong>\"Uygulamayı yükle\"</strong> veya <strong>\"Ana ekrana ekle\"</strong> seçeneğine bas.",
        "Açılan onay penceresinde <strong>\"Yükle\"</strong> butonuna bas.",
      ],
      en: [
        "Tap the <strong>three-dot</strong> menu in the top right.",
        "Tap <strong>\"Install app\"</strong> or <strong>\"Add to Home screen\"</strong>.",
        "In the confirmation dialog, tap <strong>\"Install\"</strong>.",
      ]
    },
    note: { tr: "Yükleme tamamlandıktan sonra ana ekranında uygulama simgesi görünecek.", en: "After installation, an app icon appears on your home screen." }
  },
  "android-samsung": {
    emoji: "🤖",
    title: { tr: "Android · Samsung Internet", en: "Android · Samsung Internet" },
    steps: {
      tr: [
        "Tarayıcının altındaki menü butonuna bas.",
        "<strong>\"Sayfayı ekle\"</strong> veya <strong>\"Ana ekrana ekle\"</strong> seçeneğine bas.",
        "Onayla.",
      ],
      en: [
        "Tap the menu button at the bottom of the browser.",
        "Tap <strong>\"Add page to\"</strong> or <strong>\"Add to Home screen\"</strong>.",
        "Confirm.",
      ]
    },
    note: null
  },
  "android-firefox": {
    emoji: "🦊",
    title: { tr: "Android · Firefox", en: "Android · Firefox" },
    steps: {
      tr: [
        "Tarayıcının sağ alt / üst köşesindeki menü butonuna bas.",
        "<strong>\"Yükle\"</strong> veya <strong>\"Ana ekrana ekle\"</strong> seçeneğine bas.",
        "Açılan onay penceresinde <strong>\"Ekle\"</strong>ye bas.",
      ],
      en: [
        "Tap the menu in the bottom/top corner of the browser.",
        "Tap <strong>\"Install\"</strong> or <strong>\"Add to Home screen\"</strong>.",
        "Tap <strong>\"Add\"</strong> in the confirmation dialog.",
      ]
    },
    note: null
  },
  "chrome": {
    emoji: "💻",
    title: { tr: "Bilgisayar · Chrome / Edge", en: "Desktop · Chrome / Edge" },
    steps: {
      tr: [
        "Adres çubuğunun sağında <strong>yükle simgesini</strong> ara (genellikle bir monitör veya artı ikonu).",
        "Tıkla, açılan kutuda <strong>\"Yükle\"</strong> butonuna bas.",
        "Alternatif: Sağ üstteki üç nokta menüsünden <strong>\"Kontrol Listesi'ni Yükle\"</strong> seçeneği.",
      ],
      en: [
        "Look for the <strong>install icon</strong> at the right of the address bar (usually a monitor or plus icon).",
        "Click it, then click <strong>\"Install\"</strong> in the dialog.",
        "Alternative: from the three-dot menu in the top right, choose <strong>\"Install Checklist\"</strong>.",
      ]
    },
    note: { tr: "Uygulama bağımsız bir pencerede açılır. Masaüstünde / başlat menüsünde simge oluşur, oradan tek tıkla başlatabilirsin.", en: "The app opens in its own window. An icon appears on the desktop / start menu so you can launch it in one click." }
  },
  "firefox": {
    emoji: "🦊",
    title: { tr: "Bilgisayar · Firefox", en: "Desktop · Firefox" },
    steps: {
      tr: [
        "Firefox masaüstü sürümü uygulama yüklemeyi şu an desteklemiyor.",
        "Yer imlerine ekleyebilirsin: <strong>Ctrl + D</strong> (Windows / Linux) veya <strong>Cmd + D</strong> (Mac).",
        "Mobilde Chrome veya Safari kullanırsan ana ekrana ekleyebilirsin.",
      ],
      en: [
        "Firefox desktop currently doesn't support installing apps.",
        "You can bookmark it: <strong>Ctrl + D</strong> (Windows / Linux) or <strong>Cmd + D</strong> (Mac).",
        "On mobile, using Chrome or Safari you can add it to the home screen.",
      ]
    },
    note: { tr: "Uygulama deneyimi için Chrome veya Edge tavsiye edilir.", en: "For a true app experience, Chrome or Edge is recommended." }
  },
  "macos-safari": {
    emoji: "🖥",
    title: { tr: "Mac · Safari", en: "Mac · Safari" },
    steps: {
      tr: [
        "Üst menüden <strong>Dosya</strong> menüsüne bas.",
        "<strong>\"Dock'a Ekle\"</strong> seçeneğine bas.",
        "Görüntülenen isim ve simgeyi onayla.",
      ],
      en: [
        "From the top menu, click <strong>File</strong>.",
        "Click <strong>\"Add to Dock\"</strong>.",
        "Confirm the displayed name and icon.",
      ]
    },
    note: { tr: "Uygulama Dock'tan tek tıkla bağımsız bir pencerede açılır.", en: "The app launches from the Dock in its own window with one click." }
  },
  "default": {
    emoji: "🌐",
    title: { tr: "Genel Talimat", en: "General Instructions" },
    steps: {
      tr: [
        "Tarayıcının menüsünü aç.",
        "<strong>\"Uygulamayı Yükle\"</strong>, <strong>\"Ana Ekrana Ekle\"</strong> veya <strong>\"Sayfa Kısayolu Oluştur\"</strong> seçeneğini ara.",
        "Tıkla ve onayla.",
      ],
      en: [
        "Open your browser's menu.",
        "Look for <strong>\"Install App\"</strong>, <strong>\"Add to Home Screen\"</strong> or <strong>\"Create Page Shortcut\"</strong>.",
        "Click it and confirm.",
      ]
    },
    note: { tr: "Tarayıcına bağlı olarak farklı isimler kullanılır. Chrome, Edge ve Safari bu özelliği en iyi destekleyen tarayıcılardır.", en: "Different browsers use different names. Chrome, Edge and Safari support this feature best." }
  }
};

function getInstallSteps(platform) {
  let key = platform;
  if (platform === "edge") key = "chrome";
  const data = INSTALL_STEPS_DATA[key] || INSTALL_STEPS_DATA["default"];
  return {
    emoji: data.emoji,
    title: tx(data.title),
    steps: data.steps[currentLang] || data.steps.tr,
    note: data.note ? tx(data.note) : null
  };
}

function renderInstallInstructions() {
  const platform = detectPlatform();
  const data = getInstallSteps(platform);
  const container = document.getElementById("installInstructions");
  let html = `
    <div class="install-platform-card">
      <h3 class="install-platform-title"><span class="platform-emoji">${data.emoji}</span>${data.title}</h3>
      <ol class="install-steps">
        ${data.steps.map(s => `<li>${s}</li>`).join("")}
      </ol>
      ${data.note ? `<p class="install-note">${data.note}</p>` : ""}
    </div>
    <p class="install-secondary">${t("installModal.afterInstall")}</p>
  `;
  container.innerHTML = html;
}

/* Banner üzerindeki "Yükle" butonu, tek tıkla install (destekleniyorsa) veya manuel talimat */
document.getElementById("installBannerBtn").addEventListener("click", async () => {
  if (deferredInstallPrompt) {
    try {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      if (choice && choice.outcome === "accepted") {
        hideInstallBanner();
        try { localStorage.setItem(INSTALL_DISMISS_KEY, "installed"); } catch {}
        showToast(t("install.installing"), "success", 2800);
      } else {
        showToast(t("install.cancelled"), "info", 1800);
      }
    } catch (err) {
      renderInstallInstructions();
      openModal("installModal");
    }
    return;
  }
  /* Native install desteği yoksa (iOS, Firefox, file://, henüz event gelmemiş Chrome vs.)
     cihaza uygun manuel talimat modalını göster */
  renderInstallInstructions();
  openModal("installModal");
});

/* Banner kapat butonu, bir daha gösterme bayrağı */
document.getElementById("installBannerClose").addEventListener("click", () => {
  hideInstallBanner();
  try { localStorage.setItem(INSTALL_DISMISS_KEY, "dismissed"); } catch {}
});

/* Init: banner her durumda görünür (kullanıcı kapatmadıysa veya zaten yüklemediyse)
   - Daha önce × ile kapatılmış → gizli
   - Daha önce yüklenmiş veya standalone modda → gizli
   - Diğer tüm durumlar → görünür (tıkladığında ortama göre davranır) */
(function initInstallBanner() {
  const banner = document.getElementById("installBanner");
  if (!banner) return;
  try {
    if (localStorage.getItem(INSTALL_DISMISS_KEY)) {
      banner.hidden = true;
      return;
    }
  } catch {}
  if (isStandaloneMode()) {
    banner.hidden = true;
    return;
  }
  banner.hidden = false;
})();

/* ==================== INIT ==================== */
/* İlk olarak DOM'a kaydedilmiş dile göre tüm i18n işaretli elementleri tercüme et */
applyI18nToDom();

applyTheme(localStorage.getItem(THEME_KEY) || "dark");
initDefaultCollapsed();
renderCategoryNav();
renderContent();
attachClickHandlers();
attachSearch();

/* İlk açılışta updateProgress kutlama tetiklemesin (zaten c.total === 0 koşulu sağlamasıyla tetiklenmiyor ama yine de güvenli) */
updateProgress();

/* Kilit durumunu localStorage'dan yükleyip uygula (button etiketi, body class, disabled hedefler) */
applyLock();

showWelcomeIfFirstVisit();
