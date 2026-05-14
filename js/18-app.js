/* Open All */
document.getElementById("expandAllBtn").addEventListener("click", () => {
  document.querySelectorAll(".category").forEach(c => {
    c.classList.remove("collapsed");
    collapsedCats.delete(c.id);
  });
  saveCollapsed();
  /* The user deliberately touched the collapse pair; exit the dim first-open
     state. Highlighting from this point on is driven by matching the DOM. */
  if (typeof markCollapseTouched === "function") markCollapseTouched();
  if (typeof updateToolbarButtonStates === "function") updateToolbarButtonStates();
});

/* Close All */
document.getElementById("collapseAllBtn").addEventListener("click", () => {
  document.querySelectorAll(".category").forEach(c => {
    c.classList.add("collapsed");
    collapsedCats.add(c.id);
  });
  saveCollapsed();
  /* Same reason: set the collapse-touched flag; collapse highlight is now active. */
  if (typeof markCollapseTouched === "function") markCollapseTouched();
  if (typeof updateToolbarButtonStates === "function") updateToolbarButtonStates();
});

/* Flip every feature card to the back face / return them to the front face.
   Produces the same visual effect as the per-item flip button (.feature.flipped
   class); the toolbar entry just provides a single-click bulk flip when there
   are many items. No completion state is touched; only the view mode changes.

   Uses flipFeatureCard so each card runs the same height animation (expand /
   shrink) as the per-item flip. */
function setAllCardsFlipped(flipped) {
  document.querySelectorAll(".feature").forEach(f => {
    if (typeof flipFeatureCard === "function") {
      flipFeatureCard(f, flipped);
    } else {
      /* Fallback: if render.js is not loaded yet, toggling the class is enough. */
      f.classList.toggle("flipped", flipped);
    }
  });
  /* All cards now share the same face; either "All How-To" or "All Checklist"
     should be highlighted orange (derived from the DOM count). */
  if (typeof updateToolbarButtonStates === "function") updateToolbarButtonStates();
}

/* "All How-To" toolbar button: flips every card to the back face AND promotes
   the usage-mode preference to "review", so subsequent renders (after a filter,
   language, or style change) also start cards on the back face. */
const flipAllHowBtn = document.getElementById("flipAllHowBtn");
if (flipAllHowBtn) {
  flipAllHowBtn.addEventListener("click", () => {
    /* Deliberate toolbar click: set the flip-touched flag. The welcome-modal
       mode selection does NOT mark; only direct UI interaction does. */
    if (typeof markFlipTouched === "function") markFlipTouched();
    if (typeof applyMode === "function") applyMode("review");
    setAllCardsFlipped(true);
    showToast(t("flipAll.toastHow"), "info", 1400);
  });
}
/* "All Checklist" toolbar button: flips every card back to the front face AND
   demotes the usage-mode preference to "build"; after a render,
   applyInitialCardMode is a no-op. */
const flipAllChecklistBtn = document.getElementById("flipAllChecklistBtn");
if (flipAllChecklistBtn) {
  flipAllChecklistBtn.addEventListener("click", () => {
    /* Same as above: a deliberate toolbar click sets the flip-touched flag. */
    if (typeof markFlipTouched === "function") markFlipTouched();
    if (typeof applyMode === "function") applyMode("build");
    setAllCardsFlipped(false);
    showToast(t("flipAll.toastChecklist"), "info", 1400);
  });
}

/* ==================== RESET UI: USED IN TWO PLACES ====================
   1) Toolbar Reset button: resetScopeModal (only selections + notes)
   2) Project/Framework modal "Reset" tab: projfw-pane-reset (4 options)
   Both code paths call the same performReset function with a scope object. */

const RESET_INDEPENDENT_SCOPES = ["selections", "notes", "settings"];

