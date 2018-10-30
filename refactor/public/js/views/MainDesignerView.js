// @flow
var Camera            = require("../utils/Camera");
var Renderer          = require("../utils/rendering/Renderer");
var Grid              = require("../utils/rendering/Grid");
var WireRenderer      = require("../utils/rendering/ioobjects/WireRenderer");
var ComponentRenderer = require("../utils/rendering/ioobjects/ComponentRenderer");

var CircuitDesigner = require("../models/CircuitDesigner");
var Wire            = require("../models/ioobjects/Wire");
var Component       = require("../models/ioobjects/Component");

class MainDesignerView {
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
        
        window.addEventListener('resize', e => this.resize(), false);
        this.resize();
    }
    render(designer: CircuitDesigner) {
        this.renderer.clear();
        
        Grid.render(this.renderer, this.camera);
        
        var wires = designer.getWires();
        for (var wire: Wire of wires)
            WireRenderer.render(this.renderer, this.camera, wire);
        
        var objects = designer.getObjects();
        for (var object: Component of objects)
            ComponentRenderer.render(this.renderer, this.camera, object);
    }
    resize(): void {
        this.renderer.resize();
        this.camera.resize(this.canvas.width, this.canvas.height);
    }
}

module.exports = MainDesignerView;