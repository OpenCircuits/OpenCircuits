import {Vector} from "Vector";

import {CircuitInfo} from "core/utils/CircuitInfo";
import {Event} from "core/utils/Events";
import {isPressable} from "core/utils/Pressable";
import {LEFT_MOUSE_BUTTON} from "core/utils/Constants";

import {IOObject, isNode} from "core/models";

import {DefaultTool} from "./DefaultTool";

import {EventHandler} from "./EventHandler";
import {FindPorts} from "core/utils/ComponentUtils";


export class InteractionTool extends DefaultTool {
    public constructor(handlers: EventHandler[]) {
        super(...handlers);
    }

    private findObject(pos: Vector, {designer}: Partial<CircuitInfo>): IOObject {
        // Very specifically get the objects and wires and reverse them SEPARATELY
        //  doing `designer.getAll().reverse()` would put the wires BEFORE the objects
        //  which will cause incorrect behavior! Objects are always going to need to be
        //  pressed/selected before wires!
        const objs = designer.getObjects().reverse();
        const wires = designer.getWires().reverse();
        return (objs as IOObject[]).concat(wires).find(o => (isPressable(o) && o.isWithinPressBounds(pos) ||
                                                             o.isWithinSelectBounds(pos)));
    }

    public onActivate(event: Event, info: CircuitInfo): boolean {
        return this.onEvent(event, info);
    }

    public onEvent(event: Event, info: CircuitInfo): boolean {
        const {locked, input, camera, currentlyPressedObject} = info;

        const worldMousePos = camera.getWorldPos(input.getMousePos());
        const obj = this.findObject(worldMousePos, info);

        const foundPorts = FindPorts(info);
        let visPorts = foundPorts.length > 0;
        let nodePorts = foundPorts.some(o => isNode(o.getParent()));

        // https://github.com/OpenCircuits/OpenCircuits/issues/624
        // Check for ports over the object
        if (!visPorts || nodePorts) {
            switch (event.type) {
                case "mousedown":
                    info.currentlyPressedObject = obj;

                    // Check that mouse type is left mouse button and
                    //  if the object is "Pressable" and
                    //  if we should call their ".press" method
                    if (isPressable(obj) && obj.isWithinPressBounds(worldMousePos)) {
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
        }

        if (locked)
            return false;

        return super.onEvent(event, info);
    }

}
