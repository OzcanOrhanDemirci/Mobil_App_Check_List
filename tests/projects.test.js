/* Tests for the multi-project store (js/04-projects.js).

   What this covers:
     - Empty / first-visit initial state
     - createProject: name validation, name uniqueness, length cap, store cap,
       initialData seeding (framework / backend)
     - renameProject: validation, duplicate detection, identity rename
     - deleteProject: last-one protection, active-project re-selection
     - setActiveProjectId
     - Round-trip persistence via the localStorage stub
     - resetAllProjects
     - Legacy v1 to v2 migration (the only behaviour the user has trouble
       seeing if it regresses, because it runs at module load)

   Each test calls loadAppContext() and gets a fresh sandbox with an empty
   localStorage and no projects. Migration tests pre-seed localStorage via
   the `localStorageSeed` option so migrateLegacyIfNeeded() sees the legacy
   keys as soon as it runs at module load time.
*/

"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { loadAppContext } = require("./_setup.js");

/* Objects returned from inside the vm sandbox carry the sandbox realm's
   prototype, not the main realm's. node:assert/strict's deepStrictEqual
   compares the [[Prototype]] chain and rejects cross-realm objects even
   when the structure is identical (error message: "Values have same
   structure but are not reference-equal"). A JSON round-trip materialises
   a fresh main-realm object with the same data, which is what we want
   for plain JSON-shaped values such as projects, project data, and the
   {ok, error} result envelopes. */
function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

describe("Initial state with empty localStorage", () => {
  it("projectsCount is 0", () => {
    const ctx = loadAppContext();
    assert.equal(ctx.projectsCount(), 0);
  });

  it("listProjects returns an empty array", () => {
    const ctx = loadAppContext();
    assert.deepEqual(plain(ctx.listProjects()), []);
  });

  it("getActiveProject and getActiveProjectId are null", () => {
    const ctx = loadAppContext();
    assert.equal(ctx.getActiveProject(), null);
    assert.equal(ctx.getActiveProjectId(), null);
  });

  it("the store object exists with version 1, null activeId, empty projects", () => {
    const ctx = loadAppContext();
    const store = ctx.__getProjectsStore();
    assert.ok(store);
    assert.equal(store.version, 1);
    assert.equal(store.activeId, null);
    assert.deepEqual(plain(store.projects), []);
  });
});

describe("emptyProjectData", () => {
  it("returns the full default shape with every expected key", () => {
    const ctx = loadAppContext();
    const d = plain(ctx.emptyProjectData());
    assert.equal(d.framework, null);
    assert.equal(d.backend, null);
    assert.deepEqual(d.state, {});
    assert.deepEqual(d.notes, {});
    assert.deepEqual(d.collapsed, []);
    assert.deepEqual(d.celebrations, {});
    assert.equal(d.viewMode, "both");
    assert.equal(d.viewFilter, "all");
    assert.equal(d.lockState, false);
    assert.equal(d.collapseInit, false);
  });

  it("returns independent objects (no shared mutation)", () => {
    const ctx = loadAppContext();
    const a = ctx.emptyProjectData();
    const b = ctx.emptyProjectData();
    a.state.foo = 1;
    assert.deepEqual(plain(b.state), {}, "second call must not see mutation on the first");
  });
});

