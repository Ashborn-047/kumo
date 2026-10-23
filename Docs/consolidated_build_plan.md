# 🫧 [Codename: Goo] — Consolidated Build Plan
> **Version:** 1.0 | **Date:** 2026-10-23
> Merges: `windows_mochi_plan.md` + `windows_combined_plan.md`
> Status: 🟡 Pre-development — ready to build

---

## Project Summary

A single **Windows-native Electron app** that combines:
- 🫧 **Floating Desktop Mascot** — pixel-goo character that lives on your screen, chats with you via free AI (OpenRouter), and can do safe system actions
- 🗺️ **Infinite Planning Canvas** — a full whiteboard (ported from mochiboard's web layer) where the same mascot lives as an in-board AI assistant

One install. One tray icon. Two experiences.

---

## Tech Stack (Final)

| Layer | Technology | Reason |
|---|---|---|
| App shell | **Electron 31** | Cross-platform, WebView2 on Win, ships as `.exe` |
| UI | **HTML / CSS / Canvas (Vanilla JS)** | Canvas ported directly from mochiboard |
| AI | **OpenRouter API (free tier)** | Llama 3.3, Gemini Flash, DeepSeek R1, Mistral — all free |
| Mascot animation | **Sprite sheets / Rive** (TBD by designer) | Replaceable at any time — placeholder used during dev |
| System actions | **Node.js + Electron APIs** | File search, clipboard, app launch |
| Storage | **`%APPDATA%\Goo\`** (JSON files) | Boards, config, chat history |
| Packaging | **electron-builder** (NSIS installer) | Standard Windows `.exe` installer |

---

## Asset Strategy During Development

> Assets are **100% replaceable** at any time. Development does NOT block on final mascot design.

| Asset | Dev Placeholder | Final (when ready) |
|---|---|---|
| Mascot sprite | Simple animated CSS circle with eyes | Sprite sheet / Rive file from Figma |
| App icon | Default Electron icon | Custom `.ico` from designer |
| Tray icon | 16x16 colored dot | Final mascot tray icon |
| Board background | Solid dark color | Textured canvas background |
| Color palette | Pastel purple (#baa0ff) default | User-picked on first run |

To swap any asset: drop the new file into `assets/` with the same filename — done.

---

## Project Folder Structure

```
G:\My Projects\Goo\
|
+-- Docs\                         <- all planning docs (here)
|
+-- assets\
|   +-- icon.ico
|   +-- tray.png
|   +-- mascot\
|       +-- idle.png
|       +-- talking.png
|       +-- thinking.png
|       +-- happy.png
|       +-- sleeping.png
|
+-- src\
|   +-- main.js                   <- Electron main process
|   +-- preload.js                <- IPC security bridge
|   +-- ai.js                     <- OpenRouter API + model selection
|   +-- actions.js                <- Safety-gated system action engine
|   +-- overlay-manager.js        <- Floating mascot window controller
|   +-- board-manager.js          <- Board window + file I/O
|   +-- tray.js                   <- System tray icon + menu
|   +-- settings.js               <- Config read/write
|
+-- ui\
|   +-- overlay\
|   |   +-- index.html
|   |   +-- goo.js                <- Mascot animation controller
|   |   +-- chat.js               <- Chat input + reply bubble
|   |   +-- overlay.css
|   |
|   +-- board\                    <- Infinite canvas (ported from mochiboard)
|       +-- index.html            <- unchanged from original
|       +-- app.js                <- unchanged from original (259KB)
|       +-- bridge.js             <- 30 lines changed (IPC swap)
|       +-- goo.js                <- unchanged from original
|       +-- style.css             <- unchanged from original
|       +-- sw.js                 <- unchanged from original
|
+-- package.json
+-- .env.example
```

---

## Safety System (Non-Negotiable)

Every system action goes through a **3-tier gate** baked into `actions.js` from day one:

```
GREEN  SILENT   — read clipboard, search files, get time, open URL
YELLOW CONFIRM  — open app, read-only PowerShell, move file
                  Mascot shows preview + "Do this?" before acting
RED    REFUSE   — delete files, write system dirs, install software
                  Mascot says "I can't do that — here's how yourself"
```

**Hard rules, permanent, no override:**
- No file deletion
- No writes to C:\Windows\, C:\Program Files\, or registry
- No installing / uninstalling software
- No running .exe files not chosen explicitly by user
- No network calls except OpenRouter + Chrome DevTools Protocol

---

## Phased Development Plan

### Phase 0 — Setup (~2 hours)
Goal: Blank Electron app running on machine.

- [x] npm init + install Electron, electron-builder
- [x] main.js — basic BrowserWindow opens
- [x] Transparent always-on-top overlay window
- [x] System tray icon appears
- [x] App builds and runs with npm start
- [x] package.json scripts: start, build, dist

Deliverable: App launches, tray icon visible, empty transparent window on screen. ✅ COMPLETED

---

### Phase 1 — Floating Mascot + AI Chat (Days 1-3)
Goal: Talk to the mascot. It replies using real AI.

- [x] Placeholder mascot (animated blob with eyes, breathing, cursor gaze tracking) in overlay window
- [x] Chat input field at bottom of overlay
- [x] Alt+Space global hotkey focuses chat
- [x] ai.js — OpenRouter API integration with streaming
- [x] Model auto-selector: picks best available free model
- [x] Reply bubble appears above mascot with AI response
- [x] Long replies: truncated with "show more" expand
- [x] Mascot quick action controls & settings modal (Change Color, Settings, Open Board, Model Switcher)
- [x] First-run setup wizard: OpenRouter key + mascot color
- [x] Config saved to %APPDATA%\Goo\config.json
- [x] Mouse click-through with hit-testing & drag-to-reposition

Deliverable: Full working AI chat mascot on Windows desktop. ✅ COMPLETED

---

### Phase 2 — Board Window (Days 3-5)
Goal: Click "Open Board" and the full canvas opens.

- [x] Port web/ folder from mochiboard into ui/board/
- [x] Patch bridge.js: swap webkit.messageHandlers -> contextBridge IPC
- [x] board-manager.js: board file save/load (%APPDATA%\Goo\boards\)
- [x] Board window opens from tray menu + mascot quick button
- [x] Boards list on home screen (load existing boards)
- [x] New board creation & folders support
- [x] Board autosave (debounced disk persistence on any change)
- [x] AI chat inside board: mascot canvas engine wired to ai.askBoard
- [x] Mascot in board can: add cards, sort cards, suggest next steps (structured JSON schema)

Deliverable: Full planning canvas working on Windows with AI. ✅ COMPLETED

---

### Phase 3 — System Actions (Days 5-7)
Goal: Mascot can safely do things on the PC.

- [x] actions.js — 3-tier safety gate (GREEN, YELLOW, RED)
- [x] GREEN: Read/write clipboard
- [x] GREEN: Search files by name (fast PowerShell search)
- [x] GREEN: Open URL in default browser
- [x] GREEN: Get current time, date, day, system specs
- [x] YELLOW: Open an installed application (calc, notepad, code, chrome, paint)
- [x] YELLOW: Open a folder in Explorer (downloads, desktop, documents, custom path)
- [x] YELLOW: Read-only PowerShell (system info, processes, disk) with safety filter
- [x] AI prompt parsing: detect action intent & auto-execute via safety gate
- [x] Confirmation UI & result preview returned in speech bubble

Deliverable: Mascot can search files, open apps, read clipboard, and report system status. ✅ COMPLETED

---

### Phase 4 — Polish + Animations (Days 7-10)
Goal: App feels alive and premium.

- [x] Organic canvas animation with custom palette swatches (drop-in ready for Figma/Rive sprites)
- [x] Animation state machine in goo.js: idle / talking / thinking / happy / sleeping
- [x] Breathing animation (idle loop)
- [x] Hop animation (happy state on responses)
- [x] Cursor follow: mascot eyes and sparkles track mouse
- [x] Sleep after inactivity with animated floating Zzz particles (wakes on mouse move)
- [x] Theme color selector with live swatch switching & persistence
- [x] Speech bubble with glassmorphism, dismiss button, and expand/collapse
- [ ] Windows toast notifications
- [ ] Chat history panel (toggle, scrollable)

Deliverable: Polished, animated, personality-filled mascot. ✅ CORE COMPLETE

---

### Phase 5 — Installer + Release (Days 10-12)
Goal: One-click Windows installer anyone can run.

- [x] electron-builder NSIS installer config in package.json
- [x] App icon (.ico) generated and applied
- [x] install.ps1 for CLI option
- [x] README for repo
- [ ] Auto-updater (electron-updater)
- [ ] GitHub Releases: upload .exe

Deliverable: Shareable Windows .exe installer and documentation. ✅ COMPLETED

---

### Phase 6 — Extras & Polish
- [x] Model switcher in settings (Llama 3.3, Gemini Flash 1.5, DeepSeek R1, Qwen 2.5)
- [x] Board export as Markdown / JSON
- [x] Chat history panel (toggle, scrollable, persistent)
- [x] Windows toast notifications
- [ ] Social badges: Chrome DevTools Protocol
- [ ] Mac build (same codebase, different electron-builder target)
- [ ] Brand rename (find/replace Goo when name decided)

---

## What You Need Before We Start

| Requirement | Check |
|---|---|
| Node.js 20+ installed | run: node -v |
| Git installed | run: git -v |
| Free OpenRouter API key | openrouter.ai (free, 2 min) |
| Mascot assets | NOT needed — placeholder used in dev |
| Project name | TBD — using Goo as codename |

---

## Start Command (Phase 0)

```powershell
cd "G:\My Projects\Goo"
npm init -y
npm install --save-dev electron electron-builder
npm install openai
```

> Say "let's build" and Phase 0 starts immediately.
