const VALID_FRAMEWORKS = ["flutter", "reactNative", "swift", "kotlin", "expo", "pwa"];
function loadFramework() {
  try {
    const v = localStorage.getItem(FRAMEWORK_KEY);
    return VALID_FRAMEWORKS.includes(v) ? v : null;
  } catch { return null; }
}
function saveFramework(fw) {
  if (!VALID_FRAMEWORKS.includes(fw)) return;
  currentFramework = fw;
  try { localStorage.setItem(FRAMEWORK_KEY, fw); } catch {}
}

/* Bir feature'ın seçili framework'e göre mvp/release değerini döndürür.
   Eğer feature'da variants yoksa, evrenseldir; doğrudan f[level] döner.
   Sonuç {tr, en} objesi olabilir; tx() ile çözülmesi gerekir. */
function resolveLevel(f, level) {
  if (f.variants && currentFramework && f.variants[currentFramework]) {
    return f.variants[currentFramework][level];
  }
  return f[level];
}

/* resolveLevel sonucunu mevcut dile göre düz metne dönüştürür. */
function resolveLevelText(f, level) {
  return tx(resolveLevel(f, level));
}

const FRAMEWORK_META = {
  flutter:     { label: "Flutter",          short: "Flutter",      icon: "🐦", aiName: "Flutter / Dart" },
  reactNative: { label: "React Native",     short: "React Native", icon: "⚛",  aiName: "React Native (bare / CLI) / TypeScript" },
  swift:       { label: { tr: "Swift (iOS)",      en: "Swift (iOS)"     }, short: "Swift",        icon: "🍎", aiName: "Swift / SwiftUI (Native iOS)" },
  kotlin:      { label: { tr: "Kotlin (Android)", en: "Kotlin (Android)" }, short: "Kotlin",      icon: "🤖", aiName: "Kotlin / Jetpack Compose (Native Android)" },
  expo:        { label: "Expo",             short: "Expo",         icon: "🚀", aiName: "Expo SDK (Continuous Native Generation, dev client, EAS Build) / React Native / TypeScript" },
  pwa:         { label: { tr: "PWA (Web)",  en: "PWA (Web)" }, short: "PWA",  icon: "🌐", aiName: "Progressive Web App (PWA), full spectrum from a simple website to a web app, HTML/CSS/JS + framework choice flexible (React/Vue/Svelte/Next/Nuxt/SvelteKit/Astro or vanilla)" }
};

/* FRAMEWORK_META.label'i string veya {tr,en} olarak destekler. */
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

