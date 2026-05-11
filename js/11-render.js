const content = document.getElementById("content");
const catNav = document.getElementById("catNav");

function levelLabel(l) {
  return { mvp: t("level.mvp"), release: t("level.release") }[l];
}

function renderCategoryNav() {
  catNav.innerHTML = DATA.map(c =>
    `<a href="#cat-${c.id}" data-cat-nav="${c.id}">${c.id}. ${tx(c.title)}</a>`
  ).join("");
}

/* Bir kategorideki "kullanıcının kaldığı" maddeyi bulur. viewMode'a göre adayları
   belirler, viewFilter'dan bağımsız olarak işaretsiz olan ilk maddeye gider. Hepsi
   tam ise kategorinin son uygun maddesini döner. */
function findCategoryTargetFeature(catId) {
  const cat = DATA.find(c => c.id === catId);
  if (!cat) return null;

  const mvpVal = (f) => resolveLevelText(f, "mvp");
  const releaseVal = (f) => resolveLevelText(f, "release");
  const exists = (v) => v && v !== "—";
  const isMvpExists = (f) => exists(mvpVal(f));
  const isReleaseExists = (f) => exists(releaseVal(f));

  /* Aday: framework + backend filtresinden geçen + mevcut viewMode'a uygun seviyesi olan */
  const candidates = cat.features.filter(f => {
    if (f.variants && !currentFramework) return false;
    if (isHiddenByBackend(f)) return false;
    if (viewMode === "mvp") return isMvpExists(f);
    if (viewMode === "release") return isReleaseExists(f);
    return isMvpExists(f) || isReleaseExists(f); // both
  });
  if (candidates.length === 0) {
    return cat.features.find(f => !(f.variants && !currentFramework) && !isHiddenByBackend(f)) || null;
  }

  const isIncomplete = (f) => {
    const mvpKey = `${cat.id}.${f.id}.mvp`;
    const releaseKey = `${cat.id}.${f.id}.release`;
    if (viewMode === "mvp") return isMvpExists(f) && !state[mvpKey];
    if (viewMode === "release") return isReleaseExists(f) && !state[releaseKey];
    return (isMvpExists(f) && !state[mvpKey]) || (isReleaseExists(f) && !state[releaseKey]);
  };

  const firstIncomplete = candidates.find(isIncomplete);
  if (firstIncomplete) return firstIncomplete;
  return candidates[candidates.length - 1];
}

/* Kategorinin akıllı navigasyonu:
   - Kategori kapalıysa aç
   - Hedef maddeyi bul, sticky bar'ı hesaba katarak yumuşak kaydır */
function navigateToCategorySmart(catId) {
  const targetFeat = findCategoryTargetFeature(catId);

  /* Kategoriyi aç (kapalıysa) */
  const catSelector = `cat-${catId}`;
  const catEl = document.getElementById(catSelector);
  if (catEl && catEl.classList.contains("collapsed")) {
    catEl.classList.remove("collapsed");
    collapsedCats.delete(catSelector);
    saveCollapsed();
  }

  /* Layout'un genişlemesi için bir frame bekle, sonra scroll */
  requestAnimationFrame(() => {
    let target;
    if (targetFeat) {
      const id = `feat-${catId}-${targetFeat.id.replace(/\./g, "-")}`;
      target = document.getElementById(id);
    }
    if (!target) target = catEl; // yedek: kategori başlığı

    if (!target) return;

    /* Sticky bar yüksekliğini hesaba kat: hedef üst kenarı sticky'nin altında dursun */
    const stickyBar = document.querySelector(".sticky-bar");
    const stickyH = stickyBar ? stickyBar.getBoundingClientRect().height : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - stickyH - 16;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  });
}

/* Kategori nav linklerine event delegation: default jump'ı engelle, akıllı git */
catNav.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-cat-nav]");
  if (!a) return;
  e.preventDefault();
  navigateToCategorySmart(a.dataset.catNav);
});

