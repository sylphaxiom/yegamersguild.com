import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173/',
    trace: 'on-first-retry',
  },
  projects: [
    // Runs auth.setup.ts once — logs in and saves tests/auth.json
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // Public pages — no login required
    {
      name: 'public',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /auth\.setup|admin\.spec|cms-mutations/,
    },

    // Admin pages — depends on auth-setup, loads saved session
    {
      name: 'admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/auth.json',
      },
      dependencies: ['auth-setup'],
      testMatch: /admin\.spec|cms-mutations/,
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
