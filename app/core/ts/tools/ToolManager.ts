import {Input} from "core/utils/Input";
import {MouseListener} from "core/utils/MouseListener";
import {KeyboardListener} from "core/utils/KeyboardListener";
import {Action} from "app/core/ts/actions/Action";

import {Tool} from "core/tools/Tool";

import {ActionHelper} from "./ActionHelper";
import {ActionManager} from "../actions/ActionManager";
import {DefaultTool} from "./DefaultTool";

export class ToolManager implements MouseListener, KeyboardListener {
    private tools: Tool[];
    private defaultTool: DefaultTool;

    private currentTool: Tool;

    private actionHelper: ActionHelper;
    private actionManager: ActionManager;

    public constructor(defaultTool: DefaultTool, ...tools: Tool[]) {
        this.tools = tools;
        this.defaultTool = defaultTool;

        this.currentTool = this.defaultTool;

        this.actionManager = new ActionManager();
        this.actionHelper = new ActionHelper(this.actionManager);
    }

    private activate(tool: Tool, event: string, input: Input, button?: number): void {
        // Activate tool and check if it added an action
        const action = tool.activate(this.currentTool, event, input, button);
        this.addAction(action);
        this.currentTool = tool;
    }

    private deactivate(tool: Tool, event: string, input: Input, button?: number): void {
        // Deactivate tool and check if it added an action
        const action = tool.deactivate(event, input, button);
        this.addAction(action);
    }

    private onEvent(method: (i: Input,b?: number) => boolean, event: string, input: Input, button?: number): boolean {
        const didSomething = method(input, button);

        // Check if we should deactivate the current tool
        if (this.currentTool != this.defaultTool) {
            if (this.currentTool.shouldDeactivate(event, input, button)) {
                this.deactivate(this.currentTool, event, input, button);
                this.activate(this.defaultTool, event, input, button);
                return true;
            }
            return didSomething;
        }

        // Add action from default tool
        this.addAction(this.defaultTool.getAction());

        // Check if a new tool should be activated
        const activeTools = this.tools.filter((t) => !t.isDisabled());
        const newTool = activeTools.find((t) => t.shouldActivate(this.defaultTool, event, input, button));
        if (newTool) {
            this.deactivate(this.defaultTool, event, input, button);
            this.activate(newTool, event, input, button);
            return true;
        }

        // Re-render on action update
        if (this.actionHelper.onEvent(this.currentTool, event, input, button))
            return true;

        return didSomething;
    }

    public addAction(action?: Action): void {
        // Check if action exists, then add it to stack
        if (action)
            this.actionManager.add(action);
    }

    public setDisabled(toolType: Function, disabled: boolean): void {
        const tool = this.tools.find((t) => t instanceof toolType);
        if (tool)
            tool.setDisabled(disabled);
    }

    public hasTool(toolType: Function): boolean {
        const tool = this.tools.find((t) => t instanceof toolType);
        if (tool)
            return !tool.isDisabled();
        return false;
    }

    public disableActions(disabled: boolean = true): void {
        this.actionHelper.setDisabled(disabled);
    }

    public onMouseDown(input: Input, button: number): boolean {
        return this.onEvent((i: Input,b?: number) => this.currentTool.onMouseDown(i,b), "mousedown", input, button);
    }

    public onMouseMove(input: Input): boolean {
        return this.onEvent((i: Input) => this.currentTool.onMouseMove(i), "mousemove", input);
    }

    public onMouseDrag(input: Input, button: number): boolean {
        return this.onEvent((i: Input,b?: number) => this.currentTool.onMouseDrag(i,b), "mousedrag", input, button);
    }

    public onMouseUp(input: Input, button: number): boolean {
        return this.onEvent((i: Input,b?: number) => this.currentTool.onMouseUp(i,b), "mouseup", input, button);
    }

    public onClick(input: Input, button: number): boolean {
        return this.onEvent((i: Input,b?: number) => this.currentTool.onClick(i,b), "onclick", input, button);
    }

    public onKeyDown(input: Input, key: number): boolean {
        return this.onEvent((i: Input,b?: number) => this.currentTool.onKeyDown(i,b), "keydown", input, key);
    }

    public onKeyUp(input: Input, key: number): boolean {
        return this.onEvent((i: Input,b?: number) => this.currentTool.onKeyUp(i,b), "keyup", input, key);
    }
}
