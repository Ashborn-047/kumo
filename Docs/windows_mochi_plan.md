# 🫧 Windows Mochi — Full Desktop AI Assistant
## Build Plan & Architecture

---

## What We're Building

A **Windows-native floating AI assistant** — Mochi lives on your desktop as a pixel-goo mascot,
talks to **free AI models via OpenRouter**, and can control your PC with a **safety-first confirmation system**.

---

## Tech Stack Decision

| Layer | Choice | Why |
|---|---|---|
| Shell | **Electron 31** | Fastest dev, WebView2 on Win, ships as .exe |
| UI | **HTML/CSS/Canvas** (same as original) | Port goo animation directly from mochi |
| AI | **OpenRouter API** (free tier) | Access to Llama 3.3, Gemini Flash, DeepSeek R1, Mistral — all free |
| System | **Node.js built-ins** + `@electron/shell` | File search, clipboard, app launch, PowerShell |
| Tray | **Electron Tray** | System tray icon with context menu |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  ELECTRON MAIN                   │
│  ┌──────────┐  ┌───────────┐  ┌──────────────┐  │
│  │ Tray     │  │ IPC       │  │ Action       │  │
│  │ Manager  │  │ Bridge    │  │ Engine       │  │
│  └──────────┘  └───────────┘  └──────────────┘  │
│  ┌──────────────────────────────────────────┐    │
│  │         System Capability Layer          │    │
│  │  Files  │  Apps  │  Clipboard  │  Shell  │   │
│  └──────────────────────────────────────────┘    │
└──────────────────┬──────────────────────────────┘
                   │ IPC
┌──────────────────▼──────────────────────────────┐
│              RENDERER (BrowserWindow)            │
│  ┌─────────────────┐  ┌────────────────────┐    │
│  │  Pixel Goo      │  │  Chat Bubble       │    │
│  │  Animation      │  │  + Reply Panel     │    │
│  │  (Canvas)       │  │  (HTML/CSS)        │    │
│  └─────────────────┘  └────────────────────┘    │
└─────────────────────────────────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────────────┐
│           OpenRouter API (free tier)             │
│  • Llama 3.3 70B   • Gemini Flash 1.5           │
│  • DeepSeek R1     • Mistral 7B                 │
│  • Qwen 2.5        • many more free models      │
└─────────────────────────────────────────────────┘
```

---

## Safety System — Before ANY Action

Every system action goes through a **3-tier safety gate**:

| Tier | Actions | Behavior |
|---|---|---|
| 🟢 **Safe** | Read clipboard, search files, open URL, get time/date | Done silently, no confirmation |
| 🟡 **Confirm** | Open app, run a PowerShell read-only command, move file | Mochi shows preview + asks "Do this?" |
| 🔴 **Always Manual** | Delete files, write to system dirs, network requests, install software | Mochi REFUSES to do autonomously. She shows you the exact command/action and says "run this yourself" |

> **The red tier can never be unlocked.** Mochi will not delete files, format drives, or uninstall software — ever. She'll describe how to do it yourself.

---

## Features

### 🫧 Core Personality
- Pixel-goo mascot floats over desktop (always-on-top, transparent window)
- Breathes, blinks, follows cursor, hops when you send a message
- Sleeps when idle, coffee in the morning, sunglasses on Friday (same as original!)
- **Right-click** → change color, settings, quit

### 🤖 AI Chat (via OpenRouter)
- Global hotkey (`Alt+Space`) to focus chat input from any app
- Talks to free models: Llama 3.3, Gemini Flash, DeepSeek R1, etc.
- Picks the best available free model automatically
- Switch models from settings menu
- Chat history panel (toggle with a button)
- Short reply bubble + "show more" for long answers

### ⚡ System Actions (Safety-Gated)
- 📋 **Clipboard**: Read & write clipboard content
- 🔍 **File search**: Find files by name or content
- 📂 **Open files/folders**: Open in Explorer
- 🌐 **Open URLs**: Launch in default browser
- 📱 **Launch apps**: Open installed programs
- 💻 **PowerShell (read-only)**: Get system info, list processes, etc.
- 📊 **System info**: CPU, RAM, disk, running processes
- 🔔 **Windows notifications**: Send toast notifications
- 📝 **Summarize clipboard**: AI summarizes whatever is copied

### 🔔 Social Badges (same as original)
- Reads Chrome tab titles via Chrome DevTools Protocol (port 9222)
- Shows notification badges for Instagram, LinkedIn, X, Threads
- Click badge → jumps to that Chrome tab

### 🎛️ System Tray
- Always accessible tray icon
- Quick actions: "Ask Mochi…", "Show/Hide", "Settings", "Quit"
- Badge on tray icon when Mochi has something for you

---

## Project Structure

```
mochi-windows/
├── main.js              ← Electron main process
├── preload.js           ← IPC bridge (contextBridge)
├── package.json
├── src/
│   ├── ipc/
│   │   ├── ai.js        ← OpenRouter API calls
│   │   ├── actions.js   ← System action engine + safety gate
│   │   ├── chrome.js    ← Chrome DevTools Protocol (social badges)
│   │   └── system.js    ← Clipboard, file search, app launch
│   └── ui/
│       ├── index.html   ← Mochi overlay window
│       ├── goo.js       ← Pixel goo animation (from original)
│       ├── chat.js      ← Chat bubble + history panel
│       ├── tray.js      ← Tray menu logic
│       └── style.css    ← Styling
├── assets/
│   └── mochi.png        ← Tray icon
└── installer/
    └── setup.iss        ← Inno Setup installer script (optional)
```

---

## What We Build in Phase 1 (today)

1. ✅ Electron app skeleton with transparent always-on-top window
2. ✅ Pixel goo animation (ported from original Mochi canvas code)
3. ✅ Chat bubble UI (type message → get AI reply → reply pops above goo)
4. ✅ OpenRouter integration (free models, auto-selects best available)
5. ✅ System tray icon + right-click menu
6. ✅ Global hotkey (Alt+Space)
7. ✅ Safety-gated action engine (clipboard read, file search, open URL, open app)
8. ✅ Windows installer (NSIS via electron-builder)

**Phase 2** (follow-up):
- Social badges via Chrome DevTools Protocol
- PowerShell read-only commands
- Chat history panel
- Model switcher in settings
- Mood system (sleepy, coffee, sunglasses)
