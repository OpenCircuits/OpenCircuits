import {MIDDLE_MOUSE_BUTTON} from "shared/utils/input/Constants";
import {V}                   from "Vector";
import {Tool}                from "./Tool";


export const PanTool: Tool = {
    shouldActivate: (ev) => (
        // Activate if the user just pressed the "option key"
        //  or if the user began dragging with either 2 fingers
        //                           or the middle mouse button
        (ev.type === "keydown" && (ev.key === "Alt")) ||
        (ev.type === "mousedrag" && (ev.button === MIDDLE_MOUSE_BUTTON ||
                                    ev.input.touchCount === 2))
    ),
    shouldDeactivate: (ev) => (
        (!ev.input.isDragging && !ev.input.isAltKeyDown)
    ),

    onActivate: (_, { viewport }) => {
        viewport.curCamera.emit({ type: "dragStart" });
    },
    onDeactivate: (_, { viewport }) => {
        viewport.curCamera.emit({ type: "dragEnd" });
    },
    onEvent: (ev, { viewport }) => {
        if (ev.type === "mousedrag") {
            const { x: dx, y: dy } = ev.input.deltaMousePos;
            viewport.curCamera.translate(V(-dx, -dy), "screen");
        }
    },
}
