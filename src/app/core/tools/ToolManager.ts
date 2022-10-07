import {CircuitInfo} from "core/utils/CircuitInfo";
import {Event}       from "core/utils/Events";

import {DefaultTool} from "./DefaultTool";
import {Tool}        from "./Tool";


export class ToolManager {
    private readonly defaultTool: DefaultTool;
    private readonly tools: Tool[];

    private currentTool?: Tool;

    public constructor(defaultTool: DefaultTool, ...tools: Tool[]) {
        this.defaultTool = defaultTool;
        this.tools = tools;
    }

    public reset(info: CircuitInfo): void {
        if (this.currentTool)
            this.currentTool.onDeactivate({ type: "unknown" }, info);
        this.currentTool = undefined;
    }

    public onEvent(event: Event, info: CircuitInfo): boolean {
        // Call the current tool's (or default tool's) onEvent method
        if (this.currentTool) {
            const changed = this.currentTool.onEvent(event, info);
            // Check if we should deactivate the current tool
            if (this.currentTool.shouldDeactivate(event, info)) {
                // Deactivate the tool
                this.currentTool.onDeactivate(event, info);
                this.currentTool = undefined;
                this.defaultTool.onActivate(event, info);
                return true;
            }
            return changed;
        }

        // Check if some other tool should be activated
        const newTool = this.tools.find((t) => t.shouldActivate(event, info));
        if (newTool !== undefined) {
            this.currentTool = newTool;
            newTool.onActivate(event, info);
            return true;
        }

        // Specifically do defaultTool's `onEvent` last
        //  which means that Tool activations will take priority
        //  over the default behavior for things like Handlers
        //  Fixes #624
        return this.defaultTool.onEvent(event, info);
    }

    public hasTool(tool: Tool): boolean {
        return this.tools.includes(tool);
    }

    public getCurrentTool(): Tool | DefaultTool {
        return (this.currentTool ?? this.defaultTool);
    }
}
