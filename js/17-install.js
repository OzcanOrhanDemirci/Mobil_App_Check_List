/* ==================== PWA INSTALL ====================
   If the browser exposes its native install prompt (the beforeinstallprompt
   event, captured into deferredInstallPrompt), it is triggered directly.
   Otherwise a platform-specific manual instructions modal is shown (Android
   Chrome, iOS Safari, Windows Edge, Mac Chrome, Mac Safari, Firefox
   Desktop, default). Banner dismissal (closing the X or being installed) is
   persisted via a localStorage flag; the floating footer button is visible
   while the banner is closed. The initInstallBanner IIFE decides the
   banner's visibility on first load. */

/* ==================== PWA INSTALL ==================== */
let deferredInstallPrompt = null;

window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredInstallPrompt = e;
  showInstallBanner();
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  hideInstallBanner();
  try {
    localStorage.setItem(INSTALL_DISMISS_KEY, "installed");
  } catch {}
  showToast(t("install.installed"), "success", 3200);
});

const INSTALL_DISMISS_KEY = "mobil_kontrol_install_dismissed_v1";

function showInstallBanner() {
  /* If previously dismissed or already installed, do not show; only refresh
     the floating button's visibility. */
  try {
    if (localStorage.getItem(INSTALL_DISMISS_KEY)) {
      updateFloatingInstallVisibility();
      return;
    }
  } catch {}
  const banner = document.getElementById("installBanner");
  if (banner) banner.hidden = false;
  updateFloatingInstallVisibility();
}

function hideInstallBanner() {
  const banner = document.getElementById("installBanner");
  if (banner) banner.hidden = true;
  updateFloatingInstallVisibility();
}

/* The small download-icon button in the footer: an alternative entry point
   when the banner is dismissed or never appeared. Hidden in standalone mode
   or when the install-complete flag is set. While the banner is visible the
   floating button is hidden (no need for an alternative). */
function updateFloatingInstallVisibility() {
  const floatingBtn = document.getElementById("installFloatingBtn");
  if (!floatingBtn) return;

  /* Standalone (installed and running in its own window) hides both. */
  if (isStandaloneMode()) {
    floatingBtn.hidden = true;
    return;
  }

  /* Flagged "installed" previously means the app is already installed; hide. */
  let dismiss = "";
  try {
    dismiss = localStorage.getItem(INSTALL_DISMISS_KEY) || "";
  } catch {}
  if (dismiss === "installed") {
    floatingBtn.hidden = true;
    return;
  }

  /* Banner visible: hide the floating button (no need for an alternative).
     Banner hidden: show the floating button. */
  const banner = document.getElementById("installBanner");
  const bannerVisible = banner && !banner.hidden;
  floatingBtn.hidden = bannerVisible;
}

function isStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    window.navigator.standalone === true
  );
}

function isIOSDevice() {
  return /iPhone|iPad|iPod/.test(navigator.userAgent);
}

