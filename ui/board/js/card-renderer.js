// ============================================================
// ui/board/js/card-renderer.js — Card DOM Rendering & Tool Attachments
// ============================================================

import { state } from './state.js';
import { makeCardDraggable } from './drag.js';
import { saveState, toast } from './storage.js';
import { updateMiniMap } from './minimap.js';
import { applyLiveTelemetry } from './telemetry-dispatcher.js';

import { renderLauncherHTML, attachLauncherEvents, syncScannedApps } from './tools/launcher-tool.js';
import { renderWriterHTML, attachWriterEvents } from './tools/writer-tool.js';
import { renderCodeHTML, attachCodeEvents } from './tools/code-tool.js';
import { renderDesignHTML, attachDesignEvents } from './tools/design-tool.js';
import { renderNotesHTML, attachNotesEvents } from './tools/notes-tool.js';
import { renderTelemetryHTML, attachTelemetryEvents } from './tools/telemetry-tool.js';
import { renderNetworkHTML, attachNetworkEvents } from './tools/network-tool.js';
import { renderMediaHTML, attachMediaEvents } from './tools/media-tool.js';
import { renderWorkspaceHTML, attachWorkspaceEvents } from './tools/workspace-tool.js';
import { renderDropHTML, attachDropEvents } from './tools/drop-tool.js';

const $ = (s) => document.querySelector(s);

export function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderCards() {
  const stage = $('#canvas-stage');
  if (!stage) return;
  stage.innerHTML = '';

  state.cards.forEach((card) => {
    if (state.activeFilter !== 'all' && card.type !== state.activeFilter) return;

    const el = document.createElement('div');
    if (card.type === 'notes') {
      const tint = card.data.bgColor || '#fff5c8';
      el.className = 'kumo-canvas-card card-shadow rounded-2xl border border-amber-200/80 shadow-lg transform -rotate-1 hover:rotate-0 transition-transform duration-200 relative flex flex-col justify-between select-text';
      el.style.backgroundColor = tint;
    } else if (card.type === 'code') {
      el.className = 'kumo-canvas-card card-shadow rounded-2xl border border-white/10 glow-border-terminal transition-transform hover:-translate-y-0.5 duration-200 flex flex-col overflow-hidden select-text bg-[#171b24]';
    } else if (card.type === 'writer') {
      el.className = 'kumo-canvas-card card-shadow rounded-2xl border border-slate-200/70 glow-border-iris transition-transform hover:-translate-y-0.5 duration-200 flex flex-col overflow-hidden select-text bg-surface-container-lowest';
    } else {
      el.className = 'kumo-canvas-card card-shadow rounded-2xl border border-slate-200/70 transition-transform hover:-translate-y-0.5 duration-200 flex flex-col overflow-hidden select-text bg-surface-container-lowest';
    }

    el.id = card.id;
    el.style.position = 'absolute';
    el.style.left = `${card.x}px`;
    el.style.top = `${card.y}px`;
    el.style.width = `${card.width}px`;
    el.style.zIndex = card.zIndex || 1;

    let bodyHTML = '';
    switch (card.type) {
      case 'launcher':
        bodyHTML = renderLauncherHTML(card);
        if (!card.data._synced && (!card.data.scannedApps || card.data.scannedApps.length === 0)) {
          card.data._synced = true;
          syncScannedApps(card, () => {
            renderCards();
            if (window.goo?.getTelemetry) {
              window.goo.getTelemetry().then((metrics) => {
                applyLiveTelemetry(metrics);
              }).catch(() => {});
            }
            if (window.goo?.onTelemetry) {
              window.goo.onTelemetry((metrics) => {
                applyLiveTelemetry(metrics);
              });
            }
          });
        }
        break;
      case 'writer':    bodyHTML = renderWriterHTML(card); break;
      case 'code':      bodyHTML = renderCodeHTML(card); break;
      case 'design':    bodyHTML = renderDesignHTML(card); break;
      case 'notes':     bodyHTML = renderNotesHTML(card); break;
      case 'telemetry': bodyHTML = renderTelemetryHTML(card); break;
      case 'network':   bodyHTML = renderNetworkHTML(card); break;
      case 'media':     bodyHTML = renderMediaHTML(card); break;
      case 'workspace': bodyHTML = renderWorkspaceHTML(card); break;
      case 'drop':      bodyHTML = renderDropHTML(card); break;
      default:          bodyHTML = `
        <header class="h-10 bg-slate-100/90 border-b border-slate-200/70 px-3.5 flex items-center justify-between select-none cursor-grab" data-drag-handle="${card.id}">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-rose-400/80 hover:opacity-80 transition-opacity cursor-pointer" data-act="del" title="Close"></div>
            <span class="text-xs font-semibold text-slate-700">${escapeHtml(card.title || 'Pinned Card')}</span>
          </div>
          <button class="text-slate-400 hover:text-rose-500 cursor-pointer" data-act="del" title="Close Card">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </header>
        <div class="p-4 text-on-surface font-sans text-body-md">${escapeHtml(card.data?.text || card.title || 'Pinned Card')}</div>`;
    }

    el.innerHTML = bodyHTML;
    stage.appendChild(el);

    // Attach dragging
    makeCardDraggable(el, card, saveState);

    // Double-click to rename title dynamically
    el.querySelector('.card-title-text')?.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      const currentTitle = card.title;
      const input = document.createElement('input');
      input.type = 'text';
      input.value = currentTitle;
      input.className = 'bg-white px-2 py-0.5 rounded border border-primary text-headline-sm font-headline-sm text-on-surface font-semibold focus:outline-none';
      const titleEl = e.currentTarget;
      titleEl.replaceWith(input);
      input.focus();
      input.select();

      const finishRename = () => {
        const newTitle = input.value.trim() || currentTitle;
        card.title = newTitle;
        saveState();
        renderCards();
        toast(`Renamed to "${newTitle}"`);
      };

      input.addEventListener('blur', finishRename);
      input.addEventListener('keydown', (ke) => {
        if (ke.key === 'Enter') finishRename();
        if (ke.key === 'Escape') renderCards();
      });
    });

    // Minimize & Delete
    el.querySelector('[data-act="min"]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      el.classList.toggle('minimized');
    });

    el.querySelectorAll('[data-act="del"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        el.style.transition = 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s ease';
        el.style.transform = 'scale(0.92)';
        el.style.opacity = '0';
        setTimeout(() => {
          state.cards = state.cards.filter((c) => c.id !== card.id);
          renderCards();
          saveState();
          toast(`Deleted "${card.title || 'Card'}"`);
        }, 160);
      });
    });

    // Wire tool-specific events
    switch (card.type) {
      case 'launcher':  attachLauncherEvents(el, card, saveState, toast); break;
      case 'writer':    attachWriterEvents(el, card, saveState, toast); break;
      case 'code':      attachCodeEvents(el, card, saveState, toast); break;
      case 'design':    attachDesignEvents(el, card, saveState, toast); break;
      case 'notes':     attachNotesEvents(el, card, saveState); break;
      case 'telemetry': attachTelemetryEvents(el, card, saveState, toast); break;
      case 'network':   attachNetworkEvents(el, card, saveState, toast); break;
      case 'media':     attachMediaEvents(el, card, saveState, toast); break;
      case 'workspace': attachWorkspaceEvents(el, card, saveState, toast); break;
      case 'drop':      attachDropEvents(el, card, saveState, toast); break;
    }
  });

  updateMiniMap();
}

