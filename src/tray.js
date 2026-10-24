// ============================================================
// tray.js — System Tray Icon + Context Menu
// Creates the tray icon and its right-click menu.
// ============================================================
// TODO Phase 1: implement full tray setup
// TODO Phase 4: badge count on tray icon (social notifications)

const { Tray, Menu, nativeImage, app } = require('electron');
const path = require('path');

let tray = null;

function create({ onShowOverlay, onHideOverlay, onOpenBoard, onOpenSettings, onOpenStudio, onQuit }) {
  const iconPath = path.join(__dirname, '../assets/tray.png');

  let icon = nativeImage.createFromPath(iconPath);
  if (icon.isEmpty()) {
    icon = nativeImage.createFromPath(path.join(__dirname, '../assets/icon.png'));
  }

  try {
    tray = new Tray(icon);
    tray.setToolTip('Kumo — Desktop Companion');

    const contextMenu = Menu.buildFromTemplate([
      { label: 'Ask Kumo…',           click: onShowOverlay },
      { label: 'Open Planning Canvas', click: onOpenBoard   },
      { label: '🎨 Kumo Studio Lab…',  click: onOpenStudio || onOpenSettings },
      { type: 'separator' },
      { label: 'Show Mascot',         click: onShowOverlay },
      { label: 'Hide Mascot',         click: onHideOverlay },
      { type: 'separator' },
      { label: 'Settings…',           click: onOpenSettings || onShowOverlay },
      { type: 'separator' },
      { label: 'Quit Kumo',           click: onQuit        },
    ]);

    tray.setContextMenu(contextMenu);
    tray.on('click', onShowOverlay);
  } catch (err) {
    console.warn('System tray initialization note:', err.message);
  }

  return tray;
}

function setBadge(count) {
  // TODO Phase 6: overlay badge number on tray icon
}

module.exports = { create, setBadge };
