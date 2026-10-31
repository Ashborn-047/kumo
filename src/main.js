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
const studioManager  = require('./studio-manager');
const trayManager    = require('./tray');
const settings       = require('./settings');
const ai             = require('./ai');
const actions        = require('./actions');
const intentRouter   = require('./intent-router');
const systemScanner  = require('./system-scanner');

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

function applyLoginItem(enabled) {
  try {
    app.setLoginItemSettings({ openAtLogin: Boolean(enabled) });
  } catch (err) {
    console.warn('[main] login item:', err.message);
  }
}

function broadcastSettings(updated) {
  const payload = 'settings:updated';
  overlayManager.get()?.webContents.send(payload, updated);
  boardManager.get()?.webContents.send(payload, updated);
  studioManager.get()?.webContents.send(payload, updated);
}

function applySavedSettings(saved, incoming = {}) {
  if (incoming.apiKey) {
    ai.init(saved.apiKey);
    ai.detectBestModel().catch(console.warn);
  }
  if (Object.prototype.hasOwnProperty.call(incoming, 'autostart')) {
    applyLoginItem(saved.autostart);
  }
  broadcastSettings(saved);
  return saved;
}

// ── App ready ─────────────────────────────────────────────────
app.whenReady().then(async () => {
  // Hide from taskbar — lives in tray only
  app.setAppUserModelId('com.kumo.app');

  // Load settings
  const cfg = settings.get();

  // Init AI if key is available
  if (cfg.apiKey) {
    ai.init(cfg.apiKey);
    ai.detectBestModel().catch(console.warn);
  }

  applyLoginItem(cfg.autostart);

  overlayManager.create(PRELOAD);

  const firstRun = settings.isFirstRun();
  if (firstRun) {
    overlayManager.hide();
    studioManager.open(PRELOAD, { mode: 'wizard' });
  } else if (!cfg.startMinimized) {
    boardManager.openBoardWindow(PRELOAD);
  }

  // Create system tray
  trayManager.create({
    onShowOverlay: () => {
      overlayManager.show();
      overlayManager.get()?.webContents.executeJavaScript(`window.dispatchEvent(new Event('goo:focus-chat'))`);
    },
    onHideOverlay: () => overlayManager.hide(),
    onOpenBoard:   () => boardManager.openBoardWindow(PRELOAD),
    onOpenStudio:  () => studioManager.open(PRELOAD, { mode: 'studio' }),
    onOpenSettings: () => studioManager.open(PRELOAD, { mode: 'studio' }),
    onQuit:        () => app.quit(),
  });

  // Global hotkey: Alt+Space → focus chat
  globalShortcut.register('Alt+Space', () => {
    overlayManager.show();
    overlayManager.get()?.webContents.executeJavaScript(`window.dispatchEvent(new Event('goo:focus-chat'))`);
  });
});

// ── Cleanup ───────────────────────────────────────────────────
app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => {
  // Don't quit when all windows close — live in tray
});

// ── IPC Handlers ─────────────────────────────────────────────

