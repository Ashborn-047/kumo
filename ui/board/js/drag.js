// ── ui/board/js/drag.js: Card Dragging & Elevation ──

import { state } from './state.js';

export function makeCardDraggable(el, card, onDragEnd) {
  // Bring to front on click
  el.addEventListener('mousedown', () => {
    document.querySelectorAll('.kumo-canvas-card').forEach((c) => c.classList.remove('selected'));
    el.classList.add('selected');
    card.zIndex = ++state.nextZIndex;
    el.style.zIndex = card.zIndex;
  });

  // Dragging Header
  const handle = el.querySelector(`[data-drag-handle="${card.id}"]`) || el.querySelector('[data-drag-handle]') || el;

  handle.addEventListener('mousedown', (e) => {
    if (e.target.closest('[data-act]') || e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.tagName === 'TEXTAREA') return;
    e.preventDefault();

    el.classList.add('dragging');
    const startX = e.clientX;
    const startY = e.clientY;
    const initialLeft = card.x;
    const initialTop = card.y;

    const onMove = (moveEvt) => {
      const deltaX = (moveEvt.clientX - startX) / state.scale;
      const deltaY = (moveEvt.clientY - startY) / state.scale;
      card.x = Math.round(initialLeft + deltaX);
      card.y = Math.round(initialTop + deltaY);
      el.style.left = `${card.x}px`;
      el.style.top = `${card.y}px`;
    };

    const onUp = () => {
      el.classList.remove('dragging');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      onDragEnd?.();
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  });
}
