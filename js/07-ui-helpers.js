function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

/* Onay modalı (window.confirm yerine).
   opts.title, opts.yesText, opts.cancelText (default İptal),
   opts.html (true ise message HTML olarak render edilir; default plain text),
   opts.wide (true ise modal genişler — yoğun içerik için) */
let confirmCallback = null;
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
  openModal("confirmModal");
}
document.getElementById("confirmYes").addEventListener("click", () => {
  closeModal("confirmModal");
  if (typeof confirmCallback === "function") {
    const cb = confirmCallback;
    confirmCallback = null;
    cb();
  }
});

/* Modal kapatma (backdrop, X, data-modal-close) */
document.addEventListener("click", (e) => {
  if (e.target.matches("[data-modal-close]")) {
    const modal = e.target.closest(".modal");
    if (modal) {
      modal.hidden = true;
      /* Yardım modalı kapanıyorsa anlık dil switcher'ını sıfırla */
      if (modal.id === "helpModal" && typeof setHelpLangSwitchVisible === "function") {
        setHelpLangSwitchVisible(false);
        if (typeof applyHelpDisplayLang === "function") applyHelpDisplayLang(currentLang);
      }
    }
  }
  /* AI format paneli, dışına tıklanırsa kapat */
  if (!e.target.closest(".feature-ai-wrap")) {
    document.querySelectorAll(".feature-ai-wrap.ai-open").forEach(w => w.classList.remove("ai-open"));
  }
});

/* ==================== TEMA ==================== */
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

