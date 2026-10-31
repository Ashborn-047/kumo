// ── ui/board/js/tools/media-tool.js: Spotify & Media Orchestrator Hub ──
import { runSystemAction } from '../actions.js';

export function renderMediaHTML(card) {
  const data = card.data || {};
  const track = data.track || 'Midnight City';
  const artist = data.artist || 'M83 • Spotify Session';

  return `<header class="h-12 bg-secondary-container/40 border-b border-secondary-container/50 px-4 flex items-center justify-between select-none cursor-grab" data-drag-handle="${card.id}">
      <div class="flex items-center gap-2.5">
        <div class="flex items-center gap-1.5">
          <div class="w-3 h-3 rounded-full bg-rose-400/80 shadow-inner hover:opacity-80 transition-opacity cursor-pointer" data-act="del" title="Close"></div>
          <div class="w-3 h-3 rounded-full bg-amber-400/80 shadow-inner hover:opacity-80 transition-opacity cursor-pointer" data-act="min" title="Minimize"></div>
          <div class="w-3 h-3 rounded-full bg-emerald-400/80 shadow-inner hover:opacity-80 transition-opacity cursor-pointer" title="Zoom"></div>
        </div>
        <div class="flex items-center gap-1.5 ml-2">
          <span class="material-symbols-outlined text-[18px] text-emerald-600">graphic_eq</span>
          <h2 class="text-headline-sm font-headline-sm text-on-surface font-semibold">${card.title || 'Spotify Media Orchestrator'}</h2>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-emerald-100 text-emerald-800 font-medium">SMTC Active</span>
        <span class="material-symbols-outlined text-secondary text-[18px]">drag_indicator</span>
      </div>
    </header>

    <div class="p-5 flex flex-col gap-4 text-on-surface">
      <div class="flex items-center gap-3.5 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
        <div class="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md flex-none">
          <span class="material-symbols-outlined text-[24px]">music_note</span>
        </div>
        <div class="flex flex-col min-w-0 flex-1">
          <span class="font-semibold text-body-md truncate">${track}</span>
          <span class="text-label-sm text-secondary truncate">${artist}</span>
        </div>
      </div>

      <div class="flex items-center justify-center gap-3 pt-1">
        <button class="btn-prev w-10 h-10 rounded-full bg-surface-container-high hover:bg-surface-container-highest active:scale-95 flex items-center justify-center transition-all" title="Previous">
          <span class="material-symbols-outlined text-[20px]">skip_previous</span>
        </button>
        <button class="btn-play w-12 h-12 rounded-full bg-primary text-white hover:bg-primary/90 active:scale-95 flex items-center justify-center shadow-md transition-all" title="Play / Pause">
          <span class="material-symbols-outlined text-[24px]">play_arrow</span>
        </button>
        <button class="btn-next w-10 h-10 rounded-full bg-surface-container-high hover:bg-surface-container-highest active:scale-95 flex items-center justify-center transition-all" title="Next">
          <span class="material-symbols-outlined text-[20px]">skip_next</span>
        </button>
        <button class="btn-focus-spotify ml-auto px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-label-sm font-semibold hover:bg-emerald-100 transition-all flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">open_in_new</span>
          <span>App</span>
        </button>
      </div>
    </div>`;
}

export function attachMediaEvents(el, card, onSave, onToast) {
  el.querySelector('.btn-play')?.addEventListener('click', async () => {
    await runSystemAction('media.playPause', {}, onToast);
    onToast?.('Playback toggled');
  });

  el.querySelector('.btn-next')?.addEventListener('click', async () => {
    await runSystemAction('media.next', {}, onToast);
    onToast?.('Next track');
  });

  el.querySelector('.btn-prev')?.addEventListener('click', async () => {
    await runSystemAction('media.previous', {}, onToast);
    onToast?.('Previous track');
  });

  el.querySelector('.btn-focus-spotify')?.addEventListener('click', () => {
    runSystemAction('app.open', { name: 'spotify' }, onToast);
    onToast?.('Opening Spotify...');
  });
}