import {expect, test} from "@playwright/test";


test("test", async ({ page }) => {

  // Go to http://localhost:3000/
  await page.goto("http://localhost:3000/");

  // Click div[role="button"]:has-text("Switch")
  await page.locator("div[role=\"button\"]:has-text(\"Switch\")").click();

  // Click text=x1InputsButtonSwitchConstant LowConstant HighConstant NumberClockOutputsLEDSegme >> canvas
  await page.locator("text=x1InputsButtonSwitchConstant LowConstant HighConstant NumberClockOutputsLEDSegme >> canvas").click({
    position: {
      x: 835,
      y: 255,
    },
  });

  // Click text=x1InputsButtonSwitchConstant LowConstant HighConstant NumberClockOutputsLEDSegme >> canvas
  await page.locator("text=x1InputsButtonSwitchConstant LowConstant HighConstant NumberClockOutputsLEDSegme >> canvas").click();

  // Click text=x1InputsButtonSwitchConstant LowConstant HighConstant NumberClockOutputsLEDSegme >> canvas
  await page.locator("text=x1InputsButtonSwitchConstant LowConstant HighConstant NumberClockOutputsLEDSegme >> canvas").click();

  // Click text=Constant High >> button
  await page.locator("text=Constant High >> button").click();

  // Click text=x1InputsButtonSwitchConstant LowConstant HighConstant NumberClockOutputsLEDSegme >> canvas
  await page.locator("text=x1InputsButtonSwitchConstant LowConstant HighConstant NumberClockOutputsLEDSegme >> canvas").click({
    position: {
      x: 450,
      y: 369,
    },
  });

  // Triple click nav[role="application"] >> text=Clock >> button
  await page.locator("nav[role=\"application\"] >> text=Clock >> button").click({
    clickCount: 3,
  });

  // Click text=x5InputsButtonSwitchConstant LowConstant HighConstant NumberClockOutputsLEDSegme >> canvas
  await page.locator("text=x5InputsButtonSwitchConstant LowConstant HighConstant NumberClockOutputsLEDSegme >> canvas").click({
    position: {
      x: 699,
      y: 333,
    },
  });

  // Click text=x1InputsButtonSwitchConstant LowConstant HighConstant NumberClockOutputsLEDSegme >> canvas
  await page.locator("text=x1InputsButtonSwitchConstant LowConstant HighConstant NumberClockOutputsLEDSegme >> canvas").click();

});
