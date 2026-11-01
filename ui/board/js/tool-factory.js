// ============================================================
// ui/board/js/tool-factory.js — Dynamic Card Creation Factory
// ============================================================

import { state } from './state.js';
import { renderCards } from './card-renderer.js';
import { saveState, toast } from './storage.js';

export function addNewTool(type, extra = {}) {
  const id = `card-${type}-${Date.now()}`;
  const centerX = Math.max(40, Math.round((-state.panX + 160) / state.scale));
  const centerY = Math.max(40, Math.round((-state.panY + 120) / state.scale));

  let newCard = null;
  switch (type) {
    case 'telemetry':
      newCard = {
        id,
        type,
        title: extra.title || 'System Health & Telemetry Hub',
        x: centerX,
        y: centerY,
        width: 560,
        data: { ram: null, cpu: null },
        zIndex: ++state.nextZIndex,
      };
      break;

    case 'network':
      newCard = {
        id,
        type,
        title: extra.title || 'Network Sentinel Hub',
        x: centerX,
        y: centerY,
        width: 580,
        data: { ip: null, gateway: null, dns: null },
        zIndex: ++state.nextZIndex,
      };
      break;

    case 'media':
      newCard = {
        id,
        type,
        title: extra.title || 'Spotify & Pinned Songs Hub',
        x: centerX,
        y: centerY,
        width: 580,
        data: { track: null, artist: null, isPlaying: false, pinnedSongs: [] },
        zIndex: ++state.nextZIndex,
      };
      break;

    case 'workspace':
      newCard = {
        id,
        type,
        title: extra.title || 'Developer Workspace Hub',
        x: centerX,
        y: centerY,
        width: 580,
        data: { repo: null, branch: null, nodeVersion: null, platform: null },
        zIndex: ++state.nextZIndex,
      };
      break;

    case 'launcher':
      newCard = {
        id,
        type,
        title: extra.title || 'App Launcher & Hub',
        x: centerX,
        y: centerY,
        width: 560,
        data: {
          activeCategory: 'all',
          searchQuery: '',
          clipboardText: '',
          apps: [],
          scannedApps: [],
          customApps: [],
        },
        zIndex: ++state.nextZIndex,
      };
      break;

    case 'writer':
      newCard = {
        id,
        type,
        title: extra.title || 'AI Assistant Studio',
        x: centerX,
        y: centerY,
        width: 580,
        data: {
          activeTab: 'prompt',
          model: 'Kumo Neural Engine',
          tone: 'Professional',
          prompt: extra.prompt || '',
          response: extra.response || '',
          tokenCount: 0,
          maxTokens: 4096,
        },
        zIndex: ++state.nextZIndex,
      };
      break;

    case 'code':
      newCard = {
        id,
        type,
        title: extra.title || 'PowerShell & DevOps Console',
        x: centerX,
        y: centerY,
        width: 560,
        data: {
          preset: 'system-info.ps1',
          code: extra.code || 'Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version, TotalVisibleMemorySize, FreePhysicalMemory',
          output: '',
          pid: null,
          cpu: null,
        },
        zIndex: ++state.nextZIndex,
      };
      break;

    case 'design':
      newCard = {
        id,
        type,
        title: 'Kumo Companion & Theme Lab',
        x: centerX,
        y: centerY,
        width: 1170,
        data: {
          activeMood: 'Idle',
          activePaletteIndex: 0,
          glowIntensity: 72,
          soundEnabled: true,
        },
        zIndex: ++state.nextZIndex,
      };
      break;

    case 'notes':
      newCard = {
        id,
        type,
        title: extra.title || 'Sprint Scratchpad',
        x: centerX,
        y: centerY,
        width: 580,
        data: {
          bgColor: '#fff5c8',
          colorName: 'Solar Yellow',
          items: extra.items || [
            { id: `t-${Date.now()}-1`, text: 'Double-click to edit or check task', done: false, tag: 'TODO' },
          ],
          scratchText: extra.text || '',
        },
        zIndex: ++state.nextZIndex,
      };
      break;
  }

  if (newCard) {
    state.cards.unshift(newCard);
    renderCards();
    saveState();
    toast(`Spawned ${newCard.title}`);
  }
}

