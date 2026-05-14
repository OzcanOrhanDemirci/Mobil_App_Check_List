/* ==================== KARSILAMA (WELCOME) AKISI ====================
   Ilk ziyarette aktif proje + framework + backend yoksa karsilama
   modalini 7 adimda gosterir: dil, kullanim bicimi, anlatim stili,
   proje adi, framework, backend, baslangic. Her adim pending*
   degiskenlerinde tutulur (hem let hem window.pending* ile yazilir;
   08-i18n-dom.js applyLang welcome CTA'larini window uzerinden okur),
   son adimda createProject ile kalicilasir. Welcome modali icindeki
   Yardim butonu da burada (anlik dil switcher'i dahil). 18-app.js init
   sirasinda showWelcomeIfFirstVisit cagrilir. */

/* ==================== KARŞILAMA (WELCOME) MODALI ==================== */
/* Aktif proje + framework + backend yoksa karşılama modalını 7 adımda göster:
   1) Dil  2) Kullanım Biçimi  3) Anlatım Dili  4) Proje Adı
   5) Framework  6) Backend  7) Tanıtım / Başlayalım */
function showWelcomeIfFirstVisit() {
  if (getActiveProjectId() && currentFramework && currentBackend) return;
  setTimeout(() => {
    setWelcomeStep(1);
    openModal("welcomeModal");
  }, 350);
}

/* Welcome modalı içindeki seçimler — buton tıklanana dek kalıcılaştırılmaz */
let pendingFramework = null;
let pendingBackend = null;
let pendingLang = null;
let pendingMode = null;
let pendingStyle = null;
let pendingProjName = null;

function setWelcomeStep(n) {
  /* 1 → dil, 2 → kullanım biçimi, 3 → anlatım dili, 4 → proje adı,
     5 → framework, 6 → backend, 7 → karşılama */
  document.querySelectorAll(".welcome-pane").forEach(p => {
    p.hidden = String(p.dataset.pane) !== String(n);
  });
  /* Adım göstergesini güncelle (7 nokta + 6 çizgi) */
  document.querySelectorAll("[data-step-dot]").forEach(d => {
    const idx = Number(d.dataset.stepDot);
    d.classList.toggle("active", idx === n);
    d.classList.toggle("done", idx < n);
  });
  document.querySelectorAll("[data-step-line]").forEach(line => {
    const after = Number(line.dataset.stepLine); // 1 → 1.dot ile 2.dot arasındaki çizgi
    line.classList.toggle("done", n > after);
  });
  /* Modalın hangi adımda olduğunu CSS'in görebilmesi için data-step attribute'u
     (örn. 1. adımda yardım butonunun yazısı CSS ile gizleniyor — kullanıcı
     henüz dil seçmediği için "Yardım/Help" iki dilde yer kaplamasın). */
  const modal = document.getElementById("welcomeModal");
  if (modal) modal.setAttribute("data-step", String(n));
  /* Proje adı adımına geçişte (artık step 4) input'a otomatik focus +
     buton metnini ayarla */
  if (n === 4) {
    const input = document.getElementById("welcomeProjName");
    if (input) {
      setTimeout(() => input.focus(), 80);
      updateWelcomeProjNameCta();
    }
  }
}

/* Proje adı input'u değiştiğinde "İleri" butonunun aktif/pasif durumunu güncelle.
   Boş veya 60 karakterden uzun isim → disabled. Geçici olarak boş hata mesajı. */
function updateWelcomeProjNameCta() {
  const input = document.getElementById("welcomeProjName");
  const cta = document.getElementById("welcomeProjNameNext");
  const errEl = document.getElementById("welcomeProjNameError");
  if (!input || !cta) return;
  const val = (input.value || "").trim();
  let error = "";
  if (!val) {
    cta.disabled = true;
    cta.textContent = t("welcome.cta.pickProjName");
  } else if (val.length > 60) {
    cta.disabled = true;
    error = t("proj.error.tooLong");
    cta.textContent = t("welcome.cta.next");
  } else {
    cta.disabled = false;
    cta.textContent = t("welcome.cta.next");
  }
  if (errEl) {
    if (error) {
      errEl.textContent = error;
      errEl.hidden = false;
    } else {
      errEl.textContent = "";
      errEl.hidden = true;
    }
  }
}

