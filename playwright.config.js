const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 35000,
  retries: 0,
  workers: 1, // Electron E2E tests run sequentially
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'tests/report' }]
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
});
