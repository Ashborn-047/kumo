// ============================================================
// main.js — Electron Main Process
// Phase 0 + 1: Overlay window, tray, global hotkey, AI chat.
// ============================================================

const {
  app, BrowserWindow, ipcMain,
  globalShortcut, shell, nativeImage, Notification
} = require('electron');
const path = require('path');

const overlayManager = require('./overlay-manager');
const boardManager   = require('./board-manager');
const trayManager    = require('./tray');
const settings       = require('./settings');
const ai             = require('./ai');
const actions        = require('./actions');

function showNotification(title, body) {
  if (Notification.isSupported()) {
    new Notification({
      title,
      body,
      icon: path.join(__dirname, '../assets/icon.png'),
    }).show();
  }
}

const PRELOAD = path.join(__dirname, 'preload.js');

// ── App ready ─────────────────────────────────────────────────
app.whenReady().then(async () => {
  // Hide from taskbar — lives in tray only
  app.setAppUserModelId('com.goo.app');

  // Load settings
  const cfg = settings.get();

  // Init AI if key is available
  if (cfg.apiKey) {
    ai.init(cfg.apiKey);
    ai.detectBestModel().catch(console.warn);
  }

  // Create floating overlay window
  const overlay = overlayManager.create(PRELOAD);

  // Open the main Mochiboard Desktop application window
  boardManager.openBoardWindow(PRELOAD);

  // Create system tray
  trayManager.create({
    onShowOverlay: () => {
      overlayManager.show();
      overlay.webContents.executeJavaScript(`window.dispatchEvent(new Event('goo:focus-chat'))`);
    },
    onHideOverlay: () => overlayManager.hide(),
    onOpenBoard:   () => boardManager.openBoardWindow(PRELOAD),
    onOpenSettings: () => {
      overlayManager.show();
      overlay.webContents.executeJavaScript(`window.dispatchEvent(new Event('goo:open-settings'))`);
    },
    onQuit:        () => app.quit(),
  });

  // Global hotkey: Alt+Space → focus chat
  globalShortcut.register('Alt+Space', () => {
    overlayManager.show();
    overlay.webContents.executeJavaScript(`window.dispatchEvent(new Event('goo:focus-chat'))`);
  });

  // First-run: show setup if no API key yet
  if (settings.isFirstRun() || !cfg.apiKey) {
    overlay.webContents.once('did-finish-load', () => {
      overlay.webContents.executeJavaScript(`window.dispatchEvent(new Event('goo:first-run'))`);
    });
  }
});

// ── Cleanup ───────────────────────────────────────────────────
app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => {
  // Don't quit when all windows close — live in tray
});

// ── IPC Handlers ─────────────────────────────────────────────