/* 1. ADIM: Dil seçimi */
document.querySelectorAll("[data-welcome-lang]").forEach(btn => {
  btn.addEventListener("click", () => {
    pendingLang = btn.dataset.welcomeLang;
    window.pendingLang = pendingLang;
    document.querySelectorAll("[data-welcome-lang]").forEach(b => {
      b.classList.toggle("selected", b === btn);
    });
    const nextBtn = document.getElementById("welcomeLangNext");
    nextBtn.disabled = false;
    nextBtn.textContent = t("welcome.cta.next");
  });
});

document.getElementById("welcomeLangNext").addEventListener("click", () => {
  if (!pendingLang) return;
  /* Seçilen dili anında uygula: bundan sonraki adımlar bu dilde gözüksün */
  if (pendingLang !== currentLang) {
    saveLang(pendingLang);
    applyLang();
  }
  setWelcomeStep(2);
});

/* 2. ADIM: Kullanım Biçimi (Geliştirme / İnceleme).
   Seçim welcomeStart'ta applyMode ile kalıcılaştırılır; o zamana kadar pendingMode
   olarak tutulur. */
document.querySelectorAll("[data-welcome-mode]").forEach(btn => {
  btn.addEventListener("click", () => {
    pendingMode = btn.dataset.welcomeMode;
    window.pendingMode = pendingMode;
    document.querySelectorAll("[data-welcome-mode]").forEach(b => {
      b.classList.toggle("selected", b === btn);
    });
    const nextBtn = document.getElementById("welcomeModeNext");
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.textContent = t("welcome.cta.next");
    }
  });
});

document.getElementById("welcomeModeNext").addEventListener("click", () => {
  if (!pendingMode) return;
  setWelcomeStep(3);
});

document.getElementById("welcomeModeBack").addEventListener("click", () => {
  setWelcomeStep(1);
});

/* 3. ADIM: Anlatım dili (Basit / Teknik) */
document.querySelectorAll("[data-welcome-style]").forEach(btn => {
  btn.addEventListener("click", () => {
    pendingStyle = btn.dataset.welcomeStyle;
    window.pendingStyle = pendingStyle;
    document.querySelectorAll("[data-welcome-style]").forEach(b => {
      b.classList.toggle("selected", b === btn);
    });
    const nextBtn = document.getElementById("welcomeStyleNext");
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.textContent = t("welcome.cta.next");
    }
  });
});

document.getElementById("welcomeStyleNext").addEventListener("click", () => {
  if (!pendingStyle) return;
  /* Seçilen anlatım dilini anında uygula: kalan welcome adımları ve hero pill
     bu stile göre gözüksün. (Listeyi render etmeye gerek yok; welcome modal
     açıkken liste zaten başka renderContent'le güncelleniyor.) */
  if (typeof applyStyle === "function") applyStyle(pendingStyle);
  setWelcomeStep(4);
});

document.getElementById("welcomeStyleBack").addEventListener("click", () => {
  setWelcomeStep(2);
});

/* 4. ADIM: Proje adı */
const welcomeProjNameInput = document.getElementById("welcomeProjName");
if (welcomeProjNameInput) {
  welcomeProjNameInput.addEventListener("input", () => {
    pendingProjName = welcomeProjNameInput.value;
    updateWelcomeProjNameCta();
  });
  welcomeProjNameInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      const cta = document.getElementById("welcomeProjNameNext");
      if (cta && !cta.disabled) cta.click();
    }
  });
}

document.getElementById("welcomeProjNameNext").addEventListener("click", () => {
  const val = (welcomeProjNameInput?.value || "").trim();
  if (!val || val.length > 60) return;
  pendingProjName = val;
  setWelcomeStep(5);
});

