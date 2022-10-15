import {CircuitInfo}       from "core/utils/CircuitInfo";
import {InputManagerEvent} from "core/utils/InputManager";

import {EventHandler} from "../EventHandler";


export const SaveHandler = (save: () => void): EventHandler => ({
    conditions: (event: InputManagerEvent, { input }: CircuitInfo) =>
        (event.type === "keydown" && event.key === "s" && input.isModifierKeyDown()),

    getResponse: () => {
        save();
    },
});
