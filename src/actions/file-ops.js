// ============================================================
// src/actions/file-ops.js — Clipboard, Filesystem, & URLs
// ============================================================

const electron = require('electron');
const shell = electron?.shell || {
  openExternal: (url) => { require('child_process').exec(`start "" "${url}"`); return Promise.resolve(true); },
  openPath: (p) => { require('child_process').exec(`explorer "${p}"`); return Promise.resolve(''); }
};
const clipboard = electron?.clipboard || {
  readText: () => '',
  writeText: () => {}
};
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

function readClipboard() {
  return { text: clipboard.readText() };
}

function writeClipboard({ text }) {
  clipboard.writeText(text);
  return { written: true };
}

function openUrl({ url }) {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error('Only http/https URLs allowed');
  }
  shell.openExternal(url);
  return { opened: url };
}

function searchFiles({ query, directory }) {
  const cleanQuery = String(query).replace(/['"`;$()]/g, '').trim();
  if (!cleanQuery) return Promise.resolve({ results: [] });

  return new Promise((resolve) => {
    // Quick search across Desktop, Downloads, and Documents
    const searchRoots = directory
      ? [`'${directory}'`]
      : [`'${path.join(os.homedir(), 'Desktop')}'`, `'${path.join(os.homedir(), 'Downloads')}'`, `'${path.join(os.homedir(), 'Documents')}'`];

    const psCmd = `Get-ChildItem -Path ${searchRoots.join(',')} -Filter '*${cleanQuery}*' -Recurse -Depth 3 -ErrorAction SilentlyContinue | Select-Object -First 10 -ExpandProperty FullName`;
    exec(`powershell -NoProfile -Command "${psCmd}"`, { timeout: 4500 }, (err, stdout) => {
      if (err || !stdout) return resolve({ results: [] });
      const paths = stdout.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      resolve({ results: paths });
    });
  });
}

function openFolder({ folderPath }) {
  const commonFolders = {
    desktop: path.join(os.homedir(), 'Desktop'),
    downloads: path.join(os.homedir(), 'Downloads'),
    documents: path.join(os.homedir(), 'Documents'),
    pictures: path.join(os.homedir(), 'Pictures'),
    home: os.homedir(),
    boards: path.join(os.homedir(), 'AppData', 'Roaming', 'Goo', 'boards'),
  };

  const key = String(folderPath).toLowerCase().trim();
  const resolved = commonFolders[key] || folderPath;

  return shell.openPath(resolved).then((err) => {
    if (err) throw new Error(`Could not open folder: ${resolved}`);
    return { opened: resolved };
  });
}

function writeFileContent({ filePath, fileName, content }) {
  if (content === undefined || content === null) {
    return Promise.reject(new Error('No content provided to write'));
  }

  let targetPath = filePath;

  if (!targetPath) {
    const notesDir = path.join(os.homedir(), 'Desktop', 'Kumo_Notes');
    if (!fs.existsSync(notesDir)) fs.mkdirSync(notesDir, { recursive: true });
    const cleanFileName = (fileName || `note_${Date.now()}`).replace(/[\\/:*?"<>|]/g, '_');
    targetPath = path.join(notesDir, cleanFileName.endsWith('.txt') || cleanFileName.endsWith('.md') ? cleanFileName : `${cleanFileName}.txt`);
  }

  const blocked = ['C:\\Windows', 'C:\\Program Files', 'C:\\Program Files (x86)'];
  if (blocked.some(b => targetPath.toLowerCase().startsWith(b.toLowerCase()))) {
    return Promise.reject(new Error('Writing to system directories is blocked for safety'));
  }

  try {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, content, 'utf8');
    return Promise.resolve({ written: true, path: targetPath, bytes: Buffer.byteLength(content, 'utf8') });
  } catch (err) {
    return Promise.reject(err);
  }
}

function moveFile({ from, to }) {
  // Disallow moving out of or into Windows system directories
  const blockedPaths = ['C:\\Windows', 'C:\\Program Files', 'C:\\Program Files (x86)'];
  if (blockedPaths.some(p => from.startsWith(p) || to.startsWith(p))) {
    throw new Error('Moving system files is blocked');
  }

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(from)) return reject(new Error(`Source file does not exist: ${from}`));
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.rename(from, to, (err) => {
      if (err) reject(err);
      else resolve({ moved: true, from, to });
    });
  });
}

module.exports = {
  readClipboard,
  writeClipboard,
  openUrl,
  searchFiles,
  openFolder,
  writeFileContent,
  moveFile,
  shell,
};

