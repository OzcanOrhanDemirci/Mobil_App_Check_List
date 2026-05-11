/* ==================== BACKEND SEÇİMİ ====================
   Backend, framework gibi davranır: seçilen değer aktif projeye özeldir,
   listedeki backend'e bağlı maddeler bu seçime göre içerik değiştirir veya
   "noBackend" seçildiğinde tamamen gizlenir.

   Veri yolu: proj.data.backend → "firebase" | "supabase" | ... | "noBackend"
   Yeni kullanıcılar welcome akışında bir backend seçer (Adım 4). Eski (v2)
   projelerde alan yoksa migration "firebase" varsayar — çünkü mevcut Backend
   kategorisi başlangıçta Firebase odaklıydı; bu sayede kullanıcı geri uyumlu
   şekilde aynı listeyi görmeye devam eder. */

const VALID_BACKENDS = [
  "noBackend",
  "firebase",
  "supabase",
  "appwrite",
  "pocketbase",
  "amplify",
  "convex",
  "custom",
  "localhost"
];

function loadBackend() {
  const v = getProjectField("backend");
  return VALID_BACKENDS.includes(v) ? v : null;
}

function saveBackend(b) {
  if (!VALID_BACKENDS.includes(b)) return;
  currentBackend = b;
  setProjectField("backend", b);
}

/* Her backend için meta: kısa görünüm etiketi, ikonu, AI'a verilecek tam ad.
   noBackend prompted prominently in UI; kept first in the list. */
const BACKEND_META = {
  noBackend: {
    label:  { tr: "Backend yok",          en: "No backend" },
    short:  { tr: "Backend yok",          en: "No backend" },
    icon:   "🚫",
    aiName: "No backend (the app is fully on-device; no server, no API, no remote data)"
  },
  firebase: {
    label:  "Firebase",
    short:  "Firebase",
    icon:   "🔥",
    aiName: "Firebase (BaaS): Authentication + Firestore (NoSQL) + Storage + Cloud Functions + App Check + FCM"
  },
  supabase: {
    label:  "Supabase",
    short:  "Supabase",
    icon:   "🟢",
    aiName: "Supabase (open-source BaaS on Postgres): Auth + Postgres + Row Level Security + Storage + Edge Functions + Realtime"
  },
  appwrite: {
    label:  "Appwrite",
    short:  "Appwrite",
    icon:   "🟣",
    aiName: "Appwrite (open-source BaaS, self-hosted or Appwrite Cloud): Account/Auth + Databases + Storage + Functions + Realtime"
  },
  pocketbase: {
    label:  "PocketBase",
    short:  "PocketBase",
    icon:   "📦",
    aiName: "PocketBase (single-binary open-source BaaS, SQLite-backed): Auth + Collections + Files + Realtime, ideal for small to medium projects"
  },
  amplify: {
    label:  { tr: "AWS Amplify",          en: "AWS Amplify" },
    short:  { tr: "AWS Amplify",          en: "AWS Amplify" },
    icon:   "☁️",
    aiName: "AWS Amplify Gen 2 (TypeScript-based backend on AWS): Cognito (Auth) + DynamoDB/AppSync (Data) + S3 (Storage) + Lambda (Functions)"
  },
  convex: {
    label:  "Convex",
    short:  "Convex",
    icon:   "⚡",
    aiName: "Convex (reactive backend as a service, TypeScript queries/mutations, end-to-end typed, built-in auth integrations)"
  },
  custom: {
    label:  { tr: "Kendi sunucum",        en: "Self-hosted server" },
    short:  { tr: "Kendi sunucu",         en: "Self-hosted" },
    icon:   "🛠️",
    aiName: "Self-hosted custom backend (your own REST or GraphQL API on a VPS/Docker/Kubernetes, typically Node/Express, FastAPI, Django, Rails, .NET, Go etc.) with JWT/Session auth and your own database"
  },
  localhost: {
    label:  { tr: "Yerel geliştirme",     en: "Local dev backend" },
    short:  { tr: "Localhost",            en: "Localhost" },
    icon:   "💻",
    aiName: "Localhost development backend (a server running on your own machine via http://localhost:PORT or http://10.0.2.2:PORT for Android emulators) for prototyping; not for production"
  }
};