describe("createProject", () => {
  it("creates a project and exposes it via listProjects", () => {
    const ctx = loadAppContext();
    const result = ctx.createProject("My App");
    assert.equal(result.ok, true);
    assert.ok(result.project);
    assert.equal(result.project.name, "My App");
    assert.equal(typeof result.project.id, "string");
    assert.ok(result.project.id.startsWith("proj_"));
    assert.equal(typeof result.project.createdAt, "string");
    assert.equal(typeof result.project.updatedAt, "string");
    assert.equal(ctx.projectsCount(), 1);
    assert.equal(ctx.listProjects()[0].id, result.project.id);
  });

  it("trims whitespace from the name", () => {
    const ctx = loadAppContext();
    const result = ctx.createProject("  My App  ");
    assert.equal(result.ok, true);
    assert.equal(result.project.name, "My App");
  });

  it("rejects an empty name", () => {
    const ctx = loadAppContext();
    assert.deepEqual(plain(ctx.createProject("")), { ok: false, error: "empty" });
    assert.deepEqual(plain(ctx.createProject("   ")), { ok: false, error: "empty" });
    assert.deepEqual(plain(ctx.createProject(null)), { ok: false, error: "empty" });
    assert.deepEqual(plain(ctx.createProject(undefined)), { ok: false, error: "empty" });
  });

  it("rejects a name longer than PROJECT_NAME_MAX", () => {
    const ctx = loadAppContext();
    const tooLong = "x".repeat(ctx.PROJECT_NAME_MAX + 1);
    assert.deepEqual(plain(ctx.createProject(tooLong)), { ok: false, error: "tooLong" });
  });

  it("accepts a name exactly PROJECT_NAME_MAX long", () => {
    const ctx = loadAppContext();
    const exact = "x".repeat(ctx.PROJECT_NAME_MAX);
    const r = ctx.createProject(exact);
    assert.equal(r.ok, true);
    assert.equal(r.project.name.length, ctx.PROJECT_NAME_MAX);
  });

  it("rejects a duplicate name (case-insensitive, trim-insensitive)", () => {
    const ctx = loadAppContext();
    assert.equal(ctx.createProject("Foo").ok, true);
    assert.deepEqual(plain(ctx.createProject("Foo")), { ok: false, error: "duplicate" });
    assert.deepEqual(plain(ctx.createProject("foo")), { ok: false, error: "duplicate" });
    assert.deepEqual(plain(ctx.createProject("  FOO  ")), { ok: false, error: "duplicate" });
  });

  it("enforces the PROJECTS_LIMIT cap", () => {
    const ctx = loadAppContext();
    for (let i = 0; i < ctx.PROJECTS_LIMIT; i++) {
      assert.equal(ctx.createProject(`Project ${i + 1}`).ok, true, `failed to create #${i + 1}`);
    }
    assert.equal(ctx.projectsCount(), ctx.PROJECTS_LIMIT);
    assert.deepEqual(plain(ctx.createProject("One more")), { ok: false, error: "limit" });
    assert.equal(ctx.projectsCount(), ctx.PROJECTS_LIMIT, "rejected create must not change the count");
  });

  it("seeds framework and backend from initialData when valid", () => {
    const ctx = loadAppContext();
    const r = ctx.createProject("X", { framework: "flutter", backend: "firebase" });
    assert.equal(r.ok, true);
    assert.equal(r.project.data.framework, "flutter");
    assert.equal(r.project.data.backend, "firebase");
  });

  it("ignores invalid framework / backend values in initialData", () => {
    const ctx = loadAppContext();
    const r = ctx.createProject("X", { framework: "noSuchFramework", backend: "noSuchBackend" });
    assert.equal(r.ok, true);
    assert.equal(r.project.data.framework, null);
    assert.equal(r.project.data.backend, null);
  });

  it("ignores keys other than framework / backend in initialData", () => {
    const ctx = loadAppContext();
    const r = ctx.createProject("X", { framework: "flutter", backend: "firebase", state: { hacked: true } });
    assert.equal(r.ok, true);
    assert.deepEqual(plain(r.project.data.state), {}, "extra keys in initialData must not be merged");
  });

  it("does not auto-activate the new project (caller chooses)", () => {
    const ctx = loadAppContext();
    ctx.createProject("First");
    assert.equal(ctx.getActiveProjectId(), null, "createProject should not change activeId on its own");
  });
});

describe("renameProject", () => {
  it("renames an existing project", () => {
    const ctx = loadAppContext();
    const created = ctx.createProject("Old").project;
    const r = ctx.renameProject(created.id, "New");
    assert.equal(r.ok, true);
    assert.equal(r.project.name, "New");
    assert.equal(ctx.findProjectById(created.id).name, "New");
  });

  it("trims whitespace from the new name", () => {
    const ctx = loadAppContext();
    const created = ctx.createProject("Old").project;
    const r = ctx.renameProject(created.id, "  Spaced  ");
    assert.equal(r.ok, true);
    assert.equal(r.project.name, "Spaced");
  });

  it("rejects an empty new name", () => {
    const ctx = loadAppContext();
    const created = ctx.createProject("Old").project;
    assert.deepEqual(plain(ctx.renameProject(created.id, "")), { ok: false, error: "empty" });
    assert.deepEqual(plain(ctx.renameProject(created.id, "   ")), { ok: false, error: "empty" });
  });

  it("rejects names longer than PROJECT_NAME_MAX", () => {
    const ctx = loadAppContext();
    const created = ctx.createProject("Old").project;
    const tooLong = "x".repeat(ctx.PROJECT_NAME_MAX + 1);
    assert.deepEqual(plain(ctx.renameProject(created.id, tooLong)), { ok: false, error: "tooLong" });
  });

  it("rejects when the new name collides with a different project", () => {
    const ctx = loadAppContext();
    const a = ctx.createProject("Alpha").project;
    ctx.createProject("Beta");
    assert.deepEqual(plain(ctx.renameProject(a.id, "Beta")), { ok: false, error: "duplicate" });
  });

  it("allows renaming a project to its own current name (no-op)", () => {
    const ctx = loadAppContext();
    const a = ctx.createProject("Alpha").project;
    const r = ctx.renameProject(a.id, "Alpha");
    assert.equal(r.ok, true);
    assert.equal(r.project.name, "Alpha");
  });

  it("returns notFound for a non-existent id", () => {
    const ctx = loadAppContext();
    ctx.createProject("Alpha");
    assert.deepEqual(plain(ctx.renameProject("proj_nonexistent", "X")), { ok: false, error: "notFound" });
  });
});

