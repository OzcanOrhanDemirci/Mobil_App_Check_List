/* Help-modal content, kept in a separate file because it is long. */
const HELP_HTML = {
  tr: `
      <section>
        <h3>📋 Genel Bakış</h3>
        <p>Bu uygulama, kendi geliştirdiğin <strong>mobil uygulamanın</strong> hangi seviyede olduğunu görmen ve eksiklerini fark etmen için hazırlanmış pratik bir <strong>kontrol listesidir</strong>.</p>
        <p>Liste <strong>14 kategoride toplam 55 özellikten</strong> oluşur (proje planlama, tasarım, kod düzeni, API, güvenlik, yayın hazırlığı vb.).</p>
        <p>Her özelliğin altında <strong>iki seviye</strong> vardır:</p>
        <ul>
          <li><strong style="color: var(--mvp);">🟢 MVP (yeşil)</strong>: Olmazsa olmaz, temel: uygulamanın <em>en azından çalışmasını</em> sağlayan minimum gereksinimler. Bu seviye tamamlanmadan uygulama yarım kalır.</li>
          <li><strong style="color: var(--release);">🔵 Release (mavi)</strong>: Profesyonel kalite: uygulamanın <em>App Store / Play Store gibi mağazalara yüklenmeye hazır</em> hale gelmesi için olması gerekenler.</li>
        </ul>
        <p>Yapacağın iş: her maddeyi okuyup, kendi uygulamanda yapıp yapmadığını işaretlemek. İlerledikçe yüzdelerin yükseldiğini göreceksin.</p>
      </section>

      <section>
        <h3>🚀 İlk Açılış: Karşılama Akışı</h3>
        <p>Uygulamayı ilk kez açtığında karşılama penceresi gelir ve sana <strong>yedi adımda</strong> yardım eder:</p>
        <ul>
          <li><strong>1. Adım: Dil Seçimi.</strong> Türkçe mi, İngilizce mi tercih edersin? Bu ekran iki dilli gösterilir; seçimini yaparsın. Seçtiğin an arka plandaki tüm metinler ve sonraki adımlar bu dile geçer. Sonradan üstteki <strong>🌐 TR / EN</strong> butonu ile her zaman değiştirebilirsin. <em>Bu adımda sağ üstteki "?" yardım butonuna basarsan, açılan yardım modalında özel bir <strong>TR / EN switcher</strong> belirir; yardım metnini istediğin dilde okuyabilirsin (anlık değiştirme, kalıcı değil).</em></li>
          <li><strong>2. Adım: Kullanım Biçimi (Geliştirme / İnceleme).</strong> Uygulamayı iki farklı şekilde kullanabilirsin. <strong>❔ Geliştirme</strong> modunu seçersen, yeni bir uygulama geliştiriyorsundur ve her madde için "nasıl yapılır?" rehberini başlangıçta açık görmek istersindir; kartlar arka yüzü (How-To) açık halde başlar. <strong>📋 İnceleme</strong> modunu seçersen, mevcut uygulamanı kontrol ediyorsundur ve sade kontrol listesini görmek istersindir; kartlar ön yüzü (checklist) açık halde başlar. Tercih kalıcı; sayfayı yenilediğinde veya tekrar girdiğinde aynı modda açılırsın. İstediğin zaman toolbar'daki <strong>❔ Tümü Nasıl?</strong> veya <strong>📋 Tümü Liste</strong> butonlarıyla seansta toplu geçiş yapabilirsin (bu butonlar aynı zamanda tercihi de günceller).</li>
          <li><strong>3. Adım: Anlatım Dili (Basit / Teknik).</strong> Maddeleri nasıl okumak istersin? <strong>📖 Basit</strong> modda metinler gündelik dilde, paket adı veya sürüm gibi teknik detaylar olmadan anlatılır; yazılım dünyasına uzaksan veya AI asistanlarla uygulama geliştiriyorsan bu en rahatı. <strong>🛠️ Teknik</strong> modda paket isimleri, sürüm numaraları, fonksiyon adları ve kod örnekleri tam haliyle gözükür; yazılımcılar için daha verimli. Bazı maddeler her iki modda da aynı kalır (planlama, SWOT, tasarım vb.); yalnızca teknik detay içeren maddelerin iki versiyonu vardır. Sonradan üstteki <strong>📖 Basit / Teknik</strong> butonu ile her zaman değiştirebilirsin.</li>
          <li><strong>4. Adım: Proje Adı.</strong> Bu listeyle hangi projenin kontrolünü yapacaksın? Projene bir isim ver (örn. "ChefOl iOS", "Liman Takibi"). Aynı uygulamada <strong>en fazla 20 ayrı proje</strong> tutabilir, her birinin işaretlerini ve notlarını ayrı saklayabilirsin. İsmi sonradan istediğin zaman değiştirebilirsin.</li>
          <li><strong>5. Adım: Framework Seçimi.</strong> Bu proje hangi yazılım dili / çerçevesi ile geliştirilecek? 6 seçenek arasından birini seç:
            <ul>
              <li><strong>🐦 Flutter</strong>: Google'ın geliştirdiği, tek kodla hem Android hem iOS uygulaması yapabilen sistem (<em>Dart dili</em>).</li>
              <li><strong>⚛ React Native</strong>: Meta'nın geliştirdiği, JavaScript / TypeScript ile yazılan cross-platform sistem (saf / bare CLI).</li>
              <li><strong>🍎 Swift</strong>: Apple'ın resmi yolu; sadece iPhone / iPad için yerel uygulamalar (<em>SwiftUI</em>).</li>
              <li><strong>🤖 Kotlin</strong>: Google'ın resmi yolu; sadece Android için yerel uygulamalar (<em>Jetpack Compose</em>).</li>
              <li><strong>🚀 Expo</strong>: React Native'in daha kolay hali; build / yayın işlerini bulutta yapar (<em>EAS Build</em>).</li>
              <li><strong>🌐 PWA</strong>: Web teknolojileriyle (HTML/CSS/JS) yazılan ve telefona "Ana ekrana ekle" ile yüklenebilen uygulamalar.</li>
            </ul>
          </li>
          <li><strong>6. Adım: Backend Seçimi.</strong> Uygulamanın sunucu tarafı hangisi olacak? Backend; kullanıcı kaydı, veritabanı, dosya yükleme gibi internetteki tüm işleri yapan tarafır. Listede backend'e bağlı maddeler seçtiğin değere göre özelleşir:
            <ul>
              <li><strong>🚫 Backend yok</strong>: Uygulaman internete bağlanmıyor (sadece cihaz üstü). Tüm backend maddeleri listeden tamamen gizlenir. Bu seçenek diğerlerinin üstünde, daha büyük ve daha belirgin gösterilir.</li>
              <li><strong>🔥 Firebase</strong>: Google'ın kolay ve hızlı sunucu çözümü.</li>
              <li><strong>🟢 Supabase</strong>: Açık kaynak, güçlü sunucu çözümü.</li>
              <li><strong>🟣 Appwrite</strong>: Açık kaynak, esnek sunucu çözümü.</li>
              <li><strong>📦 PocketBase</strong>: Hızlı kurulan, sade sunucu çözümü.</li>
              <li><strong>☁️ AWS Amplify</strong>: Amazon'un kurumsal sunucu çözümü.</li>
              <li><strong>⚡ Convex</strong>: Modern, TypeScript odaklı sunucu çözümü.</li>
              <li><strong>🛠️ Kendi sunucum</strong>: Kendi geliştirdiğin özel sunucu.</li>
              <li><strong>💻 Yerel geliştirme</strong>: Bilgisayarında çalışan test sunucusu.</li>
            </ul>
          </li>
          <li><strong>7. Adım: Hoş Geldin.</strong> Backend'i seçtikten sonra <strong>"İleri ›"</strong> butonuna basarsın. Bu ekranda uygulamanın özelliklerini kısaca tanırsın (Notlar, AI'a sor, Tema vb.). <strong>"Tamam, Başlayalım"</strong> diyerek listeyi açarsın. Yanlış seçim yaptıysan her adımdan <strong>"‹ Geri"</strong> ile bir önceki adıma dönebilirsin.</li>
        </ul>
        <p>Seçtiğin framework + backend kombinasyonu, listedeki maddelerin nasıl gözükeceğini belirler (paket adları, build komutları, kurulum adımları farklılaşır). "Backend yok" seçersen backend kategorisindeki tüm maddeler listeden çıkar.</p>
      </section>

      <section>
        <h3>📁 Çoklu Proje Yönetimi (20 Projeye Kadar)</h3>
        <p>Aynı uygulamada birden fazla projenin kontrol listesini tutabilirsin (örn. "ChefOl iOS", "Liman Takibi", "Final ödevi"). Her proje <strong>kendi verisini izole biçimde saklar</strong>; biri diğerini etkilemez. Aktif olduğun proje, sayfa başlığının sağındaki <strong>📁 proje pill'i</strong> ile gösterilir: "📁 ChefOl iOS · 🐦 Flutter" gibi.</p>

        <p><strong>Her projede ayrı tutulan veriler:</strong></p>
        <ul>
          <li>Seçilen framework (her proje farklı bir framework ile çalışabilir)</li>
          <li>MVP / Release işaretleri ve ilerleme barı</li>
          <li>Madde notları</li>
          <li>Kategori açık/kapalı durumu</li>
          <li>Görünüm filtresi (MVP / Release / Tümü, Yapılan / Yapılacak)</li>
          <li>Kilit durumu</li>
          <li>Kutlama bayrakları (kutlamayı bir kez gördüğünü hatırlar)</li>
        </ul>
        <p><strong>Projeler arasında paylaşılan ayarlar:</strong> Tema (koyu/açık) ve dil (TR/EN) tüm projelerde ortaktır.</p>

        <p><strong>Proje pill'ine tıklayınca "Proje ve Framework" modal'ı açılır ve üç sekmesi vardır:</strong></p>
        <ul>
          <li><strong>📁 Proje sekmesi</strong>:
            <ul>
              <li>Sağ üstte <strong>"n / 20 proje"</strong> sayacı.</li>
              <li><strong>"+ Yeni Proje"</strong> butonu → ayrı bir modal açılır: proje adına yaz, 6 framework seçeneğinden birini seç, <strong>"Oluştur"</strong> butonuna bas. Onay penceresinde projenin oluşturulacağı + mevcut projenin verisinin kayıtlı kalacağı belirtilir. Onayla → yeni proje otomatik aktif yapılır, ana ekrana yeni listesiyle dönersin. İptal edersen yazdıkların korunur, baştan girmen gerekmez.</li>
              <li><strong>Proje listesi</strong>: tüm projelerin satır satır. Her satırda framework ikonu, isim, sağda ✏ <strong>Düzenle</strong> ve 🗑 <strong>Sil</strong> butonları. Aktif olan satır turuncu vurguludur.</li>
              <li><strong>Başka projeye geçiş</strong>: bir satıra tıkla → onay penceresi açılır (mevcut projenin verisinin kayıtlı kalacağı, hedef projeye geçileceği belirtilir) → onayla → uygulama yeni projeyi yükler ve ana ekrana döner. Aktif olan satıra tıklamak hiçbir şey yapmaz (zaten içindesin).</li>
              <li><strong>Ad değiştirme</strong> (✏): satır rename moduna girer, yeni isim yaz → Kaydet. Aynı isimde başka proje varsa hata gösterir.</li>
              <li><strong>Silme</strong> (🗑): onay alındıktan sonra proje ve tüm verisi (işaretler, notlar, ayarlar) kalıcı olarak silinir. <em>Son projeyi silemezsin</em>, çünkü her zaman en az 1 proje olmalı; silme butonu disabled olur.</li>
            </ul>
          </li>
          <li><strong>🔄 Framework sekmesi</strong>: Aktif projenin framework'ünü değiştirir. Detayları aşağıdaki "Framework Değiştirme" bölümünde anlatılıyor.</li>
        </ul>

        <p><strong>🎯 Aktif projeyi silme: akıllı geçiş seçimi</strong>. Üzerinde çalıştığın aktif projeyi silmek istersen, silme onayından sonra:</p>
        <ul>
          <li><strong>3 veya daha fazla projen varsa</strong>: "Hangi projeye geçiş yapmak istersin?" başlıklı bir pencere açılır. Kalan projelerin listesini görürsün (son güncellenen başta). Bir satıra tıkladığında: eski proje silinir, seçtiğin proje aktif olur, ana ekrana onun listesiyle dönersin. Ek bir onaya gerek yok.</li>
          <li><strong>2 projen varsa</strong>: kalan tek projeye otomatik geçilir, ayrıca soru sorulmaz.</li>
        </ul>

        <p><strong>💡 Pratik kullanım:</strong> Aynı uygulamayı bir hocaya, başka birine farklı bir frameworkle göstermek istiyorsan iki ayrı proje açabilirsin. Veya birden fazla bitirme/staj projesini tek bir tarayıcıda yönetebilirsin.</p>
        <p><strong>⚠️ Yedek hakkında not:</strong> Aşağıdaki <strong>"Dışa Aktar"</strong> şu an aktif olan projenin işaret ve notlarını yedekler; diğer projeleri kapsamaz. Birden fazla projenin yedeğini almak için her birine geçip ayrı ayrı dışa aktar.</p>
      </section>

      <section>
        <h3>✅ İşaretleme ve İlerleme Takibi</h3>
        <p>Her maddenin altında MVP ve Release seviyeleri için <strong>tıklanabilir kutular</strong> vardır:</p>
        <ul>
          <li>Bir maddeyi tamamladığında ilgili <strong>kutuya tıkla</strong>: kutu işaretlenir ve renkli arka plan alır.</li>
          <li>Yanlışlıkla işaretlersen <strong>tekrar tıklayarak</strong> işareti kaldırabilirsin.</li>
          <li>Aynı madde hem MVP hem Release seviyelerini ayrı ayrı işaretleyebilirsin.</li>
        </ul>
        <p>Üstte sabit duran <strong>3 ilerleme barı</strong> hangisinin ne kadar tamamlandığını gösterir:</p>
        <ul>
          <li><strong>Toplam İlerleme</strong>: bütün listenin yüzdesi (MVP + Release birlikte).</li>
          <li><strong style="color: var(--mvp);">MVP</strong>: sadece yeşil seviyenin yüzdesi.</li>
          <li><strong style="color: var(--release);">Release</strong>: sadece mavi seviyenin yüzdesi.</li>
        </ul>
        <p>Her kategori başlığında da <strong>o kategoriye ait kendi yüzdesi</strong> gözükür ve bu yüzde <strong>step (alt madde) duyarlı</strong>: bir maddenin sadece bazı Nasıl-Yapılır adımlarını tikledikten sonra bile kategori yüzdesi küçük adımlarla (yaklaşık %1-5) artar. "60%, 23 / 60" gibi granüler değerler görürsün; toplam alt madde sayısı kategoriye göre değişir.</p>
        <p><strong>🎨 Kategori Tamamlanma Vurguları</strong>. Bir kategoride MVP veya Release seviyelerinin hepsi tikli olduğunda kategori başlığı görsel olarak değişir; "tamam" hissini güçlendirir:</p>
        <ul>
          <li><strong style="color: var(--mvp);">🟢 Sadece tüm MVP'ler bitti</strong>: kategori başlığı yumuşak yeşil arka plana geçer, başlık ve yüzde de yeşil olur. Release devam ettiği için tik yoktur.</li>
          <li><strong style="color: var(--release);">🔵 Sadece tüm Release'ler bitti</strong>: kategori başlığı yumuşak mavi arka plana geçer, başlık ve yüzde de mavi olur. MVP devam ettiği için tik yoktur.</li>
          <li><strong style="color: #2FA4AA;">🩵 Her şey bitti (MVP + Release)</strong>: hem arka plan hem metin hem ✓ rozeti <em>teal (turkuaz)</em> tonuna geçer; bu renk MVP yeşili ve Release mavisinin RGB ortasıdır, "her iki seviye birden tamamlandı" ödülünün rengidir. Başlığın yanına küçük ✓ rozeti eklenir ve "X / Y" sayacı <strong>"Tamamlandı"</strong> yazısına dönüşür.</li>
        </ul>
        <p><strong>📦 Otomatik Kayıt:</strong> İşaretlemen <strong>tarayıcına anında kaydedilir</strong>. Uygulamayı kapatıp tekrar açtığında kaldığın yerden devam edersin. Tarayıcı verisini temizlemediğin (veya gizli sekme kullanmadığın) sürece kaybolmaz.</p>
        <p><strong>🎉 Kutlama:</strong> MVP'yi, Release'i veya tüm listeyi tamamladığında küçük bir kutlama ekranı gelir.</p>
      </section>

      <section>
        <h3>🌐 Dil Değiştirme (TR / EN)</h3>
        <p>Sayfanın üst başlık alanında, proje pill'inin solunda <strong>🌐 TR / EN</strong> butonu vardır. Tıkladığında uygulama anında <strong>Türkçe</strong> ve <strong>İngilizce</strong> arasında geçiş yapar.</p>
        <ul>
          <li>Tüm metinler tercüme edilir: kategoriler, 53 madde, MVP/Release açıklamaları, modaller, toast'lar, butonlar, AI prompt'ları.</li>
          <li>Hangi framework'ü seçtiysen, onun varyant metinleri de seçilen dilde gösterilir.</li>
          <li><strong>Dil tüm projelerde ortaktır</strong> (tema gibi global ayar). Bir projede dili değiştirirsen tüm projelerde aynı dil olur.</li>
          <li>Tercihin <strong>tarayıcına kaydedilir</strong>; sonraki açılışta seçtiğin dil aktif gelir.</li>
          <li>İlk kez girişte karşılama akışı sana ilk önce <strong>dil seçtirir</strong>; o seçim hem ekranı hem sonraki framework adımının metnini belirler.</li>
        </ul>
      </section>

      <section>
        <h3>🎯 Akıllı Filtreleme (3×3 = 9 Kombinasyon)</h3>
        <p>Sayfanın üst başlık alanında <strong>3 ana pill</strong> vardır: <strong style="color: var(--mvp);">MVP ▾</strong>, <strong style="color: var(--release);">Release ▾</strong>, <strong style="color: #ef4444;">MVP + Release ▾</strong>. Her birine tıkladığında alt menüsü açılır ve <strong>3 alt seçenek</strong> sunar: <strong>Tümü</strong>, <strong>Yapılacak</strong>, <strong>Yapılan</strong>.</p>
        <p>Bu sayede 3 seviye × 3 durum = <strong>9 farklı filtreleme kombinasyonu</strong> elde edersin:</p>
        <ul>
          <li><strong style="color: var(--mvp);">MVP · Tümü</strong>: Sadece MVP satırları görünür (işaretli + işaretsiz hepsi). Release tamamen gizli.</li>
          <li><strong style="color: var(--mvp);">MVP · Yapılacak</strong>: Sadece <em>işaretsiz</em> MVP satırları. "Hangi MVP'ler kaldı?"</li>
          <li><strong style="color: var(--mvp);">MVP · Yapılan</strong>: Sadece <em>işaretli</em> MVP satırları. "Neleri tamamladım?"</li>
          <li><strong style="color: var(--release);">Release · Tümü / Yapılacak / Yapılan</strong>: Aynı mantık Release seviyesi için.</li>
          <li><strong style="color: #ef4444;">MVP + Release · Tümü</strong> (varsayılan): Her şey görünür, hiçbir filtre yok.</li>
          <li><strong style="color: #ef4444;">MVP + Release · Yapılacak</strong>: Hangi seviyeden olursa olsun tüm <em>işaretsiz</em> satırlar (ToDo listesi gibi).</li>
          <li><strong style="color: #ef4444;">MVP + Release · Yapılan</strong>: Tüm <em>işaretli</em> satırlar (başarı listesi gibi).</li>
        </ul>
        <p><strong>Aktif pill</strong> renkli vurgulanır ve seçili alt-filtre etiketi pill'in içinde görünür (örn. "MVP · Yapılan ▾"). Diğer pill'ler nötr durur.</p>
        <p><strong>Disabled mantığı:</strong> İlgili seviyede hiç işaret yoksa, "Yapılacak" ve "Yapılan" alt-seçenekleri <em>gri</em> ve tıklanamaz olur (gösterecek bir şey yok). "Tümü" her zaman aktiftir.</p>
        <p>Hem level group hem alt-filtre ayrı ayrı <strong>tarayıcına kaydedilir</strong>; bir sonraki açılışta tam olarak kaldığın yerden devam edersin.</p>
      </section>

      <section>
        <h3>🔄 Framework Değiştirme</h3>
        <p>Aktif projenin framework'ünü dilediğin zaman değiştirebilirsin. Üst başlıktaki <strong>📁 proje pill</strong>'ine tıkla → açılan modalın <strong>"Framework" sekmesine</strong> geç → 6 seçenekten birine tıkla → onay penceresi gelir, "Geçiş yap" de.</p>
        <p>Geçiş yaptığında:</p>
        <ul>
          <li>İlgili 28 maddenin metni <strong>anında değişir</strong> (örn. "<code>flutter build apk</code>" yerine "<code>eas build --platform android</code>" gibi).</li>
          <li><strong>İşaretlemelerin ve notların kaybolmaz</strong>: aynı kalır. Sadece anlatım dili / paket adları değişir.</li>
          <li>Değişiklik sadece <strong>aktif projeye</strong> etki eder; diğer projelerin framework'ü değişmez.</li>
          <li>İstediğin zaman tekrar değiştirebilirsin.</li>
        </ul>
        <p><em>💡 İpucu:</em> Aynı uygulamayı iki ayrı frameworkte denemek istiyorsan, framework değiştirmek yerine <strong>"+ Yeni Proje"</strong> ile aynı isimde ikinci bir proje açıp ona farklı framework seç. Böylece her ikisinde de işaretlerini ayrı tutarsın.</p>
      </section>

      <section>
        <h3>🔒 Liste Kilidi</h3>
        <p>Toolbar'daki <strong>🔒 Kilit</strong> butonu, üzerinde çalıştığın listeyi <em>salt-okunur</em> moda alır. Sunum yaparken, mağazaya yüklenmeye hazır halde son görüntüyü dondururken veya yanlışlıkla işaretlere dokunmamak için faydalıdır.</p>
        <p><strong>Kilit aktifken neler olur?</strong></p>
        <ul>
          <li><strong>MVP / Release işaretleri</strong> değiştirilemez, yeni işaret eklenemez, mevcut kaldırılamaz.</li>
          <li><strong>Framework</strong> değiştirme butonu disabled olur.</li>
          <li><strong>Sıfırla</strong> ve <strong>İçe Aktar</strong> butonları disabled olur (yanlışlıkla veriyi silemezsin).</li>
          <li><strong>Yazdır</strong> ve <strong>Dışa Aktar</strong> butonları görsel olarak vurgulanır (kilitli halde doğal aksiyon: çıktı al / yedekle).</li>
          <li><strong>Notlar, arama, filtreler, kategoriler, tema, sunum, dil değiştirme</strong> normal çalışır (sadece veri-değiştiren aksiyonlar kapalı).</li>
        </ul>
        <p>Hero (başlık) alanının altında ince bir <strong>"🔒 Liste kilitli"</strong> bilgi şeridi belirir; kilitli olduğunu unutmazsın.</p>
        <p>Kilit durumu <strong>tarayıcına kaydedilir</strong>; uygulamayı kapatıp tekrar açtığında kilit aynen devam eder. Tekrar düzenleme yapmak için <strong>"Kilidi Aç"</strong> butonuna basıp onaylaman yeterli.</p>
      </section>

      <section>
        <h3>🔍 Arama Kutusu</h3>
        <p>Üst toolbar'daki <strong>arama kutusu</strong>, madde başlığı, açıklaması veya içeriği içinde <strong>anahtar kelime</strong> arar. Örnekler: "API", "dark mode", "Firebase", "Apple Sign-In", "Crashlytics".</p>
        <ul>
          <li>Yazdıkça filtreleme <strong>anlık</strong> uygulanır; eşleşmeyen maddeler ve eşleşmesi olmayan kategoriler gizlenir.</li>
          <li>Arama aktifken <strong>kapalı kategoriler otomatik açılır</strong>; eşleşen sonuçları görmen kolaylaşır. Aramayı temizleyince kategoriler eski açık/kapalı durumlarına döner.</li>
          <li>Arama aktifken <strong>"Tümünü Aç" / "Tümünü Kapat"</strong> butonları geçici olarak devre dışı kalır (auto-expand zaten gösteriyor, manuel toggle çelişki yaratırdı).</li>
          <li><kbd>/</kbd> tuşu arama kutusuna anında odaklanır.</li>
        </ul>
        <p><strong>💡 İpucu:</strong> Arama ile <strong>3×3 filtreleme</strong> sistemi birlikte çalışır. Örn: "MVP · Yapılacak" filtresinde "Firebase" arayarak yapılması gereken Firebase maddelerine odaklanabilirsin.</p>
      </section>

      <section>
        <h3>📂 Kategorileri Açma / Kapatma</h3>
        <ul>
          <li><strong>Kategori başlığına tıkla</strong>: sadece o kategori açılıp kapanır. Sağdaki ▾ ok yön gösterir.</li>
          <li><strong>Tümünü Aç</strong> butonu, bütün kategorileri tek seferde açar.</li>
          <li><strong>Tümünü Kapat</strong> butonu, bütün kategorileri tek seferde kapatır.</li>
        </ul>
        <p>Sayfa ilk açıldığında <strong>tüm kategoriler kapalıdır</strong> (sayfayı kalabalık göstermemek için). İhtiyacın olana tıklayarak açarsın. Açtığın / kapattığın durum tarayıcına kaydedilir; sonraki açılışta hatırlanır.</p>
      </section>

      <section>
        <h3>🧭 Akıllı Kategori Navigasyonu</h3>
        <p>Sayfanın üstündeki <strong>14 kategori chip'i</strong> (örn. "01. Proje Fikri ve Planlama") basit bir scroll-to-anchor değil; <strong>akıllı navigasyon</strong> yapar:</p>
        <ul>
          <li>Bir chip'e tıklayınca kategori başlığına değil, <strong>"kullanıcının kaldığı" maddeye</strong> kaydırır.</li>
          <li>Hedef madde aktif filtreye göre değişir:
            <ul>
              <li><strong>MVP filtresi aktifse</strong> → MVP'si işaretsiz ilk maddeye gider.</li>
              <li><strong>Release filtresi aktifse</strong> → Release'i işaretsiz ilk maddeye gider.</li>
              <li><strong>MVP+Release filtresi aktifse</strong> → MVP veya Release'inden en az biri işaretsiz olan ilk maddeye gider.</li>
            </ul>
          </li>
          <li><strong>Hiç işaret yoksa</strong> ilk maddeye gider (zaten ilki yapılacak).</li>
          <li><strong>Tüm maddeler tamamlandıysa</strong> kategorinin son maddesine gider (referans için).</li>
          <li><strong>Kategori kapalıysa otomatik açılır</strong>, sonra hedef maddeye yumuşak bir kaydırma yapar.</li>
          <li>Sticky toolbar'ın yüksekliği hesaba katılır; hedef madde tam toolbar'ın altına yerleşir, üzerine binmez.</li>
        </ul>
        <p>Bu sayede 30+ saatlik bir projede arama yapmadan, kapalı kategorileri açmadan, sadece chip'e tıklayarak <strong>yapacağın bir sonraki maddeye anında ulaşırsın</strong>.</p>
      </section>

      <section>
        <h3>❔ Nasıl Yapılır? (Kartın Arka Yüzü)</h3>
        <p>Her madde kartının <strong>üst-sağ köşesinde küçük bir "Nasıl?" butonu</strong> vardır. Bu butona bastığında kart <strong>3 boyutlu olarak çevrilir</strong> ve sana o maddeyi nasıl tamamlayacağını adım adım anlatan bir rehber görünür. Geri dönmek için aynı butona ("← Geri") tekrar bas. Kart çevrilirken aynı zamanda <strong>uzar / kısalır</strong>: ön yüzdeki checklist daha kısa, arka yüzdeki rehber daha uzundur; iki yüz de gereken kadar yer kaplar, kart asla boş alan yaratmaz.</p>

        <p><strong>İki yüz, iki amaç:</strong></p>
        <ul>
          <li><strong>Ön yüz = hedef.</strong> "Bu maddenin olması gereken durum nedir?" sorusunu yanıtlar. <strong>MVP ve Release seviye kutuları</strong> burada bulunur; uygulamanda o durumu sağladıkça işaretlersin.</li>
          <li><strong>Arka yüz = adım adım rehber.</strong> "Bu duruma ulaşmak için ne yapmalıyım?" sorusunu yanıtlar. MVP ve Release her ikisi için ayrı ayrı numaralandırılmış adım listeleri vardır.</li>
        </ul>

        <p><strong>✅ Tıklanabilir Adımlar.</strong> Arka yüzdeki numaralandırılmış adımlar (1, 2, 3 ...) <strong>tıklanabilir küçük checkbox'lar gibi davranır</strong>. Bir adımı bitirdiğinde üstündeki daireye tıkla; numara yerine ✓ tik gelir, metnin üstü çizilir ve daire MVP'de yeşil, Release'de mavi rengini alır. Klavyeyle de erişebilirsin: Tab ile odaklan, Enter veya Boşluk ile tikle.</p>

        <p><strong>🔁 Çift Yönlü Senkronizasyon (MVP/Release ile adımlar).</strong> Adımlar ve ön yüzdeki seviye kutuları birbirine bağlıdır:</p>
        <ul>
          <li><strong>Ön yüzde MVP'yi tiklersen → arka yüzdeki tüm MVP adımları da otomatik tikli olur.</strong> Yani "MVP'yi bitti say" deyince tüm adım rehberi de bitmiş kabul edilir. Release için de aynı kural.</li>
          <li><strong>Arka yüzde bir seviyenin tüm adımlarını tiklersen → ön yüzdeki ilgili seviye kutusu otomatik tikli olur.</strong> Adım adım bitirirken işin doğal akışıyla seviye tamamlanır.</li>
          <li><strong>Tek bir adımı geri alırsan</strong> ilgili seviye otomatik temizlenir (çünkü artık "hepsi yapılmadı"). Ön yüzdeki seviyeyi geri alırsan adımlar da topluca temizlenir.</li>
        </ul>

        <p><strong>📊 Ön Yüzdeki Kısmi Dolum Görseli.</strong> Bir seviyenin bazı adımları tikli ama hepsi değilse, ön yüzdeki MVP veya Release satırı <strong>yükleme barı gibi yarı dolu</strong> görünür: solu MVP yeşili veya Release mavisiyle <em>tikleme oranı kadar</em> boyalı kalır, sağ köşede yüzdesi (örn. "40%") rozeti çıkar. Tüm adımlar bitince satır tamamen renge boyanır, rozet kaybolur, ✓ tik gelir. Hem görsel hem mantıksal ilerleme aynı anda akar.</p>

        <p><strong>📁 Saklama ve sıfırlama.</strong> Adım işaretleri ön yüzdeki MVP/Release işaretleri ile aynı state'te saklanır; sayfayı yenilediğinde, projeyi tekrar açtığında veya cihazlar arasında JSON yedek aldığında korunur. <strong>Sıfırla → Seçimler</strong> bayrağı seçildiğinde adım işaretleri de seviye işaretleri ile birlikte temizlenir. Backend değiştirdiğinde backend'e bağlı maddelerin adım state'leri de kaldırılır.</p>

        <p><strong>🔄 Toplu Mod Değiştirme.</strong> Toolbar'da <strong>❔ Tümü Nasıl?</strong> ve <strong>📋 Tümü Liste</strong> butonları vardır. Tek tıkla tüm kartları aynı anda arka yüze veya ön yüze çevirir; aynı zamanda kullanım biçimi tercihini (welcome akışında seçtiğin) günceller. Mod değişimi sırasında kart yükseklikleri yumuşak animasyonla küçülüp büyür; ön yüz modunda kartlar gereksiz yer kaplamaz.</p>

        <p>Rehber içeriği, ön yüzdeki gibi <strong>seçtiğin dile, anlatım diline (Basit / Teknik), framework'e ve backend'e göre</strong> otomatik özelleşir. Örneğin Flutter + Firebase ile çalışıyorsan Firebase Console adımlarını ve Flutter komutlarını görürsün; Supabase'e geçtiğinde aynı maddenin arkasında bu sefer Supabase Studio adımları gözükür.</p>

        <p>Bir madde için ayrı bir rehber yazmaya gerek yoksa (örn. "SWOT yap" gibi öz açıklayıcı maddeler) arka yüzde "bu madde için ayrı bir rehber yok" mesajı çıkar; daha derin yardıma <strong>🤖 AI'a sor</strong> butonu kalır.</p>

        <p><strong>📲 Notlar ve AI iki yüzde de aktif.</strong> Madde kartının altındaki <strong>"+ Not ekle"</strong> ve <strong>"🤖 AI'a sor"</strong> butonları kart hangi yüzde olursa olsun (ön ya da arka) aynı yerde kalır ve aynı şekilde çalışır. Rehberi okurken aklına gelen bir notu hemen kaydedebilirsin.</p>

        <p><strong>Pratik kullanım:</strong> Bir maddeye baktın, ne yapacağını bilmiyorsun → "Nasıl?" butonuna bas → rehberi oku → bitirdiğin adımları tikle → tüm adımları tiklediğinde seviye otomatik tikli olur, kartın ön yüzünde tamamlama hissi görsel olarak akar.</p>
      </section>

      <section>
        <h3>📝 Madde Notları</h3>
        <p>Her maddenin altında <strong>"+ Not ekle"</strong> butonu vardır. Tıklayınca bir yazı alanı açılır.</p>
        <ul>
          <li>Buraya <strong>kendi açıklamanı, hatırlatmanı, problemini, kaynağını</strong> yazabilirsin. Örnekler:
            <ul>
              <li>"Bu maddeyi 12 Mayıs'ta hocaya soracağım"</li>
              <li>"Şu pakete bak: <code>shared_preferences</code>"</li>
              <li>"Tasarımı Figma'da yaptık, link: ..."</li>
            </ul>
          </li>
          <li>Yazdığın <strong>her karakter anında otomatik kaydedilir</strong>: kaydet düğmesine basmana gerek yok.</li>
          <li>Notu olan maddeler turuncu bir <strong>📝 işaretiyle</strong> vurgulanır; bulması kolaylaşır.</li>
          <li><strong>"Notu temizle"</strong> butonu ile notu silebilirsin.</li>
          <li><strong>Sunum modunda</strong> not yazılı maddelerin altında <em>📝 ikonlu, italic, turuncu kenarlıklı</em> bir kart olarak <strong>otomatik görünür</strong>. Notu olmayan maddelerin altında bu kart hiç çıkmaz. Multi-line (çok satırlı) notlar düzgün biçimde gösterilir.</li>
        </ul>
        <p>Notlar <strong>yazdırma çıktısında gözükmez</strong>: sadece sana özeldir. Sunum modunda görünür çünkü orada bilinçli olarak ekibe gösteriyorsundur.</p>
      </section>

      <section>
        <h3>🤖 AI'a Sor (Yapay Zekâ Yardımı)</h3>
        <p>Her maddenin altında <strong>"🤖 AI'a sor"</strong> butonu vardır. Tıklayınca yanında <strong>2 seçenek</strong> açılır:</p>
        <ul>
          <li><strong>📝 Türkçe / English (Markdown)</strong>: Aktif uygulama dilinde, Markdown formatında, yeni başlayanlar için detaylı bir prompt panoya kopyalanır. Prompt:
            <ul>
              <li>Konsepti ve önemini açıklamasını ister</li>
              <li>Adım adım uygulama yolunu ister (paket, komut, dosya yolu detaylarıyla)</li>
              <li>Çalışan, kopyala-yapıştır kod örneği ister (yorum satırları seçili dilde)</li>
              <li>Sık yapılan 2-3 hatayı ve nasıl kaçınılacağını sorar</li>
              <li>Doğrulama testlerini ister</li>
            </ul>
          </li>
          <li><strong>{ } EN JSON</strong>: AI'a yapılandırılmış İngilizce JSON formatında prompt kopyalar. <em>Daha gelişmiş kullanıcılar için</em>; AI'nın daha tutarlı çıktı vermesini sağlar (role, project_context, expected_response_structure, constraints alanlarıyla). Cevap dili AI'a yine seçili uygulama diliyle (TR veya EN) söylenir.</li>
        </ul>
        <p>Kopyaladığın prompt'u <strong>ChatGPT, Claude, Gemini</strong> gibi sohbet botlarına yapıştırırsın; kapsamlı bir rehber alırsın. Toast bildirim "panoya kopyalandı" der.</p>
        <p><strong>💡 Çift özelleşme:</strong></p>
        <ul>
          <li><strong>Framework özelleşmesi:</strong> Flutter seçiliyken "<code>flutter pub add</code>" örnekleri; Kotlin seçiliyken Gradle dependency; Swift seçiliyken SPM kurulumu vb. AI'a doğru paket/komut isimleri gider.</li>
          <li><strong>Dil özelleşmesi:</strong> Uygulama dili TR ise prompt Türkçe, EN ise İngilizce. AI cevabı da seçilen dilde gelir.</li>
        </ul>
      </section>

      <section>
        <h3>📺 Sunum Modu</h3>
        <p><strong>"Sunum"</strong> butonuna (veya <kbd>P</kbd> tuşuna) basınca uygulama tamamen sunum-odaklı bir görünüme geçer. Sınıfta projeksiyona vurmak, ekiple ilerleme paylaşmak veya bir konuya odaklanmak için tasarlandı.</p>
        <p><strong>Tasarım özellikleri:</strong></p>
        <ul>
          <li><strong>Üstte sabit bağlam çubuğu</strong>: 📱 uygulama adı solda, sağda <em>renkli chip</em> ile <strong>ne sunuyorsun</strong> bilgisi (örn. "Yapılan MVP'ler · 5 madde"). Chip rengi viewMode'a göre değişir: MVP=yeşil, Release=mavi, MVP+Release=turuncu.</li>
          <li><strong>Kategori kartı</strong>: Her kategori tam-ekran bir slayt. Kategori başlığı, açıklaması, yüzde ve madde sayısı üstte; altında maddeler.</li>
          <li><strong>Madde kartları</strong>: Her madde, gölgeli ve kenarlıklı bir kart olarak görünür (2 sütunlu grid). Kartın içinde: ID rozeti, başlık, açıklama, MVP/Release seviye satırları, ve eğer not varsa not kartı.</li>
          <li><strong>Notlar</strong> not yazılı olan maddelerin altında 📝 ikonu ile otomatik görünür.</li>
          <li>Editör elemanları (not toggle, AI butonu, not textarea) sunumda gizlenir; sadece okumalık görünüm vardır.</li>
        </ul>
        <p><strong>Aktif filtre + Sunum:</strong> Sunum modu mevcut filtrelemeye saygı duyar. Örn: "Yapılan MVP" filtresinde sunum başlatınca yalnızca <em>MVP'si işaretli kategoriler</em> arasında gezersin (boş kategoriler atlanır). Üst chip filtreyi belirtir, alt navigasyon ise filtreyle eşleşen kategori sayısını gösterir (örn. "1 / 5"). Filtre boşsa "Sunulacak madde yok" toast'ı çıkar, sunum açılmaz.</p>
        <p><strong>Klavye:</strong></p>
        <ul class="kbd-list">
          <li><kbd>←</kbd> / <kbd>→</kbd><span>önceki / sonraki kategori</span></li>
          <li><kbd>Boşluk</kbd> / <kbd>PageDown</kbd><span>sonraki kategori (alternatif)</span></li>
          <li><kbd>PageUp</kbd><span>önceki kategori (alternatif)</span></li>
          <li><kbd>Esc</kbd><span>sunum modundan çık</span></li>
        </ul>
        <p><strong>💡 İpucu:</strong> Sunum'a girmeden önce "MVP · Yapılacak" gibi bir filtre seç; tartışmaya odaklanmak istediğin konuyu izole edersin. <strong>"📋 Liste Kilidi"</strong> ile birlikte kullanırsan kazara işaretlere dokunma riski sıfırlanır.</p>
      </section>

      <section>
        <h3>💾 Veri Yönetimi (Yedek Al / Geri Yükle / Sıfırla)</h3>
        <ul>
          <li><strong>Dışa Aktar</strong>: <strong>aktif</strong> projenin işaretlerini ve notlarını tek bir <strong>JSON dosyası</strong> olarak bilgisayarına indirir (örn. <code>mobil-kontrol-2026-05-11.json</code>). Bilgisayarın sıfırlanırsa veya tarayıcı verisi silinirse bu dosya yedek olur. <em>İlk işaret/not eklenmeden buton gri durur (yedeklenecek bir şey yok).</em> <em>Not: Birden fazla projen varsa, her birinin yedeğini ayrı ayrı almak için önce ilgili projeye geçmen gerekir.</em></li>
          <li><strong>İçe Aktar</strong>: daha önce indirdiğin JSON dosyayı seç → <strong>aktif projenin işaretleri ve notları yüklenir</strong>. Yeni cihazda devam etmek veya yedekten geri dönmek için kullanılır.</li>
          <li><strong>Sıfırla:</strong> Sıfırlamanın iki ayrı giriş noktası vardır.
            <ul>
              <li><strong>① Toolbar'daki "Sıfırla" butonu</strong> (kısayol, sadece aktif proje içeriği için):
                <ul>
                  <li>📋 <strong>Seçimler</strong> (aktif projedeki MVP / Release işaretleri ve ilerleme)</li>
                  <li>📝 <strong>Notlar</strong> (aktif projedeki her madde için yazdıklarını siler)</li>
                </ul>
                İkisi birden veya birini seçebilirsin. Diğer projelere ve ayarlara dokunulmaz. Projeni temizleyip baştan başlamak istediğinde en hızlı yoldur.
              </li>
              <li><strong>② Proje pill → "Sıfırla" sekmesi</strong> (tam mod, dört seçenek):
                <ul>
                  <li>📋 <strong>Seçimler</strong> (aktif proje)</li>
                  <li>📝 <strong>Notlar</strong> (aktif proje)</li>
                  <li>⚙️ <strong>Ayarlar (tüm projeler için)</strong>: kategori açık/kapalı durumu, tema, seviye filtreleri ve kilit varsayılana döner.</li>
                  <li>⚠️ <strong>Tüm Sistem</strong>: her şey silinir. Tüm projeler, işaretler, notlar, ayarlar, dil ve framework sıfırlanır. Uygulama ilk açılışa döner, karşılama akışı tekrar gelir.</li>
                </ul>
                Bu sekmede her seçeneği serbestçe kombinleyebilirsin. "Tüm Sistem" seçilirse diğerleri <em>otomatik kapanır ve disabled</em> olur (zaten her şeyi kapsıyor).
              </li>
            </ul>
            <strong>Onay aşaması:</strong> Hangi girişten gelirsen gel "İleri" tıklayınca onay penceresi açılır ve ne sileceğini madde-madde gösterir; onaylarsan sıfırlama uygulanır.
          </li>
        </ul>
        <p><strong>💡 Neden iki giriş?</strong> Toolbar butonu sadece proje içeriğiyle sınırlı tutuldu ki kazara "Tüm Sistem" veya genel ayarlar sıfırlanmasın. Tema, kilit gibi varsayılan ayarlara dönmek ya da tüm sistemi sıfırlamak gibi büyük işlemler bilinçli olarak Proje/Framework modalının altındaki Sıfırla sekmesine taşındı.</p>
        <p><strong>💡 İpucu:</strong> Önemli aşamalarda <strong>"Dışa Aktar" ile yedek almak</strong> iyi alışkanlıktır; tarayıcı verisi tarayıcı temizliğinde silinebilir. "Tüm Sistem" sıfırlaması geri alınamaz; kullanmadan önce mevcut projelerini yedeklemeyi düşün.</p>
      </section>

      <section>
        <h3>🖨 Yazdırma ve PDF (İki Çıktı Modu)</h3>
        <p><strong>"Yazdır"</strong> butonuna basınca doğrudan yazıcı açılmaz; önce küçük bir <strong>seçim penceresi</strong> gelir. Burada projenden iki farklı tip PDF üretebilirsin:</p>
        <ul>
          <li><strong>📋 Kontrol Listesi</strong>: kartların <em>ön yüzü</em> basılır. İşaretlediğin maddeler, MVP ve Release seviye satırları, ilerleme bilgisi, kategori başlıkları temiz biçimde sıralanır. Ekiple paylaşmak, arşivlemek veya tek bakışta nelerin tamamlandığını görmek için ideal. Bu mod mevcut yazdırma davranışıdır.</li>
          <li><strong>❔ Nasıl Yapılır? Rehberi</strong>: kartların <em>arka yüzü</em> basılır. Her madde için MVP ve Release adım listeleri (1, 2, 3 ...) numaralı daireler ve renkli MVP / Release etiketleriyle çıkar. Yazılı, taşınabilir bir rehber gibidir; çevrimdışı okuma, kağıt üzerine not alma veya bir başkasına projeyi anlatma için kullanışlıdır.</li>
        </ul>
        <p>Her iki çıktıda da:</p>
        <ul>
          <li><strong>Üstte sayfa başlığı, altta hazırlayan bilgisi</strong> tekrar eder.</li>
          <li>Renkler (yeşil MVP, mavi Release) korunur.</li>
          <li><strong>Madde içerikleri sayfa ortasından bölünmez</strong>; her madde bir bütün olarak kalır, gerekirse bir sonraki sayfaya alınır.</li>
          <li>Kategori başlığı sayfanın altında yalnız kalmaz; başlık + ilk madde aynı sayfada tutulur.</li>
          <li><strong>Notlar, AI butonları, filtre butonları, sunum kontrolleri yazdırılmaz</strong>; sadece liste içeriği veya rehber çıkar (temiz çıktı).</li>
        </ul>
        <p><strong>Nasıl Yapılır? modu</strong> ayrıca:</p>
        <ul>
          <li>Yazıyı bir miktar daha küçük tutar; sayfa başına daha çok madde sığar ve boşa giden yer azalır.</li>
          <li>Her maddeyi belirgin bir <strong>kart</strong> olarak çizer (ince çerçeve + yuvarlatılmış köşe), aralarındaki ilişki net görünür.</li>
          <li>Tiklediğin adımları PDF'te ✓ ve üstü çizili haliyle gösterir; "ne yaptın" raporu olarak da kullanılabilir.</li>
          <li>Kategori ilerleme yüzdesi gösterilmez (rehber zaten kontrol listesi değil); başlık + ✓ tamamlanma rozeti (varsa) korunur.</li>
        </ul>
        <p><kbd>Ctrl</kbd>+<kbd>P</kbd> (Mac'te <kbd>⌘</kbd>+<kbd>P</kbd>) doğrudan tarayıcının yazdır penceresini açar; o yol seçim modalını atlar ve mevcut görünümü yazdırır.</p>
      </section>

      <section>
        <h3>🌙 Tema (Koyu / Açık)</h3>
        <p>Toolbar'daki <strong>🌙 Koyu / ☀ Açık</strong> butonu ile tema değiştirebilirsin.</p>
        <ul>
          <li><strong>Koyu tema</strong>: gece veya az ışıklı ortamda gözü daha az yorar (varsayılan).</li>
          <li><strong>Açık tema</strong>: gündüz / aydınlık ortamlarda klasik beyaz görünüm. Tüm renkler (MVP yeşil, Release mavi, accent turuncu) açık temada da koruma altında.</li>
        </ul>
        <p>Tercih kalıcı olarak <strong>tarayıcına kaydedilir</strong>. Tema değişikliği toast bildirimiyle onaylanır.</p>
      </section>

      <section>
        <h3>📲 Uygulama Olarak Yükle (PWA)</h3>
        <p>Bu kontrol listesini bilgisayarına veya telefonuna <strong>uygulama gibi yükleyebilirsin</strong>:</p>
        <ul>
          <li><strong>Mobilde:</strong> ana ekrana eklenir, ayrı bir ikon olarak açılır.</li>
          <li><strong>Masaüstünde:</strong> başlat menüsüne / dock'a kısayol gelir.</li>
          <li>Tek tıkla açılır, <strong>internet olmadan da çalışır</strong> (Service Worker önbelleği).</li>
        </ul>
        <p><strong>Yükleme yolu:</strong></p>
        <ul>
          <li>Sayfa açıldığında üstte <strong>"📲 Yükle"</strong> banner'ı belirebilir. Tıkla → tarayıcı yerli yükleme penceresi açılır → "Yükle" → tamam.</li>
          <li>Banner desteklenmiyorsa (örn. iOS Safari, Firefox masaüstü), <strong>cihaza özel adım-adım talimat modalı</strong> açılır. Modal sayfanı açtığın platformu otomatik algılar (iOS Safari, Android Chrome, Samsung Internet, Firefox, Edge, macOS Safari…) ve doğru menü yolunu (örn. Safari'de "Paylaş → Ana Ekrana Ekle") gösterir.</li>
          <li>Banner'ı kapatırsan bir daha gözükmez (tarayıcına işaretlenir). Yine de tarayıcı menüsünden manuel yükleyebilirsin.</li>
        </ul>
        <p>Yüklendikten sonra: ikona tıklayınca uygulama <strong>kendi penceresinde</strong> (browser tab'ı değil) açılır, adres çubuğu gözükmez, gerçek bir uygulama gibi davranır.</p>
      </section>

      <section>
        <h3>⌨️ Klavye Kısayolları</h3>
        <ul class="kbd-list">
          <li><kbd>?</kbd><span>Bu yardım penceresini aç</span></li>
          <li><kbd>/</kbd><span>Arama kutusuna odaklan (anında yazmaya başla)</span></li>
          <li><kbd>P</kbd><span>Sunum modunu aç</span></li>
          <li><span><kbd>←</kbd> <kbd>→</kbd></span><span>Sunumda önceki / sonraki kategori</span></li>
          <li><kbd>Boşluk</kbd> / <kbd>PageDown</kbd><span>Sunumda sonraki kategori (alternatif)</span></li>
          <li><kbd>PageUp</kbd><span>Sunumda önceki kategori (alternatif)</span></li>
          <li><kbd>Esc</kbd><span>Açık modal / dropdown / sunum modundan çık</span></li>
          <li><kbd>Ctrl</kbd>+<kbd>P</kbd><span>Tarayıcı yazdır (PDF kaydet de mümkün)</span></li>
        </ul>
        <p><em>Not: Bir input/textarea içinde yazıyorken kısayollar (<kbd>?</kbd>, <kbd>/</kbd>, <kbd>P</kbd>) tetiklenmez; yazdığın metni bozmaz.</em></p>
      </section>
  `,
  en: `
      <section>
        <h3>📋 Overview</h3>
        <p>This app is a practical <strong>checklist</strong> built to help you see how far along your <strong>own mobile app</strong> is and spot what's missing.</p>
        <p>The list contains <strong>55 features across 14 categories</strong> (project planning, design, code structure, API, security, release prep, etc.).</p>
        <p>Each feature has <strong>two levels</strong>:</p>
        <ul>
          <li><strong style="color: var(--mvp);">🟢 MVP (green)</strong>: Must-have, the foundation: minimum requirements that make the app <em>at least work</em>. Without it the app is incomplete.</li>
          <li><strong style="color: var(--release);">🔵 Release (blue)</strong>: Professional quality: what's needed for the app to be <em>ready to ship to the App Store / Play Store</em>.</li>
        </ul>
        <p>Your job: read each item and tick whether you've done it. As you progress, the percentages climb.</p>
      </section>

      <section>
        <h3>🚀 First Run: Welcome Flow</h3>
        <p>The first time you open the app a welcome dialog appears and guides you through <strong>seven steps</strong>:</p>
        <ul>
          <li><strong>Step 1: Pick a language.</strong> Turkish or English? This screen is bilingual; once you pick, every text and the next steps switch to your chosen language. You can change it any time later via the <strong>🌐 TR / EN</strong> button on top. <em>If you press the "?" help button on this step, the help modal opens with a special in-modal <strong>TR / EN switcher</strong>, so you can read the help in either language (momentary, not saved).</em></li>
          <li><strong>Step 2: Usage mode (Building / Reviewing).</strong> The app can be used in two ways. Pick <strong>❔ Building</strong> if you are building a new app and want to see the "how to" guide for each item from the start; cards open with the back face (How-To) visible. Pick <strong>📋 Reviewing</strong> if you are auditing an existing app and want the clean checklist; cards open with the front face (checklist) visible. The preference is persistent; reloading the page or returning later starts you in the same mode. You can switch any time via the toolbar buttons <strong>❔ Show All How-To</strong> and <strong>📋 Show All Checklist</strong> (these buttons also update the preference).</li>
          <li><strong>Step 3: Explanation style (Simple / Technical).</strong> How do you want to read the items? In <strong>📖 Simple</strong> mode, items are written in everyday language without package names, version numbers or other jargon; this is the most comfortable mode if software jargon isn't your world or you build apps with AI assistants. In <strong>🛠️ Technical</strong> mode, package names, version numbers, function names and code snippets are shown in full; that mode is more efficient for software people. Some items read the same in both modes (planning, SWOT, design, etc.); only items with real technical detail get two versions. You can switch any time via the <strong>📖 Simple / Technical</strong> button on top.</li>
          <li><strong>Step 4: Project name.</strong> Which project will you check with this list? Give your project a name (e.g. "ChefOl iOS", "Port Tracker"). You can keep <strong>up to 20 separate projects</strong> in the same app, each with its own marks and notes. You can rename a project any time later.</li>
          <li><strong>Step 5: Pick a framework.</strong> Which language / framework will this project use? Pick one of 6 options:
            <ul>
              <li><strong>🐦 Flutter</strong>: Google's framework that builds Android + iOS from one codebase (<em>Dart</em>).</li>
              <li><strong>⚛ React Native</strong>: Meta's cross-platform framework written in JavaScript / TypeScript (bare CLI).</li>
              <li><strong>🍎 Swift</strong>: Apple's official path; native iPhone / iPad apps (<em>SwiftUI</em>).</li>
              <li><strong>🤖 Kotlin</strong>: Google's official path; native Android apps (<em>Jetpack Compose</em>).</li>
              <li><strong>🚀 Expo</strong>: A simpler React Native; cloud builds and submission (<em>EAS Build</em>).</li>
              <li><strong>🌐 PWA</strong>: Web technologies (HTML/CSS/JS) installable on phones via "Add to Home Screen".</li>
            </ul>
          </li>
          <li><strong>Step 6: Pick a backend.</strong> Which server side will your app use? The backend handles sign-up, database, file uploads and anything online. Backend-related items in the list adapt to your choice:
            <ul>
              <li><strong>🚫 No backend</strong>: Your app never connects to the internet (on-device only). All backend items are removed from the list. This option appears prominently above the others, larger and more visible.</li>
              <li><strong>🔥 Firebase</strong>: Google's quick and easy server solution.</li>
              <li><strong>🟢 Supabase</strong>: Open-source, powerful server solution.</li>
              <li><strong>🟣 Appwrite</strong>: Open-source, flexible server solution.</li>
              <li><strong>📦 PocketBase</strong>: Quick-to-set-up, lightweight server solution.</li>
              <li><strong>☁️ AWS Amplify</strong>: Amazon's enterprise server solution.</li>
              <li><strong>⚡ Convex</strong>: A modern, TypeScript-first server solution.</li>
              <li><strong>🛠️ Self-hosted server</strong>: A custom server you build yourself.</li>
              <li><strong>💻 Local dev backend</strong>: Test server running on your computer.</li>
            </ul>
          </li>
          <li><strong>Step 7: Welcome.</strong> After picking the backend, press <strong>"Next ›"</strong>. You'll get a quick tour (Notes, Ask AI, Theme, etc.). Press <strong>"OK, Let's Start"</strong> to open the list. If you picked the wrong one, use <strong>"‹ Back"</strong> from any step to go to the previous one.</li>
        </ul>
        <p>Your framework + backend combination drives how items appear (package names, build commands, install steps differ). Picking "No backend" removes every backend item from the list entirely.</p>
      </section>

      <section>
        <h3>📁 Multi-Project Management (Up to 20 Projects)</h3>
        <p>You can track multiple projects' checklists in the same app (e.g. "ChefOl iOS", "Port Tracker", "Capstone project"). Each project keeps its <strong>own isolated data</strong>; one doesn't affect another. The active project is shown by the <strong>📁 project pill</strong> on the right of the page header: e.g. "📁 ChefOl iOS · 🐦 Flutter".</p>

        <p><strong>Data stored per-project:</strong></p>
        <ul>
          <li>Chosen framework (each project can use a different framework)</li>
          <li>MVP / Release marks and progress bars</li>
          <li>Item notes</li>
          <li>Category open/closed state</li>
          <li>View filter (MVP / Release / All, Done / Pending)</li>
          <li>Lock state</li>
          <li>Celebration flags (so you only see each celebration once)</li>
        </ul>
        <p><strong>Settings shared across projects:</strong> Theme (dark/light) and language (TR/EN) are global; switching them in any project applies to all.</p>

        <p><strong>Click the project pill to open the "Project and Framework" modal; it has three tabs:</strong></p>
        <ul>
          <li><strong>📁 Project tab</strong>:
            <ul>
              <li>The <strong>"n / 20 projects"</strong> counter at the top right.</li>
              <li><strong>"+ New Project"</strong> button → opens a separate modal: type a name, pick one of the 6 frameworks, click <strong>"Create"</strong>. A confirmation explains that the new project will be created and that your current project's data stays saved. Confirm → the new project becomes active and you return to the main screen with its fresh list. If you cancel the confirmation, your inputs are preserved so you don't have to retype them.</li>
              <li><strong>Project list</strong>: every project on its own row. Each row shows framework icon, name, and ✏ <strong>Rename</strong> / 🗑 <strong>Delete</strong> buttons on the right. The active row is highlighted in orange.</li>
              <li><strong>Switch project</strong>: click a row → a confirmation appears (current project's data stays saved, target project will become active) → confirm → the app loads the new project and returns to the main screen. Clicking the active row does nothing (you're already there).</li>
              <li><strong>Rename</strong> (✏): the row enters rename mode; type a new name → Save. An error is shown if another project has the same name.</li>
              <li><strong>Delete</strong> (🗑): after confirmation, the project and all its data (marks, notes, settings) are permanently deleted. <em>You can't delete the last remaining project</em>, because at least one must remain; the delete button becomes disabled.</li>
            </ul>
          </li>
          <li><strong>🔄 Framework tab</strong>: Changes the active project's framework. Details below in "Switch Framework".</li>
        </ul>

        <p><strong>🎯 Deleting the active project: smart switch picker.</strong> If you delete the project you're currently working on, after the deletion confirmation:</p>
        <ul>
          <li><strong>If you have 3 or more projects</strong>: a "Which project do you want to switch to?" dialog opens. You see the remaining projects (most recently updated first). Click one → the old project is deleted, the chosen one becomes active, and you return to the main screen with its list. No extra confirmation is needed.</li>
          <li><strong>If you have 2 projects</strong>: the remaining one is automatically activated without asking.</li>
        </ul>

        <p><strong>💡 Practical use:</strong> If you want to show the same app to one instructor with Flutter and to another with React Native, open two separate projects. Or manage multiple capstone / internship projects in a single browser.</p>
        <p><strong>⚠️ Note about backup:</strong> The <strong>"Export"</strong> button below backs up only the <strong>active project</strong>'s marks and notes; it does not include other projects. To back up multiple projects, switch into each and export separately.</p>
      </section>

      <section>
        <h3>✅ Marking and Progress Tracking</h3>
        <p>Each item has <strong>clickable boxes</strong> for MVP and Release levels:</p>
        <ul>
          <li>When you finish an item, <strong>click the box</strong>: it gets ticked with a colored background.</li>
          <li>To untick, <strong>click again</strong>.</li>
          <li>You can tick MVP and Release independently for the same item.</li>
        </ul>
        <p>The sticky <strong>3 progress bars</strong> at the top show how far along you are:</p>
        <ul>
          <li><strong>Total Progress</strong>: percentage of the entire list (MVP + Release combined).</li>
          <li><strong style="color: var(--mvp);">MVP</strong>: just the green level percentage.</li>
          <li><strong style="color: var(--release);">Release</strong>: just the blue level percentage.</li>
        </ul>
        <p>Each category header shows <strong>its own percentage</strong> too, and that percentage is <strong>step-aware</strong>: ticking even a few How-To steps inside an item nudges the category percentage by small amounts (roughly 1-5% per step). You will see granular values like "60%, 23 / 60"; the total sub-item count depends on the category.</p>
        <p><strong>🎨 Category Completion Variations.</strong> When all MVP or all Release levels in a category are ticked, the category header changes visually to reinforce the "done" feeling:</p>
        <ul>
          <li><strong style="color: var(--mvp);">🟢 Only all MVPs done</strong>: the category header switches to a soft green background; title and percent also turn green. Since Release is still in progress, no tick is shown.</li>
          <li><strong style="color: var(--release);">🔵 Only all Releases done</strong>: the category header switches to a soft blue background; title and percent also turn blue. Since MVP is still in progress, no tick is shown.</li>
          <li><strong style="color: #2FA4AA;">🩵 Everything done (MVP + Release)</strong>: background, text and ✓ badge all shift to a <em>teal</em> tone; this color is the RGB midpoint of MVP green and Release blue, the "reward" color for having both levels complete. A small ✓ badge appears next to the title and the "X / Y" counter becomes <strong>"Completed"</strong>.</li>
        </ul>
        <p><strong>📦 Auto-save:</strong> Marks are <strong>saved instantly to your browser</strong>. Closing and reopening the app picks up where you left off.</p>
        <p><strong>🎉 Celebrations:</strong> A small celebration appears when you complete MVP, Release, or the entire list.</p>
      </section>

      <section>
        <h3>🌐 Switch Language (TR / EN)</h3>
        <p>In the page header, just left of the project pill, there is a <strong>🌐 TR / EN</strong> button. Click it to switch instantly between <strong>Turkish</strong> and <strong>English</strong>.</p>
        <ul>
          <li>Every text is translated: categories, the 53 items, MVP/Release descriptions, modals, toasts, buttons, AI prompts.</li>
          <li>Whichever framework you picked, its variant texts also appear in the chosen language.</li>
          <li><strong>Language is global across all projects</strong> (like theme). Switching it in one project switches it everywhere.</li>
          <li>Your preference is <strong>saved in the browser</strong>; the chosen language is active on next open.</li>
          <li>On the very first run, the welcome flow first asks you to <strong>pick a language</strong>; that choice drives the UI as well as the framework step that follows.</li>
        </ul>
      </section>

      <section>
        <h3>🎯 Smart Filtering (3×3 = 9 Combinations)</h3>
        <p>The header has <strong>3 main pills</strong>: <strong style="color: var(--mvp);">MVP ▾</strong>, <strong style="color: var(--release);">Release ▾</strong>, <strong style="color: #ef4444;">MVP + Release ▾</strong>. Click any to open its dropdown with <strong>3 sub-options</strong>: <strong>All</strong>, <strong>Pending</strong>, <strong>Done</strong>.</p>
        <p>That gives you 3 levels × 3 statuses = <strong>9 different filter combinations</strong>:</p>
        <ul>
          <li><strong style="color: var(--mvp);">MVP · All</strong>: only MVP rows (checked + unchecked). Release entirely hidden.</li>
          <li><strong style="color: var(--mvp);">MVP · Pending</strong>: only <em>unchecked</em> MVP rows. "Which MVPs are left?"</li>
          <li><strong style="color: var(--mvp);">MVP · Done</strong>: only <em>checked</em> MVP rows. "What have I completed?"</li>
          <li><strong style="color: var(--release);">Release · All / Pending / Done</strong>: same logic for Release level.</li>
          <li><strong style="color: #ef4444;">MVP + Release · All</strong> (default): everything visible, no filter.</li>
          <li><strong style="color: #ef4444;">MVP + Release · Pending</strong>: all <em>unchecked</em> rows from any level (a global to-do).</li>
          <li><strong style="color: #ef4444;">MVP + Release · Done</strong>: all <em>checked</em> rows (a global achievements list).</li>
        </ul>
        <p>The <strong>active pill</strong> is color-highlighted and shows the chosen sub-filter as a label inside (e.g. "MVP · Done ▾"). Other pills stay neutral.</p>
        <p><strong>Disabled logic:</strong> If the relevant level has no marks, "Pending" and "Done" sub-options are <em>grayed out</em> (nothing to show). "All" is always active.</p>
        <p>Both the level group and sub-filter are <strong>saved separately in your browser</strong>; you pick up exactly where you left off next time.</p>
      </section>

      <section>
        <h3>🔄 Switch Framework</h3>
        <p>You can change the active project's framework any time. Click the <strong>📁 project pill</strong> in the header → switch to the <strong>"Framework" tab</strong> in the modal → click one of the 6 options → a confirmation appears, click "Switch".</p>
        <p>When you switch:</p>
        <ul>
          <li>The 28 framework-specific items <strong>change instantly</strong> (e.g. "<code>flutter build apk</code>" becomes "<code>eas build --platform android</code>").</li>
          <li><strong>Your marks and notes are NOT lost</strong>: they stay. Only wording / package names change.</li>
          <li>The change affects only the <strong>active project</strong>; other projects' frameworks stay the same.</li>
          <li>You can switch back any time.</li>
        </ul>
        <p><em>💡 Tip:</em> If you want to try the same app in two different frameworks, instead of switching, use <strong>"+ New Project"</strong> to create a second project (same or similar name) with a different framework. That way you keep separate marks in each.</p>
      </section>

      <section>
        <h3>🔒 List Lock</h3>
        <p>The <strong>🔒 Lock</strong> button in the toolbar puts the list you're working on into <em>read-only</em> mode. Useful for presenting, freezing the view when you are store-ready, or to avoid accidentally toggling marks.</p>
        <p><strong>What happens when lock is on?</strong></p>
        <ul>
          <li><strong>MVP / Release marks</strong> cannot be changed; you can't add a new mark or remove an existing one.</li>
          <li>The <strong>Framework</strong> switch button is disabled.</li>
          <li><strong>Reset</strong> and <strong>Import</strong> are disabled (so you can't accidentally lose data).</li>
          <li><strong>Print</strong> and <strong>Export</strong> are visually emphasized (the natural actions while locked: print / back up).</li>
          <li><strong>Notes, search, filters, categories, theme, presentation, language switching</strong> still work; only data-mutating actions are blocked.</li>
        </ul>
        <p>A thin <strong>"🔒 List locked"</strong> banner appears below the hero so you don't forget the lock is active.</p>
        <p>The lock state is <strong>saved in your browser</strong>; closing and reopening the app keeps it locked. To edit again, press <strong>"Unlock"</strong> and confirm.</p>
      </section>

      <section>
        <h3>🔍 Search Box</h3>
        <p>The toolbar's <strong>search box</strong> searches by <strong>keyword</strong> in title, description and content. Examples: "API", "dark mode", "Firebase", "Apple Sign-In", "Crashlytics".</p>
        <ul>
          <li>Filtering applies <strong>instantly</strong> as you type; non-matching items and empty categories are hidden.</li>
          <li>While searching, <strong>collapsed categories auto-expand</strong> so matches are visible. Clearing the search restores their previous open/closed state.</li>
          <li>While searching, <strong>"Expand All" / "Collapse All"</strong> are temporarily disabled (auto-expand already shows results; manual toggle would conflict).</li>
          <li>Press <kbd>/</kbd> to focus the search box instantly.</li>
        </ul>
        <p><strong>💡 Tip:</strong> Search composes with the <strong>3×3 filter</strong> system. E.g. with "MVP · Pending" active, search "Firebase" to focus on Firebase MVPs you still need to do.</p>
      </section>

      <section>
        <h3>📂 Expand / Collapse Categories</h3>
        <ul>
          <li><strong>Click a category header</strong>: that category toggles. The ▾ chevron on the right shows direction.</li>
          <li><strong>Expand All</strong>: opens every category at once.</li>
          <li><strong>Collapse All</strong>: closes every category at once.</li>
        </ul>
        <p>On first load <strong>all categories are collapsed</strong> (to keep the page tidy). Click what you need to open. Open/closed state is saved in your browser.</p>
      </section>

      <section>
        <h3>🧭 Smart Category Navigation</h3>
        <p>The <strong>14 category chips</strong> at the top (e.g. "01. Project Idea and Planning") aren't simple scroll-to-anchor links; they perform <strong>smart navigation</strong>:</p>
        <ul>
          <li>Clicking a chip scrolls not to the category header but to <strong>"where you left off"</strong>, namely the next item that needs attention.</li>
          <li>The target depends on the active filter:
            <ul>
              <li><strong>MVP filter active</strong> → first item with an unchecked MVP.</li>
              <li><strong>Release filter active</strong> → first item with an unchecked Release.</li>
              <li><strong>MVP+Release filter active</strong> → first item where at least one of MVP or Release is unchecked.</li>
            </ul>
          </li>
          <li><strong>Nothing checked yet</strong> → goes to the first item (which is the next thing to do anyway).</li>
          <li><strong>All items complete</strong> → goes to the last item in that category (for reference).</li>
          <li><strong>Category collapsed?</strong> → it auto-expands, then smooth-scrolls to the target.</li>
          <li>The sticky toolbar height is accounted for; the target item lands just below the toolbar, not behind it.</li>
        </ul>
        <p>So in a 30+ hour project, without searching and without opening collapsed categories, one chip click takes you to the <strong>next item to do</strong>.</p>
      </section>

      <section>
        <h3>❔ How To? (Card Back-Face)</h3>
        <p>Each item card has a small <strong>"How?" button in the top-right corner</strong>. Pressing it <strong>flips the card in 3D</strong> and reveals a step-by-step guide that teaches you how to complete that specific item. To return, press the same button again (now labeled "← Back"). The card also <strong>grows and shrinks</strong> as it flips: the front checklist is shorter, the back guide is longer; each face uses only the space it needs, so the card never leaves empty whitespace.</p>

        <p><strong>Two faces, two purposes:</strong></p>
        <ul>
          <li><strong>Front face = goal.</strong> Answers "what is the state this item describes?". The <strong>MVP and Release level boxes</strong> live here; tick them when your app reaches that state.</li>
          <li><strong>Back face = step-by-step guide.</strong> Answers "how do I reach that state?". MVP and Release each have their own numbered step list.</li>
        </ul>

        <p><strong>✅ Clickable Steps.</strong> The numbered steps on the back face (1, 2, 3 ...) act like <strong>small clickable checkboxes</strong>. When you finish a step, click its circle: the number is replaced by a ✓ tick, the text is struck through, and the circle turns green (MVP) or blue (Release). Keyboard works too: Tab to focus, Enter or Space to toggle.</p>

        <p><strong>🔁 Two-Way Sync (MVP/Release ↔ Steps).</strong> Steps and the front-face level boxes are tied together:</p>
        <ul>
          <li><strong>Ticking MVP on the front auto-ticks all MVP steps on the back.</strong> "Mark MVP done" applies to the step guide as well. Same for Release.</li>
          <li><strong>Ticking every step of a level on the back auto-ticks that level on the front.</strong> Finishing items step-by-step naturally completes the level.</li>
          <li><strong>Un-ticking a single step</strong> auto-unticks the level (since not everything is done anymore). Un-ticking the level on the front clears all its steps in one move.</li>
        </ul>

        <p><strong>📊 Partial Progress Fill on the Front.</strong> When a level has some steps ticked but not all, the front-face MVP or Release row shows a <strong>progress-bar style fill</strong>: the left portion is painted with the MVP green or Release blue tone <em>up to the tick ratio</em>, and a small percentage badge (e.g. "40%") appears in the top-right corner. Once all steps are done, the row turns fully colored, the badge disappears, and the ✓ tick appears. Visual progress and logical progress flow together.</p>

        <p><strong>📁 Persistence and reset.</strong> Step ticks are stored alongside the MVP/Release marks; they survive reloads, project switches, and JSON backups. <strong>Reset → Selections</strong> clears step ticks together with level marks. When you switch backend, step states tied to backend-bound items are cleared too (no stale data).</p>

        <p><strong>🔄 Bulk Mode Switching.</strong> The toolbar has <strong>❔ Show All How-To</strong> and <strong>📋 Show All Checklist</strong> buttons. One click flips every card to the back or front at once; it also updates the usage-mode preference (the one set in the welcome flow). The card heights animate smoothly during the switch; in front mode cards never take up extra space.</p>

        <p>The guide content adapts the same way the front face does, to your chosen <strong>language, explanation style (Simple / Technical), framework and backend</strong>. For example, on Flutter + Firebase you'll see Firebase Console steps and Flutter commands; switch to Supabase and the same item's back face now shows Supabase Studio steps.</p>

        <p>For items that don't need a separate guide (e.g. self-explanatory items like "do a SWOT analysis"), the back face shows a "no separate how-to" note and the <strong>🤖 Ask AI</strong> button remains available for deeper help.</p>

        <p><strong>📲 Notes and AI work on both sides.</strong> The <strong>"+ Add note"</strong> and <strong>"🤖 Ask AI"</strong> buttons under the card stay in the same place and behave the same way no matter which side is visible. You can capture a note the moment it crosses your mind while reading the guide.</p>

        <p><strong>Typical use:</strong> you look at an item, don't know what to do → press "How?" → read the guide → tick steps as you finish them → once every step is ticked the level becomes done on the front, with the visual completion feedback flowing naturally.</p>
      </section>

      <section>
        <h3>📝 Item Notes</h3>
        <p>Each item has a <strong>"+ Add note"</strong> button. Click to open a text area.</p>
        <ul>
          <li>Write <strong>your own notes, reminders, problems, references</strong>. Examples:
            <ul>
              <li>"I'll ask the instructor about this on May 12"</li>
              <li>"Check this package: <code>shared_preferences</code>"</li>
              <li>"We did the design in Figma, link: ..."</li>
            </ul>
          </li>
          <li><strong>Every keystroke is saved automatically</strong>: no save button needed.</li>
          <li>Items with notes are highlighted with an orange <strong>📝 mark</strong>; easier to find.</li>
          <li>Use <strong>"Clear note"</strong> to delete the note.</li>
          <li>In <strong>presentation mode</strong>, items with notes <strong>auto-display the note</strong> as a <em>📝 italic card with an orange accent</em> below the levels. Items with no note simply don't render the card. Multi-line notes display correctly with line breaks preserved.</li>
        </ul>
        <p>Notes are <strong>not shown when printing</strong>: they're personal. They DO show in presentation mode because there you're consciously sharing with your team.</p>
      </section>

      <section>
        <h3>🤖 Ask AI (AI Assistance)</h3>
        <p>Each item has an <strong>"🤖 Ask AI"</strong> button. It opens <strong>2 options</strong>:</p>
        <ul>
          <li><strong>📝 English / Türkçe (Markdown)</strong>: A detailed beginner-friendly prompt copied in the active app language. The prompt asks for:
            <ul>
              <li>Concept explanation and why it matters</li>
              <li>Step-by-step implementation (with packages, commands, file paths)</li>
              <li>A working copy-paste code example (comments in the selected language)</li>
              <li>2-3 common mistakes and how to avoid each</li>
              <li>Verification tests</li>
            </ul>
          </li>
          <li><strong>{ } EN JSON</strong>: Copies a structured English JSON prompt. <em>For more advanced users</em>; produces more consistent AI output (with role, project_context, expected_response_structure, constraints fields). The AI is instructed to answer in the active app language (TR or EN).</li>
        </ul>
        <p>Paste the copied prompt into <strong>ChatGPT, Claude, Gemini</strong> and you'll get a thorough guide. A toast notification confirms "copied to clipboard".</p>
        <p><strong>💡 Dual specialization:</strong></p>
        <ul>
          <li><strong>Framework specialization:</strong> with Flutter selected you get "<code>flutter pub add</code>" examples; with Kotlin selected, Gradle dependency lines; with Swift, SPM setup; etc. The right package/command names go to the AI.</li>
          <li><strong>Language specialization:</strong> if the app is in TR, the prompt is in Turkish; if EN, in English. The AI's reply also comes in the selected language.</li>
        </ul>
      </section>

      <section>
        <h3>📺 Presentation Mode</h3>
        <p>Press <strong>"Present"</strong> (or <kbd>P</kbd>) to switch the app into a fully presentation-focused view. Designed for projecting in class, sharing progress with the team, or focusing on a single topic.</p>
        <p><strong>Design features:</strong></p>
        <ul>
          <li><strong>Fixed top context bar</strong>: 📱 app name on the left, on the right a <em>colored chip</em> shows <strong>what you're presenting</strong> (e.g. "MVP Done · 5 items"). The chip color follows the view mode: MVP=green, Release=blue, MVP+Release=orange.</li>
          <li><strong>Category slide</strong>: Each category is a full-screen slide. Title, subtitle, percentage and item count at the top; items below.</li>
          <li><strong>Item cards</strong>: Each item is a shadowed bordered card (2-column grid). Inside: ID badge, title, description, MVP/Release level rows, and a note card if a note exists.</li>
          <li><strong>Notes</strong> auto-render below items that have one, with a 📝 icon.</li>
          <li>Editor elements (note toggle, AI button, note textarea) are hidden in presentation; only a read-only view remains.</li>
        </ul>
        <p><strong>Active filter + Presentation:</strong> Presentation respects the current filter. E.g. with "MVP Done" active, you only navigate between categories that have at least one done MVP (empty categories are skipped). The chip indicates the filter; the bottom counter shows the matching-category count (e.g. "1 / 5"). If the filter matches nothing, a "Nothing to present" toast appears and presentation doesn't open.</p>
        <p><strong>Keyboard:</strong></p>
        <ul class="kbd-list">
          <li><kbd>←</kbd> / <kbd>→</kbd><span>previous / next category</span></li>
          <li><kbd>Space</kbd> / <kbd>PageDown</kbd><span>next category (alternative)</span></li>
          <li><kbd>PageUp</kbd><span>previous category (alternative)</span></li>
          <li><kbd>Esc</kbd><span>exit presentation</span></li>
        </ul>
        <p><strong>💡 Tip:</strong> Pick a filter like "MVP · Pending" before entering presentation to isolate exactly what you want to discuss. Combine with <strong>"📋 List Lock"</strong> to eliminate any risk of accidentally toggling marks during the talk.</p>
      </section>

      <section>
        <h3>💾 Data Management (Backup / Restore / Reset)</h3>
        <ul>
          <li><strong>Export</strong>: downloads the <strong>active</strong> project's marks and notes as a single <strong>JSON file</strong> (e.g. <code>mobil-kontrol-2026-05-11.json</code>). A safety net in case the browser is wiped or you want to migrate. <em>If there are no marks AND no notes yet, the button is greyed out (nothing to export).</em> <em>Note: With multiple projects, switch into each one and export separately to back up everything.</em></li>
          <li><strong>Import</strong>: pick a previously downloaded JSON file → <strong>the active project's marks and notes are restored</strong>. Used to continue on a new device or restore from a backup.</li>
          <li><strong>Reset:</strong> Reset has two separate entry points.
            <ul>
              <li><strong>① The toolbar "Reset" button</strong> (shortcut, scoped to the active project's contents only):
                <ul>
                  <li>📋 <strong>Selections</strong> (the active project's MVP / Release marks and progress)</li>
                  <li>📝 <strong>Notes</strong> (deletes the active project's notes per item)</li>
                </ul>
                Pick one or both. Other projects and global settings remain untouched. Use this for the everyday case of wiping a project and starting fresh.
              </li>
              <li><strong>② Project pill → "Reset" tab</strong> (full mode, four options):
                <ul>
                  <li>📋 <strong>Selections</strong> (active project)</li>
                  <li>📝 <strong>Notes</strong> (active project)</li>
                  <li>⚙️ <strong>Settings (for all projects)</strong>: category open/closed state, theme, level filters and lock revert to defaults.</li>
                  <li>⚠️ <strong>Whole System</strong>: everything is wiped. All projects, marks, notes, settings, language and framework are reset. The app starts like first launch; the welcome flow appears again.</li>
                </ul>
                Combine options freely here. Picking "Whole System" <em>auto-unchecks and disables</em> the others (already covers everything).
              </li>
            </ul>
            <strong>Confirmation step:</strong> No matter which entry point you use, clicking "Next" opens a confirmation dialog that lists exactly what will be deleted; confirm to apply.
          </li>
        </ul>
        <p><strong>💡 Why two entry points?</strong> The toolbar button is intentionally scoped to project contents so you can't accidentally reset "Whole System" or global settings. Bigger actions like reverting theme and lock to defaults, or wiping the whole system, live deliberately inside the Project/Framework modal's Reset tab.</p>
        <p><strong>💡 Tip:</strong> Get into the habit of <strong>exporting at major milestones</strong>; browser data can be wiped by browser cleanup. "Whole System" reset is irreversible; consider backing up your projects before using it.</p>
      </section>

      <section>
        <h3>🖨 Print and PDF (Two Export Modes)</h3>
        <p>Clicking <strong>"Print"</strong> no longer opens the printer directly; instead, a small <strong>selection dialog</strong> appears. You can produce two different PDF flavors from the same project:</p>
        <ul>
          <li><strong>📋 Checklist</strong>: prints the <em>front face</em> of the cards. Ticked items, MVP and Release level rows, progress info and category headers are laid out cleanly. Ideal for sharing with the team, archiving, or seeing at a glance what has been completed. This mode matches the prior print behavior.</li>
          <li><strong>❔ How-To Guide</strong>: prints the <em>back face</em> of the cards. Each item shows the MVP and Release numbered step lists (1, 2, 3 ...) with their colored circles and MVP / Release labels. Acts like a written, portable guide for offline reading, hand-written notes, or walking someone else through the project.</li>
        </ul>
        <p>Both outputs share these print niceties:</p>
        <ul>
          <li><strong>Page title at the top, author info at the bottom</strong> repeat on every page.</li>
          <li>Colors (green MVP, blue Release) are preserved.</li>
          <li><strong>Items are never split in the middle of a page</strong>; each item stays whole, moving to the next page if needed.</li>
          <li>A category header never sits alone at the bottom of a page; header and first item stay together.</li>
          <li><strong>Notes, AI buttons, filter buttons, presentation controls do NOT appear</strong> in the output; only the list content or guide is printed.</li>
        </ul>
        <p>The <strong>How-To Guide</strong> mode also:</p>
        <ul>
          <li>Uses slightly smaller type so more items fit per page and less space is wasted.</li>
          <li>Draws each item as a distinct <strong>card</strong> (thin border with rounded corners), so the relationships between items read clearly.</li>
          <li>Renders ticked steps as ✓ with strike-through in the PDF too; works as a "what you finished" log.</li>
          <li>Hides the category percent column (a guide is not a checklist); the title and the ✓ completion badge (if any) stay.</li>
        </ul>
        <p><kbd>Ctrl</kbd>+<kbd>P</kbd> (Mac: <kbd>⌘</kbd>+<kbd>P</kbd>) opens the browser's print dialog directly; that path bypasses the selection modal and prints whichever face is currently visible.</p>
      </section>

      <section>
        <h3>🌙 Theme (Dark / Light)</h3>
        <p>The toolbar's <strong>🌙 Dark / ☀ Light</strong> button toggles theme.</p>
        <ul>
          <li><strong>Dark</strong>: easier on the eyes at night or in low light (default).</li>
          <li><strong>Light</strong>: classic white look for daytime / well-lit environments. All accent colors (MVP green, Release blue, accent orange) hold up in light mode too.</li>
        </ul>
        <p>Your preference is <strong>saved in the browser</strong>. A toast confirms each change.</p>
      </section>

      <section>
        <h3>📲 Install as App (PWA)</h3>
        <p>Install this checklist on your phone or computer <strong>like a real app</strong>:</p>
        <ul>
          <li><strong>Mobile:</strong> added to the home screen as its own icon.</li>
          <li><strong>Desktop:</strong> shortcut added to the start menu / dock.</li>
          <li>One-click open, <strong>works offline too</strong> (Service Worker cache).</li>
        </ul>
        <p><strong>How to install:</strong></p>
        <ul>
          <li>An <strong>"📲 Install"</strong> banner may appear at the top of the page. Click it → the browser's native install dialog opens → click "Install".</li>
          <li>If the banner is unsupported (e.g. iOS Safari, Firefox desktop), a <strong>device-specific step-by-step instructions modal</strong> opens. The modal auto-detects your platform (iOS Safari, Android Chrome, Samsung Internet, Firefox, Edge, macOS Safari, etc.) and shows the right menu path (e.g. "Share → Add to Home Screen" in Safari).</li>
          <li>If you dismiss the banner it won't return (your browser is flagged). You can still install manually from your browser menu.</li>
        </ul>
        <p>After install: clicking the icon launches the app in <strong>its own window</strong> (not a browser tab), with no address bar, behaving like a real app.</p>
      </section>

      <section>
        <h3>⌨️ Keyboard Shortcuts</h3>
        <ul class="kbd-list">
          <li><kbd>?</kbd><span>Open this help dialog</span></li>
          <li><kbd>/</kbd><span>Focus the search box (start typing immediately)</span></li>
          <li><kbd>P</kbd><span>Open presentation mode</span></li>
          <li><span><kbd>←</kbd> <kbd>→</kbd></span><span>Previous / next category in presentation</span></li>
          <li><kbd>Space</kbd> / <kbd>PageDown</kbd><span>Next category in presentation (alternative)</span></li>
          <li><kbd>PageUp</kbd><span>Previous category in presentation (alternative)</span></li>
          <li><kbd>Esc</kbd><span>Close open modal / dropdown / exit presentation</span></li>
          <li><kbd>Ctrl</kbd>+<kbd>P</kbd><span>Browser print (also Save as PDF)</span></li>
        </ul>
        <p><em>Note: Shortcuts (<kbd>?</kbd>, <kbd>/</kbd>, <kbd>P</kbd>) won't fire while typing inside an input/textarea; your text stays intact.</em></p>
      </section>
  `
};

