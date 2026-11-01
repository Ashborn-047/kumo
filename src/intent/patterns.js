// ============================================================
// src/intent/patterns.js — Intent Patterns & Application Aliases
// ============================================================

const INTENT_PATTERNS = [
  // Mascot sleep / hide commands
  { pattern: /^(?:sleep|hide|minimize|dismiss|bye|goodnight)\s*(?:the\s+)?(?:kumo|mascot|cloud|overlay)?$/i, action: 'mascot.sleep', extract: () => ({}) },
  { pattern: /^(?:go\s+to\s+sleep|take\s+a\s+nap)$/i, action: 'mascot.sleep', extract: () => ({}) },

  // Folder open (specific folders)
  { pattern: /(?:open|show)\s+(?:my\s+)?(desktop|downloads|documents|pictures|home|boards)\s*(?:folder)?/i, action: 'folder.open', extract: (m) => ({ folderPath: m[1].toLowerCase() }) },

  // URL open
  { pattern: /(?:open|go\s+to|browse|visit)\s+(https?:\/\/\S+)/i, action: 'url.open', extract: (m) => ({ url: m[1] }) },

  // Deep Spotify search / playback: "play lofi on spotify", "search spotify for chillhop"
  {
    pattern: /(?:play|listen\s+to|search\s+for)\s+(.+?)\s+on\s+spotify/i,
    action: 'app.deepLink',
    extract: (m) => ({ uri: `spotify:search:${encodeURIComponent(m[1].trim())}` })
  },
  {
    pattern: /(?:search\s+spotify\s+for|search\s+spotify)\s+(.+)/i,
    action: 'app.deepLink',
    extract: (m) => ({ uri: `spotify:search:${encodeURIComponent(m[1].trim())}` })
  },

  // Deep YouTube search / play: "play lofi on youtube", "search youtube for tutorial"
  {
    pattern: /(?:play|watch)\s+(.+?)\s+on\s+youtube/i,
    action: 'url.open',
    extract: (m) => ({ url: `https://www.youtube.com/results?search_query=${encodeURIComponent(m[1].trim())}` })
  },
  {
    pattern: /(?:search\s+youtube\s+for|search\s+youtube)\s+(.+)/i,
    action: 'url.open',
    extract: (m) => ({ url: `https://www.youtube.com/results?search_query=${encodeURIComponent(m[1].trim())}` })
  },

  // Deep GitHub search: "search github for kumo", "github search rust"
  {
    pattern: /(?:search\s+github\s+for|search\s+github|find\s+repo\s+for)\s+(.+)/i,
    action: 'url.open',
    extract: (m) => ({ url: `https://github.com/search?q=${encodeURIComponent(m[1].trim())}` })
  },

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

  // Deep Messaging: Telegram & WhatsApp
  {
    pattern: /(?:send|draft|write)\s+(?:a\s+)?telegram\s+(?:message\s+)?(?:to\s+[a-zA-Z0-9_]+\s+)?(?:saying|with|:)?\s*(.+)/i,
    action: 'app.deepLink',
    extract: (m) => ({ uri: `tg://msg?text=${encodeURIComponent(m[1].trim())}` })
  },
  {
    pattern: /(?:send|draft|write)\s+(?:a\s+)?whatsapp\s+(?:message\s+)?(?:to\s+[a-zA-Z0-9_\+]+\s+)?(?:saying|with|:)?\s*(.+)/i,
    action: 'app.deepLink',
    extract: (m) => ({ uri: `whatsapp://send?text=${encodeURIComponent(m[1].trim())}` })
  },

  // Office Document & Spreadsheet generation: "create spreadsheet for budget", "create a word doc for meeting notes"
  {
    pattern: /(?:create|make|new|draft|start)\s+(?:a\s+)?(?:new\s+)?(?:spreadsheet|sheet|excel(?:\s+sheet|\s+file)?|workbook)\s*(?:named|called|for|about)?\s*(.*)/i,
    action: 'office.create',
    extract: (m) => ({ type: 'excel', title: m[1] ? m[1].trim() : 'Spreadsheet' })
  },
  {
    pattern: /(?:create|make|new|draft|start)\s+(?:a\s+)?(?:new\s+)?(?:word(?:\s+doc|\s+document|\s+file)?|document)\s*(?:named|called|for|about)?\s*(.*)/i,
    action: 'office.create',
    extract: (m) => ({ type: 'word', title: m[1] ? m[1].trim() : 'Document' })
  },

  // Process management / Closing applications
  { pattern: /(?:close|quit|exit|kill|terminate|stop|shut\s+down|get\s+rid\s+of|turn\s+off)\s+(?:the\s+)?(?:process|task|app|window|software)?\s*([a-zA-Z0-9_\-\.\s]+)/i, action: 'process.kill', extract: (m) => ({ name: m[1].trim() }) },

  // Application interaction & typing / sending prompts / pasting (Claude, ChatGPT, Notepad, etc.)
  {
    pattern: /(?:open|launch|start)\s+([a-zA-Z0-9_\-\.]+)[,;\s]+(?:and\s+)?(?:give\s+(?:it\s+)?(?:a\s+)?promp?t\s*(?:to\s+|for\s+|about\s+|:\s*)?|(?:send|write|type)\s+(?:a\s+)?promp?t\s*(?:to\s+)?)(.*)/i,
    action: 'app.interact',
    extract: (m) => ({ targetApp: m[1].trim(), text: m[2] ? m[2].trim() : '', pressEnter: true })
  },
  {
    pattern: /(?:open|launch|start)\s+([a-zA-Z0-9_\-\.]+)[,;\s]+(?:and\s+)?(?:paste\s+(?:it|that|this|clipboard)?(?:\s+(?:in|into|there))?)/i,
    action: 'app.interact',
    extract: (m) => ({ targetApp: m[1].trim(), text: '', pressEnter: true })
  },
  {
    pattern: /(?:give|send)\s+([a-zA-Z0-9_\-\.]+)\s+(?:a\s+)?promp?t\s*(?:to\s+|for\s+|about\s+|:\s*)(.+)/i,
    action: 'app.interact',
    extract: (m) => ({ targetApp: m[1].trim(), text: m[2].trim(), pressEnter: true })
  },
  {
    pattern: /(?:paste|insert)(?:\s+(?:this|my\s+clipboard|clipboard|something))?\s+(?:in|into|to)\s+([a-zA-Z0-9_\-\.]+)/i,
    action: 'app.interact',
    extract: (m) => ({ targetApp: m[1].trim(), text: '', pressEnter: true })
  },
  {
    pattern: /(?:(?:a\s+)?promp?t\s+(?:in|to)\s+|ask\s+|tell\s+|send\s+(?:a\s+)?promp?t\s+to\s+)([a-zA-Z0-9_\-\.]+)\s*(?:to|about|:|,\s*)?\s*(.*)/i,
    action: 'app.interact',
    extract: (m) => ({ targetApp: m[1].trim(), text: m[2] ? m[2].trim() : '', pressEnter: true })
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

module.exports = {
  INTENT_PATTERNS,
  APP_ALIASES,
};

