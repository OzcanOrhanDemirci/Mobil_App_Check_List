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

/* Tüm madde kartlarını arka yüze çevir / ön yüze döndür.
   Per-item flip butonuyla aynı görsel etki (.feature.flipped class);
   sadece çok sayıda madde için tek tıkla toplu çevirme sağlar. Hiçbir
   completion state değiştirilmez, sadece view modu değişir.

   flipFeatureCard kullanır — böylece her kartta height animasyonu (uzayıp
   küçülme) per-item flip ile birebir aynı şekilde çalışır. */
function setAllCardsFlipped(flipped) {
  document.querySelectorAll(".feature").forEach(f => {
    if (typeof flipFeatureCard === "function") {
      flipFeatureCard(f, flipped);
    } else {
      /* Fallback: render.js henüz yüklenmediyse class toggle yeter */
      f.classList.toggle("flipped", flipped);
    }
  });
}

/* "❔ Tümü Nasıl?" — toolbar'dan tüm kartları arka yüze çevirir VE kullanım
   biçimi tercihini "review"a yükseltir; böylece sonraki render'larda da
   (filter/dil/style değişimi vb.) kartlar arka yüzde başlar. */
const flipAllHowBtn = document.getElementById("flipAllHowBtn");
if (flipAllHowBtn) {
  flipAllHowBtn.addEventListener("click", () => {
    if (typeof applyMode === "function") applyMode("review");
    setAllCardsFlipped(true);
    showToast(t("flipAll.toastHow"), "info", 1400);
  });
}
/* "📋 Tümü Liste" — tüm kartları ön yüze döndürür VE kullanım biçimi tercihini
   "build"e indirir; render sonrası applyInitialCardMode hiçbir şey yapmaz. */
const flipAllChecklistBtn = document.getElementById("flipAllChecklistBtn");
if (flipAllChecklistBtn) {
  flipAllChecklistBtn.addEventListener("click", () => {
    if (typeof applyMode === "function") applyMode("build");
    setAllCardsFlipped(false);
    showToast(t("flipAll.toastChecklist"), "info", 1400);
  });
}

/* ==================== RESET UI'I — İKİ AYRI YERDE KULLANIM ====================
   1) Toolbar Sıfırla butonu → resetScopeModal (sadece selections + notes)
   2) Proje/FW modal'ın "Sıfırla" sekmesi → projfw-pane-reset (4 seçenek)
   Aynı performReset fonksiyonuna scope objesi göndererek çalışırlar. */

const RESET_INDEPENDENT_SCOPES = ["selections", "notes", "settings"];

/* Bir reset-scope UI'ını (checkbox grubu + İleri butonu) bir araya bağlar.
   `attr` her UI için farklı bir data-attribute adı (DOM çakışmasını önler).
   `nextBtnId` o UI'ın "İleri" butonunun ID'si.
   `onBeforeConfirm` opsiyonel — confirm açılmadan önce çağrılır (ör. modal kapatma). */
function setupResetScopeUi(attr, nextBtnId, onBeforeConfirm) {
  const cbs = document.querySelectorAll(`[${attr}]`);
  const nextBtn = document.getElementById(nextBtnId);
  if (!cbs.length || !nextBtn) return;

  const sysCb = document.querySelector(`[${attr}="system"]`);
  const independents = RESET_INDEPENDENT_SCOPES
    .map(s => document.querySelector(`[${attr}="${s}"]`))
    .filter(Boolean);

  /* Tüm seçenekleri sıfırla (modal/sekme yeniden açılışında çağrılır) */
  function resetUi() {
    cbs.forEach(cb => { cb.checked = false; cb.disabled = false; });
    nextBtn.disabled = true;
  }

  /* Checkbox değişimi: system ↔ diğerleri ilişkisini yönet, İleri butonunu güncelle */
  cbs.forEach(cb => {
    cb.addEventListener("change", () => {
      if (sysCb && cb === sysCb) {
        if (sysCb.checked) {
          independents.forEach(o => { o.checked = false; o.disabled = true; });
        } else {
          independents.forEach(o => { o.disabled = false; });
        }
      } else if (cb.checked && sysCb && sysCb.checked) {
        sysCb.checked = false;
        independents.forEach(o => { o.disabled = false; });
      }
      const anyChecked = (sysCb && sysCb.checked) || independents.some(o => o.checked);
      nextBtn.disabled = !anyChecked;
    });
  });

  /* İleri butonu → scope topla → onay aç → performReset çağır */
  nextBtn.addEventListener("click", () => {
    const scope = {
      selections: document.querySelector(`[${attr}="selections"]`)?.checked || false,
      notes:      document.querySelector(`[${attr}="notes"]`)?.checked || false,
      settings:   document.querySelector(`[${attr}="settings"]`)?.checked || false,
      system:     document.querySelector(`[${attr}="system"]`)?.checked || false,
    };

    if (typeof onBeforeConfirm === "function") onBeforeConfirm();

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

  return { resetUi };
}

/* UI #1: Toolbar Sıfırla → resetScopeModal (sadece selections + notes). */
const toolbarResetUi = setupResetScopeUi(
  "data-reset-scope",
  "resetScopeNext",
  () => closeModal("resetScopeModal")
);

/* Toolbar Sıfırla butonu — modalı her açılışta UI'ı sıfırla */
document.getElementById("resetBtn").addEventListener("click", () => {
  if (lockState) return;
  if (toolbarResetUi) toolbarResetUi.resetUi();
  openModal("resetScopeModal");
});

/* UI #2: Proje/FW modal "Sıfırla" sekmesi (4 seçenek: tüm modlar). */
const projfwResetUi = setupResetScopeUi(
  "data-full-reset-scope",
  "projfwResetNext",
  () => closeModal("frameworkModal")
);

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

  /* Ayarlar: kategori collapse + tema + anlatım dili + view + lock */
  if (scope.settings) {
    collapsedCats = new Set(DATA.map(c => `cat-${c.id}`));
    saveCollapsed();
    applyTheme("dark");
    if (typeof applyStyle === "function") applyStyle("technical");
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

/* ==================== YARDIM ACCORDION ====================
   Yardım modal'ındaki HELP_HTML her dil değişiminde yeniden render edilir;
   bu render'dan sonra her section'a `.help-section.collapsed` class'ı + h3'e
   chevron eklenerek accordion davranışı kazandırılır. Click handler ile
   "Tümünü Aç/Kapat" butonları aşağıda tek seferlik bağlanır. */
function enhanceHelpAccordion() {
  const sections = document.querySelectorAll("#helpModalBody > section");
  sections.forEach(section => {
    section.classList.add("help-section", "collapsed");
    const h3 = section.querySelector(":scope > h3");
    if (h3 && !h3.querySelector(".help-section-chevron")) {
      const chevron = document.createElement("span");
      chevron.className = "help-section-chevron";
      chevron.setAttribute("aria-hidden", "true");
      chevron.textContent = "▾";
      h3.appendChild(chevron);
    }
  });
}

/* Tüm bölümleri kapatır (modal her yeniden açılışında temiz başlangıç için) */
function collapseAllHelpSections() {
  document.querySelectorAll("#helpModalBody > section.help-section")
    .forEach(s => s.classList.add("collapsed"));
}

/* h3 tıklaması → section toggle. helpModalBody parent kalıcı olduğundan
   innerHTML değişse bile delegated handler çalışmaya devam eder. */
document.getElementById("helpModalBody")?.addEventListener("click", (e) => {
  const h3 = e.target.closest("#helpModalBody > section.help-section > h3");
  if (!h3) return;
  h3.parentElement.classList.toggle("collapsed");
});

/* "Tümünü Aç" → tüm section'lardan collapsed class'ını kaldır */
document.getElementById("helpExpandAll")?.addEventListener("click", () => {
  document.querySelectorAll("#helpModalBody > section.help-section")
    .forEach(s => s.classList.remove("collapsed"));
});

/* "Tümünü Kapat" → tüm section'lara collapsed class ekle */
document.getElementById("helpCollapseAll")?.addEventListener("click", () => {
  collapseAllHelpSections();
});

/* Yardım butonu (toolbar) — anlık dil switcher'ı göstermez (zaten dil seçilmiştir,
   üst-sağdaki global 🌐 TR/EN butonu var). Modal her açılışta bölümler kapalı
   başlasın (kullanıcı temiz bir TOC ile karşılaşsın). */
document.getElementById("helpBtn").addEventListener("click", () => {
  if (typeof setHelpLangSwitchVisible === "function") setHelpLangSwitchVisible(false);
  /* Eğer önceki açılıştan in-modal switcher ile dil değişmiş kaldıysa global dile çek */
  if (typeof applyHelpDisplayLang === "function") applyHelpDisplayLang(currentLang);
  collapseAllHelpSections();
  openModal("helpModal");
});

/* Print — artık modal açıyor; kullanıcı kontrol listesi mi yoksa Nasıl Yapılır?
   rehberi mi PDF'i istediğini seçer. window.print() seçim yapıldığında
   tetiklenir. body'ye geçici class (print-howto) eklenerek CSS ilgili modu
   uygulanır; print bittikten sonra class kaldırılır. */
document.getElementById("printBtn").addEventListener("click", () => {
  openModal("printOptionsModal");
});

/* Yazdırma modu seçenek butonları (modal içinde) */
document.querySelectorAll("[data-print-mode]").forEach(btn => {
  btn.addEventListener("click", () => {
    const mode = btn.dataset.printMode;
    closeModal("printOptionsModal");
    /* Modal kapanma animasyonu/DOM güncellemesi sonrası print'i tetikle —
       aynı tick'te yapmak bazı tarayıcılarda modal'ın yazdırma görüntüsünde
       takılı kalmasına yol açıyor. */
    if (mode === "howto") {
      document.body.classList.add("print-howto");
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
        /* Print dialog kapandıktan sonra class'ı temizle. afterprint
           event'i tüm tarayıcılarda güvenilir değil; setTimeout da ekle. */
        const cleanup = () => {
          document.body.classList.remove("print-howto");
          window.removeEventListener("afterprint", cleanup);
        };
        window.addEventListener("afterprint", cleanup);
        setTimeout(cleanup, 5000);
      });
    });
  });
});

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
/* Aktif proje + framework + backend yoksa karşılama modalını 7 adımda göster:
   1) Dil  2) Kullanım Biçimi  3) Anlatım Dili  4) Proje Adı
   5) Framework  6) Backend  7) Tanıtım / Başlayalım */
