import {expect, test} from "@playwright/test";


test("Basic Landing Test", async ({ page }) => {
    // Remove OS extension from snapshot file name
    // testInfo.snapshotSuffix = "";

    await page.goto("/");

    await expect(page).toHaveTitle(/Open Circuits/);

    // Expect for there to be no webpack compilation issues
    await expect(page.frameLocator("#webpack-dev-server-client-overlay")
                     .locator("text=Compiled with problems:")).toHaveCount(0);

    const launchSimulator = page.locator("text=Launch Simulator");
    // TODO: Expect the Launch Simulator button to point to something specific
    await expect(launchSimulator).toHaveAttribute("href", /[\S\s]*/);
});
