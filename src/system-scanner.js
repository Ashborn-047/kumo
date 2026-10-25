// ============================================================
// system-scanner.js — Deep Capability & Permission Profiler
// Performs dynamic introspection on any user's machine at
// onboarding or on-demand. Categorizes apps, determines
// assist capabilities, and generates granular permission profiles.
// ============================================================

const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const electron = require('electron');

const app = electron?.app;
const userDataDir = app ? app.getPath('userData') : path.join(process.env.APPDATA || os.homedir(), 'Kumo');
const CAPABILITIES_CACHE_PATH = path.join(userDataDir, 'capabilities.json');

// ── Application Classification Taxonomy ──────────────────────
const APP_TAXONOMY = [
  {
    category: 'media',
    label: 'Media & Entertainment',
    defaultTier: 'green',
    match: /spotify|netflix|prime\s*video|crunchyroll|vlc|media\s*player|music|video|youtube|zune/i,
    permissions: ['appLaunch'],
    capabilities: ['Launch & switch', 'Interactive playback control', 'Playlist & search shortcuts'],
  },
  {
    category: 'communication',
    label: 'Communication & Messaging',
    defaultTier: 'yellow',
    match: /telegram|whatsapp|discord|slack|skype|teams|outlook|zoom|signal|wechat/i,
    permissions: ['appLaunch', 'clipboardAccess'],
    capabilities: ['Open chats & channels', 'Draft formatted text via clipboard', 'Meeting shortcuts'],
  },
  {
    category: 'productivity',
    label: 'Office & Productivity',
    defaultTier: 'yellow',
    match: /word|excel|powerpoint|powerpnt|onenote|notepad|wordpad|sticky\s*notes|acrobat|calc|calculator|clock|calendar/i,
    permissions: ['appLaunch', 'fileSearch'],
    capabilities: ['Open documents & sheets', 'Template scaffolding', 'Quick notes & calculation lookups'],
  },
  {
    category: 'development',
    label: 'Developer & Engineering',
    defaultTier: 'yellow',
    match: /code|cursor|git|docker|node|npm|python|wsl|terminal|powershell|cmd|devtoys|blender|database|postman/i,
    permissions: ['appLaunch', 'shellSandbox', 'fileSearch'],
    capabilities: ['Launch project workspaces', 'Read-only git & container diagnostics', 'Command automation'],
  },
  {
    category: 'creative',
    label: 'Creative & Design',
    defaultTier: 'yellow',
    match: /blender|paint|paint\s*3d|photoshop|illustrator|premiere|figma|gimp|inkscape|avro/i,
    permissions: ['appLaunch'],
    capabilities: ['Open asset projects', 'Canvas helper launch', 'Render / design workspace opener'],
  },
  {
    category: 'system',
    label: 'System & Utilities',
    defaultTier: 'yellow',
    match: /settings|control|taskmgr|task\s*manager|winrar|7-zip|snipping|snip|explorer|backup|security/i,
    permissions: ['appLaunch', 'systemInfo'],
    capabilities: ['Open system configuration', 'Screenshot & capture tools', 'Hardware & process diagnostics'],
  },
];

function categorizeApp(name) {
  if (!name || typeof name !== 'string') return 'other';
  for (const tax of APP_TAXONOMY) {
    if (tax.match.test(name)) return tax.category;
  }
  return 'other';
}

const DEV_BINARIES = ['node', 'npm', 'npx', 'git', 'python', 'docker', 'code', 'cursor', 'wsl', 'wt', 'ssh'];

/**
 * Scan the user's host system via non-blocking PowerShell queries.
 * @returns {Promise<Object>} Categorized capabilities and permission profile
 */
async function scanSystem() {
  return new Promise((resolve) => {
    // Phase 1: Query Get-StartApps (Win32 + UWP)
    const psScript = `
      $apps = Get-StartApps | Select-Object -Property Name, AppID
      $tools = @{}
      $cliList = @(${DEV_BINARIES.map(b => `'${b}'`).join(',')})
      foreach ($c in $cliList) {
        $cmd = Get-Command $c -ErrorAction SilentlyContinue
        if ($cmd) { $tools[$c] = $cmd.Source }
      }
      @{ apps = $apps; cli = $tools } | ConvertTo-Json -Depth 3 -Compress
    `;

    execFile('powershell.exe', ['-NoProfile', '-Command', psScript], { timeout: 12000 }, (err, stdout) => {
      let rawApps = [];
      let rawCli = {};

      if (!err && stdout) {
        try {
          const parsed = JSON.parse(stdout);
          rawApps = parsed.apps || [];
          rawCli = parsed.cli || {};
        } catch (e) {
          console.warn('[system-scanner] Parse error:', e.message);
        }
      }

      const profile = buildCapabilityProfile(rawApps, rawCli);
      saveCapabilitiesCache(profile);
      resolve(profile);
    });
  });
}