function showWelcomeIfFirstVisit() {
  if (getActiveProjectId() && currentFramework && currentBackend) return;
  setTimeout(() => {
    setWelcomeStep(1);
    openModal("welcomeModal");
  }, 350);
}

/* Welcome modalı içindeki seçimler — buton tıklanana dek kalıcılaştırılmaz */
let pendingFramework = null;
let pendingBackend = null;
let pendingLang = null;
let pendingMode = null;
let pendingStyle = null;
let pendingProjName = null;

function setWelcomeStep(n) {
  /* 1 → dil, 2 → kullanım biçimi, 3 → anlatım dili, 4 → proje adı,
     5 → framework, 6 → backend, 7 → karşılama */
  document.querySelectorAll(".welcome-pane").forEach(p => {
    p.hidden = String(p.dataset.pane) !== String(n);
  });
  /* Adım göstergesini güncelle (7 nokta + 6 çizgi) */
  document.querySelectorAll("[data-step-dot]").forEach(d => {
    const idx = Number(d.dataset.stepDot);
    d.classList.toggle("active", idx === n);
    d.classList.toggle("done", idx < n);
  });
  document.querySelectorAll("[data-step-line]").forEach(line => {
    const after = Number(line.dataset.stepLine); // 1 → 1.dot ile 2.dot arasındaki çizgi
    line.classList.toggle("done", n > after);
  });
  /* Modalın hangi adımda olduğunu CSS'in görebilmesi için data-step attribute'u
     (örn. 1. adımda yardım butonunun yazısı CSS ile gizleniyor — kullanıcı
     henüz dil seçmediği için "Yardım/Help" iki dilde yer kaplamasın). */
  const modal = document.getElementById("welcomeModal");
  if (modal) modal.setAttribute("data-step", String(n));
  /* Proje adı adımına geçişte (artık step 4) input'a otomatik focus +
     buton metnini ayarla */
  if (n === 4) {
    const input = document.getElementById("welcomeProjName");
    if (input) {
      setTimeout(() => input.focus(), 80);
      updateWelcomeProjNameCta();
    }
  }
}

/* Proje adı input'u değiştiğinde "İleri" butonunun aktif/pasif durumunu güncelle.
   Boş veya 60 karakterden uzun isim → disabled. Geçici olarak boş hata mesajı. */
function updateWelcomeProjNameCta() {
  const input = document.getElementById("welcomeProjName");
  const cta   = document.getElementById("welcomeProjNameNext");
  const errEl = document.getElementById("welcomeProjNameError");
  if (!input || !cta) return;
  const val = (input.value || "").trim();
  let error = "";
  if (!val) {
    cta.disabled = true;
    cta.textContent = t("welcome.cta.pickProjName");
  } else if (val.length > 60) {
    cta.disabled = true;
    error = t("proj.error.tooLong");
    cta.textContent = t("welcome.cta.next");
  } else {
    cta.disabled = false;
    cta.textContent = t("welcome.cta.next");
  }
  if (errEl) {
    if (error) { errEl.textContent = error; errEl.hidden = false; }
    else { errEl.textContent = ""; errEl.hidden = true; }
  }
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

/* 2. ADIM: Kullanım Biçimi (Geliştirme / İnceleme).
   Seçim welcomeStart'ta applyMode ile kalıcılaştırılır; o zamana kadar pendingMode
   olarak tutulur. */
document.querySelectorAll("[data-welcome-mode]").forEach(btn => {
  btn.addEventListener("click", () => {
    pendingMode = btn.dataset.welcomeMode;
    window.pendingMode = pendingMode;
    document.querySelectorAll("[data-welcome-mode]").forEach(b => {
      b.classList.toggle("selected", b === btn);
    });
    const nextBtn = document.getElementById("welcomeModeNext");
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.textContent = t("welcome.cta.next");
    }
  });
});

document.getElementById("welcomeModeNext").addEventListener("click", () => {
  if (!pendingMode) return;
  setWelcomeStep(3);
});

document.getElementById("welcomeModeBack").addEventListener("click", () => {
  setWelcomeStep(1);
});

/* 3. ADIM: Anlatım dili (Basit / Teknik) */
document.querySelectorAll("[data-welcome-style]").forEach(btn => {
  btn.addEventListener("click", () => {
    pendingStyle = btn.dataset.welcomeStyle;
    window.pendingStyle = pendingStyle;
    document.querySelectorAll("[data-welcome-style]").forEach(b => {
      b.classList.toggle("selected", b === btn);
    });
    const nextBtn = document.getElementById("welcomeStyleNext");
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.textContent = t("welcome.cta.next");
    }
  });
});

