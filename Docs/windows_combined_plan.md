# 🫧 [New Name TBD] — Combined Windows AI Desktop App
## Unified Build Plan

> Based on: mochi (floating assistant) + mochiboard (infinite canvas)
> New brand name to be decided later. Using `goo` as the internal codename for now.

---

## What We're Building

One single Electron app that ships **two experiences in one**:

| Mode | What it is |
|---|---|
| 🫧 **Overlay** | Pixel-goo mascot floats over your entire desktop. Always visible. You chat with it. It does things for you. |
| 🗺️ **Board** | Click the mascot (or tray icon) → a full infinite planning canvas slides open. Drop notes, images, wireframes. The goo AI assistant lives inside too. |

---

## Why One App

- Single install, single tray icon, single process
- The goo character is **shared** — it floats over your desktop AND lives in the board
- Boards open as their own `BrowserWindow` — the overlay stays on top regardless
- One OpenRouter API key, one settings panel, one updater

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    ELECTRON MAIN PROCESS                  │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ Tray Manager│  │  IPC Router  │  │  AI Engine     │  │
│  │             │  │  (all msgs)  │  │  (OpenRouter)  │  │
│  └─────────────┘  └──────────────┘  └────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Action Engine (Safety-Gated)          │  │
│  │  🟢 Silent   🟡 Confirm    🔴 Manual-only          │  │
│  │  clipboard   open app      delete file             │  │
│  │  file search run script    system changes          │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                   File System                      │  │
│  │  %APPDATA%\Goo\boards\      ← board JSON files     │  │
│  │  %APPDATA%\Goo\config.json  ← color, prefs, key   │  │
│  │  %APPDATA%\Goo\history.json ← chat history         │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────┬────────────────────┬───────────────────────┘
              │ IPC                │ IPC
   ┌──────────▼──────┐   ┌─────────▼──────────────────────┐
   │  OVERLAY WINDOW │   │         BOARD WINDOW            │
   │  (always-on-top │   │  (BrowserWindow, resizable)     │
   │   transparent)  │   │                                 │
   │                 │   │  ┌──────────┐ ┌──────────────┐  │
   │  🫧 goo.js      │   │  │ Canvas   │ │  Goo panel   │  │
   │  chat.js        │   │  │ (app.js) │ │  (chat       │  │
   │  bubbles.js     │   │  │          │ │   sidebar)   │  │
   │                 │   │  └──────────┘ └──────────────┘  │
   └─────────────────┘   └─────────────────────────────────┘
              │                      │
              └──────────────────────┘
                         │ HTTPS
              ┌──────────▼──────────┐
              │   OpenRouter API    │
              │  Free tier models:  │
              │  • Llama 3.3 70B    │
              │  • Gemini Flash 1.5 │
              │  • DeepSeek R1      │
              │  • Mistral 7B       │
              │  • Qwen 2.5         │
              └─────────────────────┘
```

---

## What's Ported vs What's New

### From original Mochiboard web/ → 0 changes needed
- `web/app.js` (259KB canvas engine) ✅ pure JS
- `web/index.html` ✅ pure HTML
- `web/style.css` (106KB) ✅ pure CSS
- `web/goo.js` (pixel goo animation) ✅ pure canvas
- `web/sw.js` (service worker) ✅ works in Electron

### From bridge.js → ~30 lines changed
```diff
- window.webkit.messageHandlers.mb.postMessage({ id, op, args })
+ window.__electronBridge.send(id, op, args)

