const VALID_FRAMEWORKS = ["flutter", "reactNative", "swift", "kotlin", "expo", "pwa"];
function loadFramework() {
  const v = getProjectField("framework");
  return VALID_FRAMEWORKS.includes(v) ? v : null;
}
function saveFramework(fw) {
  if (!VALID_FRAMEWORKS.includes(fw)) return;
  currentFramework = fw;
  setProjectField("framework", fw);
}

/**
 * Resolve the right content block for a feature given the active four axes:
 * language × explanation style × framework × backend.
 *
 * The function returns a raw value (string or { tr, en } object) suitable for
 * passing to `tx()`. It does NOT translate to a plain string itself; use
 * `resolveLevelText()` when you need a final string.
 *
 * Resolution order:
 *   A. When `currentStyle === "simple"`:
 *      1. `f.simpleBackend[currentBackend][level]`  (backend-specific simple text)
 *      2. `f.simple[level]`                         (item-level default simple text)
 *      (if neither exists, fall through to the technical chain below)
 *   B. Technical chain:
 *      3. `f.backendVariants[currentBackend][currentFramework][level]`
 *      4. `f.backendVariants[currentBackend]._default[level]`
 *      5. `f.variants[currentFramework][level]`
 *      6. `f[level]`
 *
 * The cascade is intentional: simple authoring stays cheap (one entry per item
 * works for most cases), and technical content can override per framework or
 * per backend without losing the default.
 *
 * @param {object} f - Feature object from `DATA[].features[]`.
 * @param {"mvp"|"release"} level - Which tier to resolve.
 * @returns {string | { tr?: string, en?: string } | undefined} Raw resolved value.
 */
function resolveLevel(f, level) {
  /* A) In simple mode, try the item-level simple texts first. */
  if (typeof currentStyle !== "undefined" && currentStyle === "simple") {
    if (f.simpleBackend && currentBackend && f.simpleBackend[currentBackend] && f.simpleBackend[currentBackend][level] !== undefined) {
      return f.simpleBackend[currentBackend][level];
    }
    if (f.simple && f.simple[level] !== undefined) {
      return f.simple[level];
    }
    /* No simple text found; fall through to technical content (which is still readable). */
  }
  /* B) Standard technical resolution chain. */
  if (f.backendVariants && currentBackend && f.backendVariants[currentBackend]) {
    const node = f.backendVariants[currentBackend];
    if (currentFramework && node[currentFramework] && node[currentFramework][level] !== undefined) {
      return node[currentFramework][level];
    }
    if (node._default && node._default[level] !== undefined) {
      return node._default[level];
    }
  }
  if (f.variants && currentFramework && f.variants[currentFramework]) {
    return f.variants[currentFramework][level];
  }
  return f[level];
}

/**
 * Resolve `f` to a translated plain string for the current language and style.
 * Convenience wrapper around `tx(resolveLevel(f, level))`.
 *
 * @param {object} f - Feature object.
 * @param {"mvp"|"release"} level - Tier.
 * @returns {string} Translated text, or "" if nothing resolves.
 */
function resolveLevelText(f, level) {
  return tx(resolveLevel(f, level));
}

/**
 * Resolve the back-face ("Nasıl Yapılır?" / "How-To") content for a feature.
 *
 * `f.howto` carries the same shape as the front-face feature object
 * (mvp / release / variants / backendVariants / simple / simpleBackend), so
 * `resolveLevel()` is reused on it and the four-axis logic stays identical to
 * the front side. Returns null when the feature has no how-to defined; the UI
 * treats null as "hide the back-face section".
 *
 * @param {object} f - Feature object.
 * @param {"mvp"|"release"} level - Tier.
 * @returns {string | { tr?: string, en?: string } | null}
 */
function resolveHowto(f, level) {
  if (!f || !f.howto) return null;
  return resolveLevel(f.howto, level);
}

/**
 * Translated counterpart of `resolveHowto`. Returns "" when no how-to exists.
 *
 * @param {object} f - Feature object.
 * @param {"mvp"|"release"} level - Tier.
 * @returns {string}
 */
