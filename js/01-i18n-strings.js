/* ==================== I18N (DİL DEĞİŞTİRME) ==================== */
const LANG_KEY = "mobil_kontrol_lang_v1";
let currentLang = (() => {
  try {
    const v = localStorage.getItem(LANG_KEY);
    return (v === "tr" || v === "en") ? v : "tr";
  } catch { return "tr"; }
})();

/* ==================== ANLATIM DİLİ (BASİT / TEKNİK) ====================
   Global tercih; localStorage'da tema gibi saklanır. Default "technical" —
   eski kullanıcı içerikleri olduğu gibi görsün diye. Yeni kullanıcılar
   welcome akışının 2. adımında seçer. */
const STYLE_KEY = "mobil_kontrol_style_v1";
let currentStyle = (() => {
  try {
    const v = localStorage.getItem(STYLE_KEY);
    return (v === "simple" || v === "technical") ? v : "technical";
  } catch { return "technical"; }
})();

/* Bir {tr, en} objesinden geçerli dile ve anlatım stiline uygun metni döndür.
   Desteklenen değer biçimleri (geriye uyumlu):
     1) "düz string"  → her dilde ve her stilde aynı
     2) { tr: "...", en: "..." } → dile göre; her stilde aynı
     3) { tr: "teknik TR", en: "technical EN",
          simple: { tr: "basit TR", en: "simple EN" } }
          → "simple" stilinde simple.{tr|en}, "technical" stilinde {tr|en}
   "simple" bloğu eksikse otomatik olarak teknik içerikten doldurur — bu
   sayede sadece teknik içerikli maddelere simple metin eklemek yeterli;
   diğer maddeler ek iş gerektirmez. */
function tx(obj) {
  if (obj == null) return "";
  if (typeof obj === "string") return obj;
  if (typeof obj === "object") {
    if (currentStyle === "simple" && obj.simple && typeof obj.simple === "object") {
      return obj.simple[currentLang] || obj.simple.tr || obj.simple.en
          || obj[currentLang] || obj.tr || obj.en || "";
    }
    return obj[currentLang] || obj.tr || obj.en || "";
  }
  return String(obj);
}