/* Wires up a reset-scope UI (a group of checkboxes plus a "Next" button).
   `attr` is a different data-attribute name per UI (prevents DOM collisions).
   `nextBtnId` is the ID of that UI's "Next" button.
   `onBeforeConfirm` is optional and fires just before the confirm opens
   (e.g. to close the host modal). */
function setupResetScopeUi(attr, nextBtnId, onBeforeConfirm) {
  const cbs = document.querySelectorAll(`[${attr}]`);
  const nextBtn = document.getElementById(nextBtnId);
  if (!cbs.length || !nextBtn) return;

  const sysCb = document.querySelector(`[${attr}="system"]`);
  const independents = RESET_INDEPENDENT_SCOPES.map(s => document.querySelector(`[${attr}="${s}"]`)).filter(Boolean);

  /* Reset all options (called whenever the modal/tab is reopened). */
  function resetUi() {
    cbs.forEach(cb => {
      cb.checked = false;
      cb.disabled = false;
    });
    nextBtn.disabled = true;
  }

  /* Checkbox change: manage the system vs. independent-options relationship
     and refresh the "Next" button. */
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

  /* "Next" button: collect the scope, open a confirm, then call performReset. */
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

/* UI #1: Toolbar Reset, hosted by resetScopeModal (selections + notes only). */
const toolbarResetUi = setupResetScopeUi("data-reset-scope", "resetScopeNext", () => closeModal("resetScopeModal"));

/* Toolbar Reset button: clear the UI each time the modal is opened. */
document.getElementById("resetBtn").addEventListener("click", () => {
  if (lockState) return;
  if (toolbarResetUi) toolbarResetUi.resetUi();
  openModal("resetScopeModal");
});

/* UI #2: Project/Framework modal "Reset" tab (4 options, covering all scopes). */
const projfwResetUi = setupResetScopeUi("data-full-reset-scope", "projfwResetNext", () => closeModal("frameworkModal"));

/* Performs the actual reset, dispatching on the scope object
   `{ selections, notes, settings, system }` (each a boolean). */
function performReset(scope) {
  /* "Full System": wipe localStorage completely and reload the page. This
     re-triggers the welcome flow so the user starts from scratch. */
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

  /* Selections: checks plus celebration flags.
     The `state` object stores BOTH front-face level keys (e.g. "1.1-mvp")
     and back-face How-To step keys (e.g. "1.1-mvp.s0"). `state = {}` clears
     both; on the DOM side we still need to clear each face by hand
     (renderContent is intentionally not called here, since the selections-only
     path needs to stay fast). The partial-fill CSS variable (--step-progress)
     and the level-progress-badge are cleared automatically by
     updateLevelProgressUI when it sees an empty `state`. */
  if (scope.selections) {
    state = {};
    saveState();
    celebrations = {};
    saveCelebrations();
    /* Front-face level checks. */
    document.querySelectorAll(".level.checked").forEach(el => el.classList.remove("checked"));
    /* Back-face How-To steps. */
    document.querySelectorAll(".howto-step.checked").forEach(li => {
      li.classList.remove("checked");
      li.setAttribute("aria-checked", "false");
    });
    /* Recompute each level's partial-fill percentage and progress badge
       (with an empty `state` both are visually removed). */
    if (typeof updateLevelProgressUI === "function") {
      document.querySelectorAll(".level[data-key]").forEach(el => {
        updateLevelProgressUI(el.dataset.key);
      });
    }
  }

  /* Notes: clear every note. */
  if (scope.notes) {
    notes = {};
    saveNotes();
    /* Clear any open note textareas, drop the has-note class, blank the
       presentation-note display text. */
    document.querySelectorAll("[data-note-input]").forEach(ta => {
      ta.value = "";
    });
    document.querySelectorAll(".feature.has-note").forEach(f => f.classList.remove("has-note"));
    document.querySelectorAll(".note-display-text").forEach(el => {
      el.textContent = "";
    });
    /* Refresh the icon/label of each note toggle button (back to "+ Add note"). */
    document.querySelectorAll("[data-note-toggle]").forEach(btn => {
      const icon = btn.querySelector(".note-icon");
      const label = btn.querySelector(".note-label");
      if (icon) icon.textContent = "+";
      if (label) label.textContent = t("note.add");
    });
  }

  /* Settings: category collapse state, theme, explanation style, view, lock.
     Also clears the "did the user pick this?" flags for the toolbar pairs,
     so collapse and flip highlights drop back to the dim first-open state
     once the user returns to defaults. */
  if (scope.settings) {
    collapsedCats = new Set(DATA.map(c => `cat-${c.id}`));
    saveCollapsed();
    applyTheme("dark");
    if (typeof applyStyle === "function") applyStyle("technical");
    saveViewMode("both");
    saveViewFilter("all");
    saveLockState(false);
    if (typeof clearCollapseFlipTouchFlags === "function") clearCollapseFlipTouchFlags();
  }

  /* Refresh the UI. */
  if (scope.selections || scope.notes || scope.settings) {
    if (scope.settings) {
      /* renderContent applies collapsedCats (all categories closed). The
         selections/notes branches already read the updated state and render
         correctly. */
      renderContent();
      attachClickHandlers();
    }
    applyView(); // body classes, hero pills, filter
    applyLock(); // lock UI
    updateProgress(); // progress bar + toolbar button states
    applyFilters(); // feature/category visibility
  }

  /* Toast. */
  if (scope.selections || scope.notes || scope.settings) {
    showToast(t("reset.toast.done"), "info", 1500);
  }
}

/* ==================== LOCK ==================== */
document.getElementById("lockBtn").addEventListener("click", () => {
  if (!lockState) {
    /* Locking flow: rich confirm UI. */
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
    /* Unlocking flow: a simpler confirm. */
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

/* Mobile actions menu (open/close).
   On mobile the sticky toolbar is compact: search + 3 mini progress bars are
   visible while the rest of the buttons hide behind the hamburger (≡). This
   block handles open/close, click-outside dismiss, and auto-close after an
   action runs. */
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

  /* Clicking anywhere outside the toolbar closes the panel. */
  document.addEventListener("click", e => {
    if (!toolbarEl.classList.contains("actions-open")) return;
    if (toolbarEl.contains(e.target)) return;
    close();
  });

  /* Filter toggle buttons (MVP/Release Pending/Done) are pure visual toggles,
     so keep the panel open for them. Other actions generally open a modal or
     run an operation; close the panel after clicking so the user can see the
     screen on mobile. */
  const KEEP_OPEN_IDS = new Set(["filterMvpPending", "filterMvpDone", "filterReleasePending", "filterReleaseDone"]);
  toolbarEl.querySelectorAll(".actions .btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (KEEP_OPEN_IDS.has(btn.id)) return;
      close();
    });
  });

  /* Also close on Esc (separate listener so the existing keydown handler is
     left untouched). */
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (!toolbarEl.classList.contains("actions-open")) return;
    /* If a modal is open, let its Esc handler run first. */
    const openModalEl = [...document.querySelectorAll(".modal")].find(m => !m.hidden);
    if (openModalEl) return;
    close();
  });
})();

