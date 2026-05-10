/* Aktif projeye bağlı state/notes/collapsed depolaması.
   Tüm okuma/yazma 04-projects.js → getProjectField/setProjectField üzerinden
   aktif projenin .data alanına gider. Aktif proje yoksa load* boş döner,
   save* no-op olur (welcome akışı projeyi oluşturmadan kullanıcı işaret
   yapamaz çünkü welcome modalı tüm UI'ı bloke eder). */

function loadState() {
  const v = getProjectField("state");
  return (v && typeof v === "object") ? v : {};
}
function saveState() {
  setProjectField("state", state);
}
function loadNotes() {
  const v = getProjectField("notes");
  return (v && typeof v === "object") ? v : {};
}
function saveNotes() {
  setProjectField("notes", notes);
}
function loadCollapsed() {
  const v = getProjectField("collapsed");
  return new Set(Array.isArray(v) ? v : []);
}
function saveCollapsed() {
  setProjectField("collapsed", [...collapsedCats]);
}

/* İlk ziyarette (her proje için bir kez) tüm kategoriler varsayılan olarak
   kapalı olur. Bayrak proje data'sının içinde tutulur — bu sayede yeni
   oluşturulan her proje de aynı temiz/kapalı durumla başlar. */
function initDefaultCollapsed() {
  const data = getActiveProjectData();
  if (!data) return;
  if (!data.collapseInit) {
    collapsedCats = new Set(DATA.map(c => `cat-${c.id}`));
    saveCollapsed();
    setProjectField("collapseInit", true);
  }
}
