import {DFlipFlop} from "core/models/types/digital";

import {RenderInfo}      from "core/views/BaseView";
import {FlipFlopView}    from "digital/views/components/FlipFlopView";
import {DigitalViewInfo} from "digital/views/DigitalViewInfo";


export class DFlipFlopView extends FlipFlopView<DFlipFlop, DigitalViewInfo> {
    public constructor(info: DigitalViewInfo, obj: DFlipFlop) {
        super(info, obj);
    }
    protected override renderComponent(info: RenderInfo) {
        super.renderComponent(info);
        const { renderer, selections } = info
        // draw the labels
        const ports = this.circuit.getPortsFor(this.obj)
    }
}
