function countLevels() {
  let total = 0, totalChecked = 0;
  let mvp = 0, mvpChecked = 0;
  let release = 0, releaseChecked = 0;
  const perCat = {};

  DATA.forEach(cat => {
    perCat[cat.id] = { total: 0, checked: 0 };
    cat.features.forEach(f => {
      ["mvp", "release"].forEach(L => {
        const v = resolveLevelText(f, L);
        if (!v || v === "—") return;
        total++;
        perCat[cat.id].total++;
        const key = `${cat.id}.${f.id}.${L}`;
        const isChecked = !!state[key];
        if (isChecked) {
          totalChecked++;
          perCat[cat.id].checked++;
        }
        if (L === "mvp") { mvp++; if (isChecked) mvpChecked++; }
        if (L === "release") { release++; if (isChecked) releaseChecked++; }
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
    if (numEl) numEl.textContent = `${v.checked} / ${v.total}`;
  });

  checkCelebrations(c);
  /* İşaret sayıları değiştiği için filter butonlarının disabled state'ini de güncelle */
  if (typeof updateToolbarButtonStates === "function") updateToolbarButtonStates();
}

/* ==================== TAMAMLAMA KUTLAMALARI ====================
   celebrations bayrağı (mvp/release/total) aktif projeye bağlıdır; her proje
   kendi tamamlama kutlamasını ayrıca tetikler. */
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

