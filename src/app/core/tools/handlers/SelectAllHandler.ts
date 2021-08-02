import {A_KEY} from "core/utils/Constants";

import {Event} from "core/utils/Events";
import {CircuitInfo} from "core/utils/CircuitInfo";

import {CreateGroupSelectAction} from "core/actions/selection/SelectAction";

import {EventHandler} from "../EventHandler";


export const SelectAllHandler: EventHandler = ({
    conditions: (event: Event, {input, designer, selections}: CircuitInfo) =>
        (event.type === "keydown" &&
         event.key === A_KEY &&
         input.isModifierKeyDown() &&
         // Don't want to select all if nothing to select or everything is already selected
         selections.amount() > 0 &&
         selections.amount() !== designer.getObjects().length),

    getResponse: ({history, designer, selections}: CircuitInfo) =>
        history.add(CreateGroupSelectAction(selections, designer.getObjects()).execute())
});
