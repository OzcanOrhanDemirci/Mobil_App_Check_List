/* ==================== I18N (LANGUAGE SWITCHING TR/EN) ==================== */
function applyI18nToDom() {
  /* data-i18n: set textContent. */
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const v = t(key);
    if (v && v !== key) el.textContent = v;
  });
  /* data-i18n-html: set innerHTML (for translations that contain HTML). */
  document.querySelectorAll("[data-i18n-html]").forEach(el => {
    const key = el.getAttribute("data-i18n-html");
    const v = t(key);
    if (v && v !== key) el.innerHTML = v;
  });
  /* data-i18n-title: set the title attribute. */
  document.querySelectorAll("[data-i18n-title]").forEach(el => {
    const key = el.getAttribute("data-i18n-title");
    const v = t(key);
    if (v && v !== key) el.setAttribute("title", v);
  });
  /* data-i18n-aria-label: set the aria-label attribute. */
  document.querySelectorAll("[data-i18n-aria-label]").forEach(el => {
    const key = el.getAttribute("data-i18n-aria-label");
    const v = t(key);
    if (v && v !== key) el.setAttribute("aria-label", v);
  });
  /* data-i18n-placeholder: set the placeholder attribute. */
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    const v = t(key);
    if (v && v !== key) el.setAttribute("placeholder", v);
  });
  /* data-i18n-attr-data-locked-msg: set the custom data-locked-msg attribute. */
  document.querySelectorAll("[data-i18n-attr-data-locked-msg]").forEach(el => {
    const key = el.getAttribute("data-i18n-attr-data-locked-msg");
    const v = t(key);
    if (v && v !== key) el.setAttribute("data-locked-msg", v);
  });

  /* Populate the help modal body and re-attach the accordion behavior. */
  const helpBody = document.getElementById("helpModalBody");
  if (helpBody && HELP_HTML[currentLang]) {
    helpBody.innerHTML = HELP_HTML[currentLang];
    if (typeof enhanceHelpAccordion === "function") enhanceHelpAccordion();
  }

  /* Update the <html lang="..."> attribute. */
  document.documentElement.setAttribute("lang", currentLang);

  /* Update the language toggle button labels. */
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
  /* DATA-derived content must be rebuilt in the new language. */
  if (typeof renderCategoryNav === "function") renderCategoryNav();
  if (typeof renderContent === "function") renderContent();
  if (typeof attachClickHandlers === "function") attachClickHandlers();
  if (typeof updateProgress === "function") updateProgress();
  if (typeof applyFilters === "function") applyFilters();
  /* Theme button label must follow the current language. */
  applyTheme(document.documentElement.getAttribute("data-theme") || "dark");
  /* The explanation-style pill label (Simple / Technical) must follow the
     current language. applyStyle always writes the pill's inner text via t()
     against currentLang, so re-applying the current style is enough to
     refresh the label immediately. */
  if (typeof applyStyle === "function") applyStyle(currentStyle);
  /* Lock button label must follow the current language. */
  if (typeof applyLock === "function") applyLock();
  /* Hero framework pill (if present) must update its label too. */
  if (typeof applyFrameworkUI === "function") applyFrameworkUI();
  /* Welcome modal CTA labels: text depends on pending selection state. */
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
  /* Refresh the welcome step 2 (project name) CTA in the new language. */
  if (typeof updateWelcomeProjNameCta === "function") updateWelcomeProjNameCta();
}

document.getElementById("langToggle").addEventListener("click", () => {
  const next = currentLang === "tr" ? "en" : "tr";
  saveLang(next);
  applyLang();
  showToast(next === "en" ? "Language switched to English" : "Dil Türkçe olarak değiştirildi", "info", 1400);
});

