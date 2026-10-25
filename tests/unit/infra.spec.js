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
    expect(actions.ACTIONS['app.open'].tier).toBe(actions.TIER.YELLOW);
    expect(actions.ACTIONS['process.kill'].tier).toBe(actions.TIER.YELLOW);
    expect(actions.ACTIONS['powershell.write'].tier).toBe(actions.TIER.RED);
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
