const path = require('path');
const { defineConfig, devices } = require('@playwright/test');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env'), quiet: true });

const suiteNames = {
  test: 'All tests',
  'test:headed': 'All tests',
  'test:debug': 'All tests',
  'test:smoke': 'Smoke',
  'test:critical': 'Critical',
  'test:regression': 'Regression',
};

module.exports = defineConfig({
  testDir: './tests',
  outputDir: './reports/test-results',
  metadata: {
    suite: suiteNames[process.env.npm_lifecycle_event] || 'Custom',
  },
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/playwright/html', open: 'never' }],
    ['json', { outputFile: 'reports/playwright/results.json' }],
    ['allure-playwright', { resultsDir: 'reports/allure-results' }],
  ],
  use: {
    baseURL:
      process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chromium',
        locale: 'en-US',
      },
    },
  ],
});
