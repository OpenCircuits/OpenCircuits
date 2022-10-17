import {DEFAULT_BORDER_COLOR, DEFAULT_BORDER_WIDTH, DEFAULT_CURVE_BORDER_WIDTH, SELECTED_BORDER_COLOR} from "core/utils/Constants";

import {V} from "Vector";

import {Style} from "core/utils/rendering/Style";

import {Line} from "core/utils/rendering/shapes/Line";

import {DigitalPortGroup, TFlipFlop} from "core/models/types/digital";

import {RenderInfo}      from "core/views/BaseView";
import {DigitalViewInfo} from "digital/views/DigitalViewInfo";
import {FlipFlopView} from "digital/views/components/FlipFlopView";

// flipflops share much of the same model. Need to get in contact with the other flipflop people, or I do all of them.
export class TFlipFlopView extends FlipFlopView<TFlipFlop, DigitalViewInfo>{
    public constructor(info: DigitalViewInfo, obj: TFlipFlop) {
        super(info, obj);
    }

    protected override renderComponent({ renderer, selections }: RenderInfo): void {
        const selected = selections.has(this.obj.id);

        const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);

        const style = new Style(undefined, borderCol, DEFAULT_CURVE_BORDER_WIDTH);

        // Get size of model
        const size = this.transform.get().getSize();

        // Get current number of inputs
        const inputs = this.circuit.getPortsFor(this.obj)
            .filter((p) => p.group === DigitalPortGroup.Input).length;

        // Draw line to visually match input ports
        const l1 = -(inputs-1)/2*(0.5 - DEFAULT_BORDER_WIDTH/2) - DEFAULT_BORDER_WIDTH/2;
        const l2 =  (inputs-1)/2*(0.5 - DEFAULT_BORDER_WIDTH/2) + DEFAULT_BORDER_WIDTH/2;

        const s = (size.x-DEFAULT_BORDER_WIDTH)/2;
        const p1 = V(-s, l1);
        const p2 = V(-s, l2);

        renderer.draw(new Line(p1, p2), style);
    }


}
