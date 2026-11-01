// ============================================================
// amp-manager.js — Standalone 400px Kumo Amp Deck Window
// Deck MK-IV Tactile Desktop Player (Strictly Zero Emojis)
// ============================================================

const { BrowserWindow } = require('electron');
const path = require('path');

let ampWindow = null;

function openAmpWindow(preloadPath, iconImage) {
  if (ampWindow && !ampWindow.isDestroyed()) {
    if (iconImage) {
      try { ampWindow.setIcon(iconImage); } catch {}
    }
    ampWindow.show();
    ampWindow.focus();
    return ampWindow;
  }

  ampWindow = new BrowserWindow({
    width: 420,
    height: 640,
    title: 'Kumo Amp // Standalone Deck MK-IV',
    icon: iconImage || path.join(__dirname, '../assets/icon.png'),
    frame: false,
    transparent: true,
    hasShadow: false,
    resizable: false,
    useContentSize: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const ampHtmlPath = path.join(__dirname, '../ui/amp/index.html');
  ampWindow.loadFile(ampHtmlPath);

  ampWindow.on('closed', () => {
    ampWindow = null;
  });

  return ampWindow;
}

function getAmpWindow() {
  return ampWindow;
}

function closeAmp() {
  if (ampWindow && !ampWindow.isDestroyed()) {
    ampWindow.close();
  }
}

function toggleAmp(preloadPath, iconImage) {
  if (ampWindow && !ampWindow.isDestroyed()) {
    if (ampWindow.isVisible()) {
      ampWindow.hide();
    } else {
      ampWindow.show();
      ampWindow.focus();
    }
    return;
  }
  openAmpWindow(preloadPath, iconImage);
}

module.exports = {
  open: openAmpWindow,
  openAmpWindow,
  get: getAmpWindow,
  close: closeAmp,
  toggle: toggleAmp,
};

