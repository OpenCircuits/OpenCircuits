import {serializable} from "serialeazy";

import {DEFAULT_SIZE} from "core/utils/Constants";

import {ClampedValue} from "math/ClampedValue";

import {ConstantSpacePositioner} from "core/models/ports/positioners/ConstantSpacePositioner";

import {OutputPort} from "../../ports/OutputPort";
import {Mux} from "./Mux";

@serializable("Demultiplexer")
export class Demultiplexer extends Mux {

    public constructor() {
        super(new ClampedValue(1), new ClampedValue(4, 2, Math.pow(2,8)),
              undefined, new ConstantSpacePositioner<OutputPort>("right", DEFAULT_SIZE));
    }

    public activate(): void {
        const values = this.selects.getPorts().map(p => (p.getIsOn() ? 1 : 0)) as number[];

        const num = values.reduce((acc, cur, i) => acc = acc | (cur << i), 0);

        // Turn off each output port
        this.getOutputPorts().forEach((_, i) => super.activate(false, i));

        super.activate(this.inputs.last.getIsOn(), num);
    }

    public setSelectPortCount(val: number): void {
        super.setSelectPortCount(val);
        // update the input port to align with the left edge of the DeMux
        this.inputs.updatePortPositions();
    }

    public getDisplayName(): string {
        return "Demultiplexer";
    }
}
