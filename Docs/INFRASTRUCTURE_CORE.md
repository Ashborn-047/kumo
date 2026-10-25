# Kumo — Core Infrastructure Architecture

> **Version**: 1.0.0  
> **Last Updated**: 2026-10-25  
> **Status**: Living Document — evolves with the codebase

---

## Table of Contents

1. [Vision & Philosophy](#1-vision--philosophy)
2. [System Introspection — What's On This Machine](#2-system-introspection--whats-on-this-machine)
3. [Dual-Brain Architecture](#3-dual-brain-architecture)
4. [Deep App Task Orchestration](#4-deep-app-task-orchestration)
5. [Action Registry & Safety Gate](#5-action-registry--safety-gate)
6. [Dynamic Card System (Kumoboard)](#6-dynamic-card-system-kumoboard)
7. [Instruction Execution Engine](#7-instruction-execution-engine)
8. [Permission Model](#8-permission-model)
9. [Offline Fallback — Control Panel Brain](#9-offline-fallback--control-panel-brain)
10. [Data Flow Diagrams](#10-data-flow-diagrams)
11. [Roadmap](#11-roadmap)

---

## 1. Vision & Philosophy

Kumo is **not a chatbot**. Kumo is a **desktop companion that actually does things**.

When a user says *"Hey Kumo, open Spotify and play my favourites"*, Kumo doesn't just answer — it **launches Spotify**, **sends the URI command**, and **confirms the task is done**. When a user says *"Kumo, open Word and draft a meeting agenda"*, Kumo opens Microsoft Word, types out a template, and hands it back.

The fundamental design principles:

| Principle | Description |
|---|---|
| **Action-First** | Every natural language request is parsed for executable intent, not just conversational reply |
| **Dual-Brain** | Online (LLM-powered deep reasoning) + Offline (local heuristic command engine) |
| **Safety-Gated** | 3-tier permission system (GREEN/YELLOW/RED) ensures no destructive action runs unchecked |
| **Dynamic Discovery** | Kumo scans the system at startup to know exactly what apps, tools, and capabilities exist — nothing is hardcoded |
| **Offline Resilient** | When internet dies, Kumo doesn't become a paperweight. The Control Panel brain takes over with local command execution |

---

## 2. System Introspection — What's On This Machine

### 2.0 Host Environment
| Metric | Host Value |
|---|---|
| **Operating System** | **Microsoft Windows 10 Pro** (64-bit) |
| **OS Build / Version** | `10.0.19045.5011` (Version 22H2) |
| **Hardware Topology** | 12 Logical Processors, 16 GB Physical RAM, Multi-Drive (C:, G:) |
| **Primary Shells** | PowerShell 5.1, cmd.exe, Windows Subsystem for Linux (WSL2) |
| **App Execution Subsystems** | Win32 native binaries, UWP Store apps (`shell:AppsFolder`), URI protocols |

### 2.1 Discovered Applications (Current Machine)

#### Productivity & Office
| App | Launch Method | Deep Task Capability |
|---|---|---|
| Microsoft Word | `Microsoft.Office.WINWORD.EXE.15` | Open docs, create from template, dictate content via COM/CLI |
| Microsoft Excel | `Microsoft.Office.EXCEL.EXE.15` | Open spreadsheets, create sheets, run formulas via COM/CLI |
| Microsoft PowerPoint | `Microsoft.Office.POWERPNT.EXE.15` | Open/create presentations |
| Microsoft OneNote | UWP: `Microsoft.Office.OneNote` | Open notebooks, create notes |
| Microsoft Outlook | `Microsoft.Office.OUTLOOK.EXE.15` | Open email, draft messages |
| Microsoft Access | `Microsoft.Office.MSACCESS.EXE.15` | Open databases |
| Microsoft Publisher | `Microsoft.Office.MSPUB.EXE.15` | Open publications |
| Adobe Acrobat | Start Apps registry | Open/view PDFs |
| Notepad | `notepad.exe` | Open/create text files, quick notes |
| WordPad | `wordpad.exe` | Rich text editing |
| Sticky Notes | UWP: `Microsoft.MicrosoftStickyNotes` | Quick desktop notes |
| Calculator | `calc.exe` | Calculations |
| Calendar | UWP: `microsoft.windowscommunicationsapps` | View/create events |
| Clock | UWP: `Microsoft.WindowsAlarms` | Alarms, timers, stopwatch |

#### Development & Engineering
| App | Launch Method | Deep Task Capability |
|---|---|---|
| Cursor IDE | Start Apps entry | Open projects, edit code |
| Antigravity IDE | Start Apps entry | AI-powered code editing |
| VS Code | `code` (CLI) | Open files/folders, install extensions, run tasks |
| Git | `git.exe` (CLI) | Clone, commit, push, pull, branch ops |
| Docker Desktop | `docker.exe` (CLI) | Container management, compose, build |
| Node.js (v22+) | `node.exe` / `npm` / `npx` | Run scripts, install packages, dev servers |
| Python | `python.exe` | Run scripts, pip install |
| WSL (Windows Subsystem for Linux) | `wsl.exe` | Full Linux environment |
| PowerShell | `powershell.exe` | System automation, script execution |
| Command Prompt | `cmd.exe` | Legacy command execution |
| Blender 5.2 | Start Apps entry | 3D modeling, rendering |
| DevToys | UWP app | Developer utilities |
| GitHub Copilot | Browser extension / Start Apps | AI code assistance |

#### Browsers
| App | Launch Method | Deep Task Capability |
|---|---|---|
| Google Chrome | `chrome.exe` | Open URLs, search, navigate tabs |
| Brave Browser | Start Apps entry | Privacy browsing, open URLs |
| Microsoft Edge | `msedge.exe` | Open URLs, Edge-specific features |
| Opera GX | Start Apps entry | Gaming browser, open URLs |

#### Communication & Social
| App | Launch Method | Deep Task Capability |
|---|---|---|
| Discord | Start Apps entry | Open channels, send messages (via deep links) |
| Telegram Desktop | UWP: `TelegramMessengerLLP.TelegramDesktop` | Open chats |
| WhatsApp | UWP: `5319275A.WhatsAppDesktop` | Open chats, send messages (via deep links) |
| Skype | UWP: `Microsoft.SkypeApp` | Calls, messages |
| Microsoft Teams (via Outlook) | Office integration | Meetings, chats |

#### Media & Entertainment
| App | Launch Method | Deep Task Capability |
|---|---|---|
| Spotify | UWP: `SpotifyAB.SpotifyMusic` | Play music, playlists, search tracks via `spotify:` URIs |
| VLC Media Player | `vlc.exe` | Play local media files, streams |
| Netflix | UWP: `Microsoft.Netflix` | Open, browse content |
| Prime Video | UWP app | Open, browse content |
| Crunchyroll | UWP app | Open, browse anime |
| Windows Media Player | Built-in | Play local media |
| Photos | UWP: `Microsoft.Windows.Photos` | View/edit images |
| Paint | `mspaint.exe` | Quick image editing |
| Paint 3D | UWP: `Microsoft.MSPaint3D` | 3D object editing |
| Camera | UWP: `Microsoft.WindowsCamera` | Take photos/videos |

#### Gaming
| App | Launch Method | Deep Task Capability |
|---|---|---|
| Steam | `Steam.exe` | Launch games via `steam://rungameid/<id>` |
| Epic Games Launcher | Start Apps entry | Launch games |
| Ubisoft Connect | Start Apps entry | Launch Ubisoft games |
| Xbox | UWP: `Microsoft.GamingApp` | Game Pass, Xbox integration |
| TLauncher (Minecraft) | Direct EXE | Launch Minecraft |

#### System & Utilities
| App | Launch Method | Deep Task Capability |
|---|---|---|
| File Explorer | `explorer.exe` | Browse files, open folders |
| Task Manager | System tool | View/kill processes, performance |
| Settings | UWP: `windows.immersivecontrolpanel` | System settings |
| Control Panel | `control.exe` | Classic system settings |
| Registry Editor | `regedit.exe` | **RED TIER — manual only** |
| Services | `services.msc` | View/manage Windows services |
| System Information | `msinfo32.exe` | Full system specs |
| Disk Cleanup | System tool | Free disk space |
| WinRAR | `WinRAR.exe` | Archive/extract files |
| 7-Zip | `7zFM.exe` | Archive/extract files |
| Snipping Tool | `SnippingTool.exe` | Screenshots |
| Snip & Sketch | UWP | Modern screenshots |

#### AI Assistants (External)
| App | Launch Method | Notes |
|---|---|---|
| Claude Desktop | UWP / Start Apps | Anthropic's AI assistant |
| ChatGPT | UWP / Start Apps | OpenAI's AI assistant |
| Copilot | UWP: `Microsoft.Copilot` | Microsoft's AI assistant |
| Devin | Start Apps entry | AI software engineer |

### 2.2 Dev Tools (CLI-Available)

| Tool | Path | Available |
|---|---|---|
| `node` | `scoop/nodejs-lts` | ✅ |
| `npm` / `npx` | `scoop/nodejs-lts` | ✅ |
| `git` | `scoop/git` | ✅ |
| `python` | WindowsApps | ✅ |
| `docker` | Docker Desktop | ✅ |
| `wsl` | System32 | ✅ |
| `ssh` | System32/OpenSSH | ✅ |
| `curl` | Built-in | ✅ |
| `wget` | Available | ✅ |
| `dotnet` | — | ❌ |
| `java` | — | ❌ |
| `rustc` / `cargo` | — | ❌ |
| `go` | — | ❌ |

### 2.3 System Specs

| Component | Value |
|---|---|
| OS | Windows 10 Pro (Build 19045) |
| CPU | AMD Ryzen 5 5600GT (6C/12T) with Radeon Graphics |
| Architecture | x64 |

---

## 3. Dual-Brain Architecture

Kumo operates with two independent execution engines that seamlessly hand off depending on connectivity:

```
┌──────────────────────────────────────────────────────────┐
│                    USER INPUT                            │
│         (Text chat, Mascot click, Board card)            │
└──────────────┬───────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│              INTENT ROUTER                               │
│  1. Check internet connectivity                          │
│  2. Check if LLM API key is configured                   │
│  3. Route to appropriate brain                           │
└──────────┬──────────────────────────┬────────────────────┘
           │                          │
    [Online + Key]              [Offline / No Key]
           │                          │
           ▼                          ▼
┌────────────────────┐    ┌────────────────────────────┐
│   ONLINE BRAIN     │    │   OFFLINE BRAIN            │
│   (Cloud LLM)      │    │   (Local Heuristic Engine) │
│                    │    │                            │
│  • OpenRouter API  │    │  • Pattern matching on     │
│  • Free models:    │    │    known command templates  │
│    - Llama 3.3 70B │    │  • Direct PowerShell       │
│    - Gemini Flash  │    │    command execution        │
│    - DeepSeek R1   │    │  • Regex intent parsing    │
│    - Mistral 7B    │    │  • Predefined action maps  │
│    - Qwen 2.5 72B  │    │  • System diagnostics      │
│                    │    │    (netstat, ping, ipconfig)|
│  Returns:          │    │  • App launch by name      │
│  Natural language  │    │  • File operations         │
│  + [ACTION:{...}]  │    │                            │
└────────┬───────────┘    └──────────┬─────────────────┘
         │                           │
         └───────────┬───────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│            SAFETY-GATED ACTION DISPATCHER                │
│                                                          │
│  GREEN  → Execute immediately (reads, info, clipboard)   │
│  YELLOW → Confirm with user, then execute (app open,     │
│           PowerShell read-only, folder open)              │
│  RED    → Refuse + show manual instructions (delete,     │
│           write files, registry, install software)        │
└──────────────────────────────────────────────────────────┘
```

### 3.1 Online Brain — Cloud LLM

- **Provider**: OpenRouter (OpenAI-compatible SDK)
- **System Prompt**: Dynamically built with user's name, companion name, and available action registry
- **Streaming**: Token-by-token streaming via `onChunk` callback to overlay mascot bubble
- **Action Parsing**: Regex extraction of `[ACTION:{"type":"...","args":{...}}]` blocks from LLM response
- **Model Fallback**: Tries each free model in priority order until one responds

**Key File**: `src/ai.js`

### 3.2 Offline Brain — Local Heuristic Engine

When internet is down or LLM fails, Kumo falls back to a **local pattern-matching command engine**. This brain:

1. **Does NOT require internet**
2. **Does NOT require an API key**
3. **Parses intent via keyword matching + regex templates**
4. **Executes system commands directly via PowerShell/CMD**

**Intent Templates** (to be implemented in `src/offline-brain.js`):

```javascript
const INTENT_PATTERNS = [
  // App launching
  { pattern: /open\s+(\w+)/i, action: 'app.open', extract: (m) => ({ name: m[1] }) },
  { pattern: /launch\s+(\w+)/i, action: 'app.open', extract: (m) => ({ name: m[1] }) },
  { pattern: /start\s+(\w+)/i, action: 'app.open', extract: (m) => ({ name: m[1] }) },

  // File operations
  { pattern: /find\s+(.+)/i, action: 'file.search', extract: (m) => ({ query: m[1] }) },
  { pattern: /search\s+(?:for\s+)?(.+)/i, action: 'file.search', extract: (m) => ({ query: m[1] }) },

  // System info
  { pattern: /what\s+time/i, action: 'system.time', extract: () => ({}) },
  { pattern: /what\s+date/i, action: 'system.date', extract: () => ({}) },
  { pattern: /system\s+(?:info|specs?)/i, action: 'system.info', extract: () => ({}) },

  // Network diagnostics (offline-specific)
  { pattern: /(?:check|test)\s+(?:internet|network|connection)/i, action: 'network.diagnose', extract: () => ({}) },
  { pattern: /(?:fix|repair)\s+(?:internet|network|connection)/i, action: 'network.repair', extract: () => ({}) },
  { pattern: /ip\s*(?:address|config)/i, action: 'network.ipconfig', extract: () => ({}) },

  // Clipboard
  { pattern: /(?:read|show|paste)\s+clipboard/i, action: 'clipboard.read', extract: () => ({}) },
  { pattern: /copy\s+(.+)/i, action: 'clipboard.write', extract: (m) => ({ text: m[1] }) },

  // URL
  { pattern: /(?:open|go\s+to)\s+(https?:\/\/\S+)/i, action: 'url.open', extract: (m) => ({ url: m[1] }) },

  // Folder
  { pattern: /open\s+(?:my\s+)?(desktop|downloads|documents|pictures)/i, action: 'folder.open', extract: (m) => ({ folderPath: m[1] }) },
];
```

**Key File**: `src/offline-brain.js` (TO BE CREATED)

---

## 4. Deep App Task Orchestration

This is the **core differentiator**. Kumo doesn't just open apps — it **performs tasks within them**.

### 4.1 Orchestration Levels

| Level | Description | Example |
|---|---|---|
| **L0 — Launch** | Simply open the app | "Open Spotify" → launches Spotify |
| **L1 — Launch + Navigate** | Open app and go to a specific location | "Open Spotify and go to my library" → launches Spotify with `spotify:app:library` |
| **L2 — Launch + Execute** | Open app and perform a specific action | "Open Word and create a new document" → launches Word with `/n` flag |
| **L3 — Launch + Create** | Open app, create content, and hand it to user | "Open Word and draft a meeting agenda for Monday" → launches Word, uses COM automation or templates |
| **L4 — Multi-App Pipeline** | Chain multiple apps for complex workflows | "Download the PDF, open it in Acrobat, extract page 3" → Browser → Acrobat → File system |

### 4.2 Deep Task Handlers (Per App Category)

#### 🎵 Spotify — Music Control

```javascript
// spotify-handler.js
const SPOTIFY_ACTIONS = {
  'play':           () => shell('start spotify:'),
  'play.favorites': () => shell('start spotify:user:library'),
  'play.playlist':  (name) => shell(`start "spotify:search:${encodeURIComponent(name)}"`),
  'play.track':     (name) => shell(`start "spotify:search:${encodeURIComponent(name)}"`),
  'play.pause':     () => sendMediaKey('MEDIA_PLAY_PAUSE'),
  'play.next':      () => sendMediaKey('MEDIA_NEXT_TRACK'),
  'play.prev':      () => sendMediaKey('MEDIA_PREV_TRACK'),
  'volume.up':      () => sendMediaKey('VOLUME_UP'),
  'volume.down':    () => sendMediaKey('VOLUME_DOWN'),
  'volume.mute':    () => sendMediaKey('VOLUME_MUTE'),
};
```

#### 📝 Microsoft Office — Document Operations

```javascript
// office-handler.js
const OFFICE_ACTIONS = {
  // Word
  'word.new':          () => exec('start winword /n'),
  'word.open':         (path) => exec(`start winword "${path}"`),
  'word.template':     (template) => exec(`start winword /t"${template}"`),

  // Excel
  'excel.new':         () => exec('start excel /n'),
  'excel.open':        (path) => exec(`start excel "${path}"`),

  // PowerPoint
  'powerpoint.new':    () => exec('start powerpnt /n'),
  'powerpoint.open':   (path) => exec(`start powerpnt "${path}"`),

  // Outlook
  'outlook.compose':   (to, subject) => exec(`start outlook /c ipm.note /m "${to}" /subject "${subject}"`),
  'outlook.calendar':  () => exec('start outlook /select outlook:calendar'),
};
```

#### 🌐 Browser — Web Navigation

```javascript
// browser-handler.js
const BROWSER_ACTIONS = {
  'browse.url':        (url) => shell.openExternal(url),
  'browse.search':     (q) => shell.openExternal(`https://www.google.com/search?q=${encodeURIComponent(q)}`),
  'browse.youtube':    (q) => shell.openExternal(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`),
  'browse.github':     (q) => shell.openExternal(`https://github.com/search?q=${encodeURIComponent(q)}`),
  'browse.stackoverflow': (q) => shell.openExternal(`https://stackoverflow.com/search?q=${encodeURIComponent(q)}`),
};
```

#### 💻 Development — Code & Terminal

```javascript
// dev-handler.js
const DEV_ACTIONS = {
  'code.open':         (path) => exec(`code "${path}"`),
  'code.new':          () => exec('code --new-window'),
  'git.status':        (dir) => execPS(`cd "${dir}"; git status`),
  'git.log':           (dir) => execPS(`cd "${dir}"; git log --oneline -10`),
  'git.pull':          (dir) => execPS(`cd "${dir}"; git pull`),
  'docker.ps':         () => execPS('docker ps'),
  'docker.compose.up': (dir) => execPS(`cd "${dir}"; docker compose up -d`),
  'npm.install':       (dir) => execPS(`cd "${dir}"; npm install`),
  'npm.dev':           (dir) => execPS(`cd "${dir}"; npm run dev`),
};
```

#### 🎮 Gaming

```javascript
// gaming-handler.js
const GAMING_ACTIONS = {
  'steam.launch':     (gameId) => shell.openExternal(`steam://rungameid/${gameId}`),
  'steam.store':      (gameId) => shell.openExternal(`steam://store/${gameId}`),
  'epic.launch':      () => exec('start com.epicgames.launcher:'),
  'minecraft.launch': () => exec(`start "" "${APPDATA}\\.minecraft\\TLauncher.exe"`),
};
```

#### 📁 File System — Advanced Operations

```javascript
// filesystem-handler.js
const FS_ACTIONS = {
  'file.search':      (query, dir) => execPS(`Get-ChildItem -Path "${dir}" -Filter "*${query}*" -Recurse -Depth 3 -EA SilentlyContinue | Select -First 10 FullName`),
  'folder.open':      (path) => shell.openPath(path),
  'folder.create':    (path) => fs.mkdirSync(path, { recursive: true }),
  'file.rename':      (from, to) => fs.renameSync(from, to),
  'file.copy':        (from, to) => fs.copyFileSync(from, to),
  'zip.extract':      (archive, dest) => execPS(`Expand-Archive -Path "${archive}" -DestinationPath "${dest}"`),
  'zip.create':       (source, dest) => execPS(`Compress-Archive -Path "${source}" -DestinationPath "${dest}"`),
};
```

#### 🔧 System Control — Control Panel Operations

```javascript
// system-handler.js
const SYSTEM_ACTIONS = {
  // Network diagnostics
  'network.diagnose':  () => execPS('Test-NetConnection -ComputerName 8.8.8.8 -Port 53'),
  'network.ipconfig':  () => execPS('ipconfig /all'),
  'network.ping':      (host) => execPS(`ping -n 4 ${host}`),
  'network.dns.flush': () => execPS('ipconfig /flushdns'),
  'network.adapters':  () => execPS('Get-NetAdapter | Format-Table Name, Status, LinkSpeed'),

  // Process management
  'process.list':      () => execPS('Get-Process | Sort-Object CPU -Desc | Select -First 15 Name, CPU, WorkingSet'),
  'process.kill':      (name) => execPS(`Stop-Process -Name "${name}" -Force`),  // YELLOW tier

  // Disk & storage
  'disk.usage':        () => execPS('Get-PSDrive -PSProvider FileSystem | Select Name, Used, Free'),
  'disk.cleanup':      () => exec('cleanmgr'),

  // Power management
  'system.shutdown':   () => execPS('Stop-Computer -Force'),  // RED tier
  'system.restart':    () => execPS('Restart-Computer -Force'),  // RED tier
  'system.sleep':      () => execPS('rundll32.exe powrprof.dll,SetSuspendState 0,1,0'),  // YELLOW tier
  'system.lock':       () => execPS('rundll32.exe user32.dll,LockWorkStation'),

  // Display
  'display.brightness.set': (level) => execPS(`(Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightnessMethods).WmiSetBrightness(1,${level})`),

  // Volume (via NirCmd or PowerShell)
  'volume.set':        (level) => sendMediaKey('VOLUME_SET', level),
  'volume.mute':       () => sendMediaKey('VOLUME_MUTE'),
};
```

---

## 5. Action Registry & Safety Gate

Every action flows through `src/actions.js` — the **safety gate**.

### 5.1 Current 3-Tier System

| Tier | Behavior | Actions |
|---|---|---|
| **GREEN** 🟢 | Execute immediately, no confirmation | `clipboard.read`, `clipboard.write`, `file.search`, `url.open`, `system.time`, `system.date`, `system.info` |
| **YELLOW** 🟡 | Show preview, ask user to confirm | `app.open`, `folder.open`, `powershell.read`, `file.move` |
| **RED** 🔴 | Always refuse, show manual instructions | `file.delete`, `file.write`, `registry.write`, `software.install`, `exe.run` |

### 5.2 Expanded Action Registry (To Be Implemented)

New actions to add to the registry:

```javascript
// New GREEN tier actions
'spotify.play':       { tier: GREEN,  fn: spotifyPlay },
'spotify.search':     { tier: GREEN,  fn: spotifySearch },
'media.playpause':    { tier: GREEN,  fn: mediaPlayPause },
'media.next':         { tier: GREEN,  fn: mediaNext },
'media.prev':         { tier: GREEN,  fn: mediaPrev },
'browser.search':     { tier: GREEN,  fn: browserSearch },
'system.processes':   { tier: GREEN,  fn: listProcesses },
'network.status':     { tier: GREEN,  fn: networkStatus },

// New YELLOW tier actions
'word.new':           { tier: YELLOW, fn: wordNew },
'excel.new':          { tier: YELLOW, fn: excelNew },
'outlook.compose':    { tier: YELLOW, fn: outlookCompose },
'code.open':          { tier: YELLOW, fn: codeOpen },
'git.pull':           { tier: YELLOW, fn: gitPull },
'docker.ps':          { tier: YELLOW, fn: dockerPs },
'system.sleep':       { tier: YELLOW, fn: systemSleep },
'system.lock':        { tier: YELLOW, fn: systemLock },
'volume.set':         { tier: YELLOW, fn: volumeSet },
'zip.extract':        { tier: YELLOW, fn: zipExtract },
'file.copy':          { tier: YELLOW, fn: fileCopy },
'process.kill':       { tier: YELLOW, fn: processKill },

// RED tier (never changes)
'system.shutdown':    { tier: RED },
'system.restart':     { tier: RED },
'file.delete':        { tier: RED },
'registry.write':     { tier: RED },
'software.install':   { tier: RED },
```

---

## 6. Dynamic Card System (Kumoboard)

Every card on the Kumoboard is **dynamically generated** from the system scan. No hardcoded content.

### 6.1 Card Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CARD STATE                            │
│  Persisted in: localStorage + %APPDATA%\Kumo\boards\    │
│                                                         │
│  Each card = {                                          │
│    id:        UUID,                                     │
│    type:      'launcher' | 'writer' | 'code' | ...      │
│    title:     user-editable string,                     │
│    config:    tool-specific dynamic state,              │
│    position:  { x, y },                                 │
│    collapsed: boolean,                                  │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Card Types & Their Data Sources

| Card Type | Data Source | Dynamic Behavior |
|---|---|---|
| **App Launcher** | `Get-StartApps` + registry scan | Shows only apps actually installed; user can pin/unpin; search filters dynamically |
| **AI Assistant** | OpenRouter API + model list | Model selector populated from `FREE_MODELS` + user's paid models; tone/persona configurable |
| **PowerShell Console** | Live `child_process.exec` | Real command output; preset commands from system scan; execution logs |
| **Sprint Scratchpad** | `localStorage` / Kumo boards | User-created notes, tasks, colors — fully user-owned |
| **Companion Lab** | Mascot engine + settings | Live mascot preview; theme controls bound to overlay |

### 6.3 Dynamic Tool Spawning

Users can create new tool cards via the `+ New Tool` popover. The available tool types are:

```javascript
const TOOL_TYPES = [
  { key: 'launcher', label: 'App Launcher',    icon: 'rocket' },
  { key: 'writer',   label: 'AI Assistant',    icon: 'sparkles' },
  { key: 'code',     label: 'Terminal Console', icon: 'terminal' },
  { key: 'notes',    label: 'Scratchpad',      icon: 'sticky-note' },
  { key: 'design',   label: 'Companion Lab',   icon: 'palette' },
];
```

### 6.4 Dual-Mode Presentation: Floating Mascot Popout vs. Spatial Canvas Pinning

Cards are not confined to a static page or isolated board. They operate across two fluid states:

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 USER TALKS TO KUMO                     │
                  │   ("Hey Kumo, play Spotify" / "What's eating my RAM?")  │
                  └───────────────────────────┬────────────────────────────┘
                                              │
                                              ▼
                        ┌──────────────────────────────────────────┐
                        │      CONTEXTUAL FLOATING POPOUT          │
                        │  Card pops up directly beside Mascot     │
                        │  - Shows real-time telemetry / playback  │
                        │  - Instant tactile controls (Play, Kill) │
                        └───────────────┬──────────────────┬───────┘
                                        │                  │
                         [ × Close / Dismiss ]      [ 📌 Send to Canvas ]
                                        │                  │
                                        ▼                  ▼
                             Dismisses instance       Docks card directly
                             back into background    onto Kumoboard canvas
                                                     (Persistent Dashboard)
```

1. **Spatial Canvas Mode (Kumoboard Dashboard)**:
   - The infinite canvas acts as the user's permanent desktop workbench and spatial dashboard.
   - Cards stay where they are placed, persist across restarts, and can be panned/zoomed.

2. **Ambient Mascot Popout Mode (Contextual Summon)**:
   - When the user asks Kumo a question or commands an action, Kumo determines the relevant card domain (`spotify`, `system-health`, `network`, `dock`, `dev-workspace`, `scripts`).
   - The matching card pops up right beside the mascot in the transparent desktop overlay.
   - The user gets live visual feedback and interactive buttons (e.g. Spotify play/pause/skip, CPU gauge, ping latency).

3. **Card Lifecycle Controls**:
   - **`[ × Close ]`**: Dismiss the transient popup when done.
   - **`[ 📌 Pin to Canvas ]`**: Instantly transfers the card into the infinite canvas dashboard, letting the user keep monitoring it without losing context.


---

## 7. Instruction Execution Engine

This is the pipeline that takes a user's text instruction and turns it into an executed system action.

### 7.1 Current Flow (Online Only)

```
User types: "Open Spotify and play my favourites"
    │
    ▼
chat.js:sendMessage() → IPC 'ai:send' → main.js
    │
    ▼
main.js → ai.sendMessage(text, history, onChunk)
    │
    ▼
OpenRouter API → LLM streams response:
  "Sure! Opening Spotify for you now 🎵
   [ACTION:{"type":"app.open","args":{"name":"spotify"}}]"
    │
    ▼
main.js: regex parse [ACTION:{...}]
    │
    ▼
actions.run('app.open', { name: 'spotify' })
    │
    ▼
Safety gate: YELLOW → confirm with user (or auto-confirm if enabled)
    │
    ▼
exec('start "" "spotify"') → Spotify launches
    │
    ▼
Response sent back to overlay bubble: "Sure! Opening Spotify for you now 🎵\n🚀 Opened: spotify"
```

### 7.2 Problems with Current Flow

| Problem | Impact | Solution |
|---|---|---|
| **No offline fallback** | When internet is down, mascot shows "AI not initialized" error | Implement `offline-brain.js` with pattern matching |
| **Limited action registry** | Only 11 actions supported; can't play music, control volume, etc. | Expand registry with 30+ new actions |
| **No multi-action support** | LLM can only emit ONE `[ACTION:{...}]` per response | Parse for multiple action blocks; support `[ACTIONS:[{...},{...}]]` |
| **No deep task execution** | "Open Spotify and play favourites" only opens Spotify, doesn't navigate | Implement app-specific deep handlers with URI schemes + COM automation |
| **No auto-confirm for safe actions** | Every YELLOW action requires manual confirmation popup | Add `autoConfirmYellow` setting (already in schema, not wired) |
| **No streaming action feedback** | User sees "Thinking..." then final result, no progress | Stream action execution status in real-time |

### 7.3 Proposed Enhanced Flow

```
User types: "Open Spotify and play my favourites"
    │
    ▼
INTENT ROUTER (new module: src/intent-router.js)
    │
    ├── Check connectivity → Online? → ONLINE BRAIN
    │                                    │
    │                                    ▼
    │                              LLM processes with enhanced system prompt
    │                              that includes FULL action registry
    │                                    │
    │                                    ▼
    │                              Response: "Opening Spotify for you! 🎵
    │                              [ACTIONS:[
    │                                {"type":"app.open","args":{"name":"spotify"}},
    │                                {"type":"spotify.play","args":{"target":"library"}}
    │                              ]]"
    │
    └── Offline? → OFFLINE BRAIN
                     │
                     ▼
                Pattern match: /open\s+spotify.*play.*favo/i
                     │
                     ▼
                Map to actions:
                  1. app.open({ name: 'spotify' })
                  2. spotify.play({ target: 'library' })
    │
    ▼
ACTION PIPELINE (sequential execution with progress)
    │
    ├── Action 1: app.open → YELLOW → confirm → exec → ✅
    ├── Action 2: spotify.play → GREEN → exec → ✅
    │
    ▼
RESPONSE AGGREGATOR
    │
    ▼
Overlay bubble: "🎵 Spotify is open and playing your library!"
```

---

## 8. Permission Model

Kumo's permission system lives in `src/settings.js` under the `permissions` key:

```javascript
permissions: {
  appLaunch:         true,    // Can Kumo open applications?
  clipboardAccess:   true,    // Can Kumo read/write clipboard?
  shellSandbox:      true,    // Can Kumo run PowerShell (read-only)?
  fileSearch:        true,    // Can Kumo search files?
  systemInfo:        true,    // Can Kumo read system specs?
  browserOpen:       true,    // Can Kumo open URLs in browser?
  autoConfirmYellow: false,   // Auto-confirm YELLOW actions? (skip popup)
}
```

### 8.1 Permission Expansion (Proposed)

```javascript
permissions: {
  // Existing
  appLaunch:         true,
  clipboardAccess:   true,
  shellSandbox:      true,
  fileSearch:        true,
  systemInfo:        true,
  browserOpen:       true,
  autoConfirmYellow: false,

  // New — Media Control
  mediaControl:      true,     // Can Kumo control Spotify, VLC, media keys?
  volumeControl:     true,     // Can Kumo change system volume?

  // New — Office Automation
  officeAutomation:  true,     // Can Kumo open/create Office documents?
  emailAccess:       false,    // Can Kumo compose emails via Outlook?

  // New — Development
  devToolAccess:     true,     // Can Kumo run git/npm/docker commands?
  codeEditorAccess:  true,     // Can Kumo open VS Code / Cursor?

  // New — System
  processControl:    false,    // Can Kumo kill processes?
  networkDiagnostic: true,     // Can Kumo run ping/ipconfig/netstat?
  powerControl:      false,    // Can Kumo sleep/lock the system?

  // New — File Operations
  fileModify:        false,    // Can Kumo rename/copy/move files?
  archiveAccess:     true,     // Can Kumo extract/create zip files?
}
```

### 8.2 Permission UI (Kumoboard Settings Card)

The permissions are editable from the Kumoboard via a dedicated **Security & Permissions** panel that shows:
- Toggle switches for each permission category
- Description of what each permission allows
- Visual tier indicators (GREEN/YELLOW/RED badge per action)
- Audit log of recent actions executed

### 8.3 Deep System Onboarding Scan & Dynamic Permission Profiling

When Kumo is installed on **any new user's machine**, it cannot and must not make assumptions or rely on hardcoded presets. Instead, during onboarding (or when requested via the "Rescan System" button in Kumoboard), Kumo executes an automated **Deep Capability & Permission Introspection Scan** (`src/system-scanner.js`).

```
┌─────────────────────────────────────────────────────────────────┐
│               AUTOMATED ONBOARDING DEEP SCAN                    │
│                                                                 │
│   Phase 1: Windows Start Apps & UWP Protocol Discovery          │
│   Phase 2: Win32 Program Files & Software Registries             │
│   Phase 3: PATH Environment & Developer Toolchain CLI            │
│   Phase 4: URI Protocol Scheme Handlers (spotify:, tg:, etc.)    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│            DYNAMIC CAPABILITY & PERMISSION PROFILER             │
│                                                                 │
│   Categorizes into: Media, Communication, Office, Dev, Creative │
│   Determines: Specific assistance tasks Kumo can perform        │
│   Computes: Recommended Safety Tier (Green / Yellow / Red)      │
│   Generates: Granular User Consent Profile (capabilities.json)   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│         KUMOBOARD "CAPABILITY & PERMISSION INSPECTOR"           │
│                                                                 │
│   User sees transparent dashboard:                              │
│   - "Kumo discovered 28 apps and 9 dev tools on your PC"        │
│   - Per-app permission toggles with task capability breakdown   │
│   - Instant toggle to revoke or grant access to any app         │
└─────────────────────────────────────────────────────────────────┘
```

#### Application Classification & Permission Taxonomy

| Category | Typical Apps Detected | Default Tier | Permissions Requested | Assist Tasks Unlocked |
|---|---|---|---|---|
| **Media & Entertainment** | Spotify, Netflix, VLC, Prime Video, Media Player | 🟢 GREEN | `appLaunch` | Launch & focus, interactive playback controls, favorite playlists, media search |
| **Communication & Social** | Telegram, WhatsApp, Discord, Slack, Skype, Outlook | 🟡 YELLOW | `appLaunch`, `clipboardAccess` | Open chats, draft messages/snippets via clipboard, launch meeting links |
| **Office & Productivity** | Word, Excel, PowerPoint, OneNote, Notepad, Calculator | 🟡 YELLOW | `appLaunch`, `fileSearch` | Open docs/spreadsheets, scaffold templates, desktop notes, instant math |
| **Developer & Engineering**| VS Code, Cursor, Git, Docker, Node, Python, WSL, Terminal | 🟡 YELLOW | `appLaunch`, `shellSandbox`, `fileSearch` | Open project folders, check git status, inspect container health, run build scripts |
| **Creative & 3D** | Blender, Paint 3D, Photoshop, Figma, Avro | 🟡 YELLOW | `appLaunch` | Open 3D scenes, design asset folders, typing tool layout shortcuts |
| **System & Utilities** | Settings, Task Manager, WinRAR, Snipping Tool, Security | 🟡 YELLOW | `appLaunch`, `systemInfo` | Hardware telemetry readouts, screenshot tools, open Windows settings panels |
| **Restricted / Critical** | Registry Editor, DiskPart, Service Killers | 🔴 RED | None (Blocked) | Manual step-by-step guidance only; no direct execution |

#### Runtime Enforcement
Every action requested through the mascot or Kumoboard checks the dynamic permission profile in real-time. If a user turns off permission for *Telegram* or *Outlook*, Kumo respects the boundary immediately:
> *"Telegram automation has been turned off in your Kumoboard Security Settings. You can enable it anytime in the Permissions panel."*


---

## 9. Offline Fallback — Control Panel Brain

When the internet is down, the **Control Panel brain** activates. This is fundamentally different from the Online Brain:

### 9.1 What the Control Panel Brain Does

| Capability | How |
|---|---|
| **App Launching** | Direct `shell.openPath()` / `exec('start ...')` from the app registry |
| **Network Diagnostics** | `ping 8.8.8.8`, `ipconfig /all`, `netstat -an`, `Test-NetConnection` |
| **DNS Troubleshooting** | `ipconfig /flushdns`, `nslookup`, check DNS settings |
| **Process Management** | `Get-Process`, `tasklist`, show resource usage |
| **System Status** | CPU/RAM/disk usage, uptime, running services |
| **File Operations** | Search, open folders, list files — all local |
| **Service Management** | `Get-Service`, restart services (with confirmation) |
| **Script Execution** | Run user-saved PowerShell scripts from the board's script presets |

### 9.2 Why This Matters

Consider this real scenario:
1. User's internet goes down
2. They ask Kumo: "Hey what's wrong with my internet?"
3. **Without offline brain**: Kumo shows "AI not initialized — API key missing" ← USELESS
4. **With offline brain**: Kumo runs `Test-NetConnection`, `ipconfig /all`, `ping 8.8.8.8`, analyzes the output, and says "Your DNS server isn't responding. Try `ipconfig /flushdns` — I can run that for you."

### 9.3 Offline Brain Implementation Design

```javascript
// src/offline-brain.js

class OfflineBrain {
  constructor(actionRunner) {
    this.actions = actionRunner;
    this.appRegistry = null;  // populated by system scan
  }

  async init() {
    // Scan system for installed apps
    this.appRegistry = await this.scanApps();
  }

  async processInput(text) {
    const normalized = text.toLowerCase().trim();

    // 1. Try intent patterns
    for (const pattern of INTENT_PATTERNS) {
      const match = normalized.match(pattern.pattern);
      if (match) {
        const args = pattern.extract(match);
        const result = await this.actions.run(pattern.action, args);
        return {
          reply: this.formatResult(pattern.action, args, result),
          actions: [{ type: pattern.action, args, result }],
        };
      }
    }

    // 2. Try fuzzy app name matching
    const appMatch = this.fuzzyMatchApp(normalized);
    if (appMatch) {
      const result = await this.actions.run('app.open', { name: appMatch.name });
      return {
        reply: `Opening ${appMatch.displayName}...`,
        actions: [{ type: 'app.open', args: { name: appMatch.name }, result }],
      };
    }

    // 3. Fallback: polite error
    return {
      reply: "I'm in offline mode right now (no internet). I can open apps, run commands, and check system status. Try asking me to open an app or check something!",
      actions: [],
    };
  }

  fuzzyMatchApp(input) {
    // Fuzzy string matching against installed app names
    // Uses Levenshtein distance or simple includes() matching
  }

  formatResult(action, args, result) {
    // Human-readable result formatting
  }
}
```

---

## 10. Data Flow Diagrams

### 10.1 Overall Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          ELECTRON APP                           │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Overlay  │  │ Kumo     │  │ Kumo     │  │ System   │       │
│  │ (Mascot  │  │ Board    │  │ Studio   │  │ Tray     │       │
│  │  + Chat) │  │ (Cards)  │  │ (Setup)  │  │          │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │              │              │              │             │
│       └──────────────┼──────────────┼──────────────┘             │
│                      │              │                            │
│                      ▼              ▼                            │
│              ┌───────────────────────────┐                      │
│              │      PRELOAD BRIDGE       │                      │
│              │   contextBridge.expose    │                      │
│              │    'goo' namespace        │                      │
│              └───────────┬───────────────┘                      │
│                          │ IPC                                  │
│                          ▼                                      │
│              ┌───────────────────────────┐                      │
│              │      MAIN PROCESS         │                      │
│              │                           │                      │
│              │  ┌─────────┐ ┌─────────┐  │                      │
│              │  │ ai.js   │ │actions.js│  │                      │
│              │  │(Online) │ │(Safety) │  │                      │
│              │  └────┬────┘ └────┬────┘  │                      │
│              │       │          │        │                      │
│              │  ┌────┴──────────┴────┐   │                      │
│              │  │  intent-router.js  │   │                      │
│              │  │  (NEW — Routes to  │   │                      │
│              │  │   online/offline)  │   │                      │
│              │  └────┬──────────┬────┘   │                      │
│              │       │          │        │                      │
│              │  ┌────┴────┐ ┌──┴──────┐  │                      │
│              │  │offline- │ │settings │  │                      │
│              │  │brain.js │ │ .js     │  │                      │
│              │  │(NEW)    │ │         │  │                      │
│              │  └─────────┘ └─────────┘  │                      │
│              └───────────────────────────┘                      │
│                          │                                      │
│                          ▼                                      │
│              ┌───────────────────────────┐                      │
│              │     OPERATING SYSTEM      │                      │
│              │  • shell.openPath()       │                      │
│              │  • child_process.exec()   │                      │
│              │  • PowerShell commands    │                      │
│              │  • Start Menu / registry  │                      │
│              └───────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

### 10.2 Chat Message Lifecycle

```
[User types in chat input]
        │
        ▼
  chat.js:sendMessage()
        │
        ├─ Set mascot state → 'thinking'
        ├─ Show bubble → 'Thinking...'
        ├─ Record history
        │
        ▼
  IPC: goo.sendMessage(text)
        │
        ▼
  main.js: ipcMain.handle('ai:send')
        │
        ├─ intent-router.js (NEW)
        │   ├─ Online? → ai.sendMessage()
        │   │             ├─ Stream tokens via 'ai:stream'
        │   │             └─ Parse [ACTION:...] blocks
        │   └─ Offline? → offline-brain.processInput()
        │                  └─ Pattern match → direct action
        │
        ▼
  actions.run(type, args, confirmFn)
        │
        ├─ GREEN: execute immediately
        ├─ YELLOW: renderer confirm dialog → execute
        └─ RED: refuse + manual instructions
        │
        ▼
  Result → format response → IPC reply
        │
        ▼
  chat.js: showBubble(reply)
        │
        ├─ Set mascot state → 'happy' (temp 2s)
        └─ Display formatted response in bubble
```

---

## 11. Roadmap

### Phase 1 — Foundation (Current)
- [x] Overlay mascot with drag, poke, and chat
- [x] Online brain via OpenRouter + free models
- [x] 11-action safety-gated registry
- [x] Kumoboard with 5 dynamic tool cards
- [x] Settings persistence (`%APPDATA%\Kumo\config.json`)
- [x] Permission model (6 categories)
- [x] Kumo Studio onboarding wizard

### Phase 2 — Deep Orchestration (Next)
- [ ] `src/intent-router.js` — online/offline routing
- [ ] `src/offline-brain.js` — local heuristic command engine
- [ ] Expand action registry to 30+ actions
- [ ] Spotify deep task handler (URI-based playback)
- [ ] Office deep task handler (CLI flags + COM)
- [ ] Browser deep task handler (search, navigate)
- [ ] Multi-action parsing from LLM responses
- [ ] Auto-confirm toggle for YELLOW actions
- [ ] Enhanced system prompt with full action registry

### Phase 3 — Control Panel
- [ ] Network diagnostics dashboard (offline-first)
- [ ] Process monitor card
- [ ] System status widget
- [ ] Script runner with saved presets
- [ ] Service manager

### Phase 4 — Intelligence
- [ ] Context memory (remember user preferences across sessions)
- [ ] Workflow recording (user teaches Kumo a multi-step task)
- [ ] Scheduled tasks (cron-style recurring actions)
- [ ] Smart suggestions (proactive assistance based on usage patterns)

### Phase 5 — Voice & Vision (Future)
- [ ] Speech-to-text input (Wake word: "Hey Kumo")
- [ ] Text-to-speech response
- [ ] Screen context awareness (what app is focused, clipboard content)

---

## Appendix A: File Map

| File | Purpose |
|---|---|
| `src/main.js` | Electron main process, IPC handlers, app lifecycle |
| `src/ai.js` | OpenRouter SDK, streaming, system prompt, model fallback |
| `src/actions.js` | Safety-gated action dispatcher (GREEN/YELLOW/RED) |
| `src/settings.js` | Config read/write (`%APPDATA%\Kumo\config.json`) |
| `src/preload.js` | IPC security bridge (`window.goo` namespace) |
| `src/overlay-manager.js` | Overlay window creation and lifecycle |
| `src/board-manager.js` | Board window, board CRUD, folders |
| `src/studio-manager.js` | Kumo Studio / onboarding wizard |
| `src/tray.js` | System tray icon and menu |
| `src/intent-router.js` | **NEW** — Routes input to online/offline brain |
| `src/offline-brain.js` | **NEW** — Local heuristic command engine |
| `ui/overlay/goo.js` | Mascot controller (3D/2D, states, animations) |
| `ui/overlay/chat.js` | Chat bar, bubble, streaming, settings, history |
| `ui/board/app.js` | Kumoboard main controller |
| `ui/board/js/state.js` | Board state management |
| `ui/board/js/actions.js` | Board → native action bridge |
| `ui/board/js/tools/*.js` | Individual tool card implementations |

---

*This document is the source of truth for Kumo's infrastructure. All implementation decisions should reference this spec.*
