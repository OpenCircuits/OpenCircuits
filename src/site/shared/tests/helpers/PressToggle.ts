import {Matcher, screen} from "@testing-library/react";
import {UserEvent}       from "@testing-library/user-event/dist/types/setup";


/**
 * Presses a button or switch toggle.
 *
 * @param id   The id of the text associated with the toggle.
 * @param user The UserEvent to use to press the toggle.
 * @throws An error if neither of the toggle's images are visible.
 */
export async function PressToggle(id: Matcher, user: UserEvent) {
    const button = [...screen.getByText(id).parentNode!.querySelectorAll("img")]
                              .find((button) => button.style.display !== "none");
    if (!button)
        throw new Error("Neither image state of the toggle is visible");
    await user.click(button);
}