describe("deleteProject", () => {
  it("removes the project from the list", () => {
    const ctx = loadAppContext();
    const a = ctx.createProject("A").project;
    const b = ctx.createProject("B").project;
    const r = ctx.deleteProject(a.id);
    assert.equal(r.ok, true);
    assert.equal(ctx.projectsCount(), 1);
    assert.equal(ctx.findProjectById(a.id), null);
    assert.equal(ctx.findProjectById(b.id).id, b.id);
  });

  it("refuses to delete the only remaining project", () => {
    const ctx = loadAppContext();
    const a = ctx.createProject("A").project;
    assert.deepEqual(plain(ctx.deleteProject(a.id)), { ok: false, error: "lastOne" });
    assert.equal(ctx.projectsCount(), 1);
  });

  it("returns notFound for a non-existent id", () => {
    const ctx = loadAppContext();
    ctx.createProject("A");
    ctx.createProject("B");
    assert.deepEqual(plain(ctx.deleteProject("proj_nonexistent")), { ok: false, error: "notFound" });
  });

  it("switches activeId to the most-recently-updated remaining project when the active one is deleted", () => {
    const ctx = loadAppContext();
    const a = ctx.createProject("A").project;
    const b = ctx.createProject("B").project;
    const c = ctx.createProject("C").project;
    ctx.setActiveProjectId(a.id);

    /* Touch B so its updatedAt is the most recent. */
    ctx.setActiveProjectId(b.id);
    ctx.setProjectField("framework", "flutter");
    ctx.setActiveProjectId(a.id);

    const r = ctx.deleteProject(a.id);
    assert.equal(r.ok, true);
    assert.equal(r.switchedTo, b.id, `expected switch to B but got ${r.switchedTo} (C was ${c.id})`);
    assert.equal(ctx.getActiveProjectId(), b.id);
  });

  it("does not change activeId when a non-active project is deleted", () => {
    const ctx = loadAppContext();
    const a = ctx.createProject("A").project;
    const b = ctx.createProject("B").project;
    ctx.setActiveProjectId(a.id);
    const r = ctx.deleteProject(b.id);
    assert.equal(r.ok, true);
    assert.equal(r.switchedTo, null);
    assert.equal(ctx.getActiveProjectId(), a.id);
  });
});

describe("setActiveProjectId", () => {
  it("returns true and activates a known project", () => {
    const ctx = loadAppContext();
    const a = ctx.createProject("A").project;
    assert.equal(ctx.setActiveProjectId(a.id), true);
    assert.equal(ctx.getActiveProjectId(), a.id);
  });

  it("returns false and does not change state for an unknown id", () => {
    const ctx = loadAppContext();
    const a = ctx.createProject("A").project;
    ctx.setActiveProjectId(a.id);
    assert.equal(ctx.setActiveProjectId("proj_nope"), false);
    assert.equal(ctx.getActiveProjectId(), a.id, "active id must not change on a rejected setActive");
  });

  it("is a no-op success when called with the already-active id", () => {
    const ctx = loadAppContext();
    const a = ctx.createProject("A").project;
    ctx.setActiveProjectId(a.id);
    assert.equal(ctx.setActiveProjectId(a.id), true);
    assert.equal(ctx.getActiveProjectId(), a.id);
  });
});