function detectPlatform() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) {
    return /CriOS|FxiOS|EdgiOS|OPiOS/.test(ua) ? "ios-other" : "ios-safari";
  }
  if (/Android/.test(ua)) {
    if (/SamsungBrowser/.test(ua)) return "android-samsung";
    if (/Firefox\//.test(ua)) return "android-firefox";
    return "android-chrome";
  }
  if (/Edg\//.test(ua)) return "edge";
  if (/Firefox\//.test(ua)) return "firefox";
  if (/Chrome\//.test(ua)) return "chrome";
  if (/Safari\//.test(ua)) return "macos-safari";
  return "other";
}

const INSTALL_STEPS_DATA = {
  "ios-safari": {
    emoji: "🍎",
    title: { tr: "iPhone / iPad · Safari", en: "iPhone / iPad · Safari" },
    steps: {
      tr: [
        "Safari'nin altındaki <strong>Paylaş</strong> butonuna bas (kutudan yukarı çıkan ok ikonu).",
        'Açılan menüde aşağı kaydırıp <strong>"Ana Ekrana Ekle"</strong> seçeneğine bas.',
        'Sağ üstteki <strong>"Ekle"</strong> butonuna bas.',
      ],
      en: [
        "Tap Safari's <strong>Share</strong> button at the bottom (the box-with-up-arrow icon).",
        'Scroll down and tap <strong>"Add to Home Screen"</strong>.',
        'Tap <strong>"Add"</strong> in the top right.',
      ],
    },
    note: {
      tr: "Uygulama ana ekranında simge olarak görünecek. Tıkladığında tam ekran açılacak ve adres çubuğu gözükmeyecek.",
      en: "The app appears as an icon on your home screen. Tapping it opens fullscreen with no address bar.",
    },
  },
  "ios-other": {
    emoji: "🍎",
    title: { tr: "iPhone / iPad", en: "iPhone / iPad" },
    steps: {
      tr: [
        "Bu özelliği kullanmak için sayfayı <strong>Safari</strong>'de açman gerekiyor.",
        "Mevcut tarayıcının üst köşesindeki menüden sayfayı kopyala, Safari'de aç.",
        'Safari\'de Paylaş butonuna basıp <strong>"Ana Ekrana Ekle"</strong> seçeneğini kullan.',
      ],
      en: [
        "To use this feature, the page must be opened in <strong>Safari</strong>.",
        "Copy the page URL from the top corner menu of the current browser and open it in Safari.",
        'In Safari, tap the Share button and use <strong>"Add to Home Screen"</strong>.',
      ],
    },
    note: {
      tr: "iOS'ta yalnızca Safari uygulama olarak yükleme işlemini destekliyor.",
      en: "On iOS only Safari supports installing as an app.",
    },
  },
  "android-chrome": {
    emoji: "🤖",
    title: { tr: "Android · Chrome", en: "Android · Chrome" },
    steps: {
      tr: [
        "Tarayıcının sağ üstündeki <strong>üç nokta</strong> menüsüne bas.",
        '<strong>"Uygulamayı yükle"</strong> veya <strong>"Ana ekrana ekle"</strong> seçeneğine bas.',
        'Açılan onay penceresinde <strong>"Yükle"</strong> butonuna bas.',
      ],
      en: [
        "Tap the <strong>three-dot</strong> menu in the top right.",
        'Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.',
        'In the confirmation dialog, tap <strong>"Install"</strong>.',
      ],
    },
    note: {
      tr: "Yükleme tamamlandıktan sonra ana ekranında uygulama simgesi görünecek.",
      en: "After installation, an app icon appears on your home screen.",
    },
  },
  "android-samsung": {
    emoji: "🤖",
    title: { tr: "Android · Samsung Internet", en: "Android · Samsung Internet" },
    steps: {
      tr: [
        "Tarayıcının altındaki menü butonuna bas.",
        '<strong>"Sayfayı ekle"</strong> veya <strong>"Ana ekrana ekle"</strong> seçeneğine bas.',
        "Onayla.",
      ],
      en: [
        "Tap the menu button at the bottom of the browser.",
        'Tap <strong>"Add page to"</strong> or <strong>"Add to Home screen"</strong>.',
        "Confirm.",
      ],
    },
    note: null,
  },
  "android-firefox": {
    emoji: "🦊",
    title: { tr: "Android · Firefox", en: "Android · Firefox" },
    steps: {
      tr: [
        "Tarayıcının sağ alt / üst köşesindeki menü butonuna bas.",
        '<strong>"Yükle"</strong> veya <strong>"Ana ekrana ekle"</strong> seçeneğine bas.',
        'Açılan onay penceresinde <strong>"Ekle"</strong>ye bas.',
      ],
      en: [
        "Tap the menu in the bottom/top corner of the browser.",
        'Tap <strong>"Install"</strong> or <strong>"Add to Home screen"</strong>.',
        'Tap <strong>"Add"</strong> in the confirmation dialog.',
      ],
    },
    note: null,
  },
  chrome: {
    emoji: "💻",
    title: { tr: "Bilgisayar · Chrome / Edge", en: "Desktop · Chrome / Edge" },
    steps: {
      tr: [
        "Adres çubuğunun sağında <strong>yükle simgesini</strong> ara (genellikle bir monitör veya artı ikonu).",
        'Tıkla, açılan kutuda <strong>"Yükle"</strong> butonuna bas.',
        'Alternatif: Sağ üstteki üç nokta menüsünden <strong>"Kontrol Listesi\'ni Yükle"</strong> seçeneği.',
      ],
      en: [
        "Look for the <strong>install icon</strong> at the right of the address bar (usually a monitor or plus icon).",
        'Click it, then click <strong>"Install"</strong> in the dialog.',
        'Alternative: from the three-dot menu in the top right, choose <strong>"Install Checklist"</strong>.',
      ],
    },
    note: {
      tr: "Uygulama bağımsız bir pencerede açılır. Masaüstünde / başlat menüsünde simge oluşur, oradan tek tıkla başlatabilirsin.",
      en: "The app opens in its own window. An icon appears on the desktop / start menu so you can launch it in one click.",
    },
  },
  firefox: {
    emoji: "🦊",
    title: { tr: "Bilgisayar · Firefox", en: "Desktop · Firefox" },
    steps: {
      tr: [
        "Firefox masaüstü sürümü uygulama yüklemeyi şu an desteklemiyor.",
        "Yer imlerine ekleyebilirsin: <strong>Ctrl + D</strong> (Windows / Linux) veya <strong>Cmd + D</strong> (Mac).",
        "Mobilde Chrome veya Safari kullanırsan ana ekrana ekleyebilirsin.",
      ],
      en: [
        "Firefox desktop currently doesn't support installing apps.",
        "You can bookmark it: <strong>Ctrl + D</strong> (Windows / Linux) or <strong>Cmd + D</strong> (Mac).",
        "On mobile, using Chrome or Safari you can add it to the home screen.",
      ],
    },
    note: {
      tr: "Uygulama deneyimi için Chrome veya Edge tavsiye edilir.",
      en: "For a true app experience, Chrome or Edge is recommended.",
    },
  },
  "macos-safari": {
    emoji: "🖥",
    title: { tr: "Mac · Safari", en: "Mac · Safari" },
    steps: {
      tr: [
        "Üst menüden <strong>Dosya</strong> menüsüne bas.",
        '<strong>"Dock\'a Ekle"</strong> seçeneğine bas.',
        "Görüntülenen isim ve simgeyi onayla.",
      ],
      en: [
        "From the top menu, click <strong>File</strong>.",
        'Click <strong>"Add to Dock"</strong>.',
        "Confirm the displayed name and icon.",
      ],
    },
    note: {
      tr: "Uygulama Dock'tan tek tıkla bağımsız bir pencerede açılır.",
      en: "The app launches from the Dock in its own window with one click.",
    },
  },
  default: {
    emoji: "🌐",
    title: { tr: "Genel Talimat", en: "General Instructions" },
    steps: {
      tr: [
        "Tarayıcının menüsünü aç.",
        '<strong>"Uygulamayı Yükle"</strong>, <strong>"Ana Ekrana Ekle"</strong> veya <strong>"Sayfa Kısayolu Oluştur"</strong> seçeneğini ara.',
        "Tıkla ve onayla.",
      ],
      en: [
        "Open your browser's menu.",
        'Look for <strong>"Install App"</strong>, <strong>"Add to Home Screen"</strong> or <strong>"Create Page Shortcut"</strong>.',
        "Click it and confirm.",
      ],
    },
    note: {
      tr: "Tarayıcına bağlı olarak farklı isimler kullanılır. Chrome, Edge ve Safari bu özelliği en iyi destekleyen tarayıcılardır.",
      en: "Different browsers use different names. Chrome, Edge and Safari support this feature best.",
    },
  },
};

function getInstallSteps(platform) {
  let key = platform;
  if (platform === "edge") key = "chrome";
  const data = INSTALL_STEPS_DATA[key] || INSTALL_STEPS_DATA["default"];
  return {
    emoji: data.emoji,
    title: tx(data.title),
    steps: data.steps[currentLang] || data.steps.tr,
    note: data.note ? tx(data.note) : null,
  };
}

function renderInstallInstructions() {
  const platform = detectPlatform();
  const data = getInstallSteps(platform);
  const container = document.getElementById("installInstructions");
  const html = `
    <div class="install-platform-card">
      <h3 class="install-platform-title"><span class="platform-emoji">${data.emoji}</span>${data.title}</h3>
      <ol class="install-steps">
        ${data.steps.map(s => `<li>${s}</li>`).join("")}
      </ol>
      ${data.note ? `<p class="install-note">${data.note}</p>` : ""}
    </div>
    <p class="install-secondary">${t("installModal.afterInstall")}</p>
  `;
  container.innerHTML = html;
}

/* Shared flow for the banner's "Install" button and the floating footer
   button: trigger the native prompt if supported, otherwise open the
   device-specific manual instructions modal. */
async function triggerInstallFlow() {
  if (deferredInstallPrompt) {
    try {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      if (choice && choice.outcome === "accepted") {
        hideInstallBanner();
        try {
          localStorage.setItem(INSTALL_DISMISS_KEY, "installed");
        } catch {}
        updateFloatingInstallVisibility();
        showToast(t("install.installing"), "success", 2800);
      } else {
        showToast(t("install.cancelled"), "info", 1800);
      }
    } catch (err) {
      renderInstallInstructions();
      openModal("installModal");
    }
    return;
  }
  /* No native install support (iOS, Firefox, file://, a Chrome that has not
     yet fired the event, etc.): show the device-specific manual modal. */
  renderInstallInstructions();
  openModal("installModal");
}

document.getElementById("installBannerBtn").addEventListener("click", triggerInstallFlow);

/* The small download-icon button in the footer triggers the same install flow. */
const installFloatingBtn = document.getElementById("installFloatingBtn");
if (installFloatingBtn) {
  installFloatingBtn.addEventListener("click", triggerInstallFlow);
}

/* Banner close button: persists a "do not show again" flag. */
document.getElementById("installBannerClose").addEventListener("click", () => {
  try {
    localStorage.setItem(INSTALL_DISMISS_KEY, "dismissed");
  } catch {}
  hideInstallBanner();
  /* hideInstallBanner already calls updateFloatingInstallVisibility. Since
     we just flagged "dismissed", the banner stays hidden and the floating
     button becomes visible. */
});

/* Init: banner is visible by default (unless the user dismissed it or it is
   already installed):
   - Previously dismissed with the X: hidden (footer floating button visible).
   - Previously installed or running in standalone mode: both hidden.
   - All other cases: banner visible (clicking it behaves based on the
     environment).
   Finally updateFloatingInstallVisibility is called to sync the footer
   button's visibility with the banner's. */
(function initInstallBanner() {
  const banner = document.getElementById("installBanner");
  if (!banner) {
    updateFloatingInstallVisibility();
    return;
  }
  try {
    if (localStorage.getItem(INSTALL_DISMISS_KEY)) {
      banner.hidden = true;
      updateFloatingInstallVisibility();
      return;
    }
  } catch {}
  if (isStandaloneMode()) {
    banner.hidden = true;
    updateFloatingInstallVisibility();
    return;
  }
  banner.hidden = false;
  updateFloatingInstallVisibility();
})();
