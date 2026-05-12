function countLevels() {
  /* Üst satırdaki ana ilerleme barları (Toplam / MVP / Release) seviye-tabanlı
     atomik sayım üzerinden çalışır — her MVP/Release seviyesi bir "task" olarak.
     Kategori başlığındaki yüzde ise GRANÜLER: her seviyenin Nasıl-Yapılır adım
     sayısı kadar alt-birim üretir. Böylece "%1-2-3-4-5" hassasiyetinde
     değişimler olur (örn. 6 adımdan 3'ü tikliyse o seviye %50 done, 0/1 değil).
     Adım içermeyen seviyeler tek birim olarak sayılır (geriye uyumluluk). */
  let total = 0, totalChecked = 0;
  let mvp = 0, mvpChecked = 0;
  let release = 0, releaseChecked = 0;
  /* perCat: kategori başlığındaki %/X-Y için step-granüler sayım */
  const perCat = {};

  DATA.forEach(cat => {
    perCat[cat.id] = {
      total: 0, checked: 0,
      /* Kategorinin sadece-MVP veya sadece-Release tamamlanma durumunu
         tespit edebilmek için iki tip ayrı sayılır (yine step-granüler). */
      mvpTotal: 0, mvpChecked: 0,
      releaseTotal: 0, releaseChecked: 0,
    };
    cat.features.forEach(f => {
      /* Backend "noBackend" iken backend'e bağlı maddeler ilerleme barlarına
         da girmesin — kullanıcı görünmeyen maddelere göre hesaplanan bir oran
         görmemeli. Aynı kural framework'ü seçilmemiş projeler için de geçerli. */
      if (f.variants && !currentFramework) return;
      if (typeof isHiddenByBackend === "function" && isHiddenByBackend(f)) return;
      ["mvp", "release"].forEach(L => {
        const v = resolveLevelText(f, L);
        if (!v || v === "—") return;

        /* Üst satır sayıları: seviye-bazlı (atomik, mevcut davranış). */
        total++;
        const key = `${cat.id}.${f.id}.${L}`;
        const isChecked = !!state[key];
        if (isChecked) totalChecked++;
        if (L === "mvp") { mvp++; if (isChecked) mvpChecked++; }
        if (L === "release") { release++; if (isChecked) releaseChecked++; }

        /* Kategori sayımı: step-bazlı (granüler).
           Nasıl-Yapılır metni varsa içindeki numaralandırılmış adımların
           sayısı kadar birim üretiriz; her tikli adım birim olarak sayılır.
           Adımlar yoksa seviye kendisi 1 birim. */
        const howtoRaw = (typeof resolveHowto === "function") ? resolveHowto(f, L) : null;
        const howtoText = howtoRaw ? tx(howtoRaw) : "";
        const stepCount = (typeof countHowtoSteps === "function") ? countHowtoSteps(howtoText) : 0;

        let unitsTotal, unitsChecked;
        if (stepCount > 0) {
          unitsTotal = stepCount;
          /* Seviye doğrudan tikliyse tüm adımlar yapılmış kabul edilir (eski
             state'de adım keyleri olmayabilir; geriye uyumluluk). */
          unitsChecked = isChecked
            ? stepCount
            : ((typeof countCheckedStepsByPrefix === "function")
                ? countCheckedStepsByPrefix(key, stepCount) : 0);
        } else {
          unitsTotal = 1;
          unitsChecked = isChecked ? 1 : 0;
        }
        perCat[cat.id].total += unitsTotal;
        perCat[cat.id].checked += unitsChecked;
        if (L === "mvp") {
          perCat[cat.id].mvpTotal += unitsTotal;
          perCat[cat.id].mvpChecked += unitsChecked;
        } else {
          perCat[cat.id].releaseTotal += unitsTotal;
          perCat[cat.id].releaseChecked += unitsChecked;
        }
      });
    });
  });

  return { total, totalChecked, mvp, mvpChecked, release, releaseChecked, perCat };
}

