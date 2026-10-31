// ── ui/board/js/tools/workspace-tool.js: Developer Workspace & Repository Hub ──
import { runSystemAction } from '../actions.js';

export function renderWorkspaceHTML(card) {
  const data = card.data || {};
  const branch = data.branch || 'main';
  const repo = data.repo || 'Local Workspace';
  const nodeVer = data.nodeVersion || (typeof process !== 'undefined' ? process.version : 'Active');
  const envStatus = data.platform || (navigator.platform.includes('Win') ? 'Windows Native' : 'POSIX Host');

  return `<header class="h-12 bg-secondary-container/40 border-b border-secondary-container/50 px-4 flex items-center justify-between select-none cursor-grab" data-drag-handle="${card.id}">
      <div class="flex items-center gap-2.5">
        <div class="flex items-center gap-1.5">
          <div class="w-3 h-3 rounded-full bg-rose-400/80 shadow-inner hover:opacity-80 transition-opacity cursor-pointer" data-act="del" title="Close"></div>
          <div class="w-3 h-3 rounded-full bg-amber-400/80 shadow-inner hover:opacity-80 transition-opacity cursor-pointer" data-act="min" title="Minimize"></div>
          <div class="w-3 h-3 rounded-full bg-emerald-400/80 shadow-inner hover:opacity-80 transition-opacity cursor-pointer" title="Zoom"></div>
        </div>
        <div class="flex items-center gap-1.5 ml-2">
          <span class="material-symbols-outlined text-[18px] text-indigo-600">source_environment</span>
          <h2 class="text-headline-sm font-headline-sm text-on-surface font-semibold">${card.title || 'Developer Workspace Hub'}</h2>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-indigo-100 text-indigo-800 font-medium workspace-branch-pill">Git ${branch}</span>
        <span class="material-symbols-outlined text-secondary text-[18px]">drag_indicator</span>
      </div>
    </header>

    <div class="p-5 flex flex-col gap-4 text-on-surface">
      <div class="grid grid-cols-2 gap-3">
        <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-1">
          <span class="text-label-sm text-secondary">Active Repository</span>
          <span class="font-mono font-bold text-on-surface text-sm truncate workspace-repo-name">${repo}</span>
          <span class="text-[10px] text-indigo-600 font-medium workspace-branch-desc">Branch: ${branch}</span>
        </div>

        <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-1">
          <span class="text-label-sm text-secondary">Runtime Environment</span>
          <span class="font-mono font-bold text-on-surface text-sm workspace-env-text">${envStatus}</span>
          <span class="text-[10px] text-emerald-600 font-medium workspace-node-text">Node ${nodeVer}</span>
        </div>
      </div>

      <div class="flex gap-2.5 pt-1">
        <button class="btn-open-code flex-1 py-2 px-3 rounded-xl bg-primary text-white text-body-sm font-medium hover:bg-primary/90 active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer" title="Open workspace in Cursor / VS Code">
          <span class="material-symbols-outlined text-[16px]">code</span>
          <span>Open in Editor</span>
        </button>
        <button class="btn-git-status flex-1 py-2 px-3 rounded-xl bg-surface-container-high text-on-surface text-body-sm font-medium hover:bg-surface-container-highest active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer" title="Open PowerShell terminal in workspace root">
          <span class="material-symbols-outlined text-[16px]">terminal</span>
          <span>Open Terminal</span>
        </button>
      </div>
    </div>`;
}

export function attachWorkspaceEvents(el, card, onSave, onToast) {
  el.querySelector('.btn-open-code')?.addEventListener('click', async () => {
    onToast?.('Launching code editor in workspace root...');
    const res = await runSystemAction('app.open', { name: 'code' }, onToast);
    if (res?.ok) onToast?.('✓ Code editor launched in project root');
    else onToast?.(`Notice: ${res?.error || 'Editor launched'}`);
  });

  el.querySelector('.btn-git-status')?.addEventListener('click', async () => {
    onToast?.('Launching terminal in project root...');
    const res = await runSystemAction('app.open', { name: 'terminal' }, onToast);
    if (res?.ok) onToast?.('✓ Terminal launched in project root');
    else onToast?.(`Notice: ${res?.error || 'Terminal launched'}`);
  });
}
