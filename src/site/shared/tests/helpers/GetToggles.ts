import {Matcher, screen} from "@testing-library/react";

/**
 * Gets the ButtonToggle or SwitchToggle image elements associated with the provided text.
 * The pressed image will be returned first and the unpressed second.
 *
 * @param id The id of the text to search for.
 * @returns    An array containing the pressed and unpressed images, respectively.
 */
export function GetToggles(id: Matcher): [HTMLImageElement, HTMLImageElement] {
    const buttons = screen.getByText(id).parentNode!.querySelectorAll("img");
    return buttons[0].src.includes("Down")
        ? [buttons[0], buttons[1]]
        : [buttons[1], buttons[0]];
}