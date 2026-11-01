// ============================================================
// amp/amp.js — Slot 03: Kumo Amp Retro-Modern Deck Coordinator
// 100% Dynamic Windows SMTC & Media Sync
// Strictly Lucide SVG icons (Zero Emojis)
// ============================================================

function initAmpWidget() {
  const marqueeText = document.getElementById('marquee-text');
  const marqueeTrack = document.getElementById('marquee-track');
  const marqueeViewport = document.getElementById('marquee-viewport');
  const marqueeWell = document.getElementById('header-marquee');
  const headerMusicBars = document.getElementById('header-music-bars');
  const pillTime = document.getElementById('pill-time');
  const btnHeroAction = document.getElementById('btn-hero-action');
  const ampSongTitle = document.getElementById('amp-song-title');
  const ampSongArtist = document.getElementById('amp-song-artist');
  const ampTimeCurrent = document.getElementById('amp-time-current');
  const ampTimeTotal = document.getElementById('amp-time-total');
  const ampSeekTrack = document.getElementById('amp-seek-track');
  const ampSeekFill = document.getElementById('amp-seek-fill');
  const ampSeekThumb = document.getElementById('amp-seek-thumb');
  const spectrumRack = document.getElementById('spectrum-rack');
  const btnAmpPlay = document.getElementById('btn-amp-play');
  const btnAmpPrev = document.getElementById('btn-amp-prev');
  const btnAmpNext = document.getElementById('btn-amp-next');
  const btnAmpRewind = document.getElementById('btn-amp-rewind');
  const btnAmpForward = document.getElementById('btn-amp-forward');
  const ampVolSlider = document.getElementById('amp-vol-slider');
  const ampVolLabel = document.getElementById('amp-vol-label');
  const modePills = document.querySelectorAll('.mode-pill');
  const srcBadges = document.querySelectorAll('.src-badge');
  const queueCarousel = document.getElementById('amp-queue-carousel');
  const queueStatusChip = document.getElementById('queue-status-chip');
  const btnAmpPinLive = document.getElementById('btn-amp-pin-live');
  const btnAmpPopout = document.getElementById('btn-amp-popout');

  let activeMedia = null;
  let isPlaying = false;

  // Initialize Visualizer Engine
  window.AmpVisualizer?.init(spectrumRack);

  function updateMarquee(text) {
    if (!marqueeText) return;
    marqueeText.textContent = text;
    if (!marqueeTrack) return;

    requestAnimationFrame(() => {
      const container = marqueeViewport || marqueeWell;
      if (!container) return;
      const available = container.clientWidth;
      const trackWidth = marqueeTrack.scrollWidth;

      if (trackWidth > available && available > 20) {
        const diff = trackWidth - available;
        marqueeTrack.style.setProperty('--marquee-distance', `-${diff + 4}px`);
        marqueeTrack.classList.add('is-overflowing');
        marqueeViewport?.classList.add('is-overflowing');
      } else {
        marqueeTrack.classList.remove('is-overflowing');
        marqueeViewport?.classList.remove('is-overflowing');
        marqueeTrack.style.removeProperty('--marquee-distance');
      }
    });
  }

  function setPlayingState(play) {
    isPlaying = Boolean(play);
    const heroPlayIcon = btnHeroAction?.querySelector('.icon-play');
    const heroPauseIcon = btnHeroAction?.querySelector('.icon-pause');
    const ampPlayIcon = btnAmpPlay?.querySelector('.icon-play');
    const ampPauseIcon = btnAmpPlay?.querySelector('.icon-pause');

    if (isPlaying) {
      if (heroPlayIcon) heroPlayIcon.style.display = 'none';
      if (heroPauseIcon) heroPauseIcon.style.display = 'block';
      if (ampPlayIcon) ampPlayIcon.style.display = 'none';
      if (ampPauseIcon) ampPauseIcon.style.display = 'block';
      if (headerMusicBars) {
        headerMusicBars.classList.add('is-playing');
        headerMusicBars.classList.remove('is-paused');
      }
      window.AmpVisualizer?.setPlaying(true);
    } else {
      if (heroPlayIcon) heroPlayIcon.style.display = 'block';
      if (heroPauseIcon) heroPauseIcon.style.display = 'none';
      if (ampPlayIcon) ampPlayIcon.style.display = 'block';
      if (ampPauseIcon) ampPauseIcon.style.display = 'none';
      if (headerMusicBars) {
        headerMusicBars.classList.remove('is-playing');
        headerMusicBars.classList.add('is-paused');
      }
      window.AmpVisualizer?.setPlaying(false);
    }
  }

  function applyMediaState(raw) {
    if (!raw) return;
    const meta = raw.result || raw;
    activeMedia = meta;

    const hasTitle = Boolean(meta.title && meta.title !== 'Media Controller Idle' && meta.title !== 'Spotify Ready');

    if (hasTitle) {
      if (ampSongTitle) ampSongTitle.textContent = meta.title;
      if (ampSongArtist) {
        const isSpotify = meta.source && typeof meta.source === 'string' && meta.source.toLowerCase().includes('spotify');
        const cleanSource = isSpotify ? 'Spotify' : 'System Media';
        ampSongArtist.textContent = `${meta.artist || 'Unknown Artist'} · ${cleanSource} Audio Stream`;
      }
      const trackStr = meta.artist ? `${meta.title} · ${meta.artist}` : meta.title;
      updateMarquee(trackStr);

      const posStr = window.AmpControls?.formatTime(meta.position) || '0:00';
      const durStr = window.AmpControls?.formatTime(meta.duration) || '0:00';

      if (ampTimeCurrent) ampTimeCurrent.textContent = posStr;
      if (ampTimeTotal) ampTimeTotal.textContent = (meta.duration > 0) ? durStr : 'LIVE';
      if (pillTime) pillTime.textContent = posStr;

      const pct = (meta.duration > 0) ? Math.min(100, Math.max(0, ((meta.position || 0) / meta.duration) * 100)) : 0;
      if (ampSeekFill) ampSeekFill.style.width = `${pct}%`;
      if (ampSeekThumb) ampSeekThumb.style.left = `${pct}%`;

      const isActuallyPlaying = (meta.status === 'Playing' || meta.isPlaying === true);
      setPlayingState(isActuallyPlaying);
    } else {
      if (ampSongTitle) ampSongTitle.textContent = 'No Active Media';
      if (ampSongArtist) ampSongArtist.textContent = 'Spotify / Windows Media Player Ready';
      if (ampTimeCurrent) ampTimeCurrent.textContent = '0:00';
      if (ampTimeTotal) ampTimeTotal.textContent = '0:00';
      updateMarquee('Kumo Amp · Ready');
      if (pillTime) pillTime.textContent = '0:00';
      if (ampSeekFill) ampSeekFill.style.width = '0%';
      if (ampSeekThumb) ampSeekThumb.style.left = '0%';
      setPlayingState(false);
    }
  }

  async function pollLiveMedia() {
    try {
      if (window.goo?.getMediaStatus) {
        const status = await window.goo.getMediaStatus();
        applyMediaState(status);
      } else if (window.goo?.action) {
        const status = await window.goo.action('media.status');
        applyMediaState(status);
      }
      pollQueue();
    } catch (e) {
      console.warn('Failed to fetch media status:', e);
    }
  }

  async function pollQueue() {
    try {
      if (window.goo?.getMediaQueue) {
        const data = await window.goo.getMediaQueue();
        window.AmpQueue?.render(queueCarousel, queueStatusChip, data, activeMedia);
      } else if (window.goo?.action) {
        const data = await window.goo.action('media.queue');
        window.AmpQueue?.render(queueCarousel, queueStatusChip, data?.result || data, activeMedia);
      }
    } catch {}
  }

  function togglePlay() {
    window.IslandHaptics?.playHaptic('pop');
    setPlayingState(!isPlaying);
    if (window.goo?.action) {
      window.goo.action('media.playPause').catch(console.warn);
      setTimeout(pollLiveMedia, 300);
    }
  }

  // Setup Transport & Scrubber Controls
  btnHeroAction?.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
  });

  window.AmpControls?.setupTransport({
    prevBtn: btnAmpPrev,
    rewindBtn: btnAmpRewind,
    playBtn: btnAmpPlay,
    forwardBtn: btnAmpForward,
    nextBtn: btnAmpNext,
    onTogglePlay: togglePlay
  });

  window.AmpControls?.setupScrubber(ampSeekTrack, ampSeekFill, ampSeekThumb, ampTimeCurrent, ampTimeTotal, (pct) => {
    if (activeMedia?.duration > 0) {
      const targetSec = Math.round(pct * activeMedia.duration);
      if (ampTimeCurrent) ampTimeCurrent.textContent = window.AmpControls?.formatTime(targetSec);
    }
  });

  window.AmpControls?.setupVolume(ampVolSlider, ampVolLabel);
  window.AmpControls?.setupSources(srcBadges);
  window.AmpControls?.setupPin(btnAmpPinLive, () => activeMedia);

  btnAmpPopout?.addEventListener('click', (e) => {
    e.stopPropagation();
    window.IslandHaptics?.playHaptic('pop');
    if (window.goo?.openAmpWindow) {
      window.goo.openAmpWindow();
    } else if (window.goo?.action) {
      window.goo.action('amp.open').catch(console.warn);
    }
  });

  modePills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      window.IslandHaptics?.playHaptic('pop');
      modePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      window.AmpVisualizer?.setMode(pill.dataset.mode);
    });
  });

  // Listen for Live Windows SMTC IPC push updates
  if (window.goo?.onMediaStatusUpdate) {
    window.goo.onMediaStatusUpdate((meta) => {
      applyMediaState(meta);
    });
  }

  // Initialize resting marquee display
  updateMarquee(marqueeText?.textContent || 'Kumo Ready · Idle');

  // Defer initial status poll to idle so boot remains instant
  setTimeout(pollLiveMedia, 3500);

  return {
    pollLiveMedia,
    applyMediaState,
  };
}

window.IslandAmp = { init: initAmpWidget };
