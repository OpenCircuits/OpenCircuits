import {Input} from "../Input";
import {MouseListener} from "../MouseListener";
import {KeyboardListener} from "../KeyboardListener";
import {Camera} from "../Camera";

import {CircuitDesigner} from "../../models/CircuitDesigner";
import {Component} from "../../models/ioobjects/Component";

import {Tool} from "./Tool";
import {SelectionTool} from "./SelectionTool";
import {RotateTool} from "./RotateTool";
import {PanTool} from "./PanTool";
import {TranslateTool} from "./TranslateTool";
import {PlaceComponentTool} from "./PlaceComponentTool";
import {WiringTool} from "./WiringTool";

import {MainDesignerController} from "../../controllers/MainDesignerController";

export class ToolManager implements MouseListener, KeyboardListener {
    // Tool instances
    private selectionTool       : SelectionTool;
    private panTool             : PanTool;
    private rotateTool          : RotateTool;
    private translateTool       : TranslateTool;
    private placeComponentTool  : PlaceComponentTool;
    private wiringTool          : WiringTool;

    private tools: Array<Tool>;

    private currentTool: Tool;

    public constructor(camera: Camera, designer: CircuitDesigner) {
        this.selectionTool      = new SelectionTool(designer, camera);
        this.panTool            = new PanTool(camera);
        this.rotateTool         = new RotateTool(camera);
        this.translateTool      = new TranslateTool(camera);
        this.placeComponentTool = new PlaceComponentTool(designer, camera);
        this.wiringTool         = new WiringTool(designer, camera);

        // Array of tools to activate
        this.tools = [
            this.panTool,
            this.rotateTool,
            this.translateTool,
            this.placeComponentTool,
            this.wiringTool
        ];

        // Default tool
        this.currentTool = this.selectionTool;
    }

    private activate(tool: Tool): void {
        this.currentTool = tool;
    }

    private onEvent(method: (i:Input,b?:number) => boolean, event: string, input: Input, button?: number): boolean {
        let didSomething = method(input, button);

        // Check if current tool should be deactivated
        //  and default tool (selection tool) should be activated
        if (this.currentTool.deactivate(event, input, button)) {
            // Add action
            if (this.currentTool.getAction() != undefined)
                MainDesignerController.GetActionManager().add(this.currentTool.getAction());
            this.activate(this.selectionTool);
            return true;
        }

        // Check if any tool should be activated
        for (let tool of this.tools) {
            if (tool.activate(this.currentTool, event, input, button)) {
                this.activate(tool);
                return true;
            }
        }

        return didSomething;
    }

    public onMouseDown(input: Input, button: number): boolean {
        return this.onEvent((i:Input,b?:number) => this.currentTool.onMouseDown(i,b), "mousedown", input, button);
    }

    public onMouseMove(input: Input): boolean {
        return this.onEvent((i:Input) => this.currentTool.onMouseMove(i), "mousemove", input);
    }

    public onMouseDrag(input: Input, button: number): boolean {
        return this.onEvent((i:Input,b?:number) => this.currentTool.onMouseDrag(i,b), "mousedrag", input, button);
    }

    public onMouseUp(input: Input, button: number): boolean {
        return this.onEvent((i:Input,b?:number) => this.currentTool.onMouseUp(i,b), "mouseup", input, button);
    }

    public onClick(input: Input, button: number): boolean {
        return this.onEvent((i:Input,b?:number) => this.currentTool.onClick(i,b), "onclick", input, button);
    }

    public onKeyDown(input: Input, key: number): boolean {
        return this.onEvent((i:Input,b?:number) => this.currentTool.onKeyDown(i,b), "keydown", input, key);
    }

    public onKeyUp(input: Input, key: number): boolean {
        return this.onEvent((i:Input,b?:number) => this.currentTool.onKeyUp(i,b), "keyup", input, key);
    }

    public placeComponent(component: Component) {
        this.placeComponentTool.setComponent(component);
        this.activate(this.placeComponentTool);
    }

    public getCurrentTool(): Tool {
        return this.currentTool;
    }

    public getSelectionTool(): SelectionTool {
        return this.selectionTool;
    }

}
