import {expect, test} from "@playwright/test";

import {pageActions} from "shared/helpers/actions";


test("Basic Switch/LED Test", async ({ page }) => {
    const { openItemnav, closeItemnav, togglePropagationMenu, togglePausePropagation, stepPropagation } = pageActions(page, true);

    await page.goto("/");

    const main = page.locator("main");
    await expect(main).toBeVisible();

    // Open itemnav
    await openItemnav();

    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: "Switch", exact: true }).tap();
    await page.waitForTimeout(1000);
    await main.tap({
        position: {
            x: 100,
            y: 200,
        },
    });

    expect(await page.evaluate(() => window.Circuit.getComponents())).toHaveLength(1);

    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: "LED", exact: true }).tap();
    await page.waitForTimeout(1000);
    await main.tap({
        position: {
            x: 300,
            y: 200,
        },
    });
    expect(await page.evaluate(() => window.Circuit.getComponents())).toHaveLength(2);

    // Close itemnav
    await closeItemnav();

    // Connect components
    await main.tap({
        position: {
            x: 165,
            y: 200,
        },
    });
    await main.tap({
        position: {
            x: 300,
            y: 300,
        },
    });
    expect(await page.evaluate(() => window.Circuit.getWires())).toHaveLength(1);

    // We will pause the simulation and manually advance it to test the state propagation
    await togglePropagationMenu();
    await togglePausePropagation();

    const ledId = await page.evaluate(() => window.Circuit.getComponents().find(({ kind }) => kind === "LED").id);
    expect(await (page.evaluate((ledId) => window.Circuit.getComponent(ledId).allPorts[0].signal, ledId))).toBe(0);
    // Toggle on and off
    await main.tap({
        position: {
            x: 100,
            y: 200,
        },
    });
    expect(await (page.evaluate((ledId) => window.Circuit.getComponent(ledId).allPorts[0].signal, ledId))).toBe(0);
    await stepPropagation();
    expect(await (page.evaluate((ledId) => window.Circuit.getComponent(ledId).allPorts[0].signal, ledId))).toBe(1);
    await main.tap({
        position: {
            x: 100,
            y: 200,
        },
    });
    expect(await (page.evaluate((ledId) => window.Circuit.getComponent(ledId).allPorts[0].signal, ledId))).toBe(1);
    await stepPropagation();
    expect(await (page.evaluate((ledId) => window.Circuit.getComponent(ledId).allPorts[0].signal, ledId))).toBe(0);
});
