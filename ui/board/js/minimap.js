// ============================================================
// ui/board/js/minimap.js — Radar Minimap & Zoom Display
// ============================================================

import { state } from './state.js';

const $ = (s) => document.querySelector(s);

export function updateMiniMap() {
  const layer = $('#radar-cards-layer');
  if (!layer) return;
  layer.innerHTML = '';
  state.cards.forEach((card) => {
    const dot = document.createElement('div');
    const nx = Math.max(2, Math.min(105, (card.x / 1400) * 115));
    const ny = Math.max(2, Math.min(58, (card.y / 1200) * 65));
    const nw = Math.max(12, Math.min(32, (card.width / 1400) * 80));
    const nh = 9;
    dot.style.position = 'absolute';
    dot.style.left = `${nx}px`;
    dot.style.top = `${ny}px`;
    dot.style.width = `${nw}px`;
    dot.style.height = `${nh}px`;
    dot.style.borderRadius = '2px';
    dot.style.border = '1px solid';
    if (card.type === 'launcher') {
      dot.style.backgroundColor = '#dcedff';
      dot.style.borderColor = '#bfdbfe';
    } else if (card.type === 'writer') {
      dot.style.backgroundColor = '#eadfff';
      dot.style.borderColor = '#e9d5ff';
    } else if (card.type === 'code') {
      dot.style.backgroundColor = '#dcf5e7';
      dot.style.borderColor = '#a7f3d0';
    } else if (card.type === 'design') {
      dot.style.backgroundColor = '#ffe9d6';
      dot.style.borderColor = '#fed7aa';
    } else {
      dot.style.backgroundColor = '#fff5c8';
      dot.style.borderColor = '#fde68a';
    }
    layer.appendChild(dot);
  });
}

export function updateZoomDisplay() {
  const display = $('#zoom-display');
  if (display) display.textContent = `${Math.round(state.scale * 100)}%`;
}

