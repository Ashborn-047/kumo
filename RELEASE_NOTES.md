# Kumo v0.1.1: Live In-App Auto-Updates & Differential Patches

### What's New in this Release?
This release introduces native in-app auto-updating and differential patch delivery, ensuring all Kumo users receive future improvements and bug fixes seamlessly in the background without needing to manually re-download installers.

### Key Highlights
- **Seamless Background Auto-Updates**: Powered by `electron-updater`. Future updates and patches download automatically in the background using differential binary deltas to save bandwidth.
- **In-App Glassmorphic Update Banner**: A discreet, beautiful floating notification pill in the bottom-right of the Kumoboard canvas shows download progress and prompts when an update is ready.
- **One-Click Restart to Apply**: Instant hot-swap installation upon restart without disrupting your workflow.
- **Zero Data Loss Guarantee**: All user canvases, sticky notes, boards, and settings stored in `%APPDATA%/Kumo` remain 100% intact across all updates.
- **Portable Build Support**: Portable users receive an in-app notice with a direct link to fetch the latest portable executable.
- **Hardened IPC Security**: Strict `contextBridge` integration in `preload.js` ensuring secure main-renderer communication.

### Installation & Downloads
- **Setup Installer (`Kumo-Setup-0.1.1.exe`)**: Recommended for all Windows users. Full auto-update support enabled.
- **Portable Version (`Kumo-0.1.1-portable.exe`)**: Zero installation required. Download and run directly.

---
*Built with Electron 31, Node.js 20, and Playwright on Windows x64.*
