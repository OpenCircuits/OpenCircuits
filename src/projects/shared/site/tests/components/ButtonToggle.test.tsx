import "@testing-library/jest-dom";
import {Matcher, render, screen} from "@testing-library/react";
import userEvent                 from "@testing-library/user-event";

import {ButtonToggle} from "shared/site/components/ButtonToggle";


/**
 * Gets the ButtonToggle or SwitchToggle image elements associated with the provided text.
 * The pressed image will be returned first and the unpressed second.
 *
 * @param id The id of the text to search for.
 * @returns  An array containing the pressed and unpressed images, respectively.
 */
function GetToggles(id: Matcher): [HTMLImageElement, HTMLImageElement] {
    const buttons = screen.getByText(id).parentNode!.querySelectorAll("img");
    return buttons[0].alt.includes("on")
        ? [buttons[0], buttons[1]]
        : [buttons[1], buttons[0]];
}

describe("Button Toggle", () => {
    test("Button on", () => {
        render(<ButtonToggle isOn>test</ButtonToggle>);
        const [buttonOn, buttonOff] = GetToggles("test");
        expect(buttonOn).toBeVisible();
        expect(buttonOff).not.toBeVisible();
    });
    test("Button off", () => {
        render(<ButtonToggle isOn={false}>test</ButtonToggle>);
        const [buttonOn, buttonOff] = GetToggles("test");
        expect(buttonOn).not.toBeVisible();
        expect(buttonOff).toBeVisible();
    });
    test("onChange", async () => {
        let testBoolean = false;
        const user = userEvent.setup();
        render(<ButtonToggle isOn={testBoolean} onChange={() => testBoolean = !testBoolean}>test</ButtonToggle>);
        const [buttonOn, buttonOff] = GetToggles("test");
        expect(buttonOn).not.toBeVisible();
        expect(buttonOff).toBeVisible();
        await user.click(buttonOff);
        expect(testBoolean).toBeTruthy();
        await user.click(buttonOn);
        expect(testBoolean).toBeFalsy();
    });
});
