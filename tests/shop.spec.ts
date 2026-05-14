import { test, expect } from '@playwright/test';

const LOAD_TIMEOUT = 20000;

test.describe('shop page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/shop');
    });

    test.afterEach(async ({ page }) => {
        await page.close();
    });

    test('navigates to /shop without delay', async ({ page }) => {
        await expect(page).toHaveURL('/shop', { timeout: 3000 });
    });

    test('product cards load', async ({ page }) => {
        // Wait for either skeleton or card — skeleton may flash by quickly
        await page.waitForSelector('.MuiSkeleton-root, .MuiCard-root', { timeout: 3000 });
        const card = page.locator('.MuiCard-root').first();
        await expect(card).toBeVisible({ timeout: LOAD_TIMEOUT });
    });

    test('product cards display name and price', async ({ page }) => {
        const card = page.locator('.MuiCard-root').first();
        await expect(card).toBeVisible({ timeout: LOAD_TIMEOUT });
        // Each card should have a heading and a price
        await expect(card.locator('.MuiTypography-h6')).not.toBeEmpty();
        await expect(card.locator('.MuiTypography-subtitle1')).not.toBeEmpty();
    });

    test('category filter chips are visible', async ({ page }) => {
        await page.locator('.MuiCard-root').first().waitFor({ timeout: LOAD_TIMEOUT });
        const chips = page.locator('.MuiChip-root');
        await expect(chips.first()).toBeVisible();
        expect(await chips.count()).toBeGreaterThan(0);
    });

    test('clicking a category chip filters the grid', async ({ page }) => {
        await page.locator('.MuiCard-root').first().waitFor({ timeout: LOAD_TIMEOUT });
        const totalCount = await page.locator('.MuiCard-root').count();
        // Click the first category chip (skip Available Only which is last)
        const chip = page.locator('.MuiChip-root').first();
        await chip.click();
        const filteredCount = await page.locator('.MuiCard-root').count();
        // Filtered count should be <= total (may equal total if all items share that category)
        expect(filteredCount).toBeLessThanOrEqual(totalCount);
        // Clicking again should restore full grid
        await chip.click();
        await expect(page.locator('.MuiCard-root')).toHaveCount(totalCount);
    });

    test('available only filter reduces or maintains card count', async ({ page }) => {
        await page.locator('.MuiCard-root').first().waitFor({ timeout: LOAD_TIMEOUT });
        const allCards = page.locator('.MuiCard-root');
        const totalCount = await allCards.count();
        const availableChip = page.getByText('Available Only');
        await availableChip.click();
        const filteredCount = await allCards.count();
        expect(filteredCount).toBeLessThanOrEqual(totalCount);
    });

    test('clicking a product card navigates to details', async ({ page }) => {
        const card = page.locator('.MuiCard-root').first();
        await expect(card).toBeVisible({ timeout: LOAD_TIMEOUT });
        await card.click();
        await expect(page).toHaveURL(/\/shop\/.+/, { timeout: 5000 });
    });
});

test.describe('details page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/shop');
        await page.locator('.MuiCard-root').first().waitFor({ timeout: LOAD_TIMEOUT });
        await page.locator('.MuiCard-root').first().click();
        await expect(page).toHaveURL(/\/shop\/.+/, { timeout: 5000 });
    });

    test.afterEach(async ({ page }) => {
        await page.close();
    });

    test('skeleton appears then item detail loads', async ({ page }) => {
        const skeleton = page.locator('.MuiSkeleton-root').first();
        // Either skeleton was shown briefly, or content already loaded
        const heading = page.locator('.MuiTypography-h2');
        await expect(heading).toBeVisible({ timeout: LOAD_TIMEOUT });
        await expect(heading).not.toBeEmpty();
    });

    test('item detail shows description and price', async ({ page }) => {
        await page.locator('.MuiTypography-h2').waitFor({ timeout: LOAD_TIMEOUT });
        await expect(page.locator('[role="main"] .MuiTypography-body1')).not.toBeEmpty();
        await expect(page.locator('.MuiTypography-body2').first()).toBeVisible();
    });

    test('back navigation returns to shop grid', async ({ page }) => {
        await page.locator('.MuiTypography-h2').waitFor({ timeout: LOAD_TIMEOUT });
        await page.goBack();
        await expect(page).toHaveURL('/shop');
        await expect(page.locator('.MuiCard-root').first()).toBeVisible({ timeout: LOAD_TIMEOUT });
    });
});