document.getElementById("welcomeStyleNext").addEventListener("click", () => {
  if (!pendingStyle) return;
  /* Seçilen anlatım dilini anında uygula: kalan welcome adımları ve hero pill
     bu stile göre gözüksün. (Listeyi render etmeye gerek yok; welcome modal
     açıkken liste zaten başka renderContent'le güncelleniyor.) */
  if (typeof applyStyle === "function") applyStyle(pendingStyle);
  setWelcomeStep(4);
});

document.getElementById("welcomeStyleBack").addEventListener("click", () => {
  setWelcomeStep(2);
});

/* 4. ADIM: Proje adı */
const welcomeProjNameInput = document.getElementById("welcomeProjName");
if (welcomeProjNameInput) {
  welcomeProjNameInput.addEventListener("input", () => {
    pendingProjName = welcomeProjNameInput.value;
    updateWelcomeProjNameCta();
  });
  welcomeProjNameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const cta = document.getElementById("welcomeProjNameNext");
      if (cta && !cta.disabled) cta.click();
    }
  });
}

document.getElementById("welcomeProjNameNext").addEventListener("click", () => {
  const val = (welcomeProjNameInput?.value || "").trim();
  if (!val || val.length > 60) return;
  pendingProjName = val;
  setWelcomeStep(5);
});

document.getElementById("welcomeProjNameBack").addEventListener("click", () => {
  setWelcomeStep(3);
});

/* 5. ADIM: Framework seçimi */
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
  setWelcomeStep(6);
});

document.getElementById("welcomeFwBack").addEventListener("click", () => {
  setWelcomeStep(4);
});

/* 6. ADIM: Backend seçimi */
document.querySelectorAll("[data-welcome-be]").forEach(btn => {
  btn.addEventListener("click", () => {
    pendingBackend = btn.dataset.welcomeBe;
    window.pendingBackend = pendingBackend;
    document.querySelectorAll("[data-welcome-be]").forEach(b => {
      b.classList.toggle("selected", b === btn);
    });
    const nextBtn = document.getElementById("welcomeBeNext");
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.textContent = t("welcome.cta.next");
    }
  });
});

document.getElementById("welcomeBeNext").addEventListener("click", () => {
  if (!pendingBackend) return;
  setWelcomeStep(7);
});

document.getElementById("welcomeBeBack").addEventListener("click", () => {
  setWelcomeStep(5);
});

/* 7. ADIM: Karşılama */
document.getElementById("welcomeBack").addEventListener("click", () => {
  setWelcomeStep(6);
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
  /* Yardım modalı her açılışta tüm bölümler kapalı başlasın */
  if (typeof collapseAllHelpSections === "function") collapseAllHelpSections();
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
    /* innerHTML değişimi DOM elementlerini yeniden oluşturur; accordion'ı
       yeniden kur (section.help-section.collapsed class'ı + chevron span). */
    if (typeof enhanceHelpAccordion === "function") enhanceHelpAccordion();
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
  if (!pendingFramework || !pendingProjName || !pendingBackend) return;
  /* Anlatım dilini kalıcılaştır (kullanıcı 3. adımda zaten anında uygulanmıştı;
     burada localStorage'a yazılması garanti altına alınıyor). */
  if (pendingStyle && typeof applyStyle === "function") {
    applyStyle(pendingStyle);
  }
  /* Kullanım biçimini kalıcılaştır. applyMode sadece localStorage'a yazar +
     html'e data-card-mode atar; kartların DOM'da çevrilmesi reloadActive..
     içindeki renderdan sonra attachClickHandlers'ın sonunda applyInitialCardMode
     tarafından yapılır. */
  if (pendingMode && typeof applyMode === "function") {
    applyMode(pendingMode);
  }
  /* Önce projeyi oluştur ve aktif yap; saveFramework/saveBackend artık aktif
     projeye yazıyor */
  const created = createProject(pendingProjName);
  if (!created.ok) {
    /* En olası hata: aynı isimde proje zaten var (genelde yeni kullanıcıda olmaz).
       Limit hatası welcome akışında oluşamaz çünkü 0 proje var. */
    let msg = t("proj.error.empty");
    if (created.error === "duplicate") msg = t("proj.error.duplicate");
    else if (created.error === "tooLong") msg = t("proj.error.tooLong");
    showToast(msg, "warn", 2200);
    return;
  }
  setActiveProjectId(created.project.id);
  saveFramework(pendingFramework);
  saveBackend(pendingBackend);
  closeModal("welcomeModal");
  /* Yeni projenin tüm in-memory state'ini yükle ve UI'ı baştan render et */
  reloadActiveProjectAndRender();
  /* Pendingleri temizle ki ileride welcome tekrar açılırsa eski seçim kalmasın */
  pendingProjName = null;
  pendingFramework = null;
  pendingBackend = null;
  pendingMode = null;
  pendingStyle = null;
  window.pendingFramework = null;
  window.pendingBackend = null;
  window.pendingMode = null;
  window.pendingStyle = null;
});

/* ==================== PROJE + FRAMEWORK PILL (HERO) ==================== */
function applyFrameworkUI() {
  const proj = getActiveProject();
  const meta = currentFramework ? FRAMEWORK_META[currentFramework] : null;
  const pillIcon = document.querySelector("#projectFrameworkBtn .fw-pill-icon");
  const pillLabel = document.querySelector("#projectFrameworkBtn .fw-pill-label");
  const projName = document.querySelector("#projectFrameworkBtn .proj-pill-name");
  if (meta && pillIcon && pillLabel) {
    pillIcon.textContent = meta.icon;
    pillLabel.textContent = tx(meta.short);
  }
  if (projName) {
    projName.textContent = proj ? proj.name : "—";
  }
  /* Switch modalında mevcut seçimi vurgula */
  document.querySelectorAll("[data-switch-fw]").forEach(b => {
    b.classList.toggle("selected", b.dataset.switchFw === currentFramework);
  });
  /* Backend leg'i de her FW update'inde tazele (proje değişiminde framework ve
     backend birlikte güncelleniyor; iki ayrı uygulamayı tek yerde topla) */
  applyBackendUI();
}

/* Hero pill'in backend satırını ve backend sekmesi seçim vurgusunu uygular. */
function applyBackendUI() {
  const beMeta = currentBackend ? BACKEND_META[currentBackend] : null;
  const beIcon = document.querySelector("#projectFrameworkBtn .be-pill-icon");
  const beLabel = document.querySelector("#projectFrameworkBtn .be-pill-label");
  const beRow = document.querySelector("#projectFrameworkBtn .proj-pill-backend");
  if (beMeta && beIcon && beLabel) {
    beIcon.textContent = beMeta.icon;
    beLabel.textContent = tx(beMeta.short);
  }
  /* Backend satırını yalnızca backend seçilmişse göster (welcome akışı sırasında
     pill arka planda kalır; backend henüz seçilmemiş olabilir) */
  const showBackendRow = !!currentBackend;
  if (beRow) beRow.hidden = !showBackendRow;
  /* projfw modal Backend sekmesinde aktif kart seçimini vurgula */
  document.querySelectorAll("[data-switch-be]").forEach(b => {
    b.classList.toggle("selected", b.dataset.switchBe === currentBackend);
  });
}

