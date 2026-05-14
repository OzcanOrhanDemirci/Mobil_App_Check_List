const content = document.getElementById("content");
const catNav = document.getElementById("catNav");

function levelLabel(l) {
  return { mvp: t("level.mvp"), release: t("level.release") }[l];
}

/* Howto metinlerini görsel listeye dönüştür.
   Yazarlar adımları "1) Şunu yap. 2) Sonra şunu yap. 3) ..." gibi düz metin
   içinde yazıyor. Bunu okurken çok daha rahat görünmesi için <ol> ve <li>
   öğelerine böl; numara işaretini (1), 2), …) CSS counter'ı kendisi yeniden
   üretir. Metin yapı dışında ise (örn. tek paragraf, numarasız), olduğu gibi
   döndür. Eğer madde "—" placeholder ise yine olduğu gibi döner.

   keyPrefix: bir madde + seviye birleşimi (örn. "1.1.mvp"). Verilirse her
   <li>'ye data-step-key="{prefix}.s{i}" eklenir ve state[stepKey] true ise
   "checked" class'ı atanır. Bu sayede adımlar checklist mantığıyla
   işaretlenebilir/kaydedilebilir hale gelir. keyPrefix yoksa düz görüntü. */
/* Bir How-To metnindeki numaralanmış adım sayısını döndürür. formatHowtoSteps
   ile aynı pattern'ı kullanır — DOM render etmeden önce miktarı bilmek için. */
function countHowtoSteps(html) {
  if (!html || typeof html !== "string") return 0;
  if (!/\b1\)\s/.test(html)) return 0;
  const parts = html.split(/\s*(\d+)\)\s+/);
  if (parts.length < 3) return 0;
  let count = 0;
  for (let i = 1; i + 1 < parts.length; i += 2) {
    if (parts[i + 1].trim()) count++;
  }
  return count;
}

/* Verilen seviye için işaretli adım sayısını döndürür. prefix = "1.1.mvp",
   total = bu seviyenin toplam adım sayısı. */
function countCheckedStepsByPrefix(prefix, total) {
  if (!total || !state) return 0;
  let n = 0;
  for (let i = 0; i < total; i++) {
    if (state[`${prefix}.s${i}`]) n++;
  }
  return n;
}

function formatHowtoSteps(html, keyPrefix) {
  if (!html || typeof html !== "string") return html;
  /* Numaralandırılmış adımı belirleyen pattern: önünde whitespace (veya başlangıç)
     olan bir sayı + ')'. İlk olarak (1) işaretinden önceki giriş (intro) varsa
     yakala, sonra sırayla 2), 3), … parçalarını çıkar. */
  if (!/\b1\)\s/.test(html)) return html;
  const parts = html.split(/\s*(\d+)\)\s+/);
  /* parts: [intro_or_empty, "1", step1, "2", step2, ...] */
  if (parts.length < 3) return html;
  const intro = parts[0].trim();
  const items = [];
  for (let i = 1; i + 1 < parts.length; i += 2) {
    items.push(parts[i + 1].trim());
  }
  if (items.length === 0) return html;
  /* keyPrefix'in son segmenti seviye (mvp/release). Renk vurgusu için class. */
  const level = keyPrefix ? keyPrefix.split(".").pop() : "";
  const ol = `<ol class="howto-steps${level ? " howto-steps-" + level : ""}">${
    items.map((s, i) => {
      const stepKey = keyPrefix ? `${keyPrefix}.s${i}` : "";
      const isChecked = stepKey && state && state[stepKey];
      const classes = ["howto-step"];
      if (isChecked) classes.push("checked");
      const dataAttr = stepKey
        ? ` data-step-key="${stepKey}" role="checkbox" aria-checked="${isChecked ? "true" : "false"}" tabindex="0"`
        : "";
      return `<li class="${classes.join(" ")}"${dataAttr}>${s}</li>`;
    }).join("")
  }</ol>`;
  return intro ? `<p class="howto-step-intro">${intro}</p>${ol}` : ol;
}