function resolveHowtoText(f, level) {
  const v = resolveHowto(f, level);
  return v ? tx(v) : "";
}

const FRAMEWORK_META = {
  flutter:     { label: "Flutter",          short: "Flutter",      icon: "🐦", aiName: "Flutter / Dart" },
  reactNative: { label: "React Native",     short: "React Native", icon: "⚛",  aiName: "React Native (bare / CLI) / TypeScript" },
  swift:       { label: { tr: "Swift (iOS)",      en: "Swift (iOS)"     }, short: "Swift",        icon: "🍎", aiName: "Swift / SwiftUI (Native iOS)" },
  kotlin:      { label: { tr: "Kotlin (Android)", en: "Kotlin (Android)" }, short: "Kotlin",      icon: "🤖", aiName: "Kotlin / Jetpack Compose (Native Android)" },
  expo:        { label: "Expo",             short: "Expo",         icon: "🚀", aiName: "Expo SDK (Continuous Native Generation, dev client, EAS Build) / React Native / TypeScript" },
  pwa:         { label: { tr: "PWA (Web)",  en: "PWA (Web)" }, short: "PWA",  icon: "🌐", aiName: "Progressive Web App (PWA), full spectrum from a simple website to a web app, HTML/CSS/JS + framework choice flexible (React/Vue/Svelte/Next/Nuxt/SvelteKit/Astro or vanilla)" }
};

/* Reads FRAMEWORK_META.label whether it's a plain string or a {tr,en} object. */
function fwLabel(fw) {
  const m = FRAMEWORK_META[fw];
  if (!m) return fw || "";
  return tx(m.label);
}

const INSTALL_EXAMPLES = {
  flutter:     { tr: "flutter pub add http", en: "flutter pub add http" },
  reactNative: { tr: "npm install axios; native modüller için ek olarak `cd ios && bundle exec pod install`", en: "npm install axios; for native modules also run `cd ios && bundle exec pod install`" },
  swift:       { tr: "Xcode → File → Add Packages... (SPM) veya `pod install` (CocoaPods)", en: "Xcode → File → Add Packages... (SPM) or `pod install` (CocoaPods)" },
  kotlin:      { tr: 'build.gradle.kts → implementation("com.squareup.retrofit2:retrofit:2.11.0")', en: 'build.gradle.kts → implementation("com.squareup.retrofit2:retrofit:2.11.0")' },
  expo:        { tr: "npx expo install expo-image (Expo uyumlu sürümü otomatik seçer)", en: "npx expo install expo-image (auto-picks the Expo-compatible version)" },
  pwa:         { tr: "npm install workbox-window", en: "npm install workbox-window" }
};

const SETUP_ASSUMPTIONS = {
  flutter:     "Assume the developer knows basic Flutter / Dart setup. Prefer current stable Flutter SDK and Dart 3.x idioms.",
  reactNative: "Assume the developer knows basic bare React Native (CLI) setup. Do NOT assume Expo is installed; prefer the modern modular API (v22+).",
  swift:       "Assume the developer knows basic Swift / Xcode setup. Prefer SwiftUI over UIKit unless UIKit is strictly required.",
  kotlin:      "Assume the developer knows basic Kotlin / Android Studio setup. Prefer Jetpack Compose over Views, and the Plugin DSL with the Version Catalog (gradle/libs.versions.toml).",
  expo:        "Assume the developer knows basic Expo SDK 50+ setup including app.config.js, development builds with expo-dev-client, EAS Build and EAS Submit. Prefer Continuous Native Generation (prebuild) over the legacy managed workflow.",
  pwa:         "Assume the developer knows basic web development (HTML/CSS/JS) with a modern framework (React/Vue/Svelte/Next/Nuxt/SvelteKit/Astro) or vanilla JS. Service Worker and manifest.webmanifest are core PWA concepts. Distribution is via HTTPS deploy (Vercel/Netlify/Cloudflare/Firebase Hosting); optionally packaged for stores via PWABuilder/Bubblewrap (TWA). Native simulators, Xcode and Android Studio are NOT required."
};

