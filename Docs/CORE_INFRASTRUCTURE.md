# 🌩️ Kumo Desktop Assistant — Core Infrastructure & System Architecture

> **Document Version:** 1.0.0-PROD  
> **Status:** Active Core Specification & Execution Standard  
> **Target Environment:** Microsoft Windows 10 Pro (Build 19045, x64) (Electron 28+, Node.js v24+, PowerShell 5.1/Core)
> **System Host:** DESKTOP-5QIDRVD (16 GB RAM, 12 Core CPU, Multi-Volume Storage)

---

## 1. Executive Summary & Vision

Kumo is an **ambient, spatial desktop companion and system orchestrator**. Unlike isolated chat interfaces or passive widgets, Kumo functions as an active co-pilot on the user's desktop, bridging natural conversation with deterministic operating system control.

### The Foundational Tenets
1. **Never Brick on Offline:** When the internet blips or LLM credits expire, Kumo seamlessly switches to the **Offline Brain**, continuing to run system diagnostics, launch apps, manipulate clipboards, and execute local scripts without missing a beat.
2. **Zero Hardcoded Cards:** Every card on the spatial infinite canvas (Mochiboard) is dynamic, driven by system capabilities, scanned applications, live telemetry, and user workflows.
3. **Mascot-First Direct Execution:** The user can command the mascot directly via overlay chat or hotkeys (`Alt+Space`), and Kumo executes multi-step actions across native desktop applications.
4. **Ironclad Safety Tiers:** All system operations follow an enforceable 3-tier security boundary (Green, Yellow, Red) configurable directly in the Control Panel.

---

## 2. Host System Discovery & Scanned Ecosystem

A deep system scan was performed on the host machine. Kumo’s orchestration engine is tailored to interface directly with these installed applications and developer environments:

### 2.1 Media & Entertainment
| Application | Launch Protocol / Identifier | Assist Capabilities |
| :--- | :--- | :--- |
| **Spotify** | `spotify:` / Windows Store | Voice/text playback, launch favorite playlists, pause/skip |
| **Netflix** | `netflix:` / Store AppID | Direct launch, binge mode focus setup |
| **Prime Video** | `AmazonVideo.PrimeVideo...` | Media center mode, screen dimming |
| **Crunchyroll** | Store AppID | Quick launch into anime catalog |
| **Media Player** | `mswindowsmusic:` | Local audio playlist playback |

### 2.2 Communication & Collaboration
| Application | Launch Protocol / Identifier | Assist Capabilities |
| :--- | :--- | :--- |
| **Telegram Desktop** | `tg:` / Windows Store | Quick open, message drafting, channel check |
| **WhatsApp Desktop** | `whatsapp:` / Store AppID | Open chat, paste formatted snippets from clipboard |
| **Discord** | `discord:` / Discord.exe | Community check, toggle mute, gaming setup |
| **Microsoft Outlook** | `outlook:` / Office Hub | Email drafting, schedule & calendar glance |

### 2.3 Developer & Engineering Toolchain
| Tool / Runtime | Binary / Path | Assist Capabilities |
| :--- | :--- | :--- |
| **Node.js & npm** | `node.exe` (v24.19.0) | Script runner, npm test/build automations |
| **Git** | `git.exe` | Repository status, branch check, commit & push helpers |
| **Python & Pip** | `python.exe` / `uv` | Data scripts, AI tooling, Graphify graph queries |
| **VS Code / Cursor** | `code.exe` / `cursor.exe` | Workspace directory launcher, file locator |
| **WSL UI & Settings** | `wslsettings.exe` / `wsl.exe` | Linux container/distribution start, terminal multiplexing |
| **Dockerun / Docker** | Store AppID / `docker` | Container health check, compose runner |
| **DevToys** | Store AppID | Developer utility launcher (regex, base64, JWT, JSON) |
| **Windows Terminal** | `wt.exe` | Open tabbed PowerShell/WSL in active project directory |

### 2.4 Creative & 3D Production
| Application | Launch Protocol / Identifier | Assist Capabilities |
| :--- | :--- | :--- |
| **Blender 5.2.2** | Store AppID (`ppwjx1n5r4v9t!BLENDER`) | 3D render launch, asset workspace opener |
| **Paint 3D / 3D Viewer** | Store AppID | Quick preview 3D models and textures |
| **Avro Keyboard** | `Avro Keyboard.exe` | Bengali typing toggle & layout editor shortcut |

### 2.5 Productivity & System Utilities
| Application | Identifier | Assist Capabilities |
| :--- | :--- | :--- |
| **Claude Desktop** | `AnthropicPBC.Claude...` | AI pair programming & sidecar consultation |
| **ChatGPT Desktop** | `OpenAI.ChatGPT-Desktop...` | Secondary LLM session opener |
| **Microsoft Office** | `winword`, `excel`, `powerpnt` | Document creation, spreadsheet quick start |
| **Windows Security** | `SecHealthUI` | Antivirus & firewall status quick check |
| **WinRAR** | `WinRAR.exe` | Archive extraction & compression shortcuts |
| **Settings / Camera / Clock**| `ms-settings:`, `microsoft.windows.camera:` | Diagnostic panels, timers, webcam check |

