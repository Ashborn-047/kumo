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
  'media.playPause':  { tier: TIER.GREEN,  fn: () => sendMediaKey('Toggle') },
  'media.next':       { tier: TIER.GREEN,  fn: () => sendMediaKey('Next') },
  'media.previous':   { tier: TIER.GREEN,  fn: () => sendMediaKey('Prev') },
  'media.mute':       { tier: TIER.GREEN,  fn: () => sendMediaKey('Mute') },
  'media.volUp':      { tier: TIER.GREEN,  fn: () => sendMediaKey('VolumeUp') },
  'media.volDown':    { tier: TIER.GREEN,  fn: () => sendMediaKey('VolumeDown') },
  'mascot.sleep':     { tier: TIER.GREEN,  fn: sleepMascot },

  // YELLOW — needs confirmation (or auto-confirm in settings)
  'app.open':         { tier: TIER.YELLOW, fn: openApp },
  'app.interact':     { tier: TIER.YELLOW, fn: interactWithApp },
  'folder.open':      { tier: TIER.YELLOW, fn: openFolder },
  'powershell.read':  { tier: TIER.YELLOW, fn: runPowerShellReadOnly },
  'powershell.write': { tier: TIER.YELLOW, fn: runPowerShellCommand },
  'process.kill':     { tier: TIER.YELLOW, fn: killProcess },
  'file.write':       { tier: TIER.YELLOW, fn: writeFileContent },
  'file.move':        { tier: TIER.YELLOW, fn: moveFile },
  'system.tasks':     { tier: TIER.YELLOW, fn: getRunningTasks },
  'system.lock':      { tier: TIER.YELLOW, fn: lockWorkstation },

  // RED — always refused, never executed
  'file.delete':      { tier: TIER.RED },
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

