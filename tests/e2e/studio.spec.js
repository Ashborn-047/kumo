const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('playwright');
const path = require('path');
const os = require('os');
const fs = require('fs');

test.describe('Kumo Studio & Onboarding Window', () => {
  let electronApp;
  let tempUserData;

  test.beforeEach(async () => {
    delete process.env.ELECTRON_RUN_AS_NODE;
    tempUserData = fs.mkdtempSync(path.join(os.tmpdir(), 'kumo-test-studio-'));
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

    // Verify API Key input is empty by default (no hardcoded fake key)
    const apiKeyInput = studioPage.locator('#apiKeyInput');
    await expect(apiKeyInput).toBeVisible();
    const defaultVal = await apiKeyInput.inputValue();
    expect(defaultVal).toBe('');

    // In Step 1: Interactive Stage is hidden
    await expect(studioPage.locator('#stageRightColumn')).toBeHidden();

    // Step to Step 2 (Engine): Interactive Stage becomes visible
    await studioPage.evaluate(() => goToStep(2));
    await expect(studioPage.locator('#step-panel-2')).toBeVisible();
    await expect(studioPage.locator('#stageRightColumn')).toBeVisible();

    // Verify 3D WebGL Canvas is active and visible by default on stage
    const botCanvas = studioPage.locator('#bot-canvas');
    await expect(botCanvas).toBeVisible();

    // Verify Category Filter buttons work (Filter 2D)
    await studioPage.evaluate(() => filterMascotCategory('2d'));
    const pixelCard = studioPage.locator('#card-mascot-pixel2d');
    await expect(pixelCard).toBeVisible();

    // Select 2D Pixel Cloud card
    await studioPage.evaluate(() => selectMascot('pixel2d'));
    await expect(pixelCard).toHaveClass(/border-primary/);

    // Verify 2D Pixel Canvas becomes active on stage
    const pixelCanvas = studioPage.locator('#pixel-canvas');
    await expect(pixelCanvas).toBeVisible();

    // Set 'Happy' mood and verify mood pill state
    const happyBtn = studioPage.locator('.mood-btn', { hasText: 'Happy' });
    await happyBtn.evaluate((el) => el.click());
    await expect(happyBtn).toHaveClass(/bg-primary-fixed/);

    // Set 'Thinking' mood and verify mood pill state
    const thinkingBtn = studioPage.locator('.mood-btn', { hasText: 'Thinking' });
    await thinkingBtn.evaluate((el) => el.click());
    await expect(thinkingBtn).toHaveClass(/bg-primary-fixed/);

    // Switch back to 3D category and select 3D Voxel Bot
    await studioPage.evaluate(() => filterMascotCategory('3d'));
    await studioPage.evaluate(() => selectMascot('voxel3d'));
    const voxelCard = studioPage.locator('#card-mascot-voxel3d');
    await expect(voxelCard).toBeVisible();
    await expect(botCanvas).toBeVisible();

    // Step to Step 3 (Persona & Swatches)
    await studioPage.evaluate(() => goToStep(3));
    await expect(studioPage.locator('#step-panel-3')).toBeVisible();

    // Step to Step 4 (Hotkeys & Launch)
    await studioPage.evaluate(() => goToStep(4));
    await expect(studioPage.locator('#step-panel-4')).toBeVisible();

    // Verify Launch button exists and is clickable
    const launchBtn = studioPage.locator('#btn-launch-companion');
    await expect(launchBtn).toBeVisible();
    await expect(launchBtn).toContainText('Launch Kumo');
  });
});
