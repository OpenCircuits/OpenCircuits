import {DEFAULT_ON_COLOR, METASTABLE_COLOR} from "core/utils/Constants";

import {DigitalPort, DigitalWire} from "core/models/types/digital";

import {Signal} from "digital/models/sim/Signal";

import {WireView} from "core/views/WireView";

import {DigitalViewInfo} from "./DigitalViewInfo";


export class DigitalWireView extends WireView<DigitalWire, DigitalViewInfo> {
    protected getInputPort(): DigitalPort {
        const [p1, p2] = this.circuit.getPortsForWire(this.obj);
        return (p1.group === "outputs" ? p1 : p2); // TODOnow: fix
    }
    protected getOutputPort(): DigitalPort {
        const [p1, p2] = this.circuit.getPortsForWire(this.obj);
        return (p1.group === "outputs" ? p2 : p1);
    }

    protected override getColor(): string {
        const isOn = this.info.sim.getSignal(this.getInputPort());
        if (isOn === Signal.On)
            return DEFAULT_ON_COLOR;
        if (isOn === Signal.Metastable)
            return METASTABLE_COLOR;
        return this.obj.color;
    }
}
