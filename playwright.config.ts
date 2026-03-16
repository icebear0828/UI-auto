import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 1,
    workers: 1,
    timeout: 90_000,
    reporter: 'html',

    use: {
        baseURL: 'http://localhost:12345',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        actionTimeout: 15_000,
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'mobile-chrome',
            use: { ...devices['Pixel 5'] },
        },
    ],

    webServer: {
        command: 'pnpm dev',
        url: 'http://localhost:12345',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
});
