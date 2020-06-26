import {Vector} from "Vector";

import {Camera} from "math/Camera";
import {Input} from "core/utils/Input";
import {RenderQueue} from "core/utils/RenderQueue";
import {Selectable} from "core/utils/Selectable";

import {Action} from "core/actions/Action";

import {CircuitView} from "site/shared/views/CircuitView";

import {Tool} from "core/tools/Tool";
import {ToolManager} from "core/tools/ToolManager";
import {SelectionTool} from "core/tools/SelectionTool";
import {PanTool} from "core/tools/PanTool";

import {CircuitDesigner} from "core/models/CircuitDesigner";
import {CopyController} from "./CopyController";

export abstract class DesignerController {
    private active: boolean;

    protected input: Input;

    protected designer: CircuitDesigner;
    protected view: CircuitView;

    protected toolManager: ToolManager;
    private selectionTool: SelectionTool;

    private renderQueue: RenderQueue;

    protected constructor(designer: CircuitDesigner, view: CircuitView) {
        this.active = true;

        this.designer = designer;
        this.view = view;

        // utils
        this.selectionTool = new SelectionTool(this.designer, this.getCamera());
        this.toolManager = new ToolManager(this.selectionTool);

        this.toolManager.addTools(new PanTool(this.getCamera()));

        this.renderQueue = new RenderQueue(() =>
            this.view.render(this.designer,
                             this.getSelections(),
                             this.toolManager));

        // input
        this.input = new Input(this.view.getCanvas());
        this.input.addListener("click",     (b) => !this.active || this.onClick(b));
        this.input.addListener("dblclick",  (b) => !this.active || this.onDoubleClick(b))
        this.input.addListener("mousedown", (b) => !this.active || this.onMouseDown(b));
        this.input.addListener("mousedrag", (b) => !this.active || this.onMouseDrag(b));
        this.input.addListener("mousemove", ( ) => !this.active || this.onMouseMove());
        this.input.addListener("mouseup",   (b) => !this.active || this.onMouseUp(b));
        this.input.addListener("keydown",   (b) => !this.active || this.onKeyDown(b));
        this.input.addListener("keyup",     (b) => !this.active || this.onKeyUp(b));
        this.input.addListener("zoom",    (z,c) => !this.active || this.onZoom(z,c));

        window.addEventListener("resize", _e => this.resize(), false);
    }

    private resize(): void {
        this.view.resize();
        this.render();
    }

    public setActive(on: boolean): void {
        this.active = on;
    }

    public addAction(action: Action): void {
        this.toolManager.addAction(action);
    }

    public render(): void {
        this.renderQueue.render();
    }

    protected onMouseDown(button: number): boolean {
        if (this.toolManager.onMouseDown(this.input, button)) {
            this.render();
            return true;
        }
        return false;
    }

    protected onMouseMove(): boolean {
        if (this.toolManager.onMouseMove(this.input)) {
            this.render();
            return true;
        }
        return false;
    }

    protected onMouseDrag(button: number): boolean {
        if (this.toolManager.onMouseDrag(this.input, button)) {
            this.render();
            return true;
        }
        return false;
    }

    protected onMouseUp(button: number): boolean {
        if (this.toolManager.onMouseUp(this.input, button)) {
            this.render();
            return true;
        }
        return false;
    }

    protected onClick(button: number): boolean {
        if (this.toolManager.onClick(this.input, button)) {
            this.render();
            return true;
        }
        return false;
    }

    protected onDoubleClick(button: number): boolean {
        if (this.toolManager.onDoubleClick(this.input, button)) {
            this.render();
            return true;
        }
        return false;
    }

    protected onKeyDown(key: number): boolean {
        if (this.toolManager.onKeyDown(this.input, key)) {
            this.render();
            return true;
        }
        return false;
    }

    protected onKeyUp(key: number): boolean {
        if (this.toolManager.onKeyUp(this.input, key)) {
            this.render();
            return true;
        }
        return false;
    }

    protected onZoom(zoom: number, center: Vector): boolean {
        // TODO: Move to tool
        this.view.getCamera().zoomTo(center, zoom);

        this.render();
        return true;
    }

    public getSelections(): Selectable[] {
        return this.selectionTool.getSelections();
    }

    public getCurrentTool(): Tool {
        return this.toolManager.getCurrentTool();
    }

    public getSelectionTool(): SelectionTool {
        return this.selectionTool;
    }

    public getCanvas(): HTMLCanvasElement {
        return this.view.getCanvas();
    }

    public getCamera(): Camera {
        return this.view.getCamera();
    }

    public getDesigner(): CircuitDesigner {
        return this.designer;
    }

    public getInput(): Input {
        return this.input;
    }

    public getToolManager(): ToolManager {
        return this.toolManager;
    }

    public isActive(): boolean {
        return this.active;
    }


}