document.getElementById("projectFrameworkBtn").addEventListener("click", () => {
  /* Mobil toolbar otomatik kapanması zaten setupMobileActionsToggle içinde halledilmiş */
  applyFrameworkUI();
  /* Modalı her açılışta varsayılan olarak Proje sekmesinde aç ve listeyi yenile */
  setProjFwTab("project");
  renderProjectList();
  resetProjAddForm();
  openModal("frameworkModal");
});

/* ==================== PROJE + FRAMEWORK MODAL — SEKME GEÇİŞİ ==================== */
function setProjFwTab(tabName) {
  /* tabName: "project" veya "framework" */
  document.querySelectorAll(".projfw-tab").forEach(t => {
    const isActive = t.dataset.projfwTab === tabName;
    t.classList.toggle("active", isActive);
    t.setAttribute("aria-selected", isActive ? "true" : "false");
  });
  document.querySelectorAll(".projfw-pane").forEach(p => {
    p.hidden = p.dataset.projfwPane !== tabName;
  });
}

document.querySelectorAll(".projfw-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.projfwTab;
    setProjFwTab(target);
    if (target === "project") {
      renderProjectList();
    } else if (target === "backend") {
      /* Aktif backend kartını vurgula */
      applyBackendUI();
    } else if (target === "framework") {
      /* Aktif framework kartını vurgula (applyFrameworkUI bunu yapıyor) */
      applyFrameworkUI();
    } else if (target === "reset" && projfwResetUi) {
      /* Sekmeye her geçişte seçimler sıfırlanır — kullanıcı temiz başlasın */
      projfwResetUi.resetUi();
    }
  });
});

/* ==================== PROJE YÖNETİMİ ==================== */

/* Proje listesini DOM'a basar. Aktif proje vurgulu; her satırda rename/sil
   butonları. Satıra (boş alana) tıklamak o projeye geçer. Inline rename
   modu açık satır .renaming class'ı alır; o satırda input + Kaydet/Vazgeç
   gösterilir, normal görünüm gizlenir. */
function renderProjectList() {
  const listEl = document.getElementById("projList");
  const countEl = document.getElementById("projCount");
  if (!listEl) return;

  const projects = listProjects();
  const activeId = getActiveProjectId();

  /* Üst sayaç */
  if (countEl) countEl.textContent = t("proj.count", { n: projects.length });

  /* Listeyi temizle ve yeniden oluştur. Inline rename state'ini koruma derdi
     yok çünkü liste her açılışta sıfırdan render ediliyor (modal close/open). */
  listEl.innerHTML = "";

  /* Sıralama: aktif olan üstte, sonra updatedAt'e göre yeniye doğru */
  const sorted = [...projects].sort((a, b) => {
    if (a.id === activeId) return -1;
    if (b.id === activeId) return 1;
    return String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""));
  });

  sorted.forEach(p => {
    const li = document.createElement("li");
    li.className = "proj-item" + (p.id === activeId ? " active" : "");
    li.dataset.projId = p.id;
    /* Sol ikon: projenin framework'ünün emoji'si (yoksa 📁); isim yanında
       parantez içinde framework + backend adı. Ana paneldeki pill'le tutarlı. */
    const fwMeta = (p.data && p.data.framework) ? FRAMEWORK_META[p.data.framework] : null;
    const fwIcon = fwMeta ? fwMeta.icon : "📁";
    const fwName = fwMeta ? tx(fwMeta.short) : "—";
    const beMeta = (p.data && p.data.backend) ? BACKEND_META[p.data.backend] : null;
    const beShortName = beMeta ? tx(beMeta.short) : "";
    const beIcon = beMeta ? beMeta.icon : "";
    /* Görüntü: "(Flutter · 🔥 Firebase)" şeklinde — beIcon yoksa veya backend yoksa
       sadece "(Flutter)". noBackend için emoji 🚫 ile gözükür. */
    const stackLabel = beMeta ? `${fwName} · ${beIcon} ${beShortName}` : fwName;
    li.innerHTML = `
      <button type="button" class="proj-row" data-proj-switch="${p.id}" title="${escapeHtml(p.name)} projesine geç">
        <span class="proj-row-icon" aria-hidden="true"></span>
        <span class="proj-row-name"></span>
        <span class="proj-row-fw"></span>
        <span class="proj-row-active-badge" hidden>${t("proj.active")}</span>
      </button>
      <div class="proj-row-actions">
        <button type="button" class="proj-action proj-action-rename" data-proj-rename="${p.id}" title="${t('proj.rename.title')}" aria-label="${t('proj.rename.title')}">✎</button>
        <button type="button" class="proj-action proj-action-delete" data-proj-delete="${p.id}" title="${t('proj.delete.title')}" aria-label="${t('proj.delete.title')}">🗑</button>
      </div>
      <div class="proj-row-rename" hidden>
        <input type="text" class="proj-rename-input" maxlength="60" value="${escapeHtml(p.name)}" data-i18n-placeholder="proj.rename.placeholder" placeholder="${t('proj.rename.placeholder')}" />
        <button type="button" class="btn primary proj-rename-save" data-proj-rename-save="${p.id}">${t("proj.rename.save")}</button>
        <button type="button" class="btn ghost proj-rename-cancel" data-proj-rename-cancel="${p.id}">${t("proj.rename.cancel")}</button>
        <div class="proj-rename-error" role="alert" aria-live="polite" hidden></div>
      </div>
    `;
    /* İsmi + framework etiketini textContent ile ata (XSS güvenli) */
    li.querySelector(".proj-row-icon").textContent = fwIcon;
    li.querySelector(".proj-row-name").textContent = p.name;
    li.querySelector(".proj-row-fw").textContent = "(" + stackLabel + ")";
    if (p.id === activeId) {
      li.querySelector(".proj-row-active-badge").hidden = false;
    }
    /* Son proje silinemez: sil butonunu görsel olarak disable et + tooltip */
    if (projects.length <= 1) {
      const delBtn = li.querySelector(".proj-action-delete");
      if (delBtn) {
        delBtn.disabled = true;
        delBtn.title = t("proj.delete.lastOne");
      }
    }
    listEl.appendChild(li);
  });

  updateProjAddButtonState();
}

function updateProjAddButtonState() {
  const addBtn = document.getElementById("projAddBtn");
  if (!addBtn) return;
  const atLimit = projectsCount() >= 20;
  addBtn.disabled = atLimit;
  addBtn.title = atLimit ? t("proj.limit.toast") : t("proj.add.title");
}

/* "+ Yeni Proje" akışında seçilen framework + backend — Oluştur'a basılana
   kadar geçici. Üçü de gerekli: ad + framework + backend. */
let pendingNewProjFw = null;
let pendingNewProjBe = null;

/* Formu sıfırlar (input boşalt, framework + backend seçimi temizle, hata gizle,
   butonu disable yap). Modal'ın görünürlüğünü değiştirmez; o ayrıca yönetilir. */
function resetProjAddForm() {
  const input = document.getElementById("projAddInput");
  const err = document.getElementById("projAddError");
  if (input) input.value = "";
  if (err) { err.textContent = ""; err.hidden = true; }
  pendingNewProjFw = null;
  pendingNewProjBe = null;
  document.querySelectorAll(".proj-add-fw").forEach(b => b.classList.remove("selected"));
  document.querySelectorAll(".proj-add-be").forEach(b => b.classList.remove("selected"));
  updateProjAddCreateState();
}

/* Oluştur butonu: ad + framework + backend hepsi girilmişse enable, aksi
   halde disable. Backend "noBackend" da geçerli bir seçim sayılır. */
