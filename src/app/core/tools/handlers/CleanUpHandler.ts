import {CircuitInfo} from "core/utils/CircuitInfo";
import {Snap}        from "core/utils/ComponentUtils";
import {Event}       from "core/utils/Events";

import {GroupAction} from "core/actions/GroupAction";

import {Rotate}    from "core/actions/units/Rotate";
import {Translate} from "core/actions/units/Translate";

import {Component} from "core/models";

import {EventHandler} from "../EventHandler";


export const CleanUpHandler: EventHandler = ({
    conditions: (event: Event, { designer }: CircuitInfo) =>
        (event.type === "keydown" &&
         event.key === "k" &&
         // Don't want to select all if nothing to select or everything is already selected
         designer.getObjects().length > 0),

    getResponse: ({ history,designer,selections }: CircuitInfo) => {
        // Reset the selected units' angle to 0 and snap to grid
        // If nothing is selected, select all units.
        const components = (selections.amount() === 0 ?
            designer.getObjects() :
            selections.get().filter((o) => o instanceof Component)) as Component[];

        if (components.length === 0)
            return;

        history.add(new GroupAction([
            ...components.map((c) => Rotate(c, 0)),
            Translate(components, components.map((o) => Snap(o.getPos()))),
        ], "Clean Up Handler"));
    },
});
