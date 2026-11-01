// ============================================================
// main.js — Electron Main Process
// Phase 0 + 1: Overlay window, tray, global hotkey, AI chat.
// ============================================================

const electron = require('electron');

// When spawned from an IDE terminal (VS Code / Cursor / Antigravity),
// ELECTRON_RUN_AS_NODE is often inherited in the environment, causing
// electron to run as raw Node.js where require('electron') returns the
// path string to electron.exe instead of the Electron API.
// Detect this condition and re-spawn cleanly without ELECTRON_RUN_AS_NODE.
if (typeof electron === 'string' || !electron.app) {
  const { spawn } = require('child_process');
  const path = require('path');
  const env = { ...process.env };
  delete env.ELECTRON_RUN_AS_NODE;
  const electronExe = typeof electron === 'string' ? electron : (process.env.ELECTRON_EXEC_PATH || 'electron');
  const child = spawn(electronExe, [path.join(__dirname, '..'), ...process.argv.slice(2)], {
    stdio: 'inherit',
    env
  });
  child.on('close', (code) => process.exit(code ?? 0));
  return;
}

const {
  app, globalShortcut, Notification
} = electron;
const path = require('path');

const overlayManager = require('./overlay-manager');
const boardManager   = require('./board-manager');
const studioManager  = require('./studio-manager');
const ampManager     = require('./amp-manager');
const trayManager    = require('./tray');
const settings       = require('./settings');
const ai             = require('./ai');
const islandManager  = require('./island');
const clipboardWatcher = require('./clipboard-watcher');
const { registerIpcHandlers } = require('./main/ipc-handlers');
const { startTelemetryBroadcast, startMediaSync } = require('./main/telemetry-service');

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
  ampManager.get()?.webContents.send(payload, updated);
  islandManager.get()?.webContents.send(payload, updated);
}

function getActiveMascotRecord() {
  const cfg = settings.get() || {};
  const key = cfg.engine || cfg.activeMascotId || cfg.mascot || (cfg.avatarType && cfg.avatarType !== 'vector' ? cfg.avatarType : null) || 'cotton-cloud';
  return trayManager.resolveMascot(key);
}

function getActiveTaskbarIcon() {
  const m = getActiveMascotRecord();
  return trayManager.getIconForMascot(m.id, 64);
}

function applySavedSettings(saved, incoming = {}) {
  if (incoming.apiKey) {
    ai.init(saved.apiKey);
    ai.detectBestModel().catch(console.warn);
  }
  if (Object.prototype.hasOwnProperty.call(incoming, 'autostart')) {
    applyLoginItem(saved.autostart);
  }
  if (incoming.engine || incoming.avatarType || incoming.mascot || incoming.activeMascotId) {
    const key = incoming.engine || incoming.activeMascotId || incoming.mascot || (incoming.avatarType && incoming.avatarType !== 'vector' ? incoming.avatarType : null);
    if (key) {
      const m = trayManager.resolveMascot(key);
      trayManager.updateMascotIcon(m.id);
      const taskbarIcon = trayManager.getIconForMascot(m.id, 64);
      if (taskbarIcon) {
        boardManager.get()?.setIcon(taskbarIcon);
        studioManager.get()?.setIcon(taskbarIcon);
        ampManager.get()?.setIcon(taskbarIcon);
      }
    }
  }
  broadcastSettings(saved);
  return saved;
}

// ── App ready ─────────────────────────────────────────────────
app.whenReady().then(async () => {
  app.setAppUserModelId('com.kumo.app');

  overlayManager.setPreload(PRELOAD);

  const cfg = settings.get();

  if (cfg.apiKey) {
    ai.init(cfg.apiKey);
    // Only detect if model is not already set, and defer to idle so boot remains instant
    if (!cfg.model) {
      setTimeout(() => {
        ai.detectBestModel().catch(console.warn);
      }, 8000);
    }
  }

  applyLoginItem(cfg.autostart);

  boardManager.setLifecycleHooks({
    onOpen: (win) => {
      islandManager.get()?.webContents.send('companion:dive-exit');
      overlayManager.hide();
      win.webContents.send('companion:board-enter');
    },
    onClose: () => {
      islandManager.get()?.webContents.send('companion:island-enter');
    }
  });

  const firstRun = settings.isFirstRun();
  let primaryWin = null;
  if (firstRun) {
    primaryWin = studioManager.open(PRELOAD, { mode: 'wizard' }, getActiveTaskbarIcon());
  } else {
    // Every time the user opens the application, only the island pops out, not the board
    primaryWin = islandManager.create(PRELOAD);
    const islandEdge = cfg.island?.edge || cfg.islandEdge || 'top';
    islandManager.snapToEdge(islandEdge);
    if (primaryWin && typeof primaryWin.once === 'function') {
      primaryWin.once('ready-to-show', () => {
        islandManager.popOut();
      });
    }
  }

  // Defer secondary windows and background monitoring until primary window is ready
  const initBackgroundServices = () => {
    // Configure desktop loopback audio capture on idle
    try {
      const { session, desktopCapturer } = electron;
      if (session?.defaultSession && typeof session.defaultSession.setDisplayMediaRequestHandler === 'function') {
        session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
          desktopCapturer.getSources({ types: ['screen'] })
            .then((sources) => {
              callback({ video: sources[0], audio: 'loopback' });
            })
            .catch(() => {
              callback({});
            });
        });
      }
    } catch (err) {
      console.warn('[main] loopback audio capture setup:', err.message);
    }

    islandManager.create(PRELOAD);
    if (cfg.startMinimized) {
      overlayManager.create(PRELOAD);
    }
    startTelemetryBroadcast(boardManager);
    startMediaSync(islandManager, boardManager, ampManager);
    clipboardWatcher.startWatcher(islandManager.get());
  };

  if (primaryWin && typeof primaryWin.once === 'function') {
    primaryWin.once('ready-to-show', () => {
      setTimeout(initBackgroundServices, 250);
    });
  } else {
    setTimeout(initBackgroundServices, 600);
  }

  const activeRecord = getActiveMascotRecord();
  trayManager.create({
    initialMascot: activeRecord.id,
    onShowOverlay: () => {
      overlayManager.show();
      overlayManager.get()?.webContents.executeJavaScript(`window.dispatchEvent(new Event('goo:focus-chat'))`);
    },
    onHideOverlay: () => overlayManager.hide(),
    onOpenBoard:   () => boardManager.openBoardWindow(PRELOAD, getActiveTaskbarIcon()),
    onOpenStudio:  () => studioManager.open(PRELOAD, { mode: 'studio' }, getActiveTaskbarIcon()),
    onOpenSettings: () => studioManager.open(PRELOAD, { mode: 'studio' }, getActiveTaskbarIcon()),
    onOpenAmp:     () => ampManager.open(PRELOAD, getActiveTaskbarIcon()),
    onQuit:        () => app.quit(),
    onSelectMascot: (mascotId) => {
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
        ampManager.get()?.setIcon(taskbarIcon);
      }
      broadcastSettings(saved);
      showNotification('Kumo Mascot', `Switched active mascot to ${m.name}`);
    },
  });

  globalShortcut.register('Alt+Space', () => {
    overlayManager.show();
    overlayManager.get()?.webContents.executeJavaScript(`window.dispatchEvent(new Event('goo:focus-chat'))`);
  });

  registerIpcHandlers({
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
  });
});

// ── Cleanup ───────────────────────────────────────────────────
app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => {});
