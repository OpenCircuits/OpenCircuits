import {MIDDLE_MOUSE_BUTTON,
        OPTION_KEY}  from "core/utils/Constants";

import {Event}       from "core/utils/Events";
import {CircuitInfo} from "core/utils/CircuitInfo";

import {Tool}        from "core/tools/Tool";


export const PanTool: Tool = (() => {
    let isDragging = false;

    return {
        shouldActivate(event: Event, {input}: CircuitInfo): boolean {
            // Activate if the user just pressed the "option key"
            //  or if the user began dragging with either 2 fingers
            //                           or the middle mouse button
            return (event.type === "keydown"   && (event.key === OPTION_KEY)) ||
                   (event.type === "mousedrag" && (event.button === MIDDLE_MOUSE_BUTTON ||
                                                   input.getTouchCount() === 2));
        },
        shouldDeactivate(event: Event, {}: CircuitInfo): boolean {
            // Deactivate if stopped dragging by releasing mouse
            //  or if no dragging happened and OPTION_KEY was released
            return (event.type === "mouseup") ||
                   (event.type === "keyup" && !isDragging && event.key === OPTION_KEY);
        },


        onActivate(event: Event, info: CircuitInfo): void {
            if (event.type === "mousedrag")
                this.onEvent(event, info); // Explicitly call drag event
        },
        onDeactivate({}: Event, {}: CircuitInfo): void {
            isDragging = false;
        },


        onEvent(event: Event, {input, camera}: CircuitInfo): boolean {
            if (event.type !== "mousedrag")
                return false;

            isDragging = true;

            const dPos = input.getDeltaMousePos();
            camera.translate(dPos.scale(-1 * camera.getZoom()));

            // Return true since we did something
            //  that requires a re-render
            return true;
        }
    }
})();
