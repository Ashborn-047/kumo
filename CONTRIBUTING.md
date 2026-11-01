# Contributing to Kumo

Thank you for your interest in contributing to Kumo. This guide outlines how to set up your environment, contribute code, and submit pull requests.

---

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Setup](#local-setup)
- [Architecture & Coding Standards](#architecture--coding-standards)
  - [Zero-Emoji Policy](#zero-emoji-policy)
  - [Vanilla JavaScript & Architecture](#vanilla-javascript--architecture)
  - [Electron Hardening](#electron-hardening)
- [Development Workflow](#development-workflow)
  - [Running Tests](#running-tests)
  - [Syntax Verification](#syntax-verification)
- [Submitting Changes](#submitting-changes)
  - [Branch Naming](#branch-naming)
  - [Commit Conventions](#commit-conventions)
  - [Pull Request Checklist](#pull-request-checklist)
- [Community & Reporting Issues](#community--reporting-issues)

---

## Code of Conduct

All contributors and participants are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

---

## Getting Started

### Prerequisites
- **Operating System**: Windows 10 or 11 (64-bit)
- **Node.js**: v20.0.0 or higher
- **Git**: Installed and configured on your machine

### Local Setup

1. Fork the repository on GitHub: `https://github.com/Ashborn-047/kumo`
2. Clone your fork locally:
   ```powershell
   git clone https://github.com/<your-username>/kumo.git
   cd kumo
   ```
3. Install dependencies:
   ```powershell
   npm install
   ```
4. Start the application:
   ```powershell
   npm start
   ```

---

## Architecture & Coding Standards

### Zero-Emoji Policy
The Kumo codebase adheres to a strict **zero-emoji** rule across:
- All source code, HTML, CSS, and SVG markup.
- UI labels, placeholders, titles, and tooltips.
- Git commit messages and pull request descriptions.
- Documentation and code comments.

Use Lucide SVG stroke icons, Material Symbols, or clean typography instead.

### Vanilla JavaScript & Architecture
- **Language**: Modern ES2022+ without transpile layers.
- **Styling**: Tailwind CSS utility classes paired with scoped CSS modules.
- **Modularity**: Components live under dedicated folders (`src/` for Node.js main process, `ui/` for renderer processes).
- **Communication**: Renderers communicate with the main process strictly via typed IPC channels defined in `src/preload.js`. Never expose raw Node.js modules to the renderer.

### Electron Hardening
All `BrowserWindow` configurations must strictly preserve:
- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: false` (only for preload scripts requiring Node APIs)

---

## Development Workflow

### Running Tests

Before submitting any code, verify that all test suites pass locally:

```powershell
# Run Infrastructure Unit Tests
npm run test:unit

# Run Playwright Electron E2E Tests
npm run test:e2e
```

### Syntax Verification

Run Node syntax checks on all main process files:

```powershell
node -c src/main.js src/preload.js src/actions.js src/ai.js src/intent-router.js src/system-scanner.js src/settings.js src/overlay-manager.js src/board-manager.js src/studio-manager.js src/amp-manager.js src/tray.js src/island.js src/clipboard-watcher.js src/media-sync.js
```

---

## Submitting Changes

### Branch Naming
Create a focused feature branch from `main`:
- `feat/island-feature-name`
- `fix/clipboard-lock-issue`
- `docs/update-guide`
- `refactor/audio-sync`

### Commit Conventions
Follow the Conventional Commits specification:
- `feat(...)`: A new user-facing feature
- `fix(...)`: A bug fix
- `docs(...)`: Documentation updates
- `refactor(...)`: Code changes that neither fix a bug nor add a feature
- `test(...)`: Adding or correcting tests
- `chore(...)`: Build process or tooling changes

Example:
```
feat(island): add compact icon dock navigation
fix(clipboard): resolve mutex lock contention during screen capture
```

### Pull Request Checklist
- [ ] Code follows project architecture and adheres to the zero-emoji policy.
- [ ] Syntax check passes (`node -c`).
- [ ] Unit tests and Playwright E2E tests pass.
- [ ] Documentation updated if features or APIs changed.
- [ ] Clean commit history with conventional commit messages.

---

## Community & Reporting Issues

- **Bug Reports**: Open an issue on GitHub with reproduction steps, OS version, and console logs.
- **Feature Requests**: Open an issue describing the problem, proposed solution, and alternative designs.
- **Security Vulnerabilities**: Follow our [Security Policy](SECURITY.md) to report sensitive issues privately.

