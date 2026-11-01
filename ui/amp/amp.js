// ============================================================
// ui/amp/amp.js — Standalone Deck MK-IV Interactive Controller
// Strictly Lucide SVG icons (Zero Emojis)
// ============================================================

(function () {
  const winSongTitle = document.getElementById('win-song-title');
  const winSongArtist = document.getElementById('win-song-artist');
  const winTimeReadout = document.getElementById('win-time-readout');
  const winTimeCurr = document.getElementById('win-time-curr');
  const winTimeTotal = document.getElementById('win-time-total');
  const winScrubTrack = document.getElementById('win-scrub-track');
  const winScrubFill = document.getElementById('win-scrub-fill');
  const winScrubThumb = document.getElementById('win-scrub-thumb');
  const winSpectrumRack = document.getElementById('win-spectrum-rack');
  const winBtnPrev = document.getElementById('win-btn-prev');
  const winBtnRewind = document.getElementById('win-btn-rewind');
  const winBtnPlay = document.getElementById('win-btn-play');
  const winBtnForward = document.getElementById('win-btn-forward');
  const winBtnNext = document.getElementById('win-btn-next');
  const winVolSlider = document.getElementById('win-vol-slider');
  const winVolLabel = document.getElementById('win-vol-label');
  const winBtnPin = document.getElementById('win-btn-pin');
  const btnWinClose = document.getElementById('btn-win-close');
  const winQueueList = document.getElementById('win-queue-list');
  const winQueueCount = document.getElementById('win-queue-count');
  const modeButtons = document.querySelectorAll('.mode-btn');
  const sourcePills = document.querySelectorAll('.source-pill');

  const NUM_BARS = 28;
  const specBars = [];
  const specPeaks = [];
  const peakValues = new Float32Array(NUM_BARS);
  const peakHoldTicks = new Uint8Array(NUM_BARS);
  let isPlaying = false;
  let activeMedia = null;
  let visRafId = null;
  let lastVisTime = 0;
  let currentMode = 'bars';

  // Live Web Audio Loopback Capture
  let liveAnalyser = null;
  let liveFrequencyData = null;
  let captureAttempted = false;

  async function tryInitLiveAudio() {
    if (captureAttempted || liveAnalyser) return;
    captureAttempted = true;
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) return;
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: { width: 1, height: 1, frameRate: 1 }
      });
      stream.getVideoTracks().forEach(t => t.stop());
      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) return;

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(new MediaStream([audioTrack]));
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.78;
      source.connect(analyser);

      liveAnalyser = analyser;
      liveFrequencyData = new Uint8Array(analyser.frequencyBinCount);
    } catch {}
  }

  function formatTime(totalSeconds) {
    if (typeof totalSeconds !== 'number' || isNaN(totalSeconds) || totalSeconds <= 0) return '0:00';
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  const rainPositions = new Float32Array(NUM_BARS);

  // 1. Build 28-Band Spectrum Analyzer
  if (winSpectrumRack) {
    winSpectrumRack.innerHTML = '';
    winSpectrumRack.className = 'spectrum-rack mode-bars';
    for (let i = 0; i < NUM_BARS; i++) {
      const wrap = document.createElement('div');
      wrap.className = 'spec-bar-wrap';

      const peak = document.createElement('div');
      peak.className = 'spec-peak';
      peak.style.opacity = '0.35';

      const bar = document.createElement('div');
      bar.className = 'spec-bar';
      bar.style.height = '3px';

      wrap.appendChild(peak);
      wrap.appendChild(bar);
      winSpectrumRack.appendChild(wrap);

      specBars.push(bar);
      specPeaks.push(peak);
      peakValues[i] = 3;
      peakHoldTicks[i] = 0;
      rainPositions[i] = 10 + Math.random() * 20;
    }
    tryInitLiveAudio().catch(() => {});
  }

  // Rhythmic Acoustic Physics Model (Kick, Snare, Hi-hat, Harmonic Flow)
  function computeRhythmHeight(idx, now) {
    const bpm = 124;
    const beatMs = 60000 / bpm;
    const beatPhase = (now % beatMs) / beatMs;

    // Kick drum pulse (Beats 1 & 3): instant attack, decay
    const kickCurve = Math.max(0, 1 - (beatPhase / 0.32));
    const kickPunch = Math.pow(kickCurve, 2) * 26;

    // Snare / Clap pop (Beats 2 & 4): off-beat burst
    const isSnareWindow = (beatPhase > 0.45 && beatPhase < 0.72);
    const snarePhase = isSnareWindow ? (beatPhase - 0.45) / 0.27 : 1;
    const snarePop = isSnareWindow ? Math.pow(1 - snarePhase, 1.8) * 22 : 0;

    // Hi-hat groove: 16th note subdivision
    const sixteenthPhase = (now % (beatMs / 4)) / (beatMs / 4);
    const hatSizzle = Math.pow(1 - sixteenthPhase, 2) * 16;

    // Harmonic wave undulation across frequencies
    const wave = Math.sin((idx * 0.45) + (now * 0.006)) * 6;

    const norm = idx / NUM_BARS;
    let height = 3;

    if (norm < 0.28) {
      height = 4 + kickPunch * (1 - norm) + wave * 0.5;
    } else if (norm < 0.65) {
      const midSpread = Math.sin((norm - 0.28) / 0.37 * Math.PI);
      height = 4 + snarePop * midSpread + wave + (kickPunch * 0.25);
    } else {
      height = 4 + hatSizzle * (norm * 0.9) + Math.abs(wave * 0.8);
    }

    if (currentMode === 'mirror') {
      const mirrorNorm = Math.abs(idx - NUM_BARS / 2) / (NUM_BARS / 2);
      height *= (1.1 - mirrorNorm * 0.4);
    } else if (currentMode === 'wave') {
      height += Math.sin((idx * 0.6) + (now * 0.008)) * 8;
    }

    return Math.max(3, Math.min(34, Math.round(height)));
  }

  function updateVisualizer(active, now = performance.now()) {
    if (!active) {
      specBars.forEach((b, i) => {
        b.style.height = '3px';
        peakValues[i] = 3;
        specPeaks[i].style.opacity = '0.2';
      });
      return;
    }

    let hasLiveAudio = false;
    if (liveAnalyser && liveFrequencyData) {
      liveAnalyser.getByteFrequencyData(liveFrequencyData);
      let sum = 0;
      for (let k = 0; k < 28; k++) sum += liveFrequencyData[k];
      hasLiveAudio = (sum > 60);
    }

    specBars.forEach((bar, idx) => {
      let rawHeight = 3;

      if (currentMode === 'mirror') {
        const centerDist = Math.abs(idx - 13.5);
        const mappedIdx = Math.floor(centerDist * 2);
        if (hasLiveAudio) {
          const binVal = liveFrequencyData[mappedIdx] || 0;
          rawHeight = Math.max(3, Math.min(34, Math.round((binVal / 255) * 34)));
        } else {
          rawHeight = computeRhythmHeight(mappedIdx, now);
        }
      } else {
        if (hasLiveAudio) {
          const binVal = liveFrequencyData[idx] || 0;
          rawHeight = Math.max(3, Math.min(34, Math.round((binVal / 255) * 34)));
        } else {
          rawHeight = computeRhythmHeight(idx, now);
        }
      }

      // Ballistic Peak Tracking
      if (rawHeight >= peakValues[idx]) {
        peakValues[idx] = rawHeight;
        peakHoldTicks[idx] = 8;
      } else if (peakHoldTicks[idx] > 0) {
        peakHoldTicks[idx]--;
      } else {
        peakValues[idx] = Math.max(3, peakValues[idx] - 1.4);
      }

      const peak = specPeaks[idx];

      if (currentMode === 'wave') {
        const waveY = Math.sin((idx * 0.42) + (now * 0.007)) * (rawHeight * 0.42) + (rawHeight * 0.55);
        bar.style.height = '3.5px';
        bar.style.transform = `translateY(-${Math.max(2, Math.round(waveY))}px)`;
        if (peak) {
          peak.style.transform = `translateY(-${Math.min(35, Math.round(waveY + 6))}px)`;
          peak.style.opacity = '0.9';
        }
      } else if (currentMode === 'dots') {
        bar.style.height = '4px';
        bar.style.transform = `translateY(-${rawHeight}px)`;
        if (peak) {
          peak.style.transform = `translateY(-${Math.round(peakValues[idx] + 2)}px)`;
          peak.style.opacity = peakValues[idx] > 8 ? '0.95' : '0.35';
        }
      } else if (currentMode === 'rain') {
        bar.style.height = `${Math.round(rawHeight * 0.65)}px`;
        bar.style.transform = 'none';

        rainPositions[idx] -= (1.1 + (idx % 4) * 0.35);
        if (rainPositions[idx] <= 3 || rawHeight >= rainPositions[idx]) {
          rainPositions[idx] = Math.max(rawHeight + 5, 28);
        }
        if (peak) {
          peak.style.transform = `translateY(-${Math.round(rainPositions[idx])}px)`;
          peak.style.opacity = '0.95';
        }
      } else {
        bar.style.height = `${rawHeight}px`;
        bar.style.transform = 'none';
        if (peak) {
          peak.style.transform = 'none';
          peak.style.opacity = peakValues[idx] > 10 ? '0.95' : '0.35';
        }
      }
    });
  }

  function runVisualizerLoop(now) {
    if (!isPlaying) {
      if (visRafId) cancelAnimationFrame(visRafId);
      visRafId = null;
      updateVisualizer(false);
      return;
    }
    if (now - lastVisTime >= 35) {
      lastVisTime = now;
      updateVisualizer(true, now);
    }
    visRafId = requestAnimationFrame(runVisualizerLoop);
  }

  function setPlayingState(play) {
    isPlaying = Boolean(play);
    const playIcon = winBtnPlay?.querySelector('.icon-play');
    const pauseIcon = winBtnPlay?.querySelector('.icon-pause');

    if (isPlaying) {
      if (playIcon) playIcon.style.display = 'none';
      if (pauseIcon) pauseIcon.style.display = 'block';
      if (!liveAnalyser) tryInitLiveAudio().catch(() => {});
      if (!visRafId) {
        lastVisTime = performance.now();
        visRafId = requestAnimationFrame(runVisualizerLoop);
      }
    } else {
      if (playIcon) playIcon.style.display = 'block';
      if (pauseIcon) pauseIcon.style.display = 'none';
      if (visRafId) {
        cancelAnimationFrame(visRafId);
        visRafId = null;
      }
      updateVisualizer(false);
    }
  }

  function applyMediaState(raw) {
    if (!raw) return;
    const meta = raw.result || raw;
    activeMedia = meta;

    const hasTitle = Boolean(meta.title && meta.title !== 'Media Controller Idle' && meta.title !== 'Spotify Ready');

    if (hasTitle) {
      if (winSongTitle) winSongTitle.textContent = meta.title;
      if (winSongArtist) {
        const src = meta.source || 'Spotify';
        winSongArtist.textContent = `${meta.artist || 'Unknown Artist'} · ${src} · 320 KBPS · STEREO`;
      }

      const posStr = formatTime(meta.position);
      const durStr = formatTime(meta.duration);

      if (winTimeReadout) winTimeReadout.textContent = meta.duration > 0 ? `${posStr} / ${durStr}` : `${posStr} LIVE`;
      if (winTimeCurr) winTimeCurr.textContent = posStr;
      if (winTimeTotal) winTimeTotal.textContent = meta.duration > 0 ? durStr : 'LIVE';

      const pct = (meta.duration > 0) ? Math.min(100, Math.max(0, ((meta.position || 0) / meta.duration) * 100)) : 0;
      if (winScrubFill) winScrubFill.style.width = `${pct}%`;
      if (winScrubThumb) winScrubThumb.style.left = `${pct}%`;

      const isActuallyPlaying = (meta.status === 'Playing' || meta.isPlaying === true);
      setPlayingState(isActuallyPlaying);
    } else {
      if (winSongTitle) winSongTitle.textContent = 'No Active Media';
      if (winSongArtist) winSongArtist.textContent = 'Spotify / Windows Media Player Ready';
      if (winTimeReadout) winTimeReadout.textContent = '--:-- / --:--';
      if (winTimeCurr) winTimeCurr.textContent = '0:00';
      if (winTimeTotal) winTimeTotal.textContent = '0:00';
      if (winScrubFill) winScrubFill.style.width = '0%';
      if (winScrubThumb) winScrubThumb.style.left = '0%';
      setPlayingState(false);
    }
  }

  // 2. Queue Rendering
  const fallbackQueue = [
    { title: 'Paper Lanterns', artist: 'Kiri Moon', duration: '3:34', active: true },
    { title: 'Slow Orbit', artist: 'Hollow Fern', duration: '3:07', active: false },
    { title: 'Neon Tide', artist: 'Aya Brooks', duration: '4:01', active: false },
    { title: 'Marigold Hours', artist: 'Tomo & The Static', duration: '3:19', active: false }
  ];

  function renderQueueList(queue) {
    if (!winQueueList) return;
    const items = (Array.isArray(queue) && queue.length > 0) ? queue : fallbackQueue;
    if (winQueueCount) winQueueCount.textContent = `UPCOMING QUEUE (${items.length})`;

    winQueueList.innerHTML = '';
    items.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = `queue-track-row ${item.active ? 'active' : ''}`;
      row.innerHTML = `
        <div class="track-left truncate">
          <span class="track-num">${String(idx + 1).padStart(2, '0')}</span>
          <span class="track-name truncate">${item.title}</span>
          <span class="track-artist truncate">· ${item.artist}</span>
        </div>
        <div class="track-right font-mono">
          ${item.active ? '<span class="track-dot-active"></span>' : ''}
          <span>${item.duration || '3:00'}</span>
        </div>
      `;
      row.addEventListener('click', () => {
        if (window.goo?.action) {
          window.goo.action('media.playPause').catch(console.warn);
        }
      });
      winQueueList.appendChild(row);
    });
  }

  renderQueueList(fallbackQueue);

  // 3. User Controls Binding
  function togglePlay() {
    setPlayingState(!isPlaying);
    if (window.goo?.action) {
      window.goo.action('media.playPause').catch(console.warn);
    }
  }

  winBtnPlay?.addEventListener('click', togglePlay);
  winBtnPrev?.addEventListener('click', () => { window.goo?.action?.('media.previous'); });
  winBtnRewind?.addEventListener('click', () => { window.goo?.action?.('media.previous'); });
  winBtnForward?.addEventListener('click', () => { window.goo?.action?.('media.next'); });
  winBtnNext?.addEventListener('click', () => { window.goo?.action?.('media.next'); });

  // Scrubber drag / click
  winScrubTrack?.addEventListener('click', (e) => {
    const rect = winScrubTrack.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (winScrubFill) winScrubFill.style.width = `${pct * 100}%`;
    if (winScrubThumb) winScrubThumb.style.left = `${pct * 100}%`;
    if (activeMedia?.duration > 0) {
      const targetSec = Math.round(pct * activeMedia.duration);
      if (winTimeCurr) winTimeCurr.textContent = formatTime(targetSec);
    }
  });

  winVolSlider?.addEventListener('input', (e) => {
    const val = Number(e.target.value);
    if (winVolLabel) winVolLabel.textContent = `${val}%`;
    if (window.goo?.action) {
      if (val > 50) window.goo.action('media.volUp');
      else window.goo.action('media.volDown');
    }
  });

  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode || 'bars';
      if (winSpectrumRack) {
        winSpectrumRack.className = `spectrum-rack mode-${currentMode}`;
      }
    });
  });

  sourcePills.forEach(pill => {
    pill.addEventListener('click', () => {
      sourcePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      if (pill.dataset.src === 'spotify' && window.goo?.action) {
        window.goo.action('app.open', { name: 'spotify' });
      }
    });
  });

  winBtnPin?.addEventListener('click', () => {
    if (!activeMedia || !activeMedia.title || activeMedia.title === 'Media Controller Idle') return;
    if (window.goo?.pinCardToBoard) {
      window.goo.pinCardToBoard({
        id: `card-media-${Date.now()}`,
        type: 'media',
        title: activeMedia.title,
        data: {
          track: activeMedia.title,
          artist: activeMedia.artist,
          source: activeMedia.source || 'Media',
          mediaType: activeMedia.mediaType || (activeMedia.duration > 600 ? 'movie' : 'music'),
          position: activeMedia.position || 0,
          duration: activeMedia.duration || 0,
          stoppedAt: formatTime(activeMedia.position || 0),
          progress: (activeMedia.duration > 0) ? Math.min(100, Math.round(((activeMedia.position || 0) / activeMedia.duration) * 100)) : 0,
          status: activeMedia.isPlaying ? 'Playing' : 'Paused',
          isPlaying: Boolean(activeMedia.isPlaying)
        }
      });
    }
  });

  btnWinClose?.addEventListener('click', () => {
    if (window.goo?.closeAmpWindow) {
      window.goo.closeAmpWindow();
    } else {
      window.close();
    }
  });

  // 4. Glitch-Free Tactile Window Dragging
  const ampTitlebar = document.getElementById('amp-titlebar');
  let isDraggingWin = false;
  let startScreenX = 0;
  let startScreenY = 0;

  ampTitlebar?.addEventListener('mousedown', (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    isDraggingWin = true;
    startScreenX = e.screenX;
    startScreenY = e.screenY;
    document.body.classList.add('is-dragging');
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDraggingWin) return;
    const deltaX = e.screenX - startScreenX;
    const deltaY = e.screenY - startScreenY;
    if (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0) {
      window.goo?.moveOverlay?.(deltaX, deltaY);
      startScreenX = e.screenX;
      startScreenY = e.screenY;
    }
  });

  window.addEventListener('mouseup', () => {
    if (isDraggingWin) {
      isDraggingWin = false;
      document.body.classList.remove('is-dragging');
    }
  });

  // 5. Initial SMTC Sync & Polling
  if (window.goo?.onMediaStatusUpdate) {
    window.goo.onMediaStatusUpdate(applyMediaState);
  }

  async function poll() {
    try {
      if (window.goo?.getMediaStatus) {
        const s = await window.goo.getMediaStatus();
        applyMediaState(s);
      }
    } catch {}
  }
  setTimeout(poll, 400);
})();

