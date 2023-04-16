import {Circuit} from "core/public";

import {CircuitDesigner}   from "shared/circuitdesigner";
import {InputAdapterEvent} from "shared/utils/input/InputAdapterEvent";

import {Tool}                from "./Tool";
import {V}                   from "Vector";
import {MIDDLE_MOUSE_BUTTON} from "shared/utils/input/Constants";


export class PanTool implements Tool<Tool.BaseState> {
    public readonly kind = "PanTool";

    public state: Tool.BaseState = "Inactive";

    public onEvent(ev: InputAdapterEvent, { circuit }: CircuitDesigner<Circuit>): void {
        const { isDragging, isAltKeyDown, touchCount, deltaMousePos } = ev.input;

        switch (this.state) {
            case "Inactive":
                // Activate if the user pressed the "option key"
                if (ev.type === "keydown" && (ev.key === "Alt"))
                    this.state = "Active";

                // Activate if the user is dragging w/ middle mouse or two fingers
                if (ev.type === "mousedrag" && (ev.button === MIDDLE_MOUSE_BUTTON || touchCount === 2))
                    this.state = "Active";

                break;

            case "Active":
                // Check if we should deactivate
                if (!isDragging && !isAltKeyDown) {
                    this.state = "Inactive";
                    break;
                }

                if (ev.type === "mousedrag") {
                    const { x: dx, y: dy } = deltaMousePos;
                    circuit.camera.translate(V(-dx, -dy), "screen");
                }

                break;
        }
    }
}
