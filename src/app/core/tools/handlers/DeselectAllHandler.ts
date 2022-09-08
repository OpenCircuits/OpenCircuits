import {CircuitInfo} from "core/utils/CircuitInfo";
import {Event}       from "core/utils/Events";

import {DeselectAll} from "core/actions/units/Select";

import {EventHandler} from "../EventHandler";


export const DeselectAllHandler: EventHandler = ({
    conditions: (event: Event, { selections }: CircuitInfo) =>
        (event.type === "keydown" &&
         event.key === "Escape" &&
         selections.amount() > 0),

    getResponse: ({ history, selections }: CircuitInfo) =>
        history.add(DeselectAll(selections)),
});
