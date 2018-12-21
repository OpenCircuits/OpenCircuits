import {Camera}            from "../utils/Camera";
import {Renderer}          from "../utils/rendering/Renderer";
import {Grid}              from "../utils/rendering/Grid";
import {WireRenderer}      from "../utils/rendering/ioobjects/WireRenderer";
import {ComponentRenderer} from "../utils/rendering/ioobjects/ComponentRenderer";

import {CircuitDesigner} from "../models/CircuitDesigner";

import {IOObject}  from "../models/ioobjects/IOObject";
import {Wire}      from "../models/ioobjects/Wire";
import {Component} from "../models/ioobjects/Component";

export class MainDesignerView {
    canvas: HTMLCanvasElement;
    renderer: Renderer;
    camera: Camera;

    constructor() {
        var canvas = document.getElementById("canvas");
        if (!(canvas instanceof HTMLCanvasElement))
            throw new Error("Canvas element not found!");
        this.canvas = canvas;
        this.renderer = new Renderer(this.canvas);
        this.camera = new Camera(this.canvas.width, this.canvas.height);

        this.resize();
    }
    render(designer: CircuitDesigner, selections: Array<IOObject>) {
        this.renderer.clear();

        // Render grid
        Grid.render(this.renderer, this.camera);

        // Render all wires (first so they are underneath objects)
        var wires = designer.getWires();
        for (var wire of wires) {
            var selected = selections.includes(wire);
            WireRenderer.render(this.renderer, this.camera, wire, selected);
        }

        // Render all objects
        var objects = designer.getObjects();
        for (var object of objects) {
            var selected = selections.includes(object);
            ComponentRenderer.render(this.renderer, this.camera, object, selected);
        }
    }
    resize(): void {
        this.renderer.resize();
        this.camera.resize(this.canvas.width, this.canvas.height);
    }
    getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }
}