function updateProjAddCreateState() {
  const input = document.getElementById("projAddInput");
  const createBtn = document.getElementById("projAddCreate");
  if (!input || !createBtn) return;
  const hasName = !!(input.value || "").trim();
  createBtn.disabled = !(hasName && pendingNewProjFw && pendingNewProjBe);
}

function showProjAddError(msg) {
  const err = document.getElementById("projAddError");
  if (!err) return;
  err.textContent = msg;
  err.hidden = false;
}

/* "+ Yeni Proje" → ayrı modal aç + state sıfırla + input'a focus.
   Proje/Framework modal'ı arkada açık kalır; create iptal edilirse kullanıcı
   geri o modal'a düşer (oradan zaten projeler listesini görmeye devam eder). */
document.getElementById("projAddBtn").addEventListener("click", () => {
  if (projectsCount() >= 20) {
    showToast(t("proj.limit.toast"), "warn", 2400);
    return;
  }
  resetProjAddForm();
  openModal("projCreateModal");
  const input = document.getElementById("projAddInput");
  if (input) setTimeout(() => input.focus(), 60);
});

/* Vazgeç → modal'ı kapat ve state'i sıfırla. Kullanıcı arkadaki proje
   yöneticisine geri döner. */
document.getElementById("projAddCancel").addEventListener("click", () => {
  closeModal("projCreateModal");
  resetProjAddForm();
});

/* Mini framework grid: tıklanan framework pendingNewProjFw'ye atanır,
   sadece o buton .selected vurgulu, butonun durumu güncellenir */
document.querySelectorAll(".proj-add-fw").forEach(btn => {
  btn.addEventListener("click", () => {
    pendingNewProjFw = btn.dataset.addFw;
    document.querySelectorAll(".proj-add-fw").forEach(b => b.classList.toggle("selected", b === btn));
    /* Hata mesajı varsa temizle (kullanıcı düzeltiyor) */
    const errEl = document.getElementById("projAddError");
    if (errEl) { errEl.textContent = ""; errEl.hidden = true; }
    updateProjAddCreateState();
  });
});

/* Mini backend grid: aynı pattern — tıklanan backend pendingNewProjBe'ye atanır.
   noBackend dahil her geçerli backend seçilebilir; updateProjAddCreateState
   her ikisini de zorunlu görüyor (boş değil + framework + backend). */
document.querySelectorAll(".proj-add-be").forEach(btn => {
  btn.addEventListener("click", () => {
    pendingNewProjBe = btn.dataset.addBe;
    document.querySelectorAll(".proj-add-be").forEach(b => b.classList.toggle("selected", b === btn));
    const errEl = document.getElementById("projAddError");
    if (errEl) { errEl.textContent = ""; errEl.hidden = true; }
    updateProjAddCreateState();
  });
});

/* Input değişiminde validasyon */
document.getElementById("projAddInput").addEventListener("input", () => {
  /* Yazmaya başlayınca varsa hatayı temizle */
  const errEl = document.getElementById("projAddError");
  if (errEl && !errEl.hidden) { errEl.textContent = ""; errEl.hidden = true; }
  updateProjAddCreateState();
});

/* Enter / Escape kısayolları */
document.getElementById("projAddInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const createBtn = document.getElementById("projAddCreate");
    if (createBtn && !createBtn.disabled) createBtn.click();
  } else if (e.key === "Escape") {
    e.preventDefault();
    closeModal("projCreateModal");
    resetProjAddForm();
  }
});

/* Oluştur → önce onay modal'ı aç. Kabul edilirse projeyi oluştur, aktif yap,
   UI yenile ve TÜM modal'ları kapat (ana ekrana dön). İptal edilirse
   projCreateModal yeniden gösterilir; kullanıcı yazdıkları geri gelir. */
document.getElementById("projAddCreate").addEventListener("click", () => {
  const input = document.getElementById("projAddInput");
  const name = (input?.value || "").trim();
  if (!name) { showProjAddError(t("proj.error.empty")); return; }
  if (name.length > 60) { showProjAddError(t("proj.error.tooLong")); return; }
  if (!pendingNewProjFw) { showProjAddError(t("proj.error.fwMissing")); return; }
  if (!pendingNewProjBe) { showProjAddError(t("proj.error.beMissing")); return; }
  if (projectsCount() >= 20) { showProjAddError(t("proj.limit.toast")); return; }
  if (projectExistsByName(name)) { showProjAddError(t("proj.error.duplicate")); return; }

  const fwMeta = FRAMEWORK_META[pendingNewProjFw];
  const fwDisplay = (fwMeta?.icon || "") + " " + fwLabel(pendingNewProjFw);
  const beMeta = BACKEND_META[pendingNewProjBe];
  const beDisplay = (beMeta?.icon || "") + " " + backendLabel(pendingNewProjBe);
  const currentProj = getActiveProject();
  const html = `
    <p class="fw-switch-intro">${t("proj.add.confirmIntroFull", { name: escapeHtml(name), fw: escapeHtml(fwDisplay), be: escapeHtml(beDisplay) })}</p>
    ${currentProj ? `<ul class="fw-switch-effects">
      <li class="effect-keep"><span class="effect-icon">✓</span><span>${t("proj.add.confirmKept", { currentName: escapeHtml(currentProj.name) })}</span></li>
    </ul>` : ""}
  `;

  /* Hem projCreateModal hem frameworkModal'ı kapat; confirm tek başına önde dursun */
  closeModal("projCreateModal");
  closeModal("frameworkModal");
  /* Onay sonrası işin yapılması için seçimleri local'e kopyala — customConfirm
     callback'i gecikmeli çalışıyor, bu arada kullanıcı modalı tekrar açabilir
     ve pendingNewProj* değişebilir. Defansif kopya. */
  const finalName = name;
  const finalFw = pendingNewProjFw;
  const finalBe = pendingNewProjBe;

  customConfirm(
    html,
    () => {
      const result = createProject(finalName, { framework: finalFw, backend: finalBe });
      if (!result.ok) {
        if (result.error === "duplicate")     showToast(t("proj.error.duplicate"), "warn", 2200);
        else if (result.error === "limit")    showToast(t("proj.limit.toast"), "warn", 2400);
        else if (result.error === "tooLong")  showToast(t("proj.error.tooLong"), "warn", 2200);
        else                                  showToast(t("proj.error.empty"), "warn", 2200);
        return;
      }
      /* Yeni projeyi otomatik aktif yap (kullanıcı confirmation'ı onayladı, doğal akış).
         Eski projenin verisi projects[] içinde aynen kalır. */
      setActiveProjectId(result.project.id);
      reloadActiveProjectAndRender();
      resetProjAddForm();
      /* Tüm modal'lar zaten kapalı — kullanıcı doğrudan ana ekrana, yeni proje seçili */
      showToast(t("proj.created.toast", { name: result.project.name }), "success", 1800);
    },
    {
      title: t("proj.add.confirmTitle"),
      yesText: t("proj.add.confirmYes"),
      cancelText: t("confirm.cancel"),
      html: true,
      wide: true,
      /* İptal/X/backdrop ile kapatılırsa kullanıcının yazdıkları kaybolmasın:
         arkadaki frameworkModal ve önündeki projCreateModal yeniden açılsın,
         focus input'a dönsün. State (input değeri + framework seçimi) sıfırlanmaz. */
      onCancel: () => {
        openModal("frameworkModal");
        openModal("projCreateModal");
        const inp = document.getElementById("projAddInput");
        if (inp) setTimeout(() => inp.focus(), 60);
      }
    }
  );
});