document.getElementById("welcomeProjNameBack").addEventListener("click", () => {
  setWelcomeStep(3);
});

/* 5. ADIM: Framework seçimi */
document.querySelectorAll("[data-welcome-fw]").forEach(btn => {
  btn.addEventListener("click", () => {
    pendingFramework = btn.dataset.welcomeFw;
    window.pendingFramework = pendingFramework;
    document.querySelectorAll("[data-welcome-fw]").forEach(b => {
      b.classList.toggle("selected", b === btn);
    });
    const nextBtn = document.getElementById("welcomeNext");
    nextBtn.disabled = false;
    nextBtn.textContent = t("welcome.cta.next");
  });
});

document.getElementById("welcomeNext").addEventListener("click", () => {
  if (!pendingFramework) return;
  setWelcomeStep(6);
});

document.getElementById("welcomeFwBack").addEventListener("click", () => {
  setWelcomeStep(4);
});

/* 6. ADIM: Backend seçimi */
document.querySelectorAll("[data-welcome-be]").forEach(btn => {
  btn.addEventListener("click", () => {
    pendingBackend = btn.dataset.welcomeBe;
    window.pendingBackend = pendingBackend;
    document.querySelectorAll("[data-welcome-be]").forEach(b => {
      b.classList.toggle("selected", b === btn);
    });
    const nextBtn = document.getElementById("welcomeBeNext");
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.textContent = t("welcome.cta.next");
    }
  });
});

document.getElementById("welcomeBeNext").addEventListener("click", () => {
  if (!pendingBackend) return;
  setWelcomeStep(7);
});

document.getElementById("welcomeBeBack").addEventListener("click", () => {
  setWelcomeStep(5);
});

/* 7. ADIM: Karşılama */
document.getElementById("welcomeBack").addEventListener("click", () => {
  setWelcomeStep(6);
});

/* Welcome modalı içindeki yardım butonu — yardım modalını üstte açar, welcome'ı kapatmaz.
   helpModal DOM'da welcomeModal'dan önce, ikisi aynı z-index'te. Help'i welcome üstüne
   getirebilmek için z-index'i geçici olarak yükselt. Yardım modalını kapattığında welcome
   modalı altta görünür kalır.
   1. adımda (kullanıcı henüz dil seçmediyse) yardım modalı içinde anlık TR/EN switcher
   gösterilir; sadece o açılış için yardım metnini değiştirir, currentLang'a dokunmaz. */
document.getElementById("welcomeHelpBtn").addEventListener("click", () => {
  const helpEl = document.getElementById("helpModal");
  if (helpEl) helpEl.style.zIndex = "10001";
  /* Welcome 1. adımda mı? */
  const onLangStep = document.getElementById("welcomeModal")?.getAttribute("data-step") === "1";
  setHelpLangSwitchVisible(onLangStep);
  /* Yardım modalı her açılışta tüm bölümler kapalı başlasın */
  if (typeof collapseAllHelpSections === "function") collapseAllHelpSections();
  openModal("helpModal");
});

/* Yardım modalındaki anlık dil değiştirici, görünürlük kontrolü.
   Switcher görünürken aktif buton currentLang ile senkron olur. */
function setHelpLangSwitchVisible(visible) {
  const sw = document.getElementById("helpLangSwitch");
  if (!sw) return;
  sw.hidden = !visible;
  if (visible) {
    /* Aktif butonu currentLang ile senkronla */
    sw.querySelectorAll("[data-help-lang]").forEach(b => {
      b.classList.toggle("active", b.dataset.helpLang === currentLang);
    });
  }
}

/* Yardım metnini sadece bu modalda geçici olarak verilen dile çevir.
   currentLang ve localStorage'a dokunmaz; modal kapanıp tekrar açıldığında
   global dil neyse oraya geri döner (applyI18nToDom yeniden uygulayarak). */
