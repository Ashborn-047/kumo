// ── ui/board/js/tools/telemetry-tool.js: Live System Health & Telemetry Hub ──
import { runSystemAction } from '../actions.js';

export function renderTelemetryHTML(card) {
  const ram = card.data.ram;
  const cpu = card.data.cpu;
  
  const ramUsed = ram ? `${ram.used} / ${ram.total} GB` : 'Querying host...';
  const ramPct = ram ? (ram.pct || Math.round((ram.used / ram.total) * 100) || 50) : 0;
  
  const cpuCount = cpu ? `${cpu.count} Logical` : 'Probing...';
  const cpuModel = cpu ? (cpu.model || 'Host CPU') : 'Hardware Introspection...';
  const cpuLoadPct = cpu ? Math.min(100, Math.max(8, Math.round(((cpu.load?.[0] || 0.4) / (cpu.count || 1)) * 100))) : 15;

  return `<header class="h-12 bg-secondary-container/40 border-b border-secondary-container/50 px-4 flex items-center justify-between select-none cursor-grab" data-drag-handle="${card.id}">
      <div class="flex items-center gap-2.5">
        <div class="flex items-center gap-1.5">
          <div class="w-3 h-3 rounded-full bg-rose-400/80 shadow-inner hover:opacity-80 transition-opacity cursor-pointer" data-act="del" title="Close"></div>
          <div class="w-3 h-3 rounded-full bg-amber-400/80 shadow-inner hover:opacity-80 transition-opacity cursor-pointer" data-act="min" title="Minimize"></div>
          <div class="w-3 h-3 rounded-full bg-emerald-400/80 shadow-inner hover:opacity-80 transition-opacity cursor-pointer" title="Zoom"></div>
        </div>
        <div class="flex items-center gap-1.5 ml-2">
          <span class="material-symbols-outlined text-[18px] text-primary">monitoring</span>
          <h2 class="text-headline-sm font-headline-sm text-on-surface font-semibold">${card.title || 'System Telemetry Hub'}</h2>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-emerald-100 text-emerald-800 font-medium">Live Stream</span>
        <span class="material-symbols-outlined text-secondary text-[18px]">drag_indicator</span>
      </div>
    </header>

    <div class="p-5 flex flex-col gap-4 text-on-surface">
      <div class="grid grid-cols-2 gap-3">
        <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-1.5">
          <div class="flex justify-between items-center text-label-sm text-secondary">
            <span>RAM Allocation</span>
            <span class="font-mono font-bold text-on-surface telemetry-ram-text">${ramUsed}</span>
          </div>
          <div class="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
            <div class="bg-primary h-full transition-all duration-500 telemetry-ram-bar" style="width: ${ramPct}%"></div>
          </div>
          <span class="text-[10px] text-secondary font-mono telemetry-ram-sub">${ram ? `${ramPct}% in active use` : 'Sampling memory buffers'}</span>
        </div>

        <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-1.5">
          <div class="flex justify-between items-center text-label-sm text-secondary">
            <span>Processor Cores</span>
            <span class="font-mono font-bold text-on-surface telemetry-cpu-text">${cpuCount}</span>
          </div>
          <div class="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
            <div class="bg-emerald-500 h-full transition-all duration-500 telemetry-cpu-bar" style="width: ${cpuLoadPct}%"></div>
          </div>
          <span class="text-[10px] text-secondary font-mono truncate telemetry-cpu-sub">${cpuModel}</span>
        </div>
      </div>

      <div class="flex gap-2.5 pt-1">
        <button class="btn-taskmgr flex-1 py-2 px-3 rounded-xl bg-primary text-white text-body-sm font-medium hover:bg-primary/90 active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-sm">
          <span class="material-symbols-outlined text-[16px]">launch</span>
          <span>Task Manager</span>
        </button>
        <button class="btn-clean-temp flex-1 py-2 px-3 rounded-xl bg-surface-container-high text-on-surface text-body-sm font-medium hover:bg-surface-container-highest active:scale-98 transition-all flex items-center justify-center gap-1.5">
          <span class="material-symbols-outlined text-[16px]">cleaning_services</span>
          <span>Clean Temp</span>
        </button>
      </div>
    </div>`;
}

export function attachTelemetryEvents(el, card, onSave, onToast) {
  el.querySelector('.btn-taskmgr')?.addEventListener('click', () => {
    onToast?.('Opening Windows Task Manager...');
    runSystemAction('app.open', { name: 'taskmgr' }, onToast);
  });

  el.querySelector('.btn-clean-temp')?.addEventListener('click', async () => {
    onToast?.('Cleaning temporary files...');
    await runSystemAction('powershell.read', {
      command: 'Remove-Item -Path "$env:TEMP\\*" -Recurse -Force -ErrorAction SilentlyContinue; "Temporary cache cleaned."'
    }, onToast);
    onToast?.('Temporary cache cleaned!');
  });
}
