import {expect, test} from "@playwright/test";

import {ITEMNAV_CLOSE_BUTTON, ITEMNAV_OPEN_BUTTON} from "../MobileConstants.js";


test("Basic Switch/LED Test", async ({ page }) => {
    // Remove OS extension from snapshot file name
    // testInfo.snapshotSuffix = "";

    // await page.goto("http://opencircuits.io/");
    await page.goto("/");

    const main = page.locator("main");
    const canvas = page.locator("main >> canvas");
    await expect(main).toBeVisible();
    const mainBox = (await main.boundingBox())!;
    expect(mainBox).not.toBeNull();

    // Open itemnav
    await main.tap({
        position: {
            x: mainBox.width - ITEMNAV_OPEN_BUTTON.x,
            y: mainBox.height - ITEMNAV_OPEN_BUTTON.y,
        },
    });
    // toHaveScreenshot skips the css opening animation
    // await expect(canvas).toHaveScreenshot("itemnavOpen.png");

    // TODO: Figure out why drag and drop doesn't work
    // await page.dragAndDrop("nav >> text=Button >> button", "main", {
    //     targetPosition: {
    //         x: 400,
    //         y: 100,
    //     },
    // });
    await page.locator("nav >> text=Switch >> button").tap();
    await main.tap({
        position: {
            x: 100,
            y: 200,
        },
    });
    // await expect(canvas).toHaveScreenshot("switchPlaced.png");

    await page.locator("nav >> text=LED >> button").tap();
    await main.tap({
        position: {
            x: 300,
            y: 200,
        },
    });
    // await expect(canvas).toHaveScreenshot("ledPlaced.png");

    // Close itemnav
    await main.tap({
        position: {
            x: mainBox.width - ITEMNAV_CLOSE_BUTTON.x,
            y: mainBox.height - ITEMNAV_CLOSE_BUTTON.y,
        },
    });
    await expect(canvas).toHaveScreenshot("itemnavClosed.png");

    // TODO: Connecting the components doesn't seem to work

    // Connect components
    // TODO: Connect the components using touch
    // await main.click({
    //     position: {
    //         x: 165,
    //         y: 200,
    //     },
    // });
    // await main.click({
    //     position: {
    //         x: 300,
    //         y: 300,
    //     },
    // });
    // await expect(canvas).toHaveScreenshot("connectedOff.png");

    // Toggle on and off
    // await main.tap({
    //     position: {
    //         x: 100,
    //         y: 200,
    //     },
    // });
    // await expect(canvas).toHaveScreenshot("connectedOn.png");
    // await main.tap({
    //     position: {
    //         x: 100,
    //         y: 200,
    //     },
    // });
    // await expect(canvas).toHaveScreenshot("connectedOff.png");
});
