// ============================================================
// board-manager.js — Board Window + File I/O
// Opens the Mochiboard canvas in a separate BrowserWindow.
// Reads/writes board JSON files from %APPDATA%\Kumo\boards\
// ============================================================

const electron = require('electron');
const { BrowserWindow } = electron;
const app = electron?.app;
const path = require('path');
const fs   = require('fs');
const os   = require('os');

const userDataDir = app?.getPath ? app.getPath('userData') : path.join(process.env.APPDATA || os.homedir(), 'Kumo');
const DATA_DIR   = path.join(userDataDir, 'boards');
const INDEX_FILE = path.join(userDataDir, 'boards-index.json');

let boardWindow = null;
let onOpenCallback = null;
let onCloseCallback = null;

function setLifecycleHooks({ onOpen, onClose }) {
  if (onOpen) onOpenCallback = onOpen;
  if (onClose) onCloseCallback = onClose;
}

// ── Window ────────────────────────────────────────────────────

function openBoardWindow(preloadPath, iconImage) {
  if (boardWindow && !boardWindow.isDestroyed()) {
    if (iconImage) {
      try { boardWindow.setIcon(iconImage); } catch {}
    }
    boardWindow.focus();
    return boardWindow;
  }

  boardWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Kumoboard — Assistant Workbench',
    icon: iconImage || path.join(__dirname, '../assets/icon.png'),
    autoHideMenuBar: true,
    show: false,
    backgroundColor: '#fbf8fc',
    center: true,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  boardWindow.loadFile(path.join(__dirname, '../ui/board/index.html'));
  boardWindow.once('ready-to-show', () => {
    boardWindow.show();
    boardWindow.focus();
    if (typeof onOpenCallback === 'function') {
      try { onOpenCallback(boardWindow); } catch (e) { console.warn(e); }
    }
  });
  boardWindow.on('closed', () => {
    boardWindow = null;
    if (typeof onCloseCallback === 'function') {
      try { onCloseCallback(); } catch (e) { console.warn(e); }
    }
  });

  return boardWindow;
}

function focusBoard() { boardWindow?.focus(); }
function get() { return boardWindow; }

// ── File I/O ──────────────────────────────────────────────────

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function listBoards() {
  ensureDataDir();
  try { return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8')); }
  catch { return []; }
}

function loadBoard(id) {
  const filePath = path.join(DATA_DIR, `${id}.json`);
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return null; }
}

function saveBoard(board) {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, `${board.id}.json`);
  // Atomic write: write to .tmp then rename
  fs.writeFileSync(filePath + '.tmp', JSON.stringify(board));
  fs.renameSync(filePath + '.tmp', filePath);

  // Update index
  let index = listBoards().filter(b => b.id !== board.id);
  index.unshift({ id: board.id, name: board.name, color: board.color, updated: Date.now() });
  fs.writeFileSync(INDEX_FILE + '.tmp', JSON.stringify(index));
  fs.renameSync(INDEX_FILE + '.tmp', INDEX_FILE);

  return true;
}

const FOLDERS_FILE = path.join(userDataDir, 'folders.json');

function getFolders() {
  ensureDataDir();
  try { return JSON.parse(fs.readFileSync(FOLDERS_FILE, 'utf8')); }
  catch { return []; }
}

function saveFolders(folders) {
  ensureDataDir();
  fs.writeFileSync(FOLDERS_FILE + '.tmp', JSON.stringify(folders));
  fs.renameSync(FOLDERS_FILE + '.tmp', FOLDERS_FILE);
  return true;
}

function deleteBoard(id) {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, `${id}.json`);
  try { fs.unlinkSync(filePath); } catch {}

  let index = listBoards().filter(b => b.id !== id);
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index));
  return true;
}

function revealBoards() {
  ensureDataDir();
  electron.shell.openPath(DATA_DIR);
}

function exportBoard(id, format) {
  const board = loadBoard(id);
  if (!board) return false;

  const exportDir = path.join(userDataDir, 'exports');
  fs.mkdirSync(exportDir, { recursive: true });

  if (format === 'markdown') {
    const md = `# ${board.name}\n\n` +
      board.cards.map(c => `### ${c.type}\n${c.text || ''}\n`).join('\n');
    const outPath = path.join(exportDir, `${board.name}.md`);
    fs.writeFileSync(outPath, md);
    electron.shell.showItemInFolder(outPath);
    return true;
  }

  const outPath = path.join(exportDir, `${board.name}.json`);
  fs.writeFileSync(outPath, JSON.stringify(board, null, 2));
  electron.shell.showItemInFolder(outPath);
  return true;
}

module.exports = {
  openBoardWindow,
  focusBoard,
  get,
  setLifecycleHooks,
  listBoards,
  loadBoard,
  saveBoard,
  getFolders,
  saveFolders,
  deleteBoard,
  revealBoards,
  exportBoard,
};
