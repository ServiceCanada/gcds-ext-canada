import { expect,  devices } from '@playwright/test';
import { matchers, createConfig } from '@stencil/playwright';

expect.extend(matchers);

export default createConfig({
  retries: 1,
  testDir: './src',
  testMatch: '**/*.e2e.ts',
  timeout: 20000,
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
  ],
});
