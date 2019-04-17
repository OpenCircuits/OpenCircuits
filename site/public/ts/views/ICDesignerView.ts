import {Camera}            from "../utils/Camera";
import {Renderer}          from "../utils/rendering/Renderer";
import {Grid}              from "../utils/rendering/Grid";
import {ToolRenderer}      from "../utils/rendering/ToolRenderer";
import {ComponentRenderer} from "../utils/rendering/ioobjects/ComponentRenderer";

import {ToolManager} from "../utils/tools/ToolManager";

import {CircuitDesigner} from "../models/CircuitDesigner";
import {IC} from "../models/ioobjects/other/IC";

import {IOObject}  from "../models/ioobjects/IOObject";

export class ICDesignerView {
    private canvas: HTMLCanvasElement;
    private renderer: Renderer;
    private camera: Camera;

    private div: HTMLDivElement;
    private confirmButton: HTMLButtonElement;
    private cancelButton: HTMLButtonElement;

    public constructor() {
        // Get HTML elements
        const canvas = document.getElementById("ic-canvas");
        if (!(canvas instanceof HTMLCanvasElement))
            throw new Error("IC Canvas element not found!");

        const div = document.getElementById("ic-designer");
        if (!(div instanceof HTMLDivElement))
            throw new Error("IC Designer DIV element not found!");

        const confirmButton = document.getElementById("ic-confirmbutton");
        if (!(confirmButton instanceof HTMLButtonElement))
            throw new Error("IC Confirm Button element not found!");

        const cancelButton = document.getElementById("ic-cancelbutton");
        if (!(cancelButton instanceof HTMLButtonElement))
            throw new Error("IC Cancel Button element not found!");

        this.canvas = canvas;
        this.renderer = new Renderer(this.canvas, 0.84, 0.76);
        this.camera = new Camera(this.canvas.width, this.canvas.height);

        this.div = div;
        this.confirmButton = confirmButton;
        this.cancelButton  = cancelButton;

        this.resize();
        this.hide();
    }

    public setCursor(cursor: string): void {
        this.renderer.setCursor(cursor);
    }

    public show(): void {
        this.div.style.visibility = "visible";
    }

    public setConfirmButtonListener(listener: () => void): void {
        this.confirmButton.onclick = () => listener();
    }

    public setCancelButtonListener(listener: () => void): void {
        this.cancelButton.onclick = () => listener();
    }

    public render(designer: CircuitDesigner, ic: IC, toolManager: ToolManager) {
        this.renderer.clear();

        // Render grid
        Grid.render(this.renderer, this.camera);

        // Render all objects
        const objects = designer.getObjects();
        for (let object of objects)
            ComponentRenderer.render(this.renderer, this.camera, object, false, []);

        // Render current tool
        ToolRenderer.render(this.renderer, this.camera, toolManager);
    }

    public resize(): void {
        this.renderer.resize();
        this.camera.resize(this.canvas.width, this.canvas.height);
    }

    public hide(): void {
        this.div.style.visibility = "hidden";
    }

    public getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    public getCamera(): Camera {
        return this.camera;
    }
}
