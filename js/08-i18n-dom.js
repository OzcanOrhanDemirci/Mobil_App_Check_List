/* ==================== DİL DEĞİŞTİRME (TR/EN TOGGLE) ==================== */
function applyI18nToDom() {
  /* data-i18n: textContent set */
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const v = t(key);
    if (v && v !== key) el.textContent = v;
  });
  /* data-i18n-html: innerHTML set (HTML içeren çeviri için) */
  document.querySelectorAll("[data-i18n-html]").forEach(el => {
    const key = el.getAttribute("data-i18n-html");
    const v = t(key);
    if (v && v !== key) el.innerHTML = v;
  });
  /* data-i18n-title: title attr */
  document.querySelectorAll("[data-i18n-title]").forEach(el => {
    const key = el.getAttribute("data-i18n-title");
    const v = t(key);
    if (v && v !== key) el.setAttribute("title", v);
  });
  /* data-i18n-aria-label: aria-label attr */
  document.querySelectorAll("[data-i18n-aria-label]").forEach(el => {
    const key = el.getAttribute("data-i18n-aria-label");
    const v = t(key);
    if (v && v !== key) el.setAttribute("aria-label", v);
  });
  /* data-i18n-placeholder: placeholder attr */
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    const v = t(key);
    if (v && v !== key) el.setAttribute("placeholder", v);
  });
  /* data-i18n-attr-data-locked-msg → set custom data-* attribute */
  document.querySelectorAll("[data-i18n-attr-data-locked-msg]").forEach(el => {
    const key = el.getAttribute("data-i18n-attr-data-locked-msg");
    const v = t(key);
    if (v && v !== key) el.setAttribute("data-locked-msg", v);
  });

  /* Help modal içeriğini doldur ve accordion davranışını yeniden kur */
  const helpBody = document.getElementById("helpModalBody");
  if (helpBody && HELP_HTML[currentLang]) {
    helpBody.innerHTML = HELP_HTML[currentLang];
    if (typeof enhanceHelpAccordion === "function") enhanceHelpAccordion();
  }

  /* html.lang attribute */
  document.documentElement.setAttribute("lang", currentLang);

  /* Lang toggle butonu içeriğini güncelle */
  const langBtn = document.getElementById("langToggle");
  if (langBtn) {
    const cur = langBtn.querySelector(".lang-current");
    const oth = langBtn.querySelector(".lang-other");
    if (currentLang === "en") {
      if (cur) cur.textContent = "EN";
      if (oth) oth.textContent = "TR";
    } else {
      if (cur) cur.textContent = "TR";
      if (oth) oth.textContent = "EN";
    }
  }
}

function saveLang(l) {
  if (l !== "tr" && l !== "en") return;
  currentLang = l;
  try { localStorage.setItem(LANG_KEY, l); } catch {}
}

function applyLang() {
  applyI18nToDom();
  /* DATA içeriği değişeceği için yeniden render */
  if (typeof renderCategoryNav === "function") renderCategoryNav();
  if (typeof renderContent === "function") renderContent();
  if (typeof attachClickHandlers === "function") attachClickHandlers();
  if (typeof updateProgress === "function") updateProgress();
  if (typeof applyFilters === "function") applyFilters();
  /* Tema label'ı güncel dilde olmalı */
  applyTheme(document.documentElement.getAttribute("data-theme") || "dark");
  /* Kilit butonu label'ı güncel dilde olmalı */
  if (typeof applyLock === "function") applyLock();
  /* Hero framework pill (varsa label güncellenmeli) */
  if (typeof applyFrameworkUI === "function") applyFrameworkUI();
  /* Welcome modalında sefte buton label'ları — pending state'e göre dinamik */
  const welcomeLangNext = document.getElementById("welcomeLangNext");
  if (welcomeLangNext) {
    if (window.pendingLang) {
      welcomeLangNext.textContent = t("welcome.cta.next");
      welcomeLangNext.disabled = false;
    } else {
      welcomeLangNext.textContent = t("welcome.cta.pickLang");
      welcomeLangNext.disabled = true;
    }
  }
  const welcomeNext = document.getElementById("welcomeNext");
  if (welcomeNext) {
    if (window.pendingFramework) {
      welcomeNext.textContent = t("welcome.cta.next");
      welcomeNext.disabled = false;
    } else {
      welcomeNext.textContent = t("welcome.cta.pickFw");
      welcomeNext.disabled = true;
    }
  }
  /* Welcome 2. adım (proje adı) CTA'sı dil değişikliğine göre yenilensin */
  if (typeof updateWelcomeProjNameCta === "function") updateWelcomeProjNameCta();
}

document.getElementById("langToggle").addEventListener("click", () => {
  const next = currentLang === "tr" ? "en" : "tr";
  saveLang(next);
  applyLang();
  showToast(next === "en" ? "Language switched to English" : "Dil Türkçe olarak değiştirildi", "info", 1400);
});

