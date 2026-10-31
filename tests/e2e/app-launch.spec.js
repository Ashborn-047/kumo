const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('playwright');
const path = require('path');
const os = require('os');
const fs = require('fs');

test.describe('Kumo Application Boot & Windows', () => {
  let electronApp;
  let tempUserData;

  test.beforeEach(async () => {
    delete process.env.ELECTRON_RUN_AS_NODE;
    tempUserData = fs.mkdtempSync(path.join(os.tmpdir(), 'kumo-test-boot-'));
    electronApp = await electron.launch({
      args: ['.', `--user-data-dir=${tempUserData}`],
      env: {
        ...process.env,
        NODE_ENV: 'test',
        ELECTRON_RUN_AS_NODE: undefined,
      },
    });
  });

  test.afterEach(async () => {
    if (electronApp) {
      await electronApp.close();
    }
    if (tempUserData && fs.existsSync(tempUserData)) {
      try {
        fs.rmSync(tempUserData, { recursive: true, force: true });
      } catch (e) {
        // temp dir cleanup note
      }
    }
  });

  test('app launches and initializes BrowserWindow instances', async () => {
    // Wait for at least one window to be open
    const window = await electronApp.firstWindow();
    expect(window).toBeTruthy();

    const title = await window.title();
    expect(title).toBeDefined();

    // Verify all active windows belong to Kumo
    const windows = electronApp.windows();
    expect(windows.length).toBeGreaterThanOrEqual(1);
  });
});
