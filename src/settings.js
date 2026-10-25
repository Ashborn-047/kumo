// ============================================================
// settings.js — Config Read/Write
// Stores user preferences in %APPDATA%\Kumo\config.json
// ============================================================

const { app } = require('electron');
const path = require('path');
const fs   = require('fs');

const CONFIG_PATH = path.join(app.getPath('userData'), 'config.json');

const DEFAULTS = {
  apiKey:          '',
  color:           '#baa0ff',
  model:           'meta-llama/llama-3.3-70b-instruct:free',
  overlayX:        null,
  overlayY:        null,
  socialBadges:    [],
  firstRun:        true,
  userName:        '',
  companionName:   'Kumo',
  autostart:       false,
  startMinimized:  false,
  studioTheme:     'light',
  permissions: {
    appLaunch:         true,
    clipboardAccess:   true,
    shellSandbox:      true,
    fileSearch:        true,
    systemInfo:        true,
    browserOpen:       true,
    autoConfirmYellow: false,
  },
};

function get() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

function save(data) {
  const current = get();
  const updated = { ...current, ...data };
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH + '.tmp', JSON.stringify(updated, null, 2));
  fs.renameSync(CONFIG_PATH + '.tmp', CONFIG_PATH);
  return updated;
}

function isFirstRun() {
  return get().firstRun === true;
}

function completeFirstRun() {
  return save({ firstRun: false });
}

module.exports = { get, save, isFirstRun, completeFirstRun, DEFAULTS };
