import {CircuitDesigner}                  from "shared/circuitdesigner/CircuitDesigner";
import {InputAdapterEvent}                from "shared/utils/input/InputAdapterEvent";
import {ToolHandler, ToolHandlerResponse} from "./handlers/ToolHandler";


export class DefaultTool {
    protected handlers: ToolHandler[];

    public constructor(...handlers: ToolHandler[]) {
        this.handlers = handlers;
    }

    public onActivate(ev: InputAdapterEvent, designer: CircuitDesigner): void {
        this.onEvent(ev, designer);
    }

    // Method called when this tool is currently active and an event occurs
    public onEvent(ev: InputAdapterEvent, designer: CircuitDesigner): void {
        // // Don't do anything when circuit is locked
        // if (circuit.locked)
        //     return;

        if (ev.type === "mousedown") {
            // Find object if we pressed on one
            designer.curPressedObj = designer.circuit.pickObjectAt(ev.state.mousePos, "screen");
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
