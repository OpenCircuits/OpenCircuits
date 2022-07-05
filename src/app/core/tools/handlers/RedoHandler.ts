import {CircuitInfo} from "core/utils/CircuitInfo";
import {Event}       from "core/utils/Events";

import {EventHandler} from "../EventHandler";


export const RedoHandler: EventHandler = ({
    conditions: (event: Event, { input }: CircuitInfo) =>
        (event.type === "keydown" &&
         (event.key === "z" && input.isModifierKeyDown() && input.isShiftKeyDown() ||
          event.key === "y" && input.isModifierKeyDown())),

    getResponse: ({ history }: CircuitInfo) => history.redo(),
});
