import { test, expect } from '@playwright/test';
import {
    submitPrompt,
    waitForUIGeneration,
    switchToMobile,
    switchToDesktop,
    verifyNoHorizontalScroll
} from './fixtures/test-utils';

test.describe('Responsive Design', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('mobile view should use 400px wrapper', async ({ page }) => {
        await switchToMobile(page);
        await submitPrompt(page, 'Create a card with some text');
        await waitForUIGeneration(page);

        const wrapper = page.locator('.w-\\[400px\\]');
        await expect(wrapper).toBeVisible();
    });

    test('desktop view should use 1100px wrapper', async ({ page, browserName }, testInfo) => {
        // 1100px wrapper can't be visible on a 393px mobile viewport
        if (testInfo.project.name === 'mobile-chrome') test.skip();

        await switchToDesktop(page);
        await submitPrompt(page, 'Create a card with some text');
        await waitForUIGeneration(page);

        const wrapper = page.locator('.w-\\[1100px\\]');
        await expect(wrapper).toBeVisible();
    });

    test('mobile UI should not have horizontal scroll', async ({ page }) => {
        await switchToMobile(page);
        await submitPrompt(page, 'Create a dashboard with 5 stat cards');
        await waitForUIGeneration(page);

        await verifyNoHorizontalScroll(page);
    });

    test('switching device should re-render correctly', async ({ page }) => {
        // Generate desktop UI first
        await switchToDesktop(page);
        await submitPrompt(page, 'Create a simple form');
        await waitForUIGeneration(page);

        // Switch to mobile
        await switchToMobile(page);
        await page.waitForTimeout(500); // Wait for animation

        // Verify container width changed
        const wrapper = page.locator('.w-\\[400px\\]');
        await expect(wrapper).toBeVisible();
    });
});
