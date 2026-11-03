# Kumo v0.1.1: Live In-App Auto-Updates & Differential Patches

**Release Version:** `v0.1.1`  
**Published Date:** November 3, 2026  
**Target Platform:** Windows 10 / 11 (64-bit)  
**Release Tag:** [`v0.1.1`](https://github.com/Ashborn-047/kumo/releases/tag/v0.1.1)

---

## Overview

Kumo **v0.1.1** introduces a full in-app auto-updating pipeline, differential delta downloading, and in-canvas notification banners. Moving forward, users who have installed Kumo will receive updates, bug fixes, and feature patches silently in the background without needing to manually re-download installers from the web.

---

## Key Highlights & What's New

### 1. Differential Background Auto-Updates
- **Powered by `electron-updater`**: Automatically queries GitHub Releases metadata (`latest.yml`) on launch and periodically every 4 hours.
- **Differential Delta Downloads**: Instead of downloading the full application installer on each update, Kumo utilizes binary blockmaps (`.blockmap`) to download only the modified code blocks, drastically saving bandwidth and reducing update times.
- **Fast Startup Optimization**: Initial update checks are staggered by 15 seconds after app boot so canvas cold-starts remain instant and unhindered.

### 2. Glassmorphic In-Canvas Update Banner
- **Discreet Floating Notification**: Integrated directly into the Kumoboard canvas (`ui/board/js/updater-ui.js`).
- **Live Download Progress**: Displays a non-intrusive progress bar showing download percentage while you continue working.
- **One-Click Restart to Apply**: Once the update is verified and staged, an interactive **Restart Now** action replaces files seamlessly upon restart.
- **Session Dismissal**: Easily dismiss the notification if you are in the middle of a focused canvas session.

### 3. Dedicated Portable Build Detection
- **Smart Architecture Detection**: Windows locks the executing `.exe` of running portable apps, preventing direct file replacement.
- **One-Click Direct Fetch**: Portable users automatically receive a targeted in-app notification with a direct link to download the latest portable executable.

### 4. Zero Data Loss Guarantee
- All user boards, pinned cards, quick notes, and settings stored in `%APPDATA%\Kumo` are isolated from application binaries and remain 100% untouched across all updates.

### 5. Hardened IPC Security Architecture
- Context-isolated security bridge in [`src/preload.js`](src/preload.js) exposing safe updater channels (`updater:get-status`, `updater:check`, `updater:quit-and-install`).
- Unit tested under Playwright test suite (`tests/unit/updater.spec.js`).

---

## Downloads & Installation Assets

| Asset | Type | Size | Description |
| :--- | :--- | :--- | :--- |
| [**Kumo-Setup-0.1.1.exe**](https://github.com/Ashborn-047/kumo/releases/download/v0.1.1/Kumo-Setup-0.1.1.exe) | Windows Installer | ~76.8 MB | **Recommended**. Installs shortcuts and enables automatic background updates. |
| [**Kumo-0.1.1-portable.exe**](https://github.com/Ashborn-047/kumo/releases/download/v0.1.1/Kumo-0.1.1-portable.exe) | Standalone Portable | ~76.6 MB | Zero install required. Run directly from any folder or removable drive. |
| [**latest.yml**](https://github.com/Ashborn-047/kumo/releases/download/v0.1.1/latest.yml) | Checksum Feed | 336 B | Update feed metadata & SHA-512 signatures for `electron-updater`. |
| [**Kumo-Setup-0.1.1.exe.blockmap**](https://github.com/Ashborn-047/kumo/releases/download/v0.1.1/Kumo-Setup-0.1.1.exe.blockmap) | Delta Blockmap | 83.2 KB | Binary differential map for bandwidth-saving auto-updates. |

---

## How Upgrading Works for Existing Users

1. **If you installed Kumo v0.1.0 (Setup Installer)**:
   - You can download and run `Kumo-Setup-0.1.1.exe` once to upgrade to v0.1.1.
   - All subsequent versions (v0.1.2+) will update automatically through the in-app notification banner!
2. **If you are running the Portable build**:
   - Download `Kumo-0.1.1-portable.exe` and replace your older portable executable.

---

## Verification & Integrity

All release assets are built directly on clean Windows runners via GitHub Actions:
- **Build Workflow:** [Release Kumo Binaries #41582754928](https://github.com/Ashborn-047/kumo/actions/runs/41582754928)
- **Git Commit:** [`5ed0324`](https://github.com/Ashborn-047/kumo/commit/5ed0324fec5fab8018fe097834b3e6b7e6d9a8d7)
- **Tag:** [`v0.1.1`](https://github.com/Ashborn-047/kumo/releases/tag/v0.1.1)
