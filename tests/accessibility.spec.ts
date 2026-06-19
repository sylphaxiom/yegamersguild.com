import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright'; // 1

test.describe('homepage accessibility testing', () => { // 2
  test.beforeEach('open page', async ({page})=>{
    await page.goto('/')
    await expect(page).toHaveTitle('Ye Gamer\'s Guild')
  });
    test.afterEach('close page', async ({page})=>{
        await page.close()
    });
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    // Wait for CMS content to render — axe must scan a fully loaded page or it will
    // flag false positives like missing <h1> (only appears once header text loads from API).
    await expect(page.locator('figure').first()).not.toBeEmpty({ timeout: 10000 });

    const accessibilityScanResults = await new AxeBuilder({ page }).exclude('#google-map').analyze(); // 4

    expect(accessibilityScanResults.violations).toEqual([]); // 5
  });
});