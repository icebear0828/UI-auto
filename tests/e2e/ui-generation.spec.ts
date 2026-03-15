import { test, expect } from '@playwright/test';
import { submitPrompt, waitForUIGeneration } from './fixtures/test-utils';

test.describe('UI Generation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should generate a dashboard UI', async ({ page }) => {
        await submitPrompt(page, 'Create a simple dashboard with 3 stat cards');
        await waitForUIGeneration(page);

        // Verify UI was generated (any rendered content in the device wrapper)
        const generatedContent = page.locator('[data-streaming="false"] >> visible=true').first();
        await expect(generatedContent).toBeVisible({ timeout: 10000 });
    });

    test('should handle streaming gracefully', async ({ page }) => {
        await submitPrompt(page, 'Create a login form');

        // Verify streaming starts (data-streaming="true" appears on canvas)
        const canvas = page.locator('[data-streaming]').first();
        await expect(canvas).toBeAttached({ timeout: 30000 });

        // Wait for completion
        await waitForUIGeneration(page);

        // Verify streaming ended
        await expect(page.locator('[data-streaming="false"]').first()).toBeAttached();
    });

    test('should display error on API failure', async ({ page }) => {
        // Note: This test requires API mock implementation
        // Skipping until API mock is available
        test.skip();
    });
});
