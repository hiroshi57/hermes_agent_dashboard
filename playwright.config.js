// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    // index.html をローカルファイルとして開く
    baseURL: 'file://' + process.cwd() + '/index.html',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // ── デスクトップ: 3ブラウザ（smoke テストのみ） ───────────
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/smoke.spec.js',
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: '**/smoke.spec.js',
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: '**/smoke.spec.js',
    },

    // ── モバイルエミュレーション（mobile テストのみ） ────────
    {
      name: 'mobile-ios',
      use: { ...devices['iPhone 13'] },
      testMatch: '**/mobile.spec.js',
    },
    {
      name: 'mobile-android',
      use: { ...devices['Pixel 5'] },
      testMatch: '**/mobile.spec.js',
    },

    // ── OpenMythos 連携テスト (chromium のみ) ────────────────
    {
      name: 'openmythos',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/openmythos.spec.js',
    },
  ],
});
