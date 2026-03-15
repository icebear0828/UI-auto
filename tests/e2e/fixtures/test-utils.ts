import { Page, expect } from '@playwright/test';

/**
 * E2E Test Utilities
 * Shared helper functions for Playwright E2E tests
 */

export async function submitPrompt(page: Page, prompt: string) {
    await page.fill('input[placeholder*="Describe"], input[placeholder*="Refine"], input[placeholder*="scene"]', prompt);
    await page.press('input', 'Enter');
}

export async function waitForUIGeneration(page: Page, timeout = 80000) {
    // Use state: 'attached' because on mobile viewports the device wrapper
    // may be off-screen (behind the sidebar) and not considered "visible"
    await page.waitForSelector('[data-streaming="true"]', { state: 'attached', timeout: timeout / 2 }).catch(() => {});
    await page.waitForSelector('[data-streaming="false"]', { state: 'attached', timeout });
}

export async function switchToMobile(page: Page) {
    await page.click('button[title="Mobile View"], [data-testid="device-mobile"]', { force: true });
}

export async function switchToDesktop(page: Page) {
    await page.click('button[title="Desktop View"], [data-testid="device-desktop"]', { force: true });
}

export async function verifyNoHorizontalScroll(page: Page) {
    const content = page.locator('.custom-scrollbar').first();
    const scrollWidth = await content.evaluate(el => el.scrollWidth);
    const clientWidth = await content.evaluate(el => el.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // 5px tolerance
}
