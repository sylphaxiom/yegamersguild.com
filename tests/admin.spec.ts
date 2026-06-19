import { test, expect } from '@playwright/test';

const LOAD_TIMEOUT = 15000;

// ─── Unauthenticated ────────────────────────────────────────────────────────

test.describe('admin — unauthenticated', () => {
  // Override the project storageState so this test starts with no session.
  test.use({ storageState: { cookies: [], origins: [] } });

  test('redirects to Auth0 login when not authenticated', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/auth\.sylphaxiom\.com/, { timeout: 10000 });
  });
});

// ─── Authenticated ──────────────────────────────────────────────────────────

test.describe('admin — authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByText('Admin Console')).toBeVisible({ timeout: LOAD_TIMEOUT });
  });

  test('admin header and logo are visible', async ({ page }) => {
    await expect(page.getByRole('img', { name: 'Guild Logo' })).toBeVisible();
    await expect(page.getByText('Admin Console')).toBeVisible();
  });

  test('all five sections are listed', async ({ page }) => {
    for (const label of ['Header', 'About', 'Hours', 'Location', 'Quick Links']) {
      await expect(page.getByRole('button', { name: label })).toBeVisible();
    }
  });

  test('selecting Header shows title and text editors', async ({ page }) => {
    await page.getByRole('button', { name: 'Header' }).click();
    await expect(page.getByText('Editing Header')).toBeVisible();
    await expect(page.getByLabel('Top Ticker Text')).toBeVisible({ timeout: LOAD_TIMEOUT });
    await expect(page.getByLabel('Bottom Ticker Text')).toBeVisible();
  });

  test('selecting Header shows image upload button', async ({ page }) => {
    await page.getByRole('button', { name: 'Header' }).click();
    await expect(page.getByRole('button', { name: /upload image/i })).toBeVisible({ timeout: LOAD_TIMEOUT });
  });

  test('selecting About shows header, bullets, and blurb editors', async ({ page }) => {
    await page.getByRole('button', { name: 'About' }).click();
    await expect(page.getByText('Editing About')).toBeVisible();
    await expect(page.getByRole('button', { name: /upload image/i })).toBeVisible({ timeout: LOAD_TIMEOUT });
    await expect(page.getByRole('button', { name: 'Add' })).toBeVisible();
  });

  test('selecting Hours shows day rows with Closed checkboxes', async ({ page }) => {
    await page.getByRole('button', { name: 'Hours' }).click();
    await expect(page.getByText('Editing Hours')).toBeVisible();
    await expect(page.getByText('Monday')).toBeVisible({ timeout: LOAD_TIMEOUT });
    await expect(page.getByLabel('Closed').first()).toBeVisible();
  });

  test('selecting Location shows address and header editors', async ({ page }) => {
    await page.getByRole('button', { name: 'Location' }).click();
    await expect(page.getByText('Editing Location')).toBeVisible();
  });

  test('selecting Quick Links shows links editor', async ({ page }) => {
    await page.getByRole('button', { name: 'Quick Links' }).click();
    await expect(page.getByText('Editing Quick Links')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add' })).toBeVisible({ timeout: LOAD_TIMEOUT });
  });

  test('preview section appears when a section is selected', async ({ page }) => {
    await page.getByRole('button', { name: 'Location' }).click();
    await expect(page.getByText('Preview:')).toBeVisible();
  });

  test('switching sections updates the editor view', async ({ page }) => {
    await page.getByRole('button', { name: 'Header' }).click();
    await expect(page.getByText('Editing Header')).toBeVisible();

    await page.getByRole('button', { name: 'Hours' }).click();
    await expect(page.getByText('Editing Hours')).toBeVisible();
    await expect(page.getByText('Editing Header')).not.toBeVisible();
  });
});