/* Kart flip + height animasyonu — tek kaynaktan yönetilir.
   Sebep: feature-inner artık position:relative; front normal akışta, back
   absolute. Bu sayede checklist modunda kart yalnızca front yüksekliği kadar
   yer kaplar (eskiden grid stack max(front,back) kullanılıyordu, back çok daha
   uzun olduğu için ön yüz boş alan bırakıyordu). Flip sırasında inner'a
   explicit pixel yüksekliği veririz; CSS transition height için tanımlı
   olduğundan rotate ile aynı süre boyunca büyür/küçülür. Flip-back tamamlanınca
   explicit height kaldırılır — front normal akışıyla doğal genişlik/yükseklik
   yönetimine geri döner (içerik değişimleri otomatik yansır).

   willFlip:
     - true  → flipped class eklenir, height back'in doğal yüksekliğine animasyon
     - false → flipped class kaldırılır, height front'a animasyon, sonra temizlenir
*/
function flipFeatureCard(feature, willFlip, opts = {}) {
  if (!feature) return;
  const inner = feature.querySelector(".feature-inner");
  const front = feature.querySelector(".feature-front");
  const back  = feature.querySelector(".feature-back");
  if (!inner || !front || !back) {
    feature.classList.toggle("flipped", willFlip);
    return;
  }

  const already = feature.classList.contains("flipped") === willFlip;

  /* aria + aria-pressed senkronizasyonu (her durumda) */
  const syncAria = () => {
    front.setAttribute("aria-hidden", willFlip ? "true" : "false");
    back.setAttribute("aria-hidden",  willFlip ? "false" : "true");
    const btn = feature.querySelector(".feature-flip-btn");
    if (btn) btn.setAttribute("aria-pressed", willFlip ? "true" : "false");
  };

  /* Önceki bir flip transition handler kalmışsa temizle (hızlı çift tıklama
     veya renderdan hemen sonra instant senkronizasyon durumu). */
  if (feature._flipTransitionEnd) {
    inner.removeEventListener("transitionend", feature._flipTransitionEnd);
    feature._flipTransitionEnd = null;
  }

  /* INSTANT mode — render sonrası "review" tercihini sessizce uygulamak için.
     Sadece .flipped class'ını ekler/kaldırır; explicit height vermez. CSS,
     flipped state için back'i position:relative yaparak yüksekliği doğal
     olarak yönetiyor. Bu sayede kart başlangıçta collapsed bir kategori
     içinde (display:none ancestor) bile doğru görünür — JS offsetHeight
     ölçümü yok, ölçüm 0 olduğunda height:0 bug'ı yok. */
  if (opts.instant) {
    /* Eski animasyondan kalma explicit height varsa temizle */
    inner.style.height = "";
    feature.classList.toggle("flipped", willFlip);
    syncAria();
    return;
  }

  /* Animasyonlu yoldayız ve halihazırda hedef state'teysek: tekrar tetiklemeden
     sadece aria senkronizasyonu. */
  if (already) {
    syncAria();
    return;
  }

  /* Kart görünür değilse (collapsed kategori vb.) offsetHeight 0 döner ve
     animasyon yapay olur — sadece class toggle yapıp çık; kart görünür hale
     gelince CSS doğru yüksekliği zaten verir. */
  const startH = inner.offsetHeight;
  if (startH === 0) {
    inner.style.height = "";
    feature.classList.toggle("flipped", willFlip);
    syncAria();
    return;
  }

  const target  = willFlip ? back : front;
  const targetH = target.offsetHeight;

  /* Mevcut yüksekliğe sabitle (auto → px). */
  inner.style.height = startH + "px";
  /* Force reflow — bir sonraki style atamasının transition tetiklemesi için */
  void inner.offsetHeight;

  /* Class toggle ve aria güncellemeleri */
  feature.classList.toggle("flipped", willFlip);
  syncAria();

  /* rAF içinde target height — height transition animasyonu başlatır */
  requestAnimationFrame(() => {
    inner.style.height = targetH + "px";
  });

  /* Transition bitince explicit height'i temizle — her iki yönde de CSS doğal
     akışa dönsün (front'a indikse front relative drives height; back'e gittikse
     back relative drives height). Bu sayede sonradan içerik değişimi (filter,
     dil, vb.) doğal olarak yansır. */
  const onEnd = (e) => {
    if (e.target !== inner) return;
    if (e.propertyName !== "height") return;
    inner.removeEventListener("transitionend", onEnd);
    feature._flipTransitionEnd = null;
    inner.style.height = "";
  };
  feature._flipTransitionEnd = onEnd;
  inner.addEventListener("transitionend", onEnd);
}

