// ============================================================
// src/clipboard-watcher.js — Non-Blocking Background Clipboard Daemon
// "Copy as usual": Safely captures copied text, links, and screenshots
// and sends them to the Edge Drop shelf in Pulse Island
// Zero clipboard mutex lock: checks availableFormats first,
// uses fast raw bitmap sampling, and catches transient lock contention
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
let isChecking = false;

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

  // 2000ms polling interval: relaxed to eliminate Windows clipboard mutex contention with Snipping Tool
  watcherInterval = setInterval(() => {
    if (!isWatching) return;
    if (!targetWindow || targetWindow.isDestroyed()) return;
    if (isChecking) return;

    isChecking = true;

    try {
      // Step 1: Lightweight format inspection without opening heavy payload handles
      const formats = clipboard.availableFormats();
      if (!formats || formats.length === 0) {
        isChecking = false;
        return;
      }

      const hasText = formats.some(f => f.includes('text') || f.includes('string'));
      const hasImage = formats.some(f => f.includes('image') || f.includes('Bitmap'));

      // 1. Check for text / URL clipboard changes
      if (hasText) {
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
          isChecking = false;
          return;
        }
      }

      // 2. Check for image / screenshot clipboard changes (e.g. Win+Shift+S Snipping Tool)
      if (hasImage) {
        const nativeImg = clipboard.readImage();
        if (nativeImg && !nativeImg.isEmpty()) {
          const imgSize = nativeImg.getSize();
          if (imgSize.width > 0 && imgSize.height > 0) {
            // Fast size + raw memory sample check: avoids heavy synchronous toPNG() encoding on idle ticks
            const bitmapBuffer = nativeImg.toBitmap();
            const sampleSlice = bitmapBuffer.subarray(0, 48).toString('hex');
            const currentHash = `${imgSize.width}x${imgSize.height}-${bitmapBuffer.length}-${sampleSlice}`;

            if (currentHash !== lastImageHash) {
              lastImageHash = currentHash;

              // Only now encode to PNG for disk persistence and thumbnail
              const imgBuffer = nativeImg.toPNG();
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
      }
    } catch (err) {
      // Graceful error ignore on transient clipboard locks (e.g. while Snipping Tool is actively writing)
    } finally {
      isChecking = false;
    }
  }, 2000);
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
