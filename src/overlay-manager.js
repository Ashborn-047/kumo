// ============================================================
// overlay-manager.js — Floating Mascot Window Controller
// Creates and manages the always-on-top transparent overlay
// window where the mascot lives.
// ============================================================
// TODO Phase 1: implement full overlay window creation
// TODO Phase 1: drag to reposition
// TODO Phase 4: animate show/hide with slide

const { BrowserWindow, screen } = require('electron');
const path = require('path');

let overlayWindow = null;
let cachedPreloadPath = null;

function setPreload(preloadPath) {
  if (preloadPath) cachedPreloadPath = preloadPath;
}

function create(preloadPath) {
  if (preloadPath) cachedPreloadPath = preloadPath;
  if (overlayWindow && !overlayWindow.isDestroyed()) return overlayWindow;

  const targetPreload = preloadPath || cachedPreloadPath;
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  const winW = 440;
  const winH = 480;

  overlayWindow = new BrowserWindow({
    width: winW,
    height: winH,
    x: width - winW - 24,       // bottom-right corner with 24px margin
    y: height - winH - 24,
    transparent: true,          // see-through background
    frame: false,               // no title bar
    alwaysOnTop: true,          // floats above all windows
    skipTaskbar: true,          // lives in tray
    resizable: false,
    hasShadow: false,
    show: false,                // remain hidden until explicitly displayed
    webPreferences: {
      preload: targetPreload,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  overlayWindow.loadFile(path.join(__dirname, '../ui/overlay/index.html'));

  // Click-through: clicks pass through transparent areas, but forward mousemove
  overlayWindow.setIgnoreMouseEvents(true, { forward: true });

  overlayWindow.on('closed', () => { overlayWindow = null; });

  return overlayWindow;
}

function show(preloadPath) {
  if (!overlayWindow || overlayWindow.isDestroyed()) {
    create(preloadPath || cachedPreloadPath);
  }
  overlayWindow?.show();
}

function hide()  { overlayWindow?.hide(); }
function toggle(){ overlayWindow?.isVisible() ? hide() : show(); }
function get()   { return overlayWindow; }

module.exports = { create, show, hide, toggle, get, setPreload };