function backendLabel(b) {
  const m = BACKEND_META[b];
  if (!m) return b || "";
  return tx(m.label);
}

function backendShort(b) {
  const m = BACKEND_META[b];
  if (!m) return b || "";
  return tx(m.short);
}

/* SDK / paket kurulumu örnekleri — AI prompt'larında "tam kurulum komutu" satırı
   için kullanılır. backendStep:true olan bir maddede framework+backend kombosuna
   uygun, somut bir kurulum komutu verilir. Eksik combo'lar için her zaman default
   bir fallback komut tanımlı. */
const BACKEND_INSTALL_EXAMPLES = {
  firebase: {
    flutter:     { tr: "flutterfire configure && flutter pub add firebase_core firebase_auth cloud_firestore", en: "flutterfire configure && flutter pub add firebase_core firebase_auth cloud_firestore" },
    reactNative: { tr: "npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore && cd ios && pod install", en: "npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore && cd ios && pod install" },
    swift:       { tr: "Xcode → File → Add Packages → https://github.com/firebase/firebase-ios-sdk → FirebaseAuth + FirebaseFirestore", en: "Xcode → File → Add Packages → https://github.com/firebase/firebase-ios-sdk → FirebaseAuth + FirebaseFirestore" },
    kotlin:      { tr: 'app/build.gradle.kts → implementation(platform("com.google.firebase:firebase-bom:34.0.0")) + implementation("com.google.firebase:firebase-auth")', en: 'app/build.gradle.kts → implementation(platform("com.google.firebase:firebase-bom:34.0.0")) + implementation("com.google.firebase:firebase-auth")' },
    expo:        { tr: "npx expo install firebase  (Expo Go uyumlu JS SDK)", en: "npx expo install firebase  (Expo Go compatible JS SDK)" },
    pwa:         { tr: "npm install firebase", en: "npm install firebase" }
  },
  supabase: {
    flutter:     { tr: "flutter pub add supabase_flutter", en: "flutter pub add supabase_flutter" },
    reactNative: { tr: "npm install @supabase/supabase-js react-native-url-polyfill @react-native-async-storage/async-storage", en: "npm install @supabase/supabase-js react-native-url-polyfill @react-native-async-storage/async-storage" },
    swift:       { tr: "Xcode → Add Packages → https://github.com/supabase-community/supabase-swift", en: "Xcode → Add Packages → https://github.com/supabase-community/supabase-swift" },
    kotlin:      { tr: 'app/build.gradle.kts → implementation("io.github.jan-tennert.supabase:postgrest-kt:VERSION") + auth-kt + storage-kt', en: 'app/build.gradle.kts → implementation("io.github.jan-tennert.supabase:postgrest-kt:VERSION") + auth-kt + storage-kt' },
    expo:        { tr: "npx expo install @supabase/supabase-js react-native-url-polyfill @react-native-async-storage/async-storage", en: "npx expo install @supabase/supabase-js react-native-url-polyfill @react-native-async-storage/async-storage" },
    pwa:         { tr: "npm install @supabase/supabase-js", en: "npm install @supabase/supabase-js" }
  },
  appwrite: {
    flutter:     { tr: "flutter pub add appwrite", en: "flutter pub add appwrite" },
    reactNative: { tr: "npm install react-native-appwrite react-native-url-polyfill", en: "npm install react-native-appwrite react-native-url-polyfill" },
    swift:       { tr: "Xcode → Add Packages → https://github.com/appwrite/sdk-for-apple", en: "Xcode → Add Packages → https://github.com/appwrite/sdk-for-apple" },
    kotlin:      { tr: 'app/build.gradle.kts → implementation("io.appwrite:sdk-for-android:VERSION")', en: 'app/build.gradle.kts → implementation("io.appwrite:sdk-for-android:VERSION")' },
    expo:        { tr: "npx expo install react-native-appwrite react-native-url-polyfill", en: "npx expo install react-native-appwrite react-native-url-polyfill" },
    pwa:         { tr: "npm install appwrite", en: "npm install appwrite" }
  },
  pocketbase: {
    flutter:     { tr: "flutter pub add pocketbase", en: "flutter pub add pocketbase" },
    reactNative: { tr: "npm install pocketbase eventsource", en: "npm install pocketbase eventsource" },
    swift:       { tr: "Doğrudan REST: URLSession + Codable; topluluk SDK'sı opsiyonel", en: "Use the REST API directly: URLSession + Codable; community SDKs are optional" },
    kotlin:      { tr: "Doğrudan REST: Retrofit + kotlinx.serialization; topluluk SDK'sı opsiyonel", en: "Use the REST API directly: Retrofit + kotlinx.serialization; community SDKs are optional" },
    expo:        { tr: "npx expo install pocketbase eventsource", en: "npx expo install pocketbase eventsource" },
    pwa:         { tr: "npm install pocketbase", en: "npm install pocketbase" }
  },
  amplify: {
    flutter:     { tr: "flutter pub add amplify_flutter amplify_auth_cognito amplify_storage_s3 amplify_api", en: "flutter pub add amplify_flutter amplify_auth_cognito amplify_storage_s3 amplify_api" },
    reactNative: { tr: "npm install aws-amplify @aws-amplify/react-native @react-native-async-storage/async-storage", en: "npm install aws-amplify @aws-amplify/react-native @react-native-async-storage/async-storage" },
    swift:       { tr: "Xcode → Add Packages → https://github.com/aws-amplify/amplify-swift", en: "Xcode → Add Packages → https://github.com/aws-amplify/amplify-swift" },
    kotlin:      { tr: 'app/build.gradle.kts → implementation("com.amplifyframework:aws-auth-cognito:VERSION") + storage-s3 + api-aws', en: 'app/build.gradle.kts → implementation("com.amplifyframework:aws-auth-cognito:VERSION") + storage-s3 + api-aws' },
    expo:        { tr: "npx expo install aws-amplify @aws-amplify/react-native @react-native-async-storage/async-storage", en: "npx expo install aws-amplify @aws-amplify/react-native @react-native-async-storage/async-storage" },
    pwa:         { tr: "npm install aws-amplify", en: "npm install aws-amplify" }
  },
  convex: {
    flutter:     { tr: "Resmi Flutter SDK yok: Convex'i HTTP üzerinden çağır veya bir thin proxy kullan. JS tarafı convex-dev/convex ile yazılır.", en: "There is no official Flutter SDK: call Convex over HTTP or use a thin proxy. The JS side is written with convex-dev/convex." },
    reactNative: { tr: "npm install convex && npx convex dev", en: "npm install convex && npx convex dev" },
    swift:       { tr: "Resmi Swift SDK yok: Convex'i HTTP üzerinden çağır (POST /api/run) ya da JS proxy.", en: "No official Swift SDK: call Convex over HTTP (POST /api/run) or use a JS proxy." },
    kotlin:      { tr: "Resmi Kotlin SDK yok: Convex'i HTTP üzerinden Retrofit ile çağır.", en: "No official Kotlin SDK: call Convex over HTTP with Retrofit." },
    expo:        { tr: "npx expo install convex && npx convex dev", en: "npx expo install convex && npx convex dev" },
    pwa:         { tr: "npm install convex && npx convex dev", en: "npm install convex && npx convex dev" }
  },
  custom: {
    flutter:     { tr: "flutter pub add dio  (veya hazır http paketi) + flutter_secure_storage", en: "flutter pub add dio  (or built-in http) + flutter_secure_storage" },
    reactNative: { tr: "npm install axios react-native-keychain", en: "npm install axios react-native-keychain" },
    swift:       { tr: "URLSession ve async/await yerel; Keychain için KeychainAccess (SPM) faydalı", en: "URLSession with async/await is native; KeychainAccess (SPM) helps with Keychain" },
    kotlin:      { tr: 'implementation("com.squareup.retrofit2:retrofit:2.11.0") + EncryptedDataStore (Keystore + Tink)', en: 'implementation("com.squareup.retrofit2:retrofit:2.11.0") + EncryptedDataStore (Keystore + Tink)' },
    expo:        { tr: "npx expo install expo-secure-store && npm install axios", en: "npx expo install expo-secure-store && npm install axios" },
    pwa:         { tr: "fetch yerel; tercihen ofeysiz cookies (HttpOnly + Secure + SameSite=Lax) ile auth", en: "fetch is built-in; prefer HttpOnly + Secure + SameSite=Lax cookies for auth" }
  },
  localhost: {
    flutter:     { tr: "Android emulatorde host: 10.0.2.2 (cihazın localhost'u host PC'yi gösterir). iOS Simulator'da localhost olduğu gibi çalışır.", en: "On Android emulator use host 10.0.2.2 (device localhost points to host PC). iOS Simulator can use localhost directly." },
    reactNative: { tr: "Android emulatorde 10.0.2.2, iOS Simulator'de localhost; cihazda PC'nin LAN IP'si (örn. 192.168.1.10) ve aynı Wi-Fi.", en: "Android emulator: 10.0.2.2; iOS Simulator: localhost; on a real device use the PC's LAN IP (e.g. 192.168.1.10) on the same Wi-Fi." },
    swift:       { tr: "Simulator localhost'a doğrudan ulaşır; cihaz testinde Mac'in LAN IP'si gerek; ATS için NSAppTransportSecurity istisnası açılır.", en: "The Simulator reaches localhost directly; on a real device use the Mac's LAN IP; allow the host via NSAppTransportSecurity for ATS." },
    kotlin:      { tr: "Emulator'de 10.0.2.2; cihaz testinde PC'nin LAN IP'si; res/xml/network_security_config.xml ile cleartextTrafficPermitted=true (DEV ortamı için).", en: "Emulator: 10.0.2.2; real device: PC's LAN IP; res/xml/network_security_config.xml with cleartextTrafficPermitted=true (DEV only)." },
    expo:        { tr: "Geliştirme sırasında Expo zaten LAN IP ile yayın yapar; mobil cihazdan PC'ye doğrudan ulaşılır.", en: "Expo already serves over the LAN IP in dev; a mobile device reaches the PC directly." },
    pwa:         { tr: "Tarayıcıda http://localhost:PORT; HTTPS özellikleri (Service Worker) localhost için tarayıcı tarafından otomatik 'secure context' sayılır.", en: "Browser: http://localhost:PORT; the browser treats localhost as a secure context so Service Workers and PWA features work without HTTPS." }
  }
};

