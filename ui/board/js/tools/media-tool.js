// ── ui/board/js/tools/media-tool.js: Spotify & Media Orchestrator Hub ──
import { runSystemAction } from '../actions.js';

export function renderMediaHTML(card) {
  const data = card.data || {};
  const isPlaying = data.isPlaying || false;
  const track = data.track || 'Media Controller Idle';
  const artist = data.artist || 'Spotify / System Media • Click Play or Launch App';

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
        <span class="px-2 py-0.5 rounded-full text-label-sm font-label-sm ${isPlaying ? 'bg-emerald-100 text-emerald-800' : 'bg-surface-container-highest text-secondary'} font-medium media-status-pill">${isPlaying ? 'Playing' : 'Ready'}</span>
        <span class="material-symbols-outlined text-secondary text-[18px]">drag_indicator</span>
      </div>
    </header>

    <div class="p-5 flex flex-col gap-4 text-on-surface">
      <div class="flex items-center gap-3.5 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
        <div class="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md flex-none">
          <span class="material-symbols-outlined text-[24px]">music_note</span>
        </div>
        <div class="flex flex-col min-w-0 flex-1">
          <span class="font-semibold text-body-md truncate media-track-title">${track}</span>
          <span class="text-label-sm text-secondary truncate media-artist-title">${artist}</span>
        </div>
      </div>

      <div class="flex items-center justify-center gap-3 pt-1">
        <button class="btn-prev w-10 h-10 rounded-full bg-surface-container-high hover:bg-surface-container-highest active:scale-95 flex items-center justify-center transition-all cursor-pointer" title="Previous Track">
          <span class="material-symbols-outlined text-[20px]">skip_previous</span>
        </button>
        <button class="btn-play w-12 h-12 rounded-full bg-primary text-white hover:bg-primary/90 active:scale-95 flex items-center justify-center shadow-md transition-all cursor-pointer" title="Play / Pause">
          <span class="material-symbols-outlined text-[24px] play-pause-icon">${isPlaying ? 'pause' : 'play_arrow'}</span>
        </button>
        <button class="btn-next w-10 h-10 rounded-full bg-surface-container-high hover:bg-surface-container-highest active:scale-95 flex items-center justify-center transition-all cursor-pointer" title="Next Track">
          <span class="material-symbols-outlined text-[20px]">skip_next</span>
        </button>
        <button class="btn-focus-spotify ml-auto px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-label-sm font-semibold hover:bg-emerald-100 transition-all flex items-center gap-1 cursor-pointer">
          <span class="material-symbols-outlined text-[14px]">open_in_new</span>
          <span>Spotify</span>
        </button>
      </div>
    </div>`;
}

export function attachMediaEvents(el, card, onSave, onToast) {
  async function refreshMedia() {
    try {
      const res = await runSystemAction('media.status');
      if (res?.ok && res?.result) {
        const { isPlaying, artist, track } = res.result;
        card.data.isPlaying = isPlaying;
        if (track) card.data.track = track;
        if (artist) card.data.artist = artist;

        const trackEl = el.querySelector('.media-track-title');
        const artistEl = el.querySelector('.media-artist-title');
        const icon = el.querySelector('.play-pause-icon');
        const pill = el.querySelector('.media-status-pill');

        if (trackEl && card.data.track) trackEl.textContent = card.data.track;
        if (artistEl && card.data.artist) artistEl.textContent = card.data.artist;
        if (icon) icon.textContent = isPlaying ? 'pause' : 'play_arrow';
        if (pill) {
          pill.textContent = isPlaying ? 'Playing' : 'Ready';
          pill.className = `px-2 py-0.5 rounded-full text-label-sm font-label-sm ${isPlaying ? 'bg-emerald-100 text-emerald-800' : 'bg-surface-container-highest text-secondary'} font-medium media-status-pill`;
        }
      }
    } catch (_) {}
  }

  // Initial poll on mount
  refreshMedia();

  el.querySelector('.btn-play')?.addEventListener('click', async () => {
    card.data.isPlaying = !card.data.isPlaying;
    if (card.data.isPlaying && (!card.data.track || card.data.track === 'Media Controller Idle')) {
      card.data.track = 'Streaming Media Session';
      card.data.artist = 'System Audio Stream Active';
    }
    const icon = el.querySelector('.play-pause-icon');
    if (icon) icon.textContent = card.data.isPlaying ? 'pause' : 'play_arrow';
    const pill = el.querySelector('.media-status-pill');
    if (pill) {
      pill.textContent = card.data.isPlaying ? 'Playing' : 'Ready';
      pill.className = `px-2 py-0.5 rounded-full text-label-sm font-label-sm ${card.data.isPlaying ? 'bg-emerald-100 text-emerald-800' : 'bg-surface-container-highest text-secondary'} font-medium media-status-pill`;
    }
    await runSystemAction('media.playPause', {}, onToast);
    onSave?.();
    onToast?.(card.data.isPlaying ? '▶ Playback started' : '⏸ Playback paused');
    setTimeout(refreshMedia, 600);
  });

  el.querySelector('.btn-next')?.addEventListener('click', async () => {
    await runSystemAction('media.next', {}, onToast);
    onToast?.('⏭ Next track signal dispatched');
    setTimeout(refreshMedia, 600);
  });

  el.querySelector('.btn-prev')?.addEventListener('click', async () => {
    await runSystemAction('media.previous', {}, onToast);
    onToast?.('⏮ Previous track signal dispatched');
    setTimeout(refreshMedia, 600);
  });

  el.querySelector('.btn-focus-spotify')?.addEventListener('click', async () => {
    onToast?.('Opening Spotify client...');
    await runSystemAction('app.open', { name: 'spotify' }, onToast);
    setTimeout(refreshMedia, 1200);
  });
}