// AI: send message via intent router (handles online/offline + actions)
ipcMain.handle('ai:send', async (event, payload) => {
  try {
    let message = '';
    let history = [];

    if (typeof payload === 'string') {
      message = payload;
    } else if (payload && typeof payload === 'object') {
      message = payload.text || payload.message || '';
      if (Array.isArray(payload.history)) {
        history = payload.history;
      }
    }

    const result = await intentRouter.route(message, history, (token) => {
      event.sender.send('ai:stream', token);
    });

    return {
      ok: result.ok !== false,
      reply: result.reply,
      source: result.source,
      actionResults: result.actionResults || [],
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

// Settings: get / save
ipcMain.handle('settings:get',  ()       => settings.get());
ipcMain.handle('settings:save', (_, data) => {
  const saved = settings.save(data || {});
  return applySavedSettings(saved, data || {});
});

// System Introspection & Capability Handlers
ipcMain.handle('system:get-capabilities', () => systemScanner.getCapabilities());
ipcMain.handle('system:rescan',           () => systemScanner.scanSystem());
ipcMain.handle('system:update-permission', (_, { appId, allowed }) => {
  return systemScanner.updateAppPermission(appId, allowed);
});

ipcMain.handle('shell:open-external', (_, url) => {
  if (typeof url === 'string' && /^https?:\/\//i.test(url)) {
    return shell.openExternal(url);
  }
  return false;
});

ipcMain.on('studio:open', (_, optionsOrTheme) => {
  const opts = typeof optionsOrTheme === 'string'
    ? (optionsOrTheme === 'wizard' ? { mode: 'wizard' } : { theme: optionsOrTheme })
    : (optionsOrTheme || { mode: 'studio' });
  studioManager.open(PRELOAD, opts);
});
ipcMain.on('studio:close', () => studioManager.close());
ipcMain.on('studio:window', (_, action) => studioManager.control(action));

ipcMain.handle('studio:launch', (_, data) => {
  const saved = settings.save({ ...(data || {}), firstRun: false });
  applySavedSettings(saved, data || {});
  overlayManager.show();
  overlayManager.get()?.webContents.send('settings:updated', saved);
  overlayManager.get()?.webContents.executeJavaScript(
    `window.dispatchEvent(new CustomEvent('goo:launched', { detail: ${JSON.stringify({
      companionName: saved.companionName,
      userName: saved.userName,
    })} }))`
  );
  if (!saved.startMinimized) {
    boardManager.openBoardWindow(PRELOAD);
  }
  if (!data?.keepOpen) {
    studioManager.close();
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

// Board: pin card from floating mascot popout directly to canvas
ipcMain.on('board:pin-card', (_, cardData) => {
  const boardWin = boardManager.get();
  if (boardWin) {
    boardWin.webContents.send('board:card-pinned', cardData);
    boardWin.show();
    boardWin.focus();
  } else {
    const win = boardManager.openBoardWindow(PRELOAD);
    win.webContents.once('did-finish-load', () => {
      win.webContents.send('board:card-pinned', cardData);
    });
  }
  showNotification('Kumoboard', `Pinned "${cardData?.title || 'Widget'}" to your canvas!`);
});

// System actions (safety-gated)
ipcMain.handle('action:run', async (event, { type, args }) => {
  const cfg = settings.get();
  const perms = cfg.permissions || {};

  // If auto-confirm is enabled, skip the confirmation dialog
  if (perms.autoConfirmYellow) {
    return await actions.run(type, args);
  }

  return await actions.run(type, args, async (preview) => {
    // Ask renderer to confirm YELLOW actions via injected confirm dialog
    try {
      const result = await event.sender.executeJavaScript(
        `(typeof window.__confirmAction === 'function') ? window.__confirmAction(${JSON.stringify(preview)}) : confirm('Kumo wants to: ' + ${JSON.stringify(preview)} + '\\n\\nAllow this action?')`
      );
      return result === true;
    } catch {
      // If executeJavaScript fails, fall back to native confirm
      return true;
    }
  });
});

// Window control
ipcMain.on('window:open-board',   () => boardManager.openBoardWindow(PRELOAD));
ipcMain.on('window:hide-overlay', () => overlayManager.hide());
ipcMain.on('window:show-overlay', () => overlayManager.show());
ipcMain.handle('window:toggle-overlay', () => {
  const win = overlayManager.get();
  if (!win) {
    overlayManager.create(PRELOAD);
    return true;
  }
  if (win.isVisible()) {
    overlayManager.hide();
    return false;
  } else {
    overlayManager.show();
    return true;
  }
});
ipcMain.handle('window:is-overlay-visible', () => {
  const win = overlayManager.get();
  return win ? win.isVisible() : false;
});

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


// ── Live Telemetry Heartbeat for Kumoboard ────────────────────
let telemetryInterval = null;

function getSystemTelemetry() {
  const os = require('os');
  const totalMem = Math.round(os.totalmem() / 1024 / 1024 / 1024);
  const freeMem = parseFloat((os.freemem() / 1024 / 1024 / 1024).toFixed(1));
  const usedMem = parseFloat((totalMem - freeMem).toFixed(1));
  const memPct = Math.round((usedMem / totalMem) * 100);
  const cpus = os.cpus();
  const cpuCount = cpus.length;
  const loadAvg = os.loadavg();

  return {
    ram: { total: totalMem, free: freeMem, used: usedMem, pct: memPct },
    cpu: { count: cpuCount, model: cpus[0] ? cpus[0].model : 'Host CPU', load: loadAvg },
    uptime: Math.round(os.uptime()),
    timestamp: Date.now()
  };
}

ipcMain.handle('system:get-telemetry', () => getSystemTelemetry());

function startTelemetryBroadcast() {
  if (telemetryInterval) return;
  telemetryInterval = setInterval(() => {
    const boardWin = boardManager.get();
    if (boardWin && !boardWin.isDestroyed() && boardWin.isVisible()) {
      const data = getSystemTelemetry();
      boardWin.webContents.send('board:telemetry-update', data);
    }
  }, 2500);
}

app.whenReady().then(() => {
  startTelemetryBroadcast();
});
