# ============================================================
# release.ps1 — Local Release & Publishing Automation for Kumo
# Runs local tests, updates version, tags with notes & pushes
# ============================================================

param (
    [string]$Version,
    [string]$Title,
    [switch]$SkipTests
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
Write-Host "Current version: v$currentVersion" -ForegroundColor Yellow

# 2. Determine Target Version
if (-not $Version) {
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

# 3. Prepare Dynamic Release Notes from Template
$notesPath = Join-Path $PSScriptRoot "RELEASE_NOTES.md"
$templatePath = Join-Path $PSScriptRoot "RELEASE_TEMPLATE.md"

if (-not (Test-Path $notesPath)) {
    if (Test-Path $templatePath) {
        $rawTemplate = Get-Content $templatePath -Raw
        $releaseTitle = if ($Title) { $Title } else { "Update & Improvements" }
        $dynamicNotes = $rawTemplate -replace '__VERSION__', $Version -replace '__TITLE__', $releaseTitle
        Set-Content -Path $notesPath -Value $dynamicNotes -Encoding utf8
        Write-Host "Created local dynamic notes draft from template: RELEASE_NOTES.md" -ForegroundColor Cyan
    } else {
        Set-Content -Path $notesPath -Value "# Kumo v$Version`n`nAutomatic release update." -Encoding utf8
    }
}

$notesFirstLine = (Get-Content $notesPath -TotalCount 1).Trim()
Write-Host "Release Title: $notesFirstLine" -ForegroundColor Cyan
Write-Host ""

$confirm = Read-Host "Proceed with these release notes for v$Version? (Y/N)"
if ($confirm -notmatch '^[Yy]') {
    Write-Host "Release cancelled. You can edit RELEASE_NOTES.md locally and run this again." -ForegroundColor Yellow
    exit 0
}

# 4. Local Unit Tests Gate
if (-not $SkipTests) {
    Write-Host ""
    Write-Host "[1/4] Running local unit tests gate..." -ForegroundColor Yellow
    try {
        npm run test:unit
        Write-Host "       All local tests passed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error: Local unit tests failed. Release aborted." -ForegroundColor Red
        exit 1
    }
}

# 5. Version Bump
Write-Host ""
Write-Host "[2/4] Updating package.json to v$Version..." -ForegroundColor Yellow
npm version $Version --no-git-tag-version | Out-Null
Write-Host "       Updated version to v$Version" -ForegroundColor Green

# 6. Commit & Annotated Tag
Write-Host ""
Write-Host "[3/4] Committing and creating annotated git tag..." -ForegroundColor Yellow
git add package.json package-lock.json
git commit -m "feat(release): prepare and publish Kumo v$Version"

# Embed full release notes into the annotated tag object
git tag -a "v$Version" -F "$notesPath"
Write-Host "       Created annotated git tag v$Version" -ForegroundColor Green

# Clean up temporary local RELEASE_NOTES.md
if (Test-Path $notesPath) {
    Remove-Item $notesPath -Force
}

# 7. Push to Remote
Write-Host ""
Write-Host "[4/4] Pushing release commit and tag to GitHub..." -ForegroundColor Yellow
git push origin main
git push origin "v$Version"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  ✨ Release v$Version successfully pushed! " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "GitHub Actions will extract the notes from your tag and publish:" -ForegroundColor White
Write-Host "  https://github.com/Ashborn-047/kumo/releases/tag/v$Version" -ForegroundColor Yellow
Write-Host ""
