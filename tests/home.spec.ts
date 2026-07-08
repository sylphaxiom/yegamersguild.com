import { test, expect } from '@playwright/test';

const CMS_TIMEOUT = 10000;

test.describe('homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle("Ye Gamer's Guild");
    // Wait for Layout's loading spinner to clear — role="main" only renders after
    // both CMS queries resolve. API can be slow in CI so give it 30s.
    await expect(page.locator('[role="main"]')).toBeVisible({ timeout: 30000 });
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });

  test('logo image loads', async ({ page }) => {
    const logo = page.getByRole('img', { name: /dragon behind a shield/i });
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('src', /guild_logo/);
  });

  test('ticker images load from CMS', async ({ page }) => {
    // Images come from the DB — we don't test specific src values,
    // just that at least one image is present and visible in the marquee.
    const marquee = page.getByRole('marquee', { name: 'image ticker' });
    await expect(marquee).toBeVisible({ timeout: CMS_TIMEOUT });
    await expect(marquee.locator('img').first()).toBeVisible({ timeout: CMS_TIMEOUT });
  });

  test('header text content renders from CMS', async ({ page }) => {
    // The two ticker text lines render as <figure> elements.
    await expect(page.locator('figure').first()).not.toBeEmpty({ timeout: CMS_TIMEOUT });
  });

  test('mode switch toggles theme', async ({ page }) => {
    const html = page.locator('html');
    const modeBtn = page.getByRole('button', { name: 'change mode' });
    await expect(modeBtn).toBeVisible();
    const initialClass = await html.getAttribute('class');

    await modeBtn.click();
    // Use expect with auto-retry rather than a plain getAttribute — avoids the race
    // between the click event and React re-rendering the html class attribute.
    await expect(html).not.toHaveAttribute('class', initialClass ?? '');

    // Toggle back and confirm original class is restored
    await modeBtn.click();
    await expect(html).toHaveAttribute('class', initialClass ?? '');
  });

  test('calendar button navigates to events page', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Check out our calendar of events' });
    await expect(button).toBeVisible({ timeout: CMS_TIMEOUT });
    await button.click();
    await expect(page).toHaveURL('/events');
  });

  test('location section is visible with address', async ({ page }) => {
    const location = page.getByRole('complementary', { name: 'location' });
    await expect(location).toBeVisible({ timeout: CMS_TIMEOUT });
    // Location renders address lines as <p> elements (Typography variant="h5" component="p")
    await expect(location.locator('p').first()).not.toBeEmpty();
  });

  test('hours section is visible with day content', async ({ page }) => {
    const hours = page.getByRole('complementary', { name: 'hours' });
    await expect(hours).toBeVisible({ timeout: CMS_TIMEOUT });
    // Hours renders day text as <p> elements (Typography variant="h5" component="p")
    await expect(hours.locator('p').first()).not.toBeEmpty();
  });

  test('about section is visible with bullet points', async ({ page }) => {
    const about = page.getByRole('article', { name: 'about' });
    await expect(about).toBeVisible({ timeout: CMS_TIMEOUT });
    await expect(about.locator('p').first()).not.toBeEmpty({ timeout: CMS_TIMEOUT });
  });

  test('google map is embedded', async ({ page }) => {
    const map = page.locator('#google-map iframe');
    await expect(map).toBeVisible({ timeout: CMS_TIMEOUT });
  });
});
