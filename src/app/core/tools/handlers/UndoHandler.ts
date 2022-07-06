import {CircuitInfo} from "core/utils/CircuitInfo";
import {Event}       from "core/utils/Events";

import {EventHandler} from "../EventHandler";


export const UndoHandler: EventHandler = ({
    conditions: (event: Event, { input }: CircuitInfo) =>
        (event.type === "keydown" && event.key === "z" && input.isModifierKeyDown()),

    getResponse: ({ history }: CircuitInfo) => history.undo(),
});
