const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('playwright');
const path = require('path');
const os = require('os');
const fs = require('fs');

test.describe('Kumoboard — Spatial Workbench', () => {
  let electronApp;
  let tempUserData;

  test.beforeEach(async () => {
    delete process.env.ELECTRON_RUN_AS_NODE;
    tempUserData = fs.mkdtempSync(path.join(os.tmpdir(), 'kumo-test-board-'));
    // Pre-seed config.json with firstRun: false and startMinimized: false
    fs.writeFileSync(
      path.join(tempUserData, 'config.json'),
      JSON.stringify({ firstRun: false, startMinimized: false, companionName: 'Kumo' })
    );

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

  test('loads Kumoboard canvas, tools, navigation and zoom controls', async () => {
    // Find Kumoboard window
    let boardPage = null;
    const maxWaitMs = 12000;
    const start = Date.now();

    while (!boardPage && Date.now() - start < maxWaitMs) {
      const windows = electronApp.windows();
      for (const win of windows) {
        const url = win.url();
        if (url.includes('ui/board/index.html')) {
          boardPage = win;
          break;
        }
      }
      if (!boardPage) {
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    expect(boardPage).not.toBeNull();
    await boardPage.waitForLoadState('domcontentloaded');

    // Verify title
    const title = await boardPage.title();
    expect(title).toContain('Kumoboard');

    // Verify Brand & Command Bar
    await expect(boardPage.locator('nav')).toBeVisible();
    await expect(boardPage.locator('#command-bar')).toBeVisible();

    // Verify Tool Category Navigation Pills
    const allFilter = boardPage.locator('button[data-filter="all"]');
    const systemFilter = boardPage.locator('button[data-filter="launcher"]');
    const writingFilter = boardPage.locator('button[data-filter="writer"]');
    const codeFilter = boardPage.locator('button[data-filter="code"]');
    const designFilter = boardPage.locator('button[data-filter="design"]');
    const notesFilter = boardPage.locator('button[data-filter="notes"]');

    await expect(allFilter).toBeVisible();
    await expect(systemFilter).toBeVisible();
    await expect(writingFilter).toBeVisible();
    await expect(codeFilter).toBeVisible();
    await expect(designFilter).toBeVisible();
    await expect(notesFilter).toBeVisible();

    // Verify Workbench Canvas and Cards Layer
    const canvas = boardPage.locator('#canvas-viewport');
    await expect(canvas).toBeVisible();

    // Verify cards are rendered on the canvas
    const cards = boardPage.locator('.card-shadow');
    await expect(cards.first()).toBeVisible();
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);

    // Verify Zoom HUD controls
    const zoomIn = boardPage.locator('#btn-zoom-in');
    const zoomOut = boardPage.locator('#btn-zoom-out');
    const zoomReset = boardPage.locator('#btn-zoom-fit');
    const zoomDisplay = boardPage.locator('#zoom-display');

    await expect(zoomIn).toBeVisible();
    await expect(zoomOut).toBeVisible();
    await expect(zoomReset).toBeVisible();
    await expect(zoomDisplay).toHaveText('100%');

    // Test Zoom In (1.0 * 1.15 = 115%)
    await zoomIn.click();
    await expect(zoomDisplay).toHaveText('115%');

    // Test Zoom Reset
    await zoomReset.click();
    await expect(zoomDisplay).toHaveText('100%');

    // Verify Settings button exists in top navbar
    const settingsBtn = boardPage.locator('#btn-settings');
    await expect(settingsBtn).toBeVisible();
  });
});
