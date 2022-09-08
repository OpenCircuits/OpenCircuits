import {V, Vector} from "Vector";

import {RectContains,
        TransformContains} from "math/MathUtils";
import {Transform} from "math/Transform";

import {CircuitInfo} from "core/utils/CircuitInfo";
import {GetAllPorts} from "core/utils/ComponentUtils";
import {Event}       from "core/utils/Events";

import {GroupAction} from "core/actions/GroupAction";

import {DeselectAll, SelectGroup} from "core/actions/units/Select";


export const SelectionBoxTool = (() => {
    let p1: Vector, p2: Vector;

    return {
        shouldActivate(event: Event, { locked, input, selections, currentlyPressedObject }: CircuitInfo): boolean {
            if (locked)
                return false;
            // Activate if the user began dragging on empty canvas
            return (event.type === "mousedrag" &&
                    input.getTouchCount() === 1 &&
                    !selections.isDisabled() &&
                    currentlyPressedObject === undefined);
        },
        shouldDeactivate(event: Event, {}: CircuitInfo): boolean {
            // Deactivate if stopped dragging
            return (event.type === "mouseup");
        },


        onActivate({}: Event, { input }: CircuitInfo): void {
            p1 = input.getMouseDownPos();
            p2 = input.getMousePos();
        },
        onDeactivate({}: Event, { input, camera, history, designer, selections }: CircuitInfo): void {
            const action = new GroupAction([], "Selection Box Tool");

            // Clear selections if shift key isn't being held
            if (!input.isShiftKeyDown())
                action.add(DeselectAll(selections));

            const box = Transform.FromCorners(camera.getWorldPos(p1), camera.getWorldPos(p2));

            // Find all objects within the selection box
            const objects = designer.getObjects().filter((o) => TransformContains(box, o.getTransform()));
            if (objects.length > 0) {
                history.add(action.add(SelectGroup(selections, objects)));
                return;
            }

            // If no regular objects were found
            //  then see if any ports were within the box
            const ports = GetAllPorts(designer.getObjects())
                .filter((p) => RectContains(box, p.getWorldTargetPos()));

            if (ports.length > 0) {
                history.add(action.add(SelectGroup(selections, ports)));
                return;
            }

            // If no ports then just return
            history.add(action);
        },


        onEvent(event: Event, { input }: CircuitInfo): boolean {
            if (event.type !== "mousedrag")
                return false;

            p2 = input.getMousePos();

            // Return true since we did something
            //  that requires a re-render
            return true;
        },

        getP1(): Vector {
            return V(p1)
        },
        getP2(): Vector {
            return V(p2);
        },
    }
})();
