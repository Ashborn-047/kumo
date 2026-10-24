// ─────────────────────────────────────────────────────────────
// KUMO UNIFIED MASCOT CONTROLLER (ui/mascot/index.js)
// Exposes a single, unified interface for both 3D Mochi Bot and
// 2D Pixel Cloud (Puff) engines extracted from assets/Lab/.
// ─────────────────────────────────────────────────────────────

import { Mascot2D, PALETTES_2D } from './mascot-2d.js';
import { Mascot3D, PALETTES_3D } from './mascot-3d.js';

// State normalization map to support legacy/variant names
const STATE_ALIAS = {
  normal: 'idle',
  talking: 'speaking',
  speaking: 'speaking',
  listen: 'listening',
  listening: 'listening',
  think: 'thinking',
  thinking: 'thinking',
  happy: 'happy',
  hop: 'happy',
  idle: 'idle',
  sleeping: 'idle',
};

// Hex to closest 3D / 2D palette mapping
const COLOR_HEX_MAP = {
  '#baa0ff': { p3d: 'Grape Slime',  p2d: 'Lilac' },
  '#64b5f6': { p3d: 'Classic Cyan', p2d: 'Sky' },
  '#38bdf8': { p3d: 'Classic Cyan', p2d: 'Sky' },
  '#7bdcb5': { p3d: 'Mint Jelly',   p2d: 'Mint' },
  '#34d399': { p3d: 'Mint Jelly',   p2d: 'Mint' },
  '#ff9ec6': { p3d: 'Peach Pink',   p2d: 'Peach' },
  '#f472b6': { p3d: 'Peach Pink',   p2d: 'Peach' },
  '#ffd166': { p3d: 'Classic Cyan', p2d: 'Butter' },
  '#ffb48a': { p3d: 'Peach Pink',   p2d: 'Peach' },
};

export class MascotController {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.options = {
      type: options.type || '3d', // '3d' | '2d'
      state: options.state || 'idle',
      geometryMode: options.geometryMode || 'smooth',
      palette: options.palette || (options.type === '2d' ? 'Sky' : 'Classic Cyan'),
      speed: options.speed || 1.0,
      squish: options.squish || 1.0,
      trackGaze: options.trackGaze !== false,
      smile: options.smile !== false,
      ...options,
    };

    this.activeEngine = null;
    this.tempStateTimer = null;
    this.mountEngine();
  }

  mountEngine() {
    if (this.activeEngine) {
      try { this.activeEngine.destroy?.(); } catch (_) {}
      this.activeEngine = null;
    }

    // HTML5 canvases cannot switch context type (2D <-> WebGL) once created.
    // Recreate a clean canvas clone in place:
    const type = this.options.type === '2d' ? '2d' : '3d';
    if (this.canvas && this.canvas.parentNode) {
      const fresh = document.createElement('canvas');
      fresh.id = this.canvas.id;
      fresh.className = this.canvas.className;
      fresh.width = type === '2d' ? 64 : 320;
      fresh.height = type === '2d' ? 64 : 320;
      fresh.style.cssText = this.canvas.style.cssText;
      fresh.style.imageRendering = type === '2d' ? 'pixelated' : 'auto';
      fresh.style.background = 'transparent';
      this.canvas.parentNode.replaceChild(fresh, this.canvas);
      this.canvas = fresh;
    }

    if (type === '2d') {
      const p = PALETTES_2D[this.options.palette] ? this.options.palette : 'Sky';
      this.activeEngine = new Mascot2D(this.canvas, {
        state: this.options.state,
        palette: p,
        speed: this.options.speed,
        squish: this.options.squish,
        trackGaze: this.options.trackGaze,
      });
    } else {
      const p = PALETTES_3D[this.options.palette] ? this.options.palette : 'Classic Cyan';
      this.activeEngine = new Mascot3D(this.canvas, {
        state: this.options.state,
        palette: p,
        geometryMode: this.options.geometryMode,
        speed: this.options.speed,
        squish: this.options.squish,
        trackGaze: this.options.trackGaze,
        smile: this.options.smile,
      });
    }

    this.activeEngine.start();
  }

  setType(type) {
    if (this.options.type === type) return;
    this.options.type = type;
    this.mountEngine();
  }

  setState(st) {
    const norm = STATE_ALIAS[st] || 'idle';
    this.options.state = norm;
    clearTimeout(this.tempStateTimer);
    if (this.activeEngine) {
      this.activeEngine.setState(norm);
    }
  }

  setStateTemp(st, durationMs = 2000) {
    this.setState(st);
    this.tempStateTimer = setTimeout(() => {
      this.setState('idle');
    }, durationMs);
  }

  setPalette(name) {
    this.options.palette = name;
    if (this.activeEngine) {
      this.activeEngine.setPalette(name);
    }
  }

  setColor(hex) {
    const match = COLOR_HEX_MAP[hex.toLowerCase()];
    if (match) {
      const targetPalette = this.options.type === '2d' ? match.p2d : match.p3d;
      this.setPalette(targetPalette);
    }
  }

  setGeometryMode(mode) {
    this.options.geometryMode = mode;
    if (this.options.type === '3d' && this.activeEngine?.setGeometryMode) {
      this.activeEngine.setGeometryMode(mode);
    }
  }

  setSpeed(speed) {
    this.options.speed = speed;
    if (this.activeEngine) this.activeEngine.speed = speed;
  }

  setSquish(squish) {
    this.options.squish = squish;
    if (this.activeEngine) this.activeEngine.squishIntensity = squish;
  }

  setSmile(show) {
    this.options.smile = !!show;
    if (this.activeEngine) {
      this.activeEngine.showSmile = !!show;
      if (this.activeEngine.smileMesh) {
        this.activeEngine.smileMesh.visible = !!show;
      }
    }
  }

  triggerPoke() {
    if (this.activeEngine) {
      this.activeEngine.triggerPoke();
    }
  }

  destroy() {
    clearTimeout(this.tempStateTimer);
    if (this.activeEngine) {
      try { this.activeEngine.destroy(); } catch (_) {}
      this.activeEngine = null;
    }
  }
}

/**
 * Convenient factory function to instantiate a mascot.
 */
export function createMascot(canvas, options = {}) {
  return new MascotController(canvas, options);
}

export { Mascot2D, Mascot3D, PALETTES_2D, PALETTES_3D };
