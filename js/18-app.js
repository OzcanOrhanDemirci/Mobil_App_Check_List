/* Tümünü Aç */
document.getElementById("expandAllBtn").addEventListener("click", () => {
  document.querySelectorAll(".category").forEach(c => {
    c.classList.remove("collapsed");
    collapsedCats.delete(c.id);
  });
  saveCollapsed();
  /* collapsedCats artık boş, "Tümünü Aç" turuncu, "Tümünü Kapat" pasif */
  if (typeof updateToolbarButtonStates === "function") updateToolbarButtonStates();
});

/* Tümünü Kapat */
document.getElementById("collapseAllBtn").addEventListener("click", () => {
  document.querySelectorAll(".category").forEach(c => {
    c.classList.add("collapsed");
    collapsedCats.add(c.id);
  });
  saveCollapsed();
  /* collapsedCats artık tüm kategorileri içeriyor, "Tümünü Kapat" turuncu */
  if (typeof updateToolbarButtonStates === "function") updateToolbarButtonStates();
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
  /* Tüm kartlar artık aynı yüzde; "Tümü Nasıl" veya "Tümü Liste"
     turuncu olmalı (DOM sayısından türetilir). */
  if (typeof updateToolbarButtonStates === "function") updateToolbarButtonStates();
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
  const independents = RESET_INDEPENDENT_SCOPES.map(s => document.querySelector(`[${attr}="${s}"]`)).filter(Boolean);

  /* Tüm seçenekleri sıfırla (modal/sekme yeniden açılışında çağrılır) */
  function resetUi() {
    cbs.forEach(cb => {
      cb.checked = false;
      cb.disabled = false;
    });
    nextBtn.disabled = true;
  }

  /* Checkbox değişimi: system ↔ diğerleri ilişkisini yönet, İleri butonunu güncelle */
  cbs.forEach(cb => {
    cb.addEventListener("change", () => {
      if (sysCb && cb === sysCb) {
        if (sysCb.checked) {
          independents.forEach(o => {
            o.checked = false;
            o.disabled = true;
          });
        } else {
          independents.forEach(o => {
            o.disabled = false;
          });
        }
      } else if (cb.checked && sysCb && sysCb.checked) {
        sysCb.checked = false;
        independents.forEach(o => {
          o.disabled = false;
        });
      }
      const anyChecked = (sysCb && sysCb.checked) || independents.some(o => o.checked);
      nextBtn.disabled = !anyChecked;
    });
  });

  /* İleri butonu → scope topla → onay aç → performReset çağır */
  nextBtn.addEventListener("click", () => {
    const scope = {
      selections: document.querySelector(`[${attr}="selections"]`)?.checked || false,
      notes: document.querySelector(`[${attr}="notes"]`)?.checked || false,
      settings: document.querySelector(`[${attr}="settings"]`)?.checked || false,
      system: document.querySelector(`[${attr}="system"]`)?.checked || false,
    };

    if (typeof onBeforeConfirm === "function") onBeforeConfirm();

    let html,
      yesKey = "reset.yes";
    if (scope.system) {
      html = t("reset.confirm.system");
      yesKey = "reset.yesSystem";
    } else {
      const parts = [];
      if (scope.selections) parts.push(t("reset.confirm.part.selections"));
      if (scope.notes) parts.push(t("reset.confirm.part.notes"));
      if (scope.settings) parts.push(t("reset.confirm.part.settings"));
      if (parts.length === 0) return;
      html = `
        <p class="fw-switch-intro">${t("reset.confirm.intro")}</p>
        <ul class="fw-switch-effects">
          ${parts.map(p => `<li class="effect-clear"><span class="effect-icon">⚠</span><span>${p}</span></li>`).join("")}
        </ul>
      `;
    }

    customConfirm(html, () => performReset(scope), {
      title: t("reset.confirmTitle"),
      yesText: t(yesKey),
      cancelText: t("confirm.cancel"),
      html: true,
      wide: !scope.system,
    });
  });

  return { resetUi };
}

/* UI #1: Toolbar Sıfırla → resetScopeModal (sadece selections + notes). */
const toolbarResetUi = setupResetScopeUi("data-reset-scope", "resetScopeNext", () => closeModal("resetScopeModal"));

/* Toolbar Sıfırla butonu — modalı her açılışta UI'ı sıfırla */
document.getElementById("resetBtn").addEventListener("click", () => {
  if (lockState) return;
  if (toolbarResetUi) toolbarResetUi.resetUi();
  openModal("resetScopeModal");
});

/* UI #2: Proje/FW modal "Sıfırla" sekmesi (4 seçenek: tüm modlar). */
const projfwResetUi = setupResetScopeUi("data-full-reset-scope", "projfwResetNext", () => closeModal("frameworkModal"));

/* Asıl sıfırlama mantığı, scope objesine göre */
function performReset(scope) {
  /* "Tüm Sistem": localStorage'ı tamamen temizle ve sayfayı yenile.
     Böylece welcome akışı yeniden tetiklenir, kullanıcı baştan başlar. */
  if (scope.system) {
    showToast("✓", "info", 600);
    setTimeout(() => {
      try {
        localStorage.clear();
      } catch {}
      location.reload();
    }, 200);
    return;
  }

  /* Seçimler: işaretler + kutlama bayrakları.
     state objesi hem ön yüz seviye anahtarlarını (ör. "1.1-mvp") hem arka
     yüz How-To adım anahtarlarını (ör. "1.1-mvp.s0") tutar. state = {}
     ikisini de siler; DOM tarafında her iki yüzü de elle temizlemek
     gerekir (renderContent çağrılmıyor çünkü selections-only path
     hızlı kalmalı). Ek olarak seviye üzerindeki partial-fill (--step-
     progress CSS değişkeni) ve level-progress-badge updateLevelProgressUI
     tarafından state boş okunduğunda otomatik temizlenir. */
  if (scope.selections) {
    state = {};
    saveState();
    celebrations = {};
    saveCelebrations();
    /* Ön yüz seviye işaretleri */
    document.querySelectorAll(".level.checked").forEach(el => el.classList.remove("checked"));
    /* Arka yüz Nasıl Yapılır? adımları */
    document.querySelectorAll(".howto-step.checked").forEach(li => {
      li.classList.remove("checked");
      li.setAttribute("aria-checked", "false");
    });
    /* Her seviyenin partial-fill yüzdesini ve progress badge'ini yeniden
       hesapla (state boş olduğundan ikisi de görsel olarak kaldırılır). */
    if (typeof updateLevelProgressUI === "function") {
      document.querySelectorAll(".level[data-key]").forEach(el => {
        updateLevelProgressUI(el.dataset.key);
      });
    }
  }

  /* Notlar: tüm notlar silinir */
  if (scope.notes) {
    notes = {};
    saveNotes();
    /* Açık not textarea'larını temizle, has-note class'ını kaldır, sunum-notu textini sil */
    document.querySelectorAll("[data-note-input]").forEach(ta => {
      ta.value = "";
    });
    document.querySelectorAll(".feature.has-note").forEach(f => f.classList.remove("has-note"));
    document.querySelectorAll(".note-display-text").forEach(el => {
      el.textContent = "";
    });
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
    applyView(); // body class'ları, hero pill'leri, filter
    applyLock(); // lock UI
    updateProgress(); // ilerleme barı + toolbar buton state'leri
    applyFilters(); // feature/category visibility
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
      {
        title: t("lock.confirmTitle"),
        yesText: t("lock.confirmYes"),
        cancelText: t("lock.confirmCancel"),
        html: true,
        wide: true,
      }
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
      {
        title: t("lock.unlockTitle"),
        yesText: t("lock.unlockYes"),
        cancelText: t("lock.confirmCancel"),
        html: true,
        wide: true,
      }
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

  toggleBtn.addEventListener("click", e => {
    e.stopPropagation();
    if (toolbarEl.classList.contains("actions-open")) close();
    else open();
  });

  /* Toolbar dışında bir yere tıklayınca paneli kapat */
  document.addEventListener("click", e => {
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
  document.addEventListener("keydown", e => {
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
  let startX = 0,
    startY = 0;

  const start = () => {
    cancel();
    el.classList.add("pressing");
    timer = setTimeout(() => {
      el.classList.remove("pressing");
      el.classList.add("triggered");
      try {
        const msg = typeof toastMsg === "function" ? toastMsg() : toastMsg;
        showToast(msg, "info", 1600);
      } catch {}
      window.open(link, "_blank", "noopener,noreferrer");
      setTimeout(() => el.classList.remove("triggered"), 800);
      timer = null;
    }, HOLD_MS);
  };

  const cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    el.classList.remove("pressing");
  };

  /* Mouse */
  el.addEventListener("mousedown", e => {
    if (e.button !== 0) return;
    start();
  });
  el.addEventListener("mouseup", cancel);
  el.addEventListener("mouseleave", cancel);

  /* Touch */
  el.addEventListener(
    "touchstart",
    e => {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      start();
    },
    { passive: true }
  );
  el.addEventListener(
    "touchmove",
    e => {
      if (!timer) return;
      const t = e.touches[0];
      if (Math.abs(t.clientX - startX) > MOVE_TOLERANCE || Math.abs(t.clientY - startY) > MOVE_TOLERANCE) cancel();
    },
    { passive: true }
  );
  el.addEventListener("touchend", cancel);
  el.addEventListener("touchcancel", cancel);

  /* Mobil long-press menüsünü engelle */
  el.addEventListener("contextmenu", e => e.preventDefault());
}

/* Hero rozeti -> LinkedIn; footer versiyon damgası -> GitHub.
   toastMsg her seferinde t() ile çözülsün diye fonksiyonel olarak verilebilir
   ama mevcut setup kuralı statik string istiyor; aşağıda lazy çağrı için
   her tetiklenmede currentLang üzerinden çevir. setup'a fonksiyonel desteği
   eklemek yerine, çeviri için bir wrapper kullanıyoruz. */
setupLongPressEasterEgg(document.querySelector(".instructor"), "https://www.linkedin.com/in/ozcan-orhan-demirci/", () =>
  t("easter.linkedin")
);
setupLongPressEasterEgg(document.getElementById("footVersion"), "https://github.com/OzcanOrhanDemirci", () =>
  t("easter.github")
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
  document.querySelectorAll("#helpModalBody > section.help-section").forEach(s => s.classList.add("collapsed"));
}

/* h3 tıklaması → section toggle. helpModalBody parent kalıcı olduğundan
   innerHTML değişse bile delegated handler çalışmaya devam eder. */
document.getElementById("helpModalBody")?.addEventListener("click", e => {
  const h3 = e.target.closest("#helpModalBody > section.help-section > h3");
  if (!h3) return;
  h3.parentElement.classList.toggle("collapsed");
});

/* "Tümünü Aç" → tüm section'lardan collapsed class'ını kaldır */
document.getElementById("helpExpandAll")?.addEventListener("click", () => {
  document.querySelectorAll("#helpModalBody > section.help-section").forEach(s => s.classList.remove("collapsed"));
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
  const data = JSON.stringify(
    {
      version: 2,
      state: state,
      notes: notes,
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  );
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mobil-kontrol-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

/* Import: yeni format (state + notes) ve eski format (sadece state) */
const importFile = document.getElementById("importFile");
document.getElementById("importBtn").addEventListener("click", () => {
  if (lockState) return;
  importFile.click();
});
importFile.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
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
    } catch {
      alert(t("misc.invalidFile"));
    }
  };
  reader.readAsText(file);
  importFile.value = "";
});

/* ==================== KLAVYE KISAYOLLARI ==================== */
document.addEventListener("keydown", e => {
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
    if (inPres) {
      e.preventDefault();
      exitPresentation();
      return;
    }
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

    const iconSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="42" fill="#0b0f17"/><path d="M52 96 L84 128 L140 64" stroke="#f97316" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
    const iconUrl = "data:image/svg+xml," + encodeURIComponent(iconSvg);
    const manifest = {
      name: "Mobil Uygulama Kalite Kontrol Listesi",
      short_name: "Kontrol Listesi",
      description:
        "Geliştirilen mobil uygulamanın MVP ve Release seviyelerinde kalite kontrolünü yapmaya yarayan interaktif kontrol listesi.",
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
        { src: iconUrl, sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
      ],
    };
    const blob = new Blob([JSON.stringify(manifest)], { type: "application/manifest+json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("link");
    link.rel = "manifest";
    link.href = url;
    document.head.appendChild(link);
  } catch (err) {
    /* sessizce geç */
  }
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

  navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(() => {
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
    } catch {
      /* sessizce */
    }
  });
})();

/* ==================== HERO LEVEL/STATUS FİLTRESİ (3x3 = 9 kombinasyon) ==================== */
/* Üç pill (MVP / Release / MVP+Release) + her birinin altında 3 opsiyonlu dropdown
   (Tümü / Yapılacak / Yapılan). Pill'e tıklamak dropdown'u açar; menü item'ı
   tıklandığında setView ile hem viewMode hem viewFilter atanır. */

function closeAllLvMenus() {
  document.querySelectorAll(".lv-menu").forEach(m => (m.hidden = true));
  document.querySelectorAll(".level-filter-pill").forEach(p => p.setAttribute("aria-expanded", "false"));
}

document.querySelectorAll(".lv-group").forEach(group => {
  const pill = group.querySelector(".level-filter-pill");
  const menu = group.querySelector(".lv-menu");
  pill.addEventListener("click", e => {
    e.stopPropagation();
    const wasOpen = !menu.hidden;
    closeAllLvMenus();
    if (!wasOpen) {
      menu.hidden = false;
      pill.setAttribute("aria-expanded", "true");
    }
  });
  menu.querySelectorAll("button").forEach(opt => {
    opt.addEventListener("click", e => {
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
document.addEventListener("click", e => {
  if (!e.target.closest(".lv-group")) closeAllLvMenus();
});

/* Esc menüyü kapatır (mevcut Esc handler'ından önce çalışsın diye capture) */
document.addEventListener(
  "keydown",
  e => {
    if (e.key !== "Escape") return;
    if (document.querySelector(".lv-menu:not([hidden])")) {
      e.preventDefault();
      e.stopPropagation();
      closeAllLvMenus();
    }
  },
  true
);

/* İlk yüklemede mevcut view'i uygula */
applyView();

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
