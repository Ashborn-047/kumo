# Security Policy

## Supported Versions

We provide security updates and bug fixes for the following versions of Kumo:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | Yes                |
| < 0.1.0 | No                 |

---

## Reporting a Vulnerability

We take the security and integrity of Kumo seriously. If you discover a security vulnerability, please report it responsibly so that it can be investigated and resolved before public disclosure.

### How to Report

Please do **NOT** report security vulnerabilities through public GitHub issues.

Instead, please report security vulnerabilities privately using GitHub's built-in tool:
- **GitHub Private Vulnerability Reporting**: [Open a Security Advisory](https://github.com/Ashborn-047/kumo/security/advisories/new)
- **Direct Maintainer Contact**: [@Ashborn-047 on GitHub](https://github.com/Ashborn-047)

Include the following details in your report:
1. Type of issue (e.g. IPC channel exposure, arbitrary command execution, path traversal).
2. Step-by-step instructions or proof-of-concept to reproduce the vulnerability.
3. Affected components (`src/actions.js`, `src/preload.js`, Electron IPC bridge, etc.).
4. Potential impact and severity assessment.

### Response Timeline

- **Initial Acknowledgment**: Within 48 hours of report receipt.
- **Triage & Assessment**: Within 5 business days.
- **Fix & Disclosure**: Coordinated release schedule with credit given in the release notes (unless anonymity is requested).

---

## Security Model & Protective Architecture

Kumo is built to operate safely as a desktop AI companion with access to system tools:

### 1. 3-Tier Execution Safety Gate (`src/actions.js`)
All autonomous actions proposed by AI models must pass through the execution gate:
- **GREEN**: Safe, read-only system inspection (clipboard read, scoped user directory search).
- **YELLOW**: User confirmation required (application launching, folder navigation in Explorer).
- **RED**: Hard-blocked (destructive file operations, disk modifications, registry manipulation).

### 2. Electron Process Hardening
- **Context Isolation**: `contextIsolation: true` is strictly enforced on all `BrowserWindow` instances.
- **Node Integration Disabled**: `nodeIntegration: false` prevents renderer execution of native Node.js APIs.
- **Preload Sandboxing**: Typed IPC endpoints expose only explicit, sanitized methods through `contextBridge`.

### 3. Local-First Data Privacy
- All boards, settings, and clipboard staging caches are stored exclusively on the user's local disk (`%APPDATA%\Kumo`).
- Zero telemetry, analytics tracking, or external data collection.
- Network requests are restricted to user-configured AI inference endpoints (OpenRouter).