/* Dışa eriştirelim (14-app.js / setAllCardsFlipped tarafından kullanılır). */
window.flipFeatureCard = flipFeatureCard;

/* Renderdan sonra çağrılır — kullanıcı welcome akışında "review" seçtiyse veya
   sonradan bu modu tercih ettiyse, tüm kartları sessizce arka yüze çevirir.
   Animasyon yok (yeni renderda zaten DOM bomboş — animasyon yapay olur).
   currentMode === "build" ise hiçbir şey yapmaz; kartlar default front yüzünde
   kalır. */
function applyInitialCardMode() {
  if (typeof currentMode === "undefined") return;
  if (currentMode !== "review") return;
  document.querySelectorAll(".feature").forEach(f => {
    flipFeatureCard(f, true, { instant: true });
  });
}
window.applyInitialCardMode = applyInitialCardMode;

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
    /* Bir kategori daha açıldı; Tümünü Aç / Kapat butonlarının aktif
       vurgusu hâlâ doğru durumda mı kontrol et. */
    if (typeof updateToolbarButtonStates === "function") updateToolbarButtonStates();
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

      /* How-to (back-face) içeriği — ön yüzdeki hedefin nasıl yapılacağını
         anlatan eğitsel metin. Önce burada hesaplanıyor çünkü ön yüzdeki
         level satırının kısmi-ilerleme barı, arka yüzdeki adım sayısına
         bağlı. Resolver ön yüzle aynı; dil × stil × framework × backend
         ekseni aynı şekilde uygulanır. Madde için how-to tanımlı değilse
         düşük-öncelikli bir "rehber yok" mesajı gösterilir. */
      const howtoMvpRaw = (typeof resolveHowto === "function") ? resolveHowto(f, "mvp") : null;
      const howtoRelRaw = (typeof resolveHowto === "function") ? resolveHowto(f, "release") : null;
      const howtoMvpText = howtoMvpRaw ? tx(howtoMvpRaw) : "";
      const howtoRelText = howtoRelRaw ? tx(howtoRelRaw) : "";
      const isPlaceholder = (s) => !s || (typeof s === "string" && s.trim() === "—");
      const showHowtoMvp = !isPlaceholder(howtoMvpText);
      const showHowtoRel = !isPlaceholder(howtoRelText);
      const hasAnyHowto  = showHowtoMvp || showHowtoRel;

      const levels = ["mvp", "release"].map(L => {
        const value = L === "mvp" ? mvpVal : releaseVal;
        if (!value || value === "—") return "";
        const key = `${cat.id}.${f.id}.${L}`;
        const checked = state[key] ? "checked" : "";
        /* Step progress: bu seviye için kaç adım var, kaçı işaretli?
           Eğer hiç adım yoksa ya da hepsi/hiçbiri işaretliyse partial fill +
           badge gösterilmez (full check zaten solid; sıfır da default). */
        const stepText = L === "mvp" ? howtoMvpText : howtoRelText;
        const stepTotal = (typeof countHowtoSteps === "function") ? countHowtoSteps(stepText) : 0;
        const stepDone  = (stepTotal > 0) ? countCheckedStepsByPrefix(key, stepTotal) : 0;
        const showPartial = stepTotal > 0 && stepDone > 0 && stepDone < stepTotal;
        const pct = stepTotal > 0 ? Math.round((stepDone / stepTotal) * 100) : 0;
        const styleAttr = showPartial ? ` style="--step-progress: ${pct}%;"` : "";
        const badgeHtml = showPartial
          ? `<span class="level-progress-badge" aria-label="${stepDone} / ${stepTotal}">${pct}%</span>`
          : "";
        return `
          <div class="level ${L} ${checked}" data-key="${key}"${styleAttr}>
            <span class="check"></span>
            <span class="level-tag">${levelLabel(L)}</span>
            <span class="level-text">${value}</span>
            ${badgeHtml}
          </div>`;
      }).join("");

      const noteId = `${cat.id}.${f.id}`;
      const noteValue = notes[noteId] || "";
      const hasNote = noteValue.trim().length > 0;
      const noteLabel = hasNote ? t("note.mine") : t("note.add");

      const featAnchor = `feat-${cat.id}-${f.id.replace(/\./g, "-")}`;

      /* Howto'yu tek bir grid container'da iki satır olarak ver: ilk kolon
         label (MVP / Release), ikinci kolon adımlar. grid-template-columns
         "auto 1fr" olduğundan tüm label'lar en geniş etikete göre hizalanır;
         "Release" daha geniş olsa bile "MVP" satırının metni aynı konumdan
         başlar. */
      const mvpStepKeyPrefix = `${cat.id}.${f.id}.mvp`;
      const releaseStepKeyPrefix = `${cat.id}.${f.id}.release`;
      const howtoGridRows = [];
      if (showHowtoMvp) {
        howtoGridRows.push(
          `<span class="howto-tag mvp">${levelLabel("mvp")}</span>` +
          `<div class="howto-text">${formatHowtoSteps(howtoMvpText, mvpStepKeyPrefix)}</div>`
        );
      }
      if (showHowtoRel) {
        howtoGridRows.push(
          `<span class="howto-tag release">${levelLabel("release")}</span>` +
          `<div class="howto-text">${formatHowtoSteps(howtoRelText, releaseStepKeyPrefix)}</div>`
        );
      }
      const howtoBody = hasAnyHowto
        ? `<div class="howto-grid">${howtoGridRows.join("")}</div>`
        : `<p class="howto-empty" data-i18n="howto.empty">${t("howto.empty")}</p>`;

      return `
        <article class="feature${hasNote ? " has-note" : ""}" id="${featAnchor}" data-search="${(fTitle + " " + fDesc + " " + (mvpVal||"") + " " + (releaseVal||"")).toLowerCase().replace(/<[^>]+>/g, "")}" data-note-id="${noteId}">
          <button type="button" class="feature-flip-btn" data-flip-toggle title="${t("howto.flipTitle")}" aria-label="${t("howto.flipAria")}" aria-pressed="false">
            <span class="flip-icon flip-face-front" aria-hidden="true">❔</span>
            <span class="flip-icon flip-face-back" aria-hidden="true">←</span>
            <span class="flip-label flip-face-front">${t("howto.button")}</span>
            <span class="flip-label flip-face-back">${t("howto.back")}</span>
          </button>
          <div class="feature-inner">
            <div class="feature-front">
              <div class="feature-head">
                <span class="id">#${f.id}</span>
                <h3>${fTitle}</h3>
              </div>
              <p class="feature-desc">${fDesc}</p>
              <div class="levels">${levels}</div>
            </div>
            <div class="feature-back" aria-hidden="true">
              <div class="feature-head">
                <span class="id">#${f.id}</span>
                <h3>${fTitle}</h3>
              </div>
              <div class="howto-body">${howtoBody}</div>
            </div>
          </div>
          <div class="feature-actions">
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
          </div>
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

/* Ön yüzdeki .level satırının "kısmi ilerleme" görsel state'ini günceller:
   --step-progress CSS değişkeni (gradient fill için) + .level-progress-badge
   yüzde rozeti. Çağrı: step toggle, level toggle veya setAllStepsChecked
   sonrası. Adım yoksa veya tüm/hiç adım işaretliyse partial fill kaldırılır
   (full check zaten solid bg verir). */
function updateLevelProgressUI(levelKey) {
  const safe = (typeof CSS !== "undefined" && CSS.escape) ? CSS.escape(levelKey) : levelKey;
  const levelEl = document.querySelector(`.level[data-key="${safe}"]`);
  if (!levelEl) return;
  const steps = document.querySelectorAll(`.howto-step[data-step-key^="${safe}.s"]`);
  const total = steps.length;
  let badge = levelEl.querySelector(".level-progress-badge");

  if (total === 0) {
    /* Adım yok: progress yok */
    levelEl.style.removeProperty("--step-progress");
    if (badge) badge.remove();
    return;
  }

  const done = Array.from(steps).filter(li => state[li.dataset.stepKey]).length;
  const isPartial = done > 0 && done < total;

  if (isPartial) {
    const pct = Math.round((done / total) * 100);
    levelEl.style.setProperty("--step-progress", `${pct}%`);
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "level-progress-badge";
      levelEl.appendChild(badge);
    }
    badge.textContent = `${pct}%`;
    badge.setAttribute("aria-label", `${done} / ${total}`);
  } else {
    /* 0 veya 100 → partial fill ve badge gizle */
    levelEl.style.removeProperty("--step-progress");
    if (badge) badge.remove();
  }
}

/* Verilen seviye anahtarına (örn. "1.1.mvp") ait tüm Nasıl-Yapılır adımlarını
   topluca işaretle/temizle. DOM hem ön (.level) hem arka (.howto-step) yüzdeki
   görsel state'leri günceller; state objesi tek kaynak. */
function setAllStepsChecked(levelKey, checked) {
  /* CSS escape: rakamlı/noktalı keyler için attr selector güvenli kalsın */
  const safe = (typeof CSS !== "undefined" && CSS.escape) ? CSS.escape(levelKey) : levelKey;
  const steps = document.querySelectorAll(`.howto-step[data-step-key^="${safe}.s"]`);
  steps.forEach(li => {
    const k = li.dataset.stepKey;
    if (!k) return;
    if (checked) {
      state[k] = true;
      li.classList.add("checked");
      li.setAttribute("aria-checked", "true");
    } else {
      delete state[k];
      li.classList.remove("checked");
      li.setAttribute("aria-checked", "false");
    }
  });
}

/* Bir adım toggle edildiğinde: o seviyedeki TÜM adımlar işaretliyse ön yüzdeki
   .level otomatik tikli olsun; bir tane bile boşsa otomatik temizlensin. Sync
   sadece adımlar varken çalışır (renderda en az 1 adım üretildiyse). */
function syncLevelFromSteps(levelKey) {
  const safe = (typeof CSS !== "undefined" && CSS.escape) ? CSS.escape(levelKey) : levelKey;
  const steps = document.querySelectorAll(`.howto-step[data-step-key^="${safe}.s"]`);
  if (steps.length === 0) return;
  const allChecked = Array.from(steps).every(li => state[li.dataset.stepKey]);
  const levelEl = document.querySelector(`.level[data-key="${safe}"]`);
  if (allChecked) {
    if (!state[levelKey]) {
      state[levelKey] = true;
      if (levelEl) levelEl.classList.add("checked");
    }
  } else {
    if (state[levelKey]) {
      delete state[levelKey];
      if (levelEl) levelEl.classList.remove("checked");
    }
  }
}

function attachClickHandlers() {
  /* Seviye işaretleme: ön yüzdeki MVP / Release tıklaması.
     Ek olarak arka yüzdeki tüm adımları senkronize eder — kullanıcı "MVP'yi
     bitti say" deyince How-To rehberindeki adımlar da bitmiş kabul edilir.
     Tersi (adımları işaretleyerek seviyenin otomatik tiklenmesi) syncLevel-
     FromSteps tarafından yapılır. */
  document.querySelectorAll(".level").forEach(el => {
    el.addEventListener("click", () => {
      if (lockState) return; /* Kilit aktif: değişiklik yok */
      const key = el.dataset.key;
      const willCheck = !state[key];
      if (willCheck) { state[key] = true; el.classList.add("checked"); }
      else { delete state[key]; el.classList.remove("checked"); }
      /* Arka yüz adımlarını seviyeyle senkronize tut */
      setAllStepsChecked(key, willCheck);
      /* Partial fill / badge'i sıfırla: artık ya full ya da boş */
      updateLevelProgressUI(key);
      saveState();
      updateProgress();
      if (viewFilter !== "all" || viewMode !== "both") applyFilters();
    });
  });

  /* Nasıl-Yapılır adımları: her bir <li> tıklanabilir checkbox. Toggle eder,
     state'e kaydeder, varsa seviyeyi senkronize eder. Klavye için Enter/Space
     de tetikleyici. */
  document.querySelectorAll(".howto-step[data-step-key]").forEach(li => {
    const toggle = () => {
      if (lockState) return;
      const key = li.dataset.stepKey;
      if (!key) return;
      const willCheck = !state[key];
      if (willCheck) {
        state[key] = true;
        li.classList.add("checked");
        li.setAttribute("aria-checked", "true");
      } else {
        delete state[key];
        li.classList.remove("checked");
        li.setAttribute("aria-checked", "false");
      }
      /* Seviye anahtarı = adım anahtarının son ".sN" parçası atılmış hâli */
      const levelKey = key.replace(/\.s\d+$/, "");
      syncLevelFromSteps(levelKey);
      updateLevelProgressUI(levelKey);
      saveState();
      updateProgress();
      if (viewFilter !== "all" || viewMode !== "both") applyFilters();
    };
    li.addEventListener("click", toggle);
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });

  /* Kategori başlığı tıklayınca collapse / expand */
  document.querySelectorAll(".cat-header").forEach(h => {
    h.addEventListener("click", () => {
      const catId = h.dataset.catToggle;
      if (!catId) return;
      const cat = document.getElementById(catId);
      if (!cat) return;
      const isCollapsed = cat.classList.toggle("collapsed");
      if (isCollapsed) collapsedCats.add(catId);
      else collapsedCats.delete(catId);
      saveCollapsed();
      /* Tek kategori değişti, artık "tümü açık" / "tümü kapalı" durumu
         koruyor mu yoksa karışığa mı düştü? Toolbar pair'ini senkronla. */
      if (typeof updateToolbarButtonStates === "function") updateToolbarButtonStates();
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

  /* How-to flip butonu — kartı 3D olarak çevirir. Per-item bağımsız; bir kartı
     çevirmek başka kartı etkilemez. Salt görsel bir geçiş; herhangi bir state
     mutate etmez (özellikle: checkbox / ilerleme / not yazılmaz). Yükseklik
     animasyonu ve aria/aria-pressed senkronizasyonu flipFeatureCard içinde. */
  document.querySelectorAll("[data-flip-toggle]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const feature = btn.closest(".feature");
      if (!feature) return;
      const willFlip = !feature.classList.contains("flipped");
      flipFeatureCard(feature, willFlip);
      /* Tek kart çevrildi: artık DOM'daki .flipped sayısı toplamla eşit
         veya sıfır olabilir veya karışık. Toolbar pair'inin .active
         vurgusunu yeniden hesaplat. */
      if (typeof updateToolbarButtonStates === "function") updateToolbarButtonStates();
    });
  });

  /* Notu temizle butonu */
  document.querySelectorAll("[data-note-clear]").forEach(btn => {
    btn.addEventListener("click", () => {
      const feature = btn.closest(".feature");
      const ta = feature.querySelector("textarea");
      if (ta) {
        ta.value = "";
        ta.dispatchEvent(new Event("input"));
      }
    });
  });

  /* Renderdan sonra: kullanıcının "İnceleme" (review) modu tercihi varsa tüm
     kartları sessizce arka yüze çevir. Bu attachClickHandlers her renderdan
     hemen sonra çağrıldığı için, tüm yeniden-render'larda (dil/style/framework/
     backend/filter değişimi vb.) tercih otomatik yeniden uygulanır. */
  if (typeof applyInitialCardMode === "function") {
    applyInitialCardMode();
  }
}


