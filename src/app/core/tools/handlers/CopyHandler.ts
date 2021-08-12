import {C_KEY} from "core/utils/Constants";

import {Event} from "core/utils/Events";
import {CircuitInfo} from "core/utils/CircuitInfo";

import {IOObject} from "core/models";

import {EventHandler} from "../EventHandler";
import {CopyGroup} from "core/utils/ComponentUtils";


export const CopyHandler: EventHandler = ({
    conditions: (event: Event, {input, selections}: CircuitInfo) =>
        (event.type === "keydown" &&
         event.key === C_KEY &&
         input.isModifierKeyDown() &&
         selections.amount() > 0),

    getResponse: ({selections, clipboard}: CircuitInfo) => {
        clipboard.splice(0, clipboard.length, ...CopyGroup(selections.get().filter(o => o instanceof IOObject) as IOObject[]).toList());
    }
});
