import {expect, test} from "@playwright/test";

import {pageActions} from "shared/helpers/actions";


test("Load first example circuit", async ({ page }) => {
    const { openSidenav } = pageActions(page, false);

    await page.goto("/");

    const main = page.locator("main");
    await expect(main).toBeVisible();

    await openSidenav();

    await page.getByRole("button", { name: "Example: Basic AND Gate Setup" }).click();

    await expect(page.getByRole("progressbar")).not.toBeVisible();

    // Just making sure the circuit loaded, not checking 1:1 for validity
    expect(await page.evaluate(() => window.Circuit.getComponents())).not.toHaveLength(0);
});
