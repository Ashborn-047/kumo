// ============================================================
// studio-manager.js — Native Desktop Studio & Customizer Window
// Spawns a dedicated native Windows window for Kumo Studio
// ============================================================

const { BrowserWindow } = require('electron');
const path = require('path');

let studioWindow = null;

function openStudioWindow(preloadPath, initialAesthetic = 'glassmorphic') {
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

  const studioPath = path.join(__dirname, '../ui/studio/index.html');
  studioWindow.loadFile(studioPath, { query: { theme: initialAesthetic } });

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

module.exports = { openStudioWindow, getStudioWindow, closeStudio };
