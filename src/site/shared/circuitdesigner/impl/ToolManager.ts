import {DefaultTool}       from "shared/tools/DefaultTool";
import {Tool}              from "shared/tools/Tool";
import {InputAdapterEvent} from "shared/utils/input/InputAdapterEvent";
import {CircuitDesigner}   from "../CircuitDesigner";


export class ToolManager {
    public readonly defaultTool: DefaultTool;
    public readonly tools: Tool[];

    private curTool?: Tool;

    public constructor(defaultTool: DefaultTool, tools: Tool[]) {
        this.defaultTool = defaultTool;
        this.tools = tools;
        this.curTool = undefined;
    }

    public getTool(kind: string): Tool | undefined {
        return this.tools.find((tool) => (tool.kind === kind));
    }

    public onEvent(ev: InputAdapterEvent, designer: CircuitDesigner): void {
        // Call the current tool's (or default tool's) onEvent method
        if (this.curTool) {
            this.curTool.onEvent(ev, designer);

            // Check if we should deactivate the current tool
            if (this.curTool.state === "Active")
                return;

            // Deactivate the tool
            this.curTool = undefined;
            designer.circuit.forceRedraw();
        }

        // Default tool is active, so advance state machine on all tools
        const activatedTools = this.tools.filter((tool) => {
            tool.onEvent(ev, designer);
            return (tool.state === "Active");
        });

        if (activatedTools.length === 0) {
            // Specifically do defaultTool's `onEvent` last
            //  which means that Tool activations will take priority
            //  over the default behavior for things like Handlers
            //  Fixes #624
            this.defaultTool.onEvent(ev, designer);
            return;
        }

        // Specifically choose the first activated tool (order of `this.tools` matters)
        this.curTool = activatedTools[0];

        // Tool activated, so reset all other tools that may be Pending.
        // It may be safer to have a "reset" method in case a pending tool has
        //  any state that needs to be cleaned up.
        for (const tool of this.tools) {
            if (tool !== this.curTool && tool.state !== "Inactive")
                tool.state = "Inactive";
        }
    }
}
