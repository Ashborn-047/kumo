// ─────────────────────────────────────────────────────────────
// ui/studio/js/palette-controller.js — Color Palettes, Blush & Squish
// ─────────────────────────────────────────────────────────────

import { state, PALETTE_GRADIENTS } from './wizard-state.js';

export function setupPaletteSwatches(getMascot) {
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
      const mascot = getMascot();
      if (mascot) {
        const targetPalette = state.engine === '3d' ? p3d : p2d;
        mascot.setPalette(targetPalette);
      }
    });
  });
}

export function setupBlushSlider(getMascot) {
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
      const mascot = getMascot();
      if (mascot?.activeEngine?.setBlushIntensity) {
        mascot.activeEngine.setBlushIntensity(val / 100);
      }
    });
  }
}

export function setupPhysicsToggle(getMascot) {
  const toggle = document.getElementById('toggle-fluid-physics');
  const diagStatus = document.getElementById('diag-physics-status');

  if (toggle) {
    toggle.addEventListener('change', () => {
      const enabled = toggle.checked;
      state.squish = enabled ? 1.0 : 0.0;
      const mascot = getMascot();
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

