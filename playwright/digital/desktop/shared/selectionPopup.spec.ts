import {expect, test} from "@playwright/test";

import {pageActions} from "shared/helpers/actions";

test("Basic Selection Popup", async ({ page }) => {
    const { openItemnav } = pageActions(page, false);

    await page.goto("/");

    const main = page.locator("main");
    await expect(main).toBeVisible();

    // Open itemnav
    await openItemnav();

    await page.getByRole("button", { name: "Constant Low", exact: true }).dragTo(main, {
        targetPosition: { x: 600, y: 300 },
    });

    // TODO: Investigate role/title/etc. to see if we can make a better locator than data-testid
    const selectionPopup = page.getByTestId("selection-popup");
    await expect(selectionPopup).not.toBeVisible();
    // Prevents flakiness by waiting for the component to exist in the circuit before selecting
    expect(await page.evaluate(() => window.Circuit.getComponents())).toHaveLength(1);

    main.click({ position: { x: 600, y: 300 } });

    await expect(selectionPopup).toBeVisible();

    // Ensure sections are visible
    await expect(selectionPopup.getByText("Position")).toBeVisible();
    await expect(selectionPopup.getByText("Angle")).toBeVisible();
    await expect(selectionPopup.getByText("Replace Component")).toBeVisible();

    const compId: string = await page.evaluate(() => window.Circuit.getComponents().find(({ kind }) => kind === "ConstantLow").id);
    expect(compId).toBeDefined();
    expect(typeof compId).toBe("string");
    const initProps: { x: number, y: number } = await (page.evaluate((compId) => window.Circuit.getComponent(compId).getProps(), compId));
    expect(initProps.x).toBeDefined();
    expect(initProps.y).toBeDefined();
    // TODO: Make this locator nicer when the selection popup uses labels better
    const posInputsLocator = selectionPopup.getByText("Position").locator("xpath=..").locator("input");
    // Same rounding as the UI uses
    const roundNumber = (v: number) => `${parseFloat(v.toFixed(2))}`;
    expect(posInputsLocator.locator("nth=0")).toHaveValue(roundNumber(initProps.x));
    expect(posInputsLocator.locator("nth=1")).toHaveValue(roundNumber(initProps.y));

});