/* Liste içindeki tüm tıklamalar tek delegasyonla yönetilir (rename/delete/switch) */
document.getElementById("projList").addEventListener("click", (e) => {
  const target = e.target.closest("button, [data-proj-switch]");
  if (!target) return;

  /* Switch satırı (proje değiştir) — onaylı: customConfirm aç, kullanıcı
     kabul ederse aktif projeyi değiştir ve tüm UI'ı yeniden render et. */
  const switchId = target.getAttribute("data-proj-switch");
  if (switchId !== null) {
    /* Aktif satıra tıklamak no-op (zaten içindeyiz) */
    if (switchId === getActiveProjectId()) {
      closeModal("frameworkModal");
      return;
    }
    const targetProj = findProjectById(switchId);
    const currentProj = getActiveProject();
    if (!targetProj) return;
    const fromName = escapeHtml(currentProj?.name || "—");
    const toName   = escapeHtml(targetProj.name);
    const html = `
      <p class="fw-switch-intro">${t("proj.switch.intro")}</p>
      <ul class="fw-switch-effects">
        <li class="effect-keep"><span class="effect-icon">✓</span><span>${t("proj.switch.effect.kept", { from: fromName })}</span></li>
        <li class="effect-keep"><span class="effect-icon">→</span><span>${t("proj.switch.effect.target", { to: toName })}</span></li>
      </ul>
    `;
    /* Frameworks modal'ını önce kapat, üst üste binmesin (confirm onun yerine açılır) */
    closeModal("frameworkModal");
    customConfirm(
      html,
      () => {
        if (setActiveProjectId(switchId)) {
          reloadActiveProjectAndRender();
          showToast(t("proj.switch.toast", { name: targetProj.name }), "success", 1600);
        }
      },
      { title: t("proj.switch.confirmTitle"), yesText: t("proj.switch.confirmYes"), cancelText: t("confirm.cancel"), html: true, wide: true }
    );
    return;
  }

  /* Rename modu aç */
  const renameId = target.getAttribute("data-proj-rename");
  if (renameId !== null) {
    const li = target.closest(".proj-item");
    if (!li) return;
    li.classList.add("renaming");
    const renameWrap = li.querySelector(".proj-row-rename");
    if (renameWrap) {
      renameWrap.hidden = false;
      const inp = renameWrap.querySelector(".proj-rename-input");
      if (inp) { setTimeout(() => { inp.focus(); inp.select(); }, 60); }
    }
    return;
  }

  /* Rename kaydet */
  const renameSaveId = target.getAttribute("data-proj-rename-save");
  if (renameSaveId !== null) {
    const li = target.closest(".proj-item");
    if (!li) return;
    const inp = li.querySelector(".proj-rename-input");
    const errEl = li.querySelector(".proj-rename-error");
    const newName = (inp?.value || "").trim();
    const r = renameProject(renameSaveId, newName);
    if (!r.ok) {
      let msg = t("proj.error.empty");
      if (r.error === "tooLong") msg = t("proj.error.tooLong");
      else if (r.error === "duplicate") msg = t("proj.error.duplicate");
      if (errEl) { errEl.textContent = msg; errEl.hidden = false; }
      return;
    }
    showToast(t("proj.renamed.toast"), "success", 1400);
    /* Aktif projeyi rename ettiysek pill etiketini de güncellemeliyiz */
    if (renameSaveId === getActiveProjectId()) applyFrameworkUI();
    renderProjectList();
    return;
  }

  /* Rename vazgeç */
  const renameCancelId = target.getAttribute("data-proj-rename-cancel");
  if (renameCancelId !== null) {
    const li = target.closest(".proj-item");
    if (!li) return;
    li.classList.remove("renaming");
    const renameWrap = li.querySelector(".proj-row-rename");
    if (renameWrap) renameWrap.hidden = true;
    const errEl = li.querySelector(".proj-rename-error");
    if (errEl) { errEl.textContent = ""; errEl.hidden = true; }
    /* Input'u orijinal değerine geri çek */
    const inp = li.querySelector(".proj-rename-input");
    const proj = findProjectById(renameCancelId);
    if (inp && proj) inp.value = proj.name;
    return;
  }

  /* Sil */
  const deleteId = target.getAttribute("data-proj-delete");
  if (deleteId !== null) {
    if (target.disabled) return;
    if (projectsCount() <= 1) {
      showToast(t("proj.delete.lastOne"), "warn", 2400);
      return;
    }
    const proj = findProjectById(deleteId);
    if (!proj) return;
    const wasActive = deleteId === getActiveProjectId();
    /* Onay (modal üstüne modal açabilmek için confirmModal'ın z-index'i yeterli) */
    customConfirm(
      t("proj.delete.confirmMsg", { name: escapeHtml(proj.name) }),
      () => {
        /* Aktif proje siliniyor + en az 3 proje var → kullanıcıya "hangisine
           geçeyim" seçim modal'ı göster. Silme + geçiş tek seferde, seçim
           modalında yapılır (orada ek onay alınmaz; bu noktada kullanıcı
           silme onayını zaten verdi ve aktif projesi olmayacak). */
        if (wasActive && projectsCount() >= 3) {
          openProjPickNextModal(proj, deleteId);
          return;
        }
        /* Tek aktif veya az proje durumu: mevcut otomatik geçiş davranışı sürer */
        const r = deleteProject(deleteId);
        if (!r.ok) {
          if (r.error === "lastOne") showToast(t("proj.delete.lastOne"), "warn", 2400);
          return;
        }
        showToast(t("proj.deleted.toast", { name: proj.name }), "info", 1600);
        if (wasActive) {
          /* Aktif silindi: deleteProject yeni aktif id'yi atadı; UI'ı yeniden yükle */
          reloadActiveProjectAndRender();
        }
        renderProjectList();
      },
      { title: t("proj.delete.confirmTitle"), yesText: t("proj.delete.confirmYes"), cancelText: t("confirm.cancel"), html: true }
    );
    return;
  }
});

/* ==================== AKTİF PROJE SİLİNDİĞİNDE GEÇİŞ SEÇİM MODALI ==================== */

/* Silme onayı verildikten sonra (aktif + 3+ proje koşulunda), kullanıcıya
   "hangi projeye geçeyim" sorusunu soran modal. State şuralarda yaşar:
   - pendingDeleteId: silinmek üzere olan projenin id'si
   - pendingDeletedName: toast için ismini sakla
   Seçim yapılana kadar silme henüz gerçekleşmez; seçim yapılınca delete +
   setActive eş zamanlı çalışır (yarım kalmış aktif yok durumunu önler). */
let pendingDeleteId = null;
let pendingDeletedName = null;

