// ============================================================
// studio-controller.js — Stitch Companion Studio Controller
// Handles live speech phrases, mood states, reactive palette,
// cheek blush slider, and Launch companion IPC.
// ============================================================

const SPEECH_PHRASES = [
  '“Hi! I am <span class="font-bold text-primary">Kumo</span>, your desktop thinking buddy. Ready to pair-program and ideate together!”',
  '“Press <kbd class="px-1.5 py-0.5 rounded bg-surface-container text-on-surface font-semibold">Alt+Space</kbd> anywhere to summon me on your desktop!”',
  '“Spatial canvas ready. Drag and pin cards anywhere across your screens.”',
  '“All systems nominal. Let\'s build something awesome today!”',
  '“I\'m lightweight and cozy. Poke me anytime you need a quick brainstorm!”'
];

const PALETTES = {
  lilac:  { top: '#ffffff', mid: '#eadfff', bottom: '#dcedff' },
  sky:    { top: '#ffffff', mid: '#dcedff', bottom: '#bae0ff' },
  matcha: { top: '#ffffff', mid: '#dcf5e7', bottom: '#aee8c5' },
  peach:  { top: '#ffffff', mid: '#ffe9d6', bottom: '#fed0b2' },
  solar:  { top: '#ffffff', mid: '#fff5c8', bottom: '#fae792' },
};

