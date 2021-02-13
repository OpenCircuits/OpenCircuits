import {GRID_SIZE}  from "core/utils/Constants";
import {V, Vector} from "Vector";

import {Event}       from "core/utils/Events";
import {CircuitInfo} from "core/utils/CircuitInfo";

import {GroupAction}           from "core/actions/GroupAction";
import {CreateSplitWireAction} from "core/actions/addition/SplitWireAction";
import {TranslateAction}       from "core/actions/transform/TranslateAction";
import {CreateDeselectAllAction,
        SelectAction}          from "core/actions/selection/SelectAction";
import {Tool}                  from "core/tools/Tool";

import {Node, Wire} from "core/models";


export const SplitWireTool: Tool = (() => {
    let initalPosition: Vector;
    let port: Node;
    let action: GroupAction;

    function snap(p: Vector): Vector {
        return V(Math.floor(p.x/GRID_SIZE + 0.5) * GRID_SIZE,
                 Math.floor(p.y/GRID_SIZE + 0.5) * GRID_SIZE);
    }

    return {
        shouldActivate(event: Event, {locked, input, currentlyPressedObject}: CircuitInfo): boolean {
            if (locked)
                return false;
            // Activate if the user dragged over a wire with 1 touch/finger
            return (event.type === "mousedrag" &&
                    input.getTouchCount() === 1 &&
                    currentlyPressedObject instanceof Wire);
        },
        shouldDeactivate(event: Event, {}: CircuitInfo): boolean {
            // Deactivate if stopped dragging by releasing mouse
            return (event.type === "mouseup");
        },


        onActivate({}: Event, info: CircuitInfo): void {
            const {input, camera, designer, selections, currentlyPressedObject} = info;

            const wire = currentlyPressedObject as Wire;

            // Create wireport and set its position to the mouse
            port = wire.split();
            port.setPos(camera.getWorldPos(input.getMouseDownPos()));

            action = new GroupAction();

            // Set wireport as selection and being pressed
            action.add(CreateDeselectAllAction(selections).execute());
            action.add(new SelectAction(selections, port).execute());
            action.add(CreateSplitWireAction(designer, wire, port).execute());

            info.currentlyPressedObject = port;
        },
        onDeactivate({}: Event, {history}: CircuitInfo): void {
            history.add(action.add(new TranslateAction([port], [initalPosition], [port.getPos()])));
        },


        onEvent(event: Event, info: CircuitInfo): boolean {
            if (event.type !== "mousedrag")
                return false;

            const {input, camera} = info;

            const worldMouseDownPos = camera.getWorldPos(input.getMouseDownPos());
            const worldMousePos = camera.getWorldPos(input.getMousePos());

            const dPos = worldMousePos.sub(worldMouseDownPos);

            // Calculate new position and et snapped positions if shift is held
            const curPosition = initalPosition.add(dPos);
            const newPosition = input.isShiftKeyDown() ? snap(curPosition) : curPosition;

            // Execute translate but don't save to group
            //  action since we do that onDeactivate
            new TranslateAction([port], [initalPosition], [newPosition]).execute();

            return true;
        }
    }
})();
