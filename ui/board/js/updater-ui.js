// ============================================================
// ui/board/js/updater-ui.js — Kumo Live In-App Update Banner
// Displays discreet, glassmorphic update notifications & progress
// ============================================================

export function initUpdaterUI() {
  const updater = window.kumoUpdater || (window.goo ? {
    getStatus: () => window.goo.updaterGetStatus(),
    checkForUpdates: () => window.goo.updaterCheck(),
    quitAndInstall: () => window.goo.updaterQuitAndInstall(),
    openReleasePage: (url) => window.goo.updaterOpenRelease(url),
    onStatusChanged: (cb) => window.goo.onUpdaterStatus(cb),
    onAvailable: (cb) => window.goo.onUpdaterAvailable(cb),
    onProgress: (cb) => window.goo.onUpdaterProgress(cb),
    onDownloaded: (cb) => window.goo.onUpdaterDownloaded(cb),
  } : null);

  if (!updater) return;

  // Create UI Container if not already present
  let container = document.getElementById('kumo-update-banner');
  if (!container) {
    container = document.createElement('div');
    container.id = 'kumo-update-banner';
    container.className = 'fixed bottom-6 right-6 z-[9999] transition-all duration-300 transform translate-y-24 opacity-0 pointer-events-none';
    container.innerHTML = `
      <div class="flex items-center gap-3.5 px-4 py-3 bg-surface-container-lowest/90 dark:bg-inverse-surface/90 backdrop-blur-md border border-outline-variant/30 rounded-2xl shadow-xl text-on-surface dark:text-inverse-on-surface max-w-sm">
        <div class="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
          <span class="material-symbols-outlined text-[20px]" id="kumo-update-icon">cloud_download</span>
        </div>
        <div class="flex-1 min-w-0 pr-1">
          <div class="flex items-center gap-1.5">
            <span class="font-headline-sm text-[13px] font-bold text-on-surface dark:text-inverse-on-surface" id="kumo-update-title">Update Available</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-primary/10 text-primary font-mono font-semibold" id="kumo-update-version">v0.2.0</span>
          </div>
          <p class="text-[11px] text-on-surface-variant dark:text-outline-variant truncate mt-0.5" id="kumo-update-desc">Downloading update in background...</p>
          <div class="w-full bg-outline-variant/20 h-1.5 rounded-full mt-2 overflow-hidden hidden" id="kumo-update-progress-bar">
            <div class="bg-primary h-full transition-all duration-200 rounded-full" id="kumo-update-progress-fill" style="width: 0%"></div>
          </div>
        </div>
        <div class="flex items-center gap-1.5 flex-shrink-0" id="kumo-update-actions">
          <button id="kumo-btn-update-action" type="button" class="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-sm cursor-pointer">
            Restart
          </button>
          <button id="kumo-btn-update-dismiss" type="button" class="p-1 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/40 rounded-lg transition-colors cursor-pointer" title="Dismiss">
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(container);
  }

  const titleEl = document.getElementById('kumo-update-title');
  const versionEl = document.getElementById('kumo-update-version');
  const descEl = document.getElementById('kumo-update-desc');
  const iconEl = document.getElementById('kumo-update-icon');
  const progressContainer = document.getElementById('kumo-update-progress-bar');
  const progressFill = document.getElementById('kumo-update-progress-fill');
  const actionBtn = document.getElementById('kumo-btn-update-action');
  const dismissBtn = document.getElementById('kumo-btn-update-dismiss');

  let isDismissed = false;

  function showBanner() {
    if (isDismissed) return;
    container.classList.remove('translate-y-24', 'opacity-0', 'pointer-events-none');
    container.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');
  }

  function hideBanner() {
    container.classList.add('translate-y-24', 'opacity-0', 'pointer-events-none');
    container.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
  }

  dismissBtn.addEventListener('click', () => {
    isDismissed = true;
    hideBanner();
  });

  // Render Status
  function updateView(state) {
    if (!state) return;

    if (state.status === 'downloading') {
      showBanner();
      iconEl.textContent = 'downloading';
      titleEl.textContent = 'Downloading Update';
      versionEl.textContent = state.info?.version ? `v${state.info.version}` : '';
      progressContainer.classList.remove('hidden');
      const percent = state.progress?.percent || 0;
      progressFill.style.width = `${percent}%`;
      descEl.textContent = `Downloading package... (${percent}%)`;
      actionBtn.classList.add('hidden');
    } else if (state.status === 'downloaded') {
      showBanner();
      iconEl.textContent = 'system_update';
      titleEl.textContent = 'Update Ready';
      versionEl.textContent = state.info?.version ? `v${state.info.version}` : '';
      progressContainer.classList.add('hidden');
      descEl.textContent = 'Restart to apply improvements';
      actionBtn.classList.remove('hidden');
      actionBtn.textContent = 'Restart Now';
      actionBtn.onclick = () => updater.quitAndInstall();
    } else if (state.status === 'available' && state.isPortable) {
      showBanner();
      iconEl.textContent = 'new_releases';
      titleEl.textContent = 'New Version Available';
      versionEl.textContent = state.info?.version ? `v${state.info.version}` : '';
      progressContainer.classList.add('hidden');
      descEl.textContent = 'Get the latest portable build';
      actionBtn.classList.remove('hidden');
      actionBtn.textContent = 'Download';
      actionBtn.onclick = () => updater.openReleasePage();
    }
  }

  // Hook listeners
  updater.onStatusChanged?.((state) => updateView(state));
  updater.onProgress?.((progress) => {
    progressContainer.classList.remove('hidden');
    progressFill.style.width = `${progress.percent || 0}%`;
    descEl.textContent = `Downloading package... (${progress.percent || 0}%)`;
  });
  updater.onDownloaded?.((info) => {
    updateView({ status: 'downloaded', info });
  });

  // Check initial status on load
  updater.getStatus?.().then((state) => {
    if (state && ['downloading', 'downloaded'].includes(state.status)) {
      updateView(state);
    }
  }).catch(() => {});
}

