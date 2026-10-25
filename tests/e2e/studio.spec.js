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

    // Verify API Key input is empty by default (no hardcoded fake key)
    const apiKeyInput = studioPage.locator('#apiKeyInput');
    await expect(apiKeyInput).toBeVisible();
    const defaultVal = await apiKeyInput.inputValue();
    expect(defaultVal).toBe('');

    // In Step 1: Interactive Stage is hidden
    await expect(studioPage.locator('#stageRightColumn')).toBeHidden();

    // Step to Step 2 (Engine): Interactive Stage becomes visible
    await studioPage.locator('#tab-btn-2').click();
    await expect(studioPage.locator('text=2. Choose Companion Engine')).toBeVisible();
    await expect(studioPage.locator('#stageRightColumn')).toBeVisible();

    // Verify 3D WebGL Canvas is active and visible by default on stage
    const botCanvas = studioPage.locator('#bot-canvas');
    await expect(botCanvas).toBeVisible();

    // Verify Category Filter buttons work (Filter 2D)
    await studioPage.locator('#filter-btn-2d').click();
    const pixelCard = studioPage.locator('#card-mascot-pixel2d');
    await expect(pixelCard).toBeVisible();

    // Click 2D Pixel Cloud card
    await pixelCard.click();
    await expect(pixelCard).toHaveClass(/border-primary/);

    // Verify 2D Pixel Canvas becomes active on stage
    const pixelCanvas = studioPage.locator('#pixel-canvas');
    await expect(pixelCanvas).toBeVisible();

    // Click 'Happy' mood button and verify mood pill state
    const happyBtn = studioPage.locator('.mood-btn', { hasText: 'Happy' });
    await happyBtn.click();
    await expect(happyBtn).toHaveClass(/bg-primary-fixed/);

    // Click 'Thinking' mood button and verify mood pill state
    const thinkingBtn = studioPage.locator('.mood-btn', { hasText: 'Thinking' });
    await thinkingBtn.click();
    await expect(thinkingBtn).toHaveClass(/bg-primary-fixed/);

    // Switch back to 3D category and select 3D Voxel Bot
    await studioPage.locator('#filter-btn-3d').click();
    const voxelCard = studioPage.locator('#card-mascot-voxel3d');
    await expect(voxelCard).toBeVisible();
    await voxelCard.click();
    await expect(botCanvas).toBeVisible();

    // Step to Step 3 (Persona & Swatches)
    await studioPage.locator('#tab-btn-3').click();
    await expect(studioPage.locator('text=3. Color Palette & Blush Intensity')).toBeVisible();

    // Step to Step 4 (Hotkeys & Launch)
    await studioPage.locator('#tab-btn-4').click();
    await expect(studioPage.locator('text=4. Summon & Keyboard Shortcuts')).toBeVisible();

    // Verify Launch button exists and is clickable
    const launchBtn = studioPage.locator('#btn-launch-companion');
    await expect(launchBtn).toBeVisible();
    await expect(launchBtn).toContainText('Launch Kumo');
  });
});
