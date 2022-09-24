import {Color} from "svg2canvas";

import {DEFAULT_BORDER_COLOR, DEFAULT_BORDER_WIDTH,
        DEFAULT_CURVE_BORDER_WIDTH, SELECTED_BORDER_COLOR} from "core/utils/Constants";

import {V} from "Vector";

import {Style} from "core/utils/rendering/Style";

import {Line} from "core/utils/rendering/shapes/Line";

import {AnyPort} from "core/models/types";

import {ANDGate, DigitalObj, DigitalPort, DigitalPortGroup, DigitalWire} from "core/models/types/digital";

import {CircuitController} from "core/controllers/CircuitController";
import {RenderInfo}        from "core/views/BaseView";
import {ComponentView}     from "core/views/ComponentView";
import {PortView}          from "core/views/PortView";
import {ViewRecord}        from "core/views/ViewManager";
import {WireView}          from "core/views/WireView";


// @TODO @leon - Move this function to "svg2canvas"
function ColorToHex(col: Color): string {
    return `#${[col.r, col.g, col.b].map((x) => {
        const hex = Math.round(x).toString(16);
        return (hex.length === 1 ? "0"+hex : hex);
    }).join("")}`
}


type DigitalCircuitController = CircuitController<DigitalObj>;


class ANDGateView extends ComponentView<ANDGate, DigitalCircuitController> {
    public constructor(circuit: CircuitController<DigitalObj>, obj: ANDGate) {
        super(circuit, obj, V(1, 1), "and.svg");
    }

    protected override renderComponent({ renderer, selections }: RenderInfo): void {
        const selected = selections.has(this.obj.id);

        const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);

        const style = new Style(undefined, borderCol, DEFAULT_CURVE_BORDER_WIDTH);

        // Get size of model
        const size = this.transform.get().getSize();

        // Get current number of inputs
        const inputs = this.circuit.getPortsFor(this.obj).length;

        // Draw line to visually match input ports
        const l1 = -(size.y/2)*(0.5-inputs/2);
        const l2 =  (size.y/2)*(0.5-inputs/2);

        const s = (size.x-DEFAULT_BORDER_WIDTH)/2;
        const p1 = V(-s, l1);
        const p2 = V(-s, l2);

        renderer.draw(new Line(p1, p2), style);
    }
}


export class DigitalWireView extends WireView<DigitalWire, DigitalCircuitController> {}


class DigitalPortView extends PortView<DigitalPort, DigitalCircuitController> {
    public override isWireable(): boolean {
        // Output ports always can have new connections
        if (this.obj.group === DigitalPortGroup.Output)
            return true;
        // Input and select ports can only have new connections if they don't already have any
        const wires = this.circuit.getWiresFor(this.obj);
        return (wires.length === 0);
    }

    public override isWireableWith(p: AnyPort): boolean {
        return (
            // We can wire it with `p` if we are an output port and they are an input/select port
            //  or we are an input/select port and they are an output port
            (this.obj.group === DigitalPortGroup.Output && (p.group !== DigitalPortGroup.Output)) ||
            (this.obj.group !== DigitalPortGroup.Output && (p.group === DigitalPortGroup.Output))
        );
    }
}



// export type ViewRecord = Record<
//     DigitalObj["kind"],
//     (c: CircuitController<DigitalObj>, o: DigitalObj) => BaseView<DigitalObj, CircuitController<DigitalObj>>
// >;

export const Views: ViewRecord<DigitalObj, DigitalCircuitController> = {
    "ANDGate":     (c: DigitalCircuitController, o: ANDGate)     => new ANDGateView(c, o),
    "DigitalWire": (c: DigitalCircuitController, o: DigitalWire) => new DigitalWireView(c, o),
    "DigitalPort": (c: DigitalCircuitController, o: DigitalPort) => new DigitalPortView(c, o),
};
