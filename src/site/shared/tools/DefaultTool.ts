import {Circuit}                          from "core/public";
import {InputAdapterEvent}                from "shared/utils/input/InputAdapterEvent";
import {ToolHandler, ToolHandlerResponse} from "./handlers/ToolHandler";


export class DefaultTool {
    protected handlers: ToolHandler[];

    public constructor(...handlers: ToolHandler[]) {
        this.handlers = handlers;
    }

    public onActivate(ev: InputAdapterEvent, circuit: Circuit): void {
        this.onEvent(ev, circuit);
    }

    // Method called when this tool is currently active and an event occurs
    public onEvent(ev: InputAdapterEvent, circuit: Circuit): void {
        // // Don't do anything when circuit is locked
        // if (circuit.locked)
        //     return;

        // if (ev.type === "mousedown") {
        //     // Find object if we pressed on one
        //     info.curPressedObjID = viewManager.findNearestObj(
        //         worldMousePos,
        //         ((o) => (o.baseKind !== "Port"))
        //     )?.id;
        // }
        // if (ev.type === "mouseup")
        //     info.curPressedObjID = undefined;

        // Loop through each handler and see if we should trigger any of them
        for (const handler of this.handlers) {
            // If handler triggered a stop, don't loop through any others
            if (handler.onEvent(ev, circuit) === ToolHandlerResponse.STOP)
                return;
        }
    }
}
