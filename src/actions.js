// ============================================================
// actions.js — Safety-Gated System Action Engine
// ALL system actions go through here.
// 3-tier safety system — RED tier can NEVER be overridden.
// ============================================================
// TODO Phase 3: implement each action handler
// TODO Phase 3: implement confirmation flow for YELLOW actions
const electron = require('electron');
const shell = electron?.shell || {
  openExternal: (url) => { require('child_process').exec(`start "" "${url}"`); return Promise.resolve(true); },
  openPath: (p) => { require('child_process').exec(`explorer "${p}"`); return Promise.resolve(''); }
};
const clipboard = electron?.clipboard || {
  readText: () => '',
  writeText: () => {}
};
const { exec, execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const settings = require('./settings');
const systemScanner = require('./system-scanner');

// ── Tier definitions ─────────────────────────────────────────
const TIER = {
  GREEN:  'green',   // silent, no confirmation needed
  YELLOW: 'yellow',  // ask user before doing
  RED:    'red',     // refuse, explain how to do it manually
};

// Action registry — maps action type to tier + handler
const ACTIONS = {
  // GREEN — safe reads
  'clipboard.read':   { tier: TIER.GREEN,  fn: readClipboard },
  'clipboard.write':  { tier: TIER.GREEN,  fn: writeClipboard },
  'file.search':      { tier: TIER.GREEN,  fn: searchFiles },
  'url.open':         { tier: TIER.GREEN,  fn: openUrl },
  'system.time':      { tier: TIER.GREEN,  fn: getTime },
  'system.date':      { tier: TIER.GREEN,  fn: getDate },
  'system.info':      { tier: TIER.GREEN,  fn: getSystemInfo },

  // YELLOW — needs confirmation
  'app.open':         { tier: TIER.YELLOW, fn: openApp },
  'folder.open':      { tier: TIER.YELLOW, fn: openFolder },
  'powershell.read':  { tier: TIER.YELLOW, fn: runPowerShellReadOnly },
  'process.kill':     { tier: TIER.YELLOW, fn: killProcess },
  'file.move':        { tier: TIER.YELLOW, fn: moveFile },

  // RED — always refused, never executed
  'file.delete':      { tier: TIER.RED },
  'file.write':       { tier: TIER.RED },
  'powershell.write': { tier: TIER.RED },
  'registry.write':   { tier: TIER.RED },
  'software.install': { tier: TIER.RED },
  'exe.run':          { tier: TIER.RED },
};

// ── Main dispatcher ───────────────────────────────────────────
/**
 * Run a system action through the safety gate.
 * @param {string} type   - action type from ACTIONS registry
 * @param {object} args   - action arguments
 * @param {Function} confirmFn - async fn(preview) => bool (for YELLOW)
 * @returns {object} { ok, result, error, tier }
 */
async function run(type, args = {}, confirmFn = null) {
  const action = ACTIONS[type];

  if (!action) {
    return { ok: false, error: `Unknown action: ${type}` };
  }

  // Check user-configured permissions
  const userSettings = settings.get();
  const perms = userSettings.permissions || {};

  if (type === 'app.open') {
    if (perms.appLaunch === false) {
      return { ok: false, tier: TIER.YELLOW, error: 'App launch permission is disabled in Kumoboard Security Settings.' };
    }
    // Granular per-application permission check from onboarding deep scan
    if (args && args.name) {
      const caps = systemScanner.getCapabilitiesSync();
      if (caps && caps.categories) {
        const cleanTarget = String(args.name).toLowerCase().trim();
        for (const cat of Object.keys(caps.categories)) {
          const found = caps.categories[cat].find(a =>
            a.name.toLowerCase() === cleanTarget ||
            a.id === cleanTarget ||
            (a.appId && a.appId.toLowerCase().includes(cleanTarget))
          );
          if (found && found.allowed === false) {
            return {
              ok: false,
              tier: TIER.YELLOW,
              error: `Automation for "${found.name}" has been disabled in your Kumoboard Application Permissions.`
            };
          }
        }
      }
    }
  }
  if ((type === 'clipboard.read' || type === 'clipboard.write') && perms.clipboardAccess === false) {
    return { ok: false, tier: TIER.GREEN, error: 'Clipboard permission is disabled in Kumoboard Security Settings.' };
  }
  if (type === 'powershell.read' && perms.shellSandbox === false) {
    return { ok: false, tier: TIER.YELLOW, error: 'PowerShell sandbox execution is disabled in Kumoboard Security Settings.' };
  }
  if ((type === 'file.search' || type === 'folder.open') && perms.fileSearch === false) {
    return { ok: false, tier: TIER.GREEN, error: 'File system access is disabled in Kumoboard Security Settings.' };
  }
  if ((type === 'system.info' || type === 'system.time') && perms.systemInfo === false) {
    return { ok: false, tier: TIER.GREEN, error: 'System telemetry access is disabled in Kumoboard Security Settings.' };
  }
  if (type === 'url.open' && perms.browserOpen === false) {
    return { ok: false, tier: TIER.GREEN, error: 'Browser launch is disabled in Kumoboard Security Settings.' };
  }

  // RED — refuse immediately
  if (action.tier === TIER.RED) {
    return {
      ok: false,
      tier: TIER.RED,
      error: `I can't do "${type}" — that's a manual step for safety reasons.`,
      manualInstructions: getManualInstructions(type, args),
    };
  }

  // YELLOW — ask first
  if (action.tier === TIER.YELLOW && confirmFn) {
    const preview = getPreview(type, args);
    const confirmed = await confirmFn(preview);
    if (!confirmed) {
      return { ok: false, tier: TIER.YELLOW, error: 'Cancelled by user' };
    }
  }

  // GREEN / confirmed YELLOW — execute
  try {
    const result = await action.fn(args);
    return { ok: true, tier: action.tier, result };
  } catch (err) {
    return { ok: false, tier: action.tier, error: err.message };
  }
}

// ── Action implementations ────────────────────────────────────

function readClipboard() {
  return { text: clipboard.readText() };
}

function writeClipboard({ text }) {
  clipboard.writeText(text);
  return { written: true };
}

function openUrl({ url }) {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error('Only http/https URLs allowed');
  }
  shell.openExternal(url);
  return { opened: url };
}

