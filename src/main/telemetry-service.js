// ============================================================
// src/main/telemetry-service.js — System Telemetry & SMTC Polling
// ============================================================

const os = require('os');
const { exec } = require('child_process');
const actions = require('../actions');

let cachedGitInfo = {
  gitBranch: 'main',
  gitRepo: 'kumo',
  lastFetched: 0,
};

function refreshGitInfoAsync() {
  const now = Date.now();
  if (now - cachedGitInfo.lastFetched < 300000) return; // cache for 5 minutes
  cachedGitInfo.lastFetched = now;

  exec('git rev-parse --abbrev-ref HEAD', { timeout: 1500 }, (err, stdout) => {
    if (!err && stdout) cachedGitInfo.gitBranch = stdout.trim() || 'main';
  });

  exec('git config --get remote.origin.url', { timeout: 1500 }, (err, stdout) => {
    if (!err && stdout) {
      const trimmed = stdout.trim();
      cachedGitInfo.gitRepo = trimmed.replace(/^.*[/:]([^/:]+\/[^/:]+?)(?:\.git)?$/, '$1') || 'kumo';
    }
  });
}

// Initial fetch deferred to idle / first broadcast


function getSystemTelemetry() {
  const totalMem = Math.max(1, Math.round(os.totalmem() / 1024 / 1024 / 1024));
  const freeMem = parseFloat((os.freemem() / 1024 / 1024 / 1024).toFixed(1));
  const usedMem = parseFloat((totalMem - freeMem).toFixed(1));
  const memPct = Math.min(100, Math.max(1, Math.round((usedMem / totalMem) * 100)));
  const cpus = os.cpus() || [];
  const cpuCount = cpus.length || 1;
  const loadAvg = os.loadavg() || [0, 0, 0];

  // Dynamically resolve primary IPv4 network interface
  let activeIp = '127.0.0.1';
  let activeIface = 'Loopback';
  let activeNetmask = '255.0.0.0';
  let activeGateway = '127.0.0.1';
  try {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          activeIp = net.address;
          activeNetmask = net.netmask;
          activeIface = name;
          activeGateway = activeIp.replace(/\.\d+$/, '.1');
          break;
        }
      }
      if (activeIp !== '127.0.0.1') break;
    }
  } catch (_) {}

  // Trigger non-blocking refresh if needed
  refreshGitInfoAsync();

  return {
    ram: { total: totalMem, free: freeMem, used: usedMem, pct: memPct },
    cpu: { count: cpuCount, model: cpus[0] ? cpus[0].model.trim() : 'Host CPU', load: loadAvg },
    network: {
      ip: activeIp,
      iface: activeIface,
      netmask: activeNetmask,
      gateway: activeGateway,
      dns: 'Online (Interface Active)',
    },
    env: {
      pid: process.pid,
      nodeVersion: process.version,
      platform: os.platform(),
      release: os.release(),
      hostname: os.hostname(),
      username: (os.userInfo() || {}).username || 'User',
      cwd: process.cwd(),
      tmpdir: os.tmpdir(),
      gitBranch: cachedGitInfo.gitBranch,
      gitRepo: cachedGitInfo.gitRepo,
    },
    uptime: Math.round(os.uptime()),
    timestamp: Date.now()
  };
}

let telemetryInterval = null;
function startTelemetryBroadcast(boardManager) {
  if (telemetryInterval) return;
  setTimeout(() => {
    telemetryInterval = setInterval(() => {
      const boardWin = boardManager.get();
      if (boardWin && !boardWin.isDestroyed() && boardWin.isVisible()) {
        const data = getSystemTelemetry();
        boardWin.webContents.send('board:telemetry-update', data);
      }
    }, 3000);
  }, 1500);
}

let lastMediaSignature = '';
let mediaSyncInterval = null;
function startMediaSync(islandManager, boardManager, ampManager) {
  if (mediaSyncInterval) return;
  setTimeout(() => {
    mediaSyncInterval = setInterval(async () => {
      const islandWin = islandManager.get();
      const boardWin = boardManager.get();
      const ampWin = ampManager?.get?.();
      const isIslandVisible = islandWin && !islandWin.isDestroyed() && islandWin.isVisible();
      const isBoardVisible = boardWin && !boardWin.isDestroyed() && boardWin.isVisible();
      const isAmpVisible = ampWin && !ampWin.isDestroyed() && ampWin.isVisible();
      if (!isIslandVisible && !isBoardVisible && !isAmpVisible) return;

      try {
        const res = await actions.run('media.status', {});
        const status = res?.result || res;
        if (!status) return;
        const signature = `${status.title}-${status.artist}-${status.status}-${status.position}`;
        if (signature !== lastMediaSignature) {
          lastMediaSignature = signature;
          if (isIslandVisible) {
            islandWin.webContents.send('media:status-update', status);
          }
          if (isBoardVisible) {
            boardWin.webContents.send('media:status-update', status);
          }
          if (isAmpVisible) {
            ampWin.webContents.send('media:status-update', status);
          }
        }
      } catch {}
    }, 4500);
  }, 4000);
}

module.exports = {
  getSystemTelemetry,
  startTelemetryBroadcast,
  startMediaSync,
};
