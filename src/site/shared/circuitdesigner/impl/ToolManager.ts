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
            this.curTool.state = this.curTool.onEvent(ev, designer);

            // Check if we should deactivate the current tool
            if (this.curTool.state !== Tool.State.Active) {
                // Deactivate the tool
                this.curTool = undefined;
                this.defaultTool.onEvent(ev, designer);

                designer.circuit.forceRedraw();

                return;
            }
            return;
        }

        // Check if some other tool should be activated
        for (const tool of this.tools) {
            tool.state = tool.onEvent(ev, designer);

            if (tool.state === Tool.State.Active) {
                this.curTool = tool;
                tool.onEvent(ev, designer); // TODO[.](leon) - see if this is okay

                designer.circuit.forceRedraw();

                return;
            }
        }

        // Specifically do defaultTool's `onEvent` last
        //  which means that Tool activations will take priority
        //  over the default behavior for things like Handlers
        //  Fixes #624
        this.defaultTool.onEvent(ev, designer);
    }
}
