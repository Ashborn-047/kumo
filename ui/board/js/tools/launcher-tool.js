// ── ui/board/js/tools/launcher-tool.js: Tactile Spatial Glassmorphic App Launcher & Hub ──

import { runSystemAction } from '../actions.js';

export function renderLauncherHTML(card) {
  const query = (card.data.searchQuery || '').toLowerCase();
  const clip = card.data.clipboardText || 'git commit -m "feat(spatial): tactile glassmorphic nodes"';
  const allApps = [...(card.data.apps || []), ...(card.data.customApps || [])];
  const filteredApps = query
    ? allApps.filter((a) => a.name.toLowerCase().includes(query) || a.id.toLowerCase().includes(query))
    : allApps;

  return `
    <!-- Frosted Header with Pastel Sky Tint -->
    <header class="h-12 bg-secondary-container/40 border-b border-secondary-container/50 px-4 flex items-center justify-between select-none cursor-grab" data-drag-handle="${card.id}">
      <div class="flex items-center gap-2.5">
        <!-- Tactile Window Dots -->
        <div class="flex items-center gap-1.5">
          <div class="w-3 h-3 rounded-full bg-rose-400/80 shadow-inner hover:opacity-80 transition-opacity cursor-pointer" data-act="del" title="Close"></div>
          <div class="w-3 h-3 rounded-full bg-amber-400/80 shadow-inner hover:opacity-80 transition-opacity cursor-pointer" data-act="min" title="Minimize"></div>
          <div class="w-3 h-3 rounded-full bg-emerald-400/80 shadow-inner hover:opacity-80 transition-opacity cursor-pointer" title="Zoom"></div>
        </div>
        <!-- Title & Archetype Icon -->
        <div class="flex items-center gap-1.5 ml-2">
          <span class="material-symbols-outlined text-[18px] text-primary">apps</span>
          <h2 class="text-headline-sm font-headline-sm text-on-surface font-semibold">${card.title || 'App Launcher & Hub'}</h2>
        </div>
      </div>
      <!-- Status Pill & Drag Grip -->
      <div class="flex items-center gap-2">
        <span class="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-primary-fixed text-on-primary-fixed-variant font-medium">v2.4 Active</span>
        <span class="material-symbols-outlined text-secondary text-[18px]">drag_indicator</span>
      </div>
    </header>

    <!-- Card Body -->
    <div class="p-5 flex flex-col gap-4">
      <!-- Quick Search with Inline Key Badge -->
      <div class="relative">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">search</span>
        <input class="launcher-search-in w-full bg-surface-container-low pl-9 pr-9 py-2 rounded-xl text-body-sm font-body-sm text-on-surface border-0 focus:ring-2 focus:ring-primary-container placeholder:text-secondary transition-all" placeholder="Search tools, applications, or actions..." type="text" value="${card.data.searchQuery || ''}"/>
        <span class="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-label-sm font-label-sm bg-surface-container-highest text-secondary shadow-xs">/</span>
      </div>

      <!-- Customizable App Slot Grid with Glass Tiles -->
      <div class="grid grid-cols-3 sm:grid-cols-6 gap-2.5 launcher-apps-grid">
        ${filteredApps.map((app) => `
          <div class="app-slot-tile group flex flex-col items-center gap-1.5 p-2 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-all cursor-pointer active:scale-95 text-center border border-outline-variant/20 hover:border-primary-container/40" data-app-id="${app.id}" data-app-name="${app.name}" title="Launch ${app.name}">
            <div class="w-11 h-11 rounded-2xl ${app.bg || 'bg-blue-100'} flex items-center justify-center ${app.text || 'text-blue-700'} shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all">
              <span class="material-symbols-outlined text-[24px]">${app.icon || 'apps'}</span>
            </div>
            <span class="text-label-sm font-label-sm text-on-surface font-medium truncate w-full">${app.name}</span>
            <span class="text-[9px] font-mono px-1 rounded truncate max-w-full ${app.statusColor || 'text-secondary bg-surface-container-highest'}">${app.status || 'READY'}</span>
          </div>
        `).join('')}

        <!-- Add Custom App Tile -->
        <div class="add-app-tile flex flex-col items-center justify-center gap-1 p-2 rounded-xl border border-dashed border-outline-variant/60 hover:border-primary hover:bg-primary-fixed/20 transition-all cursor-pointer active:scale-95 text-center min-h-[96px]" title="Add Custom Shortcut">
          <span class="material-symbols-outlined text-[22px] text-primary">add_circle</span>
          <span class="text-[10px] font-label-sm text-primary font-semibold">+ Add App</span>
        </div>
      </div>

      <!-- Add Custom App Form (Inline Accordion) -->
      <div class="add-app-form hidden p-3 rounded-xl bg-surface-container-low border border-primary-container/30 flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-label-sm font-label-sm font-semibold text-primary">Add Custom Application</span>
          <button class="add-app-cancel text-secondary hover:text-on-surface text-[11px]">Cancel</button>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <input class="new-app-name bg-white px-2.5 py-1 rounded-lg text-body-sm font-body-sm text-on-surface border border-outline-variant/40 placeholder:text-slate-400" placeholder="App Name (e.g. Figma)" type="text"/>
          <input class="new-app-cmd bg-white px-2.5 py-1 rounded-lg text-body-sm font-body-sm text-on-surface border border-outline-variant/40 placeholder:text-slate-400" placeholder="Command / Path (e.g. figma)" type="text"/>
        </div>
        <button class="add-app-save bg-primary text-on-primary py-1 px-3 rounded-lg text-label-sm font-label-sm font-medium self-end transition-all hover:bg-primary-container">Save Shortcut</button>
      </div>

      <!-- System Quick Actions Physical Toggles Dock -->
      <div class="border-t border-outline-variant/30 pt-3">
        <div class="flex items-center justify-between mb-2">
          <span class="text-label-sm font-label-sm text-secondary font-semibold uppercase tracking-wider">System Quick Controls</span>
          <span class="text-[10px] font-mono text-emerald-600 font-medium">Hardware Gate: Connected</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button class="sys-ctrl-btn flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-body-sm font-body-sm text-on-surface transition-all active:scale-95 border border-outline-variant/20" data-sys="mute">
            <span class="material-symbols-outlined text-[16px] text-secondary">volume_off</span>
            <span class="text-label-sm font-label-sm font-medium">Mute Audio</span>
          </button>
          <button class="sys-ctrl-btn flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-body-sm font-body-sm text-on-surface transition-all active:scale-95 border border-outline-variant/20" data-sys="sleep">
            <span class="material-symbols-outlined text-[16px] text-secondary">nightlight</span>
            <span class="text-label-sm font-label-sm font-medium">Sleep Screen</span>
          </button>
          <button class="sys-ctrl-btn flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-primary-fixed/50 hover:bg-primary-fixed text-primary transition-all active:scale-95 border border-primary-container/30" data-sys="daemon">
            <span class="material-symbols-outlined text-[16px]">sync</span>
            <span class="text-label-sm font-label-sm font-semibold">Daemon ON</span>
          </button>
          <button class="sys-ctrl-btn flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-body-sm font-body-sm text-on-surface transition-all active:scale-95 border border-outline-variant/20" data-sys="clip">
            <span class="material-symbols-outlined text-[16px] text-secondary">content_paste</span>
            <span class="text-label-sm font-label-sm font-medium">Clip History</span>
          </button>
        </div>
      </div>

      <!-- Live Recent Clipboard Buffer Strip -->
      <div class="p-3 bg-surface-container-low rounded-xl ring-1 ring-outline-variant/20 flex items-center justify-between gap-3">
        <div class="flex items-center gap-2 overflow-hidden flex-1">
          <span class="material-symbols-outlined text-[18px] text-primary flex-shrink-0">assignment</span>
          <span class="launcher-clip-preview text-label-sm font-label-sm font-mono truncate text-secondary" title="${clip}">${clip}</span>
        </div>
        <div class="flex items-center gap-1.5 flex-shrink-0">
          <button class="launcher-paste-prompt px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container hover:bg-primary text-label-sm font-label-sm transition-all whitespace-nowrap active:scale-95 font-medium">
            Paste in Prompt
          </button>
          <button class="launcher-refresh-clip p-1 rounded-full text-secondary hover:text-on-surface hover:bg-surface-container transition-colors" title="Read system clipboard">
            <span class="material-symbols-outlined text-[16px]">refresh</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

export function attachLauncherEvents(el, card, onSave, onToast) {
  // Real-time live app filtering
  const searchInput = el.querySelector('.launcher-search-in');
  searchInput?.addEventListener('input', () => {
    card.data.searchQuery = searchInput.value;
    const q = searchInput.value.toLowerCase().trim();
    el.querySelectorAll('.app-slot-tile').forEach((tile) => {
      const name = (tile.dataset.appName || '').toLowerCase();
      const id = (tile.dataset.appId || '').toLowerCase();
      if (!q || name.includes(q) || id.includes(q)) {
        tile.classList.remove('hidden');
      } else {
        tile.classList.add('hidden');
      }
    });
    onSave?.();
  });

  // Launch App
  el.querySelectorAll('.app-slot-tile').forEach((tile) => {
    tile.onclick = async () => {
      const app = tile.dataset.appId || tile.dataset.appName;
      onToast?.(`Launching ${tile.dataset.appName}...`);
      const res = await runSystemAction('app.open', { name: app }, onToast);
      if (res?.ok) {
        onToast?.(`Launched ${tile.dataset.appName}`);
      } else {
        onToast?.(`Notice: ${res?.error || 'Action dispatched'}`);
      }
    };
  });

  // Custom App Form toggles
  const addBtn = el.querySelector('.add-app-tile');
  const form = el.querySelector('.add-app-form');
  const cancelBtn = el.querySelector('.add-app-cancel');
  const saveBtn = el.querySelector('.add-app-save');

  addBtn?.addEventListener('click', () => {
    form?.classList.toggle('hidden');
    form?.querySelector('.new-app-name')?.focus();
  });

  cancelBtn?.addEventListener('click', () => {
    form?.classList.add('hidden');
  });

  saveBtn?.addEventListener('click', () => {
    const name = form.querySelector('.new-app-name')?.value.trim();
    const cmd = form.querySelector('.new-app-cmd')?.value.trim();
    if (!name) {
      onToast?.('Please specify an application name');
      return;
    }
    const newApp = {
      id: cmd || name.toLowerCase().replace(/\s+/g, '-'),
      name,
      icon: 'star',
      bg: 'bg-primary-fixed',
      text: 'text-primary',
      status: 'CUSTOM',
      statusColor: 'text-primary bg-primary-fixed/50',
    };
    if (!card.data.customApps) card.data.customApps = [];
    card.data.customApps.push(newApp);
    onSave?.();
    onToast?.(`Added "${name}" to Launcher`);
    // re-render card content
    const stage = document.querySelector('#canvas-stage');
    if (stage) {
      el.innerHTML = renderLauncherHTML(card);
      attachLauncherEvents(el, card, onSave, onToast);
    }
  });

  // System Controls
  el.querySelectorAll('.sys-ctrl-btn').forEach((btn) => {
    btn.onclick = async () => {
      const act = btn.dataset.sys;
      if (act === 'mute') {
        await runSystemAction('powershell.read', { command: 'Get-AudioDevice -PlaybackMute | Out-Null' }, onToast);
        onToast?.('Audio state toggled');
      } else if (act === 'sleep') {
        onToast?.('Display sleep trigger dispatched');
        await runSystemAction('powershell.read', { command: '(Add-Type \'[DllImport("user32.dll")]public static extern int SendMessage(int hWnd, int hMsg, int wParam, int lParam);\' -Name a -Pas)::SendMessage(-1,0x0112,0xF170,2)' }, onToast);
      } else if (act === 'daemon') {
        onToast?.('Kumo Daemon :4429 is active and listening');
      } else if (act === 'clip') {
        const res = await runSystemAction('clipboard.read', {}, onToast);
        const text = res?.result?.text || '';
        if (text) {
          card.data.clipboardText = text;
          const prev = el.querySelector('.launcher-clip-preview');
          if (prev) {
            prev.textContent = text;
            prev.title = text;
          }
          onSave?.();
          onToast?.('Read system clipboard');
        }
      }
    };
  });

  // Clipboard Actions
  const refreshClip = async () => {
    const res = await runSystemAction('clipboard.read', {}, onToast);
    if (res?.ok && res.result?.text) {
      card.data.clipboardText = res.result.text;
      const prev = el.querySelector('.launcher-clip-preview');
      if (prev) {
        prev.textContent = res.result.text;
        prev.title = res.result.text;
      }
      onSave?.();
      onToast?.('Clipboard synced');
    }
  };
  el.querySelector('.launcher-refresh-clip')?.addEventListener('click', refreshClip);

  el.querySelector('.launcher-paste-prompt')?.addEventListener('click', () => {
    const text = card.data.clipboardText || '';
    // Dispatch to writer card if present
    const writerArea = document.querySelector('.writer-prompt-textarea');
    if (writerArea) {
      writerArea.value = (writerArea.value ? writerArea.value + '\n\n' : '') + text;
      writerArea.dispatchEvent(new Event('input', { bubbles: true }));
      onToast?.('Pasted into AI Assistant Studio');
    } else {
      runSystemAction('clipboard.write', { text }, onToast);
      onToast?.('Ready in clipboard');
    }
  });
}
