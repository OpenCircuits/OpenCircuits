import {Vector} from "Vector";

import {CircuitInfo} from "core/utils/CircuitInfo";
import {Event} from "core/utils/Events";
import {isPressable} from "core/utils/Pressable";

import {IOObject} from "core/models";

import {DefaultTool} from "./DefaultTool";

import {EventHandler} from "./EventHandler";
import {SelectAllHandler}     from "./handlers/SelectAllHandler";
import {FitToScreenHandler}   from "./handlers/FitToScreenHandler";
import {DuplicateHandler}     from "./handlers/DuplicateHandler";
import {DeleteHandler}        from "./handlers/DeleteHandler";
import {SnipWirePortsHandler} from "./handlers/SnipWirePortsHandler";
import {DeselectAllHandler}   from "./handlers/DeselectAllHandler";
import {SelectionHandler}     from "./handlers/SelectionHandler";
import {SelectPathHandler}    from "./handlers/SelectPathHandler";
import {UndoHandler}          from "./handlers/UndoHandler";
import {RedoHandler}          from "./handlers/RedoHandler";


export class InteractionTool extends DefaultTool {
    public constructor(handlers: EventHandler[] =
            [SelectAllHandler, FitToScreenHandler, DuplicateHandler,
             DeleteHandler, SnipWirePortsHandler, DeselectAllHandler,
             SelectionHandler, SelectPathHandler, RedoHandler, UndoHandler]) {
        super(...handlers);
    }

    private findObject(pos: Vector, {designer}: Partial<CircuitInfo>): IOObject {
        return designer.getAll().reverse().find(o => (isPressable(o) && o.isWithinPressBounds(pos) ||
                                                 o.isWithinSelectBounds(pos)));
    }

    public onEvent(event: Event, info: CircuitInfo): boolean {
        const {locked, input, camera, currentlyPressedObject} = info;

        if (locked)
            return false;

        const worldMousePos = camera.getWorldPos(input.getMousePos());
        const obj = this.findObject(worldMousePos, info);

        switch (event.type) {
            case "mousedown":
                info.currentlyPressedObject = obj;

                // Check if the object is "Pressable" and
                //  if we should call their ".press" method
                if (isPressable(obj) && obj.isWithinPressBounds(worldMousePos)) {
                    obj.press();
                    return true;
                }
                break;

            case "mouseup":
                // Release currently pressed object
                if (isPressable(currentlyPressedObject)) {
                    currentlyPressedObject.press();
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

        return super.onEvent(event, info);
    }

}
