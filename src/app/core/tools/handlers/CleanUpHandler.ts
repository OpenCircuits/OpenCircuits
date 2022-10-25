import {V} from "Vector";

import {CircuitInfo}       from "core/utils/CircuitInfo";
import {InputManagerEvent} from "core/utils/InputManager";
import {SnapToGrid}        from "core/utils/SnapUtils";

import {GroupAction} from "core/actions/GroupAction";

import {SetTransform} from "core/actions/compositions/SetTransform";

import {AnyComponent} from "core/models/types";

import {EventHandler} from "../EventHandler";


export const CleanUpHandler: EventHandler = ({
    conditions: (event: InputManagerEvent, { circuit }: CircuitInfo) =>
        (event.type === "keydown" &&
         event.key === "k" &&
         // Don't want to clean up if nothing exists
         circuit.getObjs().length > 0),

    getResponse: ({ circuit, history, selections }: CircuitInfo) => {
        // If nothing is selected, select all units.
        const components = (
            selections.amount() === 0
            ? circuit.getObjs()
            : selections.get().map((id) => circuit.getObj(id)!)
        ).filter((o) => (o.baseKind === "Component")) as AnyComponent[];

        if (components.length === 0)
            return;

        history.add(new GroupAction(components.map((c) =>
            // Snap pos to grid and set angle to 0
            SetTransform(circuit, c.id, SnapToGrid(V(c.x, c.y)), 0)),
        "Clean Up Handler"));
    },
});
