import {LEFT_MOUSE_BUTTON} from "core/utils/Constants";

import {CircuitInfo} from "core/utils/CircuitInfo";
import {GetAllPorts} from "core/utils/ComponentUtils";
import {Event}       from "core/utils/Events";

import {GroupAction} from "core/actions/GroupAction";

import {Deselect, DeselectAll, Select} from "core/actions/units/Select";
import {Shift}                         from "core/actions/units/Shift";

import {Wire} from "core/models";

import {EventHandler} from "../EventHandler";


export const SelectionHandler: EventHandler = ({
    conditions: (event: Event, {}: CircuitInfo) =>
        (event.type === "click" && event.button === LEFT_MOUSE_BUTTON),

    getResponse: ({ input, camera, history, designer, selections }: CircuitInfo) => {
        const action = new GroupAction([], "Selection Handler");
        const worldMousePos = camera.getWorldPos(input.getMousePos());

        // Clear previous selections if not holding shift
        if (!input.isShiftKeyDown())
            action.add(DeselectAll(selections));

        const ports = GetAllPorts(designer.getObjects());
        const objs = [...designer.getObjects().reverse(), ...designer.getWires().reverse()];

        // Check if an object was clicked
        const obj = objs.find((o) => o.isWithinSelectBounds(worldMousePos));
        const isWire = (obj instanceof Wire);
        const hitPort = ports.some((p) => p.isWithinSelectBounds(worldMousePos));

        // Only select if object was hit and
        //  if we clicked a port but also hit a wire, we want to prioritize
        //  the port (for WiringTool), so do NOT select
        if (obj && !(hitPort && isWire)) {
            // Select object
            const deselect = (input.isShiftKeyDown() && selections.has(obj));
            action.add((
                deselect
                ? Deselect(selections, obj)
                : Select(selections, obj)
            ));
            action.add(Shift(designer, obj));
        }

        // https://github.com/OpenCircuits/OpenCircuits/issues/622
        if (!action.isEmpty())
            history.add(action);
    },
});
