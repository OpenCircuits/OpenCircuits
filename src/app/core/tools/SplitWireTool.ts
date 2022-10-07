import {GRID_SIZE, LEFT_MOUSE_BUTTON} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {CircuitInfo} from "core/utils/CircuitInfo";
import {Event}       from "core/utils/Events";

import {GroupAction} from "core/actions/GroupAction";

import {SplitWire} from "core/actions/compositions/SplitWire";

import {DeselectAll, Select} from "core/actions/units/Select";
import {Translate}           from "core/actions/units/Translate";

import {Tool} from "core/tools/Tool";

import {Node, Wire} from "core/models";


export const SplitWireTool: Tool = (() => {
    let initialPosition: Vector;
    let port: Node;
    let action: GroupAction;

    function snap(p: Vector): Vector {
        return V(Math.floor(p.x/GRID_SIZE + 0.5) * GRID_SIZE,
                 Math.floor(p.y/GRID_SIZE + 0.5) * GRID_SIZE);
    }

    return {
        shouldActivate(event: Event, { locked, input, currentlyPressedObject }: CircuitInfo): boolean {
            if (locked)
                return false;
            // Activate if the user dragged over a wire with 1 touch/finger
            return (event.type === "mousedrag" && event.button === LEFT_MOUSE_BUTTON &&
                    input.getTouchCount() === 1 &&
                    currentlyPressedObject instanceof Wire);
        },
        shouldDeactivate(event: Event, {}: CircuitInfo): boolean {
            // Deactivate if stopped dragging by releasing mouse
            return (event.type === "mouseup");
        },


        onActivate({}: Event, info: CircuitInfo): void {
            const { input, camera, designer, selections, currentlyPressedObject } = info;

            const wire = currentlyPressedObject as Wire;

            // Create wireport and set its position to the mouse
            port = wire.split();
            port.setPos(camera.getWorldPos(input.getMouseDownPos()));

            action = new GroupAction([], "Split Wire Tool");

            // Set wireport as selection and being pressed
            action.add(DeselectAll(selections));
            action.add(Select(selections, port));
            action.add(SplitWire(designer, wire, port));

            info.currentlyPressedObject = port;

            // Set initial position
            initialPosition = camera.getWorldPos(input.getMouseDownPos());
        },
        onDeactivate({}: Event, { history }: CircuitInfo): void {
            history.add(action.add(Translate([port], [port.getPos()])));
        },


        onEvent(event: Event, info: CircuitInfo): boolean {
            if (event.type !== "mousedrag")
                return false;

            const { input, camera } = info;

            const worldMouseDownPos = camera.getWorldPos(input.getMouseDownPos());
            const worldMousePos = camera.getWorldPos(input.getMousePos());

            const dPos = worldMousePos.sub(worldMouseDownPos);

            // Calculate new position and get snapped positions if shift is held
            const curPosition = initialPosition.add(dPos);
            const newPosition = input.isShiftKeyDown() ? snap(curPosition) : curPosition;

            // Execute translate but don't save to group
            //  action since we do that onDeactivate
            Translate([port], [newPosition]);

            return true;
        },
    }
})();
