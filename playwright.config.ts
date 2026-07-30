import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3333',
    trace: 'on-first-retry',
  },

  // Builds the component library and serves the compiled www/ output
  // (the same bundle the docs site loads) so tests exercise real,
  // compiled custom elements rather than source TSX.
  webServer: {
    command: 'npm run build && npx http-server www -p 3333 -s',
    url: 'http://localhost:3333',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
