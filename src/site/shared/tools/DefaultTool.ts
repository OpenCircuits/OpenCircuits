import {Circuit}                          from "core/public";
import {InputManagerEvent}                from "shared/utils/input/InputManagerEvent";
import {ToolHandler, ToolHandlerResponse} from "./handlers/ToolHandler";
import {ToolState}                        from "./Tool";


export class DefaultTool {
    protected handlers: ToolHandler[];

    public constructor(...handlers: ToolHandler[]) {
        this.handlers = handlers;
    }

    public onActivate(ev: InputManagerEvent, circuit: Circuit, state: ToolState,
                      // TODO: Figure this out, this is gross
                      setState: (newState: ToolState) => void): void {
        this.onEvent(ev, circuit, state, setState);
    }

    // Method called when this tool is currently active and an event occurs
    public onEvent(ev: InputManagerEvent, circuit: Circuit, state: ToolState,
                   // TODO: Figure this out, this is gross
                   setState: (newState: ToolState) => void): void {
        // // Don't do anything when circuit is locked
        // if (circuit.locked)
        //     return;

        if (ev.type === "mousedown") {
            // Find object if we pressed on one
            setState({ curPressedObjID: circuit.pickObjectAt(ev.state.mousePos, "screen")?.id });
        }
        if (ev.type === "mouseup")
            setState({ curPressedObjID: undefined });

        // Loop through each handler and see if we should trigger any of them
        for (const handler of this.handlers) {
            // If handler triggered a stop, don't loop through any others
            if (handler.onEvent(ev, circuit) === ToolHandlerResponse.STOP)
                return;
        }
    }
}
