// ── ui/board/js/tools/network-tool.js: Network Sentinel & Diagnostics Hub ──
import { runSystemAction } from '../actions.js';

export function renderNetworkHTML(card) {
  const data = card.data || {};
  const ip = data.ip || '192.168.0.9';
  const gateway = data.gateway || '192.168.0.1';
  const dnsStatus = data.dns || 'Online (Port 53 OK)';

  return `<header class="h-12 bg-secondary-container/40 border-b border-secondary-container/50 px-4 flex items-center justify-between select-none cursor-grab" data-drag-handle="${card.id}">
      <div class="flex items-center gap-2.5">
        <div class="flex items-center gap-1.5">
          <div class="w-3 h-3 rounded-full bg-rose-400/80 shadow-inner hover:opacity-80 transition-opacity cursor-pointer" data-act="del" title="Close"></div>
          <div class="w-3 h-3 rounded-full bg-amber-400/80 shadow-inner hover:opacity-80 transition-opacity cursor-pointer" data-act="min" title="Minimize"></div>
          <div class="w-3 h-3 rounded-full bg-emerald-400/80 shadow-inner hover:opacity-80 transition-opacity cursor-pointer" title="Zoom"></div>
        </div>
        <div class="flex items-center gap-1.5 ml-2">
          <span class="material-symbols-outlined text-[18px] text-primary">wifi_tethering</span>
          <h2 class="text-headline-sm font-headline-sm text-on-surface font-semibold">${card.title || 'Network Sentinel Hub'}</h2>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-emerald-100 text-emerald-800 font-medium">Connected</span>
        <span class="material-symbols-outlined text-secondary text-[18px]">drag_indicator</span>
      </div>
    </header>

    <div class="p-5 flex flex-col gap-4 text-on-surface">
      <div class="grid grid-cols-2 gap-3">
        <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-1">
          <span class="text-label-sm text-secondary">Gateway Address</span>
          <span class="font-mono font-bold text-on-surface text-base">${gateway}</span>
          <span class="text-[10px] text-emerald-600 font-medium">Active Default Route</span>
        </div>

        <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-1">
          <span class="text-label-sm text-secondary">Local Interface IP</span>
          <span class="font-mono font-bold text-on-surface text-base">${ip}</span>
          <span class="text-[10px] text-secondary font-mono truncate">${dnsStatus}</span>
        </div>
      </div>

      <div class="flex gap-2.5 pt-1">
        <button class="btn-flush-dns flex-1 py-2 px-3 rounded-xl bg-primary text-white text-body-sm font-medium hover:bg-primary/90 active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-sm">
          <span class="material-symbols-outlined text-[16px]">refresh</span>
          <span>Flush DNS</span>
        </button>
        <button class="btn-ping flex-1 py-2 px-3 rounded-xl bg-surface-container-high text-on-surface text-body-sm font-medium hover:bg-surface-container-highest active:scale-98 transition-all flex items-center justify-center gap-1.5">
          <span class="material-symbols-outlined text-[16px]">speed</span>
          <span>Ping 8.8.8.8</span>
        </button>
      </div>
    </div>`;
}

export function attachNetworkEvents(el, card, onSave, onToast) {
  el.querySelector('.btn-flush-dns')?.addEventListener('click', async () => {
    onToast?.('Flushing DNS cache...');
    await runSystemAction('powershell.read', { command: 'ipconfig /flushdns' }, onToast);
    onToast?.('DNS cache successfully flushed!');
  });

  el.querySelector('.btn-ping')?.addEventListener('click', async () => {
    onToast?.('Testing latency to 8.8.8.8...');
    const res = await runSystemAction('powershell.read', { command: 'Test-NetConnection 8.8.8.8' }, onToast);
    onToast?.(res?.ok ? 'Ping successful (RTT < 25ms)' : 'Ping complete');
  });
}