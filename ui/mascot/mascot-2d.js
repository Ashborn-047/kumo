// ─────────────────────────────────────────────────────────────
// KUMO 2D PIXEL CLOUD ENGINE (PUFF)
// From assets/Lab/ai_bot_asset_studio_kuma.html
// 64x64 Retro Cloud with SDF lighting, Bayer dithering & states
// ─────────────────────────────────────────────────────────────

const N = 64;
const BASE = 52;
const BY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

export const PALETTES_2D = {
  Sky:    [205, 85],
  Peach:  [350, 85],
  Lilac:  [262, 80],
  Mint:   [155, 60],
  Butter: [45,  90],
  Cloud:  [220, 28],
};

function hsl2rgb(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
  };
  return [f(0), f(8), f(4)];
}

const smin2d = (a, b, k) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - (h * h * k) / 4;
};

const circ2d = (x, y, cx, cy, r) => Math.hypot(x - cx, y - cy) - r;

function puffSdf(x, y, sx, sy, oy) {
  x = 32 + (x - 32) / sx;
  y = BASE + (y - oy - BASE) / sy;
  let d = circ2d(x, y, 32, 40, 14);
  d = smin2d(d, circ2d(x, y, 20, 43, 9), 6);
  d = smin2d(d, circ2d(x, y, 44, 43, 9), 6);
  d = smin2d(d, circ2d(x, y, 28, 30, 10), 6);
  d = smin2d(d, circ2d(x, y, 40, 32, 8), 6);
  return Math.max(d, y - BASE);
}

export class Mascot2D {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width = N;
    this.canvas.height = N;
    this.imgData = this.ctx.createImageData(N, N);
    this.D = this.imgData.data;

    this.state = options.state || 'idle'; // idle | listening | thinking | happy | speaking
    this.paletteName = options.palette || 'Sky';
    this.speed = options.speed || 1.0;
    this.squishIntensity = options.squish || 1.0;
    this.trackGaze = options.trackGaze !== false;
    this.poke = 0;
    this.mx = 0;
    this.my = 0;

    this.setPalette(this.paletteName);
    this.running = false;
    this.startTime = performance.now();

    this.onMouseMove = (e) => {
      if (!this.trackGaze) { this.mx = 0; this.my = 0; return; }
      const rect = this.canvas.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      this.mx = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width / 2)));
      this.my = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2)));
    };
    window.addEventListener('mousemove', this.onMouseMove);

    this.canvas.addEventListener('click', () => this.triggerPoke());
  }

  setPalette(name) {
    const entry = PALETTES_2D[name] || PALETTES_2D.Sky;
    this.paletteName = name;
    const [h, s] = entry;
    this.tones = [60, 74, 83, 90, 97].map((l) => hsl2rgb(h, s, l));
  }

  setState(st) {
    this.state = st;
  }

  triggerPoke() {
    this.poke = 1.0;
  }

  start() {
    if (this.running) return;
    this.running = true;
    const loop = (now) => {
      if (!this.running) return;
      const t = (now - this.startTime) / 1000;
      this.renderFrame(t);
      this.poke = Math.max(0, this.poke - 0.04);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
  }

  destroy() {
    this.stop();
    window.removeEventListener('mousemove', this.onMouseMove);
  }

  renderFrame(t) {
    const D = this.D;
    D.fill(0);

    const tt = t * this.speed;
    const st = this.state;
    let sy = 1 + Math.sin(tt * 2.2) * 0.035 * this.squishIntensity;
    let oy = 0;

    if (st === 'happy') {
      const b = Math.abs(Math.sin(tt * 4));
      oy = -b * 9;
      sy = 1 + 0.08 * b - 0.16 * Math.pow(1 - b, 6);
    } else if (st === 'listening') {
      sy += 0.06;
    }
    sy -= this.poke * Math.cos(t * 16) * 0.28 * this.squishIntensity;

    const sx = 1 / Math.pow(Math.max(0.4, sy), 0.8);
    const T = this.tones;

    const put = (x, y, c, a = 255) => {
      x = Math.round(x); y = Math.round(y);
      if (x < 0 || y < 0 || x >= N || y >= N) return;
      const i = (y * N + x) * 4;
      D[i] = c[0]; D[i + 1] = c[1]; D[i + 2] = c[2]; D[i + 3] = a;
    };

    const rect = (x, y, w, h, c, a) => {
      for (let j = 0; j < h; j++) {
        for (let i = 0; i < w; i++) put(x + i, y + j, c, a);
      }
    };

    // Drop shadow
    const sw = Math.round(13 - oy * 0.5);
    for (let x = -sw; x <= sw; x++) put(32 + x, 55, [60, 50, 90], 38);

    // Body SDF
    const F = (px, py) => puffSdf(px, py, sx, sy, oy);
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const px = x + 0.5;
        const py = y + 0.5;
        const d = F(px, py);
        if (d > 1) continue;
        if (d > 0) { put(x, y, T[0]); continue; }

        const gx = F(px + 1, py) - F(px - 1, py);
        const gy = F(px, py + 1) - F(px, py - 1);
        const gl = Math.hypot(gx, gy) || 1;
        const lit = (gx * -0.55 + gy * -0.83) / gl;
        const e = Math.max(0, 1 - (-d) / 7);

        const yy = BASE + (py - oy - BASE) / sy;
        const xx = 32 + (px - 32) / sx;
        let i = Math.floor((0.55 + 0.5 * lit * e - (yy - 38) * 0.012) * 4 + (BY[(y & 3) * 4 + (x & 3)] - 0.5) * 1.2) + 1;
        i = Math.max(1, Math.min(4, i));
        if (yy > BASE - 2.5) i = 1;
        if (((xx - 23) / 3.6) ** 2 + ((yy - 31.5) / 2) ** 2 < 1) i = 4;
        put(x, y, T[i]);
      }
    }

    // Eyes and Face
    const tr = st === 'thinking';
    const lx = tr ? 3 : Math.max(-1, Math.min(1, this.mx)) * 3;
    const ly = tr ? -2 : this.my * 2;
    const fx = Math.round(32 + lx * 0.5);
    const fy = Math.round(BASE + oy - (BASE - 41) * sy);
    const ink = [38, 32, 70];
    const pink = [255, 150, 185];
    const L = fx - 8 + Math.round(lx * 0.5);
    const R = fx + 5 + Math.round(lx * 0.5);
    const blink = (tt % 4.2) < 0.14;

    if (st === 'happy') {
      [L - 1, R - 1].forEach((ex) => {
        [[0, 2], [1, 1], [2, 0], [3, 1], [4, 2]].forEach((p) => {
          put(ex + p[0], fy - 1 + p[1] + Math.round(ly), ink);
        });
      });
    } else {
      const h = blink ? 1 : (st === 'listening' ? 6 : 5);
      const w = st === 'listening' ? 4 : 3;
      const ty = fy - 2 + Math.round(ly) + Math.round((5 - h) / 2);
      [L, R].forEach((ex) => {
        rect(ex, ty, w, h, ink);
        if (h > 2) put(ex, ty, [255, 255, 255]);
      });
    }

    // Blush
    rect(fx - 14, fy + 4, 4, 2, pink, 200);
    rect(fx + 10, fy + 4, 4, 2, pink, 200);

    // Mouth
    const my = fy + 5;
    if (st === 'speaking') {
      const o = Math.abs(Math.sin(tt * 9) + Math.sin(tt * 5.3)) / 2;
      const h = 1 + Math.round(o * 3);
      rect(fx - 2, my - 1, 4, h, ink);
      if (h > 2) rect(fx - 1, my + h - 2, 2, 1, pink);
    } else if (st === 'happy') {
      rect(fx - 2, my - 1, 5, 1, ink);
      rect(fx - 1, my, 3, 2, ink);
      put(fx, my + 1, pink);
    } else if (tr) {
      rect(fx + 1, my, 2, 1, ink);
    } else {
      put(fx - 2, my - 1, ink);
      put(fx + 2, my - 1, ink);
      rect(fx - 1, my, 3, 1, ink);
    }

    // Happy sparkles
    if (st === 'happy') {
      [[10, 22], [54, 18], [48, 8]].forEach((p, k) => {
        if (Math.sin(tt * 6 + k * 2) > 0) {
          const c = [255, 225, 120];
          rect(p[0] - 1, p[1], 3, 1, c);
          rect(p[0], p[1] - 1, 1, 3, c);
          put(p[0], p[1], [255, 255, 255]);
        }
      });
    }

    // Thinking dots
    if (tr) {
      const n = Math.floor(tt * 2) % 4;
      for (let i = 0; i < n; i++) {
        rect(fx + 14 + i * 4, fy - 6, 2, 2, [140, 120, 210]);
      }
    }

    this.ctx.putImageData(this.imgData, 0, 0);
  }
}
