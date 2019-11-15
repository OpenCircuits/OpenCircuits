import {CircuitView} from "../../shared/views/CircuitView";

import {Selectable} from "core/utils/Selectable";

import {Component} from "core/models/Component";
import {WireRenderer} from "digital/rendering/ioobjects/WireRenderer";
import {ComponentRenderer} from "digital/rendering/ioobjects/ComponentRenderer";
import {DigitalWire} from "digital/models/DigitalWire";
import {ToolManager} from "core/tools/ToolManager";
import {ToolRenderer} from "digital/rendering/ToolRenderer";

export class DigitalCircuitView extends CircuitView {

    public constructor(canvas: HTMLCanvasElement, vw: number = 1, vh: number = 1) {
        super(canvas, vw, vh);
    }

    protected renderWire(wire: DigitalWire, selections: Selectable[]): void {
        const selected = selections.includes(wire);
        WireRenderer.render(this.renderer, this.camera, wire, selected);
    }

    protected renderObject(obj: Component, selections: Selectable[]): void {
        const selected = selections.includes(obj);
        ComponentRenderer.render(this.renderer, this.camera, obj, selected, selections);
    }

    protected renderTools(toolManager: ToolManager): void {
        ToolRenderer.render(this.renderer, this.camera, toolManager);
    }

}