---

## 3. Dual-Brain Engine Architecture

```
                      ┌─────────────────────────────────┐
                      │    User Input (Mascot / Chat)   │
                      └────────────────┬────────────────┘
                                       │
                                       ▼
                      ┌─────────────────────────────────┐
                      │    src/intent-router.js         │
                      │  - Connectivity check           │
                      │  - API Key check                │
                      │  - Local intent regex match     │
                      └────────┬───────────────┬────────┘
                               │               │
        [Offline or Local Cmd] │               │ [Online & LLM Key Ready]
                               ▼               ▼
           ┌───────────────────────┐       ┌───────────────────────┐
           │     OFFLINE BRAIN     │       │     ONLINE BRAIN      │
           │  Deterministic Engine │       │  OpenRouter / Gemini  │
           │  - App Launchers      │       │  - Conversational AI  │
           │  - PowerShell Sandbox │       │  - Action Synthesizer │
           │  - Network Sentinels  │       │  - Multi-Action Tags  │
           │  - Hardware Readouts  │       │    [ACTIONS:[...]]    │
           └───────────┬───────────┘       └───────────┬───────────┘
                       │                               │
                       └───────────────┬───────────────┘
                                       │
                                       ▼
                      ┌─────────────────────────────────┐
                      │        src/actions.js           │
                      │   3-Tier Safety Gatekeeper      │
                      │   - GREEN: Auto-execute         │
                      │   - YELLOW: Confirm with preview│
                      │   - RED: Reject with guide      │
                      └────────────────┬────────────────┘
                                       │
                                       ▼
                      ┌─────────────────────────────────┐
                      │  Native System & Win32/UWP API  │
                      │  - Start-Process URI            │
                      │  - execFile powershell.exe      │
                      │  - Shell & Clipboard IPC        │
                      └────────────────┬────────────────┘
                                       │
                                       ▼
                      ┌─────────────────────────────────┐
                      │  Mascot Visual Feedback Loop    │
                      │  idle ➜ thinking ➜ talking/happy│
                      └─────────────────────────────────┘
```

### 3.1 The Online Brain (Conversational Synthesis)
- **Model Selection:** Free tier prioritized (`meta-llama/llama-3.3-70b-instruct:free`, `google/gemini-flash-1.5:free`, `deepseek/deepseek-r1:free`).
- **Structured Tool Calling:** Uses standard JSON action tags:
  ```
  [ACTION:{"type":"app.open","args":{"name":"spotify"}}]
  [ACTIONS:[{"type":"powershell.read","args":{"command":"Test-NetConnection"}},{"type":"app.open","args":{"name":"chrome"}}]]
  ```
- **Streaming Parser:** Streams markdown text into the overlay speech bubble while buffering and extracting actions to execute asynchronously.

### 3.2 The Offline Brain (Deterministic Fallback)
- **Zero-Latency Regex Matching:** Instant response when disconnected or during network dropouts.
- **System Diagnostics:** 
  - `check internet` ➔ Runs `Test-NetConnection` and returns gateway ping.
  - `what is my ip` ➔ Extracts local IPv4 & Default Gateway via `ipconfig`.
  - `flush dns` ➔ Executes `ipconfig /flushdns`.
  - `system specs` ➔ Reads RAM, CPU count, Architecture via Node OS.
  - `open <app>` ➔ Maps to known protocol, UWP AppID, or dynamic `Get-StartApps` lookup.

---

## 4. Safety & Permissions Architecture

All execution is mediated by `src/actions.js`:

```
┌─────────────────────────────────────────────────────────────────┐
│                       ACTION SAFETY TIERS                       │
├───────────┬───────────────────────────────┬─────────────────────┤
│   TIER    │ ACTIONS                       │ ENFORCEMENT         │
├───────────┼───────────────────────────────┼─────────────────────┤
│ 🟢 GREEN  │ clipboard.read/write          │ Silent auto-run     │
│           │ system.time, system.date      │ Always allowed      │
│           │ system.info                   │ Non-destructive     │
│           │ url.open                      │ Safe browser launch │
├───────────┼───────────────────────────────┼─────────────────────┤
│ 🟡 YELLOW │ app.open                      │ Requires preview &  │
│           │ folder.open                   │ confirmation (unless│
│           │ powershell.read (sandboxed)   │ user enables        │
│           │ file.move (workspace only)    │ "autoConfirmYellow")│
├───────────┼───────────────────────────────┼─────────────────────┤
│ 🔴 RED    │ File deletion (rm, del)       │ HARD REFUSAL        │
│           │ Registry modification         │ Cannot be bypassed  │
│           │ Process termination (kill)    │ Provides manual GUI │
│           │ Format / Disk partitioning    │ instruction instead │
└───────────┴───────────────────────────────┴─────────────────────┘
```

