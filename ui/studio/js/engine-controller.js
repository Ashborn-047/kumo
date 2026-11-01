// ─────────────────────────────────────────────────────────────
// ui/studio/js/engine-controller.js — Mascot Engine Switcher
// ─────────────────────────────────────────────────────────────

import { state } from './wizard-state.js';

export function setupEngineSelector(getMascot) {
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

      const mascot = getMascot();
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

