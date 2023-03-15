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
                                    ev.state.touchCount === 2))
    ),
    shouldDeactivate: (ev) => (
        (!ev.state.isDragging && !ev.state.isAltKeyDown)
    ),

    onActivate: (ev, circuit, state) => {
        PanTool.onEvent(ev, circuit, state); // Explicitly call drag event
    },
    onDeactivate: () => {},

    onEvent: (ev, { camera }) => {
        if (ev.type === "mousedrag") {
            const { x: dx, y: dy } = ev.state.deltaMousePos;
            camera.translate(V(-dx, -dy), "screen");
        }
    },
}
