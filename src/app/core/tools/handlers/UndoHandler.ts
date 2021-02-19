import {Z_KEY} from "core/utils/Constants";

import {Event} from "core/utils/Events";
import {CircuitInfo} from "core/utils/CircuitInfo";

import {EventHandler} from "../EventHandler";


export const UndoHandler: EventHandler = ({
    conditions: (event: Event, {input}: CircuitInfo) =>
        (event.type === "keydown" && event.key === Z_KEY && input.isModifierKeyDown()),

    getResponse: ({history}: CircuitInfo) => history.undo()
});
