# ============================================================
# install.ps1 — One-Click Setup & Installer for Goo / Mochi
# ============================================================

$ErrorActionPreference = 'Stop'

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✨ Welcome to Goo Desktop Companion!  " -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Node.js
Write-Host "[1/4] Checking Node.js runtime..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    Write-Host "       Found Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js is required but not installed." -ForegroundColor Red
    Write-Host "   Please download Node.js 20+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# 2. Check npm
try {
    $npmVersion = npm -v
    Write-Host "       Found npm $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: npm is not available." -ForegroundColor Red
    exit 1
}

# 3. Install Dependencies
Write-Host ""
Write-Host "[2/4] Installing application dependencies..." -ForegroundColor Yellow
npm install --no-audit --prefer-offline
Write-Host "       Dependencies installed successfully." -ForegroundColor Green

# 4. Approve Electron scripts
Write-Host ""
Write-Host "[3/4] Initializing Electron engine..." -ForegroundColor Yellow
try {
    npm approve-scripts electron 2>$null
} catch {}
Write-Host "       Electron environment ready." -ForegroundColor Green

# 5. Launch Option
Write-Host ""
Write-Host "[4/4] Installation complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "To launch Goo now, type:" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor Yellow
Write-Host ""
Write-Host "To package a Windows installer (.exe):" -ForegroundColor White
Write-Host "  npm run dist" -ForegroundColor Yellow
Write-Host ""

$choice = Read-Host "Would you like to launch Goo now? (Y/N)"
if ($choice -match '^[Yy]') {
    Write-Host "Launching Goo..." -ForegroundColor Magenta
    Start-Process -FilePath "npx" -ArgumentList "electron", "." -WorkingDirectory $PSScriptRoot
}
