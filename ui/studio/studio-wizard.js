// ─────────────────────────────────────────────────────────────
// KUMO STUDIO WIZARD CONTROLLER (ui/studio/studio-wizard.js)
// Real dynamic interactivity: hooks live 2D / 3D MascotController,
// reactive palette shaders, speech synthesis test, API key storage,
// step navigation, physics controls, and Electron IPC launch.
// ─────────────────────────────────────────────────────────────

import { MascotController } from '../mascot/index.js';

// Configuration state
const state = {
  engine: 'cotton', // 'cotton' | '3d' | '2d' | 'starlet'
  geometryMode: 'smooth', // 'smooth' | 'voxel'
  palette3d: 'Grape Slime',
  palette2d: 'Lilac',
  currentPaletteName: 'Lilac',
  mood: 'idle',
  smile: true,
  squish: 1.0,
  blushIntensity: 75,
};

let mascot = null;

// Speech test phrases
const SPEECH_PHRASES = [
  "“Hi! I am <span class='font-bold text-primary'>Kumo</span>, your desktop thinking buddy. Ready to pair-program and ideate together!”",
  "“All systems nominal. Press <kbd class='px-1.5 py-0.5 rounded bg-surface-container text-on-surface font-semibold'>Alt+Space</kbd> anywhere to summon me!”",
  "“Spatial canvas ready. Drag and pin cards anywhere across your screens.”",
  "“Switch me between 2D pixel and 3D jelly anytime in the top bar!”",
  "“Your local thinking buddy is fully connected and ready for work!”"
];
let phraseIndex = 0;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  initMascot();
  setupApiKeySection();
  setupEngineSelector();
  setupPaletteSwatches();
  setupBlushSlider();
  setupPhysicsToggle();
  setupMoodPills();
  setupSpeechBubble();
  setupDiagnosticsAndFps();
  setupNavigationAndLaunch();
  await loadSavedSettings();
  setActiveStepTab(1);
});

// ─────────────────────────────────────────────────────────────
// 1. MASCOT CONTROLLER INITIALIZATION
// ─────────────────────────────────────────────────────────────
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

    // Poking companion triggers bouncy reaction and speech
    const container = document.getElementById('companion-poke-container');
    if (container) {
      container.addEventListener('click', () => {
        triggerPoke();
      });
    }

    // Reset camera orbit button
    document.getElementById('btn-reset-orbit')?.addEventListener('click', () => {
      if (mascot?.activeEngine?.spherical) {
        mascot.activeEngine.spherical = { radius: 5.0, theta: 0.0, phi: Math.PI / 2.05 };
        mascot.activeEngine.updateCameraOrbit?.();
      }
    });

    // Resting smile toggle
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
  // Trigger poke on active engine
  if (mascot.activeEngine?.triggerPoke) {
    mascot.activeEngine.triggerPoke();
  }
  mascot.setStateTemp('happy', 1800);

  // Update mood pills visually
  updateMoodPillUI('happy');
  setTimeout(() => updateMoodPillUI(state.mood), 1800);

  // Friendly poke speech reaction
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

