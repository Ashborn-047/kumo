// ============================================================
// tray.js — Dynamic Mascot System Tray & Taskbar Icon Manager
// Dynamically switches tray & taskbar icons to match selected mascot.
// Zero Emojis per user design mandate.
// ============================================================

const { Tray, Menu, nativeImage, app } = require('electron');
const path = require('path');
const fs = require('fs');

let tray = null;
let currentMascotId = 'cotton-cloud';
let callbacks = {};

const MASCOTS = [
  { id: 'cotton-cloud', engine: 'cotton', avatarType: 'vector', aliases: ['cotton', 'cloud', 'kumo', 'cotton-cloud'], name: 'Cotton Cloud (Kumo)', file: 'assets/mascot/cotton-cloud/cotton-cloud.png' },
  { id: 'kubo-bot',     engine: 'kubo',   avatarType: 'vector', aliases: ['kubo', 'bot', 'robot', 'kubo-bot'],       name: 'Kubo Bot',            file: 'assets/mascot/kubo-bot/kubo-bot.png' },
  { id: 'mochi-droplet',engine: 'droplet',avatarType: 'vector', aliases: ['mochi', 'droplet', 'drop', 'mochi-droplet'], name: 'Mochi Droplet',       file: 'assets/mascot/mochi-droplet/mochi-droplet.png' },
  { id: '3d-mochi-gel', engine: 'gel3d',  avatarType: '3d',     aliases: ['gel', '3d-gel', 'gel3d', 'mochi-gel', '3d-mochi-gel'], name: '3D Mochi Gel', file: 'assets/mascot/3d-mochi-gel/mochi-gel-3d.png' },
  { id: '2d',           engine: 'pixel2d',avatarType: '2d',     aliases: ['pixel', 'pixel-cloud', 'pixel2d', '2d'],  name: '2D Pixel Cloud',      file: 'assets/mascot/2d/pixel-cloud-2d.png' },
  { id: '3d',           engine: 'voxel3d',avatarType: '3d',     aliases: ['voxel', 'voxel-bot', 'voxel3d', '3d'],    name: '3D Voxel Bot',        file: 'assets/mascot/3d/voxel-bot-3d.png' },
];

function resolveMascot(idOrName) {
  if (!idOrName) return MASCOTS[0];
  const query = String(idOrName).toLowerCase().trim();
  const direct = MASCOTS.find((m) => m.id === query || m.engine === query);
  if (direct) return direct;
  const byAlias = MASCOTS.find((m) => m.aliases.some((a) => query.includes(a) || a.includes(query)));
  if (byAlias) return byAlias;
  return MASCOTS[0];
}

function getIconForMascot(mascotId, size = 32) {
  const m = resolveMascot(mascotId);
  const fullPath = path.join(__dirname, '..', m.file);
  if (fs.existsSync(fullPath)) {
    const raw = nativeImage.createFromPath(fullPath);
    if (!raw.isEmpty()) {
      const origSize = raw.getSize();
      // Maintain natural aspect ratio and center on a 100% transparent square buffer
      if (origSize.width && origSize.height) {
        const aspect = origSize.width / origSize.height;
        let w, h;
        if (aspect >= 1) {
          w = size;
          h = Math.max(1, Math.round(size / aspect));
        } else {
          h = size;
          w = Math.max(1, Math.round(size * aspect));
        }
        const resized = raw.resize({ width: w, height: h, quality: 'best' });
        if (typeof nativeImage.createFromBitmap === 'function') {
          try {
            const bmp = resized.toBitmap();
            const targetBuf = Buffer.alloc(size * size * 4, 0); // 100% transparent zero-alpha RGBA/BGRA
            const xOffset = Math.floor((size - w) / 2);
            const yOffset = Math.floor((size - h) / 2);
            for (let row = 0; row < h; row++) {
              const srcStart = row * w * 4;
              const srcEnd = srcStart + w * 4;
              const dstStart = ((row + yOffset) * size + xOffset) * 4;
              bmp.copy(targetBuf, dstStart, srcStart, srcEnd);
            }
            const padded = nativeImage.createFromBitmap(targetBuf, { width: size, height: size });
            if (!padded.isEmpty()) {
              return padded;
            }
          } catch (e) {
            // fallback to resized directly
          }
        }
        return resized;
      }
      return raw.resize({ width: size, height: size, quality: 'best' });
    }
  }
  const fallbackPath = path.join(__dirname, '../assets/tray.png');
  const fallback = nativeImage.createFromPath(fallbackPath);
  return fallback.resize({ width: size, height: size, quality: 'best' });
}

function buildContextMenu() {
  const mascotSubmenu = MASCOTS.map((m) => ({
    label: m.name,
    type: 'radio',
    checked: currentMascotId === m.id,
    click: () => {
      updateMascotIcon(m.id);
      if (typeof callbacks.onSelectMascot === 'function') {
        callbacks.onSelectMascot(m.id);
      }
    },
  }));

  return Menu.buildFromTemplate([
    { label: 'Ask Kumo...',           click: callbacks.onShowOverlay },
    { label: 'Open Planning Canvas',  click: callbacks.onOpenBoard   },
    { label: 'Kumo Studio Lab...',    click: callbacks.onOpenStudio || callbacks.onOpenSettings },
    { type: 'separator' },
    {
      label: 'Choose Mascot',
      submenu: mascotSubmenu,
    },
    { type: 'separator' },
    { label: 'Show Mascot',          click: callbacks.onShowOverlay },
    { label: 'Hide Mascot',          click: callbacks.onHideOverlay },
    { type: 'separator' },
    { label: 'Customize Kumo...',    click: callbacks.onOpenSettings || callbacks.onShowOverlay },
    { label: 'Settings...',          click: callbacks.onOpenSettings || callbacks.onShowOverlay },
    { type: 'separator' },
    { label: 'Quit Kumo',            click: callbacks.onQuit },
  ]);
}

function create(handlers = {}) {
  callbacks = handlers;
  currentMascotId = handlers.initialMascot || 'cotton-cloud';

  const icon = getIconForMascot(currentMascotId, 32);

  try {
    tray = new Tray(icon);
    const m = resolveMascot(currentMascotId);
    tray.setToolTip(`Kumo: ${m.name} — Desktop Companion`);
    tray.setContextMenu(buildContextMenu());
    tray.on('click', callbacks.onShowOverlay);
  } catch (err) {
    console.warn('System tray initialization note:', err.message);
  }

  return tray;
}

function updateMascotIcon(mascotId) {
  const m = resolveMascot(mascotId);
  currentMascotId = m.id;

  const icon = getIconForMascot(m.id, 32);

  if (tray) {
    try {
      tray.setImage(icon);
      tray.setToolTip(`Kumo: ${m.name} — Desktop Companion`);
      tray.setContextMenu(buildContextMenu());
    } catch (err) {
      console.warn('Tray update note:', err.message);
    }
  }

  return icon;
}

function getCurrentMascot() {
  return resolveMascot(currentMascotId);
}

function setBadge(count) {
  // Badge overlay support
}

module.exports = {
  create,
  updateMascotIcon,
  getIconForMascot,
  getCurrentMascot,
  resolveMascot,
  MASCOTS,
  setBadge,
};
