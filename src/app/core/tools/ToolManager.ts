import {CircuitInfo} from "core/utils/CircuitInfo";
import {Event} from "core/utils/Events";

import {DefaultTool} from "./DefaultTool";
import {Tool} from "./Tool";


export class ToolManager {
    private readonly defaultTool: DefaultTool;
    private readonly tools: Tool[];

    private currentTool?: Tool;

    public constructor(defaultTool: DefaultTool, ...tools: Tool[]) {
        this.defaultTool = defaultTool;
        this.tools = tools;
    }

    public onEvent(event: Event, info: CircuitInfo): boolean {
        // Call the current tool's (or default tool's) onEvent method
        let changed = this.getCurrentTool().onEvent(event, info);

        if (this.currentTool !== undefined) {
            // Check if we should deactivate the current tool
            if (this.currentTool.shouldDeactivate(event, info)) {
                // Deactivate the tool
                this.currentTool.onDeactivate(event, info);
                this.currentTool = undefined;
                return true;
            }
        } else {
            // Check if some other tool should be activated
            const newTool = this.tools.find(t => t.shouldActivate(event, info));
            if (newTool !== undefined) {
                this.currentTool = newTool;
                newTool.onActivate(event, info);
                return true;
            }
        }

        return changed;
    }

    public hasTool(tool: Tool): boolean {
        return this.tools.some(t => t === tool);
    }

    public getCurrentTool(): Tool | DefaultTool {
        return (this.currentTool ?? this.defaultTool);
    }
}
