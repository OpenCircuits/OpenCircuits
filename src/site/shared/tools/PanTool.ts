import {Circuit} from "core/public";

import {CircuitDesigner}   from "shared/circuitdesigner";
import {InputAdapterEvent} from "shared/utils/input/InputAdapterEvent";

import {Tool}                from "./Tool";
import {V}                   from "Vector";
import {MIDDLE_MOUSE_BUTTON} from "shared/utils/input/Constants";


export class PanTool implements Tool {
    public readonly kind = "PanTool";

    public state: Tool.State = Tool.State.Inactive;

    public onEvent(ev: InputAdapterEvent, { circuit }: CircuitDesigner<Circuit>): Tool.State {
        const { isDragging, isAltKeyDown, touchCount, deltaMousePos } = ev.input;

        switch (this.state) {
            case Tool.State.Inactive:
            case Tool.State.Pending:
                // Activate if the user pressed the "option key"
                if (ev.type === "keydown" && (ev.key === "Alt"))
                    return Tool.State.Active;

                // Activate if the user is dragging w/ middle mouse or two fingers
                if (ev.type === "mousedrag" && (ev.button === MIDDLE_MOUSE_BUTTON || touchCount === 2))
                    return Tool.State.Active;

                return Tool.State.Inactive;

            case Tool.State.Active:
                // Check if we should deactivate
                if (!isDragging && !isAltKeyDown)
                    return Tool.State.Inactive;

                if (ev.type === "mousedrag") {
                    const { x: dx, y: dy } = deltaMousePos;
                    circuit.camera.translate(V(-dx, -dy), "screen");
                }

                return Tool.State.Active;
        }
    }
}