function renderContent() {
  content.innerHTML = DATA.map(cat => {
    const catTitle = tx(cat.title);
    const catSub = tx(cat.sub);
    const features = cat.features.map(f => {
      /* Framework henüz seçilmediyse framework'e özel maddeler gözükmez. */
      if (f.variants && !currentFramework) return "";
      /* Backend "noBackend" seçildiyse (veya henüz seçilmediyse) backend'e
         bağlı maddeler tamamen gizlenir — kullanıcının "internet yok / sunucu
         yok" senaryosunda yapılacak listesi temiz görünür. */
      if (isHiddenByBackend(f)) return "";
      const mvpVal = resolveLevelText(f, "mvp");
      const releaseVal = resolveLevelText(f, "release");
      const fTitle = tx(f.title);
      const fDesc = tx(f.desc);
      const levels = ["mvp", "release"].map(L => {
        const value = L === "mvp" ? mvpVal : releaseVal;
        if (!value || value === "—") return "";
        const key = `${cat.id}.${f.id}.${L}`;
        const checked = state[key] ? "checked" : "";
        return `
          <div class="level ${L} ${checked}" data-key="${key}">
            <span class="check"></span>
            <span class="level-tag">${levelLabel(L)}</span>
            <span class="level-text">${value}</span>
          </div>`;
      }).join("");

      const noteId = `${cat.id}.${f.id}`;
      const noteValue = notes[noteId] || "";
      const hasNote = noteValue.trim().length > 0;
      const noteLabel = hasNote ? t("note.mine") : t("note.add");

      const featAnchor = `feat-${cat.id}-${f.id.replace(/\./g, "-")}`;
      return `
        <article class="feature${hasNote ? " has-note" : ""}" id="${featAnchor}" data-search="${(fTitle + " " + fDesc + " " + (mvpVal||"") + " " + (releaseVal||"")).toLowerCase().replace(/<[^>]+>/g, "")}" data-note-id="${noteId}">
          <div class="feature-head">
            <span class="id">#${f.id}</span>
            <h3>${fTitle}</h3>
          </div>
          <p class="feature-desc">${fDesc}</p>
          <div class="levels">${levels}</div>
          <button type="button" class="feature-note-toggle" data-note-toggle="${noteId}">
            <span class="note-icon">${hasNote ? "📝" : "+"}</span>
            <span class="note-label">${noteLabel}</span>
          </button>
          <span class="feature-ai-wrap">
            <button type="button" class="feature-ai-copy" data-ai-toggle title="${t("ai.askTitle")}">
              <span class="ai-icon">🤖</span>
              <span class="ai-label">${t("ai.ask")}</span>
            </button>
            <span class="feature-ai-options">
              <button type="button" class="feature-ai-option ai-tr" data-ai-format="tr" data-ai-cat="${cat.id}" data-ai-feat="${f.id}" title="${t("ai.trTitle")}">${t("ai.tr")}</button>
              <button type="button" class="feature-ai-option ai-json" data-ai-format="json" data-ai-cat="${cat.id}" data-ai-feat="${f.id}" title="${t("ai.jsonTitle")}">${t("ai.json")}</button>
            </span>
          </span>
          <div class="feature-note">
            <textarea data-note-input="${noteId}" placeholder="${t("note.placeholder")}">${escapeHtml(noteValue)}</textarea>
            <div class="note-meta">
              <span>${t("note.autoSave")}</span>
              <button type="button" class="note-clear" data-note-clear="${noteId}">${t("note.clear")}</button>
            </div>
          </div>
          <div class="feature-note-display" aria-hidden="true">
            <span class="note-display-icon" aria-hidden="true">📝</span>
            <span class="note-display-text">${escapeHtml(noteValue)}</span>
          </div>
        </article>`;
    }).join("");

    /* Tüm featureları variant olup framework seçilmemişse kategori gözükmesin */
    if (!features.trim()) return "";

    const collapsedClass = collapsedCats.has(`cat-${cat.id}`) ? " collapsed" : "";

    return `
      <section class="category${collapsedClass}" id="cat-${cat.id}">
        <header class="cat-header" data-cat-toggle="cat-${cat.id}">
          <span class="num">${cat.id}</span>
          <div class="title">
            <h2>${catTitle}</h2>
            <p>${catSub}</p>
          </div>
          <div class="cat-progress">
            <span class="pct" data-cat-pct="${cat.id}">0%</span>
            <span data-cat-num="${cat.id}">0 / 0</span>
          </div>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </header>
        <div class="feature-list">${features}</div>
      </section>`;
  }).join("");
}