/**
 * Categorize apps and assign permission recommendations.
 */
function buildCapabilityProfile(rawApps, rawCli) {
  const categorized = {
    media: [],
    communication: [],
    productivity: [],
    development: [],
    creative: [],
    system: [],
    other: [],
  };

  const seen = new Set();

  for (const app of rawApps) {
    const name = (app.Name || '').trim();
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());

    // Skip pure uninstallers or manuals
    if (/uninstall|manual|help|readme|documentation|license/i.test(name)) continue;

    let matchedCategory = null;
    for (const tax of APP_TAXONOMY) {
      if (tax.match.test(name)) {
        matchedCategory = tax;
        break;
      }
    }

    const categoryKey = matchedCategory ? matchedCategory.category : 'other';
    const item = {
      id: generateAppId(name),
      name,
      appId: app.AppID || name,
      category: categoryKey,
      categoryLabel: matchedCategory ? matchedCategory.label : 'General Applications',
      tier: matchedCategory ? matchedCategory.defaultTier : 'yellow',
      capabilities: matchedCategory ? matchedCategory.capabilities : ['Launch application'],
      requiredPermissions: matchedCategory ? matchedCategory.permissions : ['appLaunch'],
      allowed: true, // Default enabled
      customNotes: `Auto-discovered on host machine`,
    };

    if (categorized[categoryKey]) {
      categorized[categoryKey].push(item);
    } else {
      categorized.other.push(item);
    }
  }

  // Developer toolchain CLI entries
  const cliEntries = Object.entries(rawCli).map(([cmd, binaryPath]) => ({
    command: cmd,
    path: binaryPath,
    category: 'development',
    tier: 'yellow',
    capabilities: [`Execute sandboxed ${cmd} tasks`, 'Query runtime version and environment'],
    allowed: true,
  }));

  const totalDiscovered = Object.values(categorized).reduce((sum, list) => sum + list.length, 0);

  return {
    scannedAt: new Date().toISOString(),
    host: {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      totalMemGB: Math.round(os.totalmem() / 1024 / 1024 / 1024),
      cpus: os.cpus().length,
    },
    totalApps: totalDiscovered,
    cliTools: cliEntries,
    categories: categorized,
  };
}

function generateAppId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Load cached capabilities or run scan if absent.
 */
async function getCapabilities(forceRefresh = false) {
  if (!forceRefresh && fs.existsSync(CAPABILITIES_CACHE_PATH)) {
    try {
      const raw = fs.readFileSync(CAPABILITIES_CACHE_PATH, 'utf8');
      return JSON.parse(raw);
    } catch {}
  }
  return await scanSystem();
}

/**
 * Update an app's permission toggle in cache.
 */
function updateAppPermission(appId, allowed) {
  try {
    const caps = getCapabilitiesSync();
    if (!caps) return false;

    let found = false;
    for (const key of Object.keys(caps.categories || {})) {
      for (const item of caps.categories[key]) {
        if (item.id === appId) {
          item.allowed = Boolean(allowed);
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (found) {
      saveCapabilitiesCache(caps);
      return true;
    }
  } catch (err) {
    console.warn('[system-scanner] updateAppPermission failed:', err.message);
  }
  return false;
}

function getCapabilitiesSync() {
  try {
    if (fs.existsSync(CAPABILITIES_CACHE_PATH)) {
      return JSON.parse(fs.readFileSync(CAPABILITIES_CACHE_PATH, 'utf8'));
    }
  } catch {}
  return null;
}

function saveCapabilitiesCache(profile) {
  try {
    fs.mkdirSync(path.dirname(CAPABILITIES_CACHE_PATH), { recursive: true });
    fs.writeFileSync(CAPABILITIES_CACHE_PATH, JSON.stringify(profile, null, 2), 'utf8');
  } catch (e) {
    console.warn('[system-scanner] Cache write failed:', e.message);
  }
}

module.exports = {
  scanSystem,
  getCapabilities,
  updateAppPermission,
  getCapabilitiesSync,
  categorizeApp,
  APP_TAXONOMY,
};
