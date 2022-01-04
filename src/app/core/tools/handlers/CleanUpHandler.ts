import {Event} from "core/utils/Events";
import {CircuitInfo} from "core/utils/CircuitInfo";
import {Snap} from "core/utils/ComponentUtils";

import {Component} from "core/models";

import {GroupAction} from "core/actions/GroupAction";
import {RotateAction} from "core/actions/transform/RotateAction";
import {TranslateAction} from "core/actions/transform/TranslateAction";

import {EventHandler} from "../EventHandler";


export const CleanUpHandler: EventHandler = ({
    conditions: (event: Event, {designer}: CircuitInfo) =>
        (event.type === "keydown" &&
         event.key === "k" &&
         // Don't want to select all if nothing to select or everything is already selected
         designer.getObjects().length > 0),

    getResponse: ({history,designer,selections}: CircuitInfo) => {
        // Reset the selected units' angle to 0 and snap to grid
        // If nothing is selected, select all units.
        const components = (selections.amount() === 0 ?
            designer.getObjects() :
            selections.get().filter(o => o instanceof Component)) as Component[];

        if (components.length === 0)
            return;

        history.add(new GroupAction([
            ...components.map(c =>
                new RotateAction([c], c.getPos(), [c.getAngle()], [0])
            ),
            new TranslateAction(
                components,
                components.map(o => o.getPos()),
                components.map(o => Snap(o.getPos()))
            )
        ]).execute());
    }
});
