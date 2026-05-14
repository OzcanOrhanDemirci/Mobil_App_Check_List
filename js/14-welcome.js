/* ==================== WELCOME FLOW ====================
   On first visit, if there is no active project + framework + backend, show
   the welcome modal in 7 steps: language, usage mode, explanation style,
   project name, framework, backend, get-started. Each step is held in a
   pending* variable (mirrored to window.pending* so 08-i18n-dom.js applyLang
   can read the welcome CTAs across modules); the final step persists the
   selections via createProject. The welcome modal's Help button (with its
   in-modal language switcher) lives in this file too. showWelcomeIfFirstVisit
   is called from 18-app.js during init. */

/* ==================== WELCOME MODAL ==================== */
/* If there is no active project + framework + backend, show the welcome modal
   in 7 steps:
   1) Language  2) Usage Mode  3) Explanation Style  4) Project Name
   5) Framework  6) Backend  7) Get Started */
function showWelcomeIfFirstVisit() {
  if (getActiveProjectId() && currentFramework && currentBackend) return;
  setTimeout(() => {
    setWelcomeStep(1);
    openModal("welcomeModal");
  }, 350);
}

/* Selections inside the welcome modal: not persisted until the final
   "Get Started" button is clicked. */
let pendingFramework = null;
let pendingBackend = null;
let pendingLang = null;
let pendingMode = null;
let pendingStyle = null;
let pendingProjName = null;

function setWelcomeStep(n) {
  /* 1 = language, 2 = usage mode, 3 = explanation style, 4 = project name,
     5 = framework, 6 = backend, 7 = get-started. */
  document.querySelectorAll(".welcome-pane").forEach(p => {
    p.hidden = String(p.dataset.pane) !== String(n);
  });
  /* Update the step indicator (7 dots + 6 connecting lines). */
  document.querySelectorAll("[data-step-dot]").forEach(d => {
    const idx = Number(d.dataset.stepDot);
    d.classList.toggle("active", idx === n);
    d.classList.toggle("done", idx < n);
  });
  document.querySelectorAll("[data-step-line]").forEach(line => {
    const after = Number(line.dataset.stepLine); // value 1 = line between dot 1 and dot 2
    line.classList.toggle("done", n > after);
  });
  /* Expose the current step to CSS via a data-step attribute. For example,
     on step 1 the help button's label is hidden by CSS so "Yardım/Help" does
     not take up space in both languages before the user has picked one. */
  const modal = document.getElementById("welcomeModal");
  if (modal) modal.setAttribute("data-step", String(n));
  /* When entering the project-name step (now step 4): auto-focus the input
     and update the CTA label. */
  if (n === 4) {
    const input = document.getElementById("welcomeProjName");
    if (input) {
      setTimeout(() => input.focus(), 80);
      updateWelcomeProjNameCta();
    }
  }
}

/* Update the "Next" button's enabled/disabled state as the project-name
   input changes. Empty or longer than 60 characters disables the button.
   The error element is hidden when there is nothing to report. */
function updateWelcomeProjNameCta() {
  const input = document.getElementById("welcomeProjName");
  const cta = document.getElementById("welcomeProjNameNext");
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
    if (error) {
      errEl.textContent = error;
      errEl.hidden = false;
    } else {
      errEl.textContent = "";
      errEl.hidden = true;
    }
  }
}

/* STEP 1: Language selection. */
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
  /* Apply the chosen language immediately so the remaining steps render in it. */
  if (pendingLang !== currentLang) {
    saveLang(pendingLang);
    applyLang();
  }
  setWelcomeStep(2);
});

/* STEP 2: Usage Mode (Build / Review).
   The choice is persisted in welcomeStart via applyMode; until then it lives
   in pendingMode. */
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

/* STEP 3: Explanation style (Simple / Technical). */
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
  /* Apply the chosen explanation style immediately so the remaining welcome
     steps and the hero pill reflect it. (No need to re-render the list:
     while the welcome modal is open, the list is already kept in sync by
     other renderContent calls.) */
  if (typeof applyStyle === "function") applyStyle(pendingStyle);
  setWelcomeStep(4);
});

document.getElementById("welcomeStyleBack").addEventListener("click", () => {
  setWelcomeStep(2);
});

