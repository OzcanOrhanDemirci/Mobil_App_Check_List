function countLevels() {
  /* The top progress bars (Total / MVP / Release) use atomic, level-based
     counting: each MVP or Release level counts as one "task". The per-category
     percentage shown in the section header is GRANULAR: each level contributes
     as many sub-units as it has How-To steps. That lets the percentage move
     in 1-2-3-4-5% increments (e.g. 3 of 6 steps ticked makes the level 50%
     done instead of 0/1). Levels with no steps still count as a single unit
     for backward compatibility. */
  let total = 0, totalChecked = 0;
  let mvp = 0, mvpChecked = 0;
  let release = 0, releaseChecked = 0;
  /* perCat: step-granular counts that feed the category-header %/X-Y display. */
  const perCat = {};

  DATA.forEach(cat => {
    perCat[cat.id] = {
      total: 0, checked: 0,
      /* Track MVP and Release totals separately (still step-granular) so we
         can detect MVP-only or Release-only completion states. */
      mvpTotal: 0, mvpChecked: 0,
      releaseTotal: 0, releaseChecked: 0,
    };
    cat.features.forEach(f => {
      /* Skip features hidden by the current selection so progress percentages
         only reflect items the user can actually see. Applies to features
         awaiting a framework choice and to backend-gated items. */
      if (f.variants && !currentFramework) return;
      if (typeof isHiddenByBackend === "function" && isHiddenByBackend(f)) return;
      ["mvp", "release"].forEach(L => {
        const v = resolveLevelText(f, L);
        if (!v || v === "—") return;

        /* Top-bar counts: atomic, one unit per level (existing behavior). */
        total++;
        const key = `${cat.id}.${f.id}.${L}`;
        const isChecked = !!state[key];
        if (isChecked) totalChecked++;
        if (L === "mvp") { mvp++; if (isChecked) mvpChecked++; }
        if (L === "release") { release++; if (isChecked) releaseChecked++; }

        /* Category counts: granular, step-based.
           If the level has a How-To text, contribute one unit per numbered
           step and count each ticked step as a completed unit. Levels with
           no steps contribute exactly one unit. */
        const howtoRaw = (typeof resolveHowto === "function") ? resolveHowto(f, L) : null;
        const howtoText = howtoRaw ? tx(howtoRaw) : "";
        const stepCount = (typeof countHowtoSteps === "function") ? countHowtoSteps(howtoText) : 0;

        let unitsTotal, unitsChecked;
        if (stepCount > 0) {
          unitsTotal = stepCount;
          /* If the whole level is ticked, treat all steps as done; legacy
             state may not include per-step keys, so this preserves backward
             compatibility. */
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

    /* Completion variants:
       - completed         : every level type present in the category is done
                             (green bg + blue text + checkmark badge)
       - completed-mvp     : all MVPs are done but Release is still in progress
                             (green bg + green text, no check)
       - completed-release : all Releases are done but MVP is still in progress
                             (blue bg + blue text, no check)
       - none              : neither side is fully complete */
    const mvpAllDone = v.mvpTotal > 0 && v.mvpChecked >= v.mvpTotal;
    const releaseAllDone = v.releaseTotal > 0 && v.releaseChecked >= v.releaseTotal;
    const mvpExists = v.mvpTotal > 0;
    const releaseExists = v.releaseTotal > 0;
    /* Is every level type that exists in this category complete? If only one
       type is present, finishing it is enough; if both exist, both must be done. */
    const allDone =
      (mvpExists || releaseExists) &&
      (!mvpExists || mvpAllDone) &&
      (!releaseExists || releaseAllDone);

    let completionState = "none";
    if (allDone) completionState = "completed";
    else if (mvpAllDone && releaseExists && !releaseAllDone) completionState = "completed-mvp";
    else if (releaseAllDone && mvpExists && !mvpAllDone) completionState = "completed-release";

    if (numEl) {
      /* Fully complete categories show "Completed" instead of X / Y; partial
         states keep the numeric form so the user can still see how much is left. */
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
  /* Check counts have changed, so refresh the disabled state of filter buttons. */
  if (typeof updateToolbarButtonStates === "function") updateToolbarButtonStates();
}

/* ==================== COMPLETION CELEBRATIONS ====================
   The celebrations flag (mvp/release/total) is per-project, so each project
   triggers its own completion celebration independently. */
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
  /* Close any other open modal so the celebration appears on top. */
  document.querySelectorAll(".modal").forEach(m => { if (m.id !== "celebrationModal") m.hidden = true; });
  openModal("celebrationModal");
}

function checkCelebrations(c) {
  const totalDone  = c.total   > 0 && c.totalChecked   === c.total;
  const mvpDone    = c.mvp     > 0 && c.mvpChecked     === c.mvp;
  const releaseDone= c.release > 0 && c.releaseChecked === c.release;

  /* Celebrate starting from the highest tier so that if several land at once,
     only the top-level celebration is shown. */
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

  /* Reset the flag if the user un-ticks an item, so finishing again later
     re-triggers the celebration. */
  if (!totalDone && celebrations.total) { celebrations.total = false; saveCelebrations(); }
  if (!releaseDone && celebrations.release) { celebrations.release = false; saveCelebrations(); }
  if (!mvpDone && celebrations.mvp) { celebrations.mvp = false; saveCelebrations(); }
}

