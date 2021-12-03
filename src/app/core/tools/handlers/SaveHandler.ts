import {S_KEY} from "core/utils/Constants";

import {CircuitInfo} from "core/utils/CircuitInfo";
import {Event} from "core/utils/Events";

import {EventHandler} from "../EventHandler";


export const SaveHandler = (save: () => void): EventHandler => {
    return ({
        conditions: (event: Event, {input}: CircuitInfo) =>
            (event.type === "keydown" && event.key === S_KEY && input.isModifierKeyDown()),

        getResponse: () => {
            save();
        }
    });
}
