import {Matcher, screen} from "@testing-library/react";


declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace jest {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface Matchers<R> {
            toBeToggledOn(): CustomMatcherResult;
            toBeToggledOff(): CustomMatcherResult;
        }
    }
}

expect.extend({
    toBeToggledOn(received: Matcher) {
        const buttons = screen.getByText(received).parentNode!.querySelectorAll("img");
        const downButton = buttons[0].src.includes("Down") ? buttons[0] : buttons[1];

        return {
            message: () => `expected toggle with label "${received}" to be toggled on`,
            pass:    downButton.style.display !== "none",
        };
    },

    toBeToggledOff(received: Matcher) {
        const buttons = screen.getByText(received).parentNode!.querySelectorAll("img");
        const downButton = buttons[0].src.includes("Down") ? buttons[0] : buttons[1];

        return {
            message: () => `expected toggle with label "${received}" to be toggled on`,
            pass:    downButton.style.display === "none",
        };
    },
});
