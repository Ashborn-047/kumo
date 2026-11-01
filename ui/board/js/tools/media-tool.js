// ── ui/board/js/tools/media-tool.js: Universal Media, Movies, Shows & Watchlist Deck ──
import { runSystemAction } from '../actions.js';

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatTime(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

function getSourceBadge(source) {
  const s = String(source || '').toLowerCase();
  if (s.includes('prime')) {
    return { name: 'Prime Video', class: 'bg-sky-50 text-sky-700 border border-sky-200' };
  }
  if (s.includes('netflix')) {
    return { name: 'Netflix', class: 'bg-rose-50 text-rose-700 border border-rose-200' };
  }
  if (s.includes('youtube')) {
    return { name: 'YouTube', class: 'bg-red-50 text-red-700 border border-red-200' };
  }
  if (s.includes('vlc')) {
    return { name: 'VLC', class: 'bg-amber-50 text-amber-700 border border-amber-200' };
  }
  if (s.includes('spotify')) {
    return { name: 'Spotify', class: 'bg-emerald-50 text-emerald-700 border border-emerald-200' };
  }
  return { name: source || 'Stream', class: 'bg-purple-50 text-purple-700 border border-purple-200' };
}

export function renderMediaHTML(card) {
  const data = card.data || {};
  const isPlaying = Boolean(data.isPlaying);
  const track = data.track || 'Media Controller Idle';
  const artist = data.artist || 'Spotify, Prime Video, Netflix, YouTube · Click Play to start';
  const source = data.source || 'System Media';
  const mediaType = data.mediaType || (data.duration > 600 ? 'movie' : 'music');
  const stoppedAt = data.stoppedAt || formatTime(data.position || 0);
  const durationStr = formatTime(data.duration || 0);
  const progress = data.progress || (data.duration > 0 ? Math.min(100, Math.round(((data.position || 0) / data.duration) * 100)) : 0);

  // Backward-compatible merge for pinnedMedia and pinnedSongs
  let pinnedMedia = Array.isArray(data.pinnedMedia) ? data.pinnedMedia : (Array.isArray(data.pinnedSongs) ? data.pinnedSongs : []);
  const activeSubFilter = data.subFilter || 'all';

  const filteredMedia = pinnedMedia.filter((item) => {
    if (activeSubFilter === 'movies') return item.mediaType === 'movie' || item.mediaType === 'video' || (item.duration && item.duration > 600);
    if (activeSubFilter === 'music') return item.mediaType === 'music' || (!item.mediaType && (!item.duration || item.duration <= 600));
    return true;
  });

  const moviesCount = pinnedMedia.filter((i) => i.mediaType === 'movie' || i.mediaType === 'video' || (i.duration && i.duration > 600)).length;
  const musicCount = pinnedMedia.length - moviesCount;
  const srcBadge = getSourceBadge(source);

  return `
    <header class="h-12 bg-secondary-container/40 border-b border-secondary-container/50 px-4 flex items-center justify-between select-none cursor-grab" data-drag-handle="${card.id}">
      <div class="flex items-center gap-2.5">
        <div class="flex items-center gap-1.5">
          <div class="w-3 h-3 rounded-full bg-rose-400/80 shadow-inner hover:opacity-80 transition-opacity cursor-pointer" data-act="del" title="Close"></div>
          <div class="w-3 h-3 rounded-full bg-amber-400/80 shadow-inner hover:opacity-80 transition-opacity cursor-pointer" data-act="min" title="Minimize"></div>
          <div class="w-3 h-3 rounded-full bg-emerald-400/80 shadow-inner hover:opacity-80 transition-opacity cursor-pointer" title="Zoom"></div>
        </div>
        <div class="flex items-center gap-2 ml-2">
          <svg class="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="20" height="15" x="2" y="7" rx="2" ry="2"/>
            <polyline points="17 2 12 7 7 2"/>
          </svg>
          <h2 class="text-headline-sm font-headline-sm text-on-surface font-semibold card-title-text">${escapeHtml(card.title || 'Media & Watchlist Deck')}</h2>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-2 py-0.5 rounded-full text-label-sm font-label-sm ${isPlaying ? 'bg-emerald-100 text-emerald-800' : 'bg-surface-container-highest text-secondary'} font-medium media-status-pill">${isPlaying ? 'Playing' : 'Ready'}</span>
        <span class="px-2 py-0.5 rounded-full text-label-sm font-label-sm ${srcBadge.class} font-mono font-medium">${escapeHtml(srcBadge.name)}</span>
        <span class="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-purple-100 text-purple-700 font-mono font-medium">${pinnedMedia.length} Saved</span>
        <span class="material-symbols-outlined text-secondary text-[18px]">drag_indicator</span>
        <button class="w-6 h-6 rounded-md hover:bg-rose-100/70 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer" data-act="del" title="Delete card from board">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    </header>

    <div class="p-5 flex flex-col gap-4 text-on-surface">
      <!-- Live Active Media Stream Banner (Movies, Shows or Songs) -->
      <div class="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-3">
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-xl ${mediaType === 'movie' || mediaType === 'video' ? 'bg-indigo-600' : 'bg-emerald-600'} text-white flex items-center justify-center shadow-md flex-none">
            ${mediaType === 'movie' || mediaType === 'video' ? `
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="20" height="15" x="2" y="7" rx="2" ry="2"/>
                <polyline points="17 2 12 7 7 2"/>
              </svg>
            ` : `
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
              </svg>
            `}
          </div>
          <div class="flex flex-col min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-body-md truncate media-track-title">${escapeHtml(track)}</span>
              <span class="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium ${srcBadge.class}">${escapeHtml(srcBadge.name)}</span>
            </div>
            <span class="text-label-sm text-secondary truncate media-artist-title">${escapeHtml(artist)}</span>
          </div>
        </div>

        <!-- Position & Progress bar for Stopped/Playing point -->
        ${data.duration > 0 || data.position > 0 ? `
          <div class="flex flex-col gap-1.5 pt-1">
            <div class="flex justify-between items-center text-xs font-mono">
              <span class="text-slate-600 font-semibold">${isPlaying ? 'Playing at' : 'Stopped at'}: <span class="text-primary font-bold">${stoppedAt}</span></span>
              <span class="text-secondary">${durationStr} (${progress}%)</span>
            </div>
            <div class="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
              <div class="h-full bg-primary rounded-full transition-all duration-300" style="width: ${progress}%"></div>
            </div>
          </div>
        ` : ''}

        <!-- Playback Controls -->
        <div class="flex items-center justify-center gap-3 pt-1 border-t border-outline-variant/20">
          <button class="btn-prev w-9 h-9 rounded-full bg-surface-container-high hover:bg-surface-container-highest active:scale-95 flex items-center justify-center transition-all cursor-pointer" title="Previous">
            <span class="material-symbols-outlined text-[18px]">skip_previous</span>
          </button>
          <button class="btn-play w-11 h-11 rounded-full bg-primary text-white hover:bg-primary/90 active:scale-95 flex items-center justify-center shadow-md transition-all cursor-pointer" title="Play / Pause">
            <span class="material-symbols-outlined text-[22px] play-pause-icon">${isPlaying ? 'pause' : 'play_arrow'}</span>
          </button>
          <button class="btn-next w-9 h-9 rounded-full bg-surface-container-high hover:bg-surface-container-highest active:scale-95 flex items-center justify-center transition-all cursor-pointer" title="Next">
            <span class="material-symbols-outlined text-[18px]">skip_next</span>
          </button>
          <button class="btn-focus-app ml-auto px-3 py-1.5 rounded-xl ${srcBadge.class} text-label-sm font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer" title="Switch to media application">
            <span class="material-symbols-outlined text-[14px]">open_in_new</span>
            <span>${escapeHtml(srcBadge.name)}</span>
          </button>
        </div>
      </div>

      <!-- Dedicated Pinned Media & Watchlist Module -->
      <div class="mt-1 pt-3.5 border-t border-slate-200/70 flex flex-col gap-3">
        <!-- Subheader & Category Filter Pills -->
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-1.5">
            <button class="media-subfilter px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeSubFilter === 'all' ? 'bg-primary-fixed text-primary shadow-xs' : 'bg-surface-container-low text-secondary hover:text-on-surface'}" data-sub="all">
              All (${pinnedMedia.length})
            </button>
            <button class="media-subfilter px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeSubFilter === 'movies' ? 'bg-primary-fixed text-primary shadow-xs' : 'bg-surface-container-low text-secondary hover:text-on-surface'}" data-sub="movies">
              Movies &amp; Shows (${moviesCount})
            </button>
            <button class="media-subfilter px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeSubFilter === 'music' ? 'bg-primary-fixed text-primary shadow-xs' : 'bg-surface-container-low text-secondary hover:text-on-surface'}" data-sub="music">
              Music (${musicCount})
            </button>
          </div>
          ${pinnedMedia.length > 0 ? `
            <button class="btn-clear-pinned-media text-[11px] font-mono text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-2 py-0.5 rounded transition-colors cursor-pointer" title="Clear all saved media">
              Clear All
            </button>
          ` : ''}
        </div>

        <!-- Watchlist Items -->
        ${filteredMedia.length === 0 ? `
          <div class="p-6 rounded-2xl border border-dashed border-slate-200/90 bg-slate-50/60 flex flex-col items-center justify-center text-center gap-2 select-none">
            <svg class="w-8 h-8 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect width="20" height="15" x="2" y="7" rx="2" ry="2"/>
              <polyline points="17 2 12 7 7 2"/>
            </svg>
            <span class="text-xs font-semibold text-slate-600">No media saved in this category yet</span>
            <span class="text-[11px] text-slate-400 max-w-[320px]">When watching movies in Prime Video, Netflix, YouTube, or playing music, click the pin button in Pulse Island to save your exact stopped timestamp and resume position here.</span>
          </div>
        ` : `
          <div class="pinned-media-list max-h-64 overflow-y-auto space-y-2 pr-1 custom-scroll">
            ${filteredMedia.map((item) => {
              const itemBadge = getSourceBadge(item.source);
              const isItemMovie = item.mediaType === 'movie' || item.mediaType === 'video' || (item.duration && item.duration > 600);
              const itemStopped = item.stoppedAt || formatTime(item.position || 0);
              const itemDur = formatTime(item.duration || 0);
              const itemPct = item.progress || (item.duration > 0 ? Math.min(100, Math.round(((item.position || 0) / item.duration) * 100)) : 0);

              return `
                <div class="group flex flex-col gap-2 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 hover:border-primary/40 hover:shadow-xs transition-all">
                  <div class="flex items-center justify-between gap-2.5">
                    <div class="flex items-center gap-2.5 min-w-0 flex-1">
                      <button class="btn-play-pinned-item w-8 h-8 rounded-lg ${isItemMovie ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600'} hover:text-white flex items-center justify-center transition-colors cursor-pointer flex-none" data-title="${escapeHtml(item.track)}" data-source="${escapeHtml(item.source || '')}" title="Resume / Play">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                      </button>
                      <div class="flex flex-col min-w-0 flex-1">
                        <div class="flex items-center gap-1.5">
                          <span class="text-xs font-semibold text-on-surface truncate">${escapeHtml(item.track)}</span>
                          <span class="px-1.5 py-0.2 rounded text-[9px] font-mono font-medium ${itemBadge.class}">${escapeHtml(itemBadge.name)}</span>
                        </div>
                        <span class="text-[11px] text-secondary font-mono truncate">${escapeHtml(item.artist || 'Unknown Series / Artist')}</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-2 flex-none">
                      <button class="btn-delete-pinned-item w-6 h-6 rounded-md hover:bg-rose-50 text-slate-300 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer" data-item-id="${escapeHtml(item.id)}" title="Remove from Watchlist">
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                  </div>

                  <!-- Stopped timestamp and progress tracker -->
                  <div class="flex items-center justify-between text-[11px] font-mono text-secondary pt-0.5 border-t border-outline-variant/10">
                    <div class="flex items-center gap-2">
                      <span class="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">Stopped at ${itemStopped}</span>
                      ${item.duration > 0 ? `<span>of ${itemDur}</span>` : ''}
                    </div>
                    <div class="flex items-center gap-2">
                      ${item.duration > 0 ? `
                        <div class="w-20 bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                          <div class="h-full bg-primary rounded-full" style="width: ${itemPct}%"></div>
                        </div>
                        <span class="text-[10px]">${itemPct}%</span>
                      ` : ''}
                      <span class="text-[10px] text-slate-400 font-sans">${escapeHtml(item.pinnedAt || '')}</span>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    </div>`;
}

export function attachMediaEvents(el, card, onSave, onToast) {
  async function refreshMedia() {
    try {
      const res = await runSystemAction('media.status', {}, onToast);
      if (res?.ok && res?.result) {
        const { isPlaying, artist, title, source, position, duration, mediaType } = res.result;
        card.data.isPlaying = Boolean(isPlaying);
        if (title) card.data.track = title;
        if (artist) card.data.artist = artist;
        if (source) card.data.source = source;
        if (mediaType) card.data.mediaType = mediaType;
        if (typeof position === 'number') card.data.position = position;
        if (typeof duration === 'number') card.data.duration = duration;

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
    } catch {
      // Audio bridge status query fallback
    }
  }

  // Initial poll on mount
  refreshMedia();

  el.querySelector('.btn-play')?.addEventListener('click', async () => {
    card.data.isPlaying = !card.data.isPlaying;
    const icon = el.querySelector('.play-pause-icon');
    if (icon) icon.textContent = card.data.isPlaying ? 'pause' : 'play_arrow';
    const pill = el.querySelector('.media-status-pill');
    if (pill) {
      pill.textContent = card.data.isPlaying ? 'Playing' : 'Ready';
      pill.className = `px-2 py-0.5 rounded-full text-label-sm font-label-sm ${card.data.isPlaying ? 'bg-emerald-100 text-emerald-800' : 'bg-surface-container-highest text-secondary'} font-medium media-status-pill`;
    }
    await runSystemAction('media.playPause', {}, onToast);
    onSave?.();
    onToast?.(card.data.isPlaying ? 'Playback started' : 'Playback paused');
    setTimeout(refreshMedia, 600);
  });

  el.querySelector('.btn-next')?.addEventListener('click', async () => {
    await runSystemAction('media.next', {}, onToast);
    onToast?.('Next media track/chapter signal dispatched');
    setTimeout(refreshMedia, 600);
  });

  el.querySelector('.btn-prev')?.addEventListener('click', async () => {
    await runSystemAction('media.previous', {}, onToast);
    onToast?.('Previous media track/chapter signal dispatched');
    setTimeout(refreshMedia, 600);
  });

  el.querySelector('.btn-focus-app')?.addEventListener('click', async () => {
    const src = card.data.source || 'Spotify';
    let appToOpen = 'spotify';
    if (src.toLowerCase().includes('prime')) appToOpen = 'prime';
    else if (src.toLowerCase().includes('netflix')) appToOpen = 'netflix';
    else if (src.toLowerCase().includes('vlc')) appToOpen = 'vlc';
    else if (src.toLowerCase().includes('youtube')) appToOpen = 'chrome';

    onToast?.(`Switching to ${src}...`);
    await runSystemAction('app.open', { name: appToOpen }, onToast);
    setTimeout(refreshMedia, 1200);
  });

  // Category filter tabs inside the card (All, Movies & Shows, Music)
  el.querySelectorAll('.media-subfilter').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      card.data.subFilter = btn.dataset.sub;
      onSave?.();
      window.dispatchEvent(new CustomEvent('kumo:render-cards'));
    });
  });

  // Resume or play a specific pinned item
  el.querySelectorAll('.btn-play-pinned-item').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const title = btn.dataset.title;
      const src = btn.dataset.source || '';
      onToast?.(`Resuming "${title}"...`);
      let appName = 'spotify';
      if (src.toLowerCase().includes('prime')) appName = 'prime';
      else if (src.toLowerCase().includes('netflix')) appName = 'netflix';
      else if (src.toLowerCase().includes('vlc')) appName = 'vlc';
      else if (src.toLowerCase().includes('youtube')) appName = 'chrome';

      await runSystemAction('app.open', { name: appName }, onToast);
      await runSystemAction('media.playPause', {}, onToast);
      onSave?.();
      setTimeout(refreshMedia, 800);
    });
  });

  // Delete an individual item from Watchlist
  el.querySelectorAll('.btn-delete-pinned-item').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const itemId = btn.dataset.itemId;
      const pinned = Array.isArray(card.data.pinnedMedia) ? card.data.pinnedMedia : (card.data.pinnedSongs || []);
      const removed = pinned.find((s) => s.id === itemId);
      card.data.pinnedMedia = pinned.filter((s) => s.id !== itemId);
      card.data.pinnedSongs = card.data.pinnedMedia;
      onSave?.();
      window.dispatchEvent(new CustomEvent('kumo:render-cards'));
      onToast?.(`Removed "${removed?.track || 'Item'}" from Watchlist`);
    });
  });

  // Clear all pinned media
  el.querySelector('.btn-clear-pinned-media')?.addEventListener('click', (e) => {
    e.stopPropagation();
    card.data.pinnedMedia = [];
    card.data.pinnedSongs = [];
    onSave?.();
    window.dispatchEvent(new CustomEvent('kumo:render-cards'));
    onToast?.('Cleared Media Watchlist');
  });
}
