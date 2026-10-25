// ============================================================
// Kumoboard — Assistant Workbench Main Entry Point
// Exact Stitch Design Integration
// ============================================================

import { state, BOARD_STORAGE_KEY, DEFAULT_CARDS } from './js/state.js';
import { initCanvasControls, updateTransform } from './js/canvas.js';
import { makeCardDraggable } from './js/drag.js';
import { initCommandPalette } from './js/command.js';
import { renderLauncherHTML, attachLauncherEvents } from './js/tools/launcher-tool.js';
import { renderWriterHTML, attachWriterEvents } from './js/tools/writer-tool.js';
import { renderCodeHTML, attachCodeEvents } from './js/tools/code-tool.js';
import { renderDesignHTML, attachDesignEvents } from './js/tools/design-tool.js';
import { renderNotesHTML, attachNotesEvents } from './js/tools/notes-tool.js';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

// ── Toast Notification ──
export function toast(msg) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove('on'), 2400);
}

// ── State Persistence ──
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
    const raw = localStorage.getItem(BOARD_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.width >= 500) {
        state.cards = parsed;
        return;
      }
    }
  } catch (_) {}
  state.cards = JSON.parse(JSON.stringify(DEFAULT_CARDS));
}

// ── Dynamic Mini-Map ──
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

// ── Render Cards Matching Exact Stitch Specifications ──
export function renderCards() {
  const stage = $('#canvas-stage');
  if (!stage) return;
  stage.innerHTML = '';

  state.cards.forEach((card) => {
    if (state.activeFilter !== 'all' && card.type !== state.activeFilter) return;

    const el = document.createElement('div');
    if (card.type === 'notes') {
      el.className = 'kumo-canvas-card bg-[#fff5c8] rounded-xl border border-amber-200/70 shadow-lg transform -rotate-1 hover:rotate-0 transition-transform duration-200 relative flex flex-col justify-between select-text';
    } else {
      el.className = 'kumo-canvas-card bg-surface-container-lowest rounded-2xl border border-slate-200/70 card-shadow transition-transform hover:-translate-y-0.5 duration-200 flex flex-col overflow-hidden select-text';
    }

    el.id = card.id;
    el.style.position = 'absolute';
    el.style.left = `${card.x}px`;
    el.style.top = `${card.y}px`;
    el.style.width = `${card.width}px`;
    el.style.zIndex = card.zIndex || 1;

    let bodyHTML = '';
    switch (card.type) {
      case 'launcher': bodyHTML = renderLauncherHTML(card); break;
      case 'writer':   bodyHTML = renderWriterHTML(card); break;
      case 'code':     bodyHTML = renderCodeHTML(card); break;
      case 'design':   bodyHTML = renderDesignHTML(card); break;
      case 'notes':    bodyHTML = renderNotesHTML(card); break;
      default:         bodyHTML = `<div class="p-4">${card.data?.text || 'Tool Card'}</div>`;
    }

    el.innerHTML = bodyHTML;
    stage.appendChild(el);

    // Attach dragging
    makeCardDraggable(el, card, saveState);

    // Minimize & Delete
    el.querySelector('[data-act="min"]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      el.classList.toggle('minimized');
    });

    el.querySelector('[data-act="del"]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      state.cards = state.cards.filter((c) => c.id !== card.id);
      renderCards();
      saveState();
      toast(`Closed ${card.title}`);
    });

    // Wire tool-specific events
    switch (card.type) {
      case 'launcher': attachLauncherEvents(el, card, saveState, toast); break;
      case 'writer':   attachWriterEvents(el, card, saveState, toast); break;
      case 'code':     attachCodeEvents(el, card, saveState, toast); break;
      case 'design':   attachDesignEvents(el, card, saveState, toast); break;
      case 'notes':    attachNotesEvents(el, card, saveState); break;
    }
  });

  updateMiniMap();
}

// ── Tool Creation Factory ──
export function addNewTool(type, extra = {}) {
  const id = `card-${type}-${Date.now()}`;
  const centerX = Math.round((-state.panX + 160) / state.scale);
  const centerY = Math.round((-state.panY + 120) / state.scale);

  let newCard = null;
  switch (type) {
    case 'launcher':
      newCard = { id, type, title: 'System & App Launcher', x: centerX, y: centerY, width: 540, data: { activeTab: 'apps', searchQuery: '', searchResults: [], clipboardText: '' }, zIndex: ++state.nextZIndex };
      break;
    case 'writer':
      newCard = { id, type, title: extra.title || 'Writing & AI Drafting Suite', x: centerX, y: centerY, width: 540, data: { activeTab: 'editor', text: extra.text || '', summary: '', wordCount: 0 }, zIndex: ++state.nextZIndex };
      break;
    case 'code':
      newCard = { id, type, title: extra.title || 'PowerShell & Scripts Sandbox', x: centerX, y: centerY, width: 560, data: { activeTab: 'editor', language: 'powershell', code: extra.code || '', output: '' }, zIndex: ++state.nextZIndex };
      break;
    case 'design':
      newCard = { id, type, title: 'Design Studio', x: centerX, y: centerY, width: 540, data: { activeTab: 'tokens', paletteIndex: 0, svgCode: '' }, zIndex: ++state.nextZIndex };
      break;
    case 'notes':
      newCard = { id, type, title: extra.title || 'Workspace Sticky Note', x: centerX, y: centerY, width: 500, data: { activeTab: 'checklist', items: extra.text ? [{ text: extra.text, done: false }] : [], scratchText: '' }, zIndex: ++state.nextZIndex };
      break;
  }

  if (newCard) {
    state.cards.unshift(newCard);
    renderCards();
    saveState();
    toast(`Added ${newCard.title}`);
  }
}

