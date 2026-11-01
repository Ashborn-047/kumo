// ============================================================
// amp/js/controls-manager.js — Tactile Scrubber & Transport Binder
// Strictly Zero Emojis
// ============================================================

(function () {
  function formatTime(totalSeconds) {
    if (typeof totalSeconds !== 'number' || isNaN(totalSeconds) || totalSeconds <= 0) return '0:00';
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function setupScrubber(trackElem, fillElem, thumbElem, currentElem, totalElem, onSeek) {
    if (!trackElem) return;

    function handleSeekEvent(e) {
      const rect = trackElem.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const pct = clickX / rect.width;
      if (fillElem) fillElem.style.width = `${pct * 100}%`;
      if (thumbElem) thumbElem.style.left = `${pct * 100}%`;
      window.IslandHaptics?.playHaptic('tick');
      if (typeof onSeek === 'function') onSeek(pct);
    }

    trackElem.addEventListener('click', (e) => {
      e.stopPropagation();
      handleSeekEvent(e);
    });

    let isDragging = false;
    trackElem.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      isDragging = true;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      handleSeekEvent(e);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  function setupTransport({ prevBtn, rewindBtn, playBtn, forwardBtn, nextBtn, onTogglePlay }) {
    prevBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      window.IslandHaptics?.playHaptic('pop');
      if (window.goo?.action) window.goo.action('media.previous').catch(console.warn);
    });

    rewindBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      window.IslandHaptics?.playHaptic('pop');
      if (window.goo?.action) window.goo.action('media.previous').catch(console.warn);
    });

    playBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof onTogglePlay === 'function') onTogglePlay();
    });

    forwardBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      window.IslandHaptics?.playHaptic('pop');
      if (window.goo?.action) window.goo.action('media.next').catch(console.warn);
    });

    nextBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      window.IslandHaptics?.playHaptic('pop');
      if (window.goo?.action) window.goo.action('media.next').catch(console.warn);
    });
  }

  function setupVolume(sliderElem, labelElem) {
    if (!sliderElem) return;
    sliderElem.addEventListener('input', (e) => {
      const val = Number(e.target.value);
      if (labelElem) labelElem.textContent = `${val}%`;
      if (window.goo?.action) {
        if (val > 50) window.goo.action('media.volUp').catch(console.warn);
        else window.goo.action('media.volDown').catch(console.warn);
      }
    });
  }

  function setupSources(badges) {
    badges.forEach(badge => {
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        window.IslandHaptics?.playHaptic('pop');
        badges.forEach(b => b.classList.remove('active'));
        badge.classList.add('active');
        const src = badge.dataset.src;
        if (src === 'spotify' && window.goo?.action) {
          window.goo.action('app.open', { name: 'spotify' }).catch(console.warn);
        }
      });
    });
  }

  function setupPin(btnElem, getActiveMedia) {
    if (!btnElem) return;
    btnElem.addEventListener('click', (e) => {
      e.stopPropagation();
      window.IslandHaptics?.playHaptic('pop');
      const media = typeof getActiveMedia === 'function' ? getActiveMedia() : null;
      if (!media || !media.title || media.title === 'Media Controller Idle') return;
      if (window.goo?.pinCardToBoard) {
        window.goo.pinCardToBoard({
          id: `card-media-${Date.now()}`,
          type: 'media',
          title: media.title,
          data: {
            track: media.title,
            artist: media.artist,
            source: media.source || 'Media',
            mediaType: media.mediaType || (media.duration > 600 ? 'movie' : 'music'),
            position: media.position || 0,
            duration: media.duration || 0,
            stoppedAt: formatTime(media.position || 0),
            progress: (media.duration > 0) ? Math.min(100, Math.round(((media.position || 0) / media.duration) * 100)) : 0,
            status: media.isPlaying ? 'Playing' : 'Paused',
            isPlaying: Boolean(media.isPlaying)
          }
        });
      }
    });
  }

  window.AmpControls = {
    setupScrubber,
    setupTransport,
    setupVolume,
    setupSources,
    setupPin,
    formatTime
  };
})();

