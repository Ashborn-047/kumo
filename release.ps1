# ============================================================
# release.ps1 — Local Release & Publishing Automation for Kumo
# Runs local tests, updates version & notes, tags & pushes
# ============================================================

param (
    [string]$Version
)

$ErrorActionPreference = 'Stop'

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "    🚀 Kumo Local Release Publisher       " -ForegroundColor Magenta
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Read Current Version
$packageJsonPath = Join-Path $PSScriptRoot "package.json"
$pkg = Get-Content $packageJsonPath | ConvertFrom-Json
$currentVersion = $pkg.version
Write-Host "Current local version: v$currentVersion" -ForegroundColor Yellow

# 2. Determine Target Version
if (-not $Version) {
    # Calculate default next patch (e.g. 0.1.1 -> 0.1.2)
    $parts = $currentVersion.Split('.')
    if ($parts.Length -eq 3) {
        $nextPatch = "$($parts[0]).$($parts[1]).$([int]$parts[2] + 1)"
    } else {
        $nextPatch = ""
    }
    
    $promptMsg = if ($nextPatch) { "Enter target release version (Default: $nextPatch):" } else { "Enter target release version (e.g. 0.1.2):" }
    $inputVersion = Read-Host $promptMsg
    if ([string]::IsNullOrWhiteSpace($inputVersion)) {
        $Version = $nextPatch
    } else {
        $Version = $inputVersion.Trim().TrimStart('v')
    }
} else {
    $Version = $Version.Trim().TrimStart('v')
}

if (-not $Version) {
    Write-Host "❌ Error: Release version cannot be empty." -ForegroundColor Red
    exit 1
}

Write-Host "Target release version: v$Version" -ForegroundColor Green
Write-Host ""

# 3. Check RELEASE_NOTES.md
Write-Host "[1/5] Verifying release documentation..." -ForegroundColor Yellow
$notesPath = Join-Path $PSScriptRoot "RELEASE_NOTES.md"
if (-not (Test-Path $notesPath)) {
    Write-Host "❌ Error: RELEASE_NOTES.md not found!" -ForegroundColor Red
    Write-Host "   Please create and populate RELEASE_NOTES.md with this release's title and notes." -ForegroundColor Red
    exit 1
}

$notesFirstLine = (Get-Content $notesPath -TotalCount 1).Trim()
Write-Host "       Release Title: $notesFirstLine" -ForegroundColor Cyan

$confirm = Read-Host "Proceed with these release notes for v$Version? (Y/N)"
if ($confirm -notmatch '^[Yy]') {
    Write-Host "Release aborted by user. Please update RELEASE_NOTES.md and re-run." -ForegroundColor Yellow
    exit 0
}

# 4. Local Test Gate
Write-Host ""
Write-Host "[2/5] Running local unit tests gate..." -ForegroundColor Yellow
try {
    npm run test:unit
    Write-Host "       All local tests passed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Local unit tests failed. Release aborted." -ForegroundColor Red
    exit 1
}

# 5. Version Bump
Write-Host ""
Write-Host "[3/5] Updating package.json to v$Version..." -ForegroundColor Yellow
npm version $Version --no-git-tag-version | Out-Null
Write-Host "       Updated version to v$Version" -ForegroundColor Green

# 6. Git Commit & Tag
Write-Host ""
Write-Host "[4/5] Creating release commit and git tag..." -ForegroundColor Yellow
git add package.json package-lock.json RELEASE_NOTES.md src/ ui/ .github/
git commit -m "feat(release): prepare and publish Kumo v$Version"
git tag "v$Version"
Write-Host "       Created tag v$Version" -ForegroundColor Green

# 7. Push to Remote
Write-Host ""
Write-Host "[5/5] Pushing release commit and tag to GitHub..." -ForegroundColor Yellow
git push origin main
git push origin "v$Version"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  ✨ Release v$Version successfully pushed! " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "GitHub Actions is now compiling the Windows installers and publishing the release:" -ForegroundColor White
Write-Host "  https://github.com/Ashborn-047/kumo/actions" -ForegroundColor Cyan
Write-Host ""
Write-Host "View release page once build completes:" -ForegroundColor White
Write-Host "  https://github.com/Ashborn-047/kumo/releases/tag/v$Version" -ForegroundColor Yellow
Write-Host ""
