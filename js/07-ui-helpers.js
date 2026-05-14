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

/* Onay modalı (window.confirm yerine).
   opts.title, opts.yesText, opts.cancelText (default İptal),
   opts.html (true ise message HTML olarak render edilir; default plain text),
   opts.wide (true ise modal genişler — yoğun içerik için),
   opts.onCancel (kullanıcı modal'ı iptal/X/backdrop ile kapatırsa çağrılır) */
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
  /* Onaylandı; close handler'ı cancel callback'i tetiklemesin diye önce temizle */
  confirmCancelCallback = null;
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
      /* Confirm modalı iptal yoluyla kapandıysa cancel callback'i çalıştır.
         (confirmYes button'unun click handler'ı kapatmadan önce
         confirmCancelCallback'i null yapar; oradan gelmiyorsak hala dolu olabilir.) */
      if (modal.id === "confirmModal") {
        const cb = confirmCancelCallback;
        confirmCancelCallback = null;
        confirmCallback = null;
        if (typeof cb === "function") cb();
      }
    }
  }
  /* AI format paneli, dışına tıklanırsa kapat */
  if (!e.target.closest(".feature-ai-wrap")) {
    document.querySelectorAll(".feature-ai-wrap.ai-open").forEach(w => w.classList.remove("ai-open"));
  }
});

/* ==================== ANLATIM DİLİ (BASİT / TEKNİK) ====================
   STYLE_KEY ve currentStyle 01-i18n-strings.js'de tanımlı (tx() tarafından
   doğrudan kullanılıyor). Burada uygulama mantığı: tema gibi global,
   localStorage'da saklı; değişince listenin yeniden render edilmesi gerekir
   çünkü her madde farklı metin gösterebilir. */
function applyStyle(style) {
  if (style !== "simple" && style !== "technical") style = "technical";
  currentStyle = style;
  try { localStorage.setItem(STYLE_KEY, style); } catch {}
  document.documentElement.setAttribute("data-explanation-style", style);
  /* Pill üzerindeki aktif/pasif vurgu */
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
  /* İçeriği yeniden render et — madde metinleri stil duyarlı */
  if (typeof renderContent === "function") renderContent();
  if (typeof attachClickHandlers === "function") attachClickHandlers();
  if (typeof applyFilters === "function") applyFilters();
  if (typeof updateProgress === "function") updateProgress();
  showToast(next === "simple" ? t("style.toast.simple") : t("style.toast.technical"), "info", 1400);
}

/* ==================== KULLANIM BİÇİMİ (BUILD / REVIEW) ====================
   MODE_KEY ve currentMode 01-i18n-strings.js'de tanımlı. Burada sadece
   localStorage senkronizasyonu — kartların DOM'da çevrilmesi (flip) farklı bir
   yerden tetikleniyor (renderdan sonra applyInitialCardMode, ya da toolbar
   butonlarından flipFeatureCard). Bu fonksiyon DOM'a hiç dokunmaz; sadece
   tercihi yazar ki sonraki render'larda doğru başlangıç durumu uygulansın. */
function applyMode(mode) {
  if (mode !== "build" && mode !== "review") mode = "build";
  currentMode = mode;
  try { localStorage.setItem(MODE_KEY, mode); } catch {}
  document.documentElement.setAttribute("data-card-mode", mode);
  /* Toolbar'daki "Tümü Nasıl" / "Tümü Liste" pair'inin aktif vurgusunu
     senkronize et. Init sırasında DOM hazır olduğundan butonlara güvenle
     erişebiliriz; fonksiyon henüz yüklenmediyse sessizce geç. */
  if (typeof updateToolbarButtonStates === "function") updateToolbarButtonStates();
}

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

