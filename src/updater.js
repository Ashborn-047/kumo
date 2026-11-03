// ============================================================
// src/updater.js — Kumo Auto-Update Manager (electron-updater)
// ============================================================

const electron = require('electron');
const app = electron?.app;
const ipcMain = electron?.ipcMain;
const shell = electron?.shell;
const pkg = require('../package.json');

function getAppVersion() {
  return app?.getVersion ? app.getVersion() : (pkg.version || '0.1.0');
}

let autoUpdaterInstance = null;
function getAutoUpdater() {
  if (autoUpdaterInstance) return autoUpdaterInstance;
  if (!app || typeof app.getVersion !== 'function') return null;
  try {
    const { autoUpdater } = require('electron-updater');
    autoUpdaterInstance = autoUpdater;
    return autoUpdaterInstance;
  } catch (err) {
    console.warn('[updater] Failed to initialize electron-updater:', err.message);
    return null;
  }
}

let updateState = {
  status: 'idle', // 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'
  info: null,
  progress: null,
  error: null,
  isPortable: Boolean(process.env.PORTABLE_EXECUTABLE_DIR || process.env.PORTABLE_EXECUTABLE_FILE),
};

let getWindowsRef = null;
let checkIntervalTimer = null;

function broadcastUpdate(channel, payload) {
  if (!getWindowsRef) return;
  const windows = getWindowsRef();
  for (const win of windows) {
    if (win && !win.isDestroyed() && win.webContents) {
      win.webContents.send(channel, payload);
    }
  }
}

function initUpdater({ getWindows } = {}) {
  getWindowsRef = getWindows;

  if (!ipcMain) return;

  // Register IPC handlers
  ipcMain.handle('updater:get-status', () => {
    return {
      ...updateState,
      currentVersion: getAppVersion(),
    };
  });

  ipcMain.handle('updater:check', async () => {
    const autoUpdater = getAutoUpdater();
    if (!autoUpdater || (!app.isPackaged && process.env.NODE_ENV !== 'test-updater')) {
      return {
        ok: false,
        message: 'Auto-update is only active in packaged production builds.',
        currentVersion: getAppVersion(),
      };
    }
    try {
      const res = await autoUpdater.checkForUpdates();
      return { ok: true, updateInfo: res?.updateInfo };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle('updater:quit-and-install', () => {
    const autoUpdater = getAutoUpdater();
    if (autoUpdater && updateState.status === 'downloaded') {
      setImmediate(() => {
        autoUpdater.quitAndInstall(false, true);
      });
      return { ok: true };
    }
    return { ok: false, message: 'No downloaded update ready to install.' };
  });

  ipcMain.handle('updater:open-release', (_, url) => {
    const targetUrl = url || 'https://github.com/Ashborn-047/kumo/releases/latest';
    if (shell) {
      shell.openExternal(targetUrl);
    }
    return { ok: true };
  });

  const autoUpdater = getAutoUpdater();
  if (!autoUpdater) return;

  // Configure autoUpdater
  autoUpdater.autoDownload = !updateState.isPortable;
  autoUpdater.autoInstallOnAppQuit = true;

  // Event handlers
  autoUpdater.on('checking-for-update', () => {
    updateState.status = 'checking';
    updateState.error = null;
    broadcastUpdate('updater:status-changed', updateState);
  });

  autoUpdater.on('update-available', (info) => {
    updateState.status = 'available';
    updateState.info = {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
    };
    broadcastUpdate('updater:status-changed', updateState);
    broadcastUpdate('updater:available', updateState.info);
  });

  autoUpdater.on('update-not-available', (info) => {
    updateState.status = 'not-available';
    updateState.info = info ? { version: info.version } : null;
    broadcastUpdate('updater:status-changed', updateState);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    updateState.status = 'downloading';
    updateState.progress = {
      percent: Math.round(progressObj.percent || 0),
      bytesPerSecond: progressObj.bytesPerSecond,
      transferred: progressObj.transferred,
      total: progressObj.total,
    };
    broadcastUpdate('updater:status-changed', updateState);
    broadcastUpdate('updater:progress', updateState.progress);
  });

  autoUpdater.on('update-downloaded', (info) => {
    updateState.status = 'downloaded';
    updateState.info = {
      version: info.version,
      releaseDate: info.releaseDate,
    };
    broadcastUpdate('updater:status-changed', updateState);
    broadcastUpdate('updater:downloaded', updateState.info);
  });

  autoUpdater.on('error', (err) => {
    console.warn('[updater] Update check/download notice:', err?.message || err);
    updateState.status = 'error';
    updateState.error = err ? (err.message || String(err)) : 'Unknown updater error';
    broadcastUpdate('updater:status-changed', updateState);
  });

  // Stagger initial check on app startup (15 seconds after launch)
  if (app.isPackaged) {
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch((err) => {
        console.warn('[updater] Initial background check notice:', err.message);
      });
    }, 15000);

    // Periodic check every 4 hours
    checkIntervalTimer = setInterval(() => {
      autoUpdater.checkForUpdates().catch(() => {});
    }, 4 * 60 * 60 * 1000);
  }
}

function cleanupUpdater() {
  if (checkIntervalTimer) {
    clearInterval(checkIntervalTimer);
    checkIntervalTimer = null;
  }
}

module.exports = {
  initUpdater,
  cleanupUpdater,
  getUpdateState: () => ({ ...updateState, currentVersion: getAppVersion() }),
};
