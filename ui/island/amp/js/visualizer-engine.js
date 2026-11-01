// ============================================================
// amp/js/visualizer-engine.js — Rhythmic 28-Band Spectrum Analyzer
// 5 Distinct Modes: BARS, MIRROR, WAVE, DOTS, RAIN
// Supports WASAPI Loopback FFT + Acoustic Rhythm Physics
// Strictly Zero Emojis
// ============================================================

(function () {
  const NUM_BARS = 28;
  const specBars = [];
  const specPeaks = [];
  const peakValues = new Float32Array(NUM_BARS);
  const peakHoldTicks = new Uint8Array(NUM_BARS);
  const rainPositions = new Float32Array(NUM_BARS);

  let targetRack = null;
  let visRafId = null;
  let lastVisTime = 0;
  let currentMode = 'bars';
  let activePlaying = false;

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
      analyser.smoothingTimeConstant = 0.76;
      source.connect(analyser);

      liveAnalyser = analyser;
      liveFrequencyData = new Uint8Array(analyser.frequencyBinCount);
    } catch {}
  }

  function initSpectrum(rackElem) {
    if (!rackElem) return;
    targetRack = rackElem;
    rackElem.innerHTML = '';
    rackElem.className = `spectrum-rack mode-${currentMode}`;
    specBars.length = 0;
    specPeaks.length = 0;

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
      rackElem.appendChild(wrap);

      specBars.push(bar);
      specPeaks.push(peak);
      peakValues[i] = 3;
      peakHoldTicks[i] = 0;
      rainPositions[i] = 10 + Math.random() * 20;
    }

    tryInitLiveAudio().catch(() => {});
  }

  function setMode(mode) {
    currentMode = mode || 'bars';
    if (targetRack) {
      targetRack.className = `spectrum-rack mode-${currentMode}`;
    }
  }

  // Rhythmic Acoustic Physics Model (Kick, Snare, Hi-hat, Harmonic Flow)
  function computeRhythmHeight(idx, now) {
    const bpm = 124;
    const beatMs = 60000 / bpm;
    const beatPhase = (now % beatMs) / beatMs;

    const kickCurve = Math.max(0, 1 - (beatPhase / 0.32));
    const kickPunch = Math.pow(kickCurve, 2) * 26;

    const isSnareWindow = (beatPhase > 0.45 && beatPhase < 0.72);
    const snarePhase = isSnareWindow ? (beatPhase - 0.45) / 0.27 : 1;
    const snarePop = isSnareWindow ? Math.pow(1 - snarePhase, 1.8) * 22 : 0;

    const sixteenthPhase = (now % (beatMs / 4)) / (beatMs / 4);
    const hatSizzle = Math.pow(1 - sixteenthPhase, 2) * 16;

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

    return Math.max(3, Math.min(34, Math.round(height)));
  }

  function updateVisualizer(active, now = performance.now()) {
    if (!active) {
      specBars.forEach((b, i) => {
        b.style.height = '3px';
        b.style.transform = 'none';
        peakValues[i] = 3;
        specPeaks[i].style.opacity = '0.2';
        specPeaks[i].style.transform = 'none';
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
        // Symmetrical Center-Out Stereo (Sub-bass in center, Highs on wings)
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

      // Pattern Rendering Logic
      if (currentMode === 'wave') {
        // Continuous Oscilloscope Sine Ribbon
        const waveY = Math.sin((idx * 0.42) + (now * 0.007)) * (rawHeight * 0.42) + (rawHeight * 0.55);
        bar.style.height = '3.5px';
        bar.style.transform = `translateY(-${Math.max(2, Math.round(waveY))}px)`;
        if (peak) {
          peak.style.transform = `translateY(-${Math.min(35, Math.round(waveY + 6))}px)`;
          peak.style.opacity = '0.9';
        }
      } else if (currentMode === 'dots') {
        // Discrete VFD Matrix LED Pips
        bar.style.height = '4px';
        bar.style.transform = `translateY(-${rawHeight}px)`;
        if (peak) {
          peak.style.transform = `translateY(-${Math.round(peakValues[idx] + 2)}px)`;
          peak.style.opacity = peakValues[idx] > 8 ? '0.95' : '0.35';
        }
      } else if (currentMode === 'rain') {
        // Cascading Phosphor Raindrops
        bar.style.height = `${Math.round(rawHeight * 0.65)}px`;
        bar.style.transform = 'none';

        // Raindrop physics: falls downward continuously
        rainPositions[idx] -= (1.1 + (idx % 4) * 0.35);
        if (rainPositions[idx] <= 3 || rawHeight >= rainPositions[idx]) {
          rainPositions[idx] = Math.max(rawHeight + 5, 28);
        }
        if (peak) {
          peak.style.transform = `translateY(-${Math.round(rainPositions[idx])}px)`;
          peak.style.opacity = '0.95';
        }
      } else {
        // Mode BARS & MIRROR: Standard upward-reaching tactile columns
        bar.style.height = `${rawHeight}px`;
        bar.style.transform = 'none';
        if (peak) {
          peak.style.transform = 'none';
          peak.style.opacity = peakValues[idx] > 10 ? '0.95' : '0.35';
        }
      }
    });
  }

  function runLoop(now) {
    if (!activePlaying) {
      if (visRafId) cancelAnimationFrame(visRafId);
      visRafId = null;
      updateVisualizer(false);
      return;
    }
    if (now - lastVisTime >= 35) {
      lastVisTime = now;
      updateVisualizer(true, now);
    }
    visRafId = requestAnimationFrame(runLoop);
  }

  function setPlaying(playing) {
    activePlaying = Boolean(playing);
    if (activePlaying) {
      if (!liveAnalyser) tryInitLiveAudio().catch(() => {});
      if (!visRafId) {
        lastVisTime = performance.now();
        visRafId = requestAnimationFrame(runLoop);
      }
    } else {
      if (visRafId) {
        cancelAnimationFrame(visRafId);
        visRafId = null;
      }
      updateVisualizer(false);
    }
  }

  window.AmpVisualizer = {
    init: initSpectrum,
    setMode,
    setPlaying,
    update: updateVisualizer,
    tryInitLiveAudio
  };
})();
