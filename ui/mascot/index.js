// ─────────────────────────────────────────────────────────────
// KUMO UNIFIED MASCOT CONTROLLER (ui/mascot/index.js)
// Exposes a single, unified interface for:
// - 3D WebGL (Voxel Bot & Smooth Mochi Gel)
// - 2D Pixel Cloud (Puff 64x64)
// - Vector SVG Companions (Kumo Cloud, Cotton Cloud, Droplet, Kubo)
// ─────────────────────────────────────────────────────────────

import { Mascot2D, PALETTES_2D } from './mascot-2d.js';
import { Mascot3D, PALETTES_3D } from './mascot-3d.js';
import { MascotVector, VECTOR_PALETTES, getVectorPalette } from './mascot-vector.js';

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

// Hex to closest 3D / 2D / Vector palette mapping
const COLOR_HEX_MAP = {
  '#baa0ff': { p3d: 'Grape Slime',  p2d: 'Lilac',  pVec: 'lilac' },
  '#64b5f6': { p3d: 'Classic Cyan', p2d: 'Sky',    pVec: 'sky' },
  '#38bdf8': { p3d: 'Classic Cyan', p2d: 'Sky',    pVec: 'sky' },
  '#7bdcb5': { p3d: 'Mint Jelly',   p2d: 'Mint',   pVec: 'matcha' },
  '#34d399': { p3d: 'Mint Jelly',   p2d: 'Mint',   pVec: 'matcha' },
  '#ff9ec6': { p3d: 'Peach Pink',   p2d: 'Peach',  pVec: 'peach' },
  '#f472b6': { p3d: 'Peach Pink',   p2d: 'Peach',  pVec: 'peach' },
  '#ffd166': { p3d: 'Classic Cyan', p2d: 'Butter', pVec: 'solar' },
  '#ffb48a': { p3d: 'Peach Pink',   p2d: 'Peach',  pVec: 'peach' },
};

export class MascotController {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    const initialEngine = options.engine || (options.type === '2d' ? 'pixel2d' : (options.type === 'vector' ? 'kumo' : 'voxel3d'));
    const isVector = options.type === 'vector' || ['kumo', 'cotton', 'droplet', 'kubo'].includes(initialEngine);

    this.options = {
      type: isVector ? 'vector' : (options.type || '3d'),
      engine: initialEngine,
      state: options.state || 'idle',
      geometryMode: options.geometryMode || 'voxel',
      palette: options.palette || (isVector ? 'lilac' : (options.type === '2d' ? 'Sky' : 'Classic Cyan')),
      blush: options.blush ?? 75,
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

    const isVector = this.options.type === 'vector' || ['kumo', 'cotton', 'droplet', 'kubo'].includes(this.options.engine);
    const type = isVector ? 'vector' : (this.options.type === '2d' ? '2d' : '3d');

    if (isVector) {
      // Hide canvas and mount vector container
      if (this.canvas) {
        this.canvas.style.display = 'none';
        let vectorMount = this.canvas.parentNode?.querySelector('.goo-vector-mount');
        if (!vectorMount && this.canvas.parentNode) {
          vectorMount = document.createElement('div');
          vectorMount.className = 'goo-vector-mount';
          this.canvas.parentNode.insertBefore(vectorMount, this.canvas);
        }
        if (vectorMount) {
          vectorMount.style.display = 'flex';
          this.activeEngine = new MascotVector(vectorMount, {
            engine: this.options.engine || 'kumo',
            state: this.options.state,
            palette: this.options.palette || 'lilac',
            blush: this.options.blush ?? 75,
          });
        }
      }
    } else {
      // Hide any existing vector mount and restore canvas
      if (this.canvas && this.canvas.parentNode) {
        const vectorMount = this.canvas.parentNode.querySelector('.goo-vector-mount');
        if (vectorMount) vectorMount.style.display = 'none';

        const fresh = document.createElement('canvas');
        fresh.id = this.canvas.id;
        fresh.className = this.canvas.className;
        fresh.width = type === '2d' ? 64 : 320;
        fresh.height = type === '2d' ? 64 : 320;
        fresh.style.cssText = this.canvas.style.cssText;
        fresh.style.display = 'block';
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
    }

    this.activeEngine?.start?.();
  }

  setEngine(engineKey) {
    if (!engineKey || this.options.engine === engineKey) return;
    this.options.engine = engineKey;
    if (['kumo', 'cotton', 'droplet', 'kubo'].includes(engineKey)) {
      this.options.type = 'vector';
    } else if (engineKey === 'pixel2d') {
      this.options.type = '2d';
    } else {
      this.options.type = '3d';
      this.options.geometryMode = engineKey === 'voxel3d' ? 'voxel' : 'smooth';
    }
    this.mountEngine();
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

  setBlush(val) {
    this.options.blush = val;
    if (this.activeEngine?.setBlush) {
      this.activeEngine.setBlush(val);
    }
  }

  setColor(hex) {
    const match = COLOR_HEX_MAP[hex.toLowerCase()];
    if (match) {
      if (this.options.type === 'vector') {
        this.setPalette(match.pVec);
      } else if (this.options.type === '2d') {
        this.setPalette(match.p2d);
      } else {
        this.setPalette(match.p3d);
      }
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

export { Mascot2D, Mascot3D, MascotVector, PALETTES_2D, PALETTES_3D, VECTOR_PALETTES };
