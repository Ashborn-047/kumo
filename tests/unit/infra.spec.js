const { test, expect } = require('@playwright/test');
const intentRouter = require('../../src/intent-router');
const actions = require('../../src/actions');
const systemScanner = require('../../src/system-scanner');

test.describe('Infrastructure: Offline Intent Router', () => {
  test('matches time query deterministically', async () => {
    const result = await intentRouter.processOffline('what is the time');
    expect(result.reply).toMatch(/⏰/);
    expect(result.actionResults.length).toBeGreaterThanOrEqual(1);
    expect(result.actionResults[0].type).toBe('system.time');
  });

  test('matches system specs query deterministically', async () => {
    const result = await intentRouter.processOffline('show system specs');
    expect(result.reply).toMatch(/💻/);
    expect(result.actionResults.length).toBeGreaterThanOrEqual(1);
    expect(result.actionResults[0].type).toBe('system.info');
  });

  test('matches Spotify launch request to action pipeline', async () => {
    // Test pattern recognition in INTENT_PATTERNS
    const text = 'hey kumo open spotify and play my favourites';
    const normalized = text.toLowerCase().trim();
    let matchedPattern = null;
    let matchedArgs = null;

    for (const { pattern, action, extract } of intentRouter.INTENT_PATTERNS) {
      const match = normalized.match(pattern);
      if (match) {
        matchedPattern = action;
        matchedArgs = extract(match);
        break;
      }
    }

    expect(matchedPattern).toBe('app.open');
    expect(matchedArgs).toBeDefined();
    expect(matchedArgs.name.toLowerCase()).toContain('spotify');
  });

  test('matches Calculator launch request', async () => {
    const text = 'open calculator please';
    const normalized = text.toLowerCase().trim();
    let matchedPattern = null;
    let matchedArgs = null;

    for (const { pattern, action, extract } of intentRouter.INTENT_PATTERNS) {
      const match = normalized.match(pattern);
      if (match) {
        matchedPattern = action;
        matchedArgs = extract(match);
        break;
      }
    }

    expect(matchedPattern).toBe('app.open');
    expect(matchedArgs.name.toLowerCase()).toContain('calc');
  });

  test('matches process kill request to YELLOW tier action', async () => {
    const text = 'kill process chrome';
    const normalized = text.toLowerCase().trim();
    let matchedPattern = null;
    let matchedArgs = null;

    for (const { pattern, action, extract } of intentRouter.INTENT_PATTERNS) {
      const match = normalized.match(pattern);
      if (match) {
        matchedPattern = action;
        matchedArgs = extract(match);
        break;
      }
    }

    expect(matchedPattern).toBe('process.kill');
    expect(matchedArgs.name).toBe('chrome');
  });
});

test.describe('Infrastructure: Action Registry & Security Gate', () => {
  test('defines core actions across safety tiers', () => {
    expect(actions.ACTIONS).toBeDefined();
    expect(actions.ACTIONS['clipboard.read']).toBeDefined();
    expect(actions.ACTIONS['system.info']).toBeDefined();
    expect(actions.ACTIONS['app.open']).toBeDefined();
    expect(actions.ACTIONS['process.kill']).toBeDefined();
  });

  test('enforces safety tier classification', () => {
    expect(actions.TIER).toBeDefined();
    expect(actions.ACTIONS['clipboard.read'].tier).toBe(actions.TIER.GREEN);
    expect(actions.ACTIONS['media.playPause'].tier).toBe(actions.TIER.GREEN);
    expect(actions.ACTIONS['app.open'].tier).toBe(actions.TIER.YELLOW);
    expect(actions.ACTIONS['app.interact'].tier).toBe(actions.TIER.YELLOW);
    expect(actions.ACTIONS['process.kill'].tier).toBe(actions.TIER.YELLOW);
    expect(actions.ACTIONS['powershell.write'].tier).toBe(actions.TIER.YELLOW);
    expect(actions.ACTIONS['file.write'].tier).toBe(actions.TIER.YELLOW);
    expect(actions.ACTIONS['file.delete'].tier).toBe(actions.TIER.RED);
    expect(actions.ACTIONS['registry.write'].tier).toBe(actions.TIER.RED);
  });

  test('generates accurate security preview messages', () => {
    const preview = actions.getPreview('process.kill', { name: 'notepad' });
    expect(preview).toContain('notepad');
    expect(preview.toLowerCase()).toContain('terminate');
  });
});

