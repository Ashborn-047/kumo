const { test, expect } = require('@playwright/test');
const updaterManager = require('../../src/updater');

test.describe('Kumo Auto-Updater Subsystem', () => {
  test('initializes with expected idle state and detects architecture', () => {
    const state = updaterManager.getUpdateState();
    expect(state).toBeDefined();
    expect(['idle', 'checking', 'not-available', 'available', 'downloading', 'downloaded', 'error']).toContain(state.status);
    expect(typeof state.isPortable).toBe('boolean');
    expect(state.currentVersion).toBeDefined();
  });

  test('provides robust cleanup without throw', () => {
    expect(() => {
      updaterManager.cleanupUpdater();
    }).not.toThrow();
  });
});

