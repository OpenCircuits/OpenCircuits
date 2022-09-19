import {expect, test} from "@playwright/test";

import {ITEMNAV_CLOSE_BUTTON, ITEMNAV_OPEN_BUTTON} from "../DesktopConstants.js";


test("Basic Switch/LED Test", async ({ page }, testInfo) => {
    // Remove OS extension from snapshot file name
    // testInfo.snapshotSuffix = "";

    // await page.goto("http://opencircuits.io/");
    await page.goto("http://localhost:3000/");

    const main = page.locator("main");
    const canvas = page.locator("main >> canvas");
    await expect(main).toBeVisible();

    // Open itemnav
    await main.click({
        position: ITEMNAV_OPEN_BUTTON,
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
    // await page.locator("nav >> text=Switch >> button").click();
    // await main.click({
    //     position: {
    //         x: 400,
    //         y: 200,
    //     },
    // });
    // // await expect(canvas).toHaveScreenshot("switchPlaced.png");

    // await page.locator("nav >> text=LED >> button").click();
    // await main.click({
    //     position: {
    //         x: 600,
    //         y: 200,
    //     },
    // });
    // // await expect(canvas).toHaveScreenshot("ledPlaced.png");

    // // Close itemnav
    // await main.click({
    //     position: ITEMNAV_CLOSE_BUTTON,
    // });
    // // await expect(canvas).toHaveScreenshot("itemnavClosed.png");

    // // Connect components
    // await main.click({
    //     position: {
    //         x: 465,
    //         y: 200,
    //     },
    // });
    // await main.click({
    //     position: {
    //         x: 600,
    //         y: 300,
    //     },
    // });
    // await expect(canvas).toHaveScreenshot("connectedOff.png");

    // // Toggle on and off
    // await main.click({
    //     position: {
    //         x: 400,
    //         y: 200,
    //     },
    // });
    // await expect(canvas).toHaveScreenshot("connectedOn.png");
    // await main.click({
    //     position: {
    //         x: 400,
    //         y: 200,
    //     },
    // });
    // await expect(canvas).toHaveScreenshot("connectedOff.png");

    await page.locator("nav >> text=Demux >> button").click();
    await main.click({
        position: {
            x: 400,
            y: 600,
        },
    });
    await expect(canvas).toHaveScreenshot("demultiplexer.png");
});