function openApp({ name, appId, app }) {
  const query = String(appId || name || app || '').trim();
  const cleanName = query.toLowerCase();

  const known = {
    calculator: 'calc.exe',
    calc: 'calc.exe',
    notepad: 'notepad.exe',
    paint: 'mspaint.exe',
    mspaint: 'mspaint.exe',
    explorer: 'explorer.exe',
    files: 'explorer.exe',
    chrome: 'chrome.exe',
    edge: 'msedge.exe',
    brave: 'brave.exe',
    spotify: 'spotify:',
    whatsapp: 'whatsapp:',
    telegram: 'tg:',
    steam: 'steam:',
    discord: 'discord:',
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
    taskmgr: 'taskmgr.exe',
    'task manager': 'taskmgr.exe',
    snippingtool: 'SnippingTool.exe',
    snip: 'SnippingTool.exe',
    powershell: 'powershell.exe',
    pwsh: 'powershell.exe',
    cmd: 'cmd.exe',
    terminal: 'powershell.exe',
    wt: 'powershell.exe',
    vlc: '{6D809377-6AF0-444B-8957-A3773F02200E}\\VideoLAN\\VLC\\vlc.exe',
    'vlc media player': '{6D809377-6AF0-444B-8957-A3773F02200E}\\VideoLAN\\VLC\\vlc.exe',
    netflix: '4DF9E0F8.Netflix_mcm4njqhnhss8!Netflix.App',
    'prime video': 'AmazonVideo.PrimeVideo_pwbj9vvecjh7j!PWA',
    prime: 'AmazonVideo.PrimeVideo_pwbj9vvecjh7j!PWA',
    crunchyroll: '15EF7777.Crunchyroll_mgdgtskya6f22!App',
    'media player': 'Microsoft.ZuneMusic_8wekyb3d8bbwe!Microsoft.ZuneMusic',
    cursor: 'Anysphere.Cursor',
  };

  let target = known[cleanName];

  // Smart aliases for editor and terminal
  if (cleanName === 'code' || cleanName === 'vscode' || cleanName === 'editor') {
    // Check if code is available or Cursor is installed
    target = 'code';
    try {
      const caps = systemScanner.getCapabilitiesSync();
      const devApps = caps?.categories?.development || [];
      const hasCode = devApps.some(a => a.id === 'visual-studio-code' || a.id === 'code');
      const hasCursor = devApps.find(a => a.id === 'cursor' || a.name.toLowerCase().includes('cursor'));
      if (!hasCode && hasCursor) {
        target = hasCursor.appId || 'Anysphere.Cursor';
      }
    } catch (_) {}
  } else if (cleanName === 'terminal' || cleanName === 'wt') {
    target = 'powershell.exe';
  }

  // Look up in system capabilities cache
  if (!target) {
    try {
      const caps = systemScanner.getCapabilitiesSync();
      if (caps && caps.categories) {
        for (const cat of Object.keys(caps.categories)) {
          const match = caps.categories[cat].find(a =>
            a.appId === query ||
            a.appId?.toLowerCase() === cleanName ||
            a.id === cleanName ||
            a.name.toLowerCase() === cleanName ||
            (cleanName.length >= 3 && a.name.toLowerCase().includes(cleanName)) ||
            (cleanName.length >= 3 && cleanName.includes(a.name.toLowerCase()))
          );
          if (match && match.appId) {
            target = match.appId;
            break;
          }
        }
      }
    } catch {}
  }

  if (!target) target = query;

  return new Promise((resolve, reject) => {
    // If target exists as a real file path
    if (fs.existsSync(target)) {
      shell.openPath(target).then((res) => {
        if (!res) return resolve({ opened: target });
        execFile('powershell.exe', ['-NoProfile', '-Command', `Start-Process '${target}'`], (err) => {
          if (!err) resolve({ opened: target });
          else reject(new Error(`Could not open path: ${target}`));
        });
      });
      return;
    }

    const safeTarget = target.replace(/['"`;$()]/g, '');
    let psCmd = '';

    if (safeTarget.startsWith('shell:AppsFolder\\')) {
      psCmd = `Start-Process '${safeTarget}' -ErrorAction Stop`;
    } else if (safeTarget.includes('\\') || safeTarget.includes('.') || safeTarget.includes('!') || safeTarget.startsWith('{') || safeTarget.startsWith('Microsoft.')) {
      psCmd = `Start-Process 'shell:AppsFolder\\${safeTarget}' -ErrorAction Stop`;
    } else if (safeTarget.endsWith(':') || safeTarget.endsWith('.exe')) {
      psCmd = `Start-Process '${safeTarget}' -ErrorAction Stop`;
    } else {
      psCmd = `Start-Process '${safeTarget}' -ErrorAction Stop`;
    }

    execFile('powershell.exe', ['-NoProfile', '-Command', `try { ${psCmd}; Write-Output 'OK' } catch { Write-Error 'Launch failed' }`], { timeout: 4000 }, (err, stdout) => {
      if (!err && stdout && stdout.includes('OK')) {
        return resolve({ opened: target });
      }

      // Try alternate without shell:AppsFolder or with it
      const altCmd = psCmd.includes('shell:AppsFolder')
        ? `Start-Process '${safeTarget}' -ErrorAction Stop`
        : `Start-Process 'shell:AppsFolder\\${safeTarget}' -ErrorAction Stop`;

      execFile('powershell.exe', ['-NoProfile', '-Command', `try { ${altCmd}; Write-Output 'OK' } catch { Write-Error 'Launch failed' }`], { timeout: 4000 }, (err2, stdout2) => {
        if (!err2 && stdout2 && stdout2.includes('OK')) {
          return resolve({ opened: target });
        }

        // Dynamic search in StartApps
        const cleanSearch = cleanName.replace(/['"`;$()]/g, '');
        const psSearch = `Get-StartApps | Where-Object { \${'$_'}.Name -like '*${cleanSearch}*' -or \${'$_'}.AppID -like '*${cleanSearch}*' } | Select-Object -First 1 -ExpandProperty AppID`;
        execFile('powershell.exe', ['-NoProfile', '-Command', psSearch], { timeout: 4000 }, (psErr, psOut) => {
          const foundAppId = psOut?.trim();
          if (foundAppId) {
            execFile('powershell.exe', ['-NoProfile', '-Command', `Start-Process 'shell:AppsFolder\\${foundAppId}'`], (appErr) => {
              if (appErr) reject(new Error(`Could not open app: ${name}`));
              else resolve({ opened: foundAppId });
            });
          } else {
            reject(new Error(`Application "${name}" was not found on your system.`));
          }
        });
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

function interactWithApp({ targetApp, text, pressEnter = true }) {
  if (!targetApp) {
    return Promise.reject(new Error('Missing targetApp for app interaction'));
  }

  const cleanApp = String(targetApp).toLowerCase().trim();
  const cleanText = text ? String(text).trim() : '';
  const hasText = cleanText.length > 0;

  // Known application launch identifiers if the target app is not already open
  const knownLaunchers = {
    claude: 'shell:AppsFolder\\AnthropicPBC.Claude_fnn82j28hfe8t!Claude',
    chatgpt: 'shell:AppsFolder\\OpenAI.ChatGPT-Desktop_2p2nqsd0c76g0!ChatGPT',
    notepad: 'notepad.exe',
    spotify: 'spotify:',
    terminal: 'wt.exe',
    code: 'code',
    word: 'winword',
    docs: 'winword',
    excel: 'excel',
    sheets: 'excel',
    powerpoint: 'powerpnt',
    discord: 'discord:',
    telegram: 'tg:',
    slack: 'slack:',
  };

  const ps = `
    Add-Type -AssemblyName System.Windows.Forms
    $wshell = New-Object -ComObject Wscript.Shell

    $activated = $wshell.AppActivate('${cleanApp}')
    if (-not $activated) {
      $titles = @('${cleanApp}', 'Claude', 'Anthropic', 'ChatGPT', 'Notepad', 'Word', 'Excel', 'PowerPoint', 'Spotify', 'Visual Studio Code', 'Discord', 'Telegram', 'Chrome', 'Edge', 'Slack', 'Obsidian')
      foreach ($t in $titles) {
        if ($wshell.AppActivate($t)) { $activated = $true; break; }
      }
    }

    if (-not $activated) {
      # Universal fallback: search any active window matching the app or process name
      $proc = Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*${cleanApp}*" -or $_.ProcessName -like "*${cleanApp}*" } | Select-Object -First 1
      if ($proc -and $proc.MainWindowTitle) {
        $activated = $wshell.AppActivate($proc.MainWindowTitle)
      }
    }

    if (-not $activated -and '${knownLaunchers[cleanApp] || ''}') {
      Start-Process '${knownLaunchers[cleanApp] || ''}'
      Start-Sleep -Milliseconds 1200
      $wshell.AppActivate('${cleanApp}')
    }

    Start-Sleep -Milliseconds 350
    ${hasText ? `
    Set-Clipboard -Value @'
${cleanText.replace(/'/g, "''")}
'@
    ` : ''}
    [System.Windows.Forms.SendKeys]::SendWait("^v")
    ${pressEnter ? `
    Start-Sleep -Milliseconds 250
    [System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
    ` : ''}
    Write-Output "INTERACTION_SUCCESS"
  `;

  return new Promise((resolve, reject) => {
    execFile('powershell.exe', ['-NoProfile', '-Command', ps], { timeout: 8000 }, (err) => {
      if (err) return reject(new Error(`Failed to interact with ${cleanApp}: ${err.message}`));
      resolve({ targetApp: cleanApp, text: cleanText, pasted: true, enterPressed: Boolean(pressEnter) });
    });
  });
}

function writeFileContent({ filePath, fileName, content }) {
  if (content === undefined || content === null) {
    return Promise.reject(new Error('No content provided to write'));
  }

  const os = require('os');
  let targetPath = filePath;

  if (!targetPath) {
    const notesDir = path.join(os.homedir(), 'Desktop', 'Kumo_Notes');
    if (!fs.existsSync(notesDir)) fs.mkdirSync(notesDir, { recursive: true });
    const cleanFileName = (fileName || `note_${Date.now()}`).replace(/[\\/:*?"<>|]/g, '_');
    targetPath = path.join(notesDir, cleanFileName.endsWith('.txt') || cleanFileName.endsWith('.md') ? cleanFileName : `${cleanFileName}.txt`);
  }

  const blocked = ['C:\\Windows', 'C:\\Program Files', 'C:\\Program Files (x86)'];
  if (blocked.some(b => targetPath.toLowerCase().startsWith(b.toLowerCase()))) {
    return Promise.reject(new Error('Writing to system directories is blocked for safety'));
  }

  try {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, content, 'utf8');
    return Promise.resolve({ written: true, path: targetPath, bytes: Buffer.byteLength(content, 'utf8') });
  } catch (err) {
    return Promise.reject(err);
  }
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

function sleepMascot() {
  try {
    const overlayManager = require('./overlay-manager');
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

// ── Helper: human-readable preview for YELLOW actions ─────────
function getPreview(type, args) {
  const previews = {
    'app.open':         `Open application: ${args.name}`,
    'app.interact':     `Send text to ${args.targetApp}: "${(args.text || '').slice(0, 50)}..."`,
    'folder.open':      `Open folder: ${args.folderPath}`,
    'powershell.read':  `Run PowerShell: ${args.command}`,
    'powershell.write': `Run PowerShell task: ${args.command}`,
    'file.write':       `Write file to: ${args.filePath || args.fileName || 'Desktop Note'}`,
    'process.kill':     `Terminate process: ${args.name}`,
    'file.move':        `Move file from ${args.from} to ${args.to}`,
    'system.tasks':     `Retrieve active running tasks and memory usage`,
    'system.lock':      `Lock Windows workstation screen`,
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

