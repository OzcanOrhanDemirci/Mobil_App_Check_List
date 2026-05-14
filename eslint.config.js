/* ESLint 9 flat config for the Mobile App Quality Checklist PWA.
   The js/ files are loaded sequentially via <script> tags in index.html
   and depend on cross-file globals (no modules, no bundler). */

const js = require("@eslint/js");
const globals = require("globals");

/* Cross-file globals declared in js/01..14 and consumed elsewhere.
   All are marked writable because most are mutated during runtime
   (state, currentLang, viewMode, project store, pending* welcome vars, ...). */
const projectGlobals = {
  // js/01-i18n-strings.js
  LANG_KEY: "writable",
  currentLang: "writable",
  STYLE_KEY: "writable",
  currentStyle: "writable",
  MODE_KEY: "writable",
  currentMode: "writable",
  tx: "writable",
  UI_STRINGS: "writable",
  t: "writable",

  // js/02-help-content.js
  HELP_HTML: "writable",

  // js/03-data.js
  DATA: "writable",

  // js/04-projects.js
  PROJECTS_KEY: "writable",
  PROJECTS_LIMIT: "writable",
  PROJECT_NAME_MAX: "writable",
  LEGACY_KEYS: "writable",
  projectsStore: "writable",
  makeProjectId: "writable",
  nowIso: "writable",
  emptyProjectData: "writable",
  defaultProjectName: "writable",
  loadProjectsFromStorage: "writable",
  saveProjectsToStorage: "writable",
  migrateLegacyIfNeeded: "writable",
  getActiveProject: "writable",
  getActiveProjectData: "writable",
  getActiveProjectId: "writable",
  getProjectField: "writable",
  setProjectField: "writable",
  listProjects: "writable",
  projectsCount: "writable",
  findProjectById: "writable",
  projectExistsByName: "writable",
  createProject: "writable",
  renameProject: "writable",
  deleteProject: "writable",
  setActiveProjectId: "writable",
  resetAllProjects: "writable",
  reloadActiveProjectAndRender: "writable",

  // js/04-storage.js
  loadState: "writable",
  saveState: "writable",
  loadNotes: "writable",
  saveNotes: "writable",
  loadCollapsed: "writable",
  saveCollapsed: "writable",
  initDefaultCollapsed: "writable",

  // js/05-framework.js
  VALID_FRAMEWORKS: "writable",
  loadFramework: "writable",
  saveFramework: "writable",
  resolveLevel: "writable",
  resolveLevelText: "writable",
  resolveHowto: "writable",
  resolveHowtoText: "writable",
  FRAMEWORK_META: "writable",
  fwLabel: "writable",
  INSTALL_EXAMPLES: "writable",
  SETUP_ASSUMPTIONS: "writable",

  // js/05-backend.js
  VALID_BACKENDS: "writable",
  loadBackend: "writable",
  saveBackend: "writable",
  BACKEND_META: "writable",
  backendLabel: "writable",
  backendShort: "writable",
  BACKEND_INSTALL_EXAMPLES: "writable",
  BACKEND_SETUP_ASSUMPTIONS: "writable",
  isHiddenByBackend: "writable",

  // js/06-view-state.js
  state: "writable",
  notes: "writable",
  collapsedCats: "writable",
  currentFramework: "writable",
  currentBackend: "writable",
  viewMode: "writable",
  viewFilter: "writable",
  loadViewMode: "writable",
  loadViewFilter: "writable",
  lockState: "writable",
  loadLockState: "writable",
  saveLockState: "writable",
  applyLock: "writable",
  saveViewMode: "writable",
  saveViewFilter: "writable",
  applyView: "writable",
  setView: "writable",
  updateToolbarButtonStates: "writable",
  /* Toolbar "user chose" bayrak yardımcıları. ilk-açılış sönük durumunu
     kullanıcı bilinçli toolbar tıklaması veya doğrudan UI etkileşimine
     kadar koruyan kontrol; "Sıfırla > Ayarlar" scope'u temizler. Detay
     için js/06-view-state.js başındaki yorum bloğuna bak. */
  markCollapseTouched: "writable",
  markFlipTouched: "writable",
  clearCollapseFlipTouchFlags: "writable",

  // js/07-ui-helpers.js
  escapeHtml: "writable",
  stripHtml: "writable",
  showToast: "writable",
  openModal: "writable",
  closeModal: "writable",
  closeAllModals: "writable",
  confirmCallback: "writable",
  confirmCancelCallback: "writable",
  customConfirm: "writable",
  applyStyle: "writable",
  toggleStyle: "writable",
  applyMode: "writable",
  THEME_KEY: "writable",
  applyTheme: "writable",

  // js/08-i18n-dom.js
  applyI18nToDom: "writable",
  saveLang: "writable",
  applyLang: "writable",

  // js/09-ai-prompt.js
  buildAIPromptTR: "writable",
  buildAIPromptJSON: "writable",

  // js/10-clipboard.js
  copyToClipboard: "writable",

  // Optional globals probed via `typeof X === "function"` defensively
  updateProjectPill: "readonly",

  // js/11-render.js
  content: "writable",
  catNav: "writable",
  levelLabel: "writable",
  countHowtoSteps: "writable",
  countCheckedStepsByPrefix: "writable",
  formatHowtoSteps: "writable",
  flipFeatureCard: "writable",
  applyInitialCardMode: "writable",
  renderCategoryNav: "writable",
  findCategoryTargetFeature: "writable",
  navigateToCategorySmart: "writable",
  renderContent: "writable",
  updateLevelProgressUI: "writable",
  setAllStepsChecked: "writable",
  syncLevelFromSteps: "writable",
  attachClickHandlers: "writable",

  // js/12-progress.js
  countLevels: "writable",
  updateProgress: "writable",
  celebrations: "writable",
  loadCelebrations: "writable",
  saveCelebrations: "writable",
  showCelebration: "writable",
  checkCelebrations: "writable",

  // js/13-filters.js
  applyFilters: "writable",
  attachSearch: "writable",

  // js/14-welcome.js
  showWelcomeIfFirstVisit: "writable",
  pendingFramework: "writable",
  pendingBackend: "writable",
  pendingLang: "writable",
  pendingMode: "writable",
  pendingStyle: "writable",
  pendingProjName: "writable",
  setWelcomeStep: "writable",
  updateWelcomeProjNameCta: "writable",
  setHelpLangSwitchVisible: "writable",
  applyHelpDisplayLang: "writable",
  closeHelpModal: "writable",

  // js/15-projects.js
  applyFrameworkUI: "writable",
  applyBackendUI: "writable",
  setProjFwTab: "writable",
  renderProjectList: "writable",
  updateProjAddButtonState: "writable",
  pendingNewProjFw: "writable",
  pendingNewProjBe: "writable",
  resetProjAddForm: "writable",
  updateProjAddCreateState: "writable",
  showProjAddError: "writable",
  pendingDeleteId: "writable",
  pendingDeletedName: "writable",
  openProjPickNextModal: "writable",
  clearBackendMarks: "writable",
  /* projfwResetUi is created lazily in js/18-app.js (the script that
     declares it loads after js/15-projects.js), then accessed inside
     setProjFwTab in js/15-projects.js at user-click time. */
  projfwResetUi: "writable",

  // js/16-presentation.js
  presentationIndex: "writable",
  getPresentableCategories: "writable",
  enterPresentation: "writable",
  exitPresentation: "writable",
  showPresentationCategory: "writable",
  updatePresentationContextBar: "writable",

  // js/17-install.js
  deferredInstallPrompt: "writable",
  INSTALL_DISMISS_KEY: "writable",
  showInstallBanner: "writable",
  hideInstallBanner: "writable",
  updateFloatingInstallVisibility: "writable",
  isStandaloneMode: "writable",
  isIOSDevice: "writable",
  detectPlatform: "writable",
  INSTALL_STEPS_DATA: "writable",
  getInstallSteps: "writable",
  renderInstallInstructions: "writable",

  // js/18-app.js (orchestration: toolbar wiring, reset UI, lock,
  // mobile actions toggle, easter eggs, help accordion, print and
  // export/import, keyboard shortcuts, PWA manifest + service worker
  // setup IIFEs, hero level filter, hero style toggle, init sequence)
  setAllCardsFlipped: "writable",
  setupResetScopeUi: "writable",
  performReset: "writable",
  setupLongPressEasterEgg: "writable",
  enhanceHelpAccordion: "writable",
  collapseAllHelpSections: "writable",
  closeAllLvMenus: "writable",
  RESET_INDEPENDENT_SCOPES: "writable",
};

