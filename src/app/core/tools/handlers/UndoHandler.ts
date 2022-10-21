import {CircuitInfo}       from "core/utils/CircuitInfo";
import {InputManagerEvent} from "core/utils/InputManager";

import {EventHandler} from "../EventHandler";


export const UndoHandler: EventHandler = ({
    conditions: (event: InputManagerEvent, { input }: CircuitInfo) =>
        (event.type === "keydown" && event.key === "z" && input.isModifierKeyDown()),

    getResponse: ({ history }: CircuitInfo) => history.undo(),
});