function updateProgress() {
  const c = countLevels();
  const setBar = (id, num, denom) => {
    const pct = denom === 0 ? 0 : (num / denom * 100);
    document.getElementById(id).style.width = pct + "%";
  };

  document.getElementById("total-num").textContent = `${c.totalChecked} / ${c.total}`;
  document.getElementById("mvp-num").textContent = `${c.mvpChecked} / ${c.mvp}`;
  document.getElementById("release-num").textContent = `${c.releaseChecked} / ${c.release}`;

  setBar("total-bar", c.totalChecked, c.total);
  setBar("mvp-bar", c.mvpChecked, c.mvp);
  setBar("release-bar", c.releaseChecked, c.release);

  Object.entries(c.perCat).forEach(([id, v]) => {
    const pct = v.total === 0 ? 0 : Math.round(v.checked / v.total * 100);
    const pctEl = document.querySelector(`[data-cat-pct="${id}"]`);
    const numEl = document.querySelector(`[data-cat-num="${id}"]`);
    if (pctEl) pctEl.textContent = pct + "%";

    /* Tamamlanma varyasyonları:
       - completed         : kategoride var olan tüm seviye tiplerinin hepsi bitti
                             (yeşil bg + mavi metin + ✓ rozet)
       - completed-mvp     : sadece MVP'lerin hepsi bitti, Release devam
                             (yeşil bg + yeşil metin, tik yok)
       - completed-release : sadece Release'lerin hepsi bitti, MVP devam
                             (mavi bg + mavi metin, tik yok)
       - none              : hiçbiri tam değil */
    const mvpAllDone = v.mvpTotal > 0 && v.mvpChecked >= v.mvpTotal;
    const releaseAllDone = v.releaseTotal > 0 && v.releaseChecked >= v.releaseTotal;
    const mvpExists = v.mvpTotal > 0;
    const releaseExists = v.releaseTotal > 0;
    /* Tüm var olan tipler bitti mi? Tek tip varsa o yeterli; iki tip de varsa
       ikisi de bitmeli. */
    const allDone =
      (mvpExists || releaseExists) &&
      (!mvpExists || mvpAllDone) &&
      (!releaseExists || releaseAllDone);

    let completionState = "none";
    if (allDone) completionState = "completed";
    else if (mvpAllDone && releaseExists && !releaseAllDone) completionState = "completed-mvp";
    else if (releaseAllDone && mvpExists && !mvpAllDone) completionState = "completed-release";

    if (numEl) {
      /* Tam tamamlanmışsa X / Y yerine "Tamamlandı"; kısmi durumlarda numerik
         kalır (kullanıcı "ne kadar kaldı" hala görebilsin). */
      numEl.textContent = (completionState === "completed")
        ? t("cat.completed")
        : `${v.checked} / ${v.total}`;
    }

    const section = document.getElementById(`cat-${id}`);
    if (section) {
      section.classList.remove("completed", "completed-mvp", "completed-release");
      if (completionState !== "none") section.classList.add(completionState);
    }
  });

  checkCelebrations(c);
  /* İşaret sayıları değiştiği için filter butonlarının disabled state'ini de güncelle */
  if (typeof updateToolbarButtonStates === "function") updateToolbarButtonStates();
}

/* ==================== TAMAMLAMA KUTLAMALARI ====================
   celebrations bayrağı (mvp/release/total) aktif projeye bağlıdır; her proje
   kendi tamamlama kutlamasını ayrıca tetikler. */
// eslint-disable-next-line prefer-const -- reassigned cross-file in js/04-projects.js#reloadActive and js/14-app.js (reset flows)
let celebrations = loadCelebrations();
function loadCelebrations() {
  const v = getProjectField("celebrations");
  return (v && typeof v === "object") ? v : {};
}
function saveCelebrations() {
  setProjectField("celebrations", celebrations);
}

function showCelebration(emoji, title, message) {
  document.getElementById("celebrationEmoji").textContent = emoji;
  document.getElementById("celebrationTitle").textContent = title;
  document.getElementById("celebrationMessage").textContent = message;
  /* Önceki açık modalı kapat ki üstte gözüksün */
  document.querySelectorAll(".modal").forEach(m => { if (m.id !== "celebrationModal") m.hidden = true; });
  openModal("celebrationModal");
}

function checkCelebrations(c) {
  const totalDone  = c.total   > 0 && c.totalChecked   === c.total;
  const mvpDone    = c.mvp     > 0 && c.mvpChecked     === c.mvp;
  const releaseDone= c.release > 0 && c.releaseChecked === c.release;

  /* En yüksek başarıdan başlayarak kutla, aynı anda çakışırsa sadece en üst seviyeyi göster */
  if (totalDone && !celebrations.total) {
    celebrations.total = true;
    celebrations.mvp = true;
    celebrations.release = true;
    saveCelebrations();
    showCelebration(
      "🏆",
      t("celebration.totalTitle"),
      t("celebration.totalMsg")
    );
  } else if (releaseDone && !celebrations.release) {
    celebrations.release = true;
    saveCelebrations();
    showCelebration(
      "🚀",
      t("celebration.releaseTitle"),
      t("celebration.releaseMsg")
    );
  } else if (mvpDone && !celebrations.mvp) {
    celebrations.mvp = true;
    saveCelebrations();
    showCelebration(
      "🎉",
      t("celebration.mvpTitle"),
      t("celebration.mvpMsg")
    );
  }

  /* Eğer kullanıcı işareti geri alırsa bayrağı sıfırla, ileride tekrar tamamladığında kutlama yine gözüksün */
  if (!totalDone && celebrations.total) { celebrations.total = false; saveCelebrations(); }
  if (!releaseDone && celebrations.release) { celebrations.release = false; saveCelebrations(); }
  if (!mvpDone && celebrations.mvp) { celebrations.mvp = false; saveCelebrations(); }
}