- window.__mbReply = (id, ok, value) => { ... }
+ window.__electronBridge.onReply((id, ok, value) => { ... })
```

### New for Windows
- `main.js` — Electron main (replaces Mochiboard.swift entirely)
- `preload.js` — contextBridge (security layer between Node and renderer)
- `src/ai.js` — OpenRouter API calls (replaces Claude Code dependency)
- `src/actions.js` — safety-gated Windows system actions
- `src/overlay.js` — transparent always-on-top overlay window manager
- `src/tray.js` — system tray icon + menu
- `src/chrome.js` — Chrome DevTools Protocol for social badges (Phase 2)
- `installer/` — NSIS installer via electron-builder

---

## Project File Structure

```
goo-windows/                    ← internal codename
├── package.json
├── main.js                     ← Electron entry point
├── preload.js                  ← IPC security bridge
│
├── src/
│   ├── ai.js                   ← OpenRouter API + model selection
│   ├── actions.js              ← System actions + 3-tier safety gate
│   ├── overlay-manager.js      ← Floating goo window controller
│   ├── board-manager.js        ← Board window + file I/O
│   ├── tray.js                 ← System tray
│   └── settings.js             ← Config read/write
│
├── ui/
│   ├── overlay/
│   │   ├── index.html          ← Transparent overlay window
│   │   ├── goo.js              ← Pixel goo (ported from original)
│   │   ├── chat.js             ← Chat input + bubble
│   │   └── overlay.css
│   │
│   └── board/                  ← Mochiboard canvas (mostly direct port)
│       ├── index.html          ← (from web/index.html)
│       ├── app.js              ← (from web/app.js — untouched)
│       ├── bridge.js           ← (from web/bridge.js — 30 lines changed)
│       ├── goo.js              ← (from web/goo.js — untouched)
│       ├── style.css           ← (from web/style.css — untouched)
│       └── sw.js               ← (from web/sw.js — untouched)
│
└── assets/
    ├── tray-icon.png
    └── icon.ico
```

---

## Safety Gate (Action Engine)

```
User asks Mochi: "delete the old project folder"
         │
         ▼
    Action Engine
         │
    ┌────▼────────────────────────────────────────────────┐
    │  Tier classifier                                    │
    │  Is this: read? open? search? → 🟢 Silent           │
    │  Is this: launch app? run cmd? → 🟡 Ask first       │
    │  Is this: delete? write sys? → 🔴 Refuse + explain  │
    └─────────────────────────────────────────────────────┘
         │
    🔴 Reached → Mochi says:
    "I can't delete files for you — that's a manual step.
     Here's exactly what to do:
     1. Open Explorer → navigate to C:\Projects\old-project
     2. Press Delete, then empty Recycle Bin."
```

**Hard rules that can never be overridden:**
- No file deletion
- No writing to `C:\Windows\`, `C:\Program Files\`, or registry
- No installing/uninstalling software
- No sending data to any URL not in the approved list (OpenRouter + Chrome DevTools)
- No running `.exe` files the user didn't explicitly choose

---

## Phase 1 Build (What We Deliver Today)

1. ✅ Electron app scaffold + transparent overlay window
2. ✅ Pixel goo animation (ported from original `goo.js`)
3. ✅ Chat bubble — type → OpenRouter → reply pops above goo
4. ✅ Global hotkey `Alt+Space` → focus chat
5. ✅ System tray icon + menu (Show/Hide, Open Board, Settings, Quit)
6. ✅ Board window — full Mochiboard canvas ported (app.js untouched)
7. ✅ Electron IPC bridge replacing `webkit.messageHandlers`
8. ✅ Board files saved to `%APPDATA%\Goo\boards\`
9. ✅ Safety-gated actions: clipboard, file search, open URL, open app
10. ✅ First-run setup wizard (enter OpenRouter API key + pick goo color)
11. ✅ NSIS Windows installer via electron-builder

## Phase 2 (Follow-up)

- Social badges (Chrome DevTools Protocol)
- Chat history panel
- PowerShell read-only queries (system info)
- Mood system (sleepy, coffee, sunglasses, etc.)
- Model switcher in settings
- Auto-updater
- Brand rename + new icon/name

---

## What You Need

1. **Free OpenRouter account** → [openrouter.ai](https://openrouter.ai) (takes 2 minutes, free API key)
2. **Node.js 20+** → already on your machine or `winget install OpenJS.NodeJS`
3. That's it. We build everything else.
