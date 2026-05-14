import { test, expect } from '@playwright/test';

test.describe('homepage feature testing', ()=>{
    test.beforeEach('open page', async ({page})=>{
        await page.goto('/')
        await expect(async()=>{expect(page).toHaveTitle('Ye Gamer\'s Guild')}).toPass()
    });

    test.afterEach('close page', async ({page})=>{
        await page.close()
    });

    // tickerImgs - Header.tsx
    [
        {
            key: "pathfinder",
            src: "guild_pathfinder.png",
            alt: "Logo for Pathfinder",
        },
        {
            key: "mtg",
            src: "guild_mtg.jpg",
            alt: "Logo for Magic the Gathering",
        },
        {
            key: "dnd",
            src: "guild_dnd.jpg",
            alt: "Logo for Dungeons and Dragons",
        },
        {
            key: "battletech",
            src: "guild_battletech.png",
            alt: "Logo for Battletech",
        },
        {
            key: "40k",
            src: "guild_40k.jpg",
            alt: "Logo for Warhammer 40k",
        },
    ].forEach(({key,src,alt})=>{
        test(`testing ${key} image from ticker`, async ({page})=>{
            const img = page.getByRole('img',{name:alt})
            // They're all the same bc of the marquee, just use the first one.
            await expect(img.first()).toHaveAttribute('src', src)
            await expect(img.first()).toHaveAttribute('alt', alt)
        });
    });
    test('test inventory button', async ({page})=>{
        const button = page.getByRole('button', { name: 'Check out our inventory' })

        await expect(button).toBeVisible();
        button.click();
        await expect(page).toHaveURL('/shop');
    });

    test('logo image loads', async ({page})=>{
        const logo = page.getByRole('img', { name: /dragon behind a shield/i });
        await expect(logo).toBeVisible();
        await expect(logo).toHaveAttribute('src', /guild_logo/);
    });

    test('mode switch toggles theme', async ({page})=>{
        const html = page.locator('html');
        const modeBtn = page.getByRole('button', { name: 'change mode' });
        await expect(modeBtn).toBeVisible();
        const initialClass = await html.getAttribute('class');
        await modeBtn.click();
        const newClass = await html.getAttribute('class');
        expect(newClass).not.toEqual(initialClass);
        // toggle back
        await modeBtn.click();
        await expect(html).toHaveAttribute('class', initialClass ?? '');
    });

    test('key content sections are visible', async ({page})=>{
        await expect(page.getByText('Your local source for', { exact: false })).toBeVisible({ timeout: 5000 });
        await expect(page.getByRole('heading', { name: 'Located at', exact: false })).toBeVisible({ timeout: 5000 });
        await expect(page.getByRole('heading', { name: 'Hours', exact: false })).toBeVisible({ timeout: 5000 });
        await expect(page.getByRole('heading', { name: 'About The Guild', exact: false })).toBeVisible({ timeout: 5000 });
    });
});