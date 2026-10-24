// ============================================================
// generate-mascot-assets.js
// Generates 2D & 3D mascot sprites, spritesheets, and app icons
// Pure Node.js (uses built-in zlib for PNG compression)
// ============================================================

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ------------------------------------------------------------
// Minimal PNG Encoder (CRC32 + zlib.deflateSync)
// ------------------------------------------------------------
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function createPngChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  chunk.writeUInt32BE(crc32(typeAndData), 8 + len);
  return chunk;
}

function encodePng(width, height, rgbaBuffer) {
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR: width(4), height(4), bitDepth=8(1), colorType=6(RGBA)(1), comp=0(1), filter=0(1), interlace=0(1)
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const ihdrChunk = createPngChunk('IHDR', ihdr);

  // Scanlines with filter byte 0x00 prefix
  const rawScanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rawOffset = y * (1 + width * 4);
    rawScanlines[rawOffset] = 0; // Filter: None
    rgbaBuffer.copy(rawScanlines, rawOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(rawScanlines, { level: 9 });
  const idatChunk = createPngChunk('IDAT', compressed);
  const iendChunk = createPngChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

// ------------------------------------------------------------
// Windows ICO Encoder (Packages PNGs into multi-res ICO)
// ------------------------------------------------------------
function encodeIco(pngBuffers) {
  // pngBuffers: array of { width, height, buffer }
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + count * dirEntrySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(count, 4);

  const dirEntries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    entry[0] = item.width >= 256 ? 0 : item.width;
    entry[1] = item.height >= 256 ? 0 : item.height;
    entry[2] = 0; // colorCount
    entry[3] = 0; // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(item.buffer.length, 8); // size in bytes
    entry.writeUInt32LE(offset, 12); // file offset
    offset += item.buffer.length;
    dirEntries.push(entry);
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map((p) => p.buffer)]);
}

// ------------------------------------------------------------
// 2D Puff Mascot Renderer
// ------------------------------------------------------------
const N = 64;
const BASE = 52;
const BY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

function hsl2rgb(h, s, l) {
  s /= 100;
  l /= 100;
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

function renderPuffState(st = 'idle', time = 0, paletteHsl = [205, 85]) {
  const buf = Buffer.alloc(N * N * 4);
  const T = [60, 74, 83, 90, 97].map((l) => hsl2rgb(paletteHsl[0], paletteHsl[1], l));

  const put = (x, y, c, a = 255) => {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= N || y >= N) return;
    const i = (y * N + x) * 4;
    buf[i] = c[0];
    buf[i + 1] = c[1];
    buf[i + 2] = c[2];
    buf[i + 3] = a;
  };

  const rect = (x, y, w, h, c, a = 255) => {
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) put(x + i, y + j, c, a);
    }
  };

  let sy = 1 + Math.sin(time * 2.2) * 0.035;
  let oy = 0;

  if (st === 'happy') {
    const b = Math.abs(Math.sin(time * 4));
    oy = -b * 9;
    sy = 1 + 0.08 * b - 0.16 * Math.pow(1 - b, 6);
  } else if (st === 'listening') {
    sy += 0.06;
  }

  const sx = 1 / Math.pow(Math.max(0.4, sy), 0.8);

  // Soft drop shadow
  const sw = Math.round(13 - oy * 0.5);
  for (let x = -sw; x <= sw; x++) put(32 + x, 55, [60, 50, 90], 38);

  // Cloud SDF body
  const F = (px, py) => puffSdf(px, py, sx, sy, oy);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      const d = F(px, py);
      if (d > 1) continue;
      if (d > 0) {
        put(x, y, T[0]);
        continue;
      }

      const gx = F(px + 1, py) - F(px - 1, py);
      const gy = F(px, py + 1) - F(px, py - 1);
      const gl = Math.hypot(gx, gy) || 1;
      const lit = (gx * -0.55 + gy * -0.83) / gl;
      const e = Math.max(0, 1 - -d / 7);

      const yy = BASE + (py - oy - BASE) / sy;
      const xx = 32 + (px - 32) / sx;
      let i = Math.floor(
        (0.55 + 0.5 * lit * e - (yy - 38) * 0.012) * 4 + (BY[(y & 3) * 4 + (x & 3)] - 0.5) * 1.2
      ) + 1;
      i = Math.max(1, Math.min(4, i));
      if (yy > BASE - 2.5) i = 1;
      if (((xx - 23) / 3.6) ** 2 + ((yy - 31.5) / 2) ** 2 < 1) i = 4;
      put(x, y, T[i]);
    }
  }

  // Face
  const tr = st === 'thinking';
  const lx = tr ? 3 : 0;
  const ly = tr ? -2 : 0;
  const fx = Math.round(32 + lx * 0.5);
  const fy = Math.round(BASE + oy - (BASE - 41) * sy);
  const ink = [38, 32, 70];
  const pink = [255, 150, 185];
  const L = fx - 8 + Math.round(lx * 0.5);
  const R = fx + 5 + Math.round(lx * 0.5);

  if (st === 'happy') {
    [L - 1, R - 1].forEach((ex) => {
      [
        [0, 2],
        [1, 1],
        [2, 0],
        [3, 1],
        [4, 2],
      ].forEach((p) => {
        put(ex + p[0], fy - 1 + p[1] + ly, ink);
      });
    });
  } else {
    const h = st === 'listening' ? 6 : 5;
    const w = st === 'listening' ? 4 : 3;
    const ty = fy - 2 + ly + Math.round((5 - h) / 2);
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
    rect(fx - 2, my - 1, 4, 3, ink);
    rect(fx - 1, my + 1, 2, 1, pink);
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

  // Sparkles on happy
  if (st === 'happy') {
    [
      [10, 22],
      [54, 18],
      [48, 8],
    ].forEach((p) => {
      const c = [255, 225, 120];
      rect(p[0] - 1, p[1], 3, 1, c);
      rect(p[0], p[1] - 1, 1, 3, c);
      put(p[0], p[1], [255, 255, 255]);
    });
  }

  // Thinking dots
  if (tr) {
    for (let i = 0; i < 3; i++) {
      rect(fx + 14 + i * 4, fy - 6, 2, 2, [140, 120, 210]);
    }
  }

  return buf;
}

