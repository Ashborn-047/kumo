// ============================================================
// board-manager.js — Board Window + File I/O
// Opens the Mochiboard canvas in a separate BrowserWindow.
// Reads/writes board JSON files from %APPDATA%\Kumo\boards\
// ============================================================
// TODO Phase 2: implement all board file operations
// TODO Phase 2: board list / home screen
// TODO Phase 2: autosave every 30 seconds

const { BrowserWindow, app } = require('electron');
const path = require('path');
const fs   = require('fs');

const DATA_DIR   = path.join(app.getPath('userData'), 'boards');
const INDEX_FILE = path.join(app.getPath('userData'), 'boards-index.json');

let boardWindow = null;

// ── Window ────────────────────────────────────────────────────

function openBoardWindow(preloadPath) {
  if (boardWindow) { boardWindow.focus(); return; }

  boardWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Mochiboard — Kumo',
    icon: path.join(__dirname, '../assets/icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  boardWindow.loadFile(path.join(__dirname, '../ui/board/index.html'));
  boardWindow.on('closed', () => { boardWindow = null; });
}

function focusBoard() { boardWindow?.focus(); }

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

const FOLDERS_FILE = path.join(app.getPath('userData'), 'folders.json');

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
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    let index = listBoards().filter(b => b.id !== id);
    fs.writeFileSync(INDEX_FILE + '.tmp', JSON.stringify(index));
    fs.renameSync(INDEX_FILE + '.tmp', INDEX_FILE);
    return true;
  } catch (e) {
    console.error('Failed to delete board', e);
    return false;
  }
}

function revealBoards() {
  ensureDataDir();
  const { shell } = require('electron');
  shell.openPath(DATA_DIR);
}

function exportBoard(id, format = 'markdown') {
  const board = loadBoard(id);
  if (!board) return null;
  if (format === 'json') {
    return JSON.stringify(board, null, 2);
  }

  // Generate markdown representation
  let md = `# ${board.name || 'Untitled Board'}\n\n`;
  if (board.cards && Array.isArray(board.cards)) {
    board.cards.forEach((card) => {
      if (card.type === 'title') {
        md += `\n## ${card.text || 'Section'}\n\n`;
      } else if (card.type === 'todo') {
        md += `### ${card.text || 'To-Do List'}\n`;
        (card.items || []).forEach((it) => {
          const mark = it.done ? '[x]' : '[ ]';
          md += `- ${mark} ${it.t || ''}\n`;
        });
        md += '\n';
      } else if (card.type === 'note') {
        md += `> **Note (${card.color || 'default'}):**\n> ${card.text || ''}\n\n`;
      }
    });
  }
  return md;
}

module.exports = {
  openBoardWindow,
  focusBoard,
  listBoards,
  loadBoard,
  saveBoard,
  deleteBoard,
  getFolders,
  saveFolders,
  revealBoards,
  exportBoard,
  DATA_DIR,
};
