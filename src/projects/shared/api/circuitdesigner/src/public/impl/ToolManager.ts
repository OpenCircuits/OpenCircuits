import {DefaultTool}       from "shared/api/circuitdesigner/tools/DefaultTool";
import {Tool}              from "shared/api/circuitdesigner/tools/Tool";
import {InputAdapterEvent} from "shared/api/circuitdesigner/input/InputAdapterEvent";
import {CircuitDesigner}   from "../CircuitDesigner";


export class ToolManager {
    public readonly defaultTool: DefaultTool;
    public readonly tools: Tool[];

    public curTool?: Tool;

    public constructor(defaultTool: DefaultTool, tools: Tool[]) {
        this.defaultTool = defaultTool;
        this.tools = tools;
    }

    public onEvent(ev: InputAdapterEvent, designer: CircuitDesigner): void {
        // Call the current tool's (or default tool's) onEvent method
        if (this.curTool) {
            this.curTool.onEvent(ev, designer);
            // Check if we should deactivate the current tool
            if (this.curTool.shouldDeactivate(ev, designer)) {
                // Deactivate the tool
                this.curTool.onDeactivate(ev, designer);
                this.curTool = undefined;
                this.defaultTool.onEvent(ev, designer);

                // TODO[.](leon) - I know this had a reason but I should document it
                // designer.circuit.forceRedraw();

                return;
            }
            return;
        }

        // Check if some other tool should be activated
        const newTool = this.tools.find((t) => t.shouldActivate(ev, designer));
        if (newTool !== undefined) {
            this.curTool = newTool;
            newTool.onActivate(ev, designer);
            newTool.onEvent(ev, designer); // TODO[.](leon) - see if this is okay

            // designer.circuit.forceRedraw();

            return;
        }

        // Specifically do defaultTool's `onEvent` last
        //  which means that Tool activations will take priority
        //  over the default behavior for things like Handlers
        //  Fixes #624
        this.defaultTool.onEvent(ev, designer);
    }
}
