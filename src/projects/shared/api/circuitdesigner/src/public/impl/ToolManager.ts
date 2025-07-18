import {ObservableImpl} from "shared/api/circuit/utils/Observable";
import {CircuitTypes}   from "shared/api/circuit/public/impl/CircuitContext";

import {DefaultTool}       from "shared/api/circuitdesigner/tools/DefaultTool";
import {Tool}              from "shared/api/circuitdesigner/tools/Tool";
import {InputAdapterEvent} from "shared/api/circuitdesigner/input/InputAdapterEvent";
import {CircuitDesigner}   from "shared/api/circuitdesigner/public/CircuitDesigner";


export type ToolManagerEvent = {
    type: "toolActivated";
    tool: Tool;
} | {
    type: "toolDeactivated";
    tool: Tool;
}

export class ToolManager<T extends CircuitTypes = CircuitTypes> extends ObservableImpl<ToolManagerEvent> {
    public readonly defaultTool: DefaultTool<T>;
    public readonly tools: Tool[];

    public curTool?: Tool;

    public constructor(defaultTool: DefaultTool<T>, tools: Tool[]) {
        super();

        this.defaultTool = defaultTool;
        this.tools = tools;
    }

    public onEvent(ev: InputAdapterEvent, designer: CircuitDesigner<T>): void {
        // Call the current tool's (or default tool's) onEvent method
        if (this.curTool) {
            const tool = this.curTool;

            tool.onEvent(ev, designer);
            // Check if we should deactivate the current tool
            if (tool.shouldDeactivate(ev, designer)) {
                this.curTool = undefined;

                // Deactivate the tool
                tool.onDeactivate(ev, designer);
                this.defaultTool.onEvent(ev, designer);

                this.publish({ type: "toolDeactivated", tool });

                return;
            }
            return;
        }

        // If circuit is locked, only use tools that can be used when locked
        const tools = designer.isLocked
            ? this.tools.filter((tool) => (tool.canActivateWhenLocked))
            : this.tools;

        // Find first tool indicating it could be activated
        const cursor = tools.map((t) => t.indicateCouldActivate?.(ev, designer)).find((c) => !!c);
        designer.viewport.canvasInfo!.cursor = cursor;

        // Check if some other tool should be activated
        const newTool = tools.find((t) => t.shouldActivate(ev, designer));
        if (newTool !== undefined) {
            this.curTool = newTool;
            newTool.onActivate(ev, designer);
            newTool.onEvent(ev, designer); // TODO[.](leon) - see if this is okay

            this.publish({ type: "toolActivated", tool: newTool });

            return;
        }

        // Specifically do defaultTool's `onEvent` last
        //  which means that Tool activations will take priority
        //  over the default behavior for things like Handlers
        //  Fixes #624
        this.defaultTool.onEvent(ev, designer);
    }
}
