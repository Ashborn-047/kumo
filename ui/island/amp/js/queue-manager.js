// ============================================================
// amp/js/queue-manager.js — Session Queue & Pin Card Integrator
// Strictly Zero Emojis
// ============================================================

(function () {
  let lastQueueSig = '';

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderQueue(carouselElem, chipElem, data, activeMedia) {
    if (!carouselElem) return;
    const isConnected = Boolean(data?.connected);
    const queueList = data?.queue || [];
    let itemsToRender = [...queueList];
    const hasActive = Boolean(activeMedia?.title && activeMedia.title !== 'Media Controller Idle' && activeMedia.title !== 'Spotify Ready');
    if (itemsToRender.length === 0 && hasActive) {
      itemsToRender.push({
        title: activeMedia.title,
        artist: activeMedia.artist || 'Unknown Artist',
        source: activeMedia.source,
        position: activeMedia.position,
        duration: activeMedia.duration,
        timestamp: 'Now Playing',
        isPlaying: activeMedia.isPlaying
      });
    }

    const sig = `${isConnected}-${itemsToRender.length}-${itemsToRender.map(t => `${t.title}:${t.timestamp || ''}`).join('|')}`;
    if (sig === lastQueueSig) return;
    lastQueueSig = sig;

    if (chipElem) {
      chipElem.textContent = isConnected ? 'Spotify Live' : 'Session Queue';
    }

    if (itemsToRender.length === 0) {
      carouselElem.innerHTML = `
        <div style="font-size: 8px; color: #9f9ab2; padding: 4px; font-style: italic;">
          Session queue ready. Tracks appear dynamically as you listen.
        </div>
      `;
      return;
    }

    carouselElem.innerHTML = '';
    itemsToRender.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'queue-item-card font-sans';
      card.innerHTML = `
        <div class="queue-card-top truncate">
          <div class="queue-song-title truncate font-sans">${escapeHtml(item.title)}</div>
          <div class="queue-song-artist truncate font-mono">${escapeHtml(item.artist)}</div>
        </div>
        <div class="queue-card-bottom font-mono">
          <span class="queue-status-tag">${item.timestamp || (index === 0 ? 'Now' : 'Next')}</span>
          <button class="btn-queue-pin" title="Pin to Kumoboard">
            <svg class="lucide-icon icon-sm" viewBox="0 0 24 24">
              <path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>
            </svg>
          </button>
        </div>
      `;

      card.querySelector('.btn-queue-pin')?.addEventListener('click', (e) => {
        e.stopPropagation();
        window.IslandHaptics?.playHaptic('pop');
        if (window.goo?.pinCardToBoard) {
          window.goo.pinCardToBoard({
            id: `card-media-${Date.now()}`,
            type: 'media',
            title: item.title,
            data: {
              track: item.title,
              artist: item.artist,
              source: item.source || activeMedia?.source || 'Media',
              mediaType: item.mediaType || (item.duration > 600 ? 'movie' : 'music'),
              position: item.position ?? activeMedia?.position ?? 0,
              duration: item.duration ?? activeMedia?.duration ?? 0,
              stoppedAt: item.stoppedAt || '0:00',
              progress: item.progress ?? 0,
              status: item.status || (activeMedia?.isPlaying ? 'Playing' : 'Paused'),
              isPlaying: activeMedia?.isPlaying ?? false
            }
          });
        }
      });

      carouselElem.appendChild(card);
    });
  }

  window.AmpQueue = {
    render: renderQueue
  };
})();

