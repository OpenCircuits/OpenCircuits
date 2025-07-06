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
        const button = screen.getByText(received).parentElement;
        if (!(button instanceof HTMLDivElement)) {
            return {
                message: () => `expected "${received}"'s parent to be a div!`,
                pass:    false,
            };
        }

        const checked = button.getAttribute("aria-checked");

        return {
            message: () => `expected toggle with label "${received}" to be toggled on (${checked})`,
            pass:    checked === "true",
        };
    },

    toBeToggledOff(received: Matcher) {
        const button = screen.getByText(received).parentElement!;
        if (!(button instanceof HTMLDivElement)) {
            return {
                message: () => `expected "${received}"'s parent to be a div!`,
                pass:    false,
            };
        }

        const checked = button.getAttribute("aria-checked");

        return {
            message: () => `expected toggle with label "${received}" to be toggled off (${checked})`,
            pass:    checked === "false",
        };
    },
});
