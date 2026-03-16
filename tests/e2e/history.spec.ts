import { test, expect } from '@playwright/test';
import { submitPrompt, waitForUIGeneration } from './fixtures/test-utils';

test.describe('Undo/Redo History @api', () => {
    test.describe.configure({ timeout: 120_000 });

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should enable undo after generation', async ({ page }) => {
        const undoBtn = page.locator('[data-testid="toolbar-undo"]');
        const redoBtn = page.locator('[data-testid="toolbar-redo"]');

        await expect(undoBtn).toBeDisabled();
        await expect(redoBtn).toBeDisabled();

        await submitPrompt(page, 'Create a simple card with a title');
        await waitForUIGeneration(page);

        await expect(undoBtn).toBeEnabled({ timeout: 5000 });
    });

    test('should undo and restore empty state', async ({ page }) => {
        await submitPrompt(page, 'Create a button that says Hello');
        await waitForUIGeneration(page);

        await page.click('[data-testid="toolbar-undo"]');
        await expect(page.locator('text=Ready to Architect')).toBeVisible({ timeout: 5000 });
    });

    test('should redo after undo', async ({ page }) => {
        await submitPrompt(page, 'Create a simple alert');
        await waitForUIGeneration(page);

        await page.click('[data-testid="toolbar-undo"]');
        await expect(page.locator('text=Ready to Architect')).toBeVisible({ timeout: 5000 });

        await page.click('[data-testid="toolbar-redo"]');
        await expect(page.locator('text=Ready to Architect')).not.toBeVisible({ timeout: 5000 });
    });
});
