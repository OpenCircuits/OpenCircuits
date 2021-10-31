import {MIDDLE_MOUSE_BUTTON, OPTION_KEY,
        ARROW_UP, ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT,
        ARROW_PAN_DISTANCE_NORMAL, ARROW_PAN_DISTANCE_SMALL}  from "core/utils/Constants";
import {Vector}      from "Vector";

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
            //  or if the user pressed one of of the arrow keys
            return (event.type === "keydown"   && ((event.key === OPTION_KEY) ||  
                                                   (event.key == ARROW_LEFT || event.key == ARROW_RIGHT || 
                                                    event.key == ARROW_UP || event.key == ARROW_DOWN )) ||
                   (event.type === "mousedrag" && (event.button === MIDDLE_MOUSE_BUTTON ||
                                                   input.getTouchCount() === 2)));
        },
        shouldDeactivate(event: Event, {}: CircuitInfo): boolean {
            // Deactivate if stopped dragging by releasing mouse
            //  or if no dragging happened and OPTION_KEY was released
            //  or if one of the arrow keys were released
            return (event.type === "mouseup") ||
                   (event.type === "keyup" && ((!isDragging && event.key === OPTION_KEY) || 
                                               (event.key == ARROW_LEFT || event.key == ARROW_RIGHT || 
                                                event.key == ARROW_UP || event.key == ARROW_DOWN )))
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
                
                return true;
            }
            
            if (event.type === "keydown") {
                let dPos = new Vector();
                
                // No else if because it introduces bugs when 
                // multiple arrow keys are pressed
                if (input.isKeyDown(ARROW_LEFT))
                    dPos = dPos.add(-1, 0);
                if (input.isKeyDown(ARROW_RIGHT))
                    dPos = dPos.add(1, 0);
                if (input.isKeyDown(ARROW_UP))
                    dPos = dPos.add(0, -1);
                if (input.isKeyDown(ARROW_DOWN))
                    dPos = dPos.add(0, 1);
                
                // Screen gets moved different amounts depending on if the shift key is held
                const factor = (input.isShiftKeyDown() ? ARROW_PAN_DISTANCE_SMALL : ARROW_PAN_DISTANCE_NORMAL); 
                
                camera.translate(dPos.scale(factor * camera.getZoom()));
                
                return true;
            }
            
            // Since it wasn't one of the two event types we want we 
            // don't need a re-render
            return false;
        }
    }
})();
