import {Event} from "core/utils/Events";
import {CircuitInfo} from "core/utils/CircuitInfo";

import {EventHandler} from "../EventHandler";
import {CreateDeselectAllAction} from "core/actions/selection/SelectAction";


export const DeselectAllHandler: EventHandler = ({
    conditions: (event: Event, {selections}: CircuitInfo) =>
        (event.type === "keydown" &&
         event.key === "Escape" &&
         selections.amount() > 0),

    getResponse: ({history, selections}: CircuitInfo) =>
        history.add(CreateDeselectAllAction(selections).execute())
});