// ─────────────────────────────────────────────────────────────
// 2. CONNECT AI BRAIN (API KEY MANAGEMENT)
// ─────────────────────────────────────────────────────────────
async function setupApiKeySection() {
  const keyInput = document.getElementById('api-key-input');
  const toggleBtn = document.getElementById('btn-toggle-key-visibility');
  const toggleIcon = document.getElementById('key-visibility-icon');
  const retestBtn = document.getElementById('btn-retest-key');
  const statusBadge = document.getElementById('key-status-badge');

  // Initialize key status on load
  if (keyInput) {
    updateKeyStatus(keyInput.value.trim());
  }

  if (toggleBtn && keyInput && toggleIcon) {
    toggleBtn.addEventListener('click', () => {
      const isPass = keyInput.type === 'password';
      keyInput.type = isPass ? 'text' : 'password';
      toggleIcon.textContent = isPass ? 'visibility_off' : 'visibility';
    });
  }

  // Live save key on change
  if (keyInput) {
    keyInput.addEventListener('input', () => {
      const val = keyInput.value.trim();
      updateKeyStatus(val);
      if (window.goo?.saveSettings) {
        window.goo.saveSettings({ apiKey: val });
      }
    });
  }

  // Re-test button
  if (retestBtn) {
    retestBtn.addEventListener('click', async () => {
      const val = keyInput ? keyInput.value.trim() : '';
      if (statusBadge) {
        statusBadge.className = 'flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-label-sm text-label-sm font-semibold';
        statusBadge.innerHTML = '<span class="material-symbols-outlined text-[13px] animate-spin">sync</span> Validating...';
      }

      await new Promise(r => setTimeout(r, 600));

      if (!val) {
        if (statusBadge) {
          statusBadge.className = 'flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-label-sm text-label-sm font-semibold';
          statusBadge.innerHTML = '<span class="material-symbols-outlined text-[13px]">error</span> Key Required';
        }
        updateKeyStatus('');
      } else {
        if (statusBadge) {
          statusBadge.className = 'flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-label-sm text-label-sm font-semibold';
          statusBadge.innerHTML = '<span class="material-symbols-outlined text-[13px]" style="font-variation-settings: \'FILL\' 1;">check_circle</span> Verified & Connected';
        }
        updateKeyStatus(val);
      }
    });
  }

  // External link handler
  document.getElementById('link-openrouter')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (window.goo?.openExternal) {
      window.goo.openExternal('https://openrouter.ai');
    } else {
      window.open('https://openrouter.ai', '_blank');
    }
  });
}

function updateKeyStatus(val) {
  const statusBadge = document.getElementById('key-status-badge');

  if (!val) {
    if (statusBadge) {
      statusBadge.className = 'flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container text-secondary border border-outline-variant/40 font-label-sm text-label-sm font-medium';
      statusBadge.innerHTML = '<span class="material-symbols-outlined text-[13px]">key_off</span> Not Configured';
    }
  } else {
    if (statusBadge) {
      statusBadge.className = 'flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-label-sm text-label-sm font-semibold';
      statusBadge.innerHTML = '<span class="material-symbols-outlined text-[13px]" style="font-variation-settings: \'FILL\' 1;">check_circle</span> Key Saved';
    }
  }

  const activePill = document.querySelector('.step-pill.bg-primary');
  const currentActiveNum = activePill ? parseInt(activePill.getAttribute('data-step-num'), 10) : 1;
  setActiveStepTab(currentActiveNum);
}

const STEP_TITLES = {
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
      // Step 1: Hide right column completely, center the left card
      stageCol.classList.add('hidden');
      stageCol.classList.remove('flex');
      wizardLeftCol.className = 'lg:col-span-8 lg:col-start-3 bg-surface-container-lowest rounded-3xl border border-[#2e3b52]/10 shadow-[0px_8px_32px_-6px_rgba(46,59,82,0.08),0px_1px_3px_rgba(46,59,82,0.04)] p-6 sm:p-7 flex flex-col gap-6 transition-all duration-300';
    } else {
      // Step 2+: Reveal right column (companion stage), left card takes 7 columns
      stageCol.classList.remove('hidden');
      stageCol.classList.add('flex');
      wizardLeftCol.className = 'lg:col-span-7 bg-surface-container-lowest rounded-3xl border border-[#2e3b52]/10 shadow-[0px_8px_32px_-6px_rgba(46,59,82,0.08),0px_1px_3px_rgba(46,59,82,0.04)] p-6 sm:p-7 flex flex-col gap-6 transition-all duration-300';

      // Dispatch window resize so mascot canvas / Three.js buffer adjusts smoothly
      window.dispatchEvent(new Event('resize'));
    }
  }
}

// ─────────────────────────────────────────────────────────────
// 3. ENGINE SELECTOR (5 PERSONAS: COTTON, 3D SMOOTH, 3D VOXEL, 2D PIXEL, STARLET)
// ─────────────────────────────────────────────────────────────
const PALETTE_GRADIENTS = {
  'Lilac': { stop0: '#FFFFFF', stop75: '#F2EBFF', stop100: '#E2EEFF' },
  'Peach': { stop0: '#FFFFFF', stop75: '#FFE8EF', stop100: '#FFD6E0' },
  'Sky': { stop0: '#FFFFFF', stop75: '#E0F2FE', stop100: '#BAE6FD' },
  'Mint': { stop0: '#FFFFFF', stop75: '#E6FBF0', stop100: '#A7F3D0' },
  'Grape Slime': { stop0: '#FFFFFF', stop75: '#F3E8FF', stop100: '#DDD6FE' },
  'Peach Pink': { stop0: '#FFFFFF', stop75: '#FDF2F8', stop100: '#FBCFE8' },
  'Classic Cyan': { stop0: '#FFFFFF', stop75: '#ECFEFF', stop100: '#A5F3FC' },
  'Mint Jelly': { stop0: '#FFFFFF', stop75: '#ECFDF5', stop100: '#A7F3D0' },
};

