import { test, expect } from '@playwright/test';
import { submitPrompt, waitForUIGeneration } from './fixtures/test-utils';

test.describe('Tool Calls', () => {
    // Tool calls require 2 Gemini round-trips + external API calls
    test.describe.configure({ timeout: 120_000 });

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should fetch and display weather data', async ({ page }) => {
        await submitPrompt(page, 'What is the weather in Tokyo?');
        await waitForUIGeneration(page, 100000);

        // Verify weather data is displayed
        const content = await page.textContent('body');
        expect(content).toMatch(/tokyo|weather|temperature|°/i);
    });

    test('should handle crypto price query', async ({ page }) => {
        await submitPrompt(page, 'Show me the Bitcoin price');
        await waitForUIGeneration(page, 100000);

        const content = await page.textContent('body');
        expect(content).toMatch(/bitcoin|btc|\$/i);
    });
});