function openProjPickNextModal(deletedProj, deleteId) {
  const listEl = document.getElementById("projPickList");
  const subEl = document.getElementById("projPickSub");
  if (!listEl) return;

  pendingDeleteId = deleteId;
  pendingDeletedName = deletedProj.name;

  /* Alt yazı: hangi projenin silineceğini hatırlat */
  if (subEl) subEl.innerHTML = t("proj.pickNext.sub", { name: escapeHtml(deletedProj.name) });

  /* Listeyi doldur: silinen hariç tüm projeler; son güncellenen başta */
  listEl.innerHTML = "";
  const others = listProjects().filter(p => p.id !== deleteId);
  others.sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
  others.forEach(p => {
    const li = document.createElement("li");
    li.className = "proj-pick-item";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "proj-pick-btn";
    btn.dataset.projPick = p.id;
    const fwIcon = FRAMEWORK_META[p.data?.framework]?.icon || "";
    btn.innerHTML = `
      ${fwIcon ? `<span class="proj-pick-fw" aria-hidden="true">${escapeHtml(fwIcon)}</span>` : ""}
      <span class="proj-pick-name">${escapeHtml(p.name)}</span>
      <span class="proj-pick-arrow" aria-hidden="true">›</span>
    `;
    li.appendChild(btn);
    listEl.appendChild(li);
  });

  /* Frameworks modal'ını kapat ki seçim modal'ı tek başına önde gelsin
     (silme onayını verdik; kullanıcı X / backdrop ile bu modal'dan çıkarsa
     aktif projesi olmayan tutarsız bir duruma düşmeyelim diye dikkat ediyoruz
     — bu yüzden modal'ın yan kapatma yolu yine projeyi silmeden bırakır,
     kullanıcı silme onayını bir daha verebilir.) */
  closeModal("frameworkModal");
  openModal("projPickNextModal");
}

/* Liste tıklaması → seçilen projeye geçiş + eski proje silme.
   X / backdrop ile kapanış: state temizlenir, silme yapılmaz (kullanıcı
   vazgeçti — confirmModal onayı verilmiş olsa da bu nokta hala "geri al"
   sayılır çünkü silme henüz uygulanmadı). */
document.getElementById("projPickList").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-proj-pick]");
  if (!btn) return;
  const targetId = btn.dataset.projPick;
  if (!pendingDeleteId || !targetId) return;

  const deletedName = pendingDeletedName;
  const targetProj = findProjectById(targetId);

  /* Sırayla: önce aktifi hedef'e taşı (deleteProject'in fallback'i çalışmasın),
     sonra eskiyi sil. setActiveProjectId zaten saveProjectsToStorage çağırıyor. */
  setActiveProjectId(targetId);
  const r = deleteProject(pendingDeleteId);
  if (!r.ok) {
    showToast(t("proj.delete.lastOne"), "warn", 2400);
    return;
  }

  pendingDeleteId = null;
  pendingDeletedName = null;

  reloadActiveProjectAndRender();
  closeModal("projPickNextModal");
  showToast(
    t("proj.deletedAndSwitched.toast", { from: deletedName, to: targetProj?.name || "" }),
    "success",
    2200
  );
});

/* Modal X / backdrop ile kapanırsa pending silme state'ini temizle.
   (Silme yapılmaz; kullanıcı seçim yapmadan vazgeçti.) */
document.addEventListener("click", (e) => {
  if (e.target.matches("[data-modal-close]")) {
    const modal = e.target.closest(".modal");
    if (modal && modal.id === "projPickNextModal") {
      pendingDeleteId = null;
      pendingDeletedName = null;
    }
  }
});

