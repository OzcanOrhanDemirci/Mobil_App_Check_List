/* ==================== ÇOKLU PROJE YÖNETİMİ ====================
   Kullanıcı aynı anda 20'ye kadar ayrı proje (ör. "ChefOl iOS", "Liman Takibi")
   tutabilir. Her proje kendi framework'ünü, işaretlerini, notlarını, kategori
   collapse durumunu, kutlama bayraklarını, viewMode/viewFilter'ını ve kilit
   durumunu izole biçimde saklar. Tema ve dil global kalır.

   Veri şeması (localStorage["mobil_kontrol_projects_v2"]):
     {
       version: 1,
       activeId: "proj_xxx",
       projects: [
         {
           id: "proj_xxx",
           name: "İlk Projem",
           createdAt: "2026-05-10T...",
           updatedAt: "2026-05-10T...",
           data: {
             framework: "flutter" | null,
             backend: "firebase" | "supabase" | "noBackend" | ... | null,
             state: { ...checkbox işaretleri... },
             notes: { ...madde notları... },
             collapsed: ["cat-01", ...],
             celebrations: { mvp:true, release:false, total:false },
             viewMode: "mvp" | "release" | "both",
             viewFilter: "all" | "pending" | "done",
             lockState: false,
             collapseInit: true   // tüm kategorilerin ilk-açılış-kapalı bayrağı
           }
         },
         ...
       ]
     }
*/

const PROJECTS_KEY = "mobil_kontrol_projects_v2";
const PROJECTS_LIMIT = 20;
const PROJECT_NAME_MAX = 60;

/* Eski tek-proje sürümünden gelen anahtarlar — yalnızca migration için okunur,
   migration başarılı olunca silinir. */
const LEGACY_KEYS = {
  state:        "mobil_kontrol_state_v1",
  notes:        "mobil_kontrol_notes_v1",
  collapsed:    "mobil_kontrol_collapse_v1",
  framework:    "mobil_kontrol_framework_v1",
  viewMode:     "mobil_kontrol_level_view_v1",
  viewFilter:   "mobil_kontrol_view_filter_v1",
  lockState:    "mobil_kontrol_lock_v1",
  celebrations: "mobil_kontrol_celebrations_v1",
  collapseInit: "mobil_kontrol_collapse_init_v1"
};

let projectsStore = null;  /* { version, activeId, projects: [...] } */

function makeProjectId() {
  return "proj_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

function nowIso() { return new Date().toISOString(); }

function emptyProjectData() {
  return {
    framework:    null,
    backend:      null,
    state:        {},
    notes:        {},
    collapsed:    [],
    celebrations: {},
    viewMode:     "both",
    viewFilter:   "all",
    lockState:    false,
    collapseInit: false
  };
}

/* "İlk Projem" / "My First Project" — i18n hazır olunca lokalize, değilse TR fallback.
   migrate() init sırasında çağrılır; t() o anda hazır olabilir. */
function defaultProjectName() {
  if (typeof t === "function") {
    const v = t("proj.firstName.default");
    if (v && v !== "proj.firstName.default") return v;
  }
  return "İlk Projem";
}

function loadProjectsFromStorage() {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== "object") return null;
    if (!Array.isArray(obj.projects)) return null;
    return obj;
  } catch { return null; }
}

function saveProjectsToStorage() {
  if (!projectsStore) return;
  try { localStorage.setItem(PROJECTS_KEY, JSON.stringify(projectsStore)); } catch {}
}

/* Migration: v1 anahtarlarındaki tek-proje verisi varsa, "İlk Projem" adıyla
   tek bir proje olarak v2 yapısına taşınır. Yoksa boş bir store oluşturulur
   (kullanıcı welcome akışında kendi projesini oluşturacak). */
