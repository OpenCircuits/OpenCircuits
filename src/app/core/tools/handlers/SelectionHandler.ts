import {LEFT_MOUSE_BUTTON} from "core/utils/Constants";

import {Event} from "core/utils/Events";
import {CircuitInfo} from "core/utils/CircuitInfo";

import {EventHandler} from "../EventHandler";
import {CreateDeselectAllAction, SelectAction} from "core/actions/selection/SelectAction";
import {GroupAction} from "core/actions/GroupAction";
import {GetAllPorts} from "core/utils/ComponentUtils";
import {Component, Wire} from "core/models";
import {ShiftAction} from "core/actions/ShiftAction";


export const SelectionHandler: EventHandler = ({
    conditions: (event: Event, {}: CircuitInfo) =>
        (event.type === "click" && event.button === LEFT_MOUSE_BUTTON),

    getResponse: ({input, camera, history, designer, selections}: CircuitInfo) => {
        const action = new GroupAction();
        const worldMousePos = camera.getWorldPos(input.getMousePos());

        // Clear previous selections if not holding shift
        if (!input.isShiftKeyDown())
            action.add(CreateDeselectAllAction(selections).execute());

        const ports = GetAllPorts(designer.getObjects());
        const objs = designer.getAll() as (Component | Wire)[];

        // Check if an object was clicked
        const obj = objs.find(o => o.isWithinSelectBounds(worldMousePos));

        // // If we clicked the port and also hit a wire,
        // //  we want to prioritize the port
        // if (obj instanceof Wire && ports.some(p => p.isWithinSelectBounds(worldMousePos)))
        //     return action;

        // Select object
        if (obj) {
            const deselect = (input.isShiftKeyDown() && selections.has(obj));
            action.add(new SelectAction(selections, obj, deselect).execute());
            action.add(new ShiftAction(designer, obj).execute());
        }

        history.add(action);
    }
});
