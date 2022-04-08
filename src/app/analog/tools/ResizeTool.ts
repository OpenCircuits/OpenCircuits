import {LEFT_MOUSE_BUTTON} from "core/utils/Constants";

import {Event} from "core/utils/Events";
import {Action} from "core/actions/Action";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";
import {Oscilloscope} from "analog/models/eeobjects";

import {AreaToCursor, FindEdge, ResizeArea} from "./handlers/CursorHandler";
import {SetPropertyAction} from "analog/actions/SetPropertyAction";
import {V, Vector} from "Vector";
import {Rect} from "math/Rect";
import {GroupAction} from "core/actions/GroupAction";
import {TranslateAction} from "core/actions/transform/TranslateAction";



export const ResizeTool = (() => {
    let area: ResizeArea | undefined;
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
            [area, obj] = FindEdge(info);

            info.cursor = AreaToCursor[area!]; // Update cursor

            if (event.type === "mousedrag")
                this.onEvent(event, info); // Explicitly call drag event
        },
        onDeactivate(_: Event, info: AnalogCircuitInfo): void {
            info.cursor = undefined;

            // Last temp action was final
            info.history.add(tempAction!);

            area = undefined;
            obj = undefined;
            tempAction = undefined;
        },

        onEvent(event: Event, { camera, input }: AnalogCircuitInfo): boolean {
            if (event.type !== "mousedrag")
                return false;

            const worldMousePos = camera.getWorldPos(input.getMousePos()).sub(camera.getWorldPos(input.getMouseDownPos()));

            // Undo previous temp action
            tempAction?.undo();

            const DirMap: Record<ResizeArea, Vector> = {
                "left":        V(-1,  0),
                "right":       V( 1,  0),
                "top":         V( 0, -1),
                "bottom":      V( 0,  1),
                "topleft":     V(-1, -1),
                "topright":    V( 1, -1),
                "bottomleft":  V(-1,  1),
                "bottomright": V( 1,  1),
            };

            const curRect = new Rect(obj!.getPos(), obj!.getSize());

            const dir = DirMap[area!];

            // Shift each x/y direction separately so that corners work as expected
            const amtX = worldMousePos.dot(V(dir.x, 0));
            const amtY = worldMousePos.dot(V(0, dir.y));

            const newRect = curRect.shift(dir, V(amtX, amtY));

            tempAction = new GroupAction([
                new TranslateAction([obj!], [obj!.getPos()], [newRect.center]),
                new SetPropertyAction(obj!, "size", newRect.size),
            ]).execute();

            // Return true since we did something
            //  that requires a re-render
            return true;
        },
    }
})();
