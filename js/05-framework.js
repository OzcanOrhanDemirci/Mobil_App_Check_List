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

/* Bir feature'ın seçili framework + backend + anlatım stiline göre mvp/release
   değerini döndürür.

   Stil = "simple" iken (yazılım dünyasına uzak kullanıcılar / AI ile uygulama
   geliştirenler) madde seviyesinde tanımlı sade bir metin tercih edilir;
   böylece her framework × backend kombinasyonu için ayrı simple metin yazmaya
   gerek kalmaz (basit anlatım çoğunlukla framework/backend agnostic'tir).
   Yine de backend'e özel sade metin gerekirse simpleBackend kullanılabilir
   (örn. "Backend yok" için "bu maddeyi atla" mesajı).

   Stil = "technical" iken eski davranış aynen sürer.

   Çözüm önceliği:
     A) Stil "simple" ise:
        1. f.simpleBackend[currentBackend][level]   (backend-spesifik sade)
        2. f.simple[level]                          (madde-seviyesi sade default)
        (her ikisi de yoksa B'ye düşer — teknik fallback)
     B) Normal (teknik) sıralama:
        3. f.backendVariants[currentBackend][currentFramework][level]
        4. f.backendVariants[currentBackend]._default[level]
        5. f.variants[currentFramework][level]
        6. f[level]
   Sonuç {tr, en} objesi olabilir; tx() ile çözülmesi gerekir. */
function resolveLevel(f, level) {
  /* A) Basit modda önce madde-seviyesi sade metinleri dene */
  if (typeof currentStyle !== "undefined" && currentStyle === "simple") {
    if (f.simpleBackend && currentBackend && f.simpleBackend[currentBackend] && f.simpleBackend[currentBackend][level] !== undefined) {
      return f.simpleBackend[currentBackend][level];
    }
    if (f.simple && f.simple[level] !== undefined) {
      return f.simple[level];
    }
    /* Sade metin bulunamadı → teknik içeriğe düş (zaten anlaşılır) */
  }
  /* B) Mevcut teknik çözüm sıralaması */
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

/* resolveLevel sonucunu mevcut dile göre düz metne dönüştürür. */
function resolveLevelText(f, level) {
  return tx(resolveLevel(f, level));
}

/* Her madde için "Nasıl Yapılır?" (back-face) içeriğini çözer.
   f.howto, ön yüzdeki feature ile aynı shape'i taşır (mvp / release /
   variants / backendVariants / simple / simpleBackend). Bu sayede
   resolveLevel'i doğrudan f.howto üzerinde çağırmak yeterli; aynı dil
   × stil × framework × backend mantığı ön yüzdeki gibi çalışır.
   How-to tanımlı değilse null döner; UI tarafı bunu hidden olarak ele alır. */
function resolveHowto(f, level) {
  if (!f || !f.howto) return null;
  return resolveLevel(f.howto, level);
}
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

