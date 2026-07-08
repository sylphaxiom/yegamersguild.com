import { test, expect } from '@playwright/test';

const LOAD_TIMEOUT = 30000;

test.describe('events page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/events');
    await expect(page.getByRole('heading', { name: /shop events/i })).toBeVisible({ timeout: LOAD_TIMEOUT });
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });

  test('page title is correct', async ({ page }) => {
    await expect(page).toHaveTitle("Ye Gamer's Guild");
  });

  test('header logo is visible', async ({ page }) => {
    await expect(page.getByRole('img', { name: /dragon behind a shield/i })).toBeVisible();
  });

  test('calendar displays current year in month heading', async ({ page }) => {
    const year = new Date().getFullYear().toString();
    await expect(
      page.locator('#calendarBox').getByRole('heading', { level: 4 })
    ).toContainText(year);
  });

  test('day abbreviations are all visible', async ({ page }) => {
    for (const day of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']) {
      await expect(
        page.locator('#calendarBox').getByRole('heading', { name: day })
      ).toBeVisible();
    }
  });

  test('month navigation changes and restores the month heading', async ({ page }) => {
    const heading = page.locator('#calendarBox').getByRole('heading', { level: 4 });
    const initial = await heading.textContent();

    // Advance one month — next button is the second button in the calendar box
    await page.locator('#calendarBox').getByRole('button').nth(1).click();
    await expect(heading).not.toHaveText(initial ?? '');

    // Go back — prev button is the first button in the calendar box
    await page.locator('#calendarBox').getByRole('button').nth(0).click();
    await expect(heading).toHaveText(initial ?? '');
  });

  test('event list area renders below the calendar divider', async ({ page }) => {
    // The fullWidth Divider (hr) is always rendered between the calendar and the event list
    await expect(page.locator('#calendarBox ~ hr').first()).toBeVisible();
  });
});