function getTime() {
  return { time: new Date().toLocaleTimeString() };
}

function getDate() {
  return { date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) };
}

function getSystemInfo() {
  const os = require('os');
  return {
    platform: os.platform(),
    arch:     os.arch(),
    cpus:     os.cpus().length,
    totalMem: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)} GB`,
    freeMem:  `${Math.round(os.freemem() / 1024 / 1024 / 1024)} GB`,
    hostname: os.hostname(),
  };
}

function searchFiles({ query, directory }) {
  const os = require('os');
  const targetDir = directory || path.join(os.homedir(), 'Desktop');
  const cleanQuery = String(query).replace(/['"`;$()]/g, '').trim();
  if (!cleanQuery) return Promise.resolve({ results: [] });

  return new Promise((resolve) => {
    // Quick search across Desktop, Downloads, and Documents
    const searchRoots = directory
      ? [`'${directory}'`]
      : [`'${path.join(os.homedir(), 'Desktop')}'`, `'${path.join(os.homedir(), 'Downloads')}'`, `'${path.join(os.homedir(), 'Documents')}'`];

    const psCmd = `Get-ChildItem -Path ${searchRoots.join(',')} -Filter '*${cleanQuery}*' -Recurse -Depth 3 -ErrorAction SilentlyContinue | Select-Object -First 10 -ExpandProperty FullName`;
    exec(`powershell -NoProfile -Command "${psCmd}"`, { timeout: 4500 }, (err, stdout) => {
      if (err || !stdout) return resolve({ results: [] });
      const paths = stdout.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      resolve({ results: paths });
    });
  });
}

