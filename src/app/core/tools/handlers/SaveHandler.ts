import {CircuitInfo} from "core/utils/CircuitInfo";
import {Event}       from "core/utils/Events";

import {EventHandler} from "../EventHandler";


export const SaveHandler = (save: () => void): EventHandler => ({
    conditions: (event: Event, { input }: CircuitInfo) =>
        (event.type === "keydown" && event.key === "s" && input.isModifierKeyDown()),

    getResponse: () => {
        save();
    },
});
