// ============================================================
// actions.js — Safety-Gated System Action Engine
// ALL system actions go through here.
// 3-tier safety system — RED tier can NEVER be overridden.
// ============================================================
// TODO Phase 3: implement each action handler
// TODO Phase 3: implement confirmation flow for YELLOW actions

const { shell, clipboard } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

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
  'file.move':        { tier: TIER.YELLOW, fn: moveFile },

  // RED — always refused, never executed
  'file.delete':      { tier: TIER.RED },
  'file.write':       { tier: TIER.RED },
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
  const os = require('os');
  const known = {
    calculator: 'calc:',
    calc: 'calc:',
    notepad: 'notepad.exe',
    paint: 'mspaint.exe',
    mspaint: 'mspaint.exe',
    explorer: 'explorer.exe',
    code: 'code',
    terminal: 'wt.exe',
    edge: 'msedge',
    chrome: 'chrome',
  };
  const cleanName = String(name).toLowerCase().trim();
  const target = known[cleanName] || name;

  return new Promise((resolve, reject) => {
    exec(`start "" "${target}"`, (err) => {
      if (err) {
        shell.openPath(target).then((res) => {
          if (res) reject(new Error(`Could not open app: ${name}`));
          else resolve({ opened: target });
        });
      } else {
        resolve({ opened: target });
      }
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
  // Only allow safe read-only commands
  const BLOCKED = ['Remove-', 'Delete-', 'Set-', 'Write-', 'New-', 'Format-', 'Stop-', 'Restart-', 'Clear-', 'Invoke-', 'rm', 'del', 'kill'];
  if (BLOCKED.some(b => command.toLowerCase().includes(b.toLowerCase()))) {
    throw new Error('Command blocked — only read-only PowerShell commands are permitted for safety');
  }
  return new Promise((resolve, reject) => {
    exec(`powershell -NoProfile -Command "${command}"`, { timeout: 5000 }, (err, stdout, stderr) => {
      if (err) reject(new Error(stderr || err.message));
      else resolve({ output: stdout.trim() });
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

// ── Helper: human-readable preview for YELLOW actions ─────────
function getPreview(type, args) {
  const previews = {
    'app.open':        `Open application: ${args.name}`,
    'folder.open':     `Open folder: ${args.folderPath}`,
    'powershell.read': `Run PowerShell: ${args.command}`,
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

module.exports = { run, TIER, ACTIONS };