function applyHelpDisplayLang(lang) {
  if (lang !== "tr" && lang !== "en") return;
  const helpBody = document.getElementById("helpModalBody");
  if (helpBody && HELP_HTML[lang]) {
    helpBody.innerHTML = HELP_HTML[lang];
    /* innerHTML değişimi DOM elementlerini yeniden oluşturur; accordion'ı
       yeniden kur (section.help-section.collapsed class'ı + chevron span). */
    if (typeof enhanceHelpAccordion === "function") enhanceHelpAccordion();
  }
  const helpTitle = document.getElementById("helpTitle");
  if (helpTitle && UI_STRINGS["help.title"]) {
    helpTitle.textContent = UI_STRINGS["help.title"][lang] || helpTitle.textContent;
  }
  /* Switcher butonlarındaki active state'i güncelle */
  document.querySelectorAll("[data-help-lang]").forEach(b => {
    b.classList.toggle("active", b.dataset.helpLang === lang);
  });
}

document.querySelectorAll("[data-help-lang]").forEach(btn => {
  btn.addEventListener("click", () => {
    applyHelpDisplayLang(btn.dataset.helpLang);
  });
});

/* Yardım modalı her kapatıldığında switcher'i sıfırla:
   bir sonraki açılış doğru bağlamda davransın. data-modal-close dinleyicisi
   zaten var, ama oraya bağlama yerine modalın "hidden" değişimini izlemek
   yerine, kapanma noktalarına özel olarak switcher'i gizliyoruz. */
function closeHelpModal() {
  const helpEl = document.getElementById("helpModal");
  if (helpEl) helpEl.hidden = true;
  setHelpLangSwitchVisible(false);
  /* Eğer kullanıcı in-modal switcher ile dil değiştirmişse, currentLang'a göre
     doğru içeriği geri yükle (sonraki açılış global dilde olsun). */
  applyHelpDisplayLang(currentLang);
}

document.getElementById("welcomeStart").addEventListener("click", () => {
  if (!pendingFramework || !pendingProjName || !pendingBackend) return;
  /* Anlatım dilini kalıcılaştır (kullanıcı 3. adımda zaten anında uygulanmıştı;
     burada localStorage'a yazılması garanti altına alınıyor). */
  if (pendingStyle && typeof applyStyle === "function") {
    applyStyle(pendingStyle);
  }
  /* Kullanım biçimini kalıcılaştır. applyMode sadece localStorage'a yazar +
     html'e data-card-mode atar; kartların DOM'da çevrilmesi reloadActive..
     içindeki renderdan sonra attachClickHandlers'ın sonunda applyInitialCardMode
     tarafından yapılır. */
  if (pendingMode && typeof applyMode === "function") {
    applyMode(pendingMode);
  }
  /* Önce projeyi oluştur ve aktif yap; saveFramework/saveBackend artık aktif
     projeye yazıyor */
  const created = createProject(pendingProjName);
  if (!created.ok) {
    /* En olası hata: aynı isimde proje zaten var (genelde yeni kullanıcıda olmaz).
       Limit hatası welcome akışında oluşamaz çünkü 0 proje var. */
    let msg = t("proj.error.empty");
    if (created.error === "duplicate") msg = t("proj.error.duplicate");
    else if (created.error === "tooLong") msg = t("proj.error.tooLong");
    showToast(msg, "warn", 2200);
    return;
  }
  setActiveProjectId(created.project.id);
  saveFramework(pendingFramework);
  saveBackend(pendingBackend);
  closeModal("welcomeModal");
  /* Yeni projenin tüm in-memory state'ini yükle ve UI'ı baştan render et */
  reloadActiveProjectAndRender();
  /* Pendingleri temizle ki ileride welcome tekrar açılırsa eski seçim kalmasın */
  pendingProjName = null;
  pendingFramework = null;
  pendingBackend = null;
  pendingMode = null;
  pendingStyle = null;
  window.pendingFramework = null;
  window.pendingBackend = null;
  window.pendingMode = null;
  window.pendingStyle = null;
});
