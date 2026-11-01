// ============================================================
// goo.js — Mascot Controller for Desktop Floating Overlay
// Uses Kumo Mascot Engine (ui/mascot/index.js) extracted from assets/Lab/.
// Supports both 3D Mochi Bot & 2D Pixel Cloud (Puff) with all 5
// animated states: idle, speaking, listening, happy, thinking.
// ============================================================

import { createMascot } from '../mascot/index.js';

const canvas = document.getElementById('goo-canvas');

// Default initial config
let currentConfig = {
  avatarType: '3d',
  palette: 'Classic Cyan',
  style3d: 'smooth',
  speed: 1.0,
  squish: 1.0,
  trackGaze: true,
  smile: true,
};

// Initialize mascot instance
let mascot = createMascot(canvas, {
  type: currentConfig.avatarType,
  state: 'idle',
  geometryMode: currentConfig.style3d,
  palette: currentConfig.palette,
  speed: currentConfig.speed,
  squish: currentConfig.squish,
  trackGaze: currentConfig.trackGaze,
  smile: currentConfig.smile,
});

const ENGINE_MAP = {
  'cotton-cloud': 'cotton',
  'cotton': 'cotton',
  'cloud': 'cotton',
  'kumo': 'cotton',
  'mochi-droplet': 'droplet',
  'droplet': 'droplet',
  'mochi': 'droplet',
  'kubo-bot': 'kubo',
  'kubo': 'kubo',
  '3d-mochi-gel': 'gel3d',
  'gel3d': 'gel3d',
  '3d': 'voxel3d',
  'voxel3d': 'voxel3d',
  '2d': 'pixel2d',
  'pixel2d': 'pixel2d',
};

// Update mascot from settings object
function applySettings(cfg) {
  if (!cfg) return;
  currentConfig = { ...currentConfig, ...cfg };

  const targetEngine = cfg.engine || ENGINE_MAP[cfg.activeMascotId] || ENGINE_MAP[cfg.mascot] || (cfg.avatarType && cfg.avatarType !== 'vector' ? ENGINE_MAP[cfg.avatarType] : null);
  if (targetEngine) {
    mascot.setEngine(targetEngine);
  } else if (cfg.avatarType) {
    mascot.setType(cfg.avatarType);
  }
  if (cfg.palette) {
    mascot.setPalette(cfg.palette);
  } else if (cfg.color || cfg.mascotColor) {
    mascot.setColor(cfg.color || cfg.mascotColor);
  }
  if (typeof cfg.blush === 'number') {
    mascot.setBlush(cfg.blush);
  }
  if (cfg.style3d) {
    mascot.setGeometryMode(cfg.style3d);
  }
  if (typeof cfg.speed === 'number') {
    mascot.setSpeed(cfg.speed);
  }
  if (typeof cfg.squish === 'number') {
    mascot.setSquish(cfg.squish);
  }
}

// Load persisted settings on boot
(async () => {
  try {
    let s = await window.goo?.getSettings?.();
    if (!s) {
      try { s = JSON.parse(localStorage.getItem('kumo')); } catch (_) {}
    }
    if (s) applySettings(s);
  } catch (err) {
    console.warn('Failed to load initial settings in overlay:', err);
  }
})();

// Listen for live settings changes saved from Kumo Studio
if (window.goo?.onSettingsUpdated) {
  window.goo.onSettingsUpdated((newSettings) => {
    applySettings(newSettings);
  });
}

// Idle sleep timer
const SLEEP_IDLE_MS = 60000;
let lastActiveTime = Date.now();

function resetActivity() {
  lastActiveTime = Date.now();
  if (mascot.options.state === 'idle') {
    mascot.setState('idle');
  }
}

// Global API consumed by chat.js
window.gooState = {
  setState: (st) => {
    resetActivity();
    mascot.setState(st);
  },
  setStateTemp: (st, durationMs = 2000) => {
    resetActivity();
    mascot.setStateTemp(st, durationMs);
  },
  setColor: (hex) => {
    mascot.setColor(hex);
  },
  setPalette: (name) => {
    mascot.setPalette(name);
  },
  setType: (type) => {
    mascot.setType(type);
  },
  triggerPoke: () => {
    resetActivity();
    mascot.triggerPoke();
  },
  resetActivity,
};
