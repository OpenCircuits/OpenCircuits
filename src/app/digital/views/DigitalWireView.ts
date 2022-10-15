import {DEFAULT_ON_COLOR} from "core/utils/Constants";

import {DigitalPort, DigitalPortGroup, DigitalWire} from "core/models/types/digital";

import {WireView} from "core/views/WireView";

import {DigitalViewInfo} from "./DigitalViewInfo";


export class DigitalWireView extends WireView<DigitalWire, DigitalViewInfo> {
    protected getInputPort(): DigitalPort {
        const [p1, p2] = this.circuit.getPortsForWire(this.obj);
        return (p1.group === DigitalPortGroup.Output ? p1 : p2);
    }
    protected getOutputPort(): DigitalPort {
        const [p1, p2] = this.circuit.getPortsForWire(this.obj);
        return (p1.group === DigitalPortGroup.Output ? p2 : p1);
    }

    protected override getColor(): string {
        const isOn = this.info.sim.getSignal(this.getInputPort());
        if (isOn)
            return DEFAULT_ON_COLOR;
        return this.obj.color;
    }
}