function migrateLegacyIfNeeded() {
  const existing = loadProjectsFromStorage();
  if (existing) {
    projectsStore = existing;
    /* Şema sağlamlık kontrolü: activeId mevcut bir projeye işaret etmeli */
    if (projectsStore.activeId && !projectsStore.projects.find(p => p.id === projectsStore.activeId)) {
      projectsStore.activeId = projectsStore.projects[0]?.id || null;
      saveProjectsToStorage();
    }
    /* v2 → v2.1 forward-compat: backend alanı eklenmeden önce oluşmuş projeler
       bu alanı taşımıyor. Eski davranış Firebase odaklıydı, bu yüzden eksik
       backend alanını "firebase" olarak doldur — kullanıcı listede aynı
       maddeleri görmeye devam etsin. Daha sonra istediği zaman değiştirebilir. */
    let migrated = false;
    projectsStore.projects.forEach(p => {
      if (!p.data) return;
      if (!Object.prototype.hasOwnProperty.call(p.data, "backend")) {
        p.data.backend = p.data.framework ? "firebase" : null;
        migrated = true;
      }
    });
    if (migrated) saveProjectsToStorage();
    return;
  }

  const legacyData = emptyProjectData();
  let hasLegacy = false;

  try {
    const v = localStorage.getItem(LEGACY_KEYS.state);
    if (v) { const parsed = JSON.parse(v); if (parsed && typeof parsed === "object") { legacyData.state = parsed; if (Object.keys(parsed).length) hasLegacy = true; } }
  } catch {}
  try {
    const v = localStorage.getItem(LEGACY_KEYS.notes);
    if (v) { const parsed = JSON.parse(v); if (parsed && typeof parsed === "object") { legacyData.notes = parsed; if (Object.keys(parsed).length) hasLegacy = true; } }
  } catch {}
  try {
    const v = localStorage.getItem(LEGACY_KEYS.collapsed);
    if (v) { const parsed = JSON.parse(v); if (Array.isArray(parsed)) { legacyData.collapsed = parsed; } }
  } catch {}
  try {
    const v = localStorage.getItem(LEGACY_KEYS.framework);
    if (v === "flutter" || v === "reactNative" || v === "swift" || v === "kotlin" || v === "expo" || v === "pwa") {
      legacyData.framework = v;
      /* v1'de backend seçimi yoktu; mevcut tek backend Firebase'ti. Geri
         uyumluluk için Firebase varsay. */
      legacyData.backend = "firebase";
      hasLegacy = true;
    }
  } catch {}
  try {
    const v = localStorage.getItem(LEGACY_KEYS.viewMode);
    if (v === "mvp" || v === "release" || v === "both") legacyData.viewMode = v;
  } catch {}
  try {
    const v = localStorage.getItem(LEGACY_KEYS.viewFilter);
    if (v === "all" || v === "pending" || v === "done") legacyData.viewFilter = v;
  } catch {}
  try {
    const v = localStorage.getItem(LEGACY_KEYS.lockState);
    if (v === "1") { legacyData.lockState = true; hasLegacy = true; }
  } catch {}
  try {
    const v = localStorage.getItem(LEGACY_KEYS.celebrations);
    if (v) { const parsed = JSON.parse(v); if (parsed && typeof parsed === "object") legacyData.celebrations = parsed; }
  } catch {}
  try {
    const v = localStorage.getItem(LEGACY_KEYS.collapseInit);
    if (v) legacyData.collapseInit = true;
  } catch {}

  if (hasLegacy) {
    const id = makeProjectId();
    const now = nowIso();
    projectsStore = {
      version: 1,
      activeId: id,
      projects: [{
        id,
        name: defaultProjectName(),
        createdAt: now,
        updatedAt: now,
        data: legacyData
      }]
    };
    saveProjectsToStorage();
    /* Migration başarılı; eski anahtarları temizle */
    try { Object.values(LEGACY_KEYS).forEach(k => localStorage.removeItem(k)); } catch {}
  } else {
    /* Hiç veri yok, gerçek ilk ziyaret. Welcome akışı projeyi oluşturacak. */
    projectsStore = { version: 1, activeId: null, projects: [] };
  }
}

migrateLegacyIfNeeded();

/* ==================== AKTİF PROJE ERİŞİMİ ==================== */

function getActiveProject() {
  if (!projectsStore || !projectsStore.activeId) return null;
  return projectsStore.projects.find(p => p.id === projectsStore.activeId) || null;
}

function getActiveProjectData() {
  const proj = getActiveProject();
  return proj ? proj.data : null;
}

function getActiveProjectId() {
  return projectsStore ? projectsStore.activeId : null;
}

/* getProjectField: aktif projenin data.X alanını okur. Aktif proje yoksa undefined. */
function getProjectField(key) {
  const data = getActiveProjectData();
  if (!data) return undefined;
  return data[key];
}

function setProjectField(key, value) {
  const proj = getActiveProject();
  if (!proj) return;
  proj.data[key] = value;
  proj.updatedAt = nowIso();
  saveProjectsToStorage();
}

/* ==================== CRUD ==================== */

function listProjects() {
  return projectsStore ? [...projectsStore.projects] : [];
}

function projectsCount() {
  return projectsStore ? projectsStore.projects.length : 0;
}

function findProjectById(id) {
  if (!projectsStore) return null;
  return projectsStore.projects.find(p => p.id === id) || null;
}

function projectExistsByName(name, excludeId) {
  if (!projectsStore) return false;
  const norm = String(name || "").trim().toLowerCase();
  if (!norm) return false;
  return projectsStore.projects.some(p => p.id !== excludeId && p.name.trim().toLowerCase() === norm);
}

/* Proje oluşturur ve store'a yazar. Aktif proje değişmez (caller karar versin).
   initialData: yeni projenin başlangıç data alanını seed etmek için (örn.
   "+ Yeni Proje" akışında { framework: currentFramework } ile mevcut aktif
   framework'ü inherit etmek). emptyProjectData üzerine merge edilir. */
