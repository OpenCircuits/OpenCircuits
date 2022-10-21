import {CircuitInfo}       from "core/utils/CircuitInfo";
import {InputManagerEvent} from "core/utils/InputManager";

import {SelectGroup} from "core/actions/units/Select";

import {EventHandler} from "../EventHandler";


export const SelectAllHandler: EventHandler = ({
    conditions: (event: InputManagerEvent, { input, circuit, selections }: CircuitInfo) =>
        (event.type === "keydown" &&
         event.key === "a" &&
         input.isModifierKeyDown() &&
         // Don't want to select all if nothing to select or everything is already selected
         circuit.getObjs().length > 0 &&
         circuit.getObjs().length !== selections.amount()),

    getResponse: ({ history, circuit, selections }: CircuitInfo) =>
        history.add(SelectGroup(selections, circuit.getObjs().map((o) => o.id))),
});
