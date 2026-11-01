// ============================================================
// island.js — Pulse Dynamic Island Overlay Window Controller
// Flush bezel docking, fixed transparent canvas (zero DWM stutter).
// Multi-edge docking (Top default, Left, Right — bottom prohibited).
// ============================================================

const { BrowserWindow, screen } = require('electron');
const path = require('path');

let islandWindow = null;
let currentEdge = 'top';

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 500;

function calculatePosition(edge = currentEdge) {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenW, height: screenH } = primaryDisplay.workAreaSize;

  let x = 0;
  let y = 0;

  switch (edge) {
    case 'left':
      x = 0;
      y = Math.round((screenH - CANVAS_HEIGHT) / 2);
      break;
    case 'right':
      x = screenW - CANVAS_WIDTH;
      y = Math.round((screenH - CANVAS_HEIGHT) / 2);
      break;
    case 'top':
    default:
      x = Math.round((screenW - CANVAS_WIDTH) / 2);
      y = 0;
      break;
  }

  return { x, y, width: CANVAS_WIDTH, height: CANVAS_HEIGHT };
}

function create(preloadPath) {
  if (islandWindow) return islandWindow;

  const bounds = calculatePosition('top');

  islandWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    transparent: true,
    frame: false,
    alwaysOnTop: 'screen-saver',
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    focusable: true,
    show: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  islandWindow.loadFile(path.join(__dirname, '../ui/island/index.html'));
  islandWindow.once('ready-to-show', () => {
    islandWindow?.show();
  });

  // Default passthrough: ignore clicks on transparent areas, forward mouse movement
  islandWindow.setIgnoreMouseEvents(true, { forward: true });

  islandWindow.on('closed', () => {
    islandWindow = null;
  });

  return islandWindow;
}

function snapToEdge(edge) {
  if (edge === 'bottom') {
    edge = 'top';
  }
  if (!['top', 'left', 'right'].includes(edge)) {
    edge = 'top';
  }

  currentEdge = edge;
  if (!islandWindow) return;

  const bounds = calculatePosition(currentEdge);
  islandWindow.setBounds(bounds, false);
  islandWindow.webContents.send('island:edge-changed', { edge: currentEdge });
}

function setHit(interactive) {
  if (!islandWindow || islandWindow.isDestroyed()) return;
  if (interactive) {
    islandWindow.setIgnoreMouseEvents(false);
  } else {
    islandWindow.setIgnoreMouseEvents(true, { forward: true });
  }
}

function show()  { islandWindow?.show(); }
function hide()  { islandWindow?.hide(); }
function toggle(){ islandWindow?.isVisible() ? hide() : show(); }
function popOut(){
  if (!islandWindow || islandWindow.isDestroyed()) return;
  islandWindow.show();
  islandWindow.webContents.send('island:pop-out');
}
function get()   { return islandWindow; }
function getEdge() { return currentEdge; }
function isIslandExpanded() { return false; }

module.exports = {
  create,
  show,
  hide,
  toggle,
  popOut,
  get,
  snapToEdge,
  setHit,
  getEdge,
  isIslandExpanded,
};
