import {LEFT_MOUSE_BUTTON} from "core/utils/Constants";

import {V} from "Vector";

import {Event} from "core/utils/Events";
import {Action} from "core/actions/Action";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";
import {Oscilloscope} from "analog/models/eeobjects";

import {Edge, EdgeToCursor, FindEdge} from "./handlers/CursorHandler";
import {SetPropertyAction} from "analog/actions/SetPropertyAction";



export const ResizeTool = (() => {
    let edge: Edge = "none";
    let obj: Oscilloscope | undefined;

    let tempAction: Action | undefined;

    return {
        shouldActivate(event: Event, info: AnalogCircuitInfo): boolean {
            // Activate if the user began dragging over an edge
            return (event.type === "mousedrag" &&
                    event.button === LEFT_MOUSE_BUTTON &&
                    info.input.getTouchCount() === 1 &&
                    FindEdge(info)[0] !== "none");
        },
        shouldDeactivate(event: Event, _: AnalogCircuitInfo): boolean {
            // Deactivate if stopped dragging by releasing mouse
            return (event.type === "mouseup");
        },

        onActivate(event: Event, info: AnalogCircuitInfo): void {
            [edge, obj] = FindEdge(info);

            info.cursor = EdgeToCursor[edge]; // Update cursor

            if (event.type === "mousedrag")
                this.onEvent(event, info); // Explicitly call drag event
        },
        onDeactivate(_: Event, info: AnalogCircuitInfo): void {
            info.cursor = undefined;

            const finalSize = obj!.getSize();
            tempAction?.undo();

            info.history.add(new SetPropertyAction(obj!, "size", finalSize).execute());

            edge = "none";
            obj = undefined;
            tempAction = undefined;
        },

        onEvent(event: Event, { camera, input }: AnalogCircuitInfo): boolean {
            if (event.type !== "mousedrag")
                return false;

            const worldMousePos = camera.getWorldPos(input.getMousePos());

            const originalSize = obj!.getSize();
            const newSize = (worldMousePos.sub(obj!.getPos())).scale(2).abs();

            // Undo previous temp action
            tempAction?.undo();

            if (edge === "horizontal")
                tempAction = new SetPropertyAction(obj!, "size", V(newSize.x, originalSize.y)).execute();
            else if (edge === "vertical")
                tempAction = new SetPropertyAction(obj!, "size", V(originalSize.x, newSize.y)).execute();

            // Return true since we did something
            //  that requires a re-render
            return true;
        },
    }
})();