function createProject(name, initialData) {
  if (!projectsStore) return { ok: false, error: "noStore" };
  const trimmed = String(name || "").trim();
  if (!trimmed) return { ok: false, error: "empty" };
  if (trimmed.length > PROJECT_NAME_MAX) return { ok: false, error: "tooLong" };
  if (projectsStore.projects.length >= PROJECTS_LIMIT) return { ok: false, error: "limit" };
  if (projectExistsByName(trimmed)) return { ok: false, error: "duplicate" };

  const id = makeProjectId();
  const now = nowIso();
  const data = emptyProjectData();
  if (initialData && typeof initialData === "object") {
    /* Sadece bilinen alanlar üzerine yaz (ekstra anahtarlar silsin) */
    if (initialData.framework && VALID_FRAMEWORKS.indexOf(initialData.framework) !== -1) {
      data.framework = initialData.framework;
    }
    if (initialData.backend && VALID_BACKENDS.indexOf(initialData.backend) !== -1) {
      data.backend = initialData.backend;
    }
  }
  const proj = {
    id,
    name: trimmed,
    createdAt: now,
    updatedAt: now,
    data
  };
  projectsStore.projects.push(proj);
  saveProjectsToStorage();
  return { ok: true, project: proj };
}

function renameProject(id, newName) {
  if (!projectsStore) return { ok: false, error: "noStore" };
  const trimmed = String(newName || "").trim();
  if (!trimmed) return { ok: false, error: "empty" };
  if (trimmed.length > PROJECT_NAME_MAX) return { ok: false, error: "tooLong" };
  const proj = findProjectById(id);
  if (!proj) return { ok: false, error: "notFound" };
  if (projectExistsByName(trimmed, id)) return { ok: false, error: "duplicate" };
  proj.name = trimmed;
  proj.updatedAt = nowIso();
  saveProjectsToStorage();
  return { ok: true, project: proj };
}

/* Son projeyi silmeye izin vermeyiz; her zaman en az 1 proje olmalı. */
function deleteProject(id) {
  if (!projectsStore) return { ok: false, error: "noStore" };
  if (projectsStore.projects.length <= 1) return { ok: false, error: "lastOne" };
  const idx = projectsStore.projects.findIndex(p => p.id === id);
  if (idx === -1) return { ok: false, error: "notFound" };
  const wasActive = projectsStore.activeId === id;
  projectsStore.projects.splice(idx, 1);
  if (wasActive) {
    /* En son güncellenmiş diğer projeye geç */
    const sorted = [...projectsStore.projects].sort((a, b) =>
      String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""))
    );
    projectsStore.activeId = sorted[0]?.id || null;
  }
  saveProjectsToStorage();
  return { ok: true, switchedTo: wasActive ? projectsStore.activeId : null };
}

function setActiveProjectId(id) {
  if (!projectsStore) return false;
  if (!projectsStore.projects.find(p => p.id === id)) return false;
  if (projectsStore.activeId === id) return true;
  projectsStore.activeId = id;
  saveProjectsToStorage();
  return true;
}

/* "Tüm Sistem" sıfırlama tarafından çağrılır: tüm projeler silinir, store boşalır.
   Ardından location.reload yapılınca welcome akışı yeniden tetiklenir. */
function resetAllProjects() {
  projectsStore = { version: 1, activeId: null, projects: [] };
  try { localStorage.removeItem(PROJECTS_KEY); } catch {}
}

/* Aktif proje değiştiğinde (welcome'da yeni proje yaratıldığında veya kullanıcı
   proje yöneticisinden başka projeye geçtiğinde) çağrılır. In-memory state
   değişkenlerini yeniden yükler ve UI'ı baştan render eder. Tüm bağımlı
   fonksiyonlar global scope'ta tanımlı; çağrı anında hepsi hazır olur. */
function reloadActiveProjectAndRender() {
  /* In-memory state'i yeniden yükle */
  state            = loadState();
  notes            = loadNotes();
  collapsedCats    = loadCollapsed();
  currentFramework = loadFramework();
  currentBackend   = loadBackend();
  viewMode         = loadViewMode();
  viewFilter       = loadViewFilter();
  lockState        = loadLockState();
  celebrations     = loadCelebrations();

  /* Yeni projenin ilk açılışı ise tüm kategorileri varsayılan olarak kapat */
  if (typeof initDefaultCollapsed === "function") initDefaultCollapsed();

  /* UI'ı yeniden render: framework metinleri, içerik, click handler'lar,
     ilerleme barları, görünürlük (filter), kilit görünümü */
  if (typeof applyFrameworkUI === "function")     applyFrameworkUI();
  if (typeof applyBackendUI === "function")       applyBackendUI();
  if (typeof updateProjectPill === "function")     updateProjectPill();
  if (typeof renderContent === "function")         renderContent();
  if (typeof attachClickHandlers === "function")   attachClickHandlers();
  if (typeof applyView === "function")             applyView();
  if (typeof applyLock === "function")             applyLock();
  if (typeof updateProgress === "function")        updateProgress();
  if (typeof applyFilters === "function")          applyFilters();
}
