// ── ui/board/js/tools/launcher-tool.js: Stitch System & App Launcher Card with Tabs ──

import { runSystemAction } from '../actions.js';

export function renderLauncherHTML(card) {
  const activeTab = card.data.activeTab || 'apps';
  const query = card.data.searchQuery || '';
  const clip = card.data.clipboardText || 'Click to read live clipboard';

  return `
    <header class="h-12 px-4 bg-[#dcedff] border-b border-sky-100 flex items-center justify-between cursor-grab" data-drag-handle="${card.id}">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-slate-400 text-[18px]">drag_indicator</span>
        <div class="w-6 h-6 rounded-md bg-white/70 flex items-center justify-center text-sky-800 shadow-2xs">
          <span class="material-symbols-outlined text-[16px]">grid_view</span>
        </div>
        <h2 class="font-headline-sm text-headline-sm text-slate-800 font-bold">${card.title || 'System & App Launcher'}</h2>
      </div>
      <div class="flex items-center gap-3">
        <span class="inline-block transform -rotate-2 bg-blue-100/90 text-blue-900 border border-blue-300/40 text-[10px] font-label-sm font-bold tracking-wider px-2 py-0.5 rounded-full">
          v2.4 • Active
        </span>
        <div class="flex items-center gap-1.5">
          <div class="w-2.5 h-2.5 rounded-full bg-slate-300/80 hover:bg-amber-400 transition-colors cursor-pointer" data-act="min" title="Minimize"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-slate-300/80 hover:bg-rose-400 transition-colors cursor-pointer" data-act="del" title="Close"></div>
        </div>
      </div>
    </header>

    <!-- Sub-Tabs Bar -->
    <div class="flex items-center gap-1 px-5 pt-3 border-b border-slate-100">
      <button class="launcher-tab-btn px-3 py-1 rounded-t-lg font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 ${activeTab === 'apps' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-500 hover:text-slate-800'}" data-tab="apps">
        <span class="material-symbols-outlined text-[15px]">apps</span> Apps
      </button>
      <button class="launcher-tab-btn px-3 py-1 rounded-t-lg font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 ${activeTab === 'clipboard' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-500 hover:text-slate-800'}" data-tab="clipboard">
        <span class="material-symbols-outlined text-[15px]">content_paste</span> Clipboard
      </button>
      <button class="launcher-tab-btn px-3 py-1 rounded-t-lg font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 ${activeTab === 'files' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-500 hover:text-slate-800'}" data-tab="files">
        <span class="material-symbols-outlined text-[15px]">folder_open</span> Quick Files
      </button>
    </div>

    <div class="p-5 flex flex-col gap-4">
      <!-- Search Bar -->
      <div class="relative w-full">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
        <input class="launcher-search-input w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-body-sm font-body-sm text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Search apps, files, or workflows..." type="text" value="${query}"/>
      </div>

      <!-- TAB 1: APPS GRID -->
      <div class="launcher-tab-pane ${activeTab === 'apps' ? '' : 'hidden'}" id="pane-apps">
        <div class="grid grid-cols-3 sm:grid-cols-6 gap-2.5 pt-1">
          <div class="app-tile flex flex-col items-center p-2 rounded-xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50/40 hover:shadow-sm cursor-pointer transition-all group" data-app="spotify">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span class="material-symbols-outlined text-[22px]">graphic_eq</span>
            </div>
            <span class="mt-1.5 text-body-sm font-body-sm text-slate-700 font-medium">Spotify</span>
          </div>
          <div class="app-tile flex flex-col items-center p-2 rounded-xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50/40 hover:shadow-sm cursor-pointer transition-all group" data-app="code">
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span class="material-symbols-outlined text-[22px]">terminal</span>
            </div>
            <span class="mt-1.5 text-body-sm font-body-sm text-slate-700 font-medium">VS Code</span>
          </div>
          <div class="app-tile flex flex-col items-center p-2 rounded-xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50/40 hover:shadow-sm cursor-pointer transition-all group" data-app="chrome">
            <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span class="material-symbols-outlined text-[22px]">public</span>
            </div>
            <span class="mt-1.5 text-body-sm font-body-sm text-slate-700 font-medium">Chrome</span>
          </div>
          <div class="app-tile flex flex-col items-center p-2 rounded-xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50/40 hover:shadow-sm cursor-pointer transition-all group" data-app="terminal">
            <div class="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
              <span class="material-symbols-outlined text-[20px]">drive_file_rename</span>
            </div>
            <span class="mt-1.5 text-body-sm font-body-sm text-slate-700 font-medium">Terminal</span>
          </div>
          <div class="app-tile flex flex-col items-center p-2 rounded-xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50/40 hover:shadow-sm cursor-pointer transition-all group" data-app="explorer">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span class="material-symbols-outlined text-[22px]">folder</span>
            </div>
            <span class="mt-1.5 text-body-sm font-body-sm text-slate-700 font-medium text-center truncate w-full">Explorer</span>
          </div>
          <div class="app-tile flex flex-col items-center p-2 rounded-xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50/40 hover:shadow-sm cursor-pointer transition-all group" data-app="notepad">
            <div class="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span class="material-symbols-outlined text-[22px]">description</span>
            </div>
            <span class="mt-1.5 text-body-sm font-body-sm text-slate-700 font-medium">Notepad</span>
          </div>
        </div>
      </div>

      <!-- TAB 2: CLIPBOARD PANE -->
      <div class="launcher-tab-pane ${activeTab === 'clipboard' ? '' : 'hidden'} flex flex-col gap-2.5" id="pane-clipboard">
        <div class="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/80 flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-slate-600">
              <span class="material-symbols-outlined text-[16px] text-sky-700">content_paste</span>
              <span class="font-label-sm text-label-sm uppercase tracking-wider font-semibold text-slate-700">Recent Clipboard Item</span>
            </div>
            <span class="text-[11px] text-slate-400">Captured live</span>
          </div>
          <div class="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-2xs font-label-md text-label-md text-slate-800">
            <span class="clipboard-text-display truncate pr-2">${clip}</span>
            <button class="launcher-paste-btn bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1 rounded text-body-sm font-body-sm font-medium transition-colors flex items-center gap-1 shrink-0">
              <span class="material-symbols-outlined text-[14px]">library_add</span> Paste to Canvas
            </button>
          </div>
        </div>
        <div class="flex items-center justify-between text-[11px] font-label-sm text-slate-400 px-1">
          <span>Synced with Windows Clipboard IPC</span>
          <button class="launcher-refresh-clip-btn text-primary hover:underline flex items-center gap-0.5">
            <span class="material-symbols-outlined text-[13px]">refresh</span> Read Clipboard
          </button>
        </div>
      </div>

      <!-- TAB 3: QUICK FILES PANE -->
      <div class="launcher-tab-pane ${activeTab === 'files' ? '' : 'hidden'} flex flex-col gap-1.5" id="pane-files">
        ${[
          { name: 'ui/board/index.html', desc: 'Spatial Workbench Canvas' },
          { name: 'ui/studio/index.html', desc: 'Onboarding & Companion Studio' },
          { name: 'design-system/tokens.css', desc: 'Warm Pastel Design Tokens' },
          { name: 'src/main.js', desc: 'Electron Desktop Core Host' },
        ].map((f) => `
          <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-sky-50/50 border border-slate-200/60 transition-colors">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-slate-400 text-[18px]">draft</span>
              <div>
                <p class="font-label-sm text-label-sm font-semibold text-slate-800">${f.name}</p>
                <p class="text-[11px] text-slate-500">${f.desc}</p>
              </div>
            </div>
            <button class="open-file-btn px-2 py-0.5 rounded bg-white hover:bg-primary hover:text-white border border-slate-200 text-slate-700 text-[11px] font-label-sm transition-colors" data-file="${f.name}">
              Open
            </button>
          </div>
        `).join('')}
      </div>

      <!-- Live Recent Clipboard strip across tabs -->
      ${activeTab === 'apps' ? `
        <div class="mt-1 p-3 bg-slate-50/90 rounded-xl border border-slate-200/80 flex items-center justify-between text-body-sm">
          <div class="flex items-center gap-2 truncate pr-2 text-slate-700 font-label-sm">
            <span class="material-symbols-outlined text-[15px] text-sky-700 shrink-0">content_paste</span>
            <span class="truncate">${clip}</span>
          </div>
          <button class="launcher-paste-btn bg-primary/10 hover:bg-primary/20 text-primary px-2 py-0.5 rounded text-[11px] font-label-sm font-medium transition-colors shrink-0">
            Paste
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

export function attachLauncherEvents(el, card, onSave, onToast) {
  // Tab switching
  el.querySelectorAll('.launcher-tab-btn').forEach((btn) => {
    btn.onclick = () => {
      card.data.activeTab = btn.dataset.tab;
      el.querySelectorAll('.launcher-tab-btn').forEach((b) => {
        b.className = 'launcher-tab-btn px-3 py-1 rounded-t-lg font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 text-slate-500 hover:text-slate-800';
      });
      btn.className = 'launcher-tab-btn px-3 py-1 rounded-t-lg font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 text-primary border-b-2 border-primary bg-primary/5';

      el.querySelectorAll('.launcher-tab-pane').forEach((p) => p.classList.add('hidden'));
      el.querySelector(`#pane-${card.data.activeTab}`)?.classList.remove('hidden');
      onSave?.();
    };
  });

  // App launching
  el.querySelectorAll('.app-tile').forEach((btn) => {
    btn.onclick = () => {
      const app = btn.dataset.app;
      runSystemAction('app.open', { app }, onToast);
      onToast?.(`Opening ${app.toUpperCase()}...`);
    };
  });

  // Search input
  const searchInput = el.querySelector('.launcher-search-input');
  searchInput?.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const q = searchInput.value.trim();
      if (!q) return;
      onToast?.(`Searching system for "${q}"...`);
      runSystemAction('file.search', { query: q }, onToast);
    }
  });

  // Paste / Refresh clipboard
  const readClip = async () => {
    const res = await runSystemAction('clipboard.read', {}, onToast);
    if (res?.ok && res.result?.text) {
      card.data.clipboardText = res.result.text;
      el.querySelectorAll('.clipboard-text-display').forEach((d) => d.textContent = res.result.text);
      onSave?.();
      onToast?.('Synced recent clipboard');
    } else {
      onToast?.('Clipboard text: ' + (card.data.clipboardText || 'ready'));
    }
  };

  el.querySelectorAll('.launcher-paste-btn').forEach((b) => b.onclick = readClip);
  el.querySelector('.launcher-refresh-clip-btn')?.addEventListener('click', readClip);

  // File open
  el.querySelectorAll('.open-file-btn').forEach((b) => {
    b.onclick = () => {
      onToast?.(`Opening ${b.dataset.file}...`);
      runSystemAction('file.open', { path: b.dataset.file }, onToast);
    };
  });
}
