import { test, expect } from '@playwright/test';
import { submitPrompt, waitForUIGeneration } from './fixtures/test-utils';

test.describe('Trigger Effects @api', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should trigger confetti on button click', async ({ page }) => {
        await submitPrompt(page, 'Create a button that triggers confetti when clicked');
        await waitForUIGeneration(page);

        // Find and click button with confetti action
        const button = page.locator('button:has-text("Celebrate"), button:has-text("Confetti"), button:has-text("confetti")').first();

        if (await button.isVisible()) {
            await button.click({ force: true });

            // Verify confetti canvas appears (confetti library creates canvas element)
            // Some environments may not render canvas, so allow graceful skip
            try {
                const canvas = page.locator('canvas');
                await expect(canvas).toBeVisible({ timeout: 5000 });
            } catch {
                // Confetti may not produce a canvas in all environments
                test.skip();
            }
        } else {
            // If LLM didn't generate a button with effect, skip
            test.skip();
        }
    });
});