// AI: send message, stream reply back to renderer, execute system actions
ipcMain.handle('ai:send', async (event, message) => {
  const cfg = settings.get();
  if (!cfg.apiKey) return { error: 'No API key set. Open settings (⚙️) to add your OpenRouter key.' };

  try {
    let fullText = '';
    const rawReply = await ai.sendMessage(message, [], (token) => {
      fullText += token;
      event.sender.send('ai:stream', token);
    });

    // Parse and run any requested system action
    const actionMatch = rawReply.match(/\[ACTION:\s*(\{.*?\})\s*\]/);
    if (actionMatch) {
      try {
        const actionData = JSON.parse(actionMatch[1]);
        const cleanReply = rawReply.replace(actionMatch[0], '').trim();

        const actionRes = await actions.run(actionData.type, actionData.args);
        let extraInfo = '';
        if (actionRes.ok) {
          if (actionData.type === 'clipboard.read') {
            extraInfo = `\n📋 Clipboard content:\n"${actionRes.result?.text || '(empty)'}"`;
          } else if (actionData.type === 'file.search') {
            const files = actionRes.result?.results || [];
            extraInfo = files.length
              ? `\n📁 Found ${files.length} file(s):\n${files.slice(0, 3).join('\n')}`
              : `\n📁 No matching files found on Desktop/Downloads.`;
          } else if (actionData.type === 'system.time') {
            extraInfo = `\n⏰ Time: ${actionRes.result?.time}`;
          } else if (actionData.type === 'system.date') {
            extraInfo = `\n📅 Date: ${actionRes.result?.date}`;
          } else if (actionData.type === 'system.info') {
            extraInfo = `\n💻 Specs: ${actionRes.result?.totalMem} RAM, ${actionRes.result?.cpus} CPUs (${actionRes.result?.arch})`;
          } else if (actionData.type === 'app.open') {
            extraInfo = `\n🚀 Opened: ${actionRes.result?.opened}`;
          } else if (actionData.type === 'folder.open') {
            extraInfo = `\n📂 Opened: ${actionRes.result?.opened}`;
          }
        } else {
          extraInfo = `\n⚠️ ${actionRes.error || 'Action could not be executed'}`;
        }

        return { ok: true, reply: cleanReply + extraInfo };
      } catch (parseErr) {
        console.warn('[main.js] Action JSON parse failed:', parseErr);
      }
    }

    return { ok: true, reply: rawReply };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

// Settings: get / save
ipcMain.handle('settings:get',  ()       => settings.get());
ipcMain.handle('settings:save', (_, data) => {
  const saved = settings.save(data);
  // Re-init AI if key changed
  if (data.apiKey) {
    ai.init(data.apiKey);
    ai.detectBestModel().catch(console.warn);
  }
  return saved;
});

// Board: list / load / save
ipcMain.handle('board:list',   ()        => boardManager.listBoards());
ipcMain.handle('board:load',   (_, id)   => boardManager.loadBoard(id));
ipcMain.handle('board:save',   (_, board)=> boardManager.saveBoard(board));

// Board ↔ Native Bridge IPC handler (used by Mochiboard ui/board/bridge.js)
ipcMain.on('board:call', async (event, { id, op, args }) => {
  try {
    let result = null;
    switch (op) {
      case 'list':
        result = boardManager.listBoards();
        break;
      case 'load':
        result = boardManager.loadBoard(args?.id);
        break;
      case 'save':
        result = boardManager.saveBoard(args?.board);
        break;
      case 'delete':
        result = boardManager.deleteBoard(args?.id);
        break;
      case 'folders':
        result = boardManager.getFolders();
        break;
      case 'saveFolders':
        result = boardManager.saveFolders(args?.folders);
        break;
      case 'reveal':
        boardManager.revealBoards();
        result = true;
        break;
      case 'export':
        result = boardManager.exportBoard(args?.id, args?.format);
        break;
      case 'ai:ask': {
        const cfg = settings.get();
        if (!cfg.apiKey) throw new Error('No API key set in Settings');
        result = await ai.askBoard(args.prompt, args.context || {});
        break;
      }
      default:
        console.warn(`[board:call] Unhandled operation: ${op}`);
        result = null;
    }
    event.sender.send('board:reply', id, true, result);
  } catch (err) {
    console.error(`[board:call] Error in ${op}:`, err);
    event.sender.send('board:reply', id, false, err.message);
  }
});

// Notifications
ipcMain.on('app:notify', (_, { title, body }) => {
  showNotification(title, body);
});

// Board export handler
ipcMain.handle('board:export', (_, { id, format }) => {
  return boardManager.exportBoard(id, format);
});

// System actions (safety-gated)
ipcMain.handle('action:run', async (event, { type, args }) => {
  return await actions.run(type, args, async (preview) => {
    // Ask renderer to confirm YELLOW actions
    const result = await event.sender.executeJavaScript(
      `window.__confirmAction && window.__confirmAction(${JSON.stringify(preview)})`
    );
    return result === true;
  });
});

// Window control
ipcMain.on('window:open-board',   () => boardManager.openBoardWindow(PRELOAD));
ipcMain.on('window:hide-overlay', () => overlayManager.hide());
ipcMain.on('window:show-overlay', () => overlayManager.show());

// Overlay mouse passthrough toggle (so clicks reach mascot body and input)
ipcMain.on('overlay:set-mouse', (event, ignore) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;
  if (ignore) {
    win.setIgnoreMouseEvents(true, { forward: true });
  } else {
    win.setIgnoreMouseEvents(false);
  }
});

// Overlay repositioning via drag
ipcMain.on('overlay:move', (event, { deltaX, deltaY }) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;
  const [currentX, currentY] = win.getPosition();
  win.setPosition(Math.round(currentX + deltaX), Math.round(currentY + deltaY));
});
