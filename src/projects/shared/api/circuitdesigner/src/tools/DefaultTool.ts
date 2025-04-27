import {CircuitTypes}                     from "shared/api/circuit/public/impl/CircuitState";

import {CircuitDesigner}                  from "shared/api/circuitdesigner/public/CircuitDesigner";
import {InputAdapterEvent}                from "shared/api/circuitdesigner/input/InputAdapterEvent";

import {ToolHandler, ToolHandlerResponse} from "./handlers/ToolHandler";


export class DefaultTool<T extends CircuitTypes = CircuitTypes> {
    protected handlers: Array<ToolHandler<T>>;

    public constructor(...handlers: Array<ToolHandler<T>>) {
        this.handlers = handlers;
    }

    public onActivate(ev: InputAdapterEvent, designer: CircuitDesigner<T>): void {
        this.onEvent(ev, designer);
    }

    // Method called when this tool is currently active and an event occurs
    public onEvent(ev: InputAdapterEvent, designer: CircuitDesigner<T>): void {
        if (ev.type === "mousedown") {
            // Find object if we pressed on one
            designer.curPressedObj = designer.circuit.pickObjAt(
                designer.viewport.camera.toWorldPos(ev.input.mousePos));
        } else if (ev.type === "mouseup") {
            designer.curPressedObj = undefined;
        }

        // If circuit is locked, only use handlers that can be used when locked
        const handlers = designer.isLocked
            ? this.handlers.filter((handler) => handler.canActivateWhenLocked)
            : this.handlers;

        // Loop through each handler and see if we should trigger any of them
        for (const handler of handlers) {
            // If handler triggered a stop, don't loop through any others
            if (handler.onEvent(ev, designer) === ToolHandlerResponse.HALT)
                return;
        }
    }
}
