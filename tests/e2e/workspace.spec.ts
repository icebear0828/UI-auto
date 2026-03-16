import { test, expect } from '@playwright/test';
import {
    switchTab, switchToMobile, switchToDesktop,
    toggleRole, toggleEditMode, toggleVNMode
} from './fixtures/test-utils';

test.describe('Workspace Interactions', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should render sidebar with header and tabs', async ({ page }) => {
        await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
        await expect(page.locator('[data-testid="tab-generator"]')).toBeVisible();
        await expect(page.locator('[data-testid="tab-structure"]')).toBeVisible();
    });

    test('should switch between Generator and Structure tabs', async ({ page }) => {
        await switchTab(page, 'structure');
        await expect(page.locator('[data-testid="tab-structure"]')).toHaveClass(/text-white/);

        await switchTab(page, 'generator');
        await expect(page.locator('[data-testid="tab-generator"]')).toHaveClass(/text-white/);
    });

    test('should show empty state with prompt suggestions', async ({ page }) => {
        await expect(page.locator('text=Ready to Architect')).toBeVisible();
        await expect(page.locator('text=Cyberpunk Dashboard')).toBeVisible();
    });

    test('should have undo/redo disabled initially', async ({ page }) => {
        await expect(page.locator('[data-testid="toolbar-undo"]')).toBeDisabled();
        await expect(page.locator('[data-testid="toolbar-redo"]')).toBeDisabled();
    });

    test('should toggle device between desktop and mobile', async ({ page }) => {
        await switchToMobile(page);
        await expect(page.locator('[data-testid="device-mobile"]')).toHaveClass(/bg-white\/10/);

        await switchToDesktop(page);
        await expect(page.locator('[data-testid="device-desktop"]')).toHaveClass(/bg-white\/10/);
    });

    test('should toggle role between Admin and User', async ({ page }) => {
        const roleBtn = page.locator('[data-testid="role-toggle"]');
        const initialText = await roleBtn.textContent();

        await toggleRole(page);
        const toggledText = await roleBtn.textContent();
        expect(initialText).not.toEqual(toggledText);

        await toggleRole(page);
        await expect(roleBtn).toHaveText(initialText!);
    });

    test('should toggle edit mode (View/Design)', async ({ page }) => {
        const editBtn = page.locator('[data-testid="mode-toggle-edit"]');
        await expect(editBtn).toContainText('View');

        await toggleEditMode(page);
        await expect(editBtn).toContainText('Design');
        await expect(editBtn).toHaveClass(/bg-indigo-600/);

        await toggleEditMode(page);
        await expect(editBtn).toContainText('View');
    });

    test('should toggle VN mode and change prompt placeholder', async ({ page }) => {
        const vnBtn = page.locator('[data-testid="mode-toggle-vn"]');
        await expect(vnBtn).toContainText('UI Mode');

        await toggleVNMode(page);
        await expect(vnBtn).toContainText('VN Mode');
        await expect(vnBtn).toHaveClass(/bg-pink-600/);

        const input = page.locator('[data-testid="prompt-input"]');
        await expect(input).toHaveAttribute('placeholder', /scene/);

        await toggleVNMode(page);
        await expect(vnBtn).toContainText('UI Mode');
    });

    test('should have prompt input and export code button', async ({ page }) => {
        await expect(page.locator('[data-testid="prompt-input"]')).toBeVisible();
        await expect(page.locator('[data-testid="export-code"]')).toBeVisible();
    });

    test('should show IDLE status by default', async ({ page }) => {
        await expect(page.locator('text=IDLE')).toBeVisible();
    });
});
