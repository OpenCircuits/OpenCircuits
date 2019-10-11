import {Camera}            from "math/Camera";
import {Renderer}          from "core/rendering/Renderer";
import {Grid}              from "core/rendering/Grid";
import {DebugRenderer}     from "core/rendering/DebugRenderer";
import {ToolRenderer}      from "digital/rendering/ToolRenderer";

import {ToolManager} from "core/tools/ToolManager";
import {Selectable}  from "core/utils/Selectable";

import {CircuitDesigner} from "core/models/CircuitDesigner";
import {Wire} from "core/models/Wire";
import {Component} from "core/models/Component";
import {Tool} from "core/tools/Tool";

export abstract class CircuitView {
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

    public render(designer: CircuitDesigner, selections: Selectable[], toolManager: ToolManager): void {
        this.renderer.clear();

        // Render grid
        Grid.render(this.renderer, this.camera);

        // Render all wires (first so they are underneath objects)
        const wires = designer.getWires();
        for (const wire of wires)
            this.renderWire(wire, selections);

        // Render all objects
        const objects = designer.getObjects();
        for (const object of objects)
            this.renderObject(object, selections);

        // Render current tool
        this.renderTools(toolManager);

        // Render debug visualizations
        DebugRenderer.render(this.renderer, this.camera, designer.getObjects(), designer.getWires());
    }

    protected abstract renderWire(wire: Wire, selections: Selectable[]): void;
    protected abstract renderObject(component: Component, selections: Selectable[]): void;
    protected abstract renderTools(toolManager: ToolManager): void;

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
