const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('playwright');
const path = require('path');
const os = require('os');
const fs = require('fs');

test.describe('Kumo Studio & Onboarding Window', () => {
  let electronApp;
  let tempUserData;

  test.beforeEach(async () => {
    tempUserData = fs.mkdtempSync(path.join(os.tmpdir(), 'kumo-test-studio-'));
    electronApp = await electron.launch({
      args: ['.', `--user-data-dir=${tempUserData}`],
      env: {
        ...process.env,
        NODE_ENV: 'test',
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

  test('opens studio onboarding window and switches aesthetics', async () => {
    // Find the studio window
    let studioPage = null;
    const maxWaitMs = 10000;
    const start = Date.now();

    while (!studioPage && Date.now() - start < maxWaitMs) {
      const windows = electronApp.windows();
      for (const win of windows) {
        const url = win.url();
        if (url.includes('ui/studio/index.html')) {
          studioPage = win;
          break;
        }
      }
      if (!studioPage) {
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    expect(studioPage).not.toBeNull();
    await studioPage.waitForLoadState('domcontentloaded');

    // Verify Stitch Studio brand and step titles
    await expect(studioPage.locator('text=Initialize Kumo Companion')).toBeVisible();
    await expect(studioPage.locator('text=1. Connect AI Brain')).toBeVisible();

    // Verify API Key input and engine selector
    const apiKeyInput = studioPage.locator('#api-key-input');
    await expect(apiKeyInput).toBeVisible();

    const card2D = studioPage.locator('[data-engine-card="2d"]');
    const card3D = studioPage.locator('[data-engine-card="3d"]');
    await expect(card2D).toBeVisible();
    await expect(card3D).toBeVisible();

    // Switch engine card to 3D
    await card3D.click();
    await expect(card3D).toHaveClass(/border-primary/);

    // Verify swatches exist
    const skySwatch = studioPage.locator('[data-swatch="sky"]');
    await expect(skySwatch).toBeVisible();
    await skySwatch.click();

    // Verify Launch Companion button exists
    const launchBtn = studioPage.locator('#btn-launch-companion');
    await expect(launchBtn).toBeVisible();
    await expect(launchBtn).toContainText('Launch Kumo & Enter Canvas');
  });
});
