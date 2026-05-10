function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}
function loadNotes() {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function saveNotes() {
  try { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); } catch {}
}
function loadCollapsed() {
  try {
    const raw = localStorage.getItem(COLLAPSE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
}
function saveCollapsed() {
  try { localStorage.setItem(COLLAPSE_KEY, JSON.stringify([...collapsedCats])); } catch {}
}

/* İlk ziyarette tüm kategoriler varsayılan olarak kapalı */
function initDefaultCollapsed() {
  const INIT_FLAG = "mobil_kontrol_collapse_init_v1";
  if (!localStorage.getItem(INIT_FLAG)) {
    collapsedCats = new Set(DATA.map(c => `cat-${c.id}`));
    saveCollapsed();
    try { localStorage.setItem(INIT_FLAG, "1"); } catch {}
  }
}

