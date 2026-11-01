// ─────────────────────────────────────────────────────────────
// ui/studio/js/mood-controller.js — Mood States, Speech Bubble & FPS
// ─────────────────────────────────────────────────────────────

import { state, SPEECH_PHRASES } from './wizard-state.js';

let phraseIndex = 0;

export function applyMoodToVector(mood) {
  const cottonMouth = document.getElementById('cotton-mouth');
  const cottonEyeL = document.getElementById('cotton-eye-left');
  const cottonEyeR = document.getElementById('cotton-eye-right');
  const cottonBlushL = document.getElementById('cotton-blush-left');
  const cottonBlushR = document.getElementById('cotton-blush-right');

  const starletMouth = document.getElementById('starlet-mouth');

  const baseBlush = (state.blushIntensity / 100) * 0.75;

  if (cottonMouth) {
    if (mood === 'idle') {
      cottonMouth.setAttribute('d', 'M80 61C82.5 64.5 87.5 64.5 90 61');
      cottonEyeL?.setAttribute('r', '4.5');
      cottonEyeR?.setAttribute('r', '4.5');
      cottonBlushL?.setAttribute('opacity', baseBlush);
      cottonBlushR?.setAttribute('opacity', baseBlush);
    } else if (mood === 'happy') {
      cottonMouth.setAttribute('d', 'M78 60C82 67 88 67 92 60');
      cottonEyeL?.setAttribute('r', '5');
      cottonEyeR?.setAttribute('r', '5');
      cottonBlushL?.setAttribute('opacity', Math.min(1.0, baseBlush * 1.3));
      cottonBlushR?.setAttribute('opacity', Math.min(1.0, baseBlush * 1.3));
    } else if (mood === 'thinking') {
      cottonMouth.setAttribute('d', 'M81 63H89');
      cottonEyeL?.setAttribute('r', '4');
      cottonEyeR?.setAttribute('r', '4.8');
    } else if (mood === 'speaking') {
      cottonMouth.setAttribute('d', 'M81 60C81 66 89 66 89 60Z');
      cottonEyeL?.setAttribute('r', '4.5');
      cottonEyeR?.setAttribute('r', '4.5');
    }
  }

  if (starletMouth) {
    if (mood === 'happy') {
      starletMouth.setAttribute('d', 'M56 43C59 49 63 49 66 43');
    } else if (mood === 'thinking') {
      starletMouth.setAttribute('d', 'M57 45H65');
    } else if (mood === 'speaking') {
      starletMouth.setAttribute('d', 'M57 43C57 48 65 48 65 43Z');
    } else {
      starletMouth.setAttribute('d', 'M57 44C59 47 63 47 65 44');
    }
  }
}

export function updateMoodPillUI(activeMood) {
  const pills = document.querySelectorAll('[data-mood]');
  pills.forEach(pill => {
    const mood = pill.getAttribute('data-mood');
    if (mood === activeMood) {
      pill.className = 'px-2.5 py-1 rounded-lg bg-primary-fixed text-primary font-label-sm text-label-sm font-bold shadow-xs cursor-pointer transition-all';
    } else {
      pill.className = 'px-2.5 py-1 rounded-lg hover:bg-surface-container text-secondary hover:text-on-surface font-label-sm text-label-sm flex items-center gap-1 transition-colors cursor-pointer';
    }
  });
}

export function setupMoodPills(getMascot) {
  const pills = document.querySelectorAll('[data-mood]');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const mood = pill.getAttribute('data-mood') || 'idle';
      state.mood = mood;
      updateMoodPillUI(mood);
      applyMoodToVector(mood);

      const mascot = getMascot();
      if (mascot) {
        mascot.setState(mood);
      }
    });
  });
}

export function setupSpeechBubble(getMascot) {
  const testSpeechBtn = document.getElementById('btn-test-speech');
  const bubbleText = document.getElementById('speech-bubble-text');

  if (testSpeechBtn && bubbleText) {
    testSpeechBtn.addEventListener('click', () => {
      phraseIndex = (phraseIndex + 1) % SPEECH_PHRASES.length;
      bubbleText.innerHTML = SPEECH_PHRASES[phraseIndex];

      const bubble = document.getElementById('speech-bubble-card');
      if (bubble) {
        bubble.classList.remove('animate-speech');
        void bubble.offsetWidth; // reflow
        bubble.classList.add('animate-speech');
      }

      const mascot = getMascot();
      if (mascot) {
        mascot.setStateTemp('speaking', 3200);
        updateMoodPillUI('speaking');
        setTimeout(() => updateMoodPillUI(state.mood), 3200);
      }
    });
  }
}

export function setupDiagnosticsAndFps() {
  const fpsBadge = document.getElementById('stage-fps-counter');
  let frameCount = 0;
  let lastTime = performance.now();

  function calcFps(now) {
    frameCount++;
    if (now - lastTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (now - lastTime));
      if (fpsBadge) fpsBadge.textContent = `FPS: ${Math.min(fps, 60)}`;
      frameCount = 0;
      lastTime = now;
    }
    requestAnimationFrame(calcFps);
  }
  requestAnimationFrame(calcFps);
}

