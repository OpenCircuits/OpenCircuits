import {CircuitDesigner}                  from "shared/circuitdesigner/CircuitDesigner";
import {InputManagerEvent}                from "shared/utils/input/InputManagerEvent";
import {ToolHandler, ToolHandlerResponse} from "./handlers/ToolHandler";


export class DefaultTool {
    protected handlers: ToolHandler[];

    public constructor(...handlers: ToolHandler[]) {
        this.handlers = handlers;
    }

    // Method called when this tool is currently active and an event occurs
    public onEvent(ev: InputManagerEvent, designer: CircuitDesigner): void {
        // // Don't do anything when circuit is locked
        // if (circuit.locked)
        //     return;

        if (ev.type === "mousedown") {
            // Find object if we pressed on one
            designer.curPressedObj = designer.circuit.pickObjAt(ev.state.mousePos, "screen");
        }
        if (ev.type === "mouseup")
            designer.curPressedObj = undefined;

        // Loop through each handler and see if we should trigger any of them
        for (const handler of this.handlers) {
            // If handler triggered a stop, don't loop through any others
            if (handler.onEvent(ev, designer) === ToolHandlerResponse.HALT)
                return;
        }
    }
}