module.exports = [
  js.configs.recommended,
  {
    files: ["js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser,
        ...globals.serviceworker,
        ...projectGlobals,
      },
    },
    rules: {
      "no-unused-vars": [
        "warn",
        {
          args: "all",
          argsIgnorePattern: "^_",
          vars: "local",
          varsIgnorePattern: "^_",
          caughtErrors: "none",
        },
      ],
      "no-undef": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-var": "error",
      "prefer-const": "warn",
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-implicit-globals": "off",
      "no-redeclare": ["error", { builtinGlobals: false }],
      "no-empty": ["error", { allowEmptyCatch: true }],
      semi: ["error", "always"],
      quotes: ["warn", "double", { avoidEscape: true, allowTemplateLiterals: true }],
    },
  },
  {
    files: ["sw.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
    rules: {
      "no-unused-vars": [
        "warn",
        {
          args: "all",
          argsIgnorePattern: "^_",
          vars: "local",
          varsIgnorePattern: "^_",
          caughtErrors: "none",
        },
      ],
      "no-undef": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-var": "error",
      "prefer-const": "warn",
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-empty": ["error", { allowEmptyCatch: true }],
      semi: ["error", "always"],
    },
  },
  {
    files: ["tests/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": [
        "warn",
        {
          args: "all",
          argsIgnorePattern: "^_",
          vars: "local",
          varsIgnorePattern: "^_",
          caughtErrors: "none",
        },
      ],
      "no-undef": "error",
      "no-console": "off",
      "no-var": "error",
      "prefer-const": "warn",
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-empty": ["error", { allowEmptyCatch: true }],
      semi: ["error", "always"],
    },
  },
];
