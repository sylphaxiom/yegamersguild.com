import { test as setup, expect } from '@playwright/test';

/**
 * Auth setup — runs once before the admin project.
 * Logs in via Auth0 and saves the browser session to tests/auth.json.
 * Requires TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD environment variables.
 */
setup('authenticate as admin', async ({ page }) => {
  if (!process.env.TEST_ADMIN_EMAIL || !process.env.TEST_ADMIN_PASSWORD) {
    throw new Error(
      'TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD must be set to run admin tests.',
    );
  }

  await page.goto('/admin');

  // Auth0 redirects to the login page
  await page.waitForURL(/auth\.sylphaxiom\.com/, { timeout: 15000 });

  // Step 1 — Enter the Auth0 organization name
  await expect(page.getByRole('textbox', { name: 'Enter your organization name' })).toBeVisible({ timeout: 10000 });
  await page.getByRole('textbox', { name: 'Enter your organization name' }).fill('yegamersguild');
  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 2 — Enter email and password
  await expect(page.locator('input[name="username"]')).toBeVisible({ timeout: 10000 });
  await page.fill('input[name="username"]', process.env.TEST_ADMIN_EMAIL);
  await page.fill('input[name="password"]', process.env.TEST_ADMIN_PASSWORD);
  await page.click('button[type="submit"]');

  // Wait for redirect back to the admin console
  await expect(page).toHaveURL('/admin', { timeout: 15000 });
  await expect(page.getByText('Admin Console')).toBeVisible();

  // Persist the authenticated session for all admin tests
  await page.context().storageState({ path: 'tests/auth.json' });
});
