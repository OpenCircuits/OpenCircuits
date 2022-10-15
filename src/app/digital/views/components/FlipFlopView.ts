import {DEFAULT_BORDER_COLOR, DEFAULT_BORDER_WIDTH, DEFAULT_CURVE_BORDER_WIDTH, SELECTED_BORDER_COLOR} from "core/utils/Constants";

import {V} from "Vector";

import {Rect} from "math/Rect";

import {DigitalPortGroup, FlipFlop} from "core/models/types/digital";

import {RenderInfo}               from "core/views/BaseView";
import {ComponentView}            from "core/views/ComponentView";
import {DigitalCircuitController} from "digital/controllers/DigitalCircuitController";

/**
 * Should not be directly called. Only exist as flipflops share code. Can't do abstract class tho
 */
export class FlipFlopView extends ComponentView<FlipFlop, DigitalCircuitController> {
    public constructor(circuit: DigitalCircuitController, obj: FlipFlop) {
        super(circuit, obj);
    }

    protected override renderComponent({ renderer, selections }: RenderInfo): void {}

    public override getBounds(): Rect {
        // Get current number of inputs
        const inputs = this.circuit.getPortsFor(this.obj)
            .filter((p) => p.group === DigitalPortGroup.Input).length;
        return super.getBounds().expand(V(0, ((inputs-1)/2*(0.5 - DEFAULT_BORDER_WIDTH/2) + DEFAULT_BORDER_WIDTH/2)));
    }
}
