import {Vector} from "Vector";

import {Camera} from "math/Camera";
import {Input} from "core/utils/Input";
import {RenderQueue} from "core/utils/RenderQueue";
import {Selectable} from "core/utils/Selectable";

import {Action} from "core/actions/Action";
import {CreateDeselectAllAction} from "core/actions/selection/SelectAction";

import {CircuitView} from "site/shared/views/CircuitView";

import {Tool} from "core/tools/Tool";
import {SelectionTool} from "core/tools/SelectionTool";
import {ToolManager} from "core/tools/ToolManager";

import {CircuitDesigner} from "core/models/CircuitDesigner";
import {Component} from "core/models/Component";

export abstract class DesignerController {
    private active: boolean;

    protected input: Input;

    protected designer: CircuitDesigner;
    protected view: CircuitView;

    protected toolManager: ToolManager;

    private renderQueue: RenderQueue;

    protected constructor(designer: CircuitDesigner, view: CircuitView) {
        this.active = true;

        this.designer = designer;
        this.view = view;

        // utils
        this.toolManager = new ToolManager(this.view.getCamera(), this.designer);
        this.renderQueue = new RenderQueue(() =>
            this.view.render(this.designer,
                             this.getSelections(),
                             this.toolManager));

        // input
        this.input = new Input(this.view.getCanvas());
        this.input.addListener("click",     (b) => !this.active || this.onClick(b));
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

    public placeComponent(comp: Component, instant: boolean = false): void {
        this.toolManager.placeComponent(comp, instant);
    }

    public clearSelections(): void {
        this.addAction(CreateDeselectAllAction(this.toolManager.getSelectionTool()).execute());
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
        return this.toolManager.getSelectionTool().getSelections();
    }

    public getCurrentTool(): Tool {
        return this.toolManager.getCurrentTool();
    }

    public getSelectionTool(): SelectionTool {
        return this.toolManager.getSelectionTool();
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

    public isActive(): boolean {
        return this.active;
    }
}