/* AI'a bağlamı vermek için kısa bir setup varsayım metni — backend ne olursa
   olsun, geliştiricinin yeni başlayan biri olduğunu varsayan kısa cümle. */
const BACKEND_SETUP_ASSUMPTIONS = {
  firebase:   "Assume the Firebase project is already created in the Firebase Console and the platform app entries (iOS Bundle ID / Android package + SHA fingerprints) are registered.",
  supabase:   "Assume a Supabase project is already provisioned and the project's URL + anon key are available; SQL migrations are managed via the Supabase Studio or supabase-cli.",
  appwrite:   "Assume an Appwrite project is already created either on Appwrite Cloud or a self-hosted instance, with a platform entry for the app and a project ID + endpoint URL available.",
  pocketbase: "Assume a PocketBase binary is running (locally for dev, on a VPS for prod) and the admin UI has the required collections and rules configured.",
  amplify:    "Assume an Amplify Gen 2 project (TypeScript) is set up with auth + data + storage resources defined; amplify_outputs.json is generated and committed.",
  convex:     "Assume a Convex project is provisioned and `npx convex dev` is running locally; deployment URL and auth provider are configured in the Convex dashboard.",
  custom:     "Assume the developer has a working backend (Node/Express, FastAPI, Django etc.) exposing a documented REST or GraphQL API over HTTPS with JWT-based authentication.",
  localhost:  "Assume the backend runs on http://localhost:PORT on the developer's PC; this is only for development, not production. Use 10.0.2.2 from Android emulator and the LAN IP from real devices.",
  noBackend:  "There is no backend at all. The app is fully on-device. Skip any cloud-dependent items."
};

/* `f.backendStep` olan bir madde currentBackend "noBackend" iken görünmemeli.
   Henüz backend seçilmediyse (welcome akışı tamamlanmadan) de görünmez —
   welcome modalı zaten UI'ı bloke ettiği için bu yalnızca defansif. */
function isHiddenByBackend(f) {
  if (!f || !f.backendStep) return false;
  if (!currentBackend) return true;
  if (currentBackend === "noBackend") return true;
  return false;
}
