import {V} from "Vector";

import {ObservableImpl} from "shared/api/circuit/utils/Observable";

import {CircuitDesigner}   from "shared/api/circuitdesigner/public/CircuitDesigner";
import {InputAdapterEvent} from "shared/api/circuitdesigner/input/InputAdapterEvent";

import {MIDDLE_MOUSE_BUTTON} from "../input/Constants";
import {Tool, ToolEvent} from "./Tool";


const ARROW_PAN_DISTANCE_NORMAL = 1.5;
const ARROW_PAN_DISTANCE_SMALL = 0.1;

export class PanTool extends ObservableImpl<ToolEvent> implements Tool {
    public constructor() {
        super();
    }

    public shouldActivate(ev: InputAdapterEvent, { }: CircuitDesigner): boolean {
        return (
            // Activate if the user just pressed the "option key"
            //  or if the user began dragging with either 2 fingers
            //                           or the middle mouse button
            (ev.type === "keydown" && ((ev.key === "Alt") ||
                (ev.key === "ArrowLeft" || ev.key === "ArrowRight"   ||
                 ev.key === "ArrowUp"   || ev.key === "ArrowDown"))) ||
            (ev.type === "mousedrag" && (ev.button === MIDDLE_MOUSE_BUTTON ||
                ev.input.touchCount === 2))
        );
    }
    public shouldDeactivate(ev: InputAdapterEvent): boolean {
        return (
            (!ev.input.isDragging && !ev.input.isAltKeyDown) ||
            (ev.type === "keyup" && (ev.key === "ArrowLeft" || ev.key === "ArrowRight" ||
                                    ev.key === "ArrowUp"   || ev.key === "ArrowDown"))
        );
    }

    public onActivate(ev: InputAdapterEvent, { viewport }: CircuitDesigner): void {
        viewport.camera.emit({ type: "dragStart" });
    }

    public onDeactivate(ev: InputAdapterEvent, { viewport }: CircuitDesigner): void {
        viewport.camera.emit({ type: "dragEnd" });
    }

    public onEvent(ev: InputAdapterEvent, { viewport }: CircuitDesigner): void {
        if (ev.type === "mousedrag") {
            const { x: dx, y: dy } = ev.input.deltaMousePos;
            viewport.camera.translate(V(-dx, -dy), "screen");
            return;
        }

        if (ev.type === "keydown") {
            // When a key is held down, the `keydown` event still fires repeatedly, but only holds ONE of the keys
            // being held. Because of this, we have to check if any of the other directions are also being held and
            // add them all together
            const dx = (ev.input.keysDown.has("ArrowLeft")  ? -1 : 0) +
                       (ev.input.keysDown.has("ArrowRight") ? +1 : 0);
            const dy = (ev.input.keysDown.has("ArrowUp")   ? +1 : 0) +
                       (ev.input.keysDown.has("ArrowDown") ? -1 : 0);
            // Screen gets moved different amounts depending on if shift key is held
            const factor = (ev.input.isShiftKeyDown ? ARROW_PAN_DISTANCE_SMALL : ARROW_PAN_DISTANCE_NORMAL);

            viewport.camera.translate(V(dx, dy).scale(factor), "world");
        }
    }
}
