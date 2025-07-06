import {Locator, Page} from "@playwright/test";


const DESKTOP_ITEMNAV_OPEN_BUTTON = {
    x: 30,
    y: 30,
}
const DESKTOP_ITEMNAV_CLOSE_BUTTON = {
    x: 215,
    y: 30,
}
const MOBILE_ITEMNAV_OPEN_BUTTON = {
    x: 30,
    y: 30,
}
const MOBILE_ITEMNAV_CLOSE_BUTTON = {
    x: 30,
    y: 225,
}

export const pageActions = (page: Page, isMobile?: boolean) => {
    const main = page.locator("main");
    const interact = async (locator: Locator) => {
        await (isMobile ? locator.tap() : locator.click());
    }

    const openItemnav = async () => {
        await (isMobile ? main.tap({ position: MOBILE_ITEMNAV_OPEN_BUTTON }) : main.click({ position: DESKTOP_ITEMNAV_OPEN_BUTTON }));
    }
    const closeItemnav = async () => {
        await (isMobile ? main.tap({ position: MOBILE_ITEMNAV_CLOSE_BUTTON }) : main.click({ position: DESKTOP_ITEMNAV_CLOSE_BUTTON }));
    }

    const togglePropagationMenu = async () => {
        await interact(page.getByRole("button", { name: "Step" }).nth(1));
    }
    const togglePausePropagation = async () => {
        await interact(page.getByRole("button", { name: "Pause" }));
    }
    const stepPropagation = async () => {
        await interact(page.getByRole("button", { name: "Step" }).first());
    }

    return { openItemnav, closeItemnav, togglePropagationMenu, togglePausePropagation, stepPropagation }
}