### User Security Toggles (in Control Panel):
- `appLaunch`: Enable/disable opening external programs.
- `clipboardAccess`: Guard clipboard history reading.
- `shellSandbox`: Allow/disallow read-only PowerShell commands.
- `fileSearch`: Restrict scanning user directories.
- `systemInfo`: Allow/disallow hardware telemetry readout.
- `autoConfirmYellow`: Toggle user confirmation dialog for yellow-tier operations.

---

## 5. Dynamic Dashboard & Cards Architecture

The Mochiboard infinite canvas will host **dynamic, responsive cards** generated from live system states rather than static mockups:

### Card Schema Standard
Every card is declared as a JSON-serializable node containing:
- `id`: Unique identifier (e.g., `card-app-launcher`)
- `type`: Widget type (`dock`, `telemetry`, `sentinel`, `workspace`, `media`, `snippet`, `script`)
- `title`: Human-readable label
- `color`: Accent color matching the Kumo theme
- `pollInterval`: Dynamic refresh rate in ms (e.g., 3000ms for network, 5000ms for CPU)
- `data`: Live state payload
- `actions`: Array of executable system actions tied to buttons

### Dynamic Card Definitions

#### 1. Dynamic App Launcher Dock (`card-app-launcher`)
- **Source:** Scanned StartApps + frequently used apps.
- **Dynamic Content:** Grid of installed apps (Spotify, Claude, VS Code, Blender, Telegram, Terminal).
- **Action:** Clicking any icon invokes `window.goo.action('app.open', { name })`.
- **Status:** Shows running state badge (Active / Closed).

#### 2. System Health & Telemetry Hub (`card-system-health`)
- **Source:** Node `os` module & CIM telemetry.
- **Dynamic Content:** 
  - Live RAM gauge (Used vs Free GB)
  - CPU load & thread count
  - Storage drive space meters (C: Drive, Secondary volumes)
- **Action:** "Clean Temp Files" or "Open Task Manager".

#### 3. Network Sentinel & Connectivity Hub (`card-network-sentinel`)
- **Source:** `ipconfig`, `Test-NetConnection`, DNS resolver.
- **Dynamic Content:**
  - Online/Offline status banner
  - Local IPv4 & Gateway address
  - Latency badge (Ping to 8.8.8.8)
- **Actions:** "Flush DNS", "Ping Gateway", "Restart Wi-Fi Adapter".

#### 4. Developer Workspace & Repository Hub (`card-dev-workspace`)
- **Source:** Local git repos & WSL / Docker CLI.
- **Dynamic Content:**
  - Current Git branch & uncommitted changes counter
  - WSL distro running state
  - Docker container count
- **Actions:** "Open in VS Code", "Launch Terminal in Repo", "Run npm test".

#### 5. Spotify & Media Orchestrator (`card-spotify-media`)
- **Source:** Spotify Protocol & Windows System Media Transport.
- **Dynamic Content:** Track title, artist, playback controls (Play/Pause/Skip).
- **Actions:** "Play Lo-Fi Beats", "Open Spotify", "Mute Audio".

#### 6. Clipboard History & Snippet Vault (`card-clipboard-vault`)
- **Source:** Electron clipboard monitor.
- **Dynamic Content:** Recent 5 text clippings, code snippet formatting, regex cleaner.
- **Actions:** "Copy to Clipboard", "Clear Clipboard History".

#### 7. Quick Automation & Script Runner (`card-automation-runner`)
- **Source:** User-defined script registry.
- **Dynamic Content:** Script buttons with safety tier badges (e.g., "Export Git Log", "System Cleanup", "Network Speedtest").
- **Actions:** Directly dispatches to `actions.run('powershell.read')`.

---

## 6. Mascot Direct Instruction Verification

The direct instruction pipeline has been verified and hardened:

### Verification Results
1. **Instruction:** `"what is the time"`  
   - **Route:** Offline Brain  
   - **Result:** `⏰ 5:22:26 pm` (Verified ✅)
2. **Instruction:** `"system specs"`  
   - **Route:** Offline Brain  
   - **Result:** `💻 DESKTOP-5QIDRVD: 15 GB RAM, 12 CPUs (x64)` (Verified ✅)
3. **Instruction:** `"what is my ip"`  
   - **Route:** Offline Brain (execFile powershell)  
   - **Result:** IPv4 `192.168.0.9`, Subnet `255.255.255.0` (Verified ✅)
4. **Instruction:** `"open calculator"`  
   - **Route:** `app.open` ➔ `calc:`  
   - **Result:** Calculator launched (Verified ✅)
5. **Instruction:** `"open spotify"`  
   - **Route:** `app.open` ➔ `spotify:` protocol handler  
   - **Result:** Spotify launched (Verified ✅)

---

## 7. Next Milestones & Implementation Roadmap

1. **Card Engine Upgrade (ui/board):** Refactor `ui/board/js/canvas.js` to render the dynamic card schema instead of static HTML stubs.
2. **Real-Time Polling IPC:** Add lightweight background heartbeat in `main.js` to push live hardware and network metrics to the board.
3. **Graphify Synchronization:** Maintain AST and architecture mapping across every code change using `graphify update .`.
