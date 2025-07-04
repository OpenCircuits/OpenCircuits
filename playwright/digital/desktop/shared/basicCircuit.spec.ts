import {expect, test} from "@playwright/test";

import {pageActions} from "shared/helpers/actions";


test("Basic Switch/LED Test", async ({ page }) => {
    const { openItemnav, closeItemnav, togglePropagationMenu, togglePausePropagation, stepPropagation } = pageActions(page, false);

    await page.goto("/");

    const main = page.locator("main");
    await expect(main).toBeVisible();

    // Open itemnav
    await openItemnav();

    await page.getByRole("button", { name: "Switch", exact: true }).dragTo(main, {
        targetPosition: { x: 400, y: 200 },
    });

    expect(await page.evaluate(() => window.Circuit.getComponents())).toHaveLength(1);

    await page.getByRole("button", { name: "LED", exact: true }).dragTo(main, {
        targetPosition: { x: 600, y: 200 },
    });
    expect(await page.evaluate(() => window.Circuit.getComponents())).toHaveLength(2);

    // Close itemnav
    await closeItemnav();

    // Connect components
    await main.click({
        position: {
            x: 465,
            y: 200,
        },
    })
    await main.click({
        position: {
            x: 600,
            y: 300,
        },
    })
    // .dragTo seems flakey when connecting wires for some reason so use clicks instead
    // await main.dragTo(main, {
    //     sourcePosition: { x: 465, y: 200 },
    //     targetPosition: { x: 600, y: 300 },
    // });
    expect(await page.evaluate(() => window.Circuit.getWires())).toHaveLength(1);

    // We will pause the simulation and manually advance it to test the state propagation
    await togglePropagationMenu();
    await togglePausePropagation();

    expect(await page.evaluate(() => window.Circuit.getComponents().find(({ kind }) => kind === "LED").allPorts[0].signal)).toBe(0);
    // Toggle on and off
    await main.click({
        position: {
            x: 400,
            y: 200,
        },
    });
    expect(await page.evaluate(() => window.Circuit.getComponents().find(({ kind }) => kind === "LED").allPorts[0].signal)).toBe(0);
    await stepPropagation();
    expect(await page.evaluate(() => window.Circuit.getComponents().find(({ kind }) => kind === "LED").allPorts[0].signal)).toBe(1);
    await main.click({
        position: {
            x: 400,
            y: 200,
        },
    });
    expect(await page.evaluate(() => window.Circuit.getComponents().find(({ kind }) => kind === "LED").allPorts[0].signal)).toBe(1);
    await stepPropagation();
    expect(await page.evaluate(() => window.Circuit.getComponents().find(({ kind }) => kind === "LED").allPorts[0].signal)).toBe(0);
});
