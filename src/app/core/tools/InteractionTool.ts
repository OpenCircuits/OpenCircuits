import {Vector} from "Vector";

import {CircuitInfo} from "core/utils/CircuitInfo";
import {Event} from "core/utils/Events";
import {isPressable} from "core/utils/Pressable";
import {LEFT_MOUSE_BUTTON} from "core/utils/Constants";

import {DefaultTool} from "./DefaultTool";

import {EventHandler} from "./EventHandler";
import {FindPressableObjects} from "core/utils/ComponentUtils";


export class InteractionTool extends DefaultTool {
    public constructor(handlers: EventHandler[]) {
        super(...handlers);
    }

    public onActivate(event: Event, info: CircuitInfo): boolean {
        return this.onEvent(event, info);
    }

    public onEvent(event: Event, info: CircuitInfo): boolean {
        const {locked, input, camera, currentlyPressedObject} = info;

        const worldMousePos = camera.getWorldPos(input.getMousePos());
        const obj = FindPressableObjects(worldMousePos, info);
        if (!obj) {
            if (locked)
                return false;
            return super.onEvent(event, info);
        }

        switch (event.type) {
            case "mousedown":
                info.currentlyPressedObject = obj;

                // Check that mouse type is left mouse button and
                //  if the object is "Pressable" and
                //  if we should call their ".press" method
                if (event.button == LEFT_MOUSE_BUTTON && isPressable(obj) && obj.isWithinPressBounds(worldMousePos)) {
                    obj.press();
                    return true;
                }
                break;

            case "mouseup":
                // Release currently pressed object
                if (isPressable(currentlyPressedObject)) {
                    currentlyPressedObject.release();
                    info.currentlyPressedObject = undefined;
                    return true;
                }
                info.currentlyPressedObject = undefined;
                break;

            case "click":
                // Find and click object
                if (isPressable(obj) && obj.isWithinPressBounds(worldMousePos)) {
                    obj.click();
                    return true;
                }
                break;
        }

        if (locked)
            return false;

        return super.onEvent(event, info);
    }

}