// ── Filter Bar Initializers ──
function initFilters() {
  $$('.nav-filter-btn').forEach((btn) => {
    btn.onclick = () => {
      $$('.nav-filter-btn').forEach((b) => {
        b.className = 'nav-filter-btn text-secondary dark:text-secondary-fixed hover:text-on-surface dark:hover:text-inverse-on-surface rounded-full px-3 py-1.5 transition-all text-label-md font-label-md flex items-center gap-1.5 hover:bg-surface-container-high/60 active:scale-95';
      });
      btn.className = 'nav-filter-btn text-primary dark:text-inverse-primary bg-primary-fixed dark:bg-primary-container font-semibold rounded-full px-3 py-1.5 transition-all text-label-md font-label-md flex items-center gap-1.5 active:scale-95';
      state.activeFilter = btn.dataset.filter;
      renderCards();
    };
  });
}

// ── Floating Actions & HUD Initializers ──
function initFloatingActions() {
  const addBtn = $('#btn-add-tool');
  if (addBtn) {
    addBtn.onclick = () => {
      addNewTool('launcher');
    };
  }

  // Open Studio & Customizer
  $('#btn-settings')?.addEventListener('click', () => {
    window.goo?.openStudio?.('studio');
  });

  // Open Permissions & Security Modal
  $('#btn-permissions')?.addEventListener('click', () => {
    openPermissionsModal();
  });

  // Topbar Quick App Launchers
  $$('.topbar-quick-app').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const appKey = btn.dataset.app;
      toast(`Assistant launching ${appKey}…`);
      try {
        const res = await window.goo?.action?.('app.open', { name: appKey });
        if (res?.ok) {
          toast(`✓ ${appKey} launched`);
        } else if (res?.error) {
          toast(`⚠ ${res.error}`);
        }
      } catch (err) {
        toast(`Could not open ${appKey}`);
      }
    });
  });
}

// ── Permissions & Security Modal ──
async function openPermissionsModal() {
  const modal = $('#modal-permissions');
  if (!modal) return;
  modal.classList.remove('hidden');

  // Load existing permissions
  try {
    const cfg = await window.goo?.getSettings?.();
    const perms = cfg?.permissions || {};
    if ($('#perm-app-launch')) $('#perm-app-launch').checked = perms.appLaunch !== false;
    if ($('#perm-clipboard'))  $('#perm-clipboard').checked  = perms.clipboardAccess !== false;
    if ($('#perm-shell'))      $('#perm-shell').checked      = perms.shellSandbox !== false;
    if ($('#perm-files'))      $('#perm-files').checked      = perms.fileSearch !== false;
    if ($('#perm-system'))     $('#perm-system').checked     = perms.systemInfo !== false;
  } catch (err) {
    console.warn('Failed to load permissions:', err);
  }
}

function closePermissionsModal() {
  const modal = $('#modal-permissions');
  if (modal) modal.classList.add('hidden');
  const testOut = $('#perm-test-output');
  if (testOut) testOut.classList.add('hidden');
}

function initPermissionsModal() {
  $('#btn-close-permissions')?.addEventListener('click', closePermissionsModal);
  $('#btn-cancel-permissions')?.addEventListener('click', closePermissionsModal);

  // Close on backdrop click
  $('#modal-permissions')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-permissions') closePermissionsModal();
  });

  // Save Permissions
  $('#btn-save-permissions')?.addEventListener('click', async () => {
    const updated = {
      appLaunch:       $('#perm-app-launch')?.checked ?? true,
      clipboardAccess: $('#perm-clipboard')?.checked ?? true,
      shellSandbox:    $('#perm-shell')?.checked ?? true,
      fileSearch:      $('#perm-files')?.checked ?? true,
      systemInfo:      $('#perm-system')?.checked ?? true,
      browserOpen:     true,
    };
    try {
      await window.goo?.saveSettings?.({ permissions: updated });
      toast('🛡️ Assistant permissions updated & active');
      closePermissionsModal();
    } catch (err) {
      toast('Failed to save permissions');
    }
  });

  // Reset Permissions
  $('#btn-reset-permissions')?.addEventListener('click', () => {
    if ($('#perm-app-launch')) $('#perm-app-launch').checked = true;
    if ($('#perm-clipboard'))  $('#perm-clipboard').checked  = true;
    if ($('#perm-shell'))      $('#perm-shell').checked      = true;
    if ($('#perm-files'))      $('#perm-files').checked      = true;
    if ($('#perm-system'))     $('#perm-system').checked     = true;
    toast('Permissions reset to recommended defaults');
  });

  // Test Assistant Capabilities
  $$('.test-perm-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const act = btn.dataset.action;
      const testOut = $('#perm-test-output');
      if (!testOut) return;
      testOut.classList.remove('hidden');
      testOut.textContent = `[Testing ${act}...] Executing through Safety Gate...`;

      try {
        let res;
        if (act === 'app') {
          res = await window.goo?.action?.('app.open', { name: btn.dataset.name || 'calc' });
        } else if (act === 'clipboard') {
          res = await window.goo?.action?.('clipboard.read');
        } else if (act === 'system') {
          res = await window.goo?.action?.('system.info');
        }
        testOut.textContent = JSON.stringify(res, null, 2);
      } catch (err) {
        testOut.textContent = `Error: ${err.message}`;
      }
    });
  });
}

function updateZoomDisplay() {
  const display = $('#zoom-display');
  if (display) display.textContent = `${Math.round(state.scale * 100)}%`;
}

// ── Boot ──
(async () => {
  loadState();
  initCanvasControls(updateZoomDisplay);
  initFilters();
  initFloatingActions();
  initPermissionsModal();
  initCommandPalette(addNewTool, toast);
  renderCards();
})();
