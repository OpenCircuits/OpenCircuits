import {ESC_KEY} from "core/utils/Constants";

import {Event} from "core/utils/Events";
import {CircuitInfo} from "core/utils/CircuitInfo";

import {EventHandler} from "../EventHandler";
import {CreateDeselectAllAction} from "core/actions/selection/SelectAction";


export const DeselectAllHandler: EventHandler = ({
    conditions: (event: Event, {selections}: CircuitInfo) =>
        (event.type === "keydown" &&
         event.key === ESC_KEY &&
         selections.amount() > 0),

    getResponse: ({history, selections}: CircuitInfo) =>
        history.add(CreateDeselectAllAction(selections).execute())
});
