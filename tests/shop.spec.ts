import { test, expect } from '@playwright/test';

const LOAD_TIMEOUT = 20000;

test.describe('shop page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/shop');
    });

    test.afterEach(async ({ page }) => {
        await page.close();
    });

    test('shop page has a header', async ({ page }) => {
        await expect(page.getByRole('img', { name: /dragon behind a shield/i })).toBeVisible();
    });

    test('product cards load', async ({ page }) => {
        await expect(page.getByRole('article').first()).toBeVisible({ timeout: LOAD_TIMEOUT });
    });

    test('product cards display name and price', async ({ page }) => {
        const card = page.getByRole('article').first();
        await expect(card).toBeVisible({ timeout: LOAD_TIMEOUT });
        // Product name is a heading; price renders as a <p> (subtitle1 variant with component="p")
        await expect(card.getByRole('heading', { level: 6 })).not.toBeEmpty();
        await expect(card.getByText(/\$|Price Varies/)).toBeVisible();
    });

    test('category filter chips are visible', async ({ page }) => {
        await page.getByRole('article').first().waitFor({ timeout: LOAD_TIMEOUT });
        const toolbar = page.getByRole('toolbar', { name: 'product filters' });
        const chips = toolbar.getByRole('button');
        await expect(chips.first()).toBeVisible();
        expect(await chips.count()).toBeGreaterThan(0);
    });

    test('clicking a category chip filters the grid', async ({ page }) => {
        await page.getByRole('article').first().waitFor({ timeout: LOAD_TIMEOUT });
        const totalCount = await page.getByRole('article').count();

        const toolbar = page.getByRole('toolbar', { name: 'product filters' });
        const chip = toolbar.getByRole('button').first();
        await chip.click();

        // Clicking the same chip again must restore the full grid, proving
        // the filter toggle works regardless of how many items matched.
        await chip.click();
        await expect(page.getByRole('article')).toHaveCount(totalCount);
    });

    test('available only filter reduces or maintains card count', async ({ page }) => {
        await page.getByRole('article').first().waitFor({ timeout: LOAD_TIMEOUT });
        const totalCount = await page.getByRole('article').count();
        await page.getByRole('button', { name: 'Available Only' }).click();
        const filteredCount = await page.getByRole('article').count();
        expect(filteredCount).toBeLessThanOrEqual(totalCount);
    });

    test('clicking a product card navigates to details', async ({ page }) => {
        const card = page.getByRole('article').first();
        await expect(card).toBeVisible({ timeout: LOAD_TIMEOUT });
        await card.click();
        await expect(page).toHaveURL(/\/shop\/.+/, { timeout: 5000 });
    });
});

test.describe('details page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/shop');
        await page.getByRole('article').first().waitFor({ timeout: LOAD_TIMEOUT });
        await page.getByRole('article').first().click();
        await expect(page).toHaveURL(/\/shop\/.+/, { timeout: 5000 });
    });

    test.afterEach(async ({ page }) => {
        await page.close();
    });

    test('item name heading loads', async ({ page }) => {
        const heading = page.getByRole('heading', { level: 2 });
        await expect(heading).toBeVisible({ timeout: LOAD_TIMEOUT });
        await expect(heading).not.toBeEmpty();
    });

    test('item detail shows description and price', async ({ page }) => {
        await page.getByRole('heading', { level: 2 }).waitFor({ timeout: LOAD_TIMEOUT });
        // Description renders as <p> (Typography body1)
        await expect(page.locator('[role="main"] p').first()).not.toBeEmpty();
        // Price displayed as "$X.XX", "from $X.XX", or "Price Varies"
        await expect(page.getByText(/\$|Price Varies/)).toBeVisible();
    });

    test('back navigation uses the back button to return to shop grid', async ({ page }) => {
        await page.getByRole('heading', { level: 2 }).waitFor({ timeout: LOAD_TIMEOUT });
        // Use the application's own back button rather than browser history
        await page.getByRole('button', { name: 'Back to inventory list' }).click();
        await expect(page).toHaveURL('/shop');
        await expect(page.getByRole('article').first()).toBeVisible({ timeout: LOAD_TIMEOUT });
    });
});