function setupEngineSelector() {
  const cardCotton = document.getElementById('card-engine-cotton');
  const card3dSmooth = document.getElementById('card-engine-3d-smooth');
  const card3dVoxel = document.getElementById('card-engine-3d-voxel');
  const card2d = document.getElementById('card-engine-2d');

  const tagCotton = document.getElementById('tag-engine-cotton');
  const tag3dSmooth = document.getElementById('tag-engine-3d-smooth');
  const tag3dVoxel = document.getElementById('tag-engine-3d-voxel');
  const tag2d = document.getElementById('tag-engine-2d');

  const iconCotton = document.getElementById('icon-engine-cotton');
  const icon3dSmooth = document.getElementById('icon-engine-3d-smooth');
  const icon3dVoxel = document.getElementById('icon-engine-3d-voxel');
  const icon2d = document.getElementById('icon-engine-2d');

  const engineBanner = document.getElementById('stage-engine-banner');

  const variants = [
    {
      id: 'cotton',
      card: cardCotton,
      tag: tagCotton,
      icon: iconCotton,
      type: 'cotton',
      geom: null,
      banner: 'Vector SVG / Soft Pastel Cloud',
    },
    {
      id: '3d-smooth',
      card: card3dSmooth,
      tag: tag3dSmooth,
      icon: icon3dSmooth,
      type: '3d',
      geom: 'smooth',
      banner: 'WebGL 2.0 / Smooth Gelatin Dome',
    },
    {
      id: '3d-voxel',
      card: card3dVoxel,
      tag: tag3dVoxel,
      icon: icon3dVoxel,
      type: '3d',
      geom: 'voxel',
      banner: 'WebGL 2.0 / Tactile 3D Voxel Cubes',
    },
    {
      id: '2d',
      card: card2d,
      tag: tag2d,
      icon: icon2d,
      type: '2d',
      geom: null,
      banner: 'Canvas 2D / Retro Bayer Dither',
    },
  ];

  function setStageActive(target) {
    const cotton = document.getElementById('stage-cotton-cloud');
    const canvasContainer = document.getElementById('stage-canvas-container');
    const canvas = document.getElementById('studio-mascot-canvas');

    // Strictly hide all stage mounts first
    if (cotton) cotton.classList.add('hidden');
    if (canvasContainer) canvasContainer.classList.add('hidden');
    if (canvas) canvas.classList.add('hidden');

    // Activate only the selected mascot mount
    if (target === 'cotton') {
      cotton?.classList.remove('hidden');
    } else if (target === 'canvas') {
      canvasContainer?.classList.remove('hidden');
      // If canvas was recreated by MascotController, retrieve fresh reference
      const freshCanvas = document.getElementById('studio-mascot-canvas');
      freshCanvas?.classList.remove('hidden');
    }
  }

  function selectEngine(variantId) {
    const item = variants.find(v => v.id === variantId) || variants[0];
    state.engine = item.type;
    state.geometryMode = item.geom || 'smooth';

    variants.forEach(v => {
      const active = v.id === variantId;
      if (v.card) {
        v.card.className = active
          ? 'cursor-pointer relative p-3 rounded-2xl border-2 border-primary bg-primary-fixed/20 shadow-sm transition-all flex flex-col justify-between'
          : 'cursor-pointer relative p-3 rounded-2xl border border-outline-variant/50 bg-surface-container-lowest hover:border-primary/40 transition-all flex flex-col justify-between group';
      }
      if (v.tag) {
        v.tag.className = active
          ? 'font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-primary text-on-primary font-bold text-[10px]'
          : 'hidden';
      }
      if (v.icon) {
        v.icon.className = active
          ? 'w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center'
          : 'w-5 h-5 rounded-full border-2 border-outline-variant flex items-center justify-center';
        v.icon.innerHTML = active ? '<span class="material-symbols-outlined text-[13px]">check</span>' : '';
      }
    });

    if (engineBanner) {
      engineBanner.textContent = item.banner;
    }

    // Toggle Stage Viewports strictly
    if (item.id === 'cotton') {
      setStageActive('cotton');
    } else {
      setStageActive('canvas');

      if (mascot) {
        mascot.setType(item.type);
        if (item.type === '3d') {
          mascot.setGeometryMode(item.geom);
        }
        const targetPalette = item.type === '3d' ? state.palette3d : state.palette2d;
        mascot.setPalette(targetPalette);
      }
    }
  }

  cardCotton?.addEventListener('click', () => selectEngine('cotton'));
  card3dSmooth?.addEventListener('click', () => selectEngine('3d-smooth'));
  card3dVoxel?.addEventListener('click', () => selectEngine('3d-voxel'));
  card2d?.addEventListener('click', () => selectEngine('2d'));
}

