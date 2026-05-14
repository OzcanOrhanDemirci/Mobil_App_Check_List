<div align="center">

# Mobil Uygulama Kalite Kontrol Listesi

**Türkçe** · [English](README.en.md)

**Mobil uygulamanı App Store / Play Store'a göndermeden önce eksik bıraktığın hiçbir şey kalmasın diye yazılmış,
14 kategori ve 55 maddelik etkileşimli kalite kontrol listesi.**
_Mobile App Quality Checklist · MVP and Release tiers · per-framework + per-backend guidance · installable PWA._

[![Lisans: MIT](https://img.shields.io/badge/lisans-MIT-yellow.svg)](LICENSE)
[![CI](https://github.com/OzcanOrhanDemirci/Mobil_App_Check_List/actions/workflows/ci.yml/badge.svg)](https://github.com/OzcanOrhanDemirci/Mobil_App_Check_List/actions/workflows/ci.yml)
[![Canlı demo](https://img.shields.io/badge/demo-canl%C4%B1-success)](https://ozcanorhandemirci.github.io/Mobil_App_Check_List/)
[![PWA](https://img.shields.io/badge/PWA-kurulabilir-orange)](https://ozcanorhandemirci.github.io/Mobil_App_Check_List/)
[![Build](https://img.shields.io/badge/build-zero%20config-blueviolet)](#mimari-kararlar)
[![Diller](https://img.shields.io/badge/i18n-TR%20%C2%B7%20EN-lightgrey)](#özellikler)
[![Frameworkler](https://img.shields.io/badge/framework-6-9cf)](#desteklenen-frameworkler-ve-backendler)
[![Backend](https://img.shields.io/badge/backend-9-9cf)](#desteklenen-frameworkler-ve-backendler)

<br />

<a href="https://ozcanorhandemirci.github.io/Mobil_App_Check_List/">
  <img src="og-image.png" alt="Mobil Uygulama Kalite Kontrol Listesi: 14 kategori, 55 madde, MVP ve Release" width="720" />
</a>

<br /><br />

**[Canlı Demo](https://ozcanorhandemirci.github.io/Mobil_App_Check_List/)** ·
**[Özellikler](#özellikler)** ·
**[Mimari](#mimari)** ·
**[Veri Modeli](#veri-modeli)** ·
**[Genişletme](#genişletme)** ·
**[Lisans](#lisans)**

</div>

---

## İçindekiler

- [Neden var?](#neden-var)
- [Özellikler](#özellikler)
- [Ekran görüntüleri](#ekran-görüntüleri)
- [Hızlı başlangıç](#hızlı-başlangıç)
- [Tarayıcı desteği](#tarayıcı-desteği)
- [Mimari](#mimari)
  - [Teknoloji yığını](#teknoloji-yığını)
  - [Dört eksenli içerik çözücü](#dört-eksenli-içerik-çözücü)
  - [Modüler dosya yapısı](#modüler-dosya-yapısı)
  - [PWA stratejisi](#pwa-stratejisi)
- [Proje yapısı](#proje-yapısı)
- [Veri modeli](#veri-modeli)
- [Genişletme](#genişletme)
- [Desteklenen frameworkler ve backendler](#desteklenen-frameworkler-ve-backendler)
- [Mimari kararlar](#mimari-kararlar)
- [Kullanıcı verisi ve gizlilik](#kullanıcı-verisi-ve-gizlilik)
- [Performans](#performans)
- [Sıkça sorulanlar](#sıkça-sorulanlar)
- [Yol haritası](#yol-haritası)
- [Katkıda bulunma](#katkıda-bulunma)
- [Lisans](#lisans)
- [Yazar](#yazar)

---

## Neden var?

Geliştiriciler, hobi projeleri ve özellikle yapay zekâ destekli kod üreticileri (Cursor, Claude, ChatGPT vb.) ile uygulama yazan kişiler için **mağazaya çıkış öncesi yapılacaklar listesi** dağınık, eksik ve büyük ölçüde sezgisel. Tek bir özelliğe başlamak için 100 madde önerebilen sayısız blog yazısı var; ama "yayına hazır mıyım, neyi unuttum?" sorusunu **tek bir yerden, etkileşimli ve hatırlatıcı** olarak cevaplayan bir araç yok.

Bu uygulama o boşluğu doldurur:

- **Uzman geliştirici değilsin diye gözden kaçırabileceğin 55 madde** burada yazılı.
- Her madde **iki seviyede** ölçülür: MVP (en küçük çalışan ürün) ve Release (mağaza onayına hazır).
- Her madde **adım adım nasıl yapılır rehberi** içerir; AI asistanına yapıştırılabilir.
- İçerik **senin teknoloji yığınına** göre uyarlanır: Flutter mı, Swift mi? Firebase mi, Supabase mi? Kod örnekleri buna göre değişir.
- **Türkçe ve İngilizce** olarak; **Basit** veya **Teknik** anlatımla.
- Tarayıcıdan kurulabilir bir uygulama (PWA), internet olmadan da çalışır.

> **Hedef kitle:** indie geliştiriciler, öğrenciler, üniversite projeleri, hackathon ekipleri, bootcamp katılımcıları, AI asistanlarıyla uygulama yapan yarı-teknik kullanıcılar ve mağaza onayını ilk denemede geçirmek isteyen ekipler.

---

## Özellikler

<table>
<tr>
<td width="50%" valign="top">

### İçerik

- **14 kategori**, **55 madde**: planlama, tasarım, kod düzeni, Git, API, backend, offline, test, güvenlik, erişilebilirlik, yayın, monetizasyon, analitik, CI/CD
- Her madde **iki seviye** (MVP / Release) ile işaretlenir
- Her madde için **adım adım nasıl yapılır rehberi** (kartın arka yüzü)
- Adımlar **tek tek işaretlenebilir**; ilerleme yüzdesi otomatik hesaplanır
- **2 dil** (TR · EN) · **2 anlatım stili** (Basit · Teknik)
- **2 kullanım biçimi**: Geliştirme (kendi uygulamamı yapıyorum) · İnceleme (başkasının uygulamasını denetliyorum)

</td>
<td width="50%" valign="top">

### Akıllı uyarlanma

- **6 framework** desteği: Flutter · React Native · Swift (iOS) · Kotlin (Android) · Expo · PWA
- **9 backend** desteği: Firebase · Supabase · Appwrite · PocketBase · AWS Amplify · Convex · Kendi sunucum · Yerel geliştirme · Backend yok
- Seçilen kombinasyona göre içerik **otomatik değişir**: paket adları, kod örnekleri, kurulum komutları
- "Backend yok" seçilince **anlamsız maddeler tamamen gizlenir**
- **Yapay zekâya hazır prompt üretici**: madde içeriğini ve kullanıcı seçimlerini AI'a doğrudan yapıştırılabilir markdown/JSON olarak verir

</td>
</tr>
<tr>
<td valign="top">

### Çoklu proje

- Aynı listede **20'ye kadar proje** tutulabilir
- Her projenin **işaretleri, notları ve yığını** ayrı saklanır
- Projeler arası **anında geçiş** (üst alandaki pille)
- **JSON ile dışa/içe aktarma**: işaretleri ve notları yedekle, başka cihazda devam et

</td>
<td valign="top">

### Görünüm ve etkileşim

- **Açık / koyu tema** (sistem tercihine uyarlanır)
- **Arama**: 55 madde içinde anında metin araması (`/` tuşu ile odaklanır)
- **Filtre**: Yapılacak / Yapılan / Tümü × MVP / Release / İkisi
- **Sunum modu** (`P` tuşu): tek tıkla projeksiyon için tam ekran
- **Yazdır / PDF**: hem kontrol listesi hem Nasıl Yapılır? rehberi formatları
- **Tek tıkla yükle**: ana ekrana / başlat menüsüne kurulabilir
- **Offline çalışır**: Service Worker önbelleği ile internet kopsa da açılır
- **A11y**: yüksek kontrast paleti, klavye navigasyonu, focus-visible outline'ları, semantik ARIA rolleri

</td>
</tr>
</table>

---

## Ekran görüntüleri

<p align="center">
  <a href="https://ozcanorhandemirci.github.io/Mobil_App_Check_List/">
    <img src="og-image.png" alt="Sosyal önizleme görseli (1200x630)" width="640" />
  </a>
  <br />
  <em>Sosyal önizleme görseli (Open Graph, 1200x630).</em>
</p>

> Aşağıdaki görseller yer tutucudur. Gerçek ekran görüntüleri için `scripts/capture-screenshots.mjs` script'ini çalıştırın (kullanım aşağıda).

<table>
  <tr>
    <td align="center" width="50%">
      <a href="assets/screenshots/01-welcome.png">
        <img src="assets/screenshots/01-welcome.png" alt="Karşılama ekranı: ilk açılışta kısa tanıtım" width="100%" />
      </a>
      <br />
      <sub><strong>1. Karşılama</strong>: ilk açılışta gösterilen tanıtım modali.</sub>
    </td>
    <td align="center" width="50%">
      <a href="assets/screenshots/02-checklist.png">
        <img src="assets/screenshots/02-checklist.png" alt="Ana liste: 14 kategori, 55 madde, MVP ve Release filtreleri" width="100%" />
      </a>
      <br />
      <sub><strong>2. Ana liste</strong>: 14 kategori, MVP ve Release filtreleriyle 55 madde.</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <a href="assets/screenshots/03-card-flip.png">
        <img src="assets/screenshots/03-card-flip.png" alt="Kart çevirildiğinde adım adım rehber" width="100%" />
      </a>
      <br />
      <sub><strong>3. Kart detayı</strong>: ters yüze çevrildiğinde adım adım nasıl yapılır rehberi.</sub>
    </td>
    <td align="center" width="50%">
      <a href="assets/screenshots/04-help.png">
        <img src="assets/screenshots/04-help.png" alt="Yardım modali: kısa kullanım kılavuzu" width="100%" />
      </a>
      <br />
      <sub><strong>4. Yardım</strong>: kısa kullanım kılavuzu ve sık sorulanlar.</sub>
    </td>
  </tr>
</table>

### Ekran görüntülerini yeniden üretmek (opsiyonel)

Görselleri kendiniz oluşturmak isterseniz `scripts/capture-screenshots.mjs` script'i Playwright'la çalışan yerel sunucudan otomatik yakalama yapar.

```bash
# 1) Playwright'ı geliştirme bağımlılığı olarak kurun (package.json'a kalıcı eklemiyoruz):
npm install -D playwright
npx playwright install chromium

# 2) Repo kökünde basit bir statik sunucu başlatın:
npx serve .                       # http://localhost:3000
# veya
python -m http.server 5500        # http://localhost:5500

# 3) Yakalama script'ini çalıştırın (varsayılan URL http://localhost:3000):
node scripts/capture-screenshots.mjs
# Farklı port için:
BASE_URL=http://localhost:5500 node scripts/capture-screenshots.mjs
```

Script çıktıları `assets/screenshots/*.png` olarak yazar; gerçek görseller hazır olduğunda yukarıdaki markdown bağlantılarını `.svg` yerine `.png` olarak güncelleyebilirsiniz.

---

## Hızlı başlangıç

### 1. Tarayıcıda kullanmak

En kolay yol: canlı demo'yu aç.

> [https://ozcanorhandemirci.github.io/Mobil_App_Check_List/](https://ozcanorhandemirci.github.io/Mobil_App_Check_List/)

İlk açılışta seni karşılayan **7 adımlık karşılama akışı** dil, kullanım biçimi, anlatım stili, proje adı, framework ve backend tercihini sorar. Birkaç tıkla başlarsın.

### 2. Cihaza kurmak (PWA)

| Platform             | Adım                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| **Android / Chrome** | Adres çubuğunun yanındaki **Yükle** simgesi veya menüden _"Ana ekrana ekle"_                     |
| **iOS / Safari**     | Paylaş düğmesi → **Ana Ekrana Ekle**                                                             |
| **Windows / Edge**   | Adres çubuğunda **Yükle** simgesi veya _Ayarlar → Uygulamalar → Bu siteyi uygulama olarak yükle_ |
| **macOS / Chrome**   | Adres çubuğunda **Yükle** simgesi                                                                |

Kurulduktan sonra **standalone** modda açılır (tarayıcı çerçevesi yok), **offline** çalışır ve **dock / başlat menüsünde** kendi simgesiyle yer alır.

### 3. Yerel olarak çalıştırmak

Build adımı yok. Statik dosyalar.

```bash
# Repoyu klonla
git clone https://github.com/OzcanOrhanDemirci/Mobil_App_Check_List.git
cd Mobil_App_Check_List

# Yerel sunucu başlat (Service Worker file:// üzerinde çalışmaz)
python -m http.server 8080
# veya
npx serve .

# Sonra tarayıcıda:
# http://localhost:8080
```

### 4. Kendi GitHub Pages'inde yayınlamak

1. Repoyu **fork** et.
2. _Settings → Pages → Source: `main` / `(root)`_.
3. 1-2 dakikada `https://<kullanıcı-adın>.github.io/Mobil_App_Check_List/` üzerinden yayında olur.

Custom domain istersen `CNAME` dosyası ekle; ek yapılandırma gerekmez.

---

## Tarayıcı desteği

| Tarayıcı                          | Sürüm     | PWA install               | Offline |
| --------------------------------- | --------- | ------------------------- | ------- |
| Chrome / Edge (masaüstü ve mobil) | 90+       | Evet                      | Evet    |
| Safari (iOS ve macOS)             | 15+       | Evet (Add to Home Screen) | Evet    |
| Firefox (masaüstü ve mobil)       | 90+       | Kısıtlı (mobilde)         | Evet    |
| Samsung Internet                  | 14+       | Evet                      | Evet    |
| Opera                             | son sürüm | Evet                      | Evet    |

> ES2020+ syntax, CSS custom properties, Service Worker ve localStorage kullanır. Internet Explorer **desteklenmez**.

---

## Mimari

### Teknoloji yığını

| Katman         | Seçim                                   | Neden                                                                                                                                        |
| -------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| HTML           | Tek `index.html` (~1100 satır)          | PWA olarak servis edilen tek bir entry point; tüm modaller statik HTML olarak gömülü, JS bunları gösterir/gizler.                            |
| CSS            | 6 dosya, vanilla CSS                    | Build tool yok. CSS custom properties ile tema değişimi. Print stilleri ayrı dosya.                                                          |
| JS             | 16 dosya, vanilla ES2020+               | Build/transpile/bundling yok. `<script>` etiketleri ile sıralı yüklenir (numaralı dosyalar sırayı belirler).                                 |
| Veri           | Tek bir `DATA` sabiti (`js/03-data.js`) | 14 kategori × 55 madde, dil/stil/framework/backend varyantlarıyla. Tamamı statik JS objesi; build veya fetch yok.                            |
| Service Worker | Network-first + cache fallback          | `sw.js` ~30 satır; her aynı-origin GET önce ağa gider, başarılı yanıtlar cache'e yazılır, ağ kopuşunda son cache'lenmiş sürüm servis edilir. |
| Depolama       | `localStorage`                          | Tüm kullanıcı verisi (işaretler, notlar, projeler) tarayıcıda kalır; sunucuya hiçbir şey gitmez.                                             |

### Dört eksenli içerik çözücü

Aynı madde, kullanıcının seçimine göre **dört eksende** farklı görünebilir:

```
Görünen içerik = f(dil, anlatım stili, framework, backend)
                   TR/EN   Basit/Teknik    6 seçenek   9 seçenek
```

Toplam teorik kombinasyon sayısı **216** (`2 × 2 × 6 × 9`); ama her madde için bunların hepsini ayrı ayrı yazmaya gerek yok. **Öncelik zinciri** sayesinde sadece **gerçekten farklılaşan** içerik yazılır:

```js
// js/05-framework.js
function resolveLevel(feature, level /* "mvp" | "release" */) {
  // A) Stil = "simple" ise önce sade metinleri dene
  if (currentStyle === "simple") {
    if (feature.simpleBackend?.[currentBackend]?.[level]) {
      return feature.simpleBackend[currentBackend][level]; // en spesifik
    }
    if (feature.simple?.[level]) {
      return feature.simple[level]; // tüm yığına ortak sade
    }
    // sade metin yok ise teknik içeriğe düş
  }

  // B) Teknik (varsayılan) sıralama
  if (feature.backendVariants?.[currentBackend]) {
    const node = feature.backendVariants[currentBackend];
    if (node[currentFramework]?.[level]) return node[currentFramework][level];
    if (node._default?.[level]) return node._default[level];
  }
  if (feature.variants?.[currentFramework]?.[level]) {
    return feature.variants[currentFramework][level];
  }
  return feature[level]; // en geneli
}
```

Bu sayede bir madde sadece **bir kez** yazılır ve **gerektiği yerde** özelleşir. Ortalama bir maddede 3-4 varyant tanımlıdır; 216 kombinasyonun hiçbiri "boş" görünmez.

### Modüler dosya yapısı

JS dosyaları sırayla yüklenir; her dosyanın **tek sorumluluğu** vardır:

```
01-i18n-strings.js   UI dize sözlüğü (TR/EN), t() ve tx() çözücüler
02-help-content.js   Yardım modalının HTML içeriği
03-data.js           14 kategori, 55 madde, varyantlar (~3000 satır)
04-projects.js       Çoklu proje depolama (20 limit, migration)
04-storage.js        İşaret/not/açık-kapalı durum wrapper'ı
05-framework.js      6 framework tanımı + dört eksenli resolver
05-backend.js        9 backend tanımı + "Backend yok"da gizleme
06-view-state.js     currentFramework / currentBackend / view modu
07-ui-helpers.js     Tema, modal helper'ları, toast
08-i18n-dom.js       DOM'a i18n uygula, dil değiştir
09-ai-prompt.js      Markdown + JSON AI prompt üreticisi
10-clipboard.js      Panoya kopyalama helper'ı
11-render.js         Ana render döngüsü, kart şablonu
12-progress.js       Yüzde hesabı, kutlamalar
13-filters.js        Arama + 3×3 görünüm filtresi
14-welcome.js        7 adımlı karşılama akışı + welcome yardım
15-projects.js       Proje / framework / backend modal'ı + CRUD
16-presentation.js   Sunum modu (P tuşu, ESC, ok tuşları)
17-install.js        PWA install banner + platforma özel manuel
18-app.js            Orkestrasyon: toolbar, sıfırlama, kilit, yardım
                     accordion, yazdırma, dışa/içe aktarma, klavye
                     kısayolları, PWA manifest/SW kurulumu, init
```

Build aracı, transpile veya dependency yok. Yeni bir geliştirici (veya yapay zekâ asistanı) projeyi **dakikalar içinde** anlayabilir.

### PWA stratejisi

- `manifest.webmanifest` standalone modu açar, ikonları (inline SVG, hem `any` hem `maskable`) tanımlar.
- `sw.js` **network-first + cache fallback** stratejisi: her aynı-origin GET isteği önce ağdan denenir, başarılı yanıtlar `mobil-kontrol-v3` cache'ine yazılır; ağ erişimi koptuğunda son cache'lenmiş sürüm anlık servis edilir. Eski cache anahtarları `activate`'te otomatik temizlenir.
- `./sw.js` yüklenemezse (ör. `file://` üzerinden açılan tek-dosya senaryoları) JS bir **blob URL üzerinden fallback Service Worker** kaydetmeye çalışır; Chromium blob URL'li SW'yi reddederse sessizce geçer.
- HTTPS üzerinden servis edilince Chrome / Edge / Safari "Yükle" önerisini otomatik olarak gösterir.

---

## Proje yapısı

```text
Mobil_App_Check_List/
├── index.html                Tek sayfa: modaller + script yükleme sırası
├── manifest.webmanifest      PWA manifesti (ad, ikon, tema rengi, scope)
├── sw.js                     Service Worker (network-first + offline fallback)
├── og-image.png              1200×630 sosyal medya önizleme görseli
├── .nojekyll                 GitHub Pages Jekyll davranışını kapatır
├── .gitignore                Yerel araç çıktıları (OS / editör artıkları)
├── LICENSE                   MIT
├── README.md                 Türkçe (ana dosya)
├── README.en.md              İngilizce versiyon
├── css/
│   ├── 01-base.css           Reset, CSS custom properties, base tipografi
│   ├── 02-layout.css         Hero, sayfa düzeni, proje pili
│   ├── 03-categories.css     Kategori kartları, madde kartları, flip
│   ├── 04-presentation.css   Sunum modu (tam ekran odak)
│   ├── 05-modals.css         Tüm modaller, karşılama akışı, ızgaralar
│   └── 06-responsive-print.css Mobil + tablet + masaüstü + yazdırma
└── js/
    └── 16 dosya (yukarıdaki tabloya bak)
```

---

## Veri modeli

Bir madde (feature) zaman içinde tamamen geriye uyumlu olacak şekilde genişledi. Tüm alanlar opsiyoneldir; resolver eksik olanları üst seviyeden tamamlar:

```js
{
  id: "6.1",
  title: { tr: "...", en: "..." },
  desc:  { tr: "...", en: "..." },

  // 1) Evrensel fallback: framework / backend / stil belirtilmedikçe bu görünür
  mvp:     { tr: "...", en: "..." },
  release: { tr: "...", en: "..." },

  // 2) Framework eksen varyantları
  variants: {
    flutter:     { mvp: {tr, en}, release: {tr, en} },
    reactNative: { ... },
    swift:       { ... },
    kotlin:      { ... },
    expo:        { ... },
    pwa:         { ... }
  },

  // 3) Backend eksen varyantları
  backendStep: true,           // true ise "Backend yok"da madde tamamen gizlenir
  backendVariants: {
    firebase: {
      _default: { mvp, release },              // backend-genel
      flutter:  { mvp, release },              // opsiyonel framework override
      reactNative: { ... },
    },
    supabase:  { _default: { ... } },
    appwrite:  { _default: { ... } },
    // ...
  },

  // 4) Anlatım stili "Basit" iken kullanılan metinler
  simple: {
    mvp:     { tr: "...", en: "..." },
    release: { tr: "...", en: "..." }
  },
  // Opsiyonel: backend-spesifik sade metin (örn. "Backend yok"a özel uyarı)
  simpleBackend: {
    noBackend: {
      mvp:     { tr, en },
      release: { tr, en }
    }
  }
}
```

**Çözüm önceliği (`resolveLevel`):**

```
Stil = "Basit" ise:
  1. simpleBackend[backend][level]        → en spesifik
  2. simple[level]                        → tüm yığına ortak sade

Teknik (varsayılan) sıralama:
  3. backendVariants[backend][framework][level]
  4. backendVariants[backend]._default[level]
  5. variants[framework][level]
  6. feature[level]                       → en geneli
```

> Yani **bir maddenin tüm 216 kombinasyonu**, çoğunlukla 2-4 metin yazılarak doldurulabilir. Sade metin yazıldığında otomatik olarak 108 (6×9×2) tek yerden gelir; backend-spesifik içerik gerekirse yalnızca o varyant yazılır.

---

## Genişletme

### Yeni madde eklemek

`js/03-data.js` içinde uygun kategorinin `features` dizisine bir obje ekle:

```js
{
  id: "6.7",
  title: { tr: "Webhook entegrasyonu", en: "Webhook integration" },
  desc:  { tr: "Backend olaylarını dışarı haberleştir.",
           en: "Notify external services of backend events." },
  mvp:     { tr: "...", en: "..." },
  release: { tr: "...", en: "..." },
  howto: {
    mvp:     { tr: "1) ...", en: "1) ..." },
    release: { tr: "1) ...", en: "1) ..." }
  }
}
```

Madde anında ön yüzde + arka yüzde (Nasıl?) çıkar. Backend'e bağlıysa `backendStep: true` ekle: backend "yok" seçildiğinde otomatik gizlenir.

### Yeni framework eklemek

1. `js/05-framework.js` → `VALID_FRAMEWORKS` + `FRAMEWORK_META` (label/kısa ad/ikon/AI prompt) + `INSTALL_EXAMPLES` + `SETUP_ASSUMPTIONS`.
2. `js/05-backend.js` → her backend için `BACKEND_INSTALL_EXAMPLES.{backend}.{yeni-framework}` satırını ekle.
3. `index.html` içinde karşılama (`data-welcome-fw="..."`), framework değiştirici (`data-switch-fw="..."`) ve yeni proje (`data-add-fw="..."`) gridlerine birer kart ekle.

Var olan maddelerin **çoğu** yeni framework için otomatik olarak `variants[framework]` tanımsız → evrensel fallback'e düşer. Spesifik kod örnekleri istediğin maddelerde ilgili `variants[yeni-framework]` veya `backendVariants[*][yeni-framework]` bloklarını doldur.

### Yeni backend eklemek

Aynı pattern: `js/05-backend.js` → `VALID_BACKENDS` + `BACKEND_META` + `BACKEND_INSTALL_EXAMPLES` + `BACKEND_SETUP_ASSUMPTIONS`. `index.html` içinde karşılama (`data-welcome-be="..."`) ve backend değiştirici (`data-switch-be="..."`) gridlerine birer kart ekle. Maddelerin backend'e bağlı kısımlarında `backendVariants.{yeni-backend}._default` blokları yazılır.

### Yeni dil eklemek

1. `js/01-i18n-strings.js` → `UI_STRINGS` objesine her anahtarın yeni dildeki karşılığını ekle (örn. `de` için Almanca).
2. `js/03-data.js` → her `{tr, en}` çiftinin yanına `de` alanı ekle.
3. Hero'daki dil pilini ve `applyI18nToDom`'u yeni anahtara genişlet.

Resolver otomatik olarak `obj[currentLang]` döndürdüğü için ekleme yapısal olarak risksizdir.

---

## Desteklenen frameworkler ve backendler

<table>
<tr>
<th>Framework</th>
<th>İkon</th>
<th>AI prompt etiketi</th>
<th>Karşılama dilinde</th>
</tr>
<tr><td>Flutter</td><td>🐦</td><td>Flutter / Dart</td><td>Flutter</td></tr>
<tr><td>React Native</td><td>⚛</td><td>React Native (bare / CLI) / TypeScript</td><td>React Native</td></tr>
<tr><td>Swift (iOS)</td><td>🍎</td><td>Swift / SwiftUI (Native iOS)</td><td>Swift</td></tr>
<tr><td>Kotlin (Android)</td><td>🤖</td><td>Kotlin / Jetpack Compose (Native Android)</td><td>Kotlin</td></tr>
<tr><td>Expo</td><td>🚀</td><td>Expo SDK (CNG, dev client, EAS Build)</td><td>Expo</td></tr>
<tr><td>PWA</td><td>🌐</td><td>Progressive Web App (HTML/CSS/JS)</td><td>PWA</td></tr>
</table>

<table>
<tr>
<th>Backend</th>
<th>İkon</th>
<th>Açıklama</th>
</tr>
<tr><td>Firebase</td><td>🔥</td><td>Google'ın BaaS'i: Auth + Firestore + Storage + Cloud Functions + App Check + FCM</td></tr>
<tr><td>Supabase</td><td>🟢</td><td>Açık kaynak Firebase alternatifi: Postgres + Row Level Security + Realtime + Edge Functions</td></tr>
<tr><td>Appwrite</td><td>🟣</td><td>Self-host veya Appwrite Cloud üzerinde açık kaynak BaaS</td></tr>
<tr><td>PocketBase</td><td>📦</td><td>Tek binary, SQLite tabanlı; küçük ve orta projeler için ideal</td></tr>
<tr><td>AWS Amplify</td><td>☁️</td><td>Amplify Gen 2 (TypeScript): Cognito + DynamoDB/AppSync + S3 + Lambda</td></tr>
<tr><td>Convex</td><td>⚡</td><td>TypeScript-first reactive backend (end-to-end typed query/mutation)</td></tr>
<tr><td>Kendi sunucum</td><td>🛠️</td><td>Kendi REST/GraphQL API'n (Node/Python/Go/Rust/Ruby/.NET)</td></tr>
<tr><td>Yerel geliştirme</td><td>💻</td><td>Localhost / LAN üzerinde geliştirme sunucusu (production önerilmez)</td></tr>
<tr><td>Backend yok</td><td>🚫</td><td>Tamamen istemci tarafı; backend gerektiren maddeler otomatik gizlenir</td></tr>
</table>

---

## Mimari kararlar

<details>
<summary><strong>Neden build adımı yok?</strong></summary>

<br />

Bu, sürdürülebilirliği ve katkıyı kolaylaştıran kasıtlı bir karardır:

- Yeni katkıcı `git clone` yapıp `index.html`'i açar. Bitti.
- Bağımlılık güncellemeleri yok, lock file çatışmaları yok, `node_modules` yok.
- Build hatası diye bir kavram yok; tarayıcı kodu olduğu gibi çalıştırır.
- Dosyaları doğrudan düzenle, sayfayı yenile, sonucu gör.
- 5 yıl sonra bile aynı şekilde çalışacak; ekosistemde build aracı bağımlılıkları kırılsa bile.

Karşı argüman: bundle boyutu ve performans. Tüm statik dosyalar (HTML + CSS + JS) gzip sonrası **~380 KB**; büyük kısmı 55 madde × dört eksende çoklu varyant taşıyan içerik veri dosyasından gelir. İlk ziyaretten sonra Service Worker önbelleği ağ trafiğini neredeyse sıfırlar.

</details>

<details>
<summary><strong>Neden vanilla JS / CSS, framework yok?</strong></summary>

<br />

- **Kapsam küçük**: tek bir kontrol listesi sayfası; React'in çözdüğü hiçbir gerçek karmaşıklık yok.
- **Erişim engeli düşük**: HTML/CSS/JS bilen herkes katkı sağlayabilir; React/Vue/Svelte öğrenme zorunluluğu yok.
- **Yük süresi**: framework yükü yok; ilk render anlık.
- **Eksiklik yok**: state yönetimi, render, event delegation, history hepsi vanilla ile rahatlıkla yapılır.

Bu basit kararın bedeli: kod tabanı **çok az soyutlanmış**; `index.html` 1100 satır, en uzun JS dosyası 3000 satır. Bunun karşılığında işin tamamı görünür ve okunabilir.

</details>

<details>
<summary><strong>Neden tüm veri tek bir <code>DATA</code> sabitinde?</strong></summary>

<br />

55 madde × dört eksende (dil × stil × framework × backend) varyantları taşıyan `js/03-data.js` ham hâliyle ~835 KB. İlk bakışta "bunu lazily yüklemek lazım" demek isteyebilirsin. Yapmadık çünkü:

- Kullanıcı **birkaç madde** değil, **tüm listeyi** görmek için geliyor: arama, filtre ve sunum modu listenin tamamı belleğe yüklenmişken anlamlı.
- Tüm asset'ler gzip sonrası ~380 KB; çoğu bağlantıda saniyenin altında iniyor.
- Service Worker ilk başarılı ziyaretten sonra cache'i dolduruyor; internet kopsa da uygulama açılıyor.
- Lazy loading mimarisi (kategori başına dosya, dinamik import vb.) build adımı gerektirirdi → "vanilla JS" kararını kırardı.

Veri büyürse (örn. 200 madde) bu kararı yeniden düşünmek gerekir.

</details>

<details>
<summary><strong>Neden <code>localStorage</code> (IndexedDB değil)?</strong></summary>

<br />

Tüm kullanıcı verisi (işaretler, notlar, projeler) **toplamda birkaç KB**. IndexedDB'nin getirdiği async/transaction overhead'i bu boyutta gereksiz.

`localStorage` senkron API'sinin avantajı: render sırasında doğrudan okunabilir, sayfa yenilenince ilk frame'de doğru veri görünür. IndexedDB ile bunu yapmak için ek state yönetimi gerekir.

Sınırlama: ~5 MB / origin. 20 proje × yüzlerce işaret bile bunun altında.

</details>

<details>
<summary><strong>Neden kategori başına ayrı CSS / JS dosyası?</strong></summary>

<br />

Bir dev tek bir özellik üzerinde çalışırken **sadece o dosyaya** odaklanabilsin diye. Her dosyanın adı (`01-base.css`, `11-render.js`...) sorumluluğunu açıklar; sıralama da `<link>` ve `<script>` etiket sırasıyla deterministik.

HTTP/2 ile çoklu küçük dosya, tek bir bundle'dan **anlamlı ölçüde** yavaş değil. Eğer ilerde gerçekten bir performans sorunu çıkarsa minify + concat script bir gecede eklenir.

</details>

<details>
<summary><strong>Neden Simple/Technical anlatım stili?</strong></summary>

<br />

Modern uygulama geliştirme **AI destekli** hâle geldi ve geliştirenlerin **önemli bir kısmı** yazılım dünyasına uzak. Bir öğretmen, bir avukat, bir mağaza sahibi Cursor / Claude ile uygulama yazabiliyor; ama "Riverpod 3.x AsyncNotifier" gibi bir madde okuduğunda kapanıyor.

**Basit** stili package isimleri, sürüm numaraları, akronimler, dosya yolları içermez; günlük hayattan metaforlar kullanır ("telefonun güvenli çekmecesi", "ekran okuyucusu"). **Teknik** stili tüm detayı verir.

Aynı içerik, kullanıcının seçimine göre **farklı kelimelerle** gösterilir. Bu, ürünün eşi olmayan farklarından biridir.

</details>

---

## Kullanıcı verisi ve gizlilik

- **Hiçbir veri sunucuya gitmez.** Tüm işaretler, notlar ve proje yapılandırmaları **yalnızca senin tarayıcında** (`localStorage`) yaşar.
- **Analytics yok**, **çerez yok**, **3. parti tracker yok**.
- **JSON export/import** ile kendi verini başka cihaza taşıyabilirsin.
- **Sıfırla** her zaman tek tıkla erişilebilir.
- Yapay zekâya gönderdiğin prompt'lar sen kopyaladıkça oluşur; uygulama kendiliğinden hiçbir AI servisine veri yollamaz.

---

## Performans

| Metrik                          | Hedef    | Mevcut                   |
| ------------------------------- | -------- | ------------------------ |
| LCP (Largest Contentful Paint)  | < 2.5 s  | ~1.2 s (4G, soğuk cache) |
| CLS (Cumulative Layout Shift)   | < 0.1    | ~0.02                    |
| INP (Interaction to Next Paint) | < 200 ms | ~80 ms                   |
| Toplam asset (ham)              | -        | ~1.45 MB                 |
| Toplam asset (gzipped)          | -        | ~380 KB                  |
| Çevrimdışı açılış (SW cache)    | -        | Çalışır                  |
| Çalışma zamanı bağımlılığı      | -        | Sıfır                    |

> Asset yükünün büyük çoğunluğu, dört eksende çoklu varyant taşıyan `js/03-data.js` içerik kütüphanesinden gelir; uygulama mantığı (`14-welcome.js`, `15-projects.js`, `16-presentation.js`, `17-install.js`, `18-app.js`) hepsi birlikte gzip sonrası 30 KB altındadır. Lighthouse mobil profilinde hedeflenen aralık: Performance 95+, Accessibility 95+, Best Practices 100, SEO 100.

---

## Sıkça sorulanlar

**Kontrol listesi mobil uygulamamı denetlemek için yeterli mi?**
Hayır, gerçek QA testinin yerini almaz. Mağaza reddi veya temel kalite boşluklarına yol açan ortak ihmalleri kapatır; asıl test süreciyle birlikte kullanılmak üzere tasarlandı. Crash testi, kullanıcı testi ve performans profilini bu uygulama yapmaz.

**Birden fazla projeyi aynı anda yönetebilir miyim?**
Evet. Araç çubuğundaki proje seçiciden 20'ye kadar farklı proje açabilirsin; her birinin framework, backend, dil ve anlatım stili tercihi ayrı tutulur. İşaretler ve notlar projeden projeye karışmaz.

**Cihazlar arası senkron nasıl olur?**
Otomatik senkron yok (sunucu yok, hesap yok). Araç çubuğundaki "Dışa Aktar" ile JSON dosyası alır, diğer cihazda "İçe Aktar" ile geri yüklersin. Tek yönlü, manuel, hızlı.

**Yapay zekâ prompt özelliği nasıl çalışıyor?**
Seçili framework, backend, dil, stil ve işaretsiz maddelere göre tek bir prompt metni üretip panoya kopyalar. Bu metni sen ChatGPT, Claude, Gemini gibi bir asistana yapıştırırsın. Uygulama hiçbir AI servisine veri göndermez; her şey lokal kalır.

**Listede kullandığım framework veya backend yok.**
`CONTRIBUTING.md` yeni framework veya backend eklemenin adımlarını tarif eder; pull request açabilirsin. Hızlı çözüm olarak en yakın benzerini seçebilirsin: çoğu madde framework-agnostic kaleme alınmıştır ve `_default` davranışına düşer.

**Bir hata buldum veya öneri var.**
GitHub Issues üzerinden bildirin: bug için "🐞 Bug report", öneri için "💡 Feature request" şablonu otomatik açılır. Güvenlik açığı için `SECURITY.md` adresindeki özel kanalı kullan.

---

## Yol haritası

İleride değerlendirilebilecek geliştirmeler (_katkıya açık, hepsi pull request olarak gelebilir_):

- [ ] **Daha fazla dil**: Almanca, İspanyolca, Fransızca, Arapça (RTL ile)
- [ ] **Sektör paketleri**: e-ticaret, sağlık, oyun, fintech için bölgesel uyum maddeleri (KVKK / GDPR / HIPAA / PCI DSS)
- [ ] **Takım modu**: aynı listeyi takım üyeleri arasında senkron etmek (opsiyonel, kendi backend'inle)
- [ ] **Markdown dışa aktarma**: rapor olarak teslim edilebilir
- [ ] **Madde başına yorum eklemek**: kişisel notlardan ayrı, ekipçe görülen yorum dizileri
- [ ] **Daha fazla framework**: Ionic, NativeScript, .NET MAUI, Tauri
- [ ] **Daha fazla backend**: Hasura, Strapi, Directus, Nhost
- [ ] **Tarih bazlı geçmiş**: ne zaman hangi maddeyi işaretledin grafiği

---

## Katkıda bulunma

Katkılar memnuniyetle. Önerilen iş akışı:

1. Repoyu **fork** et.
2. **Issue aç** veya var olan birinde yorum yap; üzerinde çalışacağını belirt.
3. `main` branch'inden bir **feature branch** çıkar: `git checkout -b feat/yeni-madde-x-y`.
4. Değişikliği yap; küçük ve odaklı tut.
5. Var olan stille tutarlı kal:
   - JS: ES2020+, fonksiyon başlarında JSDoc-vari kısa yorum.
   - CSS: ilgili kategori dosyasına, custom property'leri kullanarak.
   - İçerik (`js/03-data.js`): mevcut maddelerin şeklini ve tonunu takip et.
6. **Em dash karakteri (`—`) kullanma**: bu projenin yazılı stili kuralıdır. Yerine `:`, `;` veya parantez.
7. **Conventional commit mesajları**: `feat: ...`, `fix: ...`, `docs: ...`, `refactor: ...`.
8. PR açarken **kısa açıklama** + **ekran görüntüsü** (UI değişiyorsa) ekle.

### İçerik katkısı için ipuçları

- Yeni bir madde eklemeden önce: bir kullanıcının **gerçekten** unutabileceği, mağaza onayı veya kullanıcı deneyimi açısından **kritik** olan bir şey mi? Eklemeden önce maintainera danış (issue üzerinden).
- Kod örnekleri verirken **2024+ güncel** sürümleri referans al (Firebase BoM 34+, RN 0.76+ New Architecture, Expo SDK 53+).
- Basit stili yazarken paket adı / sürüm numarası / akronim kullanma; günlük hayattan metaforlar tercih et.
- TR ve EN'i birlikte güncel tut; sadece TR commit'leri kabul edilmez.

### Hata ve fikir bildirme

[Issue aç](https://github.com/OzcanOrhanDemirci/Mobil_App_Check_List/issues/new): şablon yok, sade ve net olsun. Reproduce adımları ve tarayıcı / cihaz bilgisi yardımcı olur.

---

## Lisans

[MIT](LICENSE) © 2026 Özcan Orhan Demirci

Bu yazılımı ücretsiz olarak kullanabilir, değiştirebilir, ticari projelere dahil edebilirsin. Tek koşul telif bildiriminin korunmasıdır. Detay için `LICENSE` dosyasına bak.

---

## Yazar

**Özcan Orhan Demirci**

- GitHub: [@OzcanOrhanDemirci](https://github.com/OzcanOrhanDemirci)

Eğer bu proje işine yaradıysa, repoya **yıldız** verebilir, çevrendekilere paylaşabilir, ya da kendi katkılarınla daha iyi hâle getirebilirsin. İçerik veya kod fikirleri için issue açmaktan çekinme.

<br />

<div align="center">

**[↑ Başa dön](#mobil-uygulama-kalite-kontrol-listesi)**

</div>