/* Generic long-press easter-egg setup.
   A short click does nothing; holding for ~3 seconds opens the given URL in a
   new tab. Mouse and touch are both supported; if the finger drifts more than
   14px the press is cancelled (so accidentally trying to scroll the page does
   not fire the egg). The native context menu is suppressed on mobile. */
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

  /* Mouse. */
  el.addEventListener("mousedown", e => {
    if (e.button !== 0) return;
    start();
  });
  el.addEventListener("mouseup", cancel);
  el.addEventListener("mouseleave", cancel);

  /* Touch. */
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

  /* Suppress the mobile long-press context menu. */
  el.addEventListener("contextmenu", e => e.preventDefault());
}

/* Hero instructor badge: opens LinkedIn. Footer version stamp: opens GitHub.
   `toastMsg` can be passed as a function so each press resolves the text via
   t() against the current language (the egg setup itself accepts either a
   string or a function, then invokes the function each time the egg fires). */
setupLongPressEasterEgg(document.querySelector(".instructor"), "https://www.linkedin.com/in/ozcan-orhan-demirci/", () =>
  t("easter.linkedin")
);
setupLongPressEasterEgg(document.getElementById("footVersion"), "https://github.com/OzcanOrhanDemirci", () =>
  t("easter.github")
);

/* ==================== HELP ACCORDION ====================
   The Help modal's HELP_HTML is re-rendered every time the language changes;
   after each render, every section is given the `.help-section.collapsed`
   class and its h3 gets a chevron, which produces the accordion behavior.
   The click handler plus the "Expand/Collapse All" buttons are wired up once
   below. */
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

