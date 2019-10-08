import {Camera}            from "math/Camera";
import {Renderer}          from "digital/rendering/Renderer";
import {Grid}              from "digital/rendering/Grid";
import {DebugRenderer}     from "digital/rendering/DebugRenderer";
import {ToolRenderer}      from "digital/rendering/ToolRenderer";
import {WireRenderer}      from "digital/rendering/ioobjects/WireRenderer";
import {ComponentRenderer} from "digital/rendering/ioobjects/ComponentRenderer";

import {ToolManager} from "core/tools/ToolManager";
import {Selectable}  from "core/utils/Selectable";

import {CircuitDesigner} from "core/models/CircuitDesigner";

export class CircuitView {
    protected canvas: HTMLCanvasElement;
    protected renderer: Renderer;
    protected camera: Camera;

    public constructor(canvasId: string, vw: number = 1, vh: number = 1) {
        const canvas = document.getElementById(canvasId);
        if (!(canvas instanceof HTMLCanvasElement))
            throw new Error("Canvas element not found!");
        this.canvas = canvas;
        this.renderer = new Renderer(this.canvas, vw, vh);
        this.camera = new Camera(this.canvas.width, this.canvas.height);

        this.resize();
    }

    public render(designer: CircuitDesigner, selections: Array<Selectable>, toolManager: ToolManager): void {
        this.renderer.clear();

        // Render grid
        Grid.render(this.renderer, this.camera);

        // Render all wires (first so they are underneath objects)
        const wires = designer.getWires();
        for (const wire of wires) {
            const selected = selections.includes(wire);
            WireRenderer.render(this.renderer, this.camera, wire, selected);
        }

        // Render all objects
        const objects = designer.getObjects();
        for (const object of objects) {
            const selected = selections.includes(object);
            ComponentRenderer.render(this.renderer, this.camera, object, selected, selections);
        }

        // Render current tool
        ToolRenderer.render(this.renderer, this.camera, toolManager);

        // Render debug visualizations
        DebugRenderer.render(this.renderer, this.camera, designer.getObjects(), designer.getWires());
    }

    public resize(): void {
        this.renderer.resize();
        this.camera.resize(this.canvas.width, this.canvas.height);
    }

    public getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }
    public getCamera(): Camera {
        return this.camera;
    }

}
