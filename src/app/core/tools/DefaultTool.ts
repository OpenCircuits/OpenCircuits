import {CircuitInfo}       from "core/utils/CircuitInfo";
import {InputManagerEvent} from "core/utils/InputManager";

import {EventHandler} from "./EventHandler";


export class DefaultTool {
    protected handlers: EventHandler[];

    public constructor(...handlers: EventHandler[]) {
        this.handlers = handlers;
    }

    public onActivate(event: InputManagerEvent, info: CircuitInfo): void {
        this.onEvent(event, info);
    }

    // Method called when this tool is currently active and an event occurs
    public onEvent(event: InputManagerEvent, info: CircuitInfo): boolean {
        const { locked, input, camera, viewManager } = info;

        if (locked)
            return false;

        const worldMousePos = camera.getWorldPos(input.getMousePos());

        if (event.type === "mousedown") {
            // Find object if we pressed on one
            info.curPressedObjID = viewManager.findNearestObj(
                worldMousePos,
                ((o) => (o.baseKind !== "Port"))
            )?.id;
        }
        if (event.type === "mouseup")
            info.curPressedObjID = undefined;

        // Zoom
        if (event.type === "zoom") {
            info.camera.zoomTo(event.pos, event.factor);
            return true;
        }

        // Loop through each handler and see if we should trigger any of them
        for (const handler of this.handlers) {
            if (handler.conditions(event, info)) {
                handler.getResponse(info, event);
                return true;
            }
        }
        return false;
    }
}
