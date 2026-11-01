// ============================================================
// src/actions/system.js — System Telemetry & PowerShell Controls
// ============================================================

const os = require('os');
const { exec, execFile } = require('child_process');

function getTime() {
  return { time: new Date().toLocaleTimeString() };
}

function getDate() {
  return { date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) };
}

function getSystemInfo() {
  return {
    platform: os.platform(),
    arch:     os.arch(),
    cpus:     os.cpus().length,
    totalMem: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)} GB`,
    freeMem:  `${Math.round(os.freemem() / 1024 / 1024 / 1024)} GB`,
    hostname: os.hostname(),
  };
}

function sleepMascot() {
  try {
    const overlayManager = require('../overlay-manager');
    if (overlayManager && typeof overlayManager.hide === 'function') {
      overlayManager.hide();
      return Promise.resolve({ sleeping: true });
    }
  } catch {}
  return Promise.resolve({ sleeping: true });
}

function lockWorkstation() {
  return new Promise((resolve, reject) => {
    exec('rundll32.exe user32.dll,LockWorkStation', (err) => {
      if (err) reject(err);
      else resolve({ locked: true });
    });
  });
}

function getRunningTasks() {
  return new Promise((resolve) => {
    const ps = `Get-Process | Where-Object { \${'$_'}.MainWindowTitle -ne '' } | Sort-Object WorkingSet -Descending | Select-Object -First 8 Name, MainWindowTitle, @{Name='MemoryMB';Expression={[math]::Round(\${'$_'}.WorkingSet / 1MB, 1)}} | ConvertTo-Json -Compress`;
    execFile('powershell.exe', ['-NoProfile', '-Command', ps], { timeout: 4500 }, (err, stdout) => {
      if (err || !stdout) return resolve({ tasks: [] });
      try {
        const parsed = JSON.parse(stdout);
        const list = Array.isArray(parsed) ? parsed : [parsed];
        resolve({ tasks: list });
      } catch {
        resolve({ tasks: [] });
      }
    });
  });
}

function killProcess({ name }) {
  return new Promise((resolve) => {
    if (!name || typeof name !== 'string') {
      return resolve({ killed: false, error: 'Invalid process name' });
    }

    const cleanName = name.replace(/[;&|`$]/g, '').toLowerCase().trim();

    // Special case: closing Kumo mascot itself
    if (cleanName === 'kumo' || cleanName === 'mascot' || cleanName === 'overlay') {
      sleepMascot();
      return resolve({ killed: true, name: 'Kumo Mascot', message: 'Mascot is now asleep' });
    }

    const aliasMap = {
      calculator: 'calc',
      calc: 'calc',
      notepad: 'notepad',
      word: 'winword',
      excel: 'excel',
      powerpoint: 'powerpnt',
      terminal: 'windowsterminal',
      vscode: 'code',
      code: 'code',
      chrome: 'chrome',
      edge: 'msedge',
      brave: 'brave',
      spotify: 'spotify',
      discord: 'discord',
      telegram: 'telegram',
      slack: 'slack',
      steam: 'steam',
      vlc: 'vlc',
      blender: 'blender',
      postman: 'postman',
      docker: 'docker',
    };

    const targetProc = aliasMap[cleanName] || cleanName;
    const ps = `
      $procs = Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "*${targetProc}*" -or $_.ProcessName -like "*${targetProc}*" }
      if ($procs) {
        $procs | Stop-Process -Force -ErrorAction SilentlyContinue
        Write-Output "OK"
      } else {
        Write-Output "NOT_FOUND"
      }
    `;

    execFile('powershell.exe', ['-NoProfile', '-Command', ps], (err, stdout) => {
      const out = (stdout || '').trim();
      if (!err && out.includes('OK')) {
        resolve({ killed: true, name: cleanName });
      } else {
        resolve({ killed: false, name: cleanName, error: `No active process found for "${name}"` });
      }
    });
  });
}

function runPowerShellReadOnly({ command }) {
  // Only allow safe read-only commands — block destructive write operations
  const BLOCKED_REGEX = /\b(Remove-[a-zA-Z]+|Delete-[a-zA-Z]+|Set-[a-zA-Z]+|New-[a-zA-Z]+|Format-Volume|Format-Disk|Stop-Process|Restart-Computer|Invoke-WebRequest|rm\s+|del\s+|format\s+[a-zA-Z]:)/i;
  if (BLOCKED_REGEX.test(command)) {
    throw new Error('Command blocked — only read-only PowerShell commands are permitted for safety');
  }
  return new Promise((resolve, reject) => {
    execFile('powershell.exe', ['-NoProfile', '-Command', command], { timeout: 6000 }, (err, stdout, stderr) => {
      if (err) reject(new Error(stderr || err.message));
      else resolve({ output: (stdout || '').trim() });
    });
  });
}

function runPowerShellCommand({ command }) {
  if (!command || typeof command !== 'string') {
    return Promise.reject(new Error('No PowerShell command provided'));
  }

  const blocked = /\b(Format-Volume|Format-Disk|Clear-Disk|Drop-Database|rmdir\s+\/s\s+\/q\s+C:\\|del\s+\/f\s+\/s\s+\/q\s+C:\\)\b/i;
  if (blocked.test(command)) {
    return Promise.reject(new Error('Command blocked: destructive volume or disk modifications are forbidden'));
  }

  return new Promise((resolve, reject) => {
    execFile('powershell.exe', ['-NoProfile', '-Command', command], { timeout: 10000 }, (err, stdout, stderr) => {
      if (err) reject(new Error(stderr || err.message));
      else resolve({ output: (stdout || '').trim() });
    });
  });
}

module.exports = {
  getTime,
  getDate,
  getSystemInfo,
  sleepMascot,
  lockWorkstation,
  getRunningTasks,
  killProcess,
  runPowerShellReadOnly,
  runPowerShellCommand,
};

