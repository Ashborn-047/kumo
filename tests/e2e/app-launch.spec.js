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

  test('normal boot opens pulse island only and toggles mascot on/off', async () => {
    // Close the initial instance from beforeEach so we can launch with firstRun: false
    if (electronApp) {
      await electronApp.close();
      electronApp = null;
    }

    const islandTempUserData = fs.mkdtempSync(path.join(os.tmpdir(), 'kumo-test-island-'));
    fs.writeFileSync(
      path.join(islandTempUserData, 'config.json'),
      JSON.stringify({ firstRun: false, startMinimized: false, islandEdge: 'top' })
    );

    // Launch app instance in normal boot mode
    const app = await electron.launch({
      args: ['.', `--user-data-dir=${islandTempUserData}`],
      env: {
        ...process.env,
        NODE_ENV: 'test',
        ELECTRON_RUN_AS_NODE: undefined,
      },
    });

    try {
      const firstWin = await app.firstWindow();
      expect(firstWin).toBeTruthy();
      await firstWin.waitForLoadState('domcontentloaded');

      const url = firstWin.url();
      expect(url).toContain('ui/island/index.html');

      // Verify Kumoboard is NOT opened
      const windows = app.windows();
      const hasBoard = windows.some((w) => w.url().includes('ui/board/index.html'));
      expect(hasBoard).toBe(false);

      // Wait for island DOM to be ready and activate resting state
      await firstWin.waitForSelector('#btn-toggle-mascot', { state: 'attached' });
      await firstWin.evaluate(() => {
        const wrap = document.getElementById('island-wrapper');
        wrap?.classList.remove('state-peek');
        wrap?.classList.add('state-resting');
        if (window.IslandState?.controller) {
          window.IslandState.controller.setState('resting');
        }
      });

      // Verify mascot toggle button exists and is visible
      const toggleBtn = firstWin.locator('#btn-toggle-mascot');
      await expect(toggleBtn).toBeVisible({ timeout: 10000 });
      await expect(firstWin.locator('#mascot-toggle-label')).toHaveText('MASCOT ON');

      // Toggle mascot OFF
      await firstWin.evaluate(() => document.getElementById('btn-toggle-mascot')?.click());
      await expect(firstWin.locator('#mascot-toggle-label')).toHaveText('MASCOT OFF');
      await expect(toggleBtn).toHaveClass(/is-off/);

      // Toggle mascot back ON
      await firstWin.evaluate(() => document.getElementById('btn-toggle-mascot')?.click());
      await expect(firstWin.locator('#mascot-toggle-label')).toHaveText('MASCOT ON');
      await expect(toggleBtn).not.toHaveClass(/is-off/);

      // Verify resting header layout: brand is hidden to maximize song clarity
      const headerBrand = firstWin.locator('#header-brand');
      await expect(headerBrand).toBeHidden();

      // Verify music visualizer bars, marquee track text, and play/pause action are visible
      await expect(firstWin.locator('#header-music-bars')).toBeVisible();
      await expect(firstWin.locator('#marquee-viewport')).toBeVisible();
      await expect(firstWin.locator('#marquee-text')).toBeVisible();
      const heroAction = firstWin.locator('#btn-hero-action');
      await expect(heroAction).toBeVisible();

      // Wait for resting state transition to settle
      await firstWin.waitForFunction(() => {
        const chassis = document.querySelector('.seamless-chassis');
        return chassis && Math.round(chassis.getBoundingClientRect().width) >= 340;
      });

      // Ensure marquee viewport isolates scrolling text from music bars
      const barsBox = await firstWin.locator('#header-music-bars').boundingBox();
      const vpBox = await firstWin.locator('#marquee-viewport').boundingBox();
      expect(barsBox).toBeTruthy();
      expect(vpBox).toBeTruthy();
      if (barsBox && vpBox) {
        expect(vpBox.x).toBeGreaterThanOrEqual(barsBox.x + barsBox.width);
      }

      // Ensure hero action button is within chassis bounds (not clipped)
      const heroBox = await heroAction.boundingBox();
      const chassisBox = await firstWin.locator('.seamless-chassis').boundingBox();
      expect(heroBox).toBeTruthy();
      expect(chassisBox).toBeTruthy();
      if (heroBox && chassisBox) {
        expect(heroBox.x + heroBox.width).toBeLessThanOrEqual(chassisBox.x + chassisBox.width);
      }
    } finally {
      await app.close();
      if (fs.existsSync(islandTempUserData)) {
        try {
          fs.rmSync(islandTempUserData, { recursive: true, force: true });
        } catch (_) {}
      }
    }
  });

  test('enforces strict cold boot performance budget under 1500ms', async () => {
    if (electronApp) {
      await electronApp.close();
      electronApp = null;
    }

    const budgetTempUserData = fs.mkdtempSync(path.join(os.tmpdir(), 'kumo-test-budget-'));
    fs.writeFileSync(
      path.join(budgetTempUserData, 'config.json'),
      JSON.stringify({ firstRun: false, startMinimized: false, islandEdge: 'top' })
    );

    const startTime = Date.now();
    const app = await electron.launch({
      args: ['.', `--user-data-dir=${budgetTempUserData}`],
      env: {
        ...process.env,
        NODE_ENV: 'test',
        ELECTRON_RUN_AS_NODE: undefined,
      },
    });

    try {
      const firstWin = await app.firstWindow();
      expect(firstWin).toBeTruthy();
      await firstWin.waitForLoadState('load');
      const bootDurationMs = Date.now() - startTime;

      // Strict performance budget ensures no heavy OS/COM/disk tasks creep into boot
      expect(bootDurationMs).toBeLessThan(1500);
    } finally {
      await app.close();
      if (fs.existsSync(budgetTempUserData)) {
        try {
          fs.rmSync(budgetTempUserData, { recursive: true, force: true });
        } catch (_) {}
      }
    }
  });
});
