import { test, expect } from '@playwright/test';

test.describe('homepage feature testing', ()=>{
    test.beforeEach('open page', async ({page})=>{
        await page.goto('/')
        await expect.soft(page).toHaveTitle('Ye Gamer\'s Guild')
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
            await expect(img.nth(0)).toHaveAttribute('src', src)
            await expect(img.nth(0)).toHaveAttribute('alt', alt)
        });
    });
    test('testing google map', async ({page})=>{
        const mapEl = page.getByRole('figure',{name:'Google Map'})
        await expect.soft(mapEl).toBeVisible()
        const pinLink = page.locator('gmp-advanced-marker')
        await expect.soft(pinLink).toBeVisible()
        await pinLink.click()
        await expect(page).toHaveURL(/www\.google\.com\/maps\/place\/Ye\+Gamer\'s\+Guild/)
    });
});