/* Rename input içinde Enter/Escape kısayolları */
document.getElementById("projList").addEventListener("keydown", (e) => {
  if (!e.target.classList.contains("proj-rename-input")) return;
  const li = e.target.closest(".proj-item");
  if (!li) return;
  if (e.key === "Enter") {
    e.preventDefault();
    li.querySelector(".proj-rename-save")?.click();
  } else if (e.key === "Escape") {
    e.preventDefault();
    li.querySelector(".proj-rename-cancel")?.click();
  }
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

/* ==================== BACKEND DEĞİŞTİRME (modal Backend sekmesi) ====================
   Framework switch'i ile aynı davranış: bir backend kartına tıklayınca aktif
   backend ile farklıysa, mevcut backend işaretleri varsa onay popup'ı aç ve
   onaylanırsa backend kategorisindeki işaretleri sıfırla. Backend "noBackend"
   olduğunda kategori tamamen gizleneceği için tüm backend işaretleri yok sayılır
   (saveState'de kalsalar bile render edilmez); ama UI'da "sıfırlanır" mesajı
   doğru olur çünkü kullanıcı listede gerçekten o işaretleri görmeyecek.

   Backend kategorisi şu an cat 06 ("Backend"). Bu blok cat ID'sini sabitlemek
   yerine `backendStep: true` etiketli tüm feature'ları tarar — gelecekte başka
   kategorilere backend maddeleri eklenirse de doğru çalışır. */
function clearBackendMarks() {
  let changed = false;
  DATA.forEach(cat => {
    cat.features.forEach(f => {
      if (!f.backendStep) return;
      ["mvp", "release"].forEach(L => {
        const key = `${cat.id}.${f.id}.${L}`;
        if (state[key]) { delete state[key]; changed = true; }
        /* Aynı seviyeye bağlı Nasıl-Yapılır adım state'lerini de temizle
           (örn. "1.1.mvp.s0", "1.1.mvp.s1" ...). Backend değişimi seçimi
           sıfırlıyorsa, aynı seçime bağlı adım ilerlemesi de kalmamalı. */
        const prefix = `${key}.s`;
        Object.keys(state).forEach(k => {
          if (k.startsWith(prefix)) { delete state[k]; changed = true; }
        });
      });
    });
  });
  if (changed) saveState();
}

document.querySelectorAll("[data-switch-be]").forEach(btn => {
  btn.addEventListener("click", () => {
    const be = btn.dataset.switchBe;
    if (be === currentBackend) {
      closeModal("frameworkModal");
      return;
    }

    /* Geçişi gerçekleştiren ortak fonksiyon: clearBackendMarks varsa backend
       kategorisi işaretlerini siler, kutlama bayraklarını sıfırlar, sonra
       UI'ı baştan render eder (backend maddeleri gözükür/gizlenir). */
    const performSwitch = (clearMarks) => {
      if (clearMarks) {
        clearBackendMarks();
        celebrations = {};
        saveCelebrations();
      }
      saveBackend(be);
      applyBackendUI();
      renderContent();
      attachClickHandlers();
      applyFilters();
      updateProgress();
      closeModal("frameworkModal");
      /* Bilgilendirme toast'u, üç farklı senaryo:
         - noBackend → "backend yok, maddeler gizlendi"
         - eskiden noBackend, yenisi gerçek backend → "maddeler tekrar görünür"
         - normal switch → tek satırlık "X seçildi" (clearMarks varsa "sıfırlandı")
       */
      const goingToNone = be === "noBackend";
      const comingFromNone = currentBackend === "noBackend" && be !== "noBackend";
      let msg;
      if (goingToNone) {
        msg = t("beSwitch.toastHidden");
      } else if (comingFromNone) {
        msg = t("beSwitch.toastShown", { name: backendLabel(be) });
      } else if (clearMarks) {
        msg = t("beSwitch.toastReset", { name: backendLabel(be) });
      } else {
        msg = t("beSwitch.toast", { name: backendLabel(be) });
      }
      showToast(msg, "success", clearMarks ? 1800 : 1400);
    };

    /* Backend kategorisindeki herhangi bir işaret varsa onay iste — switch
       yapılırsa o işaretler sıfırlanır. Yoksa doğrudan geç. */
    const hasBackendMarks = DATA.some(cat =>
      cat.features.some(f =>
        f.backendStep && (state[`${cat.id}.${f.id}.mvp`] || state[`${cat.id}.${f.id}.release`])
      )
    );

    if (!hasBackendMarks) {
      performSwitch(false);
      return;
    }

    /* Onay popup'ı için önce projfw modalını kapat (üst üste binmesin) */
    closeModal("frameworkModal");
    const currentMeta = (currentBackend && BACKEND_META[currentBackend]) || { icon: "?", label: currentBackend || "—" };
    const newMeta = BACKEND_META[be];
    /* "noBackend" tarafına geçişte özel etki listesi: maddeler gizlenir */
    const goingToNone = be === "noBackend";
    const comingFromNone = currentBackend === "noBackend";
    const extraEffectKey = goingToNone ? "beModal.effect.itemsHidden"
                          : comingFromNone ? "beModal.effect.itemsShown"
                          : null;
    const extraEffectHtml = extraEffectKey
      ? `<li class="effect-clear"><span class="effect-icon">⚠</span><span>${t(extraEffectKey)}</span></li>`
      : "";
    const html = `
      <div class="fw-switch-confirm">
        <p class="fw-switch-intro">${t("beModal.intro")}</p>
        <div class="fw-switch-row">
          <div class="fw-switch-card from">
            <div class="fw-switch-tag">${t("beModal.tagFrom")}</div>
            <div class="fw-switch-emoji">${currentMeta.icon}</div>
            <div class="fw-switch-name">${tx(currentMeta.label)}</div>
          </div>
          <div class="fw-switch-arrow" aria-hidden="true">→</div>
          <div class="fw-switch-card to">
            <div class="fw-switch-tag">${t("beModal.tagTo")}</div>
            <div class="fw-switch-emoji">${newMeta.icon}</div>
            <div class="fw-switch-name">${tx(newMeta.label)}</div>
          </div>
        </div>
        <ul class="fw-switch-effects">
          <li class="effect-clear"><span class="effect-icon">⚠</span><span>${t("beModal.effect.marksReset")}</span></li>
          <li class="effect-clear"><span class="effect-icon">⚠</span><span>${t("beModal.effect.barsRecalc")}</span></li>
          ${extraEffectHtml}
          <li class="effect-keep"><span class="effect-icon">✓</span><span>${t("beModal.effect.notesKept")}</span></li>
          <li class="effect-keep"><span class="effect-icon">✓</span><span>${t("beModal.effect.catsKept")}</span></li>
        </ul>
      </div>
    `;
    customConfirm(
      html,
      () => performSwitch(true),
      { title: t("beModal.confirmTitle"), yesText: t("beModal.confirmYes"), cancelText: t("beModal.confirmCancel"), html: true, wide: true }
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
  /* Daha önce kapatılmışsa veya yüklenmişse gösterme; sadece floating buton güncellenir. */
  try {
    if (localStorage.getItem(INSTALL_DISMISS_KEY)) {
      updateFloatingInstallVisibility();
      return;
    }
  } catch {}
  const banner = document.getElementById("installBanner");
  if (banner) banner.hidden = false;
  updateFloatingInstallVisibility();
}

function hideInstallBanner() {
  const banner = document.getElementById("installBanner");
  if (banner) banner.hidden = true;
  updateFloatingInstallVisibility();
}

/* Footer'daki küçük indirme ikonu butonu: banner kapatıldığında veya hiç
   gözükmediğinde alternatif erişim noktası. Standalone modda veya install
   tamamlandı bayrağı varsa gizlenir. Banner görünürken floating gizlenir. */
function updateFloatingInstallVisibility() {
  const floatingBtn = document.getElementById("installFloatingBtn");
  if (!floatingBtn) return;

  /* Standalone (yüklü + kendi penceresinde açık) → her ikisi de gizli */
  if (isStandaloneMode()) {
    floatingBtn.hidden = true;
    return;
  }

  /* Önceden "installed" işaretliyse zaten yüklendi → gizle */
  let dismiss = "";
  try { dismiss = localStorage.getItem(INSTALL_DISMISS_KEY) || ""; } catch {}
  if (dismiss === "installed") {
    floatingBtn.hidden = true;
    return;
  }

  /* Banner görünüyorsa floating gizli (alternatife gerek yok); banner gizliyse
     floating görünür. */
  const banner = document.getElementById("installBanner");
  const bannerVisible = banner && !banner.hidden;
  floatingBtn.hidden = bannerVisible;
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

/* Banner "Yükle" ve footer floating buton ortak akış: native prompt
   destekleniyorsa onu tetikle, değilse cihaza özel manuel talimat modali aç. */
async function triggerInstallFlow() {
  if (deferredInstallPrompt) {
    try {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      if (choice && choice.outcome === "accepted") {
        hideInstallBanner();
        try { localStorage.setItem(INSTALL_DISMISS_KEY, "installed"); } catch {}
        updateFloatingInstallVisibility();
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
}

document.getElementById("installBannerBtn").addEventListener("click", triggerInstallFlow);

/* Footer'daki küçük indirme ikon butonu: aynı install akışını tetikler. */
const installFloatingBtn = document.getElementById("installFloatingBtn");
if (installFloatingBtn) {
  installFloatingBtn.addEventListener("click", triggerInstallFlow);
}

/* Banner kapat butonu, bir daha gösterme bayrağı */
document.getElementById("installBannerClose").addEventListener("click", () => {
  try { localStorage.setItem(INSTALL_DISMISS_KEY, "dismissed"); } catch {}
  hideInstallBanner();
  /* hideInstallBanner içinde updateFloatingInstallVisibility çağrılıyor;
     dismissed olduğu için banner kapalı, floating görünür hale gelecek. */
});

/* Init: banner her durumda görünür (kullanıcı kapatmadıysa veya zaten yüklemediyse)
   - Daha önce × ile kapatılmış → gizli (footer floating buton görünür)
   - Daha önce yüklenmiş veya standalone modda → her ikisi de gizli
   - Diğer tüm durumlar → banner görünür (tıkladığında ortama göre davranır)
   Sonunda updateFloatingInstallVisibility çağrılarak footer butonun
   görünürlüğü banner durumuna göre senkronize edilir. */
(function initInstallBanner() {
  const banner = document.getElementById("installBanner");
  if (!banner) {
    updateFloatingInstallVisibility();
    return;
  }
  try {
    if (localStorage.getItem(INSTALL_DISMISS_KEY)) {
      banner.hidden = true;
      updateFloatingInstallVisibility();
      return;
    }
  } catch {}
  if (isStandaloneMode()) {
    banner.hidden = true;
    updateFloatingInstallVisibility();
    return;
  }
  banner.hidden = false;
  updateFloatingInstallVisibility();
})();

/* Hero anlatım dili pill'i (üst kontroller arasında) — tıklanınca tüm madde
   metinleri yeni stile göre yeniden render edilir, kullanıcıya küçük bir toast
   bilgilendirmesi gösterilir. */
const styleToggleBtn = document.getElementById("styleToggle");
if (styleToggleBtn) {
  styleToggleBtn.addEventListener("click", () => {
    if (typeof toggleStyle === "function") toggleStyle();
  });
}

/* ==================== INIT ==================== */
/* İlk olarak DOM'a kaydedilmiş dile göre tüm i18n işaretli elementleri tercüme et */
applyI18nToDom();

/* Anlatım dilini DOM'a uygula (button label + data-explanation-style attr) */
if (typeof applyStyle === "function") applyStyle(currentStyle);

/* Kullanım biçimi tercihini DOM'a uygula (data-card-mode attr).
   Kartların aslında çevrilmesi attachClickHandlers sonunda applyInitialCardMode
   ile yapılır; burada sadece tercih html'e yansıtılır. */
if (typeof applyMode === "function") applyMode(currentMode);

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