describe("setProjectField / getProjectField", () => {
  it("persists a field on the active project", () => {
    const ctx = loadAppContext();
    const a = ctx.createProject("A").project;
    ctx.setActiveProjectId(a.id);
    ctx.setProjectField("framework", "flutter");
    assert.equal(ctx.getProjectField("framework"), "flutter");
    assert.equal(ctx.findProjectById(a.id).data.framework, "flutter");
  });

  it("returns undefined when there is no active project", () => {
    const ctx = loadAppContext();
    assert.equal(ctx.getProjectField("framework"), undefined);
  });

  it("setProjectField is a silent no-op when there is no active project", () => {
    const ctx = loadAppContext();
    /* should not throw */
    ctx.setProjectField("framework", "flutter");
    assert.equal(ctx.projectsCount(), 0);
  });

  it("bumps updatedAt when a field changes", async () => {
    const ctx = loadAppContext();
    const created = ctx.createProject("A").project;
    ctx.setActiveProjectId(created.id);
    const before = created.updatedAt;
    /* Make sure a millisecond ticks by; ISO timestamps have ms resolution. */
    await new Promise(resolve => setTimeout(resolve, 5));
    ctx.setProjectField("framework", "flutter");
    const after = ctx.findProjectById(created.id).updatedAt;
    assert.notEqual(after, before, "updatedAt should change after a field write");
  });
});

describe("Persistence round-trip via localStorage stub", () => {
  it("a project written by createProject is reachable from the raw localStorage entry", () => {
    const ctx = loadAppContext();
    const created = ctx.createProject("Persisted").project;
    ctx.setActiveProjectId(created.id);

    const raw = ctx.localStorage.getItem(ctx.PROJECTS_KEY);
    assert.ok(raw, "PROJECTS_KEY must be populated after a create + setActive");

    const parsed = JSON.parse(raw);
    assert.equal(parsed.version, 1);
    assert.equal(parsed.activeId, created.id);
    assert.equal(parsed.projects.length, 1);
    assert.equal(parsed.projects[0].name, "Persisted");
  });

  it("a second loadAppContext seeded with the saved blob reconstructs the same store", () => {
    const ctx1 = loadAppContext();
    const created = ctx1.createProject("Persisted").project;
    ctx1.setActiveProjectId(created.id);
    const raw = ctx1.localStorage.getItem(ctx1.PROJECTS_KEY);

    const ctx2 = loadAppContext({ localStorageSeed: { [ctx1.PROJECTS_KEY]: raw } });
    assert.equal(ctx2.projectsCount(), 1);
    assert.equal(ctx2.getActiveProjectId(), created.id);
    assert.equal(ctx2.findProjectById(created.id).name, "Persisted");
  });
});

describe("resetAllProjects", () => {
  it("empties the store and removes the persisted entry", () => {
    const ctx = loadAppContext();
    ctx.createProject("A");
    ctx.createProject("B");
    assert.equal(ctx.projectsCount(), 2);
    ctx.resetAllProjects();
    assert.equal(ctx.projectsCount(), 0);
    assert.equal(ctx.getActiveProjectId(), null);
    assert.equal(ctx.localStorage.getItem(ctx.PROJECTS_KEY), null, "PROJECTS_KEY must be removed from storage");
  });
});

