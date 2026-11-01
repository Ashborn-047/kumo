// ============================================================
// src/main/ipc-handlers.js — Electron IPC Routing & Registration
// ============================================================

const { ipcMain, shell, BrowserWindow } = require('electron');
const path = require('path');
const intentRouter = require('../intent-router');
const settings = require('../settings');
const systemScanner = require('../system-scanner');
const actions = require('../actions');
const ai = require('../ai');
const { getSystemTelemetry } = require('./telemetry-service');

function registerIpcHandlers({
  overlayManager,
  boardManager,
  studioManager,
  ampManager,
  trayManager,
  islandManager,
  PRELOAD,
  getActiveTaskbarIcon,
  applySavedSettings,
  broadcastSettings,
  showNotification,
}) {
  // AI message via intent router
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

  // Settings
  ipcMain.handle('settings:get', () => settings.get());
  ipcMain.handle('settings:save', (_, data) => {
    const saved = settings.save(data || {});
    return applySavedSettings(saved, data || {});
  });

  // System Introspection
  ipcMain.handle('system:get-capabilities', () => systemScanner.getCapabilities());
  ipcMain.handle('system:rescan', () => systemScanner.scanSystem());
  ipcMain.handle('system:update-permission', (_, { appId, allowed }) => {
    return systemScanner.updateAppPermission(appId, allowed);
  });
  ipcMain.handle('system:get-telemetry', () => getSystemTelemetry());

  ipcMain.handle('shell:open-external', (_, url) => {
    if (typeof url === 'string' && /^https?:\/\//i.test(url)) {
      return shell.openExternal(url);
    }
    return false;
  });

  // Studio
  ipcMain.on('studio:open', (_, optionsOrTheme) => {
    const opts = typeof optionsOrTheme === 'string'
      ? (optionsOrTheme === 'wizard' ? { mode: 'wizard' } : { theme: optionsOrTheme })
      : (optionsOrTheme || { mode: 'studio' });
    studioManager.open(PRELOAD, opts, getActiveTaskbarIcon());
  });
  ipcMain.on('studio:close', () => studioManager.close());
  ipcMain.on('studio:window', (_, action) => studioManager.control(action));

  ipcMain.handle('studio:launch', (_, data) => {
    const saved = settings.save({ ...(data || {}), firstRun: false });
    applySavedSettings(saved, data || {});

    // Reveal Pulse Dynamic Island with the mascot at the user-chosen screen edge
    const islandEdge = saved.island?.edge || data?.islandEdge || 'top';
    const islandWin = islandManager.create(PRELOAD);
    islandManager.snapToEdge(islandEdge);
    islandWin.show();
    islandWin.webContents.send('settings:updated', saved);
    islandWin.webContents.send('companion:island-enter');
    islandWin.webContents.send('island:edge-changed', { edge: islandEdge });

    // Explicit constraint: Kumoboard does not open on onboarding finish.
    // Only the Dynamic Island and mascot appear on the desktop.

    if (!data?.keepOpen) {
      studioManager.close();
    }
    return saved;
  });

  // Mascot selection
  ipcMain.handle('mascot:list', () => trayManager.MASCOTS);
  ipcMain.handle('mascot:get', () => trayManager.getCurrentMascot());
  ipcMain.handle('mascot:set', (_, mascotId) => {
    const m = trayManager.resolveMascot(mascotId);
    const saved = settings.save({
      activeMascotId: m.id,
      mascot: m.id,
      engine: m.engine,
      avatarType: m.avatarType,
    });
    trayManager.updateMascotIcon(m.id);
    const taskbarIcon = trayManager.getIconForMascot(m.id, 64);
    if (taskbarIcon) {
      boardManager.get()?.setIcon(taskbarIcon);
      studioManager.get()?.setIcon(taskbarIcon);
    }
    broadcastSettings(saved);
    return { ok: true, mascot: m.id, name: m.name };
  });

  // Board
  ipcMain.handle('board:list', () => boardManager.listBoards());
  ipcMain.handle('board:load', (_, id) => boardManager.loadBoard(id));
  ipcMain.handle('board:save', (_, board) => boardManager.saveBoard(board));
  ipcMain.handle('board:export', (_, { id, format }) => boardManager.exportBoard(id, format));

  ipcMain.on('board:call', async (event, { id, op, args }) => {
    try {
      let result = null;
      switch (op) {
        case 'list': result = boardManager.listBoards(); break;
        case 'load': result = boardManager.loadBoard(args?.id); break;
        case 'save': result = boardManager.saveBoard(args?.board); break;
        case 'delete': result = boardManager.deleteBoard(args?.id); break;
        case 'folders': result = boardManager.getFolders(); break;
        case 'saveFolders': result = boardManager.saveFolders(args?.folders); break;
        case 'reveal': boardManager.revealBoards(); result = true; break;
        case 'export': result = boardManager.exportBoard(args?.id, args?.format); break;
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

  ipcMain.on('board:pin-card', (_, cardData) => {
    let boardWin = boardManager.get();
    if (boardWin && !boardWin.isDestroyed()) {
      boardWin.webContents.send('board:card-pinned', cardData);
      boardWin.show();
      boardWin.focus();
    } else {
      boardWin = boardManager.openBoardWindow(PRELOAD, getActiveTaskbarIcon());
      if (boardWin && !boardWin.isDestroyed()) {
        boardWin.webContents.once('did-finish-load', () => {
          boardWin.webContents.send('board:card-pinned', cardData);
        });
      }
    }
    showNotification('Kumoboard', `Pinned "${cardData?.title || 'Widget'}" to your canvas!`);
  });

  // Action safety gate
  ipcMain.handle('action:run', async (event, { type, args }) => {
    const cfg = settings.get();
    const perms = cfg.permissions || {};

    const isDirectlyPermitted = (
      (type === 'app.open' && perms.appLaunch !== false) ||
      (type === 'app.deepLink' && perms.appLaunch !== false) ||
      (type === 'app.interact' && perms.appLaunch !== false) ||
      (type === 'office.create' && perms.fileSearch !== false) ||
      (type === 'compound.sequence') ||
      (type === 'folder.open' && perms.fileSearch !== false) ||
      (type === 'powershell.read' && perms.shellSandbox !== false) ||
      (type === 'system.info' && perms.systemInfo !== false) ||
      (type === 'system.time' && perms.systemInfo !== false) ||
      (type === 'system.tasks' && perms.systemInfo !== false) ||
      (type === 'url.open' && perms.browserOpen !== false) ||
      (type === 'clipboard.read' && perms.clipboardAccess !== false) ||
      (type === 'clipboard.write' && perms.clipboardAccess !== false)
    );

    if (perms.autoConfirmYellow || isDirectlyPermitted) {
      return await actions.run(type, args);
    }

    return await actions.run(type, args, async (preview) => {
      try {
        const hasCustom = await event.sender.executeJavaScript("typeof window.__confirmAction === 'function'");
        if (hasCustom) {
          return await event.sender.executeJavaScript(`window.__confirmAction(${JSON.stringify(preview)})`);
        }
      } catch (_) {}

      try {
        const { dialog } = require('electron');
        const win = BrowserWindow.fromWebContents(event.sender);
        const { response } = await dialog.showMessageBox(win || undefined, {
          type: 'question',
          buttons: ['Allow', 'Cancel'],
          defaultId: 0,
          cancelId: 1,
          title: 'Kumo Safety Gate',
          message: 'Security Confirmation',
          detail: `Kumo wants to: ${preview}\n\nDo you want to allow this action?`,
        });
        return response === 0;
      } catch (_) {
        return false;
      }
    });
  });

  // Window control
  ipcMain.on('window:open-board', () => boardManager.openBoardWindow(PRELOAD, getActiveTaskbarIcon()));
  ipcMain.on('window:open-amp', () => ampManager?.open?.(PRELOAD, getActiveTaskbarIcon()));
  ipcMain.on('window:close-amp', () => ampManager?.close?.());
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

  // Overlay mouse & movement
  ipcMain.on('overlay:set-mouse', (event, ignore) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;
    if (ignore) {
      win.setIgnoreMouseEvents(true, { forward: true });
    } else {
      win.setIgnoreMouseEvents(false);
    }
  });

  ipcMain.on('overlay:move', (event, { deltaX, deltaY }) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;
    const [currentX, currentY] = win.getPosition();
    win.setPosition(Math.round(currentX + deltaX), Math.round(currentY + deltaY));
  });

  // Dynamic Island
  ipcMain.on('island:set-hit', (_event, interactive) => islandManager.setHit(interactive));
  ipcMain.on('island:set-state', (_event, state) => islandManager.setState(state));
  ipcMain.on('island:set-expanded', (_event, expanded) => islandManager.setExpanded(expanded));
  ipcMain.on('island:snap-edge', (_event, edge) => islandManager.snapToEdge(edge));
  ipcMain.on('island:set-clipboard-watch', (_event, enabled) => {
    const clipboardWatcher = require('../clipboard-watcher');
    clipboardWatcher.setWatching(enabled);
  });
  ipcMain.handle('island:get-clipboard-watch', () => {
    const clipboardWatcher = require('../clipboard-watcher');
    return clipboardWatcher.getWatching();
  });
  ipcMain.handle('island:get-config', () => ({
    edge: islandManager.getEdge(),
    expanded: islandManager.isIslandExpanded(),
  }));
  ipcMain.on('island:start-drag', (event, filePath) => {
    if (!filePath) return;
    const fs = require('fs');
    if (!fs.existsSync(filePath)) return;
    event.sender.startDrag({
      file: filePath,
      icon: path.join(__dirname, '../../assets/icon.png')
    });
  });

  ipcMain.on('companion:board-exit', () => {
    islandManager.get()?.webContents.send('companion:island-enter');
  });

  // Media
  ipcMain.handle('media:get-status', async () => {
    const res = await actions.run('media.status', {});
    return res?.result || res;
  });
  ipcMain.handle('media:get-queue', async () => {
    const res = await actions.run('media.queue', {});
    return res?.result || res;
  });

  ipcMain.on('app:notify', (_, { title, body }) => {
    showNotification(title, body);
  });
}

module.exports = {
  registerIpcHandlers,
};