/* Collapse every section (called on each modal open for a clean start). */
function collapseAllHelpSections() {
  document.querySelectorAll("#helpModalBody > section.help-section").forEach(s => s.classList.add("collapsed"));
}

/* h3 click toggles its section. The helpModalBody parent is permanent, so the
   delegated handler keeps working even when innerHTML is replaced. */
document.getElementById("helpModalBody")?.addEventListener("click", e => {
  const h3 = e.target.closest("#helpModalBody > section.help-section > h3");
  if (!h3) return;
  h3.parentElement.classList.toggle("collapsed");
});

/* "Expand All": remove the collapsed class from every section. */
document.getElementById("helpExpandAll")?.addEventListener("click", () => {
  document.querySelectorAll("#helpModalBody > section.help-section").forEach(s => s.classList.remove("collapsed"));
});

/* "Collapse All": add the collapsed class to every section. */
document.getElementById("helpCollapseAll")?.addEventListener("click", () => {
  collapseAllHelpSections();
});

/* Help button (toolbar): does NOT show the in-modal language switcher
   (language has already been chosen, and the global TR/EN button sits in the
   top right). Sections start collapsed every time the modal opens, so the user
   always sees a clean TOC. */
document.getElementById("helpBtn").addEventListener("click", () => {
  if (typeof setHelpLangSwitchVisible === "function") setHelpLangSwitchVisible(false);
  /* If a previous open used the in-modal switcher to change languages, snap
     the help content back to the global language now. */
  if (typeof applyHelpDisplayLang === "function") applyHelpDisplayLang(currentLang);
  collapseAllHelpSections();
  openModal("helpModal");
});

/* Print: now opens a modal first; the user chooses whether to PDF the
   checklist or the How-To guide. window.print() fires after the choice. A
   temporary body class (print-howto) is added so CSS can switch into the
   correct print mode, then removed once printing is done. */
document.getElementById("printBtn").addEventListener("click", () => {
  openModal("printOptionsModal");
});

