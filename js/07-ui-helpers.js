function escapeHtml(str) {
  /* Escapes the five characters that can break out of HTML text or
     attribute contexts. The single-quote escape (&#39;) protects
     attribute values quoted with single quotes; named entity &apos;
     is HTML5-only and not honored in all XML-mode renderers. */
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function stripHtml(str) {
  return String(str || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/* ==================== TOAST ==================== */
function showToast(message, type = "success", duration = 1600) {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  const iconMap = { success: "✓", info: "i", warn: "!" };
  toast.innerHTML = `<span class="toast-icon">${iconMap[type] || "✓"}</span><span class="toast-msg"></span>`;
  toast.querySelector(".toast-msg").textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 260);
  }, duration);
}

/* ==================== MODAL ==================== */
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.hidden = false;
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.hidden = true;
}
function closeAllModals() {
  document.querySelectorAll(".modal").forEach(m => m.hidden = true);
}

/* Custom confirmation modal (replacement for window.confirm).
   Options:
     opts.title, opts.yesText, opts.cancelText (default "Cancel"),
     opts.html      : if true, message is rendered as HTML (default: plain text),
     opts.wide      : if true, widen the modal for dense content,
     opts.onCancel  : invoked when the user dismisses via Cancel / X / backdrop. */
let confirmCallback = null;
let confirmCancelCallback = null;
function customConfirm(message, onConfirm, opts = {}) {
  document.getElementById("confirmTitle").textContent = opts.title || t("confirm.defaultTitle");
  const msgEl = document.getElementById("confirmMessage");
  if (opts.html) msgEl.innerHTML = message; else msgEl.textContent = message;
  const yesBtn = document.getElementById("confirmYes");
  yesBtn.textContent = opts.yesText || t("confirm.yes");
  const cancelBtn = document.querySelector("#confirmModal .modal-confirm-actions .btn.ghost");
  if (cancelBtn) cancelBtn.textContent = opts.cancelText || t("confirm.cancel");
  const modalContent = document.querySelector("#confirmModal .modal-content");
  if (modalContent) modalContent.classList.toggle("modal-confirm--wide", !!opts.wide);
  confirmCallback = onConfirm;
  confirmCancelCallback = typeof opts.onCancel === "function" ? opts.onCancel : null;
  openModal("confirmModal");
}
document.getElementById("confirmYes").addEventListener("click", () => {
  /* Confirmed; clear the cancel callback first so the close handler does not
     fire it when the modal closes via the Yes button. */
  confirmCancelCallback = null;
  closeModal("confirmModal");
  if (typeof confirmCallback === "function") {
    const cb = confirmCallback;
    confirmCallback = null;
    cb();
  }
});

/* Global modal-close handler: backdrop click, X button, or any [data-modal-close]. */
document.addEventListener("click", (e) => {
  if (e.target.matches("[data-modal-close]")) {
    const modal = e.target.closest(".modal");
    if (modal) {
      modal.hidden = true;
      /* If the help modal is closing, reset its temporary language switcher. */
      if (modal.id === "helpModal" && typeof setHelpLangSwitchVisible === "function") {
        setHelpLangSwitchVisible(false);
        if (typeof applyHelpDisplayLang === "function") applyHelpDisplayLang(currentLang);
      }
      /* If the confirm modal was dismissed (not approved), run the cancel
         callback. The confirmYes click handler nulls confirmCancelCallback
         before closing, so if we get here with a non-null value it came
         from a cancel/X/backdrop interaction. */
      if (modal.id === "confirmModal") {
        const cb = confirmCancelCallback;
        confirmCancelCallback = null;
        confirmCallback = null;
        if (typeof cb === "function") cb();
      }
    }
  }
  /* Close the AI format panel when the user clicks anywhere outside it. */
  if (!e.target.closest(".feature-ai-wrap")) {
    document.querySelectorAll(".feature-ai-wrap.ai-open").forEach(w => w.classList.remove("ai-open"));
  }
});

/* ==================== EXPLANATION STYLE (SIMPLE / TECHNICAL) ====================
   STYLE_KEY and currentStyle are defined in 01-i18n-strings.js (tx() reads
   them directly). This file owns the application logic: the preference is
   global like theme and persisted in localStorage; whenever it changes the
   list must be re-rendered, since each item can resolve to different text. */
function applyStyle(style) {
  if (style !== "simple" && style !== "technical") style = "technical";
  currentStyle = style;
  try { localStorage.setItem(STYLE_KEY, style); } catch {}
  document.documentElement.setAttribute("data-explanation-style", style);
  /* Sync the active / inactive halves of the style pill. */
  const btn = document.getElementById("styleToggle");
  if (btn) {
    const cur = btn.querySelector(".style-current");
    const oth = btn.querySelector(".style-other");
    if (cur) cur.textContent = style === "simple" ? t("style.simple") : t("style.technical");
    if (oth) oth.textContent = style === "simple" ? t("style.technical") : t("style.simple");
    btn.setAttribute("aria-pressed", style === "simple" ? "true" : "false");
    btn.classList.toggle("style-simple", style === "simple");
    btn.classList.toggle("style-technical", style === "technical");
  }
}

function toggleStyle() {
  const next = currentStyle === "simple" ? "technical" : "simple";
  applyStyle(next);
  /* Re-render the content: item text is style-aware and must be rebuilt. */
  if (typeof renderContent === "function") renderContent();
  if (typeof attachClickHandlers === "function") attachClickHandlers();
  if (typeof applyFilters === "function") applyFilters();
  if (typeof updateProgress === "function") updateProgress();
  showToast(next === "simple" ? t("style.toast.simple") : t("style.toast.technical"), "info", 1400);
}

/* ==================== CARD MODE (BUILD / REVIEW) ====================
   MODE_KEY and currentMode live in 01-i18n-strings.js. This function only
   syncs the preference to localStorage; flipping cards in the DOM is driven
   from elsewhere (applyInitialCardMode after render, or flipFeatureCard from
   the toolbar buttons). It never touches the DOM directly; it just records
   the preference so the next render starts in the right state. */
function applyMode(mode) {
  if (mode !== "build" && mode !== "review") mode = "build";
  currentMode = mode;
  try { localStorage.setItem(MODE_KEY, mode); } catch {}
  document.documentElement.setAttribute("data-card-mode", mode);
  /* Sync the active highlight on the toolbar's "All How-To" / "All List"
     button pair. During init the DOM is ready so the buttons are reachable;
     if the updater function has not loaded yet, skip silently. */
  if (typeof updateToolbarButtonStates === "function") updateToolbarButtonStates();
}

/* ==================== THEME ==================== */
const THEME_KEY = "mobil_kontrol_theme_v1";
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const btn = document.getElementById("themeToggle");
  if (btn) {
    const icon = btn.querySelector(".theme-icon");
    const label = btn.querySelector(".theme-label");
    if (theme === "light") {
      if (icon) icon.textContent = "☀️";
      if (label) label.textContent = t("theme.light");
    } else {
      if (icon) icon.textContent = "🌙";
      if (label) label.textContent = t("theme.dark");
    }
  }
  try { localStorage.setItem(THEME_KEY, theme); } catch {}
}
document.getElementById("themeToggle").addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  showToast(next === "light" ? t("theme.lightOpened") : t("theme.darkOpened"), "info", 1200);
});

