import { test, expect } from '@playwright/test';
import { openSettings, closeSettings } from './fixtures/test-utils';

test.describe('Settings Dialog', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should open and close settings dialog', async ({ page }) => {
        await openSettings(page);
        await expect(page.locator('text=Configuration')).toBeVisible();

        await closeSettings(page);
        await expect(page.locator('[data-testid="settings-dialog"]')).not.toBeVisible();
    });

    test('should select different model', async ({ page }) => {
        await openSettings(page);

        await page.locator('button', { hasText: 'Gemini 3.0 Pro' }).click();
        await expect(page.locator('button', { hasText: 'Gemini 3.0 Pro' })).toHaveClass(/ring-indigo/);

        await page.locator('button', { hasText: 'Gemini 3.0 Flash' }).click();
        await expect(page.locator('button', { hasText: 'Gemini 3.0 Flash' })).toHaveClass(/ring-indigo/);
    });

    test('should toggle sound effects', async ({ page }) => {
        await openSettings(page);

        const toggle = page.locator('[data-testid="settings-sound-toggle"]');
        const initialClass = await toggle.getAttribute('class');
        await toggle.click();
        const newClass = await toggle.getAttribute('class');
        expect(initialClass).not.toEqual(newClass);
    });

    test('should allow custom model ID input', async ({ page }) => {
        await openSettings(page);

        const modelInput = page.locator('[data-testid="settings-model-input"]');
        await modelInput.fill('custom-model-v1');
        await expect(modelInput).toHaveValue('custom-model-v1');
    });

    test('should reset to defaults', async ({ page }) => {
        await openSettings(page);

        // Select Pro model
        await page.locator('button', { hasText: 'Gemini 3.0 Pro' }).click();

        // Reset
        await page.click('[data-testid="settings-reset"]');

        // Flash should be selected again
        await expect(page.locator('button', { hasText: 'Gemini 3.0 Flash' })).toHaveClass(/ring-indigo/);
    });

    test('should save and persist within session', async ({ page }) => {
        await openSettings(page);

        // Select Pro
        await page.locator('button', { hasText: 'Gemini 3.0 Pro' }).click();
        await page.click('[data-testid="settings-save"]');

        // Reopen and verify persisted
        await openSettings(page);
        await expect(page.locator('button', { hasText: 'Gemini 3.0 Pro' })).toHaveClass(/ring-indigo/);
    });
});