describe("Legacy v1 to v2 migration at module load", () => {
  it("with no v1 and no v2 keys, the store is empty and the activeId is null", () => {
    const ctx = loadAppContext();
    const store = ctx.__getProjectsStore();
    assert.equal(store.projects.length, 0);
    assert.equal(store.activeId, null);
  });

  it("migrates a v1 user with framework + state into a single v2 project", () => {
    const seed = {
      mobil_kontrol_framework_v1: "flutter",
      mobil_kontrol_state_v1: JSON.stringify({ "1.1-mvp": true, "1.1-release": false }),
      mobil_kontrol_notes_v1: JSON.stringify({ 1.1: "my note" }),
    };
    const ctx = loadAppContext({ localStorageSeed: seed });

    assert.equal(ctx.projectsCount(), 1, "exactly one project should be created from legacy data");
    const proj = ctx.listProjects()[0];
    assert.equal(proj.data.framework, "flutter");
    assert.equal(
      proj.data.backend,
      "firebase",
      "legacy projects should default to firebase backend per project doc comment"
    );
    assert.deepEqual(plain(proj.data.state), { "1.1-mvp": true, "1.1-release": false });
    assert.deepEqual(plain(proj.data.notes), { 1.1: "my note" });

    assert.equal(ctx.getActiveProjectId(), proj.id, "the migrated project must become active");
  });

  it("deletes all legacy keys after a successful migration", () => {
    const seed = {
      mobil_kontrol_framework_v1: "flutter",
      mobil_kontrol_state_v1: JSON.stringify({ "1.1-mvp": true }),
      mobil_kontrol_notes_v1: JSON.stringify({ 1.1: "n" }),
      mobil_kontrol_lock_v1: "1",
    };
    const ctx = loadAppContext({ localStorageSeed: seed });
    for (const key of Object.values(ctx.LEGACY_KEYS)) {
      assert.equal(ctx.localStorage.getItem(key), null, `legacy key ${key} should be cleared after migration`);
    }
  });

  it("preserves lockState from v1", () => {
    const seed = {
      mobil_kontrol_framework_v1: "flutter",
      mobil_kontrol_lock_v1: "1",
    };
    const ctx = loadAppContext({ localStorageSeed: seed });
    assert.equal(ctx.listProjects()[0].data.lockState, true);
  });

  it("backfills the backend field for an existing v2 project that pre-dates the backend axis", () => {
    /* Simulate a stored v2 blob from the period before backend was added.
       The data object has framework but no backend key. Migration should
       fill it with "firebase" since that was the only backend at the time. */
    const id = "proj_legacy_xyz";
    const seed = {
      mobil_kontrol_projects_v2: JSON.stringify({
        version: 1,
        activeId: id,
        projects: [
          {
            id,
            name: "Pre-backend project",
            createdAt: "2026-04-01T00:00:00.000Z",
            updatedAt: "2026-04-01T00:00:00.000Z",
            data: {
              framework: "flutter",
              state: {},
              notes: {},
              collapsed: [],
              celebrations: {},
              viewMode: "both",
              viewFilter: "all",
              lockState: false,
              collapseInit: false,
            },
          },
        ],
      }),
    };
    const ctx = loadAppContext({ localStorageSeed: seed });
    const proj = ctx.findProjectById(id);
    assert.ok(proj, "project must survive migration");
    assert.equal(proj.data.backend, "firebase", "missing backend should be backfilled to firebase");
  });

  it("repairs activeId when it points at a project that no longer exists", () => {
    const seed = {
      mobil_kontrol_projects_v2: JSON.stringify({
        version: 1,
        activeId: "proj_orphan",
        projects: [
          {
            id: "proj_real",
            name: "Real",
            createdAt: "2026-04-01T00:00:00.000Z",
            updatedAt: "2026-04-01T00:00:00.000Z",
            data: {
              framework: "flutter",
              backend: "firebase",
              state: {},
              notes: {},
              collapsed: [],
              celebrations: {},
              viewMode: "both",
              viewFilter: "all",
              lockState: false,
              collapseInit: false,
            },
          },
        ],
      }),
    };
    const ctx = loadAppContext({ localStorageSeed: seed });
    assert.equal(
      ctx.getActiveProjectId(),
      "proj_real",
      "stale activeId must be replaced by the first surviving project's id"
    );
  });
});

describe("projectExistsByName", () => {
  it("is case-insensitive and trim-insensitive", () => {
    const ctx = loadAppContext();
    ctx.createProject("Alpha");
    assert.equal(ctx.projectExistsByName("alpha"), true);
    assert.equal(ctx.projectExistsByName("  ALPHA  "), true);
    assert.equal(ctx.projectExistsByName("Beta"), false);
  });

  it("excludes the project matching excludeId from the search", () => {
    const ctx = loadAppContext();
    const a = ctx.createProject("Alpha").project;
    assert.equal(ctx.projectExistsByName("Alpha", a.id), false, "should ignore the project being renamed itself");
    ctx.createProject("Beta");
    assert.equal(ctx.projectExistsByName("Beta", a.id), true, "but should still see the OTHER project's name");
  });

  it("returns false for empty input", () => {
    const ctx = loadAppContext();
    ctx.createProject("Alpha");
    assert.equal(ctx.projectExistsByName(""), false);
    assert.equal(ctx.projectExistsByName("   "), false);
    assert.equal(ctx.projectExistsByName(null), false);
    assert.equal(ctx.projectExistsByName(undefined), false);
  });
});
