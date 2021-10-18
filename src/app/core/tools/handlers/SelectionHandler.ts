import {LEFT_MOUSE_BUTTON} from "core/utils/Constants";

import {Event} from "core/utils/Events";
import {CircuitInfo} from "core/utils/CircuitInfo";

import {EventHandler} from "../EventHandler";
import {CreateDeselectAllAction, SelectAction} from "core/actions/selection/SelectAction";
import {GroupAction} from "core/actions/GroupAction";
import {GetAllPorts} from "core/utils/ComponentUtils";
import {Component, Wire} from "core/models";
import {ShiftAction} from "core/actions/ShiftAction";
import {WiringTool} from "../WiringTool";

export const SelectionHandler: EventHandler = ({
    conditions: (event: Event, {}: CircuitInfo) =>
        (event.type === "click" && event.button === LEFT_MOUSE_BUTTON),

    getResponse: (info: CircuitInfo) => {
        const {input, camera, history, designer, selections} = info;
        const action = new GroupAction();
        const worldMousePos = camera.getWorldPos(input.getMousePos());

        // Clear previous selections if not holding shift
        if (!input.isShiftKeyDown())
            action.add(CreateDeselectAllAction(selections).execute());

        const ports = GetAllPorts(designer.getObjects().reverse());
        const objs = designer.getAll().reverse() as (Component | Wire)[];

        // Check if an object was clicked
        const obj = objs.find(o => o.isWithinSelectBounds(worldMousePos));

        // If we clicked a port and also hit a wire,
        //  we want to prioritize the port, so skip selecting
        // https://github.com/OpenCircuits/OpenCircuits/issues/624
        //  Also check for ports over the object
        if (!(obj instanceof Wire && ports.some(p => p.isWithinSelectBounds(worldMousePos)) || WiringTool.visiblePorts(info))) {
            // Select object
            if (obj) {
                const deselect = (input.isShiftKeyDown() && selections.has(obj));
                action.add(new SelectAction(selections, obj, deselect).execute());
                action.add(new ShiftAction(designer, obj).execute());
            }
        }

        // https://github.com/OpenCircuits/OpenCircuits/issues/622
        if (!action.isEmpty())
            history.add(action);
    }
});
