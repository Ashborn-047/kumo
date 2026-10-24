// ── ui/board/js/canvas.js: Canvas Pan, Zoom & Viewport Controls ──

import { state } from './state.js';

export function updateTransform() {
  const stage = document.querySelector('#canvas-stage');
  if (stage) {
    stage.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.scale})`;
  }
  const disp = document.querySelector('#zoom-display') || document.querySelector('#btn-zoom-reset');
  if (disp) disp.textContent = `${Math.round(state.scale * 100)}%`;
}

export function initCanvasControls(onStatsUpdate) {
  const viewport = document.querySelector('#canvas-viewport');
  if (!viewport) return;

  // Zoom on wheel (Ctrl + Wheel or standard wheel)
  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newScale = Math.min(2.2, Math.max(0.4, state.scale * zoomFactor));

    const rect = viewport.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    state.panX = mouseX - (mouseX - state.panX) * (newScale / state.scale);
    state.panY = mouseY - (mouseY - state.panY) * (newScale / state.scale);
    state.scale = newScale;

    updateTransform();
    onStatsUpdate?.();
  }, { passive: false });

  // Pan via Space + Click or Middle Click or canvas drag
  viewport.addEventListener('mousedown', (e) => {
    if (e.target === viewport || e.target === document.querySelector('#canvas-stage') || e.button === 1 || e.spaceKey) {
      state.isPanning = true;
      viewport.classList.add('panning');
      state.startPan = { x: e.clientX - state.panX, y: e.clientY - state.panY };
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (state.isPanning) {
      state.panX = e.clientX - state.startPan.x;
      state.panY = e.clientY - state.startPan.y;
      updateTransform();
    }
  });

  window.addEventListener('mouseup', () => {
    if (state.isPanning) {
      state.isPanning = false;
      viewport.classList.remove('panning');
    }
  });

  // Zoom Buttons
  document.querySelector('#btn-zoom-in')?.addEventListener('click', () => {
    state.scale = Math.min(2.2, state.scale * 1.15);
    updateTransform();
    onStatsUpdate?.();
  });
  document.querySelector('#btn-zoom-out')?.addEventListener('click', () => {
    state.scale = Math.max(0.4, state.scale / 1.15);
    updateTransform();
    onStatsUpdate?.();
  });
  document.querySelector('#btn-zoom-fit')?.addEventListener('click', () => {
    state.scale = 1.0;
    state.panX = 0;
    state.panY = 0;
    updateTransform();
    onStatsUpdate?.();
  });
}
