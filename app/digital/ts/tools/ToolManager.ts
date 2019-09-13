import {Input} from "../Input";
import {MouseListener} from "../MouseListener";
import {KeyboardListener} from "../KeyboardListener";
import {Camera} from "../Camera";
import {Action} from "../actions/Action";

import {CircuitDesigner} from "../../models/CircuitDesigner";
import {Component} from "../../models/ioobjects/Component";

import {Tool} from "./Tool";
import {SelectionTool} from "./SelectionTool";
import {RotateTool} from "./RotateTool";
import {PanTool} from "./PanTool";
import {TranslateTool} from "./TranslateTool";
import {PlaceComponentTool} from "./PlaceComponentTool";
import {WiringTool} from "./WiringTool";
import {SplitWireTool} from "./SplitWireTool";

import {ActionHelper} from "./ActionHelper";
import {ActionManager} from "../actions/ActionManager";

export class ToolManager implements MouseListener, KeyboardListener {
    // Tool instances
    private selectionTool:      SelectionTool;
    private panTool:            PanTool;
    private rotateTool:         RotateTool;
    private translateTool:      TranslateTool;
    private placeComponentTool: PlaceComponentTool;
    private wiringTool:         WiringTool;
    private splitWireTool:      SplitWireTool;

    private actionHelper: ActionHelper;

    private actionManager: ActionManager;

    private tools: Array<Tool>;

    private currentTool: Tool;

    public constructor(camera: Camera, designer: CircuitDesigner) {
        this.actionManager      = new ActionManager();

        this.selectionTool      = new SelectionTool(designer, camera);
        this.panTool            = new PanTool(camera);
        this.rotateTool         = new RotateTool(camera);
        this.translateTool      = new TranslateTool(designer, camera);
        this.placeComponentTool = new PlaceComponentTool(designer, camera);
        this.wiringTool         = new WiringTool(designer, camera);
        this.splitWireTool      = new SplitWireTool(designer, camera);

        this.actionHelper = new ActionHelper(this.actionManager);

        // Array of tools to activate
        this.tools = [
            this.panTool,
            this.rotateTool,
            this.translateTool,
            this.placeComponentTool,
            this.wiringTool,
            this.splitWireTool
        ];

        // Default tool
        this.currentTool = this.selectionTool;
    }

    private activate(tool: Tool): void {
        this.currentTool = tool;
    }

    private onEvent(method: (i: Input,b?: number) => boolean, event: string, input: Input, button?: number): boolean {
        const didSomething = method(input, button);

        // Check if selection tool has any actions to add
        if (this.currentTool == this.selectionTool) {
            const action = this.selectionTool.getAction();
            if (action != undefined)
                this.actionManager.add(action);
        }

        // Check if current tool should be deactivated
        //  and default tool (selection tool) should be activated
        if (this.currentTool != this.selectionTool &&
            this.currentTool.deactivate(event, input, button)) {
            // Add action
            const action = this.currentTool.getAction();
            if (action != undefined)
                this.actionManager.add(action);
            this.selectionTool.activate(this.currentTool, event, input, button);
            this.activate(this.selectionTool);
            return true;
        }

        // Check if any tool should be activated
        for (const tool of this.tools) {
            if (tool.isDisabled() || tool == this.currentTool)
                continue;

            if (tool.activate(this.currentTool, event, input, button)) {
                this.activate(tool);
                this.selectionTool.deactivate();
                return true;
            }
        }

        // Re-render on action update
        if (this.actionHelper.onEvent(this.currentTool, event, input, button))
            return true;

        return didSomething;
    }

    public addAction(action: Action): void {
        this.actionManager.add(action);
    }

    /**
     * Disables a type of tool from this tool manager
     *
     * @param  toolType The type of tool to remove
     *
     */
    public disableTool(toolType: typeof Tool | typeof PanTool | typeof RotateTool | typeof TranslateTool |
                                typeof PlaceComponentTool | typeof WiringTool, disabled: boolean = true): void {

        for (let i = 0; i < this.tools.length; i++) {
            const tool = this.tools[i];
            if (tool instanceof toolType) {
                // Activate selection tool if this tool is already active
                if (this.currentTool == tool) {
                    this.activate(this.selectionTool);
                    this.selectionTool.activate(this.currentTool, "remove", undefined, 0);
                }

                // Remove the tool from this list of tools
                tool.setDisabled(disabled);
                return;
            }
        }
    }

    /**
     * Check if a specific type of tool is active
     *
     * @param  toolType The type of tool
     * @return          True if the tool is active,
     *                  False otherwise
     */
    public hasTool(toolType: typeof Tool | typeof PanTool | typeof RotateTool | typeof TranslateTool |
                             typeof PlaceComponentTool | typeof WiringTool): boolean {
        const tool = this.tools.find((tool) => tool instanceof toolType);
        if (tool == null)
            return false;
        return !tool.isDisabled();
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

    public placeComponent(component: Component, instant: boolean = false): void {
        if (this.placeComponentTool.isDisabled())
            return;

        this.placeComponentTool.setComponent(component, instant);
        if (!instant) // Don't activate the tool if we're just instantly placing
            this.activate(this.placeComponentTool);
        else // Add action immeadiately
            this.addAction(this.placeComponentTool.getAction());
    }

    public getCurrentTool(): Tool {
        return this.currentTool;
    }

    public getSelectionTool(): SelectionTool {
        return this.selectionTool;
    }

}
