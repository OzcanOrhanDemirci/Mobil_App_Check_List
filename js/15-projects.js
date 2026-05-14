/* ==================== PROJECT MANAGEMENT + FRAMEWORK / BACKEND MODAL ====================
   The hero project pill and its tabbed modal: project list, framework switch,
   backend switch, and reset. CRUD: create new project (name + framework +
   backend), rename, delete (blocks deleting the last project; when the active
   project is deleted a "pick next project" modal opens). applyFrameworkUI /
   applyBackendUI live here: they refresh the hero pill and modal highlights
   in one place, and are called via typeof-guards from 08-i18n-dom.js and
   04-projects.js. A top-level applyFrameworkUI() call at the bottom seeds
   the hero pill correctly on page load. */

/* ==================== PROJECT + FRAMEWORK PILL (HERO) ==================== */
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
  /* Highlight the current selection in the switch modal */
  document.querySelectorAll("[data-switch-fw]").forEach(b => {
    b.classList.toggle("selected", b.dataset.switchFw === currentFramework);
  });
  /* Refresh the backend leg on every framework update (a project switch changes
     framework and backend together; keep both applies in one place) */
  applyBackendUI();
}

/* Apply the backend row on the hero pill and the selection highlight on the backend tab. */
function applyBackendUI() {
  const beMeta = currentBackend ? BACKEND_META[currentBackend] : null;
  const beIcon = document.querySelector("#projectFrameworkBtn .be-pill-icon");
  const beLabel = document.querySelector("#projectFrameworkBtn .be-pill-label");
  const beRow = document.querySelector("#projectFrameworkBtn .proj-pill-backend");
  if (beMeta && beIcon && beLabel) {
    beIcon.textContent = beMeta.icon;
    beLabel.textContent = tx(beMeta.short);
  }
  /* Show the backend row only when a backend has been chosen (during the welcome
     flow the pill sits in the background and a backend may not yet be selected) */
  const showBackendRow = !!currentBackend;
  if (beRow) beRow.hidden = !showBackendRow;
  /* Highlight the active card on the projfw modal Backend tab */
  document.querySelectorAll("[data-switch-be]").forEach(b => {
    b.classList.toggle("selected", b.dataset.switchBe === currentBackend);
  });
}

document.getElementById("projectFrameworkBtn").addEventListener("click", () => {
  /* Auto-closing the mobile toolbar is already handled inside setupMobileActionsToggle */
  applyFrameworkUI();
  /* On every open default to the Project tab and refresh the list */
  setProjFwTab("project");
  renderProjectList();
  resetProjAddForm();
  openModal("frameworkModal");
});

/* ==================== PROJECT + FRAMEWORK MODAL: TAB SWITCHING ==================== */
function setProjFwTab(tabName) {
  /* tabName: "project", "framework", "backend", or "reset" */
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
      /* Highlight the active backend card */
      applyBackendUI();
    } else if (target === "framework") {
      /* Highlight the active framework card (applyFrameworkUI handles this) */
      applyFrameworkUI();
    } else if (target === "reset" && projfwResetUi) {
      /* Reset selections every time the tab is entered so the user starts clean */
      projfwResetUi.resetUi();
    }
  });
});

/* ==================== PROJECT MANAGEMENT ==================== */

/* Render the project list into the DOM. The active project is highlighted; each
   row has rename/delete buttons. Clicking the row (empty area) switches to that
   project. A row with inline rename mode open carries the .renaming class; that
   row shows an input plus Save/Cancel buttons while the normal view is hidden. */
