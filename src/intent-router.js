// ============================================================
// intent-router.js — Smart Input Router
// Routes user input to Online Brain (LLM) or Offline Brain
// based on connectivity and API key availability.
// ============================================================

const ai = require('./ai');
const actions = require('./actions');
const settings = require('./settings');
const systemScanner = require('./system-scanner');

// ── Intent patterns for offline brain ────────────────────────
const INTENT_PATTERNS = [
  // Mascot sleep / hide commands
  { pattern: /^(?:sleep|hide|minimize|dismiss|bye|goodnight)\s*(?:the\s+)?(?:kumo|mascot|cloud|overlay)?$/i, action: 'mascot.sleep', extract: () => ({}) },
  { pattern: /^(?:go\s+to\s+sleep|take\s+a\s+nap)$/i, action: 'mascot.sleep', extract: () => ({}) },

  // Folder open (specific folders)
  { pattern: /(?:open|show)\s+(?:my\s+)?(desktop|downloads|documents|pictures|home|boards)\s*(?:folder)?/i, action: 'folder.open', extract: (m) => ({ folderPath: m[1].toLowerCase() }) },

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

  // System info & running processes
  { pattern: /(?:what(?:'s|\s+is)\s+running|running\s+(?:apps|tasks|processes)|top\s+(?:tasks|processes|apps)|show\s+(?:tasks|processes|task\s*manager))/i, action: 'system.tasks', extract: () => ({}) },
  { pattern: /(?:lock\s+(?:my\s+)?(?:pc|computer|screen|workstation))/i, action: 'system.lock', extract: () => ({}) },
  { pattern: /(?:system|pc|computer|hardware)\s+(?:info|specs?|details|status|health)/i, action: 'system.info', extract: () => ({}) },
  { pattern: /(?:how\s+much\s+)?(?:ram|memory|cpu|disk|storage)/i, action: 'system.info', extract: () => ({}) },

  // Network diagnostics (offline-specific)
  { pattern: /(?:check|test|diagnose|is\s+my|how\s+is\s+my)\s+(?:the\s+)?(?:internet|network|connection|wifi|connectivity)/i, action: 'powershell.read', extract: () => ({ command: 'Test-NetConnection -ComputerName 8.8.8.8 -Port 53 -InformationLevel Quiet; ipconfig | Select-String "IPv4|Default Gateway|DNS"' }) },
  { pattern: /(?:am\s+i\s+online|do\s+i\s+have\s+internet)/i, action: 'powershell.read', extract: () => ({ command: 'Test-NetConnection -ComputerName 8.8.8.8 -Port 53 -InformationLevel Quiet' }) },
  { pattern: /(?:what(?:'s|\s+is)\s+my\s+)?ip\s*(?:address)?/i, action: 'powershell.read', extract: () => ({ command: 'ipconfig | Select-String "IPv4|Subnet|Default Gateway"' }) },
  { pattern: /(?:flush|reset|clear)\s+(?:my\s+)?dns/i, action: 'powershell.read', extract: () => ({ command: 'ipconfig /flushdns' }) },
  { pattern: /ping\s+(.+)/i, action: 'powershell.read', extract: (m) => ({ command: `ping -n 4 ${m[1].trim().replace(/[;&|`$]/g, '')}` }) },

  // Audio & Volume controls
  { pattern: /^(?:mute|unmute|silence|toggle\s+mute)(?:\s+(?:the\s+)?(?:sound|audio|volume|speaker))?$/i, action: 'media.mute', extract: () => ({}) },
  { pattern: /(?:volume\s+up|turn\s+up\s+(?:the\s+)?(?:volume|sound)|increase\s+(?:the\s+)?volume|make\s+it\s+louder|louder)/i, action: 'media.volUp', extract: () => ({}) },
  { pattern: /(?:volume\s+down|turn\s+down\s+(?:the\s+)?(?:volume|sound)|decrease\s+(?:the\s+)?volume|lower\s+(?:the\s+)?volume|make\s+it\s+quieter|quieter)/i, action: 'media.volDown', extract: () => ({}) },

  // Media playback controls (Spotify / System audio)
  { pattern: /(?:pause|resume|play|toggle|stop)\s+(?:the\s+)?(?:music|song|track|playback|spotify|audio)/i, action: 'media.playPause', extract: () => ({}) },
  { pattern: /(?:next|skip)\s+(?:song|track|music|spotify)/i, action: 'media.next', extract: () => ({}) },
  { pattern: /(?:previous|prev|replay|last)\s+(?:song|track|music|spotify)/i, action: 'media.previous', extract: () => ({}) },
  { pattern: /^(?:play|pause|resume|toggle\s+music)$/i, action: 'media.playPause', extract: () => ({}) },

  // Process management / Closing applications
  { pattern: /(?:close|quit|exit|kill|terminate|stop|shut\s+down|get\s+rid\s+of|turn\s+off)\s+(?:the\s+)?(?:process|task|app|window|software)?\s*([a-zA-Z0-9_\-\.\s]+)/i, action: 'process.kill', extract: (m) => ({ name: m[1].trim() }) },

  // Application interaction & typing / sending prompts (Claude, ChatGPT, Notepad, etc.)
  {
    pattern: /(?:(?:a\s+)?promp?t\s+(?:in|to)\s+|ask\s+|send\s+(?:a\s+)?promp?t\s+to\s+)([a-zA-Z0-9_\-\.]+)\s*[:,\s]*(.*)/i,
    action: 'app.interact',
    extract: (m) => ({ targetApp: m[1].trim(), text: m[2] ? m[2].trim() : '', pressEnter: Boolean(m[2] && m[2].trim()) })
  },
  {
    pattern: /(?:write|type|input|enter)\s+(?:in|into|to)\s+([a-zA-Z0-9_\-\.]+)\s*[:,\s]+(.+)/i,
    action: 'app.interact',
    extract: (m) => ({ targetApp: m[1].trim(), text: m[2].trim(), pressEnter: false })
  },

  // Note creation / File writing
  {
    pattern: /(?:create|write|save|make)\s+(?:a\s+)?(?:new\s+)?(?:note|file)\s*(?:called|named)?\s*([a-zA-Z0-9_\-\.]*)\s*[:,\s]+(.+)/i,
    action: 'file.write',
    extract: (m) => ({ fileName: m[1].trim() || 'QuickNote', content: m[2].trim() })
  },
  {
    pattern: /(?:take\s+a\s+note|new\s+note|save\s+note|remember|write\s+down|note\s+down|memo)\s*[:,\s]+(.+)/i,
    action: 'file.write',
    extract: (m) => ({ fileName: 'QuickNote', content: m[1].trim() })
  },

  // Screen capture / Snipping
  { pattern: /(?:take\s+a\s+)?(?:screenshot|screen\s+capture|snip|screen\s*shot)/i, action: 'app.open', extract: () => ({ name: 'SnippingTool' }) },

  // App launching (general fallback for launch/open/start)
  { pattern: /(?:open|launch|start|run|fire\s+up|bring\s+up|pop\s+open|switch\s+to|spin\s+up)\s+(.+)/i, action: 'app.open', extract: (m) => ({ name: m[1].trim() }) },
];

// ── Known app name aliases & generic software categories ─────
const APP_ALIASES = {
  spotify: 'spotify', chrome: 'chrome', brave: 'brave', edge: 'msedge',
  word: 'winword', excel: 'excel', powerpoint: 'powerpnt', outlook: 'outlook',
  notepad: 'notepad', calculator: 'calc.exe', calc: 'calc.exe', paint: 'mspaint',
  explorer: 'explorer', 'file explorer': 'explorer', terminal: 'wt',
  powershell: 'powershell', cmd: 'cmd', code: 'code', 'vs code': 'code',
  vscode: 'code', cursor: 'cursor', discord: 'discord', telegram: 'telegram',
  whatsapp: 'whatsapp', vlc: 'vlc', steam: 'steam', docker: 'docker',
  blender: 'blender', opera: 'opera', 'opera gx': 'opera',
  acrobat: 'acrobat', teams: 'teams', onenote: 'onenote',
  snipping: 'SnippingTool', 'snip and sketch': 'SnippingTool',
  settings: 'ms-settings:', camera: 'microsoft.windows.camera:',
  maps: 'bingmaps:', weather: 'bingweather:', clock: 'ms-clock:',
  photos: 'ms-photos:', 'task manager': 'taskmgr', taskmgr: 'taskmgr',
  // Generic application aliases
  browser: 'chrome', 'web browser': 'chrome', internet: 'chrome',
  editor: 'code', 'code editor': 'code', ide: 'code',
  math: 'calc.exe', calculation: 'calc.exe',
  notes: 'notepad', 'note pad': 'notepad', 'text editor': 'notepad',
  sheets: 'excel', spreadsheet: 'excel',
  docs: 'winword', document: 'winword',
  slides: 'powerpnt', presentation: 'powerpnt',
  tasks: 'taskmgr', 'task list': 'taskmgr', 'activity monitor': 'taskmgr',
  snip: 'SnippingTool', screenshot: 'SnippingTool', 'screen snip': 'SnippingTool',
  music: 'spotify', songs: 'spotify', 'music player': 'spotify',
  cam: 'microsoft.windows.camera:', webcam: 'microsoft.windows.camera:',
  alarm: 'ms-clock:', timer: 'ms-clock:', stopwatch: 'ms-clock:',
  postman: 'postman', slack: 'slack', notion: 'notion', figma: 'figma',
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

function levenshtein(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return matrix[a.length][b.length];
}

/**
 * Normalizes conversational padding and polite phrases.
 * e.g. "Can you please open calcualtor and do something" -> "open calcualtor"
 */
function normalizeConversationalText(text) {
  if (!text) return '';
  let s = text.toLowerCase().trim();

  // Strip conversational polite prefixes & openers
  s = s.replace(/^(?:hey|hi|hello|ok|okay|yo)?\s*(?:kumo|mochi|assistant)?\s*[,;:]?\s*/i, '');
  s = s.replace(/^(?:can\s+you\s+please|could\s+you\s+please|would\s+you\s+mind|can\s+you|could\s+you|would\s+you|will\s+you|how\s+about\s+we|how\s+about|why\s+don't\s+you|please|i\s+want\s+to|i\s+need\s+to|i'd\s+like\s+to|help\s+me|let's|let\s+us|go\s+ahead\s+and|just|tell\s+me|give\s+me)\s+/i, '');

  // Strip conversational suffixes & trailing clauses
  s = s.replace(/[,;]?\s*(?:and\s+do\s+something|and\s+then\b.*|and\s+also\b.*|and\s+give\b.*|right\s+now|for\s+me|if\s+you\s+can|quickly|asap|please)\s*$/i, '');

  return s.trim();
}

/**
 * Resolves an application name across aliases, typos, and 155+ scanned host apps.
 */
function resolveFuzzyAppName(raw) {
  if (!raw) return '';
  let clean = raw.toLowerCase().trim();

  // Strip compound conversational clauses
  clean = clean.replace(/[,;]?\s*(?:and\s+then|and\s+do\s+something|and\s+give\s+.*|and\s+also|and|then|please|for\s+me)\b.*/i, '').trim();

  // Strip trailing punctuation
  clean = clean.replace(/[.,;!?]+$/, '').trim();

  // 1. Direct alias match
  if (APP_ALIASES[clean]) return APP_ALIASES[clean];

  // 2. Fuzzy alias match (e.g. 'calcualtor' -> 'calc.exe', 'spotfy' -> 'spotify')
  for (const [alias, real] of Object.entries(APP_ALIASES)) {
    if (clean === alias) return real;
    if (alias.length >= 4 && Math.abs(clean.length - alias.length) <= 2) {
      if (levenshtein(clean, alias) <= 2) return real;
    }
  }

  // 3. Match against all 155+ scanned host apps dynamically
  try {
    const caps = systemScanner.getCapabilitiesSync();
    if (caps && caps.categories) {
      let bestMatch = null;
      for (const cat of Object.keys(caps.categories)) {
        for (const app of caps.categories[cat]) {
          const appName = (app.name || '').toLowerCase();
          const appId = (app.appId || '').toLowerCase();
          if (appName === clean) return app.name;

          // Word subset match (e.g. "acrobat" matches "Adobe Acrobat")
          const words = appName.split(/\s+/);
          if (words.some(w => w === clean)) return app.name;

          if (appName.includes(clean) || (clean.length >= 4 && appId.includes(clean))) {
            if (!bestMatch) bestMatch = app.name;
          }
          if (clean.length >= 5 && levenshtein(clean, appName) <= 2) {
            return app.name;
          }
        }
      }
      if (bestMatch) return bestMatch;
    }
  } catch {}

  return clean;
}

/**
 * Process user input through the offline brain.
 * Uses pattern matching & generalized semantic classification.
 * @param {string} text - User's input text
 * @returns {{ reply: string, actionResults: Array }}
 */
async function processOffline(text) {
  const rawNormalized = text.toLowerCase().trim();
  const normalized = normalizeConversationalText(text) || rawNormalized;
  const actionResults = [];

  // Help command check
  if (/^(?:help|what\s+can\s+you\s+do|commands|features|capabilities)$/i.test(normalized)) {
    return {
      reply: `🌟 **Kumo Offline Mode Capabilities**:\n• **Apps**: "open spotify", "close notepad", "launch docker", "calculator"\n• **Audio**: "pause music", "next song", "volume up", "volume down", "mute"\n• **System**: "what's running", "system specs", "lock screen", "check internet"\n• **Notes & Typing**: "take a note: ideas", "a prompt in claude: write code"\n• **Mascot**: "sleep kumo", "minimize mascot"\n• **Files & Folders**: "open downloads", "find budget.xlsx"`,
      actionResults: [],
    };
  }

  // Try intent patterns on normalized text, then fallback to raw
  for (const candidate of [normalized, rawNormalized]) {
    for (const { pattern, action, extract } of INTENT_PATTERNS) {
      const match = candidate.match(pattern);
      if (match) {
        const args = extract(match);

        // Resolve app aliases & fuzzy typos across host apps
        if (action === 'app.open' && args.name) {
          args.name = resolveFuzzyAppName(args.name);
        }
        if (action === 'process.kill' && args.name) {
          args.name = resolveFuzzyAppName(args.name);
        }
        if (action === 'app.interact' && args.targetApp) {
          args.targetApp = resolveFuzzyAppName(args.targetApp);
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
  }

  // Fallback 1: User just typed an application name! (e.g. "calculator", "docker", "cursor", "spotify")
  const directApp = resolveFuzzyAppName(normalized);
  if (directApp && (APP_ALIASES[normalized] || directApp !== normalized)) {
    const result = await actions.run('app.open', { name: directApp });
    actionResults.push({ type: 'app.open', args: { name: directApp }, result });
    if (result.ok) {
      return {
        reply: formatOfflineSuccess('app.open', { name: directApp }, result),
        actionResults,
      };
    }
  }

  // Fallback 2: General music query
  if (/^(?:music|songs?|play\s+something|listen\s+to\s+music)$/i.test(normalized)) {
    const result = await actions.run('media.playPause', {});
    actionResults.push({ type: 'media.playPause', args: {}, result });
    return {
      reply: formatOfflineSuccess('media.playPause', {}, result),
      actionResults,
    };
  }

  // No pattern matched — friendly fallback
  return {
    reply: `I'm in offline mode right now (no internet connection). I can still:\n• Open & close apps — "open spotify", "close notepad"\n• Media & volume — "pause spotify", "volume up", "mute"\n• System & tasks — "what's running", "system specs", "lock screen"\n• Send prompts & notes — "a prompt in claude: write a game", "take a note: ideas"\n• Sleep mascot — "sleep kumo"\n\nTry one of these!`,
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
    case 'system.lock':
      return `🔒 Workstation screen locked!`;
    case 'system.tasks': {
      const tasks = result.result?.tasks || [];
      if (!tasks.length) return `💻 No active foreground tasks retrieved.`;
      const formatted = tasks.map(t => `• ${t.Name || 'App'}: ${t.MainWindowTitle ? `"${t.MainWindowTitle.slice(0, 35)}"` : ''} (${t.MemoryMB || 0} MB)`).join('\n');
      return `💻 **Top Running Tasks**:\n${formatted}`;
    }
    case 'powershell.read':
      return `💻 Output:\n${result.result?.output || '(no output)'}`;
    case 'powershell.write':
      return `💻 Executed task:\n${result.result?.output || '(completed)'}`;
    case 'app.interact':
      return `✍️ Sent input to ${args.targetApp}: "${(args.text || '').slice(0, 50)}..."`;
    case 'file.write':
      return `📝 Saved note to: ${result.result?.path || 'Desktop\\Kumo_Notes'}`;
    case 'media.playPause':
      return `🎵 Toggled Spotify/Media (Play/Pause)!`;
    case 'media.next':
      return `⏭️ Skipped to next track!`;
    case 'media.previous':
      return `⏮️ Rewound to previous track!`;
    case 'media.mute':
      return `🔇 Toggled audio mute!`;
    case 'media.volUp':
      return `🔊 Volume raised!`;
    case 'media.volDown':
      return `🔉 Volume lowered!`;
    case 'mascot.sleep':
      return `💤 Kumo is going to sleep! Summon me anytime from Kumoboard, system tray, or Ctrl+Shift+K.`;
    case 'process.kill':
      return `🛑 Closed ${args.name}!`;
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

    // Single action: [ACTION:{...}] (support nested objects and multiline JSON)
    const singleMatch = rawReply.match(/\[ACTION:\s*(\{[\s\S]*?\})\s*\]/s) || rawReply.match(/\[ACTION:\s*(\{[\s\S]*\})\s*\]/s);
    if (singleMatch) {
      try {
        const actionData = JSON.parse(singleMatch[1]);
        const cleanReply = rawReply.replace(singleMatch[0], '').trim();

        const res = await actions.run(actionData.type, actionData.args);
        actionResults.push({ type: actionData.type, args: actionData.args, result: res });
        const extra = formatActionResult(actionData.type, actionData.args, res);

        return { ok: true, reply: cleanReply + extra, source: 'online', actionResults };
      } catch (e) {
        console.warn('[intent-router] Single-action parse failed:', e.message);
      }
    }

    // No action block — pure conversational reply
    return { ok: true, reply: rawReply, source: 'online', actionResults: [] };

  } catch (err) {
    // LLM failed (rate limit, network blip, etc.) — fall back to offline
    console.warn('[intent-router] Online brain failed, falling back to offline:', err.message);
    const result = await processOffline(text);
    return { ok: true, reply: result.reply, source: 'offline', actionResults: result.actionResults };
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
    case 'process.kill':
      return `\n🛑 Closed: ${args?.name || 'Application'}`;
    case 'media.playPause':
      return `\n🎵 Playback toggled`;
    case 'media.next':
      return `\n⏭️ Skipped track`;
    case 'media.previous':
      return `\n⏮️ Previous track`;
    case 'media.mute':
      return `\n🔇 Audio mute toggled`;
    case 'media.volUp':
      return `\n🔊 Volume up`;
    case 'media.volDown':
      return `\n🔉 Volume down`;
    case 'file.write':
      return `\n📝 Saved note: ${result.result?.path || 'Desktop\\Kumo_Notes'}`;
    case 'app.interact':
      return `\n✍️ Sent input to ${args?.targetApp}`;
    case 'powershell.read':
      return `\n💻 ${result.result?.output || '(no output)'}`;
    default:
      return `\n✅ Done`;
  }
}

module.exports = { route, processOffline, isOnline, INTENT_PATTERNS, APP_ALIASES };
