// ============================================================
// Kumo Mascot Preview Runner Logic
// ============================================================

import { createMascot } from '../index.js';
import { PALETTES_2D } from '../mascot-2d.js';
import { PALETTES_3D } from '../mascot-3d.js';

let currentType = '3d';
let currentGeo = 'voxel';
let currentState = 'idle';
let currentPalette = 'Classic Cyan';

const canvas = document.getElementById('preview-canvas');
const badge = document.getElementById('badge');
const geoGroup = document.getElementById('geo-group');
const palRow = document.getElementById('palette-row');

let mascot = createMascot(canvas, {
  type: currentType,
  state: currentState,
  geometryMode: currentGeo,
  palette: currentPalette,
  speed: 1.0,
  squish: 1.0,
  trackGaze: true,
  smile: true,
});

canvas.addEventListener('click', () => {
  mascot.triggerPoke();
});

function updateBadge() {
  const label =
    currentType === '2d'
      ? '2D RETRO CLOUD (PUFF)'
      : currentGeo === 'voxel'
      ? '3D VOXEL BOT'
      : '3D SMOOTH MOCHI';
  badge.textContent = `${label} · ${currentState.toUpperCase()}`;
}

function renderPalettes() {
  palRow.innerHTML = '';
  if (currentType === '2d') {
    const list = [
      ['Sky', '#7dd3fc'],
      ['Peach', '#f472b6'],
      ['Lilac', '#c084fc'],
      ['Mint', '#6ee7b7'],
      ['Butter', '#fde047'],
      ['Cloud', '#e2e8f0'],
    ];
    if (!list.some(([name]) => name === currentPalette)) currentPalette = 'Sky';
    list.forEach(([name, hex]) => {
      const btn = document.createElement('button');
      btn.className = `pal-swatch${name === currentPalette ? ' on' : ''}`;
      btn.innerHTML = `<span class="dot" style="background:${hex}"></span> ${name}`;
      btn.onclick = () => {
        currentPalette = name;
        mascot.setPalette(name);
        renderPalettes();
      };
      palRow.appendChild(btn);
    });
  } else {
    const list = [
      ['Classic Cyan', '#38bdf8'],
      ['Peach Pink', '#f472b6'],
      ['Grape Slime', '#a78bfa'],
      ['Mint Jelly', '#34d399'],
    ];
    if (!list.some(([name]) => name === currentPalette)) currentPalette = 'Classic Cyan';
    list.forEach(([name, hex]) => {
      const btn = document.createElement('button');
      btn.className = `pal-swatch${name === currentPalette ? ' on' : ''}`;
      btn.innerHTML = `<span class="dot" style="background:${hex}"></span> ${name}`;
      btn.onclick = () => {
        currentPalette = name;
        mascot.setPalette(name);
        renderPalettes();
      };
      palRow.appendChild(btn);
    });
  }
}

// Global button click listeners
document.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-type], button[data-geo], button[data-st]');
  if (!btn) return;

  if (btn.dataset.type) {
    currentType = btn.dataset.type;
    document.querySelectorAll('[data-type]').forEach((b) => b.classList.toggle('on', b === btn));
    geoGroup.style.display = currentType === '2d' ? 'none' : 'flex';
    mascot.setType(currentType);
    renderPalettes();
    updateBadge();
  } else if (btn.dataset.geo) {
    currentGeo = btn.dataset.geo;
    document.querySelectorAll('[data-geo]').forEach((b) => b.classList.toggle('on', b === btn));
    mascot.setGeometryMode(currentGeo);
    updateBadge();
  } else if (btn.dataset.st) {
    currentState = btn.dataset.st;
    document.querySelectorAll('[data-st]').forEach((b) => b.classList.toggle('on', b === btn));
    mascot.setState(currentState);
    updateBadge();
  }
});

renderPalettes();
updateBadge();
