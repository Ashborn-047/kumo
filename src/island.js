// ============================================================
// island.js — Pulse Dynamic Island Overlay Window Controller
// Dynamic state-based window sizing (zero screen blockage).
// Multi-edge docking (Top default, Left, Right — bottom prohibited).
// Standard topmost level (yields cleanly to Snipping Tool & OS overlays).
// ============================================================

const { BrowserWindow, screen } = require('electron');
const path = require('path');

let islandWindow = null;
let currentEdge = 'top';
let currentState = 'peek';

const SIZES = {
  peek: { width: 160, height: 26 },
  resting: { width: 400, height: 56 },
  unrolled: { width: 720, height: 600 }
};

function calculatePosition(edge = currentEdge, state = currentState) {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenW, height: screenH } = primaryDisplay.workAreaSize;

  const size = SIZES[state] || SIZES.unrolled;
  let width = size.width;
  let height = size.height;

  let x = 0;
  let y = 0;

  switch (edge) {
    case 'left':
      x = 0;
      y = Math.round((screenH - height) / 2);
      break;
    case 'right':
      x = screenW - width;
      y = Math.round((screenH - height) / 2);
      break;
    case 'top':
    default:
      x = Math.round((screenW - width) / 2);
      y = 0;
      break;
  }

  return { x, y, width, height };
}

function create(preloadPath, initialState = 'resting') {
  if (islandWindow) return islandWindow;

  currentState = initialState;
  const bounds = calculatePosition(currentEdge || 'top', initialState);

  islandWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    transparent: true,
    backgroundColor: '#00000000',
    frame: false,
    alwaysOnTop: true, // Standard topmost: floats above normal apps, yields cleanly to Snipping Tool
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
    islandWindow?.showInactive();
  });

  islandWindow.on('closed', () => {
    islandWindow = null;
  });

  return islandWindow;
}

function setState(state) {
  if (!['peek', 'resting', 'unrolled'].includes(state)) return;
  currentState = state;
  if (!islandWindow || islandWindow.isDestroyed()) return;

  const bounds = calculatePosition(currentEdge, currentState);
  islandWindow.setBounds(bounds, false);

  if (currentState !== 'unrolled') {
    islandWindow.setIgnoreMouseEvents(false);
  }
}

function snapToEdge(edge) {
  if (edge === 'bottom') {
    edge = 'top';
  }
  if (!['top', 'left', 'right'].includes(edge)) {
    edge = 'top';
  }

  currentEdge = edge;
  if (!islandWindow || islandWindow.isDestroyed()) return;

  const bounds = calculatePosition(currentEdge, currentState);
  islandWindow.setBounds(bounds, false);
  islandWindow.webContents.send('island:edge-changed', { edge: currentEdge });
}

function setHit(interactive) {
  if (!islandWindow || islandWindow.isDestroyed()) return;
  // In compact peek/resting states, the window is tightly sized to the chassis,
  // so global forward hooks are eliminated.
  if (interactive || currentState !== 'unrolled') {
    islandWindow.setIgnoreMouseEvents(false);
  } else {
    // Transparent pass-through when unrolled and mouse is outside card
    islandWindow.setIgnoreMouseEvents(true);
  }
}

function show()  { islandWindow?.showInactive(); }
function hide()  { islandWindow?.hide(); }
function toggle(){ islandWindow?.isVisible() ? hide() : show(); }
function popOut(){
  if (!islandWindow || islandWindow.isDestroyed()) return;
  setState('resting');
  islandWindow.showInactive();
  islandWindow.webContents.send('island:pop-out');
}
function get()   { return islandWindow; }
function getEdge() { return currentEdge; }
function getState() { return currentState; }
function isIslandExpanded() { return currentState === 'unrolled'; }

module.exports = {
  create,
  show,
  hide,
  toggle,
  popOut,
  get,
  snapToEdge,
  setState,
  getState,
  setHit,
  getEdge,
  isIslandExpanded,
};
