# ☁️ Kumo — Implementation Blueprint: Next Phase

This document outlines the architecture, data flow, and step-by-step engineering plan for the four major features queued for Kumo:

1. **Interactive Studio & Onboarding Window**
2. **Comprehensive Electron E2E Testing Suite (Playwright for Electron)**
3. **Standalone Windows Executable (`.exe`) & Portable Distribution**
4. **Voice Support (Speech-to-Text & Text-to-Speech)**
5. **Quirky Mascot Audio, Reactions & Personality System**

---

## 1. 🎛️ Interactive Studio & Onboarding Window

### Objectives:
- On first launch (`firstRun: true`), Kumo presents a warm, centered Studio window rather than an unconfigured mascot.
- Can be reopened anytime via:
  - System Tray ➔ **"Customize Kumo…"**
  - Mascot hover bar ➔ ⚙️ **Settings**
  - Planning Canvas Header ➔ ⚙️ **Settings**
- Saving in the Studio immediately broadcasts new settings to the active Desktop Overlay and Mochiboard without restarting.

### Architecture & Files:
```
src/
├── studio-manager.js     # Manages the Studio BrowserWindow (1024x680, acrylic/frameless)
├── main.js               # IPC routers: 'studio:open', 'studio:save', 'studio:close'
└── settings.js           # %APPDATA%\Kumo\config.json
ui/
└── studio/
    └── index.html        # Unified studio & onboarding UI (from Claude/Asset Studio)
```

### IPC Bridge Contract:
```javascript
// studio-manager.js
function openStudioWindow(preloadPath) {
  if (studioWindow) { studioWindow.focus(); return; }
  studioWindow = new BrowserWindow({
    width: 1040,
    height: 700,
    minWidth: 880,
    minHeight: 600,
    frame: false,
    transparent: true,
    title: 'Kumo Studio',
    webPreferences: { preload: preloadPath, contextIsolation: true }
  });
  studioWindow.loadFile('ui/studio/index.html');
}

// Live Sync across windows on save:
ipcMain.handle('studio:save-settings', (event, newSettings) => {
  const updated = settings.save(newSettings);
  overlayManager.getOverlayWindow()?.webContents.send('kumo:settings-updated', updated);
  boardManager.getBoardWindow()?.webContents.send('kumo:settings-updated', updated);
  return { success: true, settings: updated };
});
```

---

## 2. 📦 Standalone Executable (`.exe`) & GitHub Releases Distribution

### Objectives:
- Users downloading from GitHub should **never** need to clone the repository, install Node.js, or run terminal commands.
- Provide two downloadable binary flavors under **GitHub Releases**:
  1. **`Kumo-0.1.0-Portable.exe` (Zero Installation)**:
     - Single standalone `.exe` that launches immediately from `Downloads`, Desktop, or USB drive.
     - Ideal for quick trials and portable workflows.
  2. **`Kumo-0.1.0-Setup.exe` (Standard Windows Installer)**:
     - Standard NSIS wizard installing to `%LOCALAPPDATA%\Programs\Kumo`.
     - Automatically provisions desktop shortcut and Start Menu launcher with custom Kumo cloud icon.
     - Clean uninstaller registered in Windows *Add or Remove Programs*.

### A. Production Packaging Configuration (`package.json`):
```json
{
  "scripts": {
    "start": "electron .",
    "dev": "node dev-server.js",
    "dist": "electron-builder --win nsis portable --publish=never",
    "dist:portable": "electron-builder --win portable --publish=never",
    "dist:setup": "electron-builder --win nsis --publish=never"
  },
  "build": {
    "appId": "com.kumo.app",
    "productName": "Kumo",
    "directories": {
      "output": "dist"
    },
    "win": {
      "target": [
        { "target": "nsis", "arch": ["x64"] },
        { "target": "portable", "arch": ["x64"] }
      ],
      "icon": "assets/icon.ico",
      "artifactName": "${productName}-${version}-${target}.${ext}"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "Kumo"
    },
    "files": [
      "src/**/*",
      "ui/**/*",
      "assets/**/*",
      "design-system/**/*"
    ]
  }
}
```

### B. Automated GitHub Releases CI/CD (`.github/workflows/release.yml`):
Whenever a version tag (e.g. `v0.1.0`) is pushed to GitHub, GitHub Actions compiles the Windows binaries in the cloud and automatically attaches them to the GitHub Release page:

```yaml
name: Release Kumo Binaries

on:
  push:
    tags:
      - 'v*'

jobs:
  build-and-release:
    runs-on: windows-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Automated E2E Test Suite
        run: npm test

      - name: Build Windows Executables (NSIS + Portable)
        run: npm run dist
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Publish GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          files: |
            dist/*.exe
            dist/*.blockmap
          draft: false
          prerelease: false
          generate_release_notes: true
```

### C. Release Verification Checklist:
- [ ] Run `npm run dist:portable` locally to test portable `.exe` launch.
- [ ] Run `npm run dist:setup` locally to verify NSIS installer and desktop shortcut.
- [ ] Verify `dist/Kumo-0.1.0-portable.exe` correctly starts the tray and overlay.
- [ ] Push tag `v0.1.0` to trigger the cloud release workflow.

