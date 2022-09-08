import {LEFT_MOUSE_BUTTON} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {Rect} from "math/Rect";

import {Cursor} from "core/utils/CircuitInfo";
import {Event}  from "core/utils/Events";

import {Action}      from "core/actions/Action";
import {GroupAction} from "core/actions/GroupAction";

import {SetProperty} from "core/actions/units/SetProperty";
import {Shift}       from "core/actions/units/Shift";
import {Translate}   from "core/actions/units/Translate";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";

import {Oscilloscope} from "analog/models/eeobjects";

import {FindEdge} from "./handlers/CursorHandler";


export const ResizeTool = (() => {
    let dir: Vector | undefined;
    let obj: Oscilloscope | undefined;

    let tempAction: Action | undefined;

    return {
        shouldActivate(event: Event, info: AnalogCircuitInfo): boolean {
            // Activate if the user began dragging over an edge
            return (event.type === "mousedrag" &&
                    event.button === LEFT_MOUSE_BUTTON &&
                    info.input.getTouchCount() === 1 &&
                    !!FindEdge(info)[0]);
        },
        shouldDeactivate(event: Event, _: AnalogCircuitInfo): boolean {
            // Deactivate if stopped dragging by releasing mouse
            return (event.type === "mouseup");
        },

        onActivate(event: Event, info: AnalogCircuitInfo): void {
            let cursor: Cursor | undefined;
            [cursor, dir, obj] = FindEdge(info);

            info.cursor = cursor;

            if (event.type === "mousedrag")
                this.onEvent(event, info); // Explicitly call drag event
        },
        onDeactivate(_: Event, info: AnalogCircuitInfo): void {
            info.cursor = undefined;

            // Last temp action was final
            info.history.add(tempAction!);

            dir = undefined;
            obj = undefined;
            tempAction = undefined;
        },

        onEvent(event: Event, { camera, input, designer }: AnalogCircuitInfo): boolean {
            if (event.type !== "mousedrag")
                return false;

            const worldMouseDiff = camera.getWorldPos(input.getMousePos())
                                    .sub(camera.getWorldPos(input.getMouseDownPos()));

            // Undo previous temp action
            tempAction?.undo();

            const curRect = new Rect(obj!.getPos(), obj!.getSize());

            // Shift each x/y direction separately so that corners work as expected
            const amtX = worldMouseDiff.dot(V(dir!.x, 0));
            const amtY = worldMouseDiff.dot(V(0, dir!.y));

            const newRect = curRect.shift(dir!, V(amtX, amtY));

            tempAction = new GroupAction([
                Shift(designer, obj!),
                Translate([obj!], [newRect.center]),
                SetProperty(obj!, "size", Vector.Max(V(400, 200), newRect.size)),
            ]);

            // Return true since we did something
            //  that requires a re-render
            return true;
        },
    }
})();
