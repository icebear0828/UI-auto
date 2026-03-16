import { Page, expect } from '@playwright/test';

export async function submitPrompt(page: Page, prompt: string) {
    await page.fill('[data-testid="prompt-input"]', prompt);
    await page.click('[data-testid="prompt-submit"]');
}

export async function waitForUIGeneration(page: Page, timeout = 80000) {
    await page.waitForSelector('[data-streaming="true"]', { state: 'attached', timeout: timeout / 2 }).catch(() => {});
    await page.waitForSelector('[data-streaming="false"]', { state: 'attached', timeout });
}

export async function switchToMobile(page: Page) {
    await page.click('[data-testid="device-mobile"]');
}

export async function switchToDesktop(page: Page) {
    await page.click('[data-testid="device-desktop"]');
}

export async function openSettings(page: Page) {
    await page.click('[data-testid="settings-button"]');
    await expect(page.locator('[data-testid="settings-dialog"]')).toBeVisible();
}

export async function closeSettings(page: Page) {
    await page.click('[data-testid="settings-close"]');
    await expect(page.locator('[data-testid="settings-dialog"]')).not.toBeVisible();
}

export async function toggleEditMode(page: Page) {
    await page.click('[data-testid="mode-toggle-edit"]');
}

export async function toggleVNMode(page: Page) {
    await page.click('[data-testid="mode-toggle-vn"]');
}

export async function switchTab(page: Page, tab: 'generator' | 'structure') {
    await page.click(`[data-testid="tab-${tab}"]`);
}

export async function toggleRole(page: Page) {
    await page.click('[data-testid="role-toggle"]');
}

export async function toggleExportCode(page: Page) {
    await page.click('[data-testid="export-code"]');
}

export async function verifyNoHorizontalScroll(page: Page) {
    const content = page.locator('.custom-scrollbar').first();
    const scrollWidth = await content.evaluate(el => el.scrollWidth);
    const clientWidth = await content.evaluate(el => el.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
}