function openApp({ name }) {
  const cleanName = String(name).toLowerCase().trim();
  const known = {
    calculator: 'calc:',
    calc: 'calc:',
    notepad: 'notepad.exe',
    paint: 'mspaint.exe',
    mspaint: 'mspaint.exe',
    explorer: 'explorer.exe',
    code: 'code',
    vscode: 'code',
    terminal: 'wt.exe',
    edge: 'msedge',
    chrome: 'chrome',
    spotify: 'spotify:',
    whatsapp: 'whatsapp:',
    telegram: 'tg:',
    steam: 'steam:',
    discord: 'discord:',
    claude: 'shell:AppsFolder\\AnthropicPBC.Claude_fnn82j28hfe8t!Claude',
    chatgpt: 'shell:AppsFolder\\OpenAI.ChatGPT-Desktop_2p2nqsd0c76g0!ChatGPT',
    word: 'winword',
    excel: 'excel',
    powerpoint: 'powerpnt',
    outlook: 'outlook:',
    settings: 'ms-settings:',
    camera: 'microsoft.windows.camera:',
    weather: 'bingweather:',
    maps: 'bingmaps:',
    clock: 'ms-clock:',
    photos: 'ms-photos:',
    store: 'ms-windows-store:',
    blender: 'shell:AppsFolder\\BlenderFoundation.Blender_ppwjx1n5r4v9t!BLENDER',
  };

  const target = known[cleanName] || name;

  return new Promise((resolve, reject) => {
    const safeTarget = target.replace(/['"`;$()]/g, '');

    // Non-blocking Windows kernel process dispatcher via Start-Process
    execFile('powershell.exe', ['-NoProfile', '-Command', `Start-Process '${safeTarget}'`], { timeout: 3500 }, (err) => {
      if (!err) {
        return resolve({ opened: target });
      }

      // Dynamic fallback: Search installed StartApps in PowerShell
      const cleanSearch = cleanName.replace(/['"`;$()]/g, '');
      const psSearch = `Get-StartApps | Where-Object { $_.Name -like '*${cleanSearch}*' } | Select-Object -First 1 -ExpandProperty AppID`;
      execFile('powershell.exe', ['-NoProfile', '-Command', psSearch], { timeout: 4000 }, (psErr, stdout) => {
        const appId = stdout?.trim();
        if (appId) {
          execFile('powershell.exe', ['-NoProfile', '-Command', `Start-Process 'shell:AppsFolder\\${appId}'`], (appErr) => {
            if (appErr) reject(new Error(`Could not open app: ${name}`));
            else resolve({ opened: appId });
          });
        } else {
          shell.openPath(target).then((res) => {
            if (res) reject(new Error(`Could not open app: ${name}`));
            else resolve({ opened: target });
          });
        }
      });
    });
  });
}

function openFolder({ folderPath }) {
  const os = require('os');
  const commonFolders = {
    desktop: path.join(os.homedir(), 'Desktop'),
    downloads: path.join(os.homedir(), 'Downloads'),
    documents: path.join(os.homedir(), 'Documents'),
    pictures: path.join(os.homedir(), 'Pictures'),
    home: os.homedir(),
    boards: path.join(os.homedir(), 'AppData', 'Roaming', 'Goo', 'boards'),
  };

  const key = String(folderPath).toLowerCase().trim();
  const resolved = commonFolders[key] || folderPath;

  return shell.openPath(resolved).then((err) => {
    if (err) throw new Error(`Could not open folder: ${resolved}`);
    return { opened: resolved };
  });
}

function runPowerShellReadOnly({ command }) {
  const { execFile } = require('child_process');
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

function moveFile({ from, to }) {
  const os = require('os');
  // Disallow moving out of or into Windows system directories
  const blockedPaths = ['C:\\Windows', 'C:\\Program Files', 'C:\\Program Files (x86)'];
  if (blockedPaths.some(p => from.startsWith(p) || to.startsWith(p))) {
    throw new Error('Moving system files is blocked');
  }

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(from)) return reject(new Error(`Source file does not exist: ${from}`));
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.rename(from, to, (err) => {
      if (err) reject(err);
      else resolve({ moved: true, from, to });
    });
  });
}

function killProcess({ name }) {
  return new Promise((resolve) => {
    if (!name || typeof name !== 'string') {
      return resolve({ killed: false, error: 'Invalid process name' });
    }
    const cleanName = name.replace(/[;&|`$]/g, '').trim();
    execFile('powershell.exe', ['-NoProfile', '-Command', `Stop-Process -Name "${cleanName}" -Force`], (err) => {
      if (err) resolve({ killed: false, name: cleanName, error: err.message });
      else resolve({ killed: true, name: cleanName });
    });
  });
}

// ── Helper: human-readable preview for YELLOW actions ─────────
function getPreview(type, args) {
  const previews = {
    'app.open':        `Open application: ${args.name}`,
    'folder.open':     `Open folder: ${args.folderPath}`,
    'powershell.read': `Run PowerShell: ${args.command}`,
    'process.kill':    `Terminate process: ${args.name}`,
    'file.move':       `Move file from ${args.from} to ${args.to}`,
  };
  return previews[type] || `Run action: ${type}`;
}

// ── Helper: manual instructions for RED actions ───────────────
function getManualInstructions(type, args) {
  const instructions = {
    'file.delete':      `To delete a file:\n1. Open File Explorer\n2. Navigate to the file\n3. Press Delete, then empty Recycle Bin`,
    'software.install': `To install software:\n1. Download the installer from the official website\n2. Run the installer as Administrator`,
    'registry.write':   `To edit the registry:\n1. Press Win+R, type regedit\n2. Navigate to the key and edit manually`,
    'exe.run':          `To run an executable:\n1. Navigate to it in File Explorer\n2. Double-click to run`,
  };
  return instructions[type] || `Please do this step manually for safety.`;
}

module.exports = { run, TIER, ACTIONS, getPreview, getManualInstructions };

