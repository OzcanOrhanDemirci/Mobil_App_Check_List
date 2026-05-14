/* Category 14: CI/CD and Automation.
   One of 14 per-category data files split out of js/03-data.js in 1.1.0.
   Each appends its category record onto window.DATA; the array is then
   exposed as the const DATA by js/03-data.js. The split is to lower the
   merge-conflict surface for content contributors. */

(window.DATA = window.DATA || []).push(
  {
    id: "14",
    title: { tr: "CI/CD ve Otomasyon", en: "CI/CD and Automation" },
    sub: { tr: "Build, test ve dağıtımın otomatik koşması; el-değişikliklerinin minimize edilmesi.", en: "Automated build, test and delivery; minimizing manual steps." },
    features: [
      {
        id: "14.1",
        title: { tr: "CI Build Otomasyonu", en: "CI Build Automation" },
        desc: { tr: "Her commit/PR'da uygulamanın otomatik build alınması.", en: "Automatic builds on every commit/PR." },
        variants: {
          flutter: {
            mvp: { tr: "—", en: "—" },
            release: { tr: "<strong>GitHub Actions / Codemagic / Bitrise</strong> ile her PR'da <code>flutter build apk</code> ve (Mac runner'da) <code>flutter build ipa</code> otomatik koşuyor. Build başarısız olursa PR merge edilemiyor (branch protection). <strong>fastlane</strong> ile imzalama ve store upload pipeline'a bağlı.", en: "<strong>GitHub Actions / Codemagic / Bitrise</strong> automatically run <code>flutter build apk</code> and (on a Mac runner) <code>flutter build ipa</code> on every PR. PRs cannot be merged if the build fails (branch protection). Signing and store upload are wired into the pipeline via <strong>fastlane</strong>." }
          },
          reactNative: {
            mvp: { tr: "—", en: "—" },
            release: { tr: "<strong>GitHub Actions / Bitrise / CircleCI</strong> ile her PR'da iOS (<code>xcodebuild archive</code>) ve Android (<code>./gradlew assembleRelease</code>) build'i otomatik koşuyor. <strong>Fastlane</strong> (<code>match</code>, <code>gym</code>, <code>supply</code>) ile imzalama ve store upload otomatize.", en: "<strong>GitHub Actions / Bitrise / CircleCI</strong> automatically run iOS (<code>xcodebuild archive</code>) and Android (<code>./gradlew assembleRelease</code>) builds on every PR. Signing and store upload are automated via <strong>Fastlane</strong> (<code>match</code>, <code>gym</code>, <code>supply</code>)." }
          },
          swift: {
            mvp: { tr: "—", en: "—" },
            release: { tr: "<strong>Xcode Cloud</strong> (Apple yerli, App Store Connect entegre) veya <strong>GitHub Actions + xcodebuild</strong> ile her PR'da archive build koşuyor. <strong>Fastlane match</strong> ile signing certificates senkron; gym ile archive.", en: "<strong>Xcode Cloud</strong> (Apple-native, App Store Connect-integrated) or <strong>GitHub Actions + xcodebuild</strong> runs an archive build on every PR. Signing certificates are kept in sync via <strong>Fastlane match</strong>; archives are built with gym." }
          },
          kotlin: {
            mvp: { tr: "—", en: "—" },
            release: { tr: "<strong>GitHub Actions</strong> veya <strong>Bitrise</strong> ile her PR'da <code>./gradlew assembleRelease</code> + test koşuyor. <strong>Fastlane supply</strong> veya <strong>gradle-play-publisher</strong> plugin ile Play Console'a otomatik upload.", en: "<strong>GitHub Actions</strong> or <strong>Bitrise</strong> runs <code>./gradlew assembleRelease</code> + tests on every PR. Auto-upload to Play Console via <strong>Fastlane supply</strong> or the <strong>gradle-play-publisher</strong> plugin." }
          },
          expo: {
            mvp: { tr: "—", en: "—" },
            release: { tr: "<strong>EAS Build</strong> her PR'da <code>eas build --auto-submit</code> ile bulutta build üretiyor. Lokalde Xcode/Android Studio gerekmiyor. <strong>EAS Workflows</strong> (2024 GA) ile multi-step pipeline tanımlanabilir; <strong>GitHub Actions + EAS CLI</strong> alternatif yol.", en: "<strong>EAS Build</strong> produces a cloud build on every PR via <code>eas build --auto-submit</code>. Xcode/Android Studio are not required locally. Multi-step pipelines can be defined with <strong>EAS Workflows</strong> (GA 2024); <strong>GitHub Actions + EAS CLI</strong> is an alternative path." }
          },
          pwa: {
            mvp: { tr: "Hosting (Vercel / Netlify / Cloudflare Pages / Firebase Hosting) repo'ya bağlanmış; <code>main</code> branch'ine push'ta otomatik deploy ediyor ve PR'larda preview URL üretiyor. <span class='hint'>30 saniyelik kurulum; PWA için CI/CD'nin ilk halkası bu. Build başarısızsa deploy iptal edilir.</span>", en: "Hosting (Vercel / Netlify / Cloudflare Pages / Firebase Hosting) is connected to the repo; pushes to <code>main</code> auto-deploy and PRs produce a preview URL. <span class='hint'>A 30-second setup; for a PWA this is the first link in the CI/CD chain. If the build fails, the deploy is aborted.</span>" },
            release: { tr: "<strong>Vercel / Netlify / Cloudflare Pages / Firebase Hosting</strong> her push'ta otomatik build + <strong>preview URL</strong> üretiyor. Production deploy <code>main</code> branch merge'ünde otomatik. <strong>Branch protection</strong> + status checks (Lighthouse CI, type-check, test) yeşil olmadan merge yok.", en: "<strong>Vercel / Netlify / Cloudflare Pages / Firebase Hosting</strong> auto-build on every push and produce a <strong>preview URL</strong>. Production deploy is automatic on merge to <code>main</code>. <strong>Branch protection</strong> + status checks (Lighthouse CI, type-check, test) must be green to merge." }
          }
        }
        ,
        howto: {
          mvp: {
            tr: "1) GitHub Actions kullan: <code>.github/workflows/</code> klasörüne YAML dosyası ekle. Örneğin <code>ci.yml</code>: \"on: pull_request → checkout → setup language → install deps → run tests\". 2) Framework'üne göre uygun action'ları seç: Flutter <code>subosito/flutter-action</code>; React Native/Expo <code>actions/setup-node</code> + <code>npm ci</code>; Swift Xcode default macOS runner; Kotlin <code>actions/setup-java</code> + Gradle; PWA Node + bundler. 3) Build + test komutlarını çalıştır. Yeşil tik gör. 4) Her PR'da CI çalışması yapılandırıldı, Settings → Branches → <strong>Require status checks before merge</strong>.",
            en: "1) Use GitHub Actions: add a YAML file under <code>.github/workflows/</code>. For example <code>ci.yml</code>: \"on: pull_request → checkout → setup language → install deps → run tests\". 2) Pick appropriate actions per framework: Flutter <code>subosito/flutter-action</code>; React Native/Expo <code>actions/setup-node</code> + <code>npm ci</code>; Swift default macOS runner with Xcode; Kotlin <code>actions/setup-java</code> + Gradle; PWA Node + bundler. 3) Run build + test commands. Get a green check. 4) CI is configured to run on every PR, and Settings → Branches → <strong>Require status checks before merge</strong> is on."
          },
          release: {
            tr: "1) <strong>CI/CD pipeline</strong>'ı genişlet: lint + format check + type check + tests + build. 2) <strong>Secrets</strong> yönetimi: GitHub Settings → Secrets and variables → Actions; API key, signing certificate'ları buraya koy; YAML'da <code>${{ secrets.FIREBASE_TOKEN }}</code> ile kullan. (Bir sonraki adımdaki otomatik yükleme bu sırların hazır olmasını gerektirir.) 3) <strong>Otomatik mağaza yüklemesi</strong>: <strong>Fastlane</strong> (iOS App Store + Android Play Store için), Expo'da <code>eas submit</code>, PWA için host platformunun otomatik deploy'u (Vercel/Netlify). 4) Branch stratejisi: <code>main</code> → production deploy; <code>develop</code> → staging; PR → preview build. 5) Build matrix: birden fazla platform/sürüm aynı anda test edilsin. 6) Cache kullan (<code>actions/cache</code>): node_modules, gradle, pub cache; build süresini azalt. 7) Bir <strong>release tag</strong> push'unda otomatik release notları üretsin (örn. <code>release-please</code>).",
            en: "1) Expand the <strong>CI/CD pipeline</strong>: lint + format check + type check + tests + build. 2) <strong>Secrets</strong> management: GitHub Settings → Secrets and variables → Actions; put API keys, signing certificates there; reference with <code>${{ secrets.FIREBASE_TOKEN }}</code>. (The next step's auto-submission needs these in place first.) 3) <strong>Auto store submission</strong>: <strong>Fastlane</strong> (for iOS App Store + Android Play Store), <code>eas submit</code> for Expo, the host's auto-deploy for PWA (Vercel/Netlify). 4) Branch strategy: <code>main</code> → production deploy; <code>develop</code> → staging; PR → preview build. 5) Build matrix: test multiple platforms/versions in parallel. 6) Use caching (<code>actions/cache</code>): node_modules, gradle, pub cache; cut build time. 7) On a <strong>release tag</strong> push, auto-generate release notes (e.g. <code>release-please</code>)."
          },
          simple: {
            mvp: {
              tr: "1) GitHub'a otomatik kontrol kur: her Pull Request'te <strong>testler ve build otomatik koşsun</strong>. AI'a sor: \"X framework için GitHub Actions ci.yml örneği\". 2) Bu dosyayı <code>.github/workflows/</code> klasörüne ekle ve commit'le. 3) Bir PR aç ve yeşil tik geldiğini gör. 4) GitHub Settings → Branches: ana branch'e merge için \"yeşil tik şart\" kuralını aç.",
              en: "1) Set up automatic checks on GitHub: <strong>tests and build run automatically</strong> on every Pull Request. Ask AI: \"sample GitHub Actions ci.yml for X framework\". 2) Add this file under <code>.github/workflows/</code> and commit. 3) Open a PR and see the green check. 4) GitHub Settings → Branches: require \"green check\" to merge into main."
            },
            release: {
              tr: "1) Gizli bilgileri (API key'ler, imzalama sertifikaları) GitHub'ın <strong>Secrets</strong> bölümüne koy; koda asla yazma. (Bir sonraki adımdaki otomatik yükleme için bunlar gerekli.) 2) Otomasyonu büyüt: test + build + <strong>mağazaya yükleme</strong> tek komutla / push ile yapılsın. AI'a \"Fastlane ile App Store + Play Store'a otomatik yükleme nasıl kurulur\" diye sor. 3) <strong>Branch stratejisi</strong>: main → canlı, develop → test ortamı, PR → preview. 4) Build cache kur (her seferinde sıfırdan indirme); build süresi yarıya iner.",
              en: "1) Put secrets (API keys, signing certificates) in GitHub <strong>Secrets</strong>; never in code. (You need these before the next step's auto-submission can work.) 2) Grow the automation: tests + build + <strong>store submission</strong> happen with one command / push. Ask AI \"how do I set up Fastlane for auto-upload to App Store + Play Store\". 3) <strong>Branch strategy</strong>: main → production, develop → staging, PR → preview. 4) Set up build cache (don't redownload from scratch every time); build time roughly halves."
            }
          }
        }
      },
      {
        id: "14.2",
        title: { tr: "Otomatik Test Çalıştırma (CI)", en: "Automated Test Execution (CI)" },
        desc: { tr: "8.4'te yazılan testlerin CI'da her PR'da koşması; başarısızsa merge bloklanıyor.", en: "Tests written in 8.4 run in CI on every PR; failures block merge." },
        variants: {
          flutter: {
            mvp: { tr: "—", en: "—" },
            release: { tr: "GitHub Actions / Codemagic'te <code>flutter test</code> + <code>flutter analyze</code> her PR'da koşuyor. Coverage raporu PR'a yorum olarak ekleniyor. Test başarısızsa merge BLOKLU.", en: "<code>flutter test</code> + <code>flutter analyze</code> run on every PR in GitHub Actions / Codemagic. Coverage reports are posted as PR comments. Failing tests BLOCK merge." }
          },
          reactNative: {
            mvp: { tr: "—", en: "—" },
            release: { tr: "GitHub Actions'ta <code>npm test</code> + <code>tsc --noEmit</code> + <code>eslint</code> her PR'da koşuyor. Detox/Maestro e2e testleri scheduled job'ta (her gece veya pre-release). Test başarısızsa merge BLOKLU.", en: "<code>npm test</code> + <code>tsc --noEmit</code> + <code>eslint</code> run on every PR in GitHub Actions. Detox/Maestro e2e tests run on a scheduled job (nightly or pre-release). Failing tests BLOCK merge." }
          },
          swift: {
            mvp: { tr: "—", en: "—" },
            release: { tr: "<strong>Xcode Cloud</strong> test plan'ları otomatik koşuyor. Veya GitHub Actions'ta <code>xcodebuild test</code>. Code coverage raporu artifact olarak yükleniyor. Test başarısızsa merge BLOKLU.", en: "<strong>Xcode Cloud</strong> test plans run automatically. Or <code>xcodebuild test</code> in GitHub Actions. Code coverage reports are uploaded as artifacts. Failing tests BLOCK merge." }
          },
          kotlin: {
            mvp: { tr: "—", en: "—" },
            release: { tr: "GitHub Actions'ta <code>./gradlew testDebugUnitTest</code> + <code>connectedAndroidTest</code> (emulator runner ile) her PR'da koşuyor. <strong>Jacoco</strong> coverage raporu PR'a yorum olarak. Test başarısızsa merge BLOKLU.", en: "<code>./gradlew testDebugUnitTest</code> + <code>connectedAndroidTest</code> (with an emulator runner) run on every PR in GitHub Actions. <strong>Jacoco</strong> coverage is posted as a PR comment. Failing tests BLOCK merge." }
          },
          expo: {
            mvp: { tr: "—", en: "—" },
            release: { tr: "GitHub Actions'ta <code>npm test</code> (<code>jest-expo</code>) + <code>tsc</code> + <code>eslint</code> her PR'da. Maestro e2e <strong>EAS Workflows</strong> içinde dev-build ile koşuyor. Test başarısızsa merge BLOKLU.", en: "<code>npm test</code> (<code>jest-expo</code>) + <code>tsc</code> + <code>eslint</code> on every PR in GitHub Actions. Maestro e2e runs in <strong>EAS Workflows</strong> on a dev build. Failing tests BLOCK merge." }
          },
          pwa: {
            mvp: { tr: "—", en: "—" },
            release: { tr: "GitHub Actions / Vercel CI'da <code>vitest</code> / <code>jest</code> + <code>tsc</code> + <strong>Playwright</strong> e2e her PR'da koşuyor. <strong>Lighthouse CI</strong> da PR preview URL'ine karşı performans regression check yapıyor. Test başarısızsa merge BLOKLU.", en: "<code>vitest</code> / <code>jest</code> + <code>tsc</code> + <strong>Playwright</strong> e2e run on every PR in GitHub Actions / Vercel CI. <strong>Lighthouse CI</strong> runs a performance regression check against the PR preview URL. Failing tests BLOCK merge." }
          }
        }
        ,
        howto: {
          mvp: {
            tr: "1) 8.4'te yazılan testleri CI'da her PR'da çalıştır. <code>.github/workflows/test.yml</code> oluştur ve framework'üne uygun adımları ekle: Flutter <code>flutter test</code> + <code>flutter analyze</code>; React Native / Expo <code>npm test</code> + <code>tsc --noEmit</code> + <code>eslint</code>; Swift <code>xcodebuild test -scheme MyApp -destination 'platform=iOS Simulator,name=iPhone 16'</code>; Kotlin <code>./gradlew testDebugUnitTest</code>; PWA <code>npm test</code> (vitest/jest). 2) <code>on: pull_request</code> trigger'ı ile her PR'da koşsun. 3) İlk PR'ı aç ve yeşil tik geldiğini doğrula. 4) GitHub Settings → Branches → <code>main</code> → <strong>Require status checks to pass before merging</strong> aktif; test job'unu zorunlu işaretle. Test kırmızıysa merge butonu pasifleşir.",
            en: "1) Run the tests written in 8.4 on every PR. Create <code>.github/workflows/test.yml</code> with framework-appropriate steps: Flutter <code>flutter test</code> + <code>flutter analyze</code>; React Native / Expo <code>npm test</code> + <code>tsc --noEmit</code> + <code>eslint</code>; Swift <code>xcodebuild test -scheme MyApp -destination 'platform=iOS Simulator,name=iPhone 16'</code>; Kotlin <code>./gradlew testDebugUnitTest</code>; PWA <code>npm test</code> (vitest/jest). 2) Use the <code>on: pull_request</code> trigger so it runs on every PR. 3) Open the first PR and confirm the green check appears. 4) Turn on GitHub Settings → Branches → <code>main</code> → <strong>Require status checks to pass before merging</strong>; mark the test job as required. With a red test, the merge button is disabled."
          },
          release: {
            tr: "1) CI pipeline'ını genişlet: <strong>lint + type-check + unit test + integration test + coverage</strong>; her adım ayrı bir job, paralel koşsun. 2) <strong>Coverage</strong> raporu: Flutter <code>flutter test --coverage</code> → <code>lcov</code>; Jest <code>--coverage</code>; Xcode test plan coverage; Jacoco (Kotlin); Vitest <code>--coverage</code>. <strong>Codecov</strong> veya <strong>Coveralls</strong> ile PR'a yorum olarak coverage delta'sı düşsün. 3) <strong>E2E testler</strong> (Detox / Maestro / Playwright / XCUITest / Espresso) ağır olduğu için her commit'te değil, <strong>scheduled job</strong>'ta (her gece) veya pre-release branch'inde koşsun. 4) Test başarısız olduğunda <strong>artifact yükle</strong>: ekran görüntüleri, video, log'lar; <code>actions/upload-artifact</code> ile zip'le. Yeniden üretmek için altın değerinde. 5) <strong>Flaky test</strong> stratejisi: aralıklı kırılan testleri etiketle ve <strong>retry policy</strong> uygula (örn. 2 deneme); ama \"sürekli flaky\" listesine alıp düzelt. 6) PWA için <strong>Lighthouse CI</strong>: <code>lhci autorun</code> ile her PR preview URL'inde performance regression check; LCP/CLS/INP eşik altı kalırsa fail.",
            en: "1) Expand the CI pipeline: <strong>lint + type-check + unit tests + integration tests + coverage</strong>; each step as a separate job, running in parallel. 2) <strong>Coverage</strong> reports: Flutter <code>flutter test --coverage</code> → <code>lcov</code>; Jest <code>--coverage</code>; Xcode test plan coverage; Jacoco (Kotlin); Vitest <code>--coverage</code>. Post coverage deltas to PR comments via <strong>Codecov</strong> or <strong>Coveralls</strong>. 3) <strong>E2E tests</strong> (Detox / Maestro / Playwright / XCUITest / Espresso) are heavy, so run them on a <strong>scheduled job</strong> (nightly) or on a pre-release branch rather than every commit. 4) On test failure, <strong>upload artifacts</strong>: screenshots, video, logs zipped via <code>actions/upload-artifact</code>. Gold for reproducing the issue. 5) <strong>Flaky test</strong> strategy: tag intermittently failing tests and apply a <strong>retry policy</strong> (e.g. 2 attempts); but put \"always flaky\" tests on a list and fix them. 6) For PWA add <strong>Lighthouse CI</strong>: <code>lhci autorun</code> against the PR preview URL checks performance regressions; LCP/CLS/INP under threshold fails the build."
          },
          simple: {
            mvp: {
              tr: "1) GitHub'a, her Pull Request açıldığında <strong>testlerin otomatik koşacağı</strong> bir kural ekle. AI'a sor: \"X framework için her PR'da testleri çalıştıran GitHub Actions yaml dosyası yaz\". 2) Dosyayı <code>.github/workflows/</code> klasörüne koy ve commit'le. 3) Bir PR aç; sağ altta yeşil tik göründüğünü gör. 4) Settings → Branches kısmından \"ana koda merge için yeşil tik zorunlu\" kuralını aç; bu sayede testler kırmızıysa merge tuşu basılmaz.",
              en: "1) On GitHub, set up a rule so <strong>tests run automatically</strong> on every Pull Request. Ask AI: \"write a GitHub Actions yaml that runs my tests on every PR for X framework\". 2) Put the file under <code>.github/workflows/</code> and commit. 3) Open a PR; confirm the green check shows up. 4) In Settings → Branches, enable \"require green check to merge into main\"; that way the merge button is disabled when tests are red."
            },
            release: {
              tr: "1) CI'da sadece testleri değil, <strong>kod kalitesi kontrollerini</strong> de koştur: yazım hataları (lint), tip kontrolü, biçimlendirme. Hepsi PR'da yeşilse merge'e izin ver. 2) <strong>Kod kapsamı (coverage)</strong> raporu eklet (Codecov gibi); her PR'da \"kod kapsamın şu kadar arttı/azaldı\" gözüksün. 3) Uçtan uca testler (Detox, Maestro, Playwright) ağırdır; her commit'te değil, <strong>her gece</strong> çalışsın. 4) Test başarısızsa hangi ekranda olduğunu görebilmek için <strong>ekran görüntüsü ve video</strong>'yu otomatik kaydet. 5) Bazen testler \"bazen geçer bazen kalır\" davranır (flaky); bunlara not düş, sırayla düzelt, kafayı yeme.",
              en: "1) Make CI run more than tests: add <strong>code quality checks</strong> too (lint, type-check, formatting). Only allow merge when everything is green. 2) Add a <strong>code coverage</strong> report (something like Codecov); every PR shows \"coverage went up/down by X\". 3) End-to-end tests (Detox, Maestro, Playwright) are heavy; run them <strong>nightly</strong> rather than every commit. 4) When tests fail, auto-capture <strong>screenshots and video</strong> so you can see what broke. 5) Sometimes tests are \"flaky\" (pass sometimes, fail other times); note them, fix them in order, don't lose sleep over them."
            }
          }
        }
      },
      {
        id: "14.3",
        title: { tr: "OTA Güncelleme / Hotfix Kanalı", en: "OTA Update / Hotfix Channel" },
        desc: { tr: "Acil hata düzeltmelerini store onayı beklemeden kullanıcılara iletme.", en: "Pushing emergency fixes to users without waiting for store review." },
        variants: {
          flutter: {
            mvp: { tr: "—", en: "—" },
            release: { tr: "<span class='hint'>Flutter'da resmi OTA mekanizması <strong>YOK</strong> (Apple App Store kuralı: native kod OTA güncellenmez). Hızlı fix için <strong>App Store expedited review</strong> (24-48 saat) ve <strong>Play Console staged rollout</strong> kullanılır. Üçüncü taraf çözümler (Shorebird vb.) deneyseldir.</span>", en: "<span class='hint'>Flutter has <strong>NO</strong> official OTA mechanism (Apple App Store rule: native code cannot be OTA-updated). For quick fixes, <strong>App Store expedited review</strong> (24-48 hours) and <strong>Play Console staged rollout</strong> are used. Third-party solutions (Shorebird, etc.) are experimental.</span>" }
          },
          reactNative: {
            mvp: { tr: "—", en: "—" },
            release: { tr: "<strong>Microsoft App Center / CodePush kapatıldı (31 Mart 2025)</strong>. Modern alternatifler: <strong><code>expo-updates</code> standalone</strong> (Expo Go olmadan bare RN'de çalışır, EAS Update'i kullanabilir) veya <strong><code>react-native-ota-hot-update</code></strong>. JS bundle ve asset OTA gönderiliyor. <span class='hint'>Native machine code OTA güncellenemez (Apple App Review Guideline 3.3.2). JavaScriptCore'da yorumlanan JS bundle değişebilir; bu yüzden RN/Expo OTA iOS'ta da çalışır.</span>", en: "<strong>Microsoft App Center / CodePush was retired (March 31, 2025)</strong>. Modern alternatives: <strong><code>expo-updates</code> standalone</strong> (works in bare RN without Expo Go, can use EAS Update) or <strong><code>react-native-ota-hot-update</code></strong>. JS bundle and assets are pushed OTA. <span class='hint'>Native machine code cannot be OTA-updated (Apple App Review Guideline 3.3.2). JS bundles interpreted by JavaScriptCore can change OTA, which is why RN/Expo OTA works on iOS too.</span>" }
          },
          swift: {
            mvp: { tr: "—", en: "—" },
            release: { tr: "<span class='hint'>iOS App Store kuralları gereği (Review Guideline 3.3.2) <strong>native machine code OTA güncellemesi YASAK</strong>; ancak Apple'ın WebKit veya JavaScriptCore'unda yorumlanan kod (JS bundle, JSON config) OTA değişebilir; bu yüzden Expo/RN tarafında <code>expo-updates</code> / EAS Update iOS'ta da çalışır. Saf Swift native kod için OTA YOK. Acil fix için <strong>App Store expedited review</strong> (Apple'a açıklama yazılır, 24-48 saat) kullanılır.</span>", en: "<span class='hint'>Per Apple's App Review Guideline 3.3.2, <strong>OTA updates of native machine code are PROHIBITED</strong>; however, code interpreted by Apple's WebKit or JavaScriptCore (JS bundles, JSON config) can change OTA; that's why Expo/RN's <code>expo-updates</code> / EAS Update works on iOS too. Pure Swift native code has NO OTA path. For emergency fixes, <strong>App Store expedited review</strong> (a justification is sent to Apple, 24-48 hours) is used.</span>" }
          },
          kotlin: {
            mvp: { tr: "—", en: "—" },
            release: { tr: "Native Kotlin kod için resmi OTA <strong>yok</strong>. Acil fix için <strong>Play Console In-App Updates</strong> API'si (<code>flexible</code> veya <code>immediate</code> mode) ile kullanıcıya yeni APK indirme prompt'u gösteriliyor. <strong>Staged rollout</strong> (1% → 5% → 50% → 100%) kullanılarak risk azaltılıyor.", en: "There is <strong>no</strong> official OTA for native Kotlin code. For emergency fixes, the <strong>Play Console In-App Updates</strong> API (<code>flexible</code> or <code>immediate</code> mode) prompts the user to download the new APK. Risk is reduced via <strong>staged rollout</strong> (1% → 5% → 50% → 100%)." }
          },
          expo: {
            mvp: { tr: "—", en: "—" },
            release: { tr: "<strong>EAS Update</strong> ile JS bundle ve asset OTA güncellemesi (native kod hariç). <code>eas.json</code>'da <strong>channel/branch</strong> yapılandırması; production channel sadece signed build'lerin deploy ettiği update'leri alır. <strong>Rollback</strong> stratejisi tanımlı: <code>eas update:rollback --channel production</code> ile son güncelleme geri alınır; belirli bir eski sürümü tekrar yayınlamak için <code>eas update:republish --branch production --group &lt;updateGroupId&gt;</code> kullanılır. Native kod değişikliği için yeni build şart.", en: "<strong>EAS Update</strong> handles OTA updates of JS bundles and assets (excluding native code). <strong>Channel/branch</strong> configuration in <code>eas.json</code>; the production channel only receives updates from signed builds. A <strong>rollback</strong> strategy is in place: <code>eas update:rollback --channel production</code> reverts the latest update; to republish a specific older version, <code>eas update:republish --branch production --group &lt;updateGroupId&gt;</code> is used. Native code changes require a new build." }
          },
          pwa: {
            mvp: { tr: "—", en: "—" },
            release: { tr: "<strong>Service Worker update flow</strong>: yeni SW deploy edildiğinde tarayıcı arka planda indirir, <code>registration.update()</code> çağrısı ile güncellenir. <code>skipWaiting()</code> + <code>clients.claim()</code> ile aktivasyon. Opsiyonel: 'Yeni sürüm var, yenile?' toast gösteriliyor. Cache versiyonlama doğru (<code>workbox.precaching.precacheAndRoute</code> manifest hash ile). <span class='hint'>PWA OTA en hızlı: store onayı yok, deploy saniyeler içinde aktif.</span>" }
          }
        },
        howto: {
          mvp: { tr: "—", en: "—" },
          release: {
            tr: "1) Framework'üne göre OTA mekanizmasını kur: <strong>Expo / React Native</strong>: <code>npx expo install expo-updates</code> + <code>app.config.js</code>'te <code>updates.url</code>; <code>eas update --branch production</code>. CodePush (App Center) 31 Mart 2025'te kapandı; modern yol EAS Update. <strong>PWA</strong>: Service Worker auto-update + <code>skipWaiting()</code> + <code>clients.claim()</code> + 'Yeni sürüm var, yenile?' toast. <strong>Flutter / Native iOS / Native Android</strong>: native kod için resmi OTA YOK (Apple Review Guideline 3.3.2); deneyse Shorebird (Flutter), App Store expedited review, Play Console staged rollout. 2) <strong>Rollback</strong>: bir güncelleme hatalıysa <code>eas update:rollback</code> veya önceki version'ı tekrar yayınla. 3) <strong>Versiyon kontrolü</strong>: her OTA güncellemesinde release notları ve hangi sürüm targeting yapıyor belli olsun. 4) <strong>Test pipeline</strong>: önce internal channel'a deploy, smoke test, sonra production'a. 5) <strong>Update banner</strong>: PWA için kullanıcıya yeni sürüm geldiğini söyleyen toast / banner; \"Yenile\" butonu.",
            en: "1) Set up an OTA mechanism per framework: <strong>Expo / React Native</strong>: <code>npx expo install expo-updates</code> + <code>updates.url</code> in <code>app.config.js</code>; <code>eas update --branch production</code>. CodePush (App Center) was retired on March 31, 2025; the modern path is EAS Update. <strong>PWA</strong>: Service Worker auto-update + <code>skipWaiting()</code> + <code>clients.claim()</code> + a \"New version available, refresh?\" toast. <strong>Flutter / Native iOS / Native Android</strong>: no official OTA for native code (Apple Review Guideline 3.3.2); experimental Shorebird (Flutter), App Store expedited review, Play Console staged rollout. 2) <strong>Rollback</strong>: if an update is broken, run <code>eas update:rollback</code> or republish a previous version. 3) <strong>Version control</strong>: every OTA push should carry release notes and clear targeting. 4) <strong>Test pipeline</strong>: deploy to an internal channel first, smoke test, then production. 5) <strong>Update banner</strong>: for PWAs, show users a toast/banner when a new version is available with a \"Refresh\" button."
          },
          simple: {
            mvp: { tr: "—", en: "—" },
            release: {
              tr: "1) Küçük bir hata oluştuğunda mağaza onayını beklemeden tüm kullanıcılara hızlıca düzeltmeyi göndermek için bir <strong>'OTA' (havadan güncelleme)</strong> kanalı kur. AI'a sor: \"X framework için OTA hotfix nasıl yapılır\". 2) Bu yol Apple'ın kuralları gereği <strong>yalnızca kod değişiklikleri olmayan (Flutter native)</strong> durumlarda mümkün; Expo / React Native / PWA için çalışır. Native Flutter / Swift / Kotlin için 'expedited review' (Apple) ve staged rollout (Google) kullan. 3) Bir hata olursa kolayca <strong>geri al</strong>; AI'a \"rollback nasıl yapılır\" diye sor. 4) Önce küçük bir gruba dene (internal channel), sonra herkese aç.",
              en: "1) To push a fix to all users without waiting for store approval, set up an <strong>OTA (over-the-air update)</strong> channel. Ask AI: \"how do I do an OTA hotfix in X framework\". 2) Due to Apple's rules, this only works <strong>for non-code-change scenarios (Flutter native)</strong>; it does work for Expo / React Native / PWA. For native Flutter / Swift / Kotlin, use 'expedited review' (Apple) and staged rollout (Google). 3) If an update causes issues, you can easily <strong>roll back</strong>; ask AI \"how do I roll back\". 4) Try on a small group first (internal channel), then open to everyone."
            }
          }
        }
      }
    ]
  }
);
