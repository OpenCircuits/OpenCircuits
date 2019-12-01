import {ClampedValue} from "math/ClampedValue";

import {OutputPort} from "../../ports/OutputPort";
import {MuxPositioner,
        MuxSinglePortPositioner} from "../../ports/positioners/MuxPositioners";

import {Mux} from "./Mux";
import {serializable} from "serialeazy";

@serializable("Demultiplexer")
export class Demultiplexer extends Mux {

    public constructor() {
        super(new ClampedValue(1), new ClampedValue(4, 2, Math.pow(2,8)),
              new MuxSinglePortPositioner(), new MuxPositioner<OutputPort>());
    }

    public activate(): void {
        const values: Array<number> = this.selects.getPorts().map(p => (p.getIsOn() ? 1 : 0));

        const num = values.reduce((acc, cur, i) => acc = acc | (cur << i), 0);

        // Turn off each output port
        this.getOutputPorts().forEach((_, i) => super.activate(false, i));

        super.activate(this.inputs.last.getIsOn(), num);
    }

    public setSelectPortCount(val: number): void {
        super.setSelectPortCount(val);
        super.setOutputPortCount(Math.pow(2, val));
        // update the input port to align with the left edge of the DeMux
        this.inputs.updatePortPositions();
    }

    public getDisplayName(): string {
        return "Demultiplexer";
    }

    public getXMLName(): string {
        return "demux";
    }
}