---

## 3. 🎙️ Voice Support (STT & TTS)

### A. Speech-to-Text (STT) — User Speaks to Kumo
- **Native Web Speech API**: Electron's Chromium engine supports `webkitSpeechRecognition` out of the box with zero external dependencies.
- **Workflow**:
  1. User presses microphone icon on mascot hover or <kbd>Alt</kbd> + <kbd>V</kbd>.
  2. Mascot switches state to `listening` (ears perk up, listening sound waves appear).
  3. Spoken audio is transcribed directly into the chat input bar in real time.
  4. Silence detection automatically submits the query to OpenRouter.

### B. Text-to-Speech (TTS) — Kumo Speaks Back
- **Engine 1: SpeechSynthesis API**:
  - Uses Windows system voices (e.g. Microsoft Natural voices).
  - Configurable pitch (`1.2`) and rate (`1.05`) to give Kumo a cozy, cheerful companion voice.
- **Engine 2: Animal Crossing / Celeste Procedural Voice Synthesis**:
  - For users who prefer retro game charm over realistic speech:
  - Procedurally synthesizes cute pitch-shifted vowel formant chirps during token streaming using the HTML5 **Web Audio API** (`OscillatorNode`).
  - Zero latency, 100% offline, zero audio asset files needed.

---

## 4. 🎶 Quirky Feedback, Sound Effects & Personality

### A. Procedural Web Audio Sound Engine (`ui/overlay/audio.js`)
By using the Web Audio API, we don't need heavy `.mp3` or `.wav` files — every sound is synthesized on-the-fly with crystal-clear audio:

| Sound Trigger | Synthesis Method | Vibe |
|---|---|---|
| **Poke / Click Mascot** | Sine wave frequency bend (300Hz ➔ 600Hz) | Soft squish bubble pop |
| **Summon Chat (<kbd>Alt</kbd>+<kbd>Space</kbd>)** | Major triad chime (C5-E5-G5) | Airy, gentle sparkle |
| **Token Streaming** | Micro frequency blips (synced with text) | Friendly murmuring |
| **Action Executed (e.g. app open)** | Quick rising 2-note sweep | Affirmative "ta-da" |
| **Falling Asleep** | Gentle descending low-pass tone | Relaxing sigh / snooze |

### B. Personality Quips & Context Awareness
- **Time of Day Awareness**:
  - Late Night (12 AM - 5 AM): *"Still up coding? Don't forget to hydrate, friend ☕"*
- **Click Easter Eggs**:
  - Triple-click: Kumo does a high-spin 360-degree backflip with confetti particles.
  - Dragging too fast: Kumo's eyes widen into dizzy spirals until released!

---

## 5. 🧪 Automated End-to-End (E2E) Test Suite (Playwright for Electron)

### Objectives:
- Provide an automated quality gate verifying Kumo's multi-window desktop lifecycle without manual intervention.
- Exercise all 3 concurrent BrowserWindow contexts:
  1. **Floating Desktop Overlay** (`ui/overlay/index.html`)
  2. **Studio & Onboarding Window** (`ui/studio/index.html`)
  3. **Kumoboard Spatial Workbench** (`ui/board/index.html`)
- Assert IPC contracts across `preload.js` (`settings:*`, `board:*`, `studio:*`, `ai:*`).
- Gate all GitHub Releases so broken builds are never compiled or published.

### Test Structure (`tests/e2e/`):
```
tests/e2e/
├── app-launch.spec.js   # Verifies process boot, window instantiation, clean temp user-data-dir
├── studio.spec.js       # Verifies onboarding flow, 4 aesthetic switchers, and avatar adoption
└── board.spec.js        # Verifies Kumoboard canvas, card rendering, tool categories, zoom HUD, and settings trigger
```

### Running Tests:
```bash
# Run all E2E specs headlessly
npm test

# Run tests with UI inspector / trace
npx playwright test --ui
```

---

## 🗓️ Implementation Sequence

```
Phase A: Studio & Onboarding Window + E2E Suite (COMPLETED)
  ├── Resolve IPC contracts in src/main.js and src/studio-manager.js
  ├── Wire ui/studio/index.html avatar adoption to launch companion & board
  ├── Implement Playwright for Electron automated E2E test suite (3 specs passing)
  └── Synchronize Graphify AST knowledge graph

Phase B: Standalone Windows Executable (.exe) & GitHub Releases
  ├── Validate app icons (assets/icon.ico, assets/tray.png)
  ├── Run electron-builder for NSIS Installer (.exe) & Portable (.exe)
  └── Configure .github/workflows/release.yml with automated npm test gate

Phase C: Audio & Voice Engine
  ├── Implement Web Audio procedural sound effects (squish, chime, chatter)
  ├── Hook up SpeechRecognition for microphone voice input
  └── Add SpeechSynthesis / cute retro formant TTS
```