function renderProjectList() {
  const listEl = document.getElementById("projList");
  const countEl = document.getElementById("projCount");
  if (!listEl) return;

  const projects = listProjects();
  const activeId = getActiveProjectId();

  /* Top counter */
  if (countEl) countEl.textContent = t("proj.count", { n: projects.length });

  /* Clear and rebuild the list. No need to preserve inline rename state because
     the list is rendered from scratch on every modal open. */
  listEl.innerHTML = "";

  /* Sort: active project at the top, then by updatedAt newest first */
  const sorted = [...projects].sort((a, b) => {
    if (a.id === activeId) return -1;
    if (b.id === activeId) return 1;
    return String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""));
  });

  sorted.forEach(p => {
    const li = document.createElement("li");
    li.className = "proj-item" + (p.id === activeId ? " active" : "");
    li.dataset.projId = p.id;
    /* Left icon: the project framework's emoji (fallback 📁). Next to the name
       in parentheses: framework + backend label. Consistent with the hero pill. */
    const fwMeta = p.data && p.data.framework ? FRAMEWORK_META[p.data.framework] : null;
    const fwIcon = fwMeta ? fwMeta.icon : "📁";
    const fwName = fwMeta ? tx(fwMeta.short) : "—";
    const beMeta = p.data && p.data.backend ? BACKEND_META[p.data.backend] : null;
    const beShortName = beMeta ? tx(beMeta.short) : "";
    const beIcon = beMeta ? beMeta.icon : "";
    /* Display format: "(Flutter · 🔥 Firebase)"; with no backend or no icon it
       collapses to just "(Flutter)". For noBackend the icon is 🚫. */
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
    /* Set name + framework label via textContent (XSS safe) */
    li.querySelector(".proj-row-icon").textContent = fwIcon;
    li.querySelector(".proj-row-name").textContent = p.name;
    li.querySelector(".proj-row-fw").textContent = "(" + stackLabel + ")";
    if (p.id === activeId) {
      li.querySelector(".proj-row-active-badge").hidden = false;
    }
    /* The last remaining project cannot be deleted: visually disable the button and update tooltip */
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

/* Pending framework + backend chosen in the "+ New Project" flow; transient
   until Create is pressed. All three are required: name + framework + backend. */
let pendingNewProjFw = null;
let pendingNewProjBe = null;

/* Reset the form: clear the input, clear framework + backend selection, hide
   the error, and disable the Create button. Does not toggle modal visibility
   (visibility is managed separately). */
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

/* Create button: enabled only when name + framework + backend are all chosen,
   disabled otherwise. "noBackend" counts as a valid backend selection. */
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

/* "+ New Project": open a separate modal, reset state, and focus the input.
   The Project/Framework modal stays open in the background; if Create is
   cancelled the user falls back to it (and continues to see the project list). */
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

/* Cancel: close the modal and reset state. The user returns to the project
   manager modal that was open behind it. */
document.getElementById("projAddCancel").addEventListener("click", () => {
  closeModal("projCreateModal");
  resetProjAddForm();
});

/* Mini framework grid: assign the clicked framework to pendingNewProjFw, mark
   only that button .selected, then refresh the Create button state */
document.querySelectorAll(".proj-add-fw").forEach(btn => {
  btn.addEventListener("click", () => {
    pendingNewProjFw = btn.dataset.addFw;
    document.querySelectorAll(".proj-add-fw").forEach(b => b.classList.toggle("selected", b === btn));
    /* Clear any existing error (the user is correcting input) */
    const errEl = document.getElementById("projAddError");
    if (errEl) {
      errEl.textContent = "";
      errEl.hidden = true;
    }
    updateProjAddCreateState();
  });
});

/* Mini backend grid: same pattern; the clicked backend is assigned to
   pendingNewProjBe. Any valid backend including noBackend is allowed;
   updateProjAddCreateState still requires all three (non-empty name +
   framework + backend). */
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

/* Validate on input change */
document.getElementById("projAddInput").addEventListener("input", () => {
  /* Clear any existing error once the user starts typing */
  const errEl = document.getElementById("projAddError");
  if (errEl && !errEl.hidden) {
    errEl.textContent = "";
    errEl.hidden = true;
  }
  updateProjAddCreateState();
});

/* Enter / Escape shortcuts */
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

/* Create: first open a confirm modal. If accepted, create the project, mark it
   active, refresh UI, and close ALL modals (return to the main screen). If
   cancelled, projCreateModal is reopened with the user's input preserved. */
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

  /* Close both projCreateModal and frameworkModal so confirm sits on top alone */
  closeModal("projCreateModal");
  closeModal("frameworkModal");
  /* Snapshot selections into locals for the confirm callback. The customConfirm
     callback runs later; the user could reopen the modal in the meantime and
     mutate the pendingNewProj* values, so this defensive copy is required. */
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
      /* Auto-activate the new project (the user accepted the confirm; natural flow).
         The old project's data remains untouched inside projects[]. */
      setActiveProjectId(result.project.id);
      reloadActiveProjectAndRender();
      resetProjAddForm();
      /* All modals are already closed; the user lands on the main screen with the new project active */
      showToast(t("proj.created.toast", { name: result.project.name }), "success", 1800);
    },
    {
      title: t("proj.add.confirmTitle"),
      yesText: t("proj.add.confirmYes"),
      cancelText: t("confirm.cancel"),
      html: true,
      wide: true,
      /* If dismissed via Cancel/X/backdrop, preserve what the user typed:
         reopen frameworkModal in the background and projCreateModal in front,
         then refocus the input. State (input value + framework selection)
         is intentionally not reset. */
      onCancel: () => {
        openModal("frameworkModal");
        openModal("projCreateModal");
        const inp = document.getElementById("projAddInput");
        if (inp) setTimeout(() => inp.focus(), 60);
      },
    }
  );
});

