// ============================================================
// src/actions/media.js — SMTC Media Playback & Spotify Actions
// ============================================================

const { execFile } = require('child_process');
const path = require('path');
const https = require('https');
const settings = require('../settings');

const sessionTrackHistory = [];

function formatTimeSec(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

function recordTrackToHistory(track) {
  if (!track || !track.title || track.title === 'Media Controller Idle' || track.title === 'Spotify Ready') return;
  const exists = sessionTrackHistory.find(t => t.title.toLowerCase() === track.title.toLowerCase());
  const entry = {
    title: track.title,
    artist: track.artist || 'Unknown',
    source: track.source || 'Media',
    mediaType: track.mediaType || (track.duration > 600 ? 'movie' : 'music'),
    position: track.position || 0,
    duration: track.duration || 0,
    stoppedAt: formatTimeSec(track.position || 0),
    progress: (track.duration && track.duration > 0) ? Math.min(100, Math.round(((track.position || 0) / track.duration) * 100)) : 0,
    status: track.status || (track.isPlaying ? 'Playing' : 'Paused'),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  if (exists) {
    Object.assign(exists, entry);
  } else {
    sessionTrackHistory.unshift(entry);
    if (sessionTrackHistory.length > 25) sessionTrackHistory.pop();
  }
}

function sendMediaKey(actionType = 'Toggle') {
  const ps = `
    $c = @'
    using System;
    using System.Runtime.InteropServices;
    public class MediaKey {
        [DllImport("user32.dll")]
        public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);
        public static void Toggle() {
            keybd_event(0xB3, 0, 0, UIntPtr.Zero);
            keybd_event(0xB3, 0, 2, UIntPtr.Zero);
        }
        public static void Next() {
            keybd_event(0xB0, 0, 0, UIntPtr.Zero);
            keybd_event(0xB0, 0, 2, UIntPtr.Zero);
        }
        public static void Prev() {
            keybd_event(0xB1, 0, 0, UIntPtr.Zero);
            keybd_event(0xB1, 0, 2, UIntPtr.Zero);
        }
        public static void Mute() {
            keybd_event(0xAD, 0, 0, UIntPtr.Zero);
            keybd_event(0xAD, 0, 2, UIntPtr.Zero);
        }
        public static void VolumeDown() {
            for (int i = 0; i < 3; i++) {
                keybd_event(0xAE, 0, 0, UIntPtr.Zero);
                keybd_event(0xAE, 0, 2, UIntPtr.Zero);
            }
        }
        public static void VolumeUp() {
            for (int i = 0; i < 3; i++) {
                keybd_event(0xAF, 0, 0, UIntPtr.Zero);
                keybd_event(0xAF, 0, 2, UIntPtr.Zero);
            }
        }
    }
'@
    Add-Type -TypeDefinition $c
    [MediaKey]::${actionType}()
  `;

  return new Promise((resolve, reject) => {
    execFile('powershell.exe', ['-NoProfile', '-Command', ps], { timeout: 3500 }, (err, stdout, stderr) => {
      if (err) reject(new Error(stderr || err.message));
      else resolve({ executed: actionType });
    });
  });
}

let cachedMediaStatus = null;
let lastMediaStatusTime = 0;
let inFlightMediaPromise = null;

function getMediaStatus() {
  const now = Date.now();
  // Return cached result if fresh (< 3000ms) to prevent PowerShell process thrashing
  if (cachedMediaStatus && (now - lastMediaStatusTime < 3000)) {
    return Promise.resolve(cachedMediaStatus);
  }
  // Coalesce concurrent requests into a single in-flight process
  if (inFlightMediaPromise) {
    return inFlightMediaPromise;
  }

  inFlightMediaPromise = new Promise((resolve) => {
    const scriptPath = path.join(__dirname, '..', 'media-helper.ps1');
    execFile('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath], { timeout: 3500 }, (err, stdout) => {
      inFlightMediaPromise = null;
      lastMediaStatusTime = Date.now();
      try {
        const parsed = JSON.parse(stdout?.trim() || '{}');
        if (parsed.title) recordTrackToHistory(parsed);
        cachedMediaStatus = parsed;
        resolve(parsed);
      } catch {
        const fallback = { isPlaying: false, status: 'Stopped', artist: 'System Audio', title: 'Media Controller Idle', source: 'None', position: 0, duration: 0 };
        cachedMediaStatus = fallback;
        resolve(fallback);
      }
    });
  });

  return inFlightMediaPromise;
}

function getMediaQueue() {
  const cfg = settings.get();
  const token = cfg.spotify?.accessToken;
  if (!token) {
    return Promise.resolve({
      connected: false,
      queue: sessionTrackHistory
    });
  }

  return new Promise((resolve) => {
    const req = https.get('https://api.spotify.com/v1/me/player/queue', {
      headers: { 'Authorization': `Bearer ${token}` }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const queue = (parsed.queue || []).slice(0, 10).map(t => ({
            title: t.name,
            artist: t.artists?.map(a => a.name).join(', ') || 'Unknown Artist',
            album: t.album?.name || '',
            duration: Math.round((t.duration_ms || 0) / 1000),
            uri: t.uri
          }));
          resolve({ connected: true, queue });
        } catch {
          resolve({ connected: false, queue: sessionTrackHistory });
        }
      });
    });
    req.on('error', () => resolve({ connected: false, queue: sessionTrackHistory }));
    req.setTimeout(2500, () => { req.destroy(); resolve({ connected: false, queue: sessionTrackHistory }); });
  });
}

module.exports = {
  sendMediaKey,
  getMediaStatus,
  getMediaQueue,
  recordTrackToHistory,
  formatTimeSec,
  sessionTrackHistory,
};

