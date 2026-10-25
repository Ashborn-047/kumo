// ============================================================
// studio-manager.js — Native Desktop Studio & Customizer Window
// Spawns a dedicated native Windows window for Kumo Studio
// ============================================================

const { BrowserWindow } = require('electron');
const path = require('path');

let studioWindow = null;

function openStudioWindow(preloadPath, options = {}) {
  if (studioWindow) {
    studioWindow.focus();
    return studioWindow;
  }

  studioWindow = new BrowserWindow({
    width: 1180,
    height: 800,
    minWidth: 920,
    minHeight: 640,
    title: 'Kumo Studio — Desktop Customizer & Lab',
    icon: path.join(__dirname, '../assets/icon.png'),
    autoHideMenuBar: true,
    backgroundColor: '#0a0d14',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const query = {};
  if (typeof options === 'string') {
    query.theme = options;
  } else if (typeof options === 'object' && options !== null) {
    if (options.mode) query.mode = options.mode;
    if (options.theme) query.theme = options.theme;
  }

  const studioPath = path.join(__dirname, '../ui/studio/index.html');
  studioWindow.loadFile(studioPath, { query });

  studioWindow.on('closed', () => {
    studioWindow = null;
  });

  return studioWindow;
}

function getStudioWindow() {
  return studioWindow;
}

function closeStudio() {
  if (studioWindow) {
    studioWindow.close();
    studioWindow = null;
  }
}

function control(action) {
  if (!studioWindow) return;
  if (action === 'minimize') studioWindow.minimize();
  else if (action === 'maximize') {
    studioWindow.isMaximized() ? studioWindow.unmaximize() : studioWindow.maximize();
  } else if (action === 'close') {
    studioWindow.close();
  }
}

module.exports = {
  open: openStudioWindow,
  openStudioWindow,
  get: getStudioWindow,
  getStudioWindow,
  close: closeStudio,
  closeStudio,
  control,
};

