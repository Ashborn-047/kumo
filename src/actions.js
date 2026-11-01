// ============================================================
// actions.js — Safety-Gated System Action Engine
// ALL system actions go through here.
// 3-tier safety system — RED tier can NEVER be overridden.
// ============================================================

const settings = require('./settings');
const systemScanner = require('./system-scanner');
const { TIER, getPreview, getManualInstructions } = require('./actions/types');
const ACTIONS = require('./actions/registry');

// ── Main dispatcher ───────────────────────────────────────────
/**
 * Run a system action through the safety gate.
 * @param {string} type   - action type from ACTIONS registry
 * @param {object} args   - action arguments
 * @param {Function} confirmFn - async fn(preview) => bool (for YELLOW)
 * @returns {object} { ok, result, error, tier }
 */
async function run(type, args = {}, confirmFn = null) {
  const action = ACTIONS[type];

  if (!action) {
    return { ok: false, error: `Unknown action: ${type}` };
  }

  // Check user-configured permissions
  const userSettings = settings.get();
  const perms = userSettings.permissions || {};

  if (type === 'app.open') {
    if (perms.appLaunch === false) {
      return { ok: false, tier: TIER.YELLOW, error: 'App launch permission is disabled in Kumoboard Security Settings.' };
    }
    // Granular per-application permission check from onboarding deep scan
    if (args && args.name) {
      const caps = systemScanner.getCapabilitiesSync();
      if (caps && caps.categories) {
        const cleanTarget = String(args.name).toLowerCase().trim();
        for (const cat of Object.keys(caps.categories)) {
          const found = caps.categories[cat].find(a =>
            a.name.toLowerCase() === cleanTarget ||
            a.id === cleanTarget ||
            (a.appId && a.appId.toLowerCase().includes(cleanTarget))
          );
          if (found && found.allowed === false) {
            return {
              ok: false,
              tier: TIER.YELLOW,
              error: `Automation for "${found.name}" has been disabled in your Kumoboard Application Permissions.`
            };
          }
        }
      }
    }
  }
  if ((type === 'clipboard.read' || type === 'clipboard.write') && perms.clipboardAccess === false) {
    return { ok: false, tier: TIER.GREEN, error: 'Clipboard permission is disabled in Kumoboard Security Settings.' };
  }
  if (type === 'powershell.read' && perms.shellSandbox === false) {
    return { ok: false, tier: TIER.YELLOW, error: 'PowerShell sandbox execution is disabled in Kumoboard Security Settings.' };
  }
  if ((type === 'file.search' || type === 'folder.open') && perms.fileSearch === false) {
    return { ok: false, tier: TIER.GREEN, error: 'File system access is disabled in Kumoboard Security Settings.' };
  }
  if ((type === 'system.info' || type === 'system.time') && perms.systemInfo === false) {
    return { ok: false, tier: TIER.GREEN, error: 'System telemetry access is disabled in Kumoboard Security Settings.' };
  }
  if (type === 'url.open' && perms.browserOpen === false) {
    return { ok: false, tier: TIER.GREEN, error: 'Browser launch is disabled in Kumoboard Security Settings.' };
  }

  // RED — refuse immediately
  if (action.tier === TIER.RED) {
    return {
      ok: false,
      tier: TIER.RED,
      error: `I can't do "${type}" — that's a manual step for safety reasons.`,
      manualInstructions: getManualInstructions(type, args),
    };
  }

  // YELLOW — ask first
  if (action.tier === TIER.YELLOW && confirmFn) {
    const preview = getPreview(type, args);
    const confirmed = await confirmFn(preview);
    if (!confirmed) {
      return { ok: false, tier: TIER.YELLOW, error: 'Cancelled by user' };
    }
  }

  // GREEN / confirmed YELLOW — execute
  try {
    const result = await action.fn(args);
    return { ok: true, tier: action.tier, result };
  } catch (err) {
    return { ok: false, tier: action.tier, error: err.message };
  }
}

module.exports = {
  run,
  TIER,
  ACTIONS,
  getPreview,
  getManualInstructions,
};