/* Print-mode option buttons inside the modal. */
document.querySelectorAll("[data-print-mode]").forEach(btn => {
  btn.addEventListener("click", () => {
    const mode = btn.dataset.printMode;
    closeModal("printOptionsModal");
    /* Trigger printing after the modal's close animation / DOM update;
       running it in the same tick causes some browsers to leave the modal
       stuck in the print preview. */
    if (mode === "howto") {
      document.body.classList.add("print-howto");
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
        /* Clear the class once the print dialog closes. The afterprint event
           is not reliable in every browser, so back it up with a setTimeout. */
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

/* Export: state and notes together. */
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

/* Import: accepts the new format (state + notes) and the legacy format (state only). */
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
      showToast(t("misc.invalidFile"), "warn", 3200);
    }
  };
  reader.readAsText(file);
  importFile.value = "";
});

/* ==================== KEYBOARD SHORTCUTS ==================== */
document.addEventListener("keydown", e => {
  const inPres = document.body.classList.contains("presentation-mode");
  const inField = e.target.matches("input, textarea");

  /* Esc, in priority order: open modal first, then open AI panel, then presentation. */
  if (e.key === "Escape") {
    const openModalEl = [...document.querySelectorAll(".modal")].find(m => !m.hidden);
    if (openModalEl) {
      /* The welcome modal cannot be dismissed with Esc; the user must press OK
         deliberately. */
      if (openModalEl.id === "welcomeModal") return;
      e.preventDefault();
      openModalEl.hidden = true;
      /* If the Help modal was closed via Esc, reset its in-modal language switcher. */
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
   Under http(s) the static <link rel="manifest" href="manifest.webmanifest">
   reference is used. Under file:// (offline single-file open) the
   manifest.webmanifest cannot be loaded, so we generate a blob-URL manifest
   on the fly and replace the static link with it. That keeps the offline
   single-HTML download working as a PWA. */
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
    /* Swallow silently. */
  }
})();

/* ==================== SERVICE WORKER ====================
   Registration uses a real sw.js file. Chromium-based browsers (Chrome, Edge)
   REQUIRE a same-origin script for the PWA install prompt; SW registrations
   from a blob: URL do not satisfy the install criteria.
   If ./sw.js cannot be loaded (file:// or 404) a blob-URL fallback SW is
   registered instead. If Chromium still rejects it, we fail silently. */
(function setupServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (!window.isSecureContext) return;
  if (location.protocol !== "https:" && location.protocol !== "http:") return;

  navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(() => {
    /* sw.js is missing (e.g. single-file offline use): fall back to a blob SW. */
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
        /* Chromium rejects a blob-URL SW; swallow silently. */
      });
    } catch {
      /* Swallow silently. */
    }
  });
})();

/* ==================== HERO LEVEL/STATUS FILTER (3x3 = 9 combinations) ==================== */
/* Three pills (MVP / Release / MVP+Release) and a 3-option dropdown under each
   (All / Pending / Done). Clicking a pill opens its dropdown; clicking a menu
   item calls setView, which assigns both viewMode and viewFilter. */

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

/* Click outside the group closes the menu. */
document.addEventListener("click", e => {
  if (!e.target.closest(".lv-group")) closeAllLvMenus();
});

/* Esc closes the menu. Registered in the capture phase so it runs before the
   main Esc handler (which would otherwise try to close a modal first). */
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

/* Apply the current view on first load. */
applyView();

/* Hero explanation-style pill (in the top controls): clicking re-renders all
   item text in the new style (Simple / Technical) and shows a brief toast to
   confirm the switch. */
const styleToggleBtn = document.getElementById("styleToggle");
if (styleToggleBtn) {
  styleToggleBtn.addEventListener("click", () => {
    if (typeof toggleStyle === "function") toggleStyle();
  });
}

/* ==================== INIT ==================== */
/* Translate every i18n-tagged element using the language stored in the DOM. */
applyI18nToDom();

/* Apply the explanation style to the DOM (button label + data-explanation-style attr). */
if (typeof applyStyle === "function") applyStyle(currentStyle);

/* Apply the usage-mode preference to the DOM (data-card-mode attr).
   Actual card flipping happens later inside attachClickHandlers, via
   applyInitialCardMode; here we only mirror the preference into the HTML. */
if (typeof applyMode === "function") applyMode(currentMode);

applyTheme(localStorage.getItem(THEME_KEY) || "dark");
initDefaultCollapsed();
renderCategoryNav();
renderContent();
attachClickHandlers();
attachSearch();

/* On first load updateProgress must not trigger a celebration (the c.total === 0
   guard already prevents it, but we call it deliberately here as a safe op). */
updateProgress();

/* Load the lock state from localStorage and apply it (button label, body class,
   disabled targets). */
applyLock();

showWelcomeIfFirstVisit();