test.describe('Infrastructure: System Capability Categorization', () => {
  test('categorizes installed applications into expected domains', () => {
    expect(systemScanner.categorizeApp('Spotify')).toBe('media');
    expect(systemScanner.categorizeApp('Visual Studio Code')).toBe('development');
    expect(systemScanner.categorizeApp('Telegram Desktop')).toBe('communication');
    expect(systemScanner.categorizeApp('Microsoft Word')).toBe('productivity');
  });
});

test.describe('Infrastructure: Dual-Mode Dynamic Card Pinning', () => {
  test('creates a valid canvas card contract when pinning from mascot popout', () => {
    const popoutCard = {
      type: 'launcher',
      title: 'Spotify Media Agent',
      width: 520,
      data: { activeTab: 'apps', pinnedDomain: 'spotify', status: 'PLAYING' }
    };

    const canvasCard = {
      id: `card-pinned-${Date.now()}`,
      type: popoutCard.type,
      title: popoutCard.title,
      x: 200,
      y: 160,
      width: popoutCard.width,
      data: popoutCard.data,
      zIndex: 1,
    };

    expect(canvasCard.id).toMatch(/^card-pinned-/);
    expect(canvasCard.type).toBe('launcher');
    expect(canvasCard.width).toBe(520);
    expect(canvasCard.data.pinnedDomain).toBe('spotify');
  });
});

test.describe('Infrastructure: Execution & Security Gating', () => {
  test('blocks dangerous or destructive PowerShell commands', async () => {
    const res = await actions.run('powershell.read', { command: 'Format-Volume -DriveLetter C' });
    expect(res.ok).toBe(false);
    expect(res.error).toContain('only read-only PowerShell commands are permitted');
  });

  test('routes natural time questions and preserves actionResults', async () => {
    const res = await intentRouter.route('what time is it');
    expect(res.ok).toBe(true);
    expect(res.source).toBe('offline');
    expect(res.reply).toMatch(/⏰/);
    expect(res.actionResults).toBeDefined();
    expect(res.actionResults.length).toBeGreaterThan(0);
    expect(res.actionResults[0].type).toBe('system.time');
  });

  test('discovers capabilities profile dynamically from host system', async () => {
    const caps = await systemScanner.getCapabilities();
    expect(caps).toBeDefined();
    expect(caps.totalApps).toBeGreaterThan(0);
    expect(caps.categories).toBeDefined();
    expect(Array.isArray(caps.cliTools)).toBe(true);
  });

  test('generalizes vague, compound, and conversational offline commands', async () => {
    // Compound conversational request with typo
    const resOpen = await intentRouter.route('how about we open calcualtor and do something');
    expect(resOpen.ok).toBe(true);
    expect(resOpen.actionResults[0].type).toBe('app.open');
    expect(resOpen.actionResults[0].args.name).toBe('calc.exe');

    // Polite app closing command
    const resClose = await intentRouter.route('can you please close notepad');
    expect(resClose.ok).toBe(true);
    expect(resClose.actionResults[0].type).toBe('process.kill');
    expect(resClose.actionResults[0].args.name).toBe('notepad');

    // Audio mute command
    const resMute = await intentRouter.route('mute the volume');
    expect(resMute.ok).toBe(true);
    expect(resMute.actionResults[0].type).toBe('media.mute');

    // Mascot sleep command
    const resSleep = await intentRouter.route('sleep kumo');
    expect(resSleep.ok).toBe(true);
    expect(resSleep.actionResults[0].type).toBe('mascot.sleep');

    // Generic software alias
    const resSheets = await intentRouter.route('sheets');
    expect(resSheets.ok).toBe(true);
    expect(resSheets.actionResults[0].type).toBe('app.open');
    expect(resSheets.actionResults[0].args.name).toBe('excel');
  });
});

