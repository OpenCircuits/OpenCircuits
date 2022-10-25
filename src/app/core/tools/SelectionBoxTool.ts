import {V, Vector} from "Vector";

import {Rect}      from "math/Rect";
import {Transform} from "math/Transform";

import {CircuitInfo}       from "core/utils/CircuitInfo";
import {InputManagerEvent} from "core/utils/InputManager";

import {GroupAction} from "core/actions/GroupAction";

import {DeselectAll, SelectGroup} from "core/actions/units/Select";


export const SelectionBoxTool = (() => {
    let p1: Vector, p2: Vector;

    return {
        shouldActivate(event: InputManagerEvent, { locked, input, selections, curPressedObjID }: CircuitInfo): boolean {
            if (locked)
                return false;
            // Activate if the user began dragging on empty canvas
            return (event.type === "mousedrag" &&
                    input.getTouchCount() === 1 &&
                    !selections.isDisabled() &&
                    curPressedObjID === undefined);
        },
        shouldDeactivate(event: InputManagerEvent, {}: CircuitInfo): boolean {
            // Deactivate if stopped dragging
            return (event.type === "mouseup");
        },


        onActivate({}: InputManagerEvent, { input }: CircuitInfo): void {
            p1 = input.getMouseDownPos();
            p2 = input.getMousePos();
        },
        onDeactivate({}: InputManagerEvent, { input, camera, history, selections,viewManager }: CircuitInfo): void {
            // Get bounding box for the selections
            const box = Transform.FromCorners(camera.getWorldPos(p1), camera.getWorldPos(p2));

            // Find all objects within the selection box
            const objects = viewManager.findObjects(box);

            const deselectAll = (!input.isShiftKeyDown() && selections.amount() > 0);

            // If nothing was clicked, check if we should deselect and exit
            if (objects.length === 0) {
                // Clear selections if not holding shift
                if (deselectAll)
                    history.add(DeselectAll(selections));
                return;
            }

            // If the user selects a group of objects, we want to only select the components
            //  and ignore any ports that may have also been selected. We only want to
            //  select Ports if they user only selected ports
            const nonPortObjs = objects.filter((o) => (o.baseKind !== "Port"));

            // If there are no non-port objects, then `objects` has all the ports and select them.
            // Otherwise, select just the non-port objects.
            const objsToSelect = ((nonPortObjs.length === 0) ? objects : nonPortObjs);

            history.add(new GroupAction([
                ...(deselectAll ? [DeselectAll(selections)] : []),
                SelectGroup(selections, objsToSelect.map((o) => o.id)),
            ]));
        },


        onEvent(event: InputManagerEvent, { input }: CircuitInfo): boolean {
            if (event.type !== "mousedrag")
                return false;

            p2 = input.getMousePos();

            // Return true since we did something
            //  that requires a re-render
            return true;
        },

        getBounds(): Rect {
            return Rect.FromPoints(p1, p2);
        },
    }
})();
