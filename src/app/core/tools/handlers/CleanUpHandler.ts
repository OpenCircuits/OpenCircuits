import {K_KEY} from "core/utils/Constants";

import {Event} from "core/utils/Events";
import {CircuitInfo} from "core/utils/CircuitInfo";
import {Component} from "core/models";
import { Snap } from "core/utils/ComponentUtils";

import {EventHandler} from "../EventHandler";

import {GroupAction} from "core/actions/GroupAction";
import {RotateAction} from "core/actions/transform/RotateAction";
import {TranslateAction} from "core/actions/transform/TranslateAction";




export const CleanUpHandler: EventHandler = ({
    conditions: (event: Event, {designer}: CircuitInfo) =>
        (event.type === "keydown" &&
         event.key === K_KEY &&
         // Don't want to select all if nothing to select or everything is already selected
         designer.getObjects().length > 0),

    getResponse: ({history,designer,selections}: CircuitInfo) => {
        // Reset the selected units' angle to 0.
        // If nothing is selected, select all units.
        const action = new GroupAction();
        const components = (selections.amount() == 0) ? (designer.getObjects() as Component[]) : (selections.get() as Component[]);
        action.add(
            components.map(c => 
                new RotateAction([c], c.getPos(), [c.getAngle()], [0])
        ));
        action.add(
            new TranslateAction(
                components,
                components.map(o => o.getPos()),
                components.map(o => Snap(o.getPos()))
            )
        );

        history.add(action.execute()); 
    }
});