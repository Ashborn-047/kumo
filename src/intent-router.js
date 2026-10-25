// ============================================================
// intent-router.js — Smart Input Router
// Routes user input to Online Brain (LLM) or Offline Brain
// based on connectivity and API key availability.
// ============================================================

const ai = require('./ai');
const actions = require('./actions');
const settings = require('./settings');

// ── Intent patterns for offline brain ────────────────────────
const INTENT_PATTERNS = [
  // Folder open (specific folders)
  { pattern: /(?:open|show)\s+(?:my\s+)?(desktop|downloads|documents|pictures|home)\s*(?:folder)?/i, action: 'folder.open', extract: (m) => ({ folderPath: m[1].toLowerCase() }) },

  // URL open
  { pattern: /(?:open|go\s+to|browse|visit)\s+(https?:\/\/\S+)/i, action: 'url.open', extract: (m) => ({ url: m[1] }) },

  // Web search
  { pattern: /(?:search|google|look\s+up)\s+(?:for\s+|the\s+web\s+for\s+)?(.+)/i, action: 'url.open', extract: (m) => ({ url: `https://www.google.com/search?q=${encodeURIComponent(m[1].trim())}` }) },

  // File search
  { pattern: /(?:find|search|look\s+for|locate)\s+(?:file\s+|files?\s+)?(.+)/i, action: 'file.search', extract: (m) => ({ query: m[1].trim() }) },

  // Clipboard
  { pattern: /(?:read|show|paste|what(?:'s| is) (?:on|in) (?:my\s+)?)\s*clipboard/i, action: 'clipboard.read', extract: () => ({}) },
  { pattern: /copy\s+(?:this\s+)?(.+)\s+to\s+clipboard/i, action: 'clipboard.write', extract: (m) => ({ text: m[1].trim() }) },

  // Time & Date
  { pattern: /(?:what\s+time\s+is\s+it|tell\s+me\s+the\s+time|current\s+time|time\s+now|what(?:'s|\s+is)\s+(?:the\s+)?(?:current\s+)?time)/i, action: 'system.time', extract: () => ({}) },
  { pattern: /(?:what\s+date\s+is\s+it|today(?:'s)?\s+date|what(?:'s|\s+is)\s+(?:the\s+)?(?:today(?:'s)?\s+)?date)/i, action: 'system.date', extract: () => ({}) },
  { pattern: /what\s+(?:day|date)\s+(?:is\s+)?(?:it\s+)?today/i, action: 'system.date', extract: () => ({}) },

  // System info
  { pattern: /(?:system|pc|computer)\s+(?:info|specs?|details|status)/i, action: 'system.info', extract: () => ({}) },
  { pattern: /(?:how\s+much\s+)?(?:ram|memory|cpu|disk)/i, action: 'system.info', extract: () => ({}) },

  // Network diagnostics (offline-specific)
  { pattern: /(?:check|test|diagnose)\s+(?:my\s+)?(?:internet|network|connection|wifi|connectivity)/i, action: 'powershell.read', extract: () => ({ command: 'Test-NetConnection -ComputerName 8.8.8.8 -Port 53 -InformationLevel Quiet; ipconfig | Select-String "IPv4|Default Gateway|DNS"' }) },
  { pattern: /(?:what(?:'s|\s+is)\s+my\s+)?ip\s*(?:address)?/i, action: 'powershell.read', extract: () => ({ command: 'ipconfig | Select-String "IPv4|Subnet|Default Gateway"' }) },
  { pattern: /(?:flush|reset|clear)\s+(?:my\s+)?dns/i, action: 'powershell.read', extract: () => ({ command: 'ipconfig /flushdns' }) },
  { pattern: /ping\s+(.+)/i, action: 'powershell.read', extract: (m) => ({ command: `ping -n 4 ${m[1].trim().replace(/[;&|`$]/g, '')}` }) },

  // Process management
  { pattern: /(?:kill|terminate|stop)\s+(?:process|task|app)?\s*([a-zA-Z0-9_\-\.]+)/i, action: 'process.kill', extract: (m) => ({ name: m[1].trim() }) },

  // App launching (general fallback for launch/open/start)
  { pattern: /(?:open|launch|start|run)\s+(.+)/i, action: 'app.open', extract: (m) => ({ name: m[1].trim() }) },
];

// ── Known app name aliases ──────────────────────────────────
const APP_ALIASES = {
  spotify: 'spotify', chrome: 'chrome', brave: 'brave', edge: 'msedge',
  word: 'winword', excel: 'excel', powerpoint: 'powerpnt', outlook: 'outlook',
  notepad: 'notepad', calculator: 'calc', calc: 'calc', paint: 'mspaint',
  explorer: 'explorer', 'file explorer': 'explorer', terminal: 'wt',
  powershell: 'powershell', cmd: 'cmd', code: 'code', 'vs code': 'code',
  vscode: 'code', cursor: 'cursor', discord: 'discord', telegram: 'telegram',
  whatsapp: 'whatsapp', vlc: 'vlc', steam: 'steam', docker: 'docker',
  blender: 'blender', opera: 'opera', 'opera gx': 'opera',
  acrobat: 'acrobat', teams: 'teams', onenote: 'onenote',
  snipping: 'SnippingTool', 'snip and sketch': 'SnippingTool',
  settings: 'ms-settings:', camera: 'microsoft.windows.camera:',
  maps: 'bingmaps:', weather: 'bingweather:', clock: 'ms-clock:',
  photos: 'ms-photos:', 'task manager': 'taskmgr',
};

/**
 * Check if internet is reachable (fast, non-blocking).
 * @returns {Promise<boolean>}
 */
async function isOnline() {
  try {
    const { exec } = require('child_process');
    return new Promise((resolve) => {
      exec('ping -n 1 -w 1500 8.8.8.8', { timeout: 3000 }, (err, stdout) => {
        resolve(!err && stdout.includes('TTL='));
      });
    });
  } catch {
    return false;
  }
}

/**
 * Process user input through the offline brain.
 * Uses pattern matching — no LLM needed.
 * @param {string} text - User's input text
 * @returns {{ reply: string, actionResults: Array }}
 */
async function processOffline(text) {
  const normalized = text.toLowerCase().trim();
  const actionResults = [];

  // Try intent patterns
  for (const { pattern, action, extract } of INTENT_PATTERNS) {
    const match = normalized.match(pattern);
    if (match) {
      const args = extract(match);

      // Resolve app aliases
      if (action === 'app.open' && args.name) {
        const lower = args.name.toLowerCase().trim();
        if (APP_ALIASES[lower]) {
          args.name = APP_ALIASES[lower];
        }
      }

      const result = await actions.run(action, args);
      actionResults.push({ type: action, args, result });

      if (result.ok) {
        return {
          reply: formatOfflineSuccess(action, args, result),
          actionResults,
        };
      } else {
        return {
          reply: `⚠️ ${result.error || 'Could not complete that action.'}`,
          actionResults,
        };
      }
    }
  }

  // No pattern matched — friendly fallback
  return {
    reply: `I'm in offline mode right now (no internet connection). I can still:\n• Open apps — "open spotify", "launch notepad"\n• Search files — "find project notes"\n• Run diagnostics — "check my internet", "ping google.com"\n• System info — "show system specs"\n• Open folders — "open my downloads"\n\nTry one of these!`,
    actionResults: [],
  };
}

/**
 * Format a success message for an offline action.
 */
function formatOfflineSuccess(action, args, result) {
  switch (action) {
    case 'app.open':
      return `✅ Opening ${args.name}...`;
    case 'folder.open':
      return `📂 Opened ${args.folderPath}`;
    case 'url.open':
      return `🌐 Opening ${args.url}`;
    case 'clipboard.read':
      return `📋 Clipboard: "${result.result?.text || '(empty)'}"`;
    case 'clipboard.write':
      return `📋 Copied to clipboard!`;
    case 'file.search': {
      const files = result.result?.results || [];
      return files.length
        ? `📁 Found ${files.length} file(s):\n${files.slice(0, 5).join('\n')}`
        : `📁 No matching files found.`;
    }
    case 'system.time':
      return `⏰ ${result.result?.time}`;
    case 'system.date':
      return `📅 ${result.result?.date}`;
    case 'system.info': {
      const r = result.result || {};
      return `💻 ${r.hostname || 'PC'}: ${r.totalMem} RAM, ${r.cpus} CPUs (${r.arch})`;
    }
    case 'powershell.read':
      return `💻 Output:\n${result.result?.output || '(no output)'}`;
    default:
      return `✅ Done!`;
  }
}

/**
 * Main router: decides online vs offline and processes accordingly.
 * This is the entry point from main.js IPC handler.
 * 
 * @param {string} text - User's message
 * @param {Function} onChunk - Streaming callback for online brain
 * @returns {{ ok: boolean, reply: string, source: 'online'|'offline' }}
 */
async function route(text, onChunk = null) {
  const cfg = settings.get();

  // If no API key, always go offline
  if (!cfg.apiKey) {
    const result = await processOffline(text);
    return { ok: true, reply: result.reply, source: 'offline', actionResults: result.actionResults };
  }

  // Check connectivity
  const online = await isOnline();

  if (!online) {
    const result = await processOffline(text);
    return { ok: true, reply: result.reply, source: 'offline', actionResults: result.actionResults };
  }

  // Online path — use LLM
  try {
    let fullText = '';
    const rawReply = await ai.sendMessage(text, [], (token) => {
      fullText += token;
      if (onChunk) onChunk(token);
    });

    // Parse and run any requested system actions
    const actionResults = [];

    // Support multiple actions: [ACTIONS:[{...},{...}]]
    const multiMatch = rawReply.match(/\[ACTIONS:\s*(\[.*?\])\s*\]/s);
    if (multiMatch) {
      try {
        const actionList = JSON.parse(multiMatch[1]);
        let cleanReply = rawReply.replace(multiMatch[0], '').trim();

        for (const actionData of actionList) {
          const res = await actions.run(actionData.type, actionData.args);
          actionResults.push({ type: actionData.type, args: actionData.args, result: res });
          cleanReply += '\n' + formatActionResult(actionData.type, actionData.args, res);
        }

        return { ok: true, reply: cleanReply, source: 'online', actionResults };
      } catch (e) {
        console.warn('[intent-router] Multi-action parse failed:', e);
      }
    }

    // Single action: [ACTION:{...}]
    const singleMatch = rawReply.match(/\[ACTION:\s*(\{.*?\})\s*\]/);
    if (singleMatch) {
      try {
        const actionData = JSON.parse(singleMatch[1]);
        const cleanReply = rawReply.replace(singleMatch[0], '').trim();

        const res = await actions.run(actionData.type, actionData.args);
        actionResults.push({ type: actionData.type, args: actionData.args, result: res });
        const extra = formatActionResult(actionData.type, actionData.args, res);

        return { ok: true, reply: cleanReply + extra, source: 'online', actionResults };
      } catch (e) {
        console.warn('[intent-router] Single-action parse failed:', e);
      }
    }

    // No action block — pure conversational reply
    return { ok: true, reply: rawReply, source: 'online', actionResults: [] };

  } catch (err) {
    // LLM failed (rate limit, network blip, etc.) — fall back to offline
    console.warn('[intent-router] Online brain failed, falling back to offline:', err.message);
    const result = await processOffline(text);
    return { ok: true, reply: result.reply, source: 'offline' };
  }
}

/**
 * Format an action result as a human-readable status line.
 */
function formatActionResult(type, args, result) {
  if (!result.ok) {
    return `\n⚠️ ${result.error || 'Action could not be executed'}`;
  }

  switch (type) {
    case 'clipboard.read':
      return `\n📋 Clipboard: "${result.result?.text || '(empty)'}"`;
    case 'file.search': {
      const files = result.result?.results || [];
      return files.length
        ? `\n📁 Found ${files.length} file(s):\n${files.slice(0, 3).join('\n')}`
        : `\n📁 No matching files found.`;
    }
    case 'system.time':
      return `\n⏰ Time: ${result.result?.time}`;
    case 'system.date':
      return `\n📅 Date: ${result.result?.date}`;
    case 'system.info':
      return `\n💻 ${result.result?.totalMem} RAM, ${result.result?.cpus} CPUs (${result.result?.arch})`;
    case 'app.open':
      return `\n🚀 Opened: ${result.result?.opened}`;
    case 'folder.open':
      return `\n📂 Opened: ${result.result?.opened}`;
    case 'url.open':
      return `\n🌐 Opened: ${result.result?.opened || args?.url}`;
    case 'powershell.read':
      return `\n💻 ${result.result?.output || '(no output)'}`;
    default:
      return `\n✅ Done`;
  }
}

module.exports = { route, processOffline, isOnline, INTENT_PATTERNS, APP_ALIASES };