/* STEP 4: Project name. */
const welcomeProjNameInput = document.getElementById("welcomeProjName");
if (welcomeProjNameInput) {
  welcomeProjNameInput.addEventListener("input", () => {
    pendingProjName = welcomeProjNameInput.value;
    updateWelcomeProjNameCta();
  });
  welcomeProjNameInput.addEventListener("keydown", e => {
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

/* STEP 5: Framework selection. */
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

/* STEP 6: Backend selection. */
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

/* STEP 7: Get started. */
document.getElementById("welcomeBack").addEventListener("click", () => {
  setWelcomeStep(6);
});

/* Help button inside the welcome modal: opens the help modal on top without
   closing welcome. helpModal appears before welcomeModal in the DOM and
   both share the same z-index, so we temporarily raise help's z-index to
   render it above. When help is closed the welcome modal stays visible
   underneath.
   On step 1 (before the user has picked a language) the help modal shows an
   in-modal TR/EN switcher; that switcher only changes the help text for the
   current opening and never mutates currentLang. */
document.getElementById("welcomeHelpBtn").addEventListener("click", () => {
  const helpEl = document.getElementById("helpModal");
  if (helpEl) helpEl.style.zIndex = "10001";
  /* Is welcome currently on step 1 (language pick)? */
  const onLangStep = document.getElementById("welcomeModal")?.getAttribute("data-step") === "1";
  setHelpLangSwitchVisible(onLangStep);
  /* Collapse every help section on each open so users always start fresh. */
  if (typeof collapseAllHelpSections === "function") collapseAllHelpSections();
  openModal("helpModal");
});

/* Visibility control for the help modal's in-modal language switcher.
   When the switcher is visible, the active button is synced with currentLang. */
function setHelpLangSwitchVisible(visible) {
  const sw = document.getElementById("helpLangSwitch");
  if (!sw) return;
  sw.hidden = !visible;
  if (visible) {
    /* Sync the active button with currentLang. */
    sw.querySelectorAll("[data-help-lang]").forEach(b => {
      b.classList.toggle("active", b.dataset.helpLang === currentLang);
    });
  }
}

/* Temporarily render the help text in the given language, only inside this
   modal. Does not touch currentLang or localStorage; once the modal is
   closed and reopened, the content reverts to whatever the global language
   is (applyI18nToDom reapplies it). */
function applyHelpDisplayLang(lang) {
  if (lang !== "tr" && lang !== "en") return;
  const helpBody = document.getElementById("helpModalBody");
  if (helpBody && HELP_HTML[lang]) {
    helpBody.innerHTML = HELP_HTML[lang];
    /* innerHTML replacement recreates DOM elements, so rebuild the accordion
       (section.help-section.collapsed class + chevron span). */
    if (typeof enhanceHelpAccordion === "function") enhanceHelpAccordion();
  }
  const helpTitle = document.getElementById("helpTitle");
  if (helpTitle && UI_STRINGS["help.title"]) {
    helpTitle.textContent = UI_STRINGS["help.title"][lang] || helpTitle.textContent;
  }
  /* Update the active state on the switcher buttons. */
  document.querySelectorAll("[data-help-lang]").forEach(b => {
    b.classList.toggle("active", b.dataset.helpLang === lang);
  });
}

document.querySelectorAll("[data-help-lang]").forEach(btn => {
  btn.addEventListener("click", () => {
    applyHelpDisplayLang(btn.dataset.helpLang);
  });
});

/* Reset the switcher every time the help modal closes so the next open
   starts in the correct context. The data-modal-close listener exists, but
   instead of hooking into that (or observing the modal's "hidden" property),
   we explicitly hide the switcher at the close points. */
function closeHelpModal() {
  const helpEl = document.getElementById("helpModal");
  if (helpEl) helpEl.hidden = true;
  setHelpLangSwitchVisible(false);
  /* If the user changed languages via the in-modal switcher, restore the
     content for currentLang so the next open shows the global language. */
  applyHelpDisplayLang(currentLang);
}

document.getElementById("welcomeStart").addEventListener("click", () => {
  if (!pendingFramework || !pendingProjName || !pendingBackend) return;
  /* Persist the explanation style. It was already applied live in step 3;
     this call guarantees it is also written to localStorage. */
  if (pendingStyle && typeof applyStyle === "function") {
    applyStyle(pendingStyle);
  }
  /* Persist the usage mode. applyMode only writes localStorage and sets the
     html data-card-mode attribute; the actual DOM card flip happens after
     the render in reloadActive..., at the end of attachClickHandlers via
     applyInitialCardMode. */
  if (pendingMode && typeof applyMode === "function") {
    applyMode(pendingMode);
  }
  /* Create the project and make it active first; saveFramework/saveBackend
     write to whichever project is active. */
  const created = createProject(pendingProjName);
  if (!created.ok) {
    /* Most likely error: another project already has this name (unusual for
       a new user). The limit error cannot trigger during welcome because
       the store has zero projects. */
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
  /* Load the new project's full in-memory state and re-render the UI. */
  reloadActiveProjectAndRender();
  /* Clear pending* so a later welcome session does not inherit old picks. */
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
