// ─────────────────────────────────────────────────────────────
// ui/studio/js/step-navigator.js — Navigation & Launch Controller
// ─────────────────────────────────────────────────────────────

import { state } from './wizard-state.js';

export const STEP_TITLES = {
  1: 'Step 1 of 4 • Connect Brain',
  2: 'Step 2 of 4 • Engine Selection',
  3: 'Step 3 of 4 • Persona & Palette',
  4: 'Step 4 of 4 • Hotkeys & Review'
};

export function setActiveStepTab(stepNum) {
  // 1. Update Header Badge
  const stepText = document.getElementById('wizard-step-text');
  if (stepText) {
    stepText.textContent = STEP_TITLES[stepNum] || `Step ${stepNum} of 4 Active`;
  }

  // 2. Toggle Step Panels Visibility
  for (let i = 1; i <= 4; i++) {
    const panel = document.getElementById(`step-panel-${i}`);
    if (panel) {
      if (i === stepNum) {
        panel.classList.remove('hidden');
        panel.classList.add('flex');
      } else {
        panel.classList.add('hidden');
        panel.classList.remove('flex');
      }
    }
  }

  // 3. Update Stepper Tabs Styling
  const keyInput = document.getElementById('api-key-input');
  const hasKey = !!(keyInput && keyInput.value.trim());

  document.querySelectorAll('.step-pill').forEach((btn) => {
    const num = parseInt(btn.getAttribute('data-step-num'), 10);
    const isActive = num === stepNum;
    const isPast = num < stepNum;
    const icon = btn.querySelector('.material-symbols-outlined');

    if (isActive) {
      btn.className = 'step-pill flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl transition-all font-label-md text-label-md bg-primary text-on-primary shadow-sm font-bold cursor-pointer';
      if (icon) {
        if (num === 1 && hasKey) {
          icon.className = 'material-symbols-outlined text-emerald-300 text-[15px]';
          icon.textContent = 'check_circle';
          icon.setAttribute('style', "font-variation-settings: 'FILL' 1;");
        } else {
          icon.className = 'material-symbols-outlined text-white text-[15px]';
          icon.removeAttribute('style');
        }
      }
    } else if (isPast) {
      btn.className = 'step-pill flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl transition-all font-label-md text-label-md bg-surface-container-lowest text-on-surface shadow-xs font-semibold cursor-pointer hover:bg-surface-container-high/60';
      if (icon) {
        if (num === 1 && hasKey) {
          icon.className = 'material-symbols-outlined text-emerald-600 text-[15px]';
          icon.textContent = 'check_circle';
          icon.setAttribute('style', "font-variation-settings: 'FILL' 1;");
        } else {
          icon.className = 'material-symbols-outlined text-secondary text-[15px]';
          icon.removeAttribute('style');
        }
      }
    } else {
      btn.className = 'step-pill flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl transition-all font-label-md text-label-md text-secondary hover:text-on-surface cursor-pointer hover:bg-surface-container-high/60';
      if (icon) {
        icon.className = 'material-symbols-outlined text-secondary text-[15px]';
        icon.removeAttribute('style');
        if (num === 1) icon.textContent = 'key';
      }
    }
  });

  // 4. Update Step 4 Summary if visiting step 4
  if (stepNum === 4) {
    const summaryEngine = document.getElementById('summary-engine');
    const summaryPalette = document.getElementById('summary-palette');
    const summaryPhysics = document.getElementById('summary-physics');
    const summaryBrain = document.getElementById('summary-brain');

    if (summaryEngine) {
      if (state.engine === 'cotton') summaryEngine.textContent = 'Cotton Cloud';
      else if (state.engine === '3d') summaryEngine.textContent = state.geometryMode === 'voxel' ? '3D Voxel Bot' : '3D Mochi Gel Bot';
      else if (state.engine === '2d') summaryEngine.textContent = '2D Pixel Cloud';
      else summaryEngine.textContent = state.engine;
    }
    if (summaryPalette) {
      summaryPalette.textContent = `${state.currentPaletteName || 'Lilac'} (${state.blushIntensity}%)`;
    }
    if (summaryPhysics) {
      const physicsCheck = document.getElementById('toggle-fluid-physics');
      summaryPhysics.textContent = physicsCheck?.checked ? 'Fluid 60fps' : 'Static Mode';
    }
    if (summaryBrain) {
      summaryBrain.textContent = hasKey ? 'API Connected' : 'Local AI / Offline';
      summaryBrain.className = hasKey ? 'font-label-sm text-label-sm font-bold text-emerald-600 truncate' : 'font-label-sm text-label-sm font-bold text-primary truncate';
    }
  }

  // 5. Stage column visibility: Do NOT show until Step 2!
  const stageCol = document.getElementById('companion-stage-column');
  const wizardLeftCol = document.getElementById('wizard-left-column');

  if (stageCol && wizardLeftCol) {
    if (stepNum === 1) {
      stageCol.classList.add('hidden');
      stageCol.classList.remove('flex');
      wizardLeftCol.className = 'lg:col-span-8 lg:col-start-3 bg-surface-container-lowest rounded-3xl border border-[#2e3b52]/10 shadow-[0px_8px_32px_-6px_rgba(46,59,82,0.08),0px_1px_3px_rgba(46,59,82,0.04)] p-6 sm:p-7 flex flex-col gap-6 transition-all duration-300';
    } else {
      stageCol.classList.remove('hidden');
      stageCol.classList.add('flex');
      wizardLeftCol.className = 'lg:col-span-7 bg-surface-container-lowest rounded-3xl border border-[#2e3b52]/10 shadow-[0px_8px_32px_-6px_rgba(46,59,82,0.08),0px_1px_3px_rgba(46,59,82,0.04)] p-6 sm:p-7 flex flex-col gap-6 transition-all duration-300';
      window.dispatchEvent(new Event('resize'));
    }
  }
}

