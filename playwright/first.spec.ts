import {expect, test} from "@playwright/test";


test("Basic Switch/LED Test", async ({ page }) => {
    await page.goto("http://localhost:3000/");

    await page.locator("main").click({
        position: {
            x: 30,
            y: 30,
        },
    });

    await expect(page.locator("main")).toHaveScreenshot("itemnavOpenDesktop.png");
    // locator
});