// ─────────────────────────────────────────────────────────────
// 4. COLOR PALETTES & BLUSH SLIDER
// ─────────────────────────────────────────────────────────────
function setupPaletteSwatches() {
  const swatches = document.querySelectorAll('[data-palette-swatch]');
  swatches.forEach(btn => {
    btn.addEventListener('click', () => {
      const p3d = btn.getAttribute('data-palette-3d') || 'Grape Slime';
      const p2d = btn.getAttribute('data-palette-2d') || 'Lilac';
      const name = btn.getAttribute('data-palette-name') || 'Lilac';

      state.palette3d = p3d;
      state.palette2d = p2d;
      state.currentPaletteName = name;

      // Update swatch active outlines
      swatches.forEach(s => {
        s.className = 'group relative flex flex-col items-center gap-1.5 p-2 rounded-xl bg-surface-container-lowest border border-outline-variant/40 hover:border-primary/50 transition-all cursor-pointer';
        const check = s.querySelector('.swatch-check');
        if (check) check.remove();
        const inner = s.querySelector('.swatch-dot');
        if (inner) inner.className = 'swatch-dot w-8 h-8 rounded-full shadow-inner';
      });

      btn.className = 'group relative flex flex-col items-center gap-1.5 p-2 rounded-xl bg-surface-container-lowest border-2 border-primary shadow-xs transition-all cursor-pointer';
      const inner = btn.querySelector('.swatch-dot');
      if (inner) {
        inner.className = 'swatch-dot w-8 h-8 rounded-full shadow-inner ring-2 ring-primary flex items-center justify-center';
        const check = document.createElement('span');
        check.className = 'swatch-check material-symbols-outlined text-primary text-[14px]';
        check.textContent = 'check';
        inner.appendChild(check);
      }

      // Update Cotton Cloud SVG gradient stops
      const grad = PALETTE_GRADIENTS[name] || PALETTE_GRADIENTS[p2d] || PALETTE_GRADIENTS['Lilac'];
      if (grad) {
        document.getElementById('cotton-grad-0')?.setAttribute('stop-color', grad.stop0);
        document.getElementById('cotton-grad-75')?.setAttribute('stop-color', grad.stop75);
        document.getElementById('cotton-grad-100')?.setAttribute('stop-color', grad.stop100);
      }

      // Live update mascot palette
      if (mascot) {
        const targetPalette = state.engine === '3d' ? p3d : p2d;
        mascot.setPalette(targetPalette);
      }
    });
  });
}

function setupBlushSlider() {
  const slider = document.getElementById('slider-blush');
  const label = document.getElementById('slider-blush-label');

  if (slider && label) {
    slider.addEventListener('input', () => {
      const val = parseInt(slider.value, 10);
      state.blushIntensity = val;
      label.textContent = `${val}%`;

      const opacity = (val / 100) * 0.9;
      const blushL = document.getElementById('cotton-blush-left');
      const blushR = document.getElementById('cotton-blush-right');
      if (blushL) blushL.setAttribute('opacity', opacity);
      if (blushR) blushR.setAttribute('opacity', opacity);

      // Dynamically adjust blush opacity on mascot controller
      if (mascot?.activeEngine?.setBlushIntensity) {
        mascot.activeEngine.setBlushIntensity(val / 100);
      }
    });
  }
}

