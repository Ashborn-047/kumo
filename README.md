# 🍡 Goo / Mochiboard — Desktop Companion & Planning Canvas

> An always-on-top, animated AI companion and infinite spatial planning canvas designed specifically for Windows.

---

## ✨ Features

- **Floating Mascot Overlay**:
  - Transparent, frameless, always-on-top desktop companion.
  - Organic physics-based canvas blob with dynamic breathing, blinking, bounce, and cursor gaze tracking.
  - Interactive hit-testing (transparent areas allow normal desktop clicking; hover reveals controls).
  - Click & drag to reposition anywhere on screen.
  - Automatic sleep mode with floating `Zzz` particles during inactivity.

- **AI Chat & Streaming Bubble**:
  - Press <kbd>Alt</kbd> + <kbd>Space</kbd> anytime to summon the chat input bar or click on Goo.
  - Real-time token streaming powered by OpenRouter free models (`Llama 3.3 70B`, `Gemini Flash 1.5`, `DeepSeek R1`, `Qwen 2.5 72B`).
  - Expandable/collapsible speech bubble with conversation history tracking.

- **3-Tier Safety System**:
  - **GREEN (Silent execution)**: Read/write clipboard, fast file search across user folders, open URLs, system diagnostics.
  - **YELLOW (Confirmation preview)**: Open installed apps (Notepad, Calc, Code, Paint, Chrome), open folders in Explorer, read-only PowerShell commands.
  - **RED (Refused permanently)**: File deletion, registry modification, background installer execution.

- **Mochiboard Infinite Planning Canvas**:
  - Full spatial infinite canvas ported from Mochiboard.
  - Notes, to-dos, collections, connectors, and custom fonts.
  - Atomic JSON disk persistence in `%APPDATA%\Goo\boards\`.
  - AI Canvas Assistant (`ai.askBoard`): Ask Goo to brainstorm, organize cards, or structure thoughts on the board in real time.
  - Export boards to Markdown or JSON.

- **System Tray & Settings**:
  - Windows System Tray integration with quick shortcuts.
  - In-app glassmorphism settings panel: API key setup, live color theme swatches, and model selector.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org) v20+
- A free API key from [OpenRouter](https://openrouter.ai/keys)

### One-Click Setup (PowerShell)
```powershell
./install.ps1
```

### Manual Setup
```powershell
# 1. Install dependencies
npm install

# 2. Launch the desktop app
npm start
```

---

## ⌨️ Hotkeys & Shortcuts

| Action | Shortcut |
|---|---|
| Summon / Focus Chat | <kbd>Alt</kbd> + <kbd>Space</kbd> |
| Toggle Chat Bar | Click directly on mascot body |
| Drag Window | Click & drag mascot across screen |
| Open Mochiboard Canvas | Click 📋 icon on mascot hover |
| Open Chat History | Click 💬 icon on mascot hover |
| Open Settings Modal | Click ⚙️ icon on mascot hover |
| Dismiss Chat / Bubble | <kbd>Esc</kbd> or click background |

---

## 📦 Building Standalone Windows Installer

To build an NSIS standalone installer (`.exe`):

```powershell
npm run dist
```

The compiled installer will be generated in `dist/` ready for distribution.

---

## 📁 Project Architecture

```
Goo/
├── assets/                  # App icons, tray icons, mascot graphics
│   ├── icon.ico            # Windows application icon
│   ├── icon.png            # 32x32 app PNG icon
│   └── tray.png            # Windows system tray icon
│
├── Docs/                    # Architecture and development plans
│   ├── consolidated_build_plan.md
│   ├── mochi_mochiboard_review.md
│   └── windows_combined_plan.md
│
├── src/                     # Electron Main Process & Native Node Modules
│   ├── main.js             # Main process entry, IPC router, tray & hotkeys
│   ├── preload.js          # Security bridge (contextBridge)
│   ├── actions.js          # 3-tier safety gated system action dispatcher
│   ├── ai.js               # OpenRouter streaming client & canvas assistant
│   ├── board-manager.js    # Canvas window manager, atomic file I/O & export
│   ├── overlay-manager.js  # Floating mascot transparent window controller
│   ├── settings.js         # Configuration manager (%APPDATA%\Goo\config.json)
│   └── tray.js             # Windows system tray manager
│
├── ui/                      # Renderer Web Interfaces
│   ├── overlay/            # Desktop companion UI
│   │   ├── index.html      # Frameless overlay structure
│   │   ├── overlay.css     # Glassmorphism styling & animations
│   │   ├── goo.js          # Mascot physics, gaze tracking & states
│   │   └── chat.js         # Chat controller, history & settings
│   │
│   └── board/              # Mochiboard infinite canvas
│       ├── index.html      # Canvas viewport
│       ├── bridge.js       # Electron native bridge IPC connector
│       ├── app.js          # Infinite canvas engine
│       └── style.css       # Mochiboard styling
│
├── install.ps1              # One-click installation script
└── package.json             # Electron & build configuration
```

---

## 🔒 Safety Policy

Goo is designed with desktop safety as a first-class citizen:
- No telemetry or tracking.
- All board data remains local in `%APPDATA%\Goo\boards\`.
- All system commands pass through explicit safety filters before execution.

---

## 📄 License

MIT License. Mochiboard canvas engine ported from [Mochiboard](https://github.com/jessawolfe-ux/mochiboard).
