/* Per-project storage for state/notes/collapsed.
   All reads and writes go through 04-projects.js (getProjectField /
   setProjectField) into the active project's .data field. With no active
   project, load* returns empty and save* becomes a no-op (the welcome
   modal blocks the UI until a project exists, so the user cannot mark
   anything before then). */

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

/* On first visit (once per project), all categories start collapsed by
   default. The flag is stored inside the project's data, so every newly
   created project begins in the same clean/collapsed state. */
function initDefaultCollapsed() {
  const data = getActiveProjectData();
  if (!data) return;
  if (!data.collapseInit) {
    collapsedCats = new Set(DATA.map(c => `cat-${c.id}`));
    saveCollapsed();
    setProjectField("collapseInit", true);
  }
}
