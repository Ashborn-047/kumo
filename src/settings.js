// ============================================================
// settings.js — Config Read/Write
// Stores user preferences in %APPDATA%\Goo\config.json
// ============================================================

const { app } = require('electron');
const path = require('path');
const fs   = require('fs');

const CONFIG_PATH = path.join(app.getPath('userData'), 'config.json');

const DEFAULTS = {
  apiKey:       '',
  color:        '#baa0ff',   // default pastel purple
  model:        'meta-llama/llama-3.3-70b-instruct:free',
  overlayX:     null,        // null = auto position (bottom-right)
  overlayY:     null,
  socialBadges: [],          // e.g. ['instagram', 'linkedin']
  firstRun:     true,
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
  save({ firstRun: false });
}

module.exports = { get, save, isFirstRun, completeFirstRun, DEFAULTS };