function attachClickHandlers() {
  /* Seviye işaretleme */
  document.querySelectorAll(".level").forEach(el => {
    el.addEventListener("click", () => {
      if (lockState) return; /* Kilit aktif: değişiklik yok */
      const key = el.dataset.key;
      if (state[key]) { delete state[key]; el.classList.remove("checked"); }
      else { state[key] = true; el.classList.add("checked"); }
      saveState();
      updateProgress();
      if (viewFilter !== "all" || viewMode !== "both") applyFilters();
    });
  });

  /* Kategori başlığı tıklayınca collapse / expand */
  document.querySelectorAll(".cat-header").forEach(h => {
    h.addEventListener("click", (e) => {
      const catId = h.dataset.catToggle;
      if (!catId) return;
      const cat = document.getElementById(catId);
      if (!cat) return;
      const isCollapsed = cat.classList.toggle("collapsed");
      if (isCollapsed) collapsedCats.add(catId);
      else collapsedCats.delete(catId);
      saveCollapsed();
    });
  });

  /* Not ekle / aç-kapa */
  document.querySelectorAll("[data-note-toggle]").forEach(btn => {
    btn.addEventListener("click", () => {
      const feature = btn.closest(".feature");
      feature.classList.toggle("note-open");
      if (feature.classList.contains("note-open")) {
        const ta = feature.querySelector("textarea");
        if (ta) setTimeout(() => ta.focus(), 50);
      }
    });
  });

  /* Not içeriği yazıldıkça kaydet (debounced toast) */
  document.querySelectorAll("[data-note-input]").forEach(ta => {
    let toastTimer = null;
    ta.addEventListener("input", () => {
      const id = ta.dataset.noteInput;
      const value = ta.value;
      const feature = ta.closest(".feature");
      const toggle = feature.querySelector("[data-note-toggle]");
      if (value.trim()) {
        notes[id] = value;
        feature.classList.add("has-note");
        if (toggle) {
          toggle.querySelector(".note-icon").textContent = "📝";
          toggle.querySelector(".note-label").textContent = t("note.mine");
        }
      } else {
        delete notes[id];
        feature.classList.remove("has-note");
        if (toggle) {
          toggle.querySelector(".note-icon").textContent = "+";
          toggle.querySelector(".note-label").textContent = t("note.add");
        }
      }
      saveNotes();
      /* Sunum modunda gösterilen not kartını da güncelle (varsa) */
      const displayEl = feature.querySelector(".note-display-text");
      if (displayEl) displayEl.textContent = value;
      /* Dışa Aktar butonu sadece-not durumunda da aktif olmalı */
      if (typeof updateToolbarButtonStates === "function") updateToolbarButtonStates();
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        showToast(value.trim() ? t("note.saved") : t("note.deleted"), "success", 1100);
      }, 700);
    });
  });

  /* AI Sor, toggle (format seçim panelini aç / kapat) */
  document.querySelectorAll("[data-ai-toggle]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const wrap = btn.closest(".feature-ai-wrap");
      const isOpen = wrap.classList.contains("ai-open");
      // Diğer açık panelleri kapat
      document.querySelectorAll(".feature-ai-wrap.ai-open").forEach(w => {
        if (w !== wrap) w.classList.remove("ai-open");
      });
      wrap.classList.toggle("ai-open", !isOpen);
    });
  });

  /* AI format seçimi, TR Metin veya EN JSON kopyala */
  document.querySelectorAll("[data-ai-format]").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const format = btn.dataset.aiFormat;
      const catId = btn.dataset.aiCat;
      const featId = btn.dataset.aiFeat;
      const cat = DATA.find(c => c.id === catId);
      const f = cat ? cat.features.find(x => x.id === featId) : null;
      if (!cat || !f) return;
      const prompt = format === "json" ? buildAIPromptJSON(cat, f) : buildAIPromptTR(cat, f);
      const ok = await copyToClipboard(prompt);
      const wrap = btn.closest(".feature-ai-wrap");
      if (ok) {
        const originalText = btn.textContent;
        btn.classList.add("copied");
        btn.textContent = t("ai.copied");
        showToast(
          format === "json" ? t("ai.copiedJson") : t("ai.copiedTr"),
          "success",
          2400
        );
        setTimeout(() => {
          btn.classList.remove("copied");
          btn.textContent = originalText;
          if (wrap) wrap.classList.remove("ai-open");
        }, 1400);
      } else {
        showToast(t("ai.copyFail"), "warn", 1800);
      }
    });
  });

  /* Notu temizle butonu */
  document.querySelectorAll("[data-note-clear]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.noteClear;
      const feature = btn.closest(".feature");
      const ta = feature.querySelector("textarea");
      if (ta) {
        ta.value = "";
        ta.dispatchEvent(new Event("input"));
      }
    });
  });
}


