/* Synchronous boot: applies the saved theme and language before any
   stylesheet or script loads, so the first paint already has the
   correct colors and the correct `lang` attribute. Loaded in
   index.html's <head> without `defer` so it runs before the rest of
   the document is parsed. Failures (private mode / disabled storage)
   degrade silently; the application's later init code re-reads the
   same keys and is robust to defaults. */

(function () {
  try {
    const themeKey = "mobil_kontrol_theme_v1";
    const langKey = "mobil_kontrol_lang_v1";

    const theme = localStorage.getItem(themeKey) || "dark";
    document.documentElement.setAttribute("data-theme", theme);

    let lang = localStorage.getItem(langKey);
    if (lang !== "tr" && lang !== "en") lang = "tr";
    document.documentElement.setAttribute("lang", lang);
  } catch (_e) {
    /* localStorage unavailable; let later init handle defaults. */
  }
})();
