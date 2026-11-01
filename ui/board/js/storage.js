// ============================================================
// ui/board/js/storage.js — State Persistence & Toasts
// ============================================================

import { state, BOARD_STORAGE_KEY, DEFAULT_CARDS } from './state.js';
import { updateMiniMap } from './minimap.js';

const $ = (s) => document.querySelector(s);

export function toast(msg) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove('on'), 2400);
}

export function saveState() {
  try {
    const json = JSON.stringify(state.cards);
    localStorage.setItem(BOARD_STORAGE_KEY, json);
    updateMiniMap();
    if (window.goo?.saveBoard) {
      window.goo.saveBoard({ id: 'kumo-main-board', name: 'Kumoboard', cards: state.cards, updated: Date.now() });
    }
  } catch (err) {
    console.warn('Save failed:', err);
  }
}

export function loadState() {
  try {
    // Purge legacy storage keys holding stale hardcoded mock data
    localStorage.removeItem('kumo:assistant_board_v5');
    localStorage.removeItem('kumo:assistant_board_v4');
    localStorage.removeItem('kumo:assistant_board_v3');
    localStorage.removeItem('kumo:assistant_board_v2');

    const raw = localStorage.getItem(BOARD_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.width >= 500) {
        state.cards = parsed
          .filter((c) => c && c.title !== 'Tool Card' && c.title !== 'Pinned Widget' && c.data?.text !== 'Tool Card' && c.data?.text !== 'Pinned Widget')
          .map((c) => {
            if (c.title && c.title.includes('Mochi')) {
              c.title = 'Kumo Companion & Theme Lab';
            }
            if (c.type === 'writer' && c.data) {
              if (c.data.prompt && c.data.prompt.includes('Rust microservice')) {
                c.data.prompt = '';
                c.data.response = '';
              }
            }
            if (c.type === 'code' && c.data) {
              if (c.data.output && c.data.output.includes('spatial-engine')) {
                c.data.output = '';
              }
            }
            if (c.type === 'notes' && c.data) {
              if (c.data.scratchText && c.data.scratchText.includes('cargo build')) {
                c.data.scratchText = '';
              }
              if (c.data.items && c.data.items.some((i) => i.text && i.text.includes('IPC socket listeners'))) {
                c.data.items = [
                  { id: `t-${Date.now()}-1`, text: 'Welcome to Kumoboard — Double-click to edit or check task', done: false, tag: 'TODO' }
                ];
              }
            }
            return c;
          });
        saveState();
        return;
      }
    }
  } catch (_) {}
  state.cards = JSON.parse(JSON.stringify(DEFAULT_CARDS));
}

