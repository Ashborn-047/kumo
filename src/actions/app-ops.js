// ============================================================
// src/actions/app-ops.js — Application Launch, Deep Linking, Office Docs & Sequences
// ============================================================

const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const systemScanner = require('../system-scanner');
const { shell } = require('./file-ops');

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
    const cwd = process.cwd();
    return new Promise((resolve) => {
      execFile('powershell.exe', ['-NoProfile', '-Command', `
        if (Get-Command cursor -ErrorAction SilentlyContinue) {
          Start-Process 'cursor.cmd' -ArgumentList '${cwd}' -WorkingDirectory '${cwd}'
          Write-Output 'OK:cursor'
        } elseif (Get-Command code -ErrorAction SilentlyContinue) {
          Start-Process 'code' -ArgumentList '${cwd}' -WorkingDirectory '${cwd}'
          Write-Output 'OK:code'
        } else {
          Start-Process 'shell:AppsFolder\\Anysphere.Cursor' -ErrorAction SilentlyContinue
          Write-Output 'OK:cursor-app'
        }
      `], { timeout: 5000 }, (err, stdout) => {
        resolve({ opened: stdout?.trim() || 'code' });
      });
    });
  } else if (cleanName === 'terminal' || cleanName === 'wt') {
    const cwd = process.cwd();
    return new Promise((resolve) => {
      execFile('powershell.exe', ['-NoProfile', '-Command', `
        if (Get-Command wt -ErrorAction SilentlyContinue) {
          Start-Process 'wt.exe' -ArgumentList '-d', '${cwd}'
          Write-Output 'OK:wt'
        } else {
          Start-Process 'powershell.exe' -WorkingDirectory '${cwd}'
          Write-Output 'OK:powershell'
        }
      `], { timeout: 5000 }, (err, stdout) => {
        resolve({ opened: stdout?.trim() || 'powershell' });
      });
    });
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

function openDeepLink({ uri, protocol, query }) {
  let targetUri = uri;
  if (!targetUri && protocol) {
    if (protocol === 'spotify' && query) {
      targetUri = `spotify:search:${encodeURIComponent(query)}`;
    } else if (protocol === 'tg' || protocol === 'telegram') {
      targetUri = `tg://msg?text=${encodeURIComponent(query || '')}`;
    } else if (protocol === 'whatsapp') {
      targetUri = `whatsapp://send?text=${encodeURIComponent(query || '')}`;
    } else if (protocol === 'vscode') {
      targetUri = `vscode://file/${query || ''}`;
    }
  }

  if (!targetUri) {
    return Promise.reject(new Error('Missing uri or protocol for deep link'));
  }

  // Safety whitelist for protocols
  const allowed = ['spotify:', 'tg:', 'whatsapp:', 'vscode:', 'cursor:', 'mailto:', 'ms-settings:', 'ms-clock:'];
  const isAllowed = allowed.some(p => String(targetUri).toLowerCase().startsWith(p));
  if (!isAllowed) {
    return Promise.reject(new Error(`Protocol not permitted for deep link: ${targetUri}`));
  }

  return new Promise((resolve, reject) => {
    execFile('powershell.exe', ['-NoProfile', '-Command', `Start-Process '${targetUri}'`], { timeout: 4000 }, (err) => {
      if (err) {
        shell.openExternal(targetUri).then(() => resolve({ opened: targetUri, ok: true })).catch(reject);
      } else {
        resolve({ opened: targetUri, ok: true });
      }
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

function createOfficeDocument({ type = 'excel', title = '', content = '', columns = [] }) {
  const docsDir = path.join(os.homedir(), 'Documents', 'Kumo_Docs');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

  const isExcel = type.toLowerCase().includes('excel') || type.toLowerCase().includes('sheet');
  const cleanTitle = (title || (isExcel ? 'Spreadsheet' : 'Document')).replace(/[\\/:*?"<>|]/g, '_').trim();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const baseName = `${cleanTitle}_${timestamp}`;

  if (isExcel) {
    const filePath = path.join(docsDir, `${baseName}.csv`);
    const headerRow = (Array.isArray(columns) && columns.length > 0)
      ? columns.join(',')
      : 'Item,Description,Date,Status,Notes';
    const initialContent = content ? `${headerRow}\n${content}` : `${headerRow}\nSample Entry,Created by Kumo,${new Date().toLocaleDateString()},Active,Auto-generated`;
    fs.writeFileSync(filePath, initialContent, 'utf8');

    return new Promise((resolve) => {
      execFile('powershell.exe', ['-NoProfile', '-Command', `
        if (Get-Command excel -ErrorAction SilentlyContinue) {
          Start-Process 'excel.exe' -ArgumentList '${filePath}'
        } else {
          Start-Process '${filePath}'
        }
      `], { timeout: 5000 }, () => {
        resolve({ created: true, type: 'excel', path: filePath, title: cleanTitle });
      });
    });
  } else {
    const filePath = path.join(docsDir, `${baseName}.rtf`);
    const dateStr = new Date().toLocaleString();
    const docText = content || 'Document created by Kumo Desktop Assistant.\n\nType your notes here...';
    const rtfContent = `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0\\fnil\\fcharset0 Segoe UI;}}
{\\colortbl ;\\red74\\green58\\blue190;\\red30\\green36\\blue51;}
\\f0\\fs28\\b\\cf1 ${cleanTitle}\\b0\\fs20\\par
\\cf2 Generated by Kumo Desktop Assistant • ${dateStr}\\par\\par
\\fs22 ${docText.replace(/\n/g, '\\par ')}
}`;
    fs.writeFileSync(filePath, rtfContent, 'utf8');

    return new Promise((resolve) => {
      execFile('powershell.exe', ['-NoProfile', '-Command', `
        if (Get-Command winword -ErrorAction SilentlyContinue) {
          Start-Process 'winword.exe' -ArgumentList '${filePath}'
        } else {
          Start-Process '${filePath}'
        }
      `], { timeout: 5000 }, () => {
        resolve({ created: true, type: 'word', path: filePath, title: cleanTitle });
      });
    });
  }
}

async function executeCompoundSequence({ steps = [] }, actionsRegistry = null) {
  if (!Array.isArray(steps) || steps.length === 0) {
    return Promise.reject(new Error('Missing steps array for compound sequence'));
  }

  const results = [];
  const ACTIONS = actionsRegistry || require('./registry');
  for (const step of steps) {
    const { type, args } = step;
    if (ACTIONS[type]?.fn) {
      try {
        const res = await ACTIONS[type].fn(args || {});
        results.push({ type, ok: true, result: res });
      } catch (err) {
        results.push({ type, ok: false, error: err.message });
      }
    }
  }

  return { sequenceCompleted: true, stepResults: results };
}

module.exports = {
  openApp,
  openDeepLink,
  interactWithApp,
  createOfficeDocument,
  executeCompoundSequence,
};

