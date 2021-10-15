import {MIDDLE_MOUSE_BUTTON,
        OPTION_KEY, ARROW_UP, ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT}  from "core/utils/Constants";

import {Event}       from "core/utils/Events";
import {CircuitInfo} from "core/utils/CircuitInfo";

import {Tool}        from "core/tools/Tool";
import {Vector}      from "core/utils/math/Vector";

export const PanTool: Tool = (() => {
    let isDragging = false;
    return {
        shouldActivate(event: Event, {input}: CircuitInfo): boolean {
            // Activate if the user just pressed the "option key"
            //  or if the user began dragging with either 2 fingers
            //                           or the middle mouse button
            //  or if the user pressed one of of the arrow keys
            return (event.type === "keydown"   && ((event.key === OPTION_KEY) ||  
                                                  (event.key >= ARROW_LEFT && event.key <= ARROW_DOWN)) ||
                   (event.type === "mousedrag" && (event.button === MIDDLE_MOUSE_BUTTON ||
                                                   input.getTouchCount() === 2)));
        },
        shouldDeactivate(event: Event, {}: CircuitInfo): boolean {
            // Deactivate if stopped dragging by releasing mouse
            //  or if no dragging happened and OPTION_KEY was released
            //  or if one of the arrow keys were released
            return (event.type === "mouseup") ||
                   (event.type === "keyup" && ((!isDragging && event.key === OPTION_KEY) || 
                                               (event.key >= ARROW_LEFT && event.key <= ARROW_DOWN)))
        },


        onActivate(event: Event, info: CircuitInfo): void {
            if (event.type === "mousedrag" || event.type === "keydown")
                this.onEvent(event, info); // Explicitly call drag event
        },
        onDeactivate({}: Event, {}: CircuitInfo): void {
            isDragging = false;
        },


        onEvent(event: Event, {input, camera}: CircuitInfo): boolean {
            if (event.type === "mousedrag") {

                isDragging = true;
                
                const dPos = input.getDeltaMousePos();
                camera.translate(dPos.scale(-1 * camera.getZoom()));
            }
            else if (event.type === "keydown") {
                //We pan in relation to the zoom so it's more or less consistent 
                let moveVec = new Vector();
                let zoom = camera.getZoom();
                let factor = 75; //75 Chosen because it looks good
                let x = 0;
                let y = 0;

                //If shift is held then make a smaller movement
                if (input.isShiftKeyDown()) 
                    factor = 5;

                //No else if because it introduces bugs when 
                //multiple arrow keys are pressed
                if (input.isKeyDown(ARROW_LEFT))
                    x -= 1;
                if (input.isKeyDown(ARROW_RIGHT))
                    x += 1;
                if (input.isKeyDown(ARROW_UP))
                    y -= 1;
                if (input.isKeyDown(ARROW_DOWN))
                    y += 1;
                
                camera.translate(new Vector(x * zoom * factor, y * zoom * factor));
            }
            else {
                //Since it wasn't one of the two event types we want we 
                //don't need a re-render
                return false;
            }
            // Return true since we did something
            //  that requires a re-render
            return true;
        }
    }
})();
