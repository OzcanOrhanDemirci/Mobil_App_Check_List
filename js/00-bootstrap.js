/* Synchronous boot: applies the saved design, color mode and language
   before any stylesheet or script loads, so the first paint already has
   the correct layout, the correct colors and the correct `lang`
   attribute. Loaded in index.html's <head> without `defer` so it runs
   before the rest of the document is parsed. Failures (private mode /
   disabled storage) degrade silently; the application's later init code
   re-reads the same keys and is robust to defaults.

   Two independent axes live on <html>:
     data-design  classic | minimal | showcase   (layout, shape, motion)
     data-theme   dark | light                   (color mode)

   The design default is duplicated here on purpose. js/19-design.js owns
   the axis, but it loads with `defer` and would therefore paint Minimal
   over whatever this file applied. Keep DEFAULT_DESIGN in the two files
   in sync; tests/design.test.js asserts that they agree. */

(function () {
  try {
    const designKey = "mobil_kontrol_design_v1";
    const themeKey = "mobil_kontrol_theme_v1";
    const langKey = "mobil_kontrol_lang_v1";

    const DESIGNS = ["classic", "minimal", "showcase"];
    const DEFAULT_DESIGN = "minimal";

    let design = localStorage.getItem(designKey);
    if (DESIGNS.indexOf(design) === -1) design = DEFAULT_DESIGN;
    document.documentElement.setAttribute("data-design", design);

    const theme = localStorage.getItem(themeKey) || "dark";
    document.documentElement.setAttribute("data-theme", theme);

    let lang = localStorage.getItem(langKey);
    if (lang !== "tr" && lang !== "en") lang = "tr";
    document.documentElement.setAttribute("lang", lang);
  } catch (_e) {
    /* localStorage unavailable; apply the defaults so the document still
       paints with a complete design + color pair instead of an unstyled
       fallback, then let later init handle the rest. */
    document.documentElement.setAttribute("data-design", "minimal");
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();