/* All clicks inside the list are handled via a single delegated listener (rename/delete/switch) */
document.getElementById("projList").addEventListener("click", e => {
  const target = e.target.closest("button, [data-proj-switch]");
  if (!target) return;

  /* Switch row (change project): confirmed action. Open customConfirm; if the
     user accepts, set the active project and re-render the entire UI. */
  const switchId = target.getAttribute("data-proj-switch");
  if (switchId !== null) {
    /* Clicking the already-active row is a no-op (close modal and exit) */
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
    /* Close the frameworks modal first to avoid stacking (confirm opens in its place) */
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

  /* Enter rename mode */
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

  /* Save rename */
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
    /* If the active project was renamed, refresh the hero pill label too */
    if (renameSaveId === getActiveProjectId()) applyFrameworkUI();
    renderProjectList();
    return;
  }

  /* Cancel rename */
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
    /* Restore the input to its original value */
    const inp = li.querySelector(".proj-rename-input");
    const proj = findProjectById(renameCancelId);
    if (inp && proj) inp.value = proj.name;
    return;
  }

  /* Delete */
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
    /* Confirm (confirmModal's z-index is high enough to stack on top of other modals) */
    customConfirm(
      t("proj.delete.confirmMsg", { name: escapeHtml(proj.name) }),
      () => {
        /* Active project being deleted AND at least 3 projects exist: show the
           "which one to switch to" picker. Delete + switch happen together in
           that picker (no extra confirm there; the user already confirmed the
           delete and there must always be an active project). */
        if (wasActive && projectsCount() >= 3) {
          openProjPickNextModal(proj, deleteId);
          return;
        }
        /* Otherwise (inactive target, or only 2 projects): fall through to the existing auto-switch behaviour */
        const r = deleteProject(deleteId);
        if (!r.ok) {
          if (r.error === "lastOne") showToast(t("proj.delete.lastOne"), "warn", 2400);
          return;
        }
        showToast(t("proj.deleted.toast", { name: proj.name }), "info", 1600);
        if (wasActive) {
          /* Active project was deleted: deleteProject assigned a new active id; reload the UI */
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

/* ==================== "PICK NEXT PROJECT" MODAL (WHEN ACTIVE IS DELETED) ==================== */

/* After delete is confirmed (when the active project is the target and 3+
   projects exist), this modal asks "which project should I switch to?".
   State lives in:
   - pendingDeleteId: id of the project about to be deleted
   - pendingDeletedName: name kept for the success toast
   The delete is not applied until the user picks; on selection delete +
   setActive run together to avoid a window with no active project. */
let pendingDeleteId = null;
let pendingDeletedName = null;

function openProjPickNextModal(deletedProj, deleteId) {
  const listEl = document.getElementById("projPickList");
  const subEl = document.getElementById("projPickSub");
  if (!listEl) return;

  pendingDeleteId = deleteId;
  pendingDeletedName = deletedProj.name;

  /* Subtitle: remind the user which project is about to be deleted */
  if (subEl) subEl.innerHTML = t("proj.pickNext.sub", { name: escapeHtml(deletedProj.name) });

  /* Populate the list with every project except the one being deleted; most recently updated first */
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

  /* Close the frameworks modal so the picker sits alone in front. The delete
     was already confirmed, but if the user dismisses this picker via X /
     backdrop we must not end up with no active project. We handle that by
     leaving the project intact on side-close (no delete happens); the user
     can re-trigger the delete confirm later. */
  closeModal("frameworkModal");
  openModal("projPickNextModal");
}

/* List click: switch to the picked project and delete the old one.
   X / backdrop close: clears state and does NOT delete (the user has
   backed out; even though confirmModal was previously accepted, this
   step still counts as a final "undo" because the delete has not been
   applied yet). */
document.getElementById("projPickList").addEventListener("click", e => {
  const btn = e.target.closest("[data-proj-pick]");
  if (!btn) return;
  const targetId = btn.dataset.projPick;
  if (!pendingDeleteId || !targetId) return;

  const deletedName = pendingDeletedName;
  const targetProj = findProjectById(targetId);

  /* Order matters: first move active to the target (so deleteProject's
     fallback active-pick does not kick in), then delete the old one.
     setActiveProjectId already calls saveProjectsToStorage. */
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

/* If the modal closes via X / backdrop, clear the pending-delete state.
   (No delete is performed; the user backed out before picking.) */
document.addEventListener("click", e => {
  if (e.target.matches("[data-modal-close]")) {
    const modal = e.target.closest(".modal");
    if (modal && modal.id === "projPickNextModal") {
      pendingDeleteId = null;
      pendingDeletedName = null;
    }
  }
});

/* Enter/Escape shortcuts inside the rename input */
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

    /* Shared helper that actually performs the framework switch */
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

    /* If at least one item is checked, ask for confirmation: switching will
       reset state. With no checks (new user or cleared list) switch directly. */
    const hasMarks = Object.keys(state).length > 0;
    if (!hasMarks) {
      performSwitch(false);
      return;
    }

    /* Close the framework switch modal before opening the confirm popup so they do not stack */
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

/* ==================== BACKEND SWITCH (Backend tab in projfw modal) ====================
   Same behaviour as the framework switch: clicking a backend card different
   from the active one opens a confirm popup (if backend marks exist) and,
   on confirm, clears marks in the backend category. When switching to
   "noBackend" the category is fully hidden, so any backend marks become
   invisible (they remain in storage but are not rendered); the UI still
   shows the "will be reset" message because the user will no longer see
   them in the list either way.

   The backend category is currently cat 06 ("Backend"). Rather than hard-coding
   that id, this block scans every feature tagged `backendStep: true`, so future
   backend items added to other categories will work without changes. */
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
        /* Also clear the How-To step state tied to this level
           (e.g. "1.1.mvp.s0", "1.1.mvp.s1" ...). If the backend switch is
           resetting the selection, the step progress tied to that selection
           must not linger. */
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

    /* Shared helper that performs the backend switch. If clearMarks is true,
       wipe backend-category marks, reset celebration flags, then re-render
       the UI so backend items appear/disappear correctly. */
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
      /* Status toast covers three scenarios:
         - target is noBackend: "no backend, items hidden"
         - was noBackend, now a real backend: "items are visible again"
         - normal switch: single-line "X selected" (or "reset" when clearMarks)
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

    /* If any backend-category mark exists, prompt for confirmation: the
       switch will reset those marks. Otherwise switch directly. */
    const hasBackendMarks = DATA.some(cat =>
      cat.features.some(f => f.backendStep && (state[`${cat.id}.${f.id}.mvp`] || state[`${cat.id}.${f.id}.release`]))
    );

    if (!hasBackendMarks) {
      performSwitch(false);
      return;
    }

    /* Close the projfw modal before opening the confirm popup so they do not stack */
    closeModal("frameworkModal");
    const currentMeta = (currentBackend && BACKEND_META[currentBackend]) || { icon: "?", label: currentBackend || "—" };
    const newMeta = BACKEND_META[be];
    /* Special "effect" line for transitions involving noBackend: items become hidden or shown again */
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

/* On first load, seed the hero pill with the current framework (if one is selected) */
applyFrameworkUI();
