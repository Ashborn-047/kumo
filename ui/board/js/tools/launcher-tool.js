import { runSystemAction } from '../actions.js';

export function renderLauncherHTML(card) {
  const query = (card.data.searchQuery || '').toLowerCase();
  const activeCategory = card.data.activeCategory || 'all';
  const allApps = (card.data.scannedApps && card.data.scannedApps.length > 0) ? card.data.scannedApps : [...(card.data.apps || []), ...(card.data.customApps || [])];
  
  const filteredApps = allApps.filter((a) => {
    const matchesCategory = activeCategory === 'all' || a.rawCategory === activeCategory;
    const matchesQuery = !query || a.name.toLowerCase().includes(query) || a.id.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'media', label: 'Media' },
    { id: 'development', label: 'Dev' },
    { id: 'communication', label: 'Chat' },
    { id: 'productivity', label: 'Work' },
    { id: 'creative', label: 'Design' },
    { id: 'system', label: 'System' },
  ];

  return `<header class="h-12 bg-secondary-container/40 border-b border-secondary-container/50 px-4 flex items-center justify-between select-none cursor-grab" data-drag-handle="${card.id}">
      <div class="flex items-center gap-2.5">
        <div class="flex items-center gap-1.5">
          <div class="w-3 h-3 rounded-full bg-rose-400/80 shadow-inner hover:opacity-80 transition-opacity cursor-pointer" data-act="del" title="Close"></div>
          <div class="w-3 h-3 rounded-full bg-amber-400/80 shadow-inner hover:opacity-80 transition-opacity cursor-pointer" data-act="min" title="Minimize"></div>
          <div class="w-3 h-3 rounded-full bg-emerald-400/80 shadow-inner hover:opacity-80 transition-opacity cursor-pointer" title="Zoom"></div>
        </div>
        <div class="flex items-center gap-1.5 ml-2">
          <span class="material-symbols-outlined text-[18px] text-primary">apps</span>
          <h2 class="text-headline-sm font-headline-sm text-on-surface font-semibold">${card.title || 'App Launcher & Hub'}</h2>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-primary-fixed text-on-primary-fixed-variant font-medium">${allApps.length} Apps</span>
        <span class="material-symbols-outlined text-secondary text-[18px]">drag_indicator</span>
      </div>
    </header>

    <div class="p-4 flex flex-col gap-3 text-on-surface">
      <div class="relative">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">search</span>
        <input class="launcher-search-in w-full bg-surface-container-low pl-9 pr-9 py-1.5 rounded-xl text-body-sm font-body-sm text-on-surface border-0 focus:ring-2 focus:ring-primary-container placeholder:text-secondary transition-all" placeholder="Search ${allApps.length} applications..." type="text" value="${card.data.searchQuery || ''}"/>
        <span class="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-label-sm font-label-sm bg-surface-container-highest text-secondary shadow-xs">/</span>
      </div>

      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-label-sm no-scrollbar">
        ${categories.map(c => `<button class="launcher-cat-pill px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${activeCategory === c.id ? 'bg-primary text-white shadow-xs' : 'bg-surface-container-low text-secondary hover:bg-surface-container-high'}" data-category="${c.id}">${c.label}</button>`).join('')}
      </div>

      <div class="grid grid-cols-4 sm:grid-cols-6 gap-2 launcher-apps-grid max-h-[220px] overflow-y-auto pr-1 select-none" style="scrollbar-width: thin;">
        ${filteredApps.map((app) => `<div class="app-slot-tile group flex flex-col items-center gap-1 p-2 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-all cursor-pointer active:scale-95 text-center border border-outline-variant/20 hover:border-primary-container/40" data-app-id="${app.id}" data-app-name="${app.name}" title="Launch ${app.name}"><div class="w-9 h-9 rounded-xl ${app.bg || 'bg-blue-100'} flex items-center justify-center ${app.text || 'text-blue-700'} shadow-xs group-hover:scale-105 transition-all"><span class="material-symbols-outlined text-[20px]">${app.icon || 'apps'}</span></div><span class="text-[11px] font-medium text-on-surface truncate w-full">${app.name}</span></div>`).join('')}
        ${filteredApps.length === 0 ? '<div class="col-span-6 py-6 text-center text-secondary text-body-sm">No applications found</div>' : ''}
      </div>

      <div class="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-label-sm text-secondary">
        <div class="flex items-center gap-2">
          <button class="sys-ctrl-btn px-2.5 py-1 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center gap-1 active:scale-95 transition-all" data-sys="mute">
            <span class="material-symbols-outlined text-[14px]">volume_off</span>
            <span>Mute</span>
          </button>
          <button class="sys-ctrl-btn px-2.5 py-1 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center gap-1 active:scale-95 transition-all" data-sys="clip">
            <span class="material-symbols-outlined text-[14px]">content_paste</span>
            <span>Clipboard</span>
          </button>
        </div>
        <span class="text-[10px] font-mono text-emerald-600">● Discovered Apps</span>
      </div>
    </div>`;
}

export function attachLauncherEvents(el, card, onSave, onToast) {
  // Category pill switcher
  el.querySelectorAll('.launcher-cat-pill').forEach((btn) => {
    btn.onclick = () => {
      card.data.activeCategory = btn.dataset.category;
      onSave?.();
      const stage = document.querySelector('#canvas-stage');
      if (stage) {
        el.innerHTML = renderLauncherHTML(card);
        attachLauncherEvents(el, card, onSave, onToast);
      }
    };
  });
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
      const appName = tile.dataset.appName;
      const appId = tile.dataset.appId;
      onToast?.(`Launching ${appName}...`);
      const res = await runSystemAction('app.open', { name: appName, appId }, onToast);
      if (res?.ok) {
        onToast?.(`✓ Launched ${appName}`);
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


// Dynamically populate scanned host apps from system-scanner
export async function syncScannedApps(card, onRerender) {
  if (window.goo && window.goo.getCapabilities) {
    try {
      const caps = await window.goo.getCapabilities();
      if (caps && caps.categories) {
        const discovered = [];
        const domainColors = {
          media: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'music_note' },
          development: { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: 'terminal' },
          communication: { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'chat' },
          productivity: { bg: 'bg-amber-100', text: 'text-amber-700', icon: 'edit_note' },
          creative: { bg: 'bg-purple-100', text: 'text-purple-700', icon: 'palette' },
          system: { bg: 'bg-slate-100', text: 'text-slate-700', icon: 'settings' },
        };

        Object.entries(caps.categories).forEach(([category, list]) => {
          const style = domainColors[category] || { bg: 'bg-slate-100', text: 'text-slate-700', icon: 'apps' };
          (list || []).forEach(item => {
            discovered.push({
              id: item.appId || item.id || item.name,
              name: item.name,
              category: item.categoryLabel || category,
              rawCategory: category,
              icon: style.icon,
              bg: style.bg,
              text: style.text,
              status: item.allowed ? 'READY' : 'BLOCKED',
              statusColor: item.allowed ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
            });
          });
        });

        if (discovered.length > 0) {
          card.data.scannedApps = discovered;
          if (onRerender) onRerender();
        }
      }
    } catch (err) {
      console.warn('Failed to sync scanned apps:', err);
    }
  }
}