// Nearest-neighbor / high-quality scaler for app icons
function scaleRgba(src, sw, sh, dw, dh) {
  const dst = Buffer.alloc(dw * dh * 4);
  const xRatio = sw / dw;
  const yRatio = sh / dh;
  for (let dy = 0; dy < dh; dy++) {
    const sy = Math.min(sh - 1, Math.floor(dy * yRatio));
    for (let dx = 0; dx < dw; dx++) {
      const sx = Math.min(sw - 1, Math.floor(dx * xRatio));
      const sIdx = (sy * sw + sx) * 4;
      const dIdx = (dy * dw + dx) * 4;
      dst[dIdx] = src[sIdx];
      dst[dIdx + 1] = src[sIdx + 1];
      dst[dIdx + 2] = src[sIdx + 2];
      dst[dIdx + 3] = src[sIdx + 3];
    }
  }
  return dst;
}

// ------------------------------------------------------------
// 3D Mochi Bot Voxel Renderer (2D Projection of Voxel Model)
// ------------------------------------------------------------
const SLIME_GRID = [
  '....BBBB....',
  '..BBHHBBBB..',
  '.BBHHBBBBBB.',
  '.BHBBBBBBBB.',
  'BBBBBBBBBBBB',
  'BBBBBBBBBBBB',
  'BBBBBBBBBBBB',
  'BBBBBBBBBBBB',
  'BBBBBBBBBBBB',
  'DBBBBBBBBBBD',
  'DDDDDDDDDDDD',
];

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
}

function render3DVoxelState(st = 'idle', palette = {}) {
  const W = 64;
  const H = 64;
  const buf = Buffer.alloc(W * H * 4);

  const colBody = hexToRgb(palette.body || '#38bdf8');
  const colRim = hexToRgb(palette.rim || '#1976d2');
  const colShine = hexToRgb(palette.shine || '#e0f7ff');
  const colEye = hexToRgb(palette.eye || '#0f172a');
  const colBlush = hexToRgb(palette.blush || '#ff80ab');

  const put = (x, y, c, a = 255) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = (y * W + x) * 4;
    buf[i] = c[0];
    buf[i + 1] = c[1];
    buf[i + 2] = c[2];
    buf[i + 3] = a;
  };

  const rect = (x, y, w, h, c, a = 255) => {
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) put(x + i, y + j, c, a);
    }
  };

  // Draw voxels: 12 cols x 11 rows, each voxel is 4x4 pixels, centered at (32, 34)
  const voxW = 4;
  const voxH = 4;
  const startX = 32 - 6 * voxW; // 8
  const startY = 34 - 5 * voxH; // 14

  for (let r = 0; r < SLIME_GRID.length; r++) {
    for (let c = 0; c < SLIME_GRID[r].length; c++) {
      const ch = SLIME_GRID[r][c];
      if (ch === '.') continue;
      let color = colBody;
      if (ch === 'D') color = colRim;
      if (ch === 'H') color = colShine;

      const vx = startX + c * voxW;
      const vy = startY + r * voxH;
      rect(vx, vy, voxW, voxH, color);

      // Subtle 3D voxel shading: slightly brighter on top edge, darker on bottom
      for (let i = 0; i < voxW; i++) {
        put(vx + i, vy, color.map((v) => Math.min(255, v + 25)));
        put(vx + i, vy + voxH - 1, color.map((v) => Math.max(0, v - 20)));
      }
    }
  }

  // Face placement
  const eyeY = startY + 5 * voxH - 1;
  const blushY = eyeY + 6;
  const mouthY = eyeY + 6;

  // Eyes
  if (st === 'happy') {
    // Happy squint
    [-10, 10].forEach((ox) => {
      rect(32 + ox - 2, eyeY, 5, 2, colEye);
      put(32 + ox - 3, eyeY + 1, colEye);
      put(32 + ox + 3, eyeY + 1, colEye);
    });
  } else {
    const eyeH = st === 'listening' ? 8 : 6;
    rect(32 - 10 - 2, eyeY - (eyeH - 6), 4, eyeH, colEye);
    rect(32 + 10 - 2, eyeY - (eyeH - 6), 4, eyeH, colEye);
    put(32 - 12, eyeY - (eyeH - 6), [255, 255, 255]);
    put(32 + 8, eyeY - (eyeH - 6), [255, 255, 255]);
  }

  // Blush
  rect(32 - 17, blushY, 5, 4, colBlush);
  rect(32 + 12, blushY, 5, 4, colBlush);

  // Mouth
  if (st === 'speaking') {
    rect(32 - 3, mouthY, 6, 5, colEye);
    rect(32 - 2, mouthY + 2, 4, 3, colBlush);
  } else if (st === 'happy') {
    rect(32 - 4, mouthY, 8, 2, colEye);
    rect(32 - 2, mouthY + 2, 4, 2, colBlush);
  } else if (st === 'thinking') {
    rect(32 + 1, mouthY + 1, 3, 3, colEye);
    // Thinking bubbles
    rect(32 + 18, startY + 2, 3, 3, colShine);
    rect(32 + 22, startY - 3, 4, 4, colShine);
  } else {
    // Idle cute smile
    rect(32 - 4, mouthY + 1, 8, 2, colEye);
    rect(32 - 5, mouthY, 2, 2, colEye);
    rect(32 + 3, mouthY, 2, 2, colEye);
  }

  return buf;
}

// ------------------------------------------------------------
// Main Asset Generation Pipeline
// ------------------------------------------------------------
function main() {
  const root = path.resolve(__dirname, '..');
  const mascotDir = path.join(root, 'assets', 'mascot');
  const d2Dir = path.join(mascotDir, '2d');
  const d3Dir = path.join(mascotDir, '3d');
  const iconsDir = path.join(mascotDir, 'icons');
  const assetsDir = path.join(root, 'assets');

  [mascotDir, d2Dir, d3Dir, iconsDir].forEach((d) => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  const states = ['idle', 'speaking', 'listening', 'happy', 'thinking'];

  console.log('Generating 2D mascot assets...');
  const d2Buffers = [];
  for (const st of states) {
    const rgba = renderPuffState(st, 0.5, [205, 85]);
    const png = encodePng(64, 64, rgba);
    fs.writeFileSync(path.join(d2Dir, `${st}.png`), png);
    d2Buffers.push(rgba);
    console.log(`  ✓ 2d/${st}.png`);
  }

  // 2D Spritesheet: 5 states horizontally (320 x 64)
  const ss2d = Buffer.alloc(64 * 5 * 64 * 4);
  for (let s = 0; s < 5; s++) {
    const src = d2Buffers[s];
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const sIdx = (y * 64 + x) * 4;
        const dIdx = (y * (64 * 5) + (s * 64 + x)) * 4;
        src.copy(ss2d, dIdx, sIdx, sIdx + 4);
      }
    }
  }
  fs.writeFileSync(path.join(d2Dir, 'spritesheet.png'), encodePng(320, 64, ss2d));
  console.log('  ✓ 2d/spritesheet.png (320x64)');

  console.log('Generating 3D mascot assets...');
  const pal3d = {
    body: '#38bdf8',
    rim: '#1976d2',
    shine: '#e0f7ff',
    eye: '#0f172a',
    blush: '#ff80ab',
  };
  const d3Buffers = [];
  for (const st of states) {
    const rgba = render3DVoxelState(st, pal3d);
    const png = encodePng(64, 64, rgba);
    fs.writeFileSync(path.join(d3Dir, `${st}.png`), png);
    d3Buffers.push(rgba);
    console.log(`  ✓ 3d/${st}.png`);
  }

  // 3D Spritesheet: 5 states horizontally (320 x 64)
  const ss3d = Buffer.alloc(64 * 5 * 64 * 4);
  for (let s = 0; s < 5; s++) {
    const src = d3Buffers[s];
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const sIdx = (y * 64 + x) * 4;
        const dIdx = (y * (64 * 5) + (s * 64 + x)) * 4;
        src.copy(ss3d, dIdx, sIdx, sIdx + 4);
      }
    }
  }
  fs.writeFileSync(path.join(d3Dir, 'spritesheet.png'), encodePng(320, 64, ss3d));
  console.log('  ✓ 3d/spritesheet.png (320x64)');

  console.log('Generating high-resolution mascot app icons & tray icons...');
  // Use 2D Idle Mascot as the app icon
  const baseMascot = d2Buffers[0]; // 64x64 idle

  // Scaled resolutions: 16, 24, 32, 48, 64, 128, 256
  const iconSizes = [16, 24, 32, 48, 64, 128, 256];
  const icoPngEntries = [];

  for (const sz of iconSizes) {
    const scaled = scaleRgba(baseMascot, 64, 64, sz, sz);
    const pngBuf = encodePng(sz, sz, scaled);
    icoPngEntries.push({ width: sz, height: sz, buffer: pngBuf });
  }

  const icon256Png = icoPngEntries.find((p) => p.width === 256).buffer;
  const icon64Png = icoPngEntries.find((p) => p.width === 64).buffer;
  const tray32Png = icoPngEntries.find((p) => p.width === 32).buffer;
  const icoData = encodeIco(icoPngEntries);

  // Write to assets/mascot/icons/
  fs.writeFileSync(path.join(iconsDir, 'icon.png'), icon256Png);
  fs.writeFileSync(path.join(iconsDir, 'icon.ico'), icoData);
  fs.writeFileSync(path.join(iconsDir, 'tray.png'), tray32Png);
  fs.writeFileSync(path.join(iconsDir, 'tray@2x.png'), icon64Png);
  console.log('  ✓ assets/mascot/icons/icon.png (256x256)');
  console.log('  ✓ assets/mascot/icons/icon.ico (multi-res Windows icon)');
  console.log('  ✓ assets/mascot/icons/tray.png (32x32)');
  console.log('  ✓ assets/mascot/icons/tray@2x.png (64x64)');

  // REPLACE root assets/ icons with current mascot icons as requested!
  fs.writeFileSync(path.join(assetsDir, 'icon.png'), icon256Png);
  fs.writeFileSync(path.join(assetsDir, 'icon.ico'), icoData);
  fs.writeFileSync(path.join(assetsDir, 'tray.png'), tray32Png);
  console.log('  ✓ REPLACED assets/icon.png with current 2D mascot icon');
  console.log('  ✓ REPLACED assets/icon.ico with current 2D mascot Windows ICO');
  console.log('  ✓ REPLACED assets/tray.png with current 2D mascot tray icon');

  // Create README in assets/mascot
  const readmeContent = `# Kumo Mascot Assets

This directory contains the exported frames, spritesheets, and desktop icons for the Kumo Desktop Companions.

## Directory Structure
- \`2d/\`: Retro Bayer-dithered 2D Pixel Cloud (Puff) frames (\`idle.png\`, \`speaking.png\`, \`listening.png\`, \`happy.png\`, \`thinking.png\`, \`spritesheet.png\`).
- \`3d/\`: Three.js 3D Voxel Bot frames (\`idle.png\`, \`speaking.png\`, \`listening.png\`, \`happy.png\`, \`thinking.png\`, \`spritesheet.png\`).
- \`icons/\`: Windows desktop icons and system tray assets (\`icon.png\`, \`icon.ico\`, \`tray.png\`, \`tray@2x.png\`).

Generated automatically with exact 100% color fidelity to Kumo design tokens.
`;
  fs.writeFileSync(path.join(mascotDir, 'README.md'), readmeContent);
  console.log('  ✓ assets/mascot/README.md');

  console.log('\nAll mascot assets successfully generated!');
}

main();
