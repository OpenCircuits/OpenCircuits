import {A_KEY} from "core/utils/Constants";

import {Event} from "core/utils/Events";
import {CircuitInfo} from "core/utils/CircuitInfo";

import {CreateGroupSelectAction} from "core/actions/selection/SelectAction";

import {EventHandler} from "../EventHandler";


export const SelectAllHandler: EventHandler = ({
    conditions: (event: Event, {input}: CircuitInfo) =>
        (event.type === "keydown" && event.key === A_KEY && input.isModifierKeyDown()),

    getResponse: ({history, designer, selections}: CircuitInfo) =>
        history.add(CreateGroupSelectAction(selections, designer.getObjects()).execute())
});