let currentPhraseIndex = 0;
let currentPalette = 'lilac';
let currentBlush = 75;

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const apiKeyInput = document.getElementById('api-key-input');
  const btnToggleKey = document.getElementById('btn-toggle-key');
  const btnLaunch = document.getElementById('btn-launch-companion');
  const btnTestSpeech = document.getElementById('btn-test-speech');
  const speechText = document.getElementById('speech-bubble-text');
  const pokeContainer = document.getElementById('companion-poke-container');
  const blushSlider = document.getElementById('slider-blush');
  const blushDisplay = document.getElementById('blush-value-display');
  const btnClose = document.getElementById('btn-close-studio');
  const cloudSvg = document.querySelector('.animate-mochi');

  // Load existing settings if available
  try {
    const saved = await window.goo?.getSettings?.();
    if (saved?.apiKey && apiKeyInput) {
      apiKeyInput.value = saved.apiKey;
    }
  } catch (err) {
    console.warn('[Studio] Load settings note:', err);
  }

  // Toggle API key visibility
  if (btnToggleKey && apiKeyInput) {
    btnToggleKey.addEventListener('click', () => {
      const isPassword = apiKeyInput.type === 'password';
      apiKeyInput.type = isPassword ? 'text' : 'password';
      const icon = btnToggleKey.querySelector('.material-symbols-outlined');
      if (icon) icon.textContent = isPassword ? 'visibility_off' : 'visibility';
    });
  }

  // Test Speech Bubble phrase cycling
  function cycleSpeech() {
    currentPhraseIndex = (currentPhraseIndex + 1) % SPEECH_PHRASES.length;
    if (speechText) {
      speechText.innerHTML = SPEECH_PHRASES[currentPhraseIndex];
    }
  }

  if (btnTestSpeech) {
    btnTestSpeech.addEventListener('click', cycleSpeech);
  }

  // Poke reaction on cloud companion
  if (pokeContainer) {
    pokeContainer.addEventListener('click', () => {
      cycleSpeech();
      if (cloudSvg) {
        cloudSvg.classList.remove('animate-mochi');
        cloudSvg.style.transform = 'scale(0.9, 1.15) translateY(-10px)';
        setTimeout(() => {
          cloudSvg.style.transform = 'scale(1.15, 0.9) translateY(4px)';
          setTimeout(() => {
            cloudSvg.style.transform = '';
            cloudSvg.classList.add('animate-mochi');
          }, 180);
        }, 140);
      }
    });
  }

  // Mood State Buttons
  const moodButtons = document.querySelectorAll('[data-mood]');
  moodButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      moodButtons.forEach((b) => {
        b.className = 'px-2.5 py-1 rounded-lg hover:bg-surface-container text-secondary hover:text-on-surface font-label-sm text-label-sm flex items-center gap-1 transition-colors cursor-pointer';
      });
      btn.className = 'px-2.5 py-1 rounded-lg bg-primary-fixed text-primary font-label-sm text-label-sm font-bold shadow-xs flex items-center gap-1 cursor-pointer';

      const mood = btn.dataset.mood;
      if (mood === 'thinking') {
        speechText.innerHTML = '“Processing cognitive spatial graph…”';
      } else if (mood === 'speaking') {
        speechText.innerHTML = '“Streaming thoughts directly to your canvas…”';
      } else if (mood === 'happy') {
        speechText.innerHTML = '“Yay! Companion connected and ready!”';
      } else {
        speechText.innerHTML = SPEECH_PHRASES[0];
      }
    });
  });

  // Color Swatches
  const swatchButtons = document.querySelectorAll('[data-swatch]');
  swatchButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const swatchName = btn.dataset.swatch;
      if (!PALETTES[swatchName]) return;
      currentPalette = swatchName;

      swatchButtons.forEach((b) => {
        b.className = 'group relative flex flex-col items-center gap-1.5 p-2 rounded-xl bg-surface-container-lowest border border-outline-variant/40 hover:border-primary/50 transition-all cursor-pointer';
        const check = b.querySelector('.material-symbols-outlined');
        if (check) check.remove();
      });

      btn.className = 'group relative flex flex-col items-center gap-1.5 p-2 rounded-xl bg-surface-container-lowest border-2 border-primary shadow-xs transition-all cursor-pointer';
      const circle = btn.querySelector('div');
      if (circle && !circle.querySelector('.material-symbols-outlined')) {
        circle.innerHTML = '<span class="material-symbols-outlined text-primary text-[14px]">check</span>';
      }

      // Update cloud SVG gradient
      const pal = PALETTES[swatchName];
      const grad = document.getElementById('cloudBodyGrad');
      if (grad) {
        const stops = grad.querySelectorAll('stop');
        if (stops.length >= 3) {
          stops[0].setAttribute('stop-color', pal.top);
          stops[1].setAttribute('stop-color', pal.mid);
          stops[2].setAttribute('stop-color', pal.bottom);
        }
      }
    });
  });

  // Blush Slider
  if (blushSlider) {
    blushSlider.addEventListener('input', (e) => {
      currentBlush = parseInt(e.target.value, 10);
      if (blushDisplay) blushDisplay.textContent = `${currentBlush}%`;

      const opacity = currentBlush / 100;
      const blushLeft = document.getElementById('blushLeft');
      const blushRight = document.getElementById('blushRight');
      if (blushLeft) blushLeft.querySelector('stop')?.setAttribute('stop-opacity', opacity.toString());
      if (blushRight) blushRight.querySelector('stop')?.setAttribute('stop-opacity', opacity.toString());
    });
  }

  // Engine selection radio styling
  const engineCards = document.querySelectorAll('[data-engine-card]');
  engineCards.forEach((card) => {
    card.addEventListener('click', () => {
      engineCards.forEach((c) => {
        c.className = 'cursor-pointer relative p-4 rounded-2xl border border-outline-variant/50 bg-surface-container-lowest hover:border-primary/40 transition-all flex flex-col justify-between group';
      });
      card.className = 'cursor-pointer relative p-4 rounded-2xl border-2 border-primary bg-primary-fixed/20 shadow-sm transition-all flex flex-col justify-between';
    });
  });

  // Launch Kumo & Enter Canvas
  if (btnLaunch) {
    btnLaunch.addEventListener('click', async () => {
      btnLaunch.disabled = true;
      btnLaunch.innerHTML = '<span class="material-symbols-outlined text-[20px] animate-spin">progress_activity</span><span>Launching Kumo…</span>';

      const keyVal = apiKeyInput?.value?.trim() || '';

      try {
        if (window.goo?.launchCompanion) {
          await window.goo.launchCompanion({
            apiKey: keyVal,
            firstRun: false,
            palette: currentPalette,
            blush: currentBlush,
          });
        } else {
          await window.goo?.saveSettings?.({ apiKey: keyVal, firstRun: false });
          window.goo?.showOverlay?.();
          window.goo?.openBoard?.();
          window.goo?.closeStudio?.();
        }
      } catch (err) {
        console.error('Launch failed:', err);
        btnLaunch.disabled = false;
        btnLaunch.innerHTML = '<span class="material-symbols-outlined text-[20px]">rocket_launch</span><span>Launch Kumo &amp; Enter Canvas</span>';
      }
    });
  }

  // Close Studio button
  if (btnClose) {
    btnClose.addEventListener('click', () => {
      window.goo?.closeStudio?.();
    });
  }
});