export function setupNavigationAndLaunch() {
  document.querySelectorAll('.step-pill').forEach(stepBtn => {
    stepBtn.addEventListener('click', () => {
      const stepNum = parseInt(stepBtn.getAttribute('data-step-num'), 10);
      if (stepNum) {
        setActiveStepTab(stepNum);
      }
    });
  });

  document.querySelectorAll('[data-nav-step]').forEach(navBtn => {
    navBtn.addEventListener('click', () => {
      const targetStep = parseInt(navBtn.getAttribute('data-nav-step'), 10);
      if (targetStep) {
        setActiveStepTab(targetStep);
      }
    });
  });

  document.getElementById('btn-launch-canvas')?.addEventListener('click', async () => {
    const launchBtn = document.getElementById('btn-launch-canvas');
    if (launchBtn) {
      launchBtn.disabled = true;
      launchBtn.innerHTML = '<span class="material-symbols-outlined text-[20px] animate-spin">sync</span><span>Launching Kumo...</span>';
    }

    const keyInput = document.getElementById('api-key-input');
    const settingsPayload = {
      apiKey: keyInput ? keyInput.value.trim() : '',
      avatarType: state.engine,
      geometryMode: state.geometryMode,
      palette: state.engine === '3d' ? state.palette3d : state.palette2d,
      paletteName: state.currentPaletteName,
      firstRun: false,
    };

    if (window.goo?.saveSettings) {
      try {
        await window.goo.saveSettings(settingsPayload);
        if (window.goo.launchCompanion) {
          await window.goo.launchCompanion(settingsPayload);
        }
        if (window.goo.showOverlay) window.goo.showOverlay();
        if (window.goo.openBoard) window.goo.openBoard();
        if (window.goo.closeStudio) window.goo.closeStudio();
      } catch (err) {
        console.error('Failed to save settings or launch via IPC:', err);
        window.location.href = '/ui/board/index.html';
      }
    } else {
      window.location.href = '/ui/board/index.html';
    }
  });

  document.getElementById('btn-window-close')?.addEventListener('click', () => {
    if (window.goo?.closeStudio) {
      window.goo.closeStudio();
    } else if (window.goo?.openBoard) {
      window.goo.openBoard();
    } else {
      window.location.href = '/ui/board/index.html';
    }
  });
}

export async function loadSavedSettings(updateKeyStatus) {
  if (!window.goo?.getSettings) return;
  try {
    const settings = await window.goo.getSettings();
    if (!settings) return;

    if (settings.apiKey || settings.openRouterKey) {
      const key = settings.apiKey || settings.openRouterKey;
      const input = document.getElementById('api-key-input');
      if (input) input.value = key;
      if (updateKeyStatus) updateKeyStatus(key);
    }

    if (settings.avatarType === 'cotton') {
      document.getElementById('card-engine-cotton')?.click();
    } else if (settings.avatarType === '2d') {
      document.getElementById('card-engine-2d')?.click();
    } else if (settings.avatarType === '3d') {
      if (settings.geometryMode === 'voxel') {
        document.getElementById('card-engine-3d-voxel')?.click();
      } else {
        document.getElementById('card-engine-3d-smooth')?.click();
      }
    }
  } catch (err) {
    console.warn('Could not read existing settings:', err);
  }
}

