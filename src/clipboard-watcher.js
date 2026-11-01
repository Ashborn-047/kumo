// ============================================================
// src/clipboard-watcher.js — Background Clipboard Watcher Daemon
// "Copy as usual": Captures copied text, links, and screenshots
// and sends them to the Edge Drop shelf in Pulse Island
// ============================================================

const electron = require('electron');
const { clipboard } = electron;
const path = require('path');
const fs = require('fs');
const os = require('os');

let watcherInterval = null;
let lastText = '';
let lastImageHash = '';
let isWatching = true;
let targetWindow = null;

function setTarget(win) {
  targetWindow = win;
}

function setWatching(enabled) {
  isWatching = Boolean(enabled);
}

function getWatching() {
  return isWatching;
}

function startWatcher(win) {
  if (win) targetWindow = win;
  if (watcherInterval) clearInterval(watcherInterval);

  try {
    lastText = clipboard.readText() || '';
  } catch {}

  watcherInterval = setInterval(() => {
    if (!isWatching) return;
    if (!targetWindow || targetWindow.isDestroyed()) return;

    try {
      // 1. Check for text / URL clipboard changes
      const currentText = clipboard.readText();
      if (currentText && currentText.trim() && currentText !== lastText) {
        lastText = currentText;
        const trimmed = currentText.trim();
        const isUrl = /^(https?:\/\/|www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$)/i.test(trimmed);

        targetWindow.webContents.send('island:clipboard-change', {
          id: `clip-${Date.now()}`,
          name: isUrl ? trimmed : (trimmed.slice(0, 30) + (trimmed.length > 30 ? '...' : '')),
          content: trimmed,
          type: isUrl ? 'link' : 'snippet',
          badge: isUrl ? 'URL' : 'CLIPBOARD',
          preview: trimmed,
          time: 'Just now'
        });
        return;
      }

      // 2. Check for image / screenshot clipboard changes (e.g. Win+Shift+S Snipping Tool)
      const nativeImg = clipboard.readImage();
      if (nativeImg && !nativeImg.isEmpty()) {
        const imgSize = nativeImg.getSize();
        if (imgSize.width > 0 && imgSize.height > 0) {
          const imgBuffer = nativeImg.toPNG();
          const currentHash = `${imgSize.width}x${imgSize.height}-${imgBuffer.length}`;

          if (currentHash !== lastImageHash) {
            lastImageHash = currentHash;
            // Save screenshot to temp file for native drag-out support
            const tmpPath = path.join(os.tmpdir(), `kumo-snip-${Date.now()}.png`);
            fs.writeFileSync(tmpPath, imgBuffer);

            targetWindow.webContents.send('island:clipboard-change', {
              id: `clip-img-${Date.now()}`,
              name: `Screenshot ${imgSize.width}x${imgSize.height}.png`,
              path: tmpPath,
              type: 'file',
              badge: `${Math.round(imgBuffer.length / 1024) || 1} KB`,
              preview: `Screenshot · ${imgSize.width}x${imgSize.height}px`,
              thumbnail: nativeImg.toDataURL(),
              time: 'Just now'
            });
          }
        }
      }
    } catch (err) {
      // Graceful error ignore on transient clipboard locks
    }
  }, 1000);
}

function stopWatcher() {
  if (watcherInterval) {
    clearInterval(watcherInterval);
    watcherInterval = null;
  }
}

module.exports = {
  startWatcher,
  stopWatcher,
  setTarget,
  setWatching,
  getWatching,
};
