import { test, expect } from '@playwright/test';

const LOAD_TIMEOUT = 15000;
const API_TIMEOUT = 10000;

/**
 * These tests perform real mutations against the live API.
 * Each test that modifies data saves the original value and restores it
 * in a finally block, so the site is left in its original state even if
 * an assertion fails mid-test.
 */

test.describe('CMS mutations', () => {
  test('Save button is disabled when field is unchanged (isDirty guard)', async ({ page }) => {
    await page.goto('/admin');
    await page.getByRole('button', { name: 'Header' }).click();

    const field = page.getByLabel('Top Ticker Text');
    await expect(field).toBeVisible({ timeout: LOAD_TIMEOUT });

    // Scope the form to the one containing this specific field, since Header
    // renders multiple forms (one per StringField).
    const form = page.locator('form').filter({ has: field });
    const saveBtn = form.getByRole('button', { name: 'Save' });

    // Before any edits the Save button must be disabled
    await expect(saveBtn).toBeDisabled();

    // After a change it becomes active
    const original = await field.inputValue();
    await field.fill(original + 'x');
    await expect(saveBtn).toBeEnabled();

    // Fill back to original — Save must become disabled again without saving
    await field.fill(original);
    await expect(saveBtn).toBeDisabled();
  });

  test('StringField saves and the save button reflects the completed round-trip', async ({ page }) => {
    await page.goto('/admin');
    await page.getByRole('button', { name: 'Header' }).click();

    const field = page.getByLabel('Top Ticker Text');
    await expect(field).toBeVisible({ timeout: LOAD_TIMEOUT });

    // Navigate up to the form element that owns this specific field, then find
    // its Save button. This is order-independent and unambiguous.
    const saveBtn = field.locator('xpath=ancestor::form[1]').getByRole('button', { name: 'Save' });

    const original = await field.inputValue();
    // Timestamp suffix guarantees uniqueness even if a prior run left a dirty DB value
    const testValue = `__pw_${Date.now()}__`;

    try {
      await field.fill(testValue);

      // Verify the fill actually changed the controlled input and isDirty=true.
      // These two assertions give precise diagnostics if something upstream is wrong.
      await expect(field).toHaveValue(testValue);
      await expect(saveBtn).toBeEnabled({ timeout: 5000 });

      // Save and wait for the PUT response
      const [response] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes('api.sylphaxiom.com/content.php') && r.request().method() === 'PUT',
          { timeout: API_TIMEOUT },
        ),
        saveBtn.click(),
      ]);
      expect(response.ok()).toBe(true);

      // After onSuccess → invalidateQueries → refetch the field re-syncs with the
      // DB value and isDirty becomes false — Save button goes disabled again.
      // This proves the full round-trip (PUT → refetch → React update) completed.
      await expect(saveBtn).toBeDisabled({ timeout: API_TIMEOUT });
    } finally {
      try {
        // Wait for any in-flight mutation + refetch to settle. If we fill() while
        // currentValue is still stale, isDirty will be false and Save stays disabled.
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        await field.fill(original);
        if (await saveBtn.isEnabled()) {
          await Promise.all([
            page.waitForResponse(
              (r) => r.url().includes('api.sylphaxiom.com/content.php') && r.request().method() === 'PUT',
              { timeout: API_TIMEOUT },
            ),
            saveBtn.click(),
          ]);
        }
      } catch {
        // Best-effort cleanup — don't let restore errors mask the original failure
      }
    }
  });

  test('BulletsField Add button appends a row', async ({ page }) => {
    await page.goto('/admin');
    await page.getByRole('button', { name: 'About' }).click();

    // Wait for data to load — the Delete buttons only appear once rows exist
    await expect(page.getByLabel('delete').first()).toBeVisible({ timeout: LOAD_TIMEOUT });

    // Count rows by their Delete buttons — all BulletsField TextFields share the
    // same id (contentKey), making getByLabel unreliable for counting.
    const before = await page.getByLabel('delete').count();

    await page.getByRole('button', { name: 'Add' }).click();

    const after = await page.getByLabel('delete').count();
    expect(after).toBe(before + 1);

    // We do NOT save — navigating away or refreshing discards the unsaved addition
  });

  test('Hours Closed checkbox disables the Open and Close spinners', async ({ page }) => {
    await page.goto('/admin');
    await page.getByRole('button', { name: 'Hours' }).click();

    // Use legend — HoursField renders day names as <legend> elements. getByText('Monday')
    // is ambiguous because the Location preview also shows "Monday:" in text.
    await expect(page.locator('legend').filter({ hasText: 'Monday' })).toBeVisible({ timeout: LOAD_TIMEOUT });

    // The Monday row's Closed checkbox (first among all Closed checkboxes)
    const closedCheckbox = page.getByLabel('Closed').first();

    // Ensure we start from unchecked state regardless of current DB value.
    // Checking / unchecking does NOT save — there's a separate Save button.
    if (await closedCheckbox.isChecked()) {
      await closedCheckbox.uncheck();
    }

    // Check it and verify the Open and Close spinners become disabled
    await closedCheckbox.check();
    // HoursField passes disabled={isClosed} to NumberSpinner which propagates to
    // the Base UI NumberField input. The spinners use label="Open" and label="Close".
    await expect(page.getByLabel('Open').first()).toBeDisabled();
    await expect(page.getByLabel('Close').first()).toBeDisabled();

    // Restore to unchecked (no save — only local state changed)
    await closedCheckbox.uncheck();
    await expect(page.getByLabel('Open').first()).toBeEnabled();
  });

  test('image upload button triggers file picker', async ({ page }) => {
    await page.goto('/admin');
    await page.getByRole('button', { name: 'About' }).click();

    const uploadBtn = page.getByRole('button', { name: /upload image/i });
    await expect(uploadBtn).toBeVisible({ timeout: LOAD_TIMEOUT });

    // Promise.all ensures we set up the listener before clicking, avoiding the
    // race between the click and the filechooser event being emitted.
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 5000 }),
      uploadBtn.click(),
    ]);

    expect(fileChooser).toBeTruthy();
    // We don't select a file — just verifying the OS picker was triggered
  });

  test('LinksField Add button appends a row', async ({ page }) => {
    await page.goto('/admin');
    await page.getByRole('button', { name: 'Quick Links' }).click();

    // Wait for existing link rows to load (each row has a Delete button)
    await expect(page.getByLabel('delete').first()).toBeVisible({ timeout: LOAD_TIMEOUT });

    // Count by Delete buttons — LinksField rows each have exactly one.
    // Both TextFields per row share the same label ("Links"), making getByLabel
    // unreliable for counting rows.
    const before = await page.getByLabel('delete').count();

    await page.getByRole('button', { name: 'Add' }).click();

    const after = await page.getByLabel('delete').count();
    expect(after).toBe(before + 1);
  });
});