function setupPhysicsToggle() {
  const toggle = document.getElementById('toggle-fluid-physics');
  const diagStatus = document.getElementById('diag-physics-status');

  if (toggle) {
    toggle.addEventListener('change', () => {
      const enabled = toggle.checked;
      state.squish = enabled ? 1.0 : 0.0;
      mascot?.setSquish?.(state.squish);

      if (diagStatus) {
        diagStatus.textContent = enabled ? 'Optimal' : 'Damped';
        diagStatus.className = enabled
          ? 'font-label-sm text-label-sm px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold'
          : 'font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container text-secondary font-semibold';
      }
    });
  }
}

// ─────────────────────────────────────────────────────────────
// 5. MOOD STATE PILLS
// ─────────────────────────────────────────────────────────────
function applyMoodToVector(mood) {
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

function setupMoodPills() {
  const pills = document.querySelectorAll('[data-mood]');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const mood = pill.getAttribute('data-mood') || 'idle';
      state.mood = mood;
      updateMoodPillUI(mood);
      applyMoodToVector(mood);

      if (mascot) {
        mascot.setState(mood);
      }
    });
  });
}

function updateMoodPillUI(activeMood) {
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

// ─────────────────────────────────────────────────────────────
// 6. SPEECH BUBBLE & VOICE SYNTHESIS TEST
// ─────────────────────────────────────────────────────────────
function setupSpeechBubble() {
  const testSpeechBtn = document.getElementById('btn-test-speech');
  const bubbleText = document.getElementById('speech-bubble-text');
  const waveform = document.getElementById('speech-waveform');

  if (testSpeechBtn && bubbleText) {
    testSpeechBtn.addEventListener('click', () => {
      phraseIndex = (phraseIndex + 1) % SPEECH_PHRASES.length;
      bubbleText.innerHTML = SPEECH_PHRASES[phraseIndex];

      // Pop animation on speech bubble
      const bubble = document.getElementById('speech-bubble-card');
      if (bubble) {
        bubble.classList.remove('animate-speech');
        void bubble.offsetWidth; // reflow
        bubble.classList.add('animate-speech');
      }

      // Mascot speaks for 3 seconds
      if (mascot) {
        mascot.setStateTemp('speaking', 3200);
        updateMoodPillUI('speaking');
        setTimeout(() => updateMoodPillUI(state.mood), 3200);
      }
    });
  }
}

// ─────────────────────────────────────────────────────────────
// 7. DIAGNOSTICS & LIVE FPS COUNTER
// ─────────────────────────────────────────────────────────────
function setupDiagnosticsAndFps() {
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

// ─────────────────────────────────────────────────────────────
// 8. NAVIGATION, STEPPERS & LAUNCH BUTTON
// ─────────────────────────────────────────────────────────────
function setupNavigationAndLaunch() {
  // Stepper pill clicks
  document.querySelectorAll('.step-pill').forEach(stepBtn => {
    stepBtn.addEventListener('click', () => {
      const stepNum = parseInt(stepBtn.getAttribute('data-step-num'), 10);
      if (stepNum) {
        setActiveStepTab(stepNum);
      }
    });
  });

  // Dedicated Next, Back, and Skip navigation buttons
  document.querySelectorAll('[data-nav-step]').forEach(navBtn => {
    navBtn.addEventListener('click', () => {
      const targetStep = parseInt(navBtn.getAttribute('data-nav-step'), 10);
      if (targetStep) {
        setActiveStepTab(targetStep);
      }
    });
  });

  // Launch Button
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
      // Browser preview fallback
      window.location.href = '/ui/board/index.html';
    }
  });

  // Window close button
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

// ─────────────────────────────────────────────────────────────
// 9. LOAD SAVED SETTINGS FROM DISK / MAIN PROCESS
// ─────────────────────────────────────────────────────────────
async function loadSavedSettings() {
  if (!window.goo?.getSettings) return;
  try {
    const settings = await window.goo.getSettings();
    if (!settings) return;

    if (settings.apiKey || settings.openRouterKey) {
      const key = settings.apiKey || settings.openRouterKey;
      const input = document.getElementById('api-key-input');
      if (input) input.value = key;
      updateKeyStatus(key);
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