/* UI metinleri sözlüğü, statik HTML için (data-i18n / data-i18n-title / vb.) */
const UI_STRINGS = {
  // common
  "common.close": { tr: "Kapat", en: "Close" },

  // hero
  "hero.eyebrow": { tr: "MVP · Release · Kalite Kontrol", en: "MVP · Release · Quality Check" },
  "hero.title": { tr: "Mobil Uygulama <em>Kalite Kontrol Listesi</em>", en: "Mobile App <em>Quality Checklist</em>" },
  "hero.preparedBy": { tr: "Hazırlayan", en: "Prepared by" },
  "hero.levelView": { tr: "Seviye görünümü", en: "Level view" },
  "hero.mvpOnly": { tr: "Sadece MVP maddelerini göster", en: "Show only MVP items" },
  "hero.releaseOnly": { tr: "Sadece Release maddelerini göster", en: "Show only Release items" },
  "hero.bothLevels": { tr: "Hem MVP hem Release göster (varsayılan)", en: "Show both MVP and Release (default)" },
  "hero.bothLevelsLabel": { tr: "MVP + Release", en: "MVP + Release" },
  "hero.frameworkBtn": { tr: "Yazılım çerçevesini değiştir", en: "Switch software framework" },
  "hero.lockedMsg": { tr: "🔒 Liste kilitli. Değiştirmek için 'Kilidi Aç'a bas.", en: "🔒 List locked. Press 'Unlock' to make changes." },

  // install banner
  "install.bannerTitle": { tr: "Bu uygulamayı tek tıkla cihazına yükle", en: "Install this app to your device with one click" },
  "install.bannerDesc": { tr: "Mobilde ana ekrana, masaüstünde başlat menüsüne kısayol olarak eklenir. İnternet olmadan da kullanabilirsin.", en: "Adds a shortcut to your home screen on mobile or start menu on desktop. Works offline." },
  "install.bannerBtn": { tr: "📲 Yükle", en: "📲 Install" },
  "install.bannerClose": { tr: "Bu bildirimi kapat", en: "Dismiss this notification" },

  // search
  "search.placeholder": { tr: "Özellik ara, örn: 'API', 'dark mode', 'Firebase'…", en: "Search a feature, e.g. 'API', 'dark mode', 'Firebase'…" },

  // toolbar toggle
  "toolbar.toggleAria": { tr: "Eylem menüsünü aç/kapat", en: "Open/close action menu" },
  "toolbar.toggleTitle": { tr: "Eylem menüsü", en: "Action menu" },

  // groups (aria-labels)
  "group.filter": { tr: "Filtre", en: "Filter" },
  "group.category": { tr: "Kategori kontrolü", en: "Category control" },
  "group.view": { tr: "Görünüm", en: "View" },
  "group.data": { tr: "Veri", en: "Data" },
  "group.helpPrint": { tr: "Yardım ve yazdır", en: "Help and print" },

  // dropdown opsiyon label'ları (3x3 view × filter matrisi)
  "viewFilter.all": { tr: "Tümü", en: "All" },
  "viewFilter.pending": { tr: "Yapılacak", en: "Pending" },
  "viewFilter.done": { tr: "Yapılan", en: "Done" },
  "viewFilter.menuTitle": { tr: "Filtre seç", en: "Pick a filter" },

  // toolbar buttons
  "btn.expandAll": { tr: "Tümünü Aç", en: "Expand All" },
  "btn.expandAll.title": { tr: "Tüm kategorileri aç", en: "Expand all categories" },
  "btn.collapseAll": { tr: "Tümünü Kapat", en: "Collapse All" },
  "btn.collapseAll.title": { tr: "Tüm kategorileri kapat", en: "Collapse all categories" },
  "btn.present": { tr: "Sunum", en: "Present" },
  "btn.present.title": { tr: "Sunum modu (P / Esc)", en: "Presentation mode (P / Esc)" },
  "btn.theme.title": { tr: "Açık / Koyu tema", en: "Light / Dark theme" },
  "btn.lang.title": { tr: "Dili değiştir / Switch language", en: "Switch language / Dili değiştir" },
  "btn.lang.aria": { tr: "Dil değiştir", en: "Switch language" },
  "btn.style.title": { tr: "Anlatım dili: Basit / Teknik. Yazılım dünyasına uzaksan Basit'i dene.", en: "Explanation style: Simple / Technical. If software jargon isn't your world, try Simple." },
  "btn.style.aria": { tr: "Anlatım dilini değiştir", en: "Switch explanation style" },
  "btn.lock.title": { tr: "Listeyi kilitle (işaretler/framework değişemez)", en: "Lock the list (marks/framework cannot change)" },
  "btn.lock.unlockTitle": { tr: "Kilidi aç (işaretler düzenlenebilir hale gelir)", en: "Unlock (marks become editable again)" },
  "btn.export": { tr: "Dışa Aktar", en: "Export" },
  "btn.export.title": { tr: "İşaretlemeleri ve notları JSON olarak kaydet", en: "Save marks and notes as JSON" },
  "btn.import": { tr: "İçe Aktar", en: "Import" },
  "btn.import.title": { tr: "Daha önce kaydettiğin JSON dosyasını yükle", en: "Load a previously saved JSON file" },
  "btn.reset": { tr: "Sıfırla", en: "Reset" },
  "btn.reset.title": { tr: "Tüm işaretleri temizle (notlar korunur)", en: "Clear all marks (notes are preserved)" },
  "btn.help": { tr: "? Yardım", en: "? Help" },
  "btn.help.title": { tr: "Nasıl kullanılır? (?)", en: "How to use? (?)" },
  "btn.print": { tr: "Yazdır", en: "Print" },
  "btn.print.title": { tr: "Yazdır / PDF", en: "Print / PDF" },

  // theme labels
  "theme.dark": { tr: "Koyu", en: "Dark" },
  "theme.light": { tr: "Açık", en: "Light" },
  "theme.darkOpened": { tr: "Koyu tema açıldı", en: "Dark theme on" },
  "theme.lightOpened": { tr: "Açık tema açıldı", en: "Light theme on" },

  // lock labels
  "lock.label": { tr: "Kilit", en: "Lock" },
  "lock.unlockLabel": { tr: "Kilidi Aç", en: "Unlock" },
  "lock.locked": { tr: "🔒 Liste kilitlendi", en: "🔒 List locked" },
  "lock.unlocked": { tr: "🔓 Kilit kaldırıldı", en: "🔓 Unlocked" },
  "lock.confirmTitle": { tr: "Listeyi kilitle?", en: "Lock the list?" },
  "lock.confirmYes": { tr: "Kilitle", en: "Lock" },
  "lock.confirmCancel": { tr: "Vazgeç", en: "Cancel" },
  "lock.unlockTitle": { tr: "Kilidi aç?", en: "Unlock?" },
  "lock.unlockYes": { tr: "Kilidi Aç", en: "Unlock" },
  "lock.intro": { tr: "Kilit etkinleştirilirse:", en: "If lock is enabled:" },
  "lock.unlockIntro": { tr: "Kilidi açtığında düzenleme işlevleri eski haline döner:", en: "When unlocked, editing capabilities are restored:" },
  "lock.effect.marks": { tr: "<strong>MVP / Release işaretleri</strong> değiştirilemez (yeni işaret eklenemez, mevcut kaldırılamaz)", en: "<strong>MVP / Release marks</strong> cannot be changed (no add or remove)" },
  "lock.effect.fw": { tr: "<strong>Framework</strong> değiştirilemez", en: "<strong>Framework</strong> cannot be changed" },
  "lock.effect.reset": { tr: "<strong>Sıfırla</strong> ve <strong>İçe Aktar</strong> devre dışı kalır", en: "<strong>Reset</strong> and <strong>Import</strong> are disabled" },
  "lock.effect.print": { tr: "<strong>Yazdır</strong> ve <strong>Dışa Aktar</strong> görsel olarak vurgulanır", en: "<strong>Print</strong> and <strong>Export</strong> are visually emphasized" },
  "lock.effect.normal": { tr: "<strong>Notlar, arama, filtreler, kategoriler, tema, sunum</strong> normal çalışır", en: "<strong>Notes, search, filters, categories, theme, presentation</strong> work normally" },
  "lock.unlockEffect.marks": { tr: "<strong>İşaretler</strong> tekrar düzenlenebilir", en: "<strong>Marks</strong> become editable again" },
  "lock.unlockEffect.fw": { tr: "<strong>Framework</strong> değiştirilebilir", en: "<strong>Framework</strong> can be changed" },
  "lock.unlockEffect.reset": { tr: "<strong>Sıfırla / İçe Aktar</strong> tekrar aktif olur", en: "<strong>Reset / Import</strong> become active again" },

  // progress
  "progress.total": { tr: "Toplam", en: "Total" },
  "progress.totalExtra": { tr: " İlerleme", en: " Progress" },

  // footer
  "footer.title": { tr: "Mobil Uygulama Kalite Kontrol Listesi", en: "Mobile App Quality Checklist" },
  "footer.preparedBy": { tr: "Hazırlayan", en: "Prepared by" },
  "footer.date": { tr: "Mayıs 2026", en: "May 2026" },
  "footer.printFooter": { tr: "Hazırlayan: Özcan Orhan Demirci", en: "Prepared by: Özcan Orhan Demirci" },

  // presentation
  "pres.prev": { tr: "Önceki kategori (←)", en: "Previous category (←)" },
  "pres.next": { tr: "Sonraki kategori (→)", en: "Next category (→)" },
  "pres.exit": { tr: "Sunumdan çık (Esc)", en: "Exit presentation (Esc)" },
  "pres.exitLabel": { tr: "Kapat", en: "Close" },

  // presentation context bar (üst başlık)
  "pres.appName": { tr: "Mobil Uygulama Kalite Kontrol", en: "Mobile App Quality Check" },
  "pres.context.all": { tr: "Tüm Liste", en: "All Items" },
  "pres.context.mvp": { tr: "Sadece MVP Seviyesi", en: "MVP Level Only" },
  "pres.context.release": { tr: "Sadece Release Seviyesi", en: "Release Level Only" },
  "pres.context.mvpPending": { tr: "Yapılacak MVP'ler", en: "MVP Pending" },
  "pres.context.mvpDone": { tr: "Yapılan MVP'ler", en: "MVP Done" },
  "pres.context.releasePending": { tr: "Yapılacak Release'ler", en: "Release Pending" },
  "pres.context.releaseDone": { tr: "Yapılan Release'ler", en: "Release Done" },
  "pres.context.bothPending": { tr: "Yapılacak Tümü (MVP + Release)", en: "All Pending (MVP + Release)" },
  "pres.context.bothDone": { tr: "Yapılan Tümü (MVP + Release)", en: "All Done (MVP + Release)" },
  "pres.itemCount": { tr: "{n} madde", en: "{n} items" },
  "pres.itemCountOne": { tr: "1 madde", en: "1 item" },
  "pres.empty": { tr: "Sunulacak madde yok (filtre boş)", en: "Nothing to present (filter is empty)" },

  // help modal
  "help.title": { tr: "Nasıl Kullanılır?", en: "How to Use?" },
  "help.accordion.aria": { tr: "Yardım bölümlerini aç/kapat", en: "Expand/collapse help sections" },
  "help.accordion.expandAll": { tr: "▾ Tümünü Aç", en: "▾ Expand All" },
  "help.accordion.collapseAll": { tr: "▸ Tümünü Kapat", en: "▸ Collapse All" },
  "help.accordion.expandAllTitle": { tr: "Tüm bölümleri aç", en: "Expand all sections" },
  "help.accordion.collapseAllTitle": { tr: "Tüm bölümleri kapat", en: "Collapse all sections" },

  // welcome
  "welcome.helpBtnTitle": { tr: "Nasıl kullanılır? (Yardım)", en: "How to use? (Help)" },
  "welcome.helpBtnAria": { tr: "Yardım", en: "Help" },
  "welcome.helpLabel": { tr: "Yardım", en: "Help" },
  "welcome.title": { tr: "Hoş Geldin!", en: "Welcome!" },
  "welcome.title.bilingual": { tr: "Hoş Geldin! · Welcome!", en: "Hoş Geldin! · Welcome!" },
  "welcome.langQuestion": { tr: "Hangi dilde devam etmek istersin? · Which language would you like to continue in?", en: "Which language would you like to continue in? · Hangi dilde devam etmek istersin?" },
  "welcome.langSub": { tr: "Tüm metinler seçtiğin dilde gösterilir. Sonradan üstteki 🌐 butonu ile her zaman değiştirebilirsin. · All texts will appear in your chosen language. You can change it any time from the 🌐 button on top.", en: "All texts will appear in your chosen language. You can change it any time from the 🌐 button on top. · Tüm metinler seçtiğin dilde gösterilir. Sonradan üstteki 🌐 butonu ile her zaman değiştirebilirsin." },
  "welcome.langAria": { tr: "Dil seçimi", en: "Language selection" },
  "welcome.cta.pickLang": { tr: "Devam etmek için dil seç · Pick a language to continue", en: "Pick a language to continue · Devam etmek için dil seç" },
  "welcome.fwQuestion": { tr: "Hangi framework / dil ile çalışıyorsun?", en: "Which framework / language are you using?" },
  "welcome.fwSub": { tr: "Listede 28 madde framework'e göre değişir (paket adları, build/yayın akışı, platform farkları, ödeme/reklam yöntemi); geri kalan 25 madde evrenseldir. Sonradan üstteki butondan değiştirebilirsin.", en: "28 items vary by framework (package names, build/release flow, platform differences, payments/ads); the remaining 25 are universal. You can change it later from the top button." },
  "welcome.fwAria": { tr: "Framework seçimi", en: "Framework selection" },
  "welcome.cta.pickFw": { tr: "Devam etmek için framework seç", en: "Pick a framework to continue" },
  "welcome.cta.next": { tr: "İleri ›", en: "Next ›" },
  "welcome.lead": { tr: "Bu web uygulaması, geliştirdiğin mobil uygulamanın kalite durumunu kontrol etmen için hazırlandı.", en: "This web app is built to help you audit the quality of the mobile app you are developing." },
  "welcome.body": { tr: "14 kategoride 53 özellik var. Her özelliğin <strong style=\"color: var(--mvp);\">MVP (yeşil, olmazsa olmaz)</strong> ve <strong style=\"color: var(--release);\">Release (mavi, yayınlanabilir profesyonel kalite)</strong> seviyelerini işaretleyerek ilerleyişini takip edebilirsin. İşaretlemen tarayıcına otomatik kaydedilir.", en: "53 features across 14 categories. Track progress by marking each feature's <strong style=\"color: var(--mvp);\">MVP (green, must-have)</strong> and <strong style=\"color: var(--release);\">Release (blue, store-ready professional quality)</strong> levels. Your marks are auto-saved in your browser." },
  "welcome.featuresList": {
    tr: "<li><strong>📝 Notlar</strong>her madde için kişisel notunu yaz</li><li><strong>🤖 AI'a sor</strong>maddeyi AI ile çözmen için hazır prompt</li><li><strong>🌐 TR / EN</strong>uygulamayı anında Türkçe ↔ İngilizce çevir</li><li><strong>🎯 Seviye filtresi</strong>sadece MVP, sadece Release ya da hepsi</li><li><strong>🔄 Framework</strong>28 madde stack'ine göre özelleşir</li><li><strong>🔒 Kilit</strong>liste salt-okunur, yanlışlıkla bozulmaz</li><li><strong>🔍 Arama</strong>başlık, açıklama ve içerikte anahtar kelime ara</li><li><strong>🎨 Tema</strong>açık ve koyu mod arasında geçiş</li><li><strong>📺 Sunum</strong>tek kategori tam ekran sunum modu</li><li><strong>🖨 Yazdır</strong>PDF olarak indir, paylaş</li><li><strong>💾 Yedek</strong>JSON dışa / içe aktarma</li><li><strong>📲 PWA yükle</strong>uygulama gibi cihazına ekle, çevrimdışı çalışsın</li>",
    en: "<li><strong>📝 Notes</strong>add a personal note to each item</li><li><strong>🤖 Ask AI</strong>ready-made prompt to solve an item with AI</li><li><strong>🌐 TR / EN</strong>switch the app between Turkish ↔ English instantly</li><li><strong>🎯 Level filter</strong>MVP only, Release only, or both</li><li><strong>🔄 Framework</strong>28 items adapt to your stack</li><li><strong>🔒 Lock</strong>list becomes read-only, no accidental edits</li><li><strong>🔍 Search</strong>find a keyword in title, description and content</li><li><strong>🎨 Theme</strong>switch between light and dark mode</li><li><strong>📺 Presentation</strong>one-category fullscreen mode</li><li><strong>🖨 Print</strong>download as PDF, share</li><li><strong>💾 Backup</strong>JSON export / import</li><li><strong>📲 Install PWA</strong>add to your device, works offline</li>"
  },
  "welcome.tip": { tr: "İhtiyacın olduğu her an üstteki <strong>? Yardım</strong> butonu ile detaylı rehbere ulaşabilirsin. Klavye kısayolları için <kbd>?</kbd> tuşuna bas.", en: "Whenever you need it, open the detailed guide via the <strong>? Help</strong> button on top. Press <kbd>?</kbd> for keyboard shortcuts." },
  "welcome.back": { tr: "‹ Geri", en: "‹ Back" },
  "welcome.start": { tr: "Tamam, Başlayalım", en: "OK, Let's Start" },

  // welcome — project name (yeni adım: dil → proje adı → framework → karşılama)
  "welcome.projNameQuestion": { tr: "Bu listeyle hangi projenin kontrolünü yapacaksın?", en: "Which project will you check with this list?" },
  "welcome.projNameSub": { tr: "Projene bir isim ver. Sonradan istediğin zaman değiştirebilir veya yeni projeler ekleyebilirsin.", en: "Give your project a name. You can rename it later or add new projects any time." },
  "welcome.projNameAria": { tr: "Proje adı", en: "Project name" },
  "welcome.projNamePlaceholder": { tr: "Proje adı", en: "Project name" },
  "welcome.cta.pickProjName": { tr: "Devam etmek için proje adı yaz", en: "Type a project name to continue" },

  // project pill (hero) + project modal
  "proj.pill.title": { tr: "Aktif proje, framework ve backend (değiştirmek için tıkla)", en: "Active project, framework and backend (click to switch)" },
  "proj.modal.title": { tr: "Proje, Framework ve Backend", en: "Project, Framework and Backend" },
  "proj.tab.project": { tr: "Proje", en: "Project" },
  "proj.tab.framework": { tr: "Framework", en: "Framework" },
  "proj.tab.reset": { tr: "Sıfırla", en: "Reset" },
  "proj.list.title": { tr: "Projelerin", en: "Your Projects" },
  "proj.list.sub": { tr: "Aktif olan vurgulu. Başka projeye geçmek için satıra tıkla; ad değiştirmek veya silmek için sağdaki butonları kullan.", en: "The active one is highlighted. Click a row to switch; use the buttons on the right to rename or delete." },
  "proj.active": { tr: "Aktif", en: "Active" },
  "proj.count": { tr: "{n} / 20 proje", en: "{n} / 20 projects" },
  "proj.add.btn": { tr: "+ Yeni Proje", en: "+ New Project" },
  "proj.add.title": { tr: "Yeni proje oluştur", en: "Create new project" },
  "proj.create.title": { tr: "Yeni Proje Oluştur", en: "Create New Project" },
  "proj.create.sub": { tr: "Yeni projene bir isim ver ve hangi framework ile çalışacağını seç. Mevcut projendeki tüm veriler kayıtlı kalır.", en: "Give your new project a name and pick which framework you'll use. All data in your current project stays saved." },
  "proj.add.placeholder": { tr: "Yeni proje adı", en: "New project name" },
  "proj.add.create": { tr: "Oluştur", en: "Create" },
  "proj.add.cancel": { tr: "Vazgeç", en: "Cancel" },
  "proj.add.fwHint": { tr: "Hangi framework ile çalışacaksın?", en: "Which framework will you use?" },
  "proj.add.confirmTitle": { tr: "Yeni proje oluşturulsun mu?", en: "Create new project?" },
  "proj.add.confirmIntro": { tr: "<strong>{name}</strong> adlı proje <strong>{fw}</strong> ile oluşturulacak.", en: "<strong>{name}</strong> will be created with <strong>{fw}</strong>." },
  "proj.add.confirmKept": { tr: "<strong>{currentName}</strong> projenin tüm verileri (işaretler, notlar, ayarlar) <strong>kayıtlı kalır</strong>.", en: "All data in <strong>{currentName}</strong> (marks, notes, settings) <strong>stays saved</strong>." },
  "proj.add.confirmYes": { tr: "Evet, oluştur", en: "Yes, create" },
  "proj.error.fwMissing": { tr: "Framework seçilmedi", en: "Framework not selected" },
  "proj.limit.toast": { tr: "En fazla 20 proje tutabilirsin. Yeni eklemek için bir tanesini sil.", en: "You can keep up to 20 projects. Delete one to add a new project." },
  "proj.rename.title": { tr: "Adı değiştir", en: "Rename" },
  "proj.rename.placeholder": { tr: "Yeni isim", en: "New name" },
  "proj.rename.save": { tr: "Kaydet", en: "Save" },
  "proj.rename.cancel": { tr: "Vazgeç", en: "Cancel" },
  "proj.delete.title": { tr: "Sil", en: "Delete" },
  "proj.delete.confirmTitle": { tr: "Projeyi sil?", en: "Delete project?" },
  "proj.delete.confirmMsg": { tr: "<strong>{name}</strong> projesi ve tüm verisi (işaretler, notlar, ayarlar) kalıcı olarak silinecek. Bu işlem geri alınamaz.", en: "<strong>{name}</strong> and all its data (marks, notes, settings) will be permanently deleted. This cannot be undone." },
  "proj.delete.confirmYes": { tr: "Evet, sil", en: "Yes, delete" },
  "proj.delete.lastOne": { tr: "Son projeyi silemezsin. Önce yeni bir proje oluştur.", en: "You can't delete the last project. Create a new one first." },
  "proj.switch.toast": { tr: "{name} projesine geçildi", en: "Switched to {name}" },
  "proj.switch.confirmTitle": { tr: "Projeyi değiştir?", en: "Switch project?" },
  "proj.switch.intro": { tr: "Şu anki projeden başka bir projeye geçeceksin.", en: "You're about to switch from the current project to another." },
  "proj.switch.effect.kept": { tr: "<strong>{from}</strong> projesinin tüm verisi <strong>kayıtlı kalır</strong> (işaretler, notlar, ayarlar)", en: "All data in <strong>{from}</strong> stays <strong>safely saved</strong> (marks, notes, settings)" },
  "proj.switch.effect.target": { tr: "<strong>{to}</strong> projesine geçiş yapılır; istediğin zaman tekrar geri dönebilirsin", en: "You'll be switched to <strong>{to}</strong>; you can switch back any time" },
  "proj.switch.confirmYes": { tr: "Geçiş yap", en: "Switch" },
  "proj.created.toast": { tr: "{name} oluşturuldu", en: "{name} created" },
  "proj.renamed.toast": { tr: "Proje adı güncellendi", en: "Project renamed" },
  "proj.deleted.toast": { tr: "{name} silindi", en: "{name} deleted" },
  "proj.deletedAndSwitched.toast": { tr: "{from} silindi, {to} projesine geçildi", en: "{from} deleted, switched to {to}" },
  "proj.pickNext.title": { tr: "Hangi projeye geçiş yapmak istersin?", en: "Which project do you want to switch to?" },
  "proj.pickNext.sub": { tr: "<strong>{name}</strong> projesini sildikten sonra hangi projede çalışmak istediğini seç. Listeden birine tıkladığında geçiş anında yapılır.", en: "Pick which project to continue with after deleting <strong>{name}</strong>. Tap a row to switch immediately." },
  "proj.error.empty": { tr: "Proje adı boş olamaz", en: "Project name can't be empty" },
  "proj.error.tooLong": { tr: "Proje adı 60 karakterden uzun olamaz", en: "Project name can't exceed 60 characters" },
  "proj.error.duplicate": { tr: "Bu isimde bir proje zaten var", en: "A project with this name already exists" },
  "proj.firstName.default": { tr: "İlk Projem", en: "My First Project" },

  // framework modal
  "fwModal.title": { tr: "Framework Seç", en: "Pick Framework" },
  "fwModal.sub": { tr: "28 madde seçtiğin framework'e göre değişir, geri kalan 25 madde evrenseldir. İşaretlemelerin ve notların korunur.", en: "28 items vary by the chosen framework, the remaining 25 are universal. Your marks and notes are kept." },
  "fwModal.confirmTitle": { tr: "Framework değiştirilsin mi?", en: "Switch framework?" },
  "fwModal.confirmYes": { tr: "Geçiş yap", en: "Switch" },
  "fwModal.confirmCancel": { tr: "Vazgeç", en: "Cancel" },
  "fwModal.intro": { tr: "Çalıştığın yazılım çerçevesini değiştirmek üzeresin.", en: "You are about to switch the software framework you are working with." },
  "fwModal.tagFrom": { tr: "Mevcut", en: "Current" },
  "fwModal.tagTo": { tr: "Yeni", en: "New" },
  "fwModal.effect.marksReset": { tr: "Tüm <strong>MVP</strong> ve <strong>Release</strong> işaretleri sıfırlanır", en: "All <strong>MVP</strong> and <strong>Release</strong> marks will be reset" },
  "fwModal.effect.barsZero": { tr: "İlerleme barları <strong>%0</strong>'a döner", en: "Progress bars return to <strong>0%</strong>" },
  "fwModal.effect.notesKept": { tr: "<strong>Notların</strong> olduğu gibi korunur", en: "<strong>Your notes</strong> are kept as they are" },
  "fwModal.effect.catsKept": { tr: "<strong>Sistem ayarların</strong> korunur", en: "Your <strong>system settings</strong> are preserved" },

  // install modal
  "installModal.title": { tr: "📲 Uygulama Olarak Yükle", en: "📲 Install as App" },
  "installModal.intro": { tr: "Bu kontrol listesini cihazına bir uygulama gibi yükleyebilirsin. Mobilde ana ekrana eklenir, masaüstünde başlat menüsüne / dock'a kısayol olarak gelir. Tek tıkla açılır, internet olmadan da çalışır.", en: "You can install this checklist as an app on your device. On mobile it adds to the home screen; on desktop it pins to the start menu / dock. Opens in one click, works offline." },
  "installModal.afterInstall": { tr: "Yüklemeden sonra uygulama bağımsız bir pencerede açılır, internet olmadan da kullanılabilir, ve işaretlemen / notların aynı şekilde korunur.", en: "After installing, the app opens in its own window, works offline, and your marks / notes are preserved." },

  // celebration / confirm defaults
  "celebration.defaultTitle": { tr: "Tebrikler!", en: "Congrats!" },
  "celebration.defaultMsg": { tr: "Bu seviyeyi tamamladın.", en: "You completed this level." },
  "celebration.continue": { tr: "Devam Et", en: "Continue" },
  "celebration.totalTitle": { tr: "Tebrikler! Tüm liste tamamlandı.", en: "Congrats! Entire list completed." },
  "celebration.totalMsg": { tr: "Hem MVP hem Release seviyesindeki bütün maddeleri işaretledin. Uygulaman profesyonel kalite standartlarını karşılıyor. Mağazaya gönderebilirsin.", en: "You marked every item in both MVP and Release levels. Your app meets professional-quality standards. You can ship it to the store." },
  "celebration.releaseTitle": { tr: "Release seviyesi tamamlandı!", en: "Release level complete!" },
  "celebration.releaseMsg": { tr: "Yayınlanabilir profesyonel kaliteye ulaştın. Mağaza yüklemeden önce uygulamayı bir kez daha test etmeyi ve ekran görüntülerini hazırlamayı unutma.", en: "You reached release-ready professional quality. Don't forget to test the app once more and prepare screenshots before submitting to the store." },
  "celebration.mvpTitle": { tr: "MVP seviyesi tamamlandı!", en: "MVP level complete!" },
  "celebration.mvpMsg": { tr: "Uygulamanın temel iskeleti hazır. Şimdi profesyonel kaliteye yükseltmek için Release seviyesindeki maddelere geç.", en: "Your app's core skeleton is ready. Move on to Release-level items to elevate it to professional quality." },

  "confirm.defaultTitle": { tr: "Emin misin?", en: "Are you sure?" },
  "confirm.defaultMsg": { tr: "Bu işlem geri alınamaz.", en: "This action cannot be undone." },
  "confirm.yes": { tr: "Evet, devam et", en: "Yes, continue" },
  "confirm.cancel": { tr: "İptal", en: "Cancel" },

  // reset (2 aşamalı: scope seçimi + onay; 4 seçenek)
  "reset.scopeTitle": { tr: "Neyi sıfırlamak istersin?", en: "What do you want to reset?" },
  "reset.scopeSub": { tr: "Bir veya birden fazla seçenek seçebilirsin. \"Tüm Sistem\" seçilirse diğerleri otomatik iptal olur (zaten her şeyi kapsar).", en: "Pick one or more options. \"Whole System\" cancels the others (it already covers everything)." },
  "reset.scopeProjectTitle": { tr: "Bu projeyi sıfırla", en: "Reset this project" },
  "reset.scopeProjectSub": { tr: "Aktif projenin içeriğini sıfırla. Diğer projelerine ve genel ayarlara dokunulmaz. Tüm sistem veya ayarlar için \"Proje ve Framework → Sıfırla\" sekmesini kullan.", en: "Reset the active project's contents. Other projects and global settings are untouched. For full system or settings reset, use \"Project and Framework → Reset\" tab." },
  "reset.scopeFullSub": { tr: "Aktif projeyi, uygulama ayarlarını veya tüm sistemi sıfırlayabilirsin. Bir veya birden fazla seçenek seçebilirsin. \"Tüm Sistem\" seçilirse diğerleri otomatik iptal olur.", en: "You can reset the active project, app settings, or the whole system. Pick one or more options. \"Whole System\" cancels the others." },
  "reset.scope.selections": { tr: "Seçimler (MVP / Release)", en: "Selections (MVP / Release)" },
  "reset.scope.selections.desc": { tr: "MVP ve Release işaretlerin silinir, ilerleme barları sıfırlanır.", en: "MVP and Release marks are cleared, progress bars reset." },
  "reset.scope.selections.descActive": { tr: "Aktif projenin MVP ve Release işaretleri silinir, ilerleme barları sıfırlanır.", en: "The active project's MVP and Release marks are cleared, progress bars reset." },
  "reset.scope.notes": { tr: "Notlar", en: "Notes" },
  "reset.scope.notes.desc": { tr: "Her madde için yazdığın notlar silinir.", en: "All your per-item notes are deleted." },
  "reset.scope.notes.descActive": { tr: "Aktif projedeki her madde için yazdığın notlar silinir.", en: "All your per-item notes in the active project are deleted." },
  "reset.scope.settings": { tr: "Ayarlar", en: "Settings" },
  "reset.scope.settings.desc": { tr: "Kategori açık/kapalı durumu, tema (koyu/açık), seviye filtreleri ve kilit varsayılana döner.", en: "Category open/closed state, theme (dark/light), level filters and lock revert to defaults." },
  "reset.scope.settingsGlobal": { tr: "Ayarlar (tüm projeler için)", en: "Settings (for all projects)" },
  "reset.scope.settingsGlobal.desc": { tr: "Tüm proje ayarları varsayılana döner: kategori açık/kapalı durumu, tema (koyu), seviye filtreleri ve kilit.", en: "All project settings revert to defaults: category open/closed state, theme (dark), level filters and lock." },
  "reset.scope.system": { tr: "Tüm Sistem", en: "Whole System" },
  "reset.scope.system.desc": { tr: "Her şey silinir: tüm projeler, işaretler, notlar, ayarlar, dil, framework. Uygulama ilk açılıştaki gibi başlar (karşılama akışı tekrar gelir).", en: "Everything is wiped: all projects, marks, notes, settings, language, framework. The app starts like first launch (welcome flow appears again)." },
  "reset.continue": { tr: "İleri ›", en: "Next ›" },
  "reset.confirmTitle": { tr: "Sıfırlamayı onayla?", en: "Confirm reset?" },
  "reset.confirm.intro": { tr: "Aşağıdakiler sıfırlanacak:", en: "The following will be reset:" },
  "reset.confirm.part.selections": { tr: "<strong>İşaretler</strong> (MVP / Release) silinir, ilerleme barları sıfırlanır", en: "<strong>Marks</strong> (MVP / Release) cleared, progress bars reset" },
  "reset.confirm.part.notes": { tr: "<strong>Notlar</strong> silinir (her madde için yazdıkların)", en: "<strong>Notes</strong> deleted (your annotations on items)" },
  "reset.confirm.part.settings": { tr: "<strong>Ayarlar</strong> varsayılana döner (kategoriler, tema, filtreler, kilit)", en: "<strong>Settings</strong> revert to defaults (categories, theme, filters, lock)" },
  "reset.confirm.system": { tr: "⚠ <strong>TÜM SİSTEM</strong> sıfırlanacak: işaretler, notlar, ayarlar, dil, framework. Uygulama yeniden ilk açılıştaki gibi başlar.", en: "⚠ <strong>THE WHOLE SYSTEM</strong> will be reset: marks, notes, settings, language, framework. The app starts fresh." },
  "reset.yes": { tr: "Evet, sıfırla", en: "Yes, reset" },
  "reset.yesSystem": { tr: "Evet, hepsini sil", en: "Yes, wipe everything" },
  "reset.toast.done": { tr: "Sıfırlandı", en: "Reset complete" },

  // notes
  "note.add": { tr: "Not ekle", en: "Add note" },
  "note.mine": { tr: "Notum", en: "My note" },
  "note.placeholder": { tr: "Bu madde için kendi notunu yaz...", en: "Write your own note for this item..." },
  "note.autoSave": { tr: "Otomatik kaydedilir", en: "Auto-saved" },
  "note.clear": { tr: "Notu temizle", en: "Clear note" },
  "note.saved": { tr: "Not kaydedildi", en: "Note saved" },
  "note.deleted": { tr: "Not silindi", en: "Note deleted" },

  // AI
  "ai.ask": { tr: "AI'a sor", en: "Ask AI" },
  "ai.askTitle": { tr: "AI prompt formatını seç", en: "Pick an AI prompt format" },
  "ai.tr": { tr: "📝 Türkçe", en: "📝 English" },
  "ai.trTitle": { tr: "Markdown formatında prompt'u panoya kopyala (mevcut dilde)", en: "Copy prompt as Markdown to clipboard (in current language)" },
  "ai.json": { tr: "{ } JSON", en: "{ } JSON" },
  "ai.jsonTitle": { tr: "Yapılandırılmış JSON formatında prompt'u panoya kopyala (mevcut dilde)", en: "Copy structured JSON prompt to clipboard (in current language)" },
  "ai.copied": { tr: "✓ Kopyalandı", en: "✓ Copied" },
  "ai.copiedJson": { tr: "JSON prompt panoya kopyalandı. ChatGPT, Claude veya Gemini'ye yapıştır.", en: "JSON prompt copied. Paste into ChatGPT, Claude or Gemini." },
  "ai.copiedTr": { tr: "Türkçe metin prompt panoya kopyalandı. ChatGPT, Claude veya Gemini'ye yapıştır.", en: "Markdown prompt copied. Paste into ChatGPT, Claude or Gemini." },
  "ai.copyFail": { tr: "Kopyalama başarısız oldu.", en: "Copy failed." },

  // misc
  "misc.invalidFile": { tr: "Geçersiz dosya.", en: "Invalid file." },
  "misc.invalidFormat": { tr: "Geçersiz format", en: "Invalid format" },

  // install detection
  "install.installed": { tr: "Uygulama yüklendi! Ana ekrandan / masaüstünden açabilirsin.", en: "App installed! You can open it from the home screen / desktop." },
  "install.installing": { tr: "Uygulama yükleniyor... Ana ekran / masaüstünde simgesi görünecek.", en: "Installing... An icon will appear on your home screen / desktop." },
  "install.cancelled": { tr: "Yükleme iptal edildi. Banner üzerinden tekrar deneyebilirsin.", en: "Install cancelled. You can try again from the banner." },

  // easter eggs
  "easter.linkedin": { tr: "LinkedIn profili açılıyor…", en: "Opening LinkedIn profile…" },
  "easter.github": { tr: "GitHub profili açılıyor…", en: "Opening GitHub profile…" },

  // framework switch toasts
  "fwSwitch.toastReset": { tr: "{name} seçildi, liste sıfırlandı", en: "{name} selected, list reset" },
  "fwSwitch.toast": { tr: "{name} seçildi", en: "{name} selected" },

  // levels
  "level.mvp": { tr: "MVP", en: "MVP" },
  "level.release": { tr: "Release", en: "Release" },

  // ==================== ANLATIM DİLİ (BASİT / TEKNİK) ====================
  "style.simple":    { tr: "Basit",   en: "Simple" },
  "style.technical": { tr: "Teknik",  en: "Technical" },
  "style.toast.simple":    { tr: "Anlatım dili: Basit (sade ve gündelik). İstediğin zaman üstten Teknik'e dönebilirsin.", en: "Explanation style: Simple (plain, everyday wording). Switch to Technical any time from the top." },
  "style.toast.technical": { tr: "Anlatım dili: Teknik (paket adları, sürümler, kod örnekleri). İstediğin zaman üstten Basit'e dönebilirsin.", en: "Explanation style: Technical (package names, versions, code snippets). Switch to Simple any time from the top." },
  // welcome step 2 (style)
  "welcome.styleQuestion": { tr: "Anlatım dili: Basit mi, Teknik mi?", en: "Explanation style: Simple or Technical?" },
  "welcome.styleSub": { tr: "Maddeleri nasıl okumak istersin? Yazılım dünyasına uzaksan veya AI asistanlarla uygulama geliştiriyorsan <strong>Basit</strong> en rahatı; paket adı, sürüm, fonksiyon gibi teknik detayları görmek istersen <strong>Teknik</strong> daha verimli. İstediğin zaman üstteki butondan değiştirebilirsin.", en: "How do you want to read the items? If software jargon isn't your world or you're building apps with AI assistants, <strong>Simple</strong> is most comfortable; if you want to see package names, versions and function names, <strong>Technical</strong> is more efficient. You can switch from the top button any time." },
  "welcome.styleAria": { tr: "Anlatım dili seçimi", en: "Explanation style selection" },
  "welcome.cta.pickStyle": { tr: "Devam etmek için bir anlatım dili seç", en: "Pick an explanation style to continue" },
  "welcome.style.simple.title": { tr: "📖 Basit", en: "📖 Simple" },
  "welcome.style.simple.desc":  { tr: "Net, gündelik dille açıklar. Paket adları yerine \"şu işi yapan paket\" der.", en: "Plain, everyday wording. Says \"the package that does X\" instead of naming it." },
  "welcome.style.technical.title": { tr: "🛠️ Teknik", en: "🛠️ Technical" },
  "welcome.style.technical.desc":  { tr: "Paket adları, sürüm numaraları, kod örnekleri ve fonksiyon isimleri tam haliyle.", en: "Package names, version numbers, code snippets and function names in full." },

  // ==================== BACKEND SEÇİMİ ====================
  // welcome step 4 (backend)
  "welcome.beQuestion": { tr: "Hangi backend ile çalışacaksın?", en: "Which backend will you use?" },
  "welcome.beSub": { tr: "Backend, uygulamanın internetteki sunucu tarafıdır (kullanıcı kaydı, veritabanı, dosya yükleme). Listedeki backend kategorisi seçtiğin backend'e göre özelleşir. Bağlantısız bir uygulama yapacaksan 'Backend yok' seç; backend ile ilgili tüm maddeler listeden kaldırılır.", en: "The backend is the server side of your app (sign-up, database, file upload). The backend category in this list adapts to your choice. If your app never connects to the internet, pick 'No backend' to remove all backend items from the list." },
  "welcome.beAria": { tr: "Backend seçimi", en: "Backend selection" },
  "welcome.cta.pickBe": { tr: "Devam etmek için backend seç", en: "Pick a backend to continue" },
  // welcome help label for backend step
  "welcome.beHint.noBackend": { tr: "İnternete bağlanmayan bir uygulama. Hiçbir backend adımı listede görünmez.", en: "An app that never goes online. No backend items appear in the list." },

  // hero pill: backend leg
  "be.pill.title": { tr: "Aktif backend — değiştirmek için tıkla", en: "Active backend — click to change" },

  // backend modal tab (in projfwModal)
  "proj.tab.backend": { tr: "Backend", en: "Backend" },
  "beModal.sub": { tr: "Backend kategorisindeki maddeler seçtiğin backend'e göre değişir. 'Backend yok' seçersen backend'le ilgili tüm maddeler listeden kaldırılır. İşaretlemelerin ve notların korunur.", en: "Items in the backend category adapt to your choice. Picking 'No backend' removes every backend-related item from the list. Your marks and notes are preserved." },

  // backend switch confirm popup
  "beModal.confirmTitle": { tr: "Backend değiştirilsin mi?", en: "Switch backend?" },
  "beModal.confirmYes": { tr: "Geçiş yap", en: "Switch" },
  "beModal.confirmCancel": { tr: "Vazgeç", en: "Cancel" },
  "beModal.intro": { tr: "Çalıştığın backend seçimini değiştirmek üzeresin.", en: "You are about to change your backend selection." },
  "beModal.tagFrom": { tr: "Mevcut", en: "Current" },
  "beModal.tagTo": { tr: "Yeni", en: "New" },
  "beModal.effect.marksReset": { tr: "Backend kategorisindeki <strong>MVP</strong> ve <strong>Release</strong> işaretleri sıfırlanır", en: "<strong>MVP</strong> and <strong>Release</strong> marks in the backend category will be reset" },
  "beModal.effect.barsRecalc": { tr: "İlerleme barları yeniden hesaplanır", en: "Progress bars are recalculated" },
  "beModal.effect.notesKept": { tr: "<strong>Notların</strong> olduğu gibi korunur", en: "<strong>Your notes</strong> are kept as they are" },
  "beModal.effect.catsKept": { tr: "<strong>Sistem ayarların</strong> korunur", en: "Your <strong>system settings</strong> are preserved" },
  "beModal.effect.itemsHidden": { tr: "Backend ile ilgili tüm maddeler listeden <strong>gizlenir</strong>", en: "All backend-related items are <strong>hidden</strong> from the list" },
  "beModal.effect.itemsShown": { tr: "Backend ile ilgili maddeler tekrar listede <strong>görünür</strong> hale gelir", en: "Backend-related items are <strong>shown</strong> again" },

  // backend switch toasts
  "beSwitch.toast": { tr: "{name} seçildi", en: "{name} selected" },
  "beSwitch.toastReset": { tr: "{name} seçildi, backend işaretleri sıfırlandı", en: "{name} selected, backend marks reset" },
  "beSwitch.toastHidden": { tr: "Backend yok seçildi, backend maddeleri gizlendi", en: "No backend selected, backend items hidden" },
  "beSwitch.toastShown": { tr: "{name} seçildi, backend maddeleri tekrar görünür", en: "{name} selected, backend items visible again" },

  // project add (new project wizard) - backend grid
  "proj.add.beHint": { tr: "Hangi backend ile çalışacaksın?", en: "Which backend will you use?" },
  "proj.error.beMissing": { tr: "Backend seçilmedi", en: "Backend not selected" },
  "proj.add.confirmIntroFull": { tr: "<strong>{name}</strong> adlı proje <strong>{fw}</strong> framework ve <strong>{be}</strong> backend ile oluşturulacak.", en: "<strong>{name}</strong> will be created with <strong>{fw}</strong> framework and <strong>{be}</strong> backend." },

  // backend option short blurbs (welcome + modals)
  "be.opt.noBackend.title":   { tr: "Backend yok",      en: "No backend" },
  "be.opt.noBackend.desc":    { tr: "Sunucuya bağlanmayan uygulamalar için. Backend maddeleri listeden çıkar.", en: "For apps that don't connect to a server. Backend items are removed from the list." },
  "be.opt.firebase.title":    { tr: "Firebase",         en: "Firebase" },
  "be.opt.firebase.desc":     { tr: "Google'ın kolay ve hızlı sunucu çözümü.", en: "Google's quick and easy server solution." },
  "be.opt.supabase.title":    { tr: "Supabase",         en: "Supabase" },
  "be.opt.supabase.desc":     { tr: "Açık kaynak, güçlü sunucu çözümü.", en: "Open-source, powerful server solution." },
  "be.opt.appwrite.title":    { tr: "Appwrite",         en: "Appwrite" },
  "be.opt.appwrite.desc":     { tr: "Açık kaynak, esnek sunucu çözümü.", en: "Open-source, flexible server solution." },
  "be.opt.pocketbase.title":  { tr: "PocketBase",       en: "PocketBase" },
  "be.opt.pocketbase.desc":   { tr: "Hızlı kurulan, sade sunucu çözümü.", en: "Quick-to-set-up, lightweight server solution." },
  "be.opt.amplify.title":     { tr: "AWS Amplify",      en: "AWS Amplify" },
  "be.opt.amplify.desc":      { tr: "Amazon'un kurumsal sunucu çözümü.", en: "Amazon's enterprise server solution." },
  "be.opt.convex.title":      { tr: "Convex",           en: "Convex" },
  "be.opt.convex.desc":       { tr: "Modern, TypeScript odaklı sunucu çözümü.", en: "A modern, TypeScript-first server solution." },
  "be.opt.custom.title":      { tr: "Kendi sunucum",    en: "Self-hosted server" },
  "be.opt.custom.desc":       { tr: "Kendi geliştirdiğin özel sunucu.", en: "A custom server you build yourself." },
  "be.opt.localhost.title":   { tr: "Yerel geliştirme", en: "Local dev backend" },
  "be.opt.localhost.desc":    { tr: "Bilgisayarında çalışan test sunucusu.", en: "Test server running on your computer." },
};

function t(key, vars) {
  const entry = UI_STRINGS[key];
  if (!entry) return key;
  let s = entry[currentLang] || entry.tr || entry.en || key;
  if (vars) {
    Object.keys(vars).forEach(k => {
      s = s.replace(new RegExp(`\\{${k}\\}`, "g"), vars[k]);
    });
  }
  return s;
}

