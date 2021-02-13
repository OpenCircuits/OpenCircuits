import {CircuitView} from "../../shared/views/CircuitView";

import {Selectable} from "core/utils/Selectable";

import {AnalogWireRenderer} from "analog/rendering/eeobjects/AnalogWireRenderer";
import {AnalogComponentRenderer} from "analog/rendering/eeobjects/AnalogComponentRenderer";
import {AnalogWire} from "analog/models/AnalogWire";
import {AnalogComponent} from "analog/models/AnalogComponent";
import {ToolManager} from "core/tools/ToolManager";
import {ToolRenderer} from "analog/rendering/ToolRenderer";

export class AnalogCircuitView extends CircuitView {

    public constructor(canvas: HTMLCanvasElement, vw: number = 1, vh: number = 1, dw: number = 0, dh: number = 0) {
        super(canvas, vw, vh, dw, dh);
    }

    protected renderWire(wire: AnalogWire, selections: Selectable[]): void {
        const selected = selections.includes(wire);
        AnalogWireRenderer.render(this.renderer, this.camera, wire, selected);
    }

    protected renderObject(obj: AnalogComponent, selections: Selectable[]): void {
        const selected = selections.includes(obj);
        AnalogComponentRenderer.render(this.renderer, this.camera, obj, selected, selections);
    }

    protected renderTools(toolManager: ToolManager): void {
        ToolRenderer.render(this.renderer, this.camera, toolManager);
    }

}
