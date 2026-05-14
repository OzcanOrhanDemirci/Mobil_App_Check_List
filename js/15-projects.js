/* ==================== PROJE YONETIMI + FRAMEWORK / BACKEND MODALI ====================
   Hero'daki proje pill'i ve onunla acilan tab'li modal: Proje listesi,
   Framework degistirme, Backend degistirme, Sifirla. CRUD: yeni proje
   olusturma (isim + framework + backend), yeniden adlandirma, silme
   (son projeyi silmeyi engeller; aktif proje silindiyse devamini secme
   modali). applyFrameworkUI / applyBackendUI buradadir: hero pill'i ve
   modal vurgularini tek yerden tazeler; 08-i18n-dom.js ve 04-projects.js
   tarafindan typeof-guard ile cagrilir. En altta init icin top-level
   applyFrameworkUI() cagrisi var (sayfa acildiginda hero pill'i dogru
   durumda baslasin diye). */

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
    const fwMeta = p.data && p.data.framework ? FRAMEWORK_META[p.data.framework] : null;
    const fwIcon = fwMeta ? fwMeta.icon : "📁";
    const fwName = fwMeta ? tx(fwMeta.short) : "—";
    const beMeta = p.data && p.data.backend ? BACKEND_META[p.data.backend] : null;
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
        <button type="button" class="proj-action proj-action-rename" data-proj-rename="${p.id}" title="${t("proj.rename.title")}" aria-label="${t("proj.rename.title")}">✎</button>
        <button type="button" class="proj-action proj-action-delete" data-proj-delete="${p.id}" title="${t("proj.delete.title")}" aria-label="${t("proj.delete.title")}">🗑</button>
      </div>
      <div class="proj-row-rename" hidden>
        <input type="text" class="proj-rename-input" maxlength="60" value="${escapeHtml(p.name)}" data-i18n-placeholder="proj.rename.placeholder" placeholder="${t("proj.rename.placeholder")}" />
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
  if (err) {
    err.textContent = "";
    err.hidden = true;
  }
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
    if (errEl) {
      errEl.textContent = "";
      errEl.hidden = true;
    }
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
    if (errEl) {
      errEl.textContent = "";
      errEl.hidden = true;
    }
    updateProjAddCreateState();
  });
});

/* Input değişiminde validasyon */
document.getElementById("projAddInput").addEventListener("input", () => {
  /* Yazmaya başlayınca varsa hatayı temizle */
  const errEl = document.getElementById("projAddError");
  if (errEl && !errEl.hidden) {
    errEl.textContent = "";
    errEl.hidden = true;
  }
  updateProjAddCreateState();
});

