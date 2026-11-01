// ─────────────────────────────────────────────────────────────
// KUMO STUDIO WIZARD CONTROLLER (ui/studio/studio-wizard.js)
// Coordinator for live 2D / 3D MascotController, reactive shaders,
// speech test, API key storage, step navigation, and launch IPC.
// ─────────────────────────────────────────────────────────────

import { MascotController } from '../mascot/index.js';
import { state } from './js/wizard-state.js';
import { setupApiKeySection, updateKeyStatus } from './js/api-key-controller.js';
import { setupEngineSelector } from './js/engine-controller.js';
import { setupPaletteSwatches, setupBlushSlider, setupPhysicsToggle } from './js/palette-controller.js';
import { setupMoodPills, updateMoodPillUI, setupSpeechBubble, setupDiagnosticsAndFps } from './js/mood-controller.js';
import { setActiveStepTab, setupNavigationAndLaunch, loadSavedSettings } from './js/step-navigator.js';

let mascot = null;
const getMascot = () => mascot;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  initMascot();
  setupApiKeySection();
  setupEngineSelector(getMascot);
  setupPaletteSwatches(getMascot);
  setupBlushSlider(getMascot);
  setupPhysicsToggle(getMascot);
  setupMoodPills(getMascot);
  setupSpeechBubble(getMascot);
  setupDiagnosticsAndFps();
  setupNavigationAndLaunch();
  await loadSavedSettings(updateKeyStatus);
  setActiveStepTab(1);
});

function initMascot() {
  const canvas = document.getElementById('studio-mascot-canvas');
  if (!canvas) {
    console.error('Mascot canvas #studio-mascot-canvas not found');
    return;
  }

  try {
    mascot = new MascotController(canvas, {
      type: state.engine,
      geometryMode: state.geometryMode,
      palette: state.engine === '3d' ? state.palette3d : state.palette2d,
      state: state.mood,
      speed: 1.0,
      squish: state.squish,
      trackGaze: true,
      smile: state.smile,
    });

    const container = document.getElementById('companion-poke-container');
    if (container) {
      container.addEventListener('click', () => {
        triggerPoke();
      });
    }

    document.getElementById('btn-reset-orbit')?.addEventListener('click', () => {
      if (mascot?.activeEngine?.spherical) {
        mascot.activeEngine.spherical = { radius: 5.0, theta: 0.0, phi: Math.PI / 2.05 };
        mascot.activeEngine.updateCameraOrbit?.();
      }
    });

    const smileBtn = document.getElementById('btn-toggle-smile');
    if (smileBtn) {
      smileBtn.addEventListener('click', () => {
        state.smile = !state.smile;
        mascot?.setSmile?.(state.smile);
        const indicator = smileBtn.querySelector('.status-dot');
        if (indicator) {
          indicator.className = `status-dot w-2 h-2 rounded-full ${state.smile ? 'bg-emerald-500' : 'bg-outline-variant'}`;
        }
      });
    }
  } catch (err) {
    console.error('Failed to initialize MascotController:', err);
  }
}

function triggerPoke() {
  if (!mascot) return;
  if (mascot.activeEngine?.triggerPoke) {
    mascot.activeEngine.triggerPoke();
  }
  mascot.setStateTemp('happy', 1800);

  updateMoodPillUI('happy');
  setTimeout(() => updateMoodPillUI(state.mood), 1800);

  const bubbleText = document.getElementById('speech-bubble-text');
  if (bubbleText) {
    const pokePhrases = [
      "“Boing! Hehe, that tickles!”",
      "“Squish! Ready for action!”",
      "“Wobbly gelatin physics in full effect!”"
    ];
    bubbleText.innerHTML = pokePhrases[Math.floor(Math.random() * pokePhrases.length)];
  }
}

export { setActiveStepTab };
