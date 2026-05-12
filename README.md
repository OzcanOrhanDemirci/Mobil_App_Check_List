# Mobil Uygulama Kalite Kontrol Listesi

Geliştirdiğin mobil uygulamayı mağazaya çıkarmadan önce **MVP** ve **Release** seviyelerinde adım adım kontrol etmeni sağlayan interaktif bir kontrol listesi.

**Canlı demo:** https://ozcanorhandemirci.github.io/Mobil_App_Check_List/

![Önizleme](og-image.png)

## Ne yapar?

- **14 kategori × 55 madde**: planlama, tasarım, geliştirme, Git, API, backend, offline, test, güvenlik, erişilebilirlik, yayın, monetizasyon, analytics, CI/CD.
- Her madde için **iki seviye**: en küçük çalışan ürün için MVP ve mağazaya çıkış için Release.
- Her maddenin arka yüzünde **adım adım "Nasıl yapılır?" rehberi**; her adım ayrıca işaretlenebilir.
- **Kullanıcının seçimine göre** içerik: 6 framework (Flutter, React Native, Swift, Kotlin, Expo, PWA) × 9 backend (Firebase, Supabase, Appwrite, PocketBase, Amplify, Convex, kendi sunucum, localhost, backend yok) × 2 dil (TR / EN) × 2 anlatım stili (Basit / Teknik).
- **Birden fazla proje** desteği, her birinin işaretleri ayrı saklanır.
- Tek dosyalık **kurulabilir PWA**: offline çalışır, ana ekrana eklenebilir, JSON export/import ile veri taşınır.

## Çalıştırmak için

Sadece statik dosyalar. Build adımı yok. İki yol:

```bash
# 1) Doğrudan tarayıcıda
# index.html'i çift tıkla (file:// ile bazı PWA özellikleri çalışmaz)

# 2) Yerel sunucu (önerilen)
python -m http.server 8080
# Sonra http://localhost:8080
```

## Yapı

```
├── index.html              tek sayfa, modaller + JS yükleme sırası
├── manifest.webmanifest    PWA manifesti
├── sw.js                   Service Worker (cache-first + network update)
├── og-image.png            Sosyal medya önizleme görseli
├── css/                    01-base, 02-layout, ..., 06-responsive-print
└── js/                     i18n, data, framework/backend axes, render, app
```

## Hazırlayan

**Özcan Orhan Demirci**