/* Enter / Escape kısayolları */
document.getElementById("projAddInput").addEventListener("keydown", e => {
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
  if (!name) {
    showProjAddError(t("proj.error.empty"));
    return;
  }
  if (name.length > 60) {
    showProjAddError(t("proj.error.tooLong"));
    return;
  }
  if (!pendingNewProjFw) {
    showProjAddError(t("proj.error.fwMissing"));
    return;
  }
  if (!pendingNewProjBe) {
    showProjAddError(t("proj.error.beMissing"));
    return;
  }
  if (projectsCount() >= 20) {
    showProjAddError(t("proj.limit.toast"));
    return;
  }
  if (projectExistsByName(name)) {
    showProjAddError(t("proj.error.duplicate"));
    return;
  }

  const fwMeta = FRAMEWORK_META[pendingNewProjFw];
  const fwDisplay = (fwMeta?.icon || "") + " " + fwLabel(pendingNewProjFw);
  const beMeta = BACKEND_META[pendingNewProjBe];
  const beDisplay = (beMeta?.icon || "") + " " + backendLabel(pendingNewProjBe);
  const currentProj = getActiveProject();
  const html = `
    <p class="fw-switch-intro">${t("proj.add.confirmIntroFull", { name: escapeHtml(name), fw: escapeHtml(fwDisplay), be: escapeHtml(beDisplay) })}</p>
    ${
      currentProj
        ? `<ul class="fw-switch-effects">
      <li class="effect-keep"><span class="effect-icon">✓</span><span>${t("proj.add.confirmKept", { currentName: escapeHtml(currentProj.name) })}</span></li>
    </ul>`
        : ""
    }
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
        if (result.error === "duplicate") showToast(t("proj.error.duplicate"), "warn", 2200);
        else if (result.error === "limit") showToast(t("proj.limit.toast"), "warn", 2400);
        else if (result.error === "tooLong") showToast(t("proj.error.tooLong"), "warn", 2200);
        else showToast(t("proj.error.empty"), "warn", 2200);
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
      },
    }
  );
});

/* Liste içindeki tüm tıklamalar tek delegasyonla yönetilir (rename/delete/switch) */
document.getElementById("projList").addEventListener("click", e => {
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
    const toName = escapeHtml(targetProj.name);
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
      {
        title: t("proj.switch.confirmTitle"),
        yesText: t("proj.switch.confirmYes"),
        cancelText: t("confirm.cancel"),
        html: true,
        wide: true,
      }
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
      if (inp) {
        setTimeout(() => {
          inp.focus();
          inp.select();
        }, 60);
      }
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
      if (errEl) {
        errEl.textContent = msg;
        errEl.hidden = false;
      }
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
    if (errEl) {
      errEl.textContent = "";
      errEl.hidden = true;
    }
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
      {
        title: t("proj.delete.confirmTitle"),
        yesText: t("proj.delete.confirmYes"),
        cancelText: t("confirm.cancel"),
        html: true,
      }
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
document.getElementById("projPickList").addEventListener("click", e => {
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
  showToast(t("proj.deletedAndSwitched.toast", { from: deletedName, to: targetProj?.name || "" }), "success", 2200);
});

/* Modal X / backdrop ile kapanırsa pending silme state'ini temizle.
   (Silme yapılmaz; kullanıcı seçim yapmadan vazgeçti.) */
document.addEventListener("click", e => {
  if (e.target.matches("[data-modal-close]")) {
    const modal = e.target.closest(".modal");
    if (modal && modal.id === "projPickNextModal") {
      pendingDeleteId = null;
      pendingDeletedName = null;
    }
  }
});

/* Rename input içinde Enter/Escape kısayolları */
document.getElementById("projList").addEventListener("keydown", e => {
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
    const performSwitch = clearMarks => {
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
    const currentMeta = (currentFramework && FRAMEWORK_META[currentFramework]) || {
      icon: "?",
      label: currentFramework || "—",
    };
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
    customConfirm(html, () => performSwitch(true), {
      title: t("fwModal.confirmTitle"),
      yesText: t("fwModal.confirmYes"),
      cancelText: t("fwModal.confirmCancel"),
      html: true,
      wide: true,
    });
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
        if (state[key]) {
          delete state[key];
          changed = true;
        }
        /* Aynı seviyeye bağlı Nasıl-Yapılır adım state'lerini de temizle
           (örn. "1.1.mvp.s0", "1.1.mvp.s1" ...). Backend değişimi seçimi
           sıfırlıyorsa, aynı seçime bağlı adım ilerlemesi de kalmamalı. */
        const prefix = `${key}.s`;
        Object.keys(state).forEach(k => {
          if (k.startsWith(prefix)) {
            delete state[k];
            changed = true;
          }
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
    const performSwitch = clearMarks => {
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
      cat.features.some(f => f.backendStep && (state[`${cat.id}.${f.id}.mvp`] || state[`${cat.id}.${f.id}.release`]))
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
    const extraEffectKey = goingToNone
      ? "beModal.effect.itemsHidden"
      : comingFromNone
        ? "beModal.effect.itemsShown"
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
    customConfirm(html, () => performSwitch(true), {
      title: t("beModal.confirmTitle"),
      yesText: t("beModal.confirmYes"),
      cancelText: t("beModal.confirmCancel"),
      html: true,
      wide: true,
    });
  });
});

/* İlk yüklemede (eğer framework varsa) hero pill'i doğru göster */
applyFrameworkUI